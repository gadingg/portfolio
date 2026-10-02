import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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

export const revalidate = 300;

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

export async function generateStaticParams() {
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
      description: project.description,
      images: [
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

  const { related, nextProject } = getProjectNavigation(projects, slug, project.category);
  const blocks = (project.blocks || []) as ContentBlock[];
  const problem = paragraphAfterHeading(blocks, /challenge|problem|brief/i) || project.description;
  const approach = paragraphAfterHeading(blocks, /solution|approach|system|execution|architecture/i)
    || project.subtitle
    || 'A practical response shaped around the team, workflow, and business constraint.';
  const outcome = projectOutcome(blocks) || 'See the documented outcomes and project evidence below.';

  return (
    <>
      <StudyCaseHeader projectTitle={project.title} />

      <main className="case-page min-h-screen pb-16 pt-24 sm:pt-32">
        <article className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          <Link
            href="/#work"
            className="mb-8 inline-flex min-h-[44px] items-center border-b border-[#f3f0e8]/25 text-xs font-bold uppercase tracking-wider text-[#f3f0e8]/65 transition hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
          >
            Back to selected work
          </Link>

          <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="section-label mb-4">{project.category}</div>
              <h1 className="max-w-5xl text-4xl font-black leading-[0.98] tracking-[-0.06em] text-[#f3f0e8] sm:text-6xl lg:text-7xl">
                {project.title}
              </h1>
              {project.subtitle && (
                <p className="mt-5 max-w-2xl text-lg font-medium leading-[1.55] text-[#f3f0e8]/68 sm:text-xl">
                  {project.subtitle}
                </p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[#f3f0e8]/15 pt-5 text-sm lg:col-span-4">
              {project.client && <div><dt>Client</dt><dd>{project.client}</dd></div>}
              {project.role && <div><dt>Role</dt><dd>{project.role}</dd></div>}
              {project.duration && <div><dt>Timeline</dt><dd>{project.duration}</dd></div>}
              {project.year && <div><dt>Year</dt><dd>{project.year}</dd></div>}
            </dl>
          </header>

          <figure className="case-cover mt-10 overflow-hidden rounded-[20px] border border-[#f3f0e8]/10 bg-[#10110f] sm:rounded-[28px]">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={project.cover_image_url}
                alt={project.cover_image_alt || project.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </figure>

          <section aria-labelledby="problem-solving-title" className="mt-12 border-y border-[#f3f0e8]/12 py-10 sm:mt-16 sm:py-14">
            <div className="grid gap-9 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="section-label">Problem solving</p>
                <h2 id="problem-solving-title" className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#f3f0e8]">
                  The thinking behind the output
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:col-span-9">
                <div className="case-summary-step"><span>01</span><h3>Problem</h3><p>{problem}</p></div>
                <div className="case-summary-step"><span>02</span><h3>Approach</h3><p>{approach}</p></div>
                <div className="case-summary-step"><span>03</span><h3>Outcome</h3><p>{outcome}</p></div>
              </div>
            </div>
          </section>

          {project.services && project.services.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-[#f3f0e8]/10 pb-8 text-xs font-semibold text-[#f3f0e8]/58">
              {project.services.map((service) => <span key={service}>{service}</span>)}
            </div>
          )}

          <div className="case-narrative mx-auto mt-12 max-w-3xl">
            <p className="mb-12 text-xl font-medium leading-[1.7] tracking-[-0.015em] text-[#f3f0e8]/88 sm:text-2xl">
              {project.description}
            </p>
            {blocks.length > 0 && <StudyCaseRenderer blocks={blocks} />}
            <NextProjectNav nextProject={nextProject} />
            <RelatedProjects projects={related} />
          </div>
        </article>
      </main>

      <AuraFooter />
    </>
  );
}
