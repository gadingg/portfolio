# Admin copy audit

Date: 2026-11-04. Antislop after mode retained from this session. Proposal only; no application text changed.

Scope: source inspection across admin login/navigation, overview, portfolio list/editor, story/image/block editors, media picker, AI authoring/settings, homepage/profile/CV forms, visual editor, publication and recovery. Public project narrative, titles and CV facts are outside this proposal. The separate antislop-copywriting package was not found in the available local skill roots; the supplied core filter was used without downloading instructions.

Direction: concise everyday Indonesian for admin actions, with familiar terms such as edit, draft, preview, upload, link, thumbnail and prompt. Casual but professional, no forced slang, no added claims. Public English headings remain as configured. Existing visual direction retained; ENERGY 2 / RHYTHM 2 / MOTION 1 for this copy-only review, with no visual changes proposed.

## Findings

1. LOW, R-31/C-1: Story labels describe document structure rather than the writing task. CaseLayoutText.tsx:43 and AIStudyManager.tsx:122-123 use Judul bagian, Isi cerita and Penjelasan. Prefer short contextual labels.
2. LOW, R-15/R-31: AI and publication actions are wordy or mix verbs. AIStudyManager.tsx:155 uses Gunakan hasil & simpan draft. Preserve save versus publish distinction while shortening.
3. LOW, R-31: Repeated terminology varies across shared components. Link/tautan, preview/pratinjau, publish/terbitkan, artwork/gambar and cover/thumbnail increase interpretation cost. WorkEditor.tsx, VisualEditor.tsx, SiteManager.tsx, PublicationBar.tsx.
4. LOW, C-3/R-31: Helpers repeat headings or the next visible control. AIStudyManager.tsx:151-153, DesignImagesEditor.tsx:11, CaseLayoutImages.tsx:85. Remove repetition; retain format limits and explanations of genuinely different behavior.
5. LOW, R-27/C-4: Error/recovery copy mixes workspace, perangkat, server, local edits and publication. LocalRecovery.tsx:28-29, AIStudyManager.tsx:96-111, AdminChanges.tsx. Explain what happened and one next action, with truthful persistence status.
6. LOW, R-31: Homepage field names reflect implementation vocabulary. lib/site.ts:32-196 uses Label pembuka, Pernyataan singkat, Kemampuan and Tautan. Prefer names matching visible sections and content roles.
7. LOW, R-31/C-5: Statistical headings can be more precise without implying unique visitors or business results. Overview.tsx:43,119-120. Keep click counts and tracking coverage explicit.

No HIGH claim is made from awkward wording alone. This is a writing/usability audit, not a newly verified functional defect list.

## Before and proposed after

