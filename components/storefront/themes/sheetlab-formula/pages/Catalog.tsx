'use client';

/**
 * sheetlab-formula — Catalog page
 *
 * Spreadsheet-flavoured grid view: category chips on top, a sort
 * dropdown, and a 2/4-column product grid using the same card style
 * as the homepage featured rail. Simple prev/next pagination.
 *
 * Consumes the canonical `CatalogProps` contract directly so the
 * route dispatcher can hand off scaffold data without an adapter.
 */

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import type { CatalogProps } from '@/lib/templates/types';
import { formatTHB } from '@/lib/utils';

const SORT_OPTIONS = [
  { key: 'newest', label: 'ใหม่ล่าสุด' },
  { key: 'price-asc', label: 'ราคา: ต่ำ → สูง' },
  { key: 'price-desc', label: 'ราคา: สูง → ต่ำ' },
];

export default function SheetlabFormulaCatalog(props: CatalogProps) {
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

  const allActive = selectedCats.length === 0;

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-[#1F2937] font-[family:var(--font-prompt)]">
      {/* Heading */}
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#107C41] font-semibold mb-1">
                {store.name}
              </p>
              <h1 className="text-2xl sm:text-3xl font-[family:var(--font-kanit)] font-semibold tracking-tight text-[#1F2937]">
                ทั้งหมด {filteredCount} สูตร
              </h1>
            </div>
            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="sheetlab-sort"
                className="text-xs text-[#6B7280] whitespace-nowrap"
              >
                เรียงโดย
              </label>
              <select
                id="sheetlab-sort"
                value={sortKey}
                onChange={(e) => {
                  const url = buildSortUrl(e.target.value);
                  if (typeof window !== 'undefined') {
                    window.location.href = url;
                  }
                }}
                className="text-sm border border-[#E5E7EB] rounded-md bg-white px-3 py-2 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#107C41]/40"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Category chips */}
      {categoryNames.length > 0 ? (
        <section className="border-b border-[#E5E7EB] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              <Link
                href={buildUrl(undefined, 1)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  allActive
                    ? 'bg-[#107C41] text-white border-[#107C41]'
                    : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#107C41] hover:text-[#107C41]'
                }`}
              >
                ทั้งหมด ({filteredCount})
              </Link>
              {categoryNames.map((name) => {
                const active = selectedCats.includes(name);
                const count = categoryCounts[name] ?? 0;
                return (
                  <Link
                    key={name}
                    href={buildUrl(name)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#107C41] text-white border-[#107C41]'
                        : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#107C41] hover:text-[#107C41]'
                    }`}
                  >
                    {name} ({count})
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Product grid */}
      <section className="py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {pageProducts.length === 0 ? (
            <div className="text-center py-20">
              <FileSpreadsheet
                className="w-12 h-12 mx-auto text-[#9CA3AF] mb-3"
                aria-hidden="true"
              />
              <p className="text-sm text-[#6B7280]">
                ยังไม่มีสูตรที่ตรงกับตัวกรองนี้
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {pageProducts.map((p) => {
                const hasDiscount =
                  p.compareAtPriceTHB != null &&
                  p.compareAtPriceTHB > p.priceTHB;
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group bg-white rounded-lg border border-[#E5E7EB] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div
                      className="h-1 w-full"
                      style={{ background: '#107C41' }}
                      aria-hidden="true"
                    />
                    <div className="relative aspect-[4/3] bg-[#F3F4F6]">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileSpreadsheet className="w-10 h-10 text-[#107C41] opacity-50" />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold bg-white/95 border border-[#E5E7EB] text-[#107C41]">
                        💾 Digital
                      </span>
                      {hasDiscount ? (
                        <span
                          className="absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold text-white"
                          style={{ background: '#F5A623' }}
                        >
                          Sale
                        </span>
                      ) : null}
                    </div>
                    <div className="p-3 sm:p-4">
                      {p.categoryName ? (
                        <span className="inline-block text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                          {p.categoryName}
                        </span>
                      ) : null}
                      <h3 className="text-sm font-medium text-[#1F2937] line-clamp-2 group-hover:text-[#107C41] transition-colors">
                        {p.title}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span
                          className="text-base font-semibold"
                          style={{ color: '#107C41' }}
                        >
                          {formatTHB(p.priceTHB)}
                        </span>
                        {hasDiscount ? (
                          <span className="text-xs text-[#9CA3AF] line-through">
                            {formatTHB(p.compareAtPriceTHB as number)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 ? (
            <nav
              className="mt-10 flex items-center justify-center gap-3 text-sm"
              aria-label="หน้า"
            >
              {currentPage > 1 ? (
                <Link
                  href={buildUrl(undefined, currentPage - 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#107C41] hover:text-[#107C41] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  ก่อนหน้า
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                  ก่อนหน้า
                </span>
              )}
              <span className="text-[#4B5563]">
                หน้า {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={buildUrl(undefined, currentPage + 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#107C41] hover:text-[#107C41] transition-colors"
                >
                  ถัดไป
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed">
                  ถัดไป
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </nav>
          ) : null}
        </div>
      </section>
    </div>
  );
}
