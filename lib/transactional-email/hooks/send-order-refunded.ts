// Composes the OrderRefundedEmail template and sends it. Phase 3C
// refund flow will call this after the refund has been recorded.

import * as React from "react";
import { prisma } from "@/lib/prisma";
import { sendEmail, type SendEmailResult } from "../send";
import OrderRefundedEmail from "../templates/order-refunded";
import type { EmailOrderDTO, EmailStoreDTO } from "../templates/types";

export interface SendOrderRefundedInput {
  orderId: string;
  amountTHB: number;
  /** Optional human-readable ETA, e.g. "ภายใน 5-7 วันทำการ". */
  etaText?: string;
}

export async function sendOrderRefundedEmail(
  input: SendOrderRefundedInput,
): Promise<SendEmailResult> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        items: true,
        store: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!order) return { ok: false, reason: "order_not_found" };
    if (!order.user?.email) return { ok: false, reason: "buyer_has_no_email" };
    if (!order.store) return { ok: false, reason: "order_has_no_store" };
    if (!order.orderRef) return { ok: false, reason: "order_has_no_ref" };
    if (!Number.isFinite(input.amountTHB) || input.amountTHB <= 0) {
      return { ok: false, reason: "invalid_refund_amount" };
    }

    const storeDto: EmailStoreDTO = {
      slug: order.store.slug,
      name: order.store.name,
      logoUrl: order.store.logoUrl,
      brandColor: order.store.primaryColor,
      contactEmail: order.store.contactEmail,
      customDomain: order.store.customDomain,
    };

    const orderDto: EmailOrderDTO = {
      id: order.id,
      orderRef: order.orderRef,
      totalTHB: Number(order.totalTHB),
      subtotalTHB: Number(order.subtotalTHB),
      shippingTHB: Number(order.shippingTHB),
      discountTHB: Number(order.discountTHB),
      items: order.items.map((it) => ({
        title: it.title || "สินค้า",
        qty: it.qty,
        unitPriceTHB: Number(it.unitPriceTHB),
        thumbnailUrl: it.thumbnailUrl,
        variantName: it.variantName,
      })),
      estimatedDelivery: null,
    };

    return await sendEmail({
      to: order.user.email,
      replyTo: order.store.contactEmail || undefined,
      from: `${order.store.name} <${process.env.EMAIL_FROM?.trim() || "orders@basketplace.co"}>`,
      subject: `[${order.store.name}] เงินคืนสำหรับคำสั่งซื้อ #${order.orderRef}`,
      react: React.createElement(OrderRefundedEmail, {
        order: orderDto,
        store: storeDto,
        buyer: { email: order.user.email, name: order.user.name },
        amountTHB: input.amountTHB,
        etaText: input.etaText,
      }),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn("[send-order-refunded] failed:", reason);
    return { ok: false, reason };
  }
}
