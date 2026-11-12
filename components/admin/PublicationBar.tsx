'use client';
import { AdminActionLabel } from './AdminActionLabel';
import { Upload } from 'lucide-react';

export function PublicationBar({dirty, unpublished, busy, publishing, offline, failed, visibility, publishLabel, onPublish}: {
  dirty: boolean;
  unpublished: boolean;
  busy: boolean;
  publishing: boolean;
  offline: boolean;
  failed: boolean;
  visibility?: { checked: boolean; onChange: (checked: boolean) => void };
  publishLabel: string;
  onPublish: () => void;
}) {
  const status = offline ? 'Tidak ada koneksi' : failed ? 'Gagal menyimpan' : !dirty && unpublished ? 'Draft belum terbit' : '';
  const pending = dirty || unpublished || failed || publishing;
  if (!visibility && !status && !pending) return null;
  return <div className="cms-sticky-toolbar wm-savebar cms-publish-bar" aria-label="Publikasi">
    {visibility && <label className="wm-check"><input type="checkbox" checked={visibility.checked} disabled={busy} onChange={event => visibility.onChange(event.target.checked)} />Tampilkan di website</label>}
    <div className="cms-publish-bar-actions">
      {status && <span role="status" className="wm-save-status">{status}</span>}
      {pending && <button type="button" className="wm-button wm-primary" disabled={busy || offline} onClick={onPublish} aria-busy={publishing}>
        <AdminActionLabel pending={publishing} idle={failed ? 'Coba lagi' : publishLabel} busy="Menyimpan…" icon={<Upload size={18} aria-hidden="true"/>}/>
      </button>}
    </div>
  </div>;
}
