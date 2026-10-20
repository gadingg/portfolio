import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProjectArtwork } from './ProjectArtwork';
import type { Project } from '@/types/portfolio';

export function ProjectPreviewCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const id = `explore-${featured ? 'next' : 'alternative'}-${project.slug}`;
  const description = project.subtitle || project.description;
  return <Link href={`/work/${project.slug}`}
    className={`case-explore-card${featured ? ' case-explore-card--next' : ' case-explore-card--alternative'}`}
    aria-labelledby={`${id}-title ${id}-cta`} aria-describedby={description ? `${id}-description` : undefined}>
    <div className="case-explore-art"><ProjectArtwork project={project} /></div>
    <div className="case-explore-copy">
      {featured && <span className="case-explore-label">UP NEXT</span>}
      <h3 id={`${id}-title`}>{project.title}</h3>
      {description && <p id={`${id}-description`}>{description}</p>}
      <span className="case-explore-cta" id={`${id}-cta`}>
        {featured ? 'Explore next case study' : 'View case study'}
        <ArrowRight className="icon" aria-hidden="true" />
      </span>
    </div>
  </Link>;
}

export function NextProjectNav({ nextProject }: { nextProject: Project | null }) {
  return nextProject ? <ProjectPreviewCard project={nextProject} featured /> : null;
}
