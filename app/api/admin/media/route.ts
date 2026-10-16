import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cmsAccess, cmsError } from '@/lib/cms-http';
import { createAdminClient } from '@/lib/supabase/admin';
import { cmsMediaBucket } from '@/lib/cms-media';
export const dynamic = 'force-dynamic';
const mediaFolders = [
  'works',
  'covers',
  'content',
  'gallery',
  'general',
  'cv',
] as const;
const types: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'application/pdf': 'pdf',
};
function validMedia(bytes: Uint8Array, type: string) {
  const ascii = (offset: number, text: string) =>
    [...text].every((c, i) => bytes[offset + i] === c.charCodeAt(0));
  switch (type) {
    case 'image/jpeg':
      return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    case 'image/png':
      return [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b);
    case 'image/gif':
      return ascii(0, 'GIF87a') || ascii(0, 'GIF89a');
    case 'image/webp':
      return ascii(0, 'RIFF') && ascii(8, 'WEBP');
    case 'video/mp4':
      return ascii(4, 'ftyp');
    case 'video/webm':
      return [26, 69, 223, 163].every((b, i) => bytes[i] === b);
    case 'application/pdf':
      return ascii(0, '%PDF-');
    default:
      return false;
  }
}
export async function GET(request: NextRequest) {
  const denied = await cmsAccess();
  if (denied) return denied;
  try {
    const folder = request.nextUrl.searchParams.get('folder') || 'all';
    if (
      folder !== 'all' &&
      !mediaFolders.includes(folder as (typeof mediaFolders)[number])
    )
      return NextResponse.json(
        { error: 'Folder tidak valid.' },
        { status: 400 },
      );
    const offset = Number(request.nextUrl.searchParams.get('offset') || 0);
    if (!Number.isInteger(offset) || offset < 0 || offset > 100000)
      return NextResponse.json(
        { error: 'Halaman tidak valid.' },
        { status: 400 },
      );
    const client=createAdminClient();
    const results = await Promise.all(
      [cmsMediaBucket,'portfolio-public'].flatMap(bucket=>(folder === 'all' ? mediaFolders : [folder]).map(async (prefix) => {
        const storage=client.storage.from(bucket);
        const { data, error } = await storage.list(prefix, {
          limit: 50,
          offset,
          sortBy: { column: 'created_at', order: 'desc' },
        });
        if (error) throw error;
        return {
          more: data.length === 50,
          items: data
            .filter(
              (file) =>
                file.id &&
                /\.(jpe?g|png|webp|gif|mp4|webm|pdf)$/i.test(file.name),
            )
            .map((file) => ({
              id: `${bucket}/${prefix}/${file.name}`,
              name: file.name,
              url:bucket===cmsMediaBucket?`/api/media/${prefix}/${file.name}`:storage.getPublicUrl(`${prefix}/${file.name}`).data.publicUrl,
              type: file.metadata?.mimetype || '',
              created_at: file.created_at,
              source: 'storage',
            })),
        };
      })),
    );
    const uploads = results
      .flatMap((result) => result.items)
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return NextResponse.json(
      {
        uploads,
        all: uploads,
        presets: [],
        hasMore: results.some((result) => result.more),
        nextOffset: offset + 50,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return cmsError(error);
  }
}
export async function POST(request: NextRequest) {
  const denied = await cmsAccess(request, 4.4 * 1024 * 1024);
  if (denied) return denied;
  try {
    const form = await request.formData(),
      file = form.get('file'),
      folder = form.get('folder') || 'works';
    if (
      typeof folder !== 'string' ||
      !mediaFolders.includes(folder as (typeof mediaFolders)[number])
    )
      return NextResponse.json(
        { error: 'Folder tidak valid.' },
        { status: 400 },
      );
    if (!(file instanceof File) || !file.size || file.size > 4 * 1024 * 1024)
      return NextResponse.json(
        { error: 'Pilih file maksimal 4 MB.' },
        { status: 400 },
      );
    if (
      !types[file.type] ||
      (folder === 'cv' && file.type !== 'application/pdf')
    )
      return NextResponse.json(
        { error: 'Format file tidak didukung.' },
        { status: 400 },
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validMedia(bytes, file.type))
      return NextResponse.json(
        { error: 'Isi file tidak sesuai formatnya.' },
        { status: 400 },
      );
    const storage = createAdminClient().storage.from(cmsMediaBucket);
    const storage_path = `${folder}/${Date.now()}-${randomUUID()}.${types[file.type]}`;
    const { error } = await storage.upload(storage_path, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    return NextResponse.json({
      url: `/api/media/${storage_path}`,
      bucket:cmsMediaBucket,
      storage_path,
      filename: file.name,
      type: file.type,
    });
  } catch (error) {
    return cmsError(error);
  }
}
