import Image from 'next/image';
import { ArrowRight, FileText, ChartNoAxesCombined, CheckCheck } from 'lucide-react';
import type { Project } from '@/types/portfolio';
import { projectPresentations, useBriefArtwork } from '@/lib/project-presentation';

export function ProjectArtwork({ project, priority = false }: { project: Project; priority?: boolean }) {
  const presentation = projectPresentations[project.slug];
  if (!useBriefArtwork(project)) {
    return <div className="project-art"><Image src={project.cover_image_url} alt={project.cover_image_alt || project.title} fill priority={priority} sizes="(max-width: 768px) 100vw, 70vw" className="object-cover" /></div>;
  }
  if (presentation.artwork === 'listing') {
    return <div className="project-art listing-art"><Image src="/assets/work/listing-hub.jpg" alt="Tampilan asli Listing Hub: pencarian, filter, dan perbandingan properti" width={1344} height={1720} priority={priority} sizes="(max-width: 768px) 80vw, 60vw" /><span className="capture-note">Inside the app</span></div>;
  }
  if (presentation.artwork === 'meta') {
    return <div className="project-art meta-art"><div className="meta-cover"><span className="cover-context">META ADS / WORKFLOW</span><strong>Report once.<br /><em>Learn more.</em></strong><div className="meta-flow"><span><FileText className="icon" aria-hidden="true" />Reporting</span><span><ChartNoAxesCombined className="icon" aria-hidden="true" />Evaluation</span><span><CheckCheck className="icon" aria-hidden="true" />Next action</span></div><span className="cover-note">Alur reporting &amp; evaluasi</span></div></div>;
  }
  return <div className="project-art mbg-art"><div className="mbg-cover"><span className="cover-context">PROGRAM MBG</span><strong>Small actions.<br />Real momentum.</strong><div className="workflow-line"><span>Activity</span><ArrowRight className="icon" aria-hidden="true" /><span>Points</span><ArrowRight className="icon" aria-hidden="true" /><span>Rewards</span></div><span className="cover-note">Alur gamification &amp; reward</span></div></div>;
}
