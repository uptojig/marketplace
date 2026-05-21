// Vendor-side orders list — /dashboard/store/orders.
//
// Multi-store model (Phase 2A): the page resolves the active store
// via `resolveDashboardStore({ requestedSlug })`. Admins can pick any
// store; owners are scoped to their own. Status tabs (All / Paid /
// Shipped / Delivered / Cancelled / Returned) are URL-search-param
// driven so back/forward navigation and shared links pick up both
// the right filter AND the right store. Page-N pagination keeps
// older orders reachable now that fast-moving stores routinely break
// the previous 50-row cap.

import Link from "next/link";
import { Inbox } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  OperatorStatusBadge,
  orderStatusTone,
} from "@/components/operator/operator-primitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DashboardTabs,
  type DashboardTab,
} from "@/components/dashboard/dashboard-tabs";
import {
  DashboardPagination,
  parsePageParam,
} from "@/components/dashboard/dashboard-pagination";
import { getStoreOrders } from "@/lib/orders/queries";
import { ORDER_STATUS_LABEL } from "@/lib/orders/status-ui";
import { resolveDashboardStore } from "@/lib/stores/resolve-dashboard-store";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

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
  searchParams?: Promise<{ tab?: string; storeSlug?: string; page?: string }>;
}) {
  // Next 15's searchParams is a Promise; fall back to an empty object
  // typed as the same shape so older build runs still render during
  // incremental upgrades.
  const sp: { tab?: string; storeSlug?: string; page?: string } = searchParams
    ? await searchParams
    : {};

  const { store } = await resolveDashboardStore({
    requestedSlug: sp.storeSlug,
  });

  const tab = parseTab(sp.tab);
  const tabDef = VENDOR_TABS.find((t) => t.key === tab) ?? VENDOR_TABS[0];
  const page = parsePageParam(sp.page);

  // Tab counts — one extra query per tab would be excessive; instead
  // we fetch unscoped totals once (cheap because they're indexed on
  // storeId+status) and re-use them as both tab badges AND the
  // current-tab page total for pagination math.
  const statusCounts = await prisma_groupCounts(store.id);
  const totalForTab =
    tab === "all"
      ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
      : (statusCounts[tabDef.status as OrderStatus] ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalForTab / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const orders = await getStoreOrders(store.id, {
    limit: PAGE_SIZE,
    status: tabDef.status,
    skip: (safePage - 1) * PAGE_SIZE,
  });

  // URL builder that preserves the storeSlug picker selection and any
  // active filter — used by both tab chips and pagination links.
  function buildHref({
    tab: tabKey,
    page: pageNum,
  }: {
    tab?: VendorTabKey;
    page?: number;
  } = {}) {
    const params = new URLSearchParams();
    if (tabKey && tabKey !== "all") params.set("tab", tabKey);
    if (sp.storeSlug) params.set("storeSlug", sp.storeSlug);
    if (pageNum && pageNum > 1) params.set("page", String(pageNum));
    const qs = params.toString();
    return qs ? `/dashboard/store/orders?${qs}` : "/dashboard/store/orders";
  }

  const dashboardTabs: ReadonlyArray<DashboardTab<VendorTabKey>> =
    VENDOR_TABS.map((t) => ({
      key: t.key,
      label: t.label,
      // Reset to page 1 when switching tabs — page numbers don't
      // carry meaning across tabs (different counts, different rows).
      href: buildHref({ tab: t.key }),
      active: t.key === tab,
      count:
        t.key === "all"
          ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
          : (statusCounts[t.status as OrderStatus] ?? 0),
    }));

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

      <DashboardTabs tabs={dashboardTabs} />

      {orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border-2 border-dashed bg-muted px-6 py-16 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            ยังไม่มีคำสั่งซื้อ
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เมื่อมีลูกค้าสั่งซื้อ คำสั่งซื้อจะปรากฏที่นี่
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
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
                        <OperatorStatusBadge tone={orderStatusTone[order.status] ?? "neutral"}>
                          {ORDER_STATUS_LABEL[order.status]}
                        </OperatorStatusBadge>
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

          <DashboardPagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={totalForTab}
            pageSize={PAGE_SIZE}
            hrefFor={(p) => buildHref({ tab, page: p })}
          />
        </>
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
