import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { formatRupiah, today, firstOfMonth } from '../lib/utils';
import toast from 'react-hot-toast';
import { Eye, FileDown, Printer, Search, FileBarChart, Package, Users, Building2, ShoppingBag } from 'lucide-react';
import { BrowseSupplierModal, BrowseCustomerModal, BrowseLokasiModal } from '../lib/formHelpers';

const reportUrl = (type, token, params = {}) => {
  const qs = new URLSearchParams({ format: 'html', token, ...params }).toString();
  return `/api/laporan/${type}?${qs}`;
};

function exportExcel(url, token, params, filename) {
  const fullParams = { token, ...params };
  const qs = new URLSearchParams(fullParams).toString();
  fetch(`/api/laporan/${url}?${qs}`)
    .then(r => r.text())
    .then(html => {
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch(() => toast.error('Gagal export'));
}

function exportPdf(url, token, params) {
  const qs = new URLSearchParams({ format: 'html', token, ...params }).toString();
  const w = window.open(`/api/laporan/${url}?${qs}`, '_blank');
  if (w) {
    w.onload = () => setTimeout(() => w.print(), 500);
  }
}

function BrowseBarangModal({ onSelect, onClose }) {
  const [barangList, setBarangList] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      const params = search ? { search } : {};
      api.get('/barang/browse-barang', { params }).then(r => setBarangList(search ? r.data : r.data.slice(0, 10)));
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-primary-50">
          <h3 className="text-sm font-bold text-dark-500">Pilih Barang</h3>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
            <input value={search} onChange={e => setSearch(e.target.value.toUpperCase())}
              placeholder="Cari kode / nama barang..." autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <div className="max-h-72 overflow-y-auto scrollbar-thin">
            {barangList.length === 0 && (
              <p className="text-sm text-dark-300 text-center py-8">{search ? 'Tidak ada hasil' : 'Memuat...'}</p>
            )}
            {barangList.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary-50">
                    <th className="text-left px-3 py-2 text-xs text-dark-300">Kode</th>
                    <th className="text-left px-3 py-2 text-xs text-dark-300">Nama Barang</th>
                    <th className="text-left px-3 py-2 text-xs text-dark-300">Satuan</th>
                  </tr>
                </thead>
                <tbody>
                  {barangList.map(b => (
                    <tr key={b.idbarang} onClick={() => onSelect(b)}
                      className="border-b border-primary-50/50 hover:bg-warm-50 cursor-pointer transition-colors">
                      <td className="px-3 py-2.5 text-xs font-mono text-dark-300">{b.kodebarang}</td>
                      <td className="px-3 py-2.5 font-medium text-dark-500">{b.namabarang}</td>
                      <td className="px-3 py-2.5 text-dark-400 text-xs">{b.satuankecil || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Laporan() {
  const token = useAuthStore((s) => s.token);

  const [category, setCategory]   = useState('penjualan');
  const [subType, setSubType]     = useState('transaksi');

  const [tglwal, setTglwal]       = useState(today());
  const [tglakhir, setTglakhir]   = useState(today());

  const [filterCustomer, setFilterCustomer] = useState(null);
  const [filterSupplier, setFilterSupplier] = useState(null);
  const [filterLokasi, setFilterLokasi]     = useState(null);
  const [filterBarang, setFilterBarang]     = useState(null);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showLokasiModal, setShowLokasiModal]     = useState(false);
  const [showBarangModal, setShowBarangModal]     = useState(false);

  const [iframeUrl, setIframeUrl] = useState('');
  const [masterData, setMasterData] = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterType, setMasterType] = useState('barang');

  const categories = [
    { key: 'master',    label: 'Master',    icon: Package },
    { key: 'penjualan', label: 'Penjualan', icon: FileBarChart },
    { key: 'pembelian', label: 'Pembelian', icon: ShoppingBag },
  ];

  const penjualanTypes = [
    { key: 'transaksi',    label: 'Laporan Penjualan',                 url: 'sales-transaksi' },
    { key: 'percustomer',  label: 'Laporan Penjualan Per Customer',    url: 'sales-per-customer' },
    { key: 'perlokasi',    label: 'Laporan Penjualan Per Lokasi',      url: 'sales-per-lokasi' },
    { key: 'perbarang',    label: 'Laporan Penjualan Per Barang',      url: 'sales-per-barang' },
    { key: 'rekap',        label: 'Laporan Penjualan Rekap',           url: 'rekap-sales' },
  ];

  const pembelianTypes = [
    { key: 'transaksi',     label: 'Laporan Pembelian',                 url: 'pembelian' },
    { key: 'persupplier',   label: 'Laporan Pembelian Per Supplier',    url: 'pembelian-per-supplier' },
    { key: 'perlokasi',     label: 'Laporan Pembelian Per Lokasi',      url: 'pembelian-per-lokasi' },
    { key: 'perbarang',     label: 'Laporan Pembelian Per Barang',      url: 'pembelian-per-barang' },
    { key: 'rekap',         label: 'Laporan Pembelian Rekap',           url: 'pembelian-rekap' },
  ];

  const masterTypes = [
    { key: 'barang',   label: 'Barang',   icon: Package },
    { key: 'customer', label: 'Customer', icon: Users },
    { key: 'supplier', label: 'Supplier', icon: Building2 },
  ];

  useEffect(() => {
    if (category === 'master') {
      loadMasterData(masterType);
    }
  }, [category, masterType]);

  const loadMasterData = (type) => {
    setMasterLoading(true);
    let endpoint = type === 'barang' ? '/barang?limit=500' : `/${type}`;
    api.get(endpoint).then(r => {
      setMasterData(Array.isArray(r.data) ? r.data : (r.data.data || []));
      setMasterLoading(false);
    }).catch(() => setMasterLoading(false));
  };

  const getReportUrl = () => {
    const params = { tglwal, tglakhir };
    if (filterCustomer) params.idcustomer = filterCustomer.idcustomer;
    if (filterSupplier) params.idsupplier = filterSupplier.idsupplier;
    if (filterLokasi)   params.idlokasi   = filterLokasi.idlokasi;
    if (filterBarang)   params.idbarang   = filterBarang.idbarang;

    if (category === 'penjualan') {
      const t = penjualanTypes.find(p => p.key === subType);
      return { url: t?.url, params };
    }
    if (category === 'pembelian') {
      const t = pembelianTypes.find(p => p.key === subType);
      return { url: t?.url, params };
    }
    return null;
  };

  const handleTampilkan = () => {
    const r = getReportUrl();
    if (!r) return;
    setIframeUrl(reportUrl(r.url, token, r.params));
  };

  const handleExcel = () => {
    const r = getReportUrl();
    if (!r) return;
    const label = category === 'penjualan'
      ? penjualanTypes.find(p => p.key === subType)?.label || 'laporan'
      : pembelianTypes.find(p => p.key === subType)?.label || 'laporan';
    exportExcel(r.url, token, r.params, `${label.replace(/\s+/g, '_')}.xls`);
  };

  const handlePdf = () => {
    const r = getReportUrl();
    if (!r) return;
    exportPdf(r.url, token, r.params);
  };

  const handlePrintMaster = () => window.print();

  const showMasterReport = category === 'master';

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-2 shrink-0">
        <h2 className="text-xl font-bold text-dark-500">Laporan</h2>
        <p className="text-sm text-dark-300">Generate & cetak laporan</p>
      </div>

      <div className="flex-1 overflow-auto p-6 pt-2">
        <div className="space-y-4">

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c.key} onClick={() => { setCategory(c.key); setIframeUrl(''); if (c.key === 'master') setMasterType('barang'); else if (c.key === 'penjualan') setSubType('transaksi'); else setSubType('transaksi'); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  category === c.key ? 'bg-primary-500 text-white shadow-sm' : 'bg-warm-50 text-dark-400 hover:bg-warm-100'
                }`}>
                <c.icon className="w-4 h-4" /> {c.label}
              </button>
            ))}
          </div>

          {/* Master Report Section */}
          {showMasterReport && (
            <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
              <div className="p-4 border-b border-primary-50 flex items-center justify-between">
                <div className="flex gap-2">
                  {masterTypes.map(m => (
                    <button key={m.key} onClick={() => setMasterType(m.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        masterType === m.key ? 'bg-primary-500 text-white shadow-sm' : 'bg-warm-50 text-dark-400 hover:bg-warm-100'
                      }`}>
                      <m.icon className="w-3.5 h-3.5" /> {m.label}
                    </button>
                  ))}
                </div>
                <button onClick={handlePrintMaster}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 text-sm font-semibold hover:bg-primary-100 transition-colors">
                  <Printer className="w-4 h-4" /> Cetak
                </button>
              </div>
              <div className="overflow-y-auto scrollbar-thin" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                {masterLoading ? (
                  <div className="p-8 text-center text-sm text-dark-300">Memuat...</div>
                ) : masterType === 'barang' ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-50 bg-warm-50/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">No</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Nama Barang</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Satuan</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Jenis</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Harga Jual</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-dark-300">Harga Beli</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masterData.map((b, i) => (
                        <tr key={b.idbarang || i} className="border-b border-primary-50/50 hover:bg-warm-50/30 text-sm">
                          <td className="px-4 py-3 text-dark-400">{i + 1}</td>
                          <td className="px-4 py-3 text-xs font-mono text-dark-300">{b.kodebarang}</td>
                          <td className="px-4 py-3 font-medium text-dark-500">{b.namabarang}</td>
                          <td className="px-4 py-3 text-dark-400">{b.satuankecil || '-'}</td>
                          <td className="px-4 py-3 text-dark-400">{b.jenisbarang || '-'}</td>
                          <td className="px-4 py-3 text-right">{formatRupiah(b.hargajual)}</td>
                          <td className="px-4 py-3 text-right">{formatRupiah(b.hargabeli)}</td>
                        </tr>
                      ))}
                      {masterData.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-dark-300">Tidak ada data</td></tr>
                      )}
                    </tbody>
                  </table>
                ) : masterType === 'customer' ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-50 bg-warm-50/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">No</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Nama Customer</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Alamat</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">No. HP</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masterData.map((c, i) => (
                        <tr key={c.idcustomer || i} className="border-b border-primary-50/50 hover:bg-warm-50/30 text-sm">
                          <td className="px-4 py-3 text-dark-400">{i + 1}</td>
                          <td className="px-4 py-3 text-xs font-mono text-dark-300">{c.kodecustomer}</td>
                          <td className="px-4 py-3 font-medium text-dark-500">{c.namacustomer}</td>
                          <td className="px-4 py-3 text-dark-400">{c.alamat || '-'}</td>
                          <td className="px-4 py-3 text-dark-400">{c.hp || '-'}</td>
                          <td className="px-4 py-3 text-dark-400">{c.email || '-'}</td>
                        </tr>
                      ))}
                      {masterData.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-dark-300">Tidak ada data</td></tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-50 bg-warm-50/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">No</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Kode</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Nama Supplier</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Alamat</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">No. HP</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-dark-300">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masterData.map((s, i) => (
                        <tr key={s.idsupplier || i} className="border-b border-primary-50/50 hover:bg-warm-50/30 text-sm">
                          <td className="px-4 py-3 text-dark-400">{i + 1}</td>
                          <td className="px-4 py-3 text-xs font-mono text-dark-300">{s.kodesupplier}</td>
                          <td className="px-4 py-3 font-medium text-dark-500">{s.namasupplier}</td>
                          <td className="px-4 py-3 text-dark-400">{s.alamat || '-'}</td>
                          <td className="px-4 py-3 text-dark-400">{s.hp || '-'}</td>
                          <td className="px-4 py-3 text-dark-400">{s.email || '-'}</td>
                        </tr>
                      ))}
                      {masterData.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-dark-300">Tidak ada data</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Penjualan & Pembelian Report Section */}
          {!showMasterReport && (
            <>
              {/* Sub-Type Tabs */}
              <div className="flex gap-2 flex-wrap">
                {(category === 'penjualan' ? penjualanTypes : pembelianTypes).map(t => (
                  <button key={t.key} onClick={() => { setSubType(t.key); setIframeUrl(''); }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      subType === t.key ? 'bg-accent-50 border border-accent-200 text-accent-700' : 'bg-warm-50 text-dark-400 hover:bg-warm-100'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Filter Bar */}
              <div className="bg-white rounded-2xl border border-primary-50 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {/* Tanggal */}
                  <div>
                    <label className="block text-[10px] font-semibold text-dark-300 mb-1">Tanggal Awal</label>
                    <input type="date" value={tglwal} onChange={e => setTglwal(e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border border-primary-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500/20" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-dark-300 mb-1">Tanggal Akhir</label>
                    <input type="date" value={tglakhir} onChange={e => setTglakhir(e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border border-primary-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500/20" />
                  </div>

                  {/* Customer (Penjualan only) */}
                  {category === 'penjualan' && (
                    <div>
                      <label className="block text-[10px] font-semibold text-dark-300 mb-1">Customer</label>
                      <div className="flex gap-1.5">
                        <div className="flex-1 flex items-center px-2.5 py-2 rounded-lg border border-primary-100 bg-warm-50/40 text-xs min-h-[34px] overflow-hidden">
                          {filterCustomer
                            ? <span className="text-dark-500 truncate">{filterCustomer.namacustomer}</span>
                            : <span className="text-dark-300">Semua</span>
                          }
                        </div>
                        <button onClick={() => setShowCustomerModal(true)}
                          className="px-2 py-1.5 rounded-lg border border-primary-100 text-[10px] font-semibold text-dark-400 hover:bg-warm-50 shrink-0">
                          Browse
                        </button>
                        {filterCustomer && (
                          <button onClick={() => setFilterCustomer(null)}
                            className="px-2 py-1.5 rounded-lg border border-red-100 text-[10px] text-red-400 hover:bg-red-50 shrink-0">&times;</button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Supplier (Pembelian only) */}
                  {category === 'pembelian' && (
                    <div>
                      <label className="block text-[10px] font-semibold text-dark-300 mb-1">Supplier</label>
                      <div className="flex gap-1.5">
                        <div className="flex-1 flex items-center px-2.5 py-2 rounded-lg border border-primary-100 bg-warm-50/40 text-xs min-h-[34px] overflow-hidden">
                          {filterSupplier
                            ? <span className="text-dark-500 truncate">{filterSupplier.namasupplier}</span>
                            : <span className="text-dark-300">Semua</span>
                          }
                        </div>
                        <button onClick={() => setShowSupplierModal(true)}
                          className="px-2 py-1.5 rounded-lg border border-primary-100 text-[10px] font-semibold text-dark-400 hover:bg-warm-50 shrink-0">
                          Browse
                        </button>
                        {filterSupplier && (
                          <button onClick={() => setFilterSupplier(null)}
                            className="px-2 py-1.5 rounded-lg border border-red-100 text-[10px] text-red-400 hover:bg-red-50 shrink-0">&times;</button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lokasi */}
                  <div>
                    <label className="block text-[10px] font-semibold text-dark-300 mb-1">Lokasi</label>
                    <div className="flex gap-1.5">
                      <div className="flex-1 flex items-center px-2.5 py-2 rounded-lg border border-primary-100 bg-warm-50/40 text-xs min-h-[34px] overflow-hidden">
                        {filterLokasi
                          ? <span className="text-dark-500 truncate">{filterLokasi.namalokasi}</span>
                          : <span className="text-dark-300">Semua</span>
                        }
                      </div>
                      <button onClick={() => setShowLokasiModal(true)}
                        className="px-2 py-1.5 rounded-lg border border-primary-100 text-[10px] font-semibold text-dark-400 hover:bg-warm-50 shrink-0">
                        Browse
                      </button>
                      {filterLokasi && (
                        <button onClick={() => setFilterLokasi(null)}
                          className="px-2 py-1.5 rounded-lg border border-red-100 text-[10px] text-red-400 hover:bg-red-50 shrink-0">&times;</button>
                      )}
                    </div>
                  </div>

                  {/* Barang (for per-barang reports) */}
                  {(subType === 'perbarang') && (
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-dark-300 mb-1">Barang</label>
                      <div className="flex gap-1.5">
                        <div className="flex-1 flex items-center px-2.5 py-2 rounded-lg border border-primary-100 bg-warm-50/40 text-xs min-h-[34px] overflow-hidden">
                          {filterBarang
                            ? <span className="text-dark-500 truncate">{filterBarang.kodebarang} - {filterBarang.namabarang}</span>
                            : <span className="text-dark-300">Semua barang</span>
                          }
                        </div>
                        <button onClick={() => setShowBarangModal(true)}
                          className="px-2 py-1.5 rounded-lg border border-primary-100 text-[10px] font-semibold text-dark-400 hover:bg-warm-50 shrink-0">
                          Browse
                        </button>
                        {filterBarang && (
                          <button onClick={() => setFilterBarang(null)}
                            className="px-2 py-1.5 rounded-lg border border-red-100 text-[10px] text-red-400 hover:bg-red-50 shrink-0">&times;</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button onClick={handleTampilkan}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold transition-all">
                    <Eye className="w-4 h-4" /> Cetak Laporan
                  </button>
                  <button onClick={handleExcel}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all">
                    <FileDown className="w-4 h-4" /> Cetak Excel
                  </button>
                  <button onClick={handlePdf}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all">
                    <Printer className="w-4 h-4" /> Cetak PDF
                  </button>
                </div>
              </div>

              {/* Result Area */}
              {iframeUrl ? (
                <div className="bg-white rounded-2xl border border-primary-50 overflow-hidden animate-in" style={{ minHeight: '70vh' }}>
                  <iframe src={iframeUrl} className="w-full border-0" style={{ minHeight: '70vh', height: 'calc(100vh - 400px)' }} title="Laporan" />
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-primary-50 p-12 text-center animate-in">
                  <FileBarChart className="w-16 h-16 text-dark-200 mx-auto mb-4" />
                  <p className="text-dark-300 text-sm">Pilih jenis laporan dan filter, lalu klik <strong>Cetak Laporan</strong></p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCustomerModal && (
        <BrowseCustomerModal
          onSelect={c => { setFilterCustomer(c); setShowCustomerModal(false); }}
          onClose={() => setShowCustomerModal(false)}
        />
      )}
      {showSupplierModal && (
        <BrowseSupplierModal
          onSelect={s => { setFilterSupplier(s); setShowSupplierModal(false); }}
          onClose={() => setShowSupplierModal(false)}
        />
      )}
      {showLokasiModal && (
        <BrowseLokasiModal
          onSelect={l => { setFilterLokasi(l); setShowLokasiModal(false); }}
          onClose={() => setShowLokasiModal(false)}
        />
      )}
      {showBarangModal && (
        <BrowseBarangModal
          onSelect={b => { setFilterBarang(b); setShowBarangModal(false); }}
          onClose={() => setShowBarangModal(false)}
        />
      )}
    </div>
  );
}
