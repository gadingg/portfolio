(() => {
  'use strict';
  const groups = [...document.querySelectorAll('[data-work-kind]')].filter(group=>group.querySelector('[data-works-list]'));
  if (!groups.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const node = (tag, cls, text) => { const el = document.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };
  const icon = name => { const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.classList.add('icon'); svg.setAttribute('aria-hidden','true'); const use = document.createElementNS(svg.namespaceURI,'use'); use.setAttribute('href',`/assets/icons/lucide.svg#${name}`); svg.append(use); return svg; };
  const summary = text => { const value=(text||'').trim();return value.match(/^.*?[.!?](?=\s|$)/)?.[0]||value; };
  const safeURL = value => { if(typeof value!=='string'||!value.trim())return '';try { const u = new URL(value, location.origin); return (u.protocol === 'https:' || u.origin === location.origin) && !u.username && !u.password ? u.href : ''; } catch { return ''; } };
  const instagram = value => { try { const u = new URL(value); const match = u.pathname.match(/^\/(p|reel|tv)\/([\w-]+)\/?$/); return u.protocol === 'https:' && ['instagram.com','www.instagram.com'].includes(u.hostname) && !u.port && !u.username && !u.password && match ? `https://www.instagram.com/${match[1]}/${match[2]}/` : ''; } catch { return ''; } };
  const shell = document.querySelector('.showcase');
  let currentTrigger;
  let imageItems = [], imageIndex = 0;
  const videoPreviews = new Map();
  let activePreview;
  function syncVideoPreviews() {
    const eligible=!reduced.matches&&!document.hidden&&!modal.open;
    const candidates=[...videoPreviews.entries()].filter(([video,state])=>video.isConnected&&state.ratio>=.6);
    candidates.sort((a,b)=>b[1].ratio-a[1].ratio);
    const next=eligible?candidates[0]?.[0]:null;
    if(activePreview&&activePreview!==next)activePreview.pause();
    activePreview=next;
    if(!next)return;
    if(!next.src)next.src=next.dataset.src;
    if(next.paused)next.play().catch(()=>{next.classList.remove('is-playing');});
  }
  const videoObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{const state=videoPreviews.get(entry.target);if(state)state.ratio=entry.isIntersecting?entry.intersectionRatio:0;});
    syncVideoPreviews();
  },{threshold:[0,.6,.85,1]});
  document.addEventListener('visibilitychange',syncVideoPreviews);
  reduced.addEventListener('change',syncVideoPreviews);
  const modal = node('dialog','work-dialog'); modal.setAttribute('aria-labelledby','work-dialog-title');
  const top = node('div','dialog-top'); const title = node('h2','',''); title.id='work-dialog-title';
  const close = node('button','button button-outline','Close'); close.type='button'; close.append(icon('x')); top.append(title,close);
  const body = node('div','work-dialog-body'); const bottom = node('div','work-dialog-bottom'); modal.append(top,body,bottom); shell.append(modal);
  close.addEventListener('click',()=>modal.close());
  modal.addEventListener('close',()=>{body.querySelectorAll('video').forEach(video=>video.pause());body.replaceChildren();bottom.replaceChildren();currentTrigger?.focus({preventScroll:true});syncVideoPreviews();});
  modal.addEventListener('click',e=>{if(e.target!==modal)return;const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();});
  const image = (src, alt, cls='') => { const img=node('img',cls); img.alt=alt; img.loading='lazy'; img.decoding='async'; img.addEventListener('error',()=>{img.hidden=true;const parent=img.parentElement;if(parent&&!parent.querySelector('.work-image-error'))parent.append(node('span','work-image-error','Image unavailable'));},{once:true}); img.src=safeURL(src);return img; };
  function openDialog(trigger, heading) { currentTrigger=trigger;title.textContent=heading;body.replaceChildren();bottom.replaceChildren();if(!modal.open)modal.showModal();syncVideoPreviews(); }
  function showDesign(index) {
    const focusedControl = bottom.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : '';
    imageIndex=(index+imageItems.length)%imageItems.length; const item=imageItems[imageIndex];
    title.textContent=item.title;body.replaceChildren(image(item.image,item.imageAlt||item.title));bottom.replaceChildren();
    const caption=node('p','',`${imageIndex+1} / ${imageItems.length}`);caption.setAttribute('aria-live','polite');
    const controls=node('div','actions');
    for(const [label,delta,symbol] of [['Previous image',-1,'chevron-left'],['Next image',1,'chevron-right']]) { const button=node('button','button button-outline');button.type='button';button.setAttribute('aria-label',label);button.append(icon(symbol));button.disabled=imageItems.length<2;button.addEventListener('click',()=>showDesign(imageIndex+delta));controls.append(button); }
    bottom.append(caption,controls);
    if(focusedControl) [...controls.children].find(button=>button.getAttribute('aria-label')===focusedControl)?.focus();
  }
  modal.addEventListener('keydown',e=>{if(modal.dataset.mode==='design'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();showDesign(imageIndex+(e.key==='ArrowLeft'?-1:1));}});
  function openVideo(item, trigger) {
    openDialog(trigger,item.title);modal.dataset.mode='video';
    const file=safeURL(item.videoFile);
    if(file&&/\.(mp4|webm)(?:[?#].*)?$/i.test(file)){
      const video=node('video','portfolio-video-player');video.src=file;video.poster=safeURL(item.image);video.controls=true;video.autoplay=true;video.muted=true;video.playsInline=true;video.preload='metadata';body.append(video);
      const status=node('p','','');status.setAttribute('role','status');bottom.append(status);
      video.addEventListener('error',()=>{status.textContent='Video belum bisa diputar. Tutup lalu buka kembali untuk mencoba lagi.';});
      video.play().catch(()=>{status.textContent='Tekan Play untuk memutar video.';});
      const original=instagram(item.url);if(original){const link=node('a','text-link','Open on Instagram');link.href=original;link.target='_blank';link.rel='noopener noreferrer';bottom.append(link);}return;
    }
    const url=instagram(item.url);
    if (!url||/\/DEMO_VIDEO_\d+\//.test(url)) {
      body.append(image(item.image,item.imageAlt||item.title),node('p','demo-explanation','Video akan tersedia di sini.'));
      return;
    }
    const frame=node('iframe','instagram-player');frame.title=`Instagram video: ${item.title}`;frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.src=`${url}embed/`;
    body.append(frame);
    const hint=node('p','','Jika video belum berputar, tekan Play pada player Instagram.');
    const fallback=node('a','text-link','Open on Instagram');fallback.href=url;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.append(icon('external-link'));bottom.append(hint,fallback);
  }
  const artworkText={listing:['Find your','next shortlist.'],meta:['Report once.','Learn more.'],mbg:['Make progress','visible.'],hub:['One hub.','Less busywork.'],schedule:['Request.','Schedule. Take.'],sample:['Your next','website.']};
  function card(item, siblings, headingTag, showcase = false) {
    const card=node('article',`work-card work-card-${item.kind}`);
    const app=item.kind==='webapp',href=safeURL(item.caseStudy?`/work/${item.caseStudy.slug}`:item.url);
    const destination=item.demo?'Preview':item.caseStudy||item.url.startsWith('/work/')?'View case study':'Open app';
    const unit=app?node(href?'a':'button','work-card-link'):card;
    const media=node(app?'span':'button',`work-media work-art-${item.artwork||'sample'}`);
    const track=element=>{element.dataset.workId=item.id;element.dataset.demo=String(item.demo);element.dataset.engagement=item.kind==='design'?'design_open':item.kind==='video'?'video_open':item.caseStudy?'work_open':'app_click';};track(app?unit:media);
    if(app){
      unit.setAttribute('aria-label',`${destination}: ${item.title}`);
      if(href){unit.href=href;if(!href.startsWith(location.origin+'/')){unit.target='_blank';unit.rel='noopener noreferrer';}}
      else {unit.type='button';unit.addEventListener('click',()=>{openDialog(unit,item.title);modal.dataset.mode='sample';body.append(node('p','demo-explanation','Detail project akan tersedia di sini.'));});}
    } else {media.type='button';media.setAttribute('aria-label',`${item.kind==='design'?'Enlarge':item.demo?'Preview':'Watch'}: ${item.title}`);}
    if(item.image) media.append(image(item.image,item.imageAlt||item.title));
    else if(item.artwork==='listing')media.append(image('/assets/work/listing-hub.jpg',item.title,'work-app-capture'));
    else {const art=node('span','work-type-art');for(const line of artworkText[item.artwork]||[item.title])art.append(node('span','',line));media.append(art);}
    if(item.kind==='video'){
      const file=safeURL(item.videoFile);
      if(file&&/\.(mp4|webm)(?:[?#].*)?$/i.test(file)){
        const preview=node('video','work-video-preview');preview.dataset.src=file;preview.poster=safeURL(item.image);preview.muted=true;preview.defaultMuted=true;preview.playsInline=true;preview.loop=true;preview.preload='none';preview.setAttribute('aria-hidden','true');
        preview.addEventListener('playing',()=>preview.classList.add('is-playing'));
        preview.addEventListener('pause',()=>preview.classList.remove('is-playing'));
        preview.addEventListener('error',()=>preview.classList.remove('is-playing'));
        media.append(preview);videoPreviews.set(preview,{ratio:0});videoObserver.observe(preview);
      }
      const overlay=node('span','video-bottom');const play=node('span','video-play',item.demo?'Preview':'Watch video');play.prepend(icon('play'));overlay.append(play,node('strong','',item.title));media.append(overlay);
      media.addEventListener('click',()=>openVideo(item,media));
    } else if(item.kind==='design'){
      media.addEventListener('click',()=>{imageItems=siblings;openDialog(media,item.title);modal.dataset.mode='design';showDesign(siblings.indexOf(item));});
    }
    unit.append(media);
    if(item.kind!=='video'){
      const heading=node(app&&!href?'span':headingTag,'work-card-title');
      if(app&&!href){heading.setAttribute('role','heading');heading.setAttribute('aria-level',headingTag.slice(1));}
      if(item.kind==='design'&&href){const details=node('a','design-title-link',item.title);details.href=href;if(!href.startsWith(location.origin+'/')){details.target='_blank';details.rel='noopener noreferrer';}details.append(icon('arrow-up-right'));heading.append(details);}else heading.textContent=item.title;
      if(item.kind==='design'&&showcase){
        const caption=node('div','video-bottom design-showcase-caption');
        caption.append(heading,node('p','work-category','Visual Design'));unit.append(caption);
      }else{
        unit.append(heading);
        if(app)unit.append(node(href?'p':'span','work-card-description',summary(item.description)));
        if(item.kind==='design')unit.append(node('p','work-category','Visual Design'));
      }
    }
    const meta=node(app&&!href?'span':'div','work-card-meta');

    if(item.kind==='webapp'){
      const action=node('span','work-destination',destination);
      action.append(icon(href&&!href.startsWith(location.origin+'/')?'external-link':'arrow-right'));
      meta.append(action);
    }
    if(meta.childElementCount)unit.append(meta);
    if(app)card.append(unit);
    return card;
  }
  function setupEditorialGallery(group) {
    const list=group.querySelector('[data-works-list]');
    list.tabIndex=0;list.setAttribute('role','region');
    list.setAttribute('aria-label','Visual Design gallery');
    group._editorialGallery=true;
    let drag=null,suppressClick=false,resetClick;
    const finish=()=>{
      if(!drag)return;
      const {id,moved}=drag;drag=null;
      list.classList.remove('is-dragging');
      if(list.hasPointerCapture(id))list.releasePointerCapture(id);
      if(moved){suppressClick=true;clearTimeout(resetClick);resetClick=setTimeout(()=>{suppressClick=false;},250);}
    };
    list.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='mouse'||event.button!==0)return;
      suppressClick=false;clearTimeout(resetClick);
      drag={id:event.pointerId,x:event.clientX,left:list.scrollLeft,moved:false};
    });
    list.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.id)return;
      if(!event.buttons){finish();return;}
      const delta=event.clientX-drag.x;
      if(!drag.moved&&Math.abs(delta)<6)return;
      if(!drag.moved){drag.moved=true;list.setPointerCapture(drag.id);list.classList.add('is-dragging');}
      event.preventDefault();list.scrollLeft=drag.left-delta;
    });
    list.addEventListener('pointerup',finish);
    list.addEventListener('pointercancel',finish);
    list.addEventListener('lostpointercapture',finish);
    list.addEventListener('pointerleave',()=>{if(drag&&!drag.moved)finish();});
    list.addEventListener('dragstart',event=>event.preventDefault());
    window.addEventListener('click',event=>{if(suppressClick&&list.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
    list.addEventListener('keydown',event=>{
      if(event.target!==list||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const cards=[...list.querySelectorAll('.work-card')];
      const offsets=cards.map(card=>card.getBoundingClientRect().left-list.getBoundingClientRect().left+list.scrollLeft);
      const left=event.key==='Home'?0:event.key==='End'?list.scrollWidth-list.clientWidth:event.key==='ArrowRight'?offsets.find(offset=>offset>list.scrollLeft+4)??list.scrollWidth-list.clientWidth:[...offsets].reverse().find(offset=>offset<list.scrollLeft-4)??0;
      list.scrollTo({left,behavior:reduced.matches?'instant':'smooth'});
    });
  }
  groups.filter(group=>group.querySelector('.editorial-gallery')).forEach(setupEditorialGallery);
  function setupCarousel(group) {
    const list=group.querySelector('[data-works-list]'), controls=group.querySelector('.carousel-controls');
    if(!controls)return;
    let paused=reduced.matches, hover=false, focus=false, visible=false;
    const toggle=controls.querySelector('[data-carousel-toggle]');const position=controls.querySelector('.carousel-position');
    if(!toggle||!position)return;
    const automatic=['design','video'].includes(group.dataset.workKind);toggle.hidden=!automatic;
    list.tabIndex=0;list.setAttribute('aria-label',`${group.querySelector('h3')?.textContent||'Works'} carousel`);
    const update=()=>{const overflow=list.scrollWidth>list.clientWidth+4;controls.hidden=!overflow;const children=[...list.children];const left=list.getBoundingClientRect().left;let index=0,min=Infinity;children.forEach((child,i)=>{const distance=Math.abs(child.getBoundingClientRect().left-left);if(distance<min){min=distance;index=i;}});position.textContent=`${index+1} / ${children.length}`;const label=paused?'Resume slides':'Pause slides';toggle.replaceChildren(icon(paused?'play':'pause'));toggle.setAttribute('aria-label',label);toggle.title=label;toggle.setAttribute('aria-pressed',String(paused));};
    const move=direction=>{const step=(list.children[1]?.getBoundingClientRect().left-list.children[0]?.getBoundingClientRect().left)||(list.children[0]?.getBoundingClientRect().width||list.clientWidth)+16;const max=list.scrollWidth-list.clientWidth;const next=direction>0?(list.scrollLeft>=max-4?0:Math.min(max,list.scrollLeft+step)):(list.scrollLeft<=4?max:Math.max(0,list.scrollLeft-step));list.scrollTo({left:next,behavior:reduced.matches?'instant':'smooth'});};
    const tick=()=>{if(automatic&&!paused&&!hover&&!focus&&visible&&!document.hidden&&!document.querySelector('dialog[open]')&&list.scrollWidth>list.clientWidth+4)move(1);};
    let timer;
    const restart=()=>{clearInterval(timer);timer=setInterval(tick,3000);};
    controls.querySelector('[data-carousel-prev]')?.addEventListener('click',()=>{move(-1);restart();});controls.querySelector('[data-carousel-next]')?.addEventListener('click',()=>{move(1);restart();});toggle.addEventListener('click',()=>{paused=!paused;if(!paused){hover=false;focus=false;}restart();update();});
    list.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hover=true;});list.addEventListener('pointerleave',()=>{hover=false;restart();});
    list.addEventListener('focusin',()=>focus=true);list.addEventListener('focusout',e=>{focus=list.contains(e.relatedTarget);if(!focus)restart();});
    list.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){paused=true;update();}});
    if(!group._editorialGallery)list.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});
    list.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(list);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)restart();},{threshold:.3}).observe(list);
    reduced.addEventListener('change',()=>{paused=reduced.matches;update();});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)restart();});
    group._updateCarousel=update;update();restart();
  }
  groups.filter(g=>g.dataset.carousel).forEach(setupCarousel);
  let loading=false;
  function renderItems(data) {
      groups.forEach(group=>{group.querySelectorAll('.works-recovery').forEach(node=>node.hidden=true);const list=group.querySelector('[data-works-list]');let items=data.items.filter(item=>item.kind===group.dataset.workKind&&item.published);if(group.dataset.workKind==='webapp'&&!group.dataset.collection)items=items.slice(0,6);
        list.querySelectorAll('.work-video-preview').forEach(video=>{video.pause();videoObserver.unobserve(video);videoPreviews.delete(video);});
        list.replaceChildren(...items.map(item=>card(item,items,group.dataset.collection?'h2':'h4',!!group.querySelector('.editorial-gallery'))));if(!items.length)list.append(node('p','works-message','Belum ada portfolio di koleksi ini.'));list.scrollLeft=0;list.setAttribute('aria-busy','false');group._updateCarousel?.();
      });
      document.dispatchEvent(new Event('portfolio:works-ready'));
  }
  async function load() {
    if(loading)return;loading=true;const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
    groups.forEach(group=>{const list=group.querySelector('[data-works-list]');list.setAttribute('aria-busy','true');if(!list.childElementCount){for(let i=0;i<3;i++){const skeleton=node('div','work-card work-loading-skeleton');skeleton.setAttribute('aria-hidden','true');list.append(skeleton);}}group.querySelectorAll('.works-recovery').forEach(node=>node.hidden=true);group.querySelectorAll('[data-retry-works]').forEach(node=>node.disabled=true);});
    try {
      const res=await fetch(document.body.dataset.cmsPreview?'/api/admin/works-preview':'/api/works',{signal:controller.signal,cache:'no-store'});if(!res.ok)throw Error('load');const data=await res.json();if(!Array.isArray(data.items))throw Error('data');
      renderItems(data);
    } catch {groups.forEach(group=>{const list=group.querySelector('[data-works-list]');if(!list.querySelector('.work-card'))list.replaceChildren();group.querySelectorAll('.works-recovery').forEach(node=>node.hidden=false);});}
    finally{clearTimeout(timeout);loading=false;groups.forEach(group=>{group.querySelector('[data-works-list]').setAttribute('aria-busy','false');group.querySelectorAll('[data-retry-works]').forEach(node=>node.disabled=false);});}
  }
  groups.forEach(group=>group.querySelector('[data-retry-works]')?.addEventListener('click',load));
  const initial=document.getElementById('initial-works');
  try {const data=initial?JSON.parse(initial.textContent):null;if(!data||!Array.isArray(data.items)||document.body.dataset.cmsPreview)load();else renderItems(data);} catch {load();}
})();
