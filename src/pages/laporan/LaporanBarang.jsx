import { useState } from 'react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

export default function LaporanBarang({ isActive }) {
  const user = useAuthStore(s => s.user);
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    api.get('/barang', { params: { search } }).then(r => {
      setData(r.data);
      setSearched(true);
    }).catch(() => {
    }).finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-dark-500">Laporan Barang</h2>
          <p className="text-sm text-dark-300">Data master barang</p>
        </div>
      </div>

      <div className="px-6 pb-3 shrink-0">
        <div className="bg-white rounded-2xl border border-primary-50 p-3 flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Cari kode / nama barang..."
            className="flex-1 px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          <button onClick={handleSearch} disabled={loading}
            className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Memuat...' : 'Cari'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          <div className="overflow-y-auto scrollbar-thin">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-primary-50 bg-warm-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Nama Barang</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Satuan</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Stok Min</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Jenis</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {!searched && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-dark-300">Masukkan kata kunci untuk mencari</td></tr>
                )}
                {searched && data.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-dark-300">Tidak ada data ditemukan</td></tr>
                )}
                {data.map((b) => (
                  <tr key={b.idbarang} className="border-b border-primary-50/50 text-sm hover:bg-warm-50/30">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-dark-400">{b.kodebarang}</td>
                    <td className="px-4 py-3 text-dark-500">{b.namabarang}</td>
                    <td className="px-4 py-3 text-dark-400 text-xs">{b.satuankecil || '-'}</td>
                    <td className="px-4 py-3 text-right text-dark-400">{b.stokmin || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge badge-soft badge-sm badge-info">{b.jenis || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge badge-soft badge-sm ${b.status === 'AKTIF' ? 'badge-success' : 'badge-error'}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}