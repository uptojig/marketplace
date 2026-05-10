import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/store/categories/bulk-assign
 *
 * Body: { productIds: string[]; categoryId: string | null }
 *
 * Assigns many products to a single Category in one round-trip
 * (or detaches them when categoryId === null). Designed for the
 * checkbox-grid bulk action on /dashboard/store/categories.
 *
 * Auth + scoping: every productId must belong to the caller's store,
 * and (when non-null) categoryId must too. Mixed-ownership requests
 * return 403 — we don't silently skip rows because the caller would
 * get a misleading "ok: count=N" with the wrong N.
 *
 * Side effect: keeps Product.categoryName in sync with the assigned
 * Category.name (or NULL when detaching) so storefront tiles render
 * the right label without an extra JOIN.
 */

const schema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(500),
  categoryId: z.string().min(1).nullable(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { store: true },
  });
  if (!user?.store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  const storeId = user.store.id;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { productIds, categoryId } = parsed.data;

  // Verify every productId belongs to the caller's store before we
  // touch anything. The dashboard UI only shows owned rows, so a
  // mismatch here is either a stale tab or a tampered request.
  const owned = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId },
    select: { id: true },
  });
  if (owned.length !== productIds.length) {
    return NextResponse.json(
      { error: "บางสินค้าไม่ได้อยู่ในร้านนี้" },
      { status: 403 },
    );
  }

  let categoryName: string | null = null;
  if (categoryId !== null) {
    const cat = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { storeId: true, name: true },
    });
    if (!cat || cat.storeId !== storeId) {
      return NextResponse.json({ error: "ไม่พบหมวดหมู่" }, { status: 404 });
    }
    categoryName = cat.name;
  }

  const result = await prisma.product.updateMany({
    where: { id: { in: productIds }, storeId },
    data: {
      categoryId,
      // Detach: clear the denormalized label too. Attach: mirror the
      // category's display name. Either keeps storefront tiles tidy.
      categoryName,
    },
  });

  return NextResponse.json({ ok: true, count: result.count });
}
