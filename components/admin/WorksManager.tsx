'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Trash2, Upload, ExternalLink, RotateCcw } from 'lucide-react';
import { WorkItemSchema, workKinds, workLabels, type WorkItem, type WorkKind } from '@/lib/works';
import './works-manager.css';

export function WorksManager() {
  const [items,setItems]=useState<WorkItem[]>([]), [saved,setSaved]=useState<WorkItem[]>([]);
  const [kind,setKind]=useState<WorkKind>('webapp'), [revision,setRevision]=useState('');
  const [loading,setLoading]=useState(true), [saving,setSaving]=useState(false), [uploading,setUploading]=useState('');
  const [initialized,setInitialized]=useState(true);
  const [error,setError]=useState(''), [notice,setNotice]=useState('');
  const [removed,setRemoved]=useState<{item:WorkItem,index:number}|null>(null);
  const dirty=JSON.stringify(items)!==JSON.stringify(saved);
  const busy=saving||!!uploading;
  const dirtyRef=useRef(dirty);dirtyRef.current=dirty;

  async function load() {
    setLoading(true);setError('');
    try {const res=await fetch('/api/admin/works',{cache:'no-store'});const data=await res.json();if(!res.ok)throw Error(data.error);setItems(data.items);setSaved(data.items);setRevision(data.revision);setInitialized(data.initialized);}
    catch(err){setError(err instanceof Error?err.message:'Karya belum bisa dimuat.');}
    finally{setLoading(false);}
  }
  useEffect(()=>{load();},[]);
  useEffect(()=>{
    const unload=(e:BeforeUnloadEvent)=>{if(dirtyRef.current){e.preventDefault();e.returnValue='';}};
    const leave=(e:MouseEvent)=>{const a=(e.target as HTMLElement).closest('a');if(dirtyRef.current&&a&&a.target!=='_blank'&&!window.confirm('Perubahan belum disimpan. Tinggalkan halaman?')){e.preventDefault();e.stopPropagation();}};
    window.addEventListener('beforeunload',unload);document.addEventListener('click',leave,true);
    return()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',leave,true);};
  },[]);
  const update=(id:string,patch:Partial<WorkItem>)=>{setItems(current=>current.map(item=>item.id===id?{...item,...patch}:item));setNotice('');};
  function add(){const item:WorkItem={id:crypto.randomUUID(),kind,title:'Karya baru',description:'',image:'',imageAlt:'',url:'',published:false,demo:true,artwork:'sample'};setItems(current=>[...current,item]);setNotice('Karya baru ditambahkan sebagai tersembunyi. Lengkapi lalu tampilkan.');}
  function move(id:string,delta:number){setItems(current=>{const next=[...current];const positions=current.map((item,i)=>item.kind===kind?i:-1).filter(i=>i>=0);const index=current.findIndex(item=>item.id===id);const target=positions[positions.indexOf(index)+delta];if(target===undefined)return current;[next[index],next[target]]=[next[target],next[index]];return next;});setNotice('');}
  async function upload(id:string,file?:File){
    if(!file)return;if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>10*1024*1024){setError('Pilih JPG, PNG, WebP, atau GIF maksimal 10 MB.');return;}
    setUploading(id);setError('');
    try{const form=new FormData();form.append('file',file);form.append('folder','works');const res=await fetch('/api/admin/media',{method:'POST',body:form});const data=await res.json();if(!res.ok)throw Error(data.error);update(id,{image:data.url});setNotice('Gambar terunggah. Simpan perubahan untuk menampilkannya.');}
    catch(err){setError(err instanceof Error?err.message:'Upload gagal.');}finally{setUploading('');}
  }
  async function save(){
    setError('');setNotice('');
    for(const item of items){const result=WorkItemSchema.safeParse(item);if(!result.success){setError(`${item.title}: ${result.error.issues[0].message}`);setKind(item.kind);return;}}
    setSaving(true);
    try{const res=await fetch('/api/admin/works',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,revision})});const data=await res.json();if(!res.ok)throw Error(data.error);setSaved(data.items);setItems(data.items);setRevision(data.revision);setInitialized(true);setRemoved(null);setNotice('Tersimpan. Homepage dan halaman koleksi memakai perubahan ini.');}
    catch(err){setError(err instanceof Error?err.message:'Perubahan belum tersimpan.');}finally{setSaving(false);}
  }
  const visible=items.filter(item=>item.kind===kind);
  return <div className="works-manager">
    <div className="wm-heading"><div><h1>Works</h1><p>Atur karya untuk homepage dan halaman View all.</p></div><a className="wm-button" href={`/${kind}`} target="_blank" rel="noopener noreferrer">Lihat koleksi <ExternalLink size={18} aria-hidden="true" /></a></div>
    {error&&<div className="wm-message wm-error" role="alert">{error}{!revision&&<button className="wm-button" onClick={load}>Coba lagi</button>}</div>}
    {notice&&<p className="wm-message" role="status">{notice}</p>}
    {loading?<p role="status">Memuat karya…</p>:revision&&<>
      <div className="wm-tabs" role="group" aria-label="Kategori karya">{workKinds.map(value=><button key={value} type="button" className="wm-button" aria-pressed={kind===value} onClick={()=>setKind(value)}>{workLabels[value]} <span>{items.filter(item=>item.kind===value).length}</span></button>)}</div>
      <p className="wm-help">{kind==='webapp'?'Enam karya pertama yang ditampilkan membentuk grid 3 × 2 di homepage. Sisanya tersedia di /webapp.':kind==='design'?'Gambar tampil dalam carousel otomatis di homepage. Koleksi lengkap tersedia di /design.':'Gunakan link Instagram Reel atau post publik yang mengizinkan embed. Pemutaran mengikuti kontrol Instagram. Judul tampil di kiri bawah thumbnail.'}</p>
      <div className="wm-toolbar"><button type="button" className="wm-button" onClick={add} disabled={busy}><Plus size={18} aria-hidden="true" /> Tambah karya</button><span>{dirty?'Ada perubahan belum disimpan':initialized?'Semua perubahan tersimpan':'Data awal — simpan untuk mulai mengelola'}</span><button type="button" className="wm-button" disabled={!dirty||busy} onClick={()=>{setItems(saved);setRemoved(null);setNotice('Perubahan dibatalkan.');setError('');}}><RotateCcw size={18} aria-hidden="true" /> Batalkan</button><button type="button" className="wm-button wm-primary" disabled={(!dirty&&initialized)||busy} onClick={save}><Save size={18} aria-hidden="true" />{saving?'Menyimpan…':'Simpan perubahan'}</button></div>
      {removed&&<div className="wm-message">{removed.item.title} dihapus dari daftar. <button type="button" className="wm-button" disabled={busy} onClick={()=>{setItems(current=>{const next=[...current];next.splice(removed.index,0,removed.item);return next;});setRemoved(null);}}>Urungkan hapus</button></div>}
      {!visible.length&&<p className="wm-empty">Belum ada karya di kategori ini. Tambahkan karya pertama Anda.</p>}
      <div className="wm-list">{visible.map((item,index)=><details key={item.id} className="wm-item" open={undefined}>
        <summary><span className="wm-thumb">{item.image?<img src={item.image} alt="" onError={e=>e.currentTarget.style.visibility='hidden'} />:<span>{workLabels[item.kind]}</span>}</span><span className="wm-summary"><strong>{item.title}</strong><span>{item.published?'Ditampilkan':'Tersembunyi'}{item.demo?' · Data contoh':''}</span></span><span className="wm-edit">Edit</span></summary>
        <fieldset disabled={busy} className="wm-fields"><legend className="sr-only">Edit {item.title}</legend>
          <label>Judul<input value={item.title} maxLength={140} onChange={e=>update(item.id,{title:e.target.value})} /></label>
          <label>Kategori<select value={item.kind} onChange={e=>update(item.id,{kind:e.target.value as WorkKind})}>{workKinds.map(value=><option value={value} key={value}>{workLabels[value]}</option>)}</select></label>
          <label className="wm-wide">Deskripsi<textarea value={item.description} maxLength={500} rows={2} onChange={e=>update(item.id,{description:e.target.value})} /></label>
          <label className="wm-wide">{kind==='video'?'Link Instagram':kind==='webapp'?'Link studi kasus atau aplikasi':'Link referensi (opsional)'}<input type="text" inputMode="url" value={item.url} placeholder={kind==='video'?'https://www.instagram.com/reel/…/':'https://… atau /work/nama-project'} onChange={e=>update(item.id,{url:e.target.value})} /></label>
          <label className="wm-wide">Gambar / thumbnail<input type="text" inputMode="url" value={item.image} placeholder="Upload gambar atau masukkan URL gambar Supabase" onChange={e=>update(item.id,{image:e.target.value})} /></label>
          <label className="wm-upload"><Upload size={18} aria-hidden="true" />{uploading===item.id?'Mengunggah…':'Upload gambar'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>{upload(item.id,e.target.files?.[0]);e.target.value='';}} /></label>
          <label>Deskripsi gambar (alt)<input value={item.imageAlt} maxLength={250} onChange={e=>update(item.id,{imageAlt:e.target.value})} /></label>
          <label className="wm-check"><input type="checkbox" checked={item.published} onChange={e=>update(item.id,{published:e.target.checked})} />Tampilkan karya</label>
          <label className="wm-check"><input type="checkbox" checked={item.demo} onChange={e=>update(item.id,{demo:e.target.checked})} />Tandai sebagai data contoh</label>
          <div className="wm-item-actions wm-wide"><button type="button" className="wm-button" disabled={index===0} onClick={()=>move(item.id,-1)}><ArrowUp size={18} aria-hidden="true" />Naik</button><button type="button" className="wm-button" disabled={index===visible.length-1} onClick={()=>move(item.id,1)}><ArrowDown size={18} aria-hidden="true" />Turun</button><button type="button" className="wm-button wm-delete" onClick={()=>{setRemoved({item,index:items.indexOf(item)});setItems(current=>current.filter(other=>other.id!==item.id));setNotice('');}}><Trash2 size={18} aria-hidden="true" />Hapus</button></div>
        </fieldset>
      </details>)}</div>
    </>}
  </div>;
}
