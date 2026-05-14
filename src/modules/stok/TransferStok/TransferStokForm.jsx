import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { formatRupiah, today } from '../../../lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, Trash2, Save, Loader2 } from 'lucide-react';
import useTabStore from '../../../store/tabStore';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/id.js';

function BrowseBarangModal({ onSelect, onClose }) {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/barang/browse-barang', { params: search ? { search } : {} })
        .then(r => setList(search ? r.data : r.data.slice(0, 10)));
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[480px] max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-primary-50">
          <h3 className="font-bold text-dark-500">Pilih Barang</h3>
          <button onClick={onClose} className="text-dark-300 hover:text-dark-500 text-lg leading-none">&times;</button>
        </div>
        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-300" />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kode / nama barang..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {list.map(b => (
            <div key={b.idbarang} onClick={() => onSelect(b)} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-50 cursor-pointer border-b border-primary-50/50">
              <div>
                <div className="text-sm font-medium text-dark-500">{b.namabarang}</div>
                <div className="text-xs text-dark-300">{b.kodebarang} • {b.satuan}</div>
              </div>
              <div className="text-xs text-dark-400">{formatRupiah(b.hargabeli)}</div>
            </div>
          ))}
          {list.length === 0 && <div className="py-6 text-center text-sm text-dark-300">Tidak ada barang</div>}
        </div>
      </div>
    </div>
  );
}

export default function TransferStokForm({ onSuccess, tabId }) {
  const closeTab = useTabStore(s => s.closeTab);
  const [tgltrans, setTgltrans]   = useState(today());
  const [allLokasi, setAllLokasi] = useState([]);
  const [idlokasiTujuan, setIdlokasiTujuan] = useState('');
  const [catatan, setCatatan]     = useState('');
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [showBarangModal, setShowBarangModal] = useState(false);

  useEffect(() => {
    api.get('/lokasi').then(r => setAllLokasi(r.data)).catch(() => {});
  }, []);

  const addBarang = (b) => {
    setShowBarangModal(false);
    setItems(prev => {
      const exists = prev.find(it => it.idbarang === b.idbarang);
      if (exists) return prev.map(it => it.idbarang === b.idbarang ? { ...it, jml: it.jml + 1 } : it);
      return [...prev, { idbarang: b.idbarang, kodebarang: b.kodebarang, namabarang: b.namabarang, satuan: b.satuan, jml: 1 }];
    });
  };

  const updateItem = (idx, field, value) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!idlokasiTujuan) return toast.error('Pilih lokasi tujuan terlebih dahulu');
    if (items.length === 0) return toast.error('Tambahkan minimal 1 barang');
    setLoading(true);
    try {
      await api.post('/transfer-stok', {
        idlokasitujuan: parseInt(idlokasiTujuan),
        tgltrans,
        catatan: catatan || null,
        items: items.map(it => ({ idbarang: it.idbarang, jml: parseFloat(it.jml), satuan: it.satuan })),
      });
      toast.success('Transfer stok berhasil dibuat');
      if (onSuccess) onSuccess();
      closeTab(tabId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500";
  const labelClass = "block text-xs font-medium text-dark-300 mb-1";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 pt-4 pb-2 border-b border-primary-100 shrink-0">
        <button onClick={() => closeTab(tabId)} className="p-1.5 rounded-lg hover:bg-primary-50 text-dark-400"><ArrowLeft className="w-5 h-5" /></button>
        <div><h2 className="text-lg font-bold text-dark-500">Transfer Stok Baru</h2><p className="text-xs text-dark-300">Pindahkan stok ke lokasi lain</p></div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tanggal *</label>
              <Flatpickr value={tgltrans} onChange={([d]) => setTgltrans(d.toISOString().slice(0, 10))}
                options={{ dateFormat: 'Y-m-d', locale: 'id' }} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Lokasi Tujuan *</label>
              <select value={idlokasiTujuan} onChange={e => setIdlokasiTujuan(e.target.value)} className={inputClass}>
                <option value="">-- Pilih Lokasi --</option>
                {allLokasi.map(l => <option key={l.idlokasi} value={l.idlokasi}>{l.kodelokasi} — {l.namalokasi}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Catatan</label>
            <input value={catatan} onChange={e => setCatatan(e.target.value)} className={inputClass} placeholder="Opsional..." />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass}>Item Barang *</label>
              <button onClick={() => setShowBarangModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 text-xs font-semibold hover:bg-primary-100">
                <Search className="w-3.5 h-3.5" /> Tambah Barang
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-warm-50/70 border-b border-primary-50">
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-dark-300">Kode</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-dark-300">Nama Barang</th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-dark-300">Satuan</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-dark-300">Jumlah</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-sm text-dark-300">Belum ada barang. Klik "Tambah Barang" untuk mulai.</td></tr>
                  )}
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-b border-primary-50/50">
                      <td className="px-4 py-2 text-xs font-mono text-dark-400">{it.kodebarang}</td>
                      <td className="px-4 py-2 text-sm text-dark-500">{it.namabarang}</td>
                      <td className="px-4 py-2 text-center text-xs text-dark-400">{it.satuan}</td>
                      <td className="px-4 py-2 text-right">
                        <input type="number" min="0" step="0.01" value={it.jml} onChange={e => updateItem(idx, 'jml', e.target.value)}
                          className="w-24 text-right border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500/30" />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => closeTab(tabId)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400">Batal</button>
            <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Transfer
            </button>
          </div>
        </div>
      </div>

      {showBarangModal && <BrowseBarangModal onSelect={addBarang} onClose={() => setShowBarangModal(false)} />}
    </div>
  );
}
