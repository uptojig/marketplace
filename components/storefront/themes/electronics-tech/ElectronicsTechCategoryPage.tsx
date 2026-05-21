
/**
 * ElectronicsTechCategoryPage — bespoke ET catalog layout.
 *
 * Structural difference from the generic /stores/[slug]/category page
 * AND from FashionBeautyCategoryPage:
 *   - "CATALOG · ALL PRODUCTS" mono caps eyebrow + Inter Tight display
 *     h1 + mono filtered-count pill (NOT a serif essay).
 *   - LEFT-RAIL filter sidebar with mono caps section labels and
 *     compare-checkbox visual hint per category — reads as a Newegg /
 *     Best-Buy left-rail spec filter, not a chip strip.
 *   - Sort dropdown rendered as a sharp-bordered "spec selector" with
 *     mono label + caret (using <select> for accessibility).
 *   - Inner grid is the existing ElectronicsTechCategoryGrid (no change).
 *   - Pagination uses mono "PAGE 1 / 12" pill + sharp-bordered
 *     prev/next square buttons — replaces FB's italic-serif page strip.
 *
 * Reuses existing ElectronicsTechCategoryGrid for product cards so the
 * card visual (square thumbs, mono SKU, mint stock chip) stays
 * identical across the page.
 */

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ElectronicsTechCategoryGrid } from './ElectronicsTechCategoryGrid';
import type { ElectronicsTechCategoryProduct } from './ElectronicsTechCategoryGrid';
import { ETSortSelect } from './ETSortSelect';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

export interface ElectronicsTechCategoryPageProps {
  storeSlug: string;
  storeName: string;
  totalCount: number;
  pageProducts: ElectronicsTechCategoryProduct[];
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
  { key: 'price-asc', label: 'Price · Low to High' },
  { key: 'price-desc', label: 'Price · High to Low' },
];

