import type { Project } from '@/types/portfolio';

export const projectPresentations: Record<string, {
  title: string; intro: string; problem: string; solution: string; impact: string;
  url: string; artwork: 'listing' | 'meta' | 'mbg';
  sections: { title: string; body: string }[];
}> = {
  'internal-listing-hub': {
    title: 'Internal Listing Hub',
    intro: 'Dari listing yang tersebar di grup WhatsApp menjadi portal pencarian dan perbandingan properti dalam satu tempat.',
    problem: 'Agent harus scroll chat dan membuka listing satu per satu untuk mencari properti yang sesuai kebutuhan klien.',
    solution: 'Saya mengubah rekap spreadsheet menjadi portal dengan search, filter, harga per m², dan benchmark area AREBI.',
    impact: 'Agent lebih mudah mencari, membuat shortlist, dan membandingkan properti sebelum memberi rekomendasi ke klien.',
    url: 'https://listinghub-patos.vercel.app/all', artwork: 'listing',
    sections: [
      { title: 'Start with the workflow.', body: 'Informasi listing sebenarnya sudah ada. Masalahnya, agent perlu membuka chat, mencari keyword, lalu membandingkan properti satu per satu. Saya menggunakan rekap spreadsheet yang sudah dikelola admin sebagai dasar pencarian yang lebih fleksibel.' },
      { title: 'Find what fits.', body: 'Listing bisa dicari dan difilter berdasarkan area, jenis properti, LT, LB, harga, dan parameter dari master sheet. Agent bisa mempersempit pilihan sesuai kebutuhan klien.' },
      { title: 'Give the numbers context.', body: 'Harga per meter persegi membantu perbandingan value. Kamus harga AREBI menjadi acuan area untuk melihat apakah sebuah listing relatif lebih rendah, sesuai, atau lebih tinggi dari benchmark.' },
      { title: 'From searching to shortlisting.', body: 'Data yang sebelumnya sulit dicari ulang sekarang bisa dibaca dan dibandingkan dalam satu tempat. Agent lebih mudah menyiapkan pilihan sebelum memberikan rekomendasi kepada klien.' },
    ],
  },
  'meta-ads-campaign-system': {
    title: 'Meta Ads Reporting & Performance Hub',
    intro: 'Report sekali, datanya bisa dipakai lagi. Satu workflow untuk reporting campaign, history iklan, dan evaluasi performa leads.',
    problem: 'Report dibuat manual di Figma, history campaign tersebar, dan pemilihan PIC belum punya indikator kinerja yang jelas.',
    solution: 'Saya menyatukan reporting, tracking leads, history campaign, kinerja agent, subsidi ads, dan rekomendasi AI dalam satu dashboard.',
    impact: 'Reporting lebih terstruktur, history mudah ditelusuri, dan evaluasi PIC punya dasar yang lebih objektif.',
    url: 'https://patosser.my.id/meta/', artwork: 'meta',
    sections: [
      { title: 'The data was already there.', body: 'Saya sebelumnya membuka Ads Manager, mengambil preview iklan, lalu menyusun report satu per satu di Figma. Data campaign ada, tetapi belum terkumpul untuk evaluasi berikutnya.' },
      { title: 'Report once. Use it again.', body: 'Campaign, hasil performance, dan preview iklan dicatat dalam satu sistem. History menyimpan listing, periode, PIC, dan respon audiens sehingga campaign lebih mudah ditelusuri.' },
      { title: 'Make evaluation more objective.', body: 'Distribusi leads dan kinerja agent memberi gambaran jumlah campaign, respon WhatsApp yang ditangani, serta bulan aktif. Program subsidi ads personal juga punya rekap budget dan hasil leads yang lebih jelas.' },
      { title: 'Turn the recap into a next action.', body: 'Konsultan AI membaca data yang telah direkap untuk membantu mencari campaign bermasalah, melihat iklan terbaik, mengevaluasi PIC, dan menyusun rekomendasi berikutnya.' },
      { title: 'Marketing impact, with context.', body: 'Pengelolaan budget Meta Ads IDR 20M turut berkontribusi pada 3 property closings dan IDR 118M gross commission. Hasil ini merupakan kontribusi bersama proses marketing dan penanganan leads, bukan revenue yang dihasilkan iklan sendirian.' },
    ],
  },
  'program-mbg-real-time-leaderboard': {
    title: 'PROGRAM MBG Leaderboard',
    intro: 'Sistem gamification yang membuat aktivitas agent lebih seru melalui poin, ranking, dan reward yang terlihat jelas.',
    problem: 'Aktivitas agent perlu punya progress dan target reward yang mudah dipantau agar program terasa lebih kompetitif.',
    solution: 'Saya membuat alur input aktivitas, perhitungan poin otomatis, live leaderboard, dan penukaran poin menjadi reward.',
    impact: 'Agent bisa melihat progress dan mengejar ranking. Admin lebih mudah menginput, menghitung, dan memperbarui poin.',
    url: 'https://patosser.my.id/mbg/', artwork: 'mbg',
    sections: [
      { title: 'Make progress visible.', body: 'Saya ingin program aktivitas agent terasa lebih seru dan kompetitif. Ranking, total poin, dan target reward perlu terlihat agar setiap aktivitas punya progress yang bisa diikuti.' },
      { title: 'A simple reward loop.', body: 'Agent melakukan aktivitas, memperoleh poin, naik di leaderboard, lalu menukarkan poin menjadi reward uang tunai sesuai aturan program. Alurnya dibuat mudah dipahami sejak awal.' },
      { title: 'Keep the administration practical.', body: 'Poin bisa dimasukkan satu per satu atau secara bulk. Perhitungan otomatis dan live leaderboard membantu admin memperbarui ranking tanpa menghitung ulang seluruh rekap.' },
      { title: 'A clearer reason to participate.', body: 'Agent bisa memantau progress dan mengejar posisi dengan reward yang nyata. Di sisi admin, input aktivitas, perhitungan poin, dan pembaruan ranking menjadi lebih terstruktur.' },
    ],
  },
};

const legacyCovers = new Set([
  '4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
  '26f04b2b-4ba5-4f3b-baef-c3dfdc2d08a5_1600w.webp',
  '5bab247f-35d9-400d-a82b-fd87cfe913d2_1600w.webp',
  '30104e3c-5eea-4b93-93e9-5313698a7156_1600w.webp',
]);

export function useBriefArtwork(project: Project) {
  if (!projectPresentations[project.slug]) return false;
  const filename = project.cover_image_url?.split('/').pop()?.split('?')[0];
  return !filename || legacyCovers.has(filename);
}
