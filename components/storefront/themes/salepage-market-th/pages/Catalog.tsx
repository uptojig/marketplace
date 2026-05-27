'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Eye,
  SlidersHorizontal,
  Grid3x3,
  List as ListIcon,
  X,
} from 'lucide-react';
import { formatTHB } from '@/lib/utils';

interface ProductCard {
  id: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  categoryName?: string | null;
}

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

const PRICE_BUCKETS = [
  { label: 'ฟรี – ฿299', max: 299 },
  { label: '฿300 – ฿799', min: 300, max: 799 },
  { label: '฿800 – ฿1,499', min: 800, max: 1499 },
  { label: '฿1,500+', min: 1500 },
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
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FAFBFC)' }}
    >
      {/* Header band */}
      <section
        className="border-b"
        style={{
          borderColor: 'var(--shop-border, #E5E7EB)',
          background: 'var(--shop-bg-soft, #FFFFFF)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] mb-4">
            <Link
              href={`/stores/${store.slug}`}
              className="hover:text-[color:var(--shop-primary,#82B440)]"
            >
              {store.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[color:var(--shop-ink,#0D1421)]">เทมเพลตทั้งหมด</span>
          </nav>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)]">
            {selectedCats.length === 1 ? selectedCats[0] : 'เทมเพลตทั้งหมด'}
          </h1>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-2">
            {filteredCount} เทมเพลตในมาร์เก็ต · พรีวิวสดก่อนตัดสินใจซื้อ
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6 sm:gap-8">
          {/* ─── SIDEBAR FILTER (desktop) ───────────────────── */}
          <aside className="hidden lg:block space-y-6">
            <FilterPanel
              categoryNames={categoryNames}
              categoryCounts={categoryCounts}
              selectedCats={selectedCats}
              buildUrl={buildUrl}
              filteredCount={filteredCount}
            />
          </aside>

          {/* ─── MAIN ─────────────────────────────────────── */}
          <main>
            {/* Toolbar */}
            <div
              className="flex items-center justify-between gap-3 mb-5 pb-4 border-b"
              style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 rounded-md border px-3 h-9 text-sm font-medium"
                  style={{
                    borderColor: 'var(--shop-border, #E5E7EB)',
                    color: 'var(--shop-ink, #0D1421)',
                    background: 'var(--shop-bg-soft, #FFFFFF)',
                  }}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  ตัวกรอง
                  {selectedCats.length > 0 && (
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold text-white"
                      style={{ background: 'var(--shop-primary, #82B440)' }}
                    >
                      {selectedCats.length}
                    </span>
                  )}
                </button>
                <span className="hidden sm:inline text-sm text-[color:var(--shop-ink-muted,#6B7280)]">
                  พบ <span className="font-semibold text-[color:var(--shop-ink,#0D1421)]">{filteredCount}</span> รายการ
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <label className="hidden sm:flex items-center gap-2 text-xs text-[color:var(--shop-ink-muted,#6B7280)]">
                  เรียงโดย
                  <select
                    value={sortKey}
                    onChange={(e) => {
                      window.location.href = buildSortUrl(e.target.value);
                    }}
                    className="rounded-md border px-2 h-9 text-sm bg-white text-[color:var(--shop-ink,#0D1421)] focus:border-[color:var(--shop-primary,#82B440)] focus:outline-none"
                    style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* View toggle */}
                <div
                  className="hidden sm:inline-flex items-center rounded-md border p-0.5"
                  style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
                >
                  <button
                    type="button"
                    onClick={() => setView('grid')}
                    aria-label="grid"
                    className={`w-8 h-8 inline-flex items-center justify-center rounded ${
                      view === 'grid'
                        ? 'bg-[color:var(--shop-primary,#82B440)] text-white'
                        : 'text-[color:var(--shop-ink-muted,#6B7280)]'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    aria-label="list"
                    className={`w-8 h-8 inline-flex items-center justify-center rounded ${
                      view === 'list'
                        ? 'bg-[color:var(--shop-primary,#82B440)] text-white'
                        : 'text-[color:var(--shop-ink-muted,#6B7280)]'
                    }`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Selected chips */}
            {selectedCats.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCats.map((cat) => (
                  <Link
                    key={cat}
                    href={buildUrl(cat)}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ background: 'var(--shop-primary, #82B440)' }}
                  >
                    {cat}
                    <X className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            )}

            {/* Empty state */}
            {pageProducts.length === 0 && (
              <div
                className="rounded-lg p-12 text-center"
                style={{
                  background: 'var(--shop-bg-soft, #FFFFFF)',
                  border: '1px dashed var(--shop-border, #E5E7EB)',
                }}
              >
                <Code2 className="w-12 h-12 mx-auto mb-4 text-[color:var(--shop-ink-muted,#6B7280)]/50" />
                <h3 className="font-[family:var(--font-kanit)] text-xl font-bold mb-2 text-[color:var(--shop-ink,#0D1421)]">
                  ยังไม่มีเทมเพลตในหมวดนี้
                </h3>
                <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mb-5">
                  ลองล้างตัวกรองหรือดูเทมเพลตทั้งหมด
                </p>
                <Link
                  href={`/stores/${store.slug}/category`}
                  className="inline-flex items-center gap-2 rounded-md px-5 h-10 text-sm font-semibold text-white"
                  style={{ background: 'var(--shop-primary, #82B440)' }}
                >
                  ดูเทมเพลตทั้งหมด
                </Link>
              </div>
            )}

            {/* Grid view */}
            {pageProducts.length > 0 && view === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {pageProducts.map((p) => (
                  <CatalogCard key={p.id} product={p} slug={store.slug} />
                ))}
              </div>
            )}

            {/* List view */}
            {pageProducts.length > 0 && view === 'list' && (
              <div className="space-y-3">
                {pageProducts.map((p) => (
                  <CatalogRow key={p.id} product={p} slug={store.slug} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-center gap-2 mt-10"
                aria-label="หน้า"
              >
                <Link
                  href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-md border ${
                    currentPage === 1
                      ? 'pointer-events-none opacity-40'
                      : 'hover:border-[color:var(--shop-primary,#82B440)]'
                  }`}
                  style={{
                    borderColor: 'var(--shop-border, #E5E7EB)',
                    background: 'var(--shop-bg-soft, #FFFFFF)',
                  }}
                  aria-label="ก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  const active = pageNum === currentPage;
                  return (
                    <Link
                      key={pageNum}
                      href={buildUrl(undefined, pageNum)}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium ${
                        active
                          ? 'text-white'
                          : 'border hover:border-[color:var(--shop-primary,#82B440)]'
                      }`}
                      style={
                        active
                          ? { background: 'var(--shop-primary, #82B440)' }
                          : {
                              borderColor: 'var(--shop-border, #E5E7EB)',
                              background: 'var(--shop-bg-soft, #FFFFFF)',
                              color: 'var(--shop-ink, #0D1421)',
                            }
                      }
                    >
                      {pageNum}
                    </Link>
                  );
                })}
                <Link
                  href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-md border ${
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-40'
                      : 'hover:border-[color:var(--shop-primary,#82B440)]'
                  }`}
                  style={{
                    borderColor: 'var(--shop-border, #E5E7EB)',
                    background: 'var(--shop-bg-soft, #FFFFFF)',
                  }}
                  aria-label="ถัดไป"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </nav>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 flex"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="ml-auto w-full max-w-xs h-full overflow-y-auto p-5"
            style={{ background: 'var(--shop-bg-soft, #FFFFFF)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[family:var(--font-kanit)] text-lg font-bold text-[color:var(--shop-ink,#0D1421)]">
                ตัวกรอง
              </h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                aria-label="ปิด"
                className="text-[color:var(--shop-ink-muted,#6B7280)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel
              categoryNames={categoryNames}
              categoryCounts={categoryCounts}
              selectedCats={selectedCats}
              buildUrl={buildUrl}
              filteredCount={filteredCount}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function FilterPanel({
  categoryNames,
  categoryCounts,
  selectedCats,
  buildUrl,
  filteredCount,
}: {
  categoryNames: string[];
  categoryCounts: Record<string, number>;
  selectedCats: string[];
  buildUrl: (toggleCat?: string, page?: number) => string;
  filteredCount: number;
}) {
  return (
    <>
      <div>
        <h3 className="font-[family:var(--font-kanit)] text-sm font-bold uppercase tracking-wider mb-3 text-[color:var(--shop-ink,#0D1421)]">
          หมวดเทมเพลต
        </h3>
        <ul className="space-y-1">
          <li>
            <Link
              href={buildUrl()}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                selectedCats.length === 0
                  ? 'bg-[color:var(--shop-primary,#82B440)]/10 text-[color:var(--shop-primary,#82B440)] font-medium'
                  : 'hover:bg-[color:var(--shop-muted,#F3F4F6)] text-[color:var(--shop-ink,#0D1421)]'
              }`}
            >
              ทั้งหมด
              <span className="text-xs text-[color:var(--shop-ink-muted,#6B7280)]">
                {filteredCount}
              </span>
            </Link>
          </li>
          {categoryNames.map((cat) => {
            const active = selectedCats.includes(cat);
            return (
              <li key={cat}>
                <Link
                  href={buildUrl(cat)}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-[color:var(--shop-primary,#82B440)]/10 text-[color:var(--shop-primary,#82B440)] font-medium'
                      : 'hover:bg-[color:var(--shop-muted,#F3F4F6)] text-[color:var(--shop-ink,#0D1421)]'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span className="shrink-0 ml-2 text-xs text-[color:var(--shop-ink-muted,#6B7280)]">
                    {categoryCounts[cat] ?? 0}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="font-[family:var(--font-kanit)] text-sm font-bold uppercase tracking-wider mb-3 text-[color:var(--shop-ink,#0D1421)]">
          ช่วงราคา
        </h3>
        <ul className="space-y-1">
          {PRICE_BUCKETS.map((b) => (
            <li key={b.label}>
              <span className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-[color:var(--shop-ink-muted,#6B7280)]">
                {b.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function CatalogCard({ product, slug }: { product: ProductCard; slug: string }) {
  const hasDiscount =
    product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.compareAtPriceTHB! - product.priceTHB) /
          product.compareAtPriceTHB!) *
          100,
      )
    : 0;

  return (
    <Link
      href={`/stores/${slug}/products/${product.id}`}
      className="group rounded-lg overflow-hidden salepage-card block"
      style={{
        background: 'var(--shop-bg-soft, #FFFFFF)',
        border: '1px solid var(--shop-border, #E5E7EB)',
      }}
    >
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{ background: 'var(--shop-muted, #F3F4F6)' }}
      >
        {hasDiscount && (
          <span
            className="absolute top-2.5 left-2.5 z-10 rounded px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ background: 'var(--shop-savings, #FF6B35)' }}
          >
            -{discountPct}%
          </span>
        )}
        <span
          className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-md"
          style={{
            background: 'rgba(255,255,255,0.92)',
            color: 'var(--shop-ink, #0D1421)',
          }}
        >
          <Eye className="w-2.5 h-2.5" />
          พรีวิว
        </span>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(130,180,64,0.10) 0%, rgba(0,173,239,0.10) 100%)',
            }}
          >
            <Code2 className="w-10 h-10 text-[color:var(--shop-primary,#82B440)]/40" />
          </div>
        )}
      </div>
      <div className="p-4">
        {product.categoryName && (
          <p className="text-[10px] uppercase tracking-wider text-[color:var(--shop-ink-muted,#6B7280)] mb-1">
            {product.categoryName}
          </p>
        )}
        <h3 className="font-[family:var(--font-kanit)] font-bold text-sm leading-snug line-clamp-2 text-[color:var(--shop-ink,#0D1421)] group-hover:text-[color:var(--shop-primary,#82B440)] transition-colors mb-2">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-[family:var(--font-kanit)] font-bold text-base text-[color:var(--shop-primary,#82B440)]">
            {formatTHB(product.priceTHB)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)] line-through">
              {formatTHB(product.compareAtPriceTHB!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function CatalogRow({ product, slug }: { product: ProductCard; slug: string }) {
  const hasDiscount =
    product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;

  return (
    <Link
      href={`/stores/${slug}/products/${product.id}`}
      className="group flex items-center gap-4 rounded-lg p-3 salepage-card"
      style={{
        background: 'var(--shop-bg-soft, #FFFFFF)',
        border: '1px solid var(--shop-border, #E5E7EB)',
      }}
    >
      <div
        className="shrink-0 w-24 sm:w-32 aspect-[16/10] rounded overflow-hidden relative"
        style={{ background: 'var(--shop-muted, #F3F4F6)' }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Code2 className="w-6 h-6 text-[color:var(--shop-primary,#82B440)]/40" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {product.categoryName && (
          <p className="text-[10px] uppercase tracking-wider text-[color:var(--shop-ink-muted,#6B7280)]">
            {product.categoryName}
          </p>
        )}
        <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm sm:text-base line-clamp-2 text-[color:var(--shop-ink,#0D1421)] group-hover:text-[color:var(--shop-primary,#82B440)]">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-[family:var(--font-kanit)] font-bold text-base text-[color:var(--shop-primary,#82B440)]">
            {formatTHB(product.priceTHB)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)] line-through">
              {formatTHB(product.compareAtPriceTHB!)}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="hidden sm:inline-block w-5 h-5 text-[color:var(--shop-ink-muted,#6B7280)]" />
    </Link>
  );
}
