import { getPublicWorks } from '@/lib/db/works';
import { workCardsHTML, worksJSON } from '@/lib/work-card-html';
import Script from 'next/script';
import { ArrowLeft } from 'lucide-react';
import { StudyCaseHeader } from './study-case/StudyCaseHeader';
import { AuraFooter } from './study-case/AuraFooter';
import { workKinds, workLabels, type WorkKind } from '@/lib/works';

export async function WorksCollection({kind}:{kind:WorkKind}) {
  const {items} = await getPublicWorks();
  const selected = items.filter(item => item.kind === kind);
  const descriptions = {webapp:'Website dan aplikasi untuk menyederhanakan pekerjaan. Buka karya untuk melihat studi kasus atau mencoba aplikasinya.',design:'Koleksi visual, dari komposisi sampai detail. Pilih gambar untuk melihatnya lebih dekat.',video:'Cerita brand dan campaign dalam gerak. Pilih video untuk menonton.'};
  return <div className="showcase" id="case-top">
    <StudyCaseHeader />
    <main className="section-shell collection-page">
      <a className="text-link" href="/#work"><ArrowLeft className="icon" aria-hidden="true" /> Back to selected works</a>
      <div className="collection-intro"><h1>{workLabels[kind]}</h1><p>{descriptions[kind]}</p></div>
      <nav className="collection-nav" aria-label="Work collections">{workKinds.map(value=><a className="button button-outline" key={value} href={`/${value}`} aria-current={value===kind?'page':undefined}>{workLabels[value]}</a>)}</nav>
      <section data-work-kind={kind} data-collection="true" aria-label={workLabels[kind]}>
        <div className="works-grid" data-works-list aria-busy="false" dangerouslySetInnerHTML={{__html: workCardsHTML(selected,true) || '<p class="works-message">Belum ada portfolio di koleksi ini.</p>'}}/>
        <div className="works-recovery" hidden><p role="status">Karya belum bisa dimuat.</p><button type="button" className="button button-outline" data-retry-works>Try again</button></div>
        <noscript><p>Buka gambar atau tautan portfolio untuk melihat detailnya.</p></noscript>
      </section>
    </main>
    <AuraFooter />
    <script id="initial-works" type="application/json" dangerouslySetInnerHTML={{__html:worksJSON(items)}}/>
    <Script src="/assets/js/works.js" strategy="afterInteractive" />
  </div>;
}