/** Two-digit zero-pad used by "PAGE 01 / 12" mono pagination pill. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function ElectronicsTechCategoryPage(
  props: ElectronicsTechCategoryPageProps,
) {
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
        {/* Spec-sheet header */}
        <header className="mb-8 sm:mb-10">
          <Link
            href={`/stores/${storeSlug}`}
            data-tech-mono="true"
            className="inline-flex items-center gap-1 text-[11px] uppercase hover:underline"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to store
          </Link>
          <p
            data-tech-mono="true"
            className="mt-6 text-[11px] uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.18em',
              fontWeight: 600,
            }}
          >
            CATALOG · ALL PRODUCTS
          </p>
          <div className="mt-2 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-baseline">
            <h1
              className="text-3xl sm:text-4xl"
              style={{
                fontFamily: TECH_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 700,
                letterSpacing: '-0.015em',
                lineHeight: 1.1,
              }}
            >
              {storeName} Catalog
            </h1>
            <span
              data-tech-mono="true"
              className="inline-flex items-center rounded-md border bg-[var(--shop-muted)] px-2.5 py-1 text-[11px] uppercase"
              style={{
                borderColor: 'var(--shop-border)',
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.14em',
                fontWeight: 600,
              }}
            >
              {filteredCount.toLocaleString()} RESULTS
            </span>
          </div>
        </header>

        {/* Two-column layout: left-rail filter + grid */}
        <div className="lg:grid lg:grid-cols-[14rem_1fr] lg:gap-8">
          {/* ── LEFT-RAIL filter ────────────────────────── */}
          <aside className="mb-8 lg:mb-0">
            <div
              className="rounded-md border bg-white p-4"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <p
                data-tech-mono="true"
                className="text-[11px] uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  fontFamily: TECH_MONO_FONT,
                  letterSpacing: '0.18em',
                  fontWeight: 700,
                }}
              >
                Filter
              </p>
              <div
                aria-hidden
                className="mt-2 mb-3 h-px w-full"
                style={{ background: 'var(--shop-border)' }}
              />

              <p
                data-tech-mono="true"
                className="text-[10px] uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  fontFamily: TECH_MONO_FONT,
                  letterSpacing: '0.18em',
                  fontWeight: 600,
                }}
              >
                Category
              </p>

              <ul className="mt-2 space-y-1">
                <li>
                  <Link
                    href={buildUrl()}
                    className="group flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm transition hover:bg-[var(--shop-muted)]"
                    style={{
                      background:
                        selectedCats.length === 0
                          ? 'var(--shop-muted)'
                          : 'transparent',
                      color: 'var(--shop-ink)',
                      fontFamily: TECH_DISPLAY_FONT,
                      fontWeight: selectedCats.length === 0 ? 700 : 500,
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <CompareCheckbox checked={selectedCats.length === 0} />
                      All
                    </span>
                    <span
                      data-tech-mono="true"
                      className="text-[11px]"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        fontFamily: TECH_MONO_FONT,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {props.totalCount.toLocaleString()}
                    </span>
                  </Link>
                </li>

                {categoryNames.map((name) => {
                  const active = selectedCats.includes(name);
                  return (
                    <li key={name}>
                      <Link
                        href={buildUrl(name)}
                        className="group flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm transition hover:bg-[var(--shop-muted)]"
                        style={{
                          background: active ? 'var(--shop-muted)' : 'transparent',
                          color: active ? 'var(--shop-primary)' : 'var(--shop-ink)',
                          fontFamily: TECH_DISPLAY_FONT,
                          fontWeight: active ? 700 : 500,
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <CompareCheckbox checked={active} />
                          {name}
                        </span>
                        <span
                          data-tech-mono="true"
                          className="text-[11px]"
                          style={{
                            color: 'var(--shop-ink-muted)',
                            fontFamily: TECH_MONO_FONT,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {(categoryCounts[name] ?? 0).toLocaleString()}
                        </span>
                      </Link>
                    </li>
                  );
                })}

                {uncatCount > 0 && (
                  <li>
                    <Link
                      href={buildUrl('uncategorized')}
                      className="group flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm transition hover:bg-[var(--shop-muted)]"
                      style={{
                        background: selectedCats.includes('uncategorized')
                          ? 'var(--shop-muted)'
                          : 'transparent',
                        color: selectedCats.includes('uncategorized')
                          ? 'var(--shop-primary)'
                          : 'var(--shop-ink)',
                        fontFamily: TECH_DISPLAY_FONT,
                        fontWeight: selectedCats.includes('uncategorized')
                          ? 700
                          : 500,
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <CompareCheckbox
                          checked={selectedCats.includes('uncategorized')}
                        />
                        Other
                      </span>
                      <span
                        data-tech-mono="true"
                        className="text-[11px]"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          fontFamily: TECH_MONO_FONT,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {uncatCount.toLocaleString()}
                      </span>
                    </Link>
                  </li>
                )}
              </ul>

              {selectedCats.length > 0 && (
                <Link
                  href={buildUrl()}
                  data-tech-mono="true"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-md border px-3 py-1.5 text-[10px] uppercase transition hover:bg-[var(--shop-muted)]"
                  style={{
                    borderColor: 'var(--shop-border)',
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  Clear filters
                </Link>
              )}
            </div>
          </aside>

          {/* ── MAIN COLUMN ─────────────────────────────── */}
          <section>
            {/* Sort spec-selector strip */}
            <div
              className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border bg-white px-4 py-2"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <span
                data-tech-mono="true"
                className="text-[11px] uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  fontFamily: TECH_MONO_FONT,
                  letterSpacing: '0.16em',
                  fontWeight: 600,
                }}
              >
                Showing {pageProducts.length} of {filteredCount.toLocaleString()}
              </span>
              <ETSortSelect
                sortKey={sortKey}
                sortOptions={SORT_OPTIONS}
                sortUrls={Object.fromEntries(SORT_OPTIONS.map(o => [o.key, buildSortUrl(o.key)]))}
              />
            </div>

            {/* Grid */}
            {pageProducts.length === 0 ? (
              <ElectronicsTechEmptyCatalog
                storeSlug={storeSlug}
                hasFilters={selectedCats.length > 0}
                buildUrl={buildUrl}
              />
            ) : (
              <ElectronicsTechCategoryGrid
                storeSlug={storeSlug}
                products={pageProducts}
              />
            )}

            {/* Mono pagination */}
            {totalPages > 1 && (
              <nav
                className="mt-12 flex items-center justify-center gap-3"
                aria-label="Pagination"
              >
                {currentPage > 1 ? (
                  <Link
                    href={buildUrl(undefined, currentPage - 1)}
                    aria-label="Previous page"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white transition hover:border-[var(--shop-primary)] hover:text-[var(--shop-primary)]"
                    style={{
                      borderColor: 'var(--shop-border)',
                      color: 'var(--shop-ink)',
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white opacity-40"
                    style={{
                      borderColor: 'var(--shop-border)',
                      color: 'var(--shop-ink-muted)',
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                )}
                <span
                  data-tech-mono="true"
                  className="inline-flex items-center rounded-md border bg-[var(--shop-muted)] px-4 py-1.5 text-[11px] uppercase"
                  style={{
                    borderColor: 'var(--shop-border)',
                    color: 'var(--shop-ink)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  PAGE {pad2(currentPage)} / {pad2(totalPages)}
                </span>
                {currentPage < totalPages ? (
                  <Link
                    href={buildUrl(undefined, currentPage + 1)}
                    aria-label="Next page"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white transition hover:border-[var(--shop-primary)] hover:text-[var(--shop-primary)]"
                    style={{
                      borderColor: 'var(--shop-border)',
                      color: 'var(--shop-ink)',
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white opacity-40"
                    style={{
                      borderColor: 'var(--shop-border)',
                      color: 'var(--shop-ink-muted)',
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </nav>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/**
 * Compare-checkbox visual hint — small square that flips to filled
 * electric-blue when active. Mirrors the Best-Buy / Newegg compare
 * checkbox column visually without wiring real compare logic.
 */
function CompareCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border"
      style={{
        borderColor: checked ? 'var(--shop-primary)' : 'var(--shop-border)',
        background: checked ? 'var(--shop-primary)' : '#ffffff',
      }}
    >
      {checked && (
        <span
          aria-hidden
          className="block h-1.5 w-1.5 rounded-[1px]"
          style={{ background: '#ffffff' }}
        />
      )}
    </span>
  );
}

function ElectronicsTechEmptyCatalog({
  storeSlug,
  hasFilters,
  buildUrl,
}: {
  storeSlug: string;
  hasFilters: boolean;
  buildUrl: (toggleCat?: string, page?: number) => string;
}) {
  return (
    <div
      className="mx-auto max-w-xl rounded-md border bg-white py-16 text-center"
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
        NO RESULTS · 0 ITEMS
      </p>
      <h2
        className="mt-2 text-2xl"
        style={{
          fontFamily: TECH_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 700,
          letterSpacing: '-0.01em',
        }}
      >
        Nothing matches your filter
      </h2>
      <p
        className="mt-2 text-sm"
        style={{
          color: 'var(--shop-ink-muted)',
          fontFamily: TECH_DISPLAY_FONT,
        }}
      >
        {hasFilters
          ? 'Try clearing your filters to see the full catalog.'
          : 'New stock is on the way — check back soon.'}
      </p>
      {hasFilters ? (
        <Link
          href={buildUrl()}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md px-7 text-sm font-semibold uppercase text-white transition hover:opacity-90"
          style={{
            background: 'var(--shop-primary)',
            fontFamily: TECH_DISPLAY_FONT,
            letterSpacing: '0.08em',
          }}
        >
          Clear filters
        </Link>
      ) : (
        <Link
          href={`/stores/${storeSlug}`}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md px-7 text-sm font-semibold uppercase text-white transition hover:opacity-90"
          style={{
            background: 'var(--shop-primary)',
            fontFamily: TECH_DISPLAY_FONT,
            letterSpacing: '0.08em',
          }}
        >
          Back to store
        </Link>
      )}
    </div>
  );
}
