"use server";

// placeOrder + cancelOrder — the heart of checkout.
//
// placeOrder flow:
//   1. Authorize user (NextAuth session)
//   2. Load address snapshot
//   3. Server-validate every coupon (catches stale client state)
//   4. Re-calculate totals server-side (never trust the client)
//   5. In one transaction:
//      a. lockInventory (atomic via UPDATE-WHERE in lib/inventory)
//      b. Insert PaymentIntent placeholder
//      c. Insert one Order + items + applied coupons per store
//   6. Outside the tx: createIntent against Anypay (idempotent on cartId)
//   7. Patch PaymentIntent row with the real Anypay intent id + qr/redirect
//   8. Return refs to the client

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  OrderStatus,
  PaymentIntentStatus,
  PaymentMethod as PrismaPaymentMethod,
  Prisma,
  Supplier,
} from "@prisma/client";
import { createIntent } from "@/lib/anypay/intent-server";
import { lockInventory, releaseInventory } from "@/lib/inventory/actions";
import { validateCouponServer } from "@/lib/coupons/server";
import { calculate } from "@/lib/coupons/calculator";
import type { CartItem } from "@/lib/cart/types";
import type { Coupon } from "@/lib/coupons/types";

export interface PlaceOrderInput {
  cartId: string;
  items: CartItem[];
  addressId: string;
  paymentMethod: "promptpay" | "card" | "wallet" | "bnpl" | "cod";
  shippingByStore: Record<string, { optionId: string; price: number }>;
  couponIds: string[];
  notesByStore: Record<string, string>;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderRefs?: string[];
  intentId?: string;
  redirectUrl?: string;
  error?: string;
}

