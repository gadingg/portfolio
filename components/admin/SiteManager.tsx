'use client';
import { useEffect, useRef, useState } from 'react';
import { Eye, Save, Plus, Trash2 } from 'lucide-react';
import { siteFields, type SiteContent } from '@/lib/site';
import { FileDrop } from './FileDrop';
import { SortableList } from './SortableList';
import './works-manager.css';
export function SiteManager() {
  const [content, setContent] = useState<SiteContent | null>(null),
    [saved, setSaved] = useState(''),
    [published, setPublished] = useState(''),
    [revision, setRevision] = useState(0),
    [group, setGroup] = useState('Hero'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const dirty = content && JSON.stringify(content) !== saved;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  function adopt(data: any) {
    setContent(data.draft);
    setSaved(JSON.stringify(data.draft));
    setPublished(JSON.stringify(data.published));
    setRevision(data.revision);
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
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const leave = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      if (
        dirtyRef.current &&
        a &&
        a.target !== '_blank' &&
        !confirm('Perubahan belum disimpan. Tinggalkan halaman?')
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', leave, true);
    return () => {
      window.removeEventListener('beforeunload', unload);
      document.removeEventListener('click', leave, true);
    };
  }, []);
  async function save(action: 'save' | 'publish') {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, revision, action }),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      adopt(data);
      setNotice(
        action === 'publish' ? 'Website dipublikasikan.' : 'Draft tersimpan.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Belum tersimpan.');
    } finally {
      setBusy(false);
    }
  }
  const update = (key: string, value: string) =>
    setContent((old) =>
      old ? { ...old, values: { ...old.values, [key]: value } } : old,
    );
  const cv = (patch: Partial<SiteContent['cv']>) =>
    setContent((old) => (old ? { ...old, cv: { ...old.cv, ...patch } } : old));
  const groups = [...new Set(siteFields.map((field) => field.group)), 'CV'];
  return (
    <div className="works-manager cms-manager">
      <div className="wm-heading">
        <h1>Website</h1>
        <a
          href="/admintgadink/dashboard/editor/home"
          className="wm-button"
        >
          <Eye size={18} />
          Buka editor visual
        </a>
      </div>
      <div className="cms-sticky-toolbar">
        <span role="status">
          {busy
            ? 'Memproses…'
            : dirty
              ? 'Belum disimpan'
              : saved !== published
                ? 'Draft tersimpan'
                : 'Sudah dipublikasikan'}
        </span>
        <button
          type="button"
          className="wm-button"
          disabled={busy || !dirty}
          onClick={() => {
            setContent(JSON.parse(saved));
            setError('');
          }}
        >
          Batalkan
        </button>
        <button
          type="button"
          className="wm-button"
          disabled={busy || !content || (!dirty && revision > 0)}
          onClick={() => save('save')}
        >
          <Save size={18} />
          Simpan draft
        </button>
        <button
          type="button"
          className="wm-button wm-primary"
          disabled={
            busy ||
            !content ||
            (JSON.stringify(content) === published && revision > 0)
          }
          onClick={() => save('publish')}
        >
          Publikasikan
        </button>
      </div>
      {error && (
        <div className="wm-message wm-error" role="alert">
          {error}
          <button
            type="button"
            className="wm-button"
            disabled={busy}
            onClick={() => {
              if (!dirty || confirm('Muat ulang dan lepaskan perubahan lokal?'))
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
      {content && (
        <>
          <nav className="cms-section-tabs" aria-label="Bagian website">
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
          <fieldset disabled={busy} className="cms-editor-fields">
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
                        onBusyChange={setBusy}
                        onUploaded={(files) => update(field.key, files[0].url)}
                      />
                    </>
                  )}
                </div>
              ))}
            {group === 'CV' && (
              <>
                {(['name', 'role', 'profile', 'capabilities'] as const).map(
                  (key, i) => (
                    <label key={key}>
                      {['Nama', 'Posisi', 'Profil', 'Kemampuan'][i]}
                      <textarea
                        rows={key === 'profile' ? 4 : 2}
                        value={content.cv[key]}
                        onChange={(e) => cv({ [key]: e.target.value })}
                      />
                    </label>
                  ),
                )}
                <h3>Pengalaman</h3>
                <SortableList
                  items={content.cv.experience.map((item, i) => ({
                    ...item,
                    id: String(i),
                  }))}
                  disabled={busy}
                  onChange={(next) =>
                    cv({ experience: next.map(({ id, ...item }) => item) })
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
                                    experience: content.cv.experience.map(
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
                        aria-label={`Hapus pengalaman ${i + 1}`}
                        onClick={() =>
                          cv({
                            experience: content.cv.experience.filter(
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
                      experience: [
                        ...content.cv.experience,
                        { title: '', period: '', description: '' },
                      ],
                    })
                  }
                >
                  <Plus size={18} />
                  Tambah pengalaman
                </button>
                <h3>PDF CV</h3>
                <FileDrop
                  folder="cv"
                  accept="application/pdf"
                  disabled={busy}
                  onBusyChange={setBusy}
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
                      Gunakan PDF dari isi CV
                    </button>
                  </div>
                )}
              </>
            )}
          </fieldset>
        </>
      )}
    </div>
  );
}
