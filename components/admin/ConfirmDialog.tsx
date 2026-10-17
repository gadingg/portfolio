'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import './confirm-dialog.css';
export function useConfirm(){
  const dialog=useRef<HTMLDialogElement>(null),resolve=useRef<((value:boolean)=>void)|null>(null);
  const [request,setRequest]=useState<{message:string;label:string}|null>(null),id=useId();
  const ask=useCallback((message:string,label='Hapus')=>new Promise<boolean>(done=>{
    if(resolve.current){done(false);return;}resolve.current=done;setRequest({message,label});
  }),[]);
  function finish(value:boolean){const done=resolve.current;resolve.current=null;dialog.current?.close();setRequest(null);done?.(value);}
  useEffect(()=>{if(request&&!dialog.current?.open)dialog.current?.showModal();},[request]);
  useEffect(()=>()=>{resolve.current?.(false);resolve.current=null;},[]);
  const confirmation=<dialog ref={dialog} className="cms-confirm" aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`} onCancel={event=>{event.preventDefault();finish(false);}} onClick={event=>{if(event.target===dialog.current)finish(false);}}>
    <h2 id={`${id}-title`}>Konfirmasi</h2><p id={`${id}-message`}>{request?.message}</p><div><button type="button" onClick={()=>finish(false)}>Batal</button><button type="button" className="cms-confirm-action" onClick={()=>finish(true)}>{request?.label||'Hapus'}</button></div>
  </dialog>;
  return {ask,confirmation};
}
