import { List, Layers3, Eye, FilePenLine, EyeOff, PanelsTopLeft, Palette, Clapperboard, ChartNoAxesCombined, MousePointer2, Image, MessageCircle, ExternalLink, CircleAlert } from 'lucide-react';
import { OverviewThumbnail } from './OverviewThumbnail';
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

export function Overview({ draft, published, data, days }: {
  draft: WorkItem[]; published: WorkItem[]; data: EngagementSummary | null; days: number;
}) {
  const summary = summarizeWorks(draft, published);
  const chartMax = Math.max(1, ...(data?.daily.map(item => item.clicks) || []));
  const names = new Map([...published, ...draft].map(item => [item.id, item.title]));
  return <div className="works-manager cms-manager overview">
    <header className="wm-heading overview-heading">
      <div><h1>Overview</h1></div>
      <div className="overview-actions">
        <AdminLink className="wm-button" href="/admintgadink/dashboard/editor/home">Edit homepage</AdminLink>
        <AdminLink className="wm-button wm-primary" href="/admintgadink/dashboard/works">Kelola portofolio</AdminLink>
      </div>
    </header>

    <section className="overview-stats" aria-label="Ringkasan portofolio">
      <div className="overview-stat overview-stat-total"><div className="overview-stat-heading"><h2>Total Portofolio</h2><Layers3 aria-hidden="true" /></div><strong>{number(summary.total)}</strong></div>
      <div className="overview-stat"><div className="overview-stat-heading"><h2>Tayang</h2><Eye aria-hidden="true" /></div><strong>{number(summary.live)}</strong><p>Terlihat di website</p></div>
      <div className="overview-stat"><div className="overview-stat-heading"><h2>Draft baru</h2><FilePenLine aria-hidden="true" /></div><strong>{number(summary.drafts)}</strong><p>Belum pernah tayang</p></div>
      <div className="overview-stat"><div className="overview-stat-heading"><h2>Disembunyikan</h2><EyeOff aria-hidden="true" /></div><strong>{number(summary.hidden)}</strong><p>Tidak tampil di website</p></div>
    </section>

    {summary.incomplete>0 && <div className="overview-publication-note"><CircleAlert size={20} aria-hidden="true" /><span>{number(summary.incomplete)} portofolio belum lengkap dan belum tampil di website.</span><AdminLink href="/admintgadink/dashboard/works">Lengkapi portofolio</AdminLink></div>}
    {summary.changed && <div className="overview-publication-note"><span>Ada draft yang belum di-publish.</span><AdminLink href="/admintgadink/dashboard/works">Lihat draft</AdminLink></div>}

    <div className="overview-content-grid">
      <section className="overview-panel" aria-labelledby="category-title">
        <div className="overview-section-heading"><h2 id="category-title">Kategori portofolio</h2><span>{number(summary.total)} portofolio</span></div>
        <ul className="overview-categories">
          {summary.categories.map(item => { const Icon = categoryIcons[item.kind]; return <li key={item.kind}>
            <div className="overview-category-main"><Icon size={22} aria-hidden="true" /><div><h3>{workLabels[item.kind]}</h3><p>{number(item.total)} portofolio</p></div>
              <AdminLink className="wm-button" href={`/admintgadink/dashboard/works?kind=${item.kind}`} aria-label={`Lihat portofolio ${workLabels[item.kind]}`}>Lihat</AdminLink></div>
            <div className="overview-category-track" aria-hidden="true"><span style={{ width: `${summary.total ? item.total / summary.total * 100 : 0}%` }} /></div>
          </li>; })}
        </ul>
      </section>
      <section className="overview-panel" aria-labelledby="recent-title">
        <div className="overview-section-heading"><h2 id="recent-title">Portofolio terbaru</h2><AdminLink href="/admintgadink/dashboard/works">Lihat semua</AdminLink></div>
        {summary.recent.length ? <ul className="overview-recent">
          {summary.recent.map(item => <li key={item.id}>
            <OverviewThumbnail src={item.image} kind={item.kind} />
            <div className="overview-work-info"><h3>{item.title}</h3><p>{workLabels[item.kind]}<span aria-hidden="true"> · </span>{item.updatedAt ? <time dateTime={item.updatedAt}>{date(item.updatedAt)}</time> : 'Tanggal belum tersedia'}</p><span className={`overview-status ${item.isLive ? 'is-live' : ''}`}>{item.status}</span></div>
            <AdminLink className="wm-button" aria-label={`Edit ${item.title}`} href={`/admintgadink/dashboard/works?kind=${item.kind}&work=${encodeURIComponent(item.id)}`}>Edit</AdminLink>
          </li>)}
        </ul> : <div className="overview-empty"><h3>Belum ada portofolio</h3><p>Tambahkan portofolio pertama.</p></div>}
        {summary.recent.some(item => !item.updatedAt) && <p className="overview-note">Portofolio tanpa tanggal mengikuti urutan koleksi.</p>}
      </section>
    </div>

    <section className="overview-panel overview-engagement" aria-labelledby="engagement-title">
      <div className="overview-section-heading"><div className="overview-section-identity"><ChartNoAxesCombined size={22} aria-hidden="true" /><div><h2 id="engagement-title">Aktivitas pengunjung</h2><p>Klik pada portofolio dan kontak.</p></div></div>
        <nav className="overview-periods" aria-label="Periode statistik">
          {[7, 30, 90].map(value => <AdminLink className="wm-button" aria-current={days === value ? 'page' : undefined} key={value} href={`?days=${value}`} scroll={false}>{value} hari</AdminLink>)}
        </nav>
      </div>
      {!data ? <div className="overview-empty" role="status"><h3>Statistik belum bisa dimuat</h3><AdminRefresh /></div> : <>
        <div className="engagement-summary"><p><strong>{number(data.total)}</strong><span>klik dalam {days} hari</span></p>{data.firstEventAt && <span>Tercatat mulai {date(data.firstEventAt)}</span>}</div>
        {data.total === 0 ? <div className="overview-zero"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v16h16M8 15v-4m4 4V7m4 8v-6" /></svg><h3>Belum ada klik di periode ini</h3></div> : data.daily.length > 0 ? <>
          <svg className="engagement-chart" viewBox="0 0 800 180" role="img" aria-labelledby="click-chart-title click-chart-description"><title id="click-chart-title">{`Klik harian selama ${days} hari`}</title><desc id="click-chart-description">{`Total ${number(data.total)} klik. Nilai harian tersedia di rincian data.`}</desc><line x1="0" x2="800" y1="170" y2="170" stroke="currentColor" opacity=".2" />{data.daily.map((item, index) => <rect key={item.date} x={index * 800 / data.daily.length + 2} y={170 - item.clicks / chartMax * 150} width={Math.max(1, 800 / data.daily.length - 4)} height={item.clicks / chartMax * 150} fill="currentColor" rx="2"><title>{`${date(item.date)}: ${number(item.clicks)} klik`}</title></rect>)}</svg>
          <div className="chart-axis"><span>{date(data.daily[0].date)}</span><span>{date(data.daily.at(-1)!.date)}</span></div>
        </> : null}
        <dl className="engagement-types">{engagementKinds.map(kind => { const Icon = engagementIcons[kind]; return <div key={kind}><dt><Icon size={18} aria-hidden="true" />{engagementLabels[kind]}</dt><dd>{number(data.types[kind] || 0)}</dd></div>; })}</dl>
        <p className="overview-note">Menghitung klik di portofolio, termasuk membuka player. Bukan views Instagram. Portofolio contoh dan preview admin tidak dihitung.</p>
        <div className="overview-detail-grid">
          <div><h3>Portofolio paling sering dibuka</h3>{data.popular.length ? <ul className="overview-popular">{data.popular.slice(0, 5).map(item => <li key={item.id}><span>{names.get(item.id) || 'Portofolio diarsipkan'}</span><strong>{number(item.clicks)} <span>klik</span></strong></li>)}</ul> : <p className="overview-note">Belum ada portofolio yang dibuka di periode ini.</p>}</div>
          <SettingsDisclosure title="Klik per hari" icon={<List size={20}/>}><div className="overview-daily"><table className="overview-table"><caption className="admin-sr-only">Klik harian selama {days} hari</caption><thead><tr><th scope="col">Tanggal</th><th scope="col">Klik</th></tr></thead><tbody>{data.daily.map(item => <tr key={item.date}><td>{date(item.date)}</td><td>{number(item.clicks)}</td></tr>)}</tbody></table></div></SettingsDisclosure>
        </div>
      </>}
    </section>
    <footer className="overview-footer"><AdminLink href="/admintgadink/dashboard/site">Website &amp; CV</AdminLink></footer>
  </div>;
}
