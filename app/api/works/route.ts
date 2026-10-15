import { NextResponse } from 'next/server';
import { getWorks } from '@/lib/db/works';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const {items} = await getWorks();
    return NextResponse.json({items:items.filter(item=>item.published)}, {headers:{'Cache-Control':'no-store'}});
  } catch {
    return NextResponse.json({error:'Karya belum bisa dimuat.'},{status:503});
  }
}
