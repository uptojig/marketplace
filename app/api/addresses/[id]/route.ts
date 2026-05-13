import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Resolve the signed-in user, or null. Per the same SECURITY note in
 * /api/addresses/route.ts — no guest fallback. The shared
 * `guest@marketplace.local` row was removed in PR #31 (P0 leak fix).
 */
async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.email) return null;
  const u = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return u?.id ?? null;
}

async function resolveStoreId(slug: string | null | undefined): Promise<string | null> {
  if (!slug) return null;
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true },
  });
  return store?.id ?? null;
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // NextAuth-only — deleting an address is a meaningful op that
  // shouldn't fall through to a shared guest user. Old cookie-session
  // path was a /onboarding leftover and was always null after that
  // flow shipped.
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Phase 1C: every mutation is scoped by (userId, storeId) so a user
  // can't probe / delete addresses they own at a different store via
  // a request issued from this store's context.
  const { searchParams } = new URL(req.url);
  const storeSlug = searchParams.get("storeSlug");
  if (!storeSlug) {
    return NextResponse.json({ error: "Missing storeSlug" }, { status: 400 });
  }
  const storeId = await resolveStoreId(storeSlug);
  if (!storeId) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Look up with userId + storeId in the where-clause so we never
  // delete (or leak the existence of) an address belonging to the
  // user at a different store.
  const found = await prisma.address.findFirst({
    where: { id: params.id, userId, storeId },
    select: { id: true },
  });
  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
