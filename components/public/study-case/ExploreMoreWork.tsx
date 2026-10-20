import type { Project } from '@/types/portfolio';
import { NextProjectNav } from './NextProjectNav';
import { RelatedProjects } from './RelatedProjects';

export function ExploreMoreWork({ nextProject, related }: { nextProject: Project | null; related: Project[] }) {
  const alternatives = related.filter(project => project.slug !== nextProject?.slug);
  if (!nextProject && !alternatives.length) return null;
  return <section className="case-explore" aria-labelledby="explore-more-title">
    <h2 id="explore-more-title">Explore More Work</h2>
    <div className={`case-explore-grid${nextProject && alternatives.length ? ' case-explore-grid--pair' : ''}`}>
      <NextProjectNav nextProject={nextProject} />
      <RelatedProjects projects={alternatives} />
    </div>
  </section>;
}
