import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(['general', 'covers', 'content', 'gallery']);
const ALLOWED_MEDIA_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['video/mp4', 'mp4'],
  ['video/webm', 'webm'],
]);

function hasValidSignature(bytes: Uint8Array, mimeType: string): boolean {
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  const ascii = (start: number, value: string) =>
    value.split('').every((character, index) => bytes[start + index] === character.charCodeAt(0));

  switch (mimeType) {
    case 'image/jpeg':
      return startsWith(0xff, 0xd8, 0xff);
    case 'image/png':
      return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case 'image/webp':
      return ascii(0, 'RIFF') && ascii(8, 'WEBP');
    case 'image/gif':
      return ascii(0, 'GIF87a') || ascii(0, 'GIF89a');
    case 'video/mp4':
      return ascii(4, 'ftyp');
    case 'video/webm':
      return startsWith(0x1a, 0x45, 0xdf, 0xa3);
    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const fileEntry = formData.get('file');
    const folderEntry = formData.get('folder');
    const folder = typeof folderEntry === 'string' && folderEntry ? folderEntry : 'general';

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 });
    }

    if (fileEntry.size === 0 || fileEntry.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File must be between 1 byte and 10MB' }, { status: 400 });
    }

    const fileExtension = ALLOWED_MEDIA_TYPES.get(fileEntry.type);
    if (!fileExtension) {
      return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, WebP, GIF, MP4, or WebM.' }, { status: 400 });
    }

    const arrayBuffer = await fileEntry.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    if (!hasValidSignature(bytes, fileEntry.type)) {
      return NextResponse.json({ error: 'File contents do not match the declared media type' }, { status: 400 });
    }

    const cleanFileName = `${Date.now()}-${randomUUID()}.${fileExtension}`;
    const storagePath = `${folder}/${cleanFileName}`;
    const buffer = Buffer.from(arrayBuffer);

    const supabase = createAdminClient();
    const { error: uploadError } = await supabase.storage
      .from('portfolio-public')
      .upload(storagePath, buffer, {
        contentType: fileEntry.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('portfolio-public')
      .getPublicUrl(storagePath);

    if (!publicUrlData?.publicUrl) throw new Error('Storage did not return a public URL.');

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      storage_path: storagePath,
      filename: fileEntry.name,
    });
  } catch (error: any) {
    console.error('Upload processing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload media' }, { status: 500 });
  }
}
