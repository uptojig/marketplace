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
  /** Gift recipients — set ONLY for DIGITAL products. createOrderFromCart
   *  validates that qty === recipients.length and the product is
   *  DIGITAL before snapshotting onto OrderItem.giftRecipientsJson. */
  giftRecipients?: {
    email: string;
    name: string;
    message?: string;
  }[];
}

export interface CreateOrderInput {
  userId: string;
  items: CartLine[];
  /** Optional. Required for any order containing a PHYSICAL product;
   *  may be omitted when every line is a DIGITAL product. This is
   *  re-verified server-side here using the products' productType so
   *  a hostile client can't suppress shipping just by lying. */
  address?: PlaceOrderAddress;
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

  // Server-side gate: if address is absent, every product MUST be
  // DIGITAL. Otherwise the buyer is trying to ship physical goods to
  // nowhere.
  const allDigital = products.every((p) => p.productType === "DIGITAL");
  if (!input.address && !allDigital) {
    throw new Error("ต้องระบุที่อยู่จัดส่งสำหรับสินค้าทั่วไป");
  }

  const lineMap = new Map(input.items.map((i) => [i.productId, i.qty]));
  const giftMap = new Map(
    input.items
      .filter((i) => i.giftRecipients && i.giftRecipients.length > 0)
      .map((i) => [i.productId, i.giftRecipients!]),
  );

  // Server-side validation: gift recipients only allowed on DIGITAL
  // products, and qty MUST equal recipients.length so the post-PAID
  // hook creates the right number of unlocks.
  for (const item of input.items) {
    if (!item.giftRecipients || item.giftRecipients.length === 0) continue;
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    if (product.productType !== "DIGITAL") {
      throw new Error("ของขวัญใช้ได้กับสินค้าดิจิทัลเท่านั้น");
    }
    if (item.qty !== item.giftRecipients.length) {
      throw new Error("จำนวนผู้รับไม่ตรงกับจำนวนสินค้า");
    }
  }

  // Server-side guard: refuse self-buy lines for digital products the
  // user already owns. The unlock is non-consumable, so re-purchasing
  // would just burn credit on a duplicate. Gift lines are exempt —
  // the buyer may own the file but want to send a copy to someone
  // else. Mirrors the UI guard in the sheetlab PDP.
  if (input.userId) {
    const digitalSelfProductIds = input.items
      .filter((i) => !i.giftRecipients?.length)
      .map((i) => i.productId)
      .filter(
        (pid) =>
          products.find((p) => p.id === pid)?.productType === "DIGITAL",
      );
    if (digitalSelfProductIds.length > 0) {
      const owned = await prisma.digitalUnlock.findMany({
        where: {
          userId: input.userId,
          productId: { in: digitalSelfProductIds },
          recipientEmail: null,
          revokedAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { productId: true },
      });
      if (owned.length > 0) {
        const ownedIds = new Set(owned.map((o: { productId: string }) => o.productId));
        const titles = products
          .filter((p) => ownedIds.has(p.id))
          .map((p) => p.title);
        throw new Error(
          `เป็นเจ้าของแล้ว: ${titles.join(", ")} — ไม่สามารถซื้อซ้ำได้`,
        );
      }
    }
  }
  const subtotalNumber = products.reduce(
    (acc, p) => acc + Number(p.priceTHB) * (lineMap.get(p.id) ?? 0),
    0,
  );
  const subtotal = new Prisma.Decimal(subtotalNumber);
  // Digital-only orders never accrue shipping. Even if a caller passed
  // a non-zero shippingTHB by mistake (UI race, stale state), we zero
  // it out here so the buyer is never charged for a parcel that doesn't
  // exist.
  const shippingNumber = allDigital ? 0 : (input.shippingTHB ?? 0);
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
        shippingAddressJson:
          (input.address ?? Prisma.JsonNull) as unknown as Prisma.InputJsonValue,
        items: {
          create: products.map((p) => {
            const gifts = giftMap.get(p.id);
            return {
              productId: p.id,
              storeId: p.storeId,
              qty: lineMap.get(p.id) ?? 1,
              unitPriceTHB: p.priceTHB,
              supplier: p.supplier,
              giftRecipientsJson:
                gifts && gifts.length > 0
                  ? (gifts as unknown as Prisma.InputJsonValue)
                  : Prisma.JsonNull,
            };
          }),
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
