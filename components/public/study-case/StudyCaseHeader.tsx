'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface StudyCaseHeaderProps {
  projectTitle?: string;
}

export function StudyCaseHeader({ projectTitle }: StudyCaseHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 transition-all duration-300 md:px-8 lg:px-12 backdrop-blur-md ${
          isScrolled
            ? 'bg-[#060706]/90 border-b border-[#f3f0e8]/10 shadow-2xl shadow-black/40'
            : 'bg-[#060706]/75 border-b border-[#f3f0e8]/5'
        }`}
      >
        {/* Brand & Breadcrumb */}
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/#home"
            className="flex items-center gap-2.5 text-base sm:text-lg font-black tracking-[-0.04em] text-[#f3f0e8] hover:text-[#ff5a1f] transition"
          >
            <span className="h-2 w-2 rounded-full bg-[#ff5a1f] shadow-[0_0_12px_rgba(255,90,31,0.7)]"></span>
            <span>Gading Utama</span>
          </Link>

          <span className="hidden sm:inline-block text-[#f3f0e8]/20">/</span>

          <Link
            href="/#work"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#f3f0e8]/60 hover:text-[#ff5a1f] transition"
          >
            Works
          </Link>

          {projectTitle && (
            <>
              <span className="hidden md:inline-block text-[#f3f0e8]/20">/</span>
              <span className="hidden md:inline-block text-xs font-medium text-[#f3f0e8]/45 truncate max-w-[200px] lg:max-w-[320px]">
                {projectTitle}
              </span>
            </>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-xs font-bold text-[#f3f0e8]/80 lg:flex" aria-label="Study Case Navigation">
          <Link href="/#work" className="nav-link hover:text-[#ff5a1f] transition">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#ff5a1f] align-middle"></span>
            All Works
          </Link>
          <Link href="/#web-apps" className="nav-link hover:text-[#ff5a1f] transition">
            Apps
          </Link>
          <Link href="/#studio" className="nav-link hover:text-[#ff5a1f] transition">
            About
          </Link>
          <Link href="/#pricing" className="nav-link hover:text-[#ff5a1f] transition">
            Toolkit
          </Link>
          <Link href="/#contact" className="nav-link hover:text-[#ff5a1f] transition">
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 rounded-full border border-[#f3f0e8]/15 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#f3f0e8] hover:border-[#ff5a1f] hover:text-[#ff5a1f] hover:bg-[#ff5a1f]/10 transition min-h-[44px]"
          >
            Start Project
          </Link>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="glass flex h-11 w-11 items-center justify-center rounded-full lg:hidden text-[#f3f0e8] hover:text-[#ff5a1f] transition min-h-[44px] min-w-[44px]"
            aria-label="Open mobile navigation menu"
            aria-expanded={isDrawerOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isDrawerOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Drawer Panel */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-xs bg-[#0c0e0c] border-l border-[#f3f0e8]/10 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-out ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-[#f3f0e8]/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#f3f0e8]/50">Navigation</span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="glass flex h-11 w-11 items-center justify-center rounded-full text-[#f3f0e8] hover:text-[#ff5a1f] min-h-[44px] min-w-[44px]"
                aria-label="Close navigation menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-3 text-lg font-bold">
              <Link
                href="/#home"
                onClick={() => setIsDrawerOpen(false)}
                className="py-3 text-[#f3f0e8] hover:text-[#ff5a1f] transition flex items-center justify-between border-b border-[#f3f0e8]/5"
              >
                <span>Home</span>
                <span className="text-xs text-[#ff5a1f]">01</span>
              </Link>
              <Link
                href="/#work"
                onClick={() => setIsDrawerOpen(false)}
                className="py-3 text-[#f3f0e8] hover:text-[#ff5a1f] transition flex items-center justify-between border-b border-[#f3f0e8]/5"
              >
                <span>All Works</span>
                <span className="text-xs text-[#ff5a1f]">02</span>
              </Link>
              <Link
                href="/#web-apps"
                onClick={() => setIsDrawerOpen(false)}
                className="py-3 text-[#f3f0e8] hover:text-[#ff5a1f] transition flex items-center justify-between border-b border-[#f3f0e8]/5"
              >
                <span>Web Apps</span>
                <span className="text-xs text-[#ff5a1f]">03</span>
              </Link>
              <Link
                href="/#studio"
                onClick={() => setIsDrawerOpen(false)}
                className="py-3 text-[#f3f0e8] hover:text-[#ff5a1f] transition flex items-center justify-between border-b border-[#f3f0e8]/5"
              >
                <span>About</span>
                <span className="text-xs text-[#ff5a1f]">04</span>
              </Link>
              <Link
                href="/#contact"
                onClick={() => setIsDrawerOpen(false)}
                className="py-3 text-[#f3f0e8] hover:text-[#ff5a1f] transition flex items-center justify-between border-b border-[#f3f0e8]/5"
              >
                <span>Contact</span>
                <span className="text-xs text-[#ff5a1f]">05</span>
              </Link>
            </nav>
          </div>

          <div className="pt-6 border-t border-[#f3f0e8]/10">
            <Link
              href="/#contact"
              onClick={() => setIsDrawerOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff5a1f] py-3.5 text-xs font-bold uppercase tracking-wider text-[#060706] shadow-lg shadow-[#ff5a1f]/20 min-h-[44px]"
            >
              Start a Project
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
