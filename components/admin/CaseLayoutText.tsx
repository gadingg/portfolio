'use client';
import { useEffect, useMemo, useState } from 'react';
import { Type } from 'lucide-react';
import { SettingsDisclosure } from './SettingsDisclosure';
import type { VisualLayout } from '@/lib/visual-layout';

function textEntries(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root = doc.querySelector('.study-case-blocks') || doc.querySelector('.case-narrative') || doc.querySelector('main') || doc.body;
  const legacySummary = Array.from(doc.querySelectorAll('.case-narrative>section')).filter(section=>/^(The problem|The solution|The impact)$/.test(section.querySelector('h2')?.textContent?.trim() || '') && section.children.length===2 && section.querySelectorAll('p').length===1);
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const entries = nodes.flatMap((node, index) => {
    const parent = node.parentElement;
    if ((!node.textContent?.trim() && node.textContent!=='\u00a0') || !parent?.closest('h1,h2,h3,h4,h5,h6,p,li,blockquote,a,figcaption') || parent.closest('script,style,svg,nav,header,footer,dialog,[data-works-list],.case-overview,.case-summary-step,.case-next') || legacySummary.length===3 && legacySummary.some(section=>section.contains(node))) return [];
    const label = parent.closest('h1,h2,h3,h4,h5,h6') ? 'Judul' : parent.closest('strong,b') ? 'Teks tebal' : parent.closest('a') ? 'Label tautan' : parent.closest('figcaption') ? 'Caption' : 'Paragraf';
    return [{index, label, value: node.textContent==='\u00a0'?'':node.textContent}];
  });
  return {doc, nodes, entries};
}

export function CaseLayoutText({layout,onChange,disabled}: {layout:VisualLayout;onChange:(layout:VisualLayout)=>void;disabled:boolean}) {
  const [query,setQuery] = useState('');
  const entries = useMemo(()=>typeof DOMParser==='undefined'?[]:textEntries(layout.html).entries,[layout.html]);
  return <SettingsDisclosure title="Teks cerita" icon={<Type size={20}/>} status={`${entries.length} bagian teks`}>
    <div className="cms-block-fields">
      <p className="wm-editor-note">Edit teks tanpa mengubah layout.</p>
      <label>Cari teks cerita<input type="search" value={query} disabled={disabled} onChange={event=>setQuery(event.target.value)}/></label>
      {entries.filter(entry=>`${entry.label} ${entry.value}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(entry=><TextEntry key={entry.index} label={entry.label} value={entry.value} disabled={disabled} onCommit={value=>{
        const {doc,nodes}=textEntries(layout.html),node=nodes[entry.index];
        if(!node)return;
        node.textContent=value||'\u00a0';
        onChange({...layout,html:doc.body.innerHTML});
      }}/>) }
      {!entries.length&&<p className="wm-editor-note">Belum ada teks cerita. Tambahkan bagian lewat editor visual.</p>}
    </div>
  </SettingsDisclosure>;
}

function TextEntry({label,value,disabled,onCommit}:{label:string;value:string;disabled:boolean;onCommit:(value:string)=>void}) {
  const [draft,setDraft]=useState(value);
  useEffect(()=>setDraft(value),[value]);
  return <label>{label}<textarea rows={label==='Paragraf'?3:2} value={draft} disabled={disabled} onChange={event=>{setDraft(event.target.value);onCommit(event.target.value);}}/></label>;
}