const COD_FEE = 20;

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "unauthorized" };
  }
  const userId = session.user.id;

  if (input.items.length === 0) {
    return { ok: false, error: "empty_cart" };
  }

  const addr = await prisma.address.findUnique({
    where: { id: input.addressId },
  });
  if (!addr || addr.userId !== userId) {
    return { ok: false, error: "invalid_address" };
  }

  // newUsersOnly coupon gate — firstPurchaseAt is null = brand new.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstPurchaseAt: true },
  });
  const isNewUser = !user?.firstPurchaseAt;

  const storeIds = Array.from(new Set(input.items.map((i) => i.storeId)));
  const itemsByStore = new Map<string, CartItem[]>();
  for (const item of input.items) {
    const arr = itemsByStore.get(item.storeId) ?? [];
    arr.push(item);
    itemsByStore.set(item.storeId, arr);
  }

  const shippingPerStore: Record<string, number> = {};
  for (const sid of storeIds) {
    shippingPerStore[sid] = input.shippingByStore[sid]?.price ?? 0;
  }

  const validatedCoupons: Coupon[] = [];
  for (const cid of input.couponIds) {
    const result = await validateCouponServer({
      couponId: cid,
      userId,
      items: input.items,
      shippingPerStore,
      existingCoupons: validatedCoupons,
      paymentMethod: input.paymentMethod,
      isNewUser,
    });
    if (!result.ok) {
      return { ok: false, error: `coupon_${cid}_invalid:${result.reason}` };
    }
    validatedCoupons.push(result.coupon);
  }

  const calc = calculate({
    items: input.items,
    coupons: validatedCoupons,
    shippingPerStore,
    paymentMethod: input.paymentMethod,
    isNewUser,
  });

  const paymentFee =
    input.paymentMethod === "cod" ? COD_FEE * storeIds.length : 0;
  const itemDiscount = calc.appliedCoupons
    .filter((c) => c.slot !== "shipping")
    .reduce((s, c) => s + c.amount, 0);
  const shippingAfter = Object.values(calc.shippingAfterDiscount).reduce(
    (a, b) => a + b,
    0,
  );
  const grandTotal = Math.max(
    0,
    calc.subtotal + shippingAfter + paymentFee - itemDiscount,
  );

  const orderRefs: string[] = [];
  const createdOrderIds: string[] = [];
  const inventoryRequests = input.items.map((i) => ({
    productId: i.productId,
    variantId: i.variantId,
    qty: i.qty,
  }));

  // Placeholder intent id — Anypay will return the real one after the
  // tx. We need *some* id to satisfy the FK from Order.paymentIntentId
  // before the API round-trip succeeds.
  const placeholderIntentId = `pi_pending_${input.cartId}_${Date.now()}`;
  const prismaPaymentMethod = mapPaymentMethod(input.paymentMethod);

  try {
    await prisma.$transaction(async (tx) => {
      const lockResult = await lockInventory(
        inventoryRequests,
        tx as unknown as Prisma.TransactionClient,
      );
      if (!lockResult.ok) {
        throw new Error(
          `out_of_stock:${lockResult.failed.map((f) => f.productId).join(",")}`,
        );
      }

      await tx.paymentIntent.create({
        data: {
          id: placeholderIntentId,
          cartId: input.cartId,
          userId,
          amountTHB: new Prisma.Decimal(grandTotal),
          paymentMethod: prismaPaymentMethod,
          status: PaymentIntentStatus.PENDING,
          metadata: {
            couponIds: input.couponIds,
            storeIds,
          },
        },
      });

      for (const storeId of storeIds) {
        const storeItems = itemsByStore.get(storeId)!;
        const storeSubtotal = storeItems.reduce(
          (s, i) => s + i.price * i.qty,
          0,
        );
        const storeShipping = calc.shippingAfterDiscount[storeId] ?? 0;
        const storeDiscount = calc.appliedCoupons
          .filter(
            (c) =>
              c.slot !== "platform" &&
              c.slot !== "shipping" &&
              c.scopedStoreId === storeId,
          )
          .reduce((s, c) => s + c.amount, 0);

        const orderRef = `ORD-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)
          .toUpperCase()}`;
        const storeTotal = Math.max(
          0,
          storeSubtotal + storeShipping - storeDiscount,
        );

        const created = await tx.order.create({
          data: {
            orderRef,
            userId,
            storeId,
            cartId: input.cartId,
            paymentIntentId: placeholderIntentId,
            status: OrderStatus.PENDING_PAYMENT,
            subtotalTHB: new Prisma.Decimal(storeSubtotal),
            shippingTHB: new Prisma.Decimal(storeShipping),
            discountTHB: new Prisma.Decimal(storeDiscount),
            totalTHB: new Prisma.Decimal(storeTotal),
            shippingAddressJson: {
              fullName: addr.recipientName,
              phone: addr.phone,
              line1: addr.line1,
              line2: addr.line2 ?? undefined,
              subDistrict: addr.subdistrict ?? "",
              district: addr.district ?? "",
              province: addr.province,
              postalCode: addr.postalCode,
            },
            paymentMethod: prismaPaymentMethod,
            noteToStore: input.notesByStore[storeId] || null,
            items: {
              create: storeItems.map((i) => ({
                productId: i.productId,
                variantId: i.variantId,
                storeId,
                qty: i.qty,
                unitPriceTHB: new Prisma.Decimal(i.price),
                title: i.title,
                thumbnailUrl: i.thumbnailUrl,
                variantName: i.variantName,
                // Supplier provenance is denormalized onto OrderItem in
                // our schema — default MOCK so the cart-template
                // flow works before suppliers are wired through.
                supplier: Supplier.MOCK,
              })),
            },
          },
          select: { id: true, orderRef: true },
        });

        const relevantCoupons = calc.appliedCoupons.filter(
          (c) =>
            c.slot === "platform" ||
            c.slot === "shipping" ||
            c.scopedStoreId === storeId,
        );
        if (relevantCoupons.length > 0) {
          await tx.orderCoupon.createMany({
            data: relevantCoupons.map((c) => ({
              orderId: created.id,
              couponId: c.couponId,
              code: c.code,
              slot: c.slot,
              amountTHB: new Prisma.Decimal(c.amount),
            })),
          });
        }

        createdOrderIds.push(created.id);
        orderRefs.push(created.orderRef!);
      }
    });
  } catch (err) {
    try {
      await releaseInventory(inventoryRequests);
    } catch {
      /* best-effort */
    }
    const msg = err instanceof Error ? err.message : "unknown";
    return { ok: false, error: msg };
  }

  // External call — outside tx. If this fails we leave a placeholder
  // PaymentIntent + orders that ETL/cron can sweep on a retry.
  try {
    const intent = await createIntent({
      cartId: input.cartId,
      amount: grandTotal,
      paymentMethod: input.paymentMethod,
      merchantOrderRefs: orderRefs,
      userId,
      metadata: { couponIds: input.couponIds, storeIds },
    });

    await prisma.$transaction(async (tx) => {
      // Swap the placeholder id for the real Anypay one. The intent
      // row's PK changes so we re-create + re-link orders.
      await tx.paymentIntent.create({
        data: {
          id: intent.intentId,
          cartId: input.cartId,
          userId,
          amountTHB: new Prisma.Decimal(grandTotal),
          paymentMethod: prismaPaymentMethod,
          status: mapAnypayStatusToPrisma(intent.status),
          qrCode: intent.qrCode ?? null,
          redirectUrl: intent.redirectUrl ?? null,
          expiresAt: intent.expiresAt ? new Date(intent.expiresAt) : null,
          metadata: { couponIds: input.couponIds, storeIds },
        },
      });

      await tx.order.updateMany({
        where: { id: { in: createdOrderIds } },
        data: { paymentIntentId: intent.intentId },
      });

      await tx.paymentIntent.delete({
        where: { id: placeholderIntentId },
      });
    });

    revalidatePath("/account/orders");

    return {
      ok: true,
      orderRefs,
      intentId: intent.intentId,
      redirectUrl: intent.redirectUrl,
    };
  } catch (err) {
    try {
      await releaseInventory(inventoryRequests);
      await prisma.paymentIntent.update({
        where: { id: placeholderIntentId },
        data: {
          status: PaymentIntentStatus.FAILED,
          failureReason: "anypay_unreachable",
        },
      });
    } catch {
      /* best-effort */
    }
    const msg = err instanceof Error ? err.message : "anypay_error";
    return { ok: false, error: msg };
  }
}

