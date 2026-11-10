(() => {
  'use strict';
  const buttons=document.querySelectorAll('[data-copy-email]');
  if(!buttons.length)return;
  const region=document.createElement('div');
  region.className='public-toast-region';region.setAttribute('role','status');region.setAttribute('aria-live','polite');region.setAttribute('aria-atomic','true');document.body.append(region);
  let timer;
  buttons.forEach(button=>button.addEventListener('click',async()=>{
    button.disabled=true;clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(button.dataset.email);
      const toast=document.createElement('p');toast.className='public-toast';toast.textContent='Email copied.';region.replaceChildren(toast);
      timer=setTimeout(()=>region.replaceChildren(),6000);
    } catch {
      const toast=document.createElement('div');toast.className='public-toast';
      const message=document.createElement('p');message.textContent='Couldn’t copy the email. Select the address below.';
      const address=document.createElement('input');address.readOnly=true;address.value=button.dataset.email;address.setAttribute('aria-label','Email address');address.addEventListener('focus',()=>address.select());
      const link=document.createElement('a');link.href=`mailto:${button.dataset.email}`;link.textContent='Send email';toast.append(message,address,link);region.replaceChildren(toast);
    } finally {button.disabled=false;}
  }));
})();
