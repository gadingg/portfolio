import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublishedProjectBySlug, getRelatedProjects, getNextProject } from '@/lib/db/public-projects';
import { StudyCaseHeader } from '@/components/public/study-case/StudyCaseHeader';
import { StudyCaseRenderer } from '@/components/public/study-case/StudyCaseRenderer';
import { RelatedProjects } from '@/components/public/study-case/RelatedProjects';
import { NextProjectNav } from '@/components/public/study-case/NextProjectNav';
import { AuraFooter } from '@/components/public/study-case/AuraFooter';

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
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const related = await getRelatedProjects(slug, project.category);
  const nextProject = await getNextProject(slug);

  return (
    <>
      <StudyCaseHeader projectTitle={project.title} />

      <main className="min-h-screen pt-24 sm:pt-32 pb-16">
        <article className="mx-auto w-full max-w-4xl px-5 sm:px-8 lg:px-12">
          {/* Back Navigation Pill */}
          <div className="mb-6">
            <Link
              href="/#work"
              className="inline-flex items-center gap-2 rounded-full border border-[#f3f0e8]/15 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f3f0e8]/75 hover:border-[#ff5a1f] hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition min-h-[44px]"
            >
              <span>←</span>
              <span>Back to Works</span>
            </Link>
          </div>

          {/* Header Section */}
          <header className="mb-8">
            <div className="section-label mb-3">
              {project.category}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.05em] text-[#f3f0e8] leading-[1.08] mb-4">
              {project.title}
            </h1>

            {project.subtitle && (
              <p className="text-lg sm:text-xl font-medium leading-[1.5] text-[#f3f0e8]/75 mb-6">
                {project.subtitle}
              </p>
            )}

            {/* Metadata Bar Glass Card */}
            <div className="glass rounded-[24px] p-5 sm:p-6 my-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border border-[#f3f0e8]/10">
              {project.client && (
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f3f0e8]/45">
                    Client
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#f3f0e8] mt-1 block truncate">
                    {project.client}
                  </span>
                </div>
              )}
              {project.role && (
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f3f0e8]/45">
                    Role
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#f3f0e8] mt-1 block truncate">
                    {project.role}
                  </span>
                </div>
              )}
              {project.duration && (
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f3f0e8]/45">
                    Timeline
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#f3f0e8] mt-1 block truncate">
                    {project.duration}
                  </span>
                </div>
              )}
              {project.year && (
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f3f0e8]/45">
                    Year
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#ff5a1f] mt-1 block truncate">
                    {project.year}
                  </span>
                </div>
              )}
            </div>

            {/* Services Tags */}
            {project.services && project.services.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {project.services.map((svc, idx) => (
                  <span
                    key={idx}
                    className="rounded-full border border-[#f3f0e8]/10 bg-white/[0.03] px-3.5 py-1 text-xs font-semibold text-[#f3f0e8]/65"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Hero Cover Image */}
          <div className="glass rounded-[24px] sm:rounded-[32px] p-2 sm:p-3 border border-[#f3f0e8]/12 mb-10 overflow-hidden shadow-2xl">
            <div className="relative w-full aspect-[16/9] rounded-[18px] sm:rounded-[24px] overflow-hidden bg-[#10110f]">
              <Image
                src={project.cover_image_url}
                alt={project.cover_image_alt || project.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1000px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Overview Callout Paragraph */}
          <div className="mb-10 pb-8 border-b border-[#f3f0e8]/10">
            <p className="text-lg sm:text-xl font-normal leading-[1.75] text-[#f3f0e8]/85 tracking-[-0.01em]">
              {project.description}
            </p>
          </div>

          {/* Dynamic Content Blocks */}
          {project.blocks && project.blocks.length > 0 && (
            <StudyCaseRenderer blocks={project.blocks} />
          )}

          {/* Next Project Nav */}
          <NextProjectNav nextProject={nextProject} />

          {/* Related Case Studies */}
          <RelatedProjects projects={related} />
        </article>
      </main>

      <AuraFooter />
    </>
  );
}
