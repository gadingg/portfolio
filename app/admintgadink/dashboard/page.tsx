import { getWorksDocument } from '@/lib/db/works';
import { getEngagementSummary } from '@/lib/db/engagement';
import { Overview } from '@/components/admin/Overview';
import '@/components/admin/works-manager.css';
import { Suspense } from 'react';
import { OverviewSkeleton } from '@/components/admin/OverviewSkeleton';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{days?:string}>}){
  const params=await searchParams,days=[7,30,90].includes(Number(params.days))?Number(params.days):7;
  return <Suspense key={days} fallback={<OverviewSkeleton />}><OverviewData days={days} /></Suspense>;
}
async function OverviewData({ days }: { days: number }) {
  const [doc,engagement]=await Promise.all([getWorksDocument(),getEngagementSummary(days)]);
  return <Overview draft={doc.draft.items} published={doc.published.items} data={engagement.data} days={days}/>;
}
