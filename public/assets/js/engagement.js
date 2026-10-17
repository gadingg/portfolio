(() => {
  'use strict';
  if (window.__portfolioEngagement || ['localhost','127.0.0.1','[::1]'].includes(location.hostname) || location.pathname.startsWith('/admintgadink') || document.body.dataset.cmsPreview === 'true' || window.self !== window.top || navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  window.__portfolioEngagement = true;
  const recent = new Map();
  const works = fetch('/api/works').then(response=>response.ok?response.json():{items:[]}).then(data=>data.items.filter(item=>!item.demo)).catch(()=>[]);
  function record(type, workId) {
    const key = `${type}:${workId || ''}`, now = Date.now();
    if (now - (recent.get(key) || 0) < 1500) return;
    recent.set(key, now);
    const body = JSON.stringify({eventId:crypto.randomUUID(),type,...(workId?{workId}:{})});
    fetch('/api/engagement',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{});
  }
  document.addEventListener('click', event => {
    if (!event.isTrusted) return;
    const target = event.target instanceof Element ? event.target.closest('[data-engagement],a[href]') : null;
    if (!target || target.dataset.demo === 'true') return;
    if (target.dataset.engagement) { record(target.dataset.engagement,target.dataset.workId); return; }
    const href = target.getAttribute('href') || '';
    if (/^(https:\/\/(wa\.me|api\.whatsapp\.com)\/|mailto:|tel:)/i.test(href)) record('contact_click');
    else if (target.tagName==='A') works.then(items=>{
      let url;try{url=new URL(href,location.origin);}catch{return;}
      const work=items.find(item=>item.kind==='webapp'&&url.origin===location.origin&&[item.caseStudy?.slug,...(item.aliases||[])].some(slug=>slug&&url.pathname===`/work/${slug}`));
      if(work)record('work_open',work.id);
      else {const app=items.find(item=>item.kind==='webapp'&&item.caseStudy?.appUrl===url.href);if(app)record('app_click',app.id);}
    });
  }, {capture:true});
})();
