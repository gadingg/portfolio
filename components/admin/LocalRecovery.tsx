'use client';
import {useEffect,useRef,useState} from 'react';
import {History,RotateCcw,Download,X} from 'lucide-react';
import {readLocalVersion,type LocalVersion} from '@/lib/local-recovery';
import {useConfirm} from './ConfirmDialog';

export function useLocalRecovery<T>({scope,ready,revision,value,dirty,validate,onRestore}:{scope:string;ready:boolean;revision:number;value:T;dirty:boolean;validate:(value:unknown)=>T;onRestore:(value:T)=>void}){
  const key=`portfolio-editor:v1:${scope}`,initialized=useRef(''),pendingRef=useRef(false),owned=useRef(false);
  const [candidate,setCandidate]=useState<LocalVersion<T>|null>(null),[versions,setVersions]=useState<LocalVersion<T>[]>([]),[error,setError]=useState('');
  const latest=useRef({value,dirty,revision,scope});latest.current={value,dirty,revision,scope};
  const {ask,confirmation}=useConfirm();
  function clear(){try{localStorage.removeItem(key);}catch{}pendingRef.current=false;owned.current=false;setCandidate(null);}
  function persist(){if(pendingRef.current||!latest.current.dirty||!ready||latest.current.scope!==scope)return;try{validate(latest.current.value);}catch{return;}try{const payload=JSON.stringify({savedAt:Date.now(),revision:latest.current.revision,value:latest.current.value});if(payload.length>2500000)throw Error();localStorage.setItem(key,payload);owned.current=true;}catch{setError('Cadangan perangkat belum tersimpan. Simpan draft untuk mengamankan editan.');}}
  useEffect(()=>{
    if(!ready||initialized.current===key)return;initialized.current=key;pendingRef.current=false;owned.current=false;
    try{const found=readLocalVersion(localStorage.getItem(key),validate);if(found&&JSON.stringify(found.value)!==JSON.stringify(value)){pendingRef.current=true;setCandidate(found);}else localStorage.removeItem(key);
      const history=JSON.parse(localStorage.getItem(`${key}:history`)||'[]');setVersions(Array.isArray(history)?history.slice(0,5).flatMap((entry:unknown)=>{const version=readLocalVersion(JSON.stringify(entry),validate);return version?[version]:[];}):[]);
    }catch{setError('Penyimpanan perangkat tidak tersedia. Gunakan Simpan draft.');}
  },[ready,key]);
  const serialized=JSON.stringify(value);
  useEffect(()=>{
    if(!ready||initialized.current!==key||pendingRef.current)return;
    if(!dirty){if(owned.current)clear();try{const raw=JSON.parse(localStorage.getItem(`${key}:history`)||'[]');const history:LocalVersion<T>[]=Array.isArray(raw)?raw:[];if(JSON.stringify(history[0]?.value)!==serialized){const next=[{savedAt:Date.now(),revision,value},...history].slice(0,5);while(JSON.stringify(next).length>2500000&&next.length>1)next.pop();localStorage.setItem(`${key}:history`,JSON.stringify(next));setVersions(next);}}catch{}return;}
    const timer=setTimeout(persist,500);return()=>clearTimeout(timer);
  },[ready,dirty,serialized,revision,key]);
  useEffect(()=>{if(!ready)return;const flush=()=>persist();window.addEventListener('pagehide',flush);window.addEventListener('beforeunload',flush);return()=>{flush();window.removeEventListener('pagehide',flush);window.removeEventListener('beforeunload',flush);};},[ready,key]);
  function download(){if(!candidate)return;const url=URL.createObjectURL(new Blob([JSON.stringify(candidate.value,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='portfolio-editan-lokal.json';link.click();URL.revokeObjectURL(url);}
  const recovery=<>{confirmation}{error&&<p className="cms-error" role="alert">{error}</p>}{candidate&&<section className="cms-recovery" aria-label="Editan belum disimpan"><RotateCcw size={20}/><div><strong>Editan terakhir ditemukan</strong><small>{candidate.revision===revision?'Tersimpan di perangkat ini.': 'Versi server sudah berubah. Unduh salinan editan untuk diperiksa.'}</small></div><div className="cms-image-actions"><button className="wm-button" type="button" disabled={candidate.revision!==revision} onClick={()=>{onRestore(candidate.value);clear();}}>Lanjutkan editan</button><button type="button" className="wm-button" onClick={download} aria-label="Unduh salinan editan"><Download size={17}/></button><button type="button" className="wm-button" aria-label="Abaikan cadangan lokal" onClick={clear}><X size={17}/></button></div></section>}
    {ready&&versions.length>0&&<details className="cms-recovery-history"><summary><History size={17}/>Riwayat perangkat <span>{versions.length}</span></summary><ul>{versions.map((version,index)=><li key={`${version.savedAt}-${index}`}><span>{new Date(version.savedAt).toLocaleString('id-ID')}<small>Revisi {version.revision}</small></span><button type="button" className="wm-button" onClick={async()=>{if(await ask('Gunakan versi ini sebagai editan? Perubahan baru tetap perlu disimpan dan direview sebelum publish.','Gunakan versi')){onRestore(validate(version.value));clear();}}}><RotateCcw size={16}/>Gunakan versi</button></li>)}</ul></details>}</>;
  return {recovery,clear};
}
