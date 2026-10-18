import type { ReactNode } from 'react';

export function AdminActionLabel({ pending, idle, busy, icon }: {
  pending: boolean; idle: string; busy: string; icon?: ReactNode;
}) {
  return <>
    <span className="admin-action-icon" aria-hidden="true">{pending ? <span className="admin-spinner" /> : icon}</span>
    <span className="admin-action-label"><span aria-hidden={pending} style={{ visibility: pending ? 'hidden' : 'visible' }}>{idle}</span><span aria-hidden={!pending} style={{ visibility: pending ? 'visible' : 'hidden' }}>{busy}</span></span>
  </>;
}
