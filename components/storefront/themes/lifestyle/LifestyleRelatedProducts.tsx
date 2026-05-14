/**
 * LifestyleRelatedProducts — bespoke warm-catalog "more from the basket"
 * row for lifestyle PDPs.
 *
 * Difference from the inline related grid in
 * `app/stores/[slug]/products/[id]/page.tsx` AND the FB / trust / BM /
 * electronics-tech / specialty related rows:
 *   - Sage caps eyebrow ("More from the basket · {storeName}") — friendly
 *     catalog voice, branded by store name. Reads as a soft handover from
 *     the PDP into the rest of the basket.
 *   - Outfit / Plus Jakarta Sans display h2 ("You may also love") — same
 *     geometric humanist sans the rest of the lifestyle family uses, NOT
 *     serif. Pairs with DM Sans body.
 *   - Sage SVG squiggle divider ABOVE the grid (data-lifestyle-squiggle)
 *     — adds the same hand-drawn rhythm flourish the catalog grid uses
 *     between rows; signals "this is a fresh row, slow down".
 *   - 3-up rounded-3xl pillow cards — MORE curved than the 2xl cards
 *     other families use. Generous, friendly, mood-board feel.
 *   - Card body: 1/1 image on muted peach backdrop framed inside a
 *     rounded-3xl pillow + Outfit title + warm tag chip + sage-outlined
 *     terracotta price. Optional compare-at price shown struck-through.
 *   - Soft natural drop shadow via `data-lifestyle-frame` helper — no
 *     hard border. Lifestyle prefers shadow over hairline.
 *   - Renders nothing when products is empty so an unfilled store sees
 *     no awkward orphan section.
 *
 * Server component — each card is a Link to PDP, no client interactivity
 * (useCart lives on PDP). Keeps the component RSC-friendly so it can be
 * called directly from `app/stores/[slug]/products/[id]/page.tsx`
 * without a "use client" wrapper.
 */

import Link from 'next/link';
import Image from 'next/image';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestyleRelatedProduct {
  id: string;
  title: string;
  titleTh: string | null;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

export interface LifestyleRelatedProductsProps {
  storeSlug: string;
  storeName: string;
  products: LifestyleRelatedProduct[];
}

/**
 * Friendly catalog-voice tag chip that hangs in the top-left of each
 * card. Deterministic by id so the same card always shows the same chip
 * across renders. Reads as a "mood" label, not a sale badge.
 *
 * TODO(schema): once Product.tagline / Product.moodTag lands, prefer it
 * over this hash so operators can author the chip directly.
 */
function moodChip(id: string): string {
  const moods = [
    'Cozy pick',
    'Quietly useful',
    'Slow-living',
    'A small joy',
    'Made to be loved',
    'Soft on hands',
    'Honest craft',
    'Everyday warmth',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return moods[hash % moods.length];
}

export function LifestyleRelatedProducts({
  storeSlug,
  storeName,
  products,
}: LifestyleRelatedProductsProps) {
  // Empty-state short-circuit — keeps PDPs of brand-new stores from
  // rendering a lonely "you may also love" with nothing under it.
  if (!products || products.length === 0) return null;

  return (
    <section className="my-16 space-y-6">
      {/* Warm catalog header — sage eyebrow + Outfit display h2 */}
      <div className="space-y-2">
        <p
          className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: 'var(--shop-accent)' }}
        >
          More from the basket · {storeName}
        </p>
        <h2
          className="text-3xl sm:text-4xl"
          style={{
            fontFamily: LIFESTYLE_DISPLAY_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
          }}
        >
          You may also love
        </h2>
      </div>

      {/* Sage hand-drawn squiggle divider — same rhythm flourish the
          catalog grid + brand story panels use. Anchors the section
          before the cards so the eye reads the eyebrow / h2 / squiggle
          / grid as a single warm unit. */}
      <div
        data-lifestyle-squiggle="true"
        className="w-1/3 max-w-[180px]"
        aria-hidden
      />

      {/* 3-up rounded-3xl pillow grid — more curved than other families
          for that mood-board feel. 1-up on phones, 2-up on tablets,
          3-up on laptops + desktop. */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => (
          <RelatedCard key={p.id} storeSlug={storeSlug} product={p} />
        ))}
      </div>
    </section>
  );
}

function RelatedCard({
  storeSlug,
  product,
}: {
  storeSlug: string;
  product: LifestyleRelatedProduct;
}) {
  // Prefer the localised Thai title when present — matches the rest of
  // the storefront. Fall back to the canonical English title otherwise.
  const displayTitle = product.titleTh ?? product.title;
  const tag = moodChip(product.id);
  const hasCompare =
    product.compareAtPriceTHB != null &&
    product.compareAtPriceTHB > product.priceTHB;

  return (
    <Link
      href={`/stores/${storeSlug}/products/${product.id}`}
      className="group block"
    >
      {/* Soft natural drop shadow via data-lifestyle-frame helper. NO
          hard border — lifestyle prefers shadow over hairline. The
          rounded-3xl pillow is the visual signature of this family. */}
      <div
        data-lifestyle-frame="true"
        className="relative overflow-hidden rounded-3xl bg-white transition duration-300"
      >
        <div
          className="relative overflow-hidden bg-[var(--shop-muted)]"
          style={{ aspectRatio: '1 / 1' }}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={displayTitle}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-xs"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              ไม่มีรูป
            </div>
          )}
          {/* Warm mood-tag chip top-left — sage outline on white,
              matches LifestyleCategoryGrid's chip styling so the visual
              vocabulary stays consistent across catalog + PDP. */}
          <span
            className="absolute left-3 top-3 inline-flex items-center rounded-full border bg-white/95 px-3 py-1 text-[11px] font-semibold backdrop-blur"
            style={{
              color: 'var(--shop-ink)',
              borderColor: 'var(--shop-accent)',
            }}
          >
            {tag}
          </span>
        </div>
      </div>

      <div className="px-1 pt-5">
        <p
          className="line-clamp-2 text-base leading-tight"
          style={{
            color: 'var(--shop-ink)',
            fontFamily: LIFESTYLE_DISPLAY_FONT,
            fontWeight: 600,
          }}
        >
          {displayTitle}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          {/* Sage / terracotta price ink — matches the catalog grid +
              hero CTA fill so price reads as the "buy here" colour
              across the whole lifestyle storefront. */}
          <span
            className="text-base font-semibold"
            style={{
              color: 'var(--shop-primary)',
              fontFamily: LIFESTYLE_DISPLAY_FONT,
            }}
          >
            ฿ {product.priceTHB.toLocaleString('th-TH')}
          </span>
          {hasCompare && product.compareAtPriceTHB != null && (
            <span
              className="text-xs line-through"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              ฿ {product.compareAtPriceTHB.toLocaleString('th-TH')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
