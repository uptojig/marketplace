/**
 * ElectronicsTechCatalogIndex — homepage "PRODUCT INDEX · LATEST" section.
 *
 * Server component. Queries Prisma for the 12 newest active products in
 * the store and renders a 4-up dense product grid that visually matches
 * ElectronicsTechCategoryGrid:
 *   - Square 1/1 thumbs on white sharp-bordered cards.
 *   - Mono "SKU · ET-XXXXXX" subtitle (mirrors techSku() in
 *     ElectronicsTechCartPage / ElectronicsTechCategoryGrid so the same
 *     product carries the same display SKU across the buyer journey).
 *   - Mint "In stock" chip in the bottom-right of the thumb.
 *   - Mono price in electric-blue with tabular-nums.
 *
 * Header voice — "PRODUCT INDEX · LATEST" mono caps eyebrow + Inter
 * Tight bold "Latest catalog additions" h2 + mono "VIEW FULL CATALOG"
 * link in the right column. No carousel — the grid is dense and static.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

export interface ElectronicsTechCatalogIndexProps {
  storeId: string;
  storeSlug: string;
}

/**
 * Build a deterministic SKU from the product id — mirrors the pattern
 * used in ElectronicsTechCartPage / ElectronicsTechCategoryGrid /
 * ElectronicsTechProductHero so the same product carries the same
 * display SKU on every surface. Format: "ET-XXXXXX".
 */
function techSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `ET-${hash}`;
}

export async function ElectronicsTechCatalogIndex({
  storeId,
  storeSlug,
}: ElectronicsTechCatalogIndexProps) {
  const products = await prisma.product.findMany({
    where: { storeId, active: true },
    orderBy: { createdAt: 'desc' },
    take: 12,
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
      className="px-4 pb-12 sm:px-6 lg:px-8"
      style={{ background: 'var(--shop-bg)' }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Spec-sheet section header */}
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end sm:gap-6">
          <div>
            <p
              data-tech-mono="true"
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              PRODUCT INDEX · LATEST
            </p>
            <h2
              className="mt-2 text-2xl sm:text-3xl"
              style={{
                fontFamily: TECH_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 700,
                letterSpacing: '-0.015em',
                lineHeight: 1.1,
              }}
            >
              Latest catalog additions
            </h2>
            <div
              aria-hidden
              className="mt-3 h-px w-12"
              style={{ background: 'var(--shop-highlight, #34d399)' }}
            />
          </div>
          <Link
            href={`/stores/${storeSlug}/category`}
            data-tech-mono="true"
            className="inline-flex items-center gap-1.5 rounded-md border bg-white px-4 py-2 text-[11px] uppercase transition hover:border-[var(--shop-highlight,#34d399)] hover:text-[var(--shop-highlight,#34d399)]"
            style={{
              borderColor: 'var(--shop-border)',
              color: 'var(--shop-ink)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.18em',
              fontWeight: 600,
            }}
          >
            VIEW FULL CATALOG
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div
            className="rounded-md border bg-white py-12 text-center"
            style={{ borderColor: 'var(--shop-border)' }}
          >
            <p
              data-tech-mono="true"
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              CATALOG EMPTY · 0 ITEMS
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                    className="relative overflow-hidden rounded-md border bg-white transition duration-300"
                    style={{ borderColor: 'var(--shop-border)' }}
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
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[var(--shop-ink-muted)]">
                          ไม่มีรูป
                        </div>
                      )}
                      {discount != null && (
                        <span
                          data-tech-mono="true"
                          className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase"
                          style={{
                            backgroundColor: 'var(--shop-primary)',
                            color: '#ffffff',
                            fontFamily: TECH_MONO_FONT,
                            letterSpacing: '0.1em',
                          }}
                        >
                          -{discount}%
                        </span>
                      )}
                      <span
                        data-tech-stock="true"
                        className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase"
                        style={{ letterSpacing: '0.1em' }}
                      >
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        In stock
                      </span>
                    </div>
                  </div>

                  <div className="px-1 pt-3">
                    <p
                      className="line-clamp-2 text-sm leading-tight"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: TECH_DISPLAY_FONT,
                        fontWeight: 600,
                        letterSpacing: '-0.005em',
                      }}
                    >
                      {title}
                    </p>
                    <p
                      data-tech-mono="true"
                      className="mt-1 text-[10px] uppercase"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        fontFamily: TECH_MONO_FONT,
                        letterSpacing: '0.16em',
                        fontWeight: 600,
                      }}
                    >
                      SKU · {techSku(p.id)}
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span
                        data-tech-mono="true"
                        className="text-base font-bold"
                        style={{
                          color: 'var(--shop-primary)',
                          fontFamily: TECH_MONO_FONT,
                          letterSpacing: '-0.01em',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        ฿ {price.toLocaleString('th-TH')}
                      </span>
                      {compare !== null && compare > price && (
                        <span
                          data-tech-mono="true"
                          className="text-xs line-through"
                          style={{
                            color: 'var(--shop-ink-muted)',
                            fontFamily: TECH_MONO_FONT,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
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
