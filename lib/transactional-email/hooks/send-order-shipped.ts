// Composes the OrderShippedEmail template and sends it.
//
// Called by Phase 2A `markOrderShipped` server action AFTER it has
// persisted the tracking number / carrier to the Order row. The action
// should:
//
//   import { sendOrderShippedEmail } from "@/lib/transactional-email";
//   ...
//   await prisma.order.update({ ..., data: { status: SHIPPED, ... } });
//   await sendOrderShippedEmail({ orderId });
//
// Never throws.

import * as React from "react";
import { prisma } from "@/lib/prisma";
import { sendEmail, type SendEmailResult } from "../send";
import OrderShippedEmail from "../templates/order-shipped";
import type { EmailOrderDTO, EmailStoreDTO } from "../templates/types";

export interface SendOrderShippedInput {
  orderId: string;
  /**
   * Optional override — if omitted the hook uses Order.trackingNumber /
   * Order.shippingCarrier. Useful for tests / async carrier callbacks.
   */
  trackingNumber?: string;
  carrier?: string;
}

export async function sendOrderShippedEmail(
  input: SendOrderShippedInput,
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

    const trackingNumber = input.trackingNumber ?? order.trackingNumber ?? "";
    const carrier = input.carrier ?? order.shippingCarrier ?? null;
    if (!trackingNumber) {
      return { ok: false, reason: "missing_tracking_number" };
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
      estimatedDelivery: order.estimatedDelivery,
    };

    return await sendEmail({
      to: order.user.email,
      replyTo: order.store.contactEmail || undefined,
      from: `${order.store.name} <${process.env.EMAIL_FROM?.trim() || "orders@basketplace.co"}>`,
      subject: `[${order.store.name}] คำสั่งซื้อของคุณกำลังจัดส่ง (#${order.orderRef})`,
      react: React.createElement(OrderShippedEmail, {
        order: orderDto,
        store: storeDto,
        buyer: { email: order.user.email, name: order.user.name },
        trackingNumber,
        carrier,
      }),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn("[send-order-shipped] failed:", reason);
    return { ok: false, reason };
  }
}
