/**
 * GET /api/stores/<slug>/products/verify-ids?ids=a,b,c
 *
 * Returns the subset of `ids` that still exist as active products in
 * this store. Used by RecentlyViewedRail to scrub deleted products
 * from the localStorage rail without forcing the user to clear it.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get("ids")?.trim() ?? "";
  if (!idsParam) {
    return NextResponse.json({ validIds: [] });
  }

  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);

  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const rows = await prisma.product.findMany({
    where: {
      storeId: store.id,
      active: true,
      id: { in: ids },
    },
    select: { id: true },
  });

  return NextResponse.json({ validIds: rows.map((r) => r.id) });
}
