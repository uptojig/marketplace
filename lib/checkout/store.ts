"use client";

// Ephemeral checkout step state — uses sessionStorage so it dies with
// the tab, not the browser. The cart store is the persistent half.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PaymentMethod } from "./types";

interface CheckoutState {
  selectedAddressId: string | null;
  shippingByStore: Record<string, string>;
  notesByStore: Record<string, string>;
  selectedPaymentMethod: PaymentMethod | null;
  platformCoupon: string | null;

  setAddress: (id: string | null) => void;
  setShipping: (storeId: string, optionId: string) => void;
  setNote: (storeId: string, note: string) => void;
  setPayment: (method: PaymentMethod | null) => void;
  setPlatformCoupon: (code: string | null) => void;
  reset: () => void;
}

const initial = {
  selectedAddressId: null,
  shippingByStore: {},
  notesByStore: {},
  selectedPaymentMethod: null,
  platformCoupon: null,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...initial,
      setAddress: (id) => set({ selectedAddressId: id }),
      setShipping: (storeId, optionId) =>
        set((s) => ({
          shippingByStore: { ...s.shippingByStore, [storeId]: optionId },
        })),
      setNote: (storeId, note) =>
        set((s) => ({
          notesByStore: { ...s.notesByStore, [storeId]: note },
        })),
      setPayment: (method) => set({ selectedPaymentMethod: method }),
      setPlatformCoupon: (code) => set({ platformCoupon: code }),
      reset: () => set(initial),
    }),
    {
      name: "basketplace-checkout",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? sessionStorage
          : (undefined as unknown as Storage),
      ),
    },
  ),
);
