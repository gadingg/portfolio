# Audit copy halaman publik

Tanggal: 1 November 2026. Mode antislop setelah pengerjaan. Audit awal dilakukan tanpa perubahan. Pengguna menyetujui implementasi melalui “go ahead”; hasil implementasi tercatat di bawah.

## Sumber dan cakupan

Render publik di `http://localhost:3003/` menggunakan snapshot published CMS. Homepage, `/webapp`, `/work/listinghub`, `/work/metaads` dan `/work/dailyapp` diperiksa di browser. GET read-only memeriksa `/work/mbg`, `/work/mydaily`, `/work/reqvideo`, `/design`, `/video` dan `/cv`; semua mengembalikan 200. Copy runtime/loading/error diperiksa melalui source, tanpa sengaja memutus koneksi atau menyatakan state error tersebut tampil pada halaman yang sehat. Deployment domain produksi belum dibandingkan.

Audit membaca copy yang benar-benar dirender, karena teks CMS dapat berbeda dari template. Contohnya, Meta description homepage yang dirender adalah "Gading Utama Portfolio", sementara fallback template memiliki deskripsi yang lebih panjang.

Skill: antislop core dan antislop-copywriting. Temuan bahasa adalah penilaian editorial terhadap konteks dan preferensi pengguna, bukan detektor yang membuktikan teks ditulis AI. HIGH mengacu pada R-02/hard gate; LOW pada R-15/R-16/quality locks. Urutan perbaikan yang disarankan tetap mempertimbangkan dampak: 01, 02, 04, 05, 06, 08, 09, 13.

## Arah copy

- Pertahankan gabungan creative marketing, visual design dan coding. Jangan mengubah positioning menjadi developer saja atau designer saja.
- Hero dan CTA memakai bahasa Inggris yang ringkas, sesuai pilihan pengguna sebelumnya. Narasi studi kasus boleh tetap berbahasa Indonesia; gunakan istilah Inggris ketika berupa nama fitur, produk atau istilah yang memang diperlukan.
- Supporting copy menjelaskan jenis pekerjaan, konteks, keputusan atau cara memakai hasilnya. Hindari mengganti satu slogan generik dengan slogan generik lainnya.
- "Portofolio" tetap digunakan untuk UI Indonesia; "portfolio" adalah ejaan untuk UI Inggris. Audit ini tidak mengusulkan penggantian istilah tersebut menjadi karya.
- Jangan menambahkan angka, tools, role atau hasil yang tidak tersedia pada sumber pengguna.

## Temuan

### 01. HIGH, R-02: pengantar hero belum mengikuti pilihan bahasa Inggris

Terlihat di homepage. Sumber fallback: `public/index.html`; binding/default: `lib/site.ts`, `lib/db/site.ts`.

Sekarang: "Saya suka mengubah ide jadi sesuatu yang benar-benar kepakai, dari visual sampai solusi digital."

Kalimatnya cukup natural, tetapi "sesuatu", "benar-benar kepakai" dan "solusi digital" belum menyebut pekerjaan spesifik. Preferensi hero Inggris yang sudah disampaikan pengguna juga belum terlihat di snapshot ini.

Usulan:

> Creative marketing, visual design, and web apps for everyday work.

Bila ingin mempertahankan konteks pengalaman yang sebelumnya diminta, baris singkat berikut dapat ditambahkan:

> 2+ years across creative marketing and product development.

Angka 2+ tersedia di profil CV publik dan instruksi pengguna sebelumnya. Ini kandidat baru yang konkret, bukan klaim bahwa naskah pilihan "nomor 1" terdahulu sudah berhasil dipulihkan. Headline "I Think. I Create. I Solve." tetap dipertahankan; intro tidak perlu mengulang "I".

### 02. HIGH, R-02: About memakai slogan dan pola perbandingan yang generik

Terlihat di homepage, `.about-copy`.

- "Good visuals catch eyes. Great ideas make an impact."
- "Buat saya, bukan cuma soal visual yang menarik, tapi juga bagaimana pesan bisa tersampaikan dengan baik dan pekerjaan jadi lebih simpel."

Slogan berpasangan dan konstruksi "bukan cuma ... tapi juga ..." menghasilkan pernyataan yang bisa dipakai hampir semua portofolio. Kontribusi pribadi justru belum terlihat.

Usulan satu paragraf yang lebih langsung:

> I take part in planning campaigns, designing the visuals, and building the tools the team needs.

