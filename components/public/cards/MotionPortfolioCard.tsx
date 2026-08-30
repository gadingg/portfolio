'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types/portfolio';

export function MotionPortfolioCard({ project, videoUrl }: { project: Project; videoUrl?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !videoUrl || !cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [videoUrl]);

  return (
    <Link
      ref={cardRef}
      href={`/work/${project.slug}`}
      className="project-card"
      aria-label={`View ${project.title} motion case`}
    >
      <div className="project-preview" style={{ position: 'relative' }}>
        {videoUrl ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            poster={project.cover_image_url}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={project.cover_image_url || 'https://picsum.photos/id/1043/600/400'}
            alt={project.cover_image_alt || project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
        )}
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
