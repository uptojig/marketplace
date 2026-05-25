/**
 * Shared types and tiny pure helpers for the admin block-editor.
 *
 * `Block` and `Page` mirror what the landing-builder agent emits.
 * Content is `Record<string, unknown>` because each blockType has
 * its own shape — typed forms in `./block-forms/*` narrow this at
 * use-site, everything else falls back to JSON editing.
 */
export type Block = { blockType: string; content: Record<string, unknown> };
export type Page = { slug: string; isHomepage?: boolean; blocks: Block[] };

/** Block types the AddBlock picker offers. Order matches the
 *  decreasing frequency seen in shipped stores. */
export const BLOCK_TYPES: ReadonlyArray<string> = [
  "HeroBanner",
  "CategoryBanner",
  "ProductHero",
  "OfferGrid",
  "Gallery",
  "Bundle",
  "Stats",
  "Features",
  "Testimonial",
  "Reviews",
  "FAQ",
  "CTA",
  "Countdown",
];

/** Block types that ship with a dedicated typed form. Everything
 *  else falls back to raw JSON editing. */
export const TYPED_FORM_BLOCK_TYPES: ReadonlyArray<string> = [
  "HeroBanner",
  "CategoryBanner",
  "OfferGrid",
  "FAQ",
  "CTA",
];

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

/**
 * One-line summary string shown under each block in the sortable
 * list — pulls the most-recognisable field per blockType.
 */
export function blockSummary(block: Block): string {
  const c = block.content ?? {};
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  switch (block.blockType) {
    case "HeroBanner":
      return truncate(str(c.headline) || str(c.subheadline) || "Hero", 40);
    case "OfferGrid":
      return `${arr(c.items).length} สินค้า`;
    case "Stats":
      return `${arr(c.items).length} สถิติ`;
    case "Features":
      return `${arr(c.items).length} features`;
    case "FAQ":
      return `${arr(c.items).length} คำถาม`;
    case "Testimonial":
      return `${arr(c.quotes ?? c.items).length} รีวิว`;
    case "Reviews":
      return `${arr(c.items ?? c.reviews).length} รีวิว`;
    case "CTA":
      return truncate(str(c.headline) || str(c.buttonText) || "CTA", 40);
    case "ProductHero":
      return truncate(str(c.headline) || str(c.title) || "Product", 40);
    case "CategoryBanner":
      return `${arr(c.items ?? c.categories).length} หมวด`;
    case "Gallery":
      return `${arr(c.items ?? c.images).length} รูป`;
    case "Bundle":
      return truncate(str(c.title) || "Bundle", 40);
    case "Countdown":
      return truncate(str(c.headline) || "Countdown", 40);
    default:
      return block.blockType;
  }
}
