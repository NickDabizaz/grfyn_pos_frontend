# Modul Laporan (Frontend)

## Overview
Halaman laporan dan dashboard. Bersifat read-only (kecuali import). Menyediakan laporan penjualan, pembelian, stok, dan master barang.

## File List
- `Laporan.jsx`
- `LaporanBarang.jsx`
- `LaporanMasterBarang.jsx`
- `LaporanPembelian.jsx`
- `LaporanPenjualan.jsx`
- `LaporanResultPage.jsx`
- `LaporanStokKartuStok.jsx`
- `LaporanStokSekarang.jsx`

## Page Summary
| Kodemenu | File | API Endpoint |
|----------|------|--------------|
| laporan.penjualan | LaporanPenjualan.jsx | /laporan/penjualan |
| laporan.pembelian | LaporanPembelian.jsx | /laporan/pembelian |
| laporan.barang | LaporanBarang.jsx | /laporan/barang |
| laporan.masterbarang | LaporanMasterBarang.jsx | /laporan/master-barang |
| laporan.stoksekarang | LaporanStokSekarang.jsx | /laporan/stok-sekarang |
| laporan.kartustok | LaporanStokKartuStok.jsx | /laporan/kartu-stok |

## Business Rules / Patterns
- Semua laporan mengikuti pola: Form Filter → [Tampilkan Laporan] → Tabel Hasil
- Filter tanggal default: `firstOfMonth()` s/d `today()`
- Data tidak auto-fetch saat mount — user harus klik "Tampilkan"
- Export print via `window.print()` dengan CSS media print
- Export Excel via backend endpoint (jika tersedia)
- Format uang selalu `formatRupiah()`
- LaporanResultPage: komponen generik untuk tampilkan hasil laporan secara konsisten

## Dependencies
- `hooks/useCrudApi`
- `components/ui/MultiSelectModal`
- `lib/utils` (today, firstOfMonth, formatRupiah)
- `store/tabStore`
- `store/authStore`

## Known Limitations / TODO
- Tidak ada
