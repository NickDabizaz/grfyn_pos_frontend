import { lazy } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, ShoppingBag, Warehouse,
  ReceiptText, Coins, FileBarChart, Settings, UserCog, MapPin,
  ClipboardList, Calculator, Undo2, Repeat, Wallet, Factory,
} from 'lucide-react';

// ── Lazy-loaded page components ───────────────────────────────────────────────
// Each component is only bundled/loaded when its tab is first opened.
const Dashboard          = lazy(() => import('../pages/Dashboard'));
const PosLayout          = lazy(() => import('../pages/pos/PosLayout'));
const Barang             = lazy(() => import('../pages/Barang'));
const Supplier           = lazy(() => import('../pages/Supplier'));
const Customer           = lazy(() => import('../pages/Customer'));
const Akun               = lazy(() => import('../pages/Akun'));
const User               = lazy(() => import('../pages/User'));
const Lokasi             = lazy(() => import('../pages/Lokasi'));
const Pembelian          = lazy(() => import('../pages/Pembelian'));
const PurchaseOrder      = lazy(() => import('../pages/pembelian/PurchaseOrder'));
const GRN                = lazy(() => import('../pages/pembelian/GRN'));
const Penjualan          = lazy(() => import('../pages/Penjualan'));
const ReturJual          = lazy(() => import('../pages/ReturJual'));
const ReturBeli          = lazy(() => import('../pages/ReturBeli'));
const TukarBarang        = lazy(() => import('../pages/TukarBarang'));
const Kas                = lazy(() => import('../pages/Kas'));
const Setting            = lazy(() => import('../pages/Setting'));
const SaldoAwalStok      = lazy(() => import('../pages/stok/SaldoAwalStok'));
const PenyesuaianStok    = lazy(() => import('../pages/stok/PenyesuaianStok'));
const HitungHPP          = lazy(() => import('../pages/stok/HitungHPP'));
const TransferStok       = lazy(() => import('../pages/stok/TransferStok'));
const StockOpname        = lazy(() => import('../pages/stok/StockOpname'));
const LaporanPenjualan   = lazy(() => import('../pages/laporan/LaporanPenjualan'));
const LaporanPembelian   = lazy(() => import('../pages/laporan/LaporanPembelian'));
const LaporanMasterBarang = lazy(() => import('../pages/laporan/LaporanMasterBarang'));
const LaporanStokSekarang = lazy(() => import('../pages/laporan/LaporanStokSekarang'));
const LaporanStokKartuStok = lazy(() => import('../pages/laporan/LaporanStokKartuStok'));
const LaporanBarang      = lazy(() => import('../pages/laporan/LaporanBarang'));
const PelunasanPiutang   = lazy(() => import('../pages/keuangan/PelunasanPiutang'));
const PelunasanHutang    = lazy(() => import('../pages/keuangan/PelunasanHutang'));
const Produksi           = lazy(() => import('../pages/Produksi'));
const Karyawan           = lazy(() => import('../pages/sdm/Karyawan'));
const Absensi            = lazy(() => import('../pages/sdm/Absensi'));
const Payroll            = lazy(() => import('../pages/sdm/Payroll'));

const KartuStokPlaceholder = () => (
  <div className="p-6">
    <h2 className="text-lg font-bold text-dark-500 mb-4">Kartu Stok</h2>
    <p className="text-dark-300 text-sm">Halaman Kartu Stok akan diimplementasikan.</p>
  </div>
);

