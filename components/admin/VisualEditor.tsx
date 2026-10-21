'use client';
import { useEffect, useRef, useState } from 'react';
import type { Editor, Component } from 'grapesjs';
import { ArrowLeft, Undo2, Redo2, Monitor, Smartphone, Eye, Save, Layers, Plus, SlidersHorizontal, ArrowUp, ArrowDown, Trash2, ExternalLink, Type, Image as ImageIcon, X } from 'lucide-react';
import { FileDrop } from './FileDrop';
import { AdminActionLabel } from './AdminActionLabel';
import './admin-controls.css';
import { useConfirm } from './ConfirmDialog';
import 'grapesjs/dist/css/grapes.min.css';
import './visual-editor.css';

type PageData={revision:number;layout?:{html:string;css:string};seedHtml?:string;title:string;seedUrl:string;previewUrl:string};
export function VisualEditor({target}:{target:string}){
  const {ask,confirmation}=useConfirm();
  const canvas=useRef<HTMLDivElement>(null),editor=useRef<Editor|null>(null),meta=useRef<PageData|null>(null),dirtyRef=useRef(false);
  const baseline=useRef({html:'',css:''});
  const saveLock=useRef(false),selectedRef=useRef<Component|null>(null);
  const [canUndo,setCanUndo]=useState(false),[canRedo,setCanRedo]=useState(false);
  const [tab,setTab]=useState('content'),[title,setTitle]=useState('Editor konten'),[status,setStatus]=useState('Memuat halaman…'),[error,setError]=useState(''),[ready,setReady]=useState(false),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[device,setDevice]=useState('Desktop'),[preview,setPreview]=useState(false),[panelOpen,setPanelOpen]=useState(false);
  const [selection,setSelection]=useState<SelectionData|null>(null),[sections,setSections]=useState<Component[]>([]),[activeSection,setActiveSection]=useState<Component|null>(null),[action,setAction]=useState('');
  function sync(ed:Editor){
    setCanUndo(ed.UndoManager.hasUndo());setCanRedo(ed.UndoManager.hasRedo());
    setSections(pageSections(ed));
    const component=selectedRef.current;
    setActiveSection(component?sectionOf(component,ed):null);
    setSelection(component?readSelection(component):null);
  }
  useEffect(()=>{
    const mobile=window.matchMedia('(max-width:700px)').matches;
    if(!panelOpen||!mobile)return;
    document.querySelector<HTMLButtonElement>('.visual-panel-close')?.focus();
    const trap=(event:KeyboardEvent)=>{
      if(event.key!=='Tab')return;
      const items=Array.from(document.querySelectorAll<HTMLElement>('.visual-sidebar button:not(:disabled),.visual-sidebar a[href],.visual-sidebar input:not(:disabled),.visual-sidebar textarea:not(:disabled)')).filter(item=>item.getClientRects().length);
      const first=items[0],last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',trap);return()=>document.removeEventListener('keydown',trap);
  },[panelOpen]);
  useEffect(()=>{
    let cancelled=false;
    const controller=new AbortController();
    async function start(){
      try{
        const [module,res]=await Promise.all([import('grapesjs'),fetch(`/api/admin/visual?target=${encodeURIComponent(target)}`,{signal:controller.signal,cache:'no-store'})]);
        const data:PageData&{error?:string}=await res.json();if(!res.ok)throw Error(data.error||'Halaman belum bisa dimuat.');
        let html=data.layout?.html||'',css=data.layout?.css||'';
        if(!data.layout){
          let seedHtml=data.seedHtml;
          if(!seedHtml){const seed=await fetch(data.seedUrl,{signal:controller.signal,cache:'no-store'});if(!seed.ok)throw Error('Preview belum bisa dimuat.');seedHtml=await seed.text();}
          const parsed=new DOMParser().parseFromString(seedHtml,'text/html');
          parsed.querySelectorAll('script,noscript,style,link,.skip-link').forEach(el=>el.remove());
          const root=target==='home'?parsed.body:parsed.querySelector('main');
          if(!root)throw Error('Konten halaman tidak ditemukan.');
          if(target!=='home')root.querySelector('a.text-link')?.remove();
          html=target==='home'?root.innerHTML:`<div class="showcase"><main class="case-page section-shell">${root.innerHTML}</main></div>`;
        }
        const worksResponse=target==='home'?await fetch('/api/admin/works-preview',{signal:controller.signal,cache:'no-store'}):null;
        if(worksResponse&&!worksResponse.ok)throw Error('Koleksi Portfolio belum bisa dimuat. Coba lagi.');
        const works=worksResponse?(await worksResponse.json()).items:[];
        const parsedLayout=new DOMParser().parseFromString(html,'text/html');
        parsedLayout.querySelectorAll('[data-works-list]').forEach(el=>{el.innerHTML='';el.setAttribute('data-gjs-type','works-feed');el.setAttribute('aria-busy','false');});
        html=parsedLayout.body.innerHTML;
        if(cancelled||!canvas.current)return;
        meta.current=data;setTitle(data.title);
        const ed=module.default.init({
          container:canvas.current,height:'100%',width:'auto',storageManager:false,noticeOnUnload:false,
          parser:{optionsHtml:{allowScripts:false,allowUnsafeAttr:false,allowUnsafeAttrValue:false}},components:html,style:css,fromElement:false,
          plugins:[(instance)=>{
            instance.Components.addType('works-feed',{
              isComponent:el=>el.hasAttribute?.('data-works-list')?{type:'works-feed'}:false,
              model:{defaults:{name:'Koleksi Portfolio',droppable:false,editable:false,draggable:false,copyable:false,removable:false}},
              view:{onRender(){
                const kind=this.model.parents().find(parent=>parent.getAttributes()['data-work-kind'])?.getAttributes()['data-work-kind'];
                const items=works.filter((item:any)=>item.kind===kind).slice(0,kind==='webapp'?6:50);
                this.el.replaceChildren(...items.map((item:any)=>{
                  const card=document.createElement('article');card.className=`work-card work-card-${item.kind}`;
                  const visual=document.createElement('div');visual.className='work-visual';
                  if(item.image){const image=document.createElement('img');image.src=item.image;image.alt=item.imageAlt||item.title;visual.append(image);}else{visual.style.cssText='min-height:180px;padding:24px;background:#20231d;display:flex;align-items:center';visual.textContent=item.title;}
                  const heading=document.createElement('h3');heading.className='work-card-title';heading.textContent=item.title;
                  card.append(visual,heading);return card;
                }));
              }},
            });
          }],
          panels:{defaults:[]},
          canvas:{styles:['/assets/css/portfolio.css','/assets/css/showcase.css','/assets/css/visual-content.css']},
          styleManager:{sectors:[]},
          deviceManager:{devices:[{id:'Desktop',name:'Desktop',width:''},{id:'Tablet',name:'Tablet',width:'768px',widthMedia:'1024px'},{id:'Mobile',name:'Mobile',width:'390px',widthMedia:'600px'}]},
          assetManager:{custom:true},
        });
        editor.current=ed;
        function protect(component:Component){
          component.set({draggable:false,droppable:false,editable:false,resizable:false,copyable:false,removable:false,toolbar:[]},{silent:true});
          component.components().forEach(protect);
        }
        ed.getWrapper()?.components().forEach(protect);
        ed.on('component:add',protect);
        ed.on('component:selected',(component)=>{
          const link=[component,...component.parents()].find(item=>item.get('tagName')==='a');
          const chosen=component.is('image')?component:link||component;
          selectedRef.current=chosen;sync(ed);setTab('content');setPanelOpen(true);
        });
        ed.on('component:deselected',()=>{selectedRef.current=null;setSelection(null);setActiveSection(null);});
        ed.on('undo redo',()=>{selectedRef.current=ed.getSelected()||null;sync(ed);});
        ed.on('asset:custom',()=>{setTab('content');setPanelOpen(true);});
        ed.on('update',()=>{if(cancelled)return;const changed=ed.getHtml()!==baseline.current.html||(ed.getCss()||'')!==baseline.current.css;dirtyRef.current=changed;setDirty(changed);if(changed)setStatus('Belum disimpan');sync(ed);});
        ed.on('load',()=>{
          const doc=ed.Canvas.getDocument();if(!doc)return;
          ed.getWrapper()?.addClass('showcase');
          ed.getWrapper()?.findType('works-feed').forEach(component=>component.getView()?.render());
          ed.UndoManager.clear();ed.clearDirtyCount();baseline.current={html:ed.getHtml(),css:ed.getCss()||''};dirtyRef.current=false;setDirty(false);setStatus(data.layout?'Draft dimuat':'Siap diedit');setReady(true);
          doc.addEventListener('click',event=>{if((event.target as Element)?.closest('a'))event.preventDefault();});
          const style=doc.createElement('style');style.textContent='html{scroll-behavior:auto!important}body{background:#060706;color:#f3f0e8}.reveal{opacity:1!important;transform:none!important}[data-works-list]:empty{min-height:120px}';doc.head.appendChild(style);
          if(target==='home'){doc.body.dataset.cmsPreview='true';const script=doc.createElement('script');script.src='/assets/js/works.js';doc.body.appendChild(script);}
          sync(ed);
        });
      }catch(e){if(cancelled)return;setError(e instanceof Error?e.message:'Editor belum tersedia.');setStatus('Gagal memuat');}
    }
    start();
    const unload=(event:BeforeUnloadEvent)=>{if(dirtyRef.current){event.preventDefault();event.returnValue='';}};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setPanelOpen(false);document.querySelector<HTMLButtonElement>('.visual-panel-toggle')?.focus();}};
    window.addEventListener('keydown',escape);
    window.addEventListener('beforeunload',unload);
    return()=>{cancelled=true;controller.abort();window.removeEventListener('keydown',escape);window.removeEventListener('beforeunload',unload);editor.current?.destroy();editor.current=null;};
  },[target]);
  async function save(action:'save'|'publish'){
    const ed=editor.current,data=meta.current;if(!ed||!data||saveLock.current||uploading)return;
    saveLock.current=true;
    setBusy(true);setAction(action);setError('');
    try{

      const layout={html:ed.getHtml(),css:ed.getCss()||''};
      const res=await fetch('/api/admin/visual',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({target,revision:data.revision,action,layout})});
      const result=await res.json();if(!res.ok)throw Error(result.error||'Perubahan belum tersimpan.');
      const changedDuringSave=ed.getHtml()!==layout.html||(ed.getCss()||'')!==layout.css;
      if(!changedDuringSave&&result.layout&&(result.layout.html!==layout.html||result.layout.css!==layout.css)){
        ed.setComponents(result.layout.html);ed.setStyle(result.layout.css);ed.UndoManager.clear();selectedRef.current=null;ed.select();sync(ed);
      }
      if(!changedDuringSave)baseline.current={html:ed.getHtml(),css:ed.getCss()||''};
      meta.current={...data,revision:result.revision,layout:result.layout};if(result.title)setTitle(result.title);const changed=changedDuringSave;dirtyRef.current=changed;setDirty(changed);if(!changed)ed.clearDirtyCount();setStatus(changed?'Tersimpan, ada perubahan baru':action==='publish'?'Sudah dipublikasikan':'Draft tersimpan');
    }catch(e){setError(e instanceof Error?e.message:'Perubahan belum tersimpan.');}finally{saveLock.current=false;setBusy(false);}
  }
  function leave(event:React.MouseEvent<HTMLAnchorElement>){if(dirtyRef.current){event.preventDefault();const href=event.currentTarget.href;void ask('Editan belum disimpan. Tetap keluar?', 'Tinggalkan').then(yes=>{if(yes){dirtyRef.current=false;window.location.assign(href);}});}}
  function setViewport(value:string){editor.current?.setDevice(value);setDevice(value);}
  function editText(index:number,value:string){
    const component=selectedRef.current;if(!component)return;
    const doc=new DOMParser().parseFromString(component.getInnerHTML(),'text/html');
    const nodes=textNodes(doc.body);if(!nodes[index]){if(index!==0)return;const node=doc.createTextNode('');doc.body.insertBefore(node,doc.body.firstChild);nodes.push(node);}nodes[index].textContent=value;
    component.components(doc.body.innerHTML);if(editor.current)sync(editor.current);
  }
  function attribute(name:string,value:string){const component=selectedRef.current;if(component){component.addAttributes({[name]:value});if(editor.current)sync(editor.current);}}
  function moveSection(component:Component,direction:number){
    const ed=editor.current,parent=component.parent();if(!ed||!parent)return;
    const list=pageSections(ed),index=list.indexOf(component),neighbor=list[index+direction];
    if(!neighbor||neighbor.parent()!==parent)return;
    component.move(parent,{at:parent.components().indexOf(neighbor)+(direction>0?1:0)});ed.select(component);sync(ed);
  }
  async function removeSection(component:Component){
    if(!await ask(`Hapus bagian “${sectionTitle(component)}”? Bisa dikembalikan lewat Urungkan.`))return;
    component.remove();selectedRef.current=null;editor.current?.select();if(editor.current)sync(editor.current);
  }
  function addSection(html:string){
    const ed=editor.current;if(!ed)return;
    const list=pageSections(ed),after=activeSection||list.at(-1),parent=after?.parent()||ed.getWrapper()?.find('main')[0]||ed.getWrapper();
    if(!parent)return;
    const [component]=parent.append(html,after?{at:parent.components().indexOf(after)+1}:{});
    ed.select(component);sync(ed);component.getEl()?.scrollIntoView({block:'center',behavior:'smooth'});setTab('content');
  }
  const sectionIndex=activeSection?sections.indexOf(activeSection):-1;
  return <div className={`visual-editor ${preview?'visual-preview':''} ${panelOpen?'visual-panel-open':''}`}>
    {confirmation}
    <header className="visual-toolbar">
      <a href={target==='home'?'/admintgadink/dashboard/site':'/admintgadink/dashboard/works'} onClick={leave} className="visual-icon" aria-label="Kembali ke CMS"><ArrowLeft size={20}/></a>
      <div className="visual-title"><h1>{title}</h1><span role="status">{busy?(action==='publish'?'Mempublikasikan…':'Menyimpan draft…'):status}{uploading?' · Mengunggah…':''}</span></div>
      <div className="visual-history"><button aria-label="Urungkan" disabled={!ready||busy||uploading||!canUndo} onClick={()=>editor.current?.UndoManager.undo()}><Undo2 size={18}/></button><button aria-label="Ulangi" disabled={!ready||busy||uploading||!canRedo} onClick={()=>editor.current?.UndoManager.redo()}><Redo2 size={18}/></button></div>
      <div className="visual-devices" aria-label="Ukuran kanvas"><button aria-label="Desktop" aria-pressed={device==='Desktop'} disabled={!ready} onClick={()=>setViewport('Desktop')}><Monitor size={18}/></button><button aria-label="Mobile" aria-pressed={device==='Mobile'} disabled={!ready} onClick={()=>setViewport('Mobile')}><Smartphone size={18}/></button></div>
      <button className="visual-panel-toggle" aria-label="Panel editor" aria-expanded={panelOpen} onClick={()=>setPanelOpen(!panelOpen)} disabled={preview}><SlidersHorizontal size={18}/><span>Panel</span></button>
      <button aria-label="Preview halaman" aria-pressed={preview} onClick={()=>{const ed=editor.current;if(preview)ed?.stopCommand('preview');else ed?.runCommand('preview');setPreview(!preview);}} disabled={!ready||busy}><Eye size={18}/><span>{preview?'Kembali edit':'Preview'}</span></button>
      <button aria-label="Simpan draft" aria-busy={busy&&action==='save'} disabled={!ready||busy||uploading||!dirty} onClick={()=>save('save')}><AdminActionLabel pending={busy&&action==='save'} idle="Simpan draft" busy="Menyimpan…" icon={<Save size={18}/>}/></button>
      <button className="visual-publish" aria-label="Publikasikan" aria-busy={busy&&action==='publish'} disabled={!ready||busy||uploading} onClick={()=>save('publish')}><AdminActionLabel pending={busy&&action==='publish'} idle="Publikasikan" busy="Menerbitkan…"/></button>
    </header>
    {error&&<div role="alert" className="visual-error">{error}{!ready?<button onClick={()=>window.location.reload()}>Coba lagi</button>:<button onClick={()=>setError('')} aria-label="Tutup pesan">Tutup</button>}</div>}
    {preview&&<p className="visual-preview-note">Ini preview-nya. <a href={dirty?undefined:meta.current?.previewUrl} aria-disabled={dirty} target="_blank" rel="noopener noreferrer">Buka halaman tersimpan <ExternalLink size={14}/></a>{dirty&&' Simpan draft untuk membuka halaman.'}</p>}
    <div className="visual-workspace" aria-busy={busy}>
      {panelOpen&&<button className="visual-panel-backdrop" aria-label="Tutup panel" onClick={()=>setPanelOpen(false)}/>}
      <aside className="visual-sidebar" aria-label="Panel konten" inert={busy||uploading||!ready}>
        <div className="visual-panel-heading"><h2>Edit halaman</h2><button className="visual-panel-close" aria-label="Tutup panel konten" onClick={()=>setPanelOpen(false)}><X size={18}/></button></div>
        <nav aria-label="Panel editor">{[['content','Konten',Type],['sections','Bagian',Layers],['add','Tambah',Plus]].map(([value,label,Icon])=><button key={value as string} aria-pressed={tab===value} onClick={()=>setTab(value as string)}><Icon size={16}/>{label as string}</button>)}</nav>
        {tab==='content'&&<div className="visual-content-panel">
          {!selection?<div className="visual-empty"><Type size={24}/><h3>Mau edit yang mana?</h3><p>Klik teks, gambar, atau tombol di preview.</p></div>:<>
            <h3>{selection.label}</h3>
            {selection.managed?<><p className="visual-hint">Portfolio di sini terhubung ke menu Portfolio.</p><a className="visual-text-link" href="/admintgadink/dashboard/works" onClick={leave}>Kelola Portfolio <ExternalLink size={14}/></a></>:<>
              {selection.texts.map((text,index)=><label className="visual-field" key={`${selectedRef.current?.cid}-${index}`}>{selection.texts.length===1?'Teks':`Teks ${index+1}`}<TextField value={text} onDirty={()=>{dirtyRef.current=true;setDirty(true);setStatus('Belum disimpan');}} onCommit={value=>editText(index,value)}/></label>)}
              {selection.image&&<><img className="visual-image-preview" src={selection.src} alt="Gambar yang dipilih"/><label className="visual-field">Deskripsi gambar<input value={selection.alt} onChange={event=>attribute('alt',event.target.value)}/></label><FileDrop disabled={busy} onBusyChange={setUploading} onUploaded={files=>{const component=selectedRef.current;if(component?.is('image')&&files[0]){component.set('src',files[0].url);if(editor.current)sync(editor.current);}}}/></>}
              {selection.link&&<><label className="visual-field">Tujuan link<input type="text" inputMode="url" value={selection.href} placeholder="https://… atau #contact" onChange={event=>attribute('href',event.target.value)}/></label><label className="visual-check"><input type="checkbox" checked={selection.blank} onChange={event=>{attribute('target',event.target.checked?'_blank':'_self');attribute('rel',event.target.checked?'noopener noreferrer':'');}}/>Buka di tab baru</label></>}
              {!selection.texts.length&&!selection.image&&!selection.link&&<p className="visual-hint">Pilih teks atau gambar di bagian ini buat lanjut edit.</p>}
            </>}
            {activeSection&&<button className="visual-section-shortcut" onClick={()=>setTab('sections')}><Layers size={16}/>Atur bagian: {sectionTitle(activeSection)}</button>}
          </>}
        </div>}
        {tab==='sections'&&<div className="visual-section-panel"><h3>Susunan halaman</h3><p className="visual-hint">Pilih bagiannya, lalu geser urutannya.</p><ol className="visual-section-list">{sections.map(component=><li key={component.cid}><button aria-pressed={activeSection===component} onClick={()=>{editor.current?.select(component);setTab('sections');component.getEl()?.scrollIntoView({block:'center',behavior:'smooth'});}}>{sectionTitle(component)}</button></li>)}</ol>
          {activeSection&&<div className="visual-section-controls"><strong>{sectionTitle(activeSection)}</strong><div><button aria-label="Pindah bagian ke atas" disabled={sectionIndex<=0||sections[sectionIndex-1]?.parent()!==activeSection.parent()} onClick={()=>moveSection(activeSection,-1)}><ArrowUp size={16}/></button><button aria-label="Pindah bagian ke bawah" disabled={sectionIndex<0||sectionIndex>=sections.length-1||sections[sectionIndex+1]?.parent()!==activeSection.parent()} onClick={()=>moveSection(activeSection,1)}><ArrowDown size={16}/></button><button className="visual-delete" aria-label="Hapus bagian" onClick={()=>removeSection(activeSection)}><Trash2 size={16}/>Hapus</button></div></div>}
        </div>}
        {tab==='add'&&<div className="visual-templates"><h3>Tambah bagian</h3><p className="visual-hint">{activeSection?`Setelah “${sectionTitle(activeSection)}”`:'Di akhir konten halaman'}</p>{templates.map(item=><button key={item.title} onClick={()=>addSection(item.html)}><item.icon size={20}/><span>{item.title}</span><Plus size={16}/></button>)}</div>}
        <p className="visual-publish-hint">Simpan draft dulu kalau belum siap. Klik Publikasikan saat sudah oke.</p>
      </aside>
      <div className="visual-canvas" ref={canvas} inert={busy||uploading}/>
      {!ready&&!error&&<div className="visual-loading" role="status"><span className="admin-spinner"/>Menyiapkan halaman…</div>}
    </div>
  </div>;
}

