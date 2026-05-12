'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './types';

interface CartState {
  items: CartItem[];
  selectedIds: string[];
  /** Applied coupon IDs — actual amounts resolved at render via calculator */
  appliedCouponIds: string[];

  // Item ops
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;

  // Selection ops
  toggleSelected: (id: string) => void;
  selectAllInStore: (storeId: string) => void;
  deselectAllInStore: (storeId: string) => void;

  // Coupon ops
  applyCoupon: (couponId: string) => void;
  removeCoupon: (couponId: string) => void;
  clearCoupons: () => void;

  // Bulk ops
  clearCart: () => void;
  removeSelected: () => void;

  // Selectors
  getItemsByStore: () => Map<string, CartItem[]>;
  getSelectedItems: () => CartItem[];
  getSelectedSubtotal: () => number;
  getStoresWithSelected: () => string[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedIds: [],
      appliedCouponIds: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id ? { ...i, qty: i.qty + item.qty } : i,
              ),
              selectedIds: state.selectedIds.includes(existing.id)
                ? state.selectedIds
                : [...state.selectedIds, existing.id],
            };
          }
          const id =
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          return {
            items: [...state.items, { ...item, id }],
            selectedIds: [...state.selectedIds, id],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        })),

      updateQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
        })),

      toggleSelected: (id) =>
        set((state) =>
          state.selectedIds.includes(id)
            ? { selectedIds: state.selectedIds.filter((sid) => sid !== id) }
            : { selectedIds: [...state.selectedIds, id] },
        ),

      selectAllInStore: (storeId) =>
        set((state) => {
          const ids = state.items.filter((i) => i.storeId === storeId).map((i) => i.id);
          return { selectedIds: Array.from(new Set([...state.selectedIds, ...ids])) };
        }),

      deselectAllInStore: (storeId) =>
        set((state) => {
          const drop = new Set(
            state.items.filter((i) => i.storeId === storeId).map((i) => i.id),
          );
          return { selectedIds: state.selectedIds.filter((sid) => !drop.has(sid)) };
        }),

      applyCoupon: (couponId) =>
        set((state) =>
          state.appliedCouponIds.includes(couponId)
            ? state
            : { appliedCouponIds: [...state.appliedCouponIds, couponId] },
        ),

      removeCoupon: (couponId) =>
        set((state) => ({
          appliedCouponIds: state.appliedCouponIds.filter((id) => id !== couponId),
        })),

      clearCoupons: () => set({ appliedCouponIds: [] }),

      clearCart: () => set({ items: [], selectedIds: [], appliedCouponIds: [] }),

      removeSelected: () =>
        set((state) => ({
          items: state.items.filter((i) => !state.selectedIds.includes(i.id)),
          selectedIds: [],
          appliedCouponIds: [],
        })),

      getItemsByStore: () => {
        const map = new Map<string, CartItem[]>();
        for (const item of get().items) {
          const list = map.get(item.storeId) ?? [];
          list.push(item);
          map.set(item.storeId, list);
        }
        return map;
      },

      getSelectedItems: () => {
        const ids = new Set(get().selectedIds);
        return get().items.filter((i) => ids.has(i.id));
      },

      getSelectedSubtotal: () =>
        get()
          .getSelectedItems()
          .reduce((sum, i) => sum + i.price * i.qty, 0),

      getStoresWithSelected: () =>
        Array.from(new Set(get().getSelectedItems().map((i) => i.storeId))),
    }),
    {
      name: 'basketplace-cart',
      version: 2,
    },
  ),
);
