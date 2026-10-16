import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cmsAccess, cmsError } from '@/lib/cms-http';
import { getSiteDocument } from '@/lib/db/site';
import { writeCMS, CMSConflict } from '@/lib/db/cms';
import { SiteSchema } from '@/lib/site';
export const dynamic = 'force-dynamic';
export async function GET() {
  const denied = await cmsAccess();
  if (denied) return denied;
  try {
    return NextResponse.json(await getSiteDocument(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return cmsError(error);
  }
}
export async function PUT(request: NextRequest) {
  const denied = await cmsAccess(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const input = z
      .object({
        revision: z.number().int().min(0),
        action: z.enum(['save', 'publish']),
      })
      .parse(body);
    const draft = SiteSchema.parse(body.content);
    const current = await getSiteDocument();
    if (current.revision !== input.revision) throw new CMSConflict();
    return NextResponse.json(
      await writeCMS(
        'site',
        current,
        draft,
        input.action === 'publish' ? draft : current.published,
      ),
    );
  } catch (error) {
    return cmsError(error);
  }
}
