// POST /api/anypay/webhook
//
// Anypay → us. Notified on intent state changes.
//
// Security:
//   - HMAC-SHA256 signature verification
//   - Timestamp must be within 5 min (anti-replay window)
//   - timingSafeEqual prevents timing attacks
//
// Idempotency:
//   - Status transitions are checked; don't re-apply if already in target.
//   - Multiple deliveries of same event = same result.
//   - Terminal states (succeeded/failed/expired/cancelled) cannot transition.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  OrderStatus,
  PaymentIntentStatus,
  Prisma,
} from "@prisma/client";
import { verifyWebhook } from "@/lib/anypay/intent-server";
import {
  consumeInventory,
  releaseInventory,
} from "@/lib/inventory/actions";
import { recordCouponUsage } from "@/lib/coupons/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-anypay-signature");
  const timestamp = request.headers.get("x-anypay-timestamp");

  const verified = verifyWebhook(rawBody, signature, timestamp);
  if (!verified.ok) {
    console.warn("[anypay/webhook] verification failed:", verified.reason);
    return NextResponse.json({ error: verified.reason }, { status: 401 });
  }

  const { payload } = verified;
  const targetStatus = mapAnypayStatus(payload.status);
  if (!targetStatus) {
    return NextResponse.json({ error: "unknown_status" }, { status: 400 });
  }

  const intent = await prisma.paymentIntent.findUnique({
    where: { id: payload.intentId },
  });
  if (!intent) {
    console.warn("[anypay/webhook] intent not found:", payload.intentId);
    return NextResponse.json({ error: "intent_not_found" }, { status: 404 });
  }

  if (intent.status === targetStatus) {
    return NextResponse.json({ ok: true, message: "already_in_state" });
  }

  if (!isValidTransition(intent.status, targetStatus)) {
    console.warn(
      "[anypay/webhook] invalid transition:",
      intent.status,
      "→",
      targetStatus,
    );
    return NextResponse.json(
      { error: "invalid_transition" },
      { status: 409 },
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentIntent.update({
      where: { id: payload.intentId },
      data: {
        status: targetStatus,
        paidAt: payload.paidAt ? new Date(payload.paidAt) : null,
        failureReason: payload.failureReason ?? null,
      },
    });

    const linkedOrders = await tx.order.findMany({
      where: { paymentIntentId: payload.intentId },
      include: { items: true, appliedCoupons: true },
    });

    if (targetStatus === PaymentIntentStatus.SUCCEEDED) {
      const now = new Date();
      for (const order of linkedOrders) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.PAID, paidAt: now },
        });

        await consumeInventory(
          order.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? undefined,
            qty: i.qty,
          })),
          tx as unknown as Prisma.TransactionClient,
        );

        for (const c of order.appliedCoupons) {
          await recordCouponUsage(
            {
              couponId: c.couponId,
              userId: order.userId,
              orderId: order.id,
            },
            tx as unknown as Prisma.TransactionClient,
          );
        }

        // First-purchase timestamp powers the `newUsersOnly` coupon
        // gate. Only set the very first time so retries are no-ops.
        await tx.user.updateMany({
          where: { id: order.userId, firstPurchaseAt: null },
          data: { firstPurchaseAt: now },
        });
      }
    } else if (
      targetStatus === PaymentIntentStatus.FAILED ||
      targetStatus === PaymentIntentStatus.EXPIRED ||
      targetStatus === PaymentIntentStatus.CANCELLED
    ) {
      const now = new Date();
      for (const order of linkedOrders) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED, cancelledAt: now },
        });

        await releaseInventory(
          order.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? undefined,
            qty: i.qty,
          })),
          tx as unknown as Prisma.TransactionClient,
        );
      }
    }
  });

  return NextResponse.json({ ok: true });
}

function mapAnypayStatus(
  s:
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "expired",
): PaymentIntentStatus | null {
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
    default:
      return null;
  }
}

function isValidTransition(
  from: PaymentIntentStatus,
  to: PaymentIntentStatus,
): boolean {
  if (from === to) return false;
  if (
    from === PaymentIntentStatus.SUCCEEDED ||
    from === PaymentIntentStatus.FAILED ||
    from === PaymentIntentStatus.EXPIRED ||
    from === PaymentIntentStatus.CANCELLED
  ) {
    return false;
  }
  return true;
}
