# Modul Penjualan (Frontend)

## Overview
Halaman transaksi penjualan: faktur jual, retur, dan tukar barang.

## Subfolders
| Folder | Isi |
|--------|-----|
| `Penjualan/` | Penjualan.jsx + PenjualanForm.jsx |
| `ReturJual/` | ReturJual.jsx + ReturJualForm.jsx |
| `TukarBarang/` | TukarBarang.jsx + TukarBarangForm.jsx |

## Patterns
- PenjualanForm: pilih customer → tambah item → hitung grand total otomatis
- Mendukung cash/kredit dan sisa piutang
- ReturJualForm mengacu ke invoice yang sudah ada
- TukarBarangForm mengelola barang kembali + barang baru
- Print faktur via HTML inline (`window.print()`)

## Dependencies
- `../../api/axios`
- `../../lib/utils`
- `../../lib/formHelpers`
- `../../hooks/usePagination`
- `../../store/tabStore`
- `../../store/authStore`

## Known Limitations / TODO
- TukarBarangForm masih bisa diperkecil (refactor ke sub-komponen)
