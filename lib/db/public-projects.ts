import { createPublicClient } from '@/lib/supabase/public';
import { Project } from '@/types/portfolio';

export async function getPublishedProjects(): Promise<Project[]> {
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
}

export async function getPublishedProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = createPublicClient();
  const { data: project, error: projectError } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (projectError) throw new Error(`Unable to load project: ${projectError.message}`);
  if (!project) return null;

  const { data: blocks, error: blocksError } = await supabase
    .from('portfolio_content_blocks')
    .select('*')
    .eq('project_id', project.id)
    .order('block_order', { ascending: true });

  if (blocksError) throw new Error(`Unable to load project content: ${blocksError.message}`);
  return { ...(project as Project), blocks: blocks || [] };
}

export async function getRelatedProjects(currentSlug: string, category: string, limit: number = 3): Promise<Project[]> {
  const allProjects = await getPublishedProjects();
  const others = allProjects.filter((p) => p.slug !== currentSlug);

  // Priority: same category first, then others
  const sameCategory = others.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  const diffCategory = others.filter((p) => p.category.toLowerCase() !== category.toLowerCase());

  return [...sameCategory, ...diffCategory].slice(0, limit);
}

export async function getNextProject(currentSlug: string): Promise<Project | null> {
  const allProjects = await getPublishedProjects();
  const currentIndex = allProjects.findIndex((p) => p.slug === currentSlug);

  if (currentIndex === -1 || allProjects.length <= 1) {
    return null;
  }

  const nextIndex = (currentIndex + 1) % allProjects.length;
  return allProjects[nextIndex];
}
