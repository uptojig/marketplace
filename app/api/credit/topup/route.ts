/**
 * POST /api/credit/topup
 *
 * Buyer-initiated credit top-up. Creates a CreditTopup row + AnyPay
 * intent. Returns { paymentUrl } so the client can redirect the buyer
 * to the gateway. The AnyPay webhook eventually flips the topup to
 * PAID and credits the balance.
 *
 * Body: { storeSlug: string, amountTHB: number }
 *
 * Auth: signed-in user only. Guests can't top up — the balance is
 * keyed on User.id which doesn't exist for anonymous visitors.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTopupIntent } from "@/lib/credit/topup";

const schema = z.object({
  storeSlug: z.string().min(1),
  // Hard cap of 100,000 THB per top-up so a typo or hostile script
  // can't move 7-figure sums in one shot. Buyers can top up multiple
  // times if they really need more.
  amountTHB: z.number().int().positive().max(100_000),
  /** Must be true — the buyer ticked the "ยอมรับเงื่อนไขการเติมเครดิต"
   *  checkbox. Required for chargeback defense. */
  tosAccepted: z.literal(true),
  /** Slug of the ToS document version the buyer saw. Stored on the
   *  CreditTopup row alongside tosAcceptedAt. */
  tosVersion: z.string().min(1).max(60),
});

/** Server-side ToS version constant. Bump this string whenever the
 *  /terms/credit page changes; new top-ups stamp the new version and
 *  old rows keep their original. */
export const CURRENT_CREDIT_TOS_VERSION = "credit-2026-05-26";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 401 });
  }

  const store = await prisma.store.findUnique({
    where: { slug: parsed.data.storeSlug },
    select: { id: true, slug: true, isActive: true },
  });
  if (!store || !store.isActive) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Server-side ToS check — reject anything that doesn't match the
  // currently-published version. A buyer who saw a stale form (e.g.
  // open tab during a ToS update) is forced to re-confirm.
  if (parsed.data.tosVersion !== CURRENT_CREDIT_TOS_VERSION) {
    return NextResponse.json(
      {
        error: "เงื่อนไขการเติมเครดิตมีการอัปเดต กรุณารีโหลดหน้านี้แล้วยอมรับใหม่",
        code: "TOS_VERSION_MISMATCH",
        currentVersion: CURRENT_CREDIT_TOS_VERSION,
      },
      { status: 409 },
    );
  }

  // Capture chargeback-defense evidence at intent creation time. We
  // honor X-Forwarded-For (added by Caddy / load balancers) but only
  // trust the FIRST hop — downstream entries can be forged by the
  // client. Falls back to the direct connection IP otherwise.
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ipAddress =
    xff.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || undefined;
  const userAgent = req.headers.get("user-agent")?.slice(0, 1000) ?? undefined;

  try {
    const result = await createTopupIntent({
      userId: user.id,
      storeId: store.id,
      storeSlug: store.slug,
      amountTHB: parsed.data.amountTHB,
      customerEmail: user.email ?? undefined,
      ipAddress,
      userAgent,
      tosVersion: parsed.data.tosVersion,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[credit/topup]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Top-up failed" },
      { status: 500 },
    );
  }
}
