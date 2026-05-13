/**
 * FashionBeautyCategoryGrid — magazine-style product grid for the
 * category page when the store is in the fashion-beauty family.
 *
 * Difference from the default shadcn-studio product-list-03:
 *   - 3-up on md, 4-up on lg (instead of dense rows)
 *   - 4/5 portrait images framed in a white card with shadow-sm
 *   - Caption-style typography (no shouting "name" + "price")
 *   - Soft hover lift instead of card scale
 *   - Rose-500 price ink so each card reads as part of the palette
 *
 * Renders as a server component — no interactivity needed at this
 * level (the card itself is a Link to PDP, useCart lives on PDP).
 */

import Link from 'next/link';
import Image from 'next/image';

export interface FashionBeautyCategoryProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

export function FashionBeautyCategoryGrid({
  storeSlug,
  products,
}: {
  storeSlug: string;
  products: FashionBeautyCategoryProduct[];
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
                className="line-clamp-2 text-sm leading-snug"
                style={{ color: 'var(--shop-ink)' }}
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
