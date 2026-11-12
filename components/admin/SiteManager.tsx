'use client';
import { useEffect, useRef, useState } from 'react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { PaletteEditor } from './PaletteEditor';
import { siteFields, type SiteContent } from '@/lib/site';
import { FileDrop } from './FileDrop';
import { SortableList } from './SortableList';
import { useConfirm } from './ConfirmDialog';
import { usePublishReview } from './PublishReview';
import { summarizeSite } from '@/lib/publish-summary';
import './works-manager.css';
import { PublicationBar } from './PublicationBar';
import { draftSaveMessage } from '@/lib/draft-backup';
import { useManualSave as useAutoDraft } from './useManualSave';
import { DraftRecovery } from './DraftRecovery';
import { AdminSkeleton } from './AdminSkeleton';
import {useAdminToast, useToastMessage} from './AdminToasts';
import {AdminLink} from './AdminLink';
import {useRouter} from 'next/navigation';
type InitialSite = {draft: SiteContent; published: SiteContent; revision: number};
export function SiteManager({initial,area='profile'}: {initial?: InitialSite;area?:'home'|'profile'} = {}) {
  const router=useRouter();
  const notify = useAdminToast();
  const {ask,confirmation}=useConfirm();
  const {review,publicationReview}=usePublishReview();
  const [content, setContent] = useState<SiteContent | null>(initial?.draft || null),
    [saved, setSaved] = useState(initial ? JSON.stringify(initial.draft) : ''),
    [published, setPublished] = useState(initial ? JSON.stringify(initial.published) : ''),
    [revision, setRevision] = useState(initial?.revision || 0),
    [group, setGroup] = useState('Hero & About'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [operation, setOperation] = useState<'save' | 'publish' | null>(null);
  useToastMessage(notice);
  useToastMessage(error,'error');
  const dirty = !!content && JSON.stringify(content) !== saved;
  const mutationLock = useRef(false);
  const pendingMutation = useRef<Promise<void> | null>(null);
  const finishMutation = useRef<(() => void) | null>(null);
  const uploadBusy = useRef(false);
  const savedRef = useRef(saved);
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
    savedRef.current = JSON.stringify(data.draft);
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
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});document.querySelector('.admin-main')?.scrollTo({top:0,behavior:'instant'});},[group]);
  async function save(action: 'save' | 'publish', automatic = false) {
    if (uploadBusy.current || mutationLock.current || !contentRef.current) return false;
    const snapshot = contentRef.current;
    mutationLock.current = true; setOperation(action); setBusy(true); setError('');
    pendingMutation.current = new Promise(resolve => { finishMutation.current = resolve; });
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
    finally { mutationLock.current = false; setOperation(null); setBusy(false); finishMutation.current?.(); pendingMutation.current = null; }
  }
  const update = (key: string, value: string) =>
    setContent((old) =>
      old ? { ...old, values: { ...old.values, [key]: value } } : old,
    );
  const cv = (patch: Partial<SiteContent['cv']>) =>
    setContent((old) => (old ? { ...old, cv: { ...old.cv, ...patch } } : old));
  const homepageGroups=['Hero','Portofolio','About','Kemampuan','Proses','Tools'];
  const groups = ['Hero & About','Keahlian & Proses','Kontak & File CV','Color Palette'];
  const included = group === groups[0] ? ['Hero','About','Identitas','SEO','Portofolio'] : group === groups[1] ? ['Kemampuan','Proses','Tools'] : group==='Color Palette'?[]:['Kontak','Footer'];
  if (autosave.recovery && !autosave.canRestore) return <DraftRecovery backup={autosave.recovery} onUseServer={autosave.useServerVersion} onRestore={autosave.canRestore ? autosave.restoreRecovery : undefined} />;
  return (
    <div className="works-manager cms-manager wm-site-workspace">
      {confirmation}
      {publicationReview}
      {autosave.recovery && autosave.canRestore && <DraftRecovery backup={autosave.recovery} onUseServer={autosave.useServerVersion} onRestore={autosave.canRestore ? autosave.restoreRecovery : undefined} />}
      <div className="wm-heading">
        <div><h1>Konten Website & CV</h1></div>

      </div>
      {content && <PublicationBar dirty={!!dirty} unpublished={saved !== published} busy={busy} publishing={operation === 'publish'}
        publishLabel="Terbitkan website & CV" offline={!autosave.online} failed={autosave.failed} onPublish={()=>{void save('publish');}}/>}
      {error && (
        <div className="wm-message wm-error" role="alert">
          {error}
          <button
            type="button"
            className="wm-button"
            disabled={busy}
            onClick={async () => {
              if (!dirty || await ask('Muat ulang? Perubahan yang belum disimpan akan dibuang.', 'Muat ulang'))
                load();
            }}
          >
            Muat ulang
          </button>
        </div>
      )}
      {!content && !error && <AdminSkeleton />}
      {content && (
        <>
          <div className="wm-site-layout"><nav className="cms-section-tabs" aria-label={area==='home'?'Bagian homepage':'Bagian profil dan CV'}>
            {groups.map((value) => (
              <button
                type="button"
                className="wm-button"
                key={value}
                aria-pressed={group === value}
                onClick={() => setGroup(value)}
              >
                {value === 'CV' ? 'Isi CV' : value === 'Kontak' ? 'Profil & kontak' : value}
              </button>
            ))}
          </nav>
          <fieldset disabled={busy && operation !== 'save'} className="cms-editor-fields">
            <h2>{group === 'Kontak & File CV' ? 'Isi CV' : group === 'Kontak' ? 'Profil & kontak' : group}</h2>
            {group==='Color Palette'&&<PaletteEditor value={content.palette} onChange={palette=>setContent(old=>old?{...old,palette}:old)}/>}
            {siteFields
              .filter((field) => included.includes(field.group))
              .map((field) => (
                <div key={field.key}>
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
              ))}
            {group === 'Kontak & File CV' && (
              <>
                {(['name', 'role', 'profile', 'capabilities', 'phone', 'email', 'website', 'location', 'languages'] as const).map(
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
                )}
                {(['experience','education'] as const).map(section => <details className="cv-list-disclosure" key={section}>
                <summary>{section==='experience'?'Pengalaman':'Pendidikan'}</summary>
                <p className="wm-muted">Tulis satu poin per baris.</p>
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
                </details>)}
              </>
            )}
            {group === 'Kontak & File CV' && (
              <>
                <p className="wm-muted">{content.cv.pdf ? (content.cv.pdf.split('/').at(-1)?.split('?')[0] || 'CV.pdf').replace(/^\d+-[a-f0-9-]{36}-/, '') : 'PDF dibuat dari isi CV.'}</p>
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
                )}
              </>
            )}
          </fieldset></div>
        </>
      )}
    </div>
  );
}
