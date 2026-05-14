// Read-only Order queries — used by polling pages, account section,
// and webhook fallback when the upstream provider is unreachable.

import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPaymentIntent(id: string) {
  return prisma.paymentIntent.findUnique({
    where: { id },
  });
}

export async function getOrderByRef(orderRef: string) {
  return prisma.order.findUnique({
    where: { orderRef },
    include: {
      items: true,
      store: { select: { slug: true, name: true, logoUrl: true } },
      appliedCoupons: true,
    },
  });
}

export async function getUserOrders(
  userId: string,
  opts: { limit?: number; cursor?: string; storeSlug?: string } = {},
) {
  return prisma.order.findMany({
    where: {
      userId,
      // Per-store account scope (Shopify-like architecture). Optional
      // so admin/cross-tenant surfaces can still fetch every order
      // belonging to a user.
      ...(opts.storeSlug ? { store: { slug: opts.storeSlug } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 20,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    include: {
      items: true,
      // logoUrl is needed by the buyer account dashboard + orders list
      // cards (small store avatar next to the line items).
      store: { select: { slug: true, name: true, logoUrl: true } },
      payment: { select: { status: true } },
    },
  });
}

export async function getOrdersByCartId(cartId: string) {
  return prisma.order.findMany({
    where: { cartId },
    include: {
      items: true,
      store: { select: { slug: true, name: true } },
    },
  });
}

// Vendor-side order list. Scope is `storeId` (the caller has already
// authenticated the user as the store's owner via requireStoreOwner).
// Includes denormalized item snapshots + buyer name/email so the
// vendor can fulfil + reach out without an extra round-trip.
export async function getStoreOrders(
  storeId: string,
  opts: {
    limit?: number;
    status?: OrderStatus;
    cursor?: string;
    // Offset-based skip — used by the vendor inbox's page-N pagination.
    // Ignored when `cursor` is set (cursor takes precedence; the two
    // strategies are mutually exclusive).
    skip?: number;
  } = {},
) {
  return prisma.order.findMany({
    where: {
      storeId,
      ...(opts.status ? { status: opts.status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 50,
    ...(opts.cursor
      ? { cursor: { id: opts.cursor }, skip: 1 }
      : opts.skip
        ? { skip: opts.skip }
        : {}),
    include: {
      items: true,
      // store relation kept so vendor pages can reuse buyer-side
      // toOrderView helpers (which expect `order.store.slug`/name).
      store: { select: { slug: true, name: true, logoUrl: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

// Vendor-side single-order load by orderRef. Mirrors getOrderByRef but
// pulls the buyer contact fields the vendor needs to ship the order.
export async function getStoreOrderByRef(orderRef: string) {
  return prisma.order.findUnique({
    where: { orderRef },
    include: {
      items: true,
      store: { select: { slug: true, name: true, logoUrl: true } },
      user: { select: { id: true, name: true, email: true } },
      appliedCoupons: true,
    },
  });
}
