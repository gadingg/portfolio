import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'public', 'index.html'),
      path.resolve(process.cwd(), '.next', 'server', 'public', 'index.html'),
    ];

    let html = '';
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        html = fs.readFileSync(p, 'utf-8');
        break;
      }
    }

    if (!html) {
      throw new Error('index.html not found in any candidate paths: ' + candidatePaths.join(', '));
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Failed to load main portfolio index.html:', error);
    return new NextResponse('Portfolio page loading error: ' + error.message, { status: 500 });
  }
}
