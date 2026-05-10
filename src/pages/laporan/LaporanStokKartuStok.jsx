import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import useTabStore from '../../store/tabStore';
import { Printer, Search, RefreshCw, TrendingUp, TrendingDown, X } from 'lucide-react';
import MultiSelectModal from '../../components/ui/MultiSelectModal';
import LaporanResultPage from './LaporanResultPage';

const reportUrl = (token, params = {}) => {
  const qs = new URLSearchParams({ format: 'html', token, ...params }).toString();
  return `/api/laporan/kartu-stok?${qs}`;
};

function joinIds(arr, field) {
  if (!arr || !arr.length) return '';
  return arr.map((it) => it[field]).filter(Boolean).join(',');
}

function FilterChip({ label, items, nameField, onClear, onBrowse, emptyText }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-dark-300 mb-1">{label}</label>
      <div className="flex items-center gap-1.5 flex-wrap min-h-[34px] px-2 py-1.5 rounded-lg border border-primary-100 bg-white">
        {items.length === 0 && (
          <span className="text-xs text-dark-300 px-1">{emptyText || 'Semua'}</span>
        )}
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 text-[10px] font-semibold max-w-[160px]"
          >
            <span className="truncate">{item[nameField]}</span>
            <button onClick={() => onClear(item)} className="hover:text-red-500 shrink-0">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <button
          onClick={onBrowse}
          className="text-[10px] font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2 py-0.5 rounded-md shrink-0"
        >
          + Browse
        </button>
      </div>
    </div>
  );
}

export default function LaporanStokKartuStok() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterBarangs, setFilterBarangs] = useState([]);
  const [showBarangModal, setShowBarangModal] = useState(false);
  const [filters, setFilters] = useState({
    tglwal: '',
    tglakhir: '',
  });

  const token = useAuthStore((s) => s.token);
  const openTab = useTabStore((s) => s.openTab);

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterBarangs.length) params.idbarang = joinIds(filterBarangs, 'idbarang');
    if (filters.tglwal) params.tglwal = filters.tglwal;
    if (filters.tglakhir) params.tglakhir = filters.tglakhir;

    api
      .get('/laporan/kartu-stok', { params })
      .then((r) => {
        setData(r.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const fetchBarangs = (search) =>
    api.get('/barang/browse-barang', search ? { params: { search } } : {}).then((r) => r.data || []);

  const handleSearch = () => {
    load();
  };

  const handleCetak = () => {
    const params = {};
    if (filterBarangs.length) params.idbarang = joinIds(filterBarangs, 'idbarang');
    if (filters.tglwal) params.tglwal = filters.tglwal;
    if (filters.tglakhir) params.tglakhir = filters.tglakhir;
    openTab({
      label: 'Laporan Kartu Stok',
      component: LaporanResultPage,
      props: { url: reportUrl(token, params), label: 'Laporan Kartu Stok' },
      type: 'report',
      kodemenu: null,
    });
  };

  return (
    <div className="space-y-4 mt-4 ms-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-500">Laporan Kartu Stok</h2>
          <p className="text-sm text-dark-300">Filter & cetak riwayat pergerakan stok</p>
        </div>
        <button
          onClick={handleCetak}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all"
        >
          <Printer className="w-4 h-4" /> Cetak Laporan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-primary-50 p-4">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-dark-400 mb-1.5">Barang</label>
            <FilterChip
              label=""
              items={filterBarangs}
              nameField="namabarang"
              emptyText="Semua barang"
              onClear={(b) => setFilterBarangs((prev) => prev.filter((x) => x.idbarang !== b.idbarang))}
              onBrowse={() => setShowBarangModal(true)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-dark-400 mb-1.5">Tanggal Awal</label>
            <input
              type="date"
              value={filters.tglwal}
              onChange={(e) => setFilters({ ...filters, tglwal: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-primary-100 bg-warm-50 text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-dark-400 mb-1.5">Tanggal Akhir</label>
            <input
              type="date"
              value={filters.tglakhir}
              onChange={(e) => setFilters({ ...filters, tglakhir: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-primary-100 bg-warm-50 text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              <Search className="w-4 h-4" /> Cari
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-warm-100 hover:bg-warm-200 text-dark-500 text-sm font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary-50 bg-warm-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">No</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Tanggal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Nama Barang</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Satuan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Keterangan</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-dark-300">Jenis</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => {
              const isMasuk = item.jenis === 'M';
              const jml = parseInt(item.jml) || 0;

              return (
                <tr key={item.idkartustok || i} className="border-b border-primary-50/50 hover:bg-warm-50/30 text-sm">
                  <td className="px-4 py-3 text-dark-400">{i + 1}</td>
                  <td className="px-4 py-3 text-dark-400">
                    {new Date(item.tgltrans).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-dark-300">{item.kodebarang}</td>
                  <td className="px-4 py-3 font-medium text-dark-500">{item.namabarang}</td>
                  <td className="px-4 py-3 text-dark-400">{item.satuan || '-'}</td>
                  <td className="px-4 py-3 text-dark-400">{item.keterangan || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {isMasuk ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <TrendingUp className="w-3 h-3" /> Masuk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <TrendingDown className="w-3 h-3" /> Keluar
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-dark-500">
                    {jml.toLocaleString('id-ID')}
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && !loading && (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-sm text-dark-300">
                  Tidak ada data. Gunakan filter untuk menampilkan data.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-sm text-dark-300">
                  Memuat data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showBarangModal && (
        <MultiSelectModal
          title="Pilih Barang"
          fetchItems={fetchBarangs}
          initialSelected={filterBarangs}
          onConfirm={(items) => {
            setFilterBarangs(items);
            setShowBarangModal(false);
          }}
          onClose={() => setShowBarangModal(false)}
          idField="idbarang"
          labelField="namabarang"
          subField="kodebarang"
          searchPlaceholder="Cari kode / nama barang..."
        />
      )}
    </div>
  );
}
