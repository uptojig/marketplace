// Server-side data loaders for the /account pages. Replaces the
// synchronous getOrders / getOrderById / mockUser helpers in
// lib/account/mock-data.ts with real Prisma reads bound to the
// signed-in user.
//
// Shape returned matches lib/account/mock-data.Order so the existing
// page components keep rendering without further changes — the pages
// just need to swap from "use client + sync helper" to RSC fetch +
// pass-through to a client list component.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Order as PageOrder, OrderStatus as PageOrderStatus, UserProfile } from "./mock-data";
import type { OrderStatus } from "@prisma/client";

function statusToPage(s: OrderStatus): PageOrderStatus {
  switch (s) {
    case "PENDING_PAYMENT":
      return "pending_payment";
    case "PAID":
    case "SUPPLIER_PLACED":
      return "paid";
    case "SHIPPED":
      return "shipping";
    case "DELIVERED":
      return "delivered";
    case "CANCELLED":
    case "FAILED":
    case "RETURNED":
      return "cancelled";
    default:
      return "pending_payment";
  }
}

async function currentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      image: true,
      createdAt: true,
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    fullName: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    avatarUrl: user.image ?? undefined,
    joinedAt: user.createdAt.toISOString(),
  };
}

export async function getUserOrdersForPage(): Promise<PageOrder[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      items: true,
      store: { select: { slug: true, name: true, logoUrl: true } },
    },
  });
  return rows.map((o) => ({
    id: o.id,
    orderRef: o.orderRef ?? o.id,
    placedAt: o.createdAt.toISOString(),
    status: statusToPage(o.status),
    storeId: o.storeId ?? "",
    storeName: o.store?.name ?? "",
    storeLogo: o.store?.logoUrl ?? undefined,
    subtotal: Number(o.subtotalTHB),
    shipping: Number(o.shippingTHB),
    discount: Number(o.discountTHB ?? 0),
    total: Number(o.totalTHB),
    paymentMethod: (o.paymentMethod ?? "PROMPTPAY").toLowerCase() as PageOrder["paymentMethod"],
    items: o.items.map((i) => ({
      productId: i.productId,
      title: i.title ?? "",
      thumbnailUrl: i.thumbnailUrl ?? "",
      variantName: i.variantName ?? undefined,
      price: Number(i.unitPriceTHB),
      qty: i.qty,
    })),
    addressId: "",
    trackingNumber: o.trackingNumber ?? undefined,
    carrier: o.shippingCarrier ?? undefined,
    estimatedDelivery: o.estimatedDelivery?.toISOString() ?? undefined,
  }));
}

export async function getUserOrderById(orderRef: string): Promise<PageOrder | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  // Page passes the public orderRef in the URL; fall back to id lookup
  // for legacy rows that pre-date the orderRef column being populated.
  const o = await prisma.order.findFirst({
    where: {
      userId,
      OR: [{ orderRef }, { id: orderRef }],
    },
    include: {
      items: true,
      store: { select: { slug: true, name: true, logoUrl: true } },
    },
  });
  if (!o) return null;
  return {
    id: o.id,
    orderRef: o.orderRef ?? o.id,
    placedAt: o.createdAt.toISOString(),
    status: statusToPage(o.status),
    storeId: o.storeId ?? "",
    storeName: o.store?.name ?? "",
    storeLogo: o.store?.logoUrl ?? undefined,
    subtotal: Number(o.subtotalTHB),
    shipping: Number(o.shippingTHB),
    discount: Number(o.discountTHB ?? 0),
    total: Number(o.totalTHB),
    paymentMethod: (o.paymentMethod ?? "PROMPTPAY").toLowerCase() as PageOrder["paymentMethod"],
    items: o.items.map((i) => ({
      productId: i.productId,
      title: i.title ?? "",
      thumbnailUrl: i.thumbnailUrl ?? "",
      variantName: i.variantName ?? undefined,
      price: Number(i.unitPriceTHB),
      qty: i.qty,
    })),
    addressId: "",
    trackingNumber: o.trackingNumber ?? undefined,
    carrier: o.shippingCarrier ?? undefined,
    estimatedDelivery: o.estimatedDelivery?.toISOString() ?? undefined,
  };
}

export async function getUserAddresses() {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return rows.map((a) => ({
    id: a.id,
    fullName: a.recipientName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 ?? undefined,
    subDistrict: a.subdistrict ?? "",
    district: a.district ?? "",
    province: a.province,
    postalCode: a.postalCode,
    isDefault: a.isDefault,
    label: (a.label as "home" | "office" | "other") ?? undefined,
  }));
}
