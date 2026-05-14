import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Search, Trash2 } from 'lucide-react';
import useTabStore from '../../../store/tabStore';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export default function SaldoAwalStokForm({ onSuccess, tabId }) {
  const [barangList, setBarangList] = useState([]);
  const [items, setItems] = useState([{ idbarang: '', jml: '' }]);
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const closeTab = useTabStore((s) => s.closeTab);

  useEffect(() => {
    api.get('/barang').then(({ data }) => setBarangList(data)).catch(() => {});
  }, []);

  const addRow = () => setItems([...items, { idbarang: '', jml: '' }]);
  const removeRow = (i) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };
  const updateRow = (i, field, val) => setItems(items.map((d, idx) => idx === i ? { ...d, [field]: val } : d));

  const handleSave = async (e) => {
    e.preventDefault();
    if (items.some(d => !d.idbarang || !d.jml)) return toast.error('Lengkapi semua baris');
    setLoading(true);
    try {
      await api.post('/stok/saldoawal', {
        keterangan,
        items: items.map(d => ({ idbarang: parseInt(d.idbarang), jml: parseInt(d.jml) }))
      });
      toast.success('Saldo awal stok berhasil');
      if (onSuccess) onSuccess();
      closeTab(tabId);
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 pt-4 pb-2 border-b border-primary-50 shrink-0">
        <button onClick={() => closeTab(tabId)} className="p-1.5 rounded-lg hover:bg-warm-50 text-dark-400"><ArrowLeft className="w-4 h-4" /></button>
        <div><h2 className="text-lg font-bold text-dark-500">Saldo Awal Stok</h2><p className="text-xs text-dark-300">Input saldo awal untuk beberapa barang</p></div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSave} className="max-w-3xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-400 mb-1">Keterangan</label>
            <input value={keterangan} onChange={e => setKeterangan(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm" placeholder="Saldo awal stok..." />
          </div>
          <div className="space-y-2">
            {items.map((d, i) => (
              <div key={i} className="flex items-end gap-2 p-3 rounded-xl bg-warm-50/50">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-dark-300 mb-1">Barang</label>
                  <SearchableSelect
                    value={d.idbarang} onChange={(val) => updateRow(i, 'idbarang', val)}
                    options={barangList.map(b => ({ value: b.idbarang, label: `${b.kodebarang} - ${b.namabarang}` }))}
                    placeholder="Pilih barang"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-[10px] font-semibold text-dark-300 mb-1">Qty</label>
                  <input type="number" value={d.jml} onChange={e => updateRow(i, 'jml', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm text-center" min="0" />
                </div>
                <button type="button" onClick={() => removeRow(i)} className="p-2 rounded-lg hover:bg-red-50 text-dark-300 hover:text-red-500 shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addRow} className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600"><Plus className="w-3.5 h-3.5" /> Tambah Baris</button>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => closeTab(tabId)} className="flex-1 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400 hover:bg-warm-50">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
