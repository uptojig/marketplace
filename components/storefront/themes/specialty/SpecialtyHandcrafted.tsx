/**
 * SpecialtyHandcrafted — 4-up curated grid of the latest handcrafted
 * pieces from the studio. Sits between the SpecialtyMakersBar and the
 * SpecialtyBrandStory on the artisan / vintage homepage.
 *
 * Counterpart to PetHouseBestsellers in structural role (server-side
 * Prisma query → grid of product cards), but tuned to the artisan
 * voice: kraft-textured cards with sepia-toned imagery, hand-script
 * "By {storeName}" attribution under the title, and a "made by hand"
 * Caveat footnote below the price — exactly mirroring the card style
 * already shipping in SpecialtyCategoryPage so the homepage and the
 * catalogue feel like one continuous studio document.
 *
 * Query: 8 latest active products. Even though the grid renders 4-up
 * on lg+, we fetch 8 so the component degrades gracefully on narrower
 * breakpoints (2-up shows 8 in a balanced 4×2 grid). The 8 cap is per
 * spec — keeps the homepage focused without dragging in pagination.
 *
 * Header: hand-script "from the atelier" Caveat eyebrow + Fraunces
 * "Handcrafted this season" h2, matching the workshop-letter spread
 * used in SpecialtyCategoryPage.tsx.
 *
 * Server component — no client state. Renders nothing's-here panel
 * inline when the store has no active products yet (instead of an
 * empty grid frame).
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export interface SpecialtyHandcraftedProps {
  storeId: string;
  storeSlug: string;
}

export async function SpecialtyHandcrafted({
  storeId,
  storeSlug,
}: SpecialtyHandcraftedProps) {
  const products = await prisma.product.findMany({
    where: { storeId, active: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true,
      title: true,
      titleTh: true,
      priceTHB: true,
      compareAtPriceTHB: true,
      imageUrl: true,
      store: {
        select: {
          name: true,
        },
      },
    },
  });

  // Resolve store name from the first product (same store for all rows).
  // When the store has no products yet we can't read it, but the empty
  // panel below doesn't need it — so this fallback is purely defensive.
  const storeName = products[0]?.store?.name ?? '';

  return (
    <section
      data-specialty-kraft="true"
      style={{ background: 'var(--shop-bg)' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {/* Workshop-letter header — matches SpecialtyCategoryPage spread */}
        <header className="mb-10 sm:mb-12">
          <p
            className="text-2xl"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-accent)',
            }}
          >
            จากอาเทเลีย
          </p>
          <div className="mt-1 flex flex-col items-baseline justify-between gap-3 sm:flex-row">
            <h2
              className="text-3xl sm:text-4xl"
              style={{
                fontFamily: SPECIALTY_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                lineHeight: 1.05,
              }}
            >
              งานทำมือฤดูนี้
            </h2>
            <Link
              href={`/stores/${storeSlug}/category`}
              className="inline-flex items-center gap-1.5 text-lg leading-none transition hover:underline"
              style={{
                fontFamily: SPECIALTY_HAND_FONT,
                color: 'var(--shop-accent)',
              }}
            >
              ดูแค็ตตาล็อกทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {products.length === 0 ? (
          <div
            className="mx-auto max-w-md rounded-md border border-dashed py-14 text-center"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            <p
              className="text-2xl"
              style={{
                fontFamily: SPECIALTY_HAND_FONT,
                color: 'var(--shop-accent)',
              }}
            >
              ยังไม่มีงานบนโต๊ะ
            </p>
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              ช่างฝีมือกำลังเตรียมงานชุดถัดไป — แวะมาดูใหม่เร็วๆ นี้
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const price = Number(p.priceTHB);
              const compare = p.compareAtPriceTHB
                ? Number(p.compareAtPriceTHB)
                : null;
              const discount =
                compare !== null && compare > price
                  ? Math.round((1 - price / compare) * 100)
                  : null;
              const title = p.titleTh ?? p.title;

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
                          alt={title}
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
                      โดย {p.store?.name ?? storeName}
                    </span>
                    <p
                      className="mt-1 line-clamp-2 text-sm leading-snug"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: SPECIALTY_DISPLAY_FONT,
                        fontWeight: 500,
                      }}
                    >
                      {title}
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        ฿ {price.toLocaleString('th-TH')}
                      </span>
                      {compare !== null && compare > price && (
                        <span className="text-xs text-[var(--shop-ink-muted)] line-through">
                          ฿ {compare.toLocaleString('th-TH')}
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-1 text-base leading-none"
                      style={{
                        fontFamily: SPECIALTY_HAND_FONT,
                        color: 'var(--shop-ink-muted)',
                      }}
                    >
                      งานทำมือ
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
