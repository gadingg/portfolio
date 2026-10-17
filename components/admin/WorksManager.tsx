'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Eye,
  Undo2,
} from 'lucide-react';
import {
  workKinds,
  workLabels,
  type WorkItem,
  type WorkKind,
} from '@/lib/works';
import { SortableList } from './SortableList';
import { FileDrop, type UploadedMedia } from './FileDrop';
import { BlockEditor } from './BlockEditor';
import './works-manager.css';
export function WorksManager() {
  const [items, setItems] = useState<WorkItem[]>([]),
    [saved, setSaved] = useState<WorkItem[]>([]),
    [published, setPublished] = useState<WorkItem[]>([]),
    [revision, setRevision] = useState<number | null>(null);
  const revisionRef = useRef<number | null>(null);
  const [kind, setKind] = useState<WorkKind>('webapp'),
    [editing, setEditing] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [removed, setRemoved] = useState<{
    item: WorkItem;
    index: number;
  } | null>(null);
  const dirty = JSON.stringify(items) !== JSON.stringify(saved),
    unpublished = JSON.stringify(items) !== JSON.stringify(published);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  function adopt(data: any) {
    setItems(data.items);
    setSaved(data.items);
    setPublished(data.published || []);
    setRevision(data.revision);
    revisionRef.current = data.revision;
  }
  async function load() {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/admin/works', { cache: 'no-store' });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      adopt(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Karya belum bisa dimuat.');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});document.querySelector('.admin-main')?.scrollTo({top:0,behavior:'instant'});},[editing]);
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
  async function send(
    action: 'save' | 'publish' | 'order',
    content = items,
    ids?: string[],
  ) {
    const r = await fetch('/api/admin/works', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        revision: revisionRef.current,
        ...(action === 'order' ? { ids } : { items: content }),
      }),
    });
    const data = await r.json();
    if (!r.ok) throw Error(data.error);
    revisionRef.current = data.revision;
    return data;
  }
  async function save(action: 'save' | 'publish') {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      adopt(await send(action));
      setRemoved(null);
      setNotice(
        action === 'publish' ? 'Karya dipublikasikan.' : 'Draft tersimpan.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Belum tersimpan.');
    } finally {
      setBusy(false);
    }
  }
  async function order(next: WorkItem[]) {
    if (busy) return;
    const focused = (document.activeElement as HTMLElement)
      ?.closest('[data-sortable]')
      ?.getAttribute('data-sortable');
    const positions = items
      .map((item, i) => (item.kind === kind ? i : -1))
      .filter((i) => i >= 0);
    const ordered = [...items];
    positions.forEach((position, i) => (ordered[position] = next[i]));
    setItems(ordered);
    setBusy(true);
    setError('');
    try {
      if (dirty) await send('save', items);
      adopt(
        await send(
          'order',
          ordered,
          ordered.map((item) => item.id),
        ),
      );
      setNotice('Urutan tersimpan.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Urutan belum tersimpan.');
    } finally {
      setBusy(false);
      if (focused)
        requestAnimationFrame(() =>
          document
            .querySelector<HTMLElement>(
              `[data-sortable="${CSS.escape(focused)}"] .cms-grip`,
            )
            ?.focus(),
        );
    }
  }
  function update(id: string, patch: Partial<WorkItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setNotice('');
  }
  function add() {
    const item: WorkItem = {
      id: crypto.randomUUID(),
      kind,
      title: 'Karya baru',
      description: '',
      image: '',
      imageAlt: '',
      url: '',
      published: false,
      demo: false,
      artwork: 'sample',
    };
    setItems((current) => [...current, item]);
    setEditing(item.id);
  }
  function importImages(files: UploadedMedia[]) {
    setItems((current) => [
      ...current,
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        kind,
        title: file.filename.replace(/\.[^.]+$/, ''),
        description: '',
        image: file.url,
        imageAlt: file.filename.replace(/\.[^.]+$/, ''),
        url: '',
        published: false,
        demo: false,
        artwork: 'sample' as const,
      })),
    ]);
    setNotice(`${files.length} karya ditambahkan ke draft.`);
  }
  const item = items.find((value) => value.id === editing),
    visible = items.filter((value) => value.kind === kind);
  return (
    <div className="works-manager cms-manager">
      <div className="wm-heading">
        {item?.caseStudy&&<a className="wm-button" href={`/admintgadink/dashboard/editor/${item.id}`}>Buka editor visual</a>}
        <div>
          {editing && (
            <button
              type="button"
              className="wm-button"
              onClick={() => setEditing(null)}
            >
              <ArrowLeft size={18} />
              Semua karya
            </button>
          )}
          <h1>{item ? item.title : 'Works'}</h1>
        </div>
        <a
          className="wm-button"
          href={`/${kind}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Lihat publik
          <ExternalLink size={18} />
        </a>
      </div>
      <div className="cms-sticky-toolbar">
        <span role="status">
          {busy
            ? 'Memproses…'
            : dirty
              ? 'Belum disimpan'
              : unpublished
                ? 'Draft tersimpan'
                : 'Sudah dipublikasikan'}
        </span>
        <button
          className="wm-button"
          type="button"
          disabled={busy || !dirty}
          onClick={() => {
            setItems(saved);
            setRemoved(null);
            setError('');
          }}
        >
          Batalkan
        </button>
        <button
          className="wm-button"
          type="button"
          disabled={busy || revision === null || (!dirty && revision > 0)}
          onClick={() => save('save')}
        >
          <Save size={18} />
          Simpan draft
        </button>
        <button
          className="wm-button wm-primary"
          type="button"
          disabled={busy || revision === null || (!unpublished && revision > 0)}
          onClick={() => save('publish')}
        >
          Publikasikan
        </button>
      </div>
      {error && (
        <div className="wm-message wm-error" role="alert">
          {error}
          <button
            className="wm-button"
            type="button"
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
      {revision === null && !error && <p role="status">Memuat karya…</p>}
      {revision !== null && !item && (
        <>
          <div className="wm-tabs" role="group" aria-label="Kategori karya">
            {workKinds.map((value) => (
              <button
                key={value}
                type="button"
                className="wm-button"
                aria-pressed={kind === value}
                onClick={() => setKind(value)}
              >
                {workLabels[value]}
                <span>
                  {items.filter((item) => item.kind === value).length}
                </span>
              </button>
            ))}
          </div>
          <div className="wm-toolbar">
            <h2>{workLabels[kind]}</h2>
            <button
              type="button"
              className="wm-button"
              disabled={busy}
              onClick={add}
            >
              <Plus size={18} />
              Tambah karya
            </button>
          </div>
          <FileDrop
            multiple
            disabled={busy}
            onBusyChange={setBusy}
            onUploaded={importImages}
          />
          {removed && (
            <div className="wm-message" role="status">
              {removed.item.title} dihapus dari draft.
              <button
                type="button"
                className="wm-button"
                disabled={busy}
                onClick={() => {
                  setItems((current) => {
                    const next = [...current];
                    next.splice(removed.index, 0, removed.item);
                    return next;
                  });
                  setRemoved(null);
                }}
              >
                <Undo2 size={18} />
                Urungkan
              </button>
            </div>
          )}
          <SortableList items={visible} disabled={busy} onChange={order}>
            {(work, index, handle) => (
              <div className="cms-work-row">
                {handle}
                <button
                  type="button"
                  className="cms-work-open"
                  disabled={busy}
                  onClick={() => setEditing(work.id)}
                >
                  <span className="wm-thumb">
                    {work.image ? (
                      <img src={work.image} alt="" />
                    ) : (
                      <span>{workLabels[work.kind]}</span>
                    )}
                  </span>
                  <span className="wm-summary">
                    <strong>{work.title}</strong>
                    <span>
                      {work.published ? 'Tampil' : 'Tersembunyi'}
                      {work.caseStudy ? ' · Studi kasus' : ''}
                      {work.demo ? ' · Contoh' : ''}
                    </span>
                  </span>
                  <span className="wm-edit">Edit</span>
                </button>
                <button
                  type="button"
                  className="wm-button"
                  disabled={busy}
                  aria-label={`Hapus ${work.title}`}
                  onClick={() => {
                    setRemoved({ item: work, index: items.indexOf(work) });
                    setItems(items.filter((item) => item.id !== work.id));
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </SortableList>
          {!visible.length && <p className="wm-empty">Belum ada karya.</p>}
        </>
      )}
      {item && (
        <fieldset className="cms-editor-fields" disabled={busy}>
          <div className="cms-inline-fields">
            <label>
              Judul
              <input
                value={item.title}
                maxLength={140}
                onChange={(e) => update(item.id, { title: e.target.value })}
              />
            </label>
            <label>
              Kategori
              <select
                value={item.kind}
                onChange={(e) => {
                  update(item.id, { kind: e.target.value as WorkKind,caseStudy:e.target.value==='webapp'?item.caseStudy:undefined });
                  setKind(e.target.value as WorkKind);
                }}
              >
                {workKinds.map((value) => (
                  <option value={value} key={value}>
                    {workLabels[value]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Deskripsi
            <textarea
              rows={3}
              value={item.description}
              maxLength={500}
              onChange={(e) => update(item.id, { description: e.target.value })}
            />
          </label>
          {item.image && (
            <img
              className="cms-image-preview"
              src={item.image}
              alt={item.imageAlt}
            />
          )}
          <FileDrop
            disabled={busy}
            onBusyChange={setBusy}
            onUploaded={(files) => update(item.id, { image: files[0].url })}
          />
          <div className="cms-inline-fields">
            <label className="wm-check">
              <input
                type="checkbox"
                checked={item.published}
                onChange={(e) =>
                  update(item.id, { published: e.target.checked })
                }
              />
              Tampilkan karya
            </label>
            {item.kind === 'webapp' && (
              <label className="wm-check">
                <input
                  type="checkbox"
                  checked={!!item.caseStudy}
                  onChange={(e) =>
                    update(item.id, {
                      url:e.target.checked?item.url:item.caseStudy?.appUrl||'',
                      caseStudy: e.target.checked
                        ? {
                            slug: `karya-${item.id.slice(0, 8)}`,
                            problem: '',
                            solution: '',
                            impact: '',
                            appUrl: item.url.startsWith('https:')
                              ? item.url
                              : '',
                            blocks: [],
                          }
                        : undefined,
                    })
                  }
                />
                Dengan studi kasus
              </label>
            )}
          </div>
          {!item.caseStudy && item.kind !== 'design' && (
            <label>
              {item.kind === 'video' ? 'Link Instagram' : 'Link aplikasi'}
              <input
                value={item.url}
                inputMode="url"
                onChange={(e) => update(item.id, { url: e.target.value })}
              />
            </label>
          )}
          {item.kind==='video'&&<details className="cms-more"><summary>Video autoplay</summary><div className="cms-block-fields"><label>File video MP4 / WebM<input value={item.videoFile||''} inputMode="url" onChange={event=>update(item.id,{videoFile:event.target.value})}/></label><FileDrop folder="works" accept="video/mp4,video/webm" disabled={busy} onBusyChange={setBusy} onUploaded={files=>update(item.id,{videoFile:files[0].url})}/></div></details>}
          {item.caseStudy && (
            <>
              <div className="cms-inline-fields">
                <label>
                  Slug
                  <input
                    value={item.caseStudy.slug}
                    onChange={(e) =>
                      update(item.id, {
                        caseStudy: { ...item.caseStudy!, slug: e.target.value },
                      })
                    }
                  />
                </label>
                <label>
                  Link aplikasi
                  <input
                    value={item.caseStudy.appUrl}
                    inputMode="url"
                    onChange={(e) =>
                      update(item.id, {
                        caseStudy: {
                          ...item.caseStudy!,
                          appUrl: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
              {!item.caseStudy.layout&&(['problem', 'solution', 'impact'] as const).map((key, i) => (
                <label key={key}>
                  {['Masalah', 'Solusi', 'Hasil'][i]}
                  <textarea
                    rows={3}
                    value={item.caseStudy![key]}
                    onChange={(e) =>
                      update(item.id, {
                        caseStudy: {
                          ...item.caseStudy!,
                          [key]: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              ))}
              {!item.caseStudy.layout&&<BlockEditor
                blocks={item.caseStudy.blocks}
                disabled={busy}
                onBusyChange={setBusy}
                onChange={(blocks) =>
                  update(item.id, { caseStudy: { ...item.caseStudy!, blocks } })
                }
              />}
              <a
                className="wm-button"
                target="_blank"
                rel="noopener noreferrer"
                href={`/admintgadink/preview/${item.id}`}
              >
                <Eye size={18} />
                Preview draft tersimpan
              </a>
            </>
          )}
          <details className="cms-more">
            <summary>Pengaturan lainnya</summary>
            <div className="cms-block-fields">
              <label>
                Deskripsi gambar
                <input
                  value={item.imageAlt}
                  onChange={(e) =>
                    update(item.id, { imageAlt: e.target.value })
                  }
                />
              </label>
              <label>
                URL gambar
                <input
                  value={item.image}
                  onChange={(e) => update(item.id, { image: e.target.value })}
                />
              </label>
              <label className="wm-check">
                <input
                  type="checkbox"
                  checked={item.demo}
                  onChange={(e) => update(item.id, { demo: e.target.checked })}
                />
                Data contoh
              </label>
            </div>
          </details>
        </fieldset>
      )}
    </div>
  );
}
