import { NextResponse } from 'next/server';
import { getGalleryItems } from '@/lib/db/gallery';

export const revalidate = 60;

export async function GET() {
  try {
    const items = await getGalleryItems();
    return NextResponse.json(
      { items },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
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
