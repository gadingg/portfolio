import { MetadataRoute } from 'next';
import { getPublishedProjects } from '@/lib/db/public-projects';
import type { Project } from '@/types/portfolio';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let projects: Project[] = [];

  try {
    projects = await getPublishedProjects();
  } catch (error) {
    console.error('Sitemap project lookup failed; returning the homepage entry only.', error);
  }

  const projectUrls = projects.map((p) => ({
    url: `${baseUrl}/work/${p.slug}`,
    lastModified: new Date(p.updated_at || p.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...projectUrls,
  ];
}
