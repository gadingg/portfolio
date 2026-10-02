import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { ContentBlock, Project } from '@/types/portfolio';

const PROJECT_CACHE_SECONDS = 300;

const loadPublishedProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('published_at', { ascending: false });

    if (error) throw new Error(`Unable to load published projects: ${error.message}`);
    return (data || []) as Project[];
  },
  ['published-projects'],
  { revalidate: PROJECT_CACHE_SECONDS, tags: ['portfolio-projects'] }
);

const loadPublishedProjectBySlug = unstable_cache(
  async (slug: string): Promise<Project | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*, blocks:portfolio_content_blocks(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw new Error(`Unable to load project: ${error.message}`);
    if (!data) return null;

    const project = data as unknown as Project;
    const blocks = ((project.blocks || []) as ContentBlock[]).sort(
      (a, b) => a.block_order - b.block_order
    );
    return { ...project, blocks };
  },
  ['published-project-by-slug'],
  { revalidate: PROJECT_CACHE_SECONDS, tags: ['portfolio-projects'] }
);

export const getPublishedProjects = cache(loadPublishedProjects);
export const getPublishedProjectBySlug = cache(loadPublishedProjectBySlug);

export function getProjectNavigation(
  projects: Project[],
  currentSlug: string,
  category: string,
  limit = 3
): { related: Project[]; nextProject: Project | null } {
  const currentIndex = projects.findIndex((project) => project.slug === currentSlug);
  const others = projects.filter((project) => project.slug !== currentSlug);
  const normalizedCategory = category.toLowerCase();
  const related = [
    ...others.filter((project) => project.category.toLowerCase() === normalizedCategory),
    ...others.filter((project) => project.category.toLowerCase() !== normalizedCategory),
  ].slice(0, limit);

  const nextProject = currentIndex >= 0 && projects.length > 1
    ? projects[(currentIndex + 1) % projects.length]
    : null;

  return { related, nextProject };
}