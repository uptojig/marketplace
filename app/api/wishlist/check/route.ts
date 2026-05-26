/**
 * GET /api/wishlist/check?productId=<id>
 *
 * Single-product wishlist membership check. Returns { in: boolean }.
 * Hot path for the PDP heart toggle — kept separate from the full
 * /api/wishlist list to avoid pulling every saved item on each page
 * load.
 *
 * Guests: 200 with { in: false } (so the heart icon renders unfilled
 * without surfacing an error to the user).
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isInWishlist } from "@/lib/wishlist";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.email) {
    return NextResponse.json({ in: false, guest: true });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ in: false, guest: true });
  }
  const found = await isInWishlist({ userId: user.id, productId });
  return NextResponse.json({ in: found });
}
