'use client';
import {Plus,Trash2,ExternalLink} from 'lucide-react';
import {caseAppLinks,type CaseAppLink} from '@/lib/case-app-links';
export function CaseAppLinksEditor({study,onChange}:{study:{slug:string;appUrl:string;appLinks?:CaseAppLink[]};onChange:(links:CaseAppLink[])=>void}){
  const links=caseAppLinks(study);
  return <section className="cms-blocks" aria-label="Tombol aplikasi"><h3><ExternalLink size={18} aria-hidden="true"/> Tombol aplikasi</h3>{links.map((link,index)=><div className="cms-inline-fields" key={index}><label>Label tombol<input maxLength={80} value={link.label} onChange={event=>onChange(links.map((item,at)=>at===index?{...item,label:event.target.value}:item))}/></label><label>Link aplikasi<input inputMode="url" value={link.url} onChange={event=>onChange(links.map((item,at)=>at===index?{...item,url:event.target.value}:item))}/></label><button type="button" className="wm-button" aria-label={`Hapus tombol ${index+1}`} onClick={()=>onChange(links.filter((_,at)=>at!==index))}><Trash2 size={18}/></button></div>)}{links.length<4&&<button type="button" className="wm-button" onClick={()=>onChange([...links,{label:'Open app',url:''}])}><Plus size={18}/>Tambah tombol aplikasi</button>}</section>;
}
