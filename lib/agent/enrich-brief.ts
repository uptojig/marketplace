/**
 * Brief enrichment — injects real product data from CJ catalog
 * into the agent brief BEFORE it enters the Claude session.
 *
 * Ported from PromptPage's enrich-brief.ts to work standalone
 * with the marketplace's CJ adapter.
 */

import { cjAdapter } from "@/lib/suppliers/cj/adapter";

export type NoProductsReason =
  | "cj_not_configured"
  | "no_matches"
  | "cj_unreachable";

export class NoProductsError extends Error {
  reason: NoProductsReason;
  constructor(reason: NoProductsReason, message: string) {
    super(`ไม่มีสินค้า — ${message}`);
    this.name = "NoProductsError";
    this.reason = reason;
  }
}

// Thai → English keyword mapping for CJ search
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  // Thai keywords
  เคสมือถือ: ["phone case"],
  เคสโทรศัพท์: ["phone case"],
  เคส: ["phone case", "protective case"],
  เสื้อผ้า: ["clothing", "fashion"],
  เสื้อ: ["shirt", "top"],
  กางเกง: ["pants", "trousers"],
  กระโปรง: ["skirt"],
  ชุดเดรส: ["dress"],
  รองเท้า: ["shoes", "sneakers"],
  กระเป๋า: ["bag", "handbag"],
  แฟชั่น: ["fashion", "clothing"],
  เกาหลี: ["korean fashion"],
  แว่นตา: ["glasses", "sunglasses"],
  นาฬิกา: ["watch", "smartwatch"],
  เครื่องประดับ: ["jewelry", "accessories"],
  สร้อย: ["necklace"],
  แหวน: ["ring"],
  ต่างหู: ["earring"],
  หูฟัง: ["earphone", "headphone"],
  ลำโพง: ["speaker", "bluetooth"],
  ที่ชาร์จ: ["charger"],
  สายชาร์จ: ["charging cable"],
  แบตเตอรี่: ["power bank", "battery"],
  มือถือ: ["phone", "mobile"],
  โทรศัพท์: ["phone"],
  คอมพิวเตอร์: ["computer", "laptop"],
  คีย์บอร์ด: ["keyboard"],
  เมาส์: ["mouse"],
  บ้าน: ["home decor"],
  ของแต่งบ้าน: ["home decoration"],
  โคมไฟ: ["lamp", "light"],
  หมอน: ["pillow"],
  ครัว: ["kitchen", "kitchenware"],
  เครื่องสำอาง: ["cosmetics", "makeup"],
  สกินแคร์: ["skincare"],
  ครีม: ["cream"],
  กีฬา: ["sports", "fitness"],
  ออกกำลังกาย: ["fitness", "gym"],
  ของเล่น: ["toys"],
  เด็ก: ["kids", "baby"],
  สัตว์เลี้ยง: ["pet", "pet supplies"],
  แมว: ["cat", "pet"],
  สุนัข: ["dog", "pet"],
  รถยนต์: ["car accessories"],
  GPS: ["GPS tracker"],
  ติดตาม: ["tracker", "GPS"],
  เฟอร์นิเจอร์: ["furniture"],
  ความงาม: ["beauty", "skincare"],
  อาหาร: ["food", "snack"],
  เทคโนโลยี: ["electronics", "gadget"],
  ของขวัญ: ["gift", "gift set"],
};

// English keyword fallbacks
const EN_KEYWORDS: Record<string, string[]> = {
  pet: ["pet supplies", "pet accessories"],
  pets: ["pet supplies"],
  tracker: ["GPS tracker", "smart tracker"],
  gps: ["GPS tracker"],
  case: ["phone case"],
  phone: ["mobile phone", "smartphone"],
  watch: ["watch", "smartwatch"],
  laptop: ["laptop", "computer"],
  fashion: ["fashion", "clothing"],
  shoes: ["shoes", "sneakers"],
  bag: ["bag", "handbag"],
  beauty: ["beauty", "skincare"],
  kitchen: ["kitchen", "kitchenware"],
  home: ["home decor"],
  sports: ["sports", "fitness"],
  toys: ["toys", "kids"],
  jewelry: ["jewelry", "accessories"],
  furniture: ["furniture", "sofa"],
  electronics: ["electronics", "gadget"],
};

/**
 * Extract search keywords from brief text.
 */
function extractSearchTerms(brief: string): string[] {
  const terms: string[] = [];
  const lower = brief.toLowerCase();

  // Thai keyword matching (substring)
  for (const [keyword, english] of Object.entries(CATEGORY_KEYWORDS)) {
    if (brief.includes(keyword)) terms.push(...english);
  }

  // English keyword matching (word boundary)
  for (const [keyword, english] of Object.entries(EN_KEYWORDS)) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "i");
    if (re.test(lower)) terms.push(...english);
  }

  // Fallback: look for quoted text
  if (terms.length === 0) {
    const quoted = brief.match(/["'"]([^"'"]+)["'"]/g);
    if (quoted) {
      terms.push(...quoted.map((q) => q.replace(/["'"]/g, "").trim()));
    }
  }

  // Last resort: strip Thai prefixes, use remaining text
  if (terms.length === 0) {
    const stripped = brief
      .replace(/^(ขาย|ร้าน|สร้าง|ทำ|เปิด|เว็บ)/g, "")
      .replace(/[^฀-๿a-zA-Z0-9\s]/g, "")
      .trim();
    if (stripped.length > 0) {
      terms.push(stripped.slice(0, 40));
    } else {
      terms.push("trending products");
    }
  }

  return [...new Set(terms)].slice(0, 3);
}

