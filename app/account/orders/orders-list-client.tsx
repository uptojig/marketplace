'use client';

/**
 * Orders list — client-side tab filter + search.
 *
 * Receives Prisma-derived OrderView[] from the server component
 * parent. No mock data, no Prisma imports at runtime.
 *
 * Design ported from the marketplace-templates scaffold
 * (src/app/account/orders/page.tsx) with these wiring tweaks:
 *  - Status enum is the real Prisma OrderStatus (PENDING_PAYMENT,
 *    PAID, SUPPLIER_PLACED, SHIPPED, DELIVERED, CANCELLED, FAILED,
 *    RETURNED). The tab keys collapse SUPPLIER_PLACED into PAID
 *    and FAILED into CANCELLED via lib/orders/status-ui.
 *  - Order detail link uses /account/orders/<orderRef> (the
 *    user-facing reference), not the internal cuid.
 *  - Per-item product link uses /stores/<slug>/products/<id> so
 *    the storefront theme cascade is preserved on the trip back.
 */

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  ORDER_TABS,
  matchesTab,
  type OrderTabKey,
} from '@/lib/orders/status-ui';
import type { OrderView } from '@/lib/account/order-view';

export function OrdersListClient({ orders }: { orders: OrderView[] }) {
  const [tab, setTab] = useState<OrderTabKey>('all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = orders
    .filter((o) => matchesTab(o.status, tab))
    .filter(
      (o) =>
        !q ||
        o.orderRef.toLowerCase().includes(q) ||
        o.storeName.toLowerCase().includes(q) ||
        o.items.some((i) => i.title.toLowerCase().includes(q)),
    );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold lg:text-2xl">คำสั่งซื้อของฉัน</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหาด้วยเลขคำสั่งซื้อ ร้านค้า หรือชื่อสินค้า..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b pb-px">
        {ORDER_TABS.map((t) => {
          const count = orders.filter((o) => matchesTab(o.status, t.key)).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2 text-sm transition",
                tab === t.key
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {count > 0 && <span className="ml-1 text-xs">({count})</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {orders.length === 0
              ? "ยังไม่มีคำสั่งซื้อ — เริ่มช้อปได้เลย"
              : "ไม่พบคำสั่งซื้อในหมวดนี้"}
          </p>
          {orders.length === 0 && (
            <Button asChild className="mt-4">
              <Link href="/">ไปหน้าแรก</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: OrderView }) {
  // Per-store product link — fall back to plain text when slug is
  // missing (very old orders pre-storeId-promotion).
  const productHref = (productId: string) =>
    order.storeSlug
      ? `/stores/${order.storeSlug}/products/${productId}`
      : undefined;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {new Date(order.placedAt).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="font-mono text-xs">{order.orderRef}</span>
        </div>
        <Badge className={ORDER_STATUS_COLOR[order.status]} variant="outline">
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>

      <Link href={`/account/orders/${order.orderRef}`} className="block">
        <div className="px-4 py-3">
          <p className="mb-2 text-sm font-medium">{order.storeName}</p>
          <div className="space-y-2">
            {order.items.slice(0, 2).map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded">
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-2 text-sm">{item.title}</p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">x{item.qty}</p>
                </div>
                <div className="text-right text-sm">
                  ฿{item.lineTotalTHB.toLocaleString()}
                </div>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-xs text-muted-foreground">
                + อีก {order.items.length - 2} รายการ
              </p>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t bg-muted/10 px-4 py-3">
        <div className="text-xs text-muted-foreground">
          ยอดรวม:{" "}
          <span className="text-base font-semibold text-red-600">
            ฿{order.totalTHB.toLocaleString()}
          </span>
        </div>
        <div className="flex gap-2">
          {order.status === "SHIPPED" && order.trackingNumber && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/account/orders/${order.orderRef}`}>ติดตามพัสดุ</Link>
            </Button>
          )}
          {/* TODO(reorder): wire "ซื้อซ้ำ" once we have a server action
              that rehydrates a cart from order items. For now it's a
              passive link back to the first product page. */}
          {order.status === "DELIVERED" && order.items[0] && productHref(order.items[0].productId) && (
            <Button variant="outline" size="sm" asChild>
              <Link href={productHref(order.items[0].productId)!}>ซื้อซ้ำ</Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href={`/account/orders/${order.orderRef}`}>ดูรายละเอียด</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
