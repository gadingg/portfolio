import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublishedProjectBySlug, getRelatedProjects, getNextProject } from '@/lib/db/public-projects';
import { StudyCaseRenderer } from '@/components/public/study-case/StudyCaseRenderer';
import { RelatedProjects } from '@/components/public/study-case/RelatedProjects';
import { NextProjectNav } from '@/components/public/study-case/NextProjectNav';
import { Footer } from '@/components/public/Footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found | Gading Portfolio',
    };
  }

  return {
    title: `${project.title} — Gading Utama`,
    description: project.description,
    openGraph: {
      title: `${project.title} — Study Case`,
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
      <article style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="wrap" style={{ maxWidth: '840px' }}>
          {/* Back Navigation */}
          <Link
            href="/#recent-works"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '32px',
            }}
          >
            ← BACK TO WORKS
          </Link>

          {/* Header */}
          <header style={{ marginBottom: '40px' }}>
            <p className="eyebrow" style={{ marginBottom: '12px' }}>
              {project.category}
            </p>
            <h1
              style={{
                fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)',
                fontWeight: 600,
                letterSpacing: '-0.05em',
                lineHeight: 1.05,
                margin: '0 0 16px',
                color: 'var(--ink)',
              }}
            >
              {project.title}
            </h1>
            {project.subtitle && (
              <p
                style={{
                  fontSize: 'clamp(18px, 2vw, 22px)',
                  lineHeight: 1.6,
                  color: 'var(--muted)',
                  margin: '0 0 28px',
                }}
              >
                {project.subtitle}
              </p>
            )}

            {/* Metadata Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px 36px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '20px',
              }}
            >
              {project.year && (
                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.15em' }}>
                    YEAR
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{project.year}</span>
                </div>
              )}
              {project.role && (
                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.15em' }}>
                    ROLE
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{project.role}</span>
                </div>
              )}
              {project.client && (
                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.15em' }}>
                    CLIENT
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{project.client}</span>
                </div>
              )}
              {project.duration && (
                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.15em' }}>
                    DURATION
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{project.duration}</span>
                </div>
              )}
            </div>
          </header>

          {/* Hero Cover Image */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: '1.75rem',
              overflow: 'hidden',
              marginBottom: '48px',
              border: '1px solid var(--border-strong)',
            }}
          >
            <Image
              src={project.cover_image_url}
              alt={project.cover_image_alt || project.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 840px"
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* Overview Paragraph */}
          <div style={{ marginBottom: '40px' }}>
            <p
              style={{
                fontSize: 'clamp(18px, 1.8vw, 21px)',
                lineHeight: 1.75,
                color: 'var(--ink)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
              }}
            >
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
        </div>
      </article>

      <Footer />
    </>
  );
}
