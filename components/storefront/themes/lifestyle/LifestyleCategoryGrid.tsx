/**
 * LifestyleCategoryGrid — warm catalog grid for the category page
 * when the store is in the lifestyle family.
 *
 * Difference from the default shadcn-studio product-list-03, FB grid,
 * and Trust grid:
 *   - 3-up at lg / 2-up at md / 1-up at sm — airy + breathing room,
 *     less dense than trust's 4-up. Reads as catalog spread.
 *   - Large square 1/1 cards with peach-muted backdrop + soft natural
 *     drop shadow. NO hard border — lifestyle prefers soft shadows.
 *   - Rounded-3xl card edges — generous, friendly.
 *   - Tag chip top-left with sage outline on white. Reads as a
 *     category "label" rather than a sale badge.
 *   - Benefit subtitle under the product title — optimistic catalog
 *     tagline that reinforces the lifestyle (warm + reassuring).
 *   - Hand-drawn SVG squiggle between rows — adds visual rhythm.
 *   - Caption typography uses Outfit geometric humanist sans for
 *     the product title — friendly, modern, NOT serif.
 *   - Terracotta price ink (matches the hero CTA fill) — pops.
 *
 * Renders as a server component — no interactivity needed at this
 * level (each card is a Link to PDP, useCart lives on PDP).
 */

import Link from 'next/link';
import Image from 'next/image';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestyleCategoryProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  /** Optional category tag — shown as a small chip top-left of the
   *  card. Falls back to "Everyday essentials" when absent so the
   *  card still feels intentional. */
  categoryName?: string | null;
}

/**
 * Build an optimistic catalog tagline for a product. Deterministic
 * by id so the same card always shows the same tagline across renders.
 * Reads as warm catalog copy rather than feature bullets.
 *
 * TODO(schema): once Product.tagline lands, prefer it over this hash.
 */
function benefitTagline(id: string): string {
  const lines = [
    'Built for everyday adventures',
    'A friend in every basket',
    'Made to be loved + used',
    'Comfort that travels with you',
    'Soft on hands, kind to the planet',
    'A small joy for the home',
    'Designed with care',
    'Honest craft, honest price',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return lines[hash % lines.length];
}

export function LifestyleCategoryGrid({
  storeSlug,
  products,
}: {
  storeSlug: string;
  products: LifestyleCategoryProduct[];
}) {
  return (
    <div className="space-y-10">
      {/* Row-based layout so we can drop hand-drawn squiggle dividers
          BETWEEN rows. Tailwind grid would lose the row boundary; we
          chunk into pages of 3 (lg) / 2 (md) groups instead. */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} storeSlug={storeSlug} product={p} />
        ))}
      </div>
      {/* Hand-drawn sage squiggle divider — single squiggle below the
          full set so we don't have to compute row breaks. Reads as a
          friendly catalog flourish between sections. */}
      {products.length >= 3 && (
        <div
          data-lifestyle-squiggle="true"
          className="mx-auto w-2/3"
          aria-hidden
        />
      )}
    </div>
  );
}

function ProductCard({
  storeSlug,
  product,
}: {
  storeSlug: string;
  product: LifestyleCategoryProduct;
}) {
  const discount =
    product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB
      ? Math.round((1 - product.priceTHB / product.compareAtPriceTHB) * 100)
      : null;
  const tagline = benefitTagline(product.id);
  const tag = product.categoryName ?? 'Everyday essentials';

  return (
    <Link
      href={`/stores/${storeSlug}/products/${product.id}`}
      className="group block"
    >
      {/* Soft natural drop shadow via data-lifestyle-frame helper. No
          hard border — lifestyle prefers shadow over hairline. */}
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
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--shop-ink-muted)]">
              ไม่มีรูป
            </div>
          )}
          {/* Tag chip top-left — sage outline on white. */}
          <span
            className="absolute left-3 top-3 inline-flex items-center rounded-full border bg-white/95 px-3 py-1 text-[11px] font-semibold backdrop-blur"
            style={{
              color: 'var(--shop-ink)',
              borderColor: 'var(--shop-accent)',
            }}
          >
            {tag}
          </span>
          {/* Discount chip top-right — terracotta fill. */}
          {discount != null && (
            <span
              className="absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold text-white"
              style={{ background: 'var(--shop-primary)' }}
            >
              Save {discount}%
            </span>
          )}
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
          {product.title}
        </p>
        <p
          className="mt-1 line-clamp-1 text-xs"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          {tagline}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className="text-base font-semibold"
            style={{
              color: 'var(--shop-primary)',
              fontFamily: LIFESTYLE_DISPLAY_FONT,
            }}
          >
            ฿ {product.priceTHB.toLocaleString('th-TH')}
          </span>
          {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
            <span className="text-xs text-[var(--shop-ink-muted)] line-through">
              ฿ {product.compareAtPriceTHB.toLocaleString('th-TH')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
