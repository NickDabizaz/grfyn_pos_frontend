import { Plus, Trash2 } from 'lucide-react';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { formatRupiah } from '../../lib/utils';

const normalizePembayaran = (rows = []) =>
  rows.map((row) => ({
    idakun: row.idakun || '',
    amount: row.amount === undefined || row.amount === null ? '' : String(row.amount),
  }));

export { normalizePembayaran };

export default function DetailJurnalPembayaran({
  rows,
  setRows,
  akunList,
  totalBayar,
  disabled = false,
}) {
  const totalPembayaran = rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
  const selisih = totalPembayaran - totalBayar;
  const isBalanced = Math.abs(selisih) < 0.01;

  const updateRow = (index, field, value) => {
    setRows(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setRows([...rows, { idakun: '', amount: '' }]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

  return (
    <div className="bg-white rounded-2xl border border-primary-50 overflow-visible">
      <div className="px-5 py-3 border-b border-primary-50 bg-warm-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider">Detail Jurnal (Pembayaran)</h3>
          <p className="text-[11px] text-dark-300 mt-0.5">Opsional; kosongkan untuk memakai akun kas/bank default.</p>
        </div>
        <div className={`text-xs font-bold ${rows.length === 0 || isBalanced ? 'text-emerald-600' : 'text-red-500'}`}>
          {rows.length === 0 ? 'Default' : `Selisih ${formatRupiah(selisih)}`}
        </div>
      </div>
      <div className="p-5 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary-100 bg-warm-50/30 px-4 py-5 text-center text-xs text-dark-300">
            Belum ada detail jurnal pembayaran
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_180px_36px] gap-2 items-end">
                <div>
                  <label className="block text-[10px] font-semibold text-dark-300 mb-1">Akun Pembayaran</label>
                  <SearchableSelect
                    value={row.idakun}
                    onChange={(val) => updateRow(index, 'idakun', val)}
                    options={akunList.map((akun) => ({ value: akun.idakun, label: `${akun.kodeakun} - ${akun.namaakun}` }))}
                    placeholder="Pilih akun"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-dark-300 mb-1">Nominal</label>
                  <input
                    type="number"
                    min="0"
                    value={row.amount}
                    onChange={(e) => updateRow(index, 'amount', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-gray-50 disabled:text-dark-300"
                    placeholder="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={disabled}
                  className="h-[42px] p-2 rounded-xl hover:bg-red-50 text-dark-300 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={addRow}
            disabled={disabled}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-600 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Baris Pembayaran
          </button>
          {rows.length > 0 && (
            <div className="text-right">
              <div className="text-[10px] text-dark-300">Total Detail Jurnal</div>
              <div className="text-sm font-bold font-mono text-dark-500">{formatRupiah(totalPembayaran)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
