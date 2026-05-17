import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import { useAuthStore } from '../../../store/authStore';
import { formatRupiah, today } from '../../../lib/utils';
import toast from 'react-hot-toast';
import { Plus, RefreshCw } from 'lucide-react';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/ui/Pagination';
import useTabStore from '../../../store/tabStore';
import { useMenuAccess, canAccess } from '../../../hooks/useMenuAccess';
import PelunasanHutangForm from './PelunasanHutangForm';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/id.js';

export default function PelunasanHutang({ isActive }) {
  const openTab = useTabStore(s => s.openTab);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [tglAwal, setTglAwal] = useState(today());
  const [tglAkhir, setTglAkhir] = useState(today());
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const { access } = useMenuAccess('keuangan.pelunasanhutang');
  const canTambah = canAccess(access, 'tambah');
  const canUbah = canAccess(access, 'ubah');

  const loadData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (selectedSupplier) params.idsupplier = selectedSupplier;
    params.tglwal = tglAwal;
    params.tglakhir = tglAkhir;
    api.get('/pelunasanhutang', { params }).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [selectedSupplier, tglAwal, tglAkhir]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    api.get('/supplier').then(r => setSuppliers(r.data)).catch(() => {});
  }, []);

  const { page, setPage, totalPages, paginatedItems, resetPage } = usePagination(data, 20);

  const handleTambah = () => {
    openTab({ label: 'Pelunasan Hutang Baru', icon: Plus, component: PelunasanHutangForm, props: { onSuccess: loadData }, type: 'form_add' });
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await api.delete(`/pelunasanhutang/${showDeleteModal.idpelunasan}`);
      toast.success('Pelunasan hutang berhasil dihapus');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
    setShowDeleteModal(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-dark-500">Pelunasan Hutang</h2>
          <p className="text-sm text-dark-300">Kelola pelunasan hutang ke supplier</p>
        </div>
        <div className="flex items-center gap-2">
          {canTambah && (
          <button onClick={handleTambah}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> Pelunasan Baru
          </button>
          )}
          <button onClick={loadData} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400 hover:bg-warm-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-3 shrink-0">
        <div className="bg-white rounded-2xl border border-primary-50 p-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-[10px] font-semibold text-dark-300 mb-1">Supplier</label>
            <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-primary-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="">Semua Supplier</option>
              {suppliers.map(s => (<option key={s.idsupplier} value={s.idsupplier}>{s.namasupplier}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-dark-300 mb-1">Tanggal Awal</label>
            <Flatpickr value={tglAwal} onChange={([d]) => setTglAwal(d.toISOString().slice(0, 10))}
              options={{ dateFormat: 'Y-m-d', locale: 'id' }}
              className="flatpickr-input w-full text-xs" placeholder="Pilih tanggal" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-dark-300 mb-1">Tanggal Akhir</label>
            <Flatpickr value={tglAkhir} onChange={([d]) => setTglAkhir(d.toISOString().slice(0, 10))}
              options={{ dateFormat: 'Y-m-d', locale: 'id' }}
              className="flatpickr-input w-full text-xs" placeholder="Pilih tanggal" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-primary-50 bg-warm-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode Pelunasan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Supplier</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Metode</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300 w-20">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-dark-300">Tidak ada data</td></tr>
                )}
                {paginatedItems.map((ph) => (
                  <tr key={ph.idpelunasan} className="border-b border-primary-50/50 text-sm hover:bg-warm-50/30">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-dark-400">{ph.kodepelunasan}</td>
                    <td className="px-4 py-3 text-dark-400 text-xs">{String(ph.tgltrans || '').slice(0, 10)}</td>
                    <td className="px-4 py-3 text-dark-500">{ph.namasupplier || '-'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-accent-600">{formatRupiah(ph.total_amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge badge-sm badge-primary">{ph.metodbayar}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {canTambah && (
                      <button onClick={() => setShowDeleteModal(ph)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        Hapus
                      </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDeleteModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-dark-500 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-dark-300 mb-4">Hapus pelunasan <strong>{showDeleteModal.kodepelunasan}</strong>? Hutang akan dikembalikan ke status OPEN.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 rounded-xl text-sm text-dark-400 hover:bg-warm-50">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}