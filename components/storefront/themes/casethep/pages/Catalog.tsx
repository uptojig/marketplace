'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Smartphone, SlidersHorizontal } from 'lucide-react';
import { formatTHB } from '@/lib/utils';

interface ProductCard {
  id: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  categoryName?: string | null;
}

/**
 * CatalogProps mirrors `lib/templates/types.ts` exactly. `buildUrl` and
 * `buildSortUrl` are reconstructed by `CatalogBridge` on the client from
 * pre-computed URL maps the server passes — they are real functions
 * by the time this component renders.
 */
interface CatalogProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  pageProducts: ProductCard[];
  categoryNames: string[];
  categoryCounts: Record<string, number>;
  selectedCats: string[];
  sortKey: string;
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  buildUrl: (toggleCat?: string, page?: number) => string;
  buildSortUrl: (sort: string) => string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'ใหม่ล่าสุด' },
  { value: 'price-asc', label: 'ราคา ต่ำ → สูง' },
  { value: 'price-desc', label: 'ราคา สูง → ต่ำ' },
  { value: 'name-asc', label: 'ชื่อ A → Z' },
];

// Color filter is decorative — when an operator wires variant colors
// to real data we'd toggle URL params here. For now show static chips.
const COLOR_FILTERS = [
  { name: 'Coral Pink', hex: '#FF8597' },
  { name: 'Cream', hex: '#F4ECDC' },
  { name: 'Sage Green', hex: '#A8C5A2' },
  { name: 'Sky Blue', hex: '#A7C8E5' },
  { name: 'Lavender', hex: '#C6B4D8' },
  { name: 'Midnight', hex: '#22232A' },
  { name: 'Mocha', hex: '#8A6F5C' },
  { name: 'Sand', hex: '#E2C9A0' },
];

// Decorative device picker — anchored on common iPhone / Samsung
// labels. Selecting a chip just nav's to ?cat= so empty stores don't
// crash; real device filtering can hook into this later.
const DEVICE_FILTERS = [
  'iPhone 15 / Pro',
  'iPhone 14 / Pro',
  'iPhone 13',
  'Samsung S24',
  'Samsung S23',
];

const PRICE_BUCKETS = [
  { label: 'ต่ำกว่า ฿200', max: 199 },
  { label: '฿200 – ฿499', min: 200, max: 499 },
  { label: '฿500 – ฿999', min: 500, max: 999 },
  { label: 'มากกว่า ฿1,000', min: 1000 },
];