Kontribusi ini didukung profil pengalaman dan studi kasus yang tersedia. Quote generik dapat dihapus agar tidak ada dua kalimat yang mengulang gagasan sama. Judul "More than executing the brief." dapat tetap dipakai bila ingin menonjolkan kontribusi sejak tahap ide; paragrafnya harus menjadi penjelasan konkret untuk judul itu.

### 03. LOW, R-15: CTA kontak dan pembuka memakai terlalu banyak sinonim

Terlihat di homepage: "View selected works", "Get in touch", "Let's talk", "Chat on WhatsApp". Studi kasus memakai "Open app" dan, pada MBG, "Explore PROGRAM MBG" untuk tujuan aplikasi yang sama.

Usulan:

| Tujuan sebenarnya | Label |
|---|---|
| Hero menuju bagian portofolio | View portfolio |
| Header/hero menuju bagian kontak | Let's talk |
| Membuka WhatsApp langsung | Chat on WhatsApp, pertahankan |
| Membuka studi kasus | View case study, pertahankan |
| Membuka aplikasi | Open app |
| Membuka PDF/CV | View CV / Download PDF, pertahankan sesuai tujuan |

Jangan mengubah tombol yang hanya menuju section kontak menjadi "Chat on WhatsApp" bila tujuannya belum langsung WhatsApp. "Open All Database" dan "Open Personal Listing" pada Listing Hub tetap berguna untuk membedakan dua aplikasi; jangan menyeragamkan keduanya menjadi Open app tanpa konteks.

### 04. HIGH, R-02: supporting copy generik masih ada di halaman koleksi

Terlihat pada `/webapp`, `/design`, `/video`. Sumber: `components/public/WorksCollection.tsx:12-17`.

- "Website dan aplikasi untuk menyederhanakan pekerjaan. Buka karya untuk melihat studi kasus atau mencoba aplikasinya."
- "Koleksi visual, dari komposisi sampai detail. Pilih gambar untuk melihatnya lebih dekat."
- "Cerita brand dan campaign dalam gerak. Pilih video untuk menonton."

Usulan: hapus paragraf pembuka tersebut. Judul kategori, kartu, dan CTA sudah menjelaskan tujuan halaman. Bila instruksi memperbesar gambar diperlukan, cukup label pada aksi/aksesibilitas gambar. Tidak perlu menggantinya dengan supporting copy baru.

Ini mengulang masalah supporting copy visual yang sebelumnya sudah diminta dihapus, tetapi masih muncul pada halaman koleksi tersendiri.

### 05. LOW, R-15: total studi kasus belum terbaca dari homepage

Homepage menampilkan tiga kartu Website / Apps dan tombol "View all". Halaman `/webapp` saat audit berisi enam portofolio, semuanya mempunyai studi kasus:

1. Internal Listing Hub
2. Meta Ads Reporting & Performance Hub
3. PROGRAM MBG Leaderboard
4. Daily App Gading
5. Literally... My Daily App
6. Req Video Bareng Patosser

Usulan CTA: **View all 6**. Alternatif label di heading: **6 case studies**.

Jumlah wajib dihitung dari portofolio yang published, siap tampil dan mempunyai studi kasus. Jangan menghitung draft, contoh, record tidak siap atau mengunci angka 6. Bila tombol koleksi kelak mencakup aplikasi tanpa studi kasus juga, count tombol memakai seluruh item koleksi; label "case studies" memakai filter studi kasus tersendiri.

### 06. HIGH, R-02: How I Work belum menampilkan kontribusi desain secara eksplisit

Terlihat di homepage: Observe, Brainstorm, Build, Collaborate, Ownership. Sumber: `public/index.html`, `lib/site.ts`, `lib/db/site.ts`.

Usulan minimum: **Build menjadi Design & Build**, sesuai keputusan pengguna sebelumnya.

Untuk konsistensi bentuk kata, "Ownership" dapat menjadi **Take ownership**. Langkah lain dapat dipertahankan:

> Observe → Brainstorm → Design & Build → Collaborate → Take ownership

Kartu tetap judul saja. Tidak menambah deskripsi atau janji layanan baru. Pemeriksaan copy ini tidak mengklaim penyebab pilihan terdahulu belum tampil; sumber template, CMS published dan branch harus dicocokkan saat implementasi. Persyaratan ikon pen tool dan kode sebelumnya juga perlu dihormati ketika bagian tersebut diperbarui.

### 07. HIGH, R-02: sejumlah heading studi kasus berupa slogan tanpa konteks

