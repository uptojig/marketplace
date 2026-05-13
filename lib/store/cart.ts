"use client";

// Shared client-side cart store, persisted to one localStorage key.
//
// PER-STORE SCOPE (Shopify-like architecture)
// --------------------------------------------
// Basketplace is not a marketplace — each store is its own standalone
// shop with its own customers and its own cart. A customer who is
// shopping at bikini551 must not see audio-house-bkk's cart items, and
// vice versa.
//
// The actual `lines` array still lives in one localStorage key
// ("marketplace-cart") because every `CartLineDisplay` carries its own
// `storeSlug` — so we can isolate views by filtering at read time.
// Consumers that render cart UI for one store should always use the
// `*ForStore(slug)` selectors below. The legacy un-scoped selectors
// (`lines`, `subtotalTHB()`, `count()`) are kept for backward compat
// with admin/debug surfaces; they return cross-store totals and must
// NOT be used in any buyer-facing per-store view.

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
  /** All cart lines across every store the customer has touched on this
   *  browser. Per-store views filter on `storeSlug`. */
  lines: CartLineDisplay[];

  add: (line: Omit<CartLineDisplay, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;

  /** Drop all lines belonging to one store (e.g. after that store's
   *  checkout completes). */
  clearStore: (storeSlug: string) => void;
  /** Drop every line on this browser. Mainly for sign-out / dev reset. */
  clear: () => void;

  // ── Per-store views (USE THESE in buyer-facing UI) ────────────────
  linesForStore: (storeSlug: string) => CartLineDisplay[];
  subtotalForStore: (storeSlug: string) => number;
  countForStore: (storeSlug: string) => number;

  // ── Cross-store views (DEPRECATED — admin/debug only) ─────────────
  /** @deprecated cross-store sum — use subtotalForStore(slug) in buyer UI */
  subtotalTHB: () => number;
  /** @deprecated cross-store count — use countForStore(slug) in buyer UI */
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, qty = 1) => {
        // Dedupe by (productId, storeSlug) — same product carried by two
        // different stores must show up as separate lines.
        const existing = get().lines.find(
          (l) => l.productId === line.productId && l.storeSlug === line.storeSlug,
        );
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.productId === line.productId && l.storeSlug === line.storeSlug
                ? { ...l, qty: l.qty + qty }
                : l,
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
        set({
          lines: get().lines.map((l) =>
            l.productId === productId ? { ...l, qty } : l,
          ),
        });
      },
      remove: (productId) =>
        set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      clearStore: (storeSlug) =>
        set({ lines: get().lines.filter((l) => l.storeSlug !== storeSlug) }),
      clear: () => set({ lines: [] }),

      linesForStore: (storeSlug) =>
        get().lines.filter((l) => l.storeSlug === storeSlug),
      subtotalForStore: (storeSlug) =>
        get()
          .lines.filter((l) => l.storeSlug === storeSlug)
          .reduce((acc, l) => acc + l.priceTHB * l.qty, 0),
      countForStore: (storeSlug) =>
        get()
          .lines.filter((l) => l.storeSlug === storeSlug)
          .reduce((acc, l) => acc + l.qty, 0),

      subtotalTHB: () => get().lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0),
      count: () => get().lines.reduce((acc, l) => acc + l.qty, 0),
    }),
    { name: "marketplace-cart" },
  ),
);
