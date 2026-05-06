import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { formatRupiah } from '../lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, Trash2, User, Minus, Plus } from 'lucide-react';
import SearchableSelect from '../components/ui/SearchableSelect';
import useTabStore from '../store/tabStore';

export default function PenjualanForm({ onSuccess, tabId }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [usePpn, setUsePpn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [metodbayar, setMetodbayar] = useState('TUNAI');
  const user = useAuthStore((s) => s.user);
  const closeTab = useTabStore((s) => s.closeTab);

  useEffect(() => { api.get('/customer').then(r => setCustomers(r.data)); }, []);
  useEffect(() => {
    if (!search) { setProducts([]); return; }
    const t = setTimeout(() => { api.get(`/barang?search=${encodeURIComponent(search)}`).then(r => setProducts(r.data)); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const addToCart = (p) => {
    const exists = cart.find(c => c.idbarang === p.idbarang);
    if (exists) { setCart(cart.map(c => c.idbarang === p.idbarang ? { ...c, jml: c.jml + 1 } : c)); }
    else { setCart([...cart, { ...p, jml: 1, harga: parseFloat(p.hargajual_terbaru || 0), diskon: 0 }]); }
    setSearch(''); setProducts([]);
  };

  const updateCartItem = (idx, field, val) => {
    setCart(cart.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  };

  const grandTotal = cart.reduce((sum, c) => {
    const ppn = usePpn ? (c.harga * c.jml * (user?.ppn || 11)) / 100 : 0;
    const diskon = c.diskon ? (c.harga * c.jml * c.diskon) / 100 : 0;
    return sum + (c.harga * c.jml) + ppn - diskon;
  }, 0);

  const handleSubmit = async () => {
    if (!cart.length) return toast.error('Keranjang kosong');
    setLoading(true);
    try {
      await api.post('/jual', {
        idcustomer: customer?.idcustomer || null, bayar: grandTotal,
        jenis: 'JUAL', metodbayar,
        useppn: usePpn,
        items: cart.map(c => ({ idbarang: c.idbarang, jml: c.jml, harga: c.harga, diskon: c.diskon || 0 })),
      });
      toast.success('Penjualan berhasil!');
      if (onSuccess) onSuccess();
      closeTab(tabId);
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 pt-4 pb-2 border-b border-primary-50 shrink-0">
        <button onClick={() => closeTab(tabId)} className="p-1.5 rounded-lg hover:bg-warm-50 text-dark-400"><ArrowLeft className="w-4 h-4" /></button>
        <div><h2 className="text-lg font-bold text-dark-500">Penjualan Baru</h2><p className="text-xs text-dark-300">Form input transaksi penjualan</p></div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4 max-w-3xl">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-dark-400 mb-1">Customer</label>
              <SearchableSelect value={customer?.idcustomer || ''} onChange={(val) => { const c = customers.find(c => c.idcustomer === parseInt(val)); setCustomer(c || null); }}
                options={customers.map(c => ({ value: c.idcustomer, label: `${c.namacustomer} (${c.kodecustomer})` }))} placeholder="Pilih customer..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-400 mb-1">Metode Bayar</label>
              <SearchableSelect value={metodbayar} onChange={setMetodbayar} options={[{ value: 'TUNAI', label: 'TUNAI' }, { value: 'NON TUNAI', label: 'NON TUNAI' }]} />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={usePpn} onChange={(e) => setUsePpn(e.target.checked)} className="w-4 h-4 rounded accent-primary-500" />
              <span className="text-xs font-semibold text-dark-400">Pakai PPN ({user?.ppn || 11}%)</span>
            </label>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
            <input value={search} onChange={e => setSearch(e.target.value.toUpperCase())} placeholder="Cari barang..."
              className="input-upper w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          {products.length > 0 && (
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto scrollbar-thin">
              {products.map(p => (
                <button key={p.idbarang} onClick={() => addToCart(p)} className="text-left p-2.5 rounded-xl border border-primary-50 bg-warm-50/50 hover:bg-primary-50 text-xs">
                  <p className="font-semibold text-dark-500 truncate">{p.namabarang}</p><p className="text-dark-300">{formatRupiah(p.hargajual_terbaru)}</p>
                </button>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {cart.map((c, idx) => (
              <div key={c.idbarang} className="flex items-center gap-3 p-3 rounded-xl bg-warm-50/50">
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-dark-500">{c.namabarang}</p><p className="text-xs text-dark-300">{c.satuankecil}</p></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateCartItem(idx, 'jml', Math.max(1, c.jml - 1))} className="p-1 rounded hover:bg-warm-100"><Minus className="w-3 h-3" /></button>
                  <input type="number" value={c.jml} onChange={(e) => updateCartItem(idx, 'jml', parseInt(e.target.value) || 1)} className="w-16 px-2 py-1.5 rounded-lg border border-primary-100 text-sm text-center" />
                  <button onClick={() => updateCartItem(idx, 'jml', c.jml + 1)} className="p-1 rounded hover:bg-warm-100"><Plus className="w-3 h-3" /></button>
                </div>
                <input type="number" value={c.harga} onChange={(e) => updateCartItem(idx, 'harga', parseFloat(e.target.value) || 0)} className="w-32 px-2 py-1.5 rounded-lg border border-primary-100 text-sm text-right" />
                <input type="number" value={c.diskon || 0} onChange={(e) => updateCartItem(idx, 'diskon', parseFloat(e.target.value) || 0)} placeholder="Diskon %" className="w-16 px-2 py-1.5 rounded-lg border border-primary-100 text-xs text-center" />
                <p className="text-sm font-semibold text-dark-500 w-28 text-right">{formatRupiah(c.harga * c.jml)}</p>
                <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-dark-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="border-t border-primary-100 pt-4 flex items-center justify-between">
            <div><p className="text-xs text-dark-300">Total ({cart.length} item)</p><p className="text-xl font-bold text-accent-600">{formatRupiah(grandTotal)}</p></div>
            <button onClick={handleSubmit} disabled={loading || cart.length === 0} className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan Penjualan'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
