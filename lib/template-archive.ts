import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';

const base = '/api/admin/templates/portfo/';
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

export async function archivedTemplate(parts: string[]) {
  if (!parts.length || parts.some(part => !/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(part))) return null;
  const name = parts.join('/');
  if (name !== 'index.html' && !name.startsWith('assets/') && name !== 'styles/portfolio.css') return null;
  const type = mime[path.extname(name)];
  if (!type) return null;
  try {
    const bytes = await fs.readFile(path.join(process.cwd(), 'templates/portfo/source', ...parts));
    if (!['.html', '.css', '.js'].includes(path.extname(name))) return { body: bytes, type };
    let body = bytes.toString('utf8').replace(/(?:\.\/|\/)assets\//g, base + 'assets/');
    if (name === 'index.html') {
      body = body.replace(/<link[^>]+rel="preconnect"[^>]*>/g, '');
      body = body.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">');
      body = body.replace(/<body([^>]*)>/, '<body$1><aside style="position:relative;z-index:100;background:#10110f;color:#f3f0e8;padding:12px 20px;font:14px Arial,sans-serif;text-align:center">Arsip portfo · Template tidak aktif. <a href="/admintgadink/dashboard/templates" style="color:#ff9c76;text-decoration:underline">Kembali ke admin</a></aside>');
    }
    return { body, type };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}
