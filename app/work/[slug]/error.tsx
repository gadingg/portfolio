'use client';

import Link from 'next/link';
import { StudyCaseHeader } from '@/components/public/study-case/StudyCaseHeader';

export default function StudyCaseError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="showcase">
    <StudyCaseHeader />
    <main className="section-shell case-page case-load-error">
      <h1>Studi kasus belum bisa dimuat.</h1>
      <p role="alert">Koneksi sedang bermasalah. Silakan coba lagi.</p>
      <div className="actions"><button type="button" className="button button-primary" onClick={reset}>Coba lagi</button><Link href="/#work" className="text-link">Kembali ke karya</Link></div>
    </main>
  </div>;
}
