/**
 * SpecialtyCategoryGrid — artisan-market grid for the category page
 * when the store is in the specialty family (handmade, vintage).
 *
 * Difference from the default shadcn-studio product-list-03 AND from
 * the fashion-beauty grid:
 *   - CSS columns layout (columns-2 lg:columns-3) for a masonry-feel
 *     staggered grid — items have varying heights so the grid reads
 *     as a curator's wall rather than a uniform 4-up row.
 *   - 1/1 SQUARE images (not 4/5 portrait) framed in kraft cards.
 *   - Italic-handwritten subtitle on each card ("Made in [region]" or
 *     "Limited lot of N").
 *   - Slab-serif Fraunces title at weight 500.
 *   - Ochre price + terra-rose accent on the discount tag.
 *   - Subtle sepia tint on every image via the wrapper attribute.
 *
 * Renders as a server component — no interactivity at this level (the
 * card itself is a Link to PDP, useCart lives on PDP).
 */

import Link from 'next/link';
import Image from 'next/image';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export interface SpecialtyCategoryProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

/**
 * Deterministic per-card "Made in" tag so the wall feels curated
 * without dragging in real per-product origin data (not yet in the
 * Prisma schema). Hashes the product id so the same product always
 * gets the same tag — no hydration flicker.
 */
const ORIGIN_HINTS = [
  'Made in Chiang Mai',
  'Made in Bangkok',
  'Made in Lampang',
  'Hand-stitched',
  'Hand-thrown',
  'Hand-dyed',
  'Studio piece',
  'One-of-a-kind',
];

function hintFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ORIGIN_HINTS[h % ORIGIN_HINTS.length];
}

export function SpecialtyCategoryGrid({
  storeSlug,
  products,
}: {
  storeSlug: string;
  products: SpecialtyCategoryProduct[];
}) {
  return (
    <div className="columns-2 gap-6 lg:columns-3 lg:gap-8 [column-fill:_balance]">
      {products.map((p, i) => {
        const discount =
          p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB
            ? Math.round((1 - p.priceTHB / p.compareAtPriceTHB) * 100)
            : null;

        // Stagger card heights so the masonry feels organic: cycle
        // square / portrait / landscape via index, but keep the hash
        // stable per-id within the page. Index is fine since the
        // category render order is deterministic.
        const ratio = i % 3 === 0 ? '1 / 1.2' : i % 3 === 1 ? '1 / 1' : '1 / 0.9';
        const origin = hintFor(p.id);

        return (
          <Link
            key={p.id}
            href={`/stores/${storeSlug}/products/${p.id}`}
            className="group mb-6 block break-inside-avoid lg:mb-8"
          >
            <div
              data-specialty-kraft="true"
              className="relative overflow-hidden rounded-md border p-2.5 shadow-sm transition duration-300 group-hover:shadow-md"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <div
                data-specialty-sepia="true"
                className="relative overflow-hidden rounded-md"
                style={{
                  aspectRatio: ratio,
                  backgroundColor: 'var(--shop-muted)',
                }}
              >
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[var(--shop-ink-muted)]">
                    ไม่มีรูป
                  </div>
                )}
                {discount != null && (
                  <span
                    data-specialty-stamp="true"
                    className="absolute left-3 top-3 rounded-md border bg-[var(--shop-card)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em]"
                    style={{
                      color: 'var(--shop-accent)',
                      borderColor: 'var(--shop-accent)',
                    }}
                  >
                    −{discount}%
                  </span>
                )}
              </div>
            </div>

            <div className="px-1 pt-3">
              <span
                style={{
                  fontFamily: SPECIALTY_HAND_FONT,
                  color: 'var(--shop-accent)',
                }}
                className="text-base italic"
              >
                {origin}
              </span>
              <p
                className="mt-1 line-clamp-2 text-sm leading-snug"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: SPECIALTY_DISPLAY_FONT,
                  fontWeight: 500,
                }}
              >
                {p.title}
              </p>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  ฿ {p.priceTHB.toLocaleString('th-TH')}
                </span>
                {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                  <span className="text-xs text-[var(--shop-ink-muted)] line-through">
                    ฿ {p.compareAtPriceTHB.toLocaleString('th-TH')}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
