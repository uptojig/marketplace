// Pure functions for coupon math + validation. No DB access — safe to
// run on the client for UX hints. Server-side authoritative validation
// is in ./server.ts (extends validate() with usage-cap DB checks).
//
// Stacking rules (Shopee-style):
//   - 1 platform coupon (slot: 'platform')
//   - 1 store coupon PER store (slot: 'store')
//   - 1 free-shipping coupon (slot: 'shipping')
// All three slots can stack. Within a slot, only one coupon active.

import type { CartItem } from "@/lib/cart/types";
import type {
  AppliedCoupon,
  Coupon,
  CouponSlot,
  CouponValidationError,
} from "./types";

export interface CalculationInput {
  items: CartItem[];
  coupons: Coupon[];
  shippingPerStore: Record<string, number>;
  paymentMethod?: string;
  isNewUser?: boolean;
  productCategories?: Record<string, string[]>;
}

export interface CalculationResult {
  subtotal: number;
  shippingTotal: number;
  totalDiscount: number;
  appliedCoupons: AppliedCoupon[];
  shippingAfterDiscount: Record<string, number>;
  grandTotal: number;
}

export function calculate(input: CalculationInput): CalculationResult {
  const subtotal = sum(input.items.map((i) => i.price * i.qty));
  const shippingTotal = Object.values(input.shippingPerStore).reduce(
    (a, b) => a + b,
    0,
  );

  const storeSubtotals = new Map<string, number>();
  for (const item of input.items) {
    storeSubtotals.set(
      item.storeId,
      (storeSubtotals.get(item.storeId) ?? 0) + item.price * item.qty,
    );
  }

  const applied: AppliedCoupon[] = [];
  const shippingAfterDiscount: Record<string, number> = {
    ...input.shippingPerStore,
  };

  for (const coupon of input.coupons) {
    const slot = getSlot(coupon);

    if (coupon.discount.kind === "free_shipping") {
      let shippingSaved = 0;
      for (const [storeId, storeSubtotal] of storeSubtotals) {
        const passesMin = !coupon.minSpend || storeSubtotal >= coupon.minSpend;
        if (passesMin) {
          shippingSaved += shippingAfterDiscount[storeId] ?? 0;
          shippingAfterDiscount[storeId] = 0;
        }
      }
      if (shippingSaved > 0) {
        applied.push({
          couponId: coupon.id,
          code: coupon.code,
          slot,
          amount: shippingSaved,
        });
      }
      continue;
    }

    if (coupon.scope.type === "store") {
      const storeId = coupon.scope.storeId;
      const storeSubtotal = storeSubtotals.get(storeId) ?? 0;
      if (storeSubtotal === 0) continue;
      const amount = resolveAmount(coupon.discount, storeSubtotal);
      if (amount > 0) {
        applied.push({
          couponId: coupon.id,
          code: coupon.code,
          slot,
          amount,
          scopedStoreId: storeId,
        });
      }
      continue;
    }

    if (coupon.scope.type === "platform") {
      const amount = resolveAmount(coupon.discount, subtotal);
      if (amount > 0) {
        applied.push({
          couponId: coupon.id,
          code: coupon.code,
          slot,
          amount,
        });
      }
      continue;
    }

    if (coupon.scope.type === "product") {
      const productIds = coupon.scope.productIds;
      const eligibleSubtotal = sum(
        input.items
          .filter((i) => productIds.includes(i.productId))
          .map((i) => i.price * i.qty),
      );
      if (eligibleSubtotal === 0) continue;
      const amount = resolveAmount(coupon.discount, eligibleSubtotal);
      if (amount > 0) {
        applied.push({
          couponId: coupon.id,
          code: coupon.code,
          slot,
          amount,
        });
      }
      continue;
    }

    if (coupon.scope.type === "category") {
      const cats = coupon.scope.categorySlugs;
      const eligibleSubtotal = sum(
        input.items
          .filter((i) =>
            (input.productCategories?.[i.productId] ?? []).some((c) =>
              cats.includes(c),
            ),
          )
          .map((i) => i.price * i.qty),
      );
      if (eligibleSubtotal === 0) continue;
      const amount = resolveAmount(coupon.discount, eligibleSubtotal);
      if (amount > 0) {
        applied.push({
          couponId: coupon.id,
          code: coupon.code,
          slot,
          amount,
        });
      }
    }
  }

  // The free_shipping coupon's `amount` is already part of totalDiscount AND
  // removed from shippingAfterDiscount; we double-subtract if we don't
  // compensate. shippingSaveAlreadyCounted re-adds it once.
  const totalDiscount = sum(applied.map((a) => a.amount));
  const grandTotal = Math.max(
    0,
    subtotal +
      Object.values(shippingAfterDiscount).reduce((a, b) => a + b, 0) -
      totalDiscount +
      shippingSaveAlreadyCounted(applied),
  );

  return {
    subtotal,
    shippingTotal,
    totalDiscount,
    appliedCoupons: applied,
    shippingAfterDiscount,
    grandTotal,
  };
}

