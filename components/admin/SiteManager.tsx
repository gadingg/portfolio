'use client';
import { useEffect, useRef, useState } from 'react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { siteFields, type SiteContent } from '@/lib/site';
import { FileDrop } from './FileDrop';
import { SortableList } from './SortableList';
import { useConfirm } from './ConfirmDialog';
import './works-manager.css';
import { PublicationBar } from './PublicationBar';
import { draftSaveMessage } from '@/lib/draft-backup';
import { useAutoDraft } from './useAutoDraft';
import { DraftRecovery } from './DraftRecovery';
import { sitePublicationSummary } from '@/lib/publication-review';
export function SiteManager() {
  const {ask,confirmation}=useConfirm();
  const [content, setContent] = useState<SiteContent | null>(null),
    [saved, setSaved] = useState(''),
    [published, setPublished] = useState(''),
    [revision, setRevision] = useState(0),
    [group, setGroup] = useState('Hero'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [operation, setOperation] = useState<'save' | 'publish' | null>(null);
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
    enabled: content !== null, blocked: busy, saving: operation === 'save', save: () => save('save', true),
    restore: value => { const content = JSON.parse(value); if (!content?.values || !content?.cv || !Array.isArray(content.cv.experience) || !Array.isArray(content.cv.education)) throw Error('Cadangan tidak valid.'); setContent(content); }, ask });
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
      const res = await fetch('/api/admin/site', { cache: 'no-store' });
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
    load();
  }, []);
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});document.querySelector('.admin-main')?.scrollTo({top:0,behavior:'instant'});},[group]);
  async function save(action: 'save' | 'publish', automatic = false) {
    if (uploadBusy.current || mutationLock.current || !contentRef.current) return false;
    const snapshot = contentRef.current;
    mutationLock.current = true; setOperation(action); setBusy(true); setError('');
    pendingMutation.current = new Promise(resolve => { finishMutation.current = resolve; });
    if (!automatic) setNotice('');
    try {
      if (action === 'publish' && published) {
        const sections = sitePublicationSummary(snapshot, JSON.parse(published));
        if (!(await ask(`Publish perubahan ${sections.join(' dan ') || 'Website & CV'}? Semua draft pada bagian tersebut ikut di-publish.`, 'Publish'))) return false;
      }
      const res = await fetch('/api/admin/site', {
        method: 'PUT', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: snapshot, revision: revisionRef.current, action }),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      adopt(data, JSON.stringify(snapshot));
      if (!automatic) setNotice(action === 'publish' ? 'Perubahan website sudah tayang.' : 'Draft tersimpan.');
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
  const groups = [...new Set(siteFields.map((field) => field.group)), 'CV'];
  if (autosave.recovery) return <DraftRecovery backup={autosave.recovery} onUseServer={autosave.useServerVersion} />;
  return (
    <div className="works-manager cms-manager wm-site-workspace">
      {confirmation}
      <div className="wm-heading">
        <div><h1>Website &amp; CV</h1>{content && !dirty && saved === published && <p className="wm-clean-status">Semua perubahan tersimpan</p>}</div>
        <a
          href="/admintgadink/dashboard/editor/home"
          className="wm-button"
          onClick={async event => {
            event.preventDefault();
            if (uploadBusy.current) return;
            if (pendingMutation.current) await pendingMutation.current;
            if (JSON.stringify(contentRef.current) !== savedRef.current && !(await save('save'))) return;
            window.location.assign('/admintgadink/dashboard/editor/home');
          }}
        >
          <Eye size={18} />
          Edit halaman
        </a>
      </div>
      {content && <PublicationBar dirty={!!dirty} unpublished={saved !== published} busy={busy} operation={operation} scope="Perubahan Website & CV ikut di-publish." status={!dirty && saved === published && autosave.online ? 'Sudah tayang' : autosave.status} offline={!autosave.online} failed={autosave.failed}
        onSave={autosave.retry} onPublish={() => { void save('publish'); }}/>}
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
      {notice && (
        <p className="wm-message" role="status">
          {notice}
        </p>
      )}
      {!content && !error && <div className="wm-form-loading" role="status"><span>Memuat konten website…</span><div aria-hidden="true"/><div aria-hidden="true"/></div>}
      {content && (
        <>
          <div className="wm-site-layout"><label className="wm-section-select">Bagian website<select value={group} onChange={event => setGroup(event.target.value)}>{groups.map(value => <option key={value} value={value}>{value}</option>)}</select></label><nav className="cms-section-tabs" aria-label="Bagian website">
            {groups.map((value) => (
              <button
                type="button"
                className="wm-button"
                key={value}
                aria-pressed={group === value}
                onClick={() => setGroup(value)}
              >
                {value}
              </button>
            ))}
          </nav>
          <fieldset disabled={busy && operation !== 'save'} className="cms-editor-fields">
            <h2>{group}</h2>
            {siteFields
              .filter((field) => field.group === group)
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
                      <img
                        className="cms-image-preview"
                        src={content.values[field.key]}
                        alt="Preview"
                      />
                      <FileDrop
                        disabled={busy}
                        onBusyChange={mediaBusy}
                        onUploaded={(files) => update(field.key, files[0].url)}
                      />
                    </>
                  )}
                </div>
              ))}
            {group === 'CV' && (
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
                {(['experience','education'] as const).map(section => <div key={section}>
                <h3>{section==='experience'?'Pengalaman':'Pendidikan'}</h3>
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
                          await ask('Hapus bagian ini dari draft?') && cv({
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
                </div>)}
                <h3>PDF CV</h3>
                <p className="wm-muted">Pengunjung mengunduh PDF ini. Perubahan teks di editor tidak mengubah isi PDF.</p>
                <FileDrop
                  folder="cv"
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
