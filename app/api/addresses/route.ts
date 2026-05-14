import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Resolve the signed-in user, or 401.
 *
 * SECURITY: The previous version fell back to a single shared
 * `guest@marketplace.local` row when no NextAuth session was present.
 * That meant every anonymous visitor wrote/read addresses under the
 * same user ID — i.e. any browser hitting GET /api/addresses while
 * signed-out received every other anonymous visitor's saved
 * addresses, including names, phone numbers, and street addresses.
 *
 * The fix is to require a real session for every read and write.
 * Anonymous checkout is removed from this endpoint; the checkout
 * UI must redirect to /signin?callbackUrl=... on 401. If we ever
 * want guest checkout back, we have to scope guest identity with a
 * per-browser cookie token (or session-scoped UUID), never a shared
 * DB row.
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

/**
 * Resolve a store slug to its id. Returns null when the slug doesn't
 * exist so callers can return 404 (not a silent empty array, which
 * would mask typos and let attackers probe).
 */
async function resolveStoreId(slug: string | null | undefined): Promise<string | null> {
  if (!slug) return null;
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true },
  });
  return store?.id ?? null;
}

export async function GET(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const storeSlug = searchParams.get("storeSlug");
  if (!storeSlug) {
    return NextResponse.json({ error: "Missing storeSlug" }, { status: 400 });
  }
  const storeId = await resolveStoreId(storeSlug);
  if (!storeId) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId, storeId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ addresses });
}

const createSchema = z.object({
  storeSlug: z.string().min(1),
  recipientName: z.string().min(1).max(120),
  phone: z.string().min(1).max(40),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().default(""),
  subdistrict: z.string().max(120).optional().default(""),
  district: z.string().max(120).optional().default(""),
  province: z.string().min(1).max(120),
  postalCode: z.string().min(1).max(20),
  country: z.string().default("TH"),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { storeSlug, ...addressData } = parsed.data;
  const storeId = await resolveStoreId(storeSlug);
  if (!storeId) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const created = await prisma.address.create({
    data: { ...addressData, userId, storeId },
  });
  return NextResponse.json({ address: created });
}
