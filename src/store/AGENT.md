# AGENT.md — src/store/

## Tujuan

Global state management menggunakan **Zustand**. Terdapat tiga store yang masing-masing bertanggung jawab atas domain yang berbeda.

## Struktur File

```
src/store/
├── authStore.js   # State autentikasi & user
├── cartStore.js   # State keranjang belanja POS
└── tabStore.js    # State sistem tab multi-jendela
```

---

## authStore.js

### State

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `token` | `string \| null` | JWT token, diambil dari localStorage saat init |
| `user` | `object \| null` | Data user yang login |
| `lokasi` | `object \| null` | Data lokasi/cabang aktif |

### Actions

| Action | Parameter | Deskripsi |
|--------|-----------|-----------|
| `login(token, user, lokasi)` | token, user object, lokasi object | Simpan ke state & localStorage |
| `logout()` | — | Hapus semua data dari state & localStorage |
| `updateUser(user)` | user object | Update data user tanpa logout |

### Aturan

- State ini **persisten** via localStorage — nilai tetap ada setelah refresh halaman.
- `login()` dipanggil setelah berhasil autentikasi dari backend.
- `logout()` dipanggil dari `MainLayout` saat user klik logout atau interceptor 401 mendeteksi token expired.
- Import dengan: `import { useAuthStore } from '../store/authStore'`

---

## cartStore.js

### Tujuan

Menyimpan state keranjang belanja untuk modul POS (Point of Sale). State ini **tidak persisten** (reset saat refresh).

### State

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `items` | `array` | Daftar item di keranjang |
| `customer` | `object \| null` | Customer yang dipilih |

### Struktur Item

```js
{
  idbarang: string,   // ID unik barang
  // ...field barang lainnya dari API
  jml: number,        // Jumlah (quantity), minimal 1
}
```

### Actions

| Action | Parameter | Deskripsi |
|--------|-----------|-----------|
| `addItem(item)` | item object | Tambah item; jika sudah ada, increment `jml` |
| `removeItem(idbarang)` | string | Hapus item dari keranjang |
| `updateQty(idbarang, jml)` | string, number | Update quantity, minimal 1 |
| `setCustomer(customer)` | object | Set customer aktif |
| `clearCart()` | — | Reset keranjang dan customer |

### Aturan

- `addItem()` bersifat idempoten untuk item yang sama — increment quantity, tidak duplikat.
- `updateQty()` tidak bisa kurang dari 1 (`Math.max(1, jml)`).
- `clearCart()` dipanggil setelah transaksi POS berhasil disimpan.
- Import dengan: `import { useCartStore } from '../store/cartStore'`

---

## tabStore.js

### Tujuan

Mengelola sistem tab multi-jendela. Setiap halaman yang dibuka dari sidebar menjadi sebuah tab. State ini **tidak persisten**.

### State

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `tabs` | `array` | Daftar tab yang terbuka |
| `activeTabId` | `number \| null` | ID tab yang sedang aktif |

### Struktur Tab

```js
{
  id: number,           // Auto-increment ID unik
  label: string,        // Label yang ditampilkan di tab bar
  icon: Component,      // Lucide icon component (opsional)
  component: Component, // React component halaman
  props: object,        // Props yang diteruskan ke component
  type: string,         // 'list' | 'form' (default: 'list')
  kodemenu: string,     // Kode unik menu (misal 'master.barang')
  state: object,        // State internal tab (persisten selama tab terbuka)
  dirty: boolean,       // Ada perubahan yang belum disimpan
  closable: boolean,    // Bisa ditutup (default: true)
}
```

### Actions

| Action | Parameter | Deskripsi |
|--------|-----------|-----------|
| `openTab(config)` | tab config | Buka tab baru, return `id` |
| `openOrFocusTab(config)` | tab config | Buka tab baru atau fokus ke tab yang sudah ada (by `kodemenu`) |
| `closeTab(id)` | number | Tutup tab; tidak bisa tutup jika `closable: false` |
| `setActiveTab(id)` | number | Aktifkan tab |
| `updateTabState(id, partialState)` | number, object | Update state internal tab |
| `setTabDirty(id, dirty)` | number, boolean | Tandai tab memiliki perubahan unsaved |
| `closeAllTabs()` | — | Tutup semua tab yang `closable: true` |

### Aturan

- **Dashboard** (`kodemenu: 'dashboard'`) selalu `closable: false` dan tidak bisa ditutup.
- `openOrFocusTab()` adalah cara yang benar untuk membuka halaman dari sidebar — cegah duplikat tab.
- `kodemenu` harus terdaftar di `pageRegistry.jsx` agar dapat dibuka via sidebar.
- Import default: `import useTabStore from '../store/tabStore'`
