import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types/portfolio';

export function DefaultCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="project-card"
      aria-label={`View ${project.title} case`}
    >
      <div className="project-preview">
        <Image
          src={project.cover_image_url || 'https://picsum.photos/id/60/600/400'}
          alt={project.cover_image_alt || project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          loading="lazy"
        />
      </div>
      <div className="project-card__inner">
        <div>
          <p className="card-label">{project.category}</p>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </div>
        <span className="card-link">
          VIEW CASE <span aria-hidden="true">↗</span>
        </span>
      </div>
    </Link>
  );
}
