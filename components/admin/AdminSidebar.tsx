'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => setIsOpen(false), [pathname]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admintgadink');
      router.refresh();
    } catch {
      router.push('/admintgadink');
    }
  };

  const navItems = [
    { label: 'Overview', href: '/admintgadink/dashboard' },
    { label: 'Portfolio Projects', href: '/admintgadink/dashboard/portfolio' },
    { label: 'Visual Gallery', href: '/admintgadink/dashboard/gallery' },
    { label: '+ New Study Case', href: '/admintgadink/dashboard/portfolio/new' },
  ];

  return (
    <>
      <header className="admin-mobile-header">
        <div><strong>Gading Admin</strong><span>Portfolio CMS</span></div>
        <button type="button" onClick={() => setIsOpen(true)} aria-expanded={isOpen} aria-controls="admin-navigation">Menu</button>
      </header>
      {isOpen && <button type="button" className="admin-nav-backdrop" onClick={() => setIsOpen(false)} aria-label="Close admin navigation" />}
      <aside
        id="admin-navigation"
        className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}
        aria-label="CMS navigation"
        aria-hidden={isMobile && !isOpen}
        inert={isMobile && !isOpen}
      >
      <div>
        {/* Brand */}
        <div style={{ paddingBottom: '28px', borderBottom: '1px solid var(--border)', marginBottom: '28px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--amber)' }}>
            GADING ADMIN
          </span>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>Portfolio CMS</p>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isActive ? 'var(--ink)' : 'var(--muted)',
                  background: isActive ? 'var(--surface)' : 'transparent',
                  border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link
          href="/"
          target="_blank"
          style={{
            fontSize: '12px',
            color: 'var(--muted)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          View Public Site <span>↗</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: '10px 16px',
            borderRadius: '999px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          LOGOUT
        </button>
      </div>
      </aside>
    </>
  );
}
