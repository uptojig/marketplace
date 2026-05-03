import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * /order-success?orderId=… — post-payment confirmation page.
 *
 * Security note: this page used to fetch the order by ID with no
 * ownership check. Any visitor with an order ID could see the full
 * line items + supplier/payment details. Now:
 *   - Requires session (redirects to /signin with `next` so we
 *     return here after login).
 *   - Verifies the order's userId matches the session user.
 *   - Returns 404 (notFound) for non-owners — same response shape
 *     whether the order is missing or just isn't theirs, so we
 *     don't leak existence of other people's order IDs.
 */
export default async function OrderSuccess({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;
  if (!orderId) {
    return <p className="p-6 text-sm text-muted-foreground">Missing orderId.</p>;
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/signin?next=/order-success?orderId=${encodeURIComponent(orderId)}`);
  }
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!me) {
    redirect(`/signin?next=/order-success?orderId=${encodeURIComponent(orderId)}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, payment: true },
  });

  // Order doesn't exist OR belongs to someone else — same 404 either
  // way so we don't reveal which case it is.
  if (!order || order.userId !== me.id) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ขอบคุณสำหรับคำสั่งซื้อ</h1>
        <p className="text-sm text-muted-foreground">
          Order ID: <span className="font-mono">{order.id}</span>
        </p>
        <p className="text-sm">
          Status: <span className="font-mono">{order.status}</span> · Payment:{" "}
          <span className="font-mono">{order.payment?.status}</span>
        </p>
      </div>
      <div className="rounded-lg border">
        <ul className="divide-y">
          {order.items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-4 p-4 text-sm"
            >
              <div className="flex-1">
                <div className="font-medium">{it.product.title}</div>
                <div className="text-xs text-muted-foreground">
                  {it.qty}× · supplier: {it.supplier}
                  {it.externalOrderId
                    ? ` · external: ${it.externalOrderId}`
                    : " · awaiting supplier placement"}
                  {it.supplierStatus ? ` · ${it.supplierStatus}` : ""}
                </div>
              </div>
              <div>{formatTHB(Number(it.unitPriceTHB) * it.qty)}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between">
        <Link href="/" className="text-sm underline">
          ← กลับไปช้อปต่อ
        </Link>
        <div className="text-sm font-semibold">
          ยอดรวม: {formatTHB(Number(order.totalTHB))}
        </div>
      </div>
    </div>
  );
}
