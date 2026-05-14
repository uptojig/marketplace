/**
 * TrustCategoryPage — bespoke heritage-maison catalog layout.
 *
 * Structural difference from the generic /stores/[slug]/category
 * page and from FashionBeautyCategoryPage:
 *   - Heritage hero band: caps eyebrow ("MAISON · THE COLLECTION"),
 *     centered serif title cartouche framed by gold hairlines, and
 *     a sober caps subline counting filtered pieces. NO italic,
 *     NO portrait magazine voice.
 *   - Filter bar uses SHARP gold-bordered RECTANGLE pills
 *     (rounded-sm) sitting between gold hairlines — heritage
 *     signage feel.
 *   - Sort options render as discreet caps text links separated by
 *     hairline dots, not italic-serif pills.
 *   - Inner grid is the existing TrustCategoryGrid (4-up, square
 *     1/1 imagery, gold-rule frames, navy ink prices).
 *   - Pagination is classical numbered: caps "Previous" /
 *     numbered pages / "Next" arranged on a gold-rule divider.
 *
 * Reuses TrustCategoryGrid as the inner grid so card visuals stay
 * consistent across catalog and any future related-products carousel.
 */

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TrustCategoryGrid } from './TrustCategoryGrid';
import type { TrustCategoryProduct } from './TrustCategoryGrid';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

export interface TrustCategoryPageProps {
  storeSlug: string;
  storeName: string;
  totalCount: number;
  pageProducts: TrustCategoryProduct[];
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
  { key: 'newest', label: 'ล่าสุด' },
  { key: 'price-asc', label: 'ราคาน้อยไปมาก' },
  { key: 'price-desc', label: 'ราคามากไปน้อย' },
];

