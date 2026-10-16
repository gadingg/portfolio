import React from 'react';
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
import { RelatedProjects } from '@/components/public/study-case/RelatedProjects';
import { NextProjectNav } from '@/components/public/study-case/NextProjectNav';
import { AuraFooter } from '@/components/public/study-case/AuraFooter';
import { ProjectArtwork } from '@/components/public/study-case/ProjectArtwork';
import { projectPresentations, useBriefArtwork } from '@/lib/project-presentation';

export const dynamic = 'force-dynamic';

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

async function legacyStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return projects.map((project) => ({ slug: project.slug }));
  } catch (error) {
    console.error('Project prerender skipped because the project source was unavailable.', error);
    return [];
  }
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
    openGraph: {
      title: `${project.title} · Case Study`,
      description: projectPresentations[slug]?.intro || project.description,
      images: useBriefArtwork(project) ? (slug === 'internal-listing-hub' ? [{ url: '/assets/work/listing-hub.jpg', alt: project.title }] : []) : [
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
  const [project, projects] = await Promise.all([
    getPublishedProjectBySlug(slug),
    getPublishedProjects(),
  ]);

  if (!project) {
    notFound();
  }
  if(project.slug!==slug)permanentRedirect(`/work/${project.slug}`);

  const { related, nextProject } = getProjectNavigation(projects, slug, project.category);
  const blocks = (project.blocks || []) as ContentBlock[];
  const presentation = project.cmsWork?.caseStudy;
  const problem = presentation?.problem || paragraphAfterHeading(blocks, /challenge|problem|brief/i) || project.description;
  const approach = presentation?.solution || paragraphAfterHeading(blocks, /solution|approach|system|execution|architecture/i)
    || project.subtitle
    || 'A practical response shaped around the team, workflow, and business constraint.';
  const outcome = presentation?.impact || projectOutcome(blocks) || '';

  if(presentation?.layout)return <div className="showcase" id="case-top">
    <StudyCaseHeader projectTitle={project.title}/>
    <VisualLayout layout={presentation.layout}/>
    <div className="section-shell case-narrative mx-auto max-w-3xl"><NextProjectNav nextProject={nextProject}/><RelatedProjects projects={related.filter(item=>item.slug!==nextProject?.slug)}/></div>
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
            <ArrowLeft className="icon" aria-hidden="true" /> Back to selected works
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

            {presentation?.appUrl && <a className="button button-outline" href={presentation.appUrl} target="_blank" rel="noopener noreferrer">Open app <ExternalLink className="icon" aria-hidden="true" /></a>}
          </header>

          <figure className="case-cover-art">
            <ProjectArtwork project={project} priority />
          </figure>

          <section aria-labelledby="problem-solving-title" className="mt-12 border-y border-[#f3f0e8]/12 py-10 sm:mt-16 sm:py-14">
            <div className="grid gap-9 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <h2 id="problem-solving-title" className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#f3f0e8]">
                  The thinking behind the output
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:col-span-9">
                <div className="case-summary-step"><h3>The problem</h3><p>{problem}</p></div>
                <div className="case-summary-step"><h3>The solution</h3><p>{approach}</p></div>
                <div className="case-summary-step"><h3>The impact</h3><p>{outcome}</p></div>
              </div>
            </div>
          </section>

          <div className="case-narrative mx-auto mt-12 max-w-3xl">
            {blocks.length > 0 && <StudyCaseRenderer blocks={blocks} />}
            <NextProjectNav nextProject={nextProject} />
            <RelatedProjects projects={related.filter((item) => item.slug !== nextProject?.slug)} />
          </div>
        </article>
      </main>

      <AuraFooter />
    </div>
  );
}
