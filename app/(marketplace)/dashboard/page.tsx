import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VendorDashboard() {
  const [recentPayments, recentItems, productCount] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { order: true },
    }),
    prisma.orderItem.findMany({
      orderBy: { id: "desc" },
      take: 10,
      include: { product: true, store: true, order: true },
    }),
    prisma.product.count({ where: { active: true } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vendor Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Active products: {productCount}. Mode:{" "}
            <span className="font-mono">ANYPAY_MODE={process.env.ANYPAY_MODE ?? "mock"}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/catalog"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Browse catalog
          </Link>
          <Link
            href="/dashboard/products/import"
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            Paste URLs
          </Link>
          <Link
            href="/dashboard/store/settings"
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            ตั้งค่าร้าน
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold">Recent AnyPay transactions</h2>
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Provider</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Transaction</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-left">Paid at</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentPayments.map((p) => (
                <tr key={p.id}>
                  <td className="p-3 font-mono text-xs">{p.orderId.slice(0, 10)}…</td>
                  <td className="p-3">{p.provider}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3 font-mono text-xs">{p.anypayTransactionId ?? "—"}</td>
                  <td className="p-3 text-right">{formatTHB(Number(p.amountTHB))}</td>
                  <td className="p-3">{p.paidAt ? p.paidAt.toLocaleString() : "—"}</td>
                </tr>
              ))}
              {recentPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">Recent supplier shipments</h2>
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Store</th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Supplier</th>
                <th className="p-3 text-left">External order</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentItems.map((it) => (
                <tr key={it.id}>
                  <td className="p-3 font-mono text-xs">{it.orderId.slice(0, 8)}…</td>
                  <td className="p-3">{it.store.name}</td>
                  <td className="p-3">{it.product.title}</td>
                  <td className="p-3">{it.supplier}</td>
                  <td className="p-3 font-mono text-xs">{it.externalOrderId ?? "—"}</td>
                  <td className="p-3">{it.supplierStatus ?? "—"}</td>
                  <td className="p-3 font-mono text-xs">{it.externalTrackingNo ?? "—"}</td>
                </tr>
              ))}
              {recentItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    No order items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
