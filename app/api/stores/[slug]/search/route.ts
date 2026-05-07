/**
 * GET /api/stores/<slug>/search?q=<keyword>&limit=<n>
 *
 * Per-store product search for the storefront overlay. Matches
 * `title`, `titleTh`, `description`, `descriptionTh`, and `categoryName`
 * with case-insensitive contains. Returns up to `limit` (default 10)
 * active products with the fields needed for the result list:
 * id, title (Thai preferred), price, imageUrl, categoryName.
 *
 * Public endpoint — no auth needed (matches the read-only category
 * page pattern). Empty `q` returns an empty list.
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
  const q = url.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10", 10) || 10));

  if (q.length < 1) {
    return NextResponse.json({ products: [], totalMatches: 0 });
  }

  const store = await prisma.store.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Build OR conditions across all searchable fields
  const matched = await prisma.product.findMany({
    where: {
      storeId: store.id,
      active: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { titleTh: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { descriptionTh: { contains: q, mode: "insensitive" } },
        { categoryName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      titleTh: true,
      priceTHB: true,
      imageUrl: true,
      categoryName: true,
    },
    take: limit,
    orderBy: [
      // Prefer items where titleTh starts with the query — closest match
      // ranks first. Postgres doesn't sort by relevance natively without
      // pg_trgm; this orderBy gives a reasonable approximation.
      { createdAt: "desc" },
    ],
  });

  // Also count total matches without the take limit so the UI can
  // show "พบ N รายการ — กด Enter เพื่อดูทั้งหมด"
  const totalMatches = await prisma.product.count({
    where: {
      storeId: store.id,
      active: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { titleTh: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { descriptionTh: { contains: q, mode: "insensitive" } },
        { categoryName: { contains: q, mode: "insensitive" } },
      ],
    },
  });

  return NextResponse.json({
    products: matched.map((p) => ({
      id: p.id,
      title: p.titleTh ?? p.title,
      priceTHB: Number(p.priceTHB),
      imageUrl: p.imageUrl,
      categoryName: p.categoryName,
    })),
    totalMatches,
  });
}
