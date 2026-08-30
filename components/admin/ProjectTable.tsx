'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Project } from '@/types/portfolio';
import { DeleteModal } from './modals/DeleteModal';

export function ProjectTable({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category));
    return Array.from(set);
  }, [projects]);

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'featured'
          ? p.is_featured
          : p.status === statusFilter;

      const matchCategory = categoryFilter === 'all' ? true : p.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [projects, search, statusFilter, categoryFilter]);

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    setActionLoading(id);

    try {
      const res = await fetch(`/api/admin/projects/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: nextStatus as any } : p))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div>
      {/* Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or category..."
          style={{
            minWidth: '280px',
            padding: '12px 18px',
            borderRadius: '999px',
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-card-border)',
            color: 'var(--ink)',
            fontSize: '13px',
            outline: 'none',
          }}
        />

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              background: 'var(--admin-card)',
              border: '1px solid var(--admin-card-border)',
              color: 'var(--ink)',
              fontSize: '12px',
              fontWeight: 600,
              outline: 'none',
            }}
          >
            <option value="all">All Status</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="featured">Featured Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '999px',
              background: 'var(--admin-card)',
              border: '1px solid var(--admin-card-border)',
              color: 'var(--ink)',
              fontSize: '12px',
              fontWeight: 600,
              outline: 'none',
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div
        style={{
          borderRadius: '1.25rem',
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-card-border)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 20px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', fontSize: '11px' }}>
                TITLE
              </th>
              <th style={{ padding: '16px 20px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', fontSize: '11px' }}>
                CATEGORY
              </th>
              <th style={{ padding: '16px 20px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', fontSize: '11px' }}>
                STATUS
              </th>
              <th style={{ padding: '16px 20px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', fontSize: '11px' }}>
                FEATURED
              </th>
              <th style={{ padding: '16px 20px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', fontSize: '11px', textAlign: 'right' }}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>
                  No study cases match your search criteria.
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '18px 20px' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)' }}>{p.title}</p>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>/work/{p.slug}</span>
                  </td>
                  <td style={{ padding: '18px 20px', color: 'var(--muted)' }}>{p.category}</td>
                  <td style={{ padding: '18px 20px' }}>
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
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    {p.is_featured ? (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)' }}>★ YES</span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '12px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(p.id, p.status)}
                        disabled={actionLoading === p.id}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: p.status === 'published' ? '#fbbf24' : '#34d399',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {p.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>

                      <Link
                        href={`/admintgadink/dashboard/portfolio/${p.id}`}
                        style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}
                      >
                        Edit
                      </Link>

                      <Link
                        href={`/work/${p.slug}`}
                        target="_blank"
                        style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}
                      >
                        View ↗
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        project={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
