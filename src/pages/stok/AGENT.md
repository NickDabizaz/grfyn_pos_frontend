# AGENT.md — src/pages/stok/

## Tujuan

Sub-modul manajemen stok. Menangani saldo awal stok, penyesuaian stok, dan perhitungan Harga Pokok Penjualan (HPP).

## Struktur File

```
src/pages/stok/
├── SaldoAwalStok.jsx         # Daftar saldo awal stok
├── SaldoAwalStokForm.jsx     # Form input saldo awal stok
├── PenyesuaianStok.jsx       # Daftar penyesuaian stok
├── PenyesuaianStokForm.jsx   # Form penyesuaian stok
├── HitungHPP.jsx             # Daftar periode hitung HPP
├── HitungHPPDetail.jsx       # Detail hasil perhitungan HPP
└── HitungHPPForm.jsx         # Form trigger hitung HPP
```

---

## SaldoAwalStok

### Tujuan

Mencatat stok awal barang pada saat pertama kali sistem digunakan atau awal periode baru.

### Kodemenu

`stok.saldoawal`

### API Endpoint

`/saldo-awal-stok`

### Field Utama

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `tanggal` | `date` | Tanggal saldo awal |
| `idbarang` | `string` | ID barang |
| `namabarang` | `string` | Nama barang (dari relasi) |
| `satuan` | `string` | Satuan barang |
| `qty` | `number` | Jumlah stok awal |
| `harga` | `number` | Harga per unit (untuk HPP) |
| `lokasi` | `string` | Lokasi/gudang |

### Aturan

- Saldo awal hanya boleh diinput **sekali per barang per periode**.
- Setelah ada transaksi berjalan, saldo awal sebaiknya tidak diubah.
- Gunakan browse modal untuk memilih barang (jangan input manual kode barang).

---

## PenyesuaianStok

### Tujuan

Mencatat penyesuaian stok (opname) — perbedaan antara stok sistem dan stok fisik aktual.

### Kodemenu

`stok.penyesuaian`

### API Endpoint

`/penyesuaian-stok`

### Field Utama

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `tanggal` | `date` | Tanggal penyesuaian |
| `nomorpenyesuaian` | `string` | Nomor dokumen (auto-generate) |
| `keterangan` | `string` | Alasan penyesuaian |
| `details` | `array` | Line items penyesuaian |

### Detail Line Item

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `idbarang` | `string` | ID barang |
| `stok_sistem` | `number` | Stok menurut sistem |
| `stok_fisik` | `number` | Stok hasil hitung fisik |
| `selisih` | `number` | `stok_fisik - stok_sistem` (auto-hitung) |

### Aturan

- `selisih` dihitung otomatis di frontend: `stok_fisik - stok_sistem`.
- Penyesuaian positif = stok bertambah, negatif = stok berkurang.
- Setelah disimpan, stok barang di sistem otomatis diupdate oleh backend.

---

## HitungHPP

### Tujuan

Menjalankan perhitungan Harga Pokok Penjualan (HPP) menggunakan metode rata-rata tertimbang atau FIFO (tergantung konfigurasi backend).

### Kodemenu

`stok.hitunghpp`

### API Endpoint

`/hitung-hpp`

### Komponen

#### HitungHPP.jsx

- Menampilkan daftar periode perhitungan HPP yang sudah dijalankan.
- Setiap baris menunjukkan: periode, status, dan tombol lihat detail.

#### HitungHPPDetail.jsx

- Menampilkan hasil detail perhitungan HPP per barang.
- Field: barang, qty terjual, harga pokok per unit, total HPP.

#### HitungHPPForm.jsx

- Form untuk trigger perhitungan HPP baru.
- Input: periode awal dan akhir.
- Proses berjalan di backend — frontend hanya mengirim request dan menunggu respons.

### Aturan

- **HPP bersifat final** setelah dihitung — tidak boleh diedit manual.
- Jika perlu koreksi, batalkan periode dan hitung ulang.
- Perhitungan HPP bergantung pada: saldo awal stok + pembelian - penjualan.
- Pastikan semua transaksi di periode tersebut sudah diinput sebelum hitung HPP.

---

## Aturan Umum Sub-modul Stok

1. **Urutan setup stok baru**: Saldo Awal Stok → Transaksi → Hitung HPP.
2. **Jangan hitung HPP** jika masih ada transaksi yang belum selesai di periode tersebut.
3. **Lokasi stok** mengacu ke master data Lokasi — pastikan lokasi sudah ada sebelum input stok.
4. **Browse barang** selalu menggunakan komponen browse dari `formHelpers.jsx`.
5. **Semua halaman** menggunakan `useCrudApi` dengan endpoint masing-masing.
6. **Filter tanggal** menggunakan `firstOfMonth()` dan `today()` sebagai default.
