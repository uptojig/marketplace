import Link from "next/link";
import { Store, Users, Package, ShoppingCart } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";
import {
  OperatorPageHeader,
  OperatorCard,
  OperatorStatCard,
  OperatorStatusBadge,
  orderStatusTone,
} from "@/components/operator/operator-primitives";

export const dynamic = "force-dynamic";

const PAID_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.SUPPLIER_PLACED,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

export default async function AdminOverviewPage() {
  const [storeCount, userCount, productCount, orderCount, paidOrders] =
    await Promise.all([
      prisma.store.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: { in: PAID_STATUSES } },
        select: { totalTHB: true },
      }),
    ]);

  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + Number(o.totalTHB ?? 0),
    0,
  );

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      totalTHB: true,
      status: true,
      createdAt: true,
      user: { select: { email: true } },
    },
  });

  const recentStores = await prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <OperatorPageHeader title="ภาพรวมระบบ" description="สรุปข้อมูลทั้ง marketplace" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Link href="/admin/stores">
          <OperatorStatCard label="ร้านค้า" value={storeCount} icon={Store} tone="info" />
        </Link>
        <Link href="/admin/users">
          <OperatorStatCard label="ผู้ใช้" value={userCount} icon={Users} tone="info" />
        </Link>
        <Link href="/admin/products">
          <OperatorStatCard label="สินค้า" value={productCount} icon={Package} tone="info" />
        </Link>
        <Link href="/admin/orders">
          <OperatorStatCard label="ออเดอร์" value={orderCount} icon={ShoppingCart} tone="info" />
        </Link>
        <OperatorStatCard label="ยอดขายรวม" value={formatTHB(totalRevenue)} tone="success" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent orders */}
        <OperatorCard
          title="ออเดอร์ล่าสุด"
          actions={
            <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline">
              ดูทั้งหมด →
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีออเดอร์</p>
          ) : (
            <div className="space-y-2 text-sm">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{o.user?.email ?? "guest"}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.createdAt.toLocaleString("th-TH")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-right">
                    <p className="font-semibold text-foreground">{formatTHB(Number(o.totalTHB ?? 0))}</p>
                    <OperatorStatusBadge tone={orderStatusTone[o.status] ?? "neutral"}>
                      {o.status}
                    </OperatorStatusBadge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </OperatorCard>

        {/* Recent stores */}
        <OperatorCard
          title="ร้านค้าใหม่"
          actions={
            <Link href="/admin/stores" className="text-xs font-semibold text-primary hover:underline">
              ดูทั้งหมด →
            </Link>
          }
        >
          {recentStores.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีร้านค้า</p>
          ) : (
            <div className="space-y-2 text-sm">
              {recentStores.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/stores/${s.slug}`}
                      target="_blank"
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {s.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">/{s.slug}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">
                    {s._count.products} สินค้า
                  </div>
                </div>
              ))}
            </div>
          )}
        </OperatorCard>
      </div>
    </div>
  );
}
