import type {WorkItem} from './works';
import type {CMSBlock} from './content-blocks';

export const practicalToolIds=['prompt-generator','followup-patosser','rekap-ella'] as const;
const asset=(slug:string,name:string)=>`/assets/work/new-cases/${slug}-${name}.webp`;

export function practicalTools():WorkItem[]{
  function project(id:string,slug:string,title:string,description:string,appUrl:string,problem:string,solution:string,impact:string,sections:[string,string][],detailAfter:number,detailCaption:string):WorkItem{
    const blocks:CMSBlock[]=[];
    sections.forEach(([heading,text],index)=>{
      blocks.push({id:`${slug}-h-${index}`,block_type:'heading',block_order:blocks.length,content_json:{text:heading,level:2}});
      blocks.push({id:`${slug}-p-${index}`,block_type:'paragraph',block_order:blocks.length,content_json:{text}});
      if(index===detailAfter)blocks.push({id:`${slug}-screens`,block_type:'image',block_order:blocks.length,content_json:{url:asset(slug,'detail'),alt:detailCaption,caption:detailCaption}});
    });
    return {id,kind:'webapp',title,description,image:asset(slug,'cover'),imageAlt:`Mockup ${title} dengan tampilan UI aplikasi.`,url:`/work/${slug}`,published:true,demo:false,artwork:'hub',caseStudy:{slug,appUrl,problem,solution,impact,blocks,motion:{enabled:true,title:sections[0][0],description:'',video:`/assets/motion/${slug}.mp4`,mobileVideo:`/assets/motion/${slug}-mobile.mp4`,poster:`/assets/motion/${slug}.webp`,mobilePoster:`/assets/motion/${slug}-mobile.webp`}}};
  }
  return [
    project('prompt-generator','prompt','Prompt Generator Patosser',
      'Prompt poster properti yang menjaga fokus pada fasad, spesifikasi, dan informasi yang memang perlu ditampilkan.',
      'https://patosser.my.id/prompt',
      'Agent kesulitan memberi arahan ke AI. Poster yang dihasilkan sering penuh teks dan terasa generik, sementara foto fasad dan spesifikasi listing justru kurang menonjol.',
      'Saya membuat generator dengan base prompt yang ketat. Agent memilih format dan gaya, mengisi data listing, lalu membawa prompt beserta foto properti ke ChatGPT atau AI gambar lain.',
      'Agent punya titik awal yang lebih terarah untuk membuat poster. Foto dan spesifikasi menjadi fokus brief, sementara hasil gambar tetap perlu dicek setelah dibuat oleh AI.',[
        ['Better prompts. More focused property posters.','Saya mulai dari masalah yang sering ditemui Agent saat membuat poster lewat AI. Bukan kurang pilihan desain, tetapi arahannya belum cukup jelas untuk menjaga foto properti dan informasi penting tetap menjadi fokus.'],
        ['A stricter brief, not more instructions.','Base prompt saya susun dengan batasan yang jelas: fokus pada fasad dan spesifikasi listing, batasi teks yang tidak perlu, dan hindari hasil yang terasa seperti template AI umum. Pilihan gaya membantu mengarahkan tampilan tanpa mengubah tujuan utama poster.'],
        ['Start with the listing.','Agent bisa menempelkan teks listing dan membacanya dengan bantuan AI, atau langsung mengisi data secara manual. Judul, keunggulan, spesifikasi, dan harga disusun dalam form yang bisa diperiksa sebelum menjadi prompt.'],
        ['Choose the format. Keep the focus.','Satu foto atau kolase, format Story atau Feed, gaya desain, warna, kontak Agent, dan logo bisa diatur sesuai kebutuhan. Agent tidak perlu menulis ulang seluruh arahan setiap kali ingin membuat poster baru.'],
        ['Take the prompt to your preferred AI.','Output aplikasi berupa prompt, bukan poster jadi. Agent menyalin prompt ke AI gambar yang dipakai, terutama ChatGPT, lalu mengunggah foto propertinya sendiri. Hasil akhirnya tetap bergantung pada AI yang digunakan dan perlu dicek sebelum dibagikan.'],
        ['Built around how Agents actually work.','Saya menganalisis masalahnya dari nol, menyusun alur dan fitur, lalu terus mengembangkan aplikasi. Perbaikannya mencakup penambahan fitur, respons halaman, dan penanganan bug dari pemakaian sehari-hari.'],
      ],2,'Tampilan langsung generator: pilih format, susun data listing, dan atur gaya. Spesifikasi yang diisi pada tangkapan menggunakan data ilustrasi.'),
    project('followup-patosser','followup','Follow Up & Blasting Patosser',
      'Template pesan berdasarkan tahap komunikasi buyer, dengan pilihan edit, salin, dan template pribadi.',
      'https://patosser.my.id/followup',
      'Agent perlu menyesuaikan pesan untuk calon buyer yang baru dihubungi, sudah bertanya, atau sudah survei. Menyiapkan kalimat pembuka dari awal menjadi pekerjaan yang terus berulang.',
      'Saya menyusun template berdasarkan tahap komunikasi, lalu memberi ruang untuk mengedit pesan dan menyimpan versi sendiri di Template Saya.',
      'Agent bisa mulai dari pesan yang sesuai konteks, menyesuaikannya sendiri, lalu memilih kontak atau menyalin pesan. Pengiriman tetap dijalankan oleh Agent.',[
        ['The right starting point for every follow-up.','Setiap calon buyer berada di tahap yang berbeda. Saya membuat aplikasi ini agar Agent punya titik awal yang sesuai, tanpa harus menganggap semua orang membutuhkan pesan yang sama.'],
        ['Organized around the conversation.','Template dikelompokkan menjadi Broadcast Cold Buyer, Follow Up Sudah Tanya, dan Follow Up Sudah Survey. Susunan ini membantu Agent mencari pesan dari konteks percakapan, bukan menggulir daftar panjang tanpa arah.'],
        ['A starting point, not a fixed script.','Pesan tetap diedit manual agar sesuai dengan buyer dan properti yang sedang dibahas. Agent bisa memilih kontak untuk melanjutkan komunikasi atau menyalin teks untuk digunakan sendiri.'],
        ['Make the useful messages your own.','Template Saya memberi tempat untuk membuat pesan sendiri atau memakai template yang ada sebagai awal. UI menyimpan template pribadi di browser, sehingga konteks penyimpanannya perlu diperhatikan saat berpindah perangkat.'],
        ['Improve the tool as it gets used.','Saya menangani analisis masalah, penyusunan alur, dan pengembangan fitur dari awal. Aplikasinya terus saya perbaiki, termasuk kecepatan halaman dan bug, supaya pekerjaan kecil yang berulang lebih mudah dijalankan.'],
      ],1,'Tampilan langsung kategori follow-up dan form template pribadi. Tidak ada pesan yang dikirim atau template baru yang disimpan saat pengambilan layar.'),
    project('rekap-ella','rekapella','Rekap Ella',
      'Pencatatan jam piket dan laporan bulanan untuk satu pengguna, lengkap dengan alur Telegram.',
      'https://arsndyp.my.id/rekapella/',
      'Pasangan saya mencatat jam piket murid di kertas, lalu mengecek dan memasukkannya lagi ke Google Sheets untuk rekap bulanan yang akan diaudit atasan. Informasi yang sama harus dikerjakan dua kali.',
      'Saya membuat aplikasi personal dengan input satuan, bulk, dan Telegram Bot. Laporan di aplikasi dan PDF membantu menyiapkan rekap bulanan dari catatan yang sudah terkumpul.',
      'Pencatatan harian dan laporan bulanan punya satu alur. Telegram menjadi jalur tambahan untuk mencatat, menerima rekap murid harian, dan mengingatkan pencatatan setiap hari.',[
        ['Less paperwork. A clearer monthly recap.','Aplikasi ini berangkat dari kebutuhan satu orang, pasangan saya. Tujuannya membantu menyiapkan rekap bulanan untuk audit atasan tanpa harus mengandalkan kertas lalu mengetik ulang catatan yang sama ke Google Sheets.'],
        ['Capture once, review later.','Saya menempatkan pencatatan sebagai awal alur. Tanggal, murid, dan durasi dikumpulkan saat dibutuhkan, lalu bisa dilihat lagi melalui riwayat dan laporan. Fokusnya mengurangi input berulang, bukan menghilangkan pengecekan manusia.'],
        ['One entry or a batch at a time.','Catatan bisa dimasukkan satu per satu atau sekaligus melalui input bulk. Kedua cara tersedia untuk menyesuaikan situasi, baik saat sempat mencatat langsung maupun saat perlu merapikan beberapa catatan bersama.'],
        ['Keep the daily routine within reach.','Telegram Bot menjadi jalur untuk mencatat tanpa selalu membuka web. Rekap murid harian dikirim melalui bot, disertai reminder untuk mencatat setiap hari. Alur ini saya tambahkan mengikuti kebiasaan pengguna.'],
        ['From daily records to a monthly report.','Laporan bisa diperiksa di aplikasi dan dibuat dalam format PDF untuk kebutuhan rekap bulanan. Angka dan catatannya tetap perlu ditinjau sebelum diserahkan kepada atasan.'],
        ['A personal tool, improved through use.','Saya memulai dari analisis masalah, menyusun alur dan fitur, lalu terus memperbaiki aplikasi dari pemakaian nyata. Penambahan fitur, perbaikan load halaman, dan penanganan bug menjadi bagian dari proses pengembangannya.'],
      ],2,'Rekonstruksi UI Rekap Ella dengan data ilustrasi untuk nama, jam, tanggal, dan nominal. Panel Telegram menggambarkan fitur yang dijelaskan pemilik, bukan tangkapan percakapan asli.'),
  ];
}

export function addPracticalTools(items:WorkItem[],additions:WorkItem[]=practicalTools()):WorkItem[]{
  if(additions.some(next=>items.some(item=>item.id===next.id||item.caseStudy?.slug===next.caseStudy?.slug)))throw Error('Studi kasus sudah ada. Gunakan CMS untuk mengeditnya.');
  const next=[...items];
  const last=next.reduce((at,item,index)=>item.kind==='webapp'?index:at,-1);
  next.splice(last+1,0,...additions);
  return next;
}
