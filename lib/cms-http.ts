import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { CMSConflict } from '@/lib/db/cms';
import { ZodError } from 'zod';

export function sameOrigin(request: NextRequest) {
  try {
    const origin = new URL(request.headers.get('origin') || '');
    if (
      origin.username ||
      origin.password ||
      origin.pathname !== '/' ||
      origin.search ||
      origin.hash
    )
      return false;
    const target = new URL(request.nextUrl.origin);
    for (const value of [origin, target])
      if (['127.0.0.1', '[::1]'].includes(value.hostname))
        value.hostname = 'localhost';
    return origin.origin === target.origin;
  } catch {
    return false;
  }
}

export async function cmsAccess(
  request?: NextRequest,
  maxBytes = 2 * 1024 * 1024,
) {
  if (!(await verifyAdminSession()))
    return NextResponse.json(
      { error: 'Silakan masuk kembali.' },
      { status: 401 },
    );
  if (request && !sameOrigin(request))
    return NextResponse.json(
      { error: 'Permintaan tidak diizinkan.' },
      { status: 403 },
    );
  if (request && Number(request.headers.get('content-length') || 0) > maxBytes)
    return NextResponse.json(
      { error: 'Konten terlalu besar.' },
      { status: 413 },
    );
  return null;
}
export function cmsError(error: unknown) {
  if (error instanceof CMSConflict)
    return NextResponse.json({ error: error.message }, { status: 409 });
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues[0]?.message || 'Periksa isian Anda.' },
      { status: 400 },
    );
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: 'Format data tidak valid.' },
      { status: 400 },
    );
  console.error('CMS request failed:', error);
  return NextResponse.json(
    {
      error:
        error instanceof Error ? error.message : 'Perubahan belum tersimpan.',
    },
    { status: 503 },
  );
}
