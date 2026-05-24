'use client';

/**
 * OmniPack — catalog page.
 *
 * Left sidebar with size-range / material / quantity-tier filter
 * checkboxes + a "ทั้งหมด" link whose count equals the sum of every
 * categoryCount when nothing is selected (so the filter sidebar
 * reflects the true unfiltered total, not just the current page).
 * Right side: product grid with dimensions / per-unit price + a
 * pagination footer at the bottom.
 */

import React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  SlidersHorizontal,
} from 'lucide-react';
import type { CatalogProps } from '@/lib/templates/types';
import { formatTHB } from '@/lib/utils';

/** Static size-range buckets reused as supplementary filters. */
const SIZE_BUCKETS = [
  { label: 'เล็ก (≤ 15 cm)', value: 'small' },
  { label: 'กลาง (15-25 cm)', value: 'medium' },
  { label: 'ใหญ่ (> 25 cm)', value: 'large' },
];

const MATERIAL_BUCKETS = [
  { label: 'กระดาษคราฟท์', value: 'kraft' },
  { label: 'ลูกฟูก 3 ชั้น', value: 'corrugated' },
  { label: 'พลาสติกกันกระแทก', value: 'bubble' },
];

const QUANTITY_TIERS = [
  { label: '50 ชิ้น', value: '50' },
  { label: '100 ชิ้น', value: '100' },
  { label: '500 ชิ้น+', value: '500' },
];

interface OmnipackCatalogProps extends CatalogProps {
  storeSlug: string;
}

