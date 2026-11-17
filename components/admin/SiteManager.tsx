'use client';
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Plus, Trash2, X } from 'lucide-react';
import { PaletteEditor } from './PaletteEditor';
import { siteFields, type SiteContent } from '@/lib/site';
import { FileDrop } from './FileDrop';
import { SortableList } from './SortableList';
import { useConfirm } from './ConfirmDialog';
import './works-manager.css';
import { PublicationBar } from './PublicationBar';
import { draftSaveMessage } from '@/lib/draft-backup';
import { useManualSave as useAutoDraft } from './useManualSave';
import { DraftRecovery } from './DraftRecovery';
import { AdminSkeleton } from './AdminSkeleton';
import {useAdminToast, useToastMessage} from './AdminToasts';
import {AdminLink} from './AdminLink';
import { SiteLivePreview } from './SiteLivePreview';
import { CVContent } from '@/components/public/CVContent';
import { websiteSections, websiteSectionForField, type WebsiteSection } from '@/lib/site-editor';
import './site-editor.css';
type InitialSite = {draft: SiteContent; published: SiteContent; revision: number};
const cvPanels={pdf:'PDF',profile:'Profil',experience:'Pengalaman',education:'Pendidikan'} as const;
type CVPanel=keyof typeof cvPanels;
export function SiteManager({initial}: {initial?: InitialSite} = {}) {
  const notify = useAdminToast();
  const {ask,confirmation}=useConfirm();
  const [content, setContent] = useState<SiteContent | null>(initial?.draft || null),
    [saved, setSaved] = useState(initial ? JSON.stringify(initial.draft) : ''),
    [published, setPublished] = useState(initial ? JSON.stringify(initial.published) : ''),
    [revision, setRevision] = useState(initial?.revision || 0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [area,setArea]=useState<'website'|'cv'|'settings'>('website');
  const [section,setSection]=useState<WebsiteSection|''>('');
  const [selectedField,setSelectedField]=useState('');
  const [cvPanel,setCVPanel]=useState<CVPanel>('pdf');
  const [settingsPanel,setSettingsPanel]=useState<'identity'|'palette'>('identity');
  const panel=useRef<HTMLElement>(null);
  const cvEditor=useRef<HTMLElement>(null);
  const [operation, setOperation] = useState<'save' | 'publish' | null>(null);
  useToastMessage(notice);
  useToastMessage(error,'error');
  const dirty = !!content && JSON.stringify(content) !== saved;
  const mutationLock = useRef(false);
  const uploadBusy = useRef(false);
  function mediaBusy(value: boolean) { uploadBusy.current = value; setBusy(value); }
  const revisionRef = useRef(revision);
  const contentRef = useRef(content);
  revisionRef.current = revision; contentRef.current = content;
  const autosave = useAutoDraft({ storageKey: 'portfolio:draft:site:v1', value: JSON.stringify(content), baseline: saved, revision,
    enabled: false, error, busy, blocked: busy, saving: operation === 'save', save: () => save('publish'),
    restore: value => { const content = JSON.parse(value); if (!content?.values || !content?.cv || !Array.isArray(content.cv.experience) || !Array.isArray(content.cv.education)) throw Error('Cadangan tidak valid.'); setContent(content); } });
  function adopt(data: any, snapshot?: string) {
    setContent(current => snapshot && JSON.stringify(current) !== snapshot ? current : data.draft);
    setSaved(JSON.stringify(data.draft));
    setPublished(JSON.stringify(data.published));
    setRevision(data.revision);
    revisionRef.current = data.revision;
  }
  async function load() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/site', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      adopt(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konten belum bisa dimuat.');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!initial) load();
  }, []);
  async function save(action: 'save' | 'publish', automatic = false) {
    if (uploadBusy.current || mutationLock.current || !contentRef.current) return false;
    const snapshot = contentRef.current;
    mutationLock.current = true; setOperation(action); setBusy(true); setError('');
    if (!automatic) setNotice('');
    try {
      const res = await fetch('/api/admin/site', {
        method: 'PUT', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: snapshot, revision: revisionRef.current, action }),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      adopt(data, JSON.stringify(snapshot));
      if (!automatic) setNotice(action === 'publish' ? 'Perubahan website sudah tayang.' : 'Draft tersimpan.');
      else notify('Draft tersimpan.', {id:'autosave', duration:2500});
      return true;
    } catch (e) { setError(draftSaveMessage(e)); return false; }
    finally { mutationLock.current = false; setOperation(null); setBusy(false); }
  }
  const update = (key: string, value: string) =>
    setContent((old) =>
      old ? { ...old, values: { ...old.values, [key]: value } } : old,
    );
  const cv = (patch: Partial<SiteContent['cv']>) =>
    setContent((old) => (old ? { ...old, cv: { ...old.cv, ...patch } } : old));

  function selectWebsite(next:WebsiteSection,field=''){
    setSection(next);
    setSelectedField(field);
    requestAnimationFrame(()=>{
      const desktop=window.matchMedia('(min-width: 1061px)').matches;
      const container=field?panel.current?.querySelector('[data-site-input="'+field+'"]'):null;
      const input=container?.querySelector<HTMLElement>('input, textarea');
      if(desktop&&input){input.scrollIntoView({block:'nearest'});input.focus({preventScroll:true});}
      else panel.current?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
    });
  }
  function closeWebsitePanel(){
    setSection('');
    setSelectedField('');
    document.querySelector<HTMLSelectElement>('.site-live-stage-tools select')?.focus({preventScroll:true});
  }
  function renderFields(group:WebsiteSection|'settings'){
    if(!content)return null;
    return siteFields.filter(field=>websiteSectionForField(field)===group).map((field) => (
                <div key={field.key} data-site-input={field.key} className={selectedField===field.key?'site-field-selected':undefined}>
                  <label>
                    {field.label}
                    {!field.lines&&!/intro|body|description|lead|alt/i.test(field.key) ? (
                      <input
                        inputMode={field.attribute==='href'||field.attribute==='src'?'url':'text'}
                        value={content.values[field.key] || ''}
                        onChange={(e) => update(field.key, e.target.value)}
                      />
                    ) : (
                      <textarea
                        rows={field.lines ? 3 : 2}
                        value={content.values[field.key] || ''}
                        onChange={(e) => update(field.key, e.target.value)}
                      />
                    )}
                  </label>
                  {field.attribute === 'src' && (
                    <>
                      <FileDrop
                        previewSrc={content.values[field.key]} previewAlt={field.label}
                        uploadLabel={content.values[field.key] ? `Ganti ${field.label.toLowerCase()}` : `Upload ${field.label.toLowerCase()}`}
                        disabled={busy}
                        onBusyChange={mediaBusy}
                        onUploaded={(files) => update(field.key, files[0].url)}
                      />
                    </>
                  )}
                </div>
              ));
  }

  if(autosave.recovery&&!autosave.canRestore)return <DraftRecovery backup={autosave.recovery} onUseServer={autosave.useServerVersion}/>;
  return <div className="works-manager cms-manager site-editor">
    {confirmation}
    {autosave.recovery&&autosave.canRestore&&<DraftRecovery backup={autosave.recovery} onUseServer={autosave.useServerVersion} onRestore={autosave.restoreRecovery}/>}
    <header className="site-editor-header">
      <h1>Konten Website &amp; CV</h1>
      {content&&<PublicationBar dirty={dirty} unpublished={saved!==published} busy={busy} publishing={operation==='publish'}
        publishLabel="Terbitkan" offline={!autosave.online} failed={autosave.failed} onPublish={()=>{void save('publish');}}/>}
    </header>
    <nav className="site-editor-nav" aria-label="Ruang editor">
      {([{id:'website',label:'Website'},{id:'cv',label:'CV'},{id:'settings',label:'Pengaturan'}] as const).map(entry=>
        <button type="button" key={entry.id} className="wm-button" aria-pressed={area===entry.id} onClick={()=>setArea(entry.id)}>{entry.label}</button>)}
      {area==='website'&&<AdminLink className="wm-button site-advanced" href="/admintgadink/dashboard/editor/home">Edit layout <ExternalLink size={15} aria-hidden="true"/></AdminLink>}
    </nav>
    {error&&<div className="wm-message wm-error" role="alert">{error}
      <button type="button" className="wm-button" disabled={busy} onClick={async()=>{if(!dirty||await ask('Muat ulang? Editan saat ini akan dibuang.','Muat ulang'))void load();}}>Muat ulang</button>
    </div>}
    {!content&&!error&&<AdminSkeleton/>}
    {content&&area==='website'&&<div className="site-editor-grid">
      <SiteLivePreview content={content} selected={section} onSelect={selectWebsite}/>
      <aside ref={panel} className={'site-editor-panel site-website-panel'+(section?' is-open':'')} aria-label="Edit bagian website"
        onKeyDown={event=>{if(event.key==='Escape'&&section)closeWebsitePanel();}}>
        {section?<><div className="site-panel-heading">
          <h2 tabIndex={-1}>{websiteSections.find(item=>item.id===section)?.label}</h2>
          <button type="button" className="wm-button site-panel-close" aria-label="Tutup panel edit" onClick={closeWebsitePanel}><X size={18}/></button>
        </div>
        <fieldset disabled={busy} className="site-editor-fields">{renderFields(section)}
          {section==='works'&&<AdminLink className="wm-button" href="/admintgadink/dashboard/works">Kelola portofolio</AdminLink>}
        </fieldset></>:<p className="site-empty-panel">Klik bagian di pratinjau untuk mulai edit.</p>}
      </aside>
    </div>}
    {content&&area==='cv'&&<div className="site-editor-grid site-cv-grid">
      <div className="site-cv-preview" aria-label="Pratinjau CV" onClick={event=>{
        const target=event.target as Element;
        if(target.closest('a'))event.preventDefault();
        const part=target.closest<HTMLElement>('[data-cv-section]')?.dataset.cvSection;
        if(part&&Object.hasOwn(cvPanels,part)){
          setCVPanel(part as CVPanel);
          if(matchMedia('(max-width: 1060px)').matches)cvEditor.current?.scrollIntoView({block:'start'});
        }
      }}><CVContent site={content} preview/></div>
      <section ref={cvEditor} className="site-editor-panel" aria-label="Edit CV">
        <nav className="site-subnav" aria-label="Bagian CV">{(Object.keys(cvPanels) as CVPanel[]).map(key=>
          <button key={key} type="button" className="wm-button" aria-pressed={cvPanel===key} onClick={()=>setCVPanel(key)}>{cvPanels[key]}</button>)}</nav>
        <fieldset disabled={busy} className="site-editor-fields">
          {cvPanel==='profile'&&<>{(['name', 'role', 'profile', 'capabilities', 'phone', 'email', 'website', 'location', 'languages'] as const).map(
                  (key, i) => (
                    <label key={key}>
                      {['Nama', 'Posisi', 'Profil', 'Kemampuan', 'Telepon', 'Email', 'Website', 'Lokasi', 'Bahasa'][i]}
                      <textarea
                        rows={key === 'profile' ? 4 : 2}
                        value={content.cv[key]}
                        onChange={(e) => cv({ [key]: e.target.value })}
                      />
                    </label>
                  ),
                )}</>}
          {(cvPanel==='experience'||cvPanel==='education')&&<>{([cvPanel] as const).map(section => <div className="site-cv-entries" key={section}>
                <SortableList
                  items={(content.cv[section]||[]).map((item, i) => ({
                    ...item,
                    id: String(i),
                  }))}
                  disabled={busy}
                  onChange={(next) =>
                    cv({ [section]: next.map(({ id, ...item }) => item) })
                  }
                >
                  {(item, i, handle) => (
                    <div className="cms-work-row">
                      {handle}
                      <div className="cms-block-fields">
                        {(['title', 'period', 'description'] as const).map(
                          (key, n) => (
                            <label key={key}>
                              {['Judul', 'Periode', 'Deskripsi'][n]}
                              <textarea
                                rows={2}
                                value={item[key]}
                                onChange={(e) =>
                                  cv({
                                    [section]: content.cv[section].map(
                                      (entry, index) =>
                                        index === i
                                          ? { ...entry, [key]: e.target.value }
                                          : entry,
                                    ),
                                  })
                                }
                              />
                            </label>
                          ),
                        )}
                      </div>
                      <button
                        type="button"
                        className="wm-button"
                        aria-label={`Hapus ${section==='experience'?'pengalaman':'pendidikan'} ${i + 1}`}
                        onClick={async () =>
                          await ask('Hapus bagian ini dari form? Simpan untuk menerapkan perubahan.') && cv({
                            [section]: content.cv[section].filter(
                              (_item, index) => index !== i,
                            ),
                          })
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </SortableList>
                <button
                  className="wm-button"
                  type="button"
                  onClick={() =>
                    cv({
                      [section]: [
                        ...content.cv[section],
                        { title: '', period: '', description: '' },
                      ],
                    })
                  }
                >
                  <Plus size={18} />
                  Tambah {section==='experience'?'pengalaman':'pendidikan'}
                </button>
                </div>)}</>}
          {cvPanel==='pdf'&&<><p className="wm-muted">{content.cv.pdf ? (content.cv.pdf.split('/').at(-1)?.split('?')[0] || 'CV.pdf').replace(/^\d+-[a-f0-9-]{36}-/, '') : 'PDF dibuat dari isi CV.'}</p>
                <FileDrop
                  folder="cv"
                  uploadLabel={content.cv.pdf ? 'Ganti PDF' : 'Unggah PDF'}
                  accept="application/pdf"
                  disabled={busy}
                  onBusyChange={mediaBusy}
                  onUploaded={(files) => cv({ pdf: files[0].url })}
                />
                {content.cv.pdf && (
                  <div className="cms-inline-fields">
                    <a
                      className="wm-button"
                      href={content.cv.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lihat PDF
                    </a>
                    <button
                      className="wm-button"
                      type="button"
                      onClick={() => cv({ pdf: '' })}
                    >
                      Gunakan isi editor untuk PDF
                    </button>
                  </div>
                )}</>}
        </fieldset>
      </section>
    </div>}
    {content&&area==='settings'&&<section className="site-editor-panel site-settings-panel" aria-label="Pengaturan website">
      <nav className="site-subnav" aria-label="Bagian pengaturan">
        <button type="button" className="wm-button" aria-pressed={settingsPanel==='identity'} onClick={()=>setSettingsPanel('identity')}>Identitas &amp; SEO</button>
        <button type="button" className="wm-button" aria-pressed={settingsPanel==='palette'} onClick={()=>setSettingsPanel('palette')}>Warna website</button>
      </nav>
      <fieldset disabled={busy} className="site-editor-fields">
        {settingsPanel==='identity'?renderFields('settings'):<PaletteEditor value={content.palette} onChange={palette=>setContent(old=>old?{...old,palette}:old)}/>}
      </fieldset>
    </section>}
  </div>;
}
