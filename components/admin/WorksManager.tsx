'use client';
import { workReadiness } from '@/lib/work-readiness';
import {useRouter} from 'next/navigation';
import { incompletePublishedIds, incompleteWorksForReview } from '@/lib/admin-overview';
import { homepageWorks, setHomepageFeatured } from '@/lib/homepage-works';
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
import { useConfirm } from './ConfirmDialog';
import { usePublishReview } from './PublishReview';
import { summarizeWorks } from '@/lib/publish-summary';
import './works-manager.css';
import { PublicationBar } from './PublicationBar';
import { draftSaveMessage, sameDraftContent } from '@/lib/draft-backup';
import { useManualSave as useAutoDraft } from './useManualSave';
import { DraftRecovery } from './DraftRecovery';
import { workPublicationCopy } from '@/lib/admin-copy';
import { workThumbnail } from '@/lib/work-images';
import { AdminSkeleton } from './AdminSkeleton';
import {useAdminToast, useToastMessage} from './AdminToasts';
import {trashExpired, trashTimeLeft, type TrashedWork} from '@/lib/work-trash';
import {WorkEditor} from './WorkEditor';
import {workEditorErrors, focusWorkError, openStudyPreview, type WorkEditorErrors} from '@/lib/work-editor';
type InitialWorks = {items: WorkItem[]; published: WorkItem[]; revision: number; trash?: TrashedWork[]};
export function WorksManager({initial, selection}: {initial?: InitialWorks; selection?: {kind?: string; work?: string; status?: string}} = {}) {
  const router=useRouter();
  const notify = useAdminToast();
  const workspace = useRef<HTMLDivElement>(null), previewDialog = useRef<HTMLDialogElement>(null);
  const freshItems = useRef(new Set<string>());
  const [showFeatured, setShowFeatured] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<WorkEditorErrors>({});
  const [trash, setTrash] = useState<TrashedWork[]>(initial?.trash || []);
  const [showTrash, setShowTrash] = useState(false);
  const [trashBusyId, setTrashBusyId] = useState<string | null>(null);
  const [, tickTrashClock] = useState(0);
  useEffect(() => {const timer = setInterval(() => tickTrashClock(value => value + 1), 60000); return () => clearInterval(timer);}, []);
  const {ask,confirmation}=useConfirm();
  const {review,publicationReview}=usePublishReview();
  const [items, setItems] = useState<WorkItem[]>(initial?.items || []),
    [saved, setSaved] = useState<WorkItem[]>(initial?.items || []),
    [published, setPublished] = useState<WorkItem[]>(initial?.published || []),
    [revision, setRevision] = useState<number | null>(initial?.revision ?? null);
  const revisionRef = useRef<number | null>(initial?.revision ?? null);
  const mutationLock = useRef(false);
  const pendingMutation = useRef<Promise<void> | null>(null);
  const finishMutation = useRef<(() => void) | null>(null);
  const uploadBusy = useRef(false);
  const savedRef = useRef(saved);
  function mediaBusy(value: boolean) { uploadBusy.current = value; setBusy(value); }
  const [query, setQuery] = useState('');
  const [incompleteOnly, setIncompleteOnly] = useState(selection?.status === 'incomplete');
  const incompleteIds = incompletePublishedIds(published);
  const incompleteRecords = incompleteWorksForReview(items,published);
  const [showImport, setShowImport] = useState(false);
  const [reorderMode,setReorderMode]=useState(false);
  const initialWork = initial?.items.find(item => item.id === selection?.work) || (selection?.status === 'incomplete' && !selection?.kind ? incompleteRecords[0]?.item : undefined);
  const [kind, setKind] = useState<WorkKind>(initialWork?.kind || (workKinds.includes(selection?.kind as WorkKind) ? selection?.kind as WorkKind : 'webapp')),
    [editing, setEditing] = useState<string | null>(selection?.work ? initialWork?.id || null : null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [operation, setOperation] = useState<'save' | 'publish' | null>(null);
  useToastMessage(notice);
  useToastMessage(error,'error');
  const dirty = !sameDraftContent(JSON.stringify(items), JSON.stringify(saved)),
    unpublished = !sameDraftContent(JSON.stringify(items), JSON.stringify(published));
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const autosave = useAutoDraft({ storageKey: 'portfolio:draft:works:v1', value: JSON.stringify(items), baseline: JSON.stringify(saved), revision,
    enabled: false, blocked: busy, saving: operation === 'save', save: () => save('save', true),
    restore: value => { const items = JSON.parse(value); if (!Array.isArray(items) || items.some(item => !item || typeof item.id !== 'string' || typeof item.title !== 'string' || !workKinds.includes(item.kind))) throw Error('Cadangan tidak valid.'); setItems(items); } });
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
    setTrash(data.trash || []);
    setRevision(data.revision);
    revisionRef.current = data.revision;
  }
  async function load() {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/admin/works', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
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
    if (initial) return;
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
    if (incompleteOnly) url.searchParams.set('status', 'incomplete');
    else url.searchParams.delete('status');
    window.history.replaceState(null, '', url);
  }, [kind, editing, revision, incompleteOnly]);
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
    if (action === 'publish' && selected) {
      const errors = workEditorErrors(selected);
      setFieldErrors(errors);
      if (Object.keys(errors).length) {
        setError('Lengkapi kolom yang ditandai.');
        requestAnimationFrame(() => focusWorkError(errors, workspace.current));
        return false;
      }
    }
    const validation = action === 'publish'
      ? WorksSchema.safeParse({ items: workId ? selected ? [selected] : [] : snapshot })
      : WorksDraftSchema.safeParse({ items: snapshot });
    if (!validation.success) { setError(validation.error.issues[0].message); return false; }
    mutationLock.current = true;
    pendingMutation.current = new Promise(resolve => { finishMutation.current = resolve; });
    setOperation(action); setBusy(true); setError('');
    if (!automatic) setNotice('');
    try {


      adopt(await send(action, selected ? [selected] : snapshot, undefined, workId), JSON.stringify(snapshot), workId);
      if (!automatic) setNotice(action === 'publish' ? selected ? selected.published ? `${selected.title} sudah tayang.` : `${selected.title} disembunyikan dari website.` : 'Semua perubahan sudah diterbitkan.' : 'Draft tersimpan.');
      else notify('Draft tersimpan.', {id:'autosave', duration:2500});
      return true;
    } catch (e) { setError(draftSaveMessage(e)); return false; }
    finally { mutationLock.current = false; setOperation(null); setBusy(false); finishMutation.current?.(); pendingMutation.current = null; }
  }
  async function changeTrash(action: 'move' | 'restore', id: string) {
    if (uploadBusy.current) return;
    if (pendingMutation.current) await pendingMutation.current;
    if (mutationLock.current || revisionRef.current === null) return;
    mutationLock.current = true; setBusy(true); setTrashBusyId(id);
    pendingMutation.current = new Promise(resolve => {finishMutation.current = resolve;});
    const snapshot = itemsRef.current;
    try {
      const response = await fetch('/api/admin/works/trash', {method:'POST', signal:AbortSignal.timeout(15000),
        headers:{'Content-Type':'application/json'}, body:JSON.stringify({action,id,revision:revisionRef.current,
          ...(action === 'move' ? {item:snapshot.find(work => work.id === id)} : {})})});
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Perubahan belum tersimpan.');
      setItems(current => {
        const next = current.filter(work => work.id !== id);
        if (action === 'restore') {
          const restored = data.items.find((work: WorkItem) => work.id === id);
          if (restored) next.splice(Math.min(data.items.findIndex((work: WorkItem) => work.id === id), next.length), 0, restored);
        }
        return next;
      });
      setSaved(data.items); savedRef.current = data.items; setPublished(data.published);
      setTrash(data.trash); setRevision(data.revision); revisionRef.current = data.revision;
      if (editing === id) setEditing(null);
      setError(''); setNotice('');
      notify(action === 'move' ? 'Portofolio dipindahkan ke Sampah.' : 'Portofolio dipulihkan.', {
        ...(action === 'move' ? {action:{label:'Urungkan',run:() => changeTrash('restore', id)}} : {}),
      });
    } catch (error) {notify(error instanceof Error ? error.message : 'Coba lagi.', {tone:'error'});}
    finally {mutationLock.current = false; setBusy(false); setTrashBusyId(null); finishMutation.current?.(); pendingMutation.current = null;}
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
    setNotice('Urutan tersimpan di draft. Pilih Terbitkan perubahan untuk menerapkannya di website.');
  }
  function update(id: string, patch: Partial<WorkItem>) {
    setFieldErrors(current => Object.keys(current).length ? workEditorErrors({...itemsRef.current.find(work => work.id === id)!,...patch}) : {}); setError('');
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setNotice('');
  }
  function add() {
    const base: WorkItem = {
      id: crypto.randomUUID(),
      kind,
      title: {webapp:'Studi kasus baru',design:'Desain baru',video:'Video baru'}[kind],
      description: '',
      image: '',
      imageAlt: '',
      url: '',
      published: true,
      demo: false,
      artwork: 'sample',
      ...(kind === 'video' ? {videoSource:'file' as const} : {}),
    };
    const item = kind === 'webapp' ? setCaseStudyEnabled(base,true) : base;
    freshItems.current.add(item.id);
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
  const addLabel = kind === 'video' ? 'Tambah video' : kind === 'design' ? 'Tambah desain' : 'Tambah app';
  function closeMenu(target: HTMLElement) {
    const menu = target.closest('details');
    if (menu) { menu.open = false; menu.querySelector<HTMLElement>('summary')?.focus(); }
  }
  const item = items.find((value) => value.id === editing),
    visible = items.filter((value) => value.kind === kind && (!incompleteOnly || incompleteIds.has(value.id)) && value.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const pendingRemovals = incompleteOnly ? incompleteRecords.filter(record => record.pendingRemoval && record.item.kind === kind && record.item.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())) : [];
  const publicItem = published.find(value => value.id === editing && value.published);
  async function openVisual() {
    if (!item || uploadBusy.current) return;
    if (pendingMutation.current) await pendingMutation.current;
    if (JSON.stringify(itemsRef.current) !== JSON.stringify(savedRef.current) && !(await save('save'))) return;
    router.push(`/admintgadink/dashboard/editor/${item.id}`);
  }
  async function openPreview() {
    if (!item || uploadBusy.current) return;
    if (item.caseStudy) {
      try {await openStudyPreview(item.id, async () => {
        if (pendingMutation.current) await pendingMutation.current;
        if (JSON.stringify(itemsRef.current) !== JSON.stringify(savedRef.current) && !await save('save',true)) return null;
        return revisionRef.current;
      });} catch (error) {setError(draftSaveMessage(error));}
      return;
    }
    previewDialog.current?.showModal();
  }
  if (autosave.recovery && !autosave.canRestore) return <DraftRecovery backup={autosave.recovery} onUseServer={autosave.useServerVersion} onRestore={autosave.canRestore ? autosave.restoreRecovery : undefined} />;
  const selectedUnpublished = item ? !sameDraftContent(JSON.stringify(item), JSON.stringify(published.find(value => value.id === item.id) || null)) : unpublished;
  const selectedDirty = item ? !sameDraftContent(JSON.stringify(item), JSON.stringify(saved.find(value => value.id === item.id) || null)) : dirty;
  const editingLocked = busy && operation !== 'save';
  const publicationCopy = workPublicationCopy(item, published.find(value => value.id === item?.id));
  return (
    <div ref={workspace} className={`works-manager cms-manager wm-workspace ${item ? 'wm-editor-screen' : ''}`} onDragEnter={event => {
      if (!editing && !busy && event.dataTransfer.types.includes('Files')) setShowImport(true);
    }}>
      {confirmation}
      {publicationReview}
      {autosave.recovery && autosave.canRestore && <DraftRecovery backup={autosave.recovery} onUseServer={autosave.useServerVersion} onRestore={autosave.canRestore ? autosave.restoreRecovery : undefined} />}
      <div className="wm-heading">
        <div>
          {editing && (
            <button
              type="button"
              className="wm-button"
              onClick={async () => {if(dirty&&!await ask('Ada perubahan yang belum disimpan. Kembali tanpa menyimpan?', 'Kembali'))return;setItems(savedRef.current);setEditing(null);}}
            >
              <ArrowLeft size={18} />
              Semua portofolio
            </button>
          )}
          <h1>{item ? freshItems.current.has(item.id) ? {webapp:'Tambah studi kasus',design:'Tambah desain',video:'Tambah video'}[item.kind] : item.title : 'Portofolio'}</h1>
        </div>
        {item ? <button type="button" className="wm-button" disabled={busy} onClick={openPreview}><Eye size={18}/>Preview</button> : <a
          className="wm-public-link"
          href={publicItem?.caseStudy ? `/work/${publicItem.caseStudy.slug}` : `/${kind}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Lihat website
          <ExternalLink size={18} />
        </a>}
      </div>
      {revision !== null && !showTrash && <PublicationBar dirty={selectedDirty} unpublished={selectedUnpublished} busy={busy} operation={operation} scope={item ? '' : publicationCopy.scope} publishLabel={item && !item.published && publicItem ? 'Sembunyikan dari website' : item ? publicationCopy.publishLabel === 'Terbitkan' ? publicItem ? 'Terbitkan revisi' : 'Terbitkan' : publicationCopy.publishLabel : 'Terbitkan perubahan'}
        busyLabel={publicationCopy.busyLabel} showPublish={publicationCopy.showPublish} pendingSuffix={item ? publicItem ? ' · Versi lama masih tayang' : ' · Belum tayang' : ' · Ada perubahan belum tayang'}
        visibility={item ? { checked: item.published, onChange: checked => update(item.id, { published: checked }) } : undefined}
        status={!dirty && !selectedUnpublished && autosave.online ? publicationCopy.cleanLabel : autosave.status} offline={!autosave.online} failed={autosave.failed}
        onSave={() => {void save('save');}} onPublish={() => { void save('publish'); }}/>}
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
      {revision === null && !error && <AdminSkeleton variant="list" />}
      {revision !== null && !item && (
        <>
          <div className="wm-tabs" role="group" aria-label="Kategori portofolio">
            {workKinds.map((value) => (
              <button
                key={value}
                type="button"
                className="wm-button"
                aria-pressed={!showTrash && kind === value}
                aria-label={`${workLabels[value]} ${incompleteOnly ? incompleteRecords.filter(record => record.item.kind === value).length : items.filter(work => work.kind === value).length}`}
                disabled={busy}
                onClick={() => { setShowTrash(false); setKind(value); setQuery(''); setShowImport(false); setShowFeatured(false); setReorderMode(false); }}
              >
                <span className="wm-tab-label">{workLabels[value]}</span>
                <span className="wm-tab-short" aria-hidden="true">{{webapp:'Web / Apps',design:'Desain',video:'Video'}[value]}</span>
                <span>
                  {incompleteOnly ? incompleteRecords.filter(record => record.item.kind === value).length : items.filter(item => item.kind === value).length}
                </span>
              </button>
            ))}
          </div>
          {showTrash ? <section className="wm-trash-list" aria-label="Sampah portofolio">
            <div className="wm-heading"><h2>Sampah ({trash.length})</h2><button type="button" className="wm-button" onClick={() => setShowTrash(false)}>Kembali ke koleksi</button></div><p className="wm-editor-note">Pulihkan dalam 72 jam.</p>
            {trash.length ? trash.map(entry => {
              const work = entry.draft || entry.published!;
              return <div className="cms-work-row" key={entry.id}>
                <span className="wm-thumb">{work.image ? <img {...workThumbnail(work.image)} sizes="100px" width={100} height={75} alt="" loading="lazy"/> : <Trash2 size={22}/>}</span>
                <div className="wm-summary"><strong>{work.title}</strong><span>{trashTimeLeft(entry)}</span><span>Kembali sebagai {entry.published?.published ? 'tayang' : entry.published ? 'disembunyikan' : 'draft'}</span></div>
                <button type="button" className="wm-button" aria-busy={trashBusyId === entry.id} disabled={busy || trashExpired(entry)} onClick={() => changeTrash('restore', entry.id)}>{trashBusyId === entry.id ? <span className="admin-spinner" aria-hidden="true"/> : <Undo2 size={18}/>}Pulihkan</button>
              </div>;
            }) : <div className="wm-empty"><Trash2 size={28} aria-hidden="true"/><h2>Sampah kosong</h2><p>Portofolio yang dihapus akan muncul di sini.</p></div>}
          </section> : <>

          {incompleteOnly && <div className="wm-filter-status"><span>Belum lengkap · {visible.length + pendingRemovals.length} portofolio</span><button type="button" className="wm-button" onClick={() => {setIncompleteOnly(false);setReorderMode(false);}}>Lihat semua</button></div>}
          <div className="wm-toolbar">
            {reorderMode && <button type="button" className="wm-button" onClick={() => setReorderMode(false)}><Check size={18}/>Selesai</button>}
            <label className="wm-search"><span className="wm-sr-only">Cari portofolio</span><Search size={18} aria-hidden="true"/><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari judul…" /></label>
            <div className="wm-create-actions">
              <button type="button" className="wm-button wm-primary" disabled={busy} onClick={() => {setShowImport(false);add();}}><Plus size={18} aria-hidden="true"/>{addLabel}</button>
              <details className="wm-action-menu">
              <summary className="wm-button" aria-label="Opsi koleksi">Opsi koleksi</summary>
              <div className="wm-menu-panel">
                <button type="button" disabled={busy || !!query || reorderMode || incompleteOnly} onClick={event => { closeMenu(event.currentTarget); setReorderMode(true); }}><ListOrdered size={18}/>Atur urutan</button>
                {kind === 'webapp' && <button type="button" disabled={busy} onClick={event => { closeMenu(event.currentTarget); setShowFeatured(true); setShowImport(false); }}><Eye size={18}/>Pilihan homepage</button>}
                <button type="button" disabled={busy} onClick={event => { closeMenu(event.currentTarget); setShowTrash(true); setShowFeatured(false); setShowImport(false); setReorderMode(false); }}><Trash2 size={18}/>Sampah ({trash.length})</button>
                <button type="button" disabled={busy} onClick={event => { closeMenu(event.currentTarget); setShowFeatured(false); setShowImport(true); }}><Upload size={18}/>Upload beberapa file</button>
              </div>
            </details></div>
          </div>
          {showFeatured && kind === 'webapp' && <section className="wm-import-panel" aria-label="Pilihan homepage">
            <div className="cms-panel-heading"><h2>Pilihan homepage</h2><button type="button" className="wm-button" onClick={() => setShowFeatured(false)}>Tutup</button></div>
            <p className="wm-editor-note">Pilih hingga 3 proyek. Urutannya mengikuti koleksi.</p>
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

          </section>}
          {showImport && <section className="wm-import-panel" aria-label="Tambah dari media">
            <div className="cms-panel-heading"><h2>{kind === 'video' ? 'Tambahkan video' : 'Tambahkan gambar'}</h2><button type="button" className="wm-button" aria-label="Tutup upload" disabled={busy} onClick={() => setShowImport(false)}><X size={18}/></button></div>
            <p className="wm-editor-note">Satu file jadi satu item portofolio.</p>
            <FileDrop
            key={kind}
            multiple
            accept={kind==='video'?'video/mp4':'image/jpeg,image/png,image/webp,image/gif'}
            disabled={busy}
            onBusyChange={mediaBusy}
            onUploaded={importImages}
          /></section>}
          <SortableList items={visible} reorderable={reorderMode} disabled={busy || !!query || incompleteOnly} onChange={order}>
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
                      <img {...workThumbnail(work.image)} sizes="100px" width={100} height={75} loading="lazy" decoding="async" alt="" />
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
                  <span className="wm-edit" aria-hidden="true"><FileText size={18}/></span>
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
                    if (!await ask(`“${work.title}” akan hilang dari website dan dipindahkan ke Sampah. Anda bisa memulihkannya dalam 72 jam sebelum dihapus permanen.`, 'Ya, Pindahkan ke Sampah', true)) return;
                    await changeTrash('move', work.id);
                  }}
                >
                  <Trash2 size={18} />
                  Pindahkan ke Sampah
                </button>
                </div></details>
              </div>
            )}
          </SortableList>
          {!!pendingRemovals.length && <section className="wm-pending-removals" aria-labelledby="pending-removals-title"><h2 id="pending-removals-title">Menunggu penghapusan ({pendingRemovals.length})</h2><p>Sudah dihapus dari draft. Penghapusan berlaku setelah perubahan koleksi diterbitkan.</p><ul>{pendingRemovals.map(({item}) => <li key={item.id}>{item.title}</li>)}</ul></section>}
          {!visible.length && !pendingRemovals.length && <p className="wm-empty">{query?'Tidak ada judul yang cocok.':incompleteOnly?'Tidak ada portofolio yang belum lengkap di kategori ini.':'Belum ada portofolio.'}</p>}
          </>}
        </>
      )}
      {item && <WorkEditor key={item.id} item={item} items={items} disabled={editingLocked} errors={fieldErrors}
        onChange={patch => update(item.id,patch)} onBusyChange={mediaBusy} onOpenVisual={openVisual}
        onKindChange={async value => {
          if (value === item.kind) return;
          if (!await ask('Ganti jenis portofolio? Cerita studi kasus tetap tersimpan jika jenisnya berubah.', 'Ganti jenis')) return;
          update(item.id,setWorkKind(item,value)); setKind(value);
        }}/>}
      {item && <dialog ref={previewDialog} className="wm-editor-preview-dialog" aria-labelledby="work-preview-title" onClick={event => {if(event.target===previewDialog.current)previewDialog.current.close();}}>
        <div className="cms-panel-heading"><h2 id="work-preview-title">{item.caseStudy ? 'Preview studi kasus' : 'Preview kartu'}</h2><button type="button" className="wm-button" aria-label="Tutup preview" onClick={() => previewDialog.current?.close()}><X size={18}/></button></div>
        {item.image && <img {...workThumbnail(item.image)} sizes="500px" alt={item.imageAlt || item.title}/>}
        <h3>{item.title}</h3>{item.description && <p>{item.description}</p>}
      </dialog>}
    </div>
  );
}
