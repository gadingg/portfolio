(() => {
  if (document.body.dataset.cmsPreview || !window.gsap || !window.IntersectionObserver) return;
  const { gsap } = window;
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const observed = new Set(), seen = new WeakSet(), timelines = new Map();
    const context = gsap.context(() => {});
    function playScene(card) {
      if (timelines.get(card)?.isActive()) return;
      timelines.get(card)?.kill();
      context.add(() => {
        const pieces = card.querySelectorAll('.scene-tile,.mini-browser,.brand-palette i,.browser-wireframe i,.browser-front>.icon,.browser-progress,.ai-packet,.about-heading h2,.about-action-line,.about-work-poster,.about-work-app');
        if (pieces.length) gsap.set(pieces, {clearProps:'transform,opacity,visibility'});
        const tl=gsap.timeline({defaults:{duration:.7,ease:'power3.out'},onComplete:()=>{if(pieces.length)gsap.set(pieces,{clearProps:'transform,opacity,visibility'});}});
        timelines.set(card,tl);
        const from=(selector,vars,at)=>{const target=card.querySelectorAll(selector);if(target.length)tl.from(target,vars,at);};
        const to=(selector,vars,at)=>{const target=card.querySelectorAll(selector);if(target.length)tl.to(target,vars,at);};
        if(card.matches('.about-layout')){
          from('.about-heading h2',{y:24,opacity:.6,duration:.85},0);
          from('.about-action-line',{x:22,opacity:.45,duration:.7,stagger:.12},.2);
          from('.about-work-poster',{y:36,rotation:'-=5',opacity:.4,duration:1},.1);
          from('.about-work-app',{x:40,y:26,rotation:'+=5',opacity:.4,duration:1},.35);
        }else if(card.matches('.capability-strategy')){
          from('.strategy-idea',{x:-28,y:20,rotation:'-=12',opacity:.4},0);
          from('.strategy-cursor',{x:40,y:30,rotation:'+=10',opacity:.4},.2);
          to('.strategy-cursor',{x:-30,y:-12,duration:.35},.95);
          from('.strategy-main',{scale:.78,rotation:'-=10',opacity:.5,duration:.8},.65);
          to('.strategy-cursor',{scale:.85,duration:.14,repeat:1,yoyo:true},1.2);
          to('.strategy-cursor',{x:0,y:0,duration:.3},1.5);
        }else if(card.matches('.capability-brand')){
          from('.brand-type',{x:-32,rotation:'-=12',opacity:.4},0);
          from('.brand-palette',{y:-28,rotation:'+=14',opacity:.4},.15);
          from('.brand-palette i',{scale:.35,opacity:.35,duration:.55,stagger:.1},.45);
          from('.brand-layers',{x:34,y:18,rotation:'+=12',opacity:.4,duration:.8},.5);
          to('.brand-layers',{y:-10,duration:.22,repeat:1,yoyo:true},1.3);
        }else if(card.matches('.capability-web')){
          from('.browser-back',{x:-32,y:24,rotation:'-=8',opacity:.4,duration:.9},0);
          from('.browser-wireframe i',{scaleY:.3,transformOrigin:'bottom',opacity:.3,duration:.65,stagger:.12},.25);
          from('.browser-front',{x:36,y:18,rotation:'+=8',opacity:.4,duration:.9},.45);
          from('.browser-progress',{scaleX:0,duration:.85,ease:'power2.inOut'},.65);
          from('.browser-front>.icon',{scale:.65,opacity:.3,duration:.6},1);
        }else if(card.matches('.capability-ai')){
          from('.ai-input',{x:-30,y:16,rotation:'-=12',opacity:.4},0);
          from('.ai-core',{scale:.8,rotation:'+=12',opacity:.4,duration:.85},.35);
          const packet=card.querySelectorAll('.ai-packet');
          if(packet.length)tl.fromTo(packet,{x:-76,opacity:0},{x:76,opacity:1,duration:.8,ease:'power1.inOut'},.5).to(packet,{opacity:0,duration:.15},1.3);
          from('.ai-output',{x:34,y:-20,rotation:'+=12',opacity:.35,duration:.8},.9);
        }
      });
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const card=entry.target,scene=card.matches('.capability-card'),about=card.matches('.about-layout');
        const threshold=scene ? .5 : about ? .35 : .15;
        if(!entry.isIntersecting||entry.intersectionRatio<threshold)return;
        observer.unobserve(card);observed.delete(card);
        if(!card.isConnected||seen.has(card))return;
        seen.add(card);
        if(scene||about)playScene(card);
        else context.add(()=>{
          const caption=card.querySelectorAll('.work-card-title,.work-card-description,.work-card-meta,.work-card-video .video-bottom');
          if(caption.length)gsap.from(caption,{y:6,opacity:.85,duration:.4,stagger:.035,ease:'power2.out',clearProps:'transform,opacity'});
        });
      });
    },{threshold:[.15,.35,.5]});
    const sync=()=>{
      observed.forEach(card=>{if(!card.isConnected){observer.unobserve(card);observed.delete(card);}});
      timelines.forEach((tl,card)=>{if(!card.isConnected){tl.kill();timelines.delete(card);}});
      document.querySelectorAll('#about .about-layout.about-editorial,.capability-card,[data-works-list] .work-card:not(.work-loading-skeleton)').forEach(card=>{
        if(seen.has(card)||observed.has(card))return;observed.add(card);observer.observe(card);
      });
    };
    const replay=event=>{
      if(event.pointerType!=='mouse')return;
      const card=event.target.closest?.('.capability-card');
      if(!card||!seen.has(card)||card.contains(event.relatedTarget))return;
      playScene(card);
    };
    sync();document.addEventListener('portfolio:works-ready',sync);document.addEventListener('pointerover',replay);
    return ()=>{observer.disconnect();observed.clear();timelines.clear();document.removeEventListener('portfolio:works-ready',sync);document.removeEventListener('pointerover',replay);context.revert();};
  });
  window.addEventListener('pagehide',event=>{if(!event.persisted)media.revert();});
})();
