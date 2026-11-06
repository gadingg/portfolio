'use client';
import {useEffect,useRef,useState} from 'react';
import {useRegisterAdminDirty} from './AdminChanges';
import {sameDraftContent} from '@/lib/draft-backup';
export function useManualSave(options:{value:string;baseline:string;save:()=>Promise<boolean>;restore?:(value:string)=>void;error?:string;busy?:boolean;[key:string]:unknown}){
  const unsafe=useRef(false);
  const [online,setOnline]=useState(true),[retryFailed,setRetryFailed]=useState(false);
  useEffect(()=>{const update=()=>setOnline(navigator.onLine);update();window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);
  useEffect(()=>{setRetryFailed(false);},[options.value]);
  unsafe.current=!sameDraftContent(options.value,options.baseline);
  useRegisterAdminDirty(unsafe);
  const failed=!!options.error||retryFailed;
  const status=options.busy?'Menyimpan…':!online?'Tidak ada koneksi · perubahan belum dikirim':failed?'Belum tersimpan':unsafe.current?'Ada perubahan':'Tersimpan';
  async function retry(){setRetryFailed(false);const ok=await options.save();setRetryFailed(!ok);}
  return {unsafe,online,status,failed,recovery:null,canRestore:false,restoreRecovery(){},useServerVersion(){},retry};
}
