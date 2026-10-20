import type { Project } from '@/types/portfolio';
import { ProjectPreviewCard } from './NextProjectNav';

export function RelatedProjects({ projects }: { projects: Project[] }) {
  const alternative = projects[0];
  return alternative ? <ProjectPreviewCard project={alternative} /> : null;
}
