import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-100",
  PAID: "bg-mp-forest/10 text-mp-forest border border-mp-forest/20",
  SUPPLIER_PLACED: "bg-blue-50 text-blue-700 border border-blue-100",
  SHIPPED: "bg-purple-50 text-purple-700 border border-purple-100",
  DELIVERED: "bg-mp-forest/10 text-mp-forest border border-mp-forest/20",
  CANCELLED: "bg-mp-cream-alt text-mp-ink-muted border border-mp-border",
  FAILED: "bg-red-50 text-red-700 border border-red-100",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status as OrderStatus | undefined;
  const validStatus =
    status && Object.values(OrderStatus).includes(status) ? status : undefined;

  const orders = await prisma.order.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      totalTHB: true,
      status: true,
      createdAt: true,
      user: { select: { email: true } },
      items: {
        select: {
          qty: true,
          store: { select: { name: true, slug: true } },
        },
      },
    },
  });

  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4 text-mp-ink">
      <div>
        <h1 className="text-2xl font-bold text-mp-ink" style={{ fontFamily: "var(--mp-font-display)" }}>คำสั่งซื้อทั้งหมด</h1>
        <p className="text-sm text-mp-ink-muted">{orders.length} แสดง (จำกัด 100 ล่าสุด)</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <a
          href="/admin/orders"
          className={`rounded-full border px-3 py-1.5 transition ${!validStatus ? "border-mp-coral bg-mp-coral text-white shadow-sm" : "border-mp-border bg-mp-surface text-mp-ink hover:bg-mp-cream-alt"}`}
        >
          ทั้งหมด ({statusCounts.reduce((s, x) => s + x._count._all, 0)})
        </a>
        {statusCounts.map((sc) => (
          <a
            key={sc.status}
            href={`/admin/orders?status=${sc.status}`}
            className={`rounded-full border px-3 py-1.5 transition ${validStatus === sc.status ? "border-mp-coral bg-mp-coral text-white shadow-sm" : "border-mp-border bg-mp-surface text-mp-ink hover:bg-mp-cream-alt"}`}
          >
            {sc.status} ({sc._count._all})
          </a>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-mp-border bg-mp-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-mp-border bg-mp-cream-alt text-left text-xs font-medium uppercase tracking-wide text-mp-ink-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">ลูกค้า</th>
              <th className="px-4 py-3">ร้าน</th>
              <th className="px-4 py-3 text-right">ยอด</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">เวลา</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mp-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-mp-ink-muted">
                  ไม่พบคำสั่งซื้อ
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const stores = Array.from(
                  new Set(o.items.map((i) => i.store?.name).filter(Boolean)),
                );
                const totalQty = o.items.reduce((s, i) => s + i.qty, 0);
                return (
                  <tr key={o.id} className="hover:bg-mp-cream-alt/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold">{o.id.slice(-8)}</p>
                      <p className="text-xs text-mp-ink-muted">{totalQty} ชิ้น</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">
                      {o.user?.email ?? "guest"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {stores.length === 0 ? "—" : stores.join(", ")}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-mp-ink">
                      {formatTHB(Number(o.totalTHB ?? 0))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium border ${STATUS_BADGE[o.status] ?? "bg-mp-cream-alt text-mp-ink-muted border-mp-border"}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-mp-ink-muted">
                      {o.createdAt.toLocaleString("th-TH")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
