'use client';
import {useRef} from 'react';
import {useRegisterAdminDirty} from './AdminChanges';
import {sameDraftContent} from '@/lib/draft-backup';
export function useManualSave(options:{value:string;baseline:string;save:()=>Promise<boolean>;restore?:(value:string)=>void;[key:string]:unknown}){
  const unsafe=useRef(false);
  unsafe.current=!sameDraftContent(options.value,options.baseline);
  useRegisterAdminDirty(unsafe);
  return {unsafe,online:true,status:unsafe.current?'Ada perubahan':'Tersimpan',failed:false,recovery:null,canRestore:false,restoreRecovery(){},useServerVersion(){},retry:()=>{void options.save();}};
}
