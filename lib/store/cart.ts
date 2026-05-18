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
  // `_storeSlug` accepted for theme call-sites that target per-store cart
  // scoping. It's currently a no-op on this single-cart implementation —
  // operations apply to the only cart. Kept in the signature so themes
  // built against the per-store API type-check.
  setQty: (productId: string, qty: number, _storeSlug?: string) => void;
  remove: (productId: string, _storeSlug?: string) => void;
  clear: (_storeSlug?: string) => void;
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
      setQty: (productId, qty, _storeSlug) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((l) => l.productId !== productId) });
          return;
        }
        set({ lines: get().lines.map((l) => (l.productId === productId ? { ...l, qty } : l)) });
      },
      remove: (productId, _storeSlug) => set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      clear: (_storeSlug) => set({ lines: [] }),
      subtotalTHB: () => get().lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0),
      count: () => get().lines.reduce((acc, l) => acc + l.qty, 0),
    }),
    { name: "marketplace-cart" },
  ),
);
