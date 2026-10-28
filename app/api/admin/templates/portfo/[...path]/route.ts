import { NextRequest, NextResponse } from 'next/server';
import { cmsAccess, cmsError } from '@/lib/cms-http';
import { archivedTemplate } from '@/lib/template-archive';

export const dynamic = 'force-dynamic';
export async function GET(_request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const denied = await cmsAccess();
  if (denied) return denied;
  try {
    const template = await archivedTemplate((await context.params).path);
    if (!template) return new NextResponse('Template tidak ditemukan.', { status: 404 });
    return new NextResponse(template.body, { headers: {
      'Content-Type': template.type,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https://*.supabase.co; media-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    } });
  } catch (error) { return cmsError(error); }
}
