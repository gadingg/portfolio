import { CaseAppActions } from '@/components/public/study-case/CaseAppActions';
import { notFound,redirect } from 'next/navigation';
import { VisualLayout } from '@/components/public/VisualLayout';
import { verifyAdminSession } from '@/lib/auth/session';
import { getWorksDocument,workAsProject } from '@/lib/db/works';
import { StudyCaseRenderer } from '@/components/public/study-case/StudyCaseRenderer';
import { ProjectArtwork } from '@/components/public/study-case/ProjectArtwork';
import { CaseOverview } from '@/components/public/study-case/CaseOverview';
import { editorialCaseLayout } from '@/lib/case-layout';
export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false},title:'Preview draft'};
export default async function Page({params}:{params:Promise<{id:string}>}){
  if(!await verifyAdminSession())redirect('/admintgadink');
  const {id}=await params;const {draft}=await getWorksDocument();const item=draft.items.find(value=>value.id===id);if(!item?.caseStudy)notFound();
  if(item.caseStudy.layout)return <div className="showcase"><div className="case-editorial"><VisualLayout layout={editorialCaseLayout(item.caseStudy.layout,item.caseStudy)}/></div></div>;
  return <div className="showcase"><main className="case-page section-shell"><a className="text-link" href="/admintgadink/dashboard/works">Kembali ke Portfolio</a><header className="case-intro"><div><h1>{item.title}</h1><p>{item.description}</p></div><CaseAppActions study={item.caseStudy}/></header><ProjectArtwork project={workAsProject(item)}/><CaseOverview problem={item.caseStudy.problem} approach={item.caseStudy.solution} outcome={item.caseStudy.impact}/><div className="case-narrative mx-auto mt-12 max-w-3xl"><StudyCaseRenderer blocks={workAsProject(item).blocks||[]}/></div></main></div>;
}
