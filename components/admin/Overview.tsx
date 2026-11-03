import { Suspense } from 'react';
import { List, Layers3, Eye, FilePenLine, EyeOff, PanelsTopLeft, Palette, Clapperboard, ChartNoAxesCombined, MousePointer2, Image, MessageCircle, ExternalLink, CircleAlert } from 'lucide-react';
import { OverviewThumbnail } from './OverviewThumbnail';
import { ArrowRight, Pencil } from 'lucide-react';
import { SettingsDisclosure } from './SettingsDisclosure';
import { workLabels, type WorkItem } from '@/lib/works';
import { summarizeWorks } from '@/lib/admin-overview';
import { engagementKinds, engagementLabels, type EngagementSummary } from '@/lib/engagement';
import { AdminLink } from './AdminLink';
import { AdminRefresh } from './AdminRefresh';
import './overview.css';

const number = (value: number) => new Intl.NumberFormat('id-ID').format(value);
const categoryIcons = { webapp: PanelsTopLeft, design: Palette, video: Clapperboard };
const engagementIcons = { work_open: MousePointer2, design_open: Image, video_open: Clapperboard, contact_click: MessageCircle, app_click: ExternalLink };
const date = (value: string) => new Intl.DateTimeFormat('id-ID', {
  day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta',
}).format(new Date(value.length === 10 ? `${value}T12:00:00+07:00` : value));

export function Overview({ draft, published, engagement, days }: {
  draft: WorkItem[]; published: WorkItem[]; engagement: Promise<{ data: EngagementSummary | null }>; days: number;
}) {
  const summary = summarizeWorks(draft, published);
  const names = new Map([...draft, ...published].map(item => [item.id, item.title]));
  return <div className="works-manager cms-manager overview">
    <header className="wm-heading overview-heading">
      <div><h1>Overview</h1></div>
      <div className="overview-actions">
        <AdminLink className="wm-button" href="/admintgadink/dashboard/editor/home">Edit homepage</AdminLink>
        <AdminLink className="wm-button wm-primary" href="/admintgadink/dashboard/works">Kelola portofolio</AdminLink>
      </div>
    </header>

    <section className="overview-stats" aria-label="Ringkasan portofolio">
      <div className="overview-stat overview-stat-total"><div className="overview-stat-heading"><h2>Total portofolio</h2><Layers3 aria-hidden="true" /></div><strong>{number(summary.total)}</strong></div>
      <div className="overview-stat"><div className="overview-stat-heading"><h2>Tayang di website</h2><Eye aria-hidden="true" /></div><strong>{number(summary.live)}</strong></div>
      <div className="overview-stat"><div className="overview-stat-heading"><h2>Draft baru</h2><FilePenLine aria-hidden="true" /></div><strong>{number(summary.drafts)}</strong></div>
      <div className="overview-stat"><div className="overview-stat-heading"><h2>Disembunyikan</h2><EyeOff aria-hidden="true" /></div><strong>{number(summary.hidden)}</strong></div>
    </section>

    {summary.incomplete>0 && <div className="overview-publication-note"><CircleAlert size={20} aria-hidden="true" /><span>{number(summary.incomplete)} portofolio belum lengkap dan belum tampil di website.</span><AdminLink href="/admintgadink/dashboard/works">Lengkapi portofolio</AdminLink></div>}
    {summary.changed && <div className="overview-publication-note"><span>Ada perubahan yang belum tayang.</span><AdminLink href="/admintgadink/dashboard/works">Lihat draft</AdminLink></div>}

    <div className="overview-content-grid">
      <section className="overview-panel" aria-labelledby="category-title">
        <div className="overview-section-heading"><h2 id="category-title">Kategori portofolio</h2></div>
        <ul className="overview-categories">
          {summary.categories.map(item => { const Icon = categoryIcons[item.kind]; return <li key={item.kind}>
            <div className="overview-category-main"><Icon size={22} aria-hidden="true" /><div><h3>{workLabels[item.kind]}</h3><p>{number(item.total)} portofolio</p></div>
              <AdminLink className="wm-button admin-icon-action" title={`Buka ${workLabels[item.kind]}`} href={`/admintgadink/dashboard/works?kind=${item.kind}`} aria-label={`Lihat portofolio ${workLabels[item.kind]}`}><ArrowRight size={18} aria-hidden="true"/></AdminLink></div>
            <div className="overview-category-track" aria-hidden="true"><span style={{ width: `${summary.total ? item.total / summary.total * 100 : 0}%` }} /></div>
          </li>; })}
        </ul>
      </section>
      <section className="overview-panel" aria-labelledby="recent-title">
        <div className="overview-section-heading"><h2 id="recent-title">Portofolio terbaru</h2><AdminLink href="/admintgadink/dashboard/works">Lihat semua</AdminLink></div>
        {summary.recent.length ? <ul className="overview-recent">
          {summary.recent.map(item => <li key={item.id}>
            <OverviewThumbnail src={item.image} kind={item.kind} />
            <div className="overview-work-info"><h3>{item.title}</h3><p>{workLabels[item.kind]}{item.updatedAt && <><span aria-hidden="true"> · </span><time dateTime={item.updatedAt}>{date(item.updatedAt)}</time></>}</p><span className={`overview-status ${item.isLive ? 'is-live' : ''}`}>{item.status}</span></div>
            <AdminLink className="wm-button admin-icon-action" title={`Edit ${item.title}`} aria-label={`Edit ${item.title}`} href={`/admintgadink/dashboard/works?kind=${item.kind}&work=${encodeURIComponent(item.id)}`}><Pencil size={18} aria-hidden="true"/></AdminLink>
          </li>)}
        </ul> : <div className="overview-empty"><h3>Belum ada portofolio</h3></div>}
      </section>
    </div>

    <section className="overview-panel overview-engagement" aria-labelledby="engagement-title">
      <div className="overview-section-heading"><div className="overview-section-identity"><ChartNoAxesCombined size={22} aria-hidden="true" /><div><h2 id="engagement-title">Klik di website</h2></div></div>
        <nav className="overview-periods" aria-label="Periode statistik">
          {[7, 30, 90].map(value => <AdminLink className="wm-button" aria-current={days === value ? 'page' : undefined} key={value} href={`?days=${value}`} scroll={false}>{value} hari</AdminLink>)}
        </nav>
      </div>
      <Suspense key={days} fallback={<p className="overview-note" role="status">Memuat statistik…</p>}><EngagementDetails engagement={engagement} days={days} names={names} /></Suspense>
    </section>
  </div>;
}

