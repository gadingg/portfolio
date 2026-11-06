'use client';
import {useState,useEffect,useRef} from 'react';
import {InlineStudyAssistant} from './InlineStudyAssistant';
import {FileText, Settings2, Image as ImageIcon, Eye, Link as LinkIcon} from 'lucide-react';
import {workKinds, workLabels, setCaseStudyEnabled, type WorkItem, type WorkKind} from '@/lib/works';
import {homepageWorks, setHomepageFeatured} from '@/lib/homepage-works';
import {workReadiness} from '@/lib/work-readiness';
import type {WorkEditorErrors} from '@/lib/work-editor';
import {FileDrop} from './FileDrop';
import {VideoSourceEditor} from './VideoSourceEditor';
import {SettingsDisclosure} from './SettingsDisclosure';
import {BlockEditor} from './BlockEditor';
import {CaseLayoutText} from './CaseLayoutText';
import {CaseLayoutImages} from './CaseLayoutImages';
import {CaseAppLinksEditor} from './CaseAppLinksEditor';
import {CaseMotionEditor} from './CaseMotionEditor';
import {AdminLink} from './AdminLink';
import {DesignImagesEditor} from './DesignImagesEditor';
import './work-editor.css';

export function WorkEditor({item, items, disabled, errors, onChange, onKindChange, onBusyChange, onOpenVisual}: {
  item: WorkItem; items: WorkItem[]; disabled: boolean; errors: WorkEditorErrors;
  onChange: (patch: Partial<WorkItem>) => void; onKindChange: (kind: WorkKind) => Promise<void>;
  onBusyChange: (busy: boolean) => void; onOpenVisual: () => void;
}) {
  const study = item.caseStudy;
  const [tab,setTab]=useState('basic');
  const tabs=useRef<HTMLDivElement>(null);
  function selectTab(next:string){setTab(next);const screen=tabs.current?.closest<HTMLElement>('.wm-editor-screen');if(screen&&tabs.current){screen.scrollTo({top:Math.max(0,tabs.current.offsetTop-100),behavior:'instant'});}}

  useEffect(()=>{const key=Object.keys(errors)[0];if(!key)return;setTab(/^caseStudy\.(problem|solution|impact)/.test(key)?'par':/^caseStudy\.|^designImages|^imageAlt/.test(key)||(key==='url'&&item.kind!=='video')?'gallery':'basic');},[errors,item.kind]);
  function error(path: string) {return errors[path] ? <small id={`work-error-${path}`} className="work-field-error">{errors[path]}</small> : null;}
  function attrs(path: string) {return {'data-work-field':path, 'aria-invalid':!!errors[path], 'aria-describedby':errors[path] ? `work-error-${path}` : undefined};}
  const summary = item.kind === 'webapp' ? 'Ringkasan proyek' : 'Keterangan (opsional)';
  const description = <label>{summary}<textarea {...attrs('description')} rows={3} maxLength={500} value={item.description} onChange={event => onChange({description:event.target.value})}/>{error('description')}</label>;
  return <div className={`work-editor work-editor--${item.kind}`}>
    <div ref={tabs} className="editor-tabs" role="group" aria-label="Bagian editor">{[['basic','Info Dasar & Cover'],['par','Studi Kasus PAR'],['gallery','Galeri & Link']].filter(([key])=>key!=='par'||!!study).map(([key,label])=><button type="button" className="wm-button" aria-pressed={tab===key} key={key} onClick={()=>selectTab(key)}>{label}</button>)}</div>
    <fieldset className="work-editor-fields" disabled={disabled}>
      <legend className="wm-sr-only">Editor portofolio</legend>
      <div hidden={tab!=='basic'} className="work-editor-fields">
      <label>Judul<input {...attrs('title')} value={item.title} maxLength={140} onChange={event => onChange({title:event.target.value})}/>{error('title')}</label>
      {item.kind === 'webapp' && description}
      {item.kind !== 'video' && <section className="work-editor-media" data-work-field="image" aria-label={item.kind === 'design' ? 'Gambar desain' : 'Cover proyek'}>
        <h2>{item.kind === 'design' ? 'Gambar desain' : 'Cover proyek'}</h2>
        <FileDrop picker previewSrc={item.image} previewAlt={item.imageAlt || item.title}
          uploadLabel={item.image ? 'Ganti gambar' : 'Tambah gambar'} disabled={disabled} onBusyChange={onBusyChange}
          onUploaded={files => onChange({image:files[0].url})}/>
        {error('image')}
      </section>}
      {item.kind === 'video' && <VideoSourceEditor item={item} disabled={disabled} errors={errors} onBusyChange={onBusyChange} onChange={onChange}/>}
      </div>
      <div hidden={tab!=='par'} className="work-editor-fields">
      {study && <section className="work-editor-story" aria-labelledby="work-story-title">
        <h2 id="work-story-title">Ringkasan PAR</h2><InlineStudyAssistant item={item} disabled={disabled} onChange={onChange}/>
        {(['problem','solution','impact'] as const).map((key, index) => <label key={key}>{['Problem','Approach','Result'][index]}
          <textarea {...attrs(`caseStudy.${key}`)} rows={3} maxLength={12000} value={study[key]} onChange={event => onChange({caseStudy:{...study,[key]:event.target.value}})}/>
          {error(`caseStudy.${key}`)}
        </label>)}
      </section>}
      </div>
      <div hidden={tab!=='gallery'} className="work-editor-fields">
      {item.kind==='design'&&<div data-work-field="designImages"><DesignImagesEditor item={item} disabled={disabled} onBusyChange={onBusyChange} onChange={onChange}/>
        {Object.entries(errors).filter(([key])=>key.startsWith('designImages')).map(([key,text])=><small className="work-field-error" key={key}>{text}</small>)}</div>}
      {item.kind !== 'webapp' && <SettingsDisclosure title="Deskripsi & link" icon={<FileText size={20}/>}>
        <div className="work-editor-fields">{description}
          {item.kind === 'design' && <label>Link proyek (opsional)<input {...attrs('url')} inputMode="url" value={item.url} onChange={event => onChange({url:event.target.value})}/>{error('url')}</label>}
        </div>
      </SettingsDisclosure>}
      {item.kind === 'webapp' && !study && <label>Link aplikasi<input {...attrs('url')} inputMode="url" value={item.url} onChange={event => onChange({url:event.target.value})}/>{error('url')}</label>}
      {study && <SettingsDisclosure title="Link aplikasi" icon={<LinkIcon size={20}/>}>
        <div data-work-field="caseStudy.appLinks"><CaseAppLinksEditor study={study} onChange={appLinks => onChange({caseStudy:{...study,appUrl:appLinks[0]?.url || '',appLinks}})}/>
          {Object.entries(errors).filter(([key]) => key.startsWith('caseStudy.app')).map(([key,text]) => <small className="work-field-error" key={key}>{text}</small>)}
        </div>
      </SettingsDisclosure>}
      {study && <SettingsDisclosure title="Cerita & screenshot" icon={<ImageIcon size={20}/>} defaultOpen>
        <div className="work-editor-fields" data-work-field="caseStudy.blocks">
          {study.layout ? <><CaseLayoutText layout={study.layout} disabled={disabled} onChange={layout => onChange({caseStudy:{...study,layout}})}/>
            <CaseLayoutImages layout={study.layout} disabled={disabled} onBusyChange={onBusyChange} onChange={layout => onChange({caseStudy:{...study,layout}})}/></>
            : <BlockEditor blocks={study.blocks} disabled={disabled} onBusyChange={onBusyChange} onChange={blocks => onChange({caseStudy:{...study,blocks}})}/>}
          {Object.entries(errors).filter(([key]) => key.startsWith('caseStudy.blocks')).map(([key,text]) => <small className="work-field-error" key={key}>{text}</small>)}
        </div>
      </SettingsDisclosure>}
      {study && <div data-work-field="caseStudy.motion"><CaseMotionEditor study={study} disabled={disabled} onBusyChange={onBusyChange} onChange={motion => onChange({caseStudy:{...study,motion}})}/>
        {Object.entries(errors).filter(([key]) => key.startsWith('caseStudy.motion')).map(([key,text]) => <small className="work-field-error" key={key}>{text}</small>)}</div>}
      {study && <SettingsDisclosure title="Edit layout & bantuan AI" icon={<FileText size={20}/>}>
        <div className="work-editor-fields">
          <div className="work-editor-secondary-actions"><button type="button" className="wm-button" onClick={onOpenVisual}>Edit halaman studi kasus</button>
</div>
          {item.aiDraft && <SettingsDisclosure title="Catatan AI" icon={<FileText size={18}/>}>
            <label>Brief awal<textarea rows={4} maxLength={30000} value={item.aiDraft.brief} onChange={event => onChange({aiDraft:{...item.aiDraft!,brief:event.target.value}})}/></label>
            {!!item.aiDraft.confirmations.length && <ul>{item.aiDraft.confirmations.map((text,index)=><li key={index}>{text}</li>)}</ul>}
            {!!item.aiDraft.screenshots.length && <ul>{item.aiDraft.screenshots.map((shot,index)=><li key={index}>Setelah bagian {shot.afterSection+1}: {shot.description}{shot.caption && <p>{shot.caption}</p>}</li>)}</ul>}
          </SettingsDisclosure>}
        </div>
      </SettingsDisclosure>}
      <SettingsDisclosure title="Pengaturan" icon={<Settings2 size={20}/>}>
        <div className="work-editor-fields">
          <label>Jenis portofolio<select value={item.kind} onChange={event => void onKindChange(event.target.value as WorkKind)}>
            {workKinds.map(kind => <option key={kind} value={kind}>{workLabels[kind]}</option>)}
          </select></label>
          {item.kind === 'webapp' && <><label className="wm-check"><input type="checkbox" checked={!!study} onChange={event => onChange(setCaseStudyEnabled(item,event.target.checked))}/>Halaman studi kasus</label>
            <label className="wm-check"><input type="checkbox" checked={homepageWorks(items).some(work => work.id === item.id)}
              disabled={disabled || !item.published || !!workReadiness(item) || (!homepageWorks(items).some(work=>work.id===item.id)&&homepageWorks(items).length>=3)}
              onChange={event => onChange(setHomepageFeatured(items,item.id,event.target.checked).find(work=>work.id===item.id) || {})}/>Pilihan homepage ({homepageWorks(items).length}/3)</label>
          </>}
          {!study && item.archivedCaseStudy && <p className="wm-editor-note">Cerita studi kasus tetap tersimpan. Aktifkan kembali melalui jenis Web App.</p>}
          {study && <label>Alamat halaman<input {...attrs('caseStudy.slug')} value={study.slug} onChange={event => onChange({caseStudy:{...study,slug:event.target.value}})}/>
            <small>/work/{study.slug}</small>{error('caseStudy.slug')}</label>}
          <label>Deskripsi gambar (aksesibilitas)<input {...attrs('imageAlt')} maxLength={250} value={item.imageAlt} onChange={event => onChange({imageAlt:event.target.value})}/>{error('imageAlt')}</label>
          <SettingsDisclosure title="Link gambar" icon={<LinkIcon size={18}/>}>
            <label>Link file<input value={item.image} inputMode="url" onChange={event => onChange({image:event.target.value})}/>{error('image')}</label>
          </SettingsDisclosure>
        </div>
      </SettingsDisclosure>
      </div>
    </fieldset>
  </div>;
}
