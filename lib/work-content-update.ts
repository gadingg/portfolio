import type { WorkItem } from './works';
import type { CMSBlock } from './content-blocks';

const heading=(id:string,text:string):CMSBlock=>({id,block_type:'heading',block_order:0,content_json:{text,level:2}});
const paragraph=(id:string,text:string):CMSBlock=>({id,block_type:'paragraph',block_order:0,content_json:{text}});
const list=(id:string,items:string[]):CMSBlock=>({id,block_type:'list',block_order:0,content_json:{items}});
export const requestedCaseStudies={
  'mega-app':{
    slug:'mega-app-gading',appUrl:'https://patosser.my.id/gading/',
    problem:'Kebutuhan marketing harian tersebar di beberapa tempat dan sebagian masih dikerjakan manual. Waktu habis untuk mencari, merapikan, menghitung, dan mengulang proses yang sama.',
    solution:'Satu workspace berisi tools sederhana yang dipakai setiap hari: task management, prompt, watermark, caption, library, rekap closing, dan reminder.',
    impact:'Workflow marketing harian menjadi lebih rapi, cepat, dan konsisten. Lebih sedikit waktu habis untuk pekerjaan teknis kecil dan lebih banyak waktu bisa dialihkan ke creative thinking, campaign, dan marketing.',
    blocks:[
      heading('mega-context','Daily marketing, in one place.'),
      paragraph('mega-intro','Web-app internal yang saya buat untuk menyederhanakan workflow Marketing Communication sehari-hari. Fokusnya adalah mengurangi pekerjaan repetitif dan menyatukan banyak kebutuhan kecil ke dalam satu workspace.'),
      heading('mega-idea','Make repeat work easier.'),
      paragraph('mega-principle','Kalau prosesnya sering diulang, berarti ada peluang untuk dibuat lebih praktis. Saya ingin membuat satu hub yang merangkum workflow marketing harian dalam satu tempat, lewat kumpulan tools sederhana yang memang dipakai setiap hari.'),
      heading('mega-tools','Tools for the daily workflow.'),
      list('mega-features',[
        'To-do List: Kanban board untuk melihat task Pending, Lagi Ngerjain, dan Beres dalam satu dashboard.',
        'Prompt Generator: paste spesifikasi listing, pilih style, lalu susun prompt dari template yang sudah disiapkan.',
        'Watermark Generator: tempatkan watermark dengan ukuran, rasio, dan posisi yang konsisten.',
        'Caption Hot Listing: rapikan spek mentah, bersihkan kontak agent, dan siapkan caption yang lebih general.',
        'Link Library: kategorikan PPT, social media, banner, open house, merchandise, dan template cetak.',
        'Prompt Library: simpan dan gunakan kembali prompt tanpa membuka history chat.',
        'Top Contributor Recap: ekstrak nama agent dari rekap closing bulanan dan susun leaderboard.',
        'Birthday Reminder: rekap ulang tahun agent dan kirim reminder melalui Telegram Bot.',
      ]),
      heading('mega-result','More room for creative thinking.'),
      paragraph('mega-outcome','Mega App Gading membuat workflow marketing harian lebih rapi, cepat, dan konsisten. Lebih sedikit waktu habis untuk pekerjaan teknis kecil dan lebih banyak waktu bisa dialihkan ke creative thinking, campaign, dan marketing.'),
    ],
  },
  'req-video':{
    slug:'req-video-bareng-patosser',appUrl:'https://patosser.my.id/reqvideo',
    problem:'Admin harus chat agent satu per satu untuk menanyakan listing yang ingin dibuatkan video. Agent menunggu ditanya dan proses request menjadi saling tunggu.',
    solution:'Agent submit listing lewat form, data masuk ke dashboard secara real-time, lalu admin follow up untuk fiksasi waktu dan menyusun jadwal take video.',
    impact:'Workflow yang bergantung pada admin untuk jemput bola menjadi lebih self-service dan terstruktur. Agent bisa lebih aktif submit listing, sementara admin fokus pada follow-up dan scheduling.',
    blocks:[
      heading('req-context','From waiting to requesting.'),
      paragraph('req-intro','Dashboard internal untuk merapikan alur request dan penjadwalan take video property antara agent dan admin/media.'),
      heading('req-insight','The bottleneck starts before the schedule.'),
      paragraph('req-problem','Sebelumnya admin harus chat agent satu per satu untuk menanyakan apakah ada listing yang ingin dibuatkan video. Masalah utamanya bukan hanya scheduling: agent belum punya jalur yang simpel untuk langsung submit listing ketika mereka punya property yang siap dibuat konten.'),
      heading('req-flow','Submit. Follow up. Fix time. Schedule.'),
      list('req-steps',[
        'Agent submit: isi form ketika punya listing yang ingin dibuatkan video.',
        'Admin follow up: submission langsung muncul di dashboard, tanpa recap manual dari chat.',
        'Fix time: fiksasi waktu bersama agent.',
        'Arrange schedule: susun jadwal final take video langsung dari web.',
      ]),
      heading('req-result','A more self-service workflow.'),
      paragraph('req-outcome','Agent bisa lebih aktif submit listing, sementara admin bisa fokus pada follow-up dan scheduling. Alur yang sebelumnya bergantung pada admin untuk jemput bola menjadi lebih terstruktur.'),
    ],
  },
};

export function applyRequestedWorks(items:WorkItem[]):WorkItem[]{
  const updated=items.map(item=>{
    const study=requestedCaseStudies[item.id as keyof typeof requestedCaseStudies];
    if(study&&!item.caseStudy)return {...item,url:`/work/${study.slug}`,caseStudy:{...study,blocks:study.blocks.map((block,index)=>({...block,block_order:index}))}};
    if(item.id==='sample-video-1')return {...item,title:'Video Instagram 01',description:'Instagram Reel yang diberikan untuk portfolio.',url:'https://www.instagram.com/reel/DeBkwyszNoi/',demo:false};
    return item;
  });
  for(let i=2;i<=7;i++){
    const id=`sample-video-${i}`;const index=updated.findIndex(item=>item.id===id);
    const previous=updated[index];
    if(previous&&!previous.demo)continue;
    const item:WorkItem={...(previous||{}),id,kind:'video',title:`Video contoh ${String(i).padStart(2,'0')}`,description:'Data contoh. Ganti link Instagram melalui admin Works.',image:previous?.image||`/assets/work/sample-design-${(i-1)%4+1}.svg`,imageAlt:'Cover video contoh',url:`https://www.instagram.com/reel/DEMO_VIDEO_${String(i).padStart(2,'0')}/`,published:previous?.published??true,demo:true,artwork:'sample'};
    if(index<0)updated.push(item);else updated[index]=item;
  }
  return updated;
}
