(() => {
  const cards = [...document.querySelectorAll('.capability-card')];
  if (!cards.length || !window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    cards.forEach(card => {
      const visual = card.querySelector('.capability-visual');
      if (!visual) return;
      gsap.fromTo(card, { y: 12, opacity: .8 }, {
        y: 0, opacity: 1, duration: .7, ease: 'expo.out',
        immediateRender: false,
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        clearProps: 'transform,opacity',
      });
    });
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) media.revert();
  });
})();
