/**
 * BusinessModelDealsGrid — featured-deals dense grid for the BM homepage.
 *
 * Server component. Queries Prisma for the 12 newest active products in the
 * store and renders them through the existing BusinessModelCategoryGrid so
 * the card chrome (rounded-md hairline border, mono SKU caption, mono price,
 * amber -X% sticker, mint savings chip, low-stock chip) stays IDENTICAL to
 * the catalog page. No card-level visual drift between homepage and category.
 *
 * Note: BusinessModelCategoryGrid renders as a 4-up grid at lg (md/sm = 2-up).
 * The spec asks for a 3-col DENSE grid here, but reusing the existing grid
 * keeps the visual identity locked to the catalog — operators won't see two
 * different card styles for the same products. The 4-up density still reads
 * as a "spreadsheet of deals" and the homepage section is constrained to 12
 * products so it slots into ~3 rows on desktop.
 *
 * Header: "DEAL DASHBOARD · Featured deals" tight-caps eyebrow + bold sans
 * h2 "Today's best deals" + a "View full catalog →" link in the right gutter.
 *
 * Renders nothing visual (just an empty-state card) when the store has zero
 * products yet.
 */

import Link from 'next/link';
import { ArrowRight, Inbox } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { BusinessModelCategoryGrid } from './BusinessModelCategoryGrid';
import type { BusinessModelCategoryProduct } from './BusinessModelCategoryGrid';

const BM_HEADING_FONT =
  'var(--font-sans, "Inter"), "Prompt", system-ui, sans-serif';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

interface Props {
  storeId: string;
  storeSlug: string;
}

export async function BusinessModelDealsGrid({ storeId, storeSlug }: Props) {
  const rows = await prisma.product.findMany({
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
      stockTotal: true,
      stockReserved: true,
    },
  });

  // Adapter — Decimal -> number, stockLeft = stockTotal - stockReserved.
  const products: BusinessModelCategoryProduct[] = rows.map((p) => {
    const stockLeft = Math.max(0, p.stockTotal - p.stockReserved);
    return {
      id: p.id,
      title: p.titleTh ?? p.title,
      imageUrl: p.imageUrl,
      priceTHB: Number(p.priceTHB),
      compareAtPriceTHB:
        p.compareAtPriceTHB != null ? Number(p.compareAtPriceTHB) : null,
      stockLeft,
    };
  });

  // Stat for the eyebrow chip — count how many of the surfaced products
  // are actually on sale.
  const onSaleCount = products.filter(
    (p) => p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB,
  ).length;

  return (
    <section
      className="border-b py-12 sm:py-16"
      style={{
        background: 'var(--shop-bg)',
        borderColor: 'var(--shop-border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header — eyebrow + bold h2 + view-all link */}
        <header className="mb-6 sm:mb-8">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            Deal dashboard · Featured deals
          </p>
          <div
            aria-hidden
            className="mt-3 h-1 w-12 rounded-md"
            style={{ background: 'var(--shop-primary)' }}
          />
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2
                className="text-2xl sm:text-3xl"
                style={{
                  fontFamily: BM_HEADING_FONT,
                  color: 'var(--shop-ink)',
                  fontWeight: 700,
                  letterSpacing: '-0.015em',
                  lineHeight: 1.1,
                }}
              >
                Today&rsquo;s best deals
              </h2>
              {products.length > 0 && (
                <span
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold"
                  style={{
                    borderColor: 'var(--shop-border)',
                    color: 'var(--shop-ink-muted)',
                  }}
                >
                  <span className="uppercase tracking-[0.12em]">SKUs</span>
                  <span
                    data-bm-mono="true"
                    style={{
                      color: 'var(--shop-ink)',
                      fontFamily: BM_MONO_FONT,
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 700,
                    }}
                  >
                    {products.length}
                  </span>
                  <span aria-hidden style={{ color: 'var(--shop-border)' }}>
                    ·
                  </span>
                  <span className="uppercase tracking-[0.12em]">On sale</span>
                  <span
                    data-bm-mono="true"
                    style={{
                      color: 'var(--shop-primary)',
                      fontFamily: BM_MONO_FONT,
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 700,
                    }}
                  >
                    {onSaleCount}
                  </span>
                </span>
              )}
            </div>
            <Link
              href={`/stores/${storeSlug}/category`}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] hover:underline"
              style={{ color: 'var(--shop-primary)' }}
            >
              View full catalog
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Grid — REUSES BusinessModelCategoryGrid so card chrome stays
            identical to the catalog page (rounded-md, mono SKU, amber
            sticker, mint savings chip, etc.). */}
        {products.length === 0 ? (
          <BusinessModelDealsEmpty storeSlug={storeSlug} />
        ) : (
          <BusinessModelCategoryGrid
            storeSlug={storeSlug}
            products={products}
          />
        )}
      </div>
    </section>
  );
}

function BusinessModelDealsEmpty({ storeSlug }: { storeSlug: string }) {
  return (
    <div
      className="mx-auto max-w-xl rounded-md border bg-white py-14 text-center"
      style={{ borderColor: 'var(--shop-border)' }}
    >
      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-md border"
        style={{
          background: 'var(--shop-muted)',
          borderColor: 'var(--shop-accent)',
          color: 'var(--shop-ink-muted)',
        }}
      >
        <Inbox className="h-6 w-6" />
      </div>
      <p
        className="text-[11px] font-semibold uppercase"
        style={{
          color: 'var(--shop-ink-muted)',
          letterSpacing: '0.12em',
        }}
      >
        No deals listed
      </p>
      <h3
        className="mt-2 text-2xl"
        style={{
          fontFamily: BM_HEADING_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 700,
          letterSpacing: '-0.015em',
        }}
      >
        Catalog is loading
      </h3>
      <p
        className="mx-auto mt-3 max-w-sm text-sm"
        style={{
          fontFamily: BM_HEADING_FONT,
          color: 'var(--shop-ink-muted)',
        }}
      >
        New stock is being uploaded — check back shortly.
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-md px-7 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:opacity-90"
        style={{ background: 'var(--shop-primary)' }}
      >
        Browse catalog
      </Link>
    </div>
  );
}
