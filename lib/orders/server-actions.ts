"use server";

// Vendor-side order mutations.
//
// All actions in this file run with the same authorization shape:
//   1. Resolve session → bail if not signed in.
//   2. Load the target order WITH its store relation so we can compare
//      `session.user.id === order.store.ownerId`. Any miss is a hard
//      reject (don't leak existence — same surface as forbidden).
//   3. Validate the requested status transition server-side. The UI
//      hides illegal CTAs, but a determined vendor (or replayed
//      request) must still be blocked here.
//
// Kept separate from lib/orders/actions.ts (which owns the buyer-side
// placeOrder / cancelOrder flow) so vendor and buyer concerns don't
// mix at the action layer. Both files revalidate distinct route trees.

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { OrderStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ShippingCarrier = "KERRY" | "FLASH" | "JNT" | "OTHER";

export interface MarkOrderShippedInput {
  trackingNumber: string;
  shippingCarrier: ShippingCarrier;
}

export interface VendorActionResult {
  ok: boolean;
  error?: string;
}

// Statuses from which it's legal for the vendor to transition into
// SHIPPED. PENDING_PAYMENT can't ship (not paid for yet); terminal
// statuses (CANCELLED / FAILED / RETURNED / DELIVERED) can't either.
const SHIP_FROM: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.SUPPLIER_PLACED,
];

// SHIPPED → DELIVERED is the only legal step for "mark delivered". We
// don't allow jumping past SHIPPED so the buyer-facing timeline stays
// consistent with the real-world fulfilment trail.
const DELIVER_FROM: OrderStatus[] = [OrderStatus.SHIPPED];

// Vendor cancellation is restricted to pre-fulfilment states. Once we
// hand off to the carrier or beyond, cancellation has to flow through
// a returns/refunds workflow that this PR doesn't ship.
const CANCEL_FROM: OrderStatus[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PAID,
  OrderStatus.SUPPLIER_PLACED,
];

/**
 * Authorize the current session against the target order and return
 * a minimal record the caller can act on. Throws on any failure so
 * server actions stay terse.
 */
async function authorizeVendorForOrder(orderId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    throw new Error("unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      store: { select: { id: true, ownerId: true, slug: true } },
    },
  });
  if (!order) throw new Error("not_found");
  if (!order.store || order.store.ownerId !== userId) {
    // Same 404-equivalent shape whether the order is missing OR owned
    // by a different vendor. The action callers map this back to a
    // generic "ไม่พบคำสั่งซื้อ" toast.
    throw new Error("not_found");
  }
  return { order, userId };
}

function revalidateVendorOrderRoutes(orderRef: string | null) {
  revalidatePath("/dashboard/store/orders");
  if (orderRef) revalidatePath(`/dashboard/store/orders/${orderRef}`);
  // Also bump the buyer-facing detail so the new tracking number
  // shows up without waiting for the next deployment.
  revalidatePath("/account/orders");
}

export async function markOrderShipped(
  orderId: string,
  input: MarkOrderShippedInput,
): Promise<VendorActionResult> {
  try {
    const { order } = await authorizeVendorForOrder(orderId);

    if (!SHIP_FROM.includes(order.status)) {
      return { ok: false, error: "invalid_transition" };
    }

    const trackingNumber = input.trackingNumber?.trim();
    if (!trackingNumber) {
      return { ok: false, error: "tracking_required" };
    }
    const allowedCarriers: ShippingCarrier[] = [
      "KERRY",
      "FLASH",
      "JNT",
      "OTHER",
    ];
    if (!allowedCarriers.includes(input.shippingCarrier)) {
      return { ok: false, error: "invalid_carrier" };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SHIPPED,
        trackingNumber,
        shippingCarrier: input.shippingCarrier,
        shippedAt: new Date(),
      },
    });

    revalidateVendorOrderRoutes(order.orderRef);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return { ok: false, error: msg };
  }
}

export async function markOrderDelivered(
  orderId: string,
): Promise<VendorActionResult> {
  try {
    const { order } = await authorizeVendorForOrder(orderId);

    if (!DELIVER_FROM.includes(order.status)) {
      return { ok: false, error: "invalid_transition" };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });

    revalidateVendorOrderRoutes(order.orderRef);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return { ok: false, error: msg };
  }
}

export async function cancelOrderAsVendor(
  orderId: string,
): Promise<VendorActionResult> {
  try {
    const { order } = await authorizeVendorForOrder(orderId);

    if (!CANCEL_FROM.includes(order.status)) {
      return { ok: false, error: "invalid_transition" };
    }

    // NOTE: inventory release is intentionally NOT touched here — the
    // buyer-side cancelOrder() in lib/orders/actions.ts owns that
    // path. A full unified state-machine (incl. refunds) is on the
    // Phase-2B roadmap; this PR sticks to the vendor's status flip so
    // the buyer sees CANCELLED immediately.
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    revalidateVendorOrderRoutes(order.orderRef);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return { ok: false, error: msg };
  }
}
