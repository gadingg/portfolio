import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/portfolio';

export function NextProjectNav({ nextProject }: { nextProject: Project | null }) {
  if (!nextProject) return null;

  return (
    <div
      style={{
        marginTop: '64px',
        padding: '36px',
        borderRadius: '1.75rem',
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}
    >
      <div>
        <p className="card-label">NEXT CASE STUDY</p>
        <h3 style={{ margin: '8px 0 0', fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-0.03em' }}>
          {nextProject.title}
        </h3>
      </div>
      <Link href={`/work/${nextProject.slug}`} className="button button--primary">
        VIEW CASE →
      </Link>
    </div>
  );
}
