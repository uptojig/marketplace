/**
 * GET /api/credit/balance?storeSlug=<slug>
 *
 * Returns the signed-in user's THB credit balance at the named store
 * plus the recent ledger entries. Used by the checkout payment picker
 * (to grey-out "ชำระด้วยเครดิต" when balance < total) and the
 * /account/credit page.
 *
 * Auth: signed-in only. 401 for guests (they can't accumulate credit).
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBalanceTHB, listLedger } from "@/lib/credit/balance";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const url = new URL(req.url);
  const storeSlug = url.searchParams.get("storeSlug");
  if (!storeSlug) {
    return NextResponse.json({ error: "storeSlug required" }, { status: 400 });
  }

  const [user, store] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    }),
    prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true, slug: true, name: true },
    }),
  ]);
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 401 });
  }
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const [balanceTHB, ledger] = await Promise.all([
    getBalanceTHB({ userId: user.id, storeId: store.id }),
    listLedger({ userId: user.id, storeId: store.id, limit: 50 }),
  ]);

  // Pull topup reference numbers in one shot so the UI can deep-link
  // to /receipts/<ref> without making N round-trips.
  const topupIds = ledger
    .map((e) => e.topupId)
    .filter((id): id is string => Boolean(id));
  const topups = topupIds.length
    ? await prisma.creditTopup.findMany({
        where: { id: { in: topupIds } },
        select: { id: true, referenceNumber: true },
      })
    : [];
  const refByTopupId = new Map(
    topups.map((t) => [t.id, t.referenceNumber] as const),
  );

  return NextResponse.json({
    store: { slug: store.slug, name: store.name },
    balanceTHB,
    ledger: ledger.map((e) => ({
      id: e.id,
      type: e.type,
      amountTHB: Number(e.amountTHB),
      balanceAfterTHB: Number(e.balanceAfter),
      orderId: e.orderId,
      topupId: e.topupId,
      topupRef: e.topupId ? (refByTopupId.get(e.topupId) ?? null) : null,
      note: e.note,
      createdAt: e.createdAt,
    })),
  });
}
