'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminLink } from './AdminLink';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [logoutError,setLogoutError]=useState(''),[loggingOut,setLoggingOut]=useState(false);

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
  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const main = document.querySelector<HTMLElement>('.admin-main');
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (main) main.inert = true;
    const controls = Array.from(document.querySelectorAll<HTMLElement>('#admin-navigation a, #admin-navigation button'));
    controls[0]?.focus();
    const keepFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keepFocus);
    return () => {
      document.body.style.overflow = oldOverflow;
      if (main) main.inert = false;
      document.removeEventListener('keydown', keepFocus);
      menuButton.current?.focus();
    };
  }, [isOpen, isMobile]);

  const handleLogout = async () => {
    if(loggingOut)return;
    setLoggingOut(true);setLogoutError('');
    try {
      const response=await fetch('/api/admin/logout', { method: 'POST' });
      if(!response.ok)throw Error('Belum bisa keluar. Coba lagi.');
      router.push('/admintgadink');
      router.refresh();
    } catch {
      setLogoutError('Belum bisa keluar. Coba lagi.');
    } finally {setLoggingOut(false);}
  };

  if(pathname.startsWith('/admintgadink/dashboard/editor/'))return null;
  const navItems = [
    { label: 'Overview', href: '/admintgadink/dashboard' },
    { label: 'Works', href: '/admintgadink/dashboard/works' },
    { label: 'Editor visual', href: '/admintgadink/dashboard/editor/home' },
    { label: 'Website & CV', href: '/admintgadink/dashboard/site' },
  ];

  return (
    <>
      <header className="admin-mobile-header">
        <div><strong>Gading Admin</strong><span>Portfolio CMS</span></div>
        <button ref={menuButton} type="button" onClick={() => setIsOpen(value => !value)} aria-expanded={isOpen} aria-controls="admin-navigation">{isOpen ? 'Tutup' : 'Menu'}</button>
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
              <AdminLink
                key={item.href}
                href={item.href}
                className="admin-sidebar-link"
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </AdminLink>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AdminLink
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-public-link"
        >
          Lihat website
        </AdminLink>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          aria-busy={loggingOut}
          className="admin-logout"
        >
          {loggingOut && <span className="admin-spinner" aria-hidden="true" />}
          {loggingOut?'Menutup sesi…':'Keluar'}
        </button>
        {logoutError&&<p role="alert" style={{fontSize:'14px',color:'var(--ink)',margin:0}}>{logoutError}</p>}
      </div>
      </aside>
    </>
  );
}
