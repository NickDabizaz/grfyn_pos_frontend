import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import useTabStore from '../../store/tabStore';

export default function KaryawanForm({ existingData, onSuccess, tabId }) {
  const closeTab = useTabStore(s => s.closeTab);
  const isEdit = Boolean(existingData);

  const [kodekaryawan, setKodekaryawan] = useState(existingData?.kodekaryawan || '');
  const [namakaryawan, setNamakaryawan] = useState(existingData?.namakaryawan || '');
  const [jabatan, setJabatan] = useState(existingData?.jabatan || '');
  const [email, setEmail] = useState(existingData?.email || '');
  const [nohp, setNohp] = useState(existingData?.nohp || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!kodekaryawan || !namakaryawan) return toast.error('Kode & nama karyawan wajib diisi');
    setLoading(true);
    try {
      const payload = { kodekaryawan, namakaryawan, jabatan: jabatan || null, email: email || null, nohp: nohp || null };
      if (isEdit) {
        await api.put(`/karyawan/${existingData.idkaryawan}`, payload);
        toast.success('Karyawan berhasil diupdate');
      } else {
        await api.post('/karyawan', payload);
        toast.success('Karyawan berhasil ditambah');
      }
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
        <div><h2 className="text-lg font-bold text-dark-500">{isEdit ? 'Edit Karyawan' : 'Karyawan Baru'}</h2><p className="text-xs text-dark-300">{isEdit ? `Edit ${existingData?.namakaryawan}` : 'Tambah karyawan baru'}</p></div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-md space-y-4">
          <div>
            <label className={labelClass}>Kode Karyawan *</label>
            <input value={kodekaryawan} onChange={e => setKodekaryawan(e.target.value)} className={inputClass} placeholder="Contoh: KRY001" />
          </div>

          <div>
            <label className={labelClass}>Nama Karyawan *</label>
            <input value={namakaryawan} onChange={e => setNamakaryawan(e.target.value)} className={inputClass} placeholder="Nama lengkap" />
          </div>

          <div>
            <label className={labelClass}>Jabatan</label>
            <input value={jabatan} onChange={e => setJabatan(e.target.value)} className={inputClass} placeholder="Contoh: Manager, Supervisor" />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
          </div>

          <div>
            <label className={labelClass}>No. HP</label>
            <input value={nohp} onChange={e => setNohp(e.target.value)} className={inputClass} placeholder="081234567890" />
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
