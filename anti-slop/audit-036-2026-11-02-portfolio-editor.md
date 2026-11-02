# Audit UX editor tambah/edit portofolio

Tanggal: 2 November 2026.
Lingkup: Web App/Studi Kasus, Visual Design, Video, media picker, dan publikasi.
Metode: tiga screenshot dari pemilik, pembacaan kode lokal, dan dokumentasi CMS resmi. Tidak menjalankan CRUD atau mengubah UI pada audit ini. Audit ini tidak menyatakan seluruh fungsi telah diuji lewat browser.

## Kesimpulan

Formulir meminta pemilik memahami struktur data dan beberapa cara mengedit halaman sebelum bisa menerbitkan satu portofolio. Pengisian konten, pengelolaan aset, pengaturan publikasi, AI, dan pengaturan halaman belum mempunyai batas yang jelas.

Perbaikan sebelumnya mengurangi beberapa label tombol dan memindahkan pesan keberhasilan ke toast. Itu berguna, tetapi belum menyederhanakan struktur form. Screenshot masih memperlihatkan beberapa elemen lama; temuan di bawah dipisahkan dari masalah yang sudah berubah di kode lokal.

Mode yang dibutuhkan: Operate. ENERGY 1 / RHYTHM 1 / MOTION 1. Prioritasnya menyelesaikan pekerjaan dengan urutan yang bisa dipahami, memakai warna navy/amber dan Manrope yang sudah ada.

## Temuan terverifikasi

| Prioritas | Temuan dan bukti | Dampak | Rekomendasi |
|---|---|---|---|
| P1 | Satu formulir menangani tiga jenis konten, kategori yang bisa diubah, visibilitas, dan pengaturan lanjutan. WorksManager.tsx:475–622. | Pemilik melihat keputusan yang belum relevan dan tidak tahu urutan kerja. | Jenis dipilih sebelum membuat item; tampilkan form khusus jenis tersebut. Pemindahan jenis menjadi aksi sekunder yang menjelaskan dampaknya. |
| P1 | Edit halaman di header dan Buka editor visual di dalam Isi studi kasus memanggil openVisual yang sama. WorksManager.tsx:476,609. | Terlihat seperti dua editor dengan fungsi berbeda. | Pertahankan satu jalur editor halaman opsional. Isi cerita utama tetap dapat ditulis di form biasa. |
| P1 | Web app menaruh slug, tombol aplikasi, animasi alur, cerita, editor teks/gambar atau blok, editor visual, serta preview di satu disclosure. WorksManager.tsx:562–619. | Membuka satu panel justru membuka beban terbesar sekaligus. | Cerita utama terlihat langsung. Pisahkan Cerita, Media pendukung, dan Pengaturan berdasarkan tugas; fitur lanjutan tetap opsional. |
| P1 | Animasi alur tetap merender uploader video desktop dan mobile saat enabled=false. CaseMotionEditor.tsx:13–17. | Fitur yang dimatikan masih terlihat perlu diisi. | Ketika mati, cukup tampilkan kontrol aktifkan. Kolom lain muncul setelah aktif. |
| P1 | Video file memiliki upload/library dan URL MP4/WebM sebagai dua pintu untuk videoFile yang sama. VideoSourceEditor.tsx:35–40. | Pengguna bertanya sumber mana yang aktif dan apakah semua wajib diisi. | Satu area Video utama. Pilih Upload video atau Link Instagram; tautan file langsung menjadi opsi di dalam pemilihan media, bukan panel besar terpisah. |
| P1 | Validasi publish mengambil pesan masalah pertama dan meletakkannya di error halaman. WorksManager.tsx:184. | Pengguna harus mencari sendiri kolom yang salah, termasuk kolom dalam panel tertutup. | Buka panel terkait, fokuskan kolom pertama yang salah, dan tampilkan error dekat kolom. Ringkasan singkat hanya jika ada beberapa kesalahan. |
| P2 | Judul baru dan judul edit sama-sama Edit portofolio setelah item dibuat. WorksManager.tsx:246, halaman detail. | Tidak jelas apakah pengguna membuat item baru atau mengubah item lama. | Tambah studi kasus / Tambah desain / Tambah video untuk item baru; gunakan judul item saat mengedit. |
| P2 | Status draft di toolbar, checkbox Tampilkan di portofolio, dan label Siap ditampilkan di preview menjelaskan keadaan berbeda. WorksManager.tsx:525–534,652+. | Siap ditampilkan bisa disalahartikan sebagai sudah tayang. | Satu status publikasi: Draft / Ada perubahan / Tayang / Disembunyikan. Kesiapan kolom ditangani oleh validasi, bukan status preview lain. |
| P2 | Video muncul sebagai player, gambar thumbnail tersendiri, dan gambar preview kartu di sidebar. VideoSourceEditor.tsx dan WorksManager.tsx:652+. | Form panjang dengan pengulangan visual yang tidak sebanding dengan tugasnya. | Player tetap ada untuk memeriksa video. Thumbnail menjadi baris kecil dengan Ganti; preview kartu dibuka saat diperlukan. |
| P2 | Hapus video dari portofolio hanya mengosongkan videoFile. VideoSourceEditor.tsx:38. | Terdengar seperti menghapus seluruh item atau berkas di storage. | Gunakan Lepas video, letakkan dalam menu aset. Sampah tetap khusus item portofolio. |
| P2 | Pengaturan tambahan mencampur deskripsi gambar, URL gambar mentah, dan flag Portofolio contoh. WorksManager.tsx:622+. | Pengaturan teknis dan status internal tampil seperti bagian pekerjaan rutin. | Alt text berada bersama aset dan diberi label jelas; URL menjadi opsi teknis; flag contoh disembunyikan dari alur normal tanpa mengubah data/statistiknya. |
| P2 | BlockEditor menawarkan sebelas jenis blok, lalu tombol Tambah gambar dan Tambah galeri di luar pemilih yang sudah memuat keduanya. BlockEditor.tsx:8+, pemilih Tambah bagian. | Aksi yang sama muncul melalui beberapa kontrol. | Satu Tambah bagian. Pilihan umum: Teks, Gambar, Judul; jenis lain dalam daftar lanjutan. |
| P2 | Visual Design memakai satu image per WorkItem, sementara bulk upload membuat beberapa item terpisah. lib/works.ts dan WorksManager.importImages. | Cover bisa memberi kesan ada galeri proyek yang belum diisi. | Label Gambar desain dan jelaskan hasil bulk import di level koleksi. Galeri dalam satu proyek adalah perluasan model data, bukan sekadar perubahan label. |
| P3 | Bahasa bercampur: Publish, Publishing, Preview, Thumbnail, Cover, Deskripsi gambar, Editor visual lanjutan. | Pemilik harus menafsirkan istilah untuk operasi yang berhubungan. | Tentukan kosakata operasional yang konsisten dan pendek. Pertahankan nama navigasi yang sudah disetujui. |

