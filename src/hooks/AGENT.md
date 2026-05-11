# AGENT.md — src/hooks/

## Tujuan

Kumpulan custom React hooks yang mengenkapsulasi logika yang sering digunakan di seluruh aplikasi. Semua hooks bersifat reusable dan tidak bergantung pada domain bisnis tertentu.

## Struktur File

```
src/hooks/
├── useCrudApi.js      # Operasi CRUD generik ke API
├── useFormMode.js     # Manajemen mode form (tambah/ubah)
├── usePagination.js   # Logika paginasi data
└── useTabView.js      # Manajemen tampilan tab dalam halaman
```

---

## useCrudApi.js

### Tujuan

Hook generik untuk semua operasi CRUD (Create, Read, Update, Delete) ke backend API. Menangani loading state, error state, dan toast notifikasi secara otomatis.

### Signature

```js
const { loading, error, getAll, getOne, create, update, remove } = useCrudApi(endpoint);
```

### Parameter

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `endpoint` | `string` | Path API relatif, contoh: `'/barang'`, `'/pembelian'` |

### Return Value

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `loading` | `boolean` | True saat ada request berjalan |
| `error` | `string \| null` | Pesan error terakhir |
| `getAll(params)` | `async fn` | GET `endpoint` dengan query params opsional |
| `getOne(id)` | `async fn` | GET `endpoint/:id` |
| `create(payload)` | `async fn` | POST `endpoint` |
| `update(id, payload)` | `async fn` | PUT `endpoint/:id` |
| `remove(id)` | `async fn` | DELETE `endpoint/:id` |

### Perilaku Otomatis

- **Toast sukses**: Ditampilkan untuk `create`, `update`, `remove`.
- **Toast error**: Ditampilkan untuk semua operasi yang gagal.
- **Loading state**: Diatur otomatis saat request mulai dan selesai.
- **Error extraction**: Mengambil `err.response?.data?.message` atau pesan default.

### Contoh Penggunaan

```js
import { useCrudApi } from '../hooks/useCrudApi';

function BarangPage() {
  const { loading, getAll, create, update, remove } = useCrudApi('/barang');

  useEffect(() => {
    getAll({ search: '' }).then(data => setItems(data));
  }, []);
}
```

### Aturan

- **Wajib digunakan** untuk semua operasi CRUD — jangan buat axios call langsung di komponen.
- Setiap komponen halaman membuat instance `useCrudApi` sendiri.
- `getAll()` menerima object params untuk query string (`search`, `page`, filter, dll).
- Semua fungsi return `Promise` — gunakan `try/catch` atau `.catch()` jika perlu penanganan error tambahan.

---

## useFormMode.js

### Tujuan

Mengelola mode form antara **tambah** (create) dan **ubah** (edit), beserta data record yang sedang diedit.

### Signature

```js
const { mode, data, setTambah, setUbah, isTambah, isUbah } = useFormMode();
```

### Return Value

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `mode` | `'tambah' \| 'ubah'` | Mode form saat ini |
| `data` | `object \| null` | Data record untuk mode ubah, null saat tambah |
| `setTambah()` | `fn` | Set mode ke tambah, clear data |
| `setUbah(record)` | `fn` | Set mode ke ubah, simpan record |
| `isTambah` | `boolean` | Shortcut: apakah mode tambah |
| `isUbah` | `boolean` | Shortcut: apakah mode ubah |

### Contoh Penggunaan

```js
const { isTambah, isUbah, data, setTambah, setUbah } = useFormMode();

// Tombol Tambah
<button onClick={setTambah}>Tambah Baru</button>

// Klik Edit pada tabel
<button onClick={() => setUbah(record)}>Edit</button>

// Dalam form
const initialValues = isTambah ? defaultValues : data;
```

### Aturan

- Digunakan di **halaman list** yang memiliki form inline atau sidebar panel.
- Saat `setTambah()` dipanggil, `data` direset ke `null` — form harus menggunakan nilai default.
- Saat `setUbah(record)` dipanggil, `data` berisi record lengkap dari API.

---

## usePagination.js

### Tujuan

Paginasi client-side untuk array data yang sudah di-load. Cocok untuk dataset kecil-menengah.

### Signature

```js
const { page, setPage, totalPages, paginatedItems, resetPage } = usePagination(items, pageSize);
```

### Parameter

| Parameter | Tipe | Default | Deskripsi |
|-----------|------|---------|-----------|
| `items` | `array` | — | Array data yang akan dipaginasi |
| `pageSize` | `number` | `20` | Jumlah item per halaman |

### Return Value

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `page` | `number` | Halaman saat ini (mulai dari 1) |
| `setPage(p)` | `fn` | Pindah ke halaman p (dengan boundary check) |
| `totalPages` | `number` | Total jumlah halaman |
| `paginatedItems` | `array` | Slice items untuk halaman saat ini |
| `resetPage()` | `fn` | Reset ke halaman 1 |

### Aturan

- Panggil `resetPage()` setiap kali filter/search berubah agar kembali ke halaman 1.
- `paginatedItems` dihitung dengan `useMemo` — aman untuk render ulang.
- Untuk dataset besar (>1000 item), pertimbangkan server-side pagination via `getAll(params)`.

---

## useTabView.js

### Tujuan

Mengelola navigasi antar view di dalam sebuah tab (misalnya dari tampilan list ke form detail tanpa buka tab baru).

### Aturan

- Digunakan ketika sebuah halaman memiliki sub-view internal (list → form dalam satu tab).
- Tidak digunakan untuk navigasi antar modul utama — itu tanggung jawab `tabStore`.
