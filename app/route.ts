import { withInitialWorks } from '@/lib/work-card-html';
import { NextResponse } from 'next/server';
import { getPublicSite,renderHomepage } from '@/lib/db/site';
import { getPublicWorks } from '@/lib/db/works';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [site,works]=await Promise.all([getPublicSite(),getPublicWorks()]);
    const html=await renderHomepage(site,works.items.filter(item=>item.caseStudy).flatMap(item=>[item.caseStudy!.slug,...(item.aliases||[])]));
    return new NextResponse(withInitialWorks(html,works.items), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Failed to load main portfolio index.html:', error);
    return new NextResponse('Portfolio belum bisa dimuat. Coba lagi.', { status: 503 });
  }
}
