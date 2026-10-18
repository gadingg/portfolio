# Live editor — 18 Oktober 2026

Mode: Operate. Pemilik menyetujui panel konten ringkas, template dan urutan bagian, serta simpan draft/publikasi manual. Pertanyaan grilling sudah dijawab sebelum implementasi.

Klik teks, gambar, atau tombol membuka panel konten. Pengaturan CSS, font, border, layout teknis, struktur berlapis, drag/drop bebas, dan duplikasi elemen tidak ditampilkan. Mesin GrapesJS mempertahankan layout, stylesheet, history, dan serialisasi yang sudah ada. Teks dibagi mengikuti node aslinya agar penekanan dan ikon tetap utuh.

Bagian disajikan sebagai daftar satu tingkat. Tambahan ditempatkan setelah bagian terpilih atau di akhir main. Tombol pindah nonaktif di batas daftar; hapus memerlukan konfirmasi dan bisa diurungkan. Koleksi dinamis diarahkan ke Works.

Status awal, perubahan belum disimpan, penyimpanan, publikasi, unggah, dan kegagalan ditampilkan. Save/publish saling terkunci. Hasil sanitasi server diselaraskan kembali ke kanvas; bila perlu memuat ulang model, history kanvas direset agar markup yang sudah ditolak tidak dikembalikan oleh undo. Pratinjau tampilan dibedakan dari halaman draft tersimpan.

Panel mobile menggunakan backdrop, fokus awal/tahanan tab, Escape dan pengembalian fokus. Input 16px, target tombol minimal 44px. Identitas Manrope, gelap hangat, dan aksen amber mengikuti editor incumbent. Halaman publik dan token global tidak diubah.

Validasi memakai fixture lokal berlabel data uji dan transport memori, bukan sesi admin palsu atau database asli. Fixture dikeluarkan sebelum build final. Upload/pustaka media menggunakan komponen lama dan tidak dieksekusi terhadap CMS asli.
