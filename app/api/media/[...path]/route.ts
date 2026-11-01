import { NextRequest,NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { cmsMediaBucket,publishedMedia } from '@/lib/cms-media';
import { createAdminClient } from '@/lib/supabase/admin';
import sharp from 'sharp';
import { cachedMediaImage } from '@/lib/media-image-cache';
export const dynamic='force-dynamic';
class MissingMedia extends Error {}
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
    const width=Number(_request.nextUrl.searchParams.get('w'));
    const resized=[320,640,960,1280].includes(width)&&/\.(jpg|png|webp)$/.test(filename);
    if (/\.(jpg|png|webp|gif)$/.test(filename)) {
      const payload=await cachedMediaImage(`${cmsMediaBucket}:${filename}:${resized?width:'original'}`,async()=>{
        const {data,error}=await storage.download(filename);
        if(error||!data)throw new MissingMedia('Media unavailable');
        const original=Buffer.from(await data.arrayBuffer());
        const bytes=resized?await sharp(original,{limitInputPixels:40_000_000}).rotate().resize({width,withoutEnlargement:true}).webp({quality:78}).toBuffer():original;
        return {bytes,type:resized?'image/webp':data.type||'application/octet-stream'};
      });
      const headers={'Content-Type':payload.type,'Cache-Control':'private, no-cache','ETag':payload.etag,'Vary':'Cookie','X-Content-Type-Options':'nosniff'};
      if(_request.headers.get('if-none-match')?.split(',').some(tag=>tag.trim().replace(/^W\//,'')===payload.etag))return new NextResponse(null,{status:304,headers});
      return new NextResponse(new Uint8Array(payload.bytes),{headers});
    }
    const {data,error}=await storage.download(filename);
    if(error||!data)return new NextResponse(null,{status:404});
    return new NextResponse(data,{headers:{'Content-Type':data.type||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch(error){return new NextResponse(null,{status:error instanceof MissingMedia?404:503,headers:{'Cache-Control':'no-store'}});}
}
