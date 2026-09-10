# Gading Utama — Personal Portfolio

Repositori portofolio digital interaktif karya **Gading Utama** (Marketing Communication & Creative Systems).

## 🚀 Pilihan Halaman Portofolio

Repositori ini menyediakan 2 variasi desain portofolio interaktif:

### 1. `index.html` — Dynamic 3D Workstation Portfolio (Primary)
- **Karakter & Nuansa 3D Interaktif**: Dilengkapi video looping 3D character workstation dengan transisi mulus antara **Light Mode** (suasana siang produktif) dan **Dark Mode** (nuansa remang-remang hangat 2700K).
- **Animasi GSAP 3.12 & ScrollTrigger**:
  - Hero entrance timeline orchestration
  - 3D interactive card tilt dengan layer parallax mouse-tracking
  - Tactile magnetic buttons (tarikan magnetik dan elastic snap-back)
  - Ambient floating orbs berulang halus
- **Performa & Aksesibilitas**: Sepenuhnya mematuhi prinsip anti-slop dan `prefers-reduced-motion`.

### 2. `aura.html` — Aura Bento & Kinetic Portfolio
- **Aesthetic**: Warm dark cream & vibrant orange palette.
- **Fitur**: Bento grid layout, kinetic typography, integrasi Lenis smooth scrolling, dan micro-interactions modern.

---

## 📂 Struktur Berkas

```
├── index.html            # Halaman portofolio utama
├── aura.html             # Halaman portofolio variasi Aura
├── assets/
│   ├── images/           # Fallback poster hero light & dark
│   ├── videos/           # Video looping hero-light.mp4 & hero-dark.mp4
│   └── js/               # Skrip lokal GSAP & ScrollTrigger
└── README.md
```

---

## 💻 Cara Menjalankan Secara Lokal

Cukup buka berkas `index.html` atau `aura.html` langsung di browser modern, atau gunakan web server lokal sederhana:

```bash
# Menggunakan Python
python -m http.server 3000

# Atau menggunakan npx serve
npx serve .
```

Buka di browser:
- `http://localhost:3000/index.html`
- `http://localhost:3000/aura.html`
