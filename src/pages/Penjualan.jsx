import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { formatRupiah } from '../lib/utils';
import toast from 'react-hot-toast';
import { Plus, Search, Ban, Download, FileText, Upload, RefreshCw } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/ui/Pagination';
import useTabStore from '../store/tabStore';
import PenjualanForm from './PenjualanForm';

const downloadFile = (url, filename) => {
  api.get(url, { responseType: 'blob' }).then((r) => {
    const blob = new Blob([r.data], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  });
};

export default function Penjualan({ isActive }) {
  const [jual, setJual] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const openTab = useTabStore((s) => s.openTab);

  const loadJual = useCallback(() => {
    const params = search ? { search } : {};
    api.get('/jual', { params }).then((r) => setJual(r.data));
  }, [search]);
  useEffect(() => { loadJual(); }, [loadJual]);

  const { page, setPage, totalPages, paginatedItems, resetPage } = usePagination(jual, 20);
  useEffect(() => { resetPage(); }, [search]);

  const handleRefresh = async () => { setRefreshing(true); await loadJual(); setRefreshing(false); };
  const handleTambah = () => { openTab({ label: 'Penjualan', icon: Plus, component: PenjualanForm, props: { onSuccess: loadJual }, type: 'form_add' }); };
  const handleCancel = async (id) => {
    if (!confirm('Batalkan transaksi ini? Stok akan dikembalikan.')) return;
    try { await api.put(`/jual/${id}/cancel`); toast.success('Transaksi dibatalkan'); loadJual(); }
    catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <div><h2 className="text-xl font-bold text-dark-500">Penjualan</h2><p className="text-sm text-dark-300">Riwayat transaksi penjualan</p></div>
        <div className="flex items-center gap-2">
          <button onClick={handleTambah} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Penjualan Baru</button>
          <button onClick={() => downloadFile('/impor/jual/export', 'jual-export.csv')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary-100 text-xs font-semibold text-dark-400 hover:bg-warm-50"><Download className="w-3.5 h-3.5" /> Export</button>
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="relative max-w-md mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Cari kode penjualan..." className="input-upper w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
        <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-primary-50 bg-warm-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th><th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Tanggal</th><th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Customer</th><th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Total</th><th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Jenis</th><th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Status</th><th className="text-center px-4 py-3 text-xs font-semibold text-dark-300 w-16">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((j) => (
                  <tr key={j.idjual} className={`border-b border-primary-50/50 text-sm ${j.status === 'VOID' ? 'bg-red-50/30 opacity-60' : 'hover:bg-warm-50/30'}`}>
                    <td className="px-4 py-3 text-xs font-mono text-dark-300">{j.kodejual}</td><td className="px-4 py-3 text-dark-400">{j.tgltrans?.slice(0,10)}</td><td className="px-4 py-3 text-dark-500">{j.namacustomer || '-'}</td><td className="px-4 py-3 text-right font-semibold text-accent-600">{formatRupiah(j.grandtotal)}</td>
                    <td className="px-4 py-3 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600">{j.jenis}</span></td>
                    <td className="px-4 py-3 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${j.status === 'VOID' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{j.status === 'VOID' ? 'VOID' : 'AKTIF'}</span></td>
                    <td className="px-4 py-3 text-center">{j.status !== 'VOID' && <button onClick={() => handleCancel(j.idjual)} className="p-1 rounded-lg hover:bg-red-50 text-dark-300 hover:text-red-500"><Ban className="w-3.5 h-3.5" /></button>}</td>
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
