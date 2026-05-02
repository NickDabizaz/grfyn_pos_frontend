import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatRupiah } from '../lib/utils';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Barang() {
  const [barang, setBarang] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [form, setForm] = useState({ namabarang: '', satuan: 'PCS', stokmin: 0, hargabeli: '', hargajual: '' });
  const [historyBeli, setHistoryBeli] = useState([]);
  const [historyJual, setHistoryJual] = useState([]);
  const [showHistory, setShowHistory] = useState(null);

  const load = () => {
    const params = search ? { search } : {};
    api.get('/barang', { params }).then((r) => setBarang(r.data));
  };
  useEffect(() => { load(); api.get('/barang/check-price').then((r) => setWarnings(r.data.warnings)); }, [search]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/barang/${editId}`, form); toast.success('Barang diupdate'); }
      else { await api.post('/barang', form); toast.success('Barang ditambah'); }
      setShowForm(false); setEditId(null);
      setForm({ namabarang: '', satuan: 'PCS', stokmin: 0, hargabeli: '', hargajual: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
  };

  const handleEdit = (b) => {
    setEditId(b.idbarang);
    setForm({ namabarang: b.namabarang, satuan: b.satuan, stokmin: b.stokmin, hargabeli: b.hargabeli_terbaru || '', hargajual: b.hargajual_terbaru || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus barang ini?')) return;
    try { await api.delete(`/barang/${id}`); toast.success('Barang dihapus'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
  };

  const loadHistory = async (id) => {
    const [beli, jual] = await Promise.all([api.get(`/barang/${id}/hargabeli`), api.get(`/barang/${id}/hargajual`)]);
    setHistoryBeli(beli.data); setHistoryJual(jual.data);
    setShowHistory(showHistory === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-500">Barang</h2>
          <p className="text-sm text-dark-300">Manajemen produk dan harga</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ namabarang: '', satuan: 'PCS', stokmin: 0, hargabeli: '', hargajual: '' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary-500/20 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Tambah Barang
        </button>
      </div>

      {warnings > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4" /> Ada {warnings} barang dengan harga jual di bawah harga beli!
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value.toUpperCase())}
          placeholder="Cari barang (kode/nama)..." className="input-upper w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
      </div>

      <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-primary-50 bg-warm-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Nama Barang</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Satuan</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Harga Beli</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Harga Jual</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Stok Min</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300 w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barang.map((b) => (
                <>
                <tr key={b.idbarang} className="border-b border-primary-50/50 hover:bg-warm-50/30 transition-colors text-sm">
                  <td className="px-4 py-3 text-xs font-mono text-dark-300">{b.kodebarang}</td>
                  <td className="px-4 py-3 font-medium text-dark-500">{b.namabarang}</td>
                  <td className="px-4 py-3 text-dark-400">{b.satuan}</td>
                  <td className="px-4 py-3 text-right font-mono text-dark-400">{formatRupiah(b.hargabeli_terbaru)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${b.hargajual_terbaru && b.hargabeli_terbaru && parseFloat(b.hargajual_terbaru) < parseFloat(b.hargabeli_terbaru) ? 'text-red-500' : 'text-accent-600'}`}>
                    {formatRupiah(b.hargajual_terbaru)}
                  </td>
                  <td className="px-4 py-3 text-center text-dark-400">{b.stokmin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => loadHistory(b.idbarang)} className="p-1.5 rounded-lg hover:bg-accent-50 text-dark-300 hover:text-accent-500"><ChevronDown className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleEdit(b)} className="p-1.5 rounded-lg hover:bg-primary-50 text-dark-300 hover:text-primary-500"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(b.idbarang)} className="p-1.5 rounded-lg hover:bg-red-50 text-dark-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
                {showHistory === b.idbarang && (
                  <tr key={`h-${b.idbarang}`}>
                    <td colSpan={7} className="px-4 py-3 bg-warm-50/30">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-semibold text-dark-400 mb-2">History Harga Beli</p>
                          {historyBeli.map((h) => (
                            <div key={h.idhargabeli} className="flex justify-between py-1 border-b border-primary-50">
                              <span className="text-dark-300">{h.tgltrans?.slice(0,10)}</span>
                              <span className="font-mono text-dark-500">{formatRupiah(h.hargabeli)}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="font-semibold text-dark-400 mb-2">History Harga Jual</p>
                          {historyJual.map((h) => (
                            <div key={h.idhargajual} className="flex justify-between py-1 border-b border-primary-50">
                              <span className="text-dark-300">{h.tgltrans?.slice(0,10)}</span>
                              <span className="font-mono text-dark-500">{formatRupiah(h.hargajual)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{animation: 'fadeIn 0.2s ease'}}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in">
            <h3 className="text-lg font-bold text-dark-500 mb-4">{editId ? 'Edit' : 'Tambah'} Barang</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-400 mb-1">Nama Barang</label>
                  <input value={form.namabarang} onChange={(e) => setForm({...form, namabarang: e.target.value.toUpperCase()})}
                    className="input-upper w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-400 mb-1">Satuan</label>
                  <input value={form.satuan} onChange={(e) => setForm({...form, satuan: e.target.value.toUpperCase()})}
                    className="input-upper w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-400 mb-1">Harga Beli</label>
                  <input type="number" value={form.hargabeli} onChange={(e) => setForm({...form, hargabeli: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-400 mb-1">Harga Jual</label>
                  <input type="number" value={form.hargajual} onChange={(e) => setForm({...form, hargajual: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  {form.hargabeli && form.hargajual && parseFloat(form.hargajual) < parseFloat(form.hargabeli) && (
                    <p className="text-[10px] text-red-500 mt-1">Harga jual di bawah harga beli!</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-400 mb-1">Stok Minimum</label>
                  <input type="number" value={form.stokmin} onChange={(e) => setForm({...form, stokmin: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400 hover:bg-warm-50">Batal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
