import { NextRequest,NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { cmsMediaBucket,publishedMedia } from '@/lib/cms-media';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic='force-dynamic';
export async function GET(_request:NextRequest,{params}:{params:Promise<{path:string[]}>}){
  const filename=(await params).path.join('/');
  if(!/^(works|covers|content|gallery|general|cv)\/[0-9]+-[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|webm|pdf)$/.test(filename))return new NextResponse(null,{status:404});
  try{
    const admin=await verifyAdminSession();
    if(!admin&&!await publishedMedia(`/api/media/${filename}`))return new NextResponse(null,{status:404,headers:{'Cache-Control':'no-store'}});
    const {data,error}=await createAdminClient().storage.from(cmsMediaBucket).download(filename);
    if(error||!data)return new NextResponse(null,{status:404});
    return new NextResponse(data,{headers:{'Content-Type':data.type||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch{return new NextResponse(null,{status:503,headers:{'Cache-Control':'no-store'}});}
}
