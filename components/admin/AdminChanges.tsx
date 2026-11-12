'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useConfirm } from './ConfirmDialog';
import { createContext, useContext, useEffect, useRef, type MutableRefObject, type ReactNode } from 'react';

const ChangesContext = createContext<{ register: (ref: MutableRefObject<boolean>) => () => void; isDirty: () => boolean } | null>(null);

export function AdminChangesProvider({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = useRef<{ href: string; state: unknown } | null>(null);
  const refs = useRef(new Set<MutableRefObject<boolean>>());
  const api = useRef({
    register(ref: MutableRefObject<boolean>) { refs.current.add(ref); return () => { refs.current.delete(ref); }; },
    isDirty() { return [...refs.current].some(ref => ref.current); },
  }).current;
  const { ask, confirmation } = useConfirm();
  useEffect(() => {
    current.current = { href: location.href, state: history.state };
  }, [pathname, search]);
  useEffect(() => {
    function remember() { current.current = { href: location.href, state: history.state }; }
    const pop = (event: PopStateEvent) => {
      const previous = current.current;
      if (!previous || !api.isDirty() || location.href === previous.href) { remember(); return; }
      const destination = location.href;
      event.stopImmediatePropagation();
      history.pushState(previous.state, '', previous.href);
      void ask('Editan yang belum disimpan akan dibuang.', 'Keluar', false, 'Keluar dari halaman?').then(confirmed => {
        if (!confirmed) return;
        for (const ref of refs.current) ref.current = false;
        window.location.replace(destination);
      });
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (api.isDirty()) { event.preventDefault(); event.returnValue = ''; }
    };
    const leave = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') as HTMLAnchorElement | null : null;
      if (!api.isDirty() || !link || link.target === '_blank' || link.hasAttribute('download') ||
        event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (link.pathname === location.pathname && link.search === location.search && link.hash) return;
      event.preventDefault();
      event.stopPropagation();
      void ask('Editan yang belum disimpan akan dibuang.', 'Keluar', false, 'Keluar dari halaman?').then(confirmed => {
        if (confirmed) {
          for (const ref of refs.current) ref.current = false;
          window.location.assign(link.href);
        }
      });
    };
    window.addEventListener('popstate', pop, true);
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', leave, true);
    return () => {
      window.removeEventListener('popstate', pop, true);
      window.removeEventListener('beforeunload', unload);
      document.removeEventListener('click', leave, true);
    };
  }, [api, ask]);
  return <ChangesContext.Provider value={api}>{confirmation}{children}</ChangesContext.Provider>;
}

export function useAdminChanges() { return useContext(ChangesContext); }
export function useRegisterAdminDirty(ref: MutableRefObject<boolean>) {
  const changes = useAdminChanges();
  useEffect(() => changes?.register(ref), [changes, ref]);
}
