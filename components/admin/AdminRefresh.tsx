'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function AdminRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button className="wm-button" type="button" disabled={pending} aria-busy={pending}
    onClick={() => startTransition(() => router.refresh())}>
    {pending && <span className="admin-spinner" aria-hidden="true" />}
    {pending ? 'Memuat ulang…' : 'Coba lagi'}
  </button>;
}