export default function Catalog({
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
}: CatalogProps) {
  // "ทั้งหมด" count — when filtered (selectedCats.length > 0) show the
  // sum of categoryCounts so the sidebar surface mirrors the total
  // pool the user is filtering INTO. When no filters, show the
  // current filteredCount (which equals the unfiltered total).
  const allCount = useMemo(() => {
    if (selectedCats.length === 0) return filteredCount;
    const sum = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    return sum || filteredCount;
  }, [selectedCats, categoryCounts, filteredCount]);

  // Decorative swatches per card — purely visual so each tile hints
  // at the swatch row a real PDP would show.
  const swatchSet = (idx: number) => [
    COLOR_FILTERS[idx % COLOR_FILTERS.length],
    COLOR_FILTERS[(idx + 2) % COLOR_FILTERS.length],
    COLOR_FILTERS[(idx + 4) % COLOR_FILTERS.length],
    COLOR_FILTERS[(idx + 6) % COLOR_FILTERS.length],
  ];

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
    >
      {/* Page header */}
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] uppercase tracking-wide mb-2">
            {store.name}
          </p>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-semibold tracking-tight">
            สินค้าทั้งหมด
          </h1>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-2">
            ทั้งหมด {filteredCount.toLocaleString()} รายการ
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10">
        {/* Sidebar — device + color + price filters */}
        <aside className="space-y-6 lg:sticky lg:top-20 self-start">
          {/* Categories */}
          <div className="rounded-2xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-[color:var(--shop-primary,#FF5A6A)]" />
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-sm tracking-tight">
                หมวดหมู่
              </h2>
            </div>
            <div className="space-y-1">
              <Link
                href={buildUrl(undefined, 1)}
                className={`flex items-center justify-between rounded-full px-3 py-1.5 text-sm transition-colors ${
                  selectedCats.length === 0
                    ? 'text-white'
                    : 'text-[color:var(--shop-ink,#1A1A1F)] hover:bg-[#F5F1EB]'
                }`}
                style={
                  selectedCats.length === 0
                    ? { background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))' }
                    : undefined
                }
              >
                <span>ทั้งหมด</span>
                <span className={selectedCats.length === 0 ? 'text-white/80 text-xs' : 'text-[color:var(--shop-ink-muted,#6B7280)] text-xs'}>
                  {allCount.toLocaleString()}
                </span>
              </Link>
              {categoryNames.map((cat) => {
                const active = selectedCats.includes(cat);
                return (
                  <Link
                    key={cat}
                    href={buildUrl(cat, 1)}
                    className={`flex items-center justify-between rounded-full px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? 'text-white'
                        : 'text-[color:var(--shop-ink,#1A1A1F)] hover:bg-[#F5F1EB]'
                    }`}
                    style={
                      active
                        ? { background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))' }
                        : undefined
                    }
                  >
                    <span className="truncate">{cat}</span>
                    <span className={active ? 'text-white/80 text-xs' : 'text-[color:var(--shop-ink-muted,#6B7280)] text-xs'}>
                      {categoryCounts[cat] ?? 0}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Device picker */}
          <div className="rounded-2xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-[color:var(--shop-primary,#FF5A6A)]" />
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-sm tracking-tight">
                เลือกรุ่นโทรศัพท์
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEVICE_FILTERS.map((d) => (
                <Link
                  key={d}
                  href={buildUrl(d, 1)}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs border border-[color:var(--shop-ink,#1A1A1F)]/10 hover:border-[color:var(--shop-primary,#FF5A6A)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                >
                  {d}
                </Link>
              ))}
            </div>
          </div>

          {/* Color filter (decorative) */}
          <div className="rounded-2xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 className="font-[family:var(--font-kanit)] font-semibold text-sm tracking-tight mb-3">
              สี
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_FILTERS.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  className="aspect-square rounded-full border border-black/5 hover:scale-110 transition-transform"
                  style={{ background: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="rounded-2xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <h2 className="font-[family:var(--font-kanit)] font-semibold text-sm tracking-tight mb-3">
              ช่วงราคา
            </h2>
            <div className="space-y-1.5">
              {PRICE_BUCKETS.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  className="block w-full text-left text-sm rounded-full px-3 py-1.5 text-[color:var(--shop-ink,#1A1A1F)] hover:bg-[#F5F1EB] transition-colors"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main — sort row + product grid + pagination */}
        <main className="space-y-6">
          {/* Sort row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)]">
              พบ <span className="font-semibold text-[color:var(--shop-ink,#1A1A1F)]">{filteredCount.toLocaleString()}</span> รายการ
              {selectedCats.length > 0 && (
                <span> · กรอง: {selectedCats.join(', ')}</span>
              )}
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1">
              <span className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] shrink-0">เรียง:</span>
              {SORT_OPTIONS.map((opt) => {
                const active = sortKey === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={buildSortUrl(opt.value)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'text-white'
                        : 'text-[color:var(--shop-ink,#1A1A1F)] hover:bg-[#F5F1EB] border border-[color:var(--shop-ink,#1A1A1F)]/10'
                    }`}
                    style={
                      active
                        ? { background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))' }
                        : undefined
                    }
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Product grid or empty state */}
          {pageProducts.length === 0 ? (
            <div
              className="rounded-2xl bg-white p-12 text-center"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <Smartphone className="w-10 h-10 mx-auto mb-3 text-[color:var(--shop-primary,#FF5A6A)]/40" />
              <p className="font-[family:var(--font-kanit)] text-lg font-semibold">
                ไม่พบสินค้าตามตัวกรอง
              </p>
              <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-1 mb-5">
                ลองเปลี่ยนตัวกรองหรือเริ่มใหม่
              </p>
              <Link
                href={buildUrl(undefined, 1)}
                className="inline-flex items-center justify-center rounded-full h-10 px-5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
                style={{
                  background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
                }}
              >
                ล้างตัวกรอง
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {pageProducts.map((p, idx) => {
                const hasDiscount =
                  p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
                const discountPct = hasDiscount
                  ? Math.round(
                      ((p.compareAtPriceTHB! - p.priceTHB) / p.compareAtPriceTHB!) * 100,
                    )
                  : 0;
                const sw = swatchSet(idx);
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group rounded-2xl bg-white overflow-hidden hover:-translate-y-1 transition-transform flex flex-col"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}
                  >
                    <div className="relative aspect-square bg-[#F5F1EB] overflow-hidden">
                      {hasDiscount && (
                        <span
                          className="absolute top-3 left-3 z-10 rounded-full text-[10px] font-semibold px-2.5 py-1 text-white"
                          style={{ background: 'var(--shop-primary, #FF5A6A)' }}
                        >
                          -{discountPct}%
                        </span>
                      )}
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Smartphone className="w-10 h-10 text-[color:var(--shop-primary,#FF5A6A)]/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
                      {p.categoryName && (
                        <p className="text-[10px] uppercase tracking-wide text-[color:var(--shop-ink-muted,#6B7280)]">
                          {p.categoryName}
                        </p>
                      )}
                      <h3 className="font-[family:var(--font-kanit)] font-medium text-sm leading-snug line-clamp-2 flex-1">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-1" aria-label="สีให้เลือก">
                        {sw.map((c, i) => (
                          <span
                            key={`${p.id}-sw-${i}`}
                            className="w-3 h-3 rounded-full border border-black/5"
                            style={{ background: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-[family:var(--font-kanit)] font-semibold text-base">
                          {formatTHB(p.priceTHB)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] line-through">
                            {formatTHB(p.compareAtPriceTHB!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-6">
              <Link
                href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                aria-label="หน้าก่อนหน้า"
                className={`inline-flex items-center justify-center rounded-full w-10 h-10 transition-colors ${
                  currentPage === 1
                    ? 'text-[color:var(--shop-ink-muted,#6B7280)]/40 pointer-events-none'
                    : 'bg-white hover:bg-[#F5F1EB] text-[color:var(--shop-ink,#1A1A1F)]'
                }`}
                style={
                  currentPage === 1 ? undefined : { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }
                }
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const active = page === currentPage;
                // Compact: show first, last, current ± 1, ellipsis otherwise
                const show =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;
                if (!show) {
                  // Render ellipsis only at the inner boundaries
                  if (page === 2 || page === totalPages - 1) {
                    return (
                      <span
                        key={`ellipsis-${page}`}
                        className="px-1 text-xs text-[color:var(--shop-ink-muted,#6B7280)]"
                      >
                        ···
                      </span>
                    );
                  }
                  return null;
                }
                return (
                  <Link
                    key={page}
                    href={buildUrl(undefined, page)}
                    className={`inline-flex items-center justify-center rounded-full w-10 h-10 text-sm font-medium transition-colors ${
                      active
                        ? 'text-white'
                        : 'bg-white text-[color:var(--shop-ink,#1A1A1F)] hover:bg-[#F5F1EB]'
                    }`}
                    style={
                      active
                        ? { background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))' }
                        : { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }
                    }
                  >
                    {page}
                  </Link>
                );
              })}
              <Link
                href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
                aria-label="หน้าถัดไป"
                className={`inline-flex items-center justify-center rounded-full w-10 h-10 transition-colors ${
                  currentPage === totalPages
                    ? 'text-[color:var(--shop-ink-muted,#6B7280)]/40 pointer-events-none'
                    : 'bg-white hover:bg-[#F5F1EB] text-[color:var(--shop-ink,#1A1A1F)]'
                }`}
                style={
                  currentPage === totalPages
                    ? undefined
                    : { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Pagination footer count — "ทั้งหมด N รายการ" */}
          <p className="text-center text-xs text-[color:var(--shop-ink-muted,#6B7280)] pt-1">
            ทั้งหมด {allCount.toLocaleString()} รายการ · หน้า {currentPage} / {Math.max(1, totalPages)}
          </p>
        </main>
      </div>
    </div>
  );
}
