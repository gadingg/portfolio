'use client';
import { publicationState } from '@/lib/publication-state';
import { AdminActionLabel } from './AdminActionLabel';
import {CircleDot,CheckCircle2,Upload} from 'lucide-react';

export function PublicationBar({dirty, unpublished, busy, operation, scope, publishLabel = 'Publish', busyLabel = 'Publishing…', showPublish = true, pendingSuffix = ' · Ada perubahan belum tayang', status, offline = false, failed = false, onSave, onPublish}: {
  dirty: boolean; unpublished: boolean; busy: boolean; operation: 'save' | 'publish' | null;
  scope: string; publishLabel?: string; onSave: () => void; onPublish: () => void;
  status?: string; offline?: boolean; failed?: boolean; busyLabel?: string; showPublish?: boolean; pendingSuffix?: string;
}) {
  const state = publicationState(dirty, unpublished, busy);
  return <div className="cms-sticky-toolbar wm-savebar" aria-label="Perubahan tersimpan dan publikasi">
    <span role="status" className="wm-save-status">{dirty?<CircleDot size={17} aria-hidden="true"/>:<CheckCircle2 size={17} aria-hidden="true"/>}{operation === 'publish' ? busyLabel : status || state.label}{!dirty && unpublished && !busy && !offline ? pendingSuffix : ''}</span>
    {failed && <button type="button" className="wm-button" disabled={busy || offline} onClick={onSave}>Coba lagi</button>}
    {showPublish && (dirty || unpublished || operation === 'publish') && <button type="button" className="wm-button wm-primary" disabled={!state.canPublish || offline} onClick={onPublish} aria-busy={operation === 'publish'}><AdminActionLabel pending={operation === 'publish'} idle={publishLabel} busy={busyLabel} icon={<Upload size={17}/>}/></button>}
    {scope && showPublish && unpublished && <small className="wm-save-scope">{scope}</small>}
  </div>;
}
