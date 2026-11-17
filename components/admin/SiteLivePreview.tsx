'use client';
import {useEffect, useRef, useState} from 'react';
import {Monitor, Smartphone} from 'lucide-react';
import {siteFields, type SiteContent} from '@/lib/site';
import {websiteSections, websiteSectionForField, type WebsiteSection} from '@/lib/site-editor';

export function SiteLivePreview({content, selected, onSelect}:{
  content:SiteContent; selected:WebsiteSection|''; onSelect:(section:WebsiteSection,field?:string)=>void;
}){
  const frame=useRef<HTMLIFrameElement>(null);
  const viewport=useRef<HTMLDivElement>(null);
  const scroll=useRef(0), jump=useRef<WebsiteSection|null>(null);
  const selectRef=useRef(onSelect);
  selectRef.current=onSelect;
  const [html,setHtml]=useState(''),[mobile,setMobile]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  const [scale,setScale]=useState(1);
  const hasPreview=Boolean(html);

  useEffect(()=>{
    setMobile(matchMedia('(max-width: 760px)').matches);
  },[]);
  useEffect(()=>{
    const element=viewport.current;
    if(!element)return;
    const observer=new ResizeObserver(([entry])=>setScale(Math.min(1,entry.contentRect.width/1100)));
    observer.observe(element);
    return()=>observer.disconnect();
  },[hasPreview]);

  function bringIntoView(element:Element){
    const window=element.ownerDocument.defaultView;
    if(!window)return;
    const header=element.ownerDocument.querySelector('.portfolio-header');
    const offset=(header?.getBoundingClientRect().height||0)+12;
    window.scrollTo({top:window.scrollY+element.getBoundingClientRect().top-offset,behavior:'instant'});
  }

  useEffect(()=>{
    const controller=new AbortController();
    const timer=setTimeout(async()=>{
      try{
        const response=await fetch('/api/admin/preview/site',{
          method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(content),
          signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)]),
        });
        if(!response.ok){
          const data=await response.json();
          throw new Error(data.error||'Pratinjau belum bisa dimuat.');
        }
        const next=await response.text();
        if(controller.signal.aborted)return;
        scroll.current=frame.current?.contentWindow?.scrollY||0;
        setHtml(next);setError('');
      }catch(cause){
        if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:'Pratinjau belum bisa dimuat.');
      }
    },300);
    return()=>{clearTimeout(timer);controller.abort();};
  },[content,retry]);

  function markSelection(section:WebsiteSection|'',move=false){
    const document=frame.current?.contentDocument;
    if(!document)return;
    document.querySelectorAll('[data-site-edit-selected]').forEach(element=>element.removeAttribute('data-site-edit-selected'));
    if(!section)return;
    const entry=websiteSections.find(item=>item.id===section);
    const target=entry&&document.querySelector(entry.selector);
    target?.setAttribute('data-site-edit-selected','');
    if(move&&target)bringIntoView(target);
  }
  useEffect(()=>{markSelection(selected);},[selected]);

  function installPreview(){
    const document=frame.current?.contentDocument;
    if(!document?.body)return;
    if(!document.querySelector('#site-edit-preview-style')){
      const style=document.createElement('style');
      style.id='site-edit-preview-style';
      style.textContent='[data-site-edit-section]{cursor:pointer;scroll-margin-top:88px}[data-site-edit-section]:hover,[data-site-edit-selected]{outline:2px solid #5ab2f7;outline-offset:-2px}[data-site-edit-field]{cursor:pointer}';
      document.head.append(style);
      for(const section of websiteSections){
        document.querySelectorAll(section.selector).forEach(element=>element.setAttribute('data-site-edit-section',section.id));
      }
      for(const field of siteFields){
        const group=websiteSectionForField(field);
        if(group==='settings')continue;
        const target=document.querySelector(field.selector);
        if(target&&!target.hasAttribute('data-site-edit-field'))target.setAttribute('data-site-edit-field',field.key);
      }
      document.addEventListener('click',event=>{
        const target=event.target as Element|null;
        if(!target?.closest)return;
        if(target.closest('a, button'))event.preventDefault();
        const clickedField=target.closest('[data-site-edit-field]');
        const field=clickedField?.getAttribute('data-site-edit-field');
        const match=field&&siteFields.find(item=>item.key===field);
        const section=match?websiteSectionForField(match):target.closest('[data-site-edit-section]')?.getAttribute('data-site-edit-section');
        if(!section||section==='settings'||!websiteSections.some(item=>item.id===section))return;
        event.preventDefault();
        if(clickedField&&matchMedia('(max-width: 1060px)').matches)bringIntoView(clickedField);
        selectRef.current(section as WebsiteSection,field||undefined);
      });
    }
    if(jump.current){markSelection(jump.current,true);jump.current=null;}
    else {frame.current?.contentWindow?.scrollTo(0,scroll.current);markSelection(selected);}
  }

  return <div className="site-live-stage">
    <div className="site-live-stage-tools">
      <select aria-label="Pilih bagian website" value={selected} onChange={event=>{
        const section=websiteSections.find(item=>item.id===event.target.value);
        if(!section)return;
        if(html)markSelection(section.id,true);else jump.current=section.id;
        onSelect(section.id);
      }}>
        <option value="" disabled>Pilih bagian</option>
        {websiteSections.map(section=><option key={section.id} value={section.id}>{section.label}</option>)}
      </select>
      <div className="site-device-controls" role="group" aria-label="Ukuran pratinjau">
        <button className="wm-button" type="button" aria-label="Desktop" aria-pressed={!mobile} onClick={()=>setMobile(false)}><Monitor size={18}/></button>
        <button className="wm-button" type="button" aria-label="HP" aria-pressed={mobile} onClick={()=>setMobile(true)}><Smartphone size={18}/></button>
      </div>
    </div>
    <div className="site-live-canvas">
      {error&&<div className="site-preview-status" role="status"><span>{error}</span><button type="button" className="wm-button" onClick={()=>setRetry(value=>value+1)}>Muat ulang</button></div>}
      {html?<div ref={viewport} className={'site-live-frame'+(mobile?' is-mobile':'')}>
        <iframe ref={frame} title="Pratinjau website" sandbox="allow-same-origin" srcDoc={html} onLoad={installPreview}
          style={mobile?undefined:{width:1100,height:`calc(100% / ${Math.max(scale,.1)})`,transform:`scale(${scale})`}}/>
      </div>
        :!error&&<p className="site-preview-status" role="status">Memuat pratinjau…</p>}
    </div>
  </div>;
}
