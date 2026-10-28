'use client';
import { createContext, useContext, useEffect, useRef, type MutableRefObject, type ReactNode } from 'react';

const ChangesContext = createContext<{ register: (ref: MutableRefObject<boolean>) => () => void; isDirty: () => boolean } | null>(null);

export function AdminChangesProvider({children}: {children: ReactNode}) {
  const refs = useRef(new Set<MutableRefObject<boolean>>());
  const api = useRef({
    register(ref: MutableRefObject<boolean>) { refs.current.add(ref); return () => { refs.current.delete(ref); }; },
    isDirty() { return [...refs.current].some(ref => ref.current); },
  }).current;
  return <ChangesContext.Provider value={api}>{children}</ChangesContext.Provider>;
}

export function useAdminChanges() { return useContext(ChangesContext); }
export function useRegisterAdminDirty(ref: MutableRefObject<boolean>) {
  const changes = useAdminChanges();
  useEffect(() => changes?.register(ref), [changes, ref]);
}
