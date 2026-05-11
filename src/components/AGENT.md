# AGENT.md — src/components/

## Tujuan

Komponen UI reusable yang digunakan di seluruh aplikasi. Semua komponen di sini bersifat **domain-agnostic** — tidak mengandung logika bisnis spesifik.

## Struktur File

```
src/components/
├── layout/
│   ├── Layout.jsx          # Generic layout wrapper
│   └── Sidebar.jsx         # Layout-level sidebar variant
└── ui/
    ├── ConfirmDialog.jsx    # Dialog konfirmasi dengan Context API
    ├── FormPanel.jsx        # Panel wrapper untuk form
    ├── MultiSelect.jsx      # Input multi-pilihan
    ├── MultiSelectModal.jsx # Multi-pilihan via modal
    ├── Pagination.jsx       # Kontrol navigasi halaman
    ├── SearchableSelect.jsx # Dropdown dengan fitur pencarian
    └── TabContainer.jsx     # Container tab internal halaman
```

---

## ConfirmDialog.jsx

### Tujuan

Dialog konfirmasi yang dapat dipanggil secara programatik dari mana saja di aplikasi. Menggunakan React Context + Promise pattern.

### Setup

`ConfirmProvider` sudah di-wrap di root `App.jsx` — tidak perlu ditambahkan lagi.

### Penggunaan

```js
import { useConfirm } from '../components/ui/ConfirmDialog';

function MyComponent() {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Hapus Data',
      message: 'Yakin ingin menghapus data ini?',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
    });
    if (ok) {
      // lakukan delete
    }
  };
}
```

### Aturan

- **Selalu gunakan** `useConfirm()` untuk konfirmasi destructive action (hapus, reset, dll).
- Jangan gunakan `window.confirm()` — tidak konsisten dengan UI aplikasi.
- Dialog bersifat async/await — menunggu respons user sebelum melanjutkan.

---

## FormPanel.jsx

### Tujuan

Wrapper panel yang digunakan untuk menampilkan form create/edit di samping tabel list (layout split-view).

### Props

| Prop | Tipe | Deskripsi |
|------|------|-----------|
| `title` | `string` | Judul panel form |
| `onClose` | `fn` | Callback saat panel ditutup |
| `children` | `ReactNode` | Konten form |

### Aturan

- Digunakan ketika form ditampilkan inline (bukan modal/halaman terpisah).
- Panel muncul di sisi kanan tabel list.

---

## Pagination.jsx

### Tujuan

Komponen kontrol paginasi — tombol prev/next dan nomor halaman.

### Props

| Prop | Tipe | Deskripsi |
|------|------|-----------|
| `page` | `number` | Halaman saat ini |
| `totalPages` | `number` | Total halaman |
| `onPageChange` | `fn(page)` | Callback saat halaman berubah |

### Aturan

- Selalu gunakan bersama `usePagination` hook.
- Tampilkan hanya jika `totalPages > 1`.

---

## SearchableSelect.jsx

### Tujuan

Dropdown select dengan fitur pencarian teks. Digunakan untuk memilih dari daftar panjang (barang, supplier, customer, dll).

### Props

| Prop | Tipe | Deskripsi |
|------|------|-----------|
| `options` | `array` | Daftar pilihan `[{ value, label }]` |
| `value` | `any` | Nilai yang dipilih |
| `onChange` | `fn(value)` | Callback saat pilihan berubah |
| `placeholder` | `string` | Placeholder teks |
| `disabled` | `boolean` | Nonaktifkan input |

### Aturan

- Gunakan untuk field select yang memiliki lebih dari 10 opsi.
- Untuk opsi sedikit (< 10), gunakan `<select>` HTML biasa.

---

## MultiSelect.jsx & MultiSelectModal.jsx

### Tujuan

Input untuk memilih beberapa nilai sekaligus.

- `MultiSelect.jsx` — inline multi-select dalam form.
- `MultiSelectModal.jsx` — multi-select via modal popup (untuk dataset besar).

### Aturan

- Gunakan `MultiSelectModal` jika opsi perlu di-fetch dari API (tidak di-load semua sekaligus).
- Gunakan `MultiSelect` untuk opsi statis atau dataset kecil.

---

## TabContainer.jsx

### Tujuan

Container tab internal di dalam sebuah halaman (bukan tab antar halaman). Digunakan untuk memisahkan konten dalam satu halaman menjadi beberapa tab.

### Aturan

- Ini bukan pengganti `tabStore` — hanya untuk sub-navigasi di dalam satu halaman.
- Contoh penggunaan: halaman laporan dengan tab "Ringkasan" dan "Detail".

---

## Aturan Umum Komponen UI

1. **Semua komponen UI bersifat controlled** — state dikelola oleh parent via props.
2. **Jangan hardcode warna** — gunakan class Tailwind dengan palette tema (`primary`, `accent`, `warm`, `dark`).
3. **Jangan buat komponen baru** jika komponen yang ada bisa digunakan dengan props yang berbeda.
4. **Aksesibilitas**: Setiap form input harus punya `label` atau `aria-label`.
5. **Loading state**: Tombol submit harus disabled dan menampilkan spinner saat `loading: true`.
