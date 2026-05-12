import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { today } from '../../lib/utils';
import toast from 'react-hot-toast';
import { Plus, Search, RefreshCw, CheckCircle } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/ui/Pagination';
import useTabStore from '../../store/tabStore';
import StockOpnameForm from './StockOpnameForm';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/id.js';

const STATUS_BADGE = {
  DRAFT:    'bg-amber-50 text-amber-600 border-amber-100',
  SELESAI:  'bg-emerald-50 text-emerald-600 border-emerald-100',
};

export default function StockOpname() {
  const openOrFocusTab = useTabStore(s => s.openOrFocusTab);

  const [list, setList]           = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterKode, setFilterKode] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [tglAwal, setTglAwal]   = useState(today());
  const [tglAkhir, setTglAkhir] = useState(today());

  const loadData = useCallback(() => {
    const params = { tglwal: tglAwal, tglakhir: tglAkhir };
    if (filterKode) params.search = filterKode;
    if (filterStatus) params.status = filterStatus;
    api.get('/stock-opname', { params }).then(r => setList(r.data)).catch(() => {});
  }, [filterKode, filterStatus, tglAwal, tglAkhir]);

  useEffect(() => { loadData(); }, [loadData]);

  const { page, setPage, totalPages, paginatedItems, resetPage } = usePagination(list, 20);
  useEffect(() => { resetPage(); }, [filterKode, filterStatus, tglAwal, tglAkhir]);

  const handleRefresh = () => { setRefreshing(true); loadData(); setTimeout(() => setRefreshing(false), 300); };

  const handleTambah = () => {
    openOrFocusTab({ label: 'Stock Opname Baru', icon: Plus, component: StockOpnameForm, props: { onSuccess: loadData }, type: 'form_add', kodemenu: 'opname-add' });
  };

  const handleFinalize = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Finalisasi stock opname ini? Akan membuat penyesuaian stok.')) return;
    try {
      await api.put(`/stock-opname/${id}/finalize`);
      toast.success('Stock opname finalisasi & penyesuaian stok dibuat');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal finalisasi');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-dark-500">Stock Opname</h2>
          <p className="text-sm text-dark-300">Verifikasi stok fisik di gudang</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleTambah}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> Opname Baru
          </button>
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400 hover:bg-warm-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-3 shrink-0">
        <div className="bg-white rounded-2xl border border-primary-50 p-3 grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-dark-300 mb-1">Kode Opname</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-300" />
              <input type="text" value={filterKode} onChange={e => setFilterKode(e.target.value.toUpperCase())} placeholder="Cari kode..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-primary-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-dark-300 mb-1">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-primary-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="">Semua Status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SELESAI">SELESAI</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-dark-300 mb-1">Tanggal</label>
            <div className="flex items-center gap-1.5">
              <Flatpickr value={tglAwal} onChange={([d]) => setTglAwal(d.toISOString().slice(0, 10))} options={{ dateFormat: 'Y-m-d', locale: 'id' }} className="flatpickr-input flex-1 text-xs" placeholder="Dari" />
              <span className="text-[10px] text-dark-300 shrink-0">s/d</span>
              <Flatpickr value={tglAkhir} onChange={([d]) => setTglAkhir(d.toISOString().slice(0, 10))} options={{ dateFormat: 'Y-m-d', locale: 'id' }} className="flatpickr-input flex-1 text-xs" placeholder="Sampai" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-primary-50 bg-warm-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode Opname</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">User</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-dark-300">Tidak ada data stock opname</td></tr>
                )}
                {paginatedItems.map((so) => (
                  <tr key={so.idstockopname}
                    onClick={() => setSelectedId(so.idstockopname === selectedId ? null : so.idstockopname)}
                    className={`border-b border-primary-50/50 text-sm cursor-pointer select-none transition-colors ${selectedId === so.idstockopname ? 'bg-primary-50 ring-1 ring-inset ring-primary-200' : 'hover:bg-warm-50/30'}`}>
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-dark-400">{so.kodestockopname}</td>
                    <td className="px-4 py-3 text-dark-400 text-xs">{String(so.tgltrans || '').slice(0, 10)}</td>
                    <td className="px-4 py-3 text-dark-500">{so.namauser || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE[so.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>{so.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {so.status === 'DRAFT' && (
                        <button onClick={(e) => handleFinalize(e, so.idstockopname)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 mx-auto">
                          <CheckCircle className="w-3 h-3" /> Finalisasi
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
    </div>
  );
}
