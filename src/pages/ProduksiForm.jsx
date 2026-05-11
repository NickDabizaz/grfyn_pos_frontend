import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { formatRupiah, today } from '../lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, Trash2, Plus, Factory } from 'lucide-react';
import useTabStore from '../store/tabStore';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/id.js';
import { getSatuanOptions, getDefaultSatuan, isJmlValid } from '../lib/formHelpers';

const JENIS_BADGE = {
  'BAHAN BAKU':         'bg-amber-50 text-amber-700 border-amber-200',
  'BAHAN SETENGAH JADI': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'BAHAN JADI':          'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function BrowseBarangModal({ onSelect, onClose }) {
  const [barangList, setBarangList] = useState([]);
  const [search, setSearch]         = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      const params = search ? { search } : {};
      api.get('/barang/browse-barang', { params }).then(r => setBarangList(search ? r.data : r.data.slice(0, 10)));
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-primary-50">
          <h3 className="text-sm font-bold text-dark-500">Pilih Barang</h3>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
            <input value={search} onChange={e => setSearch(e.target.value.toUpperCase())}
              placeholder="Cari kode / nama barang..." autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <div className="max-h-72 overflow-y-auto scrollbar-thin">
            {barangList.length === 0 && (
              <p className="text-sm text-dark-300 text-center py-8">{search ? 'Tidak ada hasil' : 'Memuat...'}</p>
            )}
            {barangList.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary-50">
                    <th className="text-left px-3 py-2 text-xs text-dark-300">Kode</th>
                    <th className="text-left px-3 py-2 text-xs text-dark-300">Nama Barang</th>
                    <th className="text-left px-3 py-2 text-xs text-dark-300">Jenis</th>
                    <th className="text-left px-3 py-2 text-xs text-dark-300">Satuan</th>
                    <th className="text-right px-3 py-2 text-xs text-dark-300">Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {barangList.map(b => (
                    <tr key={b.idbarang} onClick={() => onSelect(b)}
                      className="border-b border-primary-50/50 hover:bg-warm-50 cursor-pointer transition-colors">
                      <td className="px-3 py-2.5 text-xs font-mono text-dark-300">{b.kodebarang}</td>
                      <td className="px-3 py-2.5 font-medium text-dark-500">{b.namabarang}</td>
                      <td className="px-3 py-2.5">
                        {b.jenis && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${JENIS_BADGE[b.jenis] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            {b.jenis}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-dark-400 text-xs">
                        {b.satuanbesar || b.satuansedang || b.satuankecil || '-'}
                      </td>
                      <td className={`px-3 py-2.5 text-right font-mono text-xs font-semibold ${Number(b.stok) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {Number(b.stok || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProduksiForm({ onSuccess, tabId, editData }) {
  const user       = useAuthStore(s => s.user);
  const closeTab   = useTabStore(s => s.closeTab);

  const isEdit = !!editData;

  const [tgltrans, setTgltrans] = useState(
    editData?.tgltrans ? String(editData.tgltrans).slice(0, 10) : today()
  );
  const [catatan, setCatatan]   = useState(editData?.catatan || '');

  const [items, setItems] = useState(
    editData?.items
      ? editData.items.map(item => ({
          idbarang:     item.idbarang,
          kodebarang:   item.kodebarang   || '',
          namabarang:   item.namabarang   || '',
          jenisbarang:  item.jenisbarang  || '',
          satuanbesar:  item.satuanbesar  || null,
          satuansedang: item.satuansedang || null,
          satuankecil:  item.satuankecil  || null,
          konversi1:    item.konversi1    || 0,
          konversi2:    item.konversi2    || 0,
          stok:         item.stok         || 0,
          satuan:       item.satuan || getDefaultSatuan(item) || 'PCS',
          jml:          String(item.jml),
        }))
      : []
  );

  const [showBarangModal, setShowBarangModal] = useState(false);
  const [loading, setLoading]                 = useState(false);

  const addBarang = (b) => {
    if (items.find(i => i.idbarang === b.idbarang)) {
      toast('Barang sudah ada di tabel. Ubah jumlah pada baris terkait.', { icon: 'ℹ️' });
      setShowBarangModal(false);
      return;
    }
    setItems(prev => [...prev, {
      idbarang:     b.idbarang,
      kodebarang:   b.kodebarang,
      namabarang:   b.namabarang,
      jenisbarang:  b.jenis || '',
      satuanbesar:  b.satuanbesar  || null,
      satuansedang: b.satuansedang || null,
      satuankecil:  b.satuankecil  || null,
      konversi1:    b.konversi1    || 0,
      konversi2:    b.konversi2    || 0,
      stok:         b.stok         || 0,
      satuan:       getDefaultSatuan(b),
      jml:          '1',
    }]);
    setShowBarangModal(false);
  };

  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Hitung total
  let totalBahan = 0;
  let totalHasil = 0;
  for (const item of items) {
    const jml = parseFloat(item.jml) || 0;
    if (item.jenisbarang === 'BAHAN JADI') {
      totalHasil += jml;
    } else {
      totalBahan += jml;
    }
  }

  const handleSubmit = async () => {
    if (items.length === 0) return toast.error('Tambahkan barang terlebih dahulu');

    // Validasi minimal ada BAHAN JADI dan BAHAN BAKU/SETENGAH JADI
    const hasJadi = items.some(i => i.jenisbarang === 'BAHAN JADI');
    const hasBaku = items.some(i => i.jenisbarang === 'BAHAN BAKU' || i.jenisbarang === 'BAHAN SETENGAH JADI');
    if (!hasJadi) return toast.error('Minimal harus ada 1 barang jadi sebagai hasil produksi');
    if (!hasBaku) return toast.error('Minimal harus ada 1 bahan baku atau bahan setengah jadi');

    const parsedItems = items.map(i => {
      const n = Number(i.jml);
      return { ...i, jml: isNaN(n) ? i.jml : n };
    });

    const invalidIdx = parsedItems.findIndex(i => !isJmlValid(i.jml));
    if (invalidIdx !== -1) {
      return toast.error(`Jumlah pada baris ${invalidIdx + 1} harus angka positif`);
    }

    setLoading(true);
    try {
      const payload = {
        tgltrans,
        catatan: catatan || null,
        items: parsedItems.map(i => ({
          idbarang: i.idbarang,
          jml:      i.jml,
          satuan:   i.satuan && String(i.satuan).trim() ? String(i.satuan).trim() : null,
        })),
      };

      if (isEdit) {
        await api.put(`/produksi/${editData.idproduksi}`, payload);
      } else {
        await api.post('/produksi', payload);
      }

      toast.success(isEdit ? 'Produksi berhasil diupdate!' : 'Produksi berhasil disimpan!');

      if (onSuccess) onSuccess();
      closeTab(tabId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Page header */}
      <div className="flex items-center gap-3 px-6 pt-4 pb-3 border-b border-primary-50 shrink-0">
        <button onClick={() => closeTab(tabId)} className="p-1.5 rounded-lg hover:bg-warm-50 text-dark-400">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-dark-500">{isEdit ? `Edit ${editData?.kodeproduksi || 'Produksi'}` : 'Produksi Baru'}</h2>
          <p className="text-xs text-dark-300">{isEdit ? 'Edit transaksi produksi' : 'Form input transaksi produksi'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-4">

          {/* SECTION 1: HEADER */}
          <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
            <div className="px-5 py-3 border-b border-primary-50 bg-warm-50/50">
              <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider">Header Produksi</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-semibold text-dark-400 mb-1.5">Tanggal Produksi</label>
                <Flatpickr value={tgltrans} onChange={(selectedDates, dateStr) => setTgltrans(dateStr)}
                  options={{ dateFormat: 'Y-m-d', locale: 'id' }}
                  className="flatpickr-input w-full" placeholder="Pilih tanggal" />
              </div>

              <div />

              {/* Catatan — full width */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-dark-400 mb-1.5">Catatan</label>
                <textarea value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  rows={2}
                  placeholder="Catatan produksi (opsional)..."
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none" />
              </div>

            </div>
          </div>

          {/* SECTION 2: DETAIL BARANG */}
          <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
            <div className="px-5 py-3 border-b border-primary-50 bg-warm-50/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider">
                Detail Barang
                {items.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-md bg-primary-100 text-primary-600 text-[10px] font-bold">
                    {items.length}
                  </span>
                )}
              </h3>
              <button onClick={() => setShowBarangModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors">
                <Plus className="w-3.5 h-3.5" /> Tambah Barang
              </button>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-primary-50 bg-warm-50/30">
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-dark-300 w-10">No</th>
                    <th className="text-left   px-3 py-2.5 text-xs font-semibold text-dark-300 w-24">Kode</th>
                    <th className="text-left   px-3 py-2.5 text-xs font-semibold text-dark-300">Nama Barang</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-dark-300 w-36">Jenis</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-dark-300 w-28">Satuan</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-dark-300 w-20">Stok</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-dark-300 w-24">Jumlah</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-dark-300">
                        Belum ada barang. Klik{' '}
                        <span className="font-semibold text-primary-500">Tambah Barang</span>{' '}
                        untuk menambahkan bahan baku dan hasil produksi.
                      </td>
                    </tr>
                  ) : items.map((item, idx) => {
                    const satuanOpts = getSatuanOptions(item);
                    const jmlNum = parseFloat(item.jml) || 0;
                    return (
                      <tr key={item.idbarang} className="border-b border-primary-50/50 hover:bg-warm-50/20 transition-colors">
                        <td className="px-3 py-2.5 text-center text-xs text-dark-300">{idx + 1}</td>
                        <td className="px-3 py-2.5 text-xs font-mono text-dark-300">{item.kodebarang}</td>
                        <td className="px-3 py-2.5 font-medium text-dark-500">{item.namabarang}</td>
                        <td className="px-3 py-2.5 text-center">
                          {item.jenisbarang && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${JENIS_BADGE[item.jenisbarang] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                              {item.jenisbarang}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <select value={item.satuan} onChange={e => updateItem(idx, 'satuan', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-primary-100 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-500/20">
                            {satuanOpts.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className={`px-3 py-2.5 text-center font-mono text-xs font-semibold ${Number(item.stok) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {Number(item.stok || 0)}
                        </td>
                        <td className="px-3 py-2.5">
                          <input type="text" value={Number(item.jml)}
                            onChange={e => updateItem(idx, 'jml', e.target.value)}
                            placeholder="0"
                            className={`w-full px-2 py-1.5 rounded-lg border text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary-500/20 ${
                              !isJmlValid(jmlNum) ? 'border-red-300 bg-red-50 text-red-700' : 'border-primary-100'
                            }`} />
                        </td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => removeItem(idx)}
                            className="p-1 rounded-lg hover:bg-red-50 text-dark-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: FOOTER */}
          <div className="bg-white rounded-2xl border border-primary-50 p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-6">
                  <span className="text-xs text-dark-300 w-36 text-right">Total Bahan Baku / Setengah Jadi:</span>
                  <span className="text-sm font-semibold text-amber-700 font-mono w-24 text-right">
                    {totalBahan}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs font-bold text-dark-500 w-36 text-right">Total Hasil Produksi:</span>
                  <span className="text-xl font-bold text-emerald-600 font-mono w-24 text-right">
                    {totalHasil}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSubmit} disabled={loading || items.length === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Factory className="w-4 h-4" />
                  {loading ? 'Menyimpan...' : 'Simpan Produksi'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Browse Barang */}
      {showBarangModal && (
        <BrowseBarangModal
          onSelect={addBarang}
          onClose={() => setShowBarangModal(false)}
        />
      )}
    </div>
  );
}
