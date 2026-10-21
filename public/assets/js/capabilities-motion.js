(() => {
  // Content stays visible without motion support; the CMS canvas stays stable.
  if (document.body.dataset.cmsPreview || !window.gsap || !window.IntersectionObserver) return;
  const { gsap } = window;
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const observed = new Set();
    const seen = new WeakSet();
    const context = gsap.context(() => {});
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < .15) return;
        const card = entry.target;
        observer.unobserve(card);
        observed.delete(card);
        if (!card.isConnected || seen.has(card)) return;
        seen.add(card);
        context.add(() => {
          if (card.matches('.capability-card')) {
            // Assemble the miniature scenes while preserving their CSS rotations.
            const pieces = card.querySelectorAll('.scene-tile, .mini-browser');
            gsap.from(card, { y: 8, duration: .5, ease: 'expo.out', clearProps: 'transform' });
            gsap.from(pieces, {
              y: '+=12', rotation: '-=4', opacity: .65, stagger: .07,
              duration: .65, ease: 'expo.out', clearProps: 'transform,opacity',
            });
          } else {
            // Move captions only; artwork proportions, hit areas and dragging stay stable.
            const caption = card.querySelectorAll('.work-card-title, .work-card-description, .work-card-meta, .work-card-video .video-bottom');
            if (caption.length) gsap.from(caption, {
              y: 6, opacity: .85, duration: .4, stagger: .035,
              ease: 'power2.out', clearProps: 'transform,opacity',
            });
          }
        });
      });
    }, { threshold: .15 });
    const sync = () => {
      // Works replace their initial server render during enhancement and retries.
      observed.forEach(card => {
        if (!card.isConnected) { observer.unobserve(card); observed.delete(card); }
      });
      document.querySelectorAll('.capability-card, [data-works-list] .work-card:not(.work-loading-skeleton)').forEach(card => {
        if (seen.has(card) || observed.has(card)) return;
        observed.add(card);
        observer.observe(card);
      });
    };
    sync();
    document.addEventListener('portfolio:works-ready', sync);
    return () => {
      observer.disconnect();
      observed.clear();
      document.removeEventListener('portfolio:works-ready', sync);
      context.revert();
    };
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) media.revert();
  });
})();
