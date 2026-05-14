/**
 * SpecialtyRelatedProducts — bespoke artisan "other works from the
 * maker" panel for specialty (handmade / vintage) PDPs.
 *
 * Counterpart to FashionBeautyRelatedProducts and TrustRelatedProducts
 * — same structural role (renders below the brand story / above the
 * footer on the PDP) but in the specialty workshop voice rather than
 * the FB editorial magazine voice or the trust heritage voice.
 *
 * Difference from the inline related strip on the generic PDP:
 *   - Caveat hand-script "from the same maker · {storeName}" eyebrow
 *     instead of a plain caps "Related products" label.
 *   - Fraunces serif "Other works from this maker" h2.
 *   - Hairline rule under the heading (Specialty palette, --shop-accent)
 *     matching SpecialtyBrandStory and SpecialtyCategoryPage.
 *   - 4-up grid of kraft-textured cards with sepia-tinted images, the
 *     same visual language as SpecialtyCategoryGrid so cards feel
 *     native to the artisan boutique.
 *   - Each card carries a Caveat hand-script "made by hand" line under
 *     the title, reinforcing the workshop voice.
 *   - SpecialtyStamp discount badge in the corner of the image, dashed
 *     border + 3deg rotation, reads as a curator's stamp not a sale tag.
 *
 * Server component — no interactivity. Cards are simple Links to the
 * sibling PDP. Renders nothing if `products` is empty (no awkward
 * empty kraft frame between the brand story and the footer).
 */

import Link from 'next/link';
import Image from 'next/image';

import { SpecialtyStamp } from './SpecialtyDivider';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export interface SpecialtyRelatedProduct {
  id: string;
  title: string;
  titleTh: string | null;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

export interface SpecialtyRelatedProductsProps {
  storeSlug: string;
  storeName: string;
  products: SpecialtyRelatedProduct[];
}

export function SpecialtyRelatedProducts({
  storeSlug,
  storeName,
  products,
}: SpecialtyRelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="my-16 sm:my-20">
      {/* Workshop-letter section header — hand-script eyebrow,
          Fraunces serif headline, hairline accent rule */}
      <header className="mb-10 sm:mb-12">
        <p
          className="text-2xl"
          style={{
            fontFamily: SPECIALTY_HAND_FONT,
            color: 'var(--shop-accent)',
          }}
        >
          จากช่างฝีมือคนเดียวกัน · {storeName}
        </p>
        <h2
          className="mt-1 text-3xl sm:text-4xl"
          style={{
            fontFamily: SPECIALTY_DISPLAY_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 500,
            letterSpacing: '-0.005em',
            lineHeight: 1.1,
          }}
        >
          งานชิ้นอื่นจากช่างฝีมือคนนี้
        </h2>
        <div
          aria-hidden
          className="mt-4 h-px w-12"
          style={{ background: 'var(--shop-accent)' }}
        />
      </header>

      {/* 4-up kraft-card grid — matches SpecialtyCategoryGrid visual */}
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
                data-specialty-kraft="true"
                className="relative overflow-hidden rounded-md border p-2.5 shadow-sm transition duration-300 group-hover:shadow-md"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <div
                  data-specialty-sepia="true"
                  className="relative overflow-hidden rounded-md"
                  style={{
                    aspectRatio: '1 / 1',
                    backgroundColor: 'var(--shop-muted)',
                  }}
                >
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={displayTitle}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                    <SpecialtyStamp
                      tone="accent"
                      className="absolute left-3 top-3"
                    >
                      −{discount}%
                    </SpecialtyStamp>
                  )}
                </div>
              </div>

              <div className="px-1 pt-3">
                <p
                  className="line-clamp-2 text-sm leading-snug"
                  style={{
                    fontFamily: SPECIALTY_DISPLAY_FONT,
                    color: 'var(--shop-ink)',
                    fontWeight: 500,
                  }}
                >
                  {displayTitle}
                </p>
                <p
                  className="mt-1 text-base italic leading-tight"
                  style={{
                    fontFamily: SPECIALTY_HAND_FONT,
                    color: 'var(--shop-accent)',
                  }}
                >
                  งานทำมือ
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
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
