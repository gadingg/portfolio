export const thumbnailSizes='(max-width: 767px) 86vw, (max-width: 1023px) 46vw, 36vw';
export const caseCoverSizes='(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 92vw, 1200px';
export function workThumbnail(src:string,sizes=thumbnailSizes){
  if(!src || /\.(svg|gif)(?:[?#]|$)/i.test(src))return {src};
  const privateMedia=src.startsWith('/api/media/');
  const widths=privateMedia?[320,640,960,1280]:[384,640,828,1200];
  const at=(width:number)=>privateMedia?`${src.split(/[?#]/)[0]}?w=${width}`:`/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
  return {src:at(640),srcSet:widths.map(width=>`${at(width)} ${width}w`).join(', '),sizes};
}