/**
 * NSFW filter — reject explicit adult products.
 */
const NSFW_RE =
  /\b(?:vibrat(?:ing|or)|dildo|erotic|penis|sex[-\s]?toy|adult[-\s]?toy|masturbat\w*|orgasm|clitor\w*|anal[-\s]?plug|fleshlight|bondage|fetish[-\s]?gear|bdsm)\b/i;

interface EnrichedProduct {
  externalProductId: string;
  title: string;
  priceTHB: number;
  imageUrl: string | undefined;
  categoryName: string | null;
}

/**
 * Strip operator-side product placeholders BEFORE enrichment runs.
 *
 * Some older marketplace prompt templates and external test callers send
 * briefs with hard-coded lines like:
 *   "Products already curated for this store (0 items). Use THESE —
 *    do NOT call searchMarketplaceProducts again."
 *
 * If this text survives into the final brief alongside our newly-injected
 * "(N items)" block, the agent sees TWO contradictory product statements
 * and may obey the first (refuse to build the schema). Strip the
 * placeholder so only OUR injected list remains.
 *
 * Also strips standalone references to the legacy `searchMarketplaceProducts`
 * / `find_products` tools — those tools no longer exist in v3.
 */
function stripOperatorProductPlaceholders(brief: string): string {
  return brief
    // "Products already curated for this store (0 items). Use THESE — do NOT call ... ."
    .replace(
      /Products?\s+already\s+curated\s+for\s+this\s+store\s+\(\s*0\s+items?\s*\)\.[^\n]*?(?:\.|$)/gi,
      "",
    )
    // Standalone "do NOT call searchMarketplaceProducts" / "do not call find_products"
    .replace(
      /[Dd]o\s+NOT\s+call\s+(?:searchMarketplaceProducts|find_products)[^\n]*/g,
      "",
    )
    // Collapse 3+ consecutive newlines that may result from the strip
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Enrich a brief with real product data from CJ catalog.
 * Returns the enriched brief text with product list appended.
 * Throws NoProductsError if no products can be found.
 */
export async function enrichBriefWithProducts(
  brief: string,
): Promise<{ enrichedBrief: string; products: EnrichedProduct[] }> {
  // Check CJ is configured
  if (!process.env.CJ_API_KEY) {
    throw new NoProductsError(
      "cj_not_configured",
      "CJ_API_KEY ยังไม่ได้ตั้งค่า",
    );
  }

  // Strip the marketplace-side "Products already curated (0 items)" template
  // BEFORE we extract terms or append our own product list. Otherwise the
  // agent sees two contradictory product statements and the first one wins.
  const cleanBrief = stripOperatorProductPlaceholders(brief);

  const searchTerms = extractSearchTerms(cleanBrief);
  const allProducts: EnrichedProduct[] = [];
  let queriesSucceeded = 0;

  for (const term of searchTerms) {
    if (allProducts.length >= 12) break;
    try {
      const result = await cjAdapter.listCatalog({
        search: term,
        pageSize: Math.min(6, 6 - allProducts.length),
      });
      for (const p of result.items) {
        allProducts.push({
          externalProductId: p.externalProductId,
          title: p.title,
          priceTHB: p.priceTHB,
          imageUrl: p.imageUrl,
          categoryName:
            (p.raw as Record<string, unknown>)?.categoryName as string ?? null,
        });
      }
      queriesSucceeded++;
    } catch (err) {
      console.warn(`[enrichBrief] CJ query "${term}" failed:`, err);
    }
  }

  if (queriesSucceeded === 0 && allProducts.length === 0) {
    throw new NoProductsError(
      "cj_unreachable",
      "CJ API ตอบไม่ได้ — ลองใหม่อีกครั้ง",
    );
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = allProducts.filter((p) => {
    if (seen.has(p.externalProductId)) return false;
    seen.add(p.externalProductId);
    return true;
  });

  // NSFW filter
  const safe = unique.filter((p) => {
    const haystack = [p.title, p.categoryName ?? ""].join(" ");
    return !NSFW_RE.test(haystack);
  });

  const products = safe.slice(0, 6);

  if (products.length === 0) {
    throw new NoProductsError(
      "no_matches",
      "ค้นหาสินค้าไม่เจอใน CJ catalog — ลองเปลี่ยนคำค้นหา",
    );
  }

  // Format product list
  const productList = products
    .map(
      (p, i) =>
        `${i + 1}. id="${p.externalProductId}" — ${p.title} — ฿${p.priceTHB}` +
        (p.categoryName ? ` — ${p.categoryName}` : "") +
        (p.imageUrl ? ` — image: ${p.imageUrl}` : ""),
    )
    .join("\n");

  const enrichedBrief =
    cleanBrief +
    `\n\nProducts already curated for this store (${products.length} items). Use THESE — do NOT generate fake products.\n\n${productList}`;

  return { enrichedBrief, products };
}
