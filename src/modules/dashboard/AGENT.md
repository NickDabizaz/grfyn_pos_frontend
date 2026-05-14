# Modul Dashboard (Frontend)

## Overview
Halaman landing setelah login. Menampilkan ringkasan statistik bisnis dan chart penjualan.

## File List
- `Dashboard.jsx`

## Page Summary
| Kodemenu | File | API Endpoint |
|----------|------|--------------|
| dashboard | Dashboard.jsx | /dashboard/summary, /dashboard/chart |

## Business Rules / Patterns
- Dashboard dibuka otomatis saat login (tidak bisa ditutup)
- Menampilkan: total transaksi hari ini, total penjualan, laba kotor, stok menipis
- Chart penjualan 7 hari terakhir
- Data di-fetch dari `/dashboard/summary` dan `/dashboard/chart`
- Refresh manual via tombol refresh

## Dependencies
- `api/axios`
- `lib/utils` (formatRupiah)

## Known Limitations / TODO
- Tidak ada
