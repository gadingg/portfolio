import { WorksManager } from '@/components/admin/WorksManager';
import { getWorks } from '@/lib/db/works';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Page({searchParams}: {searchParams: Promise<{kind?: string; work?: string; status?: string}>}) {
  if (!(await verifyAdminSession())) redirect('/admintgadink');
  const [initial, selection] = await Promise.all([getWorks(), searchParams]);
  return <WorksManager key={`${selection.kind || ''}:${selection.work || ''}:${selection.status || ''}`} initial={initial} selection={selection} />;
}
