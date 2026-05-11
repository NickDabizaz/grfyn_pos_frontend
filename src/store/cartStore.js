import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useCartStore = create(
  devtools((set) => ({
    items: [],
    customer: null,
    addItem: (item) => set((state) => {
      const existing = state.items.find((i) => i.idbarang === item.idbarang);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.idbarang === item.idbarang ? { ...i, jml: i.jml + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, jml: 1 }] };
    }, false, 'cart/addItem'),
    removeItem: (idbarang) => set((state) => ({
      items: state.items.filter((i) => i.idbarang !== idbarang),
    }), false, 'cart/removeItem'),
    updateQty: (idbarang, jml) => set((state) => ({
      items: state.items.map((i) =>
        i.idbarang === idbarang ? { ...i, jml: Math.max(1, jml) } : i
      ),
    }), false, 'cart/updateQty'),
    setCustomer: (customer) => set({ customer }, false, 'cart/setCustomer'),
    clearCart: () => set({ items: [], customer: null }, false, 'cart/clearCart'),
  }))
);
