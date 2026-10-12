'use client';

import { useRef, useState } from 'react';
import { Menu, MessageCircle, X } from 'lucide-react';

export function StudyCaseHeader({ projectTitle }: { projectTitle?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const close = () => dialogRef.current?.close();

  return <>
    <header className="portfolio-header">
      <a className="wordmark" href="/" aria-label="R. Gading Utama, home">gading<span aria-hidden="true">.</span></a>
      <nav className="desktop-nav" aria-label={projectTitle ? `Navigation from ${projectTitle}` : 'Main navigation'}>
        <a href="/#work">Selected works</a><a href="/#visuals">Visual archive</a><a href="/#about">About</a>
      </nav>
      <a className="header-contact" href="/#contact">Let's talk <MessageCircle className="icon" aria-hidden="true" /></a>
      <button type="button" className="button button-outline menu-toggle" aria-controls="case-menu" aria-expanded={isOpen} onClick={() => { dialogRef.current?.showModal(); setIsOpen(true); }}>Menu <Menu className="icon" aria-hidden="true" /></button>
    </header>
    <dialog id="case-menu" className="menu-dialog" ref={dialogRef} aria-labelledby="case-menu-title" onClose={() => setIsOpen(false)} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    }}>
      <div className="dialog-top"><h2 id="case-menu-title">Explore the work.</h2><button className="button button-outline" type="button" onClick={close}>Close <X className="icon" aria-hidden="true" /></button></div>
      <nav aria-label="Mobile navigation"><a href="/#work">Selected works</a><a href="/#visuals">Visual archive</a><a href="/#web-apps">Useful tools</a><a href="/#about">About Gading</a><a href="/#contact">Let's talk</a></nav>
      <p>Creative Marketing · Design · Digital Solutions</p>
    </dialog>
  </>;
}
