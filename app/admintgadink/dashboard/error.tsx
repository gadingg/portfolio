'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import '@/components/admin/works-manager.css';
export default function ErrorView({ reset }: { reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <div className="works-manager"><h1>Halaman belum kebuka</h1><p>Cek koneksi dulu, lalu coba lagi, ya.</p><button type="button" className="wm-button" disabled={pending} aria-busy={pending}
    onClick={() => startTransition(() => { router.refresh(); reset(); })}>{pending && <span className="admin-spinner" aria-hidden="true" />}{pending ? 'Memuat ulang…' : 'Coba lagi'}</button></div>;
}
