# Modul Auth (Frontend)

## Overview
Halaman autentikasi pengguna. Login dan register adalah standalone pages (tidak menggunakan MainLayout/tab system).

## File List
- `Login.jsx`
- `Register.jsx`

## Page Summary
| File | Path Route | Fungsi |
|------|------------|--------|
| Login.jsx | /login | Form login + simpan token ke authStore |
| Register.jsx | /register | Form registrasi tenant baru |

## Business Rules
- Login memanggil `POST /api/auth/login` → simpan token via `authStore.login()`
- Register memanggil `POST /api/auth/register`
- Setelah login berhasil, redirect ke `/app`
- Tidak menggunakan MainLayout — halaman standalone fullscreen

## API Endpoints
- `POST /api/auth/login`
- `POST /api/auth/register`

## Dependencies
- `store/authStore`
- `api/axios`

## Known Limitations / TODO
- Tidak ada
