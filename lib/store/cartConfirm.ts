"use client";

import { create } from "zustand";

interface CartConfirmState {
  open: boolean;
  productTitle: string | null;
  show: (title: string) => void;
  hide: () => void;
}

export const useCartConfirmation = create<CartConfirmState>((set) => ({
  open: false,
  productTitle: null,
  show: (title) => set({ open: true, productTitle: title }),
  hide: () => set({ open: false }),
}));
