/**
 * FashionBeautyCategoryPage — bespoke FB catalog layout.
 *
 * Structural difference from the generic /stores/[slug]/category page:
 *   - Editorial top spread: serif "The Edit · Season Collection" with
 *     italic curator note, NOT a TUI Plus h1 + breadcrumb tucked in.
 *   - Filter chips render at the TOP (horizontal scroll), NOT in a
 *     left sidebar. The page becomes a single column so the magazine
 *     proportions read at full width.
 *   - Sort dropdown is replaced with three lightweight pill links
 *     (newest / price-asc / price-desc) sitting next to the chips.
 *   - Inner grid is the existing FashionBeautyCategoryGrid (no change).
 *   - Pagination uses italic-serif page numbers with a hairline divider
 *     instead of TUI Plus's bordered button strip.
 *
 * Reuses existing FashionBeautyCategoryGrid for product cards so the
 * card visual (portrait, rose price, hover scale) stays identical
 * across the page.
 */

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FashionBeautyCategoryGrid } from './FashionBeautyCategoryGrid';
import type { FashionBeautyCategoryProduct } from './FashionBeautyCategoryGrid';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

export interface FashionBeautyCategoryPageProps {
  storeSlug: string;
  storeName: string;
  totalCount: number;
  pageProducts: FashionBeautyCategoryProduct[];
  categoryNames: string[];
  categoryCounts: Record<string, number>;
  uncatCount: number;
  selectedCats: string[];
  sortKey: string;
  currentPage: number;
  totalPages: number;
  buildUrl: (toggleCat?: string, page?: number) => string;
  buildSortUrl: (sort: string) => string;
  filteredCount: number;
}

const SORT_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Lowest price' },
  { key: 'price-desc', label: 'Highest price' },
];

