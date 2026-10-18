# Perbaikan audit 02, 03, 04, 10, 14 — 18 Oktober 2026

Cakupan hanya lima temuan yang dipilih pemilik. Baseline: portfolio@08ab2e8, branch codex/admin-overview-refinement. Temuan audit lain tetap belum diterapkan.

## Hasil

- **02:** tombol Portfolio di panel CV krem memakai teks #11130f, outline #61635e, hover terang, dan focus ring #b93608. Aturan dibatasi `.cv-actions .button--secondary`; token global dan tombol halaman lain tidak diganti. Desktop/mobile diperiksa.
- **03:** reorder di Works sekarang mengubah state lokal dan dapat dibatalkan; tidak melakukan request simpan otomatis. Simpan draft mempertahankan urutan published; Publikasikan semua baru menerapkan urutan. Jalur API order lama juga hanya menulis draft. Test mock membuktikan draft/public terpisah sampai publikasi eksplisit.
- **04:** CTA Works menjadi Publikasikan semua. Ringkasan menjelaskan cakupan seluruh koleksi dan jumlah karya/urutan yang berubah. Bila lebih dari satu karya berubah, konfirmasi menyebut jumlah dan kategori lain. Validasi dilakukan sebelum konfirmasi. Simpan draft tetap terpisah. Ringkasan mengabaikan metadata waktu, mengenali tambahan/penghapusan, dan membedakan perubahan urutan.
- **10:** pergantian baris teks disimpan sebagai teks biasa dengan white-space pre-line pada komponen terkait; panel tetap satu field per fragmen teks asli. Tidak memecah format menjadi field tambahan atau mengubah ikon. Browser membuktikan dua baris tampil di kanvas, dan test handler/render membuktikan newline serta styling bertahan melalui sanitizer dan draft save.
- **14:** status bersih editor disimpan sebagai baseline. Undo ke baseline mengembalikan Draft dimuat/Siap diedit/Draft tersimpan/Sudah dipublikasikan sesuai keadaan terakhir; Save nonaktif. Redo kembali menampilkan Belum disimpan dan Save aktif.

## Validasi

- Typecheck lulus dan 37 test terisolasi lulus (23 works/overview/visual, 14 reliability/public-controls).
- Reorder keyboard diuji dengan sesi asli, lalu Batalkan. Tidak ada request simpan/publikasi CMS dari uji tersebut.
- Enter, Undo dan Redo diuji di editor asli pada desktop/mobile, lalu teks asli dikembalikan; tidak ada save/publish.
- Konfirmasi publikasi diuji dengan salinan komponen yang hanya mengganti URL transport ke fixture memori berlabel QA. Dua karya diubah sementara, dialog muncul, lalu Batal/Batalkan. Endpoint fixture mencatat **0 upaya write**. Fixture diarsipkan di luar aplikasi sebelum build.
- CV ditinjau 1440 dan 390px. Lebar halaman Works fixture diukur 320/1440px tanpa overflow dokumen. Target tombol mengikuti kontrol minimum 44px yang sudah ada.
- Server QA terpisah sempat mengalami benturan output development; dihentikan. Preview dipulihkan menggunakan CLI normal. Satu baca CMS sempat gagal lalu Coba lagi berhasil; pemeriksaan baca database terpisah merespons 200. Tidak ada migrasi atau perubahan data dilakukan.
- Detector: 4 warning + 143 advisory pada cakupan luas globals/admin. Empat warning menyangkut font Inter/Plus Jakarta Sans pada aturan lama yang tidak diubah. Tidak diterapkan revisi font atau styling lain di luar cakupan.

## Artefak

- fix-02-cv-mobile.png: kontrol CV terang yang sudah diperbaiki.
- fix-03-order-draft.png: reorder belum disimpan, sebelum Batalkan (capture sebelum penyederhanaan copy ringkasan akhir).
- fix-04-publication-review.png: dialog dengan dua karya data uji, bukan data CMS.
- fix-10-editor-lines.png: dua baris sementara yang sudah di-Undo setelah screenshot.
- selected-fixes-impeccable.json: hasil detector, termasuk temuan lama di luar scope.

Perubahan belum di-commit/push pada tahap implementasi ini. Konten CMS asli, password, pengguna Auth, dan deployment tidak diubah.

Build produksi final lulus (17 static pages). Preview produksi aktif kembali pada port 3001. Fixture page dan API merespons 404; CV dan API Works merespons 200.
