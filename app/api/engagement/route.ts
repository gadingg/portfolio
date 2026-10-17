import { NextRequest, NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/cms-http';
import { EngagementEventSchema } from '@/lib/engagement';
import { getPublicWorks } from '@/lib/db/works';
import { createAdminClient } from '@/lib/supabase/admin';
export async function POST(request:NextRequest){
  if(!sameOrigin(request))return new NextResponse(null,{status:403});
  try {
    if(Number(request.headers.get('content-length')||0)>1024)return new NextResponse(null,{status:413});
    const text=await request.text();if(text.length>1024)return new NextResponse(null,{status:413});
    const event=EngagementEventSchema.parse(JSON.parse(text));
    if(event.workId){
      const {items}=await getPublicWorks(),work=items.find(item=>item.id===event.workId&&!item.demo);
      const expected=event.type==='design_open'?'design':event.type==='video_open'?'video':'webapp';
      if(!work||work.kind!==expected)return new NextResponse(null,{status:400});
    }
    const {data,error}=await createAdminClient().rpc('portfolio_record_engagement',{event_key:event.eventId,event_kind:event.type,work_key:event.workId||null});
    if(error)return new NextResponse(null,{status:503});
    return new NextResponse(null,{status:data?204:429});
  } catch { return new NextResponse(null,{status:400}); }
}
