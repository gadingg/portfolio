import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { unstable_noStore as noStore } from 'next/cache';

export class CMSConflict extends Error {
  constructor() {
    super('Data berubah di sesi lain. Muat ulang sebelum menyimpan.');
  }
}
export type CMSDocument<T> = {
  draft: T;
  published: T;
  revision: number;
  published_at: string | null;
  updated_at?: string;
};

export async function readCMS<T>(
  id: 'works' | 'site',
  initial: () => Promise<T>,
): Promise<CMSDocument<T>> {
  const { data, error } = await createAdminClient()
    .from('portfolio_cms_documents')
    .select('draft,published,revision,published_at,updated_at')
    .eq('id', id)
    .maybeSingle();
  if (error)
    throw new Error(
      'Penyimpanan CMS belum tersedia. Periksa migrasi database dan koneksi server.',
    );
  if (data) return data as CMSDocument<T>;
  const content = await initial();
  return {
    draft: structuredClone(content),
    published: content,
    revision: 0,
    published_at: null,
  };
}

export async function writeCMS<T>(
  id: 'works' | 'site',
  current: CMSDocument<T>,
  draft: T,
  published: T = current.published,
): Promise<CMSDocument<T>> {
  const client = createAdminClient();
  const now = new Date().toISOString();
  const row = {
    draft,
    published,
    revision: current.revision + 1,
    updated_at: now,
    published_at:
      JSON.stringify(published) !== JSON.stringify(current.published)
        ? now
        : current.published_at,
  };
  const query =
    current.revision === 0
      ? client.from('portfolio_cms_documents').insert({ id, ...row })
      : client
          .from('portfolio_cms_documents')
          .update(row)
          .eq('id', id)
          .eq('revision', current.revision);
  const { data, error } = await query
    .select('draft,published,revision,published_at,updated_at')
    .maybeSingle();
  if (error?.code === '23505' || (!error && !data)) throw new CMSConflict();
  if (error) throw new Error('Perubahan belum tersimpan. Coba lagi.');
  return data as CMSDocument<T>;
}

export async function readPublishedCMS<T>(
  id: 'works' | 'site',
  initial: () => Promise<T>,
): Promise<T> {
  noStore();
  const { data, error } = await createAdminClient()
    .from('portfolio_cms_documents')
    .select('published')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('Konten belum bisa dimuat.');
  return data ? (data.published as T) : initial();
}
