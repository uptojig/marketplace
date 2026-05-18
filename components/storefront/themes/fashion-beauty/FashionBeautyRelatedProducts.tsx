/**
 * FashionBeautyRelatedProducts — bespoke editorial "you may also love"
 * spread for fashion-beauty PDPs.
 *
 * Difference from the inline related strip on the generic PDP:
 *   - Italic-serif "From the editor" eyebrow instead of a plain caps
 *     "Related products" label.
 *   - Oversized Cormorant serif h2 with an italic-serif sub-line so
 *     the section reads like a magazine sidebar, not a content shelf.
 *   - Gold hairline rule under the heading (same hairline language as
 *     FashionBeautyBrandStory and FashionBeautyCategoryPage).
 *   - 3-up portrait grid using the same 4/5 white-frame card visual
 *     as FashionBeautyCategoryGrid so cards feel native to the brand.
 *   - Each card carries an italic-serif "from {storeName}" line under
 *     the title, reinforcing the boutique voice.
 *
 * Server component — no interactivity. Cards are simple Links to the
 * sibling PDP. Renders nothing if `products` is empty (no awkward
 * empty frame between the hero and the footer).
 */

import Link from 'next/link';
import Image from 'next/image';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

export interface FashionBeautyRelatedProduct {
  id: string;
  title: string;
  titleTh: string | null;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

export interface FashionBeautyRelatedProductsProps {
  storeSlug: string;
  storeName: string;
  products: FashionBeautyRelatedProduct[];
}

export function FashionBeautyRelatedProducts({
  storeSlug,
  storeName,
  products,
}: FashionBeautyRelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="my-16 sm:my-20">
      {/* Editorial section header — italic eyebrow, serif headline,
          italic sub-line, gold hairline divider */}
      <header className="mb-10 sm:mb-12">
        <p
          className="text-[11px] uppercase tracking-[0.28em]"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          From the editor
        </p>
        <h2
          className="mt-2 text-3xl sm:text-4xl"
          style={{
            fontFamily: FB_DISPLAY_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 500,
            letterSpacing: '-0.005em',
            lineHeight: 1.1,
          }}
        >
          You may also love
        </h2>
        <p
          className="mt-3 text-base italic"
          style={{
            fontFamily: FB_DISPLAY_FONT,
            color: 'var(--shop-ink-muted)',
          }}
        >
          Pieces curated to pair with this look
        </p>
        <div
          aria-hidden
          className="mt-5 h-px w-16"
          style={{ background: 'var(--shop-accent)' }}
        />
      </header>

      {/* 3-up portrait grid — matches FashionBeautyCategoryGrid visual */}
      <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3">
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
                className="relative overflow-hidden rounded-2xl border bg-white p-2 shadow-sm transition duration-300 group-hover:shadow-md"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <div
                  className="relative overflow-hidden rounded-xl"
                  style={{
                    aspectRatio: '4 / 5',
                    backgroundColor: 'var(--shop-muted)',
                  }}
                >
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={displayTitle}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-xs"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      ไม่มีรูป
                    </div>
                  )}
                  {discount != null && (
                    <span
                      className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      −{discount}%
                    </span>
                  )}
                </div>
              </div>

              <div className="px-1 pt-3">
                <p
                  className="line-clamp-2 text-base leading-snug"
                  style={{
                    fontFamily: FB_DISPLAY_FONT,
                    color: 'var(--shop-ink)',
                    fontWeight: 500,
                  }}
                >
                  {displayTitle}
                </p>
                <p
                  className="mt-1 text-xs italic"
                  style={{
                    fontFamily: FB_DISPLAY_FONT,
                    color: 'var(--shop-ink-muted)',
                  }}
                >
                  from {storeName}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    ฿ {p.priceTHB.toLocaleString('th-TH')}
                  </span>
                  {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                    <span
                      className="text-xs line-through"
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
