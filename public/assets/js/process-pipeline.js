(() => {
  const pipeline = document.querySelector('.process-pipeline');
  if (!pipeline || !window.gsap || !window.ScrollTrigger) return;
  const steps = [...pipeline.querySelectorAll('.principles > li')];
  if (!steps.length) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  const routes = [...pipeline.querySelectorAll('.pipeline-svg')].map(svg => {
    const path = svg.querySelector('.pipeline-fill');
    return { path, packet: svg.querySelector('.pipeline-packet'), length: path.getTotalLength() };
  });
  const paint = progress => {
    pipeline.style.setProperty('--pipeline-progress', String(progress));
    routes.forEach(({ path, packet, length }) => {
      const point = path.getPointAtLength(length * progress);
      packet.setAttribute('cx', point.x);
      packet.setAttribute('cy', point.y);
      packet.style.visibility = progress > 0.001 && progress < 0.999 ? 'visible' : 'hidden';
    });
  };
  let active = -1;
  const mark = progress => {
    const next = Math.min(steps.length - 1, Math.floor(progress * (steps.length - 1) + 0.001));
    if (next === active) return;
    active = next;
    steps.forEach((step, index) => step.classList.toggle('is-reached', index <= next));
  };
  media.add('(prefers-reduced-motion: no-preference)', () => {
    pipeline.classList.add('pipeline-animated');
    const state = { progress: 0 };
    paint(0);
    mark(0);
    const animation = gsap.to(state, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: pipeline,
        start: 'top 78%',
        end: 'bottom 42%',
        scrub: 0.35,
        invalidateOnRefresh: true,
      },
      onUpdate() {
        paint(state.progress);
        mark(state.progress);
      },
    });
    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
      pipeline.classList.remove('pipeline-animated');
      pipeline.style.removeProperty('--pipeline-progress');
      routes.forEach(({ packet }) => { packet.style.visibility = 'hidden'; });
      steps.forEach(step => step.classList.remove('is-reached'));
      active = -1;
    };
  });
  // Work cards and web fonts can change the section's position after the initial render.
  const observer = new ResizeObserver(() => ScrollTrigger.refresh());
  observer.observe(document.querySelector('main') || pipeline);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    observer.disconnect();
    media.revert();
  });
})();
