"use client";

import { create } from "zustand";

interface CartConfirmState {
  open: boolean;
  productTitle: string | null;
  // Slug of the store the just-added product belongs to. The modal
  // uses it to link "สั่งซื้อสินค้าในตะกร้า" to /stores/<slug>/cart
  // so the user stays inside that store's themed layout instead of
  // bouncing out to the marketplace-level /cart (which loses the
  // design family color cascade and the storefront chrome).
  storeSlug: string | null;
  show: (title: string, storeSlug?: string) => void;
  hide: () => void;
}

export const useCartConfirmation = create<CartConfirmState>((set) => ({
  open: false,
  productTitle: null,
  storeSlug: null,
  show: (title, storeSlug) =>
    set({ open: true, productTitle: title, storeSlug: storeSlug ?? null }),
  hide: () => set({ open: false }),
}));
