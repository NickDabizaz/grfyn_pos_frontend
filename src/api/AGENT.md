# AGENT.md — src/api/

## Tujuan

Layer komunikasi HTTP antara frontend dan backend. Berisi konfigurasi Axios dengan interceptor untuk autentikasi dan penanganan error global.

## Struktur File

```
src/api/
└── axios.js    # Axios instance yang sudah dikonfigurasi
```

## axios.js

### Konfigurasi Instance

```js
const api = axios.create({
  baseURL: '/api',   // Proxy ke backend via Vite
  timeout: 15000,    // 15 detik timeout
});
```

- `baseURL: '/api'` — semua request otomatis diprefix `/api`. Di development, Vite proxy meneruskan ke backend.
- `timeout: 15000` — request dibatalkan setelah 15 detik jika tidak ada respons.

### Request Interceptor

Setiap request secara otomatis menyisipkan token JWT ke header:

```
Authorization: Bearer <grfyn_token>
```

- Token diambil dari `localStorage.getItem('grfyn_token')`.
- Jika tidak ada token, header `Authorization` tidak ditambahkan (request dikirim tanpa auth).

### Response Interceptor

Menangani error global:

- **Status 401**: Token kadaluarsa atau tidak valid.
  - Hapus `grfyn_token` dan `grfyn_user` dari localStorage.
  - Redirect ke `/login` (kecuali sudah di halaman login).
- **Error lain**: Diteruskan ke caller via `Promise.reject(err)`.

## Aturan Penggunaan

1. **Selalu import dari file ini**, bukan dari `axios` langsung:
   ```js
   import api from '../api/axios';
   ```
2. **Jangan pernah** set header `Authorization` secara manual — interceptor sudah menanganinya.
3. **Gunakan `useCrudApi` hook** untuk operasi CRUD standar — jangan panggil `api` langsung di komponen kecuali untuk endpoint non-standar.
4. **Endpoint** ditulis relatif terhadap `/api`, contoh: `api.get('/barang')` → `GET /api/barang`.
5. **Jangan ubah `baseURL`** — routing proxy dikonfigurasi di `vite.config.js`.

## Contoh Penggunaan Langsung

```js
import api from '../api/axios';

// GET dengan query params
const { data } = await api.get('/barang', { params: { search: 'mie' } });

// POST
const { data } = await api.post('/pembelian', payload);

// PUT
const { data } = await api.put(`/pembelian/${id}`, payload);

// DELETE
const { data } = await api.delete(`/barang/${id}`);
```

## Penyimpanan Token di localStorage

| Key | Isi |
|-----|-----|
| `grfyn_token` | JWT string |
| `grfyn_user` | JSON string user object |
| `grfyn_lokasi` | JSON string lokasi/branch object |
