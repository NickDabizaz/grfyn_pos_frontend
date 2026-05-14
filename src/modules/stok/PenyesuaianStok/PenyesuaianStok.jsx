import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/ui/Pagination';
import useTabStore from '../../../store/tabStore';
import PenyesuaianStokForm from './PenyesuaianStokForm';

export default function PenyesuaianStok({ isActive }) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const openTab = useTabStore((s) => s.openTab);

  const load = useCallback(async () => {
    const params = search ? { search } : {};
    const { data: res } = await api.get('/stok/penyesuaian', { params });
    setData(res);
  }, [search]);

  const { page, setPage, totalPages, paginatedItems, resetPage } = usePagination(data, 20);
  useEffect(() => { resetPage(); }, [search]);
  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const handleTambah = () => { openTab({ label: 'Penyesuaian', icon: Plus, component: PenyesuaianStokForm, props: { onSuccess: load }, type: 'form_add' }); };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <div><h2 className="text-xl font-bold text-dark-500">Penyesuaian Stok</h2><p className="text-sm text-dark-300">Opname & penyesuaian stok barang</p></div>
        <div className="flex items-center gap-2">
          <button onClick={handleTambah} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Penyesuaian Baru</button>
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="relative max-w-md mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Cari kode penyesuaian..." className="input-upper w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
        <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-primary-50 bg-warm-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th><th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Tanggal</th><th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Keterangan</th><th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((ps) => (
                  <tr key={ps.idpenyesuaianstok} className="border-b border-primary-50/50 hover:bg-warm-50/30 text-sm">
                    <td className="px-4 py-3 text-xs font-mono text-dark-300">{ps.kodepenyesuaianstok}</td><td className="px-4 py-3 text-dark-400">{ps.tgltrans?.slice(0,10)}</td><td className="px-4 py-3 text-dark-400">{ps.keterangan || '-'}</td><td className="px-4 py-3 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600">{ps.status}</span></td>
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
