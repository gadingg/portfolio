import 'server-only';
import { createHash } from 'node:crypto';

type ImagePayload = { bytes: Uint8Array; type: string };
type CachedImage = ImagePayload & { etag: string };

export function createImageCache({ maxBytes = 32 * 1024 * 1024, maxEntries = 64, ttl = 300_000, now = Date.now } = {}) {
  const entries = new Map<string, { value: CachedImage; expires: number }>();
  const pending = new Map<string, Promise<CachedImage>>();
  let bytes = 0;
  function remove(key: string) {
    const entry = entries.get(key);
    if (entry) { bytes -= entry.value.bytes.byteLength; entries.delete(key); }
  }
  return async (key: string, load: () => Promise<ImagePayload>): Promise<CachedImage> => {
    const cached = entries.get(key);
    if (cached && cached.expires > now()) {
      entries.delete(key); entries.set(key, cached);
      return cached.value;
    }
    if (cached) remove(key);
    const current = pending.get(key);
    if (current) return current;
    const task = (async () => {
      const payload = await load();
      const value = { ...payload, etag: `"${createHash('sha256').update(payload.bytes).digest('base64url')}"` };
      if (payload.bytes.byteLength <= maxBytes) {
        for (const [id, entry] of entries) if (entry.expires <= now()) remove(id);
        while (entries.size && (entries.size >= maxEntries || bytes + payload.bytes.byteLength > maxBytes)) remove(entries.keys().next().value!);
        entries.set(key, { value, expires: now() + ttl }); bytes += payload.bytes.byteLength;
      }
      return value;
    })();
    // Bound retained in-flight references as well as completed image buffers.
    if (pending.size < 16) pending.set(key, task);
    try { return await task; }
    finally { if (pending.get(key) === task) pending.delete(key); }
  };
}

// Access checks belong in the route and must run before this cache is consulted.
export const cachedMediaImage = createImageCache();
