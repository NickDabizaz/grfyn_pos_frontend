# Modul Keuangan (Frontend)

## Overview
Halaman akuntansi: kas, pelunasan piutang, dan pelunasan hutang.

## Subfolders
| Folder | Isi |
|--------|-----|
| `Kas/` | Kas.jsx + KasForm.jsx |
| `PelunasanPiutang/` | PelunasanPiutang.jsx + PelunasanPiutangForm.jsx |
| `PelunasanHutang/` | PelunasanHutang.jsx + PelunasanHutangForm.jsx |

## Patterns
- Kas: transaksi kas masuk/keluar dengan akun (COA)
- PelunasanPiutang: pilih customer → invoice belum lunas → input bayar per invoice (partial allowed)
- PelunasanHutang: pilih supplier → PO/beli belum lunas → input bayar per PO (partial allowed)
- Total bayar detail harus sama dengan totalbayar header

## Dependencies
- `../../api/axios`
- `../../lib/utils`
- `../../lib/formHelpers`
- `../../hooks/usePagination`
- `../../store/tabStore`

## Known Limitations / TODO
- Tidak ada
