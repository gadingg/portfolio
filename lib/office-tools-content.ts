import type {WorkItem} from './works';
import type {CMSBlock} from './content-blocks';

export const officeToolIds=['scan-parking','ular-tangga','spin-event'] as const;
const image=(slug:string,name:string)=>`/assets/work/office-tools/${slug}-${name}.webp`;

export function officeTools():WorkItem[]{
  function project(id:string,slug:string,title:string,description:string,appUrl:string,problem:string,solution:string,impact:string,sections:[string,string][],caption:string):WorkItem{
    const blocks:CMSBlock[]=[];
    sections.forEach(([heading,text],index)=>{
      blocks.push({id:`${slug}-heading-${index}`,block_type:'heading',block_order:blocks.length,content_json:{text:heading,level:2}});
      blocks.push({id:`${slug}-text-${index}`,block_type:'paragraph',block_order:blocks.length,content_json:{text}});
      if(index===1)blocks.push({id:`${slug}-screens`,block_type:'image',block_order:blocks.length,content_json:{url:image(slug,'detail'),alt:caption,caption}});
    });
    return {id,kind:'webapp',title,description,image:image(slug,'cover'),imageAlt:`Mockup ${title} dengan data ilustrasi.`,url:`/work/${slug}`,published:true,demo:false,artwork:'hub',caseStudy:{slug,appUrl,problem,solution,impact,blocks,motion:{enabled:false,title:'',description:'',video:'',mobileVideo:'',poster:'',mobilePoster:''}}};
  }
  return [
    project('scan-parking','parking','PATOS Scan Parking',
      'Dari scan karcis ke rekap karyawan, nominal reimburse, dan PDF siap cetak.',
      'https://patos-scan-parking.vercel.app/',
      'Admin harus merekap karcis parkir secara manual, memotong kertas, dan merapikan fotokopi struk untuk reimburse. Menyiapkan bukti menjadi pekerjaan tersendiri sebelum rekap bisa diperiksa.',
      'Saya memindahkan alurnya ke aplikasi: scan karcis, simpan ke database sesuai karyawan, lalu susun rekap beserta nominal reimburse dan PDF siap cetak.',
      'Bukti parkir dan rekapnya tersusun per karyawan. Admin bisa meninjau catatan dan menyiapkan dokumen reimburse dari data yang sama.',
      [
        ['Less paperwork. Clearer reimbursements.','Masalahnya ada di pekerjaan kecil yang menumpuk: mengumpulkan struk, memfotokopi, memotong, lalu menyusunnya lagi. Saya membuat aplikasi ini supaya persiapan reimburse tidak selalu dimulai dari tumpukan kertas.'],
        ['Keep each receipt with the right person.','Karcis dipindai melalui aplikasi dan disimpan sesuai karyawan. Bukti serta catatannya punya tempat yang jelas di database, sehingga tidak perlu dicari lagi dari lembaran yang terpisah.'],
        ['Review the records before printing.','Rekap membantu admin melihat bukti parkir berdasarkan karyawan dan periode. Catatan bisa diperiksa lebih dulu sebelum dipakai sebagai dasar pengajuan reimburse.'],
        ['A recap ready for the next step.','Aplikasi menyiapkan nominal reimburse dan rekap PDF yang siap dicetak. Alurnya menghubungkan bukti yang sudah terkumpul dengan dokumen yang diperlukan admin.'],
        ['Start with the bottleneck.','Saya memulai dari beban kerja admin, lalu menyusun alur dari pengambilan bukti sampai rekap. Fokusnya membuat urusan berulang lebih mudah ditangani, dengan bukti tetap tersedia untuk diperiksa.'],
      ],'Preview UI dengan data ilustrasi. Nama karyawan, tanggal, karcis, dan nominal pada mockup bukan catatan reimburse asli.'),
    project('ular-tangga','ulartangga','Ular Tangga Patosser',
      'Pendamping permainan untuk mencatat giliran, reward Agent, dan rekap per periode.',
      'https://patosser.my.id/ulartangga',
      'Permainan gamifikasi kantor membutuhkan catatan yang jelas: siapa yang sudah bermain, hasil tiap Agent, dan total reward yang perlu direkap.',
      'Saya membuat alur daftar pemain, pencatatan reward per giliran, dan rekap dalam satu aplikasi. Operator bisa mengikuti permainan sambil menjaga catatannya tetap tersusun.',
      'Status bermain dan hasil Agent bisa ditinjau dari daftar yang sama. Rekap periode, total klaim, dan pilihan cetak membantu menyiapkan rangkuman setelah permainan.',
      [
        ['Keep the game moving. Keep the results clear.','Aplikasi ini mendampingi permainan ular tangga dalam program gamifikasi kantor. Yang saya rapikan adalah alur operator saat menyiapkan peserta, mencatat hasil, dan melihat rekapnya.'],
        ['Set up the players, then follow the turns.','Daftar pemain disiapkan per periode. Tampilan pemain menampilkan status sudah atau belum bermain, sementara tampilan Main membantu operator berfokus pada satu giliran.'],
        ['Record the reward as it happens.','Operator dapat memilih reward, mencatat hasil zonk, atau memasukkan nominal lain. Hasilnya terhubung ke Agent yang sedang bermain, sehingga catatan tidak terlepas dari giliran.'],
        ['See the session as a whole.','Rekap menggabungkan status bermain, hasil tiap Agent, dan total klaim. Filter serta pencarian membantu meninjau hasil, dengan pilihan salin rekap WhatsApp dan cetak atau PDF.'],
        ['Give each period a clear ending.','Rekap bisa dikunci setelah sesi selesai dan dilihat kembali berdasarkan periode. Alur ini memberi batas yang jelas antara hasil permainan yang masih berjalan dan catatan yang sudah dirapikan.'],
      ],'Tampilan aplikasi melalui preview lokal dengan data ilustrasi. Nama Agent, listing, giliran, dan nominal reward tidak berasal dari hasil permainan asli.'),
    project('spin-event','spin','Spin Wheel & Team Draw',
      'Konfirmasi peserta, pembagian empat tim, dan undian doorprize untuk event 17 Agustus.',
      'https://script.google.com/macros/s/AKfycbz8mW41f2gLEfBLGaIUgn1Dpm4pEawbejj4IL8lBJ6X2RVT2lC-iQVQ1u_EcJI0ccwK/exec',
      'Saat event 17 Agustus, daftar peserta perlu cocok dengan yang hadir. Pembagian tim dan undian doorprize sama-sama bergantung pada data tersebut.',
      'Saya menempatkan konfirmasi kehadiran, pembagian empat tim, dan spin wheel dalam satu aplikasi. Operator berpindah alur memakai daftar peserta yang sama.',
      'Peserta yang hadir dapat dibagi ke dalam tim dan masuk ke undian. Status peserta serta pilihan mengeluarkan pemenang dari wheel membantu operator mengikuti jalannya acara.',
      [
        ['Set the teams. Keep the event moving.','Saya membuat aplikasi ini untuk mendukung permainan dan undian saat event 17 Agustus. Kebutuhannya praktis: peserta bisa dikelola, tim bisa dibagi, dan doorprize bisa dijalankan dari satu tempat.'],
        ['Start with who is actually there.','Operator bisa mengimpor daftar nama dan memeriksa kehadiran sebelum acara berjalan. Daftar peserta juga bisa dicari serta difilter berdasarkan kantor dan status.'],
        ['Make room for four teams.','Peserta yang hadir bisa diacak ke empat tim: Oren, Hijau, Coklat, dan Pink. Hasil pembagian ditampilkan per tim, sehingga operator dapat melihat susunannya tanpa memindahkan nama satu per satu.'],
        ['A wheel connected to the participant list.','Undian memakai peserta berstatus hadir. Tersedia pilihan untuk mengeluarkan pemenang setelah spin agar tidak terpilih lagi pada putaran berikutnya.'],
        ['Keep the operator in control.','Pembagian tim, doorprize, dan data peserta dipisah menjadi tab yang jelas. Saya menyusun alurnya supaya operator bisa menyiapkan data, menjalankan acara, lalu memeriksa status peserta saat dibutuhkan.'],
      ],'Preview lokal dari UI aplikasi dengan data ilustrasi. Nama, jumlah peserta, dan susunan tim pada mockup bukan dokumentasi hasil event asli.'),
  ];
}
