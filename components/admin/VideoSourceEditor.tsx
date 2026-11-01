'use client';
import { useRef, useState } from 'react';
import { ImageIcon, Video } from 'lucide-react';
import { captureVideoCover, uploadCover } from '@/lib/video-upload';
import { activeVideoSource, type WorkItem } from '@/lib/works';
import { FileDrop } from './FileDrop';
import { SettingsDisclosure } from './SettingsDisclosure';

type VideoPatch = Partial<Pick<WorkItem, 'videoFile' | 'videoSource' | 'image' | 'url'>>;
export function VideoSourceEditor({item, disabled, onBusyChange, onChange}: {
  item: WorkItem; disabled: boolean; onBusyChange: (busy: boolean) => void; onChange: (patch: VideoPatch) => void;
}) {
  const player = useRef<HTMLVideoElement>(null);
  const [capturing, setCapturing] = useState(false), [message, setMessage] = useState('');
  const source = activeVideoSource(item), value = item.videoFile || '', cover = item.image;
  async function useFrame() {
    if (!player.current || capturing || disabled) return;
    setCapturing(true); onBusyChange(true); setMessage('');
    try {
      const image = await uploadCover(await captureVideoCover(value, player.current.currentTime));
      onChange({image}); setMessage('Thumbnail diganti. Draft tersimpan otomatis.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Thumbnail belum bisa dibuat.'); }
    finally { setCapturing(false); onBusyChange(false); }
  }
  return <section className="cms-video-source" aria-label="Sumber video dan thumbnail">
    <div className="cms-settings-card cms-video-main">
      <h3><Video size={20} aria-hidden="true"/>Video &amp; Thumbnail</h3>
      <fieldset className="video-source-choice" disabled={disabled}>
        <legend>Video yang ditampilkan</legend>
        <label><input type="radio" name={`video-source-${item.id}`} checked={source === 'file'} onChange={() => onChange({videoSource:'file'})}/> File video</label>
        <label><input type="radio" name={`video-source-${item.id}`} checked={source === 'instagram'} onChange={() => onChange({videoSource:'instagram'})}/> Instagram</label>
      </fieldset>
      {source === 'instagram' ? <label>Link Instagram<input type="url" value={item.url} placeholder="https://www.instagram.com/reel/…" disabled={disabled} onChange={event => onChange({url:event.target.value})}/><small>Gunakan link Reel, posting, atau video Instagram.</small></label> : <>
        <FileDrop accept="video/mp4,video/webm" disabled={disabled} onBusyChange={onBusyChange} onUploaded={files => onChange({videoSource:'file',videoFile:files[0].url,...(!cover && files[0].cover ? {image:files[0].cover} : {})})}/>
        {value && <><video key={value} ref={player} className="cms-video-preview" src={value} poster={cover} controls playsInline preload="metadata"/>
          <div className="wm-toolbar"><button type="button" className="wm-button" disabled={disabled||capturing} onClick={useFrame}><ImageIcon size={18} aria-hidden="true"/>{capturing?'Membuat thumbnail…':'Pakai gambar ini sebagai thumbnail'}</button><button type="button" className="wm-button" disabled={disabled} onClick={()=>onChange({videoFile:''})}>Hapus video dari portofolio</button></div></>}
        <SettingsDisclosure title="Link file MP4 / WebM" icon={<Video size={20}/>}>
          <label>Link file<input value={value} inputMode="url" disabled={disabled} onChange={event=>onChange({videoFile:event.target.value})}/></label>
        </SettingsDisclosure>
      </>}
      <p className="wm-muted">{source === 'file' ? 'File ini diputar di website. Link Instagram tetap tersimpan.' : 'Video ditampilkan dari Instagram. File upload tetap tersimpan.'}</p>
      {message && <p role="status">{message}</p>}
      <div className="cms-video-cover"><h4>Thumbnail</h4>{cover && <img className="cms-image-preview" src={cover} alt="Thumbnail video"/>}<FileDrop folder="covers" disabled={disabled} onBusyChange={onBusyChange} onUploaded={files=>onChange({image:files[0].url})}/></div>
    </div>
  </section>;
}