export function OmnipackCatalog(props: OmnipackCatalogProps) {
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
    storeSlug,
  } = props;

  const productBase = `/stores/${storeSlug}/products`;
  // Sum of every categoryCount — total products across all categories,
  // mirroring the spec for the "ทั้งหมด" sidebar link.
  const totalAcrossAllCategories = categoryNames.reduce(
    (n, name) => n + (categoryCounts[name] ?? 0),
    0,
  );

  return (
    <main
      className="min-h-screen font-[family:var(--font-prompt)]"
      style={{ backgroundColor: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      {/* Page header */}
      <header className="border-b" style={{ borderColor: 'var(--shop-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1
            className="font-[family:var(--font-kanit)] font-medium text-2xl sm:text-3xl mb-1"
            style={{ color: 'var(--shop-ink)' }}
          >
            สินค้าทั้งหมด
          </h1>
          <p className="text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
            {store.name} · บรรจุภัณฑ์สำเร็จรูปพร้อมส่ง
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar filters */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--shop-card)',
              borderColor: 'var(--shop-border)',
            }}
          >
            <h2
              className="font-[family:var(--font-kanit)] font-medium text-base flex items-center gap-2 mb-4"
              style={{ color: 'var(--shop-ink)' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              ตัวกรอง
            </h2>

            {/* Categories */}
            <section className="mb-6">
              <h3
                className="text-xs font-medium uppercase tracking-wide mb-3"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                หมวดหมู่
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href={buildUrl()}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md ${
                      selectedCats.length === 0 ? 'font-medium' : ''
                    }`}
                    style={{
                      backgroundColor:
                        selectedCats.length === 0
                          ? 'var(--shop-bg-soft, var(--shop-bg))'
                          : 'transparent',
                      color:
                        selectedCats.length === 0
                          ? 'var(--shop-primary)'
                          : 'var(--shop-ink)',
                    }}
                  >
                    <span>ทั้งหมด</span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      ({totalAcrossAllCategories})
                    </span>
                  </Link>
                </li>
                {categoryNames.map((cat) => {
                  const active = selectedCats.includes(cat);
                  return (
                    <li key={cat}>
                      <Link
                        href={buildUrl(cat)}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-md ${
                          active ? 'font-medium' : ''
                        }`}
                        style={{
                          backgroundColor: active
                            ? 'var(--shop-bg-soft, var(--shop-bg))'
                            : 'transparent',
                          color: active
                            ? 'var(--shop-primary)'
                            : 'var(--shop-ink)',
                        }}
                      >
                        <span className="truncate">{cat}</span>
                        <span
                          className="text-xs"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          ({categoryCounts[cat] ?? 0})
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Size range — supplementary, non-routing */}
            <FilterGroup
              title="ขนาด"
              options={SIZE_BUCKETS}
            />

            {/* Material */}
            <FilterGroup
              title="วัสดุ"
              options={MATERIAL_BUCKETS}
            />

            {/* Quantity tier */}
            <FilterGroup
              title="จำนวนขั้นต่ำ"
              options={QUANTITY_TIERS}
            />
          </div>
        </aside>

        {/* Grid + pagination */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
              พบสินค้า {filteredCount.toLocaleString('th-TH')} รายการ
              {selectedCats.length > 0 && (
                <span> · กรองตาม {selectedCats.join(', ')}</span>
              )}
            </p>
          </div>

          {pageProducts.length === 0 ? (
            <div
              className="rounded-xl border p-12 text-center"
              style={{
                backgroundColor: 'var(--shop-card)',
                borderColor: 'var(--shop-border)',
              }}
            >
              <PackageOpen
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: 'var(--shop-border)' }}
              />
              <p
                className="text-sm"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                ไม่พบสินค้าที่ตรงกับเงื่อนไข ลองเอาตัวกรองออกแล้วลองใหม่อีกครั้ง
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {pageProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`${productBase}/${p.id}`}
                  className="group flex flex-col rounded-xl border overflow-hidden transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--shop-card)',
                    borderColor: 'var(--shop-border)',
                  }}
                >
                  <div
                    className="aspect-[4/5] relative overflow-hidden"
                    style={{ backgroundColor: 'var(--shop-bg)' }}
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ color: 'var(--shop-border)' }}
                      >
                        <PackageOpen className="w-14 h-14" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    {p.categoryName && (
                      <span
                        className="text-[10px] uppercase tracking-wide font-medium"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        {p.categoryName}
                      </span>
                    )}
                    <h3
                      className="font-[family:var(--font-kanit)] font-medium text-sm leading-snug line-clamp-2"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {p.title}
                    </h3>
                    <div
                      className="mt-auto flex items-baseline justify-between pt-2 border-t"
                      style={{ borderColor: 'var(--shop-border)' }}
                    >
                      <span
                        className="font-[family:var(--font-kanit)] font-medium text-base"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {formatTHB(p.priceTHB)}
                      </span>
                      <span
                        className="text-[10px]"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        / ชิ้น
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination footer */}
          {totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-2"
              aria-label="Pagination"
            >
              {currentPage > 1 && (
                <Link
                  href={buildUrl(undefined, currentPage - 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md border text-sm font-medium hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--shop-card)',
                    borderColor: 'var(--shop-border)',
                    color: 'var(--shop-ink)',
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  ก่อนหน้า
                </Link>
              )}
              <span
                className="text-sm px-3"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                หน้า {currentPage} จาก {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={buildUrl(undefined, currentPage + 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-white hover:opacity-90"
                  style={{ backgroundColor: 'var(--shop-primary)' }}
                >
                  ถัดไป
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}

/** Static (non-routing) filter group — purely visual until backend wiring. */
function FilterGroup({
  title,
  options,
}: {
  title: string;
  options: { label: string; value: string }[];
}) {
  return (
    <section className="mb-6 last:mb-0">
      <h3
        className="text-xs font-medium uppercase tracking-wide mb-3"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        {title}
      </h3>
      <ul className="space-y-2 text-sm">
        {options.map((opt) => (
          <li key={opt.value}>
            <label
              className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded-md hover:bg-[var(--shop-bg-soft,var(--shop-bg))]"
              style={{ color: 'var(--shop-ink)' }}
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--shop-primary)' }}
              />
              <span>{opt.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
