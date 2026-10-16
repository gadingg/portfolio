import { NextResponse } from 'next/server';
import { cmsAccess,cmsError } from '@/lib/cms-http';
import { getWorksDocument } from '@/lib/db/works';
export const dynamic='force-dynamic';
export async function GET(){const denied=await cmsAccess();if(denied)return denied;try{
  const {draft}=await getWorksDocument();return NextResponse.json({items:draft.items.filter(item=>item.published).map(item=>({...item,url:item.caseStudy?`/admintgadink/preview/${item.id}`:item.url}))},{headers:{'Cache-Control':'no-store'}});
}catch(error){return cmsError(error);}}
