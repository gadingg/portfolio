export function CaseOverview({ problem, approach, outcome }: { problem: string; approach: string; outcome: string }) {
  return <section className="case-overview" aria-label="Project overview">
    <h2 className="case-summary-heading">The thinking behind the output</h2>
    <div className="case-summary-grid">
      {[["Problem", problem], ["Approach", approach], ["Outcome", outcome]].filter(([, text]) => text.trim()).map(([title, text]) =>
        <section className="case-summary-step" key={title}><h3>{title==='Problem'?<Search className="icon" aria-hidden="true"/>:title==='Approach'?<Lightbulb className="icon" aria-hidden="true"/>:<CheckCheck className="icon" aria-hidden="true"/>}{title}</h3><p>{text}</p></section>
      )}
    </div>
  </section>;
}
import {Search,Lightbulb,CheckCheck} from 'lucide-react';
