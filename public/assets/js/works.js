(() => {
  'use strict';
  const groups = [...document.querySelectorAll('[data-work-kind]')].filter(group=>group.querySelector('[data-works-list]'));
  if (!groups.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const node = (tag, cls, text) => { const el = document.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };
  const icon = name => { const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.classList.add('icon'); svg.setAttribute('aria-hidden','true'); const use = document.createElementNS(svg.namespaceURI,'use'); use.setAttribute('href',`/assets/icons/lucide.svg#${name}`); svg.append(use); return svg; };
  const safeURL = value => { if(typeof value!=='string'||!value.trim())return '';try { const u = new URL(value, location.origin); return (u.protocol === 'https:' || u.origin === location.origin) && !u.username && !u.password ? u.href : ''; } catch { return ''; } };
  const instagram = value => { try { const u = new URL(value); const match = u.pathname.match(/^\/(p|reel|tv)\/([\w-]+)\/?$/); return u.protocol === 'https:' && ['instagram.com','www.instagram.com'].includes(u.hostname) && !u.port && !u.username && !u.password && match ? `https://www.instagram.com/${match[1]}/${match[2]}/` : ''; } catch { return ''; } };
  const shell = document.querySelector('.showcase');
  let currentTrigger;
  let imageItems = [], imageIndex = 0;
  const modal = node('dialog','work-dialog'); modal.setAttribute('aria-labelledby','work-dialog-title');
  const top = node('div','dialog-top'); const title = node('h2','',''); title.id='work-dialog-title';
  const close = node('button','button button-outline','Close'); close.type='button'; close.append(icon('x')); top.append(title,close);
  const body = node('div','work-dialog-body'); const bottom = node('div','work-dialog-bottom'); modal.append(top,body,bottom); shell.append(modal);
  close.addEventListener('click',()=>modal.close());
  modal.addEventListener('close',()=>{body.replaceChildren();bottom.replaceChildren();currentTrigger?.focus({preventScroll:true});});
  modal.addEventListener('click',e=>{if(e.target!==modal)return;const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();});
  const image = (src, alt, cls='') => { const img=node('img',cls); img.alt=alt; img.loading='lazy'; img.decoding='async'; img.addEventListener('error',()=>{img.hidden=true;const parent=img.parentElement;if(parent&&!parent.querySelector('.work-image-error'))parent.append(node('span','work-image-error','Image unavailable'));},{once:true}); img.src=safeURL(src);return img; };
  function openDialog(trigger, heading) { currentTrigger=trigger;title.textContent=heading;body.replaceChildren();bottom.replaceChildren();if(!modal.open)modal.showModal(); }
  function showDesign(index) {
    const focusedControl = bottom.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : '';
    imageIndex=(index+imageItems.length)%imageItems.length; const item=imageItems[imageIndex];
    title.textContent=item.title;body.replaceChildren(image(item.image,item.imageAlt||item.title));bottom.replaceChildren();
    const caption=node('p','',`${imageIndex+1} / ${imageItems.length}${item.demo?' · Data contoh':''}`);caption.setAttribute('aria-live','polite');
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
      const video=node('video','portfolio-video-player');video.src=file;video.poster=safeURL(item.image);video.controls=true;video.autoplay=true;video.muted=true;video.playsInline=true;video.loop=true;body.append(video);video.play().catch(()=>{});return;
    }
    const url=instagram(item.url);
    if (!url||/\/DEMO_VIDEO_\d+\//.test(url)) {
      body.append(image(item.image,item.imageAlt||item.title),node('p','demo-explanation','Ini preview data contoh. Ganti dengan link Instagram melalui menu Works di admin untuk menampilkan video.'));
      return;
    }
    const frame=node('iframe','instagram-player');frame.title=`Instagram video: ${item.title}`;frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.src=`${url}embed/`;
    body.append(frame);
    const hint=node('p','','Jika video belum berputar, tekan Play pada player Instagram.');
    const fallback=node('a','text-link','Open on Instagram');fallback.href=url;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.append(icon('external-link'));bottom.append(hint,fallback);
  }
  const artworkText={listing:['Find your','next shortlist.'],meta:['Report once.','Learn more.'],mbg:['Make progress','visible.'],hub:['One hub.','Less busywork.'],schedule:['Request.','Schedule. Take.'],sample:['Your next','website.']};
  function card(item, siblings, headingTag) {
    const card=node('article',`work-card work-card-${item.kind}`);
    const href=safeURL(item.url); const media=node(item.kind==='webapp'&&href?'a':'button',`work-media work-art-${item.artwork||'sample'}`);
    if(media.tagName==='A'){media.href=href;if(!href.startsWith(location.origin+'/')){media.target='_blank';media.rel='noopener noreferrer';}}
    else media.type='button';
    media.setAttribute('aria-label',`${item.kind==='design'?'Enlarge':item.kind==='video'?'Watch':item.demo?'Preview':'View'}: ${item.title}`);
    if(item.image) media.append(image(item.image,item.imageAlt||item.title));
    else if(item.artwork==='listing')media.append(image('/assets/work/listing-hub.jpg',item.title,'work-app-capture'));
    else {const art=node('span','work-type-art');for(const line of artworkText[item.artwork]||[item.title])art.append(node('span','',line));media.append(art);}
    if(item.kind==='video'){
      const overlay=node('span','video-bottom');const play=node('span','video-play','Watch video');play.prepend(icon('play'));overlay.append(play,node('strong','',item.title));media.append(overlay);
      media.addEventListener('click',()=>openVideo(item,media));
    } else if(item.kind==='design'){
      const enlarge=node('span','work-enlarge','Enlarge');enlarge.prepend(icon('maximize-2'));media.append(enlarge);
      media.addEventListener('click',()=>{imageItems=siblings;openDialog(media,item.title);modal.dataset.mode='design';showDesign(siblings.indexOf(item));});
    } else if(!href) media.addEventListener('click',()=>{openDialog(media,item.title);modal.dataset.mode='sample';body.append(node('p','demo-explanation','Contoh slot Website / Apps. Ganti kontennya dan tambahkan tujuan link melalui menu Works di admin.'));});
    card.append(media);
    if(item.kind!=='video'){card.append(node(headingTag,'work-card-title',item.title));if(item.kind==='webapp')card.append(node('p','work-card-description',item.description));}
    const meta=node('div','work-card-meta');
    if(item.demo)meta.append(node('span','sample-label','Data contoh'));
    if(item.kind==='webapp'){
      const action=node(href?'a':'button','text-link work-destination',item.demo?'Preview':item.url.startsWith('/work/')?'View case study':'Open app');
      if(href){action.href=href;if(!href.startsWith(location.origin+'/')){action.target='_blank';action.rel='noopener noreferrer';action.append(icon('external-link'));}}
      else {action.type='button';action.addEventListener('click',()=>{openDialog(action,item.title);modal.dataset.mode='sample';body.append(node('p','demo-explanation','Contoh slot Website / Apps. Ganti kontennya dan tambahkan tujuan link melalui menu Works di admin.'));});}
      meta.append(action);
    }
    if(meta.childElementCount)card.append(meta);
    return card;
  }
  const carousels=[];
  function setupCarousel(group) {
    const list=group.querySelector('[data-works-list]'), controls=group.querySelector('.carousel-controls');
    if(!controls)return;
    let paused=reduced.matches, hover=false, focus=false, visible=false;
    const toggle=controls.querySelector('[data-carousel-toggle]');const position=controls.querySelector('.carousel-position');
    if(!toggle||!position)return;
    const automatic=['design','video'].includes(group.dataset.workKind);toggle.hidden=!automatic;
    list.tabIndex=0;list.setAttribute('aria-label',`${group.querySelector('h3')?.textContent||'Works'} carousel`);
    const update=()=>{const overflow=list.scrollWidth>list.clientWidth+4;controls.hidden=!overflow;const children=[...list.children];const left=list.getBoundingClientRect().left;let index=0,min=Infinity;children.forEach((child,i)=>{const distance=Math.abs(child.getBoundingClientRect().left-left);if(distance<min){min=distance;index=i;}});position.textContent=`${index+1} / ${children.length}`;const label=paused?'Resume slides':'Pause slides';toggle.replaceChildren(icon(paused?'play':'pause'));toggle.setAttribute('aria-label',label);toggle.title=label;toggle.setAttribute('aria-pressed',String(paused));};
    const move=direction=>{const step=(list.children[0]?.getBoundingClientRect().width||list.clientWidth)+24;const max=list.scrollWidth-list.clientWidth;const next=direction>0?(list.scrollLeft>=max-4?0:Math.min(max,list.scrollLeft+step)):(list.scrollLeft<=4?max:Math.max(0,list.scrollLeft-step));list.scrollTo({left:next,behavior:reduced.matches?'instant':'smooth'});};
    controls.querySelector('[data-carousel-prev]')?.addEventListener('click',()=>move(-1));controls.querySelector('[data-carousel-next]')?.addEventListener('click',()=>move(1));toggle.addEventListener('click',()=>{paused=!paused;update();});
    group.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hover=true;});group.addEventListener('pointerleave',()=>hover=false);
    group.addEventListener('focusin',()=>focus=true);group.addEventListener('focusout',e=>{focus=group.contains(e.relatedTarget);});
    list.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){paused=true;update();}});
    list.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});
    list.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(list);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:.3}).observe(list);
    reduced.addEventListener('change',()=>{paused=reduced.matches;update();});
    carousels.push(()=>{if(automatic&&!paused&&!hover&&!focus&&visible&&!document.hidden&&!document.querySelector('dialog[open]')&&list.scrollWidth>list.clientWidth+4)move(1);});
    group._updateCarousel=update;update();
  }
  groups.filter(g=>g.dataset.carousel).forEach(setupCarousel);
  setInterval(()=>carousels.forEach(tick=>tick()),5000);
  let loading=false;
  async function load() {
    if(loading)return;loading=true;const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
    groups.forEach(group=>{group.querySelector('[data-works-list]').setAttribute('aria-busy','true');group.querySelectorAll('.works-recovery').forEach(node=>node.hidden=true);group.querySelectorAll('[data-retry-works]').forEach(node=>node.disabled=true);});
    try {
      const res=await fetch(document.body.dataset.cmsPreview?'/api/admin/works-preview':'/api/works',{signal:controller.signal,cache:'no-store'});if(!res.ok)throw Error('load');const data=await res.json();if(!Array.isArray(data.items))throw Error('data');
      groups.forEach(group=>{const list=group.querySelector('[data-works-list]');let items=data.items.filter(item=>item.kind===group.dataset.workKind&&item.published);if(group.dataset.workKind==='webapp'&&!group.dataset.collection)items=items.slice(0,6);
        list.replaceChildren(...items.map(item=>card(item,items,group.dataset.collection?'h2':'h4')));if(!items.length)list.append(node('p','works-message','Belum ada karya di koleksi ini.'));list.scrollLeft=0;group._updateCarousel?.();
      });
    } catch {groups.forEach(group=>{const list=group.querySelector('[data-works-list]');if(!list.querySelector('.work-card'))list.replaceChildren();group.querySelectorAll('.works-recovery').forEach(node=>node.hidden=false);});}
    finally{clearTimeout(timeout);loading=false;groups.forEach(group=>{group.querySelector('[data-works-list]').setAttribute('aria-busy','false');group.querySelectorAll('[data-retry-works]').forEach(node=>node.disabled=false);});}
  }
  groups.forEach(group=>group.querySelector('[data-retry-works]')?.addEventListener('click',load));
  load();
})();
