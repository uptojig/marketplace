// Vendor-side orders list — /dashboard/store/orders.
//
// Multi-store model (Phase 2A): the page resolves the active store
// via `resolveDashboardStore({ requestedSlug })`. Admins can pick any
// store; owners are scoped to their own. Status tabs (All / Paid /
// Shipped / Delivered / Cancelled / Returned) are URL-search-param
// driven so back/forward navigation and shared links pick up both
// the right filter AND the right store.

import Link from "next/link";
import { Inbox } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStoreOrders } from "@/lib/orders/queries";
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
} from "@/lib/orders/status-ui";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";
import { cn, formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Vendor tab key set — a coarser grouping than the raw OrderStatus
// enum that matches what sellers actually triage by. PENDING_PAYMENT
// is omitted from the chips (it's transient + buyer-blocked) but
// still shown under "ทั้งหมด".
type VendorTabKey =
  | "all"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

const VENDOR_TABS: { key: VendorTabKey; label: string; status?: OrderStatus }[] =
  [
    { key: "all", label: "ทั้งหมด" },
    { key: "PAID", label: "รอจัดส่ง", status: "PAID" },
    { key: "SHIPPED", label: "กำลังจัดส่ง", status: "SHIPPED" },
    { key: "DELIVERED", label: "สำเร็จ", status: "DELIVERED" },
    { key: "CANCELLED", label: "ยกเลิก", status: "CANCELLED" },
    { key: "RETURNED", label: "คืนสินค้า", status: "RETURNED" },
  ];

function parseTab(raw: string | string[] | undefined): VendorTabKey {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (
    v === "PAID" ||
    v === "SHIPPED" ||
    v === "DELIVERED" ||
    v === "CANCELLED" ||
    v === "RETURNED"
  ) {
    return v;
  }
  return "all";
}

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; storeSlug?: string }>;
}) {
  // Next 15's searchParams is a Promise; fall back to an empty object
  // typed as the same shape so older build runs still render during
  // incremental upgrades.
  const sp: { tab?: string; storeSlug?: string } = searchParams
    ? await searchParams
    : {};

  const { store } = await resolveDashboardStore({
    requestedSlug: sp.storeSlug,
  });

  const tab = parseTab(sp.tab);
  const tabDef = VENDOR_TABS.find((t) => t.key === tab) ?? VENDOR_TABS[0];

  const orders = await getStoreOrders(store.id, {
    limit: 50,
    status: tabDef.status,
  });

  // Tab counts — one extra query per tab would be excessive; instead
  // we fetch unscoped totals once (cheap because they're indexed on
  // storeId+status) and use them only as a heuristic count.
  const statusCounts = await prisma_groupCounts(store.id);

  // Preserve the active store across tab navigation. Empty when no
  // explicit slug is needed (default owned store).
  const slugQs = sp.storeSlug
    ? `&storeSlug=${encodeURIComponent(sp.storeSlug)}`
    : "";

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">คำสั่งซื้อ</h1>
          <p className="text-sm text-muted-foreground">
            จัดการคำสั่งซื้อทั้งหมดของร้าน — ยืนยันการจัดส่ง / ใส่เลขพัสดุ
          </p>
        </div>
      </header>

      <nav
        aria-label="กรองตามสถานะ"
        className="flex flex-wrap gap-2 border-b pb-px"
      >
        {VENDOR_TABS.map((t) => {
          const isActive = t.key === tab;
          const count =
            t.key === "all"
              ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
              : (statusCounts[t.status as OrderStatus] ?? 0);
          const href =
            t.key === "all"
              ? sp.storeSlug
                ? `/dashboard/store/orders?storeSlug=${encodeURIComponent(sp.storeSlug)}`
                : "/dashboard/store/orders"
              : `/dashboard/store/orders?tab=${t.key}${slugQs}`;
          return (
            <Link
              key={t.key}
              href={href}
              className={cn(
                "shrink-0 rounded-md border px-3 py-1.5 text-sm transition",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent",
              )}
            >
              {t.label}
              {count > 0 && (
                <span
                  className={cn(
                    "ml-1.5 text-xs",
                    isActive ? "opacity-80" : "text-muted-foreground",
                  )}
                >
                  ({count})
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border-2 border-dashed bg-gray-50 px-6 py-16 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold text-gray-700">
            ยังไม่มีคำสั่งซื้อ
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เมื่อมีลูกค้าสั่งซื้อ คำสั่งซื้อจะปรากฏที่นี่
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>เลขคำสั่งซื้อ</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead className="text-center">รายการ</TableHead>
                <TableHead className="text-right">ยอดรวม</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
                const buyerLabel =
                  order.user?.name?.trim() ||
                  order.user?.email ||
                  "ลูกค้า";
                return (
                  <TableRow key={order.id} className="align-top">
                    <TableCell className="font-mono text-xs">
                      {order.orderRef ?? order.id}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{buyerLabel}</div>
                      {order.user?.email && order.user.name && (
                        <div className="text-xs text-muted-foreground">
                          {order.user.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {itemCount}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {formatTHB(Number(order.totalTHB))}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={ORDER_STATUS_COLOR[order.status]}
                        variant="outline"
                      >
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={
                            sp.storeSlug
                              ? `/dashboard/store/orders/${order.orderRef ?? order.id}?storeSlug=${encodeURIComponent(sp.storeSlug)}`
                              : `/dashboard/store/orders/${order.orderRef ?? order.id}`
                          }
                        >
                          ดูรายละเอียด
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Lightweight per-status count for the tab chips. Kept inline so the
// query lives next to its only caller; if a third surface ever needs
// this we'll lift it into lib/orders/queries.ts.
async function prisma_groupCounts(
  storeId: string,
): Promise<Partial<Record<OrderStatus, number>>> {
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.order.groupBy({
    by: ["status"],
    where: { storeId },
    _count: { _all: true },
  });
  const out: Partial<Record<OrderStatus, number>> = {};
  for (const r of rows) {
    out[r.status] = r._count._all;
  }
  return out;
}
