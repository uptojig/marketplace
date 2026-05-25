'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import type { CatalogProps } from '@/lib/templates/types';

const PRICE_TIERS = [
  { label: 'ต่ำกว่า 500', max: 500 },
  { label: '500 - 2,000', min: 500, max: 2000 },
  { label: '2,000 - 5,000', min: 2000, max: 5000 },
  { label: '5,000+', min: 5000 },
];

/**
 * GridModu — Catalog. Fixed left sidebar (categories + price tiers) +
 * dense spec-row product grid + pagination footer.
 *
 * "ทั้งหมด" clicks back to the all-categories view and shows the sum
 * of categoryCounts so the total reflects every match across filters.
 */
export default function Catalog(props: CatalogProps) {
  const {
    store,
    pageProducts,
    categoryNames,
    categoryCounts,
    selectedCats,
    currentPage,
    totalPages,
    filteredCount,
    buildUrl,
  } = props;

  const allActive = selectedCats.length === 0;
  // Sum across all category counts — true total when "ทั้งหมด" is selected.
  const totalAll = Object.values(categoryCounts).reduce(
    (acc, n) => acc + (n || 0),
    0,
  );

  // Page numbers with ellipsis for long lists.
  const pageItems: (number | 'ellipsis')[] = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items: (number | 'ellipsis')[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) items.push('ellipsis');
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages - 1) items.push('ellipsis');
    items.push(totalPages);
    return items;
  })();

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E5E7EB] font-[family:var(--font-prompt)]">
      {/* Catalog header */}
      <section className="border-b border-[#1F1F23] bg-[#15151A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-2">
            <Link href={`/stores/${store.slug}/`} className="hover:text-[var(--shop-accent,#00BFFF)]">
              HOME
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: 'var(--shop-accent, #00BFFF)' }}>CATALOG</span>
          </div>
          <h1 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-3xl sm:text-4xl text-white">
            <span
              className="inline-block h-7 w-1.5 align-middle mr-3"
              style={{ background: 'var(--shop-accent, #00BFFF)' }}
              aria-hidden
            />
            แคตตาล็อกอะไหล่
          </h1>
          <p className="mt-2 text-sm text-[#9CA3AF] tabular-nums">
            พบ <strong className="text-white">{filteredCount.toLocaleString()}</strong>{' '}
            รายการ · หน้า {currentPage}/{Math.max(1, totalPages)}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-6">
          {/* Categories */}
          <div className="bg-[#15151A] border border-[#1F1F23] rounded-sm">
            <div className="px-4 py-3 border-b border-[#1F1F23] flex items-center gap-2">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white">
                หมวดหมู่ · CATEGORIES
              </h2>
            </div>
            <ul className="py-2">
              {/* ทั้งหมด — clears filters; count is sum across categoryCounts */}
              <li>
                <Link
                  href={buildUrl(undefined, 1)}
                  aria-pressed={allActive}
                  className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider font-[family:var(--font-kanit)] font-semibold transition-colors"
                  style={{
                    color: allActive
                      ? 'var(--shop-accent, #00BFFF)'
                      : '#E5E7EB',
                    background: allActive ? 'rgba(0,191,255,0.06)' : 'transparent',
                    borderLeft: allActive
                      ? '2px solid var(--shop-accent, #00BFFF)'
                      : '2px solid transparent',
                  }}
                >
                  <span>ทั้งหมด</span>
                  <span className="tabular-nums text-[#6B7280]">
                    {totalAll.toLocaleString()}
                  </span>
                </Link>
              </li>
              {categoryNames.map((cat) => {
                const active = selectedCats.includes(cat);
                const count = categoryCounts[cat] ?? 0;
                return (
                  <li key={cat}>
                    <Link
                      href={buildUrl(cat, 1)}
                      aria-pressed={active}
                      className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider font-[family:var(--font-kanit)] font-semibold transition-colors hover:bg-[#1F1F23]"
                      style={{
                        color: active ? 'var(--shop-accent, #00BFFF)' : '#E5E7EB',
                        background: active ? 'rgba(0,191,255,0.06)' : 'transparent',
                        borderLeft: active
                          ? '2px solid var(--shop-accent, #00BFFF)'
                          : '2px solid transparent',
                      }}
                    >
                      <span className="line-clamp-1">{cat}</span>
                      <span className="tabular-nums text-[#6B7280] ml-2">
                        {count.toLocaleString()}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Price tiers (visual only — anchor to all-products view) */}
          <div className="bg-[#15151A] border border-[#1F1F23] rounded-sm">
            <div className="px-4 py-3 border-b border-[#1F1F23] flex items-center gap-2">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white">
                ช่วงราคา · PRICE
              </h2>
            </div>
            <ul className="py-2">
              {PRICE_TIERS.map((t) => (
                <li key={t.label}>
                  <Link
                    href={`/stores/${store.slug}/category`}
                    className="flex items-center justify-between px-4 py-2 text-xs uppercase tracking-wider font-[family:var(--font-kanit)] font-semibold text-[#E5E7EB] hover:text-[var(--shop-accent,#00BFFF)] hover:bg-[#1F1F23] transition-colors"
                  >
                    <span>฿ {t.label}</span>
                    <ChevronRight className="h-3 w-3 text-[#6B7280]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── PRODUCT GRID ─────────────────────────────────────── */}
        <main>
          {pageProducts.length === 0 ? (
            <div className="bg-[#15151A] border border-[#1F1F23] rounded-sm py-16 text-center">
              <Wrench
                className="h-10 w-10 mx-auto text-[#2A2A2E] mb-4"
                aria-hidden
              />
              <p className="text-[#9CA3AF] mb-4">ไม่พบสินค้าตามเงื่อนไข</p>
              <Link
                href={buildUrl(undefined, 1)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-[#2A2A2E] text-xs uppercase tracking-wider font-[family:var(--font-kanit)] font-semibold hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)]"
              >
                ล้างตัวกรอง
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pageProducts.map((p, i) => {
                const idShort = p.id.slice(-6).toUpperCase();
                const savings = p.compareAtPriceTHB
                  ? Math.max(0, p.compareAtPriceTHB - p.priceTHB)
                  : 0;
                const savingsPct =
                  p.compareAtPriceTHB && p.compareAtPriceTHB > 0
                    ? Math.round((savings / p.compareAtPriceTHB) * 100)
                    : 0;
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="bg-[#15151A] border border-[#1F1F23] rounded-sm overflow-hidden flex flex-col hover:border-[var(--shop-accent,#00BFFF)] transition-colors group"
                  >
                    <div className="aspect-square bg-[#0E0E10] relative">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center">
                          <Wrench className="h-10 w-10 text-[#2A2A2E]" aria-hidden />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 text-[9px] tracking-[0.2em] uppercase tabular-nums text-[#9CA3AF] bg-[#0E0E10]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border border-[#1F1F23] font-[family:var(--font-kanit)] font-semibold">
                        SKU·{idShort}
                      </div>
                      {savingsPct > 0 && (
                        <div
                          className="absolute top-2 right-2 text-[10px] tracking-wider uppercase tabular-nums px-1.5 py-0.5 rounded-sm font-[family:var(--font-kanit)] font-bold"
                          style={{
                            background: 'var(--shop-accent, #00BFFF)',
                            color: '#0E0E10',
                          }}
                        >
                          −{savingsPct}%
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col gap-2">
                      {p.categoryName && (
                        <div className="text-[9px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold">
                          {p.categoryName}
                        </div>
                      )}
                      <span className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wide text-sm text-white line-clamp-2">
                        {p.title}
                      </span>
                      {/* Mini spec row */}
                      <dl className="text-[10px] border-t border-[#1F1F23] pt-2 mt-auto flex items-center justify-between">
                        <dt className="text-[#6B7280] tracking-wider uppercase font-[family:var(--font-kanit)] font-semibold">
                          MODULE
                        </dt>
                        <dd className="text-[#9CA3AF] tabular-nums tracking-wider font-[family:var(--font-kanit)] font-semibold">
                          M{String((currentPage - 1) * 12 + i + 1).padStart(3, '0')}
                        </dd>
                      </dl>
                      <div className="flex items-baseline justify-between pt-2 border-t border-[#1F1F23]">
                        <div className="flex flex-col">
                          {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB ? (
                            <span className="text-[10px] line-through text-[#6B7280] tabular-nums">
                              {formatTHB(p.compareAtPriceTHB)}
                            </span>
                          ) : null}
                          <span
                            className="font-bold text-base tabular-nums"
                            style={{ color: 'var(--shop-accent, #00BFFF)' }}
                          >
                            {formatTHB(p.priceTHB)}
                          </span>
                        </div>
                        <span
                          className="p-2 rounded-sm border border-[#2A2A2E] text-[#9CA3AF] group-hover:border-[var(--shop-accent,#00BFFF)] group-hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
                          aria-hidden
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="หน้า"
              className="mt-8 flex items-center justify-center gap-2"
            >
              <Link
                href={
                  currentPage > 1
                    ? buildUrl(undefined, currentPage - 1)
                    : buildUrl(undefined, 1)
                }
                aria-disabled={currentPage <= 1}
                className="p-2 rounded-sm border border-[#1F1F23] text-[#9CA3AF] hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
                style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              {pageItems.map((it, i) =>
                it === 'ellipsis' ? (
                  <span
                    key={`e-${i}`}
                    className="px-2 text-[#6B7280] tabular-nums"
                    aria-hidden
                  >
                    ···
                  </span>
                ) : (
                  <Link
                    key={it}
                    href={buildUrl(undefined, it)}
                    aria-current={it === currentPage ? 'page' : undefined}
                    className="min-w-9 h-9 px-3 grid place-items-center rounded-sm border text-xs font-[family:var(--font-kanit)] font-semibold tabular-nums tracking-wider transition-colors"
                    style={{
                      borderColor:
                        it === currentPage
                          ? 'var(--shop-accent, #00BFFF)'
                          : '#1F1F23',
                      background:
                        it === currentPage
                          ? 'var(--shop-accent, #00BFFF)'
                          : 'transparent',
                      color: it === currentPage ? '#0E0E10' : '#E5E7EB',
                    }}
                  >
                    {it}
                  </Link>
                ),
              )}
              <Link
                href={
                  currentPage < totalPages
                    ? buildUrl(undefined, currentPage + 1)
                    : buildUrl(undefined, totalPages)
                }
                aria-disabled={currentPage >= totalPages}
                className="p-2 rounded-sm border border-[#1F1F23] text-[#9CA3AF] hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
                style={{ opacity: currentPage >= totalPages ? 0.4 : 1 }}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
