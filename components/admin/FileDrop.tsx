'use client';
import { useId, useRef, useState } from 'react';
import { Upload, Images, X } from 'lucide-react';
export type UploadedMedia = { url: string; filename: string; type: string };
export function FileDrop({
  folder = 'works',
  multiple = false,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  onUploaded,
  disabled = false,
  onBusyChange,
}: {
  folder?: string;
  multiple?: boolean;
  accept?: string;
  onUploaded: (files: UploadedMedia[]) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const titleId = useId();
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
    if (busy || disabled || !files.length) return;
    setBusy(true);
    onBusyChange?.(true);
    setError('');
    const successes: UploadedMedia[] = [],
      failures: File[] = [];
    const batch = multiple ? files : files.slice(0, 1);
    for (let i = 0; i < batch.length; i++) {
      const file = batch[i];
      setProgress(`Mengunggah ${i + 1}/${batch.length}`);
      try {
        if (!accept.split(',').includes(file.type))
          throw Error('Format tidak didukung');
        if (file.size > 4 * 1024 * 1024) throw Error('Maksimal 4 MB per file');
        const form = new FormData();
        form.append('file', file);
        form.append('folder', folder);
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw Error(data.error);
        successes.push(data);
      } catch (e) {
        failures.push(file);
        setError(
          (previous) =>
            `${previous}${previous ? ' · ' : ''}${file.name}: ${e instanceof Error ? e.message : 'Upload gagal'}`,
        );
      }
    }
    if (successes.length) onUploaded(successes);
    setFailed(failures);
    setBusy(false);
    onBusyChange?.(false);
    setProgress(successes.length ? `${successes.length} file terunggah` : '');
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
  return (
    <div className="cms-upload">
      <div
        className={`cms-drop ${over ? 'is-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !busy) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          upload(Array.from(e.dataTransfer.files));
        }}
      >
        <button
          type="button"
          className="wm-button"
          disabled={busy || disabled}
          onClick={() => input.current?.click()}
        >
          <Upload size={18} aria-hidden="true" />
          {busy ? progress : multiple ? 'Upload gambar' : 'Upload file'}
        </button>
        <span>atau lepas file di sini · maks. 4 MB</span>
        <button
          type="button"
          className="wm-button"
          disabled={busy || disabled}
          onClick={() => {
            setSelected([]);
            dialog.current?.showModal();
            loadLibrary();
          }}
        >
          <Images size={18} aria-hidden="true" />
          Pilih media
        </button>
        <input
          ref={input}
          type="file"
          accept={accept}
          multiple={multiple}
          aria-label="Pilih file untuk diunggah"
          hidden
          onChange={(e) => upload(Array.from(e.target.files || []))}
        />
      </div>
      {progress && !busy && <p role="status">{progress}</p>}
      {error && (
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
                <img src={item.url} alt={item.name} loading="lazy" />
              ) : item.type.startsWith('video/') ? (
                <video src={item.url} muted preload="metadata" />
              ) : (
                <span>PDF</span>
              )}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        {listing ? (
          <p role="status">Memuat media…</p>
        ) : !media.length && !libraryError ? (
          <p>Belum ada media.</p>
        ) : null}
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
            disabled={!selected.length}
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
            Gunakan {selected.length || ''}
          </button>
        </div>
      </dialog>
    </div>
  );
}
