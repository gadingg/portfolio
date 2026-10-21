import { List } from 'lucide-react';
import { SettingsDisclosure } from './SettingsDisclosure';
import { workLabels, type WorkItem } from '@/lib/works';
import { summarizeWorks } from '@/lib/admin-overview';
import { engagementKinds, engagementLabels, type EngagementSummary } from '@/lib/engagement';
import { AdminLink } from './AdminLink';
import { AdminRefresh } from './AdminRefresh';
import './overview.css';

const number = (value: number) => new Intl.NumberFormat('id-ID').format(value);
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
      <div><h1>Overview</h1><p>Cek portfolio dan aktivitas pengunjung di sini.</p></div>
      <div className="overview-actions">
        <AdminLink className="wm-button" href="/admintgadink/dashboard/editor/home">Edit homepage</AdminLink>
        <AdminLink className="wm-button wm-primary" href="/admintgadink/dashboard/works">Kelola portfolio</AdminLink>
      </div>
    </header>

    <section className="overview-stats" aria-label="Ringkasan portfolio">
      <div className="overview-stat"><h2>Total Portfolio</h2><strong>{number(summary.total)}</strong><p>{summary.examples ? `Termasuk ${number(summary.examples)} portfolio contoh` : 'Seluruh koleksi portfolio'}</p></div>
      <div className="overview-stat"><h2>Tayang</h2><strong>{number(summary.live)}</strong><p>Terlihat di website</p></div>
      <div className="overview-stat"><h2>Draft</h2><strong>{number(summary.drafts)}</strong><p>Belum tampil di website</p></div>
    </section>

    {summary.changed && <div className="overview-publication-note"><span>Draft sudah tersimpan, tapi belum tayang.</span><AdminLink href="/admintgadink/dashboard/works">Tinjau perubahan</AdminLink></div>}

    <div className="overview-content-grid">
      <section className="overview-panel" aria-labelledby="category-title">
        <div className="overview-section-heading"><h2 id="category-title">Kategori portfolio</h2><span>{number(summary.total)} portfolio</span></div>
        <ul className="overview-categories">
          {summary.categories.map(item => <li key={item.kind}>
            <div><h3>{workLabels[item.kind]}</h3><p>{number(item.total)} portfolio</p></div>
            <AdminLink className="wm-button" href={`/admintgadink/dashboard/works?kind=${item.kind}`} aria-label={`Kelola ${workLabels[item.kind]}`}>Kelola</AdminLink>
          </li>)}
        </ul>
      </section>
      <section className="overview-panel" aria-labelledby="recent-title">
        <div className="overview-section-heading"><h2 id="recent-title">Portfolio terbaru</h2><AdminLink href="/admintgadink/dashboard/works">Lihat semua</AdminLink></div>
        {summary.recent.length ? <ul className="overview-recent">
          {summary.recent.map(item => <li key={item.id}>
            <div className="overview-work-info"><h3>{item.title}</h3><p>{workLabels[item.kind]}<span aria-hidden="true"> · </span>{item.updatedAt ? <time dateTime={item.updatedAt}>{date(item.updatedAt)}</time> : 'Tanggal belum tersedia'}</p></div>
            <span className={`overview-status ${item.isLive ? 'is-live' : ''}`}>{item.isLive ? 'Tayang' : 'Draft'}</span>
            <AdminLink className="wm-button" aria-label={`Edit ${item.title}`} href={`/admintgadink/dashboard/works?kind=${item.kind}&work=${encodeURIComponent(item.id)}`}>Edit</AdminLink>
          </li>)}
        </ul> : <div className="overview-empty"><h3>Belum ada portfolio</h3><p>Buka Kelola portfolio buat menambahkan portfolio pertama.</p></div>}
        {summary.recent.some(item => !item.updatedAt) && <p className="overview-note">Portfolio tanpa tanggal mengikuti urutan koleksi.</p>}
      </section>
    </div>

    <section className="overview-panel overview-engagement" aria-labelledby="engagement-title">
      <div className="overview-section-heading"><div><h2 id="engagement-title">Aktivitas pengunjung</h2><p>Lihat portfolio dan kontak yang paling sering diklik.</p></div>
        <nav className="overview-periods" aria-label="Periode statistik">
          {[7, 30, 90].map(value => <AdminLink className="wm-button" aria-current={days === value ? 'page' : undefined} key={value} href={`?days=${value}`} scroll={false}>{value} hari</AdminLink>)}
        </nav>
      </div>
      {!data ? <div className="overview-empty" role="status"><h3>Statistik belum kebaca</h3><p>Coba muat ulang sebentar, ya.</p><AdminRefresh /></div> : <>
        <div className="engagement-summary"><p><strong>{number(data.total)}</strong><span>klik dalam {days} hari</span></p>{data.firstEventAt && <span>Tercatat mulai {date(data.firstEventAt)}</span>}</div>
        {data.total === 0 ? <div className="overview-zero"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v16h16M8 15v-4m4 4V7m4 8v-6" /></svg><h3>Belum ada klik di periode ini</h3><p>Begitu ada klik, angkanya muncul di sini.</p></div> : data.daily.length > 0 ? <>
          <svg className="engagement-chart" viewBox="0 0 800 180" role="img" aria-labelledby="click-chart-title click-chart-description"><title id="click-chart-title">{`Klik harian selama ${days} hari`}</title><desc id="click-chart-description">{`Total ${number(data.total)} klik. Nilai harian tersedia di rincian data.`}</desc><line x1="0" x2="800" y1="170" y2="170" stroke="currentColor" opacity=".2" />{data.daily.map((item, index) => <rect key={item.date} x={index * 800 / data.daily.length + 2} y={170 - item.clicks / chartMax * 150} width={Math.max(1, 800 / data.daily.length - 4)} height={item.clicks / chartMax * 150} fill="currentColor" rx="2"><title>{`${date(item.date)}: ${number(item.clicks)} klik`}</title></rect>)}</svg>
          <div className="chart-axis"><span>{date(data.daily[0].date)}</span><span>{date(data.daily.at(-1)!.date)}</span></div>
        </> : null}
        <dl className="engagement-types">{engagementKinds.map(kind => <div key={kind}><dt>{engagementLabels[kind]}</dt><dd>{number(data.types[kind] || 0)}</dd></div>)}</dl>
        <p className="overview-note">Menghitung klik di portfolio, termasuk membuka player. Bukan views Instagram. Data contoh dan preview admin tidak dihitung.</p>
        <div className="overview-detail-grid">
          <div><h3>Portfolio paling sering dibuka</h3>{data.popular.length ? <ul className="overview-popular">{data.popular.slice(0, 5).map(item => <li key={item.id}><span>{names.get(item.id) || 'Portfolio diarsipkan'}</span><strong>{number(item.clicks)} <span>klik</span></strong></li>)}</ul> : <p className="overview-note">Belum ada portfolio yang dibuka di periode ini.</p>}</div>
          <SettingsDisclosure title="Klik per hari" icon={<List size={20}/>}><div className="overview-daily"><table className="overview-table"><caption className="admin-sr-only">Klik harian selama {days} hari</caption><thead><tr><th scope="col">Tanggal</th><th scope="col">Klik</th></tr></thead><tbody>{data.daily.map(item => <tr key={item.date}><td>{date(item.date)}</td><td>{number(item.clicks)}</td></tr>)}</tbody></table></div></SettingsDisclosure>
        </div>
      </>}
    </section>
    <footer className="overview-footer"><AdminLink href="/admintgadink/dashboard/site">Website &amp; CV</AdminLink></footer>
  </div>;
}
