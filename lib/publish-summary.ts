import { publicWork, type WorkItem } from './works';
import { siteFields, type SiteContent } from './site';

export type PublishSummary = {
  scope: string;
  counts: string[];
  entries: { id: string; title: string; changes: string[]; status?: string; image?: string; kind?: WorkItem['kind']; order?: {id:string;title:string;image:string;from:number;to:number}[] }[];
};

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([, item])=>item!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,canonical(item)]));
  return value;
}
const different = (a: unknown,b: unknown) => JSON.stringify(canonical(a))!==JSON.stringify(canonical(b));

function images(item: WorkItem) {
  const result = new Set<string>();
  const add = (value: unknown) => { if(typeof value==='string'&&value)result.add(value); };
  add(item.image);
  item.designImages?.forEach(image=>add(image.url));
  add(item.caseStudy?.motion?.poster);add(item.caseStudy?.motion?.mobilePoster);
  for(const block of item.caseStudy?.blocks || []) {
    const content=block.content_json;
    if(block.block_type==='image')add(content.url);
    if(block.block_type==='video')add(content.poster);
    if(block.block_type==='gallery'&&Array.isArray(content.images))for(const image of content.images)add(image.url);
  }
  for(const tag of item.caseStudy?.layout?.html.match(/<img\b[^>]*>/gi)||[]) {
    const src=tag.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    add(src?.[1]||src?.[2]);
  }
  return result;
}

export function summarizeWorks(draft: WorkItem[],published: WorkItem[]): PublishSummary {
  const before=new Map(published.map(item=>[item.id,item])),after=new Map(draft.map(item=>[item.id,item]));
  const entries: PublishSummary['entries']=[];
  let added=0,updated=0,removed=0,imageChanges=0;
  for(const item of draft) {
    const old=before.get(item.id),changes:string[]=[];
    if(!old){added++;changes.push('Ditambah ke koleksi');}
    else if(different(publicWork(old),publicWork(item))){
      updated++;
      for(const [key,label] of [['title','Judul'],['description','Deskripsi'],['kind','Kategori'],['image','Cover'],['imageAlt','Deskripsi gambar'],['videoFile','File video'],['url','Link'],['homepageFeatured','Pilihan homepage']] as const)if(different(old[key],item[key]))changes.push(label);
      if(old.published!==item.published)changes.push(item.published?'Ditampilkan di portfolio':'Disembunyikan dari portfolio');
      if(different(old.caseStudy,item.caseStudy))changes.push('Isi / tampilan studi kasus');
      if(different(old.designImages,item.designImages))changes.push('Desain satuan');
      if(!changes.length)changes.push('Pengaturan portfolio');
    }else if(different(old.aiDraft,item.aiDraft)||different(old.archivedCaseStudy,item.archivedCaseStudy))changes.push('Catatan / arsip admin, tidak tampil di publik');
    if(changes.length) {
      const oldImages=old?images(old):new Set<string>(),nextImages=images(item);
      imageChanges+=Math.max([...oldImages].filter(url=>!nextImages.has(url)).length,[...nextImages].filter(url=>!oldImages.has(url)).length);
      entries.push({id:`work:${item.id}`,title:item.title,image:item.image,kind:item.kind,changes,status:item.published?'Diaktifkan untuk publik':'Disembunyikan'});
    }
  }
  for(const item of published)if(!after.has(item.id)){removed++;entries.push({id:`work:${item.id}`,title:item.title,image:item.image,kind:item.kind,changes:['Dihapus dari koleksi']});}
  const oldOrder=published.filter(item=>after.has(item.id)).map(item=>item.id),nextOrder=draft.filter(item=>before.has(item.id)).map(item=>item.id);
  const orderChanged=different(oldOrder,nextOrder);
  return {
    scope:'Berlaku untuk seluruh perubahan koleksi portfolio, termasuk kategori yang sedang tidak dibuka.',
    counts:[...(added?[`${added} portfolio ditambah`]:[]),...(updated?[`${updated} portfolio diperbarui`]:[]),...(removed?[`${removed} portfolio dihapus`]:[]),...(imageChanges?[`${imageChanges} perubahan gambar`]:[]),...(orderChanged?['Urutan portfolio berubah']:[])],
    entries:[...entries,...(orderChanged?[{id:'collection-order',title:'Urutan portfolio',changes:[],order:draft.flatMap((item,index)=>{const from=published.findIndex(old=>old.id===item.id);return from>=0&&from!==index?[{id:item.id,title:item.title,image:item.image,from:from+1,to:index+1}]:[];})}]:[])],
  };
}

export function summarizeSite(draft: SiteContent,published: SiteContent): PublishSummary {
  const groups=new Map<string,string[]>();
  for(const field of siteFields)if(different(draft.values[field.key],published.values[field.key]))groups.set(field.group,[...(groups.get(field.group)||[]),field.label]);
  const entries:PublishSummary['entries']=[...groups].map(([title,changes])=>({id:`site-${title}`,title,changes}));
  const cvLabels:Record<string,string>={name:'Nama',role:'Posisi',profile:'Profil',capabilities:'Kemampuan',phone:'Telepon',email:'Email',website:'Website',location:'Lokasi',languages:'Bahasa',experience:'Pengalaman',education:'Pendidikan',pdf:'File PDF CV'};
  const cvChanges=Object.keys({...published.cv,...draft.cv}).filter(key=>different(draft.cv[key as keyof typeof draft.cv],published.cv[key as keyof typeof published.cv])).map(key=>cvLabels[key]||key);
  if(cvChanges.length)entries.push({id:'site-cv',title:'CV',changes:cvChanges});
  if(different(draft.palette,published.palette))entries.push({id:'site-palette',title:'Color Palette',changes:['Warna, gradient, dan tombol publik']});
  if(different(draft.layout,published.layout))entries.push({id:'site-layout',title:'Layout homepage',changes:['Teks, gambar, atau susunan halaman di editor visual']});
  return {scope:'Berlaku untuk seluruh perubahan Website & CV, termasuk layout homepage.',counts:entries.length?[`${entries.length} bagian diperbarui`]:[],entries};
}
