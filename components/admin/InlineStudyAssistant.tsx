'use client';
import {useRef,useState} from 'react';
import {Sparkles,X} from 'lucide-react';
import {AIStudySchema,type AIStudy} from '@/lib/ai-study';
import type {WorkItem} from '@/lib/works';
import {useAdminToast} from './AdminToasts';
export function InlineStudyAssistant({item,disabled,onChange}:{item:WorkItem;disabled:boolean;onChange:(patch:Partial<WorkItem>)=>void}){
  const dialog=useRef<HTMLDialogElement>(null),notify=useAdminToast();
  const [brief,setBrief]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState<AIStudy|null>(null),[error,setError]=useState('');
  async function generate(){
    setBusy(true);setError('');
    try{
      const response=await fetch('/api/admin/ai/study-case',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generate',target:'all',brief}),signal:AbortSignal.timeout(60000)});
      const data=await response.json();if(!response.ok)throw Error(data.error||'AI belum bisa dipakai. Coba lagi.');
      setResult(AIStudySchema.parse(data.result));
    }catch(e){const message=e instanceof Error?e.message:'AI belum bisa dipakai.';setError(message);notify(message,{tone:'error'});}
    finally{setBusy(false);}
  }
  return <>
    <button className="wm-button" type="button" disabled={disabled} onClick={()=>{setBrief(item.aiDraft?.brief||[item.title,item.description,item.caseStudy?.problem,item.caseStudy?.solution,item.caseStudy?.impact].filter(Boolean).join('\n'));setResult(null);setError('');dialog.current?.showModal();}}><Sparkles size={18}/>Generate dengan AI</button>
    <dialog ref={dialog} className="cms-media-dialog inline-ai-dialog" aria-labelledby="inline-ai-title">
      <div className="cms-panel-heading"><h2 id="inline-ai-title">Asisten studi kasus</h2><button className="wm-button" type="button" aria-label="Tutup asisten" onClick={()=>dialog.current?.close()}><X size={20}/></button></div>
      <label>Ceritakan masalah, pekerjaan Anda, dan hasil nyata<textarea rows={5} value={brief} maxLength={30000} disabled={busy} onChange={event=>setBrief(event.target.value)}/></label>
      <button type="button" className="wm-button" disabled={busy||brief.trim().length<20} onClick={generate}>{busy?'Menyiapkan saran…':'Buat saran'}</button>
      {error&&<p role="alert">{error}</p>}
      {result&&<div className="work-editor-fields"><p>Periksa saran sebelum mengganti ringkasan. Judul, cover, link, dan galeri tetap memakai isi form.</p>{(['problem','approach','outcome'] as const).map((key,index)=><label key={key}>{['Problem','Approach','Result'][index]}<textarea rows={3} value={result[key]} onChange={event=>setResult({...result,[key]:event.target.value})}/></label>)}
        <button className="wm-button wm-primary" type="button" disabled={busy} onClick={()=>{if(!item.caseStudy)return;onChange({caseStudy:{...item.caseStudy,problem:result.problem,solution:result.approach,impact:result.outcome},aiDraft:{brief,confirmations:result.confirmations,screenshots:result.screenshots,generatedAt:new Date().toISOString()}});dialog.current?.close();notify('Saran AI dimasukkan ke form. Simpan untuk menerbitkan.');}}>Gunakan ringkasan ini</button>
      </div>}
    </dialog>
  </>;
}
