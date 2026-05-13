// Read-only Order queries — used by polling pages, account section,
// and webhook fallback when the upstream provider is unreachable.

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
  opts: { limit?: number; cursor?: string } = {},
) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 20,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    include: {
      items: true,
      store: { select: { slug: true, name: true } },
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
