'use client';
import { useRef, useState } from 'react';
import { ImageIcon, Link2, Video } from 'lucide-react';
import { captureVideoCover, uploadCover } from '@/lib/video-upload';
import { FileDrop } from './FileDrop';
import { SettingsDisclosure } from './SettingsDisclosure';
export function VideoSourceEditor({value,cover,disabled,onBusyChange,onChange}:{value:string;cover:string;disabled:boolean;onBusyChange:(busy:boolean)=>void;onChange:(value:{videoFile:string;image?:string})=>void}) {
  const player=useRef<HTMLVideoElement>(null);
  const [capturing,setCapturing]=useState(false),[message,setMessage]=useState('');
  async function useFrame(){
    if(!player.current||capturing||disabled)return;
    setCapturing(true);onBusyChange(true);setMessage('');
    try{const image=await uploadCover(await captureVideoCover(value,player.current.currentTime));onChange({videoFile:value,image});setMessage('Cover diperbarui.');}
    catch(error){setMessage(error instanceof Error?error.message:'Cover belum tersimpan.');}
    finally{setCapturing(false);onBusyChange(false);}
  }
  return <section className="cms-video-source" aria-label="Video dan thumbnail">
    <div className="cms-settings-card cms-video-main">
    <h3><Video size={20} aria-hidden="true"/>Video &amp; Thumbnail</h3>
    <FileDrop accept="video/mp4,video/webm" disabled={disabled} onBusyChange={onBusyChange} onUploaded={files=>onChange({videoFile:files[0].url,...(!cover&&files[0].cover?{image:files[0].cover}:{})})}/>
    {value&&<><video key={value} ref={player} className="cms-video-preview" src={value} poster={cover} controls playsInline preload="metadata"/>
    <div className="wm-toolbar"><button type="button" className="wm-button" disabled={disabled||capturing} onClick={useFrame}><ImageIcon size={18} aria-hidden="true"/>{capturing?'Membuat cover…':'Gunakan frame ini'}</button><button type="button" className="wm-button" disabled={disabled} onClick={()=>onChange({videoFile:''})}>Lepas video</button></div></>}
    {message&&<p role="status">{message}</p>}
    <div className="cms-video-cover"><h4>Thumbnail</h4>{cover&&<img className="cms-image-preview" src={cover} alt="Thumbnail video"/>}<FileDrop folder="covers" disabled={disabled} onBusyChange={onBusyChange} onUploaded={files=>onChange({videoFile:value,image:files[0].url})}/></div>
    </div>
    <SettingsDisclosure title="Sumber Video" icon={<Link2 size={20}/>} status={!value?'Belum ada video':value.startsWith('/api/media/')?'File diupload':'Tautan eksternal'}>
      <label>Link MP4 / WebM<input value={value} inputMode="url" disabled={disabled} onChange={event=>onChange({videoFile:event.target.value})}/></label>
    </SettingsDisclosure>
  </section>;
}
