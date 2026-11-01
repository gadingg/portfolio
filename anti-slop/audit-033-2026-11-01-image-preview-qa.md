# QA dan UI/UX preview gambar

Tanggal: 1 November 2026. Audit terfokus pada preview galeri publik, gateway media, dan pemeriksaan HTML listinghub. Tidak ada implementasi atau instalasi skill pada audit ini.

## Skill discovery

Find Skills digunakan untuk memeriksa leaderboard dan halaman skill, lalu sumber serta popularitasnya. Kandidat:

- webapp-testing, anthropics/skills: QA interaksi dan screenshot menggunakan Playwright. Halaman skill mencatat sekitar 194 ribu instalasi dan repository sekitar 186 ribu stars. https://skills.sh/anthropics/skills/webapp-testing
  Instalasi: `npx skills add https://github.com/anthropics/skills --skill webapp-testing`
- web-design-guidelines, vercel-labs/agent-skills: audit aksesibilitas dan pola interaksi. Sekitar 810 ribu instalasi; repository sekitar 33 ribu stars. https://skills.sh/vercel-labs/agent-skills/web-design-guidelines
  Instalasi: `npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines`
- vercel-react-best-practices, vercel-labs/agent-skills: performa React/Next.js. Sekitar 859 ribu instalasi; repository sekitar 33 ribu stars. https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
  Instalasi: `npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices`

Angka berasal dari halaman skills.sh yang dibaca saat audit, bukan ukuran kualitas mutlak. Impeccable audit tersedia lokal dan dipakai untuk menyusun temuan kode. Guidelines sumber resmi juga dibaca: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

## Batas verifikasi

Agent Browser CLI tidak tersedia. Fallback browser dalam aplikasi menolak akses karena local browser use dinonaktifkan di Work settings. Tidak ada screenshot, uji keyboard langsung, throttling browser, CLS, atau p95 yang diklaim sudah diukur. Pemeriksaan dilakukan pada kode, HTML server lokal, dan GET gambar publik produksi. Gambar di listinghub menggunakan pipeline Next Image; modal galeri menggunakan works.js. Temuan modal tidak boleh dianggap sudah direproduksi pada listinghub, karena halaman tersebut tidak memuat works.js.

## Bukti pengukuran produksi

Satu gambar nyata: `/api/media/works/1793377934977-765fb062-83ec-4168-859b-a4d0b45f35c0.png`.

| Varian | Dimensi | Format | Byte | Durasi GET + baca body |
| --- | --- | --- | --- | --- |
| Asli | 1080 x 1350 | PNG | 2.498.772 | 4.462 ms |
| ?w=1280 | 1080 x 1350 | WebP | 150.630 | 2.661 ms |
| ?w=640 | 640 x 800 | WebP | 73.786 | 1.879 ms |

Semua status 200, Cache-Control no-store. Tiga permintaan dilakukan berurutan; ini satu sampel diagnostik, bukan benchmark terkontrol. Perbedaan ukuran terverifikasi; selisih durasi tidak dianggap semata-mata akibat format karena koneksi, cache upstream, dan cold start dapat berbeda. WebP dimensi sama sekitar 94% lebih kecil.

## Temuan terurut

