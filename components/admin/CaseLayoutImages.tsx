'use client';
import { useEffect, useState } from 'react';
import { FileDrop } from './FileDrop';
import type { VisualLayout } from '@/lib/visual-layout';
import {ArrowUp,ArrowDown,Trash2,Undo2} from 'lucide-react';

type Picture = { src: string; alt: string; caption: string; group:number|null; protected:boolean; order:number };
const protectedImage='header,footer,.case-intro,.case-overview,.case-next,.project-art,.case-hero,.case-cover';
function storyHeadings(doc:Document){return Array.from(doc.querySelectorAll('.study-case-blocks h2,.case-narrative h2')).filter(heading=>!['The problem','The solution','The impact'].includes(heading.textContent?.trim()||''));}
function imageUnit(img:Element):Element|null {
  if(img.closest(protectedImage))return null;
  const unit=img.closest('figure,.case-inline-image,.case-form-image');
  return unit&&unit.querySelectorAll('img').length===1&&!unit.querySelector('h1,h2,h3,h4,p,video,iframe')?unit:null;
}
export function CaseLayoutImages({ layout, onChange, disabled, onBusyChange }: {
  layout: VisualLayout; onChange: (layout: VisualLayout) => void; disabled: boolean; onBusyChange: (busy: boolean) => void;
}) {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [after, setAfter] = useState('end');
  const [sections,setSections]=useState<string[]>([]);
  const [undo,setUndo]=useState<{before:string;after:string}|null>(null);
  useEffect(() => {
    const doc = new DOMParser().parseFromString(layout.html, 'text/html');
    const elements=Array.from(doc.querySelectorAll('*'));
    setSections(storyHeadings(doc).map(heading=>heading.textContent?.trim()||'Bagian cerita'));
    let order=0;
    setPictures(Array.from(doc.querySelectorAll('img')).map(img => ({
      src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '',
      caption: img.closest('figure')?.querySelectorAll('img').length === 1 ? img.closest('figure')?.querySelector('figcaption')?.textContent || '' : '',
      group:imageUnit(img)?.parentElement?elements.indexOf(imageUnit(img)!.parentElement!):null,
      protected:!!img.closest(protectedImage),order:img.closest(protectedImage)?0:++order,
    })));
    setUndo(current=>current&&current.after===layout.html?current:null);
  }, [layout.html]);
  function canMove(from:number,to:number){return !!pictures[to]&&pictures[from].group!==null&&pictures[from].group===pictures[to].group;}
  function move(from:number,to:number){
    if(disabled||!canMove(from,to))return;
    const doc=new DOMParser().parseFromString(layout.html,'text/html'),images=doc.querySelectorAll('img');
    const a=imageUnit(images[from]),b=imageUnit(images[to]);if(!a||!b||a.parentElement!==b.parentElement)return;
    const marker=doc.createComment('image-position');a.replaceWith(marker);b.replaceWith(a);marker.replaceWith(b);
    onChange({...layout,html:doc.body.innerHTML});
  }
  function remove(index:number){
    if(disabled)return;
    const doc=new DOMParser().parseFromString(layout.html,'text/html'),img=doc.querySelectorAll('img')[index],unit=img&&imageUnit(img);if(!unit)return;
    unit.remove();const html=doc.body.innerHTML;setUndo({before:layout.html,after:html});onChange({...layout,html});
  }
  function change(index: number, patch: Partial<Picture>) {
    const doc = new DOMParser().parseFromString(layout.html, 'text/html');
    const img = doc.querySelectorAll('img')[index];
    if (!img) return;
    if (patch.src !== undefined) {
      const link=img.closest('a');if(link?.getAttribute('href')===img.getAttribute('src'))link.setAttribute('href',patch.src);
      img.setAttribute('src', patch.src);
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.removeAttribute('width');
      img.removeAttribute('height');
    }
    if (patch.alt !== undefined) img.setAttribute('alt', patch.alt);
    if (patch.caption !== undefined) {
      let figure = img.closest('figure');
      if (!figure || figure.querySelectorAll('img').length !== 1) {
        figure = doc.createElement('figure');
        img.replaceWith(figure); figure.append(img);
      }
      let caption = figure.querySelector('figcaption');
      if (!caption) { caption = doc.createElement('figcaption'); figure.append(caption); }
      caption.textContent = patch.caption;
    }
    onChange({ ...layout, html: doc.body.innerHTML });
  }
  return <section className="cms-blocks" aria-label="Screenshot proyek">
    <h3>Screenshot proyek</h3>
    {undo&&<div className="cms-image-undo" role="status"><span>Gambar dilepas dari cerita.</span><button type="button" className="wm-button" disabled={disabled} onClick={()=>{onChange({...layout,html:undo.before});setUndo(null);}}><Undo2 size={16}/>Urungkan</button></div>}
    {pictures.map((picture, index) => picture.protected?null:<fieldset className="cms-layout-picture" key={index} disabled={disabled}>
      <legend>Gambar {picture.order}</legend>
      {picture.group!==null&&<div className="cms-image-actions"><button type="button" className="wm-button" aria-label={`Naikkan gambar ${picture.order}`} disabled={!canMove(index,index-1)} onClick={()=>move(index,index-1)}><ArrowUp size={16}/></button><button type="button" className="wm-button" aria-label={`Turunkan gambar ${picture.order}`} disabled={!canMove(index,index+1)} onClick={()=>move(index,index+1)}><ArrowDown size={16}/></button><button type="button" className="wm-button" onClick={()=>remove(index)}><Trash2 size={16}/>Lepas gambar</button></div>}
      <FileDrop previewSrc={picture.src} previewAlt={picture.alt || `Gambar ${picture.order}`} folder="content" uploadLabel={`Ganti gambar ${picture.order}`} disabled={disabled} onBusyChange={onBusyChange} onUploaded={files => change(index, { src: files[0].url })}/>
      <label>Deskripsi gambar (aksesibilitas)<input maxLength={300} value={picture.alt} onChange={event => change(index, { alt: event.target.value })}/></label>
      <label>Caption (opsional)<input maxLength={300} value={picture.caption} disabled={picture.group===null} onChange={event => change(index, { caption: event.target.value })}/></label>
    </fieldset>)}
    {!pictures.some(picture=>!picture.protected) && <p>Belum ada screenshot.</p>}
    <div className="cms-layout-picture">
      <h3>Tambah gambar</h3>
      <label>Tambahkan setelah<select disabled={disabled} value={after} onChange={event => setAfter(event.target.value)}>
        <option value="end">Akhir cerita</option>
        {sections.map((title,index)=><option key={`section-${index}`} value={`section:${index}`}>Bagian: {title}</option>)}
        {pictures.map((picture, index) => picture.protected?null:<option key={index} value={String(index)}>Setelah gambar {picture.order}</option>)}
      </select></label>
      <FileDrop multiple folder="content" uploadLabel="Tambah gambar" disabled={disabled} onBusyChange={onBusyChange} onUploaded={files => {
        const doc = new DOMParser().parseFromString(layout.html, 'text/html');
        const anchor = after === 'end'||after.startsWith('section:') ? null : doc.querySelectorAll('img')[Number(after)];
        let cursor: Element | null = anchor?.closest('figure') || anchor?.closest('.project-art,.case-inline-image,.case-evidence-frame') || anchor || null;
        const root = doc.querySelector('.study-case-blocks,.case-narrative,main') || doc.body;
        if(after.startsWith('section:')){
          const heading=storyHeadings(doc)[Number(after.split(':')[1])];
          if(heading){const section=heading.closest('section');cursor=section&&section!==root?section:heading;while(cursor.nextElementSibling&&!cursor.nextElementSibling.matches('h2,section'))cursor=cursor.nextElementSibling;}
        }
        for (const file of files) {
          const figure = doc.createElement('figure'); figure.className = 'case-visual case-form-image';
          const img = doc.createElement('img'); img.setAttribute('src', file.url); img.setAttribute('alt', ''); img.setAttribute('loading', 'lazy'); figure.append(img);
          if (cursor) cursor.after(figure); else root.append(figure);
          cursor = figure;
        }
        onChange({ ...layout, html: doc.body.innerHTML });
      }}/>
    </div>
  </section>;
}