Terlihat pada beberapa studi kasus:

- "The thinking behind the output"
- "Give every point a story."
- "Turn the recap into a next action."
- "More room for creative thinking."
- "Less switching. More doing."

Usulan yang menjelaskan isi:

| Sekarang | Usulan |
|---|---|
| The thinking behind the output | Project overview |
| Give every point a story. | Point history |
| Turn the recap into a next action. | AI-assisted campaign review |
| More room for creative thinking. | Daily tools in use |
| Less switching. More doing. | One app for daily tasks |

Heading tidak perlu semuanya diganti. Nama produk/fitur seperti All Database, Personal Listing, Finance, Progress dan To-Do tetap dipertahankan. "The problem", "The solution" dan "The impact" sudah membantu pemindaian; isi di bawahnya perlu ringkas dan sesuai bukti.

### 08. HIGH, R-02: isi studi kasus mengulang manfaat yang sama

Terlihat jelas di `/work/dailyapp`: ringkasan impact dan paragraf penutup sama-sama menyebut workflow "lebih rapi, cepat, dan konsisten", pekerjaan teknis kecil berkurang, serta lebih banyak waktu untuk creative thinking. `/work/reqvideo` mengulang perubahan self-service pada summary dan penutup.

Usulan:

- Simpan ringkasan problem/solution/impact yang pendek untuk pembaca yang memindai halaman.
- Detail selanjutnya membahas keputusan atau fitur yang berbeda, bukan mengulang ringkasan dengan sinonim.
- Hapus penutup yang hanya mengulang manfaat tanpa informasi tambahan.
- Tanpa pengukuran waktu/produktivitas, utamakan kemampuan yang benar-benar tersedia.

Contoh Daily App:

> Task, template caption, prompt, dan link kerja dikumpulkan dalam satu aplikasi.

Contoh Req Video:

> Agent mengirim listing lewat form. Admin menindaklanjuti permintaan dan menyusun jadwal pengambilan video.

Usulan menyatakan perubahan alur yang tersedia, tanpa mengarang penghematan waktu atau peningkatan kinerja.

### 09. HIGH, R-02: campuran istilah membuat beberapa deskripsi sulit dibaca

Terlihat pada Req Video:

> Agent submit listing lewat form, data masuk ke dashboard secara real-time, lalu admin follow up untuk fiksasi waktu dan menyusun jadwal take video.

Usulan:

> Agent mengirim listing lewat form. Permintaan masuk ke dashboard, lalu admin menghubungi agent untuk menentukan jadwal pengambilan video.

Contoh lain: "history campaign" menjadi "riwayat campaign"; "fiksasi waktu" menjadi "menentukan jadwal"; "workflow yang lebih self-service dan terstruktur" diganti dengan siapa yang kini dapat mengirim permintaan langsung.

Istilah produk yang sudah familiar boleh tetap, termasuk Meta Ads, Figma, WhatsApp, leaderboard dan nama fitur. Ini bukan anjuran menerjemahkan semua istilah secara kaku.

### 10. HIGH, R-02: caption mockup Meta Ads terdengar seperti instruksi interaktif

Terlihat di `/work/metaads`. Sumber tambahan: `lib/work-evidence.ts`.

Sekarang:

> Pilih batch untuk membaca anggaran, impresi, respons WhatsApp, dan biaya per pesan. Detail dari mockup proyek.

Pada portofolio ini pengunjung melihat gambar, bukan filter batch aplikasi yang dapat dipilih.

Usulan:

> Ringkasan anggaran, impresi, respons WhatsApp, dan biaya per pesan per batch.

Pertahankan penjelasan data ilustrasi bila memang diperlukan untuk memahami gambar. Kalimat "Detail dari mockup proyek" yang berulang dapat dihapus jika tidak menambah konteks.

### 11. LOW, R-16: meta description homepage terlalu umum

Meta description pada render publik saat audit: **Gading Utama Portfolio**. Ini berbeda dari fallback `public/index.html`.

Usulan:

> Creative marketing, visual design, and web apps by Gading Utama. View selected projects, case studies, and experience.

Copy menggunakan bidang pekerjaan yang tersedia pada portofolio, tanpa klaim keunggulan atau angka baru. Perbaikan perlu menyentuh nilai SEO yang dipakai CMS, bukan hanya template. Jangan menjanjikan kenaikan peringkat pencarian dari perubahan ini.

