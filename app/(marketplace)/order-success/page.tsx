import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderSuccess({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;
  if (!orderId) {
    return <p>Missing orderId.</p>;
  }
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, payment: true },
  });
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Thank you for your order</h1>
        <p className="text-sm text-muted-foreground">Order ID: <span className="font-mono">{order.id}</span></p>
        <p className="text-sm">
          Status: <span className="font-mono">{order.status}</span> · Payment:{" "}
          <span className="font-mono">{order.payment?.status}</span>
        </p>
      </div>
      <div className="rounded-lg border">
        <ul className="divide-y">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div className="flex-1">
                <div className="font-medium">{it.product.title}</div>
                <div className="text-xs text-muted-foreground">
                  {it.qty}× · supplier: {it.supplier}
                  {it.externalOrderId ? ` · external: ${it.externalOrderId}` : " · awaiting supplier placement"}
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
          Back to shop
        </Link>
        <div className="text-sm font-semibold">Total: {formatTHB(Number(order.totalTHB))}</div>
      </div>
    </div>
  );
}
