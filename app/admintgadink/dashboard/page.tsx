import React from 'react';
import Link from 'next/link';
import { getDashboardStats, getAllProjectsForAdmin } from '@/lib/db/projects';

export default async function AdminDashboardOverviewPage() {
  const stats = await getDashboardStats();
  const projects = await getAllProjectsForAdmin();
  const recentProjects = projects.slice(0, 5);

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--amber)' }}>
            OVERVIEW
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 600, letterSpacing: '-0.03em', margin: '6px 0 0' }}>
            Good Evening, Gading
          </h1>
        </div>
        <Link href="/admintgadink/dashboard/portfolio/new" className="button button--primary">
          + NEW STUDY CASE
        </Link>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '48px',
        }}
      >
        <div
          style={{
            padding: '28px',
            borderRadius: '1.25rem',
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-card-border)',
          }}
        >
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--muted)' }}>
            PUBLISHED WORKS
          </p>
          <p style={{ margin: '12px 0 0', fontSize: '3rem', fontWeight: 800, color: 'var(--ink)' }}>
            {stats.totalPublished}
          </p>
        </div>

        <div
          style={{
            padding: '28px',
            borderRadius: '1.25rem',
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-card-border)',
          }}
        >
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--muted)' }}>
            UNFINISHED DRAFTS
          </p>
          <p style={{ margin: '12px 0 0', fontSize: '3rem', fontWeight: 800, color: 'var(--amber)' }}>
            {stats.totalDrafts}
          </p>
        </div>

        <div
          style={{
            padding: '28px',
            borderRadius: '1.25rem',
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-card-border)',
          }}
        >
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--muted)' }}>
            TOTAL STUDY CASES
          </p>
          <p style={{ margin: '12px 0 0', fontSize: '3rem', fontWeight: 800, color: 'var(--ink)' }}>
            {stats.totalProjects}
          </p>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div
        style={{
          borderRadius: '1.25rem',
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-card-border)',
          padding: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, margin: 0 }}>Recently Updated Projects</h2>
          <Link
            href="/admintgadink/dashboard/portfolio"
            style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.05em' }}
          >
            VIEW ALL ({projects.length}) →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentProjects.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{p.title}</p>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{p.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: p.status === 'published' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                    color: p.status === 'published' ? '#34d399' : '#fbbf24',
                    textTransform: 'uppercase',
                  }}
                >
                  {p.status}
                </span>
                <Link
                  href={`/admintgadink/dashboard/portfolio/${p.id}`}
                  style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', opacity: 0.8 }}
                >
                  Edit ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
