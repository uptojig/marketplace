// POST /api/coupons/validate
//
// Server-side coupon validation endpoint. The pure calculator in
// lib/coupons/calculator.ts is for UX hints; this is authoritative.
// Mobile clients + server actions both go through validateCouponServer
// directly when they have a Prisma client, but a JSON endpoint is
// useful for web clients that don't want to embed the calculator.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  validateCouponServer,
  getCouponByCode,
} from "@/lib/coupons/server";
import type { CartItem } from "@/lib/cart/types";
import type { Coupon } from "@/lib/coupons/types";

interface ValidateBody {
  couponId?: string;
  code?: string;
  items: CartItem[];
  shippingPerStore: Record<string, number>;
  existingCouponIds: string[];
  paymentMethod?: string;
}

export async function POST(request: Request) {
  let body: ValidateBody;
  try {
    body = (await request.json()) as ValidateBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // newUsersOnly check uses firstPurchaseAt (vendor template field — null
  // means the user has never paid for an order). DB lookup is one extra
  // round-trip but it's the only authoritative source.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstPurchaseAt: true },
  });
  const isNewUser = !user?.firstPurchaseAt;

  let couponId = body.couponId;
  if (!couponId && body.code) {
    const c = await getCouponByCode(body.code);
    if (!c) {
      return NextResponse.json(
        { ok: false, reason: "not_found" },
        { status: 200 },
      );
    }
    couponId = c.id;
  }
  if (!couponId) {
    return NextResponse.json(
      { error: "missing_coupon_id_or_code" },
      { status: 400 },
    );
  }

  // Resolve currently-applied coupons by re-fetching from DB. Never trust
  // the client's coupon shapes — they could be mutated or expired-stale.
  const existingCoupons: Coupon[] = [];
  for (const cid of body.existingCouponIds ?? []) {
    const result = await validateCouponServer({
      couponId: cid,
      userId,
      items: body.items,
      shippingPerStore: body.shippingPerStore,
      existingCoupons,
      paymentMethod: body.paymentMethod,
      isNewUser,
    });
    if (result.ok) existingCoupons.push(result.coupon);
  }

  const result = await validateCouponServer({
    couponId,
    userId,
    items: body.items,
    shippingPerStore: body.shippingPerStore,
    existingCoupons,
    paymentMethod: body.paymentMethod,
    isNewUser,
  });

  return NextResponse.json(result);
}
