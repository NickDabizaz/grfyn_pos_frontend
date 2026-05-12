import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { today } from '../../lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import useTabStore from '../../store/tabStore';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/id.js';

export default function AbsensiForm({ onSuccess, tabId }) {
  const closeTab = useTabStore(s => s.closeTab);
  const [tglabsensi, setTglabsensi] = useState(today());
  const [allKaryawan, setAllKaryawan] = useState([]);
  const [idkaryawan, setIdkaryawan] = useState('');
  const [status, setStatus] = useState('HADIR');
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/karyawan').then(r => setAllKaryawan(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!idkaryawan) return toast.error('Pilih karyawan terlebih dahulu');
    setLoading(true);
    try {
      await api.post('/absensi', {
        idkaryawan: parseInt(idkaryawan),
        tglabsensi,
        status,
        keterangan: keterangan || null,
      });
      toast.success('Absensi berhasil dicatat');
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
        <div><h2 className="text-lg font-bold text-dark-500">Catat Absensi</h2><p className="text-xs text-dark-300">Input absensi karyawan</p></div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-md space-y-4">
          <div>
            <label className={labelClass}>Tanggal Absensi *</label>
            <Flatpickr value={tglabsensi} onChange={([d]) => setTglabsensi(d.toISOString().slice(0, 10))}
              options={{ dateFormat: 'Y-m-d', locale: 'id' }} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Karyawan *</label>
            <select value={idkaryawan} onChange={e => setIdkaryawan(e.target.value)} className={inputClass}>
              <option value="">-- Pilih Karyawan --</option>
              {allKaryawan.map(k => <option key={k.idkaryawan} value={k.idkaryawan}>{k.kodekaryawan} - {k.namakaryawan}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Status *</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
              <option value="HADIR">HADIR</option>
              <option value="SAKIT">SAKIT</option>
              <option value="CUTI">CUTI</option>
              <option value="ALPHA">ALPHA</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Keterangan</label>
            <input value={keterangan} onChange={e => setKeterangan(e.target.value)} className={inputClass} placeholder="Opsional..." />
          </div>

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => closeTab(tabId)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400">Batal</button>
            <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
