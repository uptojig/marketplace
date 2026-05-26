import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderFromCart } from "@/lib/orders/create";
import { createPayment } from "@/lib/anypay/client";
import { runPostPaidHooks } from "@/lib/orders/markPaid";
import { spendCredit, InsufficientCreditError } from "@/lib/credit/spend";

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
  // Optional: omitted ONLY for all-digital orders. createOrderFromCart
  // re-checks that every line is DIGITAL before allowing a missing
  // address (so a hostile client can't skip shipping by lying).
  address: z
    .object({
      recipientName: z.string().min(1),
      phone: z.string().min(1),
      line1: z.string().min(1),
      line2: z.string().optional().default(""),
      subdistrict: z.string().optional().default(""),
      district: z.string().optional().default(""),
      province: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().default("TH"),
    })
    .optional(),
  /** Contact info for guests on all-digital orders (no shipping address
   *  to mine name/phone from). Ignored when `address` is present. */
  guestContact: z
    .object({
      name: z.string().min(1).optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  couponCodes: z.array(z.string()).optional(),
  /** ANYPAY (default) routes through the gateway; CREDIT burns the
   *  buyer's per-store credit balance. CREDIT requires a signed-in
   *  user — guests can never have credit. */
  paymentMethod: z.enum(["ANYPAY", "CREDIT"]).optional().default("ANYPAY"),
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
  // Credit payment requires identity. Reject guests before we even
  // resolve the order — saves us creating a guest User row that will
  // immediately fail the spend.
  const session = await getServerSession(authOptions).catch(() => null);
  if (parsed.data.paymentMethod === "CREDIT" && !session?.user?.email) {
    return NextResponse.json(
      { error: "ต้องเข้าสู่ระบบเพื่อใช้เครดิต" },
      { status: 401 },
    );
  }

  let userId: string;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 401 });
    }
    userId = user.id;
  } else {
    // Guest path needs *some* identity. For physical orders it comes
    // from the shipping address; for all-digital orders it comes from
    // the guestContact block. If neither is present we can't even seed
    // a User row (and the buyer would have no way to access /account
    // /downloads later anyway).
    const guestName =
      parsed.data.address?.recipientName
      ?? parsed.data.guestContact?.name;
    const guestPhone =
      parsed.data.address?.phone
      ?? parsed.data.guestContact?.phone
      ?? null;
    const guestEmail = parsed.data.guestContact?.email ?? null;
    if (!guestName) {
      return NextResponse.json(
        { error: "ต้องระบุชื่อผู้สั่งซื้อ" },
        { status: 400 },
      );
    }
    const guest = await prisma.user.create({
      data: {
        email: guestEmail,
        name: guestName,
        phone: guestPhone,
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

    if (parsed.data.paymentMethod === "CREDIT") {
      // Resolve the store id from the first order item — all lines in
      // an order share a store today, and credit is per-store. If a
      // future multi-store cart lands, this needs to fail fast.
      const firstItem = await prisma.orderItem.findFirst({
        where: { orderId: order.id },
        select: { storeId: true },
      });
      if (!firstItem) {
        return NextResponse.json(
          { error: "Order has no items" },
          { status: 500 },
        );
      }

      try {
        await prisma.$transaction(async (tx) => {
          await spendCredit(tx as never, {
            userId,
            storeId: firstItem.storeId,
            amountTHB: Number(order.totalTHB),
            orderId: order.id,
          });
          // markOrderPaidByCredit flips Payment + Order to PAID inside
          // this same transaction so a partial failure rolls back the
          // credit burn. Post-paid hooks (digital unlocks, emails) fire
          // AFTER the transaction commits — they are not transactional.
          await tx.payment.updateMany({
            where: { orderId: order.id, status: "PENDING" },
            data: { status: "PAID", paidAt: new Date(), provider: "CREDIT" },
          });
          await tx.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          });
        });
      } catch (err) {
        if (err instanceof InsufficientCreditError) {
          // Clean up the order so the buyer can retry. Cascade delete
          // wipes OrderItem / Payment rows.
          await prisma.order.delete({ where: { id: order.id } });
          return NextResponse.json(
            {
              error: `เครดิตไม่พอ — ต้องการ ฿${err.required.toLocaleString()} แต่มี ฿${err.available.toLocaleString()}`,
              code: "INSUFFICIENT_CREDIT",
              requiredTHB: err.required,
              availableTHB: err.available,
            },
            { status: 402 },
          );
        }
        throw err;
      }

      // Post-paid fan-out runs here, OUTSIDE the spend transaction —
      // digital unlocks, fulfillment emails, supplier hand-off.
      await runPostPaidHooks(order.id, { via: "credit" });

      return NextResponse.json({
        orderId: order.id,
        paid: true,
        paymentMethod: "CREDIT",
      });
    }

    // ── Default ANYPAY path ──
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
