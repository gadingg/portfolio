'use client';

import type { DraftBackup } from '@/lib/draft-backup';

export function DraftRecovery({ backup, onUseServer }: { backup: DraftBackup; onUseServer: () => void }) {
  function download() {
    const url = URL.createObjectURL(new Blob([backup.value], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'cadangan-draft.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="works-manager wm-message" role="alert">
    <h1>Draft di perangkat berbeda dengan versi online</h1>
    <p>Versi online sudah berubah. Download salinan draft ini jika masih diperlukan, lalu buka versi terbaru.</p>
    <div className="wm-item-actions"><button className="wm-button" onClick={download}>Download salinan (.json)</button><button className="wm-button wm-primary" onClick={onUseServer}>Buka versi terbaru</button></div>
  </section>;
}
