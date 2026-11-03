'use client';

import type { DraftBackup } from '@/lib/draft-backup';

export function DraftRecovery({ backup, onUseServer, onRestore }: { backup: DraftBackup; onUseServer: () => void; onRestore?: () => void }) {
  function download() {
    const url = URL.createObjectURL(new Blob([backup.value], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'cadangan-draft.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className={onRestore ? "wm-message wm-recovery-banner" : "works-manager wm-message"} role={onRestore ? "status" : "alert"}>
    {onRestore ? <h2>Ada draft dari tab lain</h2> : <h1>Draft lokal berbeda dari versi online</h1>}
    <p>{onRestore ? "Lanjutkan dari cadangan di perangkat ini atau gunakan versi online." : "Unduh salinan draft lokal sebelum membuka versi online."}</p>
    <div className="wm-item-actions">{onRestore && <button className="wm-button wm-primary" onClick={onRestore}>Pulihkan draft</button>}<button className="wm-button" onClick={download}>Download salinan (.json)</button><button className={onRestore ? "wm-button" : "wm-button wm-primary"} onClick={onUseServer}>{onRestore ? "Abaikan" : "Buka versi terbaru"}</button></div>
  </section>;
}
