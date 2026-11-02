'use client';
import {createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode} from 'react';
import {CheckCircle2, Info, CircleAlert, X} from 'lucide-react';
import './admin-toasts.css';

type Options = {id?: string; tone?: 'success' | 'error' | 'info'; duration?: number; action?: {label: string; run: () => void | Promise<void>}};
type Toast = Options & {id: string; message: string};
const ToastContext = createContext<(message: string, options?: Options) => void>(() => {});
export function AdminToasts({children}: {children: ReactNode}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((message: string, options: Options = {}) => {
    if (!message) return;
    const toast = {...options, message, id: options.id || crypto.randomUUID()};
    setToasts(current => [...current.filter(item => item.id !== toast.id), toast].slice(-3));
  }, []);
  const dismiss = useCallback((id: string) => setToasts(current => current.filter(item => item.id !== id)), []);
  return <ToastContext.Provider value={notify}>{children}
    <div className="admin-notifications" aria-label="Notifikasi">
      {toasts.map(toast => <ToastItem key={toast.id} toast={toast} dismiss={dismiss}/>)}
    </div>
  </ToastContext.Provider>;
}
function ToastItem({toast, dismiss}: {toast: Toast; dismiss: (id: string) => void}) {
  const [paused, setPaused] = useState(false), [busy, setBusy] = useState(false);
  const Icon = toast.tone === 'error' ? CircleAlert : toast.tone === 'info' ? Info : CheckCircle2;
  useEffect(() => {
    const duration = toast.duration ?? (toast.action ? 12000 : 5000);
    if (!duration || paused || busy) return;
    const timer = setTimeout(() => dismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast, paused, busy, dismiss]);
  return <div className="admin-toast" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
    onFocus={() => setPaused(true)} onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);}}>
    <Icon size={20} aria-hidden="true"/>
    <div><p role={toast.tone === 'error' ? 'alert' : 'status'}>{toast.message}</p>
      {toast.action && <button type="button" disabled={busy} onClick={async () => {
        setBusy(true); try {await toast.action!.run(); dismiss(toast.id);} finally {setBusy(false);}
      }}>{busy ? 'Memproses…' : toast.action.label}</button>}
    </div>
    <button className="admin-toast-close" type="button" aria-label="Tutup notifikasi" onClick={() => dismiss(toast.id)}><X size={17}/></button>
  </div>;
}
export const useAdminToast = () => useContext(ToastContext);
export function useToastMessage(message: string, tone: Options['tone'] = 'success') {
  const notify = useAdminToast(), previous = useRef('');
  useEffect(() => {
    if (message && message !== previous.current) notify(message, {tone});
    previous.current = message;
  }, [message, tone, notify]);
}
