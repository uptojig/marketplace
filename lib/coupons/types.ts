// Coupon types — supports platform-wide, store-scoped, product-scoped
// coupons with percentage / fixed / free-shipping discount kinds plus
// eligibility rules. Ported verbatim from the vendor template scaffold;
// shape matches the JSONB columns on the Coupon Prisma model so the
// calculator code below maps onto DB rows without translation.

export type DiscountKind =
  | { kind: "percent"; percent: number; maxDiscount?: number }
  | { kind: "fixed"; amount: number }
  | { kind: "free_shipping" };

export type CouponScope =
  | { type: "platform" }
  | { type: "store"; storeId: string }
  | { type: "product"; productIds: string[] }
  | { type: "category"; categorySlugs: string[] };

export type CouponSlot = "platform" | "store" | "shipping";

export interface Coupon {
  id: string;
  code: string;
  scope: CouponScope;
  discount: DiscountKind;
  minSpend?: number;
  validFrom?: string;
  validTo: string;
  newUsersOnly?: boolean;
  requiredPaymentMethod?: "promptpay" | "card" | "wallet" | "bnpl" | "cod";
  maxUsesTotal?: number;
  maxUsesPerUser?: number;
  title: string;
  description?: string;
  issuer: string;
  colorScheme?: "red" | "blue" | "purple" | "green" | "amber";
}

export interface AppliedCoupon {
  couponId: string;
  code: string;
  slot: CouponSlot;
  amount: number;
  scopedStoreId?: string;
}

export type CouponValidationResult =
  | { ok: true; coupon: Coupon }
  | { ok: false; reason: CouponValidationError };

export type CouponValidationError =
  | "not_found"
  | "expired"
  | "not_started"
  | "min_spend_not_met"
  | "no_eligible_items"
  | "already_applied"
  | "slot_conflict"
  | "payment_method_mismatch"
  | "usage_limit_exceeded";

export const COUPON_ERROR_MESSAGE: Record<CouponValidationError, string> = {
  not_found: "ไม่พบโค้ดนี้",
  expired: "โค้ดหมดอายุแล้ว",
  not_started: "โค้ดยังไม่เริ่มใช้งาน",
  min_spend_not_met: "ยอดสั่งซื้อไม่ถึงขั้นต่ำ",
  no_eligible_items: "ไม่มีสินค้าที่ใช้โค้ดนี้ได้",
  already_applied: "ใช้โค้ดนี้ไปแล้ว",
  slot_conflict: "มีโค้ดประเภทเดียวกันใช้อยู่แล้ว",
  payment_method_mismatch: "ต้องเลือกวิธีชำระเงินที่กำหนด",
  usage_limit_exceeded: "ใช้ครบจำนวนสิทธิ์แล้ว",
};
