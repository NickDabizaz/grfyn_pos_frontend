# Modul Master (Frontend)

## Overview
Halaman CRUD master data. Setiap entitas memiliki folder sendiri berisi list page dan form page.

## Subfolders
| Folder | Isi |
|--------|-----|
| `Barang/` | Barang.jsx + BarangForm.jsx |
| `Customer/` | Customer.jsx + CustomerForm.jsx |
| `Supplier/` | Supplier.jsx + SupplierForm.jsx |
| `Lokasi/` | Lokasi.jsx + LokasiForm.jsx |
| `Akun/` | Akun.jsx + AkunForm.jsx |
| `User/` | User.jsx + UserForm.jsx |

## Patterns
- Semua halaman list menggunakan `useCrudApi`, `usePagination`, dan `useFormMode`
- Form dikelola via `FormPanel` (inline form)
- BarangForm memiliki sub-form untuk varian/satuan alternatif
- Konfirmasi hapus selalu `useConfirm()`

## Dependencies
- `../../api/axios`
- `../../lib/utils`
- `../../hooks/usePagination`
- `../../components/ui/Pagination`
- `../../components/ui/ConfirmDialog`
- `../../store/tabStore`

## Known Limitations / TODO
- Tidak ada
