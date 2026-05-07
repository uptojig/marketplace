/**
 * Walk a v12 multi-page schema and replace agent-emitted placeholder
 * image URLs with the operator's uploaded assets.
 *
 * Why this exists:
 *   The managed agent fills hero banner / category banner imageUrl
 *   slots with `https://placehold.co/...` URLs because it has no idea
 *   what the operator's actual brand assets look like. When the
 *   operator later uploads a banner via /admin/stores/<id> (saved to
 *   Store.bannerUrl) we want EVERY hero banner across home / about /
 *   contact / faq / shipping / returns / privacy / terms to pick it
 *   up instantly without forcing a Regenerate Landing run.
 *
 * What we replace:
 *   - HeroBanner / Banner blocks: content.imageUrl + imageMobileUrl
 *     swap to bannerUrl when the original is a placehold.co URL.
 *   - Logo URLs are NOT touched here — those are already handled by
 *     safeHeader/safeFooter in components/storefront/MultiPageRenderer.tsx
 *     because they live in globalHeader.logo / globalFooter.brand,
 *     not inside a page's blocks.
 *
 * Behaviour rules:
 *   - We only touch placeholder URLs. If the agent (or a follow-up
 *     edit) wrote a real CDN URL we leave it alone — operator-curated
 *     content always wins.
 *   - When `bannerUrl` is null/missing we leave the placeholder in
 *     place (better the page renders SOMETHING than blank space).
 *   - Pure function: returns a new shallow-cloned schema instead of
 *     mutating the input. Safe to call from server components without
 *     surprising downstream callers.
 */

const PLACEHOLDER_HOSTS = [
  "placehold.co",
  "placehold.it",
  "placeholder.com",
  "via.placeholder.com",
  "dummyimage.com",
];

const HERO_BLOCK_TYPES = new Set([
  "HeroBanner",
  "Hero",
  "Banner",
  "PageBanner",
]);

function isPlaceholder(url: unknown): boolean {
  if (typeof url !== "string" || !url) return false;
  return PLACEHOLDER_HOSTS.some((host) => url.includes(host));
}

interface BlockLike {
  blockType?: string;
  type?: string;
  content?: Record<string, unknown>;
}

interface PageLike {
  slug?: string;
  blocks?: BlockLike[];
}

// Loose type — callers pass in their domain-specific schema (e.g.
// MultiPageShopSchema) and we trust the runtime shape. We don't
// constrain via `extends` because Prisma-generated Json types and
// the in-house schema type don't share a common interface index
// signature, and forcing one would ripple into both. `unknown` is
// safe at the property level; we narrow back to the local LikeTypes
// before each access.
export function applyStoreImagesToSchema<T extends Record<string, unknown>>(
  schema: T,
  storeBannerUrl: string | null | undefined,
): T {
  if (!schema || typeof schema !== "object") return schema;
  if (!storeBannerUrl) return schema;
  const pages = schema.pages as PageLike[] | undefined;
  if (!Array.isArray(pages)) return schema;

  // Shallow-clone the pages array; deep-clone only the blocks we
  // actually touch. Most blocks are returned by reference unchanged.
  const newPages = pages.map((page) => {
    if (!page || !Array.isArray(page.blocks)) return page;
    let touched = false;
    const newBlocks = page.blocks.map((block) => {
      const blockType = block?.blockType ?? block?.type ?? "";
      if (!HERO_BLOCK_TYPES.has(blockType)) return block;
      const content = block.content;
      if (!content || typeof content !== "object") return block;

      const wasPlaceholderDesktop = isPlaceholder(content.imageUrl);
      const wasPlaceholderMobile = isPlaceholder(content.imageMobileUrl);

      if (!wasPlaceholderDesktop && !wasPlaceholderMobile) return block;

      touched = true;
      return {
        ...block,
        content: {
          ...content,
          ...(wasPlaceholderDesktop ? { imageUrl: storeBannerUrl } : {}),
          ...(wasPlaceholderMobile ? { imageMobileUrl: storeBannerUrl } : {}),
        },
      };
    });
    return touched ? { ...page, blocks: newBlocks } : page;
  });

  return { ...schema, pages: newPages };
}
