const buckets = ['portfolio-cms-media', 'portfolio-public'];
export function validCleanupKey(key: string) {
  return /^(portfolio-cms-media|portfolio-public)\/(works|covers|content|gallery|general|cv)\/[a-zA-Z0-9/_. -]+\.(jpe?g|png|webp|gif|mp4|webm|pdf)$/i.test(key)
    && !key.includes('..') && !key.includes('//');
}
export function ownedMediaRefs(value: unknown, supabaseURL: string): string[] {
  const found = new Set<string>();
  let host = ''; try {host = new URL(supabaseURL).host;} catch {}
  function visit(value: unknown) {
    if (Array.isArray(value)) {value.forEach(visit); return;}
    if (value && typeof value === 'object') {Object.entries(value).filter(([key]) => key !== 'pendingMediaCleanup').forEach(([, value]) => visit(value)); return;}
    if (typeof value !== 'string') return;
    let text = value; try {text = decodeURIComponent(value);} catch {}
    for (const match of text.matchAll(/\/api\/media\/([a-zA-Z0-9/_.-]+\.(?:jpe?g|png|webp|gif|mp4|webm|pdf))/gi)) {
      const key = `portfolio-cms-media/${match[1]}`; if (validCleanupKey(key)) found.add(key);
    }
    for (const match of text.matchAll(/https:\/\/[^\s"'<>\)]+/g)) {
      try {
        const url = new URL(match[0]);
        if (!host || url.host !== host) continue;
        const path = url.pathname.replace(/^\/storage\/v1\/object\/(public|sign|authenticated)\//, '');
        const key = decodeURIComponent(path);
        if (validCleanupKey(key)) found.add(key);
      } catch {}
    }
    if (/^(works|covers|content|gallery|general|cv)\//.test(text)) for (const bucket of buckets) {
      const key = `${bucket}/${text}`; if (validCleanupKey(key)) found.add(key);
    }
  }
  visit(value); return [...found];
}
