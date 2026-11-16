import Image, { type ImageProps } from 'next/image';
import { workThumbnail } from '@/lib/work-images';

export function CaseImage({src, sizes, fill, priority, width, height, className, alt}: ImageProps & {src:string}) {
  if(!src.startsWith('/api/media/'))return <Image {...{src,sizes,fill,priority,width,height,className,alt}}/>;
  const layout=fill?'absolute inset-0 h-full w-full':'';
  // CMS files already have responsive derivatives on the authenticated media route.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...workThumbnail(src,sizes)} alt={alt} width={width} height={height}
    className={[layout,className].filter(Boolean).join(' ')} decoding="async"
    loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined}/>;
}
