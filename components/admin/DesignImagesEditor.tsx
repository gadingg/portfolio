'use client';
import {Images,Trash2} from 'lucide-react';
import type {WorkItem} from '@/lib/works';
import {FileDrop} from './FileDrop';
import {SortableList} from './SortableList';
import {SettingsDisclosure} from './SettingsDisclosure';

export function DesignImagesEditor({item,disabled,onBusyChange,onChange}:{item:WorkItem;disabled:boolean;onBusyChange:(busy:boolean)=>void;onChange:(patch:Partial<WorkItem>)=>void}){
  const images=item.designImages||[];
  return <SettingsDisclosure title="Desain satuan" icon={<Images size={20}/>} status={`${images.length} gambar`}>
    <div className="cms-block-fields">
      <SortableList items={images.map((image,index)=>({...image,id:String(index)}))} disabled={disabled} onChange={next=>onChange({designImages:next.map(({url,alt})=>({url,alt}))})}>
        {(image,index,handle)=><div className="cms-layout-picture">{handle}<FileDrop picker folder="gallery" previewSrc={image.url} previewAlt={image.alt||item.title} disabled={disabled} onBusyChange={onBusyChange} uploadLabel="Ganti gambar" onUploaded={files=>onChange({designImages:images.map((value,at)=>at===index?{...value,url:files[0].url}:value)})}/><label>Deskripsi gambar (aksesibilitas)<input value={image.alt} maxLength={250} disabled={disabled} onChange={event=>onChange({designImages:images.map((value,at)=>at===index?{...value,alt:event.target.value}:value)})}/></label><button type="button" className="wm-button" disabled={disabled} onClick={()=>onChange({designImages:images.filter((_,at)=>at!==index)})}><Trash2 size={16}/>Lepas gambar</button></div>}
      </SortableList>
      {images.length<20&&<FileDrop multiple picker folder="gallery" uploadLabel="Tambah gambar" disabled={disabled} onBusyChange={onBusyChange} onUploaded={files=>onChange({designImages:[...images,...files.map(file=>({url:file.url,alt:''}))].slice(0,20)})}/>}
    </div>
  </SettingsDisclosure>;
}
