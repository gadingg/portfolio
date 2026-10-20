import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProjectArtwork } from './ProjectArtwork';
import type { Project } from '@/types/portfolio';

export function NextProjectNav({ nextProject: project }: { nextProject: Project | null }) {
  if(!project)return null;
  const id = `next-${project.slug}`;
  const description = project.subtitle || project.description;
  return <section className="case-next-project" aria-labelledby="next-project-title">
    <div className="works-heading"><h2 id="next-project-title">Next Project</h2></div>
    <article className="work-card work-card-webapp">
    <Link href={`/work/${project.slug}`} prefetch={false}
    className="work-card-link"
    aria-labelledby={`${id}-title ${id}-cta`} aria-describedby={description ? `${id}-description` : undefined}>
    <div className="work-media"><ProjectArtwork project={project} /></div>
    <h3 className="work-card-title" id={`${id}-title`}>{project.title}</h3>
    {description && <p className="work-card-description" id={`${id}-description`}>{description}</p>}
    <div className="work-card-meta">
      <span className="work-destination" id={`${id}-cta`}>
        Next Case Study
        <ArrowRight className="icon" aria-hidden="true" />
      </span>
    </div>
    </Link>
    </article>
  </section>;
}
