import type { WorkItem } from './works';
import type { CMSBlock } from './content-blocks';

export const mbgCopy = {
  description: 'Aktivitas agent jadi poin, ranking bulanan, dan reward yang bisa dipantau dalam satu tempat.',
  problem: 'Program aktivitas agent membutuhkan aturan poin, progress, dan target reward yang mudah dipahami. Admin juga perlu mencatat aktivitas banyak agent tanpa menghitung seluruh rekap satu per satu.',
  solution: 'Saya membuat sistem gamifikasi dengan mekanisme poin, leaderboard bulanan, detail riwayat agent, input cepat dan bulk untuk admin, serta pencatatan redeem.',
  impact: 'Agent dapat melihat posisi dan asal poinnya. Admin punya alur yang lebih terstruktur untuk mencatat aktivitas, memperbarui ranking, dan memproses redeem sesuai aturan program.',
};

export function updateMBG(items: WorkItem[], cover: string): WorkItem[] {
  return items.map(item => {
    if (item.caseStudy?.slug !== 'program-mbg-real-time-leaderboard') return item;
    if (item.caseStudy.layout) throw new Error('MBG memiliki layout khusus. Gabungkan konten melalui live editor terlebih dahulu.');
    const blocks: CMSBlock[] = [];
    const add = (id: string, block_type: CMSBlock['block_type'], content_json: CMSBlock['content_json']) =>
      blocks.push({ id: `mbg-${id}`, block_type, block_order: blocks.length, content_json });
    add('intro', 'heading', { text: 'Small actions. Visible progress.', level: 2 });
    add('context', 'paragraph', { text: 'PROGRAM MBG menghubungkan aktivitas harian agent dengan poin, ranking, dan reward. Saya merancang pengalaman yang terasa seperti game, dengan podium, diamond, warna kontras, dan progress yang mudah dikenali melalui ponsel.' });
    add('rules-title', 'heading', { text: 'Make the rules easy to follow.', level: 2 });
    add('rules-copy', 'paragraph', { text: 'Setiap aktivitas memiliki nilai poin yang ditampilkan di halaman mekanisme. Reels branding, piket kantor, meeting, dan kegiatan lapangan punya bobot masing-masing. Aturan reset bulanan dan pilihan periode membantu peserta memahami konteks poin yang sedang mereka lihat.' });
    add('board-title', 'heading', { text: 'Give every point a story.', level: 2 });
    add('board-copy', 'paragraph', { text: 'Leaderboard menampilkan podium tiga besar dan urutan peserta. Dari tombol Detail Poin, agent dapat menelusuri aktivitas, tanggal, dan tambahan poin yang membentuk totalnya. Label Siap Redeem memberi petunjuk ketika poin sudah memenuhi ketentuan program.' });
    add('admin-title', 'heading', { text: 'Keep the admin work practical.', level: 2 });
    add('admin-copy', 'paragraph', { text: 'Input Cepat mendukung satu aktivitas untuk satu atau beberapa agent. Input Bulk membantu admin memilih banyak agent melalui checklist. Pilihan aktivitas menentukan nilai poin, lalu jumlah aktivitas menjadi dasar perhitungan. Alur ini menyatukan input, rekap, dan pemrosesan redeem dalam satu ruang kerja.' });
    add('loop-title', 'heading', { text: 'A reward loop people can follow.', level: 2 });
    add('loop', 'list', { items: [
      'Agent mengikuti aktivitas yang tercantum dalam mekanisme program.',
      'Admin mencatat agent, jenis aktivitas, dan jumlahnya.',
      'Poin masuk ke riwayat dan membentuk ranking pada periode terkait.',
      'Admin memproses redeem sesuai ketentuan, lalu riwayatnya dapat dilihat kembali.',
    ] });
    add('result-title', 'heading', { text: 'Motivation, with a clear record.', level: 2 });
    add('result-copy', 'paragraph', { text: 'Pendekatannya menggabungkan dorongan visual untuk berpartisipasi dengan catatan yang bisa ditelusuri. Peserta melihat progress dan posisi, sementara admin mengelola aktivitas dan reward di baliknya.' });
    add('app', 'link', { url: 'https://patosser.my.id/mbg/', label: 'Explore PROGRAM MBG', target: '_blank' });
    return {
      ...item, description: mbgCopy.description, image: cover,
      imageAlt: 'Mockup tiga ponsel PROGRAM MBG: mekanisme poin, leaderboard, dan input aktivitas admin.',
      caseStudy: { ...item.caseStudy, problem: mbgCopy.problem, solution: mbgCopy.solution, impact: mbgCopy.impact, appUrl: 'https://patosser.my.id/mbg/', blocks },
    };
  });
}
