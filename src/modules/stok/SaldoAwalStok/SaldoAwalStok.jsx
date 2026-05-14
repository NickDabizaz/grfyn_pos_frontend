import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/ui/Pagination';
import useTabStore from '../../../store/tabStore';
import SaldoAwalStokForm from './SaldoAwalStokForm';

export default function SaldoAwalStok({ isActive }) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const openTab = useTabStore((s) => s.openTab);

  const load = useCallback(async () => {
    const { data: res } = await api.get('/stok/saldostok');
    setData(res);
  }, []);

  const { page, setPage, totalPages, paginatedItems, resetPage } = usePagination(data, 20);
  useEffect(() => { resetPage(); }, [search]);
  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const handleTambah = () => { openTab({ label: 'Saldo Awal', icon: Plus, component: SaldoAwalStokForm, props: { onSuccess: load }, type: 'form_add' }); };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <div><h2 className="text-xl font-bold text-dark-500">Saldo Awal Stok</h2><p className="text-sm text-dark-300">Input saldo awal stok per barang</p></div>
        <div className="flex items-center gap-2">
          <button onClick={handleTambah} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Saldo Awal Baru</button>
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-primary-50 bg-warm-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th><th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Tanggal</th><th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Catatan</th><th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((s) => (
                  <tr key={s.idsaldostok} className="border-b border-primary-50/50 hover:bg-warm-50/30 text-sm">
                    <td className="px-4 py-3 text-xs font-mono text-dark-300">{s.kodesaldostok}</td><td className="px-4 py-3 text-dark-400">{s.tgltrans?.slice(0,10)}</td><td className="px-4 py-3 text-dark-400">{s.catatan || '-'}</td><td className="px-4 py-3 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600">{s.status}</span></td>
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
