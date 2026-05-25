// Sends DigitalUnlockReadyEmail after a PAID order has DIGITAL unlocks
// created.
//
// Called from lib/orders/markPaid.ts AFTER createDigitalUnlocksForOrder
// returns a non-zero count.
//
// Never throws. The order transition has already committed; an email
// failure must not roll it back. Caller can audit the return value.

import * as React from "react";
import { prisma } from "@/lib/prisma";
import { sendEmail, type SendEmailResult } from "../send";
import DigitalUnlockReadyEmail, {
  type DigitalUnlockLine,
} from "../templates/digital-unlock-ready";
import type { EmailOrderDTO, EmailStoreDTO } from "../templates/types";

export interface SendDigitalUnlockReadyInput {
  orderId: string;
}

function publicBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    || process.env.NEXTAUTH_URL?.replace(/\/$/, "")
    || "https://basketplace.co"
  );
}

export async function sendDigitalUnlockReadyEmail(
  input: SendDigitalUnlockReadyInput,
): Promise<SendEmailResult> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        items: {
          // We only need to surface DIGITAL items in this email; the
          // receipt (order-paid) already covers everything else.
          include: {
            product: {
              select: {
                id: true,
                title: true,
                titleTh: true,
                productType: true,
                digitalKind: true,
                _count: { select: { digitalAssets: true } },
              },
            },
          },
        },
        store: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!order) return { ok: false, reason: "order_not_found" };
    if (!order.user?.email) return { ok: false, reason: "buyer_has_no_email" };
    if (!order.store) return { ok: false, reason: "order_has_no_store" };
    if (!order.orderRef) return { ok: false, reason: "order_has_no_ref" };

    const digitalItems = order.items.filter(
      (it) => it.product?.productType === "DIGITAL",
    );
    if (digitalItems.length === 0) {
      // No DIGITAL lines — nothing to fulfill. Caller should normally
      // not invoke this hook in that case, but be defensive.
      return { ok: false, reason: "no_digital_lines" };
    }

    const unlocks: DigitalUnlockLine[] = digitalItems.map((it) => ({
      productTitle: it.title || it.product?.titleTh || it.product?.title || "สินค้า",
      digitalKind: (it.product?.digitalKind ?? "OTHER") as DigitalUnlockLine["digitalKind"],
      // _count of digitalAssets includes preview rows too; that's fine
      // for an at-a-glance count in the email body.
      fileCount: it.product?._count.digitalAssets ?? 0,
    }));

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

    const downloadsUrl = `${publicBaseUrl()}/stores/${order.store.slug}/account/downloads`;

    return await sendEmail({
      to: order.user.email,
      replyTo: order.store.contactEmail || undefined,
      from: `${order.store.name} <${process.env.EMAIL_FROM?.trim() || "orders@basketplace.co"}>`,
      subject: `[${order.store.name}] สินค้าดิจิทัลของคุณพร้อมแล้ว — #${order.orderRef}`,
      react: React.createElement(DigitalUnlockReadyEmail, {
        order: orderDto,
        store: storeDto,
        buyer: { email: order.user.email, name: order.user.name },
        unlocks,
        downloadsUrl,
      }),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn("[send-digital-unlock-ready] failed:", reason);
    return { ok: false, reason };
  }
}
