import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types/portfolio';

export function FeaturedCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="project-card project-card--wide project-card--tall"
      aria-label={`View ${project.title} case`}
    >
      <div className="project-preview" style={{ aspectRatio: '16 / 9' }}>
        <Image
          src={project.cover_image_url || 'https://picsum.photos/id/60/1200/800'}
          alt={project.cover_image_alt || project.title}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          style={{ objectFit: 'cover' }}
          priority={project.is_featured}
        />
      </div>
      <div className="project-card__inner">
        <div>
          <p className="card-label">{project.category}</p>
          <h3 style={{ fontSize: '1.85rem' }}>{project.title}</h3>
          <p style={{ fontSize: '15px' }}>{project.description}</p>
        </div>
        <span className="card-link">
          VIEW CASE <span aria-hidden="true">↗</span>
        </span>
      </div>
    </Link>
  );
}
