/**
 * GET /api/checkout/product-types?ids=<csv>
 *
 * Returns each product's `productType` so the client checkout flow can
 * decide whether to skip shipping. The client cart line stores its own
 * `productType` flag in localStorage, but legacy carts (added before
 * the field existed) lack it — this endpoint is the authoritative
 * source of truth so we never accidentally collect a shipping address
 * for a digital-only order.
 *
 * Public — no auth required. Reads are cheap and a guest checkout
 * needs to hit this on the address step.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, productType: true, digitalKind: true },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      productType: p.productType,
      digitalKind: p.digitalKind,
    })),
  });
}
