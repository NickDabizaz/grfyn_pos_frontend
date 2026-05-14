# Modul HR (Frontend)

## Overview
Halaman Human Resources: data karyawan, absensi harian, dan payroll.

## Subfolders
| Folder | Isi |
|--------|-----|
| `Karyawan/` | Karyawan.jsx + KaryawanForm.jsx |
| `Absensi/` | Absensi.jsx + AbsensiForm.jsx |
| `Payroll/` | Payroll.jsx + PayrollForm.jsx |

## Patterns
- Karyawan: soft delete (status NONAKTIF)
- Absensi: record harian per karyawan, unique constraint per tanggal
- Payroll: generate dari karyawan AKTIF × komponen gaji × hari hadir
- Payroll posting: insert jurnal DEBET Beban Gaji, KREDIT Hutang Gaji

## Dependencies
- `../../api/axios`
- `../../lib/utils`
- `../../hooks/usePagination`
- `../../store/tabStore`

## Known Limitations / TODO
- Tidak ada
