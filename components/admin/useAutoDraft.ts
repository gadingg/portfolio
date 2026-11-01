'use client';

import { useEffect, useRef, useState } from 'react';
import { readDraftBackup, sameDraftContent, draftStatusCopy, type DraftBackup } from '@/lib/draft-backup';
import { useRegisterAdminDirty } from './AdminChanges';

export function useAutoDraft({ storageKey, value, baseline, revision, enabled, blocked, saving, save, restore, ask }: {
  storageKey: string; value: string; baseline: string; revision: number | null;
  enabled: boolean; blocked: boolean; saving: boolean;
  save: () => Promise<boolean>; restore: (value: string) => void;
  ask: (message: string, confirmLabel?: string) => Promise<boolean>;
}) {
  const [online, setOnline] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [recovery, setRecovery] = useState<DraftBackup | null>(null);
  const [failedValue, setFailedValue] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState<string | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const unsafe = useRef(false);
  const checkedKey = useRef('');
  const backupKey = useRef(storageKey);
  const latest = useRef({ save, restore, ask });
  latest.current = { save, restore, ask };
  const dirty = enabled && !sameDraftContent(value, baseline);
  unsafe.current = dirty && value !== localValue;
  useRegisterAdminDirty(unsafe);

  useEffect(() => {
    const connection = () => { setOnline(navigator.onLine); if (navigator.onLine) setFailedValue(null); };
    connection();
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    return () => { window.removeEventListener('online', connection); window.removeEventListener('offline', connection); };
  }, []);

  useEffect(() => {
    if (!enabled || revision === null || checkedKey.current === storageKey) return;
    checkedKey.current = storageKey;
    try {
      try {
        let tab = sessionStorage.getItem('portfolio:draft:tab');
        if (!tab) { tab = crypto.randomUUID(); sessionStorage.setItem('portfolio:draft:tab', tab); }
        backupKey.current = `${storageKey}:${tab}`;
      } catch { backupKey.current = storageKey; }
      const backup = readDraftBackup(localStorage.getItem(backupKey.current));
      if (backup && !sameDraftContent(backup.value, baseline)) {
        setLocalValue(backup.value);
        if (backup.revision === revision) {
          try { latest.current.restore(backup.value); } catch { setRecovery(backup); }
        }
        else setRecovery(backup);
      }
    } catch { setStorageFailed(true); }
    setInitialized(true);
  }, [enabled, revision, storageKey, baseline]);

  useEffect(() => {
    if (!enabled || !initialized || recovery || revision === null) return;
    try {
      if (dirty) {
        const backup: DraftBackup = { version: 1, revision, value, savedAt: new Date().toISOString() };
        localStorage.setItem(backupKey.current, JSON.stringify(backup));
        setLocalValue(value);
        unsafe.current = false;
      } else {
        localStorage.removeItem(backupKey.current);
        setLocalValue(null);
      }
      setStorageFailed(false);
    } catch { setStorageFailed(true); }
  }, [value, baseline, dirty, enabled, initialized, recovery, revision, storageKey]);

  useEffect(() => {
    if (!dirty || !online || !initialized || recovery || blocked || failedValue === value) return;
    const timer = window.setTimeout(async () => {
      const result = await latest.current.save();
      if (!result) setFailedValue(value);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [value, dirty, online, initialized, recovery, blocked, failedValue]);

  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (unsafe.current) { event.preventDefault(); event.returnValue = ''; } };
    const leave = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      if (!unsafe.current || !link || link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault(); event.stopPropagation();
      void latest.current.ask('Perubahan terakhir belum tersimpan. Tetap keluar?', 'Keluar tanpa menyimpan').then(yes => {
        if (yes) { unsafe.current = false; window.location.assign(link.href); }
      });
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', leave, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', leave, true); };
  }, []);

  function useServerVersion() {
    try { localStorage.removeItem(backupKey.current); } catch { return; }
    setRecovery(null); setLocalValue(null); setFailedValue(null);
  }
  const failed = failedValue === value;
  const status = draftStatusCopy({ online, dirty, localCopy: value === localValue, saving, failed, storageFailed });
  return { status, online, recovery, unsafe, failed, retry: () => setFailedValue(null), useServerVersion };
}
