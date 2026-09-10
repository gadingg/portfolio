import React from 'react';
import { Project } from '@/types/portfolio';
import { PortfolioCardRenderer } from '../cards/PortfolioCardRenderer';

export function RelatedProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;

  return (
    <section style={{ marginTop: '96px', paddingTop: '64px', borderTop: '1px solid var(--border)' }}>
      <p className="eyebrow" style={{ marginBottom: '16px' }}>
        EXPLORE MORE WORK
      </p>
      <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 600, letterSpacing: '-0.04em', margin: '0 0 36px' }}>
        Related Case Studies
      </h2>

      <div className="projects-grid">
        {projects.map((p) => (
          <PortfolioCardRenderer key={p.id || p.slug} project={p} variant="default" />
        ))}
      </div>
    </section>
  );
}
