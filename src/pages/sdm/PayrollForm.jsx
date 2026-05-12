import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import useTabStore from '../../store/tabStore';

export default function PayrollForm({ onSuccess, tabId }) {
  const closeTab = useTabStore(s => s.closeTab);
  const [bulanpayroll, setBulanpayroll] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!bulanpayroll) return toast.error('Pilih bulan payroll terlebih dahulu');
    setLoading(true);
    try {
      await api.post('/payroll/generate', { bulanpayroll });
      toast.success('Payroll berhasil digenerate untuk semua karyawan');
      if (onSuccess) onSuccess();
      closeTab(tabId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal generate payroll');
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
        <div><h2 className="text-lg font-bold text-dark-500">Generate Payroll</h2><p className="text-xs text-dark-300">Generate gaji untuk semua karyawan</p></div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-md space-y-4">
          <div>
            <label className={labelClass}>Bulan Payroll *</label>
            <input type="month" value={bulanpayroll} onChange={e => setBulanpayroll(e.target.value)} className={inputClass} />
          </div>

          <p className="text-xs text-dark-300 bg-blue-50 border border-blue-100 rounded-lg p-3">
            Sistem akan menghitung gaji pokok, tunjangan, dan potongan berdasarkan komponen gaji setiap karyawan & absensi bulan tersebut.
          </p>

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => closeTab(tabId)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400">Batal</button>
            <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
