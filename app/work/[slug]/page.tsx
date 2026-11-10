import { CaseAppActions } from '@/components/public/study-case/CaseAppActions';
import {CaseMotion} from '@/components/public/study-case/CaseMotion';
import {caseMotion} from '@/lib/case-motion';
import React from 'react';
import { CaseOverview } from '@/components/public/study-case/CaseOverview';
import { editorialCaseLayout } from '@/lib/case-layout';
import { VisualLayout } from '@/components/public/VisualLayout';
import { notFound,permanentRedirect } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import type { ContentBlock, MetricsBlockContent } from '@/types/portfolio';
import {
  getProjectNavigation,
  getPublishedProjectBySlug,
  getPublishedProjects,
} from '@/lib/db/public-projects';
import { StudyCaseHeader } from '@/components/public/study-case/StudyCaseHeader';
import { StudyCaseRenderer } from '@/components/public/study-case/StudyCaseRenderer';
import { NextProjectNav } from '@/components/public/study-case/NextProjectNav';
import { AuraFooter } from '@/components/public/study-case/AuraFooter';
import { ProjectArtwork } from '@/components/public/study-case/ProjectArtwork';
import { projectPresentations, useBriefArtwork } from '@/lib/project-presentation';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

function paragraphAfterHeading(blocks: ContentBlock[], headingPattern: RegExp) {
  const headingIndex = blocks.findIndex((block) => {
    if (block.block_type !== 'heading') return false;
    const content = block.content_json as { text?: string };
    return headingPattern.test(content.text || '');
  });

  if (headingIndex < 0) return null;
  const paragraph = blocks.slice(headingIndex + 1).find((block) => block.block_type === 'paragraph');
  return paragraph ? (paragraph.content_json as { text?: string }).text || null : null;
}

function projectOutcome(blocks: ContentBlock[]) {
  const metrics = blocks.find((block) => block.block_type === 'metrics');
  if (!metrics) return null;
  const items = (metrics.content_json as MetricsBlockContent).items || [];
  return items.slice(0, 2).map((item) => `${item.value} ${item.label}`).join(' · ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found · Gading Portfolio',
    };
  }

  return {
    title: `${project.title} · Gading Utama`,
    description: project.description,
    alternates:{canonical:`/work/${project.slug}`},
    openGraph: {
      title: `${project.title} · Case Study`,
      description: project.description,
      images: !project.cover_image_url||useBriefArtwork(project) ? (project.slug === 'listinghub' ? [{ url: '/assets/work/listing-hub.jpg', alt: project.title }] : []) : [
        {
          url: project.cover_image_url,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
  };
}

export default async function StudyCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await getPublishedProjects();
  const project = projects.find(item=>item.slug===slug||item.cmsWork?.aliases?.includes(slug));

  if (!project) {
    notFound();
  }
  if(project.slug!==slug)permanentRedirect(`/work/${project.slug}`);

  const { nextProject } = getProjectNavigation(projects, slug, project.category);
  const blocks = (project.blocks || []) as ContentBlock[];
  const presentation = project.cmsWork?.caseStudy;
  const problem = presentation?.problem || paragraphAfterHeading(blocks, /challenge|problem|brief/i) || project.description;
  const approach = presentation?.solution || paragraphAfterHeading(blocks, /solution|approach|system|execution|architecture/i)
    || project.subtitle
    || '';
  const outcome = presentation?.impact || projectOutcome(blocks) || '';

  if(presentation?.layout)return <div className="showcase" id="case-top">
    <StudyCaseHeader projectTitle={project.title}/>
    <div className="case-editorial"><VisualLayout layout={editorialCaseLayout(presentation.layout, presentation)}/></div>
    <CaseMotion motion={caseMotion(presentation)} portal/>
    <div className="section-shell case-narrative mx-auto max-w-3xl"><NextProjectNav nextProject={nextProject}/></div>
    <AuraFooter/>
  </div>;

  return (
    <div className="showcase" id="case-top">
      <StudyCaseHeader projectTitle={project.title} />

      <main className="case-page">
        <article className="section-shell">
          <a
            href="/#work"
            className="text-link case-back"
          >
            <ArrowLeft className="icon" aria-hidden="true" /> Back to portfolio
          </a>

          <header className="case-intro">
            <div>
              <h1>
                {project.title}
              </h1>
              {project.subtitle && (
                <p>
                  {project.subtitle}
                </p>
              )}
            </div>

            {presentation&&<CaseAppActions study={presentation}/>}
          </header>

          <figure className="case-cover-art">
            <ProjectArtwork project={project} priority />
          </figure>
          <CaseOverview problem={problem} approach={approach} outcome={outcome}/>

          {presentation&&<CaseMotion motion={caseMotion(presentation)}/>}

          <div className="case-narrative mx-auto mt-12 max-w-3xl">
            {blocks.length > 0 && <StudyCaseRenderer blocks={blocks} />}
            <NextProjectNav nextProject={nextProject} />
          </div>
        </article>
      </main>

      <AuraFooter />
    </div>
  );
}
