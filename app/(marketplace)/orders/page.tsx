import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { payment: true, items: true },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Recent orders</h1>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="p-3 font-mono text-xs">
                  <Link className="underline" href={`/order-success?orderId=${o.id}`}>
                    {o.id.slice(0, 10)}…
                  </Link>
                </td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">{o.payment?.status ?? "—"}</td>
                <td className="p-3">{o.items.length}</td>
                <td className="p-3 text-right">{formatTHB(Number(o.totalTHB))}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
