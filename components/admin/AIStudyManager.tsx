'use client';
import { useEffect,useRef,useState } from 'react';
import { useRegisterAdminDirty } from './AdminChanges';
import { FileDrop } from './FileDrop';
import { AdminSkeleton } from './AdminSkeleton';
import { Copy, RotateCw, Pencil, Check } from 'lucide-react';
import {AdminLink} from './AdminLink';
import {useToastMessage} from './AdminToasts';
import { useConfirm } from './ConfirmDialog';
import { aiStudyBasePrompt,looksLikePreparedStudy,AIStudySchema,mergeAIRevision,type AIStudy,type AITarget } from '@/lib/ai-study';
import type { WorkItem } from '@/lib/works';
import './works-manager.css';
import './ai-study.css';

type Pending={result:AIStudy;target:AITarget};
function ReviewField({label,value,id,disabled,readOnly=false,multiline=true,maxLength,onChange,regenerate}:{label:string;value:string;id:string;disabled:boolean;readOnly?:boolean;multiline?:boolean;maxLength:number;onChange:(value:string)=>void;regenerate?:React.ReactNode}){
  const [editing,setEditing]=useState(false);
  return <div className="ai-result-field"><div className="ai-field-heading"><label htmlFor={editing?id:undefined}>{label}</label><div className="ai-field-tools">{!readOnly&&<button type="button" className="wm-button" disabled={disabled} onClick={()=>setEditing(!editing)}>{editing?<Check size={16}/>:<Pencil size={16}/>}<span>{editing?'Selesai':'Edit'}</span><span className="wm-sr-only"> {label}</span></button>}{regenerate}</div></div>{editing&&!readOnly?(multiline?<textarea autoFocus id={id} disabled={disabled} rows={4} maxLength={maxLength} value={value} onChange={event=>onChange(event.target.value)}/>:<input autoFocus id={id} disabled={disabled} maxLength={maxLength} value={value} onChange={event=>onChange(event.target.value)}/>):<p className="ai-readable-copy">{value||'Belum diisi'}</p>}</div>;
}
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
export function AIStudyManager({ initial }: { initial: { items: WorkItem[]; revision: number; configured: boolean } | null }){
  const [items,setItems]=useState<WorkItem[]>([]),[revision,setRevision]=useState<number|null>(null),[selected,setSelected]=useState('');
  const [brief,setBrief]=useState(''),[image,setImage]=useState(''),[alt,setAlt]=useState(''),[appUrl,setAppUrl]=useState('');
  const [result,setResult]=useState<AIStudy|null>(null),[pending,setPending]=useState<Pending|null>(null);
  const [busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[loading,setLoading]=useState(Boolean(initial)),[configured,setConfigured]=useState(false);
  const [error,setError]=useState(initial ? '' : 'Data belum bisa dimuat.'),[message,setMessage]=useState(''),[applied,setApplied]=useState('');
  const dirty=useRef(false),lock=useRef(false),resultRef=useRef<HTMLDivElement>(null),reviewRef=useRef<HTMLDivElement>(null);
  const {ask,confirmation}=useConfirm();
  useRegisterAdminDirty(dirty);
  const disabled=busy||uploading;
  const prepared = looksLikePreparedStudy(brief);
  const [inputMode, setInputMode] = useState<'brief' | 'import'>('brief');
  const importing = inputMode === 'import';
  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(aiStudyBasePrompt);
      setError('');
      setMessage('Prompt disalin.');
    } catch {
      setError('Prompt belum bisa disalin. Periksa izin clipboard, lalu coba lagi.');
    }
  }
  function selectWork(id:string,works=items){
    const work=works.find(value=>value.id===id);setSelected(id);setResult(work?studyFromWork(work):null);setPending(null);setApplied('');setError('');setMessage('');
    setInputMode(looksLikePreparedStudy(work?.aiDraft?.brief || '') ? 'import' : 'brief');setBrief(work?.aiDraft?.brief||(work?.caseStudy?[work.title,work.description,work.caseStudy.problem,work.caseStudy.solution,work.caseStudy.impact,...work.caseStudy.blocks.filter(block=>['heading','paragraph'].includes(block.block_type)).map(block=>String(block.content_json.text||''))].filter(Boolean).join('\n\n').slice(0,30000):''));setImage(work?.image||'');setAlt(work?.imageAlt||'');setAppUrl(work?.caseStudy?.appUrl||'');dirty.current=false;
    const url=new URL(window.location.href);if(id)url.searchParams.set('work',id);else url.searchParams.delete('work');window.history.replaceState(null,'',url);
  }
  const initialized = useRef(false);
  async function load(){
    setLoading(true);setError('');
    try{
      if (initial && !initialized.current) {
        initialized.current = true;
        setItems(initial.items);setRevision(initial.revision);setConfigured(initial.configured);
        const id = new URLSearchParams(window.location.search).get('work') || '';
        selectWork(initial.items.some(item => item.id === id) ? id : '', initial.items);
        return;
      }
      const signal=AbortSignal.timeout(15000);
      const [worksResponse,settingsResponse]=await Promise.all([fetch('/api/admin/works',{cache:'no-store',signal}),fetch('/api/admin/ai/settings',{cache:'no-store',signal})]);
      const works=await worksResponse.json(),settings=await settingsResponse.json();
      if(!worksResponse.ok)throw Error(works.error);if(!settingsResponse.ok)throw Error(settings.error);
      setItems(works.items);setRevision(works.revision);setConfigured(settings.configured);
      const id=new URLSearchParams(window.location.search).get('work')||'';
      selectWork(id&&works.items.some((item:WorkItem)=>item.id===id&&item.kind==='webapp'&&item.caseStudy)?id:'',works.items);
    }catch(e){setError(e instanceof Error?e.message:'Data belum bisa dimuat.');}finally{setLoading(false);}
  }
  useEffect(()=>{ if (initial && !initialized.current) void load(); },[]);
  function changeResult(patch:Partial<AIStudy>){if(result){setResult({...result,...patch});dirty.current=true;setApplied('');}}
  async function generate(target:AITarget='all'){
    if(lock.current||disabled)return;
    if(brief.trim().length<20){setError('Tulis cerita proyek minimal 20 karakter.');return;}
    if(target!=='all'&&!result)return;
    if (target === 'all' && importing && !prepared) { setError('Tempel JSON lengkap dari Copy Prompt.'); return; }
    if(target==='all'&&result&&!await ask('Generate versi baru? Hasilnya ditampilkan terpisah untuk dibandingkan. Tulisan Anda tetap aman sampai Anda memilih hasil baru.','Generate versi baru'))return;
    lock.current=true;setBusy(true);setError('');setMessage(prepared && target==='all' ? 'Memeriksa format ringkasan…' : 'Gemini sedang menyusun draft…');setPending(null);
    try{
      const current=AIStudySchema.safeParse(result);
      const response=await fetch('/api/admin/ai/study-case',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'generate',brief,target,...(current.success?{current:current.data}:{})}),signal:AbortSignal.timeout(55000)}),data=await response.json();
      if(!response.ok)throw Error(data.error);
      const generated=AIStudySchema.parse(data.result);
      if(result){setPending({result:generated,target});requestAnimationFrame(()=>reviewRef.current?.focus());}
      else{setResult(generated);requestAnimationFrame(()=>resultRef.current?.focus());}
      dirty.current=true;setApplied('');setMessage('Draft siap. Cek isinya sebelum disimpan.');
    }catch(e){setError(e instanceof Error&&e.name!=='TimeoutError'?e.message:'Gemini belum selesai. Catatan dan hasil sebelumnya masih ada di halaman ini. Coba lagi.');setMessage('');}
    finally{lock.current=false;setBusy(false);}
  }
  async function apply(){
    if(disabled||!result||revision===null||lock.current)return;
    const parsed=AIStudySchema.safeParse(result);
    if(!parsed.success){setError(parsed.error.issues[0]?.message||'Periksa hasil draft.');return;}
    if(!image){setError('Upload thumbnail terlebih dahulu.');return;}
    if(selected&&!await ask('Simpan hasil ini ke draft? Teks draft akan diganti. Screenshot tetap dipakai dan halaman publik belum berubah.','Simpan hasil ke draft'))return;
    lock.current=true;setBusy(true);setError('');
    try{
      const response=await fetch('/api/admin/ai/study-case',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'apply',revision,id:selected||undefined,brief,result:parsed.data,image,imageAlt:alt,appUrl}),signal:AbortSignal.timeout(20000)}),data=await response.json();
      if(!response.ok)throw Error(data.error);
      dirty.current=false;setApplied(data.id);setSelected(data.id);setRevision(data.revision);setItems(current=>current.some(item=>item.id===data.id)?current.map(item=>item.id===data.id?data.item:item):[...current,data.item]);setMessage('Draft tersimpan. Cek preview sebelum diterbitkan.');
      const url=new URL(window.location.href);url.searchParams.set('work',data.id);window.history.replaceState(null,'',url);
    }catch(e){setError(e instanceof Error&&e.name!=='TimeoutError'?e.message:'Penyimpanan belum selesai. Muat ulang daftar sebelum mencoba lagi untuk menghindari draft ganda.');}
    finally{lock.current=false;setBusy(false);}
  }
  function renderStudy(study:AIStudy,preview=false){
    const fields=[['title','Judul portofolio'],['description','Deskripsi singkat'],['problem','Masalah awal'],['approach','Yang saya buat'],['outcome','Hasilnya']] as const;
    return <>
      {fields.filter(([key])=>!preview||pending?.target==='all'||pending?.target===key).map(([key,label])=><ReviewField key={key} label={label} id={`ai-${preview?'next':'edit'}-${key}`} value={study[key]} disabled={disabled} readOnly={preview} multiline={key!=='title'} maxLength={key==='title'?140:key==='description'?500:1500} onChange={value=>changeResult({[key]:value})} regenerate={!preview&&<button type="button" className="wm-button admin-icon-action" title={`Buat versi lain: ${label}`} aria-label={`Buat versi lain: ${label}`} disabled={disabled||!configured||prepared} onClick={()=>generate(key)}><RotateCw size={18} aria-hidden="true"/></button>}/>)}
      {!selected&&(!preview||pending?.target==='all')&&<label>Slug pendek<input maxLength={32} readOnly={preview} disabled={!preview&&disabled} value={study.slug} onChange={event=>changeResult({slug:event.target.value})}/></label>}
      {study.sections.map((section,index)=>(!preview||pending?.target==='all'||pending?.target===`section:${index}`)&&<details className="ai-story-section" key={index} open={preview?true:undefined}>
        <summary>{section.heading||`Bagian ${index+1}`}</summary>
        {!preview&&<div className="ai-section-action"><button type="button" className="wm-button" disabled={disabled||!configured||prepared} onClick={()=>generate(`section:${index}`)}><RotateCw size={16}/>Buat versi lain</button></div>}
        <ReviewField label="Judul" id={`ai-${preview?'next':'edit'}-heading-${index}`} value={section.heading} disabled={disabled} readOnly={preview} multiline={false} maxLength={160} onChange={heading=>changeResult({sections:study.sections.map((value,at)=>at===index?{...value,heading}:value)})}/>
        <ReviewField label="Ceritanya" id={`ai-${preview?'next':'edit'}-body-${index}`} value={section.body} disabled={disabled} readOnly={preview} maxLength={3000} onChange={body=>changeResult({sections:study.sections.map((value,at)=>at===index?{...value,body}:value)})}/>
      </details>)}
    </>;
  }
  useToastMessage(!busy ? message : '');
  if (loading) return <AdminSkeleton />;
  return <div className="works-manager cms-manager ai-workspace">
    {confirmation}
    <header className="wm-heading"><div><h1>AI Study Case</h1></div><AdminLink href="/admintgadink/dashboard/settings" className="wm-button">Pengaturan AI</AdminLink></header>
    {error&&<p className="cms-error" role="alert">{error}{revision!==null&&<button className="wm-button" disabled={disabled} type="button" onClick={async()=>{if(!dirty.current||await ask('Muat ulang daftar? Editan di halaman ini yang belum disimpan akan dibuang.','Muat ulang'))void load();}}>Muat ulang daftar</button>}</p>}
    {message&&busy&&<p role="status" className="ai-notice"><span className="admin-spinner" aria-hidden="true"/>{message}</p>}
    {loading?<AdminSkeleton />:revision===null?<button type="button" className="wm-button" onClick={load}>Coba lagi</button>:<>
      {!configured&&!importing&&<div className="ai-notice"><p>Catatan bebas butuh API key. Hasil dari Copy Prompt bisa diimpor langsung.</p></div>}
      <div className="ai-authoring-layout">
        <section className="ai-input-panel" aria-labelledby="ai-brief-title"><div className="ai-field-heading"><h2 id="ai-brief-title">Ceritakan proyeknya</h2><button type="button" className="wm-button" onClick={copyPrompt} disabled={busy}><Copy size={16} aria-hidden="true" />Copy Prompt</button></div>
          <div className="ai-actions" role="group" aria-label="Cara menyiapkan draft">
            <button type="button" className="wm-button" aria-pressed={!importing} disabled={disabled} onClick={() => setInputMode('brief')}>Tulis brief</button>
            <button type="button" className="wm-button" aria-pressed={importing} disabled={disabled} onClick={() => setInputMode('import')}>Tempel hasil AI</button>
          </div>
          <fieldset disabled={disabled} className="ai-fields">
            <label>Proyek yang dikerjakan<select value={selected} onChange={async event=>{const id=event.target.value;if(!dirty.current||await ask('Ganti proyek? Editan di halaman ini yang belum disimpan akan dibuang.','Ganti proyek'))selectWork(id);}}><option value="">Buat studi kasus baru</option>{items.filter(item=>item.kind==='webapp'&&item.caseStudy).map(item=><option key={item.id} value={item.id}>Revisi: {item.title}</option>)}</select></label>
            <label>{importing ? "JSON hasil AI" : "Cerita singkat proyek"}<textarea rows={10} maxLength={30000} value={brief} onChange={event=>{setBrief(event.target.value);if (looksLikePreparedStudy(event.target.value)) setInputMode('import');dirty.current=true;setApplied('');}} placeholder={importing ? "Tempel JSON dari Copy Prompt." : "Tulis masalah awal, yang dibuat, dan hasil yang sudah ada. Catatan bebas juga boleh."}/></label>
            <p className="wm-editor-note">{brief.length.toLocaleString('id-ID')}/30.000 karakter</p>
            <label>Link aplikasi (opsional)<input inputMode="url" maxLength={2000} value={appUrl} onChange={event=>{setAppUrl(event.target.value);dirty.current=true;setApplied('');}}/></label>
            <h3>Thumbnail portofolio</h3>
            <FileDrop previewSrc={image} previewAlt={alt||'Thumbnail portofolio'} disabled={disabled} onBusyChange={setUploading} uploadLabel={image?'Ganti thumbnail':'Upload thumbnail'} onUploaded={files=>{setImage(files[0].url);dirty.current=true;setApplied('');}}/>
            <label>Deskripsi thumbnail (aksesibilitas)<input maxLength={250} value={alt} onChange={event=>{setAlt(event.target.value);dirty.current=true;setApplied('');}}/></label>
          </fieldset>
          <button type="button" className="wm-button wm-primary" disabled={disabled||(importing ? !prepared : !configured)||brief.trim().length<20} onClick={()=>generate()} aria-busy={busy}>{busy?'Memproses…':importing?'Impor ringkasan':result?'Generate versi baru':'Generate Study Case'}</button>
          {!importing&&<p className="wm-editor-note">Catatan dikirim ke Gemini saat diproses.</p>}
        </section>
        <div className="ai-review-panel" ref={resultRef} tabIndex={-1} aria-labelledby="ai-review-title">
          <h2 id="ai-review-title">Cek draft</h2>
          {result&&<div className="ai-review-actions"><button type="button" className="wm-button wm-primary" disabled={disabled||!!pending||!!applied||!image||brief.trim().length<20} onClick={apply}>{applied?'Draft tersimpan':'Simpan hasil ke draft'}</button>{applied&&<AdminLink className="wm-button" href={`/admintgadink/dashboard/works?kind=webapp&work=${applied}`}>Lanjut ke editor</AdminLink>}</div>}
          {!result?<div className="ai-empty"><p>Hasil AI muncul di sini.</p></div>:<>
            {pending&&<section className="ai-pending" ref={reviewRef} tabIndex={-1} aria-label="Versi baru dari AI"><h3>Versi baru</h3>{pending.target !== 'all' && <div className="ai-current-copy"><strong>Teks saat ini</strong><p>{pending.target.startsWith('section:') ? result.sections[Number(pending.target.split(':')[1])]?.body : result[pending.target as 'title' | 'description' | 'problem' | 'approach' | 'outcome'] || 'Belum ada teks'}</p></div>}{renderStudy(pending.result,true)}<div className="ai-actions"><button type="button" className="wm-button wm-primary" disabled={disabled} onClick={async()=>{if(await ask('Pakai versi ini untuk mengganti bagian yang dipilih? Bagian lain tetap dipakai.','Pakai versi ini')){setResult(mergeAIRevision(result,pending.result,pending.target));setPending(null);dirty.current=true;setApplied('');}}}>Pakai versi ini</button><button type="button" className="wm-button" disabled={disabled} onClick={()=>setPending(null)}>Tetap pakai teks lama</button></div></section>}

            {!pending && renderStudy(result)}
            <section className="ai-private-notes"><h3>Perlu dicek</h3>{result.confirmations.length?<ul>{result.confirmations.map((text,index)=><li key={index}>{text}</li>)}</ul>:<p>Tidak ada yang perlu dicek.</p>}</section>
            {!!result.screenshots.length&&<section className="ai-private-notes"><h3>Saran screenshot</h3><ul>{result.screenshots.map((shot,index)=><li key={index}><strong>Setelah bagian {shot.afterSection+1}</strong><p>{shot.description}</p>{shot.caption&&<p>Caption: {shot.caption}</p>}</li>)}</ul></section>}
          </>}
        </div>
      </div>
    </>}
  </div>;
}
