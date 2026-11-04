import { SiteManager } from '@/components/admin/SiteManager';
import { getSiteDocument } from '@/lib/db/site';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{area?:string}>}){
  if (!(await verifyAdminSession())) redirect('/admintgadink');
  const area=(await searchParams).area==='home'?'home':'profile';
  return <SiteManager key={area} area={area} initial={await getSiteDocument()} />;
}
