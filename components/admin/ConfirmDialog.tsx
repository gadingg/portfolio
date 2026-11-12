'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import './confirm-dialog.css';
export function useConfirm(){
  const dialog=useRef<HTMLDialogElement>(null),resolve=useRef<((value:boolean)=>void)|null>(null);
  const [request,setRequest]=useState<{message:string;label:string;destructive:boolean;title:string}|null>(null),id=useId();
  const trigger=useRef<HTMLElement|null>(null),cancel=useRef<HTMLButtonElement>(null);
  const ask=useCallback((message:string,label='Hapus',destructive=false,title=destructive?'Pindahkan ke Sampah?':label+'?')=>new Promise<boolean>(done=>{
    if(resolve.current){done(false);return;}trigger.current=document.activeElement as HTMLElement;resolve.current=done;setRequest({message,label,destructive,title});
  }),[]);
  function finish(value:boolean){const done=resolve.current;resolve.current=null;dialog.current?.close();setRequest(null);if(trigger.current?.isConnected)trigger.current.focus();done?.(value);}
  useEffect(()=>{if(request&&!dialog.current?.open){dialog.current?.showModal();cancel.current?.focus();}},[request]);
  useEffect(()=>()=>{resolve.current?.(false);resolve.current=null;},[]);
  const confirmation=<dialog ref={dialog} className="cms-confirm" aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`} onCancel={event=>{event.preventDefault();finish(false);}} onClick={event=>{if(event.target===dialog.current)finish(false);}}>
    <h2 id={`${id}-title`}>{request?.title}</h2><p id={`${id}-message`}>{request?.message}</p><div><button ref={cancel} type="button" onClick={()=>finish(false)}>Batal</button><button type="button" className={`cms-confirm-action${request?.destructive?' cms-confirm-danger':''}`} onClick={()=>finish(true)}>{request?.label||'Hapus'}</button></div>
  </dialog>;
  return {ask,confirmation};
}
