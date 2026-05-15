/**
 * BusinessModelCategoryPage — bespoke deal-dashboard catalog layout.
 *
 * Structural difference from the generic /stores/[slug]/category page
 * and from FashionBeautyCategoryPage / TrustCategoryPage:
 *   - Top spread reads as a B2B "DEAL DASHBOARD": caps eyebrow
 *     ("DEAL DASHBOARD · BULK CATALOG") + bold sans h1 + mono-numeric
 *     count chip ("SKUs 248 · ON SALE 36"). NO italic anywhere.
 *   - Red countdown stripe pinned UNDER the header — "Daily deals
 *     refresh in HH:MM:SS" with mono numerals. Static stub from a
 *     hash of the slug so SSR is stable.
 *   - Filter chips rail looks like a SPREADSHEET FILTER ROW: tight
 *     rectangular pills with hairline borders, count in mono caps,
 *     active state = solid red fill. Sort row is a separate "Sort by"
 *     pill group on the right. Both rails sit between two zinc
 *     hairlines so the area reads as a dashboard toolbar.
 *   - Inner grid is the existing BusinessModelCategoryGrid (no change).
 *   - Pagination renders as TWO pieces: a mono-numeric "Page X of Y"
 *     readout plus a rectangular "Load more" CTA when there is a next
 *     page. Sits on a yellow-50 footer band — feels like a "show more
 *     rows" dashboard footer.
 *
 * Reuses BusinessModelCategoryGrid for product cards so the deal
 * stickers, mono prices and SKU captions stay consistent.
 *
 * Props shape mirrors FashionBeautyCategoryPageProps exactly so the
 * page.tsx dispatch can swap variants without remapping.
 */

import Link from 'next/link';
import { ChevronLeft, Inbox, Timer, TrendingDown } from 'lucide-react';
import { BusinessModelCategoryGrid } from './BusinessModelCategoryGrid';
import type { BusinessModelCategoryProduct } from './BusinessModelCategoryGrid';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

export interface BusinessModelCategoryPageProps {
  storeSlug: string;
  storeName: string;
  totalCount: number;
  pageProducts: BusinessModelCategoryProduct[];
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
  { key: 'newest', label: 'ใหม่ล่าสุด' },
  { key: 'price-asc', label: 'ราคา ↑' },
  { key: 'price-desc', label: 'ราคา ↓' },
];

/**
 * Static deterministic countdown stub — same trick as BusinessModelProductHero.
 * Not a real timer; renders HH:MM:SS in mono with tabular-nums so SSR/CSR
 * agree. Caller is the catalog footer: "Daily deals refresh in …".
 *
 * TODO(timer): wire to a real "deals reset at" timestamp once Sale rows
 * land in Prisma.
 */
