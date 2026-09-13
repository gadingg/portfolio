# Second Template Archive & Backup

Arsip lengkap file-file template `second.html` dan seluruh komponen serta route yang berkaitan.

## File yang Disimpan dalam Arsip Ini
1. `second.html` (root static HTML)
2. `public/second.html` (public static HTML)
3. `app/second/page.tsx` (Next.js route `/second`)
4. `components/public/` (Legacy React components untuk second template: `Header.tsx`, `Hero.tsx`, `About.tsx`, `RecentWorks.tsx`, `Gallery.tsx`, `Apps.tsx`, `Footer.tsx`, `ThemeToggle.tsx`, dan folder `cards/`)

## Cara Restore
Kapanpun Anda meminta untuk mengembalikan (restore) filing `second.html` dan seluruh komponennya, jalankan script `restore.ps1` atau perintahkan AI assistant:
```powershell
powershell -ExecutionPolicy Bypass -File archive/second_template/restore.ps1
```
Script tersebut akan menyalin seluruh file kembali ke posisinya semula secara instan tanpa ada data yang hilang.
