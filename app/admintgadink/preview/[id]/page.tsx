import { notFound,redirect } from 'next/navigation';
import { VisualLayout } from '@/components/public/VisualLayout';
import { verifyAdminSession } from '@/lib/auth/session';
import { getWorksDocument,workAsProject } from '@/lib/db/works';
import { StudyCaseRenderer } from '@/components/public/study-case/StudyCaseRenderer';
import { ProjectArtwork } from '@/components/public/study-case/ProjectArtwork';
export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false},title:'Preview draft'};
export default async function Page({params}:{params:Promise<{id:string}>}){
  if(!await verifyAdminSession())redirect('/admintgadink');
  const {id}=await params;const {draft}=await getWorksDocument();const item=draft.items.find(value=>value.id===id);if(!item?.caseStudy)notFound();
  if(item.caseStudy.layout)return <VisualLayout layout={item.caseStudy.layout}/>;
  return <div className="showcase"><main className="case-page section-shell"><a className="text-link" href="/admintgadink/dashboard/works">Kembali ke Portfolio</a><header className="case-intro"><div><h1>{item.title}</h1><p>{item.description}</p></div></header><ProjectArtwork project={workAsProject(item)}/><div className="case-narrative mx-auto mt-12 max-w-3xl">{(['problem','solution','impact'] as const).map((key,i)=><section key={key}><h2>{['The problem','The solution','The impact'][i]}</h2><p className="case-copy">{item.caseStudy![key]}</p></section>)}<StudyCaseRenderer blocks={workAsProject(item).blocks||[]}/></div></main></div>;
}
