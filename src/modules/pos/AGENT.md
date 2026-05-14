# Modul POS (Frontend)

## Overview
Terminal Point of Sale. Standalone layout (POSLayout) yang terpisah dari MainLayout. Menangani transaksi kasir real-time.

## File List
- `PosLayout.jsx`
- `CartSidebar.jsx`
- `HoldRecallModal.jsx`
- `PaymentModal.jsx`
- `ProductCatalog.jsx`
- `TransactionHistory.jsx`
- `Setting.jsx`

## Page Summary
| Kodemenu | File | Keterangan |
|----------|------|------------|
| pos | PosLayout.jsx | Layout utama POS |
| setting | Setting.jsx | Pengaturan toko/logo |

## Business Rules / Patterns
- POS menggunakan layout tersendiri (POSLayout), bukan MainLayout/tab system
- Menggunakan `cartStore` untuk state keranjang belanja
- Alur: pilih customer → cari & tambah barang → lihat cart → proses transaksi → simpan
- PaymentModal menangani pembayaran cash/transfer
- HoldRecallModal untuk simpan/panggil transaksi yang ditunda
- Offline sync via `useOfflineSync`
- Setting: upload logo via multer, simpan path ke tenant

## Dependencies
- `store/cartStore`
- `store/authStore`
- `hooks/useOfflineSync`
- `lib/constants` (DEFAULT_PPN)
- `api/axios`

## Known Limitations / TODO
- Tidak ada
