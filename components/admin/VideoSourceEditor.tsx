'use client';
import {useRef, useState} from 'react';
import {ImageIcon, MoreHorizontal} from 'lucide-react';
import {captureVideoCover, uploadCover} from '@/lib/video-upload';
import {activeVideoSource, type WorkItem} from '@/lib/works';
import type {WorkEditorErrors} from '@/lib/work-editor';
import {FileDrop} from './FileDrop';
import {useAdminToast} from './AdminToasts';

type VideoPatch = Partial<Pick<WorkItem, 'videoFile' | 'videoSource' | 'image' | 'url'>>;
export function VideoSourceEditor({item, disabled, errors = {}, onBusyChange, onChange}: {
  item: WorkItem; disabled: boolean; errors?: WorkEditorErrors;
  onBusyChange: (busy: boolean) => void; onChange: (patch: VideoPatch) => void;
}) {
  const player = useRef<HTMLVideoElement>(null), notify = useAdminToast();
  const [capturing, setCapturing] = useState(false);
  const source = activeVideoSource(item), value = item.videoFile || '', cover = item.image;
  async function useFrame() {
    if (!player.current || capturing || disabled) return;
    setCapturing(true); onBusyChange(true);
    try {
      const image = await uploadCover(await captureVideoCover(value, player.current.currentTime));
      onChange({image}); notify('Thumbnail diganti.');
    } catch (error) {notify(error instanceof Error ? error.message : 'Thumbnail belum bisa dibuat.', {tone:'error'});}
    finally {setCapturing(false); onBusyChange(false);}
  }
  return <section className="work-editor-video" aria-label="Video dan thumbnail">
    <h2>Video</h2>
    <fieldset className="video-source-choice" disabled={disabled}>
      <legend>Sumber video</legend>
      <label><input type="radio" name={`video-source-${item.id}`} checked={source === 'file'} onChange={() => onChange({videoSource:'file'})}/>Upload video</label>
      <label><input type="radio" name={`video-source-${item.id}`} checked={source === 'instagram'} onChange={() => onChange({videoSource:'instagram'})}/>Link Instagram</label>
    </fieldset>
    {source === 'instagram' ? <label>Link Instagram
      <input data-work-field="url" type="url" value={item.url} placeholder="https://www.instagram.com/reel/…" disabled={disabled}
        aria-invalid={!!errors.url} aria-describedby={errors.url ? 'video-url-error' : undefined} onChange={event => onChange({url:event.target.value})}/>
      {errors.url && <small className="work-field-error" id="video-url-error">{errors.url}</small>}
    </label> : <div data-work-field="videoFile">
      {value && <video key={value} ref={player} className="cms-video-preview" src={value} poster={cover} controls playsInline preload="metadata"/>}
      <div className="work-video-actions">
        <FileDrop picker accept="video/mp4,video/webm" uploadLabel={value ? 'Ganti video' : 'Tambah video'} disabled={disabled} onBusyChange={onBusyChange}
          fileLink={value} onFileLink={videoFile => onChange({videoSource:'file',videoFile})}
          onUploaded={files => onChange({videoSource:'file',videoFile:files[0].url,...(!cover && files[0].cover ? {image:files[0].cover} : {})})}/>
        {value && <details className="wm-action-menu">
          <summary className="wm-button" aria-label="Opsi video" title="Opsi video"><MoreHorizontal size={20} aria-hidden="true"/></summary>
          <div className="wm-menu-panel"><button type="button" disabled={disabled} onClick={event => {event.currentTarget.closest('details')!.open=false; onChange({videoFile:''});}}>Lepas video</button></div>
        </details>}
      </div>
      {errors.videoFile && <small className="work-field-error">{errors.videoFile}</small>}
    </div>}
    <div data-work-field="image" className="work-video-thumbnail">
      <h3>Thumbnail</h3>
      <FileDrop picker thumbnail folder="covers" previewSrc={cover} previewAlt="Thumbnail video"
        uploadLabel={cover ? 'Ganti thumbnail' : 'Tambah thumbnail'} disabled={disabled} onBusyChange={onBusyChange} onUploaded={files => onChange({image:files[0].url})}/>
      {source === 'file' && value && <button type="button" className="wm-button work-frame-action" disabled={disabled || capturing} onClick={useFrame}>
        <ImageIcon size={18} aria-hidden="true"/>{capturing ? 'Membuat thumbnail…' : 'Jadikan thumbnail'}
      </button>}
      {errors.image && <small className="work-field-error">{errors.image}</small>}
    </div>
  </section>;
}
