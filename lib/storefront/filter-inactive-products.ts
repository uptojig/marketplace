/**
 * Filter products in a v12 schema down to those still active in the
 * store's catalog.
 *
 * Why this exists:
 *   The agent bakes specific product_id references into OfferGrid /
 *   ProductHero blocks at generation time. When an operator later
 *   removes a product via the picker (soft-delete: active=false) or
 *   the row gets hard-deleted, the schema keeps pointing at it. The
 *   storefront then renders dead cards that 404 on click.
 *
 *   Rather than force a Regenerate Landing run on every catalog
 *   change, we filter at render time. The agent's curation of
 *   layout / copy / order survives; only the products themselves
 *   shrink to match reality.
 *
 * Behaviour:
 *   - OfferGrid blocks: remove products[] / items[] entries whose
 *     product_id (or productId / id) isn't in the active set.
 *     Block is dropped entirely if it ends up empty.
 *   - ProductHero blocks: drop the whole block if its product_id is
 *     inactive (no fallback content to show).
 *   - Other block types pass through untouched.
 *   - Pure: returns a new shallow-cloned schema instead of mutating.
 */

interface BlockLike {
  blockType?: string;
  type?: string;
  content?: Record<string, unknown>;
}

interface PageLike {
  slug?: string;
  blocks?: BlockLike[];
}

const OFFER_GRID_TYPES = new Set(["OfferGrid", "ProductGrid", "Catalog"]);
const PRODUCT_HERO_TYPES = new Set(["ProductHero", "FeaturedProduct"]);

function pickItemId(item: unknown): string | null {
  if (!item || typeof item !== "object") return null;
  const r = item as Record<string, unknown>;
  const v = r.product_id ?? r.productId ?? r.id ?? r.externalProductId;
  return typeof v === "string" ? v : null;
}

/** Optional fallback: when the schema's OfferGrid would empty out
 *  (e.g. the agent generated against a product set the operator has
 *  since fully replaced), substitute the block's products[] with the
 *  store's CURRENT active catalog so home / about / etc. don't render
 *  with empty section bodies. Same idea for ProductHero. */
export interface FallbackProduct {
  externalProductId: string;
  title: string;
  titleTh?: string | null;
  priceTHB: number;
  imageUrl?: string | null;
}

function toItem(p: FallbackProduct): Record<string, unknown> {
  return {
    product_id: p.externalProductId,
    title: p.titleTh ?? p.title,
    titleTh: p.titleTh ?? p.title,
    priceTHB: p.priceTHB,
    imageUrl: p.imageUrl ?? undefined,
  };
}

export function filterInactiveProductsFromSchema<T extends Record<string, unknown>>(
  schema: T,
  activeProductIds: Set<string>,
  fallbackProducts?: FallbackProduct[],
): T {
  if (!schema || typeof schema !== "object") return schema;
  const pages = schema.pages as PageLike[] | undefined;
  if (!Array.isArray(pages)) return schema;

  // Empty active set is a real signal (store has zero active products)
  // rather than an unset filter — let it through and we'll drop blocks
  // that reference anything.

  const newPages = pages.map((page) => {
    if (!page || !Array.isArray(page.blocks)) return page;
    let pageTouched = false;
    const newBlocks: BlockLike[] = [];

    for (const block of page.blocks) {
      const blockType = block?.blockType ?? block?.type ?? "";

      // ── OfferGrid: filter inner products[] / items[] ──
      if (OFFER_GRID_TYPES.has(blockType)) {
        const content = (block.content ?? {}) as Record<string, unknown>;
        // Agent v3 emits `products`; older schemas use `items`. Filter
        // whichever shape we see and write it back to the same key.
        const list =
          (content.products as unknown[] | undefined) ??
          (content.items as unknown[] | undefined);
        if (!Array.isArray(list)) {
          // Block has a non-list `products` (malformed) — pass through
          // so the block renderer's own defensive defaults can handle.
          newBlocks.push(block);
          continue;
        }
        const filtered = list.filter((item) => {
          const id = pickItemId(item);
          // Items without a product_id slip through — they're hand-
          // authored cards that aren't tied to a DB row.
          if (id === null) return true;
          return activeProductIds.has(id);
        });
        if (filtered.length === list.length) {
          // Nothing to filter — pass through unchanged so React
          // reconciliation doesn't think this is a new node.
          newBlocks.push(block);
          continue;
        }
        if (filtered.length === 0) {
          // Whole grid is dead. Two outcomes depending on whether the
          // caller passed a fallback:
          //   - With fallback: substitute current products so the page
          //     keeps showing inventory. Cap at original list length
          //     so a 4-up grid stays 4-up (or up to 6 if the original
          //     was longer than what we have).
          //   - Without fallback: drop the block — better than a
          //     section header with nothing under it.
          if (fallbackProducts && fallbackProducts.length > 0) {
            pageTouched = true;
            const cap = Math.min(
              Math.max(list.length, 4),
              fallbackProducts.length,
              12,
            );
            const replacement = fallbackProducts.slice(0, cap).map(toItem);
            const newContent = {
              ...content,
              ...(content.products !== undefined ? { products: replacement } : { products: replacement }),
              ...(content.items !== undefined ? { items: replacement } : {}),
            };
            newBlocks.push({ ...block, content: newContent });
          } else {
            pageTouched = true;
          }
          continue;
        }
        pageTouched = true;
        const newContent = {
          ...content,
          ...(content.products !== undefined ? { products: filtered } : {}),
          ...(content.items !== undefined ? { items: filtered } : {}),
        };
        newBlocks.push({ ...block, content: newContent });
        continue;
      }

      // ── ProductHero: substitute or drop based on fallback ──
      if (PRODUCT_HERO_TYPES.has(blockType)) {
        const content = (block.content ?? {}) as Record<string, unknown>;
        const id = pickItemId(content);
        if (id !== null && !activeProductIds.has(id)) {
          if (fallbackProducts && fallbackProducts.length > 0) {
            pageTouched = true;
            const sub = fallbackProducts[0];
            newBlocks.push({
              ...block,
              content: { ...content, ...toItem(sub) },
            });
          } else {
            pageTouched = true;
          }
          continue;
        }
        newBlocks.push(block);
        continue;
      }

      newBlocks.push(block);
    }

    return pageTouched ? { ...page, blocks: newBlocks } : page;
  });

  return { ...schema, pages: newPages };
}
