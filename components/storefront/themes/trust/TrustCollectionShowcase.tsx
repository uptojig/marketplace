/**
 * TrustCollectionShowcase — homepage product showcase that mirrors
 * the catalog grid card visual exactly so the homepage and category
 * page read as one continuous maison.
 *
 * Server component. Queries Prisma for the 8 latest active products
 * in the store (creation date desc) and renders them as a 4-up grid
 * of SQUARE 1/1 cards with thin gold-rule frames + heritage SKU
 * stamp + Playfair serif title + charcoal price. Same card chrome as
 * TrustCategoryGrid — only the section header differs (caps eyebrow
 * + cartouche-style h2 + gold rule + "View the entire collection"
 * caps link).
 *
 * The grid degrades gracefully:
 *   - 0 products → empty cartouche with caps headline + serif body.
 *   - <8 products → renders just what's available.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

interface Props {
  storeId: string;
  storeSlug: string;
}

/**
 * Build a deterministic 6-char heritage SKU from product id — kept
 * inline so this component doesn't import the catalog grid module.
 * Mirrors heritageSku in TrustCategoryGrid / TrustCartPage so a
 * given product shows the same SKU across catalog / cart / home.
 */
function heritageSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `BP-${hash}`;
}

export async function TrustCollectionShowcase({ storeId, storeSlug }: Props) {
  const products = await prisma.product.findMany({
    where: { storeId, active: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true,
      title: true,
      titleTh: true,
      imageUrl: true,
      priceTHB: true,
      compareAtPriceTHB: true,
    },
  });

  return (
    <section
      aria-labelledby="trust-collection-heading"
      style={{ background: 'var(--shop-bg)' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* ── Header: caps eyebrow + Playfair h2 + gold rule + view
            all link. Mirrors TrustCategoryPage's centered cartouche
            but left-aligned at lg+ to feel like a magazine column
            opener. ─────────────────────────────────────────────── */}
        <header className="mb-10 flex flex-col items-start gap-4 sm:mb-14 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.32em',
                fontWeight: 600,
              }}
            >
              จากคอลเลกชันเมซอน
            </p>
            <h2
              id="trust-collection-heading"
              className="mt-3 text-3xl sm:text-4xl md:text-5xl"
              style={{
                fontFamily: TRUST_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              สินค้ามาใหม่ล่าสุด
            </h2>
            <div
              aria-hidden
              className="mt-4 h-px w-12"
              style={{ background: 'var(--shop-accent)' }}
            />
          </div>

          <Link
            href={`/stores/${storeSlug}/category?sort=newest`}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase transition hover:underline"
            style={{
              color: 'var(--shop-ink)',
              letterSpacing: '0.28em',
              fontWeight: 600,
              paddingBottom: '2px',
              borderBottom: '1px solid var(--shop-accent)',
            }}
          >
            ดูคอลเลกชันทั้งหมด
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        {/* ── Grid / empty state ─────────────────────────────────── */}
        {products.length === 0 ? (
          <TrustShowcaseEmpty storeSlug={storeSlug} />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const price = Number(p.priceTHB);
              const compare = p.compareAtPriceTHB
                ? Number(p.compareAtPriceTHB)
                : null;
              const onSale = compare !== null && compare > price;
              const discount = onSale
                ? Math.round(((compare - price) / compare) * 100)
                : null;
              const title = p.titleTh ?? p.title;

              return (
                <Link
                  key={p.id}
                  href={`/stores/${storeSlug}/products/${p.id}`}
                  className="group block"
                >
                  {/* Sharp ivory border frame — matches catalog
                      TrustCategoryGrid card chrome exactly. */}
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
                          alt={title}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[var(--shop-ink-muted)]">
                          ไม่มีรูป
                        </div>
                      )}
                      {discount !== null && (
                        <span
                          className="absolute left-3 top-3 rounded-sm border bg-white px-2 py-0.5 text-[10px] font-bold uppercase"
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

                  {/* Caption — Playfair title, mono SKU stamp,
                      charcoal price. Mirrors catalog card body. */}
                  <div className="px-1 pt-4">
                    <p
                      className="line-clamp-2 text-sm leading-tight"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: TRUST_DISPLAY_FONT,
                        fontWeight: 600,
                      }}
                    >
                      {title}
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
                        ฿ {price.toLocaleString('th-TH')}
                      </span>
                      {compare !== null && compare > price && (
                        <span className="text-xs text-[var(--shop-ink-muted)] line-through">
                          ฿ {compare.toLocaleString('th-TH')}
                        </span>
                      )}
                    </div>
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

/**
 * Empty-state cartouche shown when the store has zero active
 * products. Same voice as TrustEmptyCatalog in TrustCategoryPage so
 * the whole maison reads as one editorial.
 */
function TrustShowcaseEmpty({ storeSlug }: { storeSlug: string }) {
  return (
    <div
      className="mx-auto max-w-2xl rounded-sm border-2 px-8 py-16 text-center"
      style={{
        background: 'var(--shop-muted)',
        borderColor: 'var(--shop-accent)',
      }}
    >
      <p
        className="text-[11px] uppercase"
        style={{
          color: 'var(--shop-accent)',
          letterSpacing: '0.32em',
          fontWeight: 600,
        }}
      >
        เมซอน · รอการคัดสรร
      </p>
      <h3
        className="mt-3 text-2xl sm:text-3xl"
        style={{
          fontFamily: TRUST_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        คอลเลกชันกำลังถูกคัดสรร
      </h3>
      <div
        aria-hidden
        className="mx-auto mt-5 h-px w-12"
        style={{ background: 'var(--shop-accent)' }}
      />
      <p
        className="mx-auto mt-5 max-w-md text-sm"
        style={{
          fontFamily: TRUST_DISPLAY_FONT,
          color: 'var(--shop-ink-muted)',
          fontWeight: 500,
        }}
      >
        The atelier is preparing the next acquisitions. Please return shortly.
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-sm px-8 text-xs font-semibold uppercase text-white transition hover:opacity-90"
        style={{
          background: 'var(--shop-primary)',
          letterSpacing: '0.28em',
        }}
      >
        Visit the Maison
      </Link>
    </div>
  );
}
