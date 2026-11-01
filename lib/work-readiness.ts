import { activeVideoSource, instagramURL, WorkItemSchema, type WorkItem } from './works';

export function workReadiness(item: WorkItem): string | null {
  const sampleImage = !item.image || /\/sample-design-\d+\.svg(?:[?#]|$)/.test(item.image);
  if (item.kind === 'video') {
    const source = activeVideoSource(item);
    if (source === 'instagram' && (!instagramURL(item.url) || /DEMO_VIDEO_/.test(item.url))) return 'Tambahkan link Instagram.';
    if (source === 'file' && !item.videoFile) return 'Upload video atau tambahkan link file.';
    const validation = WorkItemSchema.safeParse({ ...item, published: true, demo: false });
    return validation.success ? null : validation.error.issues[0]?.message || 'Lengkapi video.';
  }
  if (item.kind === 'design') return sampleImage ? 'Upload gambar portofolio.' : null;
  return item.demo || (!item.caseStudy && !item.url) ? 'Tambahkan link aplikasi atau isi studi kasus.' : null;
}

export const isReadyWork = (item: WorkItem) => !workReadiness(item);

export function presentWork(item: WorkItem): WorkItem {
  const genericAlt = !item.imageAlt || /^(?:layout desain \d+|thumbnail video|cover video)$/i.test(item.imageAlt.trim());
  const originalReel = item.id === 'sample-video-1' && !!instagramURL(item.url) && !/DEMO_VIDEO_/.test(item.url);
  const amesta = item.id === 'sample-design-1' && item.image.includes('1792212542785-50bd4dd1-2833-486d-ac27-bae92c807fd5.png');
  return {
    ...item,
    ...(amesta && item.title==='Campaign poster' ? {title:'Amesta Living'} : {}),
    ...(originalReel && item.title === 'Video Instagram 01' ? {title:'Branding in motion'} : {}),
    ...(originalReel && /\/sample-design-\d+\.svg$/.test(item.image) ? {image:'/assets/work/branding-video-cover.svg'} : {}),
    imageAlt: genericAlt ? amesta ? 'Poster Amesta Living dengan visual rumah, headline Kini, dan informasi harga.' : `${item.kind === 'video' ? 'Cover video' : 'Artwork'} ${originalReel ? 'branding Gading Utama' : item.title}` : item.imageAlt,
  };
}
