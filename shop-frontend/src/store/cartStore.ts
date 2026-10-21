import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

export interface CartItem {
  product: Product;
  qty: number;
}

interface CartState {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const MAX_QTY = 99;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (p, qty = 1) =>
        set((s) => {
          const found = s.items.find((i) => i.product.id === p.id);
          return {
            items: found
              ? s.items.map((i) =>
                  i.product.id === p.id ? { ...i, qty: Math.min(i.qty + qty, MAX_QTY) } : i
                )
              : [...s.items, { product: p, qty }],
          };
        }),

      setQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.product.id !== id)
              : s.items.map((i) =>
                  i.product.id === id ? { ...i, qty: Math.min(qty, MAX_QTY) } : i
                ),
        })),

      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),

      clear: () => set({ items: [] }),
    }),
    { name: "pema-cart-v2" } 
  )
);

// Helpers
export const selectCount = (s: { items: CartItem[] }) =>
  s.items.reduce((n, i) => n + i.qty, 0);

export const selectSubtotal = (s: { items: CartItem[] }) =>
  s.items.reduce((n, i) => n + i.product.price * i.qty, 0);

export const selectSavings = (s: { items: CartItem[] }) =>
  s.items.reduce(
    (n, i) => n + ((i.product.compareAtPrice ?? i.product.price) - i.product.price) * i.qty,
    0
  );