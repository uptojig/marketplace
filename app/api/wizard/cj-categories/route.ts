/**
 * GET /api/wizard/cj-categories
 *
 * Returns the CJ first-level category list (Thai-translated via the
 * CJ_CATEGORY_TH map in lib/suppliers/cj/adapter.ts) for the wizard's
 * Phase 3 product picker. Used to render the horizontal chip row that
 * filters the catalog by category.
 *
 * Auth: requires a signed-in user (same gate as /api/wizard/cj-products
 * — the picker only runs inside the create-store wizard).
 *
 * Cache: the CJ category list barely changes, so we let Next.js cache
 * the response for 1 hour with `revalidate = 3600`. Saves a CJ call on
 * every wizard render and keeps the picker snappy.
 *
 * Response shape: { items: Array<{ id: string; name: string }> }
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cjAdapter } from "@/lib/suppliers/cj/adapter";

export const revalidate = 3600;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  try {
    const categories = await cjAdapter.categories();
    return NextResponse.json({
      items: categories.map((c) => ({ id: c.id, name: c.name })),
    });
  } catch (err) {
    console.error("[/api/wizard/cj-categories]", err);
    return NextResponse.json(
      {
        error: "cj_unavailable",
        message:
          err instanceof Error
            ? err.message
            : "ไม่สามารถดึงหมวดหมู่จาก CJ ได้ในขณะนี้",
      },
      { status: 502 },
    );
  }
}
