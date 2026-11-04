'use client';
import {Clapperboard,Smartphone} from 'lucide-react';
import type {CaseStudySchema} from '@/lib/content-blocks';
import type {z} from 'zod';
import {caseMotion,type CaseMotionConfig} from '@/lib/case-motion';
import {SettingsDisclosure} from './SettingsDisclosure';
import {CaseMotionVideoEditor} from './CaseMotionVideoEditor';

export function CaseMotionEditor({study,disabled,onBusyChange,onChange}:{study:z.infer<typeof CaseStudySchema>;disabled:boolean;onBusyChange:(busy:boolean)=>void;onChange:(motion:CaseMotionConfig)=>void}){
  const value=study.motion||caseMotion(study)||{enabled:false,title:'',description:'',video:'',mobileVideo:'',poster:'',mobilePoster:''};
  const patch=(next:Partial<CaseMotionConfig>)=>onChange({...value,...next});
  return <SettingsDisclosure title="Video demo (opsional)" icon={<Clapperboard size={20}/>}>
    <div className="cms-block-fields"><label className="cms-checkbox"><input type="checkbox" checked={value.enabled} disabled={disabled} onChange={event=>patch({enabled:event.target.checked})}/>Tampilkan animasi alur</label>
    {value.enabled && <><label>Judul animasi<input value={value.title} disabled={disabled} maxLength={300} onChange={event=>patch({title:event.target.value})}/></label>
    {value.enabled&&(!value.video||!value.poster)&&<p className="wm-editor-note" role="status">Lengkapi video desktop dan poster sebelum publish.</p>}
    <CaseMotionVideoEditor heading="Video desktop" targetSize="di bawah 2 MB" value={value.video} cover={value.poster} disabled={disabled} onBusyChange={onBusyChange} onChange={next=>patch({video:next.videoFile,...(next.image!==undefined?{poster:next.image}:{})})}/>
    <SettingsDisclosure title="Versi mobile (opsional)" icon={<Smartphone size={20}/>}><p className="wm-editor-note">Kosongkan untuk memakai video desktop.</p><CaseMotionVideoEditor heading="Video mobile" targetSize="di bawah 2 MB" value={value.mobileVideo} cover={value.mobilePoster} disabled={disabled} onBusyChange={onBusyChange} onChange={next=>patch({mobileVideo:next.videoFile,...(next.image!==undefined?{mobilePoster:next.image}:{})})}/></SettingsDisclosure>
    </>}
    </div>
  </SettingsDisclosure>;
}
