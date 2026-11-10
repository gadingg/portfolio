'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Mail } from 'lucide-react';

export function CopyEmailButton({email}:{email:string}) {
  const [state,setState]=useState<'idle'|'busy'|'success'|'error'>('idle');
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  async function copy(){
    if(state==='busy')return;
    if(timer.current)clearTimeout(timer.current);
    setState('busy');
    try {await navigator.clipboard.writeText(email);setState('success');}
    catch {setState('error');}
    timer.current=setTimeout(()=>setState('idle'),6000);
  }
  return <>
    <button type="button" className="button contact-copy-email" onClick={copy} disabled={state==='busy'}>
      {state==='success'?<Check className="icon" aria-hidden="true"/>:<Mail className="icon" aria-hidden="true"/>}
      {state==='success'?'Copied':'Copy email'}
    </button>
    <div className="public-toast-region" aria-live="polite" aria-atomic="true">
      {state==='success'&&<p className="public-toast">Email copied.</p>}
      {state==='error'&&<div className="public-toast"><p>Couldn’t copy the email. Select the address below.</p><input aria-label="Email address" readOnly value={email} onFocus={event=>event.currentTarget.select()}/><a href={`mailto:${email}`}>Send email</a></div>}
    </div>
  </>;
}
