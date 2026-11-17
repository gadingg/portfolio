import type { Metadata } from 'next';
import { CVContent } from '@/components/public/CVContent';
import { getPublicSite,getSiteDocument } from '@/lib/db/site';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
export const dynamic='force-dynamic';

export const metadata: Metadata = {
  title: 'CV | R. Gading Utama',
  description: 'Professional profile and selected experience of R. Gading Utama.',
  robots: { index: false, follow: false },
};

export default async function CvPage({searchParams}:{searchParams:Promise<{preview?:string}>}) {
  const preview=(await searchParams).preview==='1';if(preview&&!await verifyAdminSession())redirect('/admintgadink');
  const site=preview?(await getSiteDocument()).draft:await getPublicSite();
  return <CVContent site={site} preview={preview}/>;
}
