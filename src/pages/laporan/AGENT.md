# AGENT.md — src/pages/laporan/

## Tujuan

Sub-modul laporan. Menyediakan berbagai laporan untuk analisis bisnis — penjualan, pembelian, stok, dan master data barang.

## Struktur File

```
src/pages/laporan/
├── LaporanPenjualan.jsx        # Laporan rekap penjualan
├── LaporanPembelian.jsx        # Laporan rekap pembelian
├── LaporanBarang.jsx           # Laporan pergerakan barang
├── LaporanMasterBarang.jsx     # Laporan daftar master barang
├── LaporanStokSekarang.jsx     # Laporan stok saat ini
├── LaporanStokKartuStok.jsx    # Laporan kartu stok (mutasi)
└── LaporanResultPage.jsx       # Komponen generic hasil laporan
```

Hub laporan berada di `src/pages/Laporan.jsx` (di direktori parent).

---

## Pola Umum Halaman Laporan

Semua halaman laporan mengikuti pola yang sama:

```
1. Form Filter → [Tampilkan Laporan]
2. Tabel Hasil Laporan
3. Opsi Export (Print / Excel)
```

```jsx
function LaporanXxx() {
  const { loading, getAll } = useCrudApi('/laporan/xxx');
  const [filter, setFilter] = useState({
    dari: firstOfMonth(),
    sampai: today(),
    // filter tambahan...
  });
  const [hasil, setHasil] = useState([]);

  const handleTampilkan = async () => {
    const data = await getAll(filter);
    setHasil(data);
  };

  return (
    <div>
      {/* Filter form */}
      {/* Tombol Tampilkan */}
      {/* Tabel hasil / LaporanResultPage */}
    </div>
  );
}
```

---

## LaporanPenjualan.jsx

### Kodemenu

`laporan.penjualan`

### API Endpoint

`/laporan/penjualan`

### Filter

| Filter | Tipe | Default |
|--------|------|---------|
| `dari` | `date` | `firstOfMonth()` |
| `sampai` | `date` | `today()` |
| `idcustomer` | `string` | Semua customer |
| `idsalesperson` | `string` | Semua salesperson |

### Kolom Output

Nomor invoice, tanggal, customer, total, diskon, PPN, grand total, status bayar.

---

## LaporanPembelian.jsx

### Kodemenu

`laporan.pembelian`

### API Endpoint

`/laporan/pembelian`

### Filter

| Filter | Tipe | Default |
|--------|------|---------|
| `dari` | `date` | `firstOfMonth()` |
| `sampai` | `date` | `today()` |
| `idsupplier` | `string` | Semua supplier |

### Kolom Output

Nomor PO, tanggal, supplier, total, status bayar.

---

## LaporanBarang.jsx

### Kodemenu

`laporan.barang`

### API Endpoint

`/laporan/barang`

### Tujuan

Laporan pergerakan barang: berapa banyak barang terjual, dibeli, dan diretur dalam periode tertentu.

### Filter

| Filter | Tipe | Default |
|--------|------|---------|
| `dari` | `date` | `firstOfMonth()` |
| `sampai` | `date` | `today()` |
| `idbarang` | `string` | Semua barang |
| `kategori` | `string` | Semua kategori |

---

## LaporanMasterBarang.jsx

### API Endpoint

`/laporan/master-barang`

### Tujuan

Laporan daftar semua barang dengan informasi lengkap: kode, nama, satuan, harga jual, harga beli, stok saat ini.

### Filter

| Filter | Tipe | Default |
|--------|------|---------|
| `kategori` | `string` | Semua kategori |
| `status` | `string` | Aktif/nonaktif/semua |

---

## LaporanStokSekarang.jsx

### Kodemenu

`laporan.stoksekarang`

### API Endpoint

`/laporan/stok-sekarang`

### Tujuan

Snapshot stok semua barang pada saat laporan ditampilkan.

### Kolom Output

Kode barang, nama, satuan, stok saat ini, harga beli, nilai stok (stok × harga beli).

### Aturan

- Laporan ini tidak memerlukan filter tanggal — selalu menampilkan stok **saat ini**.
- Filter opsional: lokasi/gudang.

---

## LaporanStokKartuStok.jsx

### Kodemenu

`laporan.kartustok`

### API Endpoint

`/laporan/kartu-stok`

### Tujuan

Laporan mutasi stok per barang — menampilkan setiap pergerakan (masuk/keluar) dalam periode tertentu.

### Filter

| Filter | Tipe | Default | Keterangan |
|--------|------|---------|------------|
| `dari` | `date` | `firstOfMonth()` | Wajib |
| `sampai` | `date` | `today()` | Wajib |
| `idbarang` | `string` | — | **Wajib dipilih** |
| `idlokasi` | `string` | — | Opsional |

### Kolom Output

Tanggal, keterangan, sumber transaksi (pembelian/penjualan/penyesuaian), masuk, keluar, saldo.

### Aturan

- Filter `idbarang` **wajib diisi** sebelum laporan bisa ditampilkan.
- Validasi di frontend: tampilkan pesan error jika barang belum dipilih.

---

## LaporanResultPage.jsx

### Tujuan

Komponen generik untuk menampilkan hasil laporan dalam format tabel yang konsisten.

### Props

| Prop | Tipe | Deskripsi |
|------|------|-----------|
| `columns` | `array` | Definisi kolom `[{ key, label, format }]` |
| `data` | `array` | Data laporan |
| `summary` | `object` | Baris total/ringkasan opsional |
| `title` | `string` | Judul laporan untuk print |
| `loading` | `boolean` | State loading |

### Aturan

- Gunakan komponen ini untuk konsistensi tampilan laporan.
- Format angka otomatis jika `format: 'rupiah'` pada definisi kolom.
- Mendukung fungsi print via `window.print()`.

---

## Laporan.jsx (Hub — di src/pages/)

### Tujuan

Halaman induk yang menampilkan selector/menu untuk semua laporan yang tersedia.

### Kodemenu

Tidak memiliki kodemenu tunggal — digunakan oleh beberapa route laporan.

### Aturan

- Halaman ini hanya sebagai navigasi/selector laporan.
- Klik laporan dari hub membuka `LaporanXxx` sebagai tab baru.

---

## Aturan Umum Sub-modul Laporan

1. **Filter tanggal default** selalu `firstOfMonth()` s/d `today()`.
2. **Data tidak ditampilkan** sebelum user klik tombol "Tampilkan" — jangan auto-fetch saat mount.
3. **Export print**: Gunakan `window.print()` dengan CSS media print yang sudah dikonfigurasi.
4. **Export Excel**: Jika tersedia, gunakan endpoint backend yang mengembalikan file Excel.
5. **Format uang** selalu `formatRupiah()` — jangan format manual.
6. **Loading state**: Tampilkan spinner saat fetching laporan.
7. **Empty state**: Tampilkan pesan "Tidak ada data" jika hasil kosong, bukan tabel kosong.
8. **Responsif**: Tabel laporan harus bisa di-scroll horizontal di layar kecil.
