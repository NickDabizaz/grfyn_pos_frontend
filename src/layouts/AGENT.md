# AGENT.md — src/layouts/

## Tujuan

Komponen layout wrapper yang membungkus halaman-halaman aplikasi. Menentukan struktur visual utama (sidebar, tab bar, konten) dan menangani logika navigasi serta autentikasi di level layout.

## Struktur File

```
src/layouts/
├── MainLayout.jsx    # Layout utama dengan sidebar & sistem tab
├── POSLayout.jsx     # Layout khusus terminal POS fullscreen
├── Sidebar.jsx       # Komponen navigasi sidebar
├── TabBar.jsx        # Bar header daftar tab yang terbuka
└── TabContent.jsx    # Area konten tab yang aktif
```

---

## MainLayout.jsx

### Tujuan

Layout utama yang digunakan oleh semua halaman kecuali POS dan auth. Menyatukan Sidebar, TabBar, dan TabContent menjadi satu tampilan.

### Struktur Visual

```
┌─────────────────────────────────────────────┐
│  Sidebar (w-64, fixed)  │  TabBar            │
│                         ├────────────────────┤
│  - Logo                 │  TabContent        │
│  - Menu navigasi        │  (konten tab aktif)│
│  - Tombol logout        │                    │
└─────────────────────────────────────────────┘
```

### Logika

1. **Validasi token**: Saat mount, cek token di store. Jika tidak ada, redirect ke `/login`.
2. **Verifikasi server**: Panggil `GET /api/auth/me`. Jika gagal (token expired), logout & redirect.
3. **Buka Dashboard**: Otomatis buka tab Dashboard saat pertama kali login (`dashboardOpened` flag).
4. **Logout handler**: Menutup semua tab, memanggil `logout()` dari authStore, redirect ke `/login`.

### Aturan

- `dashboardOpened` adalah module-level variable (bukan state) — reset saat logout.
- Jangan tambahkan logika bisnis di sini — layout hanya untuk struktur dan auth guard.
- Sidebar lebar tetap `ml-64` di konten area.

---

## POSLayout.jsx

### Tujuan

Layout khusus untuk halaman POS (Point of Sale) yang membutuhkan tampilan fullscreen tanpa sidebar.

### Aturan

- Hanya digunakan untuk route `/pos`.
- Tidak memiliki sidebar, tab bar, atau elemen navigasi standar.
- Dapat mengakses `cartStore` dan `authStore` langsung.

---

## Sidebar.jsx

### Tujuan

Navigasi utama aplikasi. Menampilkan menu hierarkis dan membuka halaman sebagai tab baru.

### Cara Kerja

1. User klik menu item di sidebar.
2. Sidebar memanggil `openPageFromSidebar(kodemenu, openOrFocusTab)` dari `pageRegistry.jsx`.
3. `openOrFocusTab` mengecek apakah tab dengan `kodemenu` yang sama sudah terbuka.
   - Sudah ada → fokus ke tab tersebut.
   - Belum ada → buka tab baru.

### Aturan

- **Jangan navigasi dengan `useNavigate()`** — navigasi dilakukan via `tabStore`.
- Setiap item menu harus punya `kodemenu` yang terdaftar di `pageRegistry.jsx`.
- Grup menu (Master Data, Penjualan, Stok, dll) bisa di-collapse/expand.

---

## TabBar.jsx

### Tujuan

Menampilkan daftar tab yang sedang terbuka sebagai header bar. User dapat klik tab untuk berpindah atau klik ✕ untuk menutup tab.

### Perilaku

- Tab aktif diberi highlight visual.
- Tab dengan `closable: false` tidak menampilkan tombol ✕ (Dashboard).
- Saat tab ditutup dan tab itu aktif, otomatis fokus ke tab terdekat.

### Aturan

- Komponen ini hanya **membaca** state dari `tabStore` — tidak mengubah logika tab.
- Jangan tambahkan fitur navigasi lain di sini.

---

## TabContent.jsx

### Tujuan

Merender komponen halaman dari tab yang sedang aktif. Mengambil `component` dan `props` dari tab yang aktif di `tabStore`.

### Cara Kerja

```js
const activeTab = tabs.find(t => t.id === activeTabId);
const Component = activeTab.component;
return <Component {...activeTab.props} tabId={activeTab.id} />;
```

### Aturan

- Setiap tab dirender secara independen — state komponen tidak dibagikan antar tab.
- `tabId` selalu diteruskan sebagai prop ke komponen halaman untuk operasi `updateTabState`.
- Komponen halaman yang perlu menyimpan state antar mount/unmount harus menggunakan `updateTabState(tabId, state)` dari `tabStore`.