### 12. LOW, R-16: label portofolio visual dan alt text belum membedakan dua entri

Dua kartu publik sama-sama berjudul **Weekly Meeting Patosser**. Salah satu alt text adalah **Mockup Portfolio Visual Design (1)**; yang lain **WM Patosser 01**.

Usulan:

- Bedakan judul dengan tanggal, edisi atau format yang memang benar.
- Format judul yang dapat diisi dari data pengguna: `Weekly Meeting Patosser · [edisi]`.
- Alt text menjelaskan isi visual yang terlihat, bukan nama file atau urutan export.

Tanggal/edisi dan deskripsi visual spesifik belum dipastikan dalam audit copy ini. Jangan mengarang nama campaign, tanggal meeting atau menganggap kedua gambar pasti versi 1/2 dari desain yang sama. Pemeriksaan visual aset diperlukan sebelum menulis alt text final.

### 13. HIGH, R-02: kontak dan footer mengulang positioning yang sudah jelas

Terlihat pada homepage:

> Punya campaign yang mau dikembangkan, visual yang perlu dieksekusi, atau workflow yang terasa terlalu ribet? Let's talk.

Footer: **Think. Create. Build. Improve.**

Usulan: hapus paragraf kontak panjang dan slogan footer yang mengulang hero. Pertahankan headline **Let's make something useful.**, tombol **Chat on WhatsApp**, **Email Gading** dan tautan sosial. Jangan mengganti paragraf yang dihapus dengan pertanyaan generik seperti "Have a project in mind?".

Menu mobile juga mempunyai "Explore the work." dan pengulangan "Creative Marketing · Design · Digital Solutions". Judul **Menu** sudah cukup; tagline tambahan dapat dihapus. Temuan ini menyangkut copy, bukan perubahan urutan navigasi.

### 14. HIGH, R-02: bahasa state publik dan asumsi error belum konsisten

Sumber: `public/index.html`, `public/assets/js/works.js`, `components/public/WorksCollection.tsx`, `app/work/[slug]/loading.tsx`, `app/work/[slug]/error.tsx`.

Saat ini UI menggunakan CTA Inggris, tetapi status seperti "Memuat karya…", "Karya belum bisa dimuat" dan petunjuk player tetap berbahasa Indonesia. Error studi kasus selalu menyebut "Koneksi sedang bermasalah", padahal penyebabnya belum tentu koneksi pengunjung.

Jika mengikuti UI publik Inggris:

- Loading case study…
- Couldn't load this case study.
- Try again
- Back to portfolio
- Loading image…
- Play the video on Instagram, untuk petunjuk player bila diperlukan; Open on Instagram tetap dipertahankan sebagai fallback yang jelas.

Jangan menghapus fallback Instagram atau label aksesibilitas saat memendekkan copy. String error/recovery yang tersembunyi ketika halaman sehat bukan supporting copy yang perlu dihapus seluruhnya.

### 15. LOW, R-16: bagian Tools mencampur nama software dengan bidang keahlian

Terlihat di homepage:

- Design & content: Figma, Canva, CapCut.
- Marketing: Meta Ads Manager.
- Build & automation: AI-assisted web-app building, Automation, Generative AI.

Kelompok terakhir menyebut pendekatan/keahlian, bukan nama tools. Pilihan:

1. Pertahankan judul **Tools I use** dan isi kelompok ketiga dengan nama tools yang benar-benar digunakan, setelah dikonfirmasi.
2. Jika tetap mencampur tools dan pendekatan, gunakan judul **Tools & workflow**.

Jangan menambahkan Cursor, Claude, ChatGPT, framework, bahasa pemrograman atau platform lain hanya karena relevan dengan coding. Nama tools belum dikonfirmasi oleh copy publik yang diaudit.

### 16. HIGH, R-02: profil CV mengulang daftar abstrak

Terlihat pada `/cv`, bagian Profile:

> Creative Marketer & Problem Solver with 2+ years of professional experience across creative marketing, digital design, and technology. Combines creative thinking, technology, and AI to develop campaigns, solve workflow problems, and build internal web-apps that improve business operations.

Usulan yang lebih langsung:

> Creative marketer with 2+ years of experience in campaigns, visual design, and internal web-app development. Work includes social content, Meta Ads, and tools for property teams.

Nama jabatan, perusahaan, periode, jumlah aplikasi, penghargaan dan angka hasil tidak diubah melalui penggantian paragraf ini. Teks halaman CV dan file PDF upload berbeda sumber; perubahan profil halaman tidak otomatis memperbarui isi PDF.

