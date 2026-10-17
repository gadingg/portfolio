import { getWorksDocument } from '@/lib/db/works';
import { getEngagementSummary } from '@/lib/db/engagement';
import { Overview } from '@/components/admin/Overview';
import '@/components/admin/works-manager.css';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{days?:string}>}){
  const params=await searchParams,days=[7,30,90].includes(Number(params.days))?Number(params.days):30;
  const [doc,engagement]=await Promise.all([getWorksDocument(),getEngagementSummary(days)]);
  return <Overview draft={doc.draft.items} published={doc.published.items} data={engagement.data} days={days}/>;
}
