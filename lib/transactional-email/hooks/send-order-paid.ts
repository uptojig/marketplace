// Composes the OrderPaidEmail template and sends it.
//
// Called from the PAID transition path:
//   - lib/orders/markPaid.ts (anypay webhook → /api/webhook/anypay)
//   - any future webhook/route that flips Order.status to PAID
//
// Never throws — the order transition itself must commit even if the
// email fails. Caller can audit the return value if it wants to log
// failures.

import * as React from "react";
import { prisma } from "@/lib/prisma";
import { sendEmail, type SendEmailResult } from "../send";
import OrderPaidEmail from "../templates/order-paid";
import type { EmailOrderDTO, EmailStoreDTO } from "../templates/types";

export interface SendOrderPaidInput {
  orderId: string;
}

export async function sendOrderPaidEmail(
  input: SendOrderPaidInput,
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
    if (!order.user?.email) {
      // Anonymous / unverified buyer — silently skip.
      return { ok: false, reason: "buyer_has_no_email" };
    }
    if (!order.store) return { ok: false, reason: "order_has_no_store" };
    if (!order.orderRef) return { ok: false, reason: "order_has_no_ref" };

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
      estimatedDelivery: order.estimatedDelivery,
    };

    return await sendEmail({
      to: order.user.email,
      replyTo: order.store.contactEmail || undefined,
      from: `${order.store.name} <${process.env.EMAIL_FROM?.trim() || "orders@basketplace.co"}>`,
      subject: `[${order.store.name}] ขอบคุณสำหรับคำสั่งซื้อ #${order.orderRef}`,
      react: React.createElement(OrderPaidEmail, {
        order: orderDto,
        store: storeDto,
        buyer: { email: order.user.email, name: order.user.name },
      }),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn("[send-order-paid] failed:", reason);
    return { ok: false, reason };
  }
}
