'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, SlidersHorizontal } from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import type { CatalogProps } from '@/lib/templates/types';

const SORT_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'newest', label: 'มาใหม่' },
  { key: 'price-asc', label: 'ราคาต่ำ → สูง' },
  { key: 'price-desc', label: 'ราคาสูง → ต่ำ' },
];

/**
 * Konvy — K-beauty catalog with left sidebar + sort + pagination.
 *
 * Layout:
 *   - LEFT sidebar (sticky): "ทั้งหมด" + per-category counts (sum of
 *     categoryCounts when filtered, matching the taobao pattern).
 *   - TOP bar: sort dropdown + result count.
 *   - GRID: 2/3/4 col responsive cards with shadow-sm → shadow-xl.
 *   - FOOTER pagination: prev / numbered / next with rounded buttons.
 *
 * Default export so the registry can mount it directly.
 */
export default function Catalog(props: CatalogProps) {
  const {
    store,
    pageProducts,
    categoryNames,
    categoryCounts,
    selectedCats,
    sortKey,
    currentPage,
    totalPages,
    filteredCount,
    buildUrl,
    buildSortUrl,
  } = props;

  // "ทั้งหมด" count: when nothing is filtered, show filteredCount (= grand
  // total of active products); when a filter is applied, also show
  // filteredCount so the chip reflects the post-filter grid.
  const allCount =
    selectedCats.length === 0
      ? filteredCount
      : Object.values(categoryCounts).reduce<number>((sum, n) => sum + n, 0);

  return (
    <div
      className="font-[family:var(--font-prompt)] text-[var(--shop-ink)]"
      style={{ background: 'var(--shop-bg, #FFFFFF)' }}
    >
      {/* Top heading band */}
      <section
        className="border-b border-[var(--shop-border)]"
        style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2"
            style={{ color: 'var(--shop-primary)' }}
          >
            Shop the edit
          </p>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-semibold tracking-tight">
            สินค้าทั้งหมด
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {filteredCount.toLocaleString()} รายการพร้อมส่ง
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* LEFT sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--shop-primary)' }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            หมวดหมู่
          </h2>
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link
                href={buildUrl()}
                className="flex items-center justify-between px-3 py-2 rounded-full transition-colors"
                style={{
                  background:
                    selectedCats.length === 0
                      ? 'var(--shop-bg-soft)'
                      : 'transparent',
                  color:
                    selectedCats.length === 0
                      ? 'var(--shop-primary)'
                      : 'var(--shop-ink)',
                  fontWeight: selectedCats.length === 0 ? 600 : 400,
                }}
              >
                <span>ทั้งหมด</span>
                <span
                  className="text-[11px]"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {allCount.toLocaleString()}
                </span>
              </Link>
            </li>
            {categoryNames.map((cat) => {
              const active = selectedCats.includes(cat);
              return (
                <li key={cat}>
                  <Link
                    href={buildUrl(cat)}
                    className="flex items-center justify-between px-3 py-2 rounded-full transition-colors hover:bg-[var(--shop-bg-soft)]"
                    style={{
                      background: active ? 'var(--shop-bg-soft)' : 'transparent',
                      color: active ? 'var(--shop-primary)' : 'var(--shop-ink)',
                      fontWeight: active ? 600 : 400,
                    }}
                    aria-pressed={active}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    <span
                      className="text-[11px] shrink-0"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {categoryCounts[cat] ?? 0}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* RIGHT — grid + sort + pagination */}
        <section>
          {/* Sort bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--shop-border)]">
            <p className="text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
              พบ <strong style={{ color: 'var(--shop-ink)' }}>
                {filteredCount.toLocaleString()}
              </strong> รายการ
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] uppercase tracking-[0.15em] font-medium"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                เรียงตาม
              </span>
              {SORT_OPTIONS.map((opt) => {
                const active = sortKey === opt.key;
                return (
                  <Link
                    key={opt.key}
                    href={buildSortUrl(opt.key)}
                    className="px-3 py-1.5 rounded-full text-xs transition-colors border"
                    style={{
                      background: active
                        ? 'var(--shop-primary)'
                        : 'transparent',
                      borderColor: active
                        ? 'var(--shop-primary)'
                        : 'var(--shop-border)',
                      color: active ? '#fff' : 'var(--shop-ink)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          {pageProducts.length === 0 ? (
            <div className="text-center py-20">
              <Heart
                className="h-12 w-12 mx-auto mb-4 opacity-30"
                style={{ color: 'var(--shop-primary)' }}
              />
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                ยังไม่มีสินค้าตรงตามเงื่อนไข
              </p>
              {selectedCats.length > 0 && (
                <Link
                  href={buildUrl()}
                  className="inline-block px-5 py-2 rounded-full text-sm font-medium text-white"
                  style={{ background: 'var(--shop-primary)' }}
                >
                  ล้างตัวกรอง
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {pageProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--shop-border)] flex flex-col"
                >
                  <div
                    className="relative aspect-square overflow-hidden"
                    style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-30">
                        <Heart
                          className="h-10 w-10"
                          style={{ color: 'var(--shop-primary)' }}
                        />
                      </div>
                    )}
                    {p.compareAtPriceTHB &&
                      p.compareAtPriceTHB > p.priceTHB && (
                        <span
                          className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider text-white px-2.5 py-1 rounded-full"
                          style={{ background: 'var(--shop-primary)' }}
                        >
                          Sale
                        </span>
                      )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    {p.categoryName && (
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {p.categoryName}
                      </span>
                    )}
                    <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-3 flex-1">
                      {p.title}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-auto">
                      <span
                        className="font-[family:var(--font-kanit)] font-semibold text-base"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {formatTHB(p.priceTHB)}
                      </span>
                      {p.compareAtPriceTHB &&
                        p.compareAtPriceTHB > p.priceTHB && (
                          <span
                            className="text-xs line-through"
                            style={{ color: 'var(--shop-ink-muted)' }}
                          >
                            {formatTHB(p.compareAtPriceTHB)}
                          </span>
                        )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="หน้า"
              className="mt-12 flex items-center justify-center gap-2 sm:gap-3"
            >
              {currentPage > 1 ? (
                <Link
                  href={buildUrl(undefined, currentPage - 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[var(--shop-border)] text-sm bg-white hover:bg-[var(--shop-bg-soft)] transition-colors"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-label="หน้าก่อนหน้า"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">ก่อนหน้า</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[var(--shop-border)] text-sm opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">ก่อนหน้า</span>
                </span>
              )}

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (pg) =>
                      pg === 1 ||
                      pg === totalPages ||
                      Math.abs(pg - currentPage) <= 1,
                  )
                  .map((pg, i, arr) => {
                    const prev = arr[i - 1];
                    const ellipsis = prev !== undefined && pg - prev > 1;
                    return (
                      <React.Fragment key={pg}>
                        {ellipsis && (
                          <span
                            className="px-1.5 text-xs"
                            style={{ color: 'var(--shop-ink-muted)' }}
                          >
                            …
                          </span>
                        )}
                        <Link
                          href={buildUrl(undefined, pg)}
                          className="min-w-[36px] h-9 px-2 rounded-full text-sm inline-flex items-center justify-center transition-colors"
                          style={{
                            background:
                              pg === currentPage
                                ? 'var(--shop-primary)'
                                : 'transparent',
                            color:
                              pg === currentPage
                                ? '#fff'
                                : 'var(--shop-ink)',
                            border:
                              pg === currentPage
                                ? '1px solid var(--shop-primary)'
                                : '1px solid var(--shop-border)',
                            fontWeight: pg === currentPage ? 600 : 400,
                          }}
                          aria-current={pg === currentPage ? 'page' : undefined}
                        >
                          {pg}
                        </Link>
                      </React.Fragment>
                    );
                  })}
              </div>

              {currentPage < totalPages ? (
                <Link
                  href={buildUrl(undefined, currentPage + 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[var(--shop-border)] text-sm bg-white hover:bg-[var(--shop-bg-soft)] transition-colors"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-label="หน้าถัดไป"
                >
                  <span className="hidden sm:inline">ถัดไป</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[var(--shop-border)] text-sm opacity-40">
                  <span className="hidden sm:inline">ถัดไป</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