## Copy yang dipertahankan

- I Think. I Create. I Solve., sebagai headline yang sudah dipilih.
- Empat judul What I Do yang telah ditentukan pengguna, tanpa menambah supporting description.
- Let's make something useful., dengan penekanan useful yang sudah diminta.
- View case study, View CV, Download PDF, Chat on WhatsApp dan Open on Instagram: tujuannya sudah jelas.
- Nama proyek dan nama fitur yang benar.
- Angka Meta Ads IDR 20M, 3 property closings, IDR 118M gross commission beserta konteks bahwa hasil juga melibatkan proses marketing dan penanganan leads. Jangan mengubahnya menjadi revenue yang seluruhnya disebabkan iklan.
- Keterangan data ilustrasi pada mockup Literally... My Daily App. Ini menjelaskan bukti visual dan tidak boleh dipangkas sebagai sekadar supporting copy.

## Catatan pelaksanaan berikutnya

Copy publik berasal dari template, default/migrasi saat render, field CMS, blok studi kasus dan sebagian layout visual yang disimpan. Mengganti source template saja dapat meninggalkan copy lama pada snapshot published. Implementasi berikutnya perlu membedakan draft yang disiapkan untuk review, fallback source dan publikasi konten sebenarnya. Audit ini tidak melakukan save/publish CMS, tidak mengubah source publik, dan tidak mengubah PDF atau fakta hasil proyek.


## Implementasi yang disetujui

- Hero, CTA, About, judul proses, loading/error, pengantar CV HTML, dan metadata diperjelas. Headline utama, empat judul layanan, identitas visual, fakta proyek, dan istilah portofolio dipertahankan.
- Enam studi kasus memakai ringkasan dan heading yang konkret; paragraf penutup berulang dihapus hanya bila judul dan paragraf cocok dengan versi lama. Caption Meta Ads menjadi keterangan gambar. Angka kampanye dan pernyataan data ilustrasi My Daily tetap ada.
- Dua collage Weekly Meeting dibedakan sebagai Poster Set 1/2, tanpa mengarang tanggal. Penggantian judul/alt dibatasi ID dan gambar lama yang sudah diperiksa.
- Jumlah koleksi dihitung dari item published yang siap tampil, terpisah dari batas tiga preview web app. Desain nyata dengan penanda demo lama tetap tampil.
- Migrasi baca `public-copy` mengenali teks lama secara persis dan menandai edisi saat disimpan berikutnya. Teks kustom tetap dipertahankan. Tidak ada penulisan database, publikasi CMS, commit, push, atau deploy pada task ini. PDF CV unggahan tidak diubah.
- Pemeriksaan antislop sesudah implementasi: slogan berulang di footer dan penutup kasus dihapus; CTA menyebut tujuannya; klaim hasil baru tidak ditambahkan.
- Detector Impeccable dijalankan sekali. Temuan radius/warna merujuk desain lama yang dipertahankan; animasi marquee yang terdeteksi merupakan skeleton loading. Tidak ada perubahan global token dari tugas copy ini.
- QA browser desktop/mobile belum dapat diverifikasi karena browser lokal dinonaktifkan di pengaturan Work. Build produksi serta pemeriksaan HTTP/HTML dan tes regresi digunakan; keterbatasan visual ini tidak dinyatakan lolos.

Validasi regresi: 66 tes lulus (copy, layout, CMS, navigasi/loading, koleksi, CV, autosave/publikasi, dan interaksi publik). Typecheck lulus. Build produksi pertama lulus dengan log kegagalan revalidasi CMS sesaat; build final dicatat setelah koreksi wrapper heading dan desain demo.

Build final lulus. QA HTTP final: 11 halaman publik berstatus 200; kelima heading proses utuh, enam case study tercantum, dua desain tampil, disclaimer ilustrasi dan profil CV HTML terverifikasi. Preview lokal: http://localhost:3003/.


### Follow-up: collection heading actions

User approved separating totals and actions across all three categories. Totals now sit below category titles; View all uses the existing outline button vocabulary, arrow-right icon, and 44px minimum touch target. Totals remain data-driven in SSR and client refresh. Links and gallery behavior are preserved. Antislop after-review: no new helper paragraphs, decorative cards, glass effects, or claims added. 25 targeted tests, JavaScript syntax check, and typecheck pass. Visual browser QA remains unavailable because local browser access is disabled in Work settings.
