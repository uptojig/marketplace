import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderFromCart } from "@/lib/orders/create";
import { createPayment } from "@/lib/anypay/client";

const checkoutSchema = z.object({
  storeSlug: z.string().min(1).optional(),
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
  couponCodes: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  // Resolve the buyer. Logged-in shoppers map onto their existing User
  // row; guests get a fresh User created per checkout, identified only
  // by the name/phone they typed into the shipping form. This satisfies
  // the security constraint that closed the shared `guest@marketplace
  // .local` hole (orders no longer collide across anonymous visitors,
  // /api/addresses still 401s for unauthed reads) while letting guest
  // checkout work end-to-end. Email stays null — Postgres treats null
  // as distinct so the @unique constraint allows many guest rows.
  let userId: string;
  const session = await getServerSession(authOptions).catch(() => null);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 401 });
    }
    userId = user.id;
  } else {
    const guest = await prisma.user.create({
      data: {
        email: null,
        name: parsed.data.address.recipientName,
        phone: parsed.data.address.phone,
      },
    });
    userId = guest.id;
  }

  try {
    const order = await createOrderFromCart({
      userId,
      items: parsed.data.items,
      address: parsed.data.address,
      couponCodes: parsed.data.couponCodes,
    });

    const payment = await createPayment({
      orderId: order.id,
      amountTHB: Number(order.totalTHB),
      customerEmail: session?.user?.email ?? undefined,
      description: `Marketplace order ${order.id}`,
      storeSlug: parsed.data.storeSlug,
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