type SelectionData={label:string;texts:string[];image:boolean;src:string;alt:string;link:boolean;href:string;blank:boolean;managed:boolean};
function textNodes(root:Node):Text[]{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes:Text[]=[];
  while(walker.nextNode()){
    const node=walker.currentNode as Text;
    if(node.textContent?.trim()&&!node.parentElement?.closest('svg,script,style,[data-works-list]'))nodes.push(node);
  }
  return nodes;
}
function readSelection(component:Component):SelectionData{
  const tag=component.get('tagName')||'',attrs=component.getAttributes();
  const managed=[component,...component.parents()].some(item=>item.getAttributes()['data-works-list']!==undefined);
  const isText=/^(h[1-6]|p|span|em|strong|a|button|li|figcaption|blockquote)$/.test(tag);
  const doc=new DOMParser().parseFromString(component.getInnerHTML(),'text/html');
  return {label:component.is('image')?'Gambar':tag==='a'?'Tombol / tautan':isText?'Teks':'Bagian halaman',texts:!managed&&isText?(textNodes(doc.body).length?textNodes(doc.body).map(node=>node.textContent||''):['']):[],image:component.is('image'),src:component.get('src')||attrs.src||'',alt:attrs.alt||'',link:tag==='a',href:attrs.href||'',blank:attrs.target==='_blank',managed};
}
function pageSections(ed:Editor):Component[]{
  const wrapper=ed.getWrapper();if(!wrapper)return [];
  const main=wrapper.find('main')[0]||wrapper;
  const all=main.find('section');
  if(all.length)return all.filter(component=>!component.parents().some(parent=>parent!==main&&parent.get('tagName')==='section'));
  return main.components().filter((component:Component)=>!['script','style','header','footer','nav','dialog'].includes(component.get('tagName')||''));
}
function sectionOf(component:Component,ed:Editor){const sections=pageSections(ed);return [component,...component.parents()].find(parent=>sections.includes(parent))||null;}
function sectionTitle(component:Component){
  const heading=/^h[1-3]$/.test(component.get('tagName')||'')?component:component.find('h1,h2,h3')[0];
  const doc=new DOMParser().parseFromString(heading?.getInnerHTML()||'','text/html');
  return doc.body.textContent?.trim().replace(/\s+/g,' ').slice(0,64)||component.getAttributes()['aria-label']||({'text':'Judul & teks','image':'Gambar & keterangan','columns':'Dua kolom','cta':'Ajakan & tombol'} as Record<string,string>)[component.getAttributes()['data-cms-section']]||component.find('img')[0]?.getAttributes().alt||'Bagian';
}
const templates=[
  {title:'Judul & teks',icon:Type,html:'<section class="visual-section" data-cms-section="text"><h2>Judul bagian</h2><p>Tulis konten Anda di sini.</p></section>'},
  {title:'Gambar & keterangan',icon:ImageIcon,html:'<section class="visual-section" data-cms-section="image"><figure><img src="/assets/images/hero-dark.jpg" alt="Ganti dengan gambar Anda"/><figcaption>Keterangan gambar</figcaption></figure></section>'},
  {title:'Dua kolom',icon:Layers,html:'<section class="visual-section visual-columns" data-cms-section="columns"><div class="visual-column"><h2>Judul pertama</h2><p>Tulis konten Anda di sini.</p></div><div class="visual-column"><h2>Judul kedua</h2><p>Tulis konten Anda di sini.</p></div></section>'},
  {title:'Ajakan & tombol',icon:ExternalLink,html:'<section class="visual-section" data-cms-section="cta"><h2>Mari terhubung</h2><a class="button button-solid" href="#contact">Hubungi saya</a></section>'},
];

function TextField({value,onCommit,onDirty}:{value:string;onDirty:()=>void;onCommit:(value:string)=>void}){
  const [draft,setDraft]=useState(value);
  useEffect(()=>setDraft(value),[value]);
  return <textarea rows={Math.min(6,Math.max(2,draft.split('\n').length))} value={draft} onChange={event=>{setDraft(event.target.value);onDirty();}} onBlur={()=>{if(draft!==value)onCommit(draft);}}/>;
}
