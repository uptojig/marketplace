import { NextResponse } from "next/server";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * CJ webhook receiver. Configure this URL in CJ partner dashboard:
 *   POST https://<your-domain>/api/webhook/cj
 *
 * CJ sends events when order status, tracking, or fulfillment change.
 * Events are logged to WebhookLog for audit, then we map their status
 * onto our OrderStatus enum and update OrderItem + Order accordingly.
 *
 * CJ does not currently sign callback bodies — verification relies on
 * pinning the webhook URL inside CJ's partner portal. If a shared
 * secret is later available, validate `req.headers.get('x-cj-signature')`
 * against the body before persisting.
 */

interface CjEvent {
  event?: string;
  type?: string;
  orderId?: string;
  orderNum?: string;
  trackNumber?: string;
  trackingNumber?: string;
  status?: string;
  orderStatus?: string;
  data?: Record<string, unknown>;
}

function mapStatus(cjStatus: string | undefined): OrderStatus | null {
  if (!cjStatus) return null;
  const s = cjStatus.toUpperCase();
  if (s.includes("CANCEL") || s.includes("REFUND")) return OrderStatus.CANCELLED;
  if (s.includes("FAIL") || s.includes("REJECT")) return OrderStatus.FAILED;
  if (s.includes("DELIVER")) return OrderStatus.DELIVERED;
  if (s.includes("SHIP") || s.includes("TRANSIT") || s.includes("DISPATCH"))
    return OrderStatus.SHIPPED;
  if (s.includes("PROCESS") || s.includes("PROCUREMENT") || s.includes("PRINTED"))
    return OrderStatus.SUPPLIER_PLACED;
  return null;
}

export async function POST(req: Request) {
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headers[k] = v;
  });

  let body: CjEvent | null = null;
  try {
    body = (await req.json()) as CjEvent;
  } catch {
    body = null;
  }

  const log = await prisma.webhookLog.create({
    data: {
      source: "CJ",
      endpoint: "/api/webhook/cj",
      headersJson: headers as never,
      bodyJson: (body ?? {}) as never,
      signatureValid: false,
      processed: false,
    },
  });

  if (!body) {
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processingError: "Invalid JSON body" },
    });
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const cjOrderId =
    body.orderId ?? body.orderNum ?? (body.data?.orderId as string | undefined);
  const tracking =
    body.trackNumber ??
    body.trackingNumber ??
    (body.data?.trackNumber as string | undefined);
  const cjStatus =
    body.status ?? body.orderStatus ?? (body.data?.status as string | undefined);

  if (!cjOrderId) {
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processingError: "Missing orderId in payload" },
    });
    return NextResponse.json({ ok: true, note: "no orderId" });
  }

  const items = await prisma.orderItem.findMany({
    where: { externalOrderId: cjOrderId, supplier: "CJ" },
    select: { id: true, orderId: true },
  });

  if (items.length === 0) {
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processingError: `No OrderItem with externalOrderId=${cjOrderId}` },
    });
    return NextResponse.json({ ok: true, note: "no matching order" });
  }

  const newStatus = mapStatus(cjStatus);

  try {
    await prisma.$transaction(async (tx) => {
      const itemUpdate: Prisma.OrderItemUpdateManyArgs["data"] = {
        supplierStatus: cjStatus ?? null,
        supplierLastSyncAt: new Date(),
      };
      if (tracking) itemUpdate.externalTrackingNo = tracking;
      await tx.orderItem.updateMany({
        where: { id: { in: items.map((i) => i.id) } },
        data: itemUpdate,
      });

      if (newStatus) {
        const orderIds = Array.from(new Set(items.map((i) => i.orderId)));
        const orders = await tx.order.findMany({
          where: { id: { in: orderIds } },
          select: { id: true, status: true },
        });
        const rank: Record<OrderStatus, number> = {
          [OrderStatus.PENDING_PAYMENT]: 0,
          [OrderStatus.PAID]: 1,
          [OrderStatus.SUPPLIER_PLACED]: 2,
          [OrderStatus.SHIPPED]: 3,
          [OrderStatus.DELIVERED]: 4,
          [OrderStatus.CANCELLED]: 5,
          [OrderStatus.FAILED]: 5,
          [OrderStatus.RETURNED]: 6,
        };
        for (const o of orders) {
          if (rank[newStatus] > rank[o.status]) {
            await tx.order.update({
              where: { id: o.id },
              data: { status: newStatus },
            });
          }
        }
      }
    });

    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processed: true },
    });
    return NextResponse.json({
      ok: true,
      itemsUpdated: items.length,
      mappedStatus: newStatus,
      tracking,
    });
  } catch (e) {
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: {
        processingError: e instanceof Error ? e.message : "unknown",
      },
    });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