export async function cancelOrder(
  orderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, error: "unauthorized" };
  const userId = session.user.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "not_found" };
  if (order.userId !== userId) return { ok: false, error: "forbidden" };
  if (
    order.status !== OrderStatus.PENDING_PAYMENT &&
    order.status !== OrderStatus.PAID
  ) {
    return { ok: false, error: "cannot_cancel" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED, cancelledAt: new Date() },
    });

    await releaseInventory(
      order.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId ?? undefined,
        qty: i.qty,
      })),
      tx as unknown as Prisma.TransactionClient,
    );
  });

  revalidatePath("/account/orders");
  if (order.orderRef) revalidatePath(`/account/orders/${order.orderRef}`);
  return { ok: true };
}

function mapPaymentMethod(
  m: "promptpay" | "card" | "wallet" | "bnpl" | "cod",
): PrismaPaymentMethod {
  switch (m) {
    case "promptpay":
      return PrismaPaymentMethod.PROMPTPAY;
    case "card":
      return PrismaPaymentMethod.CARD;
    case "wallet":
      return PrismaPaymentMethod.WALLET;
    case "bnpl":
      return PrismaPaymentMethod.BNPL;
    case "cod":
      return PrismaPaymentMethod.COD;
  }
}

function mapAnypayStatusToPrisma(
  s: "pending" | "processing" | "succeeded" | "failed" | "expired",
): PaymentIntentStatus {
  switch (s) {
    case "pending":
      return PaymentIntentStatus.PENDING;
    case "processing":
      return PaymentIntentStatus.PROCESSING;
    case "succeeded":
      return PaymentIntentStatus.SUCCEEDED;
    case "failed":
      return PaymentIntentStatus.FAILED;
    case "expired":
      return PaymentIntentStatus.EXPIRED;
  }
}
