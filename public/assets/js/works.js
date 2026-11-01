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
  const imageRatios = new Map();
  let cancelImage = () => {};
  function releaseVideo() {
    body.querySelectorAll('video').forEach(video=>{video.pause();video.removeAttribute('src');video.querySelectorAll('source').forEach(source=>source.removeAttribute('src'));video.load();});
  }
  const modal = node('dialog','work-dialog'); modal.setAttribute('aria-labelledby','work-dialog-title');
  const top = node('div','dialog-top'); const title = node('h2','',''); title.id='work-dialog-title';
  const close = node('button','button button-outline','Close'); close.type='button'; close.append(icon('x')); top.append(title,close);
  const body = node('div','work-dialog-body'); const bottom = node('div','work-dialog-bottom'); modal.append(top,body,bottom); shell.append(modal);
  close.addEventListener('click',()=>modal.close());
  modal.addEventListener('close',()=>{cancelImage();releaseVideo();body.replaceChildren();bottom.replaceChildren();currentTrigger?.focus({preventScroll:true});});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)body.querySelectorAll('video').forEach(video=>video.pause());});
  window.addEventListener('pagehide',()=>{cancelImage();releaseVideo();if(modal.open)modal.close();});
  modal.addEventListener('click',e=>{if(e.target!==modal)return;const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();});
  const image = (src, alt, cls='', thumbnail=false) => {
    const img=node('img',cls);img.alt=alt;img.loading='lazy';img.decoding='async';
    img.addEventListener('error',()=>{img.hidden=true;const parent=img.parentElement;if(parent&&!parent.querySelector('.work-image-error'))parent.append(node('span','work-image-error','Image unavailable'));},{once:true});
    const original=safeURL(src);
    if(thumbnail && original && !/\.svg(?:[?#]|$)/i.test(original)){
      const privateMedia=src.startsWith('/api/media/');
      const widths=privateMedia?[320,640,960,1280]:[384,640,828,1200];
      const at=width=>privateMedia?`${src}${src.includes('?')?'&':'?'}w=${width}`:`/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
      img.srcset=widths.map(width=>`${at(width)} ${width}w`).join(', ');
      img.sizes='(max-width: 767px) 86vw, (max-width: 1023px) 46vw, 36vw';img.src=at(640);
    }else img.src=original;
    return img;
  };
  function openDialog(trigger, heading) { cancelImage();releaseVideo();currentTrigger=trigger;title.textContent=heading;body.replaceChildren();bottom.replaceChildren();if(!modal.open)modal.showModal(); }
  function setupImageZoom(frame, artwork) {
    const controls=node('div','actions work-image-zoom');controls.setAttribute('role','group');controls.setAttribute('aria-label','Image zoom');
    const out=node('button','button button-outline'),reset=node('button','button button-outline work-zoom-reset','100%'),inside=node('button','button button-outline');
    out.append(icon('zoom-out'));inside.append(icon('zoom-in'));
    for(const [button,label] of [[out,'Zoom out'],[reset,'Reset zoom'],[inside,'Zoom in']]){button.type='button';button.setAttribute('aria-label',label);button.disabled=true;}
    controls.append(out,reset,inside);
    const pointers=new Map(),listeners=[];
    let enabled=false,destroyed=false,scale=1,x=0,y=0,width=1,height=1,rect,gesture;
    artwork.draggable=false;
    const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
    function measure(){rect=frame.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);}
    function render(){
      const maxX=width*(scale-1)/2,maxY=height*(scale-1)/2;
      x=clamp(x,-maxX,maxX);y=clamp(y,-maxY,maxY);
      artwork.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`;
      frame.classList.toggle('is-zoomed',scale>1.001);
      out.disabled=!enabled||scale<=1;inside.disabled=!enabled||scale>=4;reset.disabled=!enabled||scale<=1;
      reset.textContent=`${Math.round(scale*100)}%`;reset.setAttribute('aria-label',`Reset zoom (${Math.round(scale*100)}%)`);
    }
    function zoom(next,point={x:0,y:0}){
      if(!enabled)return;
      next=clamp(next,1,4);const factor=next/scale;
      x=point.x-(point.x-x)*factor;y=point.y-(point.y-y)*factor;scale=next;render();
    }
    const local=event=>({x:event.clientX-rect.left-width/2,y:event.clientY-rect.top-height/2});
    function begin(){
      const points=[...pointers.values()];
      gesture={scale,x,y,points};
      if(points.length===2){gesture.distance=Math.max(1,Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y));gesture.center={x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2};}
      frame.classList.toggle('is-dragging',points.length>0&&scale>1);
    }
    function down(event){
      if(!enabled||pointers.size>=2||(event.pointerType==='mouse'&&event.button!==0))return;
      measure();pointers.set(event.pointerId,local(event));frame.setPointerCapture(event.pointerId);begin();
    }
    function move(event){
      if(!enabled||!pointers.has(event.pointerId))return;
      event.preventDefault();pointers.set(event.pointerId,local(event));
      const points=[...pointers.values()];
      if(points.length===2&&gesture.distance){
        const center={x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2};
        scale=clamp(gesture.scale*Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y)/gesture.distance,1,4);
        x=center.x-(gesture.center.x-gesture.x)*(scale/gesture.scale);y=center.y-(gesture.center.y-gesture.y)*(scale/gesture.scale);
      }else if(points.length===1&&scale>1){x=gesture.x+points[0].x-gesture.points[0].x;y=gesture.y+points[0].y-gesture.points[0].y;}
      render();begin();
    }
    function end(event){
      if(!pointers.delete(event.pointerId))return;
      if(frame.hasPointerCapture(event.pointerId))frame.releasePointerCapture(event.pointerId);begin();
    }
    function cancel(){const ids=[...pointers.keys()];pointers.clear();for(const id of ids)if(frame.hasPointerCapture(id))frame.releasePointerCapture(id);begin();}
    function listen(target,name,handler,options){target.addEventListener(name,handler,options);listeners.push(()=>target.removeEventListener(name,handler,options));}
    listen(frame,'pointerdown',down);listen(frame,'pointermove',move,{passive:false});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])listen(frame,name,end);
    listen(window,'blur',cancel);
    listen(frame,'dblclick',event=>{if(enabled){event.preventDefault();measure();zoom(scale>1?1:2,local(event));}});
    listen(frame,'wheel',event=>{if(enabled&&(event.ctrlKey||event.metaKey)){event.preventDefault();measure();zoom(scale*Math.exp(-event.deltaY*.01),local(event));}},{passive:false});
    listen(frame,'keydown',event=>{
      if(!enabled||event.target!==frame||event.ctrlKey||event.metaKey||event.altKey)return;
      if(['+','=','-','0'].includes(event.key)){event.preventDefault();event.stopPropagation();zoom(event.key==='0'?1:scale+(event.key==='-'?-.5:.5));}
      else if(scale>1&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();event.stopPropagation();x+=event.key==='ArrowLeft'?40:event.key==='ArrowRight'?-40:0;y+=event.key==='ArrowUp'?40:event.key==='ArrowDown'?-40:0;render();}
    });
    listen(out,'click',()=>zoom(scale-.5));listen(inside,'click',()=>zoom(scale+.5));listen(reset,'click',()=>zoom(1));
    const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(()=>{if(enabled){measure();render();cancel();}});observer?.observe(frame);
    return {controls,enable(){if(destroyed)return;enabled=true;frame.tabIndex=0;frame.setAttribute('aria-description','Pinch to zoom. Use plus and minus to zoom, zero to reset, and arrow keys to pan.');measure();render();},destroy(){destroyed=true;enabled=false;cancel();observer?.disconnect();listeners.forEach(remove=>remove());}};
  }
  function showDesign(index) {
    if (!imageItems.length) return;
    const focusedControl = bottom.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : '';
    cancelImage();
    imageIndex=(index+imageItems.length)%imageItems.length; const item=imageItems[imageIndex];
    title.textContent=item.title;
    const frame=node('div','work-image-frame'),artwork=node('img','work-preview-image');
    const thumbnail=[...shell.querySelectorAll('[data-work-id]')].find(card=>card.dataset.workId===item.id)?.querySelector('img');
    const knownRatio=imageRatios.get(item.image)||(thumbnail?.naturalWidth&&thumbnail?.naturalHeight?thumbnail.naturalWidth/thumbnail.naturalHeight:0);
    if(knownRatio)frame.style.setProperty('--preview-ratio',String(knownRatio));
    frame.tabIndex=-1;frame.setAttribute('aria-label',item.title);frame.setAttribute('aria-busy','true');
    artwork.alt=item.imageAlt||item.title;artwork.loading='eager';artwork.decoding='async';artwork.fetchPriority='high';
    const feedback=node('div','work-image-feedback'),spinner=icon('refresh-cw'),status=node('span','work-image-status','Loading image…');
    spinner.classList.add('work-image-spinner');status.setAttribute('role','status');feedback.append(spinner,status);
    frame.append(artwork,feedback);body.replaceChildren(frame);bottom.replaceChildren();
    const zoom=setupImageZoom(frame,artwork);
    let active=true,settled=false;
    const timeout=setTimeout(fail,20000);
    function cleanup(){clearTimeout(timeout);artwork.removeEventListener('load',loaded);artwork.removeEventListener('error',fail);}
    function fail(){
      if(!active||settled)return;settled=true;cleanup();
      artwork.removeAttribute('srcset');artwork.removeAttribute('src');
      frame.setAttribute('aria-busy','false');
      const message=node('p','','Image unavailable'),retry=node('button','button button-outline','Try again');
      message.setAttribute('role','alert');retry.type='button';retry.append(icon('refresh-cw'));
      retry.addEventListener('click',()=>{showDesign(imageIndex);body.querySelector('.work-image-frame')?.focus({preventScroll:true});});
      feedback.replaceChildren(message,retry);
    }
    async function loaded(){
      if(!active||settled)return;
      try {if(artwork.decode)await artwork.decode();}catch {fail();return;}
      if(!active||settled)return;
      if(!artwork.naturalWidth||!artwork.naturalHeight){fail();return;}
      const ratio=artwork.naturalWidth/artwork.naturalHeight;
      frame.style.setProperty('--preview-ratio',String(ratio));
      if(imageRatios.size>=32)imageRatios.delete(imageRatios.keys().next().value);
      imageRatios.set(item.image,ratio);
      settled=true;cleanup();frame.classList.add('is-ready');frame.setAttribute('aria-busy','false');feedback.remove();zoom.enable();
    }
    cancelImage=()=>{active=false;cleanup();zoom.destroy();artwork.removeAttribute('srcset');artwork.removeAttribute('src');};
    artwork.addEventListener('load',loaded);artwork.addEventListener('error',fail);
    const original=safeURL(item.image);
    if(original&&!/\.svg(?:[?#]|$)/i.test(original)){
      const privateMedia=item.image.startsWith('/api/media/'),widths=privateMedia?[320,640,960,1280]:[384,640,828,1200,1920];
      const at=width=>privateMedia?`${item.image}${item.image.includes('?')?'&':'?'}w=${width}`:`/_next/image?url=${encodeURIComponent(item.image)}&w=${width}&q=80`;
      artwork.sizes='(max-width: 767px) calc(100vw - 64px), (max-width: 1050px) calc(100vw - 96px), 920px';
      artwork.srcset=widths.map(width=>`${at(width)} ${width}w`).join(', ');artwork.src=at(privateMedia?960:1200);
    }else if(original)artwork.src=original;
    else fail();
    if(artwork.complete&&artwork.naturalWidth)void loaded();
    const caption=node('p','',`${imageIndex+1} / ${imageItems.length}`);caption.setAttribute('aria-live','polite');
    const controls=node('div','actions work-image-navigation');
    for(const [label,delta,symbol] of [['Previous image',-1,'chevron-left'],['Next image',1,'chevron-right']]) { const button=node('button','button button-outline');button.type='button';button.setAttribute('aria-label',label);button.append(icon(symbol));button.disabled=imageItems.length<2;button.addEventListener('click',()=>showDesign(imageIndex+delta));controls.append(button); }
    bottom.append(caption,zoom.controls,controls);
    if(focusedControl) [...controls.children].find(button=>button.getAttribute('aria-label')===focusedControl)?.focus();
  }
  modal.addEventListener('keydown',e=>{if(modal.dataset.mode==='design'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();showDesign(imageIndex+(e.key==='ArrowLeft'?-1:1));}});
  function openVideo(item, trigger) {
    openDialog(trigger,item.title);modal.dataset.mode='video';
    const file=item.videoSource==='instagram'?'':safeURL(item.videoFile);
    if(file&&/\.(mp4|webm)(?:[?#].*)?$/i.test(file)){
      const video=node('video','portfolio-video-player');video.src=file;video.poster=safeURL(item.image);video.controls=true;video.autoplay=true;video.playsInline=true;video.preload='none';body.append(video);
      const status=node('p','','Loading video…');status.setAttribute('role','status');bottom.append(status);
      video.addEventListener('playing',()=>{status.textContent='';});
      video.addEventListener('waiting',()=>{status.textContent='Loading video…';});
      video.addEventListener('error',()=>{status.textContent='The video could not be played. Close it and try again.';});
      video.play().catch(()=>{status.textContent='Press Play to watch.';});
      const original=instagram(item.url);if(original){const link=node('a','button button-outline','View on Instagram');link.href=original;link.target='_blank';link.rel='noopener noreferrer';bottom.append(link);}return;
    }
    const url=instagram(item.url);
    if (!url||/\/DEMO_VIDEO_\d+\//.test(url)) {
      body.append(image(item.image,item.imageAlt||item.title),node('p','demo-explanation','Video akan tersedia di sini.'));
      return;
    }
    body.append(image(item.image,item.imageAlt||item.title));
    const hint=node('p','','Watch this video on Instagram.');
    const fallback=node('a','button button-outline','View on Instagram');fallback.href=url;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.append(icon('external-link'));bottom.append(hint,fallback);
  }
  function videoAction(item) {
    const file=item.videoSource==='instagram'?'':safeURL(item.videoFile);
    if(file&&/\.(mp4|webm)(?:[?#].*)?$/i.test(file))return {kind:'file',href:file,label:'Watch video'};
    const original=instagram(item.url);
    if(original&&!/\/DEMO_VIDEO_\d+\//.test(original))return {kind:'instagram',href:original,label:'View on Instagram'};
    return {kind:'preview',href:'',label:'Preview'};
  }
  const artworkText={listing:['Find your','next shortlist.'],meta:['Report once.','Learn more.'],mbg:['Make progress','visible.'],hub:['One hub.','Less busywork.'],schedule:['Request.','Schedule. Take.'],sample:['Your next','website.']};
  function card(item, siblings, headingTag, showcase = false) {
    const card=node('article',`work-card work-card-${item.kind}`);
    const app=item.kind==='webapp',href=safeURL(item.caseStudy?`/work/${item.caseStudy.slug}`:item.url);
    const destination=item.demo?'Preview':item.caseStudy||item.url.startsWith('/work/')?'View case study':'Open app';
    const unit=app?node(href?'a':'button','work-card-link'):card;
    const video=item.kind==='video'?videoAction(item):null;
    const media=node(app?'span':video?.kind==='instagram'?'a':'button',`work-media work-art-${item.artwork||'sample'}`);
    const track=element=>{element.dataset.workId=item.id;element.dataset.demo=String(item.demo);element.dataset.engagement=item.kind==='design'?'design_open':item.kind==='video'?'video_open':item.caseStudy?'work_open':'app_click';};track(app?unit:media);
    if(app){
      unit.setAttribute('aria-label',`${destination}: ${item.title}`);
      if(href){unit.href=href;if(!href.startsWith(location.origin+'/')){unit.target='_blank';unit.rel='noopener noreferrer';}}
      else {unit.type='button';unit.addEventListener('click',()=>{openDialog(unit,item.title);modal.dataset.mode='sample';body.append(node('p','demo-explanation','Detail project akan tersedia di sini.'));});}
    } else {
      if(video?.kind==='instagram'){media.href=video.href;media.target='_blank';media.rel='noopener noreferrer';}else media.type='button';
      media.setAttribute('aria-label',`${item.kind==='design'?'Enlarge':video?.label||'Preview'}: ${item.title}`);
    }
    if(item.image) media.append(image(item.image,item.imageAlt||item.title,'',true));
    else if(item.artwork==='listing')media.append(image('/assets/work/listing-hub.jpg',item.title,'work-app-capture'));
    else {const art=node('span','work-type-art');for(const line of artworkText[item.artwork]||[item.title])art.append(node('span','',line));media.append(art);}
    if(item.kind==='video'){
      const overlay=node('span','video-bottom');const play=node('span','video-play',video.label);if(video.kind!=='preview')play.prepend(icon(video.kind==='file'?'play':'external-link'));overlay.append(play,node('strong','',item.title));media.append(overlay);
      if(video.kind!=='instagram')media.addEventListener('click',()=>openVideo(item,media));
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
        caption.append(heading);unit.append(caption);
      }else{
        unit.append(heading);
        if(app)unit.append(node(href?'p':'span','work-card-description',summary(item.description)));
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
      groups.forEach(group=>{group.querySelectorAll('.works-recovery').forEach(node=>node.hidden=true);const list=group.querySelector('[data-works-list]');let items=data.items.filter(item=>item.kind===group.dataset.workKind&&item.published&&!(item.kind==='webapp'&&item.demo));const viewAll=group.querySelector('.works-heading > a');
        if(viewAll){
          const heading=viewAll.parentElement.querySelector('h2,h3');
          if(heading){
            let copy=heading.parentElement;
            if(!copy.classList.contains('works-heading-copy')){copy=node('div','works-heading-copy');heading.before(copy);copy.append(heading);}
            let count=copy.querySelector('.works-count');if(!count){count=node('p','works-count');copy.append(count);}
            const noun=group.dataset.workKind==='webapp'?(items.every(item=>item.caseStudy)?'case study':'project'):group.dataset.workKind==='design'?'design project':'video';
            count.textContent=`${items.length} ${items.length===1?noun:noun==='case study'?'case studies':`${noun}s`}`;
          }
          viewAll.classList.add('button','button-outline','works-view-all');
          viewAll.replaceChildren(document.createTextNode('View all'),icon('arrow-right'));
          viewAll.setAttribute('aria-label',`View all ${group.dataset.workKind==='webapp'?'web apps and case studies':group.dataset.workKind==='design'?'design projects':'videos'}`);
        }
        if(group.dataset.workKind==='webapp'&&!group.dataset.collection){const manual=items.some(item=>item.homepageFeatured!==undefined);items=items.filter(item=>!manual||item.homepageFeatured===true).slice(0,3);}
        list.replaceChildren(...items.map(item=>card(item,items,group.dataset.collection?'h2':'h4',!!group.querySelector('.editorial-gallery'))));if(!items.length)list.append(node('p','works-message','No portfolio items yet.'));list.scrollLeft=0;list.setAttribute('aria-busy','false');group._updateCarousel?.();
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
