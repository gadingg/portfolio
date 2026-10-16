import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cmsAccess, cmsError } from '@/lib/cms-http';
import { getWorks, changeWorks } from '@/lib/db/works';
import { WorksDraftSchema } from '@/lib/works';

export async function GET() {
  const denied = await cmsAccess();
  if (denied) return denied;
  try {
    return NextResponse.json(await getWorks(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Karya belum bisa dimuat. Coba lagi.' },
      { status: 503 },
    );
  }
}
export async function PUT(request: NextRequest) {
  const denied = await cmsAccess(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const input = z
      .object({
        action: z.enum(['save', 'publish', 'order']).default('save'),
        revision: z.number().int().min(0),
        ids: z.array(z.string()).max(150).optional(),
      })
      .parse(body);
    const items =
      body.items === undefined ? undefined : WorksDraftSchema.parse(body).items;
    const doc = await changeWorks({ ...input, items });
    return NextResponse.json({
      items: doc.draft.items,
      published: doc.published.items,
      revision: doc.revision,
      initialized: true,
      published_at: doc.published_at,
    });
  } catch (error) {
    return cmsError(error);
  }
}