Prioritas di sini menggambarkan hambatan UX, bukan klaim pelanggaran WCAG atau hasil benchmark.

## Struktur yang disarankan

### Masuk dari koleksi

Tambah portofolio membuka pilihan jenis: Web App / Studi Kasus, Visual Design, Video. Jika masuk dari kategori yang sudah dipilih, langsung buka jenis tersebut. Import banyak file dipisahkan sebagai aksi koleksi.

### Kerangka editor bersama

- Header ringkas: Kembali, judul item, satu status simpan, Pratinjau, dan satu aksi utama Terbitkan atau Perbarui.
- Form utama mengikuti jenis konten.
- Pengaturan sekunder tersedia tetapi tidak terbuka sejak awal.
- Pratinjau publik disajikan saat diminta; jangan memuat sidebar preview kartu besar di semua form.
- Draft disimpan otomatis; penerbitan tetap satu klik menggunakan isi terbaru. Tidak ada langkah Simpan draft yang wajib sebelum Terbitkan.
- Keberhasilan operasi memakai toast kanan atas. Error isian tetap di dekat kolom.
- Sampah item terpisah dari Lepas/Ganti aset media.

Ini susunan form, bukan wizard wajib yang menambah klik Next/Back.

### Web App / Studi Kasus

Utama: judul, ringkasan singkat, cover, Masalah, Solusi, Hasil, dan link aplikasi opsional.
Cerita panjang ditambahkan per bagian melalui satu kontrol Tambah bagian.
Opsional: media pendukung, video demo, AI, editor halaman, dan pengaturan alamat.
Alamat awal dapat disarankan dari judul; perubahan alamat manual tetap harus mempertahankan alias yang sudah didukung.
Nama Live Editor Landing Page dipakai untuk homepage. Editor studi kasus diberi nama Edit halaman studi kasus agar keduanya tidak tertukar.

