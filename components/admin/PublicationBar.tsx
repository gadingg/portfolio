'use client';
import { publicationState } from '@/lib/publication-state';
import { AdminActionLabel } from './AdminActionLabel';
import {CircleDot,CheckCircle2,Upload} from 'lucide-react';

export function PublicationBar({dirty, unpublished, busy, operation, scope, publishLabel = 'Terbitkan', busyLabel = 'Menerbitkan…', showPublish = true, pendingSuffix = ' · Ada perubahan belum tayang', status, offline = false, failed = false, visibility, onSave, onPublish}: {
  dirty: boolean; unpublished: boolean; busy: boolean; operation: 'save' | 'publish' | null;
  visibility?: { checked: boolean; onChange: (checked: boolean) => void };
  scope: string; publishLabel?: string; onSave: () => void; onPublish: () => void;
  status?: string; offline?: boolean; failed?: boolean; busyLabel?: string; showPublish?: boolean; pendingSuffix?: string;
}) {
  const state = publicationState(dirty, unpublished, busy);
  return <div className="cms-sticky-toolbar wm-savebar" aria-label="Perubahan tersimpan dan publikasi">
    <span role="status" className="wm-save-status">{busy ? 'Menyimpan…' : offline ? 'Tidak ada koneksi · perubahan belum dikirim' : failed ? 'Belum tersimpan · coba lagi' : dirty ? 'Ada perubahan' : unpublished ? 'Draft' : visibility&&!visibility.checked ? 'Tidak tampil di website' : 'Published'}</span>
    {visibility && <label className="wm-check"><input type="checkbox" checked={visibility.checked} disabled={busy && operation !== 'save'} onChange={event => visibility.onChange(event.target.checked)} />Tampilkan di website</label>}
    <button type="button" className="wm-button wm-primary" disabled={busy || offline || (!dirty && !unpublished && !failed)} onClick={onPublish} aria-busy={busy}><AdminActionLabel pending={busy} idle={failed?'Coba simpan lagi':visibility&&!visibility.checked?publishLabel.includes('Sembunyikan')?'Simpan & Sembunyikan':'Simpan Perubahan':'Simpan & Terbitkan'} busy="Menyimpan…" icon={<Upload size={17}/>}/></button>
    {scope&&<small className="wm-save-scope">{scope}</small>}

  </div>;
}
