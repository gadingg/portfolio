(()=>{
  if(!window.HTMLDialogElement?.prototype.showModal || document.body.dataset.cmsPreview)return;
  const dialog=document.createElement('dialog');
  dialog.className='cv-dialog';
  dialog.setAttribute('aria-labelledby','cv-dialog-title');
  dialog.innerHTML='<header class="cv-dialog-header"><h2 id="cv-dialog-title">CV</h2><button class="work-dialog-close" type="button" aria-label="Close CV"><svg class="icon" aria-hidden="true"><use href="/assets/icons/lucide.svg#x"></use></svg></button></header>';
  const close=dialog.querySelector('button');
  let trigger,frame;
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{
    frame?.remove();
    frame=null;
    trigger?.focus({preventScroll:true});
  });
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');
    if(event.defaultPrevented||!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin||url.pathname!=='/cv'||url.searchParams.has('preview'))return;
    event.preventDefault();
    if(dialog.open)return;
    trigger=link;
    url.searchParams.set('dialog','1');
    frame=document.createElement('iframe');
    frame.title='Curriculum vitae';
    frame.src=url.href;
    frame.addEventListener('load',()=>{
      frame?.contentDocument?.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&dialog.open){event.preventDefault();dialog.close();}
      });
    });
    dialog.append(frame);
    if(!dialog.isConnected)document.body.append(dialog);
    dialog.showModal();
    close.focus();
  });
})();