### Visual Design

Utama: judul dan gambar desain.
Opsional: keterangan singkat dan tautan proyek.
Mengklik gambar membuka penggantian media; tidak perlu menampilkan URL storage pada form normal.
Jangan menjanjikan galeri beberapa gambar di satu item sebelum model data dan pemutarnya mendukungnya.

### Video

Utama: judul, satu sumber video yang dipilih secara eksplisit, player untuk memeriksa hasil, dan thumbnail ringkas.
Upload dan Instagram adalah pilihan alternatif, bukan daftar tugas yang semuanya perlu diselesaikan.
Cover otomatis dari upload tetap dipakai; Ganti thumbnail tersedia bila pemilik ingin menggantinya.
Ambil frame sekarang ditempatkan di menu thumbnail.
Keterangan singkat opsional. Direct MP4/WebM tetap tersedia sebagai opsi teknis dalam pemilihan sumber.

## Usulan copy

| Saat ini | Usulan |
|---|---|
| Edit portofolio untuk item baru | Tambah video / Tambah desain / Tambah studi kasus |
| Video yang ditampilkan | Sumber video |
| File video | Upload video |
| Pakai gambar ini sebagai thumbnail | Ambil frame sekarang |
| Hapus video dari portofolio | Lepas video |
| URL gambar | Tautan file, hanya dalam opsi teknis |
| Deskripsi gambar | Deskripsi gambar untuk aksesibilitas |
| Siap ditampilkan pada preview | Hapus status ini; gunakan status publikasi di header |
| Preview draft | Pratinjau |
| Publish | Terbitkan untuk pertama kali; Perbarui untuk versi baru |
| Publishing… | Menerbitkan… |

Tombol baru harus tetap merefleksikan operasi sebenarnya. Terbitkan tidak berarti item sudah tayang sebelum respons server berhasil.

## Perbandingan CMS dan referensi

- WordPress membagi editor menjadi toolbar, area isi, dan panel pengaturan. Referensinya adalah pemisahan tugas, bukan menyalin semua fitur Gutenberg: https://wordpress.org/documentation/article/wordpress-block-editor/
- Sanity menyediakan field groups untuk mengelompokkan kolom dan mengurangi beban isian: https://www.sanity.io/docs/studio/field-groups
- Shopify mengumpulkan upload, drag/drop, media tersimpan, dan penambahan URL dalam area Media; Add from URL berada di dalam Select existing: https://help.shopify.com/en/manual/products/product-media/add-media
- Style UI ditinjau sebagai direktori. shadcn/ui relevan untuk Field, Dialog, Dropdown Menu, dan Collapsible; tidak perlu mengadopsi generator background/efek dekoratif untuk editor operasional: https://style.ai.id/
- Find Skills menemukan web-design-guidelines dari vercel-labs/agent-skills. Sumber resmi dan repositori diverifikasi, tanpa memasang paket baru: https://skills.sh/vercel-labs/agent-skills/web-design-guidelines dan https://github.com/vercel-labs/agent-skills
- Antislop UI dan copywriting diterapkan pada analisis: hapus duplikasi, pendekkan instruksi, pertahankan batas ukuran file, label aksesibilitas, error pemulihan, dan status faktual.

## Urutan implementasi yang disarankan

1. Pisahkan form berdasarkan jenis dan rapikan header/status.
2. Satukan pengelolaan media dan hilangkan pintu masuk editor yang berulang.
3. Terapkan pengaturan kondisional serta validasi yang mengarahkan pengguna.
4. Uji tambah, upload/pilih media, autosave/offline, pratinjau, terbitkan/perbarui, ganti/lepas media, dan Sampah/Pulihkan untuk tiap jenis.

Kriteria selesai: satu aksi utama per keadaan, satu sumber aktif per media, tidak ada pratinjau kartu yang wajib dipahami untuk mengisi form, dan tidak ada pengaturan fitur mati yang masih meminta isian. Pemeriksaan browser baru tetap diperlukan sebelum menyatakan seluruh alur lulus.
