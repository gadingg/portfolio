import type { WorkItem } from './works';
import type { CMSBlock } from './content-blocks';
import {load} from 'cheerio';

export function withWorkEvidence(item:WorkItem):WorkItem{
  const study=item.caseStudy;
  if(study?.slug==='listinghub'&&!item.evidenceEdition){
    const evidence={id:'listing-inline-proof',block_type:'gallery' as const,block_order:0,content_json:{layout:'grid',images:[{url:'/assets/work/listing-hub.jpg',alt:'Tampilan pencarian All Database dan ringkasan informasi properti.',caption:'Pencarian database dan ringkasan properti.'},{url:'/assets/work/listing-filter.jpg',alt:'Panel filter transaksi, tipe properti, budget, dan agent.',caption:'Filter untuk mempersempit pilihan listing.'}]}};
    if(study.layout){
      const $=load(study.layout.html,null,false);
      if(!$('[data-cms-evidence="listing"]').length){
        const group=$('<div class="case-evidence-pair" data-cms-evidence="listing"></div>');
        for(const picture of evidence.content_json.images){const figure=$('<figure></figure>'),link=$('<a target="_blank" rel="noopener noreferrer"></a>').attr('href',picture.url).attr('aria-label',`Buka screenshot: ${picture.alt}`);link.append($('<img loading="lazy" decoding="async">').attr('src',picture.url).attr('alt',picture.alt));figure.append(link,$('<figcaption></figcaption>').text(picture.caption));group.append(figure);}
        const heading=$('.case-narrative h2,.study-case-blocks h2').filter((_index,node)=>/^(All Database|Find what fits\.)$/i.test($(node).text().trim())).first();
        const paragraph=heading.nextAll('p').first();
        if(paragraph.length)paragraph.after(group);else {const root=$('.study-case-blocks,.case-narrative').first();if(!root.length)return item;root.append(group);}
      }
      return {...item,evidenceEdition:'listing-2026-10-31',caseStudy:{...study,layout:{...study.layout,html:$.html()}}};
    }
    const blocks=[...study.blocks];
    const existing=blocks.findIndex(block=>block.block_type==='gallery'&&Array.isArray(block.content_json.images)&&block.content_json.images.some((picture:{url:string})=>picture.url==='/assets/work/listing-filter.jpg'));
    const gallery=existing>=0?blocks.splice(existing,1)[0]:evidence;
    const heading=blocks.findIndex(block=>block.block_type==='heading'&&/All Database|Find what fits/i.test(String(block.content_json.text)));
    const paragraph=heading<0?-1:blocks.findIndex((block,index)=>index>heading&&block.block_type==='paragraph');
    blocks.splice(paragraph<0?blocks.length:paragraph+1,0,gallery);
    return {...item,evidenceEdition:'listing-2026-10-31',caseStudy:{...study,blocks:blocks.map((block,index)=>({...block,block_order:index}))}};
  }
  if(!study || study.slug!=='metaads' || item.evidenceEdition || study.layout)return item;
  const blocks=[...study.blocks];
  // Use the supplied project documentation; these crops never manufacture new UI or results.
  const details:CMSBlock[]=[
    {id:'meta-detail-trend',block_type:'image',block_order:0,content_json:{url:'/assets/work/meta-report-macbooks.webp',alt:'Detail grafik hasil Meta Ads dan respons WhatsApp antar-batch.',caption:'Tren antar-batch untuk membandingkan hasil Meta Ads dengan respons WhatsApp. Detail dari mockup proyek.',focus:'meta-trend'}},
    {id:'meta-detail-batch',block_type:'image',block_order:0,content_json:{url:'/assets/work/meta-report-macbooks.webp',alt:'Detail pilihan batch dan ringkasan anggaran, impresi, respons WhatsApp, serta biaya per pesan.',caption:'Pilih batch untuk membaca anggaran, impresi, respons WhatsApp, dan biaya per pesan. Detail dari mockup proyek.',focus:'meta-batch'}},
  ];
  for(const [index,pattern] of [/Report once/i,/Make evaluation/i].entries()){
    if(blocks.some(block=>block.id===details[index].id))continue;
    const heading=blocks.findIndex(block=>block.block_type==='heading'&&pattern.test(String(block.content_json.text)));
    const paragraph=heading<0?-1:blocks.findIndex((block,i)=>i>heading&&block.block_type==='paragraph');
    blocks.splice(paragraph<0?blocks.length:paragraph+1,0,details[index]);
  }
  const impact=blocks.findIndex(block=>block.block_type==='heading'&&/Marketing impact, with context/i.test(String(block.content_json.text)));
  if(impact>0&&blocks[impact+1]?.block_type==='paragraph')blocks.unshift(...blocks.splice(impact,2));
  return {...item,evidenceEdition:'2026-10-26',caseStudy:{...study,blocks:blocks.map((block,index)=>({...block,block_order:index}))}};
}
