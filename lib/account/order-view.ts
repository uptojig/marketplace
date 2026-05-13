// Adapter — flatten Prisma Order + relations into the shape the
// buyer-facing account pages render. Sits in front of
// lib/orders/queries.ts so the route handlers stay thin.
//
// Why not just render Prisma rows directly?
//  1. Decimal → number (Prisma returns Decimal for money columns; the
//     UI helpers expect plain numbers). We coerce once here.
//  2. snapshot vs live data: OrderItem.title / thumbnailUrl /
//     variantName are denormalized — fall back to the live Product if
//     the snapshot is missing (e.g. legacy orders pre-denorm), and
//     ultimately a placeholder so the card never crashes.
//  3. We tag the view with the `store.slug` we need for the
//     /stores/<slug>/products/<id> deep link so the order detail can
//     route the buyer back into a themed storefront, not the dead
//     marketplace-level /p/<id>.
//
// TODO(rating): the buyer account dashboard wants per-store rating /
// follower count once Review + StoreFollower models land — fold them
// in here when those queries exist.

import type {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatus,
  PaymentMethod,
} from '@prisma/client';

// Subset shape returned by getUserOrders + getOrderByRef. We don't
// import the Prisma payload type because it tangles every caller with
// the include selection — keep it loose.
type StoreLite = {
  slug: string | null;
  name: string | null;
  logoUrl?: string | null;
};

export interface OrderItemView {
  id: string;
  productId: string;
  title: string;
  thumbnailUrl: string;
  variantName: string | null;
  qty: number;
  unitPriceTHB: number;
  lineTotalTHB: number;
}

export interface OrderView {
  id: string;
  // User-facing reference (ORD-...) — fallback to internal id when
  // null (pre-vendor-merge legacy rows).
  orderRef: string;
  placedAt: string;
  status: OrderStatus;
  storeId: string | null;
  storeSlug: string | null;
  storeName: string;
  storeLogoUrl: string | null;
  items: OrderItemView[];
  subtotalTHB: number;
  shippingTHB: number;
  discountTHB: number;
  totalTHB: number;
  paymentMethod: PaymentMethod | null;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  shippingAddress: ShippingAddressSnapshot | null;
}

// Mirror of PlaceOrderAddress (lib/suppliers/types.ts) — the JSON
// snapshot baked into Order.shippingAddressJson at placement. Loose
// types because Prisma stores it as Json.
export interface ShippingAddressSnapshot {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  subdistrict?: string;
  district?: string;
  province: string;
  postalCode: string;
  country?: string;
}

type AnyOrderInput = PrismaOrder & {
  items: PrismaOrderItem[];
  store: StoreLite | null;
};

const FALLBACK_THUMB =
  'https://placehold.co/200x200/eeeeee/999999?text=No+Image';

function toNumber(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  // Prisma Decimal has a .toNumber() method, but it's also coercible.
  const asString = (v as { toString: () => string }).toString?.() ?? `${v}`;
  const n = Number(asString);
  return Number.isFinite(n) ? n : 0;
}

function parseShippingAddress(json: unknown): ShippingAddressSnapshot | null {
  if (!json || typeof json !== 'object') return null;
  const a = json as Record<string, unknown>;
  // Tolerate both the snake_case + camelCase variants that have
  // appeared across versions of PlaceOrderAddress.
  const recipientName =
    (a.recipientName as string) ?? (a.fullName as string) ?? '';
  const phone = (a.phone as string) ?? '';
  const line1 = (a.line1 as string) ?? '';
  const province = (a.province as string) ?? '';
  const postalCode = (a.postalCode as string) ?? '';
  if (!recipientName || !line1 || !province || !postalCode) return null;
  return {
    recipientName,
    phone,
    line1,
    line2: (a.line2 as string) || undefined,
    subdistrict:
      ((a.subdistrict as string) ?? (a.subDistrict as string)) || undefined,
    district: (a.district as string) || undefined,
    province,
    postalCode,
    country: (a.country as string) || 'TH',
  };
}

export function toOrderView(order: AnyOrderInput): OrderView {
  const items: OrderItemView[] = order.items.map((it) => {
    const unit = toNumber(it.unitPriceTHB);
    return {
      id: it.id,
      productId: it.productId,
      title: it.title ?? 'สินค้า',
      thumbnailUrl: it.thumbnailUrl ?? FALLBACK_THUMB,
      variantName: it.variantName ?? null,
      qty: it.qty,
      unitPriceTHB: unit,
      lineTotalTHB: unit * it.qty,
    };
  });

  return {
    id: order.id,
    orderRef: order.orderRef ?? order.id,
    placedAt: order.createdAt.toISOString(),
    status: order.status,
    storeId: order.storeId,
    storeSlug: order.store?.slug ?? null,
    storeName: order.store?.name ?? 'Basketplace',
    storeLogoUrl: order.store?.logoUrl ?? null,
    items,
    subtotalTHB: toNumber(order.subtotalTHB),
    shippingTHB: toNumber(order.shippingTHB),
    discountTHB: toNumber(order.discountTHB),
    totalTHB: toNumber(order.totalTHB),
    paymentMethod: order.paymentMethod,
    shippingCarrier: order.shippingCarrier,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery
      ? order.estimatedDelivery.toISOString()
      : null,
    shippingAddress: parseShippingAddress(order.shippingAddressJson),
  };
}

export function toOrderViews(orders: AnyOrderInput[]): OrderView[] {
  return orders.map(toOrderView);
}

// Helper — pretty-print a payment method enum value. Mirrors the
// lib/checkout/mock-data.ts paymentMethods list but here driven off
// the real Prisma enum. Kept side-by-side with the order pages
// because no other surface needs it yet.
export const PAYMENT_METHOD_INFO: Record<
  PaymentMethod,
  { label: string; description: string; icon: string }
> = {
  PROMPTPAY: {
    label: 'PromptPay QR',
    description: 'สแกน QR Code ผ่านแอปธนาคาร',
    icon: '🇹🇭',
  },
  CARD: {
    label: 'บัตรเครดิต / เดบิต',
    description: 'Visa, Mastercard, JCB',
    icon: '💳',
  },
  WALLET: {
    label: 'Anypay Wallet',
    description: 'ใช้ยอดคงเหลือใน Anypay',
    icon: '👛',
  },
  BNPL: {
    label: 'ผ่อนได้ 0%',
    description: 'จ่ายเป็นงวด ไม่มีดอกเบี้ย',
    icon: '📅',
  },
  COD: {
    label: 'เก็บเงินปลายทาง',
    description: 'จ่ายตอนได้รับสินค้า (+฿20)',
    icon: '📦',
  },
};
