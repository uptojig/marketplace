import { OrderStatus, Supplier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSupplier } from "@/lib/suppliers/registry";
import { getNotifier } from "@/lib/notify";
import type { PlaceOrderAddress } from "@/lib/suppliers/types";

export async function placeExternalOrder(orderId: string) {
  const notifier = getNotifier();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new Error(`Order ${orderId} not found`);

  const address = order.shippingAddressJson as unknown as PlaceOrderAddress;

  // Group items by supplier — one order may mix CJ + AliExpress products
  const grouped = new Map<Supplier, typeof order.items>();
  for (const item of order.items) {
    const arr = grouped.get(item.supplier) ?? [];
    arr.push(item);
    grouped.set(item.supplier, arr);
  }

  let allOk = true;

  for (const [supplierName, items] of grouped.entries()) {
    const supplier = getSupplier(supplierName);
    try {
      const result = await supplier.placeOrder({
        internalOrderId: order.id,
        address,
        items: items.map((i) => ({
          externalProductId: i.product.externalProductId,
          qty: i.qty,
        })),
      });

      await prisma.orderItem.updateMany({
        where: { id: { in: items.map((i) => i.id) } },
        data: {
          externalOrderId: result.externalOrderId,
          supplierStatus: result.status,
          supplierLastSyncAt: new Date(),
        },
      });

      await notifier.info("supplier.placed", {
        orderId: order.id,
        supplier: supplierName,
        externalOrderId: result.externalOrderId,
      });
    } catch (err) {
      allOk = false;
      await prisma.orderItem.updateMany({
        where: { id: { in: items.map((i) => i.id) } },
        data: { supplierStatus: "FAILED", supplierLastSyncAt: new Date() },
      });
      await notifier.error("supplier.placeOrder.failed", {
        orderId: order.id,
        supplier: supplierName,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (allOk) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.SUPPLIER_PLACED },
    });
  }
}
