import { create } from 'zustand';

let tabIdCounter = 0;

const useTabStore = create((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (config) => {
    const id = ++tabIdCounter;
    const tab = {
      id,
      label    : config.label || 'Untitled',
      icon     : config.icon || null,
      component: config.component,
      props    : config.props || {},
      type     : config.type || 'list',
      kodemenu : config.kodemenu || null,
      state    : {},
      dirty    : false,
      closable : config.closable !== false,
    };

    set(state => ({
      tabs: [...state.tabs, tab],
      activeTabId: id,
    }));

    return id;
  },

  openOrFocusTab: (config) => {
    const existing = get().tabs.find(t => t.kodemenu && t.kodemenu === config.kodemenu);
    if (existing) {
      get().setActiveTab(existing.id);
      return existing.id;
    }
    return get().openTab(config);
  },

  closeTab: (id) => {
    const tab = get().tabs.find(t => t.id === id);
    if (tab && !tab.closable) return;

    set(state => {
      const idx       = state.tabs.findIndex(t => t.id === id);
      const newTabs   = state.tabs.filter(t => t.id !== id);
      let   newActive = state.activeTabId;
      if (state.activeTabId === id) {
        if   (idx >= newTabs.length) newActive = newTabs[newTabs.length - 1]?.id || null;
        else newActive                         = newTabs[idx]?.id || null;
      }
      return { tabs: newTabs, activeTabId: newActive };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateTabState: (id, partialState) => {
    set(state => ({
      tabs: state.tabs.map(t =>
        t.id === id ? { ...t, state: { ...t.state, ...partialState } } : t
      ),
    }));
  },

  setTabDirty: (id, dirty) => {
    set(state => ({
      tabs: state.tabs.map(t => (t.id === id ? { ...t, dirty } : t)),
    }));
  },

  closeAllTabs: () => set(state => {
    const keepTabs = state.tabs.filter(t => !t.closable);
    const active   = keepTabs.length > 0 ? keepTabs[0].id : null;
    return { tabs: keepTabs, activeTabId: active };
  }),
}));

export default useTabStore;
