import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import { formatRupiah, today } from '../../../lib/utils';
import toast from 'react-hot-toast';
import { Plus, Search, RefreshCw, Pencil, Calendar } from 'lucide-react';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/ui/Pagination';
import useTabStore from '../../../store/tabStore';
import ProduksiForm from './ProduksiForm';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/l10n/id.js';

export default function Produksi({ isActive }) {
  const openTab       = useTabStore(s => s.openTab);
  const openOrFocusTab = useTabStore(s => s.openOrFocusTab);

  const [produksiList, setProduksiList] = useState([]);
  const [selectedId, setSelectedId]     = useState(null);
  const [refreshing, setRefreshing]     = useState(false);

  const [filterKode, setFilterKode]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [tglAwal, setTglAwal]         = useState(today());
  const [tglAkhir, setTglAkhir]       = useState(today());

  const loadProduksi = useCallback(() => {
    const params = {};
    if (filterKode)   params.search = filterKode;
    if (filterStatus) params.status = filterStatus;
    params.tglwal   = tglAwal;
    params.tglakhir = tglAkhir;
    api.get('/produksi', { params }).then(r => setProduksiList(r.data)).catch(() => {});
  }, [filterKode, filterStatus, tglAwal, tglAkhir]);

  useEffect(() => { loadProduksi(); }, [loadProduksi]);

  const { page, setPage, totalPages, paginatedItems, resetPage } = usePagination(produksiList, 20);
  useEffect(() => { resetPage(); }, [filterKode, filterStatus, tglAwal, tglAkhir]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProduksi();
    setTimeout(() => setRefreshing(false), 300);
  };

  const handleTambah = () => {
    openOrFocusTab({
      label: 'Produksi Baru',
      icon: Plus,
      component: ProduksiForm,
      props: { onSuccess: loadProduksi },
      type: 'form_add',
      kodemenu: 'produksi-add',
    });
  };

  const handleEdit = async (p) => {
    if (p.status === 'VOID') return toast.error('Produksi VOID tidak dapat diedit');
    try {
      const { data } = await api.get(`/produksi/${p.idproduksi}`);
      openOrFocusTab({
        label: `Edit ${p.kodeproduksi}`,
        icon: Pencil,
        component: ProduksiForm,
        props: { onSuccess: loadProduksi, editData: data },
        type: 'form_edit',
        kodemenu: `produksi-edit-${p.idproduksi}`,
      });
    } catch {
      toast.error('Gagal memuat data produksi');
    }
  };

  const handleRowClick = (p) => setSelectedId(p.idproduksi === selectedId ? null : p.idproduksi);

  const handleCancel = async (e, id) => {
    e.stopPropagation();
    try {
      const { data: check } = await api.get(`/produksi/${id}/check-edit`);
      if (!check.canEdit) {
        return toast.error(check.message || 'Produksi tidak dapat dibatalkan');
      }
    } catch {}
    if (!confirm('Batalkan produksi ini? Stok akan dikembalikan.')) return;
    try {
      await api.put(`/produksi/${id}/cancel`);
      toast.success('Produksi dibatalkan');
      if (selectedId === id) setSelectedId(null);
      loadProduksi();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal');
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-dark-500">Produksi</h2>
          <p className="text-sm text-dark-300">Catat hasil produksi dan bahan baku yang digunakan</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleTambah}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> Produksi Baru
          </button>
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400 hover:bg-warm-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 pb-3 shrink-0">
        <div className="bg-white rounded-2xl border border-primary-50 p-3 grid grid-cols-2 gap-3 md:grid-cols-3">

          {/* Kode Produksi */}
          <div>
            <label className="block text-[10px] font-semibold text-dark-300 mb-1">Kode Produksi</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-300" />
              <input type="text" value={filterKode}
                onChange={e => setFilterKode(e.target.value.toUpperCase())}
                placeholder="Cari kode..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-primary-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-semibold text-dark-300 mb-1">Status</label>
            <select value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-primary-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white">
              <option value="">Semua</option>
              <option value="AKTIF">AKTIF</option>
              <option value="VOID">VOID</option>
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-[10px] font-semibold text-dark-300 mb-1">Tanggal</label>
            <div className="flex items-center gap-1.5">
              <Flatpickr value={tglAwal} onChange={([d]) => setTglAwal(d.toISOString().slice(0, 10))}
                options={{ dateFormat: 'Y-m-d', locale: 'id' }}
                className="flatpickr-input flex-1 text-xs" placeholder="Dari tanggal" />
              <span className="text-[10px] text-dark-300 shrink-0">s/d</span>
              <Flatpickr value={tglAkhir} onChange={([d]) => setTglAkhir(d.toISOString().slice(0, 10))}
                options={{ dateFormat: 'Y-m-d', locale: 'id' }}
                className="flatpickr-input flex-1 text-xs" placeholder="Sampai tanggal" />
            </div>
          </div>

        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-primary-50 bg-warm-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Tanggal</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Total Bahan</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Total Hasil</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300 w-20">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-dark-300">Tidak ada data produksi</td></tr>
                )}
                {paginatedItems.map((p) => {
                  const isSelected = selectedId === p.idproduksi;
                  return (
                    <tr key={p.idproduksi}
                      onClick={() => handleRowClick(p)}
                      onDoubleClick={() => handleEdit(p)}
                      className={`border-b border-primary-50/50 text-sm cursor-pointer select-none transition-colors ${
                        p.status === 'VOID'
                          ? 'bg-red-50/30 opacity-60'
                          : isSelected
                            ? 'bg-primary-50 ring-1 ring-inset ring-primary-200'
                            : 'hover:bg-warm-50/30'
                      }`}>
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-dark-400">{p.kodeproduksi}</td>
                      <td className="px-4 py-3 text-dark-400 text-xs">{String(p.tgltrans || '').slice(0, 10)}</td>
                      <td className="px-4 py-3 text-right font-mono text-dark-500">{parseFloat(p.total_bahan || 0)}</td>
                      <td className="px-4 py-3 text-right font-mono text-dark-500">{parseFloat(p.total_hasil || 0)}</td>
                      <td className="px-4 py-3 text-center">
                        {p.status === 'VOID' ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">VOID</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">AKTIF</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.status !== 'VOID' && (
                          <button
                            onClick={(e) => handleCancel(e, p.idproduksi)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </div>

    </div>
  );
}
