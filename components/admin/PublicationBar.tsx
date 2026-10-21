'use client';
import { Save } from 'lucide-react';
import { publicationState } from '@/lib/publication-state';
import { AdminActionLabel } from './AdminActionLabel';

export function PublicationBar({dirty, unpublished, busy, operation, scope, onCancel, onSave, onPublish}: {
  dirty: boolean; unpublished: boolean; busy: boolean; operation: 'save' | 'publish' | null;
  scope: string; onCancel: () => void; onSave: () => void; onPublish: () => void;
}) {
  const state = publicationState(dirty, unpublished, busy);
  if (!state.visible) return null;
  return <div className="cms-sticky-toolbar wm-savebar" aria-label="Perubahan tersimpan dan publikasi">
    <span role="status">{state.label}</span>
    {dirty && <button type="button" className="wm-button" disabled={busy} onClick={onCancel}>Batalkan perubahan</button>}
    {dirty && <button type="button" className="wm-button" disabled={!state.canSave} onClick={onSave} aria-busy={operation === 'save'}><AdminActionLabel pending={operation === 'save'} idle="Simpan draft" busy="Menyimpan…" icon={<Save size={18}/>}/></button>}
    <button type="button" className="wm-button wm-primary" disabled={!state.canPublish} onClick={onPublish} aria-busy={operation === 'publish'}><AdminActionLabel pending={operation === 'publish'} idle="Publikasikan perubahan" busy="Memublikasikan…"/></button>
    <small className="wm-save-scope">{scope}{dirty ? ' Simpan draft sebelum publikasi.' : ''}</small>
  </div>;
}
