/**
 * GET /api/wizard/cj-products?search=&page=&pageSize=
 *
 * Server-side search of the CJ catalog used by the create-store
 * wizard's Phase 3 product picker. Mirrors `cjAdapter.listCatalog()`
 * but exposes a slim, sanitized payload for the wizard UI:
 *   { items: [{ externalProductId, title, priceTHB, imageUrl }],
 *     page, pageSize, total, hasMore }
 *
 * Auth: requires a signed-in user. Anyone with a session can browse
 * the catalog (this is the picker — it does not import). Importing
 * happens server-side in createStoreFromWizard, gated by the same
 * session check + 1-store-per-user rule.
 *
 * Rate-limit: CJ throttles ~1 req/sec on /product/list. We do not
 * cache here — the wizard typically only calls this 2-3 times per
 * merchant, so a CJ-backed call per request is fine. Heavier callers
 * (e.g. an admin importer) should layer their own cache.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cjAdapter } from "@/lib/suppliers/cj/adapter";

export const dynamic = "force-dynamic";

const MAX_PAGE_SIZE = 30;
const DEFAULT_PAGE_SIZE = 20;

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "unauthenticated" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim() || undefined;
  const category = url.searchParams.get("category")?.trim() || undefined;
  const pageRaw = parseInt(url.searchParams.get("page") ?? "1", 10);
  const pageSizeRaw = parseInt(
    url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    10,
  );
  const page = Math.max(1, isNaN(pageRaw) ? 1 : pageRaw);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(4, isNaN(pageSizeRaw) ? DEFAULT_PAGE_SIZE : pageSizeRaw),
  );

  try {
    const result = await cjAdapter.listCatalog({
      page,
      pageSize,
      search,
      category,
    });
    return NextResponse.json({
      items: result.items.map((p) => ({
        externalProductId: p.externalProductId,
        title: p.title,
        priceTHB: p.priceTHB,
        imageUrl: p.imageUrl,
      })),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (err) {
    console.error("[/api/wizard/cj-products]", err);
    return NextResponse.json(
      {
        error: "cj_unavailable",
        message:
          err instanceof Error
            ? err.message
            : "ไม่สามารถดึงสินค้าจาก CJ ได้ในขณะนี้",
      },
      { status: 502 },
    );
  }
}
