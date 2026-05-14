/**
 * FashionBeautyEditorialPicks — 3-up "Editor's edit" magazine spread.
 *
 * Server component that pulls 3 most-recent active products from
 * Prisma and renders them as the editorial centerpiece between the
 * hero and the bestsellers grid.
 *
 * Visual language matches FashionBeautyCategoryPage:
 *   - italic-serif eyebrow ("From the editor") + serif h2 ("Today's pick")
 *   - hairline gold rule
 *   - 3 portrait 4/5 cards in a single row (stacks on mobile)
 *   - card chrome: white surface, rounded-2xl, soft shadow, hover scale
 *   - serif title + italic "from {storeName}" line + rose price
 *   - each card links to /stores/{slug}/products/{id}
 *
 * Renders nothing if the store has no products (no awkward empty
 * frame on a freshly-created boutique).
 */

import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

interface Props {
  storeId: string;
  storeSlug: string;
}

export async function FashionBeautyEditorialPicks({ storeId, storeSlug }: Props) {
  const [products, store] = await Promise.all([
    prisma.product.findMany({
      where: { storeId, active: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        titleTh: true,
        imageUrl: true,
        priceTHB: true,
      },
    }),
    prisma.store.findUnique({
      where: { id: storeId },
      select: { name: true },
    }),
  ]);

  if (products.length === 0) return null;

  const storeName = store?.name ?? 'บูทีค';

  return (
    <section
      style={{ background: 'var(--shop-bg)' }}
      className="relative"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* Editorial header — eyebrow + serif h2 + hairline rule */}
        <header className="mb-10 flex flex-col items-baseline justify-between gap-3 sm:mb-14 sm:flex-row">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.28em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              จากบรรณาธิการ
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
              คัดสรรประจำวัน
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
            ดูคอลเลกชันทั้งหมด &rarr;
          </Link>
        </header>

        {/* 3-up portrait grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
          {products.map((p) => {
            const price = Number(p.priceTHB);
            const title = p.titleTh ?? p.title;
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
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-xs italic"
                        style={{
                          fontFamily: FB_DISPLAY_FONT,
                          color: 'var(--shop-ink-muted)',
                        }}
                      >
                        ไม่มีรูป
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-1 pt-5">
                  <h3
                    className="line-clamp-2 text-xl leading-snug sm:text-2xl"
                    style={{
                      fontFamily: FB_DISPLAY_FONT,
                      color: 'var(--shop-ink)',
                      fontWeight: 500,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    className="mt-1 text-sm italic"
                    style={{
                      fontFamily: FB_DISPLAY_FONT,
                      color: 'var(--shop-ink-muted)',
                    }}
                  >
                    จาก {storeName}
                  </p>
                  <p
                    className="mt-3 text-base font-semibold"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    ฿ {price.toLocaleString('th-TH')}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
