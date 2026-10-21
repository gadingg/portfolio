export async function captureVideoCover(source: Blob | string, seconds = 1): Promise<Blob> {
  const video = document.createElement('video');
  const local = typeof source !== 'string';
  const url = local ? URL.createObjectURL(source) : source;
  video.muted = true; video.playsInline = true; video.preload = 'auto'; video.crossOrigin = 'anonymous';
  try {
    return await new Promise<Blob>((resolve,reject)=>{
      const timeout = setTimeout(()=>finish(Error('Thumbnail belum bisa dibuat. Upload cover sendiri.')),20000);
      const finish = (error?:Error, blob?:Blob|null) => { clearTimeout(timeout); video.onloadedmetadata=null;video.onseeked=null;video.onerror=null;if(error||!blob)reject(error||Error('Thumbnail belum bisa dibuat.'));else resolve(blob); };
      video.onerror=()=>finish(Error('Video tidak bisa dibaca. Upload cover sendiri.'));
      video.onloadedmetadata=()=>{video.currentTime=Math.min(Math.max(seconds,.01),Math.max(.01,video.duration-.05));};
      video.onseeked=()=>{
        try {
          const canvas=document.createElement('canvas'),ratio=Math.min(1,960/video.videoWidth);
          canvas.width=Math.max(1,Math.round(video.videoWidth*ratio));canvas.height=Math.max(1,Math.round(video.videoHeight*ratio));
          const context=canvas.getContext('2d');if(!context)throw Error('Canvas tidak tersedia.');
          context.drawImage(video,0,0,canvas.width,canvas.height);canvas.toBlob(blob=>finish(undefined,blob),'image/jpeg',.85);
        } catch {finish(Error('Thumbnail belum bisa dibuat. Upload cover sendiri.'));}
      };
      video.src=url;video.load();
    });
  } finally {video.pause();video.removeAttribute('src');video.load();if(local)URL.revokeObjectURL(url);}
}
async function jsonRequest(url:string, body:unknown) {
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  const data=await response.json();if(!response.ok)throw Error(data.error||'Upload gagal.');return data;
}
export async function uploadCover(blob:Blob) {
  const form=new FormData();form.append('file',new File([blob],'cover.jpg',{type:'image/jpeg'}));form.append('folder','covers');
  const response=await fetch('/api/admin/media',{method:'POST',body:form});const data=await response.json();if(!response.ok)throw Error(data.error||'Cover belum tersimpan.');return data.url as string;
}
export async function uploadPortfolioVideo(file:File, onProgress?:(percent:number)=>void) {
  const signed=await jsonRequest('/api/admin/media/video',{action:'sign',type:file.type,size:file.size});
  for(let attempt=0;attempt<2;attempt++){
    try{
      await new Promise<void>((resolve,reject)=>{
        const upload=new XMLHttpRequest();upload.open('PUT',signed.signedUrl);upload.timeout=120000;
        upload.upload.onprogress=event=>{if(event.lengthComputable)onProgress?.(Math.round(event.loaded/event.total*100));};
        upload.onload=()=>upload.status>=200&&upload.status<300||upload.status===409?resolve():reject(Error('Video gagal diunggah. Coba lagi.'));
        upload.onerror=upload.ontimeout=()=>reject(Error('Koneksi upload terputus. Coba lagi.'));
        const form=new FormData();form.append('cacheControl','3600');form.append('',file);upload.send(form);
      });
      break;
    }catch(error){if(attempt===1)throw error;onProgress?.(0);}
  }
  return jsonRequest('/api/admin/media/video',{action:'complete',path:signed.path,filename:file.name});
}
