'use client';
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package, ArrowRight } from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import type { CatalogProps } from '@/lib/templates/types';

/**
 * BlackWrapp — premium dark Catalog.
 *
 * Layout:
 *   ┌── sidebar (categories + counts) ── main grid + pagination footer ──┐
 *
 * "ทั้งหมด" count math:
 *   - When no category is selected: sum of every value in
 *     categoryCounts (rather than `pageProducts.length`, which is
 *     only the current page).
 *   - When one or more are selected: the sum across the selected
 *     `categoryCounts[]` entries so the chip's "ทั้งหมด" stays
 *     consistent with what's actually filtered.
 *
 * Pagination footer uses buildUrl(undefined, n) so URL state owns the
 * page index (server-rendered first paint, no client-side flicker).
 */
export default function BlackwrappCatalog(props: CatalogProps) {
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
    buildSortUrl,
    sortKey,
  } = props;

  // Sum the values of categoryCounts for the "ทั้งหมด" chip — when
  // filters are active, restrict the sum to only the selected
  // categories so the number stays consistent with what's filtered.
  const totalAcrossCategories = selectedCats.length === 0
    ? Object.values(categoryCounts).reduce((sum, n) => sum + n, 0)
    : selectedCats.reduce((sum, c) => sum + (categoryCounts[c] ?? 0), 0);

  const sortOptions: Array<{ key: string; label: string }> = [
    { key: 'newest', label: 'มาใหม่' },
    { key: 'price-asc', label: 'ราคาต่ำ–สูง' },
    { key: 'price-desc', label: 'ราคาสูง–ต่ำ' },
  ];

  return (
    <main
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: '#0A0A0A', color: '#FAFAFA' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/45 mb-6"
        >
          <Link
            href={`/stores/${store.slug}`}
            className="hover:text-white transition-colors"
          >
            หน้าแรก
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-white/85">สินค้าทั้งหมด</span>
        </nav>

        {/* Header */}
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.35em] uppercase text-white/50">
              CATALOG · {store.name}
            </span>
            <h1 className="font-[family:var(--font-kanit)] font-medium text-3xl sm:text-4xl tracking-[0.02em] text-white">
              สินค้าทั้งหมด
            </h1>
            <p className="text-xs text-white/55 tabular-nums">
              {filteredCount.toLocaleString()} รายการ
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] tracking-[0.25em] uppercase text-white/45">
              เรียงตาม
            </span>
            {sortOptions.map((opt) => (
              <Link
                key={opt.key}
                href={buildSortUrl(opt.key)}
                className="rounded-full border px-3 py-1.5 text-[11px] tracking-[0.08em] transition-all duration-300"
                style={{
                  borderColor:
                    sortKey === opt.key
                      ? 'var(--shop-primary, #00FF88)'
                      : 'rgba(255,255,255,0.10)',
                  color:
                    sortKey === opt.key
                      ? 'var(--shop-primary, #00FF88)'
                      : 'rgba(255,255,255,0.65)',
                }}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </header>

        {/* Grid: sidebar + main */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside
            aria-label="ตัวกรองหมวดหมู่"
            className="lg:sticky lg:top-24 lg:self-start space-y-6 rounded-xl border border-white/10 p-5"
            style={{ background: '#141414', maxHeight: 'calc(100vh - 8rem)' }}
          >
            <div>
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/50 mb-4">
                หมวดหมู่
              </h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    href={buildUrl(undefined, 1)}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors duration-200"
                    style={{
                      background:
                        selectedCats.length === 0
                          ? 'rgba(255,255,255,0.06)'
                          : 'transparent',
                      color:
                        selectedCats.length === 0
                          ? 'var(--shop-primary, #00FF88)'
                          : 'rgba(255,255,255,0.75)',
                    }}
                  >
                    <span>ทั้งหมด</span>
                    <span className="text-white/35 tabular-nums">
                      {totalAcrossCategories.toLocaleString()}
                    </span>
                  </Link>
                </li>
                {categoryNames.map((name) => {
                  const active = selectedCats.includes(name);
                  return (
                    <li key={name}>
                      <Link
                        href={buildUrl(name, 1)}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors duration-200"
                        style={{
                          background: active
                            ? 'rgba(255,255,255,0.06)'
                            : 'transparent',
                          color: active
                            ? 'var(--shop-primary, #00FF88)'
                            : 'rgba(255,255,255,0.75)',
                        }}
                      >
                        <span className="truncate pr-2">{name}</span>
                        <span className="text-white/35 tabular-nums shrink-0">
                          {(categoryCounts[name] ?? 0).toLocaleString()}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Main */}
          <section>
            {pageProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-24 text-center">
                <Package
                  size={32}
                  strokeWidth={1.25}
                  className="mx-auto mb-4 text-white/20"
                />
                <p className="text-sm text-white/50">ไม่พบสินค้าในหมวดหมู่นี้</p>
                {selectedCats.length > 0 && (
                  <Link
                    href={buildUrl(undefined, 1)}
                    className="mt-4 inline-block text-xs tracking-[0.15em] uppercase"
                    style={{ color: 'var(--shop-primary, #00FF88)' }}
                  >
                    ล้างตัวกรอง
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {pageProducts.map((p) => (
                  <article
                    key={p.id}
                    className="group rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-[var(--shop-primary,#00FF88)]"
                    style={{ background: '#141414' }}
                  >
                    <Link
                      href={`/stores/${store.slug}/products/${p.id}`}
                      className="block relative aspect-square overflow-hidden bg-[#0A0A0A]"
                    >
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package
                            size={28}
                            strokeWidth={1.25}
                            className="text-white/15"
                          />
                        </div>
                      )}
                      {p.categoryName && (
                        <span className="absolute top-3 left-3 rounded-full bg-black/55 backdrop-blur px-2.5 py-1 text-[9px] tracking-[0.25em] uppercase text-white/80 border border-white/10">
                          {p.categoryName}
                        </span>
                      )}
                    </Link>

                    <div className="p-4 space-y-3">
                      <Link
                        href={`/stores/${store.slug}/products/${p.id}`}
                        className="block"
                      >
                        <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug min-h-[2.5rem]">
                          {p.title}
                        </h3>
                      </Link>
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-2 min-w-0">
                          <span
                            className="font-[family:var(--font-kanit)] font-medium text-base tabular-nums truncate"
                            style={{ color: 'var(--shop-primary, #00FF88)' }}
                          >
                            {formatTHB(p.priceTHB)}
                          </span>
                          {p.compareAtPriceTHB ? (
                            <span className="text-[11px] text-white/35 line-through tabular-nums">
                              {formatTHB(p.compareAtPriceTHB)}
                            </span>
                          ) : null}
                        </div>
                        <Link
                          href={`/stores/${store.slug}/products/${p.id}`}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white hover:border-[var(--shop-primary,#00FF88)] transition-all"
                          aria-label={`ดูสินค้า ${p.title}`}
                        >
                          <ArrowRight size={13} strokeWidth={1.75} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="หน้าสินค้า"
                className="mt-12 flex items-center justify-between border-t border-white/5 pt-6"
              >
                {currentPage > 1 ? (
                  <Link
                    href={buildUrl(undefined, currentPage - 1)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs tracking-[0.15em] uppercase text-white/70 hover:text-white hover:border-[var(--shop-primary,#00FF88)] transition-all"
                  >
                    <ChevronLeft size={14} strokeWidth={1.75} />
                    ก่อนหน้า
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/5 px-4 py-2 text-xs tracking-[0.15em] uppercase text-white/25">
                    <ChevronLeft size={14} strokeWidth={1.75} />
                    ก่อนหน้า
                  </span>
                )}

                <span className="text-[11px] tracking-[0.2em] uppercase text-white/55 tabular-nums">
                  <span className="text-white">{currentPage}</span> /{' '}
                  {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={buildUrl(undefined, currentPage + 1)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs tracking-[0.15em] uppercase text-white/70 hover:text-white hover:border-[var(--shop-primary,#00FF88)] transition-all"
                  >
                    ถัดไป
                    <ChevronRight size={14} strokeWidth={1.75} />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/5 px-4 py-2 text-xs tracking-[0.15em] uppercase text-white/25">
                    ถัดไป
                    <ChevronRight size={14} strokeWidth={1.75} />
                  </span>
                )}
              </nav>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
