import { NextResponse } from 'next/server';
import { getPublicWorks } from '@/lib/db/works';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = (await getPublicWorks()).items.filter(item=>item.kind==='design').map((item,index)=>({id:item.id,url:item.image,alt:item.imageAlt,caption:item.title,category:'Visual Design',display_order:index+1}));
    return NextResponse.json(
      { items },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to fetch gallery items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery items', items: [] },
      { status: 500 }
    );
  }
}
