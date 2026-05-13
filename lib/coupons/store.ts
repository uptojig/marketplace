"use client";

// Client-side claimed-coupons wallet, persisted to localStorage. Purely
// a UX layer — server enforcement happens at order placement via
// validateCouponServer. The persist key is namespaced so multiple stores
// per browser stay independent.

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserCouponsState {
  claimedCouponIds: string[];
  claim: (couponId: string) => void;
  unclaim: (couponId: string) => void;
  hasClaimed: (couponId: string) => boolean;
}

export const useUserCouponsStore = create<UserCouponsState>()(
  persist(
    (set, get) => ({
      claimedCouponIds: [],
      claim: (id) =>
        set((s) =>
          s.claimedCouponIds.includes(id)
            ? s
            : { claimedCouponIds: [...s.claimedCouponIds, id] },
        ),
      unclaim: (id) =>
        set((s) => ({
          claimedCouponIds: s.claimedCouponIds.filter((x) => x !== id),
        })),
      hasClaimed: (id) => get().claimedCouponIds.includes(id),
    }),
    { name: "basketplace-coupons" },
  ),
);
