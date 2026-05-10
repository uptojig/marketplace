import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cjAdapter } from "@/lib/suppliers/cj/adapter";
import { aliexpressAdapter } from "@/lib/suppliers/aliexpress/adapter";

/**
 * GET /api/store/categories/suggestions
 *
 * Lists candidates the operator can adopt as proper Category rows:
 *
 *   - `legacy`: distinct `Product.categoryName` values for products
 *     in this store that don't yet have a `categoryId` (i.e. labels
 *     that came from supplier import or earlier free-form entry).
 *     Each entry includes a count so the dashboard can prioritize.
 *
 *   - `cj` / `aliexpress`: supplier first-level categories. Pure
 *     labels; the operator can create empty Category rows from them
 *     and then bulk-assign products into them later. Each supplier
 *     section degrades to `{ available: false }` when its API key
 *     isn't configured so the panel still renders the others.
 *
 * Existing slugs in this store are also returned so the client can
 * dedupe + warn before posting to the import endpoint.
 */
export async function GET() {
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

  // Legacy categoryNames not yet bucketed into a Category row.
  // Group + count so the UI can show "เสื้อผ้า (37)" badges.
  const legacyGroups = await prisma.product.groupBy({
    by: ["categoryName"],
    where: {
      storeId,
      categoryId: null,
      categoryName: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { categoryName: "desc" } },
  });
  const legacy = legacyGroups
    .filter((g) => g.categoryName !== null)
    .map((g) => ({ name: g.categoryName as string, count: g._count._all }));

  // Supplier categories — fetched in parallel; each side degrades
  // independently so a flaky CJ doesn't blank the AliExpress list.
  const [cjRes, aeRes] = await Promise.all([
    process.env.CJ_API_KEY
      ? cjAdapter
          .categories()
          .then((items) => ({ available: true, items }))
          .catch((err) => {
            console.warn("[categories/suggestions] CJ fetch failed:", err);
            return { available: false, items: [] };
          })
      : Promise.resolve({ available: false, items: [] }),
    process.env.ALIEXPRESS_APP_KEY && process.env.ALIEXPRESS_APP_SECRET
      ? aliexpressAdapter
          .categories()
          .then((items) => ({ available: true, items }))
          .catch((err) => {
            console.warn(
              "[categories/suggestions] AliExpress fetch failed:",
              err,
            );
            return { available: false, items: [] };
          })
      : Promise.resolve({ available: false, items: [] }),
  ]);

  // Existing slugs — used by the client to suppress the "create"
  // CTA on candidates whose obvious slug is already taken.
  const existing = await prisma.category.findMany({
    where: { storeId },
    select: { slug: true, name: true },
  });

  return NextResponse.json({
    legacy,
    cj: {
      available: cjRes.available,
      items: cjRes.items.map((c) => ({ id: c.id, name: c.name })),
    },
    aliexpress: {
      available: aeRes.available,
      items: aeRes.items.map((c) => ({ id: c.id, name: c.name })),
    },
    existing,
  });
}
