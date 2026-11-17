import { SiteManager } from '@/components/admin/SiteManager';
import { getSiteDocument } from '@/lib/db/site';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page(){
  if (!(await verifyAdminSession())) redirect('/admintgadink');
  return <SiteManager initial={await getSiteDocument()} />;
}
