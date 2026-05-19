import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import useTabStore from '../../../store/tabStore';
import { formatRupiah, today } from '../../../lib/utils';

export default function KasForm({ mode, id, data: initialData, onSuccess, tabId }) {
  const [akunList, setAkunList] = useState([]);
  const [tgltrans, setTgltrans] = useState(initialData?.tgltrans ? String(initialData.tgltrans).slice(0, 10) : today());
  const [details, setDetails] = useState(
    initialData?.details?.length
      ? initialData.details.map(d => ({ idakun: d.idakun, catatan: d.catatan || '', amount: String(d.amount ?? '') }))
      : [{ idakun: '', catatan: '', amount: '' }]
  );
  const [loading, setLoading] = useState(false);
  const closeTab = useTabStore((s) => s.closeTab);
  const isEdit = mode === 'edit' || Boolean(id);
  const isLocked = initialData?.status && initialData.status !== 'DRAFT';

  useEffect(() => {
    api.get('/akun').then(({ data }) => setAkunList(data)).catch(() => {});
  }, []);

  const addRow = () => setDetails([...details, { idakun: '', catatan: '', amount: '' }]);
  const removeRow = (i) => { if (details.length > 1) setDetails(details.filter((_, idx) => idx !== i)); };
  const updateRow = (i, field, val) => {
    setDetails(details.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };

  const totalDebet = details.reduce((sum, d) => sum + Math.max(parseFloat(d.amount) || 0, 0), 0);
  const totalKredit = details.reduce((sum, d) => sum + Math.abs(Math.min(parseFloat(d.amount) || 0, 0)), 0);
  const isBalance = Math.abs(totalDebet - totalKredit) < 0.01;

  const handleSave = async (e, approve = false) => {
    e.preventDefault();
    if (isLocked) return toast.error('Kas yang sudah approve/cancel tidak bisa disimpan');
    if (details.some(d => !d.idakun || !d.amount)) return toast.error('Lengkapi semua baris');
    if (approve && !isBalance) return toast.error('Jurnal kas tidak balance');
    setLoading(true);
    try {
      const payload = { tgltrans, approve, details: details.map(d => ({ ...d, amount: parseFloat(d.amount) })) };
      if (isEdit) await api.put(`/kas/${id}`, payload);
      else await api.post('/kas', payload);
      toast.success(isEdit ? 'Kas berhasil diupdate' : 'Kas berhasil ditambah');
      if (onSuccess) onSuccess();
      closeTab(tabId);
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 pt-4 pb-2 border-b border-primary-50 shrink-0">
        <button onClick={() => closeTab(tabId)} className="p-1.5 rounded-lg hover:bg-warm-50 text-dark-400"><ArrowLeft className="w-4 h-4" /></button>
        <div><h2 className="text-lg font-bold text-dark-500">{isEdit ? `Edit ${initialData?.kodekas || 'Transaksi Kas'}` : 'Transaksi Kas'}</h2><p className="text-xs text-dark-300">Nominal positif = Debet, nominal negatif = Kredit</p></div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={(e) => handleSave(e, false)} className="max-w-4xl space-y-4">
          <div className="bg-white rounded-2xl border border-primary-50 p-4">
            <label className="block text-[10px] font-semibold text-dark-300 mb-1">Tanggal Transaksi</label>
            <input type="date" value={tgltrans} onChange={e => setTgltrans(e.target.value)} disabled={isLocked} className="w-56 px-3 py-2 rounded-lg border border-primary-100 text-sm disabled:bg-gray-50" />
          </div>
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
                    disabled={isLocked}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-dark-300 mb-1">Catatan</label>
                  <input value={d.catatan} onChange={e => updateRow(i, 'catatan', e.target.value)} disabled={isLocked} className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm disabled:bg-gray-50" placeholder="Keterangan" />
                </div>
                <div className="w-40">
                  <label className="block text-[10px] font-semibold text-dark-300 mb-1">Amount</label>
                  <input type="number" value={d.amount} onChange={e => updateRow(i, 'amount', e.target.value)} disabled={isLocked} className="w-full px-3 py-2 rounded-lg border border-primary-100 text-sm text-right disabled:bg-gray-50" placeholder="0" required />
                </div>
                <button type="button" onClick={() => removeRow(i)} disabled={isLocked} className="p-2 rounded-lg hover:bg-red-50 text-dark-300 hover:text-red-500 shrink-0 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={addRow} disabled={isLocked} className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600 disabled:opacity-50"><Plus className="w-3.5 h-3.5" /> Tambah Baris</button>
            <div className={`text-right text-xs font-semibold ${isBalance ? 'text-emerald-600' : 'text-red-500'}`}>
              Debet {formatRupiah(totalDebet)} / Kredit {formatRupiah(totalKredit)}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => closeTab(tabId)} className="flex-1 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400 hover:bg-warm-50">Batal</button>
            <button type="submit" disabled={loading || isLocked} className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan'}</button>
            <button type="button" onClick={(e) => handleSave(e, true)} disabled={loading || isLocked} className="flex-1 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan dan Approve'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
