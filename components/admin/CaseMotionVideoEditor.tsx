'use client';
import { useRef, useState } from 'react';
import { ImageIcon, Video } from 'lucide-react';
import { captureVideoCover, uploadCover } from '@/lib/video-upload';
import { FileDrop } from './FileDrop';
export function CaseMotionVideoEditor({value,cover,disabled,onBusyChange,onChange,targetSize='5 sampai 15 MB',heading='File video'}:{value:string;cover:string;disabled:boolean;onBusyChange:(busy:boolean)=>void;onChange:(value:{videoFile:string;image?:string})=>void;targetSize?:string;heading?:string}) {
  const player=useRef<HTMLVideoElement>(null);
  const [capturing,setCapturing]=useState(false),[message,setMessage]=useState('');
  async function useFrame(){
    if(!player.current||capturing||disabled)return;
    setCapturing(true);onBusyChange(true);setMessage('');
    try{const image=await uploadCover(await captureVideoCover(value,player.current.currentTime));onChange({videoFile:value,image});setMessage('Cover diperbarui.');}
    catch(error){setMessage(error instanceof Error?error.message:'Cover belum tersimpan.');}
    finally{setCapturing(false);onBusyChange(false);}
  }
  return <section className="cms-video-source" aria-label={heading==='File video'?'Video dan thumbnail':heading}>
    <div className="cms-settings-card cms-video-main">
    <h3><Video size={20} aria-hidden="true"/>{heading}</h3>
    <p className="wm-editor-note">MP4 · Target {targetSize} · Maks. 40 MB</p>
    <FileDrop accept="video/mp4" uploadLabel={value?'Ganti video MP4':'Upload video MP4'} disabled={disabled} onBusyChange={onBusyChange} onUploaded={files=>onChange({videoFile:files[0].url,...(files[0].cover?{image:files[0].cover}:{})})}/>
    {value&&<><video key={value} ref={player} className="cms-video-preview" src={value} poster={cover} controls playsInline preload="metadata"/>
    <div className="wm-toolbar"><button type="button" className="wm-button" disabled={disabled||capturing} onClick={useFrame}><ImageIcon size={18} aria-hidden="true"/>{capturing?'Membuat cover…':'Gunakan frame ini'}</button><button type="button" className="wm-button" disabled={disabled} onClick={()=>onChange({videoFile:''})}>Lepas video</button></div></>}
    {message&&<p role="status">{message}</p>}
    <div className="cms-video-cover"><h4>Thumbnail</h4><p className="wm-editor-note">Pilih frame video atau upload gambar.</p><FileDrop folder="covers" previewSrc={cover} previewAlt="Thumbnail video" uploadLabel={cover?'Ganti thumbnail':'Upload thumbnail'} disabled={disabled} onBusyChange={onBusyChange} onUploaded={files=>onChange({videoFile:value,image:files[0].url})}/></div>
    </div>
  </section>;
}
