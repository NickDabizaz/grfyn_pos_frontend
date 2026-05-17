import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/ui/Pagination';
import useTabStore from '../../../store/tabStore';
import KaryawanForm from './KaryawanForm';
import { useMenuAccess, canAccess } from '../../../hooks/useMenuAccess';

export default function Karyawan() {
  const openOrFocusTab = useTabStore(s => s.openOrFocusTab);
  const { access } = useMenuAccess('sdm.karyawan');
  const canTambah = canAccess(access, 'tambah');
  const canUbah = canAccess(access, 'ubah');

  const [list, setList]           = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterKode, setFilterKode] = useState('');

  const loadData = useCallback(() => {
    const params = {};
    if (filterKode) params.search = filterKode;
    api.get('/karyawan', { params }).then(r => setList(r.data)).catch(() => {});
  }, [filterKode]);

  useEffect(() => { loadData(); }, [loadData]);

  const { page, setPage, totalPages, paginatedItems, resetPage } = usePagination(list, 20);
  useEffect(() => { resetPage(); }, [filterKode]);

  const handleRefresh = () => { setRefreshing(true); loadData(); setTimeout(() => setRefreshing(false), 300); };

  const handleTambah = () => {
    openOrFocusTab({ label: 'Karyawan Baru', icon: Plus, component: KaryawanForm, props: { onSuccess: loadData }, type: 'form_add', kodemenu: 'karyawan-add' });
  };

  const handleEdit = (k) => {
    openOrFocusTab({
      label: `Edit ${k.namakaryawan}`,
      icon: Pencil,
      component: KaryawanForm,
      props: { existingData: k, onSuccess: loadData },
      type: 'form_edit',
      kodemenu: `karyawan-edit-${k.idkaryawan}`,
    });
  };

  const handleHapus = async (id, nama) => {
    if (!confirm(`Hapus karyawan "${nama}"?`)) return;
    try {
      await api.delete(`/karyawan/${id}`);
      toast.success('Karyawan berhasil dihapus');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal hapus');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-dark-500">Data Karyawan</h2>
          <p className="text-sm text-dark-300">Kelola data karyawan perusahaan</p>
        </div>
        <div className="flex items-center gap-2">
          {canTambah && (
            <button onClick={handleTambah}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold">
              <Plus className="w-4 h-4" /> Karyawan Baru
            </button>
          )}
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400 hover:bg-warm-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-3 shrink-0">
        <div className="bg-white rounded-2xl border border-primary-50 p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-300" />
            <input type="text" value={filterKode} onChange={e => setFilterKode(e.target.value)} placeholder="Cari kode / nama karyawan..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-primary-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-primary-50 bg-warm-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Nama Karyawan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Jabatan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">No. HP</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-dark-300">Tidak ada data karyawan</td></tr>
                )}
                {paginatedItems.map((k) => (
                  <tr key={k.idkaryawan}
                    onClick={() => setSelectedId(k.idkaryawan === selectedId ? null : k.idkaryawan)}
                    className={`border-b border-primary-50/50 text-sm cursor-pointer select-none transition-colors ${selectedId === k.idkaryawan ? 'bg-primary-50 ring-1 ring-inset ring-primary-200' : 'hover:bg-warm-50/30'}`}>
                    <td className="px-4 py-3 text-xs font-mono text-dark-400">{k.kodekaryawan}</td>
                    <td className="px-4 py-3 text-dark-500 font-medium">{k.namakaryawan}</td>
                    <td className="px-4 py-3 text-dark-400 text-xs">{k.jabatan || '-'}</td>
                    <td className="px-4 py-3 text-dark-400 text-xs">{k.email || '-'}</td>
                    <td className="px-4 py-3 text-dark-400 text-xs">{k.nohp || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canUbah && (
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(k); }} className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canTambah && (
                          <button onClick={(e) => { e.stopPropagation(); handleHapus(k.idkaryawan, k.namakaryawan); }} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
