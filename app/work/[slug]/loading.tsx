import { StudyCaseHeader } from '@/components/public/study-case/StudyCaseHeader';

export default function StudyCaseLoading() {
  return <div className="showcase case-loading">
    <StudyCaseHeader />
    <main className="case-page section-shell" aria-busy="true" aria-label="Loading case study">
      <p role="status" className="case-loading-status">Loading case study…</p>
      <div aria-hidden="true">
        <div className="case-skeleton case-skeleton-title" />
        <div className="case-skeleton case-skeleton-description" />
        <div className="case-skeleton case-skeleton-cover" />
        <div className="case-skeleton-columns">{[0,1,2].map(index=><div key={index} className="case-skeleton case-skeleton-copy" />)}</div>
      </div>
    </main>
  </div>;
}
