/**
 * Schema Migration: v11 (single-page) → v12 (multi-page)
 *
 * Use to migrate existing landing pages in DB to multi-page format.
 * Wraps single page schema as a multi-page schema with one homepage.
 */

import type {
  SinglePageSchema,
  MultiPageShopSchema,
  GlobalHeader,
  GlobalFooter,
  Block,
} from "@/types/multi-page-schema";

/**
 * Convert a v11 single-page schema to v12 multi-page schema.
 *
 * Strategy:
 * 1. Extract Logo/Nav/Banner/Footer blocks from `blocks[]` → globalHeader/globalFooter
 * 2. Wrap remaining blocks in a single homepage
 * 3. Preserve metadata + designFamily
 */
export function migrateV11ToV12(v11: SinglePageSchema): MultiPageShopSchema {
  const designFamily = v11.designFamily ?? (v11.themeVariant === "cute" ? "I" : "A");
  const metadata = {
    title: (v11.metadata?.title) ?? "Shop",
    description: (v11.metadata?.description) ?? "",
    ...v11.metadata,
  };

  // Separate header/footer blocks from page content
  const { globalHeader, globalFooter, pageBlocks } = extractGlobalBlocks(v11.blocks);

  return {
    schemaVersion: "12",
    metadata: metadata as MultiPageShopSchema["metadata"],
    designFamily,
    globalHeader,
    globalFooter,
    pages: [
      {
        slug: "home",
        isHomepage: true,
        blocks: pageBlocks,
      },
    ],
  };
}

/**
 * Extract Logo/Nav/Banner/Footer from blocks array.
 * Returns header/footer config + remaining page blocks.
 */
function extractGlobalBlocks(blocks: Block[]): {
  globalHeader: GlobalHeader;
  globalFooter: GlobalFooter;
  pageBlocks: Block[];
} {
  // eslint-disable-next-line
  let logoBlock: any = null;
  // eslint-disable-next-line
  let navBlock: any = null;
  // eslint-disable-next-line
  let bannerBlock: any = null;
  // eslint-disable-next-line
  let footerBlock: any = null;
  const pageBlocks: Block[] = [];

  for (const block of blocks) {
    const bt = block.blockType ?? block.type ?? "";
    switch (bt) {
      case "Logo":
        logoBlock = block.content;
        break;
      case "Nav":
        navBlock = block.content;
        break;
      case "Banner":
        bannerBlock = block.content;
        break;
      case "Footer":
        footerBlock = block.content;
        break;
      default:
        pageBlocks.push(block);
    }
  }

  // Build globalHeader
  const globalHeader: GlobalHeader = {
    logo: logoBlock
      ? {
          imageUrl: logoBlock.imageUrl ?? "",
          altText: logoBlock.altText || "โลโก้",
          linkTo: logoBlock.linkTo || "/",
          brandText: logoBlock.brandText,
          size: logoBlock.size,
        }
      : {
          imageUrl: "",
          altText: "Shop",
          linkTo: "/",
          brandText: navBlock?.brand,
        },
    nav: navBlock?.links ?? [
      { text: "หน้าแรก", href: "/" },
      { text: "สินค้า", href: "/products" },
      { text: "ติดต่อ", href: "/contact" },
    ],
    showCart: navBlock?.showCart ?? true,
    sticky: navBlock?.sticky ?? true,
    banner: bannerBlock ?? undefined,
  };

  // Build globalFooter
  const globalFooter: GlobalFooter = footerBlock ?? {
    copyright: `© ${new Date().getFullYear()}`,
  };

  return { globalHeader, globalFooter, pageBlocks };
}

/**
 * Type guard to detect schema version.
 * v11: { blocks[] } — no schemaVersion
 * v12: { schemaVersion: "12", pages[] }
 */
// eslint-disable-next-line
export function isV12Schema(schema: any): schema is MultiPageShopSchema {
  return schema?.schemaVersion === "12" && Array.isArray(schema?.pages);
}

// eslint-disable-next-line
export function isV11Schema(schema: any): schema is SinglePageSchema {
  return !schema?.schemaVersion && Array.isArray(schema?.blocks) && !schema?.pages;
}

/**
 * Auto-migrate any schema to v12 format.
 * Pass through if already v12; migrate if v11.
 */
// eslint-disable-next-line
export function ensureV12Schema(schema: any): MultiPageShopSchema {
  if (isV12Schema(schema)) {
    return schema;
  }

  if (isV11Schema(schema)) {
    return migrateV11ToV12(schema);
  }

  throw new Error("Unknown schema format — cannot migrate");
}

/**
 * Find homepage from pages array.
 * Returns the page marked isHomepage, or first page as fallback.
 */
export function findHomepage(schema: MultiPageShopSchema) {
  return schema.pages.find((p) => p.isHomepage) ?? schema.pages[0];
}

/**
 * Find page by slug.
 */
export function findPageBySlug(schema: MultiPageShopSchema, slug: string) {
  // Empty slug or "home" → homepage
  if (!slug || slug === "home") {
    return findHomepage(schema);
  }
  return schema.pages.find((p) => p.slug === slug);
}
