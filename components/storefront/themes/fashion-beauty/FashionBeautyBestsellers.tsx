/**
 * FashionBeautyBestsellers — 4-up portrait grid of latest products,
 * presented as the "Most loved" magazine section on the FB homepage.
 *
 * Server component. Pulls 8 most-recent active products from Prisma
 * (we don't track sold-counts yet, so "newest" stands in for trending)
 * and renders them via FashionBeautyCategoryGrid so the card visual
 * stays IDENTICAL to the category page — same portrait 4/5 ratio,
 * same rose-500 price, same hover scale.
 *
 * Header matches the category-page editorial spread:
 *   - italic-serif eyebrow ("Most loved · Bestsellers this season")
 *   - serif h2 ("Loved this season")
 *   - hairline gold rule
 *   - italic-serif "View all" link on the right
 *
 * Renders nothing if the store has no products.
 */

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { FashionBeautyCategoryGrid } from './FashionBeautyCategoryGrid';
import type { FashionBeautyCategoryProduct } from './FashionBeautyCategoryGrid';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

interface Props {
  storeId: string;
  storeSlug: string;
}

export async function FashionBeautyBestsellers({ storeId, storeSlug }: Props) {
  const rows = await prisma.product.findMany({
    where: { storeId, active: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      titleTh: true,
      imageUrl: true,
      priceTHB: true,
      compareAtPriceTHB: true,
    },
  });

  if (rows.length === 0) return null;

  // Map to the shape the existing FashionBeautyCategoryGrid expects so
  // the card chrome stays byte-for-byte identical to the category page.
  const products: FashionBeautyCategoryProduct[] = rows.map((p) => ({
    id: p.id,
    title: p.titleTh ?? p.title,
    imageUrl: p.imageUrl,
    priceTHB: Number(p.priceTHB),
    compareAtPriceTHB:
      p.compareAtPriceTHB != null ? Number(p.compareAtPriceTHB) : null,
  }));

  return (
    <section
      style={{ background: 'var(--shop-bg)' }}
      className="relative"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* Editorial header */}
        <header className="mb-10 flex flex-col items-baseline justify-between gap-3 sm:mb-14 sm:flex-row">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.28em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              Most loved · Bestsellers this season
            </p>
            <h2
              className="mt-2 text-4xl sm:text-5xl"
              style={{
                fontFamily: FB_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                lineHeight: 1.05,
              }}
            >
              Loved this season
            </h2>
            <div
              aria-hidden
              className="mt-4 h-px w-12"
              style={{ background: 'var(--shop-accent)' }}
            />
          </div>
          <Link
            href={`/stores/${storeSlug}/category`}
            className="text-sm italic transition hover:underline"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink)',
            }}
          >
            View all pieces &rarr;
          </Link>
        </header>

        <FashionBeautyCategoryGrid storeSlug={storeSlug} products={products} />
      </div>
    </section>
  );
}