export function validate(
  coupon: Coupon,
  input: Omit<CalculationInput, "coupons"> & { existingCoupons: Coupon[] },
): CouponValidationError | null {
  const now = Date.now();
  if (new Date(coupon.validTo).getTime() < now) return "expired";
  if (coupon.validFrom && new Date(coupon.validFrom).getTime() > now) {
    return "not_started";
  }
  if (coupon.newUsersOnly && !input.isNewUser) return "usage_limit_exceeded";

  if (
    coupon.requiredPaymentMethod &&
    input.paymentMethod &&
    coupon.requiredPaymentMethod !== input.paymentMethod
  ) {
    return "payment_method_mismatch";
  }

  if (input.existingCoupons.some((c) => c.id === coupon.id)) {
    return "already_applied";
  }

  const slot = getSlot(coupon);
  if (slot === "platform") {
    if (input.existingCoupons.some((c) => getSlot(c) === "platform")) {
      return "slot_conflict";
    }
  } else if (slot === "shipping") {
    if (input.existingCoupons.some((c) => getSlot(c) === "shipping")) {
      return "slot_conflict";
    }
  } else if (slot === "store" && coupon.scope.type === "store") {
    const storeId = coupon.scope.storeId;
    if (
      input.existingCoupons.some(
        (c) =>
          getSlot(c) === "store" &&
          c.scope.type === "store" &&
          c.scope.storeId === storeId,
      )
    ) {
      return "slot_conflict";
    }
  }

  if (coupon.scope.type === "platform") {
    const subtotal = sum(input.items.map((i) => i.price * i.qty));
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return "min_spend_not_met";
    }
  } else if (coupon.scope.type === "store") {
    const storeId = coupon.scope.storeId;
    const storeSubtotal = sum(
      input.items.filter((i) => i.storeId === storeId).map((i) => i.price * i.qty),
    );
    if (storeSubtotal === 0) return "no_eligible_items";
    if (coupon.minSpend && storeSubtotal < coupon.minSpend) {
      return "min_spend_not_met";
    }
  } else if (coupon.scope.type === "product") {
    const productIds = coupon.scope.productIds;
    const eligibleSubtotal = sum(
      input.items
        .filter((i) => productIds.includes(i.productId))
        .map((i) => i.price * i.qty),
    );
    if (eligibleSubtotal === 0) return "no_eligible_items";
    if (coupon.minSpend && eligibleSubtotal < coupon.minSpend) {
      return "min_spend_not_met";
    }
  } else if (coupon.scope.type === "category") {
    const cats = coupon.scope.categorySlugs;
    const eligibleSubtotal = sum(
      input.items
        .filter((i) =>
          (input.productCategories?.[i.productId] ?? []).some((c) =>
            cats.includes(c),
          ),
        )
        .map((i) => i.price * i.qty),
    );
    if (eligibleSubtotal === 0) return "no_eligible_items";
    if (coupon.minSpend && eligibleSubtotal < coupon.minSpend) {
      return "min_spend_not_met";
    }
  }

  return null;
}

export function getSlot(coupon: Coupon): CouponSlot {
  if (coupon.discount.kind === "free_shipping") return "shipping";
  if (coupon.scope.type === "platform") return "platform";
  return "store";
}

export function isCouponExpired(coupon: Coupon): boolean {
  return new Date(coupon.validTo).getTime() < Date.now();
}

export function isCouponEligibleForCart(
  coupon: Coupon,
  items: CartItem[],
  isNewUser = false,
): boolean {
  if (isCouponExpired(coupon)) return false;
  if (coupon.newUsersOnly && !isNewUser) return false;
  const err = validate(coupon, {
    items,
    shippingPerStore: {},
    existingCoupons: [],
    isNewUser,
  });
  if (err === "slot_conflict" || err === "already_applied") return true;
  return err === null;
}

function resolveAmount(
  discount: Coupon["discount"],
  baseAmount: number,
): number {
  if (discount.kind === "fixed") return Math.min(discount.amount, baseAmount);
  if (discount.kind === "percent") {
    const raw = (baseAmount * discount.percent) / 100;
    return Math.min(discount.maxDiscount ?? Infinity, Math.round(raw));
  }
  return 0;
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function shippingSaveAlreadyCounted(applied: AppliedCoupon[]): number {
  return applied
    .filter((a) => a.slot === "shipping")
    .reduce((s, a) => s + a.amount, 0);
}
