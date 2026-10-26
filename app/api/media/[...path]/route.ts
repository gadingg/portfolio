import { NextRequest,NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { cmsMediaBucket,publishedMedia } from '@/lib/cms-media';
import { createAdminClient } from '@/lib/supabase/admin';
import sharp from 'sharp';
export const dynamic='force-dynamic';
export async function GET(_request:NextRequest,{params}:{params:Promise<{path:string[]}>}){
  const filename=(await params).path.join('/');
  if(!/^(works|covers|content|gallery|general|cv)\/[0-9]+-[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|webm|pdf)$/.test(filename))return new NextResponse(null,{status:404});
  try{
    const admin=await verifyAdminSession();
    if(!admin&&!await publishedMedia(`/api/media/${filename}`))return new NextResponse(null,{status:404,headers:{'Cache-Control':'no-store'}});
    const storage=createAdminClient().storage.from(cmsMediaBucket);
    if (/\.(mp4|webm)$/.test(filename)) {
      const signed=await storage.createSignedUrl(filename,3600);
      if(signed.error||!signed.data)return new NextResponse(null,{status:404});
      return NextResponse.redirect(signed.data.signedUrl,{status:307,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    }
    const {data,error}=await storage.download(filename);
    if(error||!data)return new NextResponse(null,{status:404});
    const width=Number(_request.nextUrl.searchParams.get('w'));
    if(width&&[320,640,960,1280].includes(width)&&/\.(jpg|png|webp)$/.test(filename)){
      const thumbnail=await sharp(Buffer.from(await data.arrayBuffer()),{limitInputPixels:40_000_000}).rotate().resize({width,withoutEnlargement:true}).webp({quality:78}).toBuffer();
      return new NextResponse(new Uint8Array(thumbnail),{headers:{'Content-Type':'image/webp','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    }
    return new NextResponse(data,{headers:{'Content-Type':data.type||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch{return new NextResponse(null,{status:503,headers:{'Cache-Control':'no-store'}});}
}
