import './admin-controls.css';

export function AdminSkeleton({ variant = 'form' }: { variant?: 'form' | 'list' }) {
  return <div className={`admin-skeleton admin-skeleton--${variant}`} role="status" aria-label="Memuat halaman">
    <span className="admin-sr-only">Memuat halaman…</span>
    <div className="admin-skeleton-heading" aria-hidden="true" />
    <div className="admin-skeleton-tools" aria-hidden="true" />
    <div className="admin-skeleton-content" aria-hidden="true">
      {[0, 1, 2, 3].map(index => <div className="admin-skeleton-row" key={index}>
        {variant === 'list' && <div className="admin-skeleton-image" />}
        <div className="admin-skeleton-lines"><i /><i /></div>
      </div>)}
    </div>
  </div>;
}
