/**
 * GET /api/products/categories — list CJ first-level categories.
 *
 * Used by the admin product picker's category dropdown so operators
 * can browse "อุปกรณ์สัตว์เลี้ยง" / "มือถือ & อุปกรณ์เสริม" / etc.
 * without typing English keywords. The CJ adapter already handles
 * the Thai translation via CJ_CATEGORY_TH.
 *
 * Response:
 *   { categories: [{ id, name }] }
 *
 * Cached for 1 hour at the edge — CJ's first-level categories don't
 * change often and this endpoint is hit on every picker mount.
 */

import { NextResponse } from "next/server";
import { cjAdapter } from "@/lib/suppliers/cj/adapter";

export const runtime = "nodejs";
// Skip build-time prerender — CJ creds may not be valid at build, so
// running the adapter during `next build` produces a noisy 500 in the
// log. Browser/CDN Cache-Control below still gives a 1-hour TTL.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.CJ_API_KEY) {
    return NextResponse.json(
      { error: "cj_not_configured" },
      { status: 503 },
    );
  }

  try {
    const categories = await cjAdapter.categories();
    return NextResponse.json(
      { categories },
      {
        // Browser/CDN caching reinforces the ISR revalidate above so
        // the picker doesn't hit /api on every dropdown open.
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      },
    );
  } catch (err) {
    console.error("CJ categories failed:", err);
    return NextResponse.json(
      {
        error: "cj_fetch_failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
