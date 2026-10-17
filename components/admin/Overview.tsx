import Link from 'next/link';
import { workKinds,workLabels,type WorkItem } from '@/lib/works';
import { engagementKinds,engagementLabels,type EngagementSummary } from '@/lib/engagement';
import './overview.css';
const number=(value:number)=>new Intl.NumberFormat('id-ID').format(value);
const date=(value:string)=>new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',timeZone:'Asia/Jakarta'}).format(new Date(value.length===10?`${value}T12:00:00+07:00`:value));
export function Overview({draft,published,data,days}:{draft:WorkItem[];published:WorkItem[];data:EngagementSummary|null;days:number}){
  const categories=workKinds.map(kind=>({kind,total:draft.filter(item=>item.kind===kind).length,live:published.filter(item=>item.kind===kind&&item.published).length}));
  const max=Math.max(1,...categories.flatMap(item=>[item.total,item.live]));
  const chartMax=Math.max(1,...(data?.daily.map(item=>item.clicks)||[]));
  return <div className="works-manager cms-manager overview">
    <div className="wm-heading"><div><h1>Overview</h1><p>Konten dan aktivitas portfolio.</p></div><Link className="wm-button wm-primary" href="/admintgadink/dashboard/editor/home">Edit homepage</Link></div>
    <section className="overview-inventory" aria-labelledby="inventory-title">
      <div className="overview-section-heading"><h2 id="inventory-title">Works</h2><p>{number(draft.length)} total · {number(published.filter(item=>item.published).length)} tampil · {number(draft.filter(item=>item.demo).length)} contoh</p></div>
      <div className="overview-legend"><span><i className="overview-live"/>Tampil publik</span><span><i className="overview-draft"/>Dalam editor</span></div>
      <div className="inventory-chart" role="img" aria-label="Perbandingan jumlah karya publik dan dalam editor. Angka lengkap tersedia pada tabel di bawah.">
        {categories.map(item=><div className="inventory-row" key={item.kind}><span>{workLabels[item.kind]}</span><div><div className="inventory-bar"><i className="overview-live" style={{width:`${item.live/max*100}%`}}/><b>{number(item.live)}</b></div><div className="inventory-bar"><i className="overview-draft" style={{width:`${item.total/max*100}%`}}/><b>{number(item.total)}</b></div></div></div>)}
      </div>
      <table className="overview-table"><caption className="sr-only">Jumlah karya per kategori</caption><thead><tr><th>Kategori</th><th>Publik</th><th>Editor</th><th><span className="sr-only">Kelola</span></th></tr></thead><tbody>{categories.map(item=><tr key={item.kind}><th scope="row">{workLabels[item.kind]}</th><td>{number(item.live)}</td><td>{number(item.total)}</td><td><Link href={`/admintgadink/dashboard/works?kind=${item.kind}`}>Kelola<span className="sr-only"> {workLabels[item.kind]}</span></Link></td></tr>)}</tbody></table>
    </section>
    <section className="overview-engagement" aria-labelledby="engagement-title">
      <div className="overview-section-heading"><h2 id="engagement-title">Engagement</h2><nav aria-label="Periode engagement">{[7,30,90].map(value=><Link className="wm-button" aria-current={days===value?'page':undefined} key={value} href={`?days=${value}`}>{value} hari</Link>)}</nav></div>
      {!data?<div className="wm-message" role="status"><p>Data engagement belum dapat dimuat.</p><Link className="wm-button" href={`?days=${days}`}>Coba lagi</Link></div>:<>
        <div className="engagement-summary"><p><strong>{number(data.total)}</strong> klik dalam {days} hari</p><span>{data.firstEventAt?`Tercatat mulai ${date(data.firstEventAt)}`:'Belum ada klik tercatat.'}</span></div>
        <svg className="engagement-chart" viewBox="0 0 800 180" role="img" aria-labelledby="click-chart-title click-chart-description"><title id="click-chart-title">{`Klik harian selama ${days} hari`}</title><desc id="click-chart-description">{`Total ${number(data.total)} klik. Nilai harian tersedia di rincian data.`}</desc><line x1="0" x2="800" y1="170" y2="170" stroke="currentColor" opacity=".3"/>{data.daily.map((item,index)=><rect key={item.date} x={index*800/data.daily.length+2} y={170-item.clicks/chartMax*150} width={Math.max(1,800/data.daily.length-4)} height={item.clicks/chartMax*150} fill="currentColor"><title>{`${date(item.date)}: ${number(item.clicks)} klik`}</title></rect>)}</svg>
        <div className="chart-axis"><span>{data.daily[0]&&date(data.daily[0].date)}</span><span>{data.daily.at(-1)&&date(data.daily.at(-1)!.date)}</span></div>
        <dl className="engagement-types">{engagementKinds.map(kind=><div key={kind}><dt>{engagementLabels[kind]}</dt><dd>{number(data.types[kind]||0)}</dd></div>)}</dl>
        <p className="overview-note">Klik di portfolio, termasuk membuka player. Bukan views, likes, atau durasi tonton Instagram. Data contoh dan preview admin tidak dihitung.</p>
        <div className="overview-detail-grid"><div><h3>Karya paling sering dibuka</h3>{data.popular.length?<table className="overview-table"><thead><tr><th>Karya</th><th>Klik</th></tr></thead><tbody>{data.popular.map(item=><tr key={item.id}><td>{draft.find(work=>work.id===item.id)?.title||'Karya diarsipkan'}</td><td>{number(item.clicks)}</td></tr>)}</tbody></table>:<p>Daftar muncul setelah ada aktivitas karya.</p>}</div><details><summary>Rincian klik harian</summary><div className="overview-daily"><table className="overview-table"><thead><tr><th>Tanggal</th><th>Klik</th></tr></thead><tbody>{data.daily.map(item=><tr key={item.date}><td>{date(item.date)}</td><td>{number(item.clicks)}</td></tr>)}</tbody></table></div></details></div>
      </>}
    </section>
    <div className="overview-footer"><Link className="wm-button" href="/admintgadink/dashboard/works">Kelola works</Link><Link className="wm-button" href="/admintgadink/dashboard/site">Website & CV</Link></div>
  </div>;
}
