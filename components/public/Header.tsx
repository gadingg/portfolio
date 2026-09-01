'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 120 && currentScrollY > lastScrollY) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide header completely on admin routes and /second (which uses floating dock)
  if (pathname?.startsWith('/admintgadink') || pathname?.startsWith('/second')) {
    return null;
  }

  return (
    <header className={`site-header ${isHidden ? 'is-hidden' : ''}`}>
      <div className="header-wrap">
        <Link href="/#home" className="logo">
          GADING
        </Link>
        <nav className="nav-menu" aria-label="Main Navigation">
          <Link href="/#home">Home</Link>
          <Link href="/#about">About</Link>
          <Link href="/#recent-works">Works</Link>
          <Link href="/#web-apps">Apps</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