| Area | Before, current source | Proposed after |
|---|---|---|
| Story | Judul bagian | Judul |
| Story | Isi cerita | Ceritanya |
| Story | Teks cerita | Cerita proyek |
| Story | Cari teks cerita | Cari di cerita |
| Story | Bagian tanpa judul | Belum ada judul |
| Story | Isi studi kasus | Cerita & screenshot |
| Story | Problem, Approach & Outcome | Gambaran proyek |
| Story | Masalah | Masalah awal |
| Story | Solusi | Yang saya buat |
| Story | Hasil | Hasilnya |
| Story | Keterangan & tautan | Deskripsi & link |
| Story | Editor halaman & AI | Edit layout & bantuan AI |
| Story | Tautan gambar langsung | Link gambar |
| Images | Gambar isi studi kasus | Screenshot proyek |
| Images | Letakkan gambar | Tambahkan setelah |
| Images | Di akhir cerita | Akhir cerita |
| Images | Setelah bagian: [title] | Bagian: [title] |
| Images | Belum ada gambar isi. Tambahkan screenshot pertama di bawah. | Belum ada screenshot. |
| Images | Deskripsi gambar | Deskripsi gambar (aksesibilitas) |
| Images | Caption | Caption (opsional) |
| Images | Artwork individual | Desain satuan |
| Images | Lepas artwork | Lepas gambar |
| Images | Cover tetap di galeri. Artwork individual dibuka di lightbox. | Galeri memakai cover. Klik cover untuk membuka desain satuan. |
| Media | Pilih dari media tersimpan | Pilih dari koleksi |
| Media | Pakai [n] file | Gunakan [n] file |
| Media | Lepas file di sini · maks. [n] MB | Tarik file ke sini · maks. [n] MB |
| Video | Ambil frame sekarang | Jadikan thumbnail |
| Video | Gunakan frame ini | Jadikan thumbnail |
| Video | Mengambil frame… / Membuat cover… | Membuat thumbnail… |
| Video | Cover diperbarui. | Thumbnail diganti. |
| Video | Jika kosong, pakai video desktop. | Kosongkan untuk memakai video desktop. |
| Portfolio | Kelola koleksi | Opsi koleksi |
| Portfolio | Unggulan homepage | Pilihan homepage |
| Portfolio | Maks. 3 unggulan, sesuai urutan portofolio. | Pilih hingga 3 proyek. Urutannya mengikuti koleksi. |
| Portfolio | Import banyak file | Upload beberapa file |
| Portfolio | Setiap file menjadi satu portofolio. | Satu file jadi satu item portofolio. |
| Portfolio | Pratinjau / Pratinjau studi kasus / Pratinjau kartu | Preview / Preview studi kasus / Preview kartu |
| Portfolio | Selesai mengurutkan | Selesai |
| AI | Bahan studi kasus | Ceritakan proyeknya |
| AI | Tujuan draft | Proyek yang dikerjakan |
| AI | Catatan proyek | Cerita singkat proyek |
| AI | Ceritakan masalah, fitur yang dibuat, dan hasil yang sudah terlihat. | Tulis masalah awal, yang dibuat, dan hasil yang sudah ada. Catatan bebas juga boleh. |
| AI | Impor hasil AI | Tempel hasil AI |
| AI | Tinjau draft | Cek draft |
| AI | Penjelasan | Ceritanya |
| AI | Generate ulang bagian ini | Buat versi lain |
| AI | Usulan revisi | Versi baru |
| AI | Gunakan revisi ini | Pakai versi ini |
| AI | Pertahankan tulisan saya | Tetap pakai teks lama |
| AI | Gunakan hasil & simpan draft | Simpan hasil ke draft |
| AI | Perlu dikonfirmasi | Perlu dicek |
| AI | Tidak ada catatan. | Tidak ada yang perlu dicek. |
| AI | Draft akan muncul di sini untuk Anda periksa. | Hasil AI muncul di sini. |
| AI | Draft AI siap direview. Periksa fakta dan bagian yang perlu dikonfirmasi. | Draft siap. Cek isinya sebelum disimpan. |
| AI | Draft tersimpan. Lanjutkan edit dan preview sebelum publish. | Draft tersimpan. Cek preview sebelum diterbitkan. |
| AI | JSON yang valid langsung mengisi draft. | Remove, repeats the import action. |
| AI | Catatan diproses oleh Gemini. | Catatan dikirim ke Gemini saat diproses. |
| AI settings | ID model | Model Gemini |
| AI settings | Key tersimpan | Remove, masked field and Ganti key already convey this. |
| Publication | Review publikasi | Cek sebelum terbit |
| Publication | Semua kategori portfolio | Semua kategori portofolio |
| Publication | Menunggu simpan otomatis… | Menunggu disimpan… |
| Publication | Draft tersimpan · belum di-publish | Draft tersimpan · belum tayang |
| Publication | Coba lagi, when retrying save | Coba simpan lagi |
| Publication | Tampilkan di website setelah terbit | Tampilkan setelah diterbitkan |
| Recovery | Riwayat perangkat | Versi di perangkat ini |
| Recovery | Editan terakhir ditemukan | Ada editan yang belum disimpan |
| Recovery | Versi server sudah berubah. Unduh salinan editan untuk diperiksa. | Ada versi lebih baru. Download editan ini untuk dibandingkan. |
| Recovery | Perubahan belum tersimpan. Tetap tinggalkan halaman? | Editan belum tersimpan. Tetap keluar? |
| Recovery | Tinggalkan | Keluar tanpa menyimpan |
| Home/Profile | Bagian yang diedit | Mau edit bagian mana? |
| Home/Profile | Label pembuka | Teks kecil di atas judul |
| Home/Profile | Pengantar | Deskripsi singkat |
| Home/Profile | Pernyataan singkat | Quote |
| Home/Profile | Penjelasan About | Cerita tentang saya |
| Home/Profile | Nama dan posisi | Nama & peran |
| Home/Profile | Judul kemampuan | Judul What I Do |
| Home/Profile | Kemampuan [n] | Layanan [n] |
| Home/Profile | Judul proses | Judul How I Work |
| Home/Profile | Tautan WhatsApp / Instagram / LinkedIn | Link WhatsApp / Instagram / LinkedIn |
| Home/Profile | Kelompok [n], within Tools | Kategori tools [n] |
| Home/Profile | Deskripsi pencarian | Deskripsi di hasil pencarian |
| Overview | Draft yang perlu ditinjau | Draft yang perlu dicek |
| Overview | Portofolio teratas | Paling sering dibuka |
| Overview | Rincian harian | Klik per tanggal |

