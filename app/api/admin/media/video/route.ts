import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cmsAccess, cmsError } from '@/lib/cms-http';
import { createAdminClient } from '@/lib/supabase/admin';
import { cmsMediaBucket } from '@/lib/cms-media';
export const dynamic = 'force-dynamic';
const limit = 40 * 1024 * 1024;
export async function POST(request: NextRequest) {
  const denied = await cmsAccess(request, 4096);
  if (denied) return denied;
  try {
    const input = await request.json();
    const client = createAdminClient(), storage = client.storage.from(cmsMediaBucket);
    if (input.action === 'complete') {
      if (typeof input.path !== 'string' || !/^video-staging\/[0-9]+-[0-9a-f-]{36}\.(mp4|webm)$/.test(input.path)) return NextResponse.json({error:'File tidak valid.'},{status:400});
      const signed = await storage.createSignedUrl(input.path, 60);
      if (signed.error) throw signed.error;
      const response = await fetch(signed.data.signedUrl, {headers:{Range:'bytes=0-15'}, signal:AbortSignal.timeout(15000)});
      const size = Number(response.headers.get('content-range')?.split('/')[1]);
      if (response.status !== 206 || !size || size > limit) { await response.body?.cancel(); throw Error('Video belum siap atau melebihi 40 MB.'); }
      const bytes = new Uint8Array(await response.arrayBuffer());
      const valid = input.path.endsWith('.mp4') ? String.fromCharCode(...bytes.slice(4,8)) === 'ftyp' : [26,69,223,163].every((value,index)=>bytes[index]===value);
      if (!valid) { await storage.remove([input.path]); return NextResponse.json({error:'Isi file bukan video MP4 / WebM.'},{status:400}); }
      const destination = input.path.replace('video-staging/', 'works/');
      const moved = await storage.move(input.path, destination);
      if (moved.error) throw moved.error;
      return NextResponse.json({url:`/api/media/${destination}`,filename:typeof input.filename==='string'?input.filename.slice(0,250):'Video',type:destination.endsWith('.mp4')?'video/mp4':'video/webm'});
    }
    if (input.action !== 'sign' || !['video/mp4','video/webm'].includes(input.type) || !Number.isInteger(input.size) || input.size < 1 || input.size > limit) return NextResponse.json({error:'Pilih video MP4 / WebM maksimal 40 MB.'},{status:400});
    const bucket = await client.storage.getBucket(cmsMediaBucket);
    if (bucket.error) throw bucket.error;
    if (Number(bucket.data.file_size_limit || 0) && Number(bucket.data.file_size_limit) < limit) {
      const updated = await client.storage.updateBucket(cmsMediaBucket, {public:false,fileSizeLimit:limit,allowedMimeTypes:bucket.data.allowed_mime_types || undefined});
      if (updated.error) throw updated.error;
    }
    const path = `video-staging/${Date.now()}-${randomUUID()}.${input.type==='video/mp4'?'mp4':'webm'}`;
    const signed = await storage.createSignedUploadUrl(path);
    if (signed.error) throw signed.error;
    return NextResponse.json({path,signedUrl:signed.data.signedUrl},{headers:{'Cache-Control':'no-store'}});
  } catch(error) { return cmsError(error); }
}
