import {NextRequest, NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {cleanupWorkTrash} from '@/lib/db/trash-cleanup';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const actual = Buffer.from(request.headers.get('authorization') || '');
  const expected = Buffer.from(`Bearer ${secret || ''}`);
  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return NextResponse.json({error:'Unauthorized'}, {status:401, headers:{'Cache-Control':'no-store'}});
  try {return NextResponse.json(await cleanupWorkTrash(), {headers:{'Cache-Control':'no-store'}});}
  catch {return NextResponse.json({error:'Pembersihan belum selesai. Akan dicoba pada jadwal berikutnya.'}, {status:503, headers:{'Cache-Control':'no-store'}});}
}
