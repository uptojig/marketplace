import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderFromCart } from "@/lib/orders/create";
import { createPayment } from "@/lib/anypay/client";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().positive(),
      }),
    )
    .min(1),
  address: z.object({
    recipientName: z.string().min(1),
    phone: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional().default(""),
    subdistrict: z.string().optional().default(""),
    district: z.string().optional().default(""),
    province: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().default("TH"),
  }),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  // SECURITY: Require a real signed-in user. The previous version
  // fell back to a single shared `guest@marketplace.local` row when
  // no session was present, which let anonymous checkouts attribute
  // orders to the same user record across visitors — and let any
  // visitor query that user's address history via /api/addresses.
  // If we ever want guest checkout back, we have to scope guest
  // identity with a per-browser cookie token, not a shared DB row.
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const userId = user.id;

  try {
    const order = await createOrderFromCart({
      userId,
      items: parsed.data.items,
      address: parsed.data.address,
    });

    const payment = await createPayment({
      orderId: order.id,
      amountTHB: Number(order.totalTHB),
      customerEmail: session?.user?.email ?? undefined,
      description: `Marketplace order ${order.id}`,
    });

    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        anypayTransactionId: payment.transactionId,
        rawCreateResponse: payment.raw as never,
      },
    });

    return NextResponse.json({ orderId: order.id, paymentUrl: payment.paymentUrl });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
