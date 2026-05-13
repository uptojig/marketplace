// Server-side coupon access — Prisma port of the Drizzle vendor template.
// validateCouponServer is the authoritative path used at order placement.
// The pure validate() in ./calculator is a UX hint; this one cross-checks
// against CouponUsage for global + per-user limits.

import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/lib/cart/types";
import type { Coupon as CouponType, CouponValidationError } from "./types";
import { validate as pureValidate } from "./calculator";
import type { Prisma } from "@prisma/client";

type CouponRow = {
  id: string;
  code: string;
  scope: Prisma.JsonValue;
  discount: Prisma.JsonValue;
  minSpendTHB: Prisma.Decimal | null;
  validFrom: Date | null;
  validTo: Date;
  newUsersOnly: boolean;
  requiredPaymentMethod: string | null;
  maxUsesTotal: number | null;
  maxUsesPerUser: number | null;
  title: string;
  description: string | null;
  issuer: string;
  colorScheme: string | null;
};

function dbToCoupon(row: CouponRow): CouponType {
  return {
    id: row.id,
    code: row.code,
    scope: row.scope as CouponType["scope"],
    discount: row.discount as CouponType["discount"],
    minSpend: row.minSpendTHB ? Number(row.minSpendTHB) : undefined,
    validFrom: row.validFrom?.toISOString(),
    validTo: row.validTo.toISOString(),
    newUsersOnly: row.newUsersOnly,
    requiredPaymentMethod:
      (row.requiredPaymentMethod?.toLowerCase() as CouponType["requiredPaymentMethod"]) ??
      undefined,
    maxUsesTotal: row.maxUsesTotal ?? undefined,
    maxUsesPerUser: row.maxUsesPerUser ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    issuer: row.issuer,
    colorScheme: (row.colorScheme as CouponType["colorScheme"]) ?? undefined,
  };
}

export async function getCouponById(id: string): Promise<CouponType | null> {
  const row = await prisma.coupon.findFirst({
    where: { id, isActive: true },
  });
  return row ? dbToCoupon(row as unknown as CouponRow) : null;
}

export async function getCouponByCode(
  code: string,
): Promise<CouponType | null> {
  const row = await prisma.coupon.findFirst({
    where: { code, isActive: true },
  });
  return row ? dbToCoupon(row as unknown as CouponRow) : null;
}

export async function getActiveCoupons(): Promise<CouponType[]> {
  const rows = await prisma.coupon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => dbToCoupon(r as unknown as CouponRow));
}

export async function validateCouponServer(args: {
  couponId: string;
  userId: string;
  items: CartItem[];
  shippingPerStore: Record<string, number>;
  existingCoupons: CouponType[];
  paymentMethod?: string;
  isNewUser: boolean;
  productCategories?: Record<string, string[]>;
}): Promise<
  | { ok: true; coupon: CouponType }
  | { ok: false; reason: CouponValidationError }
> {
  const coupon = await getCouponById(args.couponId);
  if (!coupon) return { ok: false, reason: "not_found" };

  const pureErr = pureValidate(coupon, {
    items: args.items,
    shippingPerStore: args.shippingPerStore,
    existingCoupons: args.existingCoupons,
    paymentMethod: args.paymentMethod,
    isNewUser: args.isNewUser,
    productCategories: args.productCategories,
  });
  if (pureErr) return { ok: false, reason: pureErr };

  if (coupon.maxUsesTotal) {
    const totalUsed = await prisma.couponUsage.count({
      where: { couponId: coupon.id },
    });
    if (totalUsed >= coupon.maxUsesTotal) {
      return { ok: false, reason: "usage_limit_exceeded" };
    }
  }

  if (coupon.maxUsesPerUser) {
    const userUsed = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: args.userId },
    });
    if (userUsed >= coupon.maxUsesPerUser) {
      return { ok: false, reason: "usage_limit_exceeded" };
    }
  }

  return { ok: true, coupon };
}

export async function recordCouponUsage(
  args: { couponId: string; userId: string; orderId: string },
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<void> {
  await tx.couponUsage.create({
    data: {
      couponId: args.couponId,
      userId: args.userId,
      orderId: args.orderId,
    },
  });
}
