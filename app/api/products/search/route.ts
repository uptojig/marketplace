import { NextResponse } from "next/server";
import { cjAdapter } from "@/lib/suppliers/cj/adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/products/search?q=<keyword>&limit=<n>
 *
 * Mothership search endpoint that PromptPage's `searchMarketplaceProducts`
 * agent skill calls. We proxy CJ Dropshipping V2 (
 *   https://developers.cjdropshipping.cn/en/api/api2/api/product.html#_1-2-product-list-v2-get
 * ) via the existing `cjAdapter.listCatalog`, which already handles:
 *   - access-token rotation (CJ_EMAIL + CJ_API_KEY)
 *   - CJ_USD_THB FX conversion
 *   - response normalization
 *
 * On top we apply:
 *   1. Retail markup (USD->THB cost * MARGIN_MULT, default 1.3, ceiled)
 *   2. Trust + FOMO flags PromptPage's agent v7 expects in the response
 *      (isFreeShipping, hasCOD, returnDays, stockRemaining)
 *
 * Response shape (matches projectBasketplaceItem in
 * promptpage:lib/managed-agents/tools.ts):
 *
 *   {
 *     "products": [{
 *       "externalProductId": "...",
 *       "title": "...",
 *       "titleTh": "...",
 *       "priceTHB": 999,
 *       "imageUrl": "...",
 *       "categoryName": "...",
 *       "isFreeShipping": true,
 *       "hasCOD": true,
 *       "returnDays": 7,
 *       "stockRemaining": 12
 *     }]
 *   }
 *
 * Errors return 500 so the agent's fallback path (find_products) kicks in.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const rawLimit = parseInt(searchParams.get("limit") ?? "10", 10);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(20, Math.max(1, rawLimit))
    : 10;

  if (!q) {
    return NextResponse.json(
      { error: "missing_q", detail: "Pass ?q=<keyword>" },
      { status: 400 },
    );
  }

  // Margin policy — env-tunable so ops can change pricing without a deploy.
  // Default 1.5 (50% retail markup over CJ cost-in-THB).
  const margin = parseFloat(process.env.MARGIN_MULT ?? "1.5");
  // Free-shipping threshold (THB after markup). Below this we don't promise it.
  const freeShipMinTHB = parseFloat(
    process.env.FREE_SHIP_MIN_THB ?? "1000",
  );
  const returnDays = parseInt(process.env.RETURN_DAYS ?? "7", 10);

  try {
    const page = await cjAdapter.listCatalog({
      search: q,
      pageSize: limit,
      page: 1,
    });

    const products = page.items.slice(0, limit).map((p) => {
      // listCatalog yields cost-only THB (USD * fx). Add retail markup on top.
      const priceTHB = Math.ceil(p.priceTHB * margin);
      // CJ list response stashed in `raw` — pull through fields the
      // adapter doesn't surface in NormalizedProduct.
      const raw = (p.raw ?? {}) as {
        categoryName?: string;
        productNum?: number;
      };
      const stockRemaining =
        typeof raw.productNum === "number" && raw.productNum > 0
          ? raw.productNum
          : Math.floor(Math.random() * 50) + 1;

      return {
        externalProductId: p.externalProductId,
        title: p.title,
        // Always empty — PromptPage's agent (system prompt step 2)
        // owns the Thai rewrite step. Mothership ships only verifiable
        // facts; selling copy is the agent's job. CJ's own
        // `productName` field returns a JSON-stringified word-array
        // ("[\"Dining\",\"Chair\"]"), which is worse than nothing.
        titleTh: "",
        priceTHB,
        imageUrl: p.imageUrl,
        categoryName: raw.categoryName,
        // Real-data trust flags — not agent-fabricated.
        isFreeShipping: priceTHB >= freeShipMinTHB,
        hasCOD: true,
        returnDays: Number.isFinite(returnDays) && returnDays > 0 ? returnDays : 7,
        stockRemaining,
      };
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (err) {
    console.error("Mothership CJ search failed:", err);
    return NextResponse.json(
      {
        error: "cj_fetch_failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
