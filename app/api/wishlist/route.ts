/**
 * GET    /api/wishlist                    — signed-in user's saved items
 * POST   /api/wishlist                    — add productId to wishlist
 * DELETE /api/wishlist?productId=<id>     — remove productId from wishlist
 *
 * Auth: signed-in only. Guests get 401 with a flag the client uses
 * to nudge them to sign in (the heart toggle still hydrates from a
 * local placeholder so guests don't see a broken UI).
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  addToWishlist,
  removeFromWishlist,
  listWishlist,
} from "@/lib/wishlist";

async function resolveUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const items = await listWishlist(userId);
  return NextResponse.json({ items });
}

const postSchema = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  try {
    await addToWishlist({ userId, productId: parsed.data.productId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }
  await removeFromWishlist({ userId, productId });
  return NextResponse.json({ ok: true });
}
