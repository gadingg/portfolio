'use client';
import { workReadiness } from '@/lib/work-readiness';
import { homepageWorks, setHomepageFeatured } from '@/lib/homepage-works';
import { CaseAppLinksEditor } from './CaseAppLinksEditor';
import {CaseMotionEditor} from './CaseMotionEditor';
import { CaseLayoutImages } from './CaseLayoutImages';
import { CaseLayoutText } from './CaseLayoutText';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Undo2,
  Settings2,
  FileText,
  MoreHorizontal,
  Upload,
  X,
  ChevronDown,
  Search,
  ListOrdered,
  Check,
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
import { usePublishReview } from './PublishReview';
import { summarizeWorks } from '@/lib/publish-summary';
import './works-manager.css';
import { PublicationBar } from './PublicationBar';
import { VideoSourceEditor } from './VideoSourceEditor';
import { SettingsDisclosure } from './SettingsDisclosure';
import { draftSaveMessage, sameDraftContent } from '@/lib/draft-backup';
import { useAutoDraft } from './useAutoDraft';
import { DraftRecovery } from './DraftRecovery';
import { workPublicationCopy } from '@/lib/admin-copy';
export function WorksManager() {
  const {ask,confirmation}=useConfirm();
  const {review,publicationReview}=usePublishReview();
  const [items, setItems] = useState<WorkItem[]>([]),
    [saved, setSaved] = useState<WorkItem[]>([]),
    [published, setPublished] = useState<WorkItem[]>([]),
    [revision, setRevision] = useState<number | null>(null);
  const revisionRef = useRef<number | null>(null);
  const mutationLock = useRef(false);
  const pendingMutation = useRef<Promise<void> | null>(null);
  const finishMutation = useRef<(() => void) | null>(null);
  const uploadBusy = useRef(false);
  const savedRef = useRef(saved);
  function mediaBusy(value: boolean) { uploadBusy.current = value; setBusy(value); }
  const [query, setQuery] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [reorderMode,setReorderMode]=useState(false);
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
  const dirty = !sameDraftContent(JSON.stringify(items), JSON.stringify(saved)),
    unpublished = !sameDraftContent(JSON.stringify(items), JSON.stringify(published));
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const autosave = useAutoDraft({ storageKey: 'portfolio:draft:works:v1', value: JSON.stringify(items), baseline: JSON.stringify(saved), revision,
    enabled: revision !== null, blocked: busy, saving: operation === 'save', save: () => save('save', true),
    restore: value => { const items = JSON.parse(value); if (!Array.isArray(items) || items.some(item => !item || typeof item.id !== 'string' || typeof item.title !== 'string' || !workKinds.includes(item.kind))) throw Error('Cadangan tidak valid.'); setItems(items); }, ask });
  function adopt(data: any, snapshot?: string, workId?: string) {
    const submitted: WorkItem[] = snapshot ? JSON.parse(snapshot) : [];
    setItems(current => {
      if (!workId) return snapshot && JSON.stringify(current) !== snapshot ? current : data.items;
      const sent = submitted.find(item => item.id === workId);
      const canonical = data.items.find((item: WorkItem) => item.id === workId);
      return current.map(item => item.id === workId && JSON.stringify(item) === JSON.stringify(sent) ? canonical || item : item);
    });
    setSaved(data.items);
    savedRef.current = data.items;
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
      setError(e instanceof Error ? e.message : 'Portofolio belum bisa dimuat.');
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
  async function send(
    action: 'save' | 'publish',
    content = items,
    ids?: string[],
    workId?: string,
  ) {
    const r = await fetch('/api/admin/works', {
      method: 'PUT',
      signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        workId,
        revision: revisionRef.current,
        items: content,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw Error(data.error);
    revisionRef.current = data.revision;
    return data;
  }
  async function save(action: 'save' | 'publish', automatic = false) {
    if (mutationLock.current || uploadBusy.current || revisionRef.current === null) return false;
    const snapshot = itemsRef.current;
    const workId = action === 'publish' ? editing || undefined : undefined;
    const selected = snapshot.find(value => value.id === workId);
    const validation = action === 'publish'
      ? WorksSchema.safeParse({ items: workId ? selected ? [selected] : [] : snapshot })
      : WorksDraftSchema.safeParse({ items: snapshot });
    if (!validation.success) { setError(validation.error.issues[0].message); return false; }
    mutationLock.current = true;
    pendingMutation.current = new Promise(resolve => { finishMutation.current = resolve; });
    setOperation(action); setBusy(true); setError('');
    if (!automatic) setNotice('');
    try {
      if (action === 'publish' && !workId && !(await review(summarizeWorks(snapshot, published)))) return false;
      adopt(await send(action, selected ? [selected] : snapshot, undefined, workId), JSON.stringify(snapshot), workId);
      setRemoved(null);
      if (!automatic) setNotice(action === 'publish' ? selected ? selected.published ? `${selected.title} sudah di-publish.` : `${selected.title} disembunyikan dari website.` : 'Semua perubahan sudah di-publish.' : 'Draft tersimpan.');
      return true;
    } catch (e) { setError(draftSaveMessage(e)); return false; }
    finally { mutationLock.current = false; setOperation(null); setBusy(false); finishMutation.current?.(); pendingMutation.current = null; }
  }
  function order(next: WorkItem[]) {
    if (busy || mutationLock.current || query) return;
    const positions = items
      .map((item, i) => (item.kind === kind ? i : -1))
      .filter((i) => i >= 0);
    const ordered = [...items];
    positions.forEach((position, i) => (ordered[position] = next[i]));
    setItems(ordered);
    setError('');
    setNotice('Urutan tersimpan otomatis. Pilih Publish semua untuk mengubah urutan di website.');
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
      title: 'Portofolio baru',
      description: '',
      image: '',
      imageAlt: '',
      url: '',
      published: true,
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
        published: true,
        demo: false,
        artwork: 'sample' as const,
      })),
    ]);
    setNotice(`${files.length} portofolio ditambahkan ke draft.`);
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
    if (!item || uploadBusy.current) return;
    if (pendingMutation.current) await pendingMutation.current;
    if (JSON.stringify(itemsRef.current) !== JSON.stringify(savedRef.current) && !(await save('save'))) return;
    window.location.assign(`/admintgadink/dashboard/editor/${item.id}`);
  }
  if (autosave.recovery) return <DraftRecovery backup={autosave.recovery} onUseServer={autosave.useServerVersion} />;
  const selectedUnpublished = item ? !sameDraftContent(JSON.stringify(item), JSON.stringify(published.find(value => value.id === item.id) || null)) : unpublished;
  const selectedDirty = item ? !sameDraftContent(JSON.stringify(item), JSON.stringify(saved.find(value => value.id === item.id) || null)) : dirty;
  const editingLocked = busy && operation !== 'save';
  const publicationCopy = workPublicationCopy(item, published.find(value => value.id === item?.id));
  return (
    <div className="works-manager cms-manager wm-workspace" onDragEnter={event => {
      if (!editing && !busy && event.dataTransfer.types.includes('Files')) setShowImport(true);
    }}>
      {confirmation}
      {publicationReview}
      <div className="wm-heading">
        <div>
          {editing && (
            <button
              type="button"
              className="wm-button"
              onClick={() => setEditing(null)}
            >
              <ArrowLeft size={18} />
              Semua portofolio
            </button>
          )}
          <h1>{item ? 'Edit portofolio' : 'Portofolio'}</h1>
          {revision !== null && !dirty && !unpublished && <p className="wm-clean-status" role="status">Semua perubahan tersimpan</p>}
        </div>
        <a
          className="wm-public-link"
          href={publicItem?.caseStudy ? `/work/${publicItem.caseStudy.slug}` : `/${kind}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Lihat website
          <ExternalLink size={18} />
        </a>
      </div>
      {revision !== null && <PublicationBar dirty={selectedDirty} unpublished={selectedUnpublished} busy={busy} operation={operation} scope={publicationCopy.scope} publishLabel={item ? publicationCopy.publishLabel : 'Publish semua'}
        busyLabel={publicationCopy.busyLabel} showPublish={publicationCopy.showPublish} pendingSuffix={publicationCopy.pendingSuffix}
        status={!dirty && !selectedUnpublished && autosave.online ? publicationCopy.cleanLabel : autosave.status} offline={!autosave.online} failed={autosave.failed}
        onSave={autosave.retry} onPublish={() => { void save('publish'); }}/>}
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
      {revision === null && !error && <p role="status">Memuat portofolio…</p>}
      {revision !== null && !item && (
        <>
          <div className="wm-tabs" role="group" aria-label="Kategori portofolio">
            {workKinds.map((value) => (
              <button
                key={value}
                type="button"
                className="wm-button"
                aria-pressed={kind === value}
                aria-label={`${workLabels[value]} ${items.filter(work => work.kind === value).length}`}
                disabled={busy}
                onClick={() => { setKind(value); setQuery(''); setShowImport(false); setReorderMode(false); }}
              >
                <span className="wm-tab-label">{workLabels[value]}</span>
                <span className="wm-tab-short" aria-hidden="true">{{webapp:'Web / Apps',design:'Desain',video:'Video'}[value]}</span>
                <span>
                  {items.filter((item) => item.kind === value).length}
                </span>
              </button>
            ))}
          </div>
          {kind === 'webapp' && <SettingsDisclosure title="Pilihan homepage" status={`${homepageWorks(items).length} dari 3 portfolio`} icon={<Eye size={20}/>}>
            <p className="wm-editor-note">Pilih sampai 3 project unggulan. Urutannya mengikuti koleksi lengkap.</p>
            <div className="wm-featured-options">
              {items.filter(work => work.kind === 'webapp' && work.published && !workReadiness(work)).map(work => {
                const selected = homepageWorks(items).some(value => value.id === work.id);
                return <label className="wm-check" key={work.id}>
                  <input type="checkbox" checked={selected} disabled={busy || (!selected && homepageWorks(items).length >= 3)}
                    onChange={event => setItems(current => setHomepageFeatured(current, work.id, event.target.checked))}/>
                  <span>{work.title}</span>
                </label>;
              })}
            </div>
          </SettingsDisclosure>}
          <div className="wm-toolbar">
            <button type="button" className="wm-button" aria-pressed={reorderMode} disabled={busy||!!query} onClick={()=>setReorderMode(!reorderMode)}>{reorderMode?<Check size={18}/>:<ListOrdered size={18}/>} {reorderMode?'Selesai mengurutkan':'Atur urutan'}</button>
            <label className="wm-search"><span className="wm-sr-only">Cari portofolio</span><Search size={18} aria-hidden="true"/><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari judul portofolio…" /></label>
            {!busy ? <details className="wm-action-menu wm-add-menu">
              <summary className="wm-button wm-primary"><Plus size={18} aria-hidden="true"/>{addLabel}<ChevronDown size={16} aria-hidden="true"/></summary>
              <div className="wm-menu-panel">
                <button type="button" onClick={event => { closeMenu(event.currentTarget); setShowImport(false); add(); }}><Plus size={18}/>Buat satu portofolio</button>
                <button type="button" onClick={event => { closeMenu(event.currentTarget); setShowImport(true); }}><Upload size={18}/>{kind === 'video' ? 'Upload / pilih video' : 'Upload / pilih gambar'}</button>
              </div>
            </details> : <button type="button" className="wm-button wm-primary" disabled>{addLabel}</button>}
          </div>
          {showImport && <section className="wm-import-panel" aria-label="Tambah dari media">
            <div className="cms-panel-heading"><h2>{kind === 'video' ? 'Tambahkan video' : 'Tambahkan gambar'}</h2><button type="button" className="wm-button" aria-label="Tutup upload" disabled={busy} onClick={() => setShowImport(false)}><X size={18}/></button></div>
            <FileDrop
            key={kind}
            multiple
            accept={kind==='video'?'video/mp4':'image/jpeg,image/png,image/webp,image/gif'}
            disabled={busy}
            onBusyChange={mediaBusy}
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
          <SortableList items={visible} reorderable={reorderMode} disabled={busy || !!query} onChange={order}>
            {(work, index, handle) => (
              <div className="cms-work-row">
                {handle}
                <button
                  type="button"
                  className="cms-work-open"
                  disabled={busy||reorderMode}
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
                      {!sameDraftContent(JSON.stringify(work), JSON.stringify(published.find(value => value.id === work.id) || null)) ? 'Ada perubahan draft' : !work.published ? 'Disembunyikan' : workReadiness(work) || 'Tayang'}
                      {work.caseStudy ? ' · Studi kasus' : ''}

                    </span>
                  </span>
                  <span className="wm-edit">Edit</span>
                </button>
                <details className="wm-action-menu wm-row-menu" hidden={reorderMode}>
                <summary className="wm-button" aria-label={`Tindakan ${work.title}`}><MoreHorizontal size={20} aria-hidden="true"/></summary>
                <div className="wm-menu-panel">
                <button type="button" disabled={busy} onClick={event => {closeMenu(event.currentTarget);setEditing(work.id);}}>Edit portofolio</button>
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
          {!visible.length && <p className="wm-empty">{query?'Tidak ada judul yang cocok.':'Belum ada portofolio.'}</p>}
        </>
      )}
      {item && (
        <div className="wm-editor-layout">
        <fieldset className="cms-editor-fields" disabled={editingLocked}>
          <div className="cms-edit-heading"><h2>Detail portofolio</h2>{item.caseStudy&&<a className="wm-button" href={`/admintgadink/dashboard/ai?work=${item.id}`}>Revisi dengan AI</a>}{item.caseStudy&&<button type="button" className="wm-button wm-primary" onClick={openVisual}>Edit halaman studi kasus</button>}</div>
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
            previewSrc={item.image} previewAlt={item.imageAlt || item.title}
            uploadLabel={item.image ? 'Ganti cover portfolio' : 'Tambah cover portfolio'}
            disabled={busy}
            onBusyChange={mediaBusy}
            onUploaded={(files) => update(item.id, { image: files[0].url })}
          />}
          {item.kind === 'webapp' && <label className="wm-check cms-visibility">
            <input type="checkbox" disabled={busy || !item.published || !!workReadiness(item) || (!homepageWorks(items).some(work => work.id === item.id) && homepageWorks(items).length >= 3)}
              checked={homepageWorks(items).some(work => work.id === item.id)}
              onChange={event => setItems(current => setHomepageFeatured(current, item.id, event.target.checked))}/>
            <span><strong>Unggulan di homepage</strong><small>{!item.published || workReadiness(item) ? 'Lengkapi portfolio dan aktifkan tampilannya untuk memilihnya.' : `${homepageWorks(items).length}/3 dipilih. Lepas satu pilihan untuk menggantinya. Koleksi lengkap tetap mengikuti urutan portfolio.`}</small></span>
          </label>}
          <div className="cms-inline-fields">
            <label className="wm-check cms-visibility">
              <input
                type="checkbox"
                checked={item.published}
                onChange={(e) =>
                  update(item.id, { published: e.target.checked })
                }
              />
              <span><strong>Tampilkan di portofolio</strong><small>{item.published?'Tayang setelah Anda memilih Publish.':'Tidak tampil di website setelah Anda memilih Sembunyikan.'}</small></span>
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
          {!item.caseStudy&&item.archivedCaseStudy&&<p className="wm-message" role="status">{item.kind==='webapp'?'Isi studi kasus masih tersimpan. Aktifkan untuk mengeditnya.':'Isi studi kasus masih tersimpan. Pilih Website / Apps untuk mengeditnya.'}</p>}
          {!item.caseStudy && item.kind === 'webapp' && (
            <label>
              Link aplikasi
              <input
                value={item.url}
                inputMode="url"
                onChange={(e) => update(item.id, { url: e.target.value })}
              />
            </label>
          )}
          {item.kind==='video'&&<VideoSourceEditor key={item.id} item={item} disabled={busy} onBusyChange={mediaBusy} onChange={patch=>update(item.id,patch)}/>}
          {item.caseStudy && (
            <SettingsDisclosure title="Isi studi kasus" icon={<FileText size={20}/>}>
              <div className="cms-block-fields">
              {item.aiDraft&&<div className="wm-ai-notes"><h3>Catatan AI khusus admin</h3><label>Brief awal<textarea rows={5} maxLength={30000} value={item.aiDraft.brief} onChange={event=>update(item.id,{aiDraft:{...item.aiDraft!,brief:event.target.value}})}/></label>{!!item.aiDraft.confirmations.length&&<><h4>Perlu dikonfirmasi</h4><ul>{item.aiDraft.confirmations.map((text,index)=><li key={index}>{text}</li>)}</ul></>}{!!item.aiDraft.screenshots.length&&<><h4>Saran screenshot</h4><ul>{item.aiDraft.screenshots.map((shot,index)=><li key={index}>Setelah bagian {shot.afterSection+1}: {shot.description}{shot.caption&&<p>Caption: {shot.caption}</p>}</li>)}</ul></>}<p className="wm-editor-note">Brief dan catatan AI tidak ikut ditampilkan di portfolio publik.</p></div>}
              <div className="cms-inline-fields">
                <label>
                  Alamat halaman
                  <input placeholder="nama-portofolio"
                    value={item.caseStudy.slug}
                    onChange={(e) =>
                      update(item.id, {
                        caseStudy: { ...item.caseStudy!, slug: e.target.value },
                      })
                    }
                  />
                  <small>/work/{item.caseStudy.slug || 'nama-portofolio'}</small>
                </label>
              </div>
              <CaseAppLinksEditor study={item.caseStudy} onChange={appLinks=>update(item.id,{caseStudy:{...item.caseStudy!,appUrl:appLinks[0]?.url||'',appLinks}})}/>
              <CaseMotionEditor study={item.caseStudy} disabled={busy} onBusyChange={mediaBusy} onChange={motion=>update(item.id,{caseStudy:{...item.caseStudy!,motion}})}/>
              {(['problem', 'solution', 'impact'] as const).map((key, i) => (
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
              {item.caseStudy.layout && <><CaseLayoutText layout={item.caseStudy.layout} disabled={busy}
                onChange={layout => update(item.id, { caseStudy: { ...item.caseStudy!, layout } })}/><CaseLayoutImages layout={item.caseStudy.layout} disabled={busy} onBusyChange={mediaBusy}
                onChange={layout => update(item.id, { caseStudy: { ...item.caseStudy!, layout } })}/></>}
              {!item.caseStudy.layout&&<BlockEditor
                blocks={item.caseStudy.blocks}
                disabled={busy}
                onBusyChange={mediaBusy}
                onChange={(blocks) =>
                  update(item.id, { caseStudy: { ...item.caseStudy!, blocks } })
                }
              />}
              <div className="wm-visual-advanced"><h3>Editor visual lanjutan</h3><p className="wm-editor-note">Untuk mengatur susunan halaman langsung di canvas.</p><button type="button" className="wm-button" disabled={busy} onClick={openVisual}>{dirty ? 'Simpan & buka editor visual' : 'Buka editor visual'}</button></div>
              <a
                className="wm-button"
                target="_blank"
                rel="noopener noreferrer"
                href={`/admintgadink/preview/${item.id}`}
              >
                <Eye size={18} />
                Preview draft
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
                Portofolio contoh
                <small>Tidak masuk statistik klik.</small>
              </label>
            </div>
          </SettingsDisclosure>
        </fieldset>
        <aside className="wm-card-preview" aria-label="Preview kartu portofolio">
          <h2>Preview kartu</h2>
          {item.image ? <img src={item.image} alt={item.imageAlt || item.title}/> : <div className="wm-preview-empty">{item.kind === 'video' ? 'Pilih thumbnail video' : 'Tambahkan gambar portofolio'}</div>}
          <h3>{item.title}</h3>
          {item.description && <p>{item.description}</p>}
          <span>{!item.published ? 'Disembunyikan' : workReadiness(item) || 'Siap ditampilkan'}</span>
        </aside>
        </div>
      )}
    </div>
  );
}
