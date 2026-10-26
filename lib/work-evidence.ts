import type { WorkItem } from './works';
import type { CMSBlock } from './content-blocks';

export function withWorkEvidence(item:WorkItem):WorkItem{
  const study=item.caseStudy;
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
