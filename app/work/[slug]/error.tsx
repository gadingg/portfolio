'use client';

import Link from 'next/link';
import { StudyCaseHeader } from '@/components/public/study-case/StudyCaseHeader';

export default function StudyCaseError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="showcase">
    <StudyCaseHeader />
    <main className="section-shell case-page case-load-error">
      <h1 role="alert">Couldn't load this case study.</h1>
      <div className="actions"><button type="button" className="button button-primary" onClick={reset}>Try again</button><Link href="/#work" className="text-link">Back to portfolio</Link></div>
    </main>
  </div>;
}
