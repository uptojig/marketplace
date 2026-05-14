/**
 * TrustCategoryGrid — department-store catalog grid for the
 * category page when the store is in the trust family.
 *
 * Difference from the default shadcn-studio product-list-03 AND
 * from FashionBeautyCategoryGrid:
 *   - 4-up at lg / 3-up at md / 2-up at sm (denser than FB)
 *   - Squared cards (rounded-sm) with hairline border — NO rounded
 *     glow, NO soft shadow drift.
 *   - Square 1/1 imagery (vs FB's 4/5 portrait), edge-to-edge inside
 *     a single gold-rule frame. No inner white mat.
 *   - Caption typography uses Playfair serif for the product title.
 *   - Heritage SKU + Est. line under the title — small mono / serif
 *     pair reads as label data, not flair.
 *   - Gold hairline separator BETWEEN rows (data-trust-rule pattern
 *     via top border on every card past the first row).
 *   - Charcoal price ink (slate-900), not rose; "SAVE %" outlined
 *     gold pill replaced with a squared mono badge.
 *
 * Renders as a server component — no interactivity needed at this
 * level (each card is a Link to PDP, useCart lives on PDP).
 */

import Link from 'next/link';
import Image from 'next/image';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

export interface TrustCategoryProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

/**
 * Build a deterministic 6-char SKU from the product id — see
 * TrustProductHero. Kept inline so the category grid doesn't depend
 * on the PDP component.
 */
function heritageSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `BP-${hash}`;
}

export function TrustCategoryGrid({
  storeSlug,
  products,
}: {
  storeSlug: string;
  products: TrustCategoryProduct[];
}) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => {
        const discount =
          p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB
            ? Math.round((1 - p.priceTHB / p.compareAtPriceTHB) * 100)
            : null;

        return (
          <Link
            key={p.id}
            href={`/stores/${storeSlug}/products/${p.id}`}
            className="group block"
          >
            {/* Gold-rule frame, image bleeds edge-to-edge inside.
                No outer white card mat — heritage feels solid. */}
            <div
              data-trust-frame="true"
              className="relative overflow-hidden rounded-sm border bg-white transition duration-300"
              style={{ borderColor: 'var(--shop-accent)' }}
            >
              <div
                className="relative overflow-hidden bg-[var(--shop-muted)]"
                style={{ aspectRatio: '1 / 1' }}
              >
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[var(--shop-ink-muted)]">
                    ไม่มีรูป
                  </div>
                )}
                {discount != null && (
                  <span
                    className="absolute left-3 top-3 rounded-sm border bg-white px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{
                      color: 'var(--shop-ink)',
                      borderColor: 'var(--shop-accent)',
                      letterSpacing: '0.22em',
                    }}
                  >
                    SAVE {discount}%
                  </span>
                )}
              </div>
            </div>

            <div className="px-1 pt-4">
              <p
                className="line-clamp-2 text-sm leading-tight"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: TRUST_DISPLAY_FONT,
                  fontWeight: 600,
                }}
              >
                {p.title}
              </p>
              <p
                className="mt-1 font-mono text-[10px] uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.22em',
                }}
              >
                {heritageSku(p.id)}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--shop-ink)' }}
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
