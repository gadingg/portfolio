import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { getWorks, saveWorks } from '@/lib/db/works';
import { WorksSchema } from '@/lib/works';

export async function GET() {
  if (!await verifyAdminSession()) return NextResponse.json({error:'Unauthorized'},{status:401});
  try { return NextResponse.json(await getWorks(),{headers:{'Cache-Control':'no-store'}}); }
  catch { return NextResponse.json({error:'Karya belum bisa dimuat. Coba lagi.'},{status:503}); }
}
export async function PUT(request:NextRequest) {
  if (!await verifyAdminSession()) return NextResponse.json({error:'Unauthorized'},{status:401});
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({error:'Invalid origin'},{status:403});
  try {
    const body = await request.json();
    const parsed = WorksSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({error:parsed.error.issues.map(issue=>issue.message).join(' ')},{status:400});
    const current = await getWorks();
    if (body.revision !== current.revision) return NextResponse.json({error:'Koleksi berubah di sesi lain. Muat ulang halaman sebelum menyimpan.'},{status:409});
    return NextResponse.json(await saveWorks(parsed.data.items));
  } catch { return NextResponse.json({error:'Perubahan belum tersimpan. Coba lagi.'},{status:503}); }
}
