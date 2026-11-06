(() => {
  'use strict';

  const header = document.querySelector('.portfolio-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('pageshow', updateHeader);

  const navigationGroups=[
    [...document.querySelectorAll('.desktop-nav a[href^="#"],.header-contact[href^="#"]')],
    [...document.querySelectorAll('.menu-dialog nav a[href^="#"]')]
  ];
  let frame;
  function updateActive(){
    const threshold=(header?.getBoundingClientRect().height||72)+window.innerHeight*.25;
    navigationGroups.forEach(navigation=>{
      const sections=[...new Set(navigation.map(link=>document.getElementById(link.hash.slice(1))).filter(Boolean))];
      const current=sections.filter(section=>section.getBoundingClientRect().top<=threshold).sort((a,b)=>b.getBoundingClientRect().top-a.getBoundingClientRect().top)[0];
      navigation.forEach(link=>{
        const active=!!current&&link.hash===`#${current.id}`;
        if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
      });
    });
    frame=null;
  }
  const scheduleActive=()=>{if(!frame)frame=requestAnimationFrame(updateActive);};
  window.addEventListener('scroll',scheduleActive,{passive:true});
  window.addEventListener('resize',scheduleActive,{passive:true});
  window.addEventListener('hashchange',scheduleActive);
  window.addEventListener('pageshow',scheduleActive);
  document.addEventListener('portfolio:works-ready',scheduleActive);
  updateActive();

  const svgNS = 'http://www.w3.org/2000/svg';
  const icon = (name) => {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(svgNS, 'use');
    use.setAttribute('href', `/assets/icons/lucide.svg#${name}`);
    svg.append(use);
    return svg;
  };
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };
  function protectImage(image) {
    image.addEventListener('error', () => {
      const frame = image.parentElement;
      if (!frame || frame.classList.contains('media-error')) return;
      frame.classList.add('media-error');
      frame.append(icon('image-off'), element('p', '', 'Gambar belum bisa dimuat.'));
    }, { once: true });
    if (image.complete && !image.naturalWidth) image.dispatchEvent(new Event('error'));
  }

  const menu = document.querySelector('#mobile-menu');
  const menuToggle = document.querySelector('#menu-toggle');
  menuToggle?.addEventListener('click', () => {
    if(!menu)return;
    menu.showModal();
    menuToggle.setAttribute('aria-expanded', 'true');
  });
  menu?.addEventListener('close', () => menuToggle?.setAttribute('aria-expanded', 'false'));
  menu?.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.close();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    });
  });
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  matchMedia('(min-width:960px)').addEventListener('change', (event) => {
    if (event.matches && menu?.open) menu.close();
  });

  document.querySelectorAll('img[src]').forEach(protectImage);
  const copyrightYear=document.querySelector('#copyright-year');
  if(copyrightYear)copyrightYear.textContent = new Date().getFullYear();
})();
