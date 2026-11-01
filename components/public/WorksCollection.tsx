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
  return <div className="showcase" id="case-top">
    <StudyCaseHeader />
    <main className="section-shell collection-page">
      <a className="text-link" href="/#work"><ArrowLeft className="icon" aria-hidden="true" /> Back to portfolio</a>
      <div className="collection-intro"><h1>{workLabels[kind]}</h1></div>
      <nav className="collection-nav" aria-label="Work collections">{workKinds.map(value=><a className="button button-outline" key={value} href={`/${value}`} aria-current={value===kind?'page':undefined}>{workLabels[value]}</a>)}</nav>
      <section data-work-kind={kind} data-collection="true" aria-label={workLabels[kind]}>
        <div className="works-grid" data-works-list aria-busy="false" dangerouslySetInnerHTML={{__html: workCardsHTML(selected,true) || '<p class="works-message">No portfolio items yet.</p>'}}/>
        <div className="works-recovery" hidden><p role="status">Couldn't load the portfolio.</p><button type="button" className="button button-outline" data-retry-works>Try again</button></div>
        <noscript><p>Open a portfolio image or link to see the details.</p></noscript>
      </section>
    </main>
    <AuraFooter />
    <script id="initial-works" type="application/json" dangerouslySetInnerHTML={{__html:worksJSON(items)}}/>
    <Script src="/assets/js/works.js" strategy="afterInteractive" />
  </div>;
}