function stubCountdown(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hh = String(2 + (hash % 10)).padStart(2, '0');
  const mm = String(hash % 60).padStart(2, '0');
  const ss = String((hash >> 8) % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function BusinessModelCategoryPage(props: BusinessModelCategoryPageProps) {
  const {
    storeSlug,
    storeName,
    totalCount,
    pageProducts,
    selectedCats,
    sortKey,
    currentPage,
    totalPages,
    buildUrl,
    buildSortUrl,
  } = props;

  const onSaleCount = pageProducts.filter(
    (p) => p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB,
  ).length;
  const countdown = stubCountdown(storeSlug);

  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {/* Dashboard header */}
        <header className="mb-5 sm:mb-6">
          <Link
            href={`/stores/${storeSlug}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับไป {storeName}
          </Link>
          <p
            className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            แดชบอร์ดดีล · แคตตาล็อกขายส่ง
          </p>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3">
            <h1
              className="text-3xl sm:text-4xl"
              style={{
                color: 'var(--shop-ink)',
                fontWeight: 700,
                letterSpacing: '-0.015em',
                lineHeight: 1.05,
              }}
            >
              สินค้าทั้งหมด
            </h1>
            <span
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold"
              style={{
                borderColor: 'var(--shop-border)',
                color: 'var(--shop-ink-muted)',
              }}
            >
              <span className="uppercase tracking-[0.12em]">สินค้า</span>
              <span
                data-bm-mono="true"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: BM_MONO_FONT,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 700,
                }}
              >
                {totalCount.toLocaleString()}
              </span>
              <span aria-hidden style={{ color: 'var(--shop-border)' }}>
                ·
              </span>
              <span className="uppercase tracking-[0.12em]">ลดราคา</span>
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
          </div>
        </header>

        {/* Countdown stripe — daily deals refresh */}
        <div
          data-bm-countdown="true"
          className="mb-5 flex flex-wrap items-center justify-center gap-3 rounded-md px-4 py-2.5 text-sm sm:text-base"
          style={{ background: 'var(--shop-primary)', color: '#ffffff' }}
        >
          <Timer className="h-4 w-4 shrink-0" />
          <span className="font-bold uppercase tracking-[0.12em]">
            ดีลรอบหน้าใน
          </span>
          <span
            data-bm-mono="true"
            className="text-base font-bold sm:text-lg"
            style={{
              fontFamily: BM_MONO_FONT,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.02em',
            }}
          >
            {countdown}
          </span>
          <span className="hidden text-xs opacity-90 sm:inline">
            · รีเฟรชทุกเที่ยงคืน
          </span>
        </div>

        {/* Sort toolbar — top nav already handles category filter. */}
        <div
          className="mb-6 grid gap-3 border-y py-3"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          {/* Sort pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[10px] font-semibold uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.12em',
              }}
            >
              เรียง
            </span>
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.key;
              return (
                <Link
                  key={opt.key}
                  href={buildSortUrl(opt.key)}
                  className="rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] transition hover:border-[var(--shop-primary)]"
                  style={{
                    borderColor: active
                      ? 'var(--shop-ink)'
                      : 'var(--shop-border)',
                    background: active ? 'var(--shop-ink)' : '#ffffff',
                    color: active ? '#ffffff' : 'var(--shop-ink)',
                  }}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Inner grid — uses existing BusinessModelCategoryGrid */}
        {pageProducts.length === 0 ? (
          <BusinessModelEmptyCatalog
            storeSlug={storeSlug}
            hasFilters={selectedCats.length > 0}
            buildUrl={buildUrl}
          />
        ) : (
          <BusinessModelCategoryGrid storeSlug={storeSlug} products={pageProducts} />
        )}

        {/* Pagination — mono-numeric readout + Load-more CTA + numbered links */}
        {totalPages > 1 && (
          <nav
            className="mt-10 rounded-md border px-4 py-5 sm:px-6 sm:py-6"
            style={{
              background: 'var(--shop-muted)',
              borderColor: 'var(--shop-border)',
            }}
            aria-label="Pagination"
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <span
                className="text-[11px] font-semibold uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.12em',
                }}
              >
                Page{' '}
                <span
                  data-bm-mono="true"
                  className="font-bold"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: BM_MONO_FONT,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {currentPage}
                </span>{' '}
                of{' '}
                <span
                  data-bm-mono="true"
                  className="font-bold"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: BM_MONO_FONT,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {totalPages}
                </span>
              </span>

              <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={buildUrl(undefined, currentPage - 1)}
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-md border bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] transition hover:border-[var(--shop-primary)]"
                    style={{
                      borderColor: 'var(--shop-border)',
                      color: 'var(--shop-ink)',
                    }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </Link>
                ) : (
                  <span
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-md border bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] opacity-40"
                    style={{
                      borderColor: 'var(--shop-border)',
                      color: 'var(--shop-ink-muted)',
                    }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </span>
                )}

                {currentPage < totalPages ? (
                  <Link
                    href={buildUrl(undefined, currentPage + 1)}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-5 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:opacity-90"
                    style={{ background: 'var(--shop-primary)' }}
                  >
                    <TrendingDown className="h-3.5 w-3.5" />
                    Load more deals
                  </Link>
                ) : (
                  <span
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border bg-white px-5 text-xs font-bold uppercase tracking-[0.08em] opacity-40"
                    style={{
                      borderColor: 'var(--shop-border)',
                      color: 'var(--shop-ink-muted)',
                    }}
                  >
                    Last page
                  </span>
                )}
              </div>
            </div>
          </nav>
        )}
      </main>
    </div>
  );
}

function BusinessModelEmptyCatalog({
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
        ไม่พบสินค้า
      </p>
      <h2
        className="mt-2 text-2xl"
        style={{
          color: 'var(--shop-ink)',
          fontWeight: 700,
          letterSpacing: '-0.015em',
        }}
      >
        ยังไม่มีสินค้าในแคตตาล็อก
      </h2>
      <p
        className="mx-auto mt-3 max-w-sm text-sm"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        {hasFilters
          ? 'ล้าง filter ที่เปิดอยู่เพื่อดูแคตตาล็อกทั้งหมด'
          : 'กำลังโหลดสต็อกใหม่ — กลับมาดูอีกสักครู่'}
      </p>
      {hasFilters ? (
        <Link
          href={buildUrl()}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md px-7 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:opacity-90"
          style={{ background: 'var(--shop-primary)' }}
        >
          ล้าง filter
        </Link>
      ) : (
        <Link
          href={`/stores/${storeSlug}`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md px-7 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:opacity-90"
          style={{ background: 'var(--shop-primary)' }}
        >
          กลับไปหน้าร้าน
        </Link>
      )}
    </div>
  );
}
