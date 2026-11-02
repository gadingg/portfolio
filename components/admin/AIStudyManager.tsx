'use client';
import { useEffect,useRef,useState } from 'react';
import { FileDrop } from './FileDrop';
import { AdminSkeleton } from './AdminSkeleton';
import { RotateCw } from 'lucide-react';
import {useToastMessage} from './AdminToasts';
import { useConfirm } from './ConfirmDialog';
import { AIStudySchema,mergeAIRevision,type AIStudy,type AITarget } from '@/lib/ai-study';
import type { WorkItem } from '@/lib/works';
import './works-manager.css';
import './ai-study.css';

type Pending={result:AIStudy;target:AITarget};
function studyFromWork(work:WorkItem):AIStudy|null{
  const study=work.caseStudy;if(!study)return null;
  const sections:{heading:string;body:string}[]=[];
  for(const block of study.blocks){
    if(block.block_type==='heading')sections.push({heading:String(block.content_json.text||''),body:''});
    if(block.block_type==='paragraph'){
      const last=sections.at(-1);if(last)last.body+=(last.body?'\n\n':'')+String(block.content_json.text||'');
    }
  }
  return {title:work.title,description:work.description,slug:study.slug.slice(0,32),problem:study.problem,approach:study.solution,outcome:study.impact,
    sections:sections.filter(section=>section.heading&&section.body).slice(0,8),confirmations:work.aiDraft?.confirmations||[],screenshots:work.aiDraft?.screenshots||[]};
}
export function AIStudyManager(){
  const [items,setItems]=useState<WorkItem[]>([]),[revision,setRevision]=useState<number|null>(null),[selected,setSelected]=useState('');
  const [brief,setBrief]=useState(''),[image,setImage]=useState(''),[alt,setAlt]=useState(''),[appUrl,setAppUrl]=useState('');
  const [result,setResult]=useState<AIStudy|null>(null),[pending,setPending]=useState<Pending|null>(null);
  const [busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[loading,setLoading]=useState(true),[configured,setConfigured]=useState(false);
  const [error,setError]=useState(''),[message,setMessage]=useState(''),[applied,setApplied]=useState('');
  const dirty=useRef(false),lock=useRef(false),resultRef=useRef<HTMLDivElement>(null),reviewRef=useRef<HTMLDivElement>(null);
  const {ask,confirmation}=useConfirm();
  const disabled=busy||uploading;
  function selectWork(id:string,works=items){
    const work=works.find(value=>value.id===id);setSelected(id);setResult(work?studyFromWork(work):null);setPending(null);setApplied('');setError('');setMessage('');
    setBrief(work?.aiDraft?.brief||(work?.caseStudy?[work.title,work.description,work.caseStudy.problem,work.caseStudy.solution,work.caseStudy.impact,...work.caseStudy.blocks.filter(block=>['heading','paragraph'].includes(block.block_type)).map(block=>String(block.content_json.text||''))].filter(Boolean).join('\n\n').slice(0,30000):''));setImage(work?.image||'');setAlt(work?.imageAlt||'');setAppUrl(work?.caseStudy?.appUrl||'');dirty.current=false;
    const url=new URL(window.location.href);if(id)url.searchParams.set('work',id);else url.searchParams.delete('work');window.history.replaceState(null,'',url);
  }
  async function load(){
    setLoading(true);setError('');
    try{
      const [worksResponse,settingsResponse]=await Promise.all([fetch('/api/admin/works',{cache:'no-store'}),fetch('/api/admin/ai/settings',{cache:'no-store'})]);
      const works=await worksResponse.json(),settings=await settingsResponse.json();
      if(!worksResponse.ok)throw Error(works.error);if(!settingsResponse.ok)throw Error(settings.error);
      setItems(works.items);setRevision(works.revision);setConfigured(settings.configured);
      const id=new URLSearchParams(window.location.search).get('work')||'';
      selectWork(id&&works.items.some((item:WorkItem)=>item.id===id&&item.kind==='webapp'&&item.caseStudy)?id:'',works.items);
    }catch(e){setError(e instanceof Error?e.message:'Data belum bisa dimuat.');}finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  useEffect(()=>{
    const unload=(event:BeforeUnloadEvent)=>{if(dirty.current){event.preventDefault();event.returnValue='';}};
    const leave=(event:MouseEvent)=>{
      const link=(event.target as HTMLElement).closest('a');
      if(!dirty.current||!link||link.target==='_blank'||event.ctrlKey||event.metaKey)return;
      event.preventDefault();event.stopPropagation();void ask('Hasil di workspace ini belum disimpan sebagai draft. Tetap keluar?','Tinggalkan').then(yes=>{if(yes){dirty.current=false;window.location.assign(link.href);}});
    };
    window.addEventListener('beforeunload',unload);document.addEventListener('click',leave,true);
    return()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',leave,true);};
  },[ask]);
  function changeResult(patch:Partial<AIStudy>){if(result){setResult({...result,...patch});dirty.current=true;setApplied('');}}
  async function generate(target:AITarget='all'){
    if(lock.current||disabled)return;
    if(brief.trim().length<20){setError('Ceritakan project-nya minimal 20 karakter.');return;}
    if(target!=='all'&&!result)return;
    if(target==='all'&&result&&!await ask('Generate versi baru? Hasilnya ditampilkan terpisah untuk dibandingkan. Tulisan Anda tetap aman sampai Anda memilih hasil baru.','Generate versi baru'))return;
    lock.current=true;setBusy(true);setError('');setMessage('Gemini sedang menyusun draft…');setPending(null);
    try{
      const current=AIStudySchema.safeParse(result);
      const response=await fetch('/api/admin/ai/study-case',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generate',brief,target,...(current.success?{current:current.data}:{})}),signal:AbortSignal.timeout(55000)}),data=await response.json();
      if(!response.ok)throw Error(data.error);
      const generated=AIStudySchema.parse(data.result);
      if(result){setPending({result:generated,target});requestAnimationFrame(()=>reviewRef.current?.focus());}
      else{setResult(generated);requestAnimationFrame(()=>resultRef.current?.focus());}
      dirty.current=true;setApplied('');setMessage('Draft AI siap direview. Periksa fakta dan bagian yang perlu dikonfirmasi.');
    }catch(e){setError(e instanceof Error&&e.name!=='TimeoutError'?e.message:'Gemini belum selesai. Catatan dan hasil sebelumnya tetap aman; coba lagi.');setMessage('');}
    finally{lock.current=false;setBusy(false);}
  }
  async function apply(){
    if(disabled||!result||revision===null||lock.current)return;
    const parsed=AIStudySchema.safeParse(result);
    if(!parsed.success){setError(parsed.error.issues[0]?.message||'Periksa hasil draft.');return;}
    if(!image){setError('Upload thumbnail terlebih dahulu.');return;}
    if(selected&&!await ask('Terapkan hasil review ke draft studi kasus ini? Teks draft akan diganti. Screenshot dan halaman publik tetap terjaga sampai Anda publish.','Terapkan ke draft'))return;
    lock.current=true;setBusy(true);setError('');
    try{
      const response=await fetch('/api/admin/ai/study-case',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'apply',revision,id:selected||undefined,brief,result:parsed.data,image,imageAlt:alt,appUrl}),signal:AbortSignal.timeout(20000)}),data=await response.json();
      if(!response.ok)throw Error(data.error);
      dirty.current=false;setApplied(data.id);setSelected(data.id);setRevision(data.revision);setItems(current=>current.some(item=>item.id===data.id)?current.map(item=>item.id===data.id?data.item:item):[...current,data.item]);setMessage('Draft tersimpan. Lanjutkan edit dan preview sebelum publish.');
      const url=new URL(window.location.href);url.searchParams.set('work',data.id);window.history.replaceState(null,'',url);
    }catch(e){setError(e instanceof Error&&e.name!=='TimeoutError'?e.message:'Penyimpanan belum selesai. Muat ulang daftar sebelum mencoba lagi untuk menghindari draft ganda.');}
    finally{lock.current=false;setBusy(false);}
  }
  function renderStudy(study:AIStudy,preview=false){
    const fields=[['title','Judul portfolio'],['description','Deskripsi singkat'],['problem','Problem'],['approach','Approach'],['outcome','Outcome']] as const;
    return <>
      {fields.filter(([key])=>!preview||pending?.target==='all'||pending?.target===key).map(([key,label])=><div className="ai-result-field" key={key}>
        <div className="ai-field-heading"><label htmlFor={`ai-${preview?'next':'edit'}-${key}`}>{label}</label>{!preview&&<button type="button" className="wm-button admin-icon-action" title={`Generate ulang ${label}`} aria-label={`Generate ulang ${label}`} disabled={disabled||!configured} onClick={()=>generate(key)}><RotateCw size={18} aria-hidden="true"/></button>}</div>
        <textarea id={`ai-${preview?'next':'edit'}-${key}`} readOnly={preview} disabled={!preview&&disabled} rows={key==='title'?2:4} maxLength={key==='title'?140:key==='description'?500:1500} value={study[key]} onChange={event=>changeResult({[key]:event.target.value})}/>
      </div>)}
      {!selected&&(!preview||pending?.target==='all')&&<label>Slug pendek<input maxLength={32} readOnly={preview} disabled={!preview&&disabled} value={study.slug} onChange={event=>changeResult({slug:event.target.value})}/></label>}
      {study.sections.map((section,index)=>(!preview||pending?.target==='all'||pending?.target===`section:${index}`)&&<section className="ai-story-section" key={index}>
        <div className="ai-field-heading"><h3>Bagian {index+1}</h3>{!preview&&<button type="button" className="wm-button admin-icon-action" title={`Generate ulang bagian ${index+1}`} aria-label={`Generate ulang bagian ${index+1}`} disabled={disabled||!configured} onClick={()=>generate(`section:${index}`)}><RotateCw size={18} aria-hidden="true"/></button>}</div>
        <label>Headline / selling point<input maxLength={160} readOnly={preview} disabled={!preview&&disabled} value={section.heading} onChange={event=>changeResult({sections:study.sections.map((value,at)=>at===index?{...value,heading:event.target.value}:value)})}/></label>
        <label>Penjelasan<textarea maxLength={3000} readOnly={preview} disabled={!preview&&disabled} rows={5} value={section.body} onChange={event=>changeResult({sections:study.sections.map((value,at)=>at===index?{...value,body:event.target.value}:value)})}/></label>
      </section>)}
    </>;
  }
  useToastMessage(!busy ? message : '');
  if (loading) return <AdminSkeleton />;
  return <div className="works-manager cms-manager ai-workspace">
    {confirmation}
    <header className="wm-heading"><div><h1>AI Study Case</h1></div><a href="/admintgadink/dashboard/settings" className="wm-button">Pengaturan AI</a></header>
    {error&&<p className="cms-error" role="alert">{error}{revision!==null&&<button className="wm-button" disabled={disabled} type="button" onClick={async()=>{if(!dirty.current||await ask('Muat ulang daftar dan lepaskan perubahan workspace yang belum disimpan?','Muat ulang'))void load();}}>Muat ulang daftar</button>}</p>}
    {message&&busy&&<p role="status" className="ai-notice"><span className="admin-spinner" aria-hidden="true"/>{message}</p>}
    {loading?<AdminSkeleton />:revision===null?<button type="button" className="wm-button" onClick={load}>Coba lagi</button>:<>
      {!configured&&<div className="ai-notice"><p>Tambahkan API key di Pengaturan AI untuk membuat draft.</p></div>}
      <div className="ai-authoring-layout">
        <section className="ai-input-panel" aria-labelledby="ai-brief-title"><h2 id="ai-brief-title">Brief project</h2>
          <fieldset disabled={disabled} className="ai-fields">
            <label>Tujuan draft<select value={selected} onChange={async event=>{const id=event.target.value;if(!dirty.current||await ask('Ganti project dan lepaskan perubahan workspace yang belum disimpan?','Ganti project'))selectWork(id);}}><option value="">Buat studi kasus baru</option>{items.filter(item=>item.kind==='webapp'&&item.caseStudy).map(item=><option key={item.id} value={item.id}>Revisi: {item.title}</option>)}</select></label>
            <label>Ceritakan project-nya<textarea rows={10} maxLength={30000} value={brief} onChange={event=>{setBrief(event.target.value);dirty.current=true;setApplied('');}} placeholder="Boleh catatan bebas, daftar fitur, masalah yang ingin diselesaikan, proses, atau hasil yang sudah Anda lihat."/></label>
            <p className="wm-editor-note">{brief.length.toLocaleString('id-ID')}/30.000 karakter</p>
            <label>Link aplikasi (opsional)<input inputMode="url" maxLength={2000} value={appUrl} onChange={event=>{setAppUrl(event.target.value);dirty.current=true;setApplied('');}}/></label>
            <h3>Thumbnail portofolio</h3>
            <FileDrop previewSrc={image} previewAlt={alt||'Thumbnail portfolio'} disabled={disabled} onBusyChange={setUploading} uploadLabel={image?'Ganti thumbnail':'Upload thumbnail'} onUploaded={files=>{setImage(files[0].url);dirty.current=true;setApplied('');}}/>
            <label>Deskripsi thumbnail<input maxLength={250} value={alt} onChange={event=>{setAlt(event.target.value);dirty.current=true;setApplied('');}}/></label>
          </fieldset>
          <button type="button" className="wm-button wm-primary" disabled={disabled||!configured||brief.trim().length<20} onClick={()=>generate()} aria-busy={busy}>{busy?'Memproses…':result?'Generate versi baru':'Generate Study Case'}</button>
          <p className="wm-editor-note">Catatan dikirim ke Gemini. Hasil baru disimpan saat Anda memilih Gunakan hasil.</p>
        </section>
        <div className="ai-review-panel" ref={resultRef} tabIndex={-1} aria-labelledby="ai-review-title">
          <h2 id="ai-review-title">Review draft</h2>
          {!result?<div className="ai-empty"><p>Draft akan muncul di sini untuk Anda periksa.</p></div>:<>
            {pending&&<section className="ai-pending" ref={reviewRef} tabIndex={-1} aria-label="Usulan revisi AI"><h3>Usulan revisi</h3><p className="wm-editor-note">Tulisan Anda di bawah belum berubah. Bandingkan sebelum memakai revisi ini.</p>{renderStudy(pending.result,true)}<div className="ai-actions"><button type="button" className="wm-button wm-primary" disabled={disabled} onClick={async()=>{if(await ask('Gunakan usulan ini untuk mengganti bagian yang dipilih? Bagian lain tetap dipertahankan.','Gunakan revisi')){setResult(mergeAIRevision(result,pending.result,pending.target));setPending(null);dirty.current=true;setApplied('');}}}>Gunakan revisi ini</button><button type="button" className="wm-button" disabled={disabled} onClick={()=>setPending(null)}>Pertahankan tulisan saya</button></div></section>}
            <p className="wm-editor-note">The thinking behind the output: Problem, Approach, Outcome, lalu cerita detail. Semua field bisa Anda edit.</p>
            {renderStudy(result)}
            <section className="ai-private-notes"><h3>Perlu dikonfirmasi</h3><p className="wm-editor-note">Catatan ini khusus admin dan tidak ditampilkan di portfolio publik.</p>{result.confirmations.length?<ul>{result.confirmations.map((text,index)=><li key={index}>{text}</li>)}</ul>:<p>Tidak ada pertanyaan tambahan dari AI. Tetap crosscheck fakta sebelum publish.</p>}</section>
            {!!result.screenshots.length&&<section className="ai-private-notes"><h3>Saran screenshot</h3><ul>{result.screenshots.map((shot,index)=><li key={index}><strong>Setelah bagian {shot.afterSection+1}</strong><p>{shot.description}</p>{shot.caption&&<p>Caption: {shot.caption}</p>}</li>)}</ul><p className="wm-editor-note">Saran ini tidak membuat gambar. Tambahkan screenshot asli melalui editor setelah draft disimpan.</p></section>}
            <div className="ai-apply"><button type="button" className="wm-button wm-primary" disabled={disabled||!!pending||!!applied||!image||brief.trim().length<20} onClick={apply}>{applied?'Draft tersimpan':'Gunakan hasil & simpan draft'}</button><p>Halaman publik tetap memakai versi terakhir yang Anda publish.</p>{applied&&<a className="wm-button" href={`/admintgadink/dashboard/works?kind=webapp&work=${applied}`}>Lanjutkan ke editor portfolio</a>}</div>
          </>}
        </div>
      </div>
    </>}
  </div>;
}
