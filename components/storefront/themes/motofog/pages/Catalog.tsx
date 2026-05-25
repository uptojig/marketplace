'use client';

/**
 * MotoFog — racing catalog.
 *
 * Sidebar filter (category list) + product grid + pagination.
 * ทั้งหมด counter sums `categoryCounts` so it stays correct even when
 * a category is filtered out by the upstream query.
 */

import React from 'react';
import Link from 'next/link';
import { Flag, Bike, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CatalogProps, TemplateProductCard } from '@/lib/templates/types';

const SORT_OPTIONS: { key: string; label: string }[] = [
  { key: 'recommended', label: 'แนะนำ' },
  { key: 'newest', label: 'ใหม่ล่าสุด' },
  { key: 'price-asc', label: 'ราคาต่ำ → สูง' },
  { key: 'price-desc', label: 'ราคาสูง → ต่ำ' },
];

export function MotoFogCatalog({
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
  const add = useCart((s) => s.add);

  // Sum across categoryCounts for the "ทั้งหมด" count so it includes
  // every category even when one filter is currently active.
  const allCount = Object.values(categoryCounts).reduce((acc, n) => acc + n, 0);

  const handleAddToCart = (
    product: TemplateProductCard,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: product.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: product.title,
      priceTHB: product.priceTHB,
      imageUrl: product.imageUrl || undefined,
    });
  };

  const isAllSelected = selectedCats.length === 0;

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--shop-bg, #0F1417)',
        color: 'var(--shop-ink, #F5F7FA)',
      }}
    >
      {/* Page header strip */}
      <div
        className="border-b"
        style={{
          backgroundColor: 'var(--shop-surface, #1A2128)',
          borderColor: 'var(--shop-border, #2B3540)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p
              className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.3em] font-bold mb-2"
              style={{ color: 'var(--shop-accent, #FFC72C)' }}
            >
              Catalog · สินค้า
            </p>
            <h1
              className="font-[family:var(--font-kanit)] italic font-black text-3xl sm:text-4xl uppercase tracking-tight"
              style={{ color: 'var(--shop-ink, #F5F7FA)' }}
            >
              {selectedCats.length > 0
                ? selectedCats.join(' · ')
                : 'สินค้าทั้งหมด'}
            </h1>
          </div>
          <p
            className="font-[family:var(--font-prompt)] text-xs uppercase tracking-widest font-bold"
            style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
          >
            {filteredCount} รายการ
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div
              className="rounded-md p-5 sticky top-24"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Flag
                  className="h-4 w-4"
                  style={{ color: 'var(--shop-accent, #FFC72C)' }}
                />
                <h2
                  className="font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-widest"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  หมวดหมู่
                </h2>
              </div>

              <ul className="space-y-1">
                <li>
                  <Link
                    href={buildUrl(undefined, 1)}
                    className="flex items-center justify-between px-3 py-2 rounded-sm text-xs font-[family:var(--font-prompt)] font-semibold uppercase tracking-wider transition-colors"
                    style={
                      isAllSelected
                        ? {
                            background:
                              'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                            color: '#0A0A0A',
                          }
                        : {
                            backgroundColor: 'var(--shop-bg, #0F1417)',
                            color: 'var(--shop-ink, #F5F7FA)',
                          }
                    }
                  >
                    <span>ทั้งหมด</span>
                    <span className="tabular-nums opacity-80">{allCount}</span>
                  </Link>
                </li>
                {categoryNames.map((cat) => {
                  const isActive = selectedCats.includes(cat);
                  return (
                    <li key={cat}>
                      <Link
                        href={buildUrl(cat, 1)}
                        className="flex items-center justify-between px-3 py-2 rounded-sm text-xs font-[family:var(--font-prompt)] font-semibold uppercase tracking-wider transition-colors"
                        style={
                          isActive
                            ? {
                                background:
                                  'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                                color: '#0A0A0A',
                              }
                            : {
                                color: 'var(--shop-ink, #F5F7FA)',
                              }
                        }
                      >
                        <span className="truncate pr-2">{cat}</span>
                        <span className="tabular-nums opacity-80 shrink-0">
                          {categoryCounts[cat] ?? 0}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Main grid */}
          <section className="lg:col-span-9 space-y-6">
            {/* Sort row */}
            <div
              className="flex items-center justify-between flex-wrap gap-2 rounded-md p-3"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown
                  className="h-4 w-4"
                  style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                />
                <span
                  className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                >
                  เรียงโดย
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map((opt) => {
                  const isActive = opt.key === sortKey;
                  return (
                    <Link
                      key={opt.key}
                      href={buildSortUrl(opt.key)}
                      className="px-3 py-1.5 rounded-sm font-[family:var(--font-prompt)] text-[10px] uppercase tracking-widest font-bold transition-colors"
                      style={
                        isActive
                          ? {
                              background:
                                'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                              color: '#0A0A0A',
                            }
                          : {
                              backgroundColor: 'var(--shop-bg, #0F1417)',
                              color: 'var(--shop-ink, #F5F7FA)',
                              border: '1px solid var(--shop-border, #2B3540)',
                            }
                      }
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Grid */}
            {pageProducts.length === 0 ? (
              <div
                className="rounded-md text-center py-20"
                style={{
                  backgroundColor: 'var(--shop-surface, #1A2128)',
                  border: '1px solid var(--shop-border, #2B3540)',
                  color: 'var(--shop-ink-muted, #94A3B0)',
                }}
              >
                <Bike className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-[family:var(--font-prompt)] text-sm">
                  ไม่พบสินค้าในหมวดนี้
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pageProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group relative flex flex-col overflow-hidden transition-transform hover:-translate-y-1"
                    style={{
                      backgroundColor: 'var(--shop-surface, #1A2128)',
                      border: '1px solid var(--shop-border, #2B3540)',
                      clipPath:
                        'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
                    }}
                  >
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{ backgroundColor: 'var(--shop-bg, #0F1417)' }}
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bike
                            className="h-12 w-12"
                            style={{ color: 'var(--shop-border, #2B3540)' }}
                          />
                        </div>
                      )}
                      {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                        <span
                          className="absolute top-3 left-3 px-2 py-0.5 font-[family:var(--font-prompt)] text-[10px] font-bold uppercase tracking-widest rounded-sm"
                          style={{
                            background:
                              'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                            color: '#0A0A0A',
                          }}
                        >
                          ลดราคา
                        </span>
                      )}
                      {p.categoryName && (
                        <span
                          className="absolute top-3 right-3 px-2 py-0.5 font-[family:var(--font-prompt)] text-[10px] font-bold uppercase tracking-widest rounded-sm"
                          style={{
                            backgroundColor: 'rgba(10,10,10,0.7)',
                            color: 'var(--shop-accent, #FFC72C)',
                            border: '1px solid var(--shop-border, #2B3540)',
                          }}
                        >
                          {p.categoryName}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1 gap-3">
                      <h3
                        className="font-[family:var(--font-prompt)] text-sm font-semibold leading-snug line-clamp-2"
                        style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                      >
                        {p.title}
                      </h3>
                      <div className="mt-auto flex items-end justify-between gap-2">
                        <div className="flex flex-col">
                          {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                            <span
                              className="font-[family:var(--font-prompt)] text-[11px] line-through"
                              style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                            >
                              {formatTHB(p.compareAtPriceTHB)}
                            </span>
                          )}
                          <span
                            className="font-[family:var(--font-kanit)] italic font-black text-lg tabular-nums"
                            style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                          >
                            {formatTHB(p.priceTHB)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(p, e)}
                          aria-label={`เพิ่ม ${p.title} ลงตะกร้า`}
                          className="px-3 h-9 rounded-sm font-[family:var(--font-prompt)] text-[10px] font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5"
                          style={{
                            background:
                              'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                            color: '#0A0A0A',
                          }}
                        >
                          เพิ่มลงตะกร้า
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-center gap-2 pt-4"
                aria-label="หน้า"
              >
                <PaginationLink
                  href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  ariaLabel="หน้าก่อนหน้า"
                >
                  <ChevronLeft className="h-4 w-4" />
                </PaginationLink>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationLink
                    key={page}
                    href={buildUrl(undefined, page)}
                    active={page === currentPage}
                    ariaLabel={`หน้า ${page}`}
                  >
                    {page}
                  </PaginationLink>
                ))}
                <PaginationLink
                  href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  ariaLabel="หน้าถัดไป"
                >
                  <ChevronRight className="h-4 w-4" />
                </PaginationLink>
              </nav>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function PaginationLink({
  href,
  children,
  active = false,
  disabled = false,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className="inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-sm font-[family:var(--font-prompt)] text-xs font-bold uppercase opacity-40"
        style={{
          color: 'var(--shop-ink, #F5F7FA)',
          border: '1px solid var(--shop-border, #2B3540)',
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className="inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-sm font-[family:var(--font-prompt)] text-xs font-bold uppercase transition-colors"
      style={
        active
          ? {
              background:
                'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
              color: '#0A0A0A',
            }
          : {
              backgroundColor: 'var(--shop-surface, #1A2128)',
              color: 'var(--shop-ink, #F5F7FA)',
              border: '1px solid var(--shop-border, #2B3540)',
            }
      }
    >
      {children}
    </Link>
  );
}

export default MotoFogCatalog;
