import { useState, useEffect, useRef } from 'react';
import useTabStore from '../store/tabStore';
import { X } from 'lucide-react';

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabStore();
  const [contextMenu, setContextMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = () => setContextMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleContextMenu = (e, tab) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tab });
  };

  const closeToRight = (tabId) => {
    const idx = tabs.findIndex(t => t.id === tabId);
    tabs.slice(idx + 1).forEach(t => { if (t.closable) closeTab(t.id); });
  };

  const closeAll = () => {
    tabs.forEach(t => closeTab(t.id));
  };

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center bg-white border-b border-primary-100 overflow-x-auto scrollbar-thin shrink-0">
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab)}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium cursor-pointer border-b-2 transition-colors shrink-0 select-none
              ${isActive
                ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                : 'border-transparent text-dark-400 hover:text-dark-600 hover:bg-warm-50'
              }`}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            <span className="max-w-[160px] truncate">{tab.label}</span>
            {tab.dirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
            {tab.closable && (
              <button
                className="ml-1 p-0.5 rounded hover:bg-danger-100 hover:text-danger-500 shrink-0"
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 w-52 bg-white rounded-xl shadow-lg border border-primary-100 py-1.5 text-xs"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.tab.closable && (
            <button
              className="w-full text-left px-3 py-2 hover:bg-warm-50 text-dark-500 font-medium"
              onClick={() => { closeTab(contextMenu.tab.id); setContextMenu(null); }}
            >
              Tutup Tab Ini
            </button>
          )}
          <button
            className="w-full text-left px-3 py-2 hover:bg-warm-50 text-dark-500"
            onClick={() => { closeToRight(contextMenu.tab.id); setContextMenu(null); }}
          >
            Tutup Tab ke Kanan
          </button>
          <div className="border-t border-primary-100 my-1" />
          <button
            className="w-full text-left px-3 py-2 hover:bg-warm-50 text-dark-500"
            onClick={() => { closeAll(); setContextMenu(null); }}
          >
            Tutup Semua Tab
          </button>
        </div>
      )}
    </div>
  );
}
