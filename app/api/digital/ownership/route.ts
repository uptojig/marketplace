/**
 * GET /api/digital/ownership?productId=<id>
 *
 * Returns whether the signed-in buyer already holds an active
 * DigitalUnlock for the product. Used by the sheetlab PDP to swap the
 * buy buttons for a "owned · download" CTA so buyers can't
 * accidentally pay twice for the same template.
 *
 * Guests get `{ owned: false }` (no 401) — the PDP just shows the
 * normal buy buttons in that case.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkProductUnlock } from "@/lib/digital/unlocks";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.email) {
    return NextResponse.json({ owned: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ owned: false });
  }

  const info = await checkProductUnlock(user.id, productId);
  return NextResponse.json({
    owned: info.active,
    unlockId: info.unlockId ?? null,
  });
}
