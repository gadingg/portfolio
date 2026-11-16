import { NextRequest,NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { verifyAdminSession } from '@/lib/auth/session';
import { cmsMediaBucket,publishedMedia } from '@/lib/cms-media';
import { createAdminClient } from '@/lib/supabase/admin';
import sharp from 'sharp';
import { cachedMediaImage } from '@/lib/media-image-cache';
export const dynamic='force-dynamic';
class MissingMedia extends Error {}
class OversizedVariant extends Error {
  constructor(readonly bytes:Buffer){super('Image exceeds the persistent cache limit');}
}
const signingWindowSeconds=120;
async function signVideo(filename:string) {
  const signed=await createAdminClient().storage.from(cmsMediaBucket).createSignedUrl(filename,180);
  if(signed.error||!signed.data)throw new MissingMedia('Video unavailable');
  return signed.data.signedUrl;
}
function publishedVideoURL(filename:string) {
  // Each key expires from use before its signed URL can expire.
  const window=String(Math.floor(Date.now()/(signingWindowSeconds*1000)));
  return unstable_cache(()=>signVideo(filename),[
    'published-video',process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'',filename,window,
  ],{revalidate:signingWindowSeconds,tags:['portfolio-cms-works','portfolio-cms-site']})();
}
async function publishedImageVariant(filename:string,width:number,resize:()=>Promise<Buffer>) {
  const variant=unstable_cache(async()=>{
    const bytes=await resize();
    if(bytes.length>512*1024)throw new OversizedVariant(bytes);
    return bytes.toString('base64');
  },['cms-webp-v1',process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'',filename,String(width)],{revalidate:86_400});
  try {
    return Buffer.from(await variant(),'base64');
  } catch(error) {
    if(error instanceof OversizedVariant)return error.bytes;
    throw error;
  }
}
export async function GET(_request:NextRequest,{params}:{params:Promise<{path:string[]}>}){
  const filename=(await params).path.join('/');
  if(!/^(works|covers|content|gallery|general|cv)\/[0-9]+-[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|webm|pdf)$/.test(filename))return new NextResponse(null,{status:404});
  try{
    let admin=false;
    const published=await publishedMedia(`/api/media/${filename}`).catch(async(error:unknown)=>{
      admin=await verifyAdminSession();
      if(admin)return false;
      throw error;
    });
    if(!published&&!admin&&!await verifyAdminSession())return new NextResponse(null,{status:404,headers:{'Cache-Control':'no-store'}});
    if (/\.(mp4|webm)$/.test(filename)) {
      const url=await (published?publishedVideoURL(filename):signVideo(filename));
      return NextResponse.redirect(url,{status:307,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    }
    const storage=createAdminClient().storage.from(cmsMediaBucket);
    const width=Number(_request.nextUrl.searchParams.get('w'));
    const resized=[320,640,960,1280].includes(width)&&/\.(jpg|png|webp)$/.test(filename);
    if (/\.(jpg|png|webp|gif)$/.test(filename)) {
      const payload=await cachedMediaImage(`${cmsMediaBucket}:${filename}:${resized?width:'original'}`,async()=>{
        async function download(){
          const {data,error}=await storage.download(filename);
          if(error||!data)throw new MissingMedia('Media unavailable');
          return data;
        }
        if(resized){
          const resize=async()=>sharp(Buffer.from(await (await download()).arrayBuffer()),{limitInputPixels:40_000_000})
            .rotate().resize({width,withoutEnlargement:true}).webp({quality:78}).toBuffer();
          const bytes=await (published?publishedImageVariant(filename,width,resize):resize());
          return {bytes,type:'image/webp'};
        }
        const original=await download();
        return {bytes:Buffer.from(await original.arrayBuffer()),type:original.type||'application/octet-stream'};
      });
      const headers={'Content-Type':payload.type,'Cache-Control':published?'private, max-age=60, must-revalidate':'private, no-cache','ETag':payload.etag,'Vary':'Cookie','X-Content-Type-Options':'nosniff'};
      if(_request.headers.get('if-none-match')?.split(',').some(tag=>tag.trim().replace(/^W\//,'')===payload.etag))return new NextResponse(null,{status:304,headers});
      return new NextResponse(new Uint8Array(payload.bytes),{headers});
    }
    const {data,error}=await storage.download(filename);
    if(error||!data)return new NextResponse(null,{status:404});
    return new NextResponse(data,{headers:{'Content-Type':data.type||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch(error){return new NextResponse(null,{status:error instanceof MissingMedia?404:503,headers:{'Cache-Control':'no-store'}});}
}
