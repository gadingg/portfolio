import React from 'react';
import Link from 'next/link';
import { getAllProjectsForAdmin } from '@/lib/db/projects';
import { ProjectTable } from '@/components/admin/ProjectTable';

export default async function AdminPortfolioListPage() {
  const projects = await getAllProjectsForAdmin();

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--amber)' }}>
            PORTFOLIO MANAGEMENT
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 600, letterSpacing: '-0.03em', margin: '6px 0 0' }}>
            Study Cases & Works
          </h1>
        </div>
        <Link href="/admintgadink/dashboard/portfolio/new" className="button button--primary">
          + NEW STUDY CASE
        </Link>
      </div>

      <ProjectTable initialProjects={projects} />
    </div>
  );
}