export function FashionBeautyCategoryPage(props: FashionBeautyCategoryPageProps) {
  const {
    storeSlug,
    storeName,
    pageProducts,
    categoryNames,
    categoryCounts,
    uncatCount,
    selectedCats,
    sortKey,
    currentPage,
    totalPages,
    buildUrl,
    buildSortUrl,
    filteredCount,
  } = props;

  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Editorial top spread */}
        <header className="mb-10 sm:mb-14">
          <Link
            href={`/stores/${storeSlug}`}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to the boutique
          </Link>
          <p
            className="mt-6 text-[11px] uppercase tracking-[0.28em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            The Edit · Season Collection
          </p>
          <div className="mt-2 flex flex-col items-baseline justify-between gap-3 sm:flex-row">
            <h1
              className="text-5xl sm:text-6xl"
              style={{
                fontFamily: FB_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                lineHeight: 1.05,
              }}
            >
              All pieces
            </h1>
            <span
              className="text-sm italic"
              style={{
                fontFamily: FB_DISPLAY_FONT,
                color: 'var(--shop-ink-muted)',
              }}
            >
              {filteredCount.toLocaleString()} piece{filteredCount === 1 ? '' : 's'} from {storeName}
            </span>
          </div>
        </header>

        {/* Filter chips + sort pills — horizontal, no sidebar */}
        <div
          className="mb-8 flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'var(--shop-accent)' }}
        >
          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              Filter
            </span>
            <Link
              href={buildUrl()}
              className="rounded-full border px-4 py-1.5 text-sm transition"
              style={{
                borderColor:
                  selectedCats.length === 0
                    ? 'var(--shop-primary)'
                    : 'var(--shop-border)',
                background:
                  selectedCats.length === 0 ? 'var(--shop-primary)' : 'transparent',
                color:
                  selectedCats.length === 0 ? '#ffffff' : 'var(--shop-ink-muted)',
              }}
            >
              All
            </Link>
            {categoryNames.map((name) => {
              const active = selectedCats.includes(name);
              return (
                <Link
                  key={name}
                  href={buildUrl(name)}
                  className="rounded-full border px-4 py-1.5 text-sm transition hover:border-[var(--shop-primary)]"
                  style={{
                    borderColor: active ? 'var(--shop-primary)' : 'var(--shop-border)',
                    background: active ? 'var(--shop-primary)' : 'transparent',
                    color: active ? '#ffffff' : 'var(--shop-ink-muted)',
                  }}
                >
                  {name}
                  <span className="ml-1.5 text-[11px] opacity-70">
                    {categoryCounts[name] ?? 0}
                  </span>
                </Link>
              );
            })}
            {uncatCount > 0 && (
              <Link
                href={buildUrl('uncategorized')}
                className="rounded-full border px-4 py-1.5 text-sm italic transition hover:border-[var(--shop-primary)]"
                style={{
                  fontFamily: FB_DISPLAY_FONT,
                  borderColor: selectedCats.includes('uncategorized')
                    ? 'var(--shop-primary)'
                    : 'var(--shop-border)',
                  background: selectedCats.includes('uncategorized')
                    ? 'var(--shop-primary)'
                    : 'transparent',
                  color: selectedCats.includes('uncategorized')
                    ? '#ffffff'
                    : 'var(--shop-ink-muted)',
                }}
              >
                Other ({uncatCount})
              </Link>
            )}
          </div>

          {/* Sort pills — italic serif, three options */}
          <div className="flex items-center gap-3">
            <span
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              Sort
            </span>
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.key;
              return (
                <Link
                  key={opt.key}
                  href={buildSortUrl(opt.key)}
                  className="text-sm italic transition hover:underline"
                  style={{
                    fontFamily: FB_DISPLAY_FONT,
                    color: active ? 'var(--shop-primary)' : 'var(--shop-ink-muted)',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Grid — uses existing FashionBeautyCategoryGrid */}
        {pageProducts.length === 0 ? (
          <FashionBeautyEmptyCatalog storeSlug={storeSlug} hasFilters={selectedCats.length > 0} buildUrl={buildUrl} />
        ) : (
          <FashionBeautyCategoryGrid storeSlug={storeSlug} products={pageProducts} />
        )}

        {/* Pagination — italic-serif page numbers + hairline divider */}
        {totalPages > 1 && (
          <nav
            className="mt-16 flex items-center justify-center gap-6 border-t pt-6"
            style={{ borderColor: 'var(--shop-accent)' }}
            aria-label="Pagination"
          >
            {currentPage > 1 ? (
              <Link
                href={buildUrl(undefined, currentPage - 1)}
                className="inline-flex items-center gap-2 text-sm italic transition hover:underline"
                style={{
                  fontFamily: FB_DISPLAY_FONT,
                  color: 'var(--shop-ink)',
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous page
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-2 text-sm italic opacity-40"
                style={{ fontFamily: FB_DISPLAY_FONT, color: 'var(--shop-ink-muted)' }}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous page
              </span>
            )}
            <span
              className="text-sm italic"
              style={{
                fontFamily: FB_DISPLAY_FONT,
                color: 'var(--shop-ink-muted)',
              }}
            >
              Page <span style={{ color: 'var(--shop-ink)' }}>{currentPage}</span> of{' '}
              {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link
                href={buildUrl(undefined, currentPage + 1)}
                className="inline-flex items-center gap-2 text-sm italic transition hover:underline"
                style={{
                  fontFamily: FB_DISPLAY_FONT,
                  color: 'var(--shop-ink)',
                }}
              >
                Next page
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-2 text-sm italic opacity-40"
                style={{ fontFamily: FB_DISPLAY_FONT, color: 'var(--shop-ink-muted)' }}
              >
                Next page
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}

function FashionBeautyEmptyCatalog({
  storeSlug,
  hasFilters,
  buildUrl,
}: {
  storeSlug: string;
  hasFilters: boolean;
  buildUrl: (toggleCat?: string, page?: number) => string;
}) {
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <h2
        className="text-3xl"
        style={{
          fontFamily: FB_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 500,
        }}
      >
        Nothing here just yet
      </h2>
      <p
        className="mt-3 text-sm italic"
        style={{
          fontFamily: FB_DISPLAY_FONT,
          color: 'var(--shop-ink-muted)',
        }}
      >
        {hasFilters
          ? 'Try clearing your filters to see the full collection.'
          : 'Our curators are styling the next drop — check back soon.'}
      </p>
      {hasFilters ? (
        <Link
          href={buildUrl()}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-full px-7 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--shop-primary)' }}
        >
          Clear filters
        </Link>
      ) : (
        <Link
          href={`/stores/${storeSlug}`}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-full px-7 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--shop-primary)' }}
        >
          Back to boutique
        </Link>
      )}
    </div>
  );
}
