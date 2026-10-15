import 'server-only';
import { createHash } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPublicClient } from '@/lib/supabase/public';
import { getPublishedProjects } from './public-projects';
import { getPublicGalleryItems } from './gallery';
import { projectPresentations, useBriefArtwork } from '@/lib/project-presentation';
import { WorksSchema, type WorkItem } from '@/lib/works';

const bucket = 'portfolio-public';
const filename = 'content/works.json';
export const revisionOf = (items: WorkItem[]) => createHash('sha256').update(JSON.stringify(items)).digest('hex');

async function initialItems(): Promise<WorkItem[]> {
  const [projects, gallery] = await Promise.all([getPublishedProjects(), getPublicGalleryItems()]);
  const items: WorkItem[] = projects.map(project => {
    const brief = projectPresentations[project.slug];
    return {id:project.id, kind:'webapp', title:brief?.title || project.title, description:brief?.intro || project.description,
      image:useBriefArtwork(project) ? '' : project.cover_image_url, imageAlt:project.cover_image_alt || project.title,
      url:`/work/${project.slug}`, published:true, demo:false, artwork:brief?.artwork || 'sample'};
  });
  items.push(
    {id:'mega-app',kind:'webapp',title:'Mega App Gading',description:'Task, prompt, caption, link, dan reminder dalam satu hub kerja.',image:'',imageAlt:'',url:'https://patosser.my.id/gading/',published:true,demo:false,artwork:'hub'},
    {id:'req-video',kind:'webapp',title:'Req Video Bareng Patosser',description:'Request listing, follow-up, dan jadwal take video dalam satu alur.',image:'',imageAlt:'',url:'https://patosser.my.id/reqvideo',published:true,demo:false,artwork:'schedule'},
    {id:'sample-web',kind:'webapp',title:'Website berikutnya',description:'Contoh slot karya. Ganti judul, gambar, dan link melalui menu Works.',image:'',imageAlt:'',url:'',published:true,demo:true,artwork:'sample'},
  );
  const seedCaptions = new Set(['Minimalist monochrome aesthetic study','Editorial design composition','High-contrast typographic structure','Conceptual motion framing','Digital layout fragment']);
  const seedFiles = new Set(['4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg','c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg','917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg']);
  const originals = gallery.filter(item => !(/^gallery-0[1-5]$/.test(item.id) && /^Visual Archive Fragment 0[1-5]$/.test(item.alt) && seedCaptions.has(item.caption || '') && seedFiles.has(item.url.split('/').pop() || '')));
  for (const item of originals) items.push({id:item.id,kind:'design',title:item.caption || item.alt || 'Visual design',description:item.category || '',image:item.url,imageAlt:item.alt,url:'',published:true,demo:false,artwork:'sample'});
  if (!originals.length) for (let i=1;i<=4;i++) items.push({id:`sample-design-${i}`,kind:'design',title:['Campaign poster','Social media series','Visual identity','Editorial layout'][i-1],description:'Data contoh — ganti dengan karya Anda.',image:`/assets/work/sample-design-${i}.svg`,imageAlt:`Contoh layout desain ${i}`,url:'',published:true,demo:true,artwork:'sample'});
  for(let i=1;i<=3;i++) items.push({id:`sample-video-${i}`,kind:'video',title:['Brand story','Campaign in motion','Behind the scenes'][i-1],description:'Data contoh — tambahkan link Instagram di admin.',image:`/assets/work/sample-design-${i}.svg`,imageAlt:'Thumbnail contoh video',url:'',published:true,demo:true,artwork:'sample'});
  return items;
}

export async function getWorks() {
  const {data,error} = await createPublicClient().storage.from(bucket).download(filename);
  if (error) {
    const code = String((error as {statusCode?:string}).statusCode || '');
    if (!['400','404'].includes(code) || !/not found|does not exist/i.test(error.message)) throw new Error('Koleksi karya belum bisa dimuat.');
    const items = await initialItems();
    return {items, revision:revisionOf(items), initialized:false};
  }
  const {items} = WorksSchema.parse(JSON.parse(await data.text()));
  return {items,revision:revisionOf(items),initialized:true};
}

export async function saveWorks(items:WorkItem[]) {
  const {error} = await createAdminClient().storage.from(bucket).upload(filename, JSON.stringify({items}), {upsert:true,contentType:'application/json',cacheControl:'0'});
  if(error) throw new Error('Karya belum tersimpan. Coba lagi.');
  return {items,revision:revisionOf(items),initialized:true};
}
