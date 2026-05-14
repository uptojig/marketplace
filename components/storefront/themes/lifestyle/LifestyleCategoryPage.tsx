/**
 * LifestyleCategoryPage — bespoke lifestyle catalog layout.
 *
 * Structural difference from the generic /stores/[slug]/category page
 * AND the FashionBeautyCategoryPage:
 *   - "Shop the catalog" warm sage eyebrow + Outfit / Plus Jakarta Sans
 *     display h1 ("Shop the catalog") — geometric humanist sans, NOT
 *     serif. Reads as friendly catalog spread, not magazine letter.
 *   - Filter chips render at the TOP as soft pastel pills (rounded-full,
 *     amber-100 muted background when inactive, terracotta filled when
 *     active). Always tag-style — no hairline divider strip.
 *   - Sort renders as inline pills next to the filter chips with the
 *     same rounded-full pastel styling — friendly, not italic-serif.
 *   - Inner grid is the existing LifestyleCategoryGrid (unchanged).
 *   - Pagination uses friendly chunky buttons with a hand-drawn sage
 *     SVG squiggle divider ABOVE the pagination block (instead of FB's
 *     hairline border-t).
 *
 * Reuses LifestyleCategoryGrid for product cards so the card visual
 * (1/1 square, peach backdrop, sage chips, optimistic tagline) stays
 * identical across the page.
 */

import Link from 'next/link';
import { ChevronLeft, ChevronRight, ListFilter, ArrowUpDown } from 'lucide-react';
import { LifestyleCategoryGrid } from './LifestyleCategoryGrid';
import type { LifestyleCategoryProduct } from './LifestyleCategoryGrid';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestyleCategoryPageProps {
  storeSlug: string;
  storeName: string;
  totalCount: number;
  pageProducts: LifestyleCategoryProduct[];
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

export function LifestyleCategoryPage(props: LifestyleCategoryPageProps) {
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
        {/* Warm catalog header — sage eyebrow + Outfit display h1 */}
        <header className="mb-10 sm:mb-14">
          <Link
            href={`/stores/${storeSlug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to store
          </Link>
          <p
            className="mt-6 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-accent)' }}
          >
            Shop the catalog
          </p>
          <div className="mt-2 flex flex-col items-baseline justify-between gap-3 sm:flex-row">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl"
              style={{
                fontFamily: LIFESTYLE_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
              }}
            >
              Everything from {storeName}
            </h1>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {filteredCount.toLocaleString()} good thing{filteredCount === 1 ? '' : 's'}
            </span>
          </div>
        </header>

        {/* Soft pastel chip filters — top of page, no sidebar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              <ListFilter className="h-3.5 w-3.5" />
              Filter
            </span>
            <ChipLink
              href={buildUrl()}
              active={selectedCats.length === 0}
              label="All"
            />
            {categoryNames.map((name) => {
              const active = selectedCats.includes(name);
              return (
                <ChipLink
                  key={name}
                  href={buildUrl(name)}
                  active={active}
                  label={name}
                  count={categoryCounts[name] ?? 0}
                />
              );
            })}
            {uncatCount > 0 && (
              <ChipLink
                href={buildUrl('uncategorized')}
                active={selectedCats.includes('uncategorized')}
                label="Other"
                count={uncatCount}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </span>
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.key;
              return (
                <ChipLink
                  key={opt.key}
                  href={buildSortUrl(opt.key)}
                  active={active}
                  label={opt.label}
                />
              );
            })}
          </div>
        </div>

        {/* Sage hairline below the filters */}
        <div
          aria-hidden
          className="mb-10 h-px w-full"
          style={{ background: 'var(--shop-border)' }}
        />

        {/* Grid — uses existing LifestyleCategoryGrid */}
        {pageProducts.length === 0 ? (
          <LifestyleEmptyCatalog
            storeSlug={storeSlug}
            hasFilters={selectedCats.length > 0}
            buildUrl={buildUrl}
          />
        ) : (
          <LifestyleCategoryGrid storeSlug={storeSlug} products={pageProducts} />
        )}

        {/* Pagination — squiggle divider + chunky friendly pills */}
        {totalPages > 1 && (
          <>
            <div
              data-lifestyle-squiggle="true"
              className="mx-auto mt-16 w-2/3"
              aria-hidden
            />
            <nav
              className="mt-6 flex items-center justify-center gap-4"
              aria-label="Pagination"
            >
              {currentPage > 1 ? (
                <Link
                  href={buildUrl(undefined, currentPage - 1)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-5 text-sm font-semibold transition hover:opacity-80"
                  style={{
                    borderColor: 'var(--shop-border)',
                    color: 'var(--shop-ink)',
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              ) : (
                <span
                  className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-5 text-sm font-semibold opacity-40"
                  style={{
                    borderColor: 'var(--shop-border)',
                    color: 'var(--shop-ink-muted)',
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </span>
              )}
              <span
                className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold"
                style={{
                  background: 'var(--shop-muted)',
                  color: 'var(--shop-ink)',
                  fontFamily: LIFESTYLE_DISPLAY_FONT,
                }}
              >
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={buildUrl(undefined, currentPage + 1)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-5 text-sm font-semibold transition hover:opacity-80"
                  style={{
                    borderColor: 'var(--shop-border)',
                    color: 'var(--shop-ink)',
                  }}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span
                  className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-5 text-sm font-semibold opacity-40"
                  style={{
                    borderColor: 'var(--shop-border)',
                    color: 'var(--shop-ink-muted)',
                  }}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </nav>
          </>
        )}
      </main>
    </div>
  );
}

/**
 * Soft pastel chip link — rounded-full pill. Inactive sits on the warm
 * peach (amber-100) muted backdrop with sage-bordered subtle outline;
 * active fills with terracotta primary + white text. Reads as a friendly
 * catalog filter, NOT a checkbox / hard link.
 */
function ChipLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition hover:opacity-80"
      style={{
        background: active ? 'var(--shop-primary)' : 'var(--shop-muted)',
        borderColor: active ? 'var(--shop-primary)' : 'var(--shop-accent)',
        color: active ? '#ffffff' : 'var(--shop-ink)',
        fontFamily: LIFESTYLE_DISPLAY_FONT,
      }}
    >
      {label}
      {count != null && (
        <span
          className="text-[11px] font-semibold opacity-70"
          aria-hidden
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function LifestyleEmptyCatalog({
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
      <div
        className="mx-auto mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background: 'var(--shop-muted)' }}
      >
        <ListFilter
          className="h-10 w-10"
          style={{ color: 'var(--shop-accent)' }}
        />
      </div>
      <h2
        className="text-3xl"
        style={{
          fontFamily: LIFESTYLE_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 600,
        }}
      >
        Nothing matches yet
      </h2>
      <p
        className="mt-3 text-sm"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        {hasFilters
          ? 'Try clearing your filters to browse the full catalog.'
          : 'Our catalog is being styled — pop back soon for a fresh drop.'}
      </p>
      {hasFilters ? (
        <Link
          href={buildUrl()}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--shop-primary)' }}
        >
          Clear filters
        </Link>
      ) : (
        <Link
          href={`/stores/${storeSlug}`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--shop-primary)' }}
        >
          Back to store
        </Link>
      )}
    </div>
  );
}