## Important copy to retain

- Keep Simpan, Simpan draft, Terbitkan, Sembunyikan, Hapus, Pulihkan, Ganti key, Tes koneksi, Copy Prompt, Cari judul, Tambah gambar and Ganti video. These are already concise and action-specific.
- Keep truthful online/local/failed distinctions. Do not shorten every state into Tersimpan.
- Keep file type/size limits, 72-hour recovery window, unpublished change scope and explicit text-replacement confirmations.
- Keep JSON as JSON for structured import, API key as API key, and alt text distinct from a public caption.
- Keep deletion confirmation explicit about what is deleted and whether undo/recovery exists. Never replace a risky action with Lanjut, Oke, or Beres.
- Keep the shared Website & CV publication scope. Do not imply the homepage and profile are independently published.
- Keep public English project titles/headings and existing project content unchanged during any future admin wording implementation.

## Delivery gate, audit-only

- R-02 PASS for proposed copy: no em dash or en dash, no marketing buzzwords or forced slang.
- R-15/R-26 PASS by source inspection for proposals: action labels describe existing handlers; save, publish, hide, delete, restore and preview remain distinct.
- C-1/R-31 PASS: each proposal reduces structural jargon, repeated helper copy or terminology variation while preserving actionable meaning.
- C-5/R-17/R-36/R-38 PASS for proposals: no invented statistics, features, persistence or security claims.
- R-35 audit evidence: inspected component and shared text sources. No runtime edits, functional changes or browser click-through were performed in this writing-only turn. Layout, contrast, keyboard behavior and provider integration are not newly certified by this report.
- Visual purpose/liveliness gates: existing UI preserved; no assets, styles, navigation destinations or animation introduced.

Owner approval is required before applying these wording proposals. No application source was modified by this audit.

## Approved implementation follow-up

The owner approved all findings with "Fix it all". Applied locally on 2026-11-04.

- Updated story/block/visual editors to Judul, Ceritanya, Cerita proyek and Cerita & screenshot. Textarea sizing follows the renamed body label, preserving the four-row body editor.
- Unified preview, link, thumbnail, koleksi and desain satuan wording, including media selection, accessible labels, publish change summaries and video frame actions.
- Applied the AI input/review/confirmation copy, retaining Copy Prompt, API key requirements, JSON input and explicit draft replacement. Removed the repeated JSON helper and stored-key helper. Gemini transmission notice remains.
- Applied homepage/profile field labels without changing field keys, grouping, selectors, saved values, public project copy or CV content.
- Unified publication and save states across forms and visual editor. Updated the existing publication-label comparison together with its source to retain the revised/publish/hide actions. Local, online, failed and unpublished statuses remain distinct.
- Preserved file limits, recovery windows, shared Website & CV publishing scope, destructive confirmations and every action handler.

Validation: typecheck passed, 41 relevant tests passed; the existing artwork-summary assertion was updated to the approved Desain satuan wording. The three admin status/copy tests passed again after updating the last shared autosave wording. Diff whitespace check passed. No new tests were added for label-only changes.

Browser evidence on localhost:3020: story disclosure opened; Expense tracking opened and displayed Judul/Ceritanya; mobile viewport 390px had no horizontal overflow; navigation drawer opened and closed on route change; Tempel hasil AI switched to JSON input and removed the redundant helper; Tulis brief restored the provider notice; selecting a stored project populated Cek draft; Edit Masalah awal opened its field and Selesai returned to reading mode. No console errors were captured on these inspected screens. Settings and collection wording were also inspected. No content, upload, Gemini generation, save, publish, delete or credential submission was performed. Other action handlers were inspected in source and covered by the listed focused tests, not individually exercised against the provider.

Antislop delivery gate for this copy-only implementation:

- R-02/R-15/R-16 PASS: revised labels use specific action language, no em/en dashes or marketing claims added.
- R-26/C-2 PASS within the changed-copy scope: existing handlers and form contracts retained; observed disclosure, mode switch, selection, field-edit and navigation actions worked.
- R-27/C-4/C-5 PASS within source/test coverage: truthful persistence/error states, draft-only AI apply and hidden/public distinction passed their regression checks.
- R-03/R-35 PASS for inspected screen: local app running, story labels fit 390px without overflow; scoped browser actions and console checks recorded above. No full fresh UI/accessibility certification or production build is claimed.
- R-31/liveliness PASS: concise casual-professional voice is consistent, layout/style/brand remain unchanged, helper text retained only for non-obvious behavior or consequential state.

Proof screenshot: .impeccable/review/admin-casual-copy-mobile.png. Not committed or pushed in this turn.