1. **HIGH — loader dan gambar mengisi dua ruang.** `public/assets/js/works.js`, showDesign, menambahkan `status` dan `artwork` sebagai sibling lewat `body.replaceChildren(status,artwork)`. `public/assets/css/showcase.css` memberi status min-height 160px sementara body flex-direction column dan gap 20px. Akibatnya area loading berada di atas gambar, kemudian hilang setelah load dan berpotensi menggeser konten. Ini bukan duplikasi file gambar, melainkan tumpukan UI loading dan gambar.
2. **HIGH — modal menggunakan gambar asli.** showDesign memanggil image tanpa opsi thumbnail. Helper langsung menggunakan URL asli. Sampel PNG 2,50 MB dikirim meskipun varian WebP 151 KB tersedia. Helper responsive yang sudah ada hanya digunakan untuk kartu. Ukuran preview perlu mengikuti viewport dan DPR, dengan pembesaran/asli dimuat hanya saat diperlukan.
3. **MEDIUM — gateway mengulang download dan transform.** `app/api/media/[...path]/route.ts` mengunduh storage, lalu menjalankan Sharp untuk setiap permintaan varian. Asli dan hasil transform sama-sama no-store. Optimasi harus mempertahankan pengecekan admin/referensi published; jangan memasang public cache yang membuat media tersembunyi tetap dapat diakses tanpa validasi.
4. **MEDIUM — gambar aktif modal ikut lazy-loading.** Helper menetapkan loading lazy untuk semua pemakaian, termasuk gambar yang baru diminta setelah pengunjung membuka preview. Untuk gambar modal aktif, gunakan eager dengan pengaturan prioritas yang terukur; lazy tetap tepat untuk gambar di bawah fold.
5. **MEDIUM — belum ada frame dengan ukuran stabil.** Gambar modal tidak memiliki width/height atau frame aspect-ratio. CSS hanya membatasi max-height. Status 160px hilang sesudah load; ini menjelaskan perubahan tinggi yang berpotensi terlihat. CLS aktual belum diukur.
6. **MEDIUM — error tanpa retry.** Helper menyembunyikan gambar yang gagal lalu menambahkan teks Image unavailable; tidak menyediakan tombol coba lagi. Frame seharusnya tetap stabil dan menawarkan retry dengan satu status aksesibel.
7. **QA gap.** Tes regresi sebelumnya memverifikasi tautan, kontrol galeri, dan markup. Tes tersebut belum menilai komposisi loader bersama gambar, byte transfer modal, atau cold/warm load. Lulusnya tes fungsi tidak membuktikan kualitas loading visual.

## Penilaian dimensi Impeccable (lingkup preview)

- Aksesibilitas: kontrol bernama dan status live ada, tetapi kegagalan belum punya retry; keyboard langsung belum diuji. Penilaian kepatuhan WCAG ditunda.
- Performa: masalah ukuran asli dan pengulangan transfer terverifikasi. Belum ada profil browser untuk LCP/CLS atau decode.
- Theming: loader menggunakan token secondary; tidak diperlukan penggantian identitas visual.
- Responsif: batas ukuran dialog ada, tetapi frame belum stabil; viewport dan sentuhan belum dapat diuji langsung.
- Integritas implementasi: jalur kartu dan preview memiliki strategi optimasi berbeda. Halaman studi kasus menggunakan pipeline lain dan perlu matriks QA tersendiri.

## Arah perbaikan

Gunakan satu frame preview: gambar kecil yang sudah tersedia atau placeholder tetap berada pada area gambar. Indikator kecil ditempatkan di dalam frame, bukan paragraf/blok terpisah. Setelah preview ukuran layar selesai dimuat dan decode, ganti dalam frame yang sama. Jangan menampilkan versi penuh yang masih menggambar baris demi baris. Pertahankan status pembaca layar, reduced motion, tombol close/prev/next, dan retry. Jangan preload seluruh galeri atau selalu mengambil gambar asli.

Pisahkan pekerjaan berikutnya: (1) komposisi dan status modal, (2) ukuran/format dan cache media dengan kontrol akses, (3) QA browser mobile/desktop pada koneksi lambat, cache dingin/hangat, error/retry, navigasi cepat, gambar landscape/portrait, serta kembali membuka gambar yang sama. Screenshot loading dan loaded harus menunjukkan satu frame dengan posisi kontrol tetap.


## Implementasi setelah persetujuan pengguna

Pengguna menyetujui perbaikan melalui “go ahead”. Preview galeri kini memakai satu frame dengan tinggi stabil untuk loading, gambar selesai, maupun error. Spinner berada di dalam frame dan teks status hanya dibacakan pembaca layar; gambar responsif dimuat eager dan baru ditampilkan setelah decode. Error/decode failure/timeout 20 detik menawarkan Try again. Pergantian gambar dan penutupan modal membatalkan request/listener lama; penyelesaian decode yang sudah kedaluwarsa tidak mengubah preview baru. Navigasi halaman menutup modal agar bfcache tidak menyimpan modal berisi src yang sudah dilepas.

