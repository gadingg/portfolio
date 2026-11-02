import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin';
import {readCMS, writeCMS, type CMSDocument} from './cms';
import {initialWorks} from './works';
import {trashExpired, type WorksCollection} from '@/lib/work-trash';
import {ownedMediaRefs, validCleanupKey} from '@/lib/trash-media';

const backendURL = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
async function referenceSnapshot() {
  const client = createAdminClient();
  const tables = [
    ['portfolio_cms_documents', 'id,draft,published,revision'],
    ['portfolio_projects', 'cover_image_url'],
    ['portfolio_content_blocks', 'content_json'],
    ['portfolio_gallery', 'url'],
    ['portfolio_media', 'url,storage_path'],
  ];
  const results = await Promise.all(tables.map(async ([table, columns]) => {
    const rows: Record<string, unknown>[] = [];
    for (let offset = 0; offset < 10000; offset += 500) {
      const {data, error} = await client.from(table).select(columns).order('id').range(offset, offset + 499);
      if (error) throw Error('Referensi media belum bisa diperiksa.');
      rows.push(...(data || []) as unknown as Record<string, unknown>[]);
      if (!data || data.length < 500) return rows;
    }
    throw Error('Pemeriksaan referensi belum lengkap.');
  }));
  const docs = results[0] as {id: string; revision: number}[];
  return {refs: new Set(ownedMediaRefs(results, backendURL())),
    revisions: JSON.stringify(docs.map((doc: {id: string; revision: number}) => [doc.id, doc.revision]).sort())};
}
export async function cleanupWorkTrash(now = Date.now()) {
  let doc: CMSDocument<WorksCollection> = await readCMS<WorksCollection>('works', initialWorks);
  const expired = (doc.draft.trash || []).filter(entry => trashExpired(entry, now));
  if (expired.length) {
    const pendingMediaCleanup = [...new Set([...(doc.draft.pendingMediaCleanup || []), ...ownedMediaRefs(expired, backendURL())])];
    doc = await writeCMS('works', doc, {...doc.draft,
      trash: (doc.draft.trash || []).filter(entry => !trashExpired(entry, now)), pendingMediaCleanup}, doc.published);
  }
  const candidates = (doc.draft.pendingMediaCleanup || []).slice(0, 40);
  if (!candidates.length) return {purged: expired.length, removedMedia: 0, pendingMedia: 0};
  const snapshot = await referenceSnapshot();
  const remaining = new Set(doc.draft.pendingMediaCleanup);
  let removedMedia = 0;
  for (const key of candidates) {
    if (!validCleanupKey(key) || snapshot.refs.has(key)) {remaining.delete(key); continue;}
    // Defer the batch if any editor changed its references while cleanup ran.
    const current = await referenceSnapshot();
    if (current.revisions !== snapshot.revisions) break;
    if (current.refs.has(key)) {remaining.delete(key); continue;}
    const slash = key.indexOf('/'), bucket = key.slice(0, slash), path = key.slice(slash + 1);
    const {error} = await createAdminClient().storage.from(bucket).remove([path]);
    if (!error) {remaining.delete(key); removedMedia++;}
  }
  if (remaining.size !== (doc.draft.pendingMediaCleanup || []).length)
    await writeCMS('works', doc, {...doc.draft, pendingMediaCleanup: [...remaining]}, doc.published);
  return {purged: expired.length, removedMedia, pendingMedia: remaining.size};
}
