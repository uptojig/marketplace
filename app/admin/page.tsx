import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";

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
    <div className="mx-auto max-w-6xl space-y-6 text-mp-ink">
      <div>
        <h1 className="text-2xl font-bold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>ภาพรวมระบบ</h1>
        <p className="text-sm text-mp-ink-muted">สรุปข้อมูลทั้ง marketplace</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="ร้านค้า" value={storeCount} href="/admin/stores" />
        <StatCard label="ผู้ใช้" value={userCount} href="/admin/users" />
        <StatCard label="สินค้า" value={productCount} href="/admin/products" />
        <StatCard label="ออเดอร์" value={orderCount} href="/admin/orders" />
        <StatCard
          label="ยอดขายรวม"
          value={formatTHB(totalRevenue)}
          subtle
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl border border-mp-border bg-mp-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>ออเดอร์ล่าสุด</h2>
            <Link href="/admin/orders" className="text-xs text-mp-coral hover:underline font-semibold">
              ดูทั้งหมด →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-mp-ink-muted">ยังไม่มีออเดอร์</p>
          ) : (
            <div className="space-y-2 text-sm">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between border-b border-mp-border pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-mp-ink">{o.user?.email ?? "guest"}</p>
                    <p className="text-xs text-mp-ink-muted">
                      {o.createdAt.toLocaleString("th-TH")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-mp-ink">{formatTHB(Number(o.totalTHB ?? 0))}</p>
                    <p className="text-xs text-mp-ink-muted">{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent stores */}
        <div className="rounded-xl border border-mp-border bg-mp-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>ร้านค้าใหม่</h2>
            <Link href="/admin/stores" className="text-xs text-mp-coral hover:underline font-semibold">
              ดูทั้งหมด →
            </Link>
          </div>
          {recentStores.length === 0 ? (
            <p className="text-sm text-mp-ink-muted">ยังไม่มีร้านค้า</p>
          ) : (
            <div className="space-y-2 text-sm">
              {recentStores.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b border-mp-border pb-2 last:border-0">
                  <div>
                    <Link
                      href={`/stores/${s.slug}`}
                      target="_blank"
                      className="font-medium text-mp-ink hover:text-mp-coral hover:underline"
                    >
                      {s.name}
                    </Link>
                    <p className="text-xs text-mp-ink-muted">/{s.slug}</p>
                  </div>
                  <div className="text-right text-xs text-mp-ink-muted">
                    {s._count.products} สินค้า
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  subtle,
}: {
  label: string;
  value: string | number;
  href?: string;
  subtle?: boolean;
}) {
  const inner = (
    <div className={`rounded-xl border border-mp-border bg-mp-surface p-4 mp-card-lift shadow-sm transition ${href ? "hover:border-mp-coral" : ""}`}>
      <p className="text-xs text-mp-ink-muted">{label}</p>
      <p className={`mt-1 font-bold text-mp-ink ${subtle ? "text-lg" : "text-2xl"}`} style={{ fontFamily: "var(--mp-font-display)" }}>{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
