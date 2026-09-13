import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import {
  getGalleryItems,
  saveGalleryItems,
  addGalleryItem,
  deleteGalleryItem,
} from '@/lib/db/gallery';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const items = await getGalleryItems();
    return NextResponse.json({ items }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to get admin gallery:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gallery items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, items, item, id } = body;

    if (action === 'delete' && id) {
      const res = await deleteGalleryItem(id);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      const updated = await getGalleryItems();
      return NextResponse.json({ success: true, items: updated });
    }

    if (action === 'add' && item) {
      const res = await addGalleryItem({
        url: item.url,
        alt: item.alt || 'Archive image',
        caption: item.caption || '',
        category: item.category || 'Visual',
      });
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      const updated = await getGalleryItems();
      return NextResponse.json({ success: true, items: updated });
    }

    if (Array.isArray(items)) {
      const res = await saveGalleryItems(items);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, items: res.data });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to update gallery:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update gallery' },
      { status: 500 }
    );
  }
}
