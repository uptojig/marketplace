/**
 * TrustRelatedProducts — bespoke heritage "From the Collection" section
 * for Trust-family PDPs. Replaces the inline ternary block in
 * `app/stores/[slug]/products/[id]/page.tsx` with a self-contained
 * server component that owns the gallery-wall related-products voice.
 *
 * Visual language is anchored to TrustCategoryGrid: 4-up SQUARE 1/1
 * imagery inside gold-rule ivory frames with sharp `rounded-sm`
 * corners — no pill shapes, no soft shadow drift, no rose price ink.
 * Section header is a centered heritage cartouche (caps eyebrow + a
 * Playfair "You may also like" headline + gold hairline rule), echoing
 * the TrustCategoryPage hero band so the related rail reads as a
 * sibling room of the same maison gallery.
 *
 * Each card carries a Playfair title, the deterministic "BP-XXXXXX"
 * heritage SKU stamp (top-left over imagery), and a sober charcoal
 * price (slate-900 via `--shop-ink`) — never the rose accent. Compare-at
 * prices show a hairline strikethrough + a squared "SAVE %" stamp,
 * matching the catalogue grid's data-as-label posture.
 *
 * Server component — each card is a Link to the PDP, no client state.
 * Renders nothing if `products` is empty so unfilled stores don't see
 * an awkward orphan band below the brand-story panel.
 */

import Link from 'next/link';
import Image from 'next/image';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

export interface TrustRelatedProduct {
  id: string;
  title: string;
  titleTh: string | null;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

export interface TrustRelatedProductsProps {
  storeSlug: string;
  storeName: string;
  products: TrustRelatedProduct[];
}

/**
 * Build a deterministic 6-char SKU from the product id — kept inline
 * (mirrors the helper in TrustCategoryGrid / TrustProductHero) so this
 * component has no cross-file dependency on either neighbour.
 */
function heritageSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `BP-${hash}`;
}

export function TrustRelatedProducts({
  storeSlug,
  storeName,
  products,
}: TrustRelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="my-16 sm:my-20">
      {/* Heritage cartouche header — centered caps eyebrow + Playfair
          headline + gold hairline rule. Echoes the cartouche from
          TrustCategoryPage so the related rail reads as a sibling
          gallery wall of the same maison. */}
      <header className="mb-10 text-center sm:mb-12">
        <p
          className="text-[11px] uppercase"
          style={{
            color: 'var(--shop-accent)',
            letterSpacing: '0.28em',
            fontWeight: 600,
          }}
        >
          จากคอลเลกชัน · {storeName}
        </p>
        <h2
          className="mt-3 text-3xl sm:text-4xl"
          style={{
            fontFamily: TRUST_DISPLAY_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
          }}
        >
          คุณอาจชอบสินค้าเหล่านี้
        </h2>
        <div
          aria-hidden
          className="mx-auto mt-5 h-px w-16"
          style={{ background: 'var(--shop-accent)' }}
        />
      </header>

      {/* 4-up square gallery wall — mirrors TrustCategoryGrid card
          posture (sharp rounded-sm, gold-rule frame, edge-to-edge 1/1
          image, no inner white mat). */}
      <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => {
          const displayTitle = p.titleTh ?? p.title;
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
              <div
                data-trust-frame="true"
                className="relative overflow-hidden rounded-sm border bg-white transition duration-300"
                style={{ borderColor: 'var(--shop-accent)' }}
              >
                <div
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: '1 / 1',
                    background: 'var(--shop-muted)',
                  }}
                >
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={displayTitle}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[10px] uppercase"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        letterSpacing: '0.22em',
                        fontWeight: 600,
                      }}
                    >
                      ไม่มีรูป
                    </div>
                  )}

                  {/* Heritage SKU stamp — top-left corner, sober
                      ivory chip with gold trim. Small mono caps reads
                      as label data, not flair. */}
                  <span
                    className="absolute left-3 top-3 rounded-sm border bg-white/95 px-2 py-0.5 font-mono text-[10px] uppercase backdrop-blur-sm"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      borderColor: 'var(--shop-accent)',
                      letterSpacing: '0.22em',
                    }}
                  >
                    {heritageSku(p.id)}
                  </span>

                  {discount != null && (
                    <span
                      className="absolute right-3 top-3 rounded-sm border bg-white px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        color: 'var(--shop-ink)',
                        borderColor: 'var(--shop-accent)',
                        letterSpacing: '0.22em',
                      }}
                    >
                      ลด {discount}%
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
                  {displayTitle}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    ฿ {p.priceTHB.toLocaleString('th-TH')}
                  </span>
                  {p.compareAtPriceTHB &&
                    p.compareAtPriceTHB > p.priceTHB && (
                      <span
                        className="text-xs tabular-nums line-through"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        ฿ {p.compareAtPriceTHB.toLocaleString('th-TH')}
                      </span>
                    )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
