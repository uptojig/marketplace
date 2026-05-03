import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * /orders — "การสั่งซื้อของฉัน". User-scoped order history.
 *
 * Security note: this page used to fetch ALL orders system-wide with
 * no auth gate. Anyone hitting /orders saw every customer's orders
 * + linked through to /order-success?orderId=… for full details.
 * Critical leak — surfaced by operator. Now:
 *   - Requires session (redirects to /signin)
 *   - Filters orders by userId so each customer only sees their own
 *   - ADMIN role doesn't get a backdoor here on purpose; admins
 *     have /admin/orders for the system-wide view.
 */
export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/signin?next=/orders");
  }
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!me) redirect("/signin?next=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { payment: true, items: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">การสั่งซื้อของฉัน</h1>
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
                  ยังไม่มีการสั่งซื้อ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
