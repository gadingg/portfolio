import { VisualArchiveItem } from '@/types/portfolio';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPublicClient } from '@/lib/supabase/public';

export async function getGalleryItems(): Promise<VisualArchiveItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('portfolio_gallery')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Unable to load gallery: ${error.message}`);
  return (data || []) as VisualArchiveItem[];
}

export async function getPublicGalleryItems(): Promise<VisualArchiveItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('portfolio_gallery')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw new Error(`Unable to load gallery: ${error.message}`);
  return (data || []) as VisualArchiveItem[];
}

export async function saveGalleryItems(
  items: VisualArchiveItem[]
): Promise<{ success: boolean; data?: VisualArchiveItem[]; error?: string }> {
  try {
    const normalized = items.map((item, index) => ({
      id: item.id,
      url: item.url,
      alt: item.alt,
      caption: item.caption || '',
      category: item.category || 'Visual',
      display_order: index + 1,
    }));
    const supabase = createAdminClient();
    const { error } = await supabase.rpc('replace_portfolio_gallery', { gallery_data: normalized });
    if (error) throw error;
    return { success: true, data: normalized };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save gallery items',
    };
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
    const result = await saveGalleryItems(updated);
    if (!result.success) throw new Error(result.error);
    return { success: true, data: newItem };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add gallery item' };
  }
}

export async function deleteGalleryItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getGalleryItems();
    const filtered = current.filter((item) => item.id !== id);
    const result = await saveGalleryItems(filtered);
    if (!result.success) throw new Error(result.error);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete gallery item' };
  }
}
