'use client';
import { useId, useRef, useState } from 'react';
import { Upload, Images, Video, X } from 'lucide-react';
import { AdminSkeleton } from './AdminSkeleton';
import {useAdminToast} from './AdminToasts';
import {workThumbnail} from '@/lib/work-images';
import { captureVideoCover, uploadCover, uploadPortfolioVideo } from '@/lib/video-upload';
export type UploadedMedia = { url: string; filename: string; type: string; cover?:string };
function UploadFeedback({label,percent}:{label:string;percent:number|null}) {
  return <div className="cms-upload-feedback" role="status" aria-live="polite">
    <span>{label}</span>
    {percent === null ? <div className="cms-upload-skeleton" aria-hidden="true"><span/></div> :
      <progress max="100" value={percent} aria-label="Progress upload video"/>}
  </div>;
}
export function FileDrop({
  folder = 'works',
  multiple = false,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  onUploaded,
  disabled = false,
  onBusyChange,
  uploadLabel,
  previewSrc,
  previewAlt = 'Preview gambar',
  picker = false,
  thumbnail = false,
  fileLink,
  onFileLink,
}: {
  folder?: string;
  multiple?: boolean;
  accept?: string;
  onUploaded: (files: UploadedMedia[]) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  uploadLabel?: string;
  previewSrc?: string;
  previewAlt?: string;
  picker?: boolean;
  thumbnail?: boolean;
  fileLink?: string;
  onFileLink?: (url: string) => void;
}) {
  const titleId = useId();
  const notify=useAdminToast();
  const [uploadPercent,setUploadPercent]=useState<number|null>(null),[pickerOpen,setPickerOpen]=useState(false);
  const [link, setLink] = useState(''), [linkError, setLinkError] = useState('');
  const uploadLock = useRef(false);
  const input = useRef<HTMLInputElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [progress, setProgress] = useState(''),
    [failed, setFailed] = useState<File[]>([]),
    [over, setOver] = useState(false);
  const [media, setMedia] = useState<
      { id: string; url: string; name: string; type: string }[]
    >([]),
    [selected, setSelected] = useState<string[]>([]),
    [offset, setOffset] = useState(0),
    [hasMore, setHasMore] = useState(false),
    [libraryError, setLibraryError] = useState(''),
    [listing, setListing] = useState(false);
  async function upload(files: File[]) {
    if (busy || disabled || uploadLock.current || !files.length) return;
    uploadLock.current = true;
    setBusy(true);
    onBusyChange?.(true);
    setError('');
    const successes: UploadedMedia[] = [],
      failures: File[] = [];
    const messages:string[]=[];
    const batch = multiple ? files : files.slice(0, 1);
    for (let i = 0; i < batch.length; i++) {
      const file = batch[i];
      setProgress(`Mengunggah ${i + 1}/${batch.length}`);
      setUploadPercent(null);
      try {
        if (!accept.split(',').includes(file.type))
          throw Error('Format tidak didukung');
        const isVideo=['video/mp4','video/webm'].includes(file.type);
        if (file.size > (isVideo?40:4) * 1024 * 1024) throw Error(`Maksimal ${isVideo?40:4} MB per file`);
        if (isVideo) {
          const uploaded=await uploadPortfolioVideo(file,percent=>{setUploadPercent(percent);setProgress(`Mengunggah ${i+1}/${batch.length} · ${percent}%`);});
          setUploadPercent(null);setProgress('Menyiapkan thumbnail…');
          try { uploaded.cover=await uploadCover(await captureVideoCover(file)); }
          catch {const message=`${file.name}: video tersimpan, pilih cover sendiri.`;messages.push(message);setError(previous=>`${previous}${previous?' · ':''}${message}`);}
          successes.push(uploaded);
          continue;
        }
        const form = new FormData();
        form.append('file', file);
        form.append('folder', folder);
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: form,
          signal: AbortSignal.timeout(60000),
        });
        const data = await res.json();
        if (!res.ok) throw Error(data.error || 'Upload gagal. Coba lagi.');
        successes.push(data);
      } catch (e) {
        failures.push(file);
        messages.push(`${file.name}: ${e instanceof Error ? e.message : 'Upload gagal'}`);
        setError(
          (previous) =>
            `${previous}${previous ? ' · ' : ''}${file.name}: ${e instanceof Error ? e.message : 'Upload gagal'}`,
        );
      }
    }
    try { if (successes.length) onUploaded(successes); }
    catch {messages.push('File terunggah, tetapi belum masuk ke form. Pilih dari koleksi media.');}
    if (successes.length && !messages.length && picker) dialog.current?.close();
    setFailed(failures);
    setBusy(false);
    uploadLock.current = false;
    onBusyChange?.(false);
    setProgress('');
    setUploadPercent(null);
    if(successes.length)notify(`${successes.length} file berhasil diunggah.`);
    if(messages.length)notify(messages.join(' · '),{tone:failures.length?'error':'info',duration:8000});
    if (input.current) input.current.value = '';
  }
  async function loadLibrary(nextOffset = 0) {
    setListing(true);
    setLibraryError('');
    try {
      const res = await fetch(
        `/api/admin/media?folder=${folder === 'cv' ? 'cv' : 'all'}&offset=${nextOffset}`,
        { cache: 'no-store' },
      );
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      const available = data.uploads.filter((item: { type: string }) =>
        accept.split(',').includes(item.type),
      );
      setMedia((old) => (nextOffset ? [...old, ...available] : available));
      setOffset(data.nextOffset);
      setHasMore(data.hasMore);
    } catch (e) {
      setLibraryError(
        e instanceof Error ? e.message : 'Media belum bisa dimuat.',
      );
    } finally {
      setListing(false);
    }
  }
  function openPicker() {
    setSelected([]); setLink(fileLink || ''); setLinkError('');
    dialog.current?.showModal();setPickerOpen(true); void loadLibrary();
  }
  return (
    <div className="cms-upload">
      <div
        className={`cms-drop ${picker ? 'cms-drop--picker' : ''} ${thumbnail ? 'cms-drop--thumbnail' : ''} ${over ? 'is-over' : ''}`}
        role="group"
        aria-label={uploadLabel || 'Upload atau pilih media'}
        aria-busy={busy}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !busy) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOver(false);
          upload(Array.from(e.dataTransfer.files));
        }}
      >
        {previewSrc && <img className="cms-drop-preview" {...workThumbnail(previewSrc)} sizes={thumbnail ? '80px' : '(max-width: 760px) 85vw, 720px'} alt={previewAlt} draggable={false} loading="lazy" decoding="async"/>}
        {picker ? <div className="cms-picker-action">
          <button type="button" className="wm-button" disabled={busy || disabled} onClick={openPicker}>
            {busy ? <span className="admin-spinner" aria-hidden="true"/> : <Images size={18} aria-hidden="true"/>}
            {uploadLabel || 'Tambah media'}
          </button>
          <small>Tarik file ke sini · maks. {accept.startsWith('video/')?40:4} MB</small>
        </div> : <>
        <button
          type="button"
          className="wm-button"
          disabled={busy || disabled}
          onClick={() => input.current?.click()}
        >
          {busy ? <span className="admin-spinner" aria-hidden="true"/> : <Upload size={18} aria-hidden="true" />}
          {uploadLabel || (accept.startsWith('video/') ? 'Upload video' : accept.startsWith('image/') ? previewSrc ? 'Ganti gambar' : 'Upload gambar' : 'Upload file')}
        </button>
        <span className="cms-drop-hint">Tarik file ke sini · maks. {accept.startsWith('video/')?40:4} MB</span>
        <button
          type="button"
          className="wm-button admin-icon-action"
          aria-label="Pilih dari koleksi"
          title="Pilih dari koleksi"
          disabled={busy || disabled}
          onClick={openPicker}
        >
          <Images size={18} aria-hidden="true" />
        </button>
        </>}
        <input
          ref={input}
          type="file"
          accept={accept}
          multiple={multiple}
          aria-label="Pilih file untuk upload"
          hidden
          onChange={(e) => upload(Array.from(e.target.files || []))}
        />
      </div>
      {busy && !pickerOpen && <UploadFeedback label={progress} percent={uploadPercent}/>}
      {error && !picker && (
        <div role="alert" className="cms-error">
          {error}
          {failed.length > 0 && (
            <button
              type="button"
              className="wm-button"
              disabled={busy}
              onClick={() => upload(failed)}
            >
              Coba lagi
            </button>
          )}
        </div>
      )}
      <dialog
        ref={dialog}
        className="cms-media-dialog"
        aria-labelledby={titleId}
        onClose={()=>setPickerOpen(false)}
        onDragOver={event => {if (!busy && !disabled) event.preventDefault();}}
        onDrop={event => {event.preventDefault(); event.stopPropagation(); if (!busy && !disabled) void upload(Array.from(event.dataTransfer.files));}}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="cms-panel-heading">
          <h2 id={titleId}>Media</h2>
          <button
            className="wm-button"
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Tutup media"
          >
            <X size={20} />
          </button>
        </div>
        {picker && <div className="cms-picker-toolbar">
          <button type="button" className="wm-button" disabled={busy || disabled} onClick={() => input.current?.click()}>
            {busy ? <span className="admin-spinner" aria-hidden="true"/> : <Upload size={18} aria-hidden="true"/>}Upload baru
          </button>
          <span>Atau pilih file tersimpan di bawah.</span>
        </div>}
        {busy && pickerOpen && <UploadFeedback label={progress} percent={uploadPercent}/>}
        {picker && error && <div className="cms-error" role="alert">{error}
          {!!failed.length && <button type="button" className="wm-button" disabled={busy || disabled} onClick={() => upload(failed)}>Coba lagi</button>}
        </div>}
        {libraryError && (
          <p role="alert">
            {libraryError}
            <button
              type="button"
              className="wm-button"
              onClick={() => loadLibrary()}
            >
              Coba lagi
            </button>
          </p>
        )}
        <div className="cms-media-grid">
          {media.map((item) => (
            <button
              key={item.id}
              type="button"
              className="cms-media-choice"
              aria-pressed={selected.includes(item.id)}
              onClick={() =>
                setSelected((ids) =>
                  ids.includes(item.id)
                    ? ids.filter((id) => id !== item.id)
                    : multiple
                      ? [...ids, item.id]
                      : [item.id],
                )
              }
            >
              {item.type.startsWith('image/') ? (
                <img {...workThumbnail(item.url)} sizes="160px" alt={item.name} loading="lazy" decoding="async" />
              ) : item.type.startsWith('video/') ? (
                <span className="cms-media-type"><Video size={26} aria-hidden="true"/>Video</span>
              ) : (
                <span>PDF</span>
              )}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        {listing && !media.length ? (
          <AdminSkeleton variant="list" />
        ) : listing ? (
          <span className="admin-spinner" role="status" aria-label="Memuat media berikutnya"/>
        ) : !media.length && !libraryError ? (
          <p>Belum ada file.</p>
        ) : null}
        {onFileLink && <details className="cms-picker-link">
          <summary>Link file MP4 / WebM</summary>
          <label>Link file<input type="text" inputMode="url" value={link} onChange={event => {setLink(event.target.value); setLinkError('');}} aria-invalid={!!linkError}/></label>
          {linkError && <p role="alert">{linkError}</p>}
          <button type="button" className="wm-button" disabled={busy || disabled} onClick={() => {
            try {
              const url = new URL(link, window.location.origin);
              if (!(link.startsWith('/') && !link.startsWith('//') || url.protocol === 'https:') || url.username || url.password || !/\.(mp4|webm)$/i.test(url.pathname))
                throw Error('Gunakan link file MP4 atau WebM.');
              onFileLink(link.trim()); dialog.current?.close();
            } catch {setLinkError('Gunakan link file MP4 atau WebM yang valid.');}
          }}>Gunakan link</button>
        </details>}
        <div className="wm-toolbar">
          {hasMore && (
            <button
              type="button"
              className="wm-button"
              disabled={listing}
              onClick={() => loadLibrary(offset)}
            >
              Muat berikutnya
            </button>
          )}
          <button
            type="button"
            className="wm-button wm-primary"
            disabled={busy || disabled || !selected.length}
            onClick={() => {
              onUploaded(
                selected.map((id) => {
                  const item = media.find((value) => value.id === id)!;
                  return {
                    url: item.url,
                    filename: item.name,
                    type: item.type,
                  };
                }),
              );
              dialog.current?.close();
            }}
          >
            {selected.length ? `Gunakan ${selected.length} file` : 'Gunakan file'}
          </button>
        </div>
      </dialog>
    </div>
  );
}
