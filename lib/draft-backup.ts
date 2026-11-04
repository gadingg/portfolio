export type DraftBackup = { version: 1; revision: number; value: string; savedAt: string };

export function readDraftBackup(raw: string | null): DraftBackup | null {
  try {
    const backup = JSON.parse(raw || 'null');
    if (backup?.version !== 1 || !Number.isInteger(backup.revision) || backup.revision < 0 || typeof backup.value !== 'string' || typeof backup.savedAt !== 'string') return null;
    const value = JSON.parse(backup.value);
    if (!value || typeof value !== 'object') return null;
    return backup;
  } catch { return null; }
}

export function sameDraftContent(left: string, right: string) {
  const stable = (item: unknown): unknown => Array.isArray(item) ? item.map(stable) : item && typeof item === 'object'
    ? Object.fromEntries(Object.entries(item).filter(([key, value]) => key !== 'createdAt' && key !== 'updatedAt' && value !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, stable(value)])) : item;
  try { return JSON.stringify(stable(JSON.parse(left))) === JSON.stringify(stable(JSON.parse(right))); } catch { return false; }
}

export function draftSaveMessage(error: unknown) {
  if (error instanceof TypeError || error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)) return 'Koneksi ke server terputus. Periksa koneksi lalu coba lagi.';
  return error instanceof Error ? error.message : 'Perubahan belum tersimpan. Coba lagi.';
}

export function draftStatusCopy({ online, dirty, localCopy, saving, failed, storageFailed }: {
  online: boolean; dirty: boolean; localCopy: boolean; saving: boolean; failed: boolean; storageFailed: boolean;
}) {
  if (!online) return !dirty ? 'Offline · draft terakhir tersimpan' : localCopy ? 'Offline · tersimpan di perangkat' : 'Belum tersimpan. Jangan tutup halaman ini.';
  if (saving) return 'Menyimpan…';
  if (failed) return localCopy ? 'Belum tersimpan online. Edit masih ada di perangkat.' : 'Belum tersimpan. Jangan tutup halaman ini.';
  if (dirty) return storageFailed ? 'Menunggu disimpan. Jangan tutup halaman ini.' : 'Menunggu disimpan…';
  return 'Draft tersimpan';
}
