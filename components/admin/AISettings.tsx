'use client';

import { useRef, useState } from 'react';
import { useRegisterAdminDirty } from './AdminChanges';
import { useConfirm } from './ConfirmDialog';
import { AdminLink } from './AdminLink';
import { useToastMessage } from './AdminToasts';
import './works-manager.css';
import './ai-study.css';

type Status = { configured: boolean; model: string; updatedAt: string };

export function AISettings({ initialStatus }: { initialStatus: Status | null }) {
  const [status, setStatus] = useState(initialStatus);
  const [key, setKey] = useState('');
  const [model, setModel] = useState(initialStatus?.model ?? '');
  const [replacing, setReplacing] = useState(false);
  const [busy, setBusy] = useState<'save' | 'test' | 'load' | 'delete' | null>(null);
  const [error, setError] = useState(initialStatus ? '' : 'Pengaturan AI gagal dimuat.');
  const [message, setMessage] = useState('');
  const keyInput = useRef<HTMLInputElement>(null);
  const hasKey = Boolean(key.trim());
  const canSubmit = Boolean(model.trim() && (status?.configured && !replacing || hasKey));
  const dirty = hasKey || model.trim() !== status?.model;

  const unsafe = useRef(false);
  unsafe.current = Boolean(status && dirty);
  useRegisterAdminDirty(unsafe);
  const { ask, confirmation } = useConfirm();

  async function request(action: 'save' | 'test' | 'load' | 'delete') {
    if (busy || ((action === 'save' || action === 'test') && (!canSubmit || (action === 'save' && !dirty)))) return;
    setBusy(action);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/ai/settings', {
        cache: 'no-store',
        signal: AbortSignal.timeout(28000),
        ...(action === 'load' ? {} : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action === 'delete' ? { action } : { action, model: model.trim(), ...(hasKey ? { apiKey: key.trim() } : {}) }),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      if (action === 'test') {
        setMessage(dirty ? 'Koneksi berhasil. Perubahan belum disimpan.' : 'Koneksi berhasil.');
      } else {
        setStatus(data);
        setModel(data.model);
        setKey('');
        setReplacing(false);
        if (action === 'save') setMessage('Pengaturan tersimpan.');
        if (action === 'delete') setMessage('API key dihapus.');
      }
    } catch (cause) {
      setError(cause instanceof Error && !['TimeoutError', 'SyntaxError', 'TypeError'].includes(cause.name) ? cause.message : 'Pengaturan AI belum bisa diproses. Coba lagi.');
    } finally {
      setBusy(null);
    }
  }

  useToastMessage(message);
  const locked = Boolean(status?.configured && !replacing);

  return <div className="works-manager cms-manager ai-workspace">
    {confirmation}
    <header className="wm-heading">
      <h1>Pengaturan AI</h1>
      <AdminLink className="wm-button" href="/admintgadink/dashboard/ai">AI Study Case</AdminLink>
    </header>
    {error && <p className="cms-error" role="alert">{error}</p>}
    {!status ? <button type="button" className="wm-button" disabled={Boolean(busy)} onClick={() => request('load')}>{busy ? 'Memuat…' : 'Coba lagi'}</button> :
      <section className="ai-settings-panel" aria-label="Gemini API">
        <fieldset disabled={Boolean(busy)} className="ai-fields">
          <div className="ai-key-field">
            <label htmlFor="gemini-key">Gemini API key</label>
            <div className="ai-key-row">
              <input id="gemini-key" ref={keyInput} type="password" autoComplete="new-password" spellCheck={false}
                disabled={locked} value={locked ? '************' : key} onChange={event => setKey(event.target.value)} />
              {status.configured && <button type="button" className="wm-button" onClick={() => {
                setReplacing(!replacing);
                setKey('');
                if (!replacing) requestAnimationFrame(() => keyInput.current?.focus());
              }}>{replacing ? 'Batal ganti' : 'Ganti key'}</button>}
            </div>
          </div>
          <label>ID model<input value={model} maxLength={80} spellCheck={false} onChange={event => setModel(event.target.value)} placeholder="gemini-flash-latest" /></label>
          <div className="ai-actions">
            <button type="button" className="wm-button wm-primary" disabled={!canSubmit || !dirty} onClick={() => request('save')}>{busy === 'save' ? 'Menyimpan…' : 'Simpan'}</button>
            <button type="button" className="wm-button" disabled={!canSubmit} onClick={() => request('test')}>{busy === 'test' ? 'Menguji…' : 'Tes koneksi'}</button>
          </div>
        </fieldset>
        {status.configured && <details>
          <summary>Pengaturan lanjutan</summary>
          <button type="button" className="wm-button" disabled={Boolean(busy)} onClick={async () => {
            if (await ask('Hapus API key? Generate tidak tersedia sampai key baru disimpan.', 'Hapus key')) void request('delete');
          }}>Hapus key</button>
        </details>}
        {!status.configured && <a className="ai-inline-link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Buat key di Google AI Studio</a>}
      </section>}
  </div>;
}
