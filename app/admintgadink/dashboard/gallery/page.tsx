import React from 'react';
import { getGalleryItems } from '@/lib/db/gallery';
import { GalleryManager } from '@/components/admin/gallery/GalleryManager';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const items = await getGalleryItems();

  return <GalleryManager initialItems={items} />;
}
