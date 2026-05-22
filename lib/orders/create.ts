import { OrderStatus, PaymentProvider, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PlaceOrderAddress } from "@/lib/suppliers/types";
import { calculate } from "@/lib/coupons/calculator";
import {
  getCouponByCode,
  validateCouponServer,
} from "@/lib/coupons/server";
import type { Coupon } from "@/lib/coupons/types";

export interface CartLine {
  productId: string;
  qty: number;
}

export interface CreateOrderInput {
  userId: string;
  items: CartLine[];
  address: PlaceOrderAddress;
  shippingTHB?: number;
  /** Operator-typed coupon codes from the cart. Each is re-validated
   *  server-side here; invalid codes are silently dropped so a stale
   *  client coupon code can't block order placement. */
  couponCodes?: string[];
}

export async function createOrderFromCart(input: CreateOrderInput) {
  if (!input.items.length) throw new Error("Cart is empty");

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, active: true },
  });

  if (products.length !== input.items.length) {
    throw new Error("Some products are unavailable");
  }

  const lineMap = new Map(input.items.map((i) => [i.productId, i.qty]));
  const subtotalNumber = products.reduce(
    (acc, p) => acc + Number(p.priceTHB) * (lineMap.get(p.id) ?? 0),
    0,
  );
  const subtotal = new Prisma.Decimal(subtotalNumber);
  const shippingNumber = input.shippingTHB ?? 0;
  const shipping = new Prisma.Decimal(shippingNumber);

  // ── Resolve + validate coupons ───────────────────────────────
  // Re-fetch by code so we never trust the client's coupon shape.
  // Skip silently on any rejection — the cart UI already showed a
  // preview but the authoritative check happens here.
  const buyer = input.userId
    ? await prisma.user.findUnique({
        where: { id: input.userId },
        select: { firstPurchaseAt: true },
      })
    : null;
  const isNewUser = !buyer?.firstPurchaseAt;

  // shippingPerStore keyed by storeId — the calculator scope-checks
  // store-coupons against the storeId. createOrderFromCart writes a
  // single Order row (multi-store splits aren't a thing here yet),
  // so funnel all shipping into the first product's storeId bucket.
  const firstStoreId = products[0]?.storeId ?? "__unknown__";
  const shippingPerStore: Record<string, number> = {
    [firstStoreId]: shippingNumber,
  };
  const cartItems = products.map((p) => ({
    id: p.id,
    productId: p.id,
    qty: lineMap.get(p.id) ?? 1,
    storeId: p.storeId,
    title: p.title,
    thumbnailUrl: p.imageUrl ?? "",
    price: Number(p.priceTHB),
    storeName: "",
  }));

  const validatedCoupons: Coupon[] = [];
  for (const rawCode of input.couponCodes ?? []) {
    const code = rawCode.trim().toUpperCase();
    if (!code) continue;
    const found = await getCouponByCode(code);
    if (!found) continue;
    const result = await validateCouponServer({
      couponId: found.id,
      userId: input.userId,
      items: cartItems,
      shippingPerStore,
      existingCoupons: validatedCoupons,
      isNewUser,
    });
    if (result.ok) validatedCoupons.push(result.coupon);
  }

  const calc = calculate({
    items: cartItems,
    coupons: validatedCoupons,
    shippingPerStore,
    isNewUser,
  });
  const discountNumber = calc.totalDiscount;
  const discount = new Prisma.Decimal(discountNumber);
  const shippingAfterNumber =
    calc.shippingAfterDiscount[firstStoreId] ?? shippingNumber;
  const shippingAfter = new Prisma.Decimal(shippingAfterNumber);
  const totalNumber = Math.max(
    0,
    subtotalNumber + shippingAfterNumber - discountNumber,
  );
  const total = new Prisma.Decimal(totalNumber);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: input.userId,
        status: OrderStatus.PENDING_PAYMENT,
        subtotalTHB: subtotal,
        shippingTHB: shippingAfter,
        discountTHB: discount,
        totalTHB: total,
        shippingAddressJson: input.address as unknown as Prisma.InputJsonValue,
        items: {
          create: products.map((p) => ({
            productId: p.id,
            storeId: p.storeId,
            qty: lineMap.get(p.id) ?? 1,
            unitPriceTHB: p.priceTHB,
            supplier: p.supplier,
          })),
        },
        payment: {
          create: {
            provider: process.env.ANYPAY_MODE === "mock" ? PaymentProvider.MOCK : PaymentProvider.ANYPAY,
            status: PaymentStatus.PENDING,
            amountTHB: total,
          },
        },
      },
      include: { items: true, payment: true },
    });

    // Record applied coupons + a CouponUsage row each so per-user /
    // per-coupon usage caps tick on order placement.
    for (const applied of calc.appliedCoupons) {
      await tx.orderCoupon.create({
        data: {
          orderId: created.id,
          couponId: applied.couponId,
          code: applied.code,
          slot: applied.slot,
          amountTHB: new Prisma.Decimal(applied.amount),
        },
      });
      await tx.couponUsage.create({
        data: {
          couponId: applied.couponId,
          userId: input.userId,
          orderId: created.id,
        },
      });
    }

    return created;
  });

  return order;
}
