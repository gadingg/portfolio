import type { WorkItem } from './works';
import type { CMSBlock } from './content-blocks';

export const listingHubCopy = {
  description: 'Cari seluruh database properti dan kelola listing personal dalam dua aplikasi yang saling melengkapi.',
  problem: 'Database bersama dan catatan listing personal punya kebutuhan berbeda. Agent perlu mencari properti lintas tim, sekaligus merapikan foto, spesifikasi, dan status listing miliknya sendiri.',
  solution: 'Saya membuat dua aplikasi: All Database untuk pencarian dan perbandingan properti, serta Personal Listing sebagai pengganti Google Keep untuk pengelolaan listing per agent.',
  impact: 'Pencarian database dan pengelolaan listing personal punya tempat masing-masing. Agent dapat menemukan properti, meninjau informasi, dan menyiapkan spesifikasi untuk dibagikan ke klien.',
};

export type ListingHubMedia = { cover: string };

export function updateListingHub(items: WorkItem[], media: ListingHubMedia): WorkItem[] {
  return items.map(item => {
    if (item.caseStudy?.slug !== 'internal-listing-hub') return item;
    if (item.caseStudy.layout) throw new Error('Listing Hub memiliki layout khusus. Gabungkan konten melalui live editor terlebih dahulu.');
    const blocks: CMSBlock[] = [];
    const add = (id: string, block_type: CMSBlock['block_type'], content_json: CMSBlock['content_json']) =>
      blocks.push({ id: `listing-${id}`, block_type, block_order: blocks.length, content_json });
    add('intro', 'heading', { text: 'Find faster. Manage better.', level: 2 });
    add('context', 'paragraph', { text: 'Satu kebutuhan kerja, dua aplikasi. All Database membantu agent mencari properti dari database bersama. Personal Listing membantu setiap agent mengelola listing miliknya melalui alamat seperti /gading.' });
    add('database-title', 'heading', { text: 'All Database', level: 2 });
    add('database-copy', 'paragraph', { text: 'Listing yang tersebar sulit ditelusuri ulang saat ada kebutuhan klien. Saya menyusun portal pencarian dengan filter properti, harga per m², acuan tanah AREBI, dan daftar tersimpan. Agent dapat mempersempit pilihan, membandingkan informasi, lalu menyalin spesifikasi atau membagikannya ke klien melalui WhatsApp.' });
    add('database-link', 'link', { url: 'https://listinghub-patos.vercel.app/all', label: 'Open All Database', target: '_blank' });
    add('personal-title', 'heading', { text: 'Personal Listing', level: 2 });
    add('personal-copy', 'paragraph', { text: 'Catatan Google Keep membantu menyimpan informasi, tetapi pengelolaan listing membutuhkan foto, spesifikasi, dan status yang lebih terstruktur. Personal Listing menyediakan ruang per agent untuk mengunggah properti, memperbarui detail, mengubah status Active, Hold, atau Sold, dan menyalin spesifikasi WhatsApp. Data catatan dan foto dari Google Keep juga dapat diimpor melalui ekspor Google Takeout.' });
    add('personal-link', 'link', { url: 'https://listinghub-patos.vercel.app/gading', label: 'Open Personal Listing', target: '_blank' });
    add('result-title', 'heading', { text: 'Built around the way agents work.', level: 2 });
    add('result-copy', 'paragraph', { text: 'Kedua aplikasi menangani bagian berbeda dari pekerjaan agent. Database bersama menjadi tempat mencari dan membandingkan properti. Listing personal menjadi tempat merapikan informasi yang dikelola sendiri. Fokus saya adalah membuat informasi lebih mudah ditemukan, diperbarui, dan digunakan kembali.' });
    return {
      ...item, description: listingHubCopy.description, image: media.cover,
      imageAlt: 'Mockup mobile All Database dan Personal Listing dalam dua ponsel berlatar hijau gelap.',
      caseStudy: { ...item.caseStudy, problem: listingHubCopy.problem, solution: listingHubCopy.solution, impact: listingHubCopy.impact, appUrl: 'https://listinghub-patos.vercel.app/all', blocks },
    };
  });
}