const registry = {
  'dashboard': {
    component: Dashboard,
    label    : 'Dashboard',
    icon     : LayoutDashboard,
    closable : false,
  },
  'pos': { component: PosLayout, label: 'POS', icon: ShoppingCart },
  'master.barang'   : { component: Barang,    label: 'Barang',    icon: Package },
  'master.supplier' : { component: Supplier,  label: 'Supplier' },
  'master.customer' : { component: Customer,  label: 'Customer' },
  'master.akun'     : { component: Akun,      label: 'Akun' },
  'master.user'     : { component: User,      label: 'User',     icon: UserCog },
  'master.lokasi'   : { component: Lokasi,    label: 'Lokasi',   icon: MapPin },
  'pembelian'       : { component: Pembelian, label: 'Pembelian', icon: ShoppingBag },
  'pembelian.transaksi': { component: Pembelian, label: 'Transaksi Beli', icon: ShoppingBag },
  'pembelian.po'    : { component: PurchaseOrder, label: 'Purchase Order', icon: ShoppingBag },
  'pembelian.grn'   : { component: GRN, label: 'Good Receipt Note', icon: ShoppingBag },
  'pembelian.retur' : { component: ReturBeli, label: 'Retur Pembelian', icon: Undo2 },
  'penjualan'       : { component: Penjualan, label: 'Penjualan', icon: ReceiptText },
  'penjualan.transaksi'  : { component: Penjualan,  label: 'Transaksi Jual',   icon: ReceiptText },
  'penjualan.retur'      : { component: ReturJual,  label: 'Retur Penjualan',  icon: Undo2 },
  'penjualan.tukarbarang': { component: TukarBarang, label: 'Tukar Barang',    icon: Repeat },
  'stok.saldoawal'   : { component: SaldoAwalStok,   label: 'Saldo Awal Stok' },
  'stok.penyesuaian' : { component: PenyesuaianStok, label: 'Penyesuaian Stok' },
  'stok.hitunghpp'   : { component: HitungHPP,       label: 'Hitung HPP',   icon: Calculator },
  'stok.transferstok': { component: TransferStok,    label: 'Transfer Stok' },
  'stok.stockopname' : { component: StockOpname,     label: 'Stock Opname' },
  'stok.produksi'    : { component: Produksi,        label: 'Produksi',     icon: Factory },
  'stok.kartustok'   : { component: KartuStokPlaceholder, label: 'Kartu Stok', icon: ClipboardList },
  'kas'              : { component: Kas, label: 'Kas', icon: Coins },
  'keuangan.kas'     : { component: Kas, label: 'Kas', icon: Coins },
  'keuangan.pelunasanpiutang': { component: PelunasanPiutang, label: 'Pelunasan Piutang', icon: Wallet },
  'keuangan.pelunasanhutang' : { component: PelunasanHutang,  label: 'Pelunasan Hutang',  icon: Wallet },
  'laporan.penjualan'   : { component: LaporanPenjualan,    label: 'Laporan Penjualan' },
  'laporan.pembelian'   : { component: LaporanPembelian,    label: 'Laporan Pembelian' },
  'laporan.barang'      : { component: LaporanBarang,       label: 'Laporan Barang' },
  'laporan.stoksekarang': { component: LaporanStokSekarang, label: 'Stok Sekarang' },
  'laporan.kartustok'   : { component: LaporanStokKartuStok, label: 'Kartu Stok' },
  'laporan.neracasaldo' : { component: LaporanPenjualan,    label: 'Neraca Saldo' },
  'laporan.labarugi'    : { component: LaporanPenjualan,    label: 'Laba Rugi' },
  'laporan.neraca'      : { component: LaporanPenjualan,    label: 'Neraca' },
  'laporan.bukubesar'   : { component: LaporanPenjualan,    label: 'Buku Besar' },
  'laporan.closing'     : { component: LaporanPenjualan,    label: 'Closing Periode' },
  'sdm'                 : { component: Karyawan, label: 'HR' },
  'sdm.karyawan'        : { component: Karyawan, label: 'Data Karyawan' },
  'sdm.absensi'         : { component: Absensi, label: 'Absensi' },
  'sdm.payroll'         : { component: Payroll, label: 'Payroll' },
  'setting'             : { component: Setting, label: 'Setting', icon: Settings },
};

export function getPage(kodemenu) {
  return registry[kodemenu] || null;
}

export function openPageFromSidebar(kodemenu, openOrFocus) {
  const page = getPage(kodemenu);
  if (!page) return null;

  return openOrFocus({
    kodemenu,
    label    : page.label,
    icon     : page.icon || null,
    component: page.component,
    type     : 'list',
    closable : page.closable !== false,
  });
}

export const DASHBOARD_KODE = 'dashboard';
