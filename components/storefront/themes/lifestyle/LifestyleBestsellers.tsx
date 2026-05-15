/**
 * LifestyleBestsellers — 6 latest products as a 3-up large pillow grid
 * for the lifestyle homepage. Visual surface mirrors LifestyleCategoryGrid
 * exactly so the bestseller row reads as a featured catalog spread,
 * NOT a separate bespoke layout:
 *   - 3-up at lg / 2-up at md / 1-up at sm — airy, breathing room
 *   - rounded-3xl pillow cards with peach muted backdrop + soft natural
 *     drop shadow (data-lifestyle-frame)
 *   - Outfit display product title, warm tag chip top-left, sage outline
 *   - terracotta price ink + optional strikethrough compare price
 *   - hand-drawn sage SVG squiggle ABOVE the section header
 *
 * Header voice matches LifestyleCategoryPage:
 *   - "Loved by everyone · This season's bestsellers" warm caps eyebrow
 *   - Outfit display h2 ("This season's favorites")
 *   - secondary "View all" sage link → /stores/{slug}/category
 *
 * Server component — queries Prisma directly (mirrors PetHouseBestsellers).
 * "Bestsellers" is a soft proxy for "newest" today since we don't track
 * per-product sold counts; the row degrades gracefully when there are
 * fewer than 6 products (or none at all).
 *
 * "Tagline" copy under each title is generated deterministically by
 * product id so the same card always shows the same tagline across
 * renders — same helper that LifestyleCategoryGrid uses for parity.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestyleBestsellersProps {
  storeId: string;
  storeSlug: string;
}

export async function LifestyleBestsellers({
  storeId,
  storeSlug,
}: LifestyleBestsellersProps) {
  const products = await prisma.product.findMany({
    where: { storeId, active: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: {
      id: true,
      title: true,
      titleTh: true,
      imageUrl: true,
      priceTHB: true,
      compareAtPriceTHB: true,
      categoryName: true,
    },
  });

  return (
    <section
      style={{ background: 'var(--shop-bg)' }}
      className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Sage squiggle above the section header — adds rhythm and
            matches the divider treatment used on LifestyleCartPage and
            LifestyleCategoryPage. */}
        <div
          data-lifestyle-squiggle="true"
          aria-hidden
          className="mx-auto mb-8 w-2/3 max-w-md"
        />

        <div className="mb-10 flex flex-col items-baseline justify-between gap-3 sm:mb-14 sm:flex-row">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'var(--shop-accent)' }}
            >
              Loved by everyone · This season&rsquo;s bestsellers
            </p>
            <h2
              className="mt-3 text-3xl sm:text-4xl md:text-5xl"
              style={{
                fontFamily: LIFESTYLE_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              This season&rsquo;s favorites
            </h2>
          </div>
          <Link
            href={`/stores/${storeSlug}/category`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:gap-2.5"
            style={{
              color: 'var(--shop-accent)',
              fontFamily: LIFESTYLE_DISPLAY_FONT,
            }}
          >
            View the catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div
            data-lifestyle-frame="true"
            className="mx-auto max-w-xl rounded-3xl bg-white px-8 py-16 text-center"
          >
            <p
              className="text-base"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: LIFESTYLE_DISPLAY_FONT,
              }}
            >
              ทางร้านกำลังจัดสินค้าอยู่ — เร็ว ๆ นี้พบกันใหม่
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:gap-y-14 lg:grid-cols-4">
            {products.map((p) => (
              <BestsellerCard
                key={p.id}
                storeSlug={storeSlug}
                product={p}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface BestsellerProduct {
  id: string;
  title: string;
  titleTh: string | null;
  imageUrl: string | null;
  // Prisma Decimal — coerced to a number via Number() in the card body
  // before any arithmetic. Matches PetHouseBestsellers' handling exactly.
  priceTHB: Prisma.Decimal;
  compareAtPriceTHB: Prisma.Decimal | null;
  categoryName: string | null;
}

function BestsellerCard({
  storeSlug,
  product,
}: {
  storeSlug: string;
  product: BestsellerProduct;
}) {
  const price = Number(product.priceTHB);
  const compare = product.compareAtPriceTHB
    ? Number(product.compareAtPriceTHB)
    : null;
  const discount =
    compare != null && compare > price
      ? Math.round((1 - price / compare) * 100)
      : null;
  const title = product.titleTh ?? product.title;

  return (
    <Link
      href={`/stores/${storeSlug}/products/${product.id}`}
      className="group block"
    >
      {/* Soft natural drop shadow via data-lifestyle-frame. No hard
          border — lifestyle prefers shadow over hairline. */}
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
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--shop-ink-muted)]">
              ไม่มีรูป
            </div>
          )}
          {/* Discount chip top-right — terracotta fill */}
          {discount != null && (
            <span
              className="absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold text-white"
              style={{ background: 'var(--shop-primary)' }}
            >
              ลด {discount}%
            </span>
          )}
        </div>
      </div>

      <div className="px-1 pt-5">
        <p
          className="line-clamp-2 text-base leading-tight sm:text-lg"
          style={{
            color: 'var(--shop-ink)',
            fontFamily: LIFESTYLE_DISPLAY_FONT,
            fontWeight: 600,
          }}
        >
          {title}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className="text-base font-semibold sm:text-lg"
            style={{ color: 'var(--shop-primary)' }}
          >
            ฿ {price.toLocaleString('th-TH')}
          </span>
          {compare != null && compare > price && (
            <span className="text-xs text-[var(--shop-ink-muted)] line-through">
              ฿ {compare.toLocaleString('th-TH')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
