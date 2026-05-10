import { useState, useEffect } from 'react';
import { Search, Check } from 'lucide-react';

export default function MultiSelectModal({
  title,
  fetchItems,
  onConfirm,
  onClose,
  initialSelected,
  idField,
  labelField,
  subField,
  searchPlaceholder,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set((initialSelected || []).map(it => it[idField])));

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchItems(search)
        .then((data) => {
          setItems(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const result = items.filter((it) => selected.has(it[idField]));
    onConfirm(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-primary-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-dark-500">{title}</h3>
          <span className="text-[10px] font-medium text-dark-300 bg-warm-100 px-2.5 py-1 rounded-full">
            {selected.size} dipilih
          </span>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder || 'Cari...'}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-0.5">
            {loading && (
              <p className="text-sm text-dark-300 text-center py-6">Memuat...</p>
            )}
            {!loading && items.length === 0 && (
              <p className="text-sm text-dark-300 text-center py-6">Tidak ada data</p>
            )}
            {!loading &&
              items.map((item) => {
                const id = item[idField];
                const isChecked = selected.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      isChecked ? 'bg-primary-50' : 'hover:bg-warm-50'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-primary-500 border-primary-500'
                          : 'border-primary-200'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-500 truncate">
                        {item[labelField]}
                      </p>
                      {subField && (
                        <p className="text-xs text-dark-300 truncate">{item[subField]}</p>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
        <div className="px-5 py-3 border-t border-primary-50 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-primary-100 text-sm font-semibold text-dark-400 hover:bg-warm-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors"
          >
            Pilih ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}
