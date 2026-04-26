import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  SUPPLIER_PLACED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  FAILED: "bg-red-100 text-red-700",
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
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">คำสั่งซื้อทั้งหมด</h1>
        <p className="text-sm text-muted-foreground">{orders.length} แสดง (จำกัด 100 ล่าสุด)</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <a
          href="/admin/orders"
          className={`rounded-full border px-3 py-1 ${!validStatus ? "border-black bg-black text-white" : "bg-white"}`}
        >
          ทั้งหมด ({statusCounts.reduce((s, x) => s + x._count._all, 0)})
        </a>
        {statusCounts.map((sc) => (
          <a
            key={sc.status}
            href={`/admin/orders?status=${sc.status}`}
            className={`rounded-full border px-3 py-1 ${validStatus === sc.status ? "border-black bg-black text-white" : "bg-white"}`}
          >
            {sc.status} ({sc._count._all})
          </a>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">ลูกค้า</th>
              <th className="px-4 py-3">ร้าน</th>
              <th className="px-4 py-3 text-right">ยอด</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">เวลา</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
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
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs">{o.id.slice(-8)}</p>
                      <p className="text-xs text-muted-foreground">{totalQty} ชิ้น</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.user?.email ?? "guest"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {stores.length === 0 ? "—" : stores.join(", ")}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatTHB(Number(o.totalTHB ?? 0))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[o.status] ?? "bg-gray-100"}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
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
