import { redirect } from 'next/navigation';
import { AISettings } from '@/components/admin/AISettings';
import { verifyAdminSession } from '@/lib/auth/session';
import { getAISettingsStatus } from '@/lib/ai-settings';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!(await verifyAdminSession())) redirect('/admintgadink');
  const initialStatus = await getAISettingsStatus().catch(() => null);
  return <AISettings initialStatus={initialStatus} />;
}
