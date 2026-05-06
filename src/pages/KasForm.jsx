import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import SearchableSelect from '../components/ui/SearchableSelect';
import useTabStore from '../store/tabStore';

export default function KasForm({ mode, id, onSuccess, tabId }) {
  const [akunList, setAkunList] = useState([]);
  const [details, setDetails] = useState([{ idakun: '', catatan: '', amount: '' }]);
  const [loading, setLoading] = useState(false);
  const closeTab = useTabStore((s) => s.closeTab);

  useEffect(() => {
    api.get('/akun').then(({ data }) => setAkunList(data)).catch(() => {});
  }, []);

  const addRow = () => setDetails([...details, { idakun: '', catatan: '', amount: '' }]);
  const removeRow = (i) => { if (details.length > 1) setDetails(details.filter((_, idx) => idx !== i)); };
  const updateRow = (i, field, val) => {
    setDetails(details.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (details.some(d => !d.idakun || !d.amount)) return toast.error('Lengkapi semua baris');
    setLoading(true);
    try {
      await api.post('/kas', { details: details.map(d => ({ ...d, amount: parseFloat(d.amount) })) });
      toast.success('Kas berhasil ditambah');
      if (onSuccess) onSuccess();
      closeTab(tabId);
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 pt-4 pb-2 border-b border-primary-50 shrink-0">
        <button onClick={() => closeTab(tabId)} className="p-1.5 rounded-lg hover:bg-warm-50 text-dark-400"><ArrowLeft className="w-4 h-4" /></button>
        <div><h2 className="text-lg font-bold text-dark-500">Transaksi Kas</h2><p className="text-xs text-dark-300">Form input transaksi kas</p></div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSave} className="max-w-3xl space-y-4">
          <div className="space-y-2">
            {details.map((d, i) => (
              <div key={i} className="flex items-end gap-2 p-3 rounded-xl bg-warm-50/50">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-dark-300 mb-1">Akun</label>
                  <SearchableSelect
                    value={d.idakun}
                    onChange={(val) => updateRow(i, 'idakun', val)}
                    options={akunList.map(a => ({ value: a.idakun, label: `${a.kodeakun} - ${a.namaakun}` }))}
                    placeholder="Pilih akun"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-dark-300 mb-1">Catatan</label>
                  <input value={d.catatan} onChange={e => updateRow(i, 'catatan', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm" placeholder="Keterangan" />
                </div>
                <div className="w-40">
                  <label className="block text-[10px] font-semibold text-dark-300 mb-1">Amount</label>
                  <input type="number" value={d.amount} onChange={e => updateRow(i, 'amount', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm text-right" placeholder="0" required />
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
