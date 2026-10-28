import { ExternalLink } from 'lucide-react';
import { AdminLink } from '@/components/admin/AdminLink';
import '@/components/admin/works-manager.css';

export default function TemplateArchivePage() {
  return (
    <section className="works-manager">
      <header className="wm-heading"><div><h1>Arsip template</h1><p>Desain tersimpan untuk referensi.</p></div></header>
      <article className="wm-message" style={{ marginTop: 28, maxWidth: 760 }}>
        <h2>Portfo · Editorial</h2>
        <p style={{ marginBlock: '12px 20px' }}>Template sebelumnya: drawer kanan, kartu bento, dan panel kontak kaca gelap. What I Do sudah digunakan di website aktif.</p>
        <AdminLink className="wm-button" href="/api/admin/templates/portfo/index.html" target="_blank" rel="noopener noreferrer">Lihat arsip <ExternalLink size={18} aria-hidden="true" /></AdminLink>
        <p style={{ marginTop: 16 }}>Preview terpisah dari konten CMS. Template ini tidak dipublikasikan.</p>
      </article>
    </section>
  );
}
