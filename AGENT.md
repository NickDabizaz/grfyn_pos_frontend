# AGENT.md — grfyn_pos_frontend (Root)

## Gambaran Umum Proyek

Aplikasi **Point of Sale (POS)** berbasis web yang dibangun dengan React + Vite. Sistem ini mendukung manajemen data master, transaksi penjualan/pembelian, stok, keuangan, dan laporan. Antarmuka menggunakan sistem tab multi-jendela sehingga pengguna dapat membuka beberapa halaman secara bersamaan.

## Stack Teknologi

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 18.3.1 | UI Framework |
| Vite | 5.4.3 | Build tool & dev server |
| React Router | v6 | Routing |
| Zustand | 4.5.5 | State management |
| Axios | 1.7.7 | HTTP client |
| Tailwind CSS | 3.4.10 | Styling |
| DaisyUI | 5.5.19 | UI component theming |
| Lucide React | — | Icon library |
| date-fns | 3.6.0 | Date utilities |
| flatpickr | 4.6.13 | Date picker |
| react-hot-toast | — | Notifikasi toast |

## Struktur Direktori

```
grfyn_pos_frontend/
├── index.html                  # HTML entry point
├── vite.config.js              # Vite config (proxy /api ke backend)
├── tailwind.config.js          # Custom color theme
├── postcss.config.js
├── package.json
└── src/
    ├── App.jsx                 # Root component & routing
    ├── main.jsx                # ReactDOM entry point
    ├── index.css               # Global styles
    ├── api/                    # HTTP client layer
    ├── store/                  # Zustand global state
    ├── hooks/                  # Custom React hooks
    ├── lib/                    # Utilities, helpers, page registry
    ├── layouts/                # Layout wrapper components
    ├── components/             # Reusable UI components
    └── pages/                  # Halaman-halaman aplikasi
        ├── stok/               # Sub-modul manajemen stok
        ├── keuangan/           # Sub-modul keuangan
        └── laporan/            # Sub-modul laporan
```

## Arsitektur Utama

### 1. Sistem Tab Multi-Jendela
- Navigasi sidebar membuka halaman sebagai **tab baru** (bukan navigasi URL tradisional).
- `tabStore` (Zustand) menyimpan daftar tab yang sedang terbuka.
- `pageRegistry.jsx` mendaftarkan semua halaman dengan `kodemenu` unik, label, dan ikon.
- Dashboard selalu dibuka otomatis saat login dan tidak bisa ditutup (`closable: false`).

### 2. Routing URL (React Router v6)
- URL routing tetap ada melalui `App.jsx` tapi sebagian besar navigasi via tab store.
- Dua layout utama: `MainLayout` (sidebar + tab) dan `POSLayout` (terminal POS fullscreen).
- Route `*` redirect ke `/`.

### 3. Autentikasi
- Token JWT disimpan di `localStorage` dengan key `grfyn_token`.
- `authStore` (Zustand) menyimpan `token`, `user`, dan `lokasi`.
- Axios interceptor otomatis menyisipkan header `Authorization: Bearer <token>`.
- Response 401 → logout otomatis & redirect ke `/login`.

### 4. Pola Komponen Halaman
- **Halaman list**: `{Nama}.jsx` — menampilkan tabel data dengan filter & pagination.
- **Halaman form**: `{Nama}Form.jsx` — form create/edit, dirender di dalam panel atau modal.
- `useFormMode` hook mengelola mode `tambah` vs `ubah`.

## Konvensi Penamaan

| Entitas | Konvensi | Contoh |
|---------|----------|--------|
| Komponen | PascalCase | `BarangForm.jsx` |
| Hook | camelCase dengan prefix `use` | `useCrudApi.js` |
| Store | camelCase dengan suffix `Store` | `authStore.js` |
| Kodemenu | dot notation | `master.barang`, `penjualan.retur` |
| API endpoint | kebab-case | `/api/barang`, `/api/pelunasan-piutang` |

## Modul-Modul Aplikasi

| Modul | Direktori | Deskripsi |
|-------|-----------|-----------|
| API Layer | `src/api/` | Axios instance & interceptors |
| State Management | `src/store/` | Auth, cart, tab state |
| Custom Hooks | `src/hooks/` | CRUD, form mode, pagination |
| Utilities | `src/lib/` | Formatting, page registry, form helpers |
| Layouts | `src/layouts/` | Wrapper layout utama & POS |
| UI Components | `src/components/` | Komponen reusable |
| Pages Root | `src/pages/` | Auth, master data, transaksi |
| Stok | `src/pages/stok/` | Manajemen stok & HPP |
| Keuangan | `src/pages/keuangan/` | Piutang & hutang |
| Laporan | `src/pages/laporan/` | Semua halaman laporan |

## Aturan Pengembangan

1. **Jangan buat route baru** tanpa mendaftarkan juga di `pageRegistry.jsx` dengan `kodemenu` yang sesuai.
2. **Gunakan `useCrudApi`** untuk semua operasi CRUD ke backend — jangan buat axios call langsung di komponen.
3. **Gunakan `useFormMode`** untuk mengelola state form create/edit.
4. **Gunakan `usePagination`** untuk paginasi data di halaman list.
5. **Styling hanya dengan Tailwind CSS** — jangan tambahkan CSS inline atau file CSS baru kecuali sangat diperlukan.
6. **Gunakan warna tema**: `primary`, `accent`, `warm`, `dark` (lihat `tailwind.config.js`).
7. **Toast notifikasi** menggunakan `react-hot-toast` — `useCrudApi` sudah menangani ini otomatis.
8. **Semua teks UI dalam Bahasa Indonesia**.
9. **Format mata uang** menggunakan `formatRupiah()` dari `src/lib/utils.js`.
10. **Ikon** menggunakan Lucide React — jangan campur dengan library ikon lain.

## Konfigurasi Dev Server

- Dev server berjalan di port default Vite.
- Proxy `/api` mengarah ke backend (lihat `vite.config.js`).
- Variabel environment: gunakan prefix `VITE_` untuk env yang diakses di frontend.
