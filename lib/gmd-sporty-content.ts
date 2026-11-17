import type { WorkItem } from './works';
import type { CMSBlock } from './content-blocks';

export const sportyWorkId = 'gmd-sporty-timer';
export const sportySlug = 'sporty';

export function sportyCase(assets:{cover:string; flow:string; teams:string}):WorkItem {
  const story:[
    CMSBlock['block_type'], CMSBlock['content_json']
  ][] = [
    ['heading',{text:'The thinking behind the output',level:2}],
    ['paragraph',{text:'Setiap main futsal, waktu sewa sudah jalan sementara kami masih bagi tim. Begitu siap, kadang belum ada yang mulai timer. Saya merancang dan membangun GMD Sporty Timer dari nol untuk memberi tiap laga urutan yang jelas, dari membagi pemain sampai mencatat hasil.'}],
    ['heading',{text:'Less setup. More play.',level:2}],
    ['paragraph',{text:'Di Fase Grup, cukup masukkan nama pemain. Aplikasi mengacak mereka menjadi tim berisi lima orang dan menempatkan sisanya sebagai cadangan. Setelah pilih lawan, tinggal atur durasi, mulai timer, lalu simpan skor untuk klasemen. Kalau cuma butuh timer dan suara, Gaya Bebas bisa langsung dipakai.'}],
    ['image',{url:assets.teams,alt:'Fase Grup menampilkan dua tim hasil acakan dengan lima pemain per tim.',caption:'Tampilan asli Fase Grup dengan daftar pemain ilustrasi.'}],
    ['heading',{text:'Two phones. One match.',level:2}],
    ['paragraph',{text:'Di Ruang Pertandingan, host bagikan link atau QR ke operator kedua lalu setujui aksesnya. Keduanya bisa mengontrol timer dan skor laga yang sama dari HP masing-masing. Kedua layar memakai waktu selesai yang sama. Ruang ini memerlukan koneksi internet.'}],
    ['image',{url:assets.flow,alt:'Buat ruang, undang dan setujui operator, lalu kontrol timer dan skor bersama.',caption:'Alur Ruang Pertandingan dalam tiga langkah.'}],
    ['heading',{text:'Give the match a soundtrack.',level:2}],
    ['paragraph',{text:'Anthem bisa diputar sebelum laga, peluit menandai permainan, dan efek suara gol bisa dipicu saat bola masuk. Di Ruang Pertandingan, audio keluar dari HP host yang speakernya sudah diaktifkan. Operator kedua juga bisa memicu suara dari HP-nya.'}],
    ['paragraph',{text:'Cover memakai tangkapan UI asli dari ruang uji lokal. Nama tim, operator, dan skor pada gambar adalah data ilustrasi.'}],
    ['link',{url:'https://sketchfab.com/3d-models/iphone-17-pro-max-87fc1df741384124a8ce0226d2b2058d',label:'3D device model by MajdyModels',target:'_blank'}],
    ['link',{url:'https://creativecommons.org/licenses/by/4.0/',label:'CC BY 4.0 · Screen and finish customized',target:'_blank'}],
  ];
  const blocks=story.map(([block_type,content_json],block_order)=>({
    id:`sporty-story-${block_order}`,block_type,content_json,block_order,
  })) as CMSBlock[];
  return {
    id:sportyWorkId,kind:'webapp',title:'GMD Sporty Timer',
    description:'Acak tim, atur waktu, dan catat skor futsal. Satu laga juga bisa dikontrol dari dua HP.',
    image:assets.cover,imageAlt:'Dua HP menampilkan timer dan skor laga yang sama. Host di kiri, operator di kanan.',
    url:`/work/${sportySlug}`,published:true,demo:false,artwork:'hub',
    caseStudy:{
      slug:sportySlug,appUrl:'https://gmd-sporty-timer.vercel.app/',
      problem:'Waktu sewa lapangan sering terpakai untuk bagi tim. Timer juga kadang lupa disetel, sehingga durasi laga bisa berbeda-beda.',
      solution:'Saya membuat alur acak tim, pilih lawan, mulai timer, dan simpan skor. Saya juga menambahkan Ruang Pertandingan untuk dua operator, plus peluit, anthem, dan efek suara gol.',
      impact:'Fase Grup punya urutan dari daftar pemain sampai klasemen. Gaya Bebas memberi akses cepat ke timer, dan Ruang Pertandingan menyediakan kontrol timer serta skor bersama.',
      blocks,
    },
  };
}
