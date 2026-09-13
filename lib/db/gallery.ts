import fs from 'fs';
import path from 'path';
import { VisualArchiveItem } from '@/types/portfolio';
import { createAdminClient } from '@/lib/supabase/admin';

const GALLERY_FILE = path.join(process.cwd(), 'data', 'gallery.json');

const DEFAULT_GALLERY: VisualArchiveItem[] = [
  {
    id: 'gallery-01',
    url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
    alt: 'Archive fragment 01',
    caption: 'Minimalist monochrome aesthetic study',
    category: 'Visual Identity',
    display_order: 1,
  },
  {
    id: 'gallery-02',
    url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg',
    alt: 'Archive fragment 02',
    caption: 'Editorial design composition',
    category: 'Editorial',
    display_order: 2,
  },
  {
    id: 'gallery-03',
    url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg',
    alt: 'Archive fragment 03',
    caption: 'High-contrast typographic structure',
    category: 'Typography',
    display_order: 3,
  },
  {
    id: 'gallery-04',
    url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
    alt: 'Archive fragment 04',
    caption: 'Conceptual motion framing',
    category: 'Motion Experiment',
    display_order: 4,
  },
  {
    id: 'gallery-05',
    url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg',
    alt: 'Archive fragment 05',
    caption: 'Digital layout fragment',
    category: 'Interface Art',
    display_order: 5,
  },
];

function readLocalGallery(): VisualArchiveItem[] {
  try {
    if (!fs.existsSync(GALLERY_FILE)) {
      const dir = path.dirname(GALLERY_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(GALLERY_FILE, JSON.stringify(DEFAULT_GALLERY, null, 2), 'utf-8');
      return DEFAULT_GALLERY;
    }
    const content = fs.readFileSync(GALLERY_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }
    return DEFAULT_GALLERY;
  } catch (err) {
    console.error('Failed to read local gallery file:', err);
    return DEFAULT_GALLERY;
  }
}

function writeLocalGallery(items: VisualArchiveItem[]): void {
  try {
    const dir = path.dirname(GALLERY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local gallery file:', err);
  }
}

export async function getGalleryItems(): Promise<VisualArchiveItem[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('portfolio_gallery')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as VisualArchiveItem[];
    }
  } catch {
    // Supabase unavailable, use local persistence
  }

  return readLocalGallery();
}

export async function saveGalleryItems(
  items: VisualArchiveItem[]
): Promise<{ success: boolean; data?: VisualArchiveItem[]; error?: string }> {
  try {
    // Normalize display_order
    const normalized = items.map((item, idx) => ({
      ...item,
      display_order: idx + 1,
    }));

    // Save to local file
    writeLocalGallery(normalized);

    // Sync to Supabase if table exists
    try {
      const supabase = createAdminClient();
      await supabase.from('portfolio_gallery').delete().neq('id', '0');
      if (normalized.length > 0) {
        await supabase.from('portfolio_gallery').insert(normalized);
      }
    } catch {
      // Ignore Supabase errors in local fallback mode
    }

    return { success: true, data: normalized };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save gallery items' };
  }
}

export async function addGalleryItem(
  item: Omit<VisualArchiveItem, 'id' | 'display_order'>
): Promise<{ success: boolean; data?: VisualArchiveItem; error?: string }> {
  try {
    const current = await getGalleryItems();
    const newItem: VisualArchiveItem = {
      ...item,
      id: `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      display_order: current.length + 1,
    };
    const updated = [...current, newItem];
    await saveGalleryItems(updated);
    return { success: true, data: newItem };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add gallery item' };
  }
}

export async function deleteGalleryItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getGalleryItems();
    const filtered = current.filter((item) => item.id !== id);
    await saveGalleryItems(filtered);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete gallery item' };
  }
}
