(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  let refreshTimer;
  const refresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
  };

  media.add({
    desktop: '(min-width: 1024px)',
    mobile: '(max-width: 1023px)',
    finePointer: '(hover: hover) and (pointer: fine)',
    reduced: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    const { desktop, reduced, finePointer } = context.conditions;
    if (reduced) return;
    const heroSection = document.querySelector('.hero-section');
    const brandSection = document.querySelector('.brand-section');
    let galleryMotion = [];
    let galleryListeners = [];

    gsap.timeline({ defaults: { ease: 'expo.out', clearProps: 'transform,opacity,visibility' } })
      .from('body > header', { y: -20, duration: 0.35 })
      .from('.hero-line', { yPercent: 28, opacity: 0.25, stagger: 0.10, duration: 1 }, '-=0.12')
      .from('.hero-actions-mobile, .hero-note', { y: 16, opacity: 0.4, stagger: 0.08, duration: 0.7 }, '-=0.65')
      .from('.hero-stack-container', { y: 38, duration: 1 }, '<');

    if (heroSection) {
      const hero = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'portfolio-hero',
          trigger: heroSection,
          start: 'top top',
          end: desktop ? '+=65%' : 'bottom top',
          scrub: 0.5,
          pin: desktop,
          invalidateOnRefresh: true,
        },
      });
      hero
        .to('.hero-wordmark', { yPercent: -35, duration: 1 }, 0)
        .to('.hero-stack', { y: desktop ? -55 : -24, scale: desktop ? 0.95 : 0.98, duration: 1 }, 0)
        .to('.hero-card:nth-child(1)', { x: desktop ? -46 : -18, y: 24, rotation: desktop ? -24 : -18, duration: 1 }, 0)
        .to('.hero-card:nth-child(2)', { x: desktop ? 42 : 18, y: -20, rotation: desktop ? 20 : 14, duration: 1 }, 0)
        .to('.hero-card:nth-child(3)', { x: desktop ? 54 : 22, y: 18, rotation: desktop ? 22 : 18, duration: 1 }, 0)
        .to('.hero-card:nth-child(4)', { rotation: 0, duration: 1 }, 0);
    }

    if (brandSection) {
      gsap.timeline({
        scrollTrigger: {
          id: 'portfolio-brand',
          trigger: brandSection,
          start: 'top 85%',
          end: desktop ? '+=45%' : 'bottom 35%',
          scrub: 0.5,
          pin: false,
          invalidateOnRefresh: true,
        },
      })
        .fromTo('.brand-drift', { xPercent: 3 }, { xPercent: desktop ? -12 : -6, ease: 'none', duration: 1 }, 0)
        .fromTo('.brand-word', {
          x: (index) => (index % 2 ? -1 : 1) * (desktop ? 55 : 18),
          y: desktop ? 40 : 18,
          opacity: 0.35,
        }, { x: 0, y: 0, opacity: 1, stagger: 0.07, duration: 0.65, ease: 'power2.out' }, 0)
        .to('.brand-word', { x: (index) => (index % 2 ? -1 : 1) * (desktop ? 16 : 6), stagger: 0.04, duration: 0.3, ease: 'none' }, 0.7);
    }

    document.querySelectorAll('.services-section, .contact-section').forEach((section) => {
      const targets = section.querySelectorAll('h2');
      if (!targets.length) return;
      gsap.from(targets, {
        y: desktop ? 28 : 16,
        opacity: 0,
        duration: 0.65,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: section, start: 'top 88%', once: true },
      });
    });

    document.querySelectorAll('[data-reveal], .reveal').forEach((item) => {
      gsap.from(item, {
        y: 20, opacity: 0, duration: 0.6, ease: 'power2.out',
        clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: item, start: 'top 90%', once: true },
      });
    });

    const clearGallery = () => {
      galleryListeners.forEach((remove) => remove());
      galleryListeners = [];
      galleryMotion.forEach((animation) => {
        animation.scrollTrigger?.kill();
        animation.revert();
      });
      galleryMotion = [];
    };
    context.add('animateGallery', () => {
      clearGallery();
      const gallery = document.getElementById('projectGalleryContainer');
      if (!gallery || !gallery.children.length) return;
      [...gallery.children].forEach((card, index) => {
        const content = card.querySelector('.project-card-content');
        const image = card.querySelector('img');
        const arrow = card.querySelector('.case-link svg');
        const entrance = gsap.timeline({
          defaults: { ease: 'expo.out', clearProps: 'transform,opacity,visibility' },
          scrollTrigger: { id: `portfolio-work-${index}`, trigger: card, start: 'top 92%', once: true },
        });
        entrance.from(card, { y: desktop ? 40 : 20, opacity: 0.4, duration: 1 });
        if (content) entrance.from(content.children, { y: 12, opacity: 0.45, stagger: 0.06, duration: 0.75 }, 0.12);
        galleryMotion.push(entrance);

        if (image && desktop) {
          galleryMotion.push(gsap.fromTo(image, { yPercent: -3, scale: 1.08 }, {
            yPercent: 3, scale: 1.08, ease: 'none',
            scrollTrigger: { id: `portfolio-work-image-${index}`, trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.7 },
          }));
        }
        if (arrow) {
          const hover = gsap.to(arrow, { x: 6, duration: 0.35, ease: 'power3.out', paused: true });
          galleryMotion.push(hover);
          const enter = () => hover.play();
          const leave = () => hover.reverse();
          const events = finePointer ? [['pointerenter', enter], ['pointerleave', leave], ['focus', enter], ['blur', leave]] : [['focus', enter], ['blur', leave]];
          events.forEach(([event, handler]) => {
            card.addEventListener(event, handler);
            galleryListeners.push(() => card.removeEventListener(event, handler));
          });
        }
      });
      refresh();
    });
    context.animateGallery();
    document.addEventListener('portfolio:projects-before-update', clearGallery);
    document.addEventListener('portfolio:projects-updated', context.animateGallery);
    return () => {
      clearGallery();
      document.removeEventListener('portfolio:projects-before-update', clearGallery);
      document.removeEventListener('portfolio:projects-updated', context.animateGallery);
    };
  });

  document.fonts?.ready.then(refresh);
  if (document.readyState === 'complete') refresh();
  else window.addEventListener('load', refresh, { once: true });
  window.addEventListener('pagehide', (event) => {
    clearTimeout(refreshTimer);
    if (!event.persisted) media.revert();
  });
})();
