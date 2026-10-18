import './overview.css';

export function OverviewSkeleton() {
  return <div className="overview-skeleton" role="status" aria-label="Memuat konten dan statistik">
    <span className="admin-sr-only">Memuat konten dan statistik…</span>
    <div className="overview-stats" aria-hidden="true">{[0, 1, 2].map(item => <div className="overview-stat" key={item}><span className="overview-skeleton-bar" /><span className="overview-skeleton-bar" /></div>)}</div>
    <div className="overview-content-grid" aria-hidden="true">{[0, 1].map(item => <div className="overview-panel" key={item}><span className="overview-skeleton-bar" /><span className="overview-skeleton-bar" /><span className="overview-skeleton-bar" /></div>)}</div>
    <div className="overview-panel" aria-hidden="true"><span className="overview-skeleton-bar" /><span className="overview-skeleton-bar" /></div>
  </div>;
}
