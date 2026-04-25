import { OrderStatus, PaymentProvider, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PlaceOrderAddress } from "@/lib/suppliers/types";

export interface CartLine {
  productId: string;
  qty: number;
}

export interface CreateOrderInput {
  userId: string;
  items: CartLine[];
  address: PlaceOrderAddress;
  shippingTHB?: number;
}

export async function createOrderFromCart(input: CreateOrderInput) {
  if (!input.items.length) throw new Error("Cart is empty");

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, active: true },
  });

  if (products.length !== input.items.length) {
    throw new Error("Some products are unavailable");
  }

  const lineMap = new Map(input.items.map((i) => [i.productId, i.qty]));
  const subtotal = products.reduce((acc, p) => {
    const qty = lineMap.get(p.id) ?? 0;
    return acc.add(new Prisma.Decimal(p.priceTHB).mul(qty));
  }, new Prisma.Decimal(0));

  const shipping = new Prisma.Decimal(input.shippingTHB ?? 0);
  const total = subtotal.add(shipping);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: input.userId,
        status: OrderStatus.PENDING_PAYMENT,
        subtotalTHB: subtotal,
        shippingTHB: shipping,
        totalTHB: total,
        shippingAddressJson: input.address as unknown as Prisma.InputJsonValue,
        items: {
          create: products.map((p) => ({
            productId: p.id,
            storeId: p.storeId,
            qty: lineMap.get(p.id) ?? 1,
            unitPriceTHB: p.priceTHB,
            supplier: p.supplier,
          })),
        },
        payment: {
          create: {
            provider: process.env.ANYPAY_MODE === "mock" ? PaymentProvider.MOCK : PaymentProvider.ANYPAY,
            status: PaymentStatus.PENDING,
            amountTHB: total,
          },
        },
      },
      include: { items: true, payment: true },
    });
    return created;
  });

  return order;
}
