import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { EngagementSummarySchema } from '@/lib/engagement';
export async function getEngagementSummary(days:number){
  try {
    const {data,error}=await createAdminClient().rpc('portfolio_engagement_summary',{period_days:days});
    if(error)throw error;
    return {available:true as const, data:EngagementSummarySchema.parse(data)};
  } catch { return {available:false as const, data:null}; }
}
