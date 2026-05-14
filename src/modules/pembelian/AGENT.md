# Modul Pembelian (Frontend)

## Overview
Halaman transaksi pembelian: faktur beli, retur, PO, dan GRN.

## Subfolders
| Folder | Isi |
|--------|-----|
| `Pembelian/` | Pembelian.jsx + PembelianForm.jsx |
| `ReturBeli/` | ReturBeli.jsx + ReturBeliForm.jsx |
| `PurchaseOrder/` | PurchaseOrder.jsx + PurchaseOrderForm.jsx |
| `GRN/` | GRN.jsx + GRNForm.jsx |

## Patterns
- PembelianForm: pilih supplier → tambah item → hitung total otomatis
- PO form: status DRAFT → APPROVED
- GRN form: terima barang dari PO yang di-approve
- ReturBeliForm mengacu ke invoice pembelian

## Dependencies
- `../../api/axios`
- `../../lib/utils`
- `../../lib/formHelpers`
- `../../hooks/usePagination`
- `../../store/tabStore`

## Known Limitations / TODO
- Tidak ada
