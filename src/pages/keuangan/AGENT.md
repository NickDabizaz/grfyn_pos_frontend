# AGENT.md — src/pages/keuangan/

## Tujuan

Sub-modul keuangan untuk pengelolaan pelunasan piutang (tagihan ke customer) dan pelunasan hutang (kewajiban ke supplier).

## Struktur File

```
src/pages/keuangan/
├── PelunasanPiutang.jsx       # Daftar pelunasan piutang customer
├── PelunasanPiutangForm.jsx   # Form input pelunasan piutang
├── PelunasanHutang.jsx        # Daftar pelunasan hutang supplier
└── PelunasanHutangForm.jsx    # Form input pelunasan hutang
```

---

## PelunasanPiutang

### Tujuan

Mencatat pembayaran dari customer untuk melunasi piutang yang timbul dari transaksi penjualan kredit.

### Kodemenu

`keuangan.pelunasanpiutang`

### API Endpoint

`/pelunasan-piutang`

### Alur Proses

1. Pilih customer yang memiliki saldo piutang.
2. Sistem menampilkan daftar invoice penjualan yang belum lunas.
3. User memasukkan jumlah pembayaran per invoice (bisa partial).
4. Simpan → piutang customer berkurang sesuai pembayaran.

### Field Header

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `tanggal` | `date` | Tanggal pembayaran |
| `nopelunasan` | `string` | Nomor dokumen (auto-generate) |
| `idcustomer` | `string` | ID customer |
| `namacustomer` | `string` | Nama customer |
| `totalbayar` | `number` | Total pembayaran yang diterima |
| `keterangan` | `string` | Catatan pembayaran |

### Field Detail

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `nofaktur` | `string` | Nomor invoice penjualan |
| `tanggalfaktur` | `date` | Tanggal invoice |
| `totalfaktur` | `number` | Total nilai invoice |
| `sisapiutang` | `number` | Sisa piutang sebelum pembayaran ini |
| `bayar` | `number` | Jumlah yang dibayar untuk invoice ini |

### Aturan

- Total `bayar` di detail harus sama dengan `totalbayar` di header.
- Pembayaran partial diperbolehkan — sisa piutang akan tetap ada.
- Customer dipilih via browse modal dari `formHelpers.jsx`.
- Setelah disimpan, saldo piutang customer di master data otomatis diupdate backend.

---

## PelunasanHutang

### Tujuan

Mencatat pembayaran kepada supplier untuk melunasi hutang yang timbul dari transaksi pembelian kredit.

### Kodemenu

`keuangan.pelunasanhutang`

### API Endpoint

`/pelunasan-hutang`

### Alur Proses

1. Pilih supplier yang memiliki saldo hutang.
2. Sistem menampilkan daftar purchase order yang belum lunas.
3. User memasukkan jumlah pembayaran per PO (bisa partial).
4. Simpan → hutang ke supplier berkurang sesuai pembayaran.

### Field Header

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `tanggal` | `date` | Tanggal pembayaran |
| `nopelunasan` | `string` | Nomor dokumen (auto-generate) |
| `idsupplier` | `string` | ID supplier |
| `namasupplier` | `string` | Nama supplier |
| `totalbayar` | `number` | Total pembayaran yang dilakukan |
| `keterangan` | `string` | Catatan pembayaran |

### Field Detail

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `nopembelian` | `string` | Nomor purchase order |
| `tanggalpembelian` | `date` | Tanggal PO |
| `totalpembelian` | `number` | Total nilai PO |
| `sisahutang` | `number` | Sisa hutang sebelum pembayaran ini |
| `bayar` | `number` | Jumlah yang dibayar untuk PO ini |

### Aturan

- Sama seperti PelunasanPiutang tetapi arahnya ke supplier.
- Pembayaran partial diperbolehkan.
- Supplier dipilih via browse modal dari `formHelpers.jsx`.
- Setelah disimpan, saldo hutang supplier di master data otomatis diupdate backend.

---

## Aturan Umum Sub-modul Keuangan

1. **Piutang muncul** dari penjualan kredit (PenjualanForm dengan pembayaran tidak penuh).
2. **Hutang muncul** dari pembelian kredit (PembelianForm dengan pembayaran tidak penuh).
3. **Jangan edit langsung** saldo piutang/hutang di master Customer/Supplier — selalu melalui transaksi pelunasan.
4. **Nomor dokumen** pelunasan di-generate otomatis oleh backend — jangan input manual.
5. **Validasi total**: Frontend harus validasi bahwa sum detail `bayar` = `totalbayar` sebelum submit.
6. **Format uang**: Semua nilai menggunakan `formatRupiah()` dari `utils.js`.
7. **Filter default**: Tampilkan data bulan berjalan (`firstOfMonth()` s/d `today()`).
