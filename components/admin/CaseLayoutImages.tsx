'use client';
import { useEffect, useState } from 'react';
import { FileDrop } from './FileDrop';
import type { VisualLayout } from '@/lib/visual-layout';

type Picture = { src: string; alt: string; caption: string };
export function CaseLayoutImages({ layout, onChange, disabled, onBusyChange }: {
  layout: VisualLayout; onChange: (layout: VisualLayout) => void; disabled: boolean; onBusyChange: (busy: boolean) => void;
}) {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [after, setAfter] = useState('end');
  useEffect(() => {
    const doc = new DOMParser().parseFromString(layout.html, 'text/html');
    setPictures(Array.from(doc.querySelectorAll('img')).map(img => ({
      src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '',
      caption: img.closest('figure')?.querySelectorAll('img').length === 1 ? img.closest('figure')?.querySelector('figcaption')?.textContent || '' : '',
    })));
  }, [layout.html]);
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
  return <section className="cms-blocks" aria-label="Gambar isi studi kasus">
    <h3>Gambar isi studi kasus</h3>
    <p className="wm-editor-note">Screenshot untuk halaman detail.</p>
    {pictures.map((picture, index) => <fieldset className="cms-layout-picture" key={index} disabled={disabled}>
      <legend>Gambar {index + 1}</legend>
      <FileDrop previewSrc={picture.src} previewAlt={picture.alt || `Gambar ${index+1}`} folder="content" uploadLabel={`Ganti gambar ${index + 1}`} disabled={disabled} onBusyChange={onBusyChange} onUploaded={files => change(index, { src: files[0].url })}/>
      <label>Deskripsi gambar<input maxLength={300} value={picture.alt} onChange={event => change(index, { alt: event.target.value })}/></label>
      <label>Caption<input maxLength={300} value={picture.caption} onChange={event => change(index, { caption: event.target.value })}/></label>
    </fieldset>)}
    {!pictures.length && <p>Belum ada gambar isi. Tambahkan screenshot pertama di bawah.</p>}
    <div className="cms-layout-picture">
      <h3>Tambah gambar</h3>
      <label>Letakkan gambar<select disabled={disabled} value={after} onChange={event => setAfter(event.target.value)}>
        <option value="end">Di akhir cerita</option>
        {pictures.map((_, index) => <option key={index} value={String(index)}>Setelah gambar {index + 1}</option>)}
      </select></label>
      <FileDrop multiple folder="content" uploadLabel="Tambah gambar" disabled={disabled} onBusyChange={onBusyChange} onUploaded={files => {
        const doc = new DOMParser().parseFromString(layout.html, 'text/html');
        const anchor = after === 'end' ? null : doc.querySelectorAll('img')[Number(after)];
        let cursor: Element | null = anchor?.closest('figure') || anchor?.closest('.project-art,.case-inline-image,.case-evidence-frame') || anchor || null;
        const root = doc.querySelector('.study-case-blocks,.case-narrative,main') || doc.body;
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
