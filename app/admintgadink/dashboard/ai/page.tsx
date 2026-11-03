import { redirect } from 'next/navigation';
import { AIStudyManager } from '@/components/admin/AIStudyManager';
import { verifyAdminSession } from '@/lib/auth/session';
import { getWorks } from '@/lib/db/works';
import { getAISettingsStatus } from '@/lib/ai-settings';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!(await verifyAdminSession())) redirect('/admintgadink');
  const initial = await Promise.all([getWorks(), getAISettingsStatus()])
    .then(([works, settings]) => ({
      items: works.items.filter(item => item.kind === 'webapp' && item.caseStudy),
      revision: works.revision,
      configured: settings.configured,
    })).catch(() => null);
  return <AIStudyManager initial={initial} />;
}
