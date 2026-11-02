import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {cmsAccess, cmsError} from '@/lib/cms-http';
import {changeWorkTrash} from '@/lib/db/works';
import {WorkDraftItemSchema} from '@/lib/works';

export async function POST(request: NextRequest) {
  const denied = await cmsAccess(request); if (denied) return denied;
  try {
    const input = z.object({action: z.enum(['move', 'restore']), id: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
      revision: z.number().int().min(0), item: WorkDraftItemSchema.optional()}).parse(await request.json());
    const doc = await changeWorkTrash(input);
    return NextResponse.json({items: doc.draft.items, published: doc.published.items, revision: doc.revision, trash: doc.draft.trash || []},
      {headers: {'Cache-Control': 'no-store'}});
  } catch (error) { return cmsError(error); }
}
