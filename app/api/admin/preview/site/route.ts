import { NextResponse } from 'next/server';
import { cmsAccess,cmsError } from '@/lib/cms-http';
import { getSiteDocument,renderHomepage } from '@/lib/db/site';
import { getWorksDocument } from '@/lib/db/works';
export const dynamic='force-dynamic';
export async function GET(){const denied=await cmsAccess();if(denied)return denied;try{
  const [site,works]=await Promise.all([getSiteDocument(),getWorksDocument()]);const cases=works.draft.items.filter(item=>item.published&&item.caseStudy);
  let html=(await renderHomepage(site.draft,cases.flatMap(item=>[item.caseStudy!.slug,...(item.aliases||[])]))).replace('<body','<body data-cms-preview="true"').replace('href="/cv"','href="/cv?preview=1"');
  for(const item of cases)for(const slug of [item.caseStudy!.slug,...(item.aliases||[])])html=html.replaceAll(`href="/work/${slug}"`,`href="/admintgadink/preview/${item.id}"`);
  return new NextResponse(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
}catch(error){return cmsError(error);}}
