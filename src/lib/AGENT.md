# AGENT.md — src/lib/

## Tujuan

Kumpulan utilitas, helper, dan registry yang digunakan di seluruh aplikasi. Bukan komponen UI, bukan hooks — ini adalah fungsi murni, konfigurasi, dan komponen modal helper.

## Struktur File

```
src/lib/
├── pageRegistry.jsx   # Registry semua halaman & fungsi navigasi tab
├── formHelpers.jsx    # Modal browse untuk memilih entitas (barang, customer, dll)
└── utils.js           # Fungsi formatting & utilitas umum
```

---

## pageRegistry.jsx

### Tujuan

Registry terpusat semua halaman aplikasi. Menjadi sumber kebenaran tunggal (single source of truth) untuk mapping antara `kodemenu`, komponen halaman, label, dan ikon.

### Exports

#### `registry` (object, default tidak diexport)

Object mapping `kodemenu → { component, label, icon, closable }`.

#### `getPage(kodemenu)`

```js
getPage('master.barang') // → { component: Barang, label: 'Barang', icon: Package }
getPage('unknown')       // → null
```

#### `openPageFromSidebar(kodemenu, openOrFocus)`

Membuka halaman dari sidebar ke sistem tab. Menggunakan `openOrFocusTab` dari `tabStore`.

```js
openPageFromSidebar('penjualan', openOrFocus);
```

#### `DASHBOARD_KODE`

Konstanta string `'dashboard'` — kode menu untuk Dashboard.

### Daftar Kodemenu

| Kodemenu | Label | Komponen |
|----------|-------|----------|
| `dashboard` | Dashboard | Dashboard |
| `pos` | POS | Pos |
| `master.barang` | Barang | Barang |
| `master.supplier` | Supplier | Supplier |
| `master.customer` | Customer | Customer |
| `master.akun` | Akun | Akun |
| `master.user` | User | User |
| `master.lokasi` | Lokasi | Lokasi |
| `pembelian` | Pembelian | Pembelian |
| `penjualan` | Penjualan | Penjualan |
| `penjualan.transaksi` | Transaksi Jual | Penjualan |
| `penjualan.retur` | Retur Penjualan | ReturJual |
| `penjualan.tukarbarang` | Tukar Barang | TukarBarang |
| `stok.saldoawal` | Saldo Awal Stok | SaldoAwalStok |
| `stok.penyesuaian` | Penyesuaian Stok | PenyesuaianStok |
| `stok.hitunghpp` | Hitung HPP | HitungHPP |
| `stok.kartustok` | Kartu Stok | (placeholder) |
| `kas` | Kas | Kas |
| `keuangan.kas` | Kas | Kas |
| `keuangan.pelunasanpiutang` | Pelunasan Piutang | PelunasanPiutang |
| `keuangan.pelunasanhutang` | Pelunasan Hutang | PelunasanHutang |
| `laporan.penjualan` | Laporan Penjualan | LaporanPenjualan |
| `laporan.pembelian` | Laporan Pembelian | LaporanPembelian |
| `laporan.barang` | Laporan Barang | LaporanBarang |
| `laporan.stoksekarang` | Stok Sekarang | LaporanStokSekarang |
| `laporan.kartustok` | Kartu Stok | LaporanStokKartuStok |
| `setting` | Setting | Setting |

### Aturan

- **Wajib daftarkan** setiap halaman baru di sini sebelum dapat dibuka dari sidebar.
- Konvensi `kodemenu`: `{modul}.{submodul}` dengan dot notation, huruf kecil semua.
- `closable: false` hanya untuk Dashboard — jangan terapkan ke halaman lain.
- Ikon diambil dari **Lucide React** saja.

---

## formHelpers.jsx

### Tujuan

Menyediakan komponen modal "Browse" yang memungkinkan user memilih entitas dari daftar dengan pencarian. Digunakan di form transaksi untuk memilih customer, supplier, barang, dll.

### Komponen yang Tersedia

Setiap komponen browse memiliki pola props yang sama:

```js
<BrowseCustomer
  open={boolean}
  onClose={() => void}
  onSelect={(item) => void}
/>
```

### Aturan

- Komponen browse bersifat **modal dialog** — tidak menavigasi ke halaman baru.
- `onSelect(item)` dipanggil dengan object entitas yang dipilih, lalu modal ditutup.
- Komponen browse melakukan fetch data sendiri ke API.
- Gunakan komponen ini di form yang membutuhkan pemilihan entitas terkait.

---

## utils.js

### Fungsi-Fungsi

#### `formatRupiah(num)`

Format angka sebagai string mata uang Rupiah Indonesia.

```js
formatRupiah(15000)    // → "15.000"
formatRupiah(null)     // → "Rp 0"
formatRupiah(NaN)      // → "Rp 0"
```

#### `formatDate(date)`

Format tanggal ke format Indonesia (hari, bulan singkat, tahun).

```js
formatDate('2024-01-15')  // → "15 Jan 2024"
formatDate(null)           // → "-"
```

#### `today()`

Return tanggal hari ini dalam format `YYYY-MM-DD`.

```js
today()  // → "2024-01-15"
```

#### `firstOfMonth()`

Return tanggal pertama bulan ini dalam format `YYYY-MM-DD`.

```js
firstOfMonth()  // → "2024-01-01"
```

#### `cn(...classes)`

Gabungkan class Tailwind secara kondisional (mirip `clsx`).

```js
cn('btn', isActive && 'btn-primary', isDisabled && 'opacity-50')
// → "btn btn-primary" (jika isActive=true, isDisabled=false)
```

### Aturan

- **Selalu gunakan `formatRupiah()`** untuk menampilkan nilai uang — jangan format manual.
- **Selalu gunakan `formatDate()`** untuk menampilkan tanggal di UI.
- **Selalu gunakan `today()` dan `firstOfMonth()`** sebagai nilai default filter tanggal.
- **Selalu gunakan `cn()`** untuk conditional class names — jangan string concatenation manual.