async function EngagementDetails({ engagement, days, names }: {
  engagement: Promise<{ data: EngagementSummary | null }>; days: number; names: Map<string, string>;
}) {
  const { data } = await engagement;
  const interval = days === 7 ? 1 : days === 30 ? 7 : 14;
  const daily = data?.daily ?? [];
  const buckets = daily.filter((_, index) => index % interval === 0).map((item, index) => {
    const group = daily.slice(index * interval, (index + 1) * interval);
    return { start: item.date, end: group.at(-1)!.date, clicks: group.reduce((sum, day) => sum + day.clicks, 0) };
  });
  const ceiling = Math.max(2, Math.ceil(Math.max(0, ...buckets.map(bucket => bucket.clicks)) / 2) * 2);
  return !data ? <div className="overview-empty" role="status"><h3>Statistik belum bisa dimuat</h3><AdminRefresh /></div> : <>
        <div className="engagement-summary"><p><strong>{number(data.total)}</strong><span>total klik</span></p>
          {data.daily.length > 0 && <span>{date(data.daily[0].date)} sampai {date(data.daily.at(-1)!.date)}</span>}
        </div>
        {data.total === 0 ? <p className="overview-note">Belum ada klik di periode ini.</p> : buckets.length > 0 && <figure className="engagement-figure">
          <figcaption>{interval === 1 ? 'Klik per hari' : `Klik per ${interval} hari`}</figcaption>
          <div className="engagement-plot">
            <div className="engagement-scale" aria-hidden="true"><span>{number(ceiling)}</span><span>{number(ceiling / 2)}</span><span>0</span></div>
            <div className="engagement-bars" style={{ gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))` }}>
              {buckets.map(bucket => <div key={bucket.start} className="engagement-column" title={bucket.end === bucket.start ? date(bucket.start) : `${date(bucket.start)} sampai ${date(bucket.end)}`}>
                <div className="engagement-bar-space"><div className="engagement-bar" style={{ height: `${bucket.clicks / ceiling * 100}%` }}>
                  <span aria-hidden="true">{number(bucket.clicks)}</span>
                </div></div>
                <span className="engagement-date" aria-hidden="true">{date(bucket.start)}</span>
                <span className="admin-sr-only">{date(bucket.start)}{bucket.end !== bucket.start ? ` sampai ${date(bucket.end)}` : ''}, {number(bucket.clicks)} klik</span>
              </div>)}
            </div>
          </div>
        </figure>}
        <dl className="engagement-types" aria-label="Klik menurut aksi">{engagementKinds.map(kind => { const Icon = engagementIcons[kind]; return <div key={kind}><dt><Icon size={18} aria-hidden="true" />{engagementLabels[kind]}</dt><dd>{number(data.types[kind] || 0)}</dd></div>; })}</dl>
        <div className="overview-detail-grid">
          <div><h3>Portofolio teratas</h3>{data.popular.length ? <ul className="overview-popular">{data.popular.slice(0, 5).map(item => <li key={item.id}><span>{names.get(item.id) || 'Portofolio diarsipkan'}</span><strong>{number(item.clicks)} <span>klik</span></strong></li>)}</ul> : <p className="overview-note">Belum ada klik portofolio.</p>}</div>
          <SettingsDisclosure title="Rincian harian" icon={<List size={20}/>}><div className="overview-daily"><table className="overview-table"><caption className="admin-sr-only">Klik harian selama {days} hari</caption><thead><tr><th scope="col">Tanggal</th><th scope="col">Klik</th></tr></thead><tbody>{data.daily.map(item => <tr key={item.date}><td>{date(item.date)}</td><td>{number(item.clicks)}</td></tr>)}</tbody></table></div></SettingsDisclosure>
        </div>
      </>;
}
