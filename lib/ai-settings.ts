import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { createAdminClient } from './supabase/admin';

export const aiModelSchema = z.string().trim().regex(/^gemini-[a-z0-9.-]{1,70}$/, 'Isi ID model Gemini yang valid.');
export const defaultAIModel = 'gemini-3.8-flash';
const path = 'settings/gemini.json';
export const aiSettingsBucket = 'portfolio-ai-settings';
const storedSchema = z.object({ version: z.literal(1), model: aiModelSchema, secret: z.string().max(3000).nullable(), updatedAt: z.string() });
export type AISettings = { model: string; apiKey: string; updatedAt: string };
function encryptionKey() {
  const secret = process.env.CMS_AI_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw Error('Kunci enkripsi server belum tersedia.');
  return createHash('sha256').update('gading-portfolio:gemini-settings:v1:').update(secret).digest();
}
export function encryptAIKey(value: string): string {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  cipher.setAAD(Buffer.from('portfolio-ai-key:v1'));
  const ciphertext = Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),ciphertext]).toString('base64');
}
export function decryptAIKey(value: string): string {
  try {
    const bytes = Buffer.from(value,'base64');
    if (bytes.length < 29) throw Error();
    const cipher = createDecipheriv('aes-256-gcm',encryptionKey(),bytes.subarray(0,12));
    cipher.setAAD(Buffer.from('portfolio-ai-key:v1')); cipher.setAuthTag(bytes.subarray(12,28));
    return Buffer.concat([cipher.update(bytes.subarray(28)),cipher.final()]).toString('utf8');
  } catch { throw Error('API key tersimpan belum bisa dibaca. Simpan ulang key melalui Pengaturan AI.'); }
}
async function readStoredAISettings() {
  const { data,error } = await createAdminClient().storage.from(aiSettingsBucket).download(path);
  if (error) {
    const code = String((error as { statusCode?: string }).statusCode || '');
    if (['400','404'].includes(code) && /not found|does not exist/i.test(error.message)) return { version:1 as const, model: defaultAIModel, secret: null, updatedAt: '' };
    throw Error('Pengaturan AI belum bisa dimuat. Periksa koneksi penyimpanan.');
  }
  const stored = storedSchema.safeParse(JSON.parse(await data.text()));
  if (!stored.success) throw Error('Pengaturan AI tidak valid. Periksa penyimpanan server.');
  return stored.data;
}
export async function getAISettings(): Promise<AISettings> {
  const stored=await readStoredAISettings();
  return { model: stored.model, apiKey: stored.secret ? decryptAIKey(stored.secret) : '', updatedAt: stored.updatedAt };
}
export async function getAISettingsStatus() {
  const stored=await readStoredAISettings();
  return { configured:!!stored.secret, model:stored.model, updatedAt:stored.updatedAt };
}
export function publicAISettings(settings: AISettings) { return { configured: !!settings.apiKey, model: settings.model, updatedAt: settings.updatedAt }; }
export async function saveAISettings(settings: Pick<AISettings,'model'|'apiKey'>) {
  const stored = { version: 1, model: aiModelSchema.parse(settings.model), secret: settings.apiKey ? encryptAIKey(settings.apiKey) : null, updatedAt: new Date().toISOString() };
  const storage = createAdminClient().storage;
  let bucket = await storage.getBucket(aiSettingsBucket);
  if (bucket.error) {
    const code = String((bucket.error as { statusCode?: string }).statusCode || '');
    if (!['400','404'].includes(code) || !/not found|does not exist/i.test(bucket.error.message)) throw Error('Penyimpanan pengaturan AI belum tersedia.');
    const created = await storage.createBucket(aiSettingsBucket,{public:false,fileSizeLimit:16384,allowedMimeTypes:['application/json']});
    if (created.error && !/already exists/i.test(created.error.message)) throw Error('Penyimpanan privat AI belum bisa dibuat.');
    bucket = await storage.getBucket(aiSettingsBucket);
  }
  if (bucket.error || !bucket.data || bucket.data.public) throw Error('Penyimpanan API key harus privat. Periksa konfigurasi server.');
  const { error } = await storage.from(aiSettingsBucket).upload(path, Buffer.from(JSON.stringify(stored)), { upsert: true, contentType: 'application/json', cacheControl: '0' });
  if (error) throw Error('Pengaturan AI belum tersimpan. Coba lagi.');
  return publicAISettings({ ...settings, updatedAt: stored.updatedAt });
}
