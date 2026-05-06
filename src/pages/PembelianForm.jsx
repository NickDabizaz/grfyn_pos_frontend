import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { formatRupiah } from '../lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, Trash2 } from 'lucide-react';
import SearchableSelect from '../components/ui/SearchableSelect';
import useTabStore from '../store/tabStore';

export default function PembelianForm({ onSuccess, tabId }) {
  const [suppliers, setSuppliers] = useState([]);
  const [barang, setBarang] = useState([]);
  const [supplier, setSupplier] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchCart, setSearchCart] = useState('');
  const [usePpn, setUsePpn] = useState(true);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const closeTab = useTabStore((s) => s.closeTab);

  useEffect(() => { api.get('/supplier').then(r => setSuppliers(r.data)); }, []);
  useEffect(() => {
    if (!searchCart) { setBarang([]); return; }
    const t = setTimeout(() => { api.get(`/barang?search=${encodeURIComponent(searchCart)}`).then(r => setBarang(r.data)); }, 300);
    return () => clearTimeout(t);
  }, [searchCart]);

  const addToCart = (p) => {
    const exists = cart.find(c => c.idbarang === p.idbarang);
    if (exists) { setCart(cart.map(c => c.idbarang === p.idbarang ? { ...c, jml: c.jml + 1 } : c)); }
    else { setCart([...cart, { ...p, jml: 1, harga: parseFloat(p.hargabeli_terbaru || 0) }]); }
    setSearchCart(''); setBarang([]);
  };

  const grandTotal = cart.reduce((sum, c) => sum + (c.harga * c.jml) + (usePpn ? (c.harga * c.jml * (user?.ppn || 11)) / 100 : 0), 0);

  const handleSubmit = async () => {
    if (!cart.length) return toast.error('Keranjang kosong');
    setLoading(true);
    try {
      await api.post('/beli', {
        idsupplier: supplier?.idsupplier || null, iduser: user?.iduser, grandtotal: grandTotal, bayar: grandTotal,
        useppn: usePpn, items: cart.map(c => ({ idbarang: c.idbarang, jml: c.jml, harga: c.harga })),
      });
      toast.success('Pembelian berhasil!');
      if (onSuccess) onSuccess();
      closeTab(tabId);
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 pt-4 pb-2 border-b border-primary-50 shrink-0">
        <button onClick={() => closeTab(tabId)} className="p-1.5 rounded-lg hover:bg-warm-50 text-dark-400"><ArrowLeft className="w-4 h-4" /></button>
        <div><h2 className="text-lg font-bold text-dark-500">Pembelian Baru</h2><p className="text-xs text-dark-300">Form input transaksi pembelian</p></div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4 max-w-3xl">
          <div>
            <label className="block text-xs font-semibold text-dark-400 mb-1">Supplier</label>
            <SearchableSelect value={supplier?.idsupplier || ''} onChange={(val) => { const s = suppliers.find(s => s.idsupplier === parseInt(val)); setSupplier(s || null); }}
              options={suppliers.map(s => ({ value: s.idsupplier, label: `${s.namasupplier} (${s.kodesupplier})` }))} placeholder="Pilih supplier..." />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={usePpn} onChange={(e) => setUsePpn(e.target.checked)} className="w-4 h-4 rounded accent-primary-500" />
              <span className="text-xs font-semibold text-dark-400">Pakai PPN ({user?.ppn || 11}%)</span>
            </label>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
            <input value={searchCart} onChange={e => setSearchCart(e.target.value.toUpperCase())} placeholder="Cari barang..."
              className="input-upper w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          {barang.length > 0 && (
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto scrollbar-thin">
              {barang.map(b => (
                <button key={b.idbarang} onClick={() => addToCart(b)} className="text-left p-2.5 rounded-xl border border-primary-50 bg-warm-50/50 hover:bg-primary-50 text-xs">
                  <p className="font-semibold text-dark-500 truncate">{b.namabarang}</p><p className="text-dark-300">{formatRupiah(b.hargabeli_terbaru)}</p>
                </button>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {cart.map(c => (
              <div key={c.idbarang} className="flex items-center gap-3 p-3 rounded-xl bg-warm-50/50">
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-dark-500">{c.namabarang}</p><p className="text-xs text-dark-300">{c.satuankecil}</p></div>
                <input type="number" value={c.jml} onChange={(e) => setCart(cart.map(i => i.idbarang === c.idbarang ? { ...i, jml: parseInt(e.target.value) || 1 } : i))} className="w-20 px-2 py-1.5 rounded-lg border border-primary-100 text-sm text-center" />
                <input type="number" value={c.harga} onChange={(e) => setCart(cart.map(i => i.idbarang === c.idbarang ? { ...i, harga: parseFloat(e.target.value) || 0 } : i))} className="w-32 px-2 py-1.5 rounded-lg border border-primary-100 text-sm text-right" />
                <p className="text-sm font-semibold text-dark-500 w-32 text-right">{formatRupiah(c.harga * c.jml)}</p>
                <button onClick={() => setCart(cart.filter(i => i.idbarang !== c.idbarang))} className="text-dark-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="border-t border-primary-100 pt-4 flex items-center justify-between">
            <div><p className="text-xs text-dark-300">Total ({cart.length} item)</p><p className="text-xl font-bold text-accent-600">{formatRupiah(grandTotal)}</p></div>
            <button onClick={handleSubmit} disabled={loading || cart.length === 0} className="px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan Pembelian'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
