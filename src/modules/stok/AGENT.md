# Modul Stok (Frontend)

## Overview
Halaman manajemen stok: saldo awal, penyesuaian, HPP, produksi, transfer, dan stock opname.

## Subfolders
| Folder | Isi |
|--------|-----|
| `Produksi/` | Produksi.jsx + ProduksiForm.jsx |
| `HitungHPP/` | HitungHPP.jsx + HitungHPPDetail.jsx + HitungHPPForm.jsx |
| `PenyesuaianStok/` | PenyesuaianStok.jsx + PenyesuaianStokForm.jsx |
| `SaldoAwalStok/` | SaldoAwalStok.jsx + SaldoAwalStokForm.jsx |
| `StockOpname/` | StockOpname.jsx + StockOpnameForm.jsx |
| `TransferStok/` | TransferStok.jsx + TransferStokForm.jsx |

## Standalone Files
- `Stok.jsx` — overview kartu stok
- `Hpp.jsx` — versi lama/placeholder HitungHPP

## Patterns
- SaldoAwalStok: input stok awal per barang per lokasi
- PenyesuaianStok: selisih = stok_fisik - stok_sistem
- HitungHPP: trigger perhitungan per bulan, bersifat final
- TransferStok: DRAFT → DIKIRIM → DITERIMA
- StockOpname: DRAFT → update fisik → FINALIZE
- Produksi: BAHAN BAKU/SETENGAH JADI → keluar, BAHAN JADI → masuk

## Dependencies
- `../../api/axios`
- `../../lib/utils`
- `../../lib/formHelpers`
- `../../hooks/usePagination`
- `../../store/tabStore`

## Known Limitations / TODO
- Produksi belum terintegrasi ke hitunghpp
- `Hpp.jsx` mungkin duplikat dari `HitungHPP/HitungHPP.jsx`
