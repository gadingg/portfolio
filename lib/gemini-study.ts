import 'server-only';
import { AIStudySchema, aiStudyInstruction, aiStudyJSONSchema, normalizeAIStudy, looksLikePreparedStudy, parsePreparedStudy, type AIStudy, type AITarget } from './ai-study';
import { getAISettings, type AISettings } from './ai-settings';

export class AIProviderError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}
async function callGemini(settings: Pick<AISettings,'model'|'apiKey'>, body: unknown, timeout = 45000) {
  if (!settings.apiKey) throw new AIProviderError('Tambahkan Gemini API key di Pengaturan AI terlebih dahulu.', 400);
  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent`, {
      method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': settings.apiKey }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeout),
    });
  } catch { throw new AIProviderError('Gemini belum merespons. Catatan Anda tetap aman; coba lagi sebentar.'); }
  if (!response.ok) {
    await response.body?.cancel();
    if ([400,401,403].includes(response.status)) throw new AIProviderError('API key atau konfigurasi Gemini belum diterima. Periksa key, izin model, dan pengaturan API.', 400);
    if (response.status === 404) throw new AIProviderError('Model tidak tersedia untuk API key ini. Ganti ID model di Pengaturan AI.', 400);
    if (response.status === 429) throw new AIProviderError('Kuota atau batas permintaan Gemini tercapai. Tunggu sebentar atau periksa kuota API Anda.', 429);
    throw new AIProviderError('Gemini sedang belum tersedia. Coba lagi sebentar.');
  }
  let value: any;
  try { const text = await response.text(); if (text.length > 150000) throw Error(); value = JSON.parse(text); }
  catch { throw new AIProviderError('Respons Gemini belum bisa dibaca. Coba generate ulang.'); }
  const candidate = value.candidates?.[0];
  if (candidate?.finishReason !== 'STOP') throw new AIProviderError('Gemini belum menghasilkan draft lengkap. Coba ringkas brief atau generate ulang.');
  const text = candidate.content?.parts?.filter((part: any) => !part.thought && typeof part.text === 'string').map((part: any) => part.text).join('');
  if (!text) throw new AIProviderError('Gemini belum menghasilkan teks. Coba perjelas brief Anda.');
  return text as string;
}
export async function testGemini(settings: Pick<AISettings,'model'|'apiKey'>) {
  await callGemini(settings, { contents: [{ role:'user', parts:[{text:'Reply only with OK.'}] }], generationConfig:{ maxOutputTokens:2048 } }, 20000);
}
export async function generateAIStudy(brief: string, target: AITarget, current?: AIStudy) {
  if (target !== 'all' && !current) throw new AIProviderError('Generate draft lengkap sebelum merevisi satu bagian.', 400);
  if (target.startsWith('section:') && !current?.sections[Number(target.split(':')[1])]) throw new AIProviderError('Bagian yang dipilih tidak ditemukan.',400);
  if (target === 'all' && looksLikePreparedStudy(brief)) {
    try { return { result: parsePreparedStudy(brief), model: 'import' }; }
    catch { throw new AIProviderError('Ringkasan belum sesuai format. Salin ulang JSON lengkap dari Copy Prompt.', 400); }
  }
  const settings = await getAISettings();
  const text = await callGemini(settings, {
    systemInstruction: { parts: [{ text: aiStudyInstruction }] },
    contents: [{ role:'user', parts:[{ text: JSON.stringify({ sourceNotes:brief, target, current: current && AIStudySchema.parse(current) }) }] }],
    generationConfig: { temperature:0.15, maxOutputTokens:10000, responseFormat:{text:{mimeType:'APPLICATION_JSON',schema:aiStudyJSONSchema}} },
  });
  try { return { result: normalizeAIStudy(JSON.parse(text)), model:settings.model }; }
  catch { throw new AIProviderError('Susunan hasil AI belum sesuai template. Hasil sebelumnya tetap aman; coba generate ulang.'); }
}
