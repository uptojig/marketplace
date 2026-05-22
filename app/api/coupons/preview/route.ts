// POST /api/coupons/preview
//
// Cart-stage coupon lookup. Mirrors /api/coupons/validate but does
// NOT require an authenticated session — the cart needs to show
// guest buyers what a code is worth before they have to type their
// shipping details. The per-user usage cap and `newUsersOnly` gate
// are deferred to the authoritative /api/checkout flow (which still
// runs validateCouponServer with a real userId before placing the
// order); this endpoint only answers "is this a known, active code
// with reasonable cart-level fit?".

import { NextResponse } from "next/server";
import {
  getCouponByCode,
  validateCouponServer,
} from "@/lib/coupons/server";
import type { CartItem } from "@/lib/cart/types";
import type { Coupon } from "@/lib/coupons/types";

interface PreviewBody {
  code?: string;
  items?: CartItem[];
  shippingPerStore?: Record<string, number>;
  existingCodes?: string[];
  paymentMethod?: string;
}

export async function POST(request: Request) {
  let body: PreviewBody;
  try {
    body = (await request.json()) as PreviewBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const code = body.code?.trim();
  if (!code) {
    return NextResponse.json(
      { ok: false, reason: "not_found" },
      { status: 200 },
    );
  }

  const coupon = await getCouponByCode(code);
  if (!coupon) {
    return NextResponse.json(
      { ok: false, reason: "not_found" },
      { status: 200 },
    );
  }

  const existingCoupons: Coupon[] = [];
  for (const c of body.existingCodes ?? []) {
    const found = await getCouponByCode(c);
    if (found) existingCoupons.push(found);
  }

  const result = await validateCouponServer({
    couponId: coupon.id,
    userId: "__anon__",
    items: body.items ?? [],
    shippingPerStore: body.shippingPerStore ?? {},
    existingCoupons,
    paymentMethod: body.paymentMethod,
    // Anon previews assume `isNewUser: true` so the newUsersOnly gate
    // doesn't reject — the authoritative check happens at checkout.
    isNewUser: true,
  });

  return NextResponse.json(result);
}
