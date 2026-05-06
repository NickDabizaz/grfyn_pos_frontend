import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, RefreshCw, Eye } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/ui/Pagination';
import { useAuthStore } from '../store/authStore';
import useTabStore from '../store/tabStore';
import KasForm from './KasForm';

export default function Kas({ isActive }) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const openTab = useTabStore((s) => s.openTab);

  const load = useCallback(async () => {
    const params = search ? { search } : {};
    const { data: res } = await api.get('/kas', { params });
    setData(res);
  }, [search]);

  const { page, setPage, totalPages, paginatedItems, resetPage } = usePagination(data, 20);
  useEffect(() => { resetPage(); }, [search]);
  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const handleTambah = () => { openTab({ label: 'Kas', icon: Plus, component: KasForm, props: { mode: 'add', onSuccess: load }, type: 'form_add' }); };
  const handleDetail = (k) => {
    openTab({
      label: `Kas: ${k.kodekas}`,
      component: KasDetail,
      props: { idkas: k.idkas, kodekas: k.kodekas },
      type: 'list',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <div><h2 className="text-xl font-bold text-dark-500">Kas</h2><p className="text-sm text-dark-300">Jurnal kas masuk / keluar</p></div>
        <div className="flex items-center gap-2">
          <button onClick={handleTambah} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Transaksi Kas</button>
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="relative max-w-md mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Cari kode kas..." className="input-upper w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
        </div>
        <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-primary-50 bg-warm-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th><th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Tanggal</th><th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Status</th><th className="text-center px-4 py-3 text-xs font-semibold text-dark-300 w-16">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((k) => (
                  <tr key={k.idkas} className="border-b border-primary-50/50 hover:bg-warm-50/30 text-sm">
                    <td className="px-4 py-3 text-xs font-mono text-dark-300">{k.kodekas}</td><td className="px-4 py-3 text-dark-400">{k.tgltrans?.slice(0,10)}</td><td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${k.status === 'NONAKTIF' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{k.status}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleDetail(k)} className="p-1.5 rounded-lg hover:bg-primary-50 text-dark-300 hover:text-primary-500"><Eye className="w-3.5 h-3.5" /></button>
                    </div></td>
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

function KasDetail({ idkas, kodekas, tabId, tabState, updateTabState }) {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api.get(`/kas/${idkas}`).then(({ data }) => setDetail(data)).catch(() => {});
  }, [idkas]);

  if (!detail) return <div className="p-6 text-sm text-dark-300">Memuat...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-2 border-b border-primary-50 shrink-0">
        <h2 className="text-lg font-bold text-dark-500">Detail Kas: {detail.kodekas}</h2>
        <p className="text-xs text-dark-300">Tanggal: {detail.tgltrans?.slice(0,10)}</p>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-primary-50 bg-warm-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode Akun</th><th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Nama Akun</th><th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Catatan</th><th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Amount</th>
            </tr></thead>
            <tbody>
              {detail.details?.map((d, i) => (
                <tr key={i} className="border-b border-primary-50/50 text-sm">
                  <td className="px-4 py-3 text-xs font-mono text-dark-300">{d.kodeakun}</td><td className="px-4 py-3 text-dark-500">{d.namaakun}</td><td className="px-4 py-3 text-dark-400">{d.catatan || '-'}</td><td className="px-4 py-3 text-right font-semibold text-dark-500">{Number(d.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
