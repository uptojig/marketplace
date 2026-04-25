"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLineDisplay {
  productId: string;
  title: string;
  imageUrl?: string;
  priceTHB: number;
  storeSlug: string;
  storeName: string;
  qty: number;
}

interface CartState {
  lines: CartLineDisplay[];
  add: (line: Omit<CartLineDisplay, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  subtotalTHB: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, qty = 1) => {
        const existing = get().lines.find((l) => l.productId === line.productId);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.productId === line.productId ? { ...l, qty: l.qty + qty } : l,
            ),
          });
        } else {
          set({ lines: [...get().lines, { ...line, qty }] });
        }
      },
      setQty: (productId, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((l) => l.productId !== productId) });
          return;
        }
        set({ lines: get().lines.map((l) => (l.productId === productId ? { ...l, qty } : l)) });
      },
      remove: (productId) => set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      clear: () => set({ lines: [] }),
      subtotalTHB: () => get().lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0),
      count: () => get().lines.reduce((acc, l) => acc + l.qty, 0),
    }),
    { name: "marketplace-cart" },
  ),
);
