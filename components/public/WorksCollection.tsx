import { getPublicWorks } from '@/lib/db/works';
import { workCardsHTML, worksJSON } from '@/lib/work-card-html';
import Script from 'next/script';
import { ArrowLeft } from 'lucide-react';
import { StudyCaseHeader } from './study-case/StudyCaseHeader';
import { AuraFooter } from './study-case/AuraFooter';
import { workKinds, workLabels, type WorkKind } from '@/lib/works';
import { isReadyWork } from '@/lib/work-readiness';
import { workFiltersHTML } from '@/lib/work-filters';

export async function WorksCollection({kind='all'}:{kind?:WorkKind|'all'}) {
  const {items} = await getPublicWorks();
  const selected = items.filter(item => item.published && isReadyWork(item) && (kind === 'all' || item.kind === kind));
  return <div className="showcase" id="case-top">
    <StudyCaseHeader />
    <main className="section-shell collection-page">
      <a className="text-link case-back" href="/#work"><ArrowLeft className="icon" aria-hidden="true" /> Back to portfolio</a>
      <div className="collection-intro"><h1>{kind==='all'?'Portfolio':workLabels[kind]}</h1><p className="collection-count" role="status" aria-live="polite" aria-atomic="true" data-filter-status>{selected.length} {selected.length===1?'project':'projects'}</p></div>
      <div dangerouslySetInnerHTML={{__html:workFiltersHTML(kind,false,true)}}/>
      <noscript><nav className="collection-nav" aria-label="Work collections"><a href="/works">All</a>{workKinds.map(value=><a href={`/${value}`} key={value}>{workLabels[value]}</a>)}</nav></noscript>
      <section id="portfolio-results" data-work-kind={kind} data-collection="true" aria-label="Portfolio">
        <div className="works-grid" data-works-list aria-busy="false" dangerouslySetInnerHTML={{__html: workCardsHTML(selected,true) || '<p class="works-message">No portfolio items yet.</p>'}}/>
        <div className="works-recovery" hidden><p role="status">Couldn't load the portfolio.</p><button type="button" className="button button-outline" data-retry-works>Try again</button></div>
        <noscript><p>Open a portfolio image or link to see the details.</p></noscript>
      </section>
    </main>
    <AuraFooter />
    <script id="initial-works" type="application/json" dangerouslySetInnerHTML={{__html:worksJSON(items)}}/>
    <Script src="/assets/js/works.js" strategy="afterInteractive" />
    <Script src="/assets/js/contact-copy.js" strategy="afterInteractive" />
  </div>;
}
