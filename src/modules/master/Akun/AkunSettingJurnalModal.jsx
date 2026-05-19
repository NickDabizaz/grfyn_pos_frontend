import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api/axios';
import SearchableSelect from '../../../components/ui/SearchableSelect';

const FIELDS = [
  ['akun_piutang', 'Akun Piutang Dagang'],
  ['akun_penjualan', 'Akun Penjualan'],
  ['akun_ppn_keluaran', 'Akun PPN Penjualan'],
  ['akun_hutang', 'Akun Hutang Dagang'],
  ['akun_pembelian', 'Akun Pembelian'],
  ['akun_ppn_masukan', 'Akun PPN Pembelian'],
  ['akun_kas', 'Akun Kas (default TUNAI)'],
  ['akun_bank', 'Akun Bank (default non-TUNAI)'],
];

export default function AkunSettingJurnalModal({ onClose }) {
  const [akunList, setAkunList] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([api.get('/akun'), api.get('/akun/setting-jurnal')])
      .then(([akunRes, settingRes]) => {
        if (!alive) return;
        setAkunList(akunRes.data || []);
        const next = {};
        FIELDS.forEach(([key]) => {
          next[key] = settingRes.data?.[key]?.idakun || '';
        });
        setForm(next);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Gagal memuat setting jurnal'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const save = async () => {
    const missing = FIELDS.find(([key]) => !form[key]);
    if (missing) return toast.error(`${missing[1]} wajib diisi`);
    setSaving(true);
    try {
      const payload = {};
      FIELDS.forEach(([key]) => { payload[key] = Number(form[key]); });
      await api.put('/akun/setting-jurnal', payload);
      toast.success('Setting default jurnal disimpan');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan setting jurnal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-primary-50 overflow-hidden">
        <div className="px-5 py-4 border-b border-primary-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-dark-500">Setting Default Jurnal</h3>
            <p className="text-xs text-dark-300">Akun default untuk posting transaksi penjualan, pembelian, pelunasan, dan retur.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-warm-50 text-dark-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="py-12 text-center text-sm text-dark-300">Memuat setting...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-dark-400 mb-1.5">{label}</label>
                  <SearchableSelect
                    value={form[key]}
                    onChange={(val) => setForm((prev) => ({ ...prev, [key]: val }))}
                    options={akunList.map((a) => ({ value: a.idakun, label: `${a.kodeakun} - ${a.namaakun}` }))}
                    placeholder="Pilih akun"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-primary-50 bg-warm-50/40 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400 hover:bg-white">Batal</button>
          <button onClick={save} disabled={loading || saving} className="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Setting'}
          </button>
        </div>
      </div>
    </div>
  );
}