export function TrustCategoryPage(props: TrustCategoryPageProps) {
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
        {/* Heritage hero band — centered serif cartouche. */}
        <header className="mb-10 text-center sm:mb-14">
          <Link
            href={`/stores/${storeSlug}`}
            className="inline-flex items-center gap-1 text-xs uppercase hover:underline"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.22em',
              fontWeight: 600,
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับสู่เมซอน
          </Link>

          <p
            className="mt-7 text-[11px] uppercase"
            style={{
              color: 'var(--shop-accent)',
              letterSpacing: '0.32em',
              fontWeight: 600,
            }}
          >
            เมซอน · คอลเลกชัน
          </p>

          {/* Title cartouche — squared frame, gold trim. */}
          <div
            className="mx-auto mt-3 inline-block border-y py-3"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl"
              style={{
                fontFamily: TRUST_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
              }}
            >
              คอลเลกชันทั้งหมด
            </h1>
          </div>

          <p
            className="mx-auto mt-5 max-w-xl text-xs uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.22em',
              fontWeight: 600,
            }}
          >
            {filteredCount.toLocaleString()} ชิ้น ·{' '}
            <span style={{ color: 'var(--shop-ink)' }}>{storeName}</span>
          </p>
        </header>

        {/* Filter chips + sort — sharp gold-bordered pills between
            gold hairlines. No sidebar. */}
        <div
          className="mb-10 flex flex-col gap-4 border-y py-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'var(--shop-accent)' }}
        >
          {/* Category chips — squared rectangles. */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.28em',
                fontWeight: 600,
              }}
            >
              กรอง
            </span>
            <Link
              href={buildUrl()}
              className="rounded-sm border px-4 py-1.5 text-xs uppercase transition"
              style={{
                borderColor:
                  selectedCats.length === 0
                    ? 'var(--shop-ink)'
                    : 'var(--shop-accent)',
                background:
                  selectedCats.length === 0 ? 'var(--shop-ink)' : 'transparent',
                color:
                  selectedCats.length === 0 ? '#ffffff' : 'var(--shop-ink)',
                letterSpacing: '0.22em',
                fontWeight: 600,
              }}
            >
              ทั้งหมด
            </Link>
            {categoryNames.map((name) => {
              const active = selectedCats.includes(name);
              return (
                <Link
                  key={name}
                  href={buildUrl(name)}
                  className="rounded-sm border px-4 py-1.5 text-xs uppercase transition hover:border-[var(--shop-ink)]"
                  style={{
                    borderColor: active ? 'var(--shop-ink)' : 'var(--shop-accent)',
                    background: active ? 'var(--shop-ink)' : 'transparent',
                    color: active ? '#ffffff' : 'var(--shop-ink)',
                    letterSpacing: '0.22em',
                    fontWeight: 600,
                  }}
                >
                  {name}
                  <span className="ml-2 font-mono text-[10px] opacity-70">
                    {categoryCounts[name] ?? 0}
                  </span>
                </Link>
              );
            })}
            {uncatCount > 0 && (
              <Link
                href={buildUrl('uncategorized')}
                className="rounded-sm border px-4 py-1.5 text-xs uppercase transition hover:border-[var(--shop-ink)]"
                style={{
                  borderColor: selectedCats.includes('uncategorized')
                    ? 'var(--shop-ink)'
                    : 'var(--shop-accent)',
                  background: selectedCats.includes('uncategorized')
                    ? 'var(--shop-ink)'
                    : 'transparent',
                  color: selectedCats.includes('uncategorized')
                    ? '#ffffff'
                    : 'var(--shop-ink)',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                }}
              >
                อื่น ๆ
                <span className="ml-2 font-mono text-[10px] opacity-70">
                  {uncatCount}
                </span>
              </Link>
            )}
          </div>

          {/* Sort — discreet caps text links with dot separators. */}
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.28em',
                fontWeight: 600,
              }}
            >
              จัดเรียง
            </span>
            {SORT_OPTIONS.map((opt, i) => {
              const active = sortKey === opt.key;
              return (
                <span
                  key={opt.key}
                  className="inline-flex items-center gap-3"
                >
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="h-1 w-1 rounded-full"
                      style={{ background: 'var(--shop-accent)' }}
                    />
                  )}
                  <Link
                    href={buildSortUrl(opt.key)}
                    className="text-[11px] uppercase transition hover:underline"
                    style={{
                      color: active
                        ? 'var(--shop-ink)'
                        : 'var(--shop-ink-muted)',
                      letterSpacing: '0.22em',
                      fontWeight: active ? 700 : 600,
                    }}
                  >
                    {opt.label}
                  </Link>
                </span>
              );
            })}
          </div>
        </div>

        {/* Grid — uses existing TrustCategoryGrid. */}
        {pageProducts.length === 0 ? (
          <TrustEmptyCatalog
            storeSlug={storeSlug}
            hasFilters={selectedCats.length > 0}
            buildUrl={buildUrl}
          />
        ) : (
          <TrustCategoryGrid storeSlug={storeSlug} products={pageProducts} />
        )}

        {/* Pagination — classical numbered with gold-rule divider. */}
        {totalPages > 1 && (
          <nav
            className="mt-16 flex flex-wrap items-center justify-center gap-3 border-t pt-7 sm:gap-5"
            style={{ borderColor: 'var(--shop-accent)' }}
            aria-label="Pagination"
          >
            {currentPage > 1 ? (
              <Link
                href={buildUrl(undefined, currentPage - 1)}
                className="inline-flex items-center gap-1.5 text-xs uppercase transition hover:underline"
                style={{
                  color: 'var(--shop-ink)',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                ก่อนหน้า
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 text-xs uppercase opacity-30"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                ก่อนหน้า
              </span>
            )}

            {/* Numbered page buttons — squared, charcoal-on-active. */}
            <div className="flex items-center gap-1.5">
              {buildPageList(currentPage, totalPages).map((p, i) =>
                p === '…' ? (
                  <span
                    key={`gap-${i}`}
                    className="px-1 text-xs"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={buildUrl(undefined, p)}
                    className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-sm border px-2 text-xs font-semibold tabular-nums transition"
                    style={{
                      borderColor:
                        p === currentPage
                          ? 'var(--shop-ink)'
                          : 'var(--shop-accent)',
                      background:
                        p === currentPage ? 'var(--shop-ink)' : 'transparent',
                      color:
                        p === currentPage ? '#ffffff' : 'var(--shop-ink)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {p}
                  </Link>
                ),
              )}
            </div>

            {currentPage < totalPages ? (
              <Link
                href={buildUrl(undefined, currentPage + 1)}
                className="inline-flex items-center gap-1.5 text-xs uppercase transition hover:underline"
                style={{
                  color: 'var(--shop-ink)',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                }}
              >
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 text-xs uppercase opacity-30"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                }}
              >
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}

/**
 * Build a compact page list with gaps for the pagination strip.
 * Ex: current=5 of 12 → [1, '…', 4, 5, 6, '…', 12].
 */
function buildPageList(current: number, total: number): Array<number | '…'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | '…'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

function TrustEmptyCatalog({
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
      <p
        className="text-[11px] uppercase"
        style={{
          color: 'var(--shop-accent)',
          letterSpacing: '0.32em',
          fontWeight: 600,
        }}
      >
        เมซอน · ไม่พบสินค้า
      </p>
      <h2
        className="mt-3 text-3xl"
        style={{
          fontFamily: TRUST_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        ยังไม่มีสินค้าในคอลเลกชัน
      </h2>
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
        {hasFilters
          ? 'ไม่มีสินค้าตรงกับการเลือกปัจจุบัน ล้างตัวกรองเพื่อดูคอลเลกชันทั้งหมด'
          : 'อาตเลียร์กำลังเตรียมคอลเลกชันถัดไป กรุณากลับมาในเร็ว ๆ นี้'}
      </p>
      {hasFilters ? (
        <Link
          href={buildUrl()}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-sm px-8 text-xs font-semibold uppercase text-white transition hover:opacity-90"
          style={{
            background: 'var(--shop-primary)',
            letterSpacing: '0.28em',
          }}
        >
          ล้างตัวกรอง
        </Link>
      ) : (
        <Link
          href={`/stores/${storeSlug}`}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-sm px-8 text-xs font-semibold uppercase text-white transition hover:opacity-90"
          style={{
            background: 'var(--shop-primary)',
            letterSpacing: '0.28em',
          }}
        >
          กลับสู่เมซอน
        </Link>
      )}
    </div>
  );
}
