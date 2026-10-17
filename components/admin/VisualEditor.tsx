'use client';
import { useEffect, useRef, useState } from 'react';
import type { Editor } from 'grapesjs';
import { ArrowLeft, Undo2, Redo2, Monitor, Smartphone, Eye, Save, Layers, Plus, SlidersHorizontal, ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';
import { FileDrop } from './FileDrop';
import { useConfirm } from './ConfirmDialog';
import 'grapesjs/dist/css/grapes.min.css';
import './visual-editor.css';

type PageData={revision:number;layout?:{html:string;css:string};seedHtml?:string;title:string;seedUrl:string;previewUrl:string};
export function VisualEditor({target}:{target:string}){
  const {ask,confirmation}=useConfirm();
  const canvas=useRef<HTMLDivElement>(null),editor=useRef<Editor|null>(null),meta=useRef<PageData|null>(null),dirtyRef=useRef(false);
  const activeText=useRef<{disableEditing:()=>Promise<void>}|null>(null);
  const saveLock=useRef(false),version=useRef(0);
  const [canUndo,setCanUndo]=useState(false),[canRedo,setCanRedo]=useState(false),[canRemove,setCanRemove]=useState(false);
  const [tab,setTab]=useState('blocks'),[title,setTitle]=useState('Editor visual'),[status,setStatus]=useState('Memuat halaman…'),[error,setError]=useState(''),[ready,setReady]=useState(false),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[device,setDevice]=useState('Desktop'),[selected,setSelected]=useState(''),[preview,setPreview]=useState(false),[panelOpen,setPanelOpen]=useState(false);
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
        if(worksResponse&&!worksResponse.ok)throw Error('Koleksi Works belum bisa dimuat. Coba lagi.');
        const works=worksResponse?(await worksResponse.json()).items:[];
        const parsedLayout=new DOMParser().parseFromString(html,'text/html');
        parsedLayout.querySelectorAll('[data-works-list]').forEach(el=>{el.innerHTML='';el.setAttribute('data-gjs-type','works-feed');el.setAttribute('aria-busy','false');});
        html=parsedLayout.body.innerHTML;
        if(cancelled||!canvas.current)return;
        meta.current=data;setTitle(data.title);
        const ed=module.default.init({
          container:canvas.current,height:'100%',width:'auto',storageManager:false,noticeOnUnload:false,
          i18n:{locale:'en',detectLocale:false,messagesAdd:{en:{styleManager:{properties:{display:'Tampilan',gap:'Jarak elemen','grid-template-columns':'Susunan kolom',width:'Lebar','min-height':'Tinggi minimum','max-width':'Lebar maksimum',padding:'Ruang dalam',margin:'Ruang luar','font-family':'Jenis huruf','font-size':'Ukuran huruf','font-weight':'Ketebalan','line-height':'Tinggi baris','letter-spacing':'Jarak huruf','text-align':'Perataan',color:'Warna teks','background-color':'Warna latar',border:'Garis tepi','border-radius':'Sudut',opacity:'Transparansi','object-fit':'Posisi gambar'}},traitManager:{traits:{labels:{id:'ID elemen',title:'Tooltip',href:'Tautan',alt:'Deskripsi gambar',target:'Buka di'},attributes:{title:{placeholder:'Tooltip…'},href:{placeholder:'https://…'}},options:{target:{false:'Tab ini',_blank:'Tab baru'}}}}}}},
          parser:{optionsHtml:{allowScripts:false,allowUnsafeAttr:false,allowUnsafeAttrValue:false}},components:html,style:css,fromElement:false,
          plugins:[(instance)=>{
            instance.Components.addType('works-feed',{
              isComponent:el=>el.hasAttribute?.('data-works-list')?{type:'works-feed'}:false,
              model:{defaults:{name:'Koleksi Works',droppable:false,editable:false,draggable:false,copyable:false,removable:false}},
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
          blockManager:{appendTo:'#visual-blocks'},layerManager:{appendTo:'#visual-layers'},
          traitManager:{appendTo:'#visual-traits'},
          selectorManager:{componentFirst:true},
          styleManager:{appendTo:'#visual-styles',sectors:[
            {name:'Layout',open:false,buildProps:['display','flex-direction','justify-content','align-items','flex-wrap','gap','grid-template-columns','width','min-height','max-width'],properties:[
              {property:'display',type:'select',options:['block','flex','grid','inline-block','none'].map(id=>({id,label:id}))},
              {property:'flex-direction',name:'Arah kolom',type:'select',options:[{id:'row',label:'Horizontal'},{id:'column',label:'Vertikal'}]},
              {property:'justify-content',name:'Posisi horizontal',type:'select',options:['flex-start','center','flex-end','space-between','space-around'].map(id=>({id,label:id}))},
              {property:'align-items',name:'Posisi vertikal',type:'select',options:['stretch','flex-start','center','flex-end'].map(id=>({id,label:id}))},
              {property:'flex-wrap',name:'Bungkus kolom',type:'select',options:[{id:'wrap',label:'Bungkus'},{id:'nowrap',label:'Satu baris'}]},
            ]},
            {name:'Jarak',open:false,buildProps:['padding','margin']},
            {name:'Tipografi',open:true,buildProps:['font-family','font-size','font-weight','line-height','letter-spacing','text-align','color'],properties:[{property:'font-family',type:'select',defaults:'Manrope, Arial, sans-serif',options:[{id:'Manrope, Arial, sans-serif',label:'Manrope'},{id:'Georgia, serif',label:'Georgia'},{id:'Arial, sans-serif',label:'Arial'}]}]},
            {name:'Tampilan',open:false,buildProps:['background-color','border','border-radius','opacity','object-fit']},
          ]},
          deviceManager:{devices:[{id:'Desktop',name:'Desktop',width:''},{id:'Tablet',name:'Tablet',width:'768px',widthMedia:'1024px'},{id:'Mobile',name:'Mobile',width:'390px',widthMedia:'600px'}]},
          assetManager:{custom:true},
        });
        editor.current=ed;
        ed.on('command:run:before:core:component-delete command:run:before:tlb-delete',({options})=>{
          if(options.confirmed)return;options.abort=true;const component=ed.getSelected();
          void ask('Hapus elemen ini? Anda bisa mengembalikannya dengan Undo.').then(yes=>{if(yes&&component)ed.runCommand('core:component-delete',{component,confirmed:true} as any);});
        });
        ed.on('undo redo',()=>{setCanUndo(ed.UndoManager.hasUndo());setCanRedo(ed.UndoManager.hasRedo());});
        const blocks=[
          ['section','Section','<section class="visual-section"><h2 data-gjs-type="text">Judul section</h2><p data-gjs-type="text">Tulis cerita Anda di sini.</p></section>'],
          ['two-columns','2 kolom','<section class="visual-section visual-columns"><div class="visual-column"><h2 data-gjs-type="text">Kolom pertama</h2><p data-gjs-type="text">Tulis di sini.</p></div><div class="visual-column"><h2 data-gjs-type="text">Kolom kedua</h2><p data-gjs-type="text">Tulis di sini.</p></div></section>'],
          ['three-columns','3 kolom','<section class="visual-section visual-columns"><div class="visual-column"><p data-gjs-type="text">Kolom pertama</p></div><div class="visual-column"><p data-gjs-type="text">Kolom kedua</p></div><div class="visual-column"><p data-gjs-type="text">Kolom ketiga</p></div></section>'],
          ['heading','Judul','<h2 data-gjs-type="text">Judul baru</h2>'],
          ['text','Teks','<p data-gjs-type="text">Double-click untuk mengedit tulisan ini.</p>'],
          ['image','Gambar',{type:'image',attributes:{alt:'Gambar karya'},style:{width:'100%','min-height':'160px'}}],
          ['link','Tombol','<a class="button button-solid" href="#contact" data-gjs-type="link">Hubungi saya</a>'],
          ['spacer','Jarak','<div style="height:64px" aria-hidden="true"></div>'],
        ] as const;
        for(const [id,label,content]of blocks)ed.Blocks.add(id,{label,content:content as any});
        ed.on('component:selected',(component)=>{
          const names:Record<string,string>={h1:'Judul halaman',h2:'Judul bagian',h3:'Subjudul',p:'Paragraf',a:'Tautan',img:'Gambar',section:'Section',div:'Kontainer',main:'Halaman'};
          setSelected(names[component.get('tagName')||'']||component.getName()||'Elemen');setCanRemove(component.get('removable')!==false);setTab('style');
          requestAnimationFrame(()=>document.querySelectorAll<HTMLInputElement|HTMLSelectElement>('#visual-styles input,#visual-styles select,#visual-traits input,#visual-traits select').forEach((input,index)=>{
            const property=input.closest('.gjs-sm-property,.gjs-trt-trait');const label=property?.querySelector('.gjs-sm-label,.gjs-label')?.textContent?.trim();
            if(!input.getAttribute('aria-label'))input.setAttribute('aria-label',`${label||'Pengaturan elemen'} ${index+1}`);
          }));
        });
        ed.on('component:deselected',()=>{setSelected('');setCanRemove(false);});
        ed.on('asset:custom',()=>{setTab('media');setPanelOpen(true);});
        ed.on('rte:enable',(view)=>{activeText.current=view;view.el.addEventListener('input',()=>{version.current++;dirtyRef.current=true;setDirty(true);setStatus('Belum disimpan');},{once:true});});
        ed.on('rte:disable',()=>{activeText.current=null;});
        ed.on('update',()=>{if(cancelled)return;version.current++;dirtyRef.current=true;setDirty(true);setStatus('Belum disimpan');setCanUndo(ed.UndoManager.hasUndo());setCanRedo(ed.UndoManager.hasRedo());});
        ed.on('load',()=>{
          const doc=ed.Canvas.getDocument();if(!doc)return;
          ed.getWrapper()?.addClass('showcase');
          ed.getWrapper()?.findType('works-feed').forEach(component=>component.getView()?.render());
          ed.UndoManager.clear();ed.clearDirtyCount();dirtyRef.current=false;setDirty(false);setStatus(data.layout?'Draft dimuat':'Siap diedit');setReady(true);
          doc.addEventListener('click',event=>{if((event.target as Element)?.closest('a'))event.preventDefault();});
          const style=doc.createElement('style');style.textContent='html{scroll-behavior:auto!important}body{background:#060706;color:#f3f0e8}.reveal{opacity:1!important;transform:none!important}[data-works-list]:empty{min-height:120px}';doc.head.appendChild(style);
          if(target==='home'){doc.body.dataset.cmsPreview='true';const script=doc.createElement('script');script.src='/assets/js/works.js';doc.body.appendChild(script);}
          document.querySelectorAll<HTMLElement>('#visual-blocks .gjs-block').forEach((el,index)=>{
            const block=blocks[index];if(!block)return;el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',`Tambah ${block[1]}`);
            const insert=()=>{const selected=ed.getSelected();const parent=selected?.get('droppable')?selected:selected?.parent();const [component]=parent?parent.append(block[2] as any):ed.addComponents(block[2] as any);ed.select(component);component.getEl()?.scrollIntoView({block:'center'});setPanelOpen(false);};
            el.addEventListener('click',insert);el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();insert();}});
          });
        });
      }catch(e){if(cancelled)return;setError(e instanceof Error?e.message:'Editor belum tersedia.');setStatus('Gagal memuat');}
    }
    start();
    const unload=(event:BeforeUnloadEvent)=>{if(dirtyRef.current){event.preventDefault();event.returnValue='';}};
    window.addEventListener('beforeunload',unload);
    return()=>{cancelled=true;controller.abort();window.removeEventListener('beforeunload',unload);editor.current?.destroy();editor.current=null;};
  },[target]);
  async function save(action:'save'|'publish'){
    const ed=editor.current,data=meta.current;if(!ed||!data||saveLock.current||uploading)return;
    saveLock.current=true;
    setBusy(true);setError('');
    try{
      if(activeText.current)await activeText.current.disableEditing();
      const layout={html:ed.getHtml(),css:ed.getCss()||''};
      const res=await fetch('/api/admin/visual',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({target,revision:data.revision,action,layout})});
      const result=await res.json();if(!res.ok)throw Error(result.error||'Perubahan belum tersimpan.');
      meta.current={...data,revision:result.revision,layout:result.layout};if(result.title)setTitle(result.title);const changed=ed.getHtml()!==layout.html||(ed.getCss()||'')!==layout.css;dirtyRef.current=changed;setDirty(changed);if(!changed)ed.clearDirtyCount();setStatus(changed?'Tersimpan, ada perubahan baru':action==='publish'?'Sudah dipublikasikan':'Draft tersimpan');
    }catch(e){setError(e instanceof Error?e.message:'Perubahan belum tersimpan.');}finally{saveLock.current=false;setBusy(false);}
  }
  function leave(event:React.MouseEvent<HTMLAnchorElement>){if(dirtyRef.current){event.preventDefault();const href=event.currentTarget.href;void ask('Perubahan belum disimpan. Tinggalkan editor?', 'Tinggalkan').then(yes=>{if(yes){dirtyRef.current=false;window.location.assign(href);}});}}
  function setViewport(value:string){editor.current?.setDevice(value);setDevice(value);}
  function move(direction:number){const component=editor.current?.getSelected(),parent=component?.parent();if(!component||!parent)return;const index=parent.components().indexOf(component);component.move(parent,{at:Math.max(0,Math.min(parent.components().length-1,index+direction))});}
  return <div className={`visual-editor ${preview?'visual-preview':''} ${panelOpen?'visual-panel-open':''}`}>
    {confirmation}
    <header className="visual-toolbar">
      <a href={target==='home'?'/admintgadink/dashboard/site':'/admintgadink/dashboard/works'} onClick={leave} className="visual-icon" aria-label="Kembali ke CMS"><ArrowLeft size={20}/></a>
      <div className="visual-title"><h1>{title}</h1><span role="status">{busy?'Menyimpan…':status}{uploading?' · Mengupload…':''}</span></div>
      <div className="visual-history"><button aria-label="Undo" title="Urungkan perubahan" disabled={!ready||busy||uploading||!canUndo} onClick={()=>editor.current?.UndoManager.undo()}><Undo2 size={18}/></button><button aria-label="Redo" title="Ulangi perubahan" disabled={!ready||busy||uploading||!canRedo} onClick={()=>editor.current?.UndoManager.redo()}><Redo2 size={18}/></button></div>
      <div className="visual-devices" aria-label="Ukuran kanvas"><button aria-label="Desktop" aria-pressed={device==='Desktop'} onClick={()=>setViewport('Desktop')}><Monitor size={18}/></button><button aria-label="Mobile" aria-pressed={device==='Mobile'} onClick={()=>setViewport('Mobile')}><Smartphone size={18}/></button></div>
      <button className="visual-panel-toggle" aria-label="Panel editor" aria-expanded={panelOpen} onClick={()=>setPanelOpen(!panelOpen)}><SlidersHorizontal size={18}/><span>Panel</span></button>
      <button aria-label="Preview" aria-pressed={preview} onClick={()=>{const ed=editor.current;if(preview)ed?.stopCommand('preview');else ed?.runCommand('preview');setPreview(!preview);}} disabled={!ready||busy}><Eye size={18}/><span>Preview</span></button>
      <button aria-label="Simpan draft" disabled={!ready||busy||uploading||!dirty} onClick={()=>save('save')}><Save size={18}/><span>Simpan draft</span></button>
      <button className="visual-publish" disabled={!ready||busy||uploading} onClick={()=>save('publish')}>Publikasikan</button>
    </header>
    {error&&<div role="alert" className="visual-error">{error}{!ready?<button onClick={()=>window.location.reload()}>Coba lagi</button>:<button onClick={()=>setError('')} aria-label="Tutup pesan">Tutup</button>}</div>}
    <div className="visual-workspace" aria-busy={busy}>
      <aside className="visual-sidebar" aria-label="Panel editor" inert={busy||uploading}>
        <button className="visual-panel-close" onClick={()=>setPanelOpen(false)}>Tutup panel</button>
        <nav aria-label="Pengaturan editor">{[['blocks','Tambah',Plus],['layers','Struktur',Layers],['style','Atur',SlidersHorizontal]].map(([value,label,Icon])=><button key={value as string} aria-pressed={tab===value} onClick={()=>setTab(value as string)}><Icon size={17}/>{label as string}</button>)}</nav>
        <p className="visual-hint">Double-click teks untuk menulis langsung.</p>
        <div id="visual-blocks" hidden={tab!=='blocks'}/>
        <div id="visual-layers" hidden={tab!=='layers'}/>
        {selected&&<div className="visual-selection"><strong>{selected}</strong><div className="visual-element-actions" aria-label="Aksi elemen"><button aria-label="Pindah ke atas" title="Pindah ke atas" disabled={busy} onClick={()=>move(-1)}><ArrowUp size={16}/></button><button aria-label="Pindah ke bawah" title="Pindah ke bawah" disabled={busy} onClick={()=>move(1)}><ArrowDown size={16}/></button><button aria-label="Duplikasi elemen" title="Duplikasi elemen" disabled={busy} onClick={()=>{const component=editor.current?.getSelected(),parent=component?.parent();if(component&&parent&&component.get('copyable')!==false){const clone=component.clone();parent.append(clone,{at:parent.components().indexOf(component)+1});editor.current?.select(clone);}}}><Copy size={16}/></button><button aria-label="Hapus elemen" title="Hapus elemen" disabled={busy||!canRemove} onClick={()=>editor.current?.runCommand('core:component-delete')}><Trash2 size={16}/></button></div></div>}
        <div hidden={tab!=='style'}>{!selected&&<h2>Pilih elemen di kanvas</h2>}<div id="visual-traits"/><div id="visual-styles"/></div>
        {tab==='media'&&<h2>Ganti gambar</h2>}
        {(tab==='media'||(tab==='style'&&selected==='Gambar'))&&<FileDrop disabled={busy} onBusyChange={setUploading} onUploaded={files=>{const component=editor.current?.getSelected();if(component?.is('image'))component.set('src',files[0].url);editor.current?.AssetManager.close();setTab('style');}}/>}
      </aside>
      <div className="visual-canvas" ref={canvas} inert={busy||uploading}/>
    </div>
  </div>;
}
