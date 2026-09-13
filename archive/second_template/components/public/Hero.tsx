'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export function Hero() {
  const videoDarkRef = useRef<HTMLVideoElement>(null);
  const videoLightRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let ticking = false;
    const updateHeroParallax = () => {
      const progress = Math.min(window.scrollY / (window.innerHeight * 1.15), 1);
      const scale = 1.07 + progress * 0.1;
      const translate = progress * 14;
      const transformVal = `scale(${scale}) translateY(${translate}px)`;

      if (videoDarkRef.current) videoDarkRef.current.style.transform = transformVal;
      if (videoLightRef.current) videoLightRef.current.style.transform = transformVal;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateHeroParallax();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateHeroParallax();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <div className="hero-fallback" />
        <video
          ref={videoDarkRef}
          className="hero-video is-ready"
          id="heroVideoDark"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-center">
        <div className="hero-shell">
          <p className="hero-eyebrow" style={{ marginBottom: 16 }}>
            <span className="status-dot" />
            MARKETING COMMUNICATION · CREATIVE SYSTEMS
          </p>

          <h1 className="hero-title" id="hero-title">
            Gading Utama
          </h1>

          <p className="hero-subtitle">
            I turn marketing briefs into visual campaigns, performance ads, and useful digital products.
          </p>

          <div className="hero-actions">
            <Link className="button button--primary" href="#contact">
              CONTACT ME
            </Link>
            <Link className="button button--secondary" href="#recent-works">
              VIEW MY WORK
            </Link>
          </div>

          <div className="hero-chips" aria-label="Core skills">
            <span>Graphic Design</span>
            <span>Meta Ads</span>
            <span>Web Development</span>
          </div>
        </div>
      </div>

      <div className="hero-contact" aria-label="Quick contact">
        <span>Based in Surabaya</span>
        <a href="mailto:your@email.com" style={{ textTransform: 'lowercase' }}>
          your@email.com
        </a>
      </div>
    </section>
  );
}
