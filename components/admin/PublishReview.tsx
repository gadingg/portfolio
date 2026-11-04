'use client';
import { useEffect,useId,useRef,useState } from 'react';
import type { PublishSummary } from '@/lib/publish-summary';
import { ArrowLeft, ArrowRight, ArrowDownUp, Check, EyeOff, ImageIcon, Layers, ListOrdered, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import './publish-review.css';

export function usePublishReview() {
  const dialog=useRef<HTMLDialogElement>(null),resolve=useRef<((confirmed:boolean)=>void)|null>(null);
  const [summary,setSummary]=useState<PublishSummary|null>(null),id=useId();
  function finish(value:boolean){const done=resolve.current;resolve.current=null;dialog.current?.close();setSummary(null);done?.(value);}
  function review(value:PublishSummary){
    return new Promise<boolean>(done=>{if(resolve.current){done(false);return;}resolve.current=done;setSummary(value);});
  }
  useEffect(()=>{if(summary&&!dialog.current?.open)dialog.current?.showModal();},[summary]);
  useEffect(()=>()=>{resolve.current?.(false);resolve.current=null;},[]);
  const publicationReview=<dialog ref={dialog} className="cms-publish-review" aria-labelledby={`${id}-title`} aria-describedby={`${id}-scope`} onCancel={event=>{event.preventDefault();finish(false);}} onClick={event=>{if(event.target===dialog.current)finish(false);}}>
    <header className="publish-review-heading"><span className="publish-review-symbol"><Upload size={22}/></span><div><h2 id={`${id}-title`}>Cek sebelum terbit</h2><p id={`${id}-scope`}>{summary?.scope.includes('hanya')?'Studi kasus ini':summary?.scope.includes('Website & CV')?'Website & CV':'Semua kategori portofolio'}</p></div><button type="button" className="publish-review-close" aria-label="Tutup cek sebelum terbit" onClick={()=>finish(false)}><X size={20}/></button></header>
    {!!summary?.counts.length&&<ul className="cms-publish-counts">{summary.counts.map(count=>{const Icon=/gambar/.test(count)?ImageIcon:/Urutan/.test(count)?ListOrdered:/ditambah/.test(count)?Plus:/dihapus/.test(count)?Trash2:Pencil;return <li key={count}><Icon size={19} aria-hidden="true"/><span>{count}</span></li>;})}</ul>}
    <div className="cms-publish-changes">{summary?.entries.map(entry=>entry.order?<details className="publish-order" key={entry.id} open={summary.entries.length===1}><summary><ListOrdered size={20}/><strong>Urutan baru</strong><span>{entry.order.length} posisi</span><ArrowDownUp size={16}/></summary><ol>{entry.order.map(item=><li key={item.id}><PreviewImage src={item.image}/><strong>{item.title}</strong><span className="publish-order-position" aria-label={`Posisi ${item.from} menjadi ${item.to}`}><span>{item.from}</span><ArrowRight size={15}/><b>{item.to}</b></span></li>)}</ol></details>:<article className="publish-project" key={entry.id}><PreviewImage src={entry.image}/><div><strong className="publish-project-title">{entry.title}</strong>{entry.status&&<span className="publish-project-status">{entry.status==='Disembunyikan'?<EyeOff size={13}/>:<Check size={13}/>} {entry.status==='Diaktifkan untuk publik'?'Tampil di publik':entry.status}</span>}<ul className="publish-field-changes">{entry.changes.map((change,index)=><li key={index}><Check size={13} aria-hidden="true"/>{change}</li>)}</ul></div></article>)}</div>
    {summary&&!summary.entries.length&&<p>Konten draft ini akan menjadi versi publik terbaru.</p>}
    <div className="cms-publish-actions"><button type="button" autoFocus onClick={()=>finish(false)}><ArrowLeft size={17}/>Kembali edit</button><button type="button" className="cms-publish-confirm" onClick={()=>finish(true)}><Upload size={17}/>Terbitkan sekarang</button></div>
  </dialog>;
  return {review,publicationReview};
}

function PreviewImage({src}:{src?:string}) {
  return src?<img className="publish-project-image" src={src} alt="" loading="lazy"/>:<span className="publish-project-image publish-project-placeholder"><Layers size={23} aria-hidden="true"/></span>;
}
