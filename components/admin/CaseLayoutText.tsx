'use client';
import { useEffect, useState } from 'react';
import { Type } from 'lucide-react';
import { SettingsDisclosure } from './SettingsDisclosure';
import type { VisualLayout } from '@/lib/visual-layout';

function textEntries(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root = doc.querySelector('.study-case-blocks') || doc.querySelector('.case-narrative') || doc.querySelector('main') || doc.body;
  const legacySummary = Array.from(doc.querySelectorAll('.case-narrative>section')).filter(section=>/^(The problem|The solution|The impact)$/.test(section.querySelector('h2')?.textContent?.trim() || '') && section.children.length===2 && section.querySelectorAll('p').length===1);
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const headings=Array.from(root.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const entries = nodes.flatMap((node, index) => {
    const parent = node.parentElement;
    if ((!node.textContent?.trim() && node.textContent!=='\u00a0') || !parent?.closest('h1,h2,h3,h4,h5,h6,p,li,blockquote,a,figcaption') || parent.closest('script,style,svg,nav,header,footer,dialog,[data-works-list],.case-overview,.case-summary-step,.case-next') || legacySummary.length===3 && legacySummary.some(section=>section.contains(node))) return [];
    const label = parent.closest('h1,h2,h3,h4,h5,h6') ? 'Judul' : parent.closest('strong,b') ? 'Teks tebal' : parent.closest('a') ? 'Teks link' : parent.closest('figcaption') ? 'Caption (opsional)' : 'Paragraf';
    return [{index, label, heading:headings.indexOf(parent.closest('h1,h2,h3,h4,h5,h6')!), value: node.textContent==='\u00a0'?'':node.textContent}];
  });
  return {doc, nodes, entries};
}

function groupedEntries(html: string) {
  const {entries}=textEntries(html);
  const groups:{id:number;heading:number;title:string;entries:typeof entries}[]=[];
  for(const entry of entries){
    if(!groups.length||entry.label==='Judul'&&groups.at(-1)?.heading!==entry.heading)groups.push({id:entry.index,heading:entry.heading,title:entry.label==='Judul'?'':'Pembuka cerita',entries:[]});
    if(entry.label==='Judul')groups[groups.length-1].title+=entry.value;
    groups[groups.length-1].entries.push(entry);
  }
  return groups;
}

export function CaseLayoutText({layout,onChange,disabled}: {layout:VisualLayout;onChange:(layout:VisualLayout)=>void;disabled:boolean}) {
  const [query,setQuery] = useState('');
  const [groups,setGroups]=useState<ReturnType<typeof groupedEntries>>([]);
  useEffect(()=>setGroups(groupedEntries(layout.html)),[layout.html]);
  return <SettingsDisclosure title="Cerita proyek" icon={<Type size={20}/>} status={`${groups.length} bagian cerita`}>
    <div className="cms-block-fields">

      <label>Cari di cerita<input type="search" value={query} disabled={disabled} onChange={event=>setQuery(event.target.value)}/></label>
      {groups.filter(group=>group.entries.some(entry=>`${entry.label} ${entry.value}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))).map(group=><details className="cms-story-section" key={group.id} open={query?true:undefined}><summary>{group.title || 'Belum ada judul'}</summary><div className="cms-block-fields">{group.entries.map(entry=><TextEntry key={entry.index} label={entry.label==='Paragraf'?'Ceritanya':entry.label} value={entry.value} disabled={disabled} onCommit={value=>{
        const {doc,nodes}=textEntries(layout.html),node=nodes[entry.index];
        if(!node)return;
        node.textContent=value||'\u00a0';
        onChange({...layout,html:doc.body.innerHTML});
      }}/>)}</div></details>)}
      {!groups.length&&<p className="wm-editor-note">Belum ada cerita. Tambahkan bagian lewat editor visual.</p>}
    </div>
  </SettingsDisclosure>;
}

function TextEntry({label,value,disabled,onCommit}:{label:string;value:string;disabled:boolean;onCommit:(value:string)=>void}) {
  const [draft,setDraft]=useState(value);
  useEffect(()=>setDraft(value),[value]);
  return <label>{label}<textarea rows={label==='Ceritanya'?4:2} value={draft} disabled={disabled} onChange={event=>{setDraft(event.target.value);onCommit(event.target.value);}}/></label>;
}
