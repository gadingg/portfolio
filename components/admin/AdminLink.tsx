'use client';

import Link, { useLinkStatus } from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import './admin-controls.css';

function Feedback({ children, external }: { children: ReactNode; external: boolean }) {
  const { pending } = useLinkStatus();
  return <>
    <span className="admin-link-label">{children}</span>
    <span className="admin-link-feedback" aria-hidden="true">
      {pending ? <span className="admin-spinner" /> : external ? <svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M10 4H4v16h16v-6" /></svg> : null}
    </span>
    <span className="admin-sr-only" role="status">{pending ? 'Memuat halaman…' : ''}</span>
  </>;
}

export function AdminLink({ children, className = '', ...props }: ComponentProps<typeof Link>) {
  return <Link {...props} className={`admin-link ${className}`}>
    <Feedback external={props.target === '_blank'}>{children}</Feedback>
  </Link>;
}
