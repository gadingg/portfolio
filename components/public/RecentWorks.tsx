import React from 'react';
import { Project } from '@/types/portfolio';
import { PortfolioCardRenderer } from './cards/PortfolioCardRenderer';

export function RecentWorks({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="projects-section" id="recent-works" aria-labelledby="recent-title">
      <div className="wrap">
        <header className="section-heading">
          <div>
            <p className="eyebrow">RECENT WORKS · FIRST YEAR</p>
            <h2 id="recent-title">Ideas that moved from proposal to real daily use.</h2>
          </div>
          <p className="section-intro">
            A selection of campaigns, systems, and internal innovations created during my first year at the office.
          </p>
        </header>

        <div className="projects-grid">
          {projects.map((project, index) => {
            // First project or featured projects get wide treatment
            const isWide = index === 0 || project.is_featured;
            return (
              <PortfolioCardRenderer
                key={project.id || project.slug}
                project={project}
                variant={isWide ? 'featured' : 'default'}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
