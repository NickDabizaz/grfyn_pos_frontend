import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import useTabStore from '../../../store/tabStore';

const INIT = { namaakun: '', saldo: 'DEBET' };

export default function AkunForm({ mode, id, data, onSuccess, tabId }) {
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);
  const closeTab = useTabStore((s) => s.closeTab);

  useEffect(() => {
    if (mode === 'edit' && data) {
      setForm({ namaakun: data.namaakun, saldo: data.saldo || 'DEBET' });
    }
  }, [mode, data]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'edit') { await api.put(`/akun/${id}`, form); toast.success('Akun diupdate'); }
      else { await api.post('/akun', form); toast.success('Akun ditambah'); }
      if (onSuccess) onSuccess();
      closeTab(tabId);
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 pt-4 pb-2 border-b border-primary-50 shrink-0">
        <button onClick={() => closeTab(tabId)} className="p-1.5 rounded-lg hover:bg-warm-50 text-dark-400"><ArrowLeft className="w-4 h-4" /></button>
        <div><h2 className="text-lg font-bold text-dark-500">{mode === 'edit' ? 'Edit Akun' : 'Tambah Akun'}</h2><p className="text-xs text-dark-300">{mode === 'edit' ? `Edit: ${data?.kodeakun}` : 'Form tambah data akun baru'}</p></div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSave} className="max-w-2xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-400 mb-1">Nama Akun</label>
            <input value={form.namaakun} onChange={(e) => setForm({ ...form, namaakun: e.target.value.toUpperCase() })} className="w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-dark-400 mb-1">Saldo Normal</label>
            <select value={form.saldo} onChange={(e) => setForm({ ...form, saldo: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="DEBET">DEBET</option>
              <option value="KREDIT">KREDIT</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => closeTab(tabId)} className="flex-1 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400 hover:bg-warm-50">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
