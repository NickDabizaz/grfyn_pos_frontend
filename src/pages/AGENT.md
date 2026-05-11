# AGENT.md — src/pages/

## Tujuan

Berisi semua halaman (page component) aplikasi. Setiap halaman dirender di dalam tab oleh `TabContent.jsx`. Sub-modul yang lebih kompleks memiliki direktori sendiri.

## Struktur File

```
src/pages/
├── Login.jsx               # Halaman login
├── Register.jsx            # Halaman registrasi
├── Dashboard.jsx           # Dashboard utama
├── Pos.jsx                 # Terminal POS
├── Setting.jsx             # Pengaturan aplikasi
├── Laporan.jsx             # Hub/selector laporan
├── Hpp.jsx                 # Halaman HPP
├── Stok.jsx                # Overview stok

# Master Data
├── Barang.jsx / BarangForm.jsx
├── Customer.jsx / CustomerForm.jsx
├── Supplier.jsx / SupplierForm.jsx
├── User.jsx / UserForm.jsx
├── Akun.jsx / AkunForm.jsx
├── Lokasi.jsx / LokasiForm.jsx

# Transaksi Pembelian
├── Pembelian.jsx / PembelianForm.jsx

# Transaksi Penjualan
├── Penjualan.jsx / PenjualanForm.jsx
├── ReturJual.jsx / ReturJualForm.jsx
├── TukarBarang.jsx / TukarBarangForm.jsx

# Kas
├── Kas.jsx / KasForm.jsx

# Sub-modul
├── stok/           # Manajemen stok & HPP
├── keuangan/       # Piutang & hutang
└── laporan/        # Semua halaman laporan
```

---

## Pola Halaman List

Semua halaman list (`Barang.jsx`, `Pembelian.jsx`, dll.) mengikuti pola yang sama:

```jsx
function NamaHalaman() {
  const { loading, getAll, remove } = useCrudApi('/endpoint');
  const { mode, data, setTambah, setUbah, isTambah } = useFormMode();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);

  // Load data saat mount
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const result = await getAll({ search, ...filters });
    setItems(result.data || result);
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Hapus', message: '...' });
    if (ok) { await remove(id); loadData(); }
  };

  return (
    <div>
      {/* Filter & tombol tambah */}
      {/* Tabel data */}
      {/* Pagination */}
      {/* FormPanel (jika form inline) */}
    </div>
  );
}
```

## Pola Halaman Form

Form halaman (`BarangForm.jsx`, `PembelianForm.jsx`, dll.) mengikuti pola:

```jsx
function NamaForm({ mode, data, onSave, onCancel }) {
  const { loading, create, update } = useCrudApi('/endpoint');
  const [form, setForm] = useState(mode === 'ubah' ? data : defaultValues);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'tambah') await create(form);
    else await update(data.id, form);
    onSave();
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Halaman-Halaman Utama

### Login.jsx & Register.jsx

- **Tidak menggunakan MainLayout** — standalone page.
- Login memanggil `POST /api/auth/login` → simpan token via `authStore.login()`.
- Register memanggil `POST /api/auth/register`.
- Setelah login berhasil, redirect ke `/`.

### Dashboard.jsx

- **Kodemenu**: `dashboard` — tidak bisa ditutup.
- Menampilkan ringkasan statistik (penjualan hari ini, stok rendah, dll).
- Fetch data dari endpoint dashboard API.

### Pos.jsx

- **Menggunakan POSLayout** (bukan MainLayout).
- **Kodemenu**: `pos`.
- Menggunakan `cartStore` untuk state keranjang belanja.
- Alur: pilih customer → cari & tambah barang → lihat cart → proses transaksi → simpan.

### Setting.jsx

- **Kodemenu**: `setting`.
- Pengaturan profil user dan konfigurasi aplikasi.

---

## Modul Master Data

Semua entitas master data mengikuti pola CRUD standar.

### Barang (Produk)

- **Kodemenu**: `master.barang`
- **API endpoint**: `/barang`
- Field penting: `kodebarang`, `namabarang`, `satuan`, `hargajual`, `hargabeli`, `stok`
- Form memiliki sub-form untuk varian/satuan alternatif.

### Customer

- **Kodemenu**: `master.customer`
- **API endpoint**: `/customer`
- Field penting: `kodecustomer`, `namacustomer`, `telp`, `alamat`, `piutang`

### Supplier

- **Kodemenu**: `master.supplier`
- **API endpoint**: `/supplier`
- Field penting: `kodesupplier`, `namasupplier`, `telp`, `alamat`, `hutang`

### Akun

- **Kodemenu**: `master.akun`
- **API endpoint**: `/akun`
- Akun keuangan untuk jurnal (Chart of Accounts).

### User

- **Kodemenu**: `master.user`
- **API endpoint**: `/user`
- Manajemen pengguna aplikasi.

### Lokasi

- **Kodemenu**: `master.lokasi`
- **API endpoint**: `/lokasi`
- Cabang/gudang lokasi bisnis.

---

## Modul Pembelian

### Pembelian.jsx

- **Kodemenu**: `pembelian`
- **API endpoint**: `/pembelian`
- Daftar purchase order dengan filter tanggal dan supplier.

### PembelianForm.jsx

- Form input pembelian dengan line items (detail barang yang dibeli).
- Memilih supplier via browse modal dari `formHelpers.jsx`.
- Detail barang: barang, jumlah, harga beli, diskon.

---

## Modul Penjualan

### Penjualan.jsx

- **Kodemenu**: `penjualan` atau `penjualan.transaksi`
- **API endpoint**: `/penjualan`
- Daftar invoice penjualan.

### PenjualanForm.jsx

- Form input penjualan (file terbesar: ~28KB).
- Memilih customer via browse modal.
- Detail: barang, jumlah, harga jual, diskon.
- Mendukung pembayaran dan sisa piutang.

### ReturJual.jsx & ReturJualForm.jsx

- **Kodemenu**: `penjualan.retur`
- **API endpoint**: `/returjual`
- Retur barang dari penjualan yang sudah ada.
- Form mengacu ke nomor invoice penjualan.

### TukarBarang.jsx & TukarBarangForm.jsx

- **Kodemenu**: `penjualan.tukarbarang`
- **API endpoint**: `/tukarbarang`
- Penukaran barang (barang lama ditukar dengan barang baru).
- Form terbesar (~31KB) karena mengelola dua sisi transaksi.

---

## Kas.jsx & KasForm.jsx

- **Kodemenu**: `kas` atau `keuangan.kas`
- **API endpoint**: `/kas`
- Pencatatan transaksi kas masuk/keluar.
- Field: tanggal, keterangan, nominal, jenis (masuk/keluar), akun.

---

## Aturan Umum Halaman

1. **Setiap halaman list** harus menggunakan `useCrudApi`, `useFormMode`, dan `usePagination`.
2. **Konfirmasi hapus** selalu menggunakan `useConfirm()` — jangan alert biasa.
3. **Filter tanggal** default: `firstOfMonth()` s/d `today()` dari `utils.js`.
4. **Nilai uang** selalu ditampilkan dengan `formatRupiah()`.
5. **Tanggal** selalu ditampilkan dengan `formatDate()`.
6. **Reload data** setelah setiap operasi CUD (create/update/delete) berhasil.
7. **Form submit** harus disable tombol saat `loading: true`.
8. **Semua label & pesan** dalam Bahasa Indonesia.