Gateway gambar memeriksa akses sebelum cache maupun respons 304. Cache server dibatasi 32 MiB/64 entri, TTL lima menit; pekerjaan in-flight identik digabung. Respons gambar memakai private, no-cache dan ETag, sehingga browser selalu revalidasi akses; respons ditolak tetap no-store. Video dan PDF tidak memakai cache gambar ini. Byte gambar asli tetap dipertahankan.

Validasi: 138 tes lulus; typecheck, pemeriksaan sintaks JS dan build produksi lulus. Tes khusus mencakup frame tunggal, decode, retry/timeout, navigasi cepat/cancel, batas memori/expiry/dedup, dan penolakan gambar tersembunyi meskipun ETag cocok. Detector Impeccable dijalankan sekali dan tidak menemukan masalah pada rentang CSS preview yang baru. Antislop setelah pengerjaan: tidak menambah supporting copy, glass/card dekoratif, atau status loading besar; desain dan kontrol yang sudah ada dipertahankan.

HTTP lokal sesudah build: varian WebP w=960 berukuran 128.672 byte, GET awal 1.305 ms, revalidasi berikutnya 304 tanpa body dalam 126 ms. Ini satu sampel lokal, bukan perbandingan latency terkontrol dengan produksi. Homepage, /design, dan /work/listinghub merespons 200. Pengujian visual desktop/mobile masih belum dapat dilakukan karena browser lokal dinonaktifkan; skor CLS dan screenshot tidak diklaim tersedia. Perubahan belum dipublikasikan ke Vercel pada task implementasi ini.


### Koreksi rasio dari screenshot pengguna

Frame tinggi tetap pada implementasi awal menghasilkan letterboxing hitam di atas/bawah poster. Tinggi tetap dihapus. Frame kini mengambil rasio dari thumbnail yang sudah dimuat atau cache rasio; hasil decode mengonfirmasi rasio native. Lebar maksimum mengikuti viewport dan tinggi yang tersedia, sementara aspect-ratio mempertahankan gambar utuh. File poster terukur 1080 x 1350 (4:5), bukan 3:4. Sepuluh tes terkait preview/galeri lulus, termasuk rasio portrait/landscape dan navigasi kembali; HTTP memastikan aset baru disajikan localhost tanpa rebuild (perubahan hanya pada aset publik). Browser masih menolak akses lokal; screenshot pengguna dipakai sebagai bukti letterboxing sebelumnya, bukan klaim verifikasi visual setelah perbaikan. Tidak ada crop file atau perubahan konten desain.


### Pinch zoom dan publikasi yang diminta

Pengguna meminta pinch zoom pada area preview serta commit/push. Gestur kini dibatasi pada frame gambar: pinch 1–4x, pan satu pointer saat diperbesar, pointer capture dengan release pada cancel/blur/resize/navigasi/close. Transform origin berada di tengah gambar, zoom mengikuti midpoint sentuhan, dan pan dibatasi agar gambar menutup frame. Navigasi gambar selalu membuat kontrol zoom baru pada 100%. Alternatif desktop: tombol zoom in/out/reset, double-click, trackpad pinch, serta keyboard ketika frame fokus. Ctrl/Meta keyboard zoom dan wheel biasa tidak dicegat. Tombol memakai hit area 44px, ikon Lucide, dan label aksesibel. Tidak ada UI glass atau supporting copy tambahan.

Validasi: 143 tes gabungan lulus. Empat tes gesture menggunakan simulasi Pointer Events, bukan perangkat fisik: pinch masuk/keluar, anchor, batas pan dan zoom, pemulihan setelah overshoot, cancel/blur/resize/dispose, scroll biasa, keyboard browser, dan reset pada instance baru. Tes preview/cache lama tetap lulus. Detector Impeccable tidak melaporkan temuan pada rentang CSS baru. QA visual dan gesture perangkat fisik belum tersedia karena browser lokal dinonaktifkan. Status build/deploy final dilaporkan saat penyelesaian.
