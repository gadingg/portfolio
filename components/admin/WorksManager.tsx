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
  Settings2,
  FileText,
  MoreHorizontal,
  Upload,
  X,
  ChevronDown,
  Search,
} from 'lucide-react';
import {
  workKinds,
  workLabels,
  setCaseStudyEnabled,
  setWorkKind,
  WorksDraftSchema,
  WorksSchema,
  type WorkItem,
  type WorkKind,
} from '@/lib/works';
import { SortableList } from './SortableList';
import { FileDrop, type UploadedMedia } from './FileDrop';
import { BlockEditor } from './BlockEditor';
import { useConfirm } from './ConfirmDialog';
import './works-manager.css';
import { PublicationBar } from './PublicationBar';
import { VideoSourceEditor } from './VideoSourceEditor';
import { SettingsDisclosure } from './SettingsDisclosure';
export function WorksManager() {
  const {ask,confirmation}=useConfirm();
  const [items, setItems] = useState<WorkItem[]>([]),
    [saved, setSaved] = useState<WorkItem[]>([]),
    [published, setPublished] = useState<WorkItem[]>([]),
    [revision, setRevision] = useState<number | null>(null);
  const revisionRef = useRef<number | null>(null);
  const mutationLock = useRef(false);
  const [query, setQuery] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [kind, setKind] = useState<WorkKind>('webapp'),
    [editing, setEditing] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [operation, setOperation] = useState<'save' | 'publish' | null>(null);
  const [removed, setRemoved] = useState<{
    item: WorkItem;
    index: number;
  } | null>(null);
  const dirty = JSON.stringify(items) !== JSON.stringify(saved),
    unpublished = JSON.stringify(items) !== JSON.stringify(published);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  function adopt(data: any) {
    dirtyRef.current = false;
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
      const selected = new URLSearchParams(window.location.search).get('work');
      const work = data.items.find((item: WorkItem) => item.id === selected);
      if (work) { setKind(work.kind); setEditing(work.id); }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Portfolio belum bisa dimuat.');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const selectedKind=new URLSearchParams(window.location.search).get('kind');
    if(workKinds.includes(selectedKind as WorkKind))setKind(selectedKind as WorkKind);
    load();
  }, []);
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});document.querySelector('.admin-main')?.scrollTo({top:0,behavior:'instant'});},[editing]);
  useEffect(() => {
    if (revision === null) return;
    const url = new URL(window.location.href);
    url.searchParams.set('kind', kind);
    if (editing) url.searchParams.set('work', editing);
    else url.searchParams.delete('work');
    window.history.replaceState(null, '', url);
  }, [kind, editing, revision]);
  useEffect(() => {
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return;
      document.querySelectorAll<HTMLDetailsElement>('.wm-action-menu[open]').forEach(menu => {
        if (event instanceof KeyboardEvent || !menu.contains(event.target as Node)) {
          menu.open = false;
          if (event instanceof KeyboardEvent) menu.querySelector<HTMLElement>('summary')?.focus();
        }
      });
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, []);
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
        a.target !== '_blank'
      ) {
        e.preventDefault();
        e.stopPropagation();
        void ask('Masih ada perubahan yang belum disimpan. Tetap keluar?', 'Tinggalkan').then(yes=>{if(yes){dirtyRef.current=false;window.location.assign(a.href);}});
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
    if (busy || mutationLock.current) return false;
    const validation=(action==='publish'?WorksSchema:WorksDraftSchema).safeParse({items});
    if(!validation.success){
      const issue=validation.error.issues[0],index=issue.path[0]==='items'&&typeof issue.path[1]==='number'?issue.path[1]:null;
      if(index!==null&&items[index]){setEditing(items[index].id);setKind(items[index].kind);}
      setError(`${index!==null&&items[index]?items[index].title+': ':''}${issue.message}`);
      return false;
    }
    mutationLock.current = true;
    setOperation(action);
    setBusy(true);
    setError('');
    setNotice('');
    try {
      adopt(await send(action));
      setRemoved(null);
      setNotice(
        action === 'publish' ? 'Perubahan portfolio sudah tayang.' : 'Draft tersimpan.',
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Belum tersimpan.');
      return false;
    } finally {
      mutationLock.current = false;
      setOperation(null);
      setBusy(false);
    }
  }
  async function order(next: WorkItem[]) {
    if (busy || mutationLock.current) return;
    mutationLock.current = true;
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
      mutationLock.current = false;
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
      title: 'Portfolio baru',
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
        image: file.type.startsWith('video/') ? file.cover||'' : file.url,
        ...(file.type.startsWith('video/')?{videoFile:file.url}:{}),
        imageAlt: file.filename.replace(/\.[^.]+$/, ''),
        url: '',
        published: false,
        demo: false,
        artwork: 'sample' as const,
      })),
    ]);
    setNotice(`${files.length} portfolio ditambahkan ke draft.`);
  }
  const addLabel = kind === 'video' ? 'Tambah video' : kind === 'design' ? 'Tambah desain' : 'Tambah website / app';
  function closeMenu(target: HTMLElement) {
    const menu = target.closest('details');
    if (menu) { menu.open = false; menu.querySelector<HTMLElement>('summary')?.focus(); }
  }
  const item = items.find((value) => value.id === editing),
    visible = items.filter((value) => value.kind === kind && value.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const publicItem = published.find(value => value.id === editing && value.published);
  async function openVisual() {
    if (!item || busy) return;
    if (dirty && !(await save('save'))) return;
    window.location.assign(`/admintgadink/dashboard/editor/${item.id}`);
  }
  return (
    <div className="works-manager cms-manager wm-workspace" onDragEnter={event => {
      if (!editing && !busy && event.dataTransfer.types.includes('Files')) setShowImport(true);
    }}>
      {confirmation}
      <div className="wm-heading">
        <div>
          {editing && (
            <button
              type="button"
              className="wm-button"
              onClick={() => setEditing(null)}
            >
              <ArrowLeft size={18} />
              Semua portfolio
            </button>
          )}
          <h1>{item ? 'Edit portfolio' : 'Portfolio'}</h1>
          {revision !== null && !dirty && !unpublished && <p className="wm-clean-status" role="status">Semua perubahan sudah tayang</p>}
        </div>
        <a
          className="wm-public-link"
          href={publicItem?.caseStudy ? `/work/${publicItem.caseStudy.slug}` : `/${kind}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Lihat publik
          <ExternalLink size={18} />
        </a>
      </div>
      {revision !== null && <PublicationBar dirty={dirty} unpublished={unpublished} busy={busy} operation={operation} scope="Berlaku untuk seluruh perubahan koleksi."
        onCancel={() => { setItems(saved); setRemoved(null); setError(''); if (editing && !saved.some(work => work.id === editing)) setEditing(null); }}
        onSave={() => { void save('save'); }} onPublish={() => { void save('publish'); }}/>}
      {error && (
        <div className="wm-message wm-error" role="alert">
          {error}
          <button
            className="wm-button"
            type="button"
            disabled={busy}
            onClick={async () => {
              if (!dirty || await ask('Muat ulang dan lepaskan perubahan lokal?', 'Muat ulang'))
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
      {revision === null && !error && <p role="status">Memuat portfolio…</p>}
      {revision !== null && !item && (
        <>
          <div className="wm-tabs" role="group" aria-label="Kategori portfolio">
            {workKinds.map((value) => (
              <button
                key={value}
                type="button"
                className="wm-button"
                aria-pressed={kind === value}
                aria-label={`${workLabels[value]} ${items.filter(work => work.kind === value).length}`}
                disabled={busy}
                onClick={() => { setKind(value); setQuery(''); setShowImport(false); }}
              >
                <span className="wm-tab-label">{workLabels[value]}</span>
                <span className="wm-tab-short" aria-hidden="true">{{webapp:'Web / Apps',design:'Desain',video:'Video'}[value]}</span>
                <span>
                  {items.filter((item) => item.kind === value).length}
                </span>
              </button>
            ))}
          </div>
          <div className="wm-toolbar">
            <label className="wm-search"><span className="wm-sr-only">Cari portfolio</span><Search size={18} aria-hidden="true"/><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari judul portfolio…" /></label>
            {!busy ? <details className="wm-action-menu wm-add-menu">
              <summary className="wm-button wm-primary"><Plus size={18} aria-hidden="true"/>{addLabel}<ChevronDown size={16} aria-hidden="true"/></summary>
              <div className="wm-menu-panel">
                <button type="button" onClick={event => { closeMenu(event.currentTarget); setShowImport(false); add(); }}><Plus size={18}/>Buat satu portfolio</button>
                <button type="button" onClick={event => { closeMenu(event.currentTarget); setShowImport(true); }}><Upload size={18}/>{kind === 'video' ? 'Upload / pilih video' : 'Upload / pilih gambar'}</button>
              </div>
            </details> : <button type="button" className="wm-button wm-primary" disabled>{addLabel}</button>}
          </div>
          {showImport && <section className="wm-import-panel" aria-label="Tambah dari media">
            <div className="cms-panel-heading"><h2>{kind === 'video' ? 'Tambahkan video' : 'Tambahkan gambar'}</h2><button type="button" className="wm-button" aria-label="Tutup upload" disabled={busy} onClick={() => setShowImport(false)}><X size={18}/></button></div>
            <FileDrop
            key={kind}
            multiple
            accept={kind==='video'?'video/mp4,video/webm':'image/jpeg,image/png,image/webp,image/gif'}
            disabled={busy}
            onBusyChange={setBusy}
            onUploaded={importImages}
          /></section>}
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
          <SortableList items={visible} disabled={busy || !!query} onChange={order}>
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
                      {JSON.stringify(work) !== JSON.stringify(published.find(value => value.id === work.id)) ? 'Ada perubahan draft' : work.published ? 'Tayang' : 'Disembunyikan'}
                      {work.caseStudy ? ' · Studi kasus' : ''}

                    </span>
                  </span>
                  <span className="wm-edit">Edit</span>
                </button>
                <details className="wm-action-menu wm-row-menu">
                <summary className="wm-button" aria-label={`Tindakan ${work.title}`}><MoreHorizontal size={20} aria-hidden="true"/></summary>
                <div className="wm-menu-panel">
                <button type="button" disabled={busy} onClick={event => {closeMenu(event.currentTarget);setEditing(work.id);}}>Edit portfolio</button>
                <button
                  type="button"
                  className="wm-menu-delete"
                  disabled={busy}
                  aria-label={`Hapus ${work.title}`}
                  onClick={async (event) => {
                    closeMenu(event.currentTarget);
                    if (!(await ask(`Hapus “${work.title}” dari draft?`))) return;
                    setRemoved({ item: work, index: items.indexOf(work) });
                    setItems(items.filter((item) => item.id !== work.id));
                  }}
                >
                  <Trash2 size={18} />
                  Hapus dari draft
                </button>
                </div></details>
              </div>
            )}
          </SortableList>
          {!visible.length && <p className="wm-empty">{query?'Tidak ada judul yang cocok.':'Belum ada portfolio.'}</p>}
        </>
      )}
      {item && (
        <div className="wm-editor-layout">
        <fieldset className="cms-editor-fields" disabled={busy}>
          <div className="cms-edit-heading"><h2>Detail portfolio</h2>{item.caseStudy&&<button type="button" className="wm-button wm-primary" onClick={openVisual}>{dirty?'Simpan & buka editor visual':'Edit studi kasus secara visual'}</button>}</div>
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
                  update(item.id, setWorkKind(item, e.target.value as WorkKind));
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
          {item.kind!=='video'&&<FileDrop
            disabled={busy}
            onBusyChange={setBusy}
            onUploaded={(files) => update(item.id, { image: files[0].url })}
          />}
          <div className="cms-inline-fields">
            <label className="wm-check cms-visibility">
              <input
                type="checkbox"
                checked={item.published}
                onChange={(e) =>
                  update(item.id, { published: e.target.checked })
                }
              />
              <span><strong>Tampilkan di portfolio</strong><small>{item.published?'Ikut tayang setelah perubahan dipublikasikan.':'Disembunyikan setelah perubahan dipublikasikan. Datanya tetap ada.'}</small></span>
            </label>
            {item.kind === 'webapp' && (
              <label className="wm-check">
                <input
                  type="checkbox"
                  checked={!!item.caseStudy}
                  onChange={(e) =>
                    update(item.id, setCaseStudyEnabled(item, e.target.checked))
                  }
                />
                Pakai studi kasus
              </label>
            )}
          </div>
          {!item.caseStudy&&item.archivedCaseStudy&&<p className="wm-message" role="status">{item.kind==='webapp'?'Studi kasusnya masih aman. Aktifkan lagi buat lanjut edit.':'Studi kasusnya masih aman. Pilih Website / Apps buat lanjut edit.'}</p>}
          {!item.caseStudy && item.kind !== 'design' && (
            <label>
              {item.kind === 'video' ? 'Link Instagram (boleh kosong kalau ada file video)' : 'Link aplikasi'}
              <input
                value={item.url}
                inputMode="url"
                onChange={(e) => update(item.id, { url: e.target.value })}
              />
            </label>
          )}
          {item.kind==='video'&&<VideoSourceEditor key={item.id} value={item.videoFile||''} cover={item.image} disabled={busy} onBusyChange={setBusy} onChange={patch=>update(item.id,patch)}/>}
          {item.caseStudy && (
            <SettingsDisclosure title="Studi Kasus & Editor Blok" icon={<FileText size={20}/>}>
              <div className="cms-block-fields">
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
              </div>
            </SettingsDisclosure>
          )}
          <SettingsDisclosure title="Pengaturan Tambahan" icon={<Settings2 size={20}/>}>
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
                Konten sementara
              </label>
            </div>
          </SettingsDisclosure>
        </fieldset>
        <aside className="wm-card-preview" aria-label="Preview kartu portfolio">
          <h2>Preview kartu</h2>
          {item.image ? <img src={item.image} alt={item.imageAlt || item.title}/> : <div className="wm-preview-empty">{item.kind === 'video' ? 'Pilih thumbnail video' : 'Tambahkan gambar portfolio'}</div>}
          <h3>{item.title}</h3>
          {item.description && <p>{item.description}</p>}
          <span>{item.published ? 'Akan ditampilkan' : 'Disembunyikan'}</span>
        </aside>
        </div>
      )}
    </div>
  );
}
