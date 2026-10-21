import type { WorkItem } from './works';
import type { CMSBlock } from './content-blocks';

export const personalDailyId = 'personal-daily';

export function personalDaily(cover: string): WorkItem {
  const blocks: CMSBlock[] = [];
  const section = (id: string, title: string, text: string) => {
    blocks.push({ id: `${id}-heading`, block_type: 'heading', block_order: blocks.length, content_json: { text: title, level: 2 } });
    blocks.push({ id, block_type: 'paragraph', block_order: blocks.length, content_json: { text } });
  };
  section('personal-context', 'Daily life, in one place.', 'Setelah membuat daily app untuk kantor, saya bikin versi yang lebih personal. Tempat untuk mencatat pengeluaran, menyimpan tugas dan link, serta mengikuti rutinitas di luar aktivitas kantor.');
  section('personal-problem', 'Too many apps for one daily routine.', 'Untuk mencatat pengeluaran, mengatur tugas, dan menjaga kebiasaan, saya harus memasang beberapa aplikasi. Catatan jadi terpencar dan saya perlu bolak-balik untuk melihat keseharian sendiri.');
  section('personal-solution', 'Less switching. More doing.', 'Saya menyatukan kebutuhan tersebut dalam satu aplikasi. Home memberi ringkasan harian, lalu navigasi bawah membawa saya langsung ke Finance, Progress, To-Do, dan pengaturan pribadi.');
  section('personal-finance', 'Know where the money goes.', 'Finance menampilkan transaksi dan pengeluaran per kategori. Grafik dan pilihan periode membantu saya membaca kebiasaan belanja tanpa menyusun rekap dari awal.');
  section('personal-progress', 'Make small habits visible.', 'Check-in, kalender, dan streak membuat rutinitas ibadah serta belajar bisa diikuti dari hari ke hari. Fokusnya melihat konsistensi, termasuk saat harus mulai lagi.');
  section('personal-tasks', 'Keep the little things together.', 'To-Do dan Link Library menyediakan tempat untuk tugas serta tautan yang ingin dibuka kembali. Kebutuhan kecil sehari-hari tidak perlu tersebar di beberapa aplikasi.');
  section('personal-outcome', 'Built around my everyday.', 'Dari kebutuhan pribadi, menjadi aplikasi yang terus saya sesuaikan sambil dipakai. Keuangan, tugas, dan rutinitas sekarang punya satu tempat untuk dilihat kembali.');
  blocks.push({ id: 'personal-illustration-note', block_type: 'paragraph', block_order: blocks.length, content_json: { text: 'Seluruh nominal, transaksi, tugas, dan riwayat kebiasaan pada mockup menggunakan data ilustrasi.' } });
  return {
    id: personalDailyId, kind: 'webapp', title: 'Literally,, My Daily App',
    description: 'Keuangan, tugas, dan kebiasaan harian dalam satu aplikasi pribadi. Berangkat dari kebutuhan sendiri, dibuat untuk dipakai setiap hari.',
    image: cover, imageAlt: 'Mockup tiga ponsel Daily App: Finance, Home, dan Progress dengan data ilustrasi di latar putih silver.',
    url: '/work/mydaily', published: true, demo: false, artwork: 'hub',
    caseStudy: {
      slug: 'mydaily', appUrl: 'https://dailyappgading.vercel.app/',
      problem: 'Catatan terpencar dan harus memasang beberapa aplikasi untuk mengurus keuangan, tugas, serta kebiasaan harian.',
      solution: 'Satu aplikasi pribadi yang menggabungkan ringkasan harian, Finance, Progress, To-Do, dan Link Library.',
      impact: 'Kebutuhan harian terkumpul dalam satu tempat. Aplikasi terus saya sesuaikan dari pengalaman pemakaian pribadi.', blocks,
    },
  };
}

export function addPersonalDaily(items: WorkItem[], cover: string): WorkItem[] {
  if (items.some(item => item.id === personalDailyId || item.caseStudy?.slug === 'mydaily'))
    throw new Error('Personal Daily App sudah ada. Edit melalui CMS agar perubahan tetap terjaga.');
  const next = [...items];
  const office = next.findIndex(item => item.id === 'mega-app');
  const lastWeb = next.reduce((last, item, index) => item.kind === 'webapp' ? index : last, -1);
  next.splice((office >= 0 ? office : lastWeb) + 1, 0, personalDaily(cover));
  return next;
}
