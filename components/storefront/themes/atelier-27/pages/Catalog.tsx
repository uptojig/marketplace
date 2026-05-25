'use client';

/**
 * atelier-27 — bespoke Catalog page.
 *
 * Premium curator-gallery layout in the trust / atelier-27 visual
 * language: a quiet sidebar with checkable category filters and a
 * sort dropdown, paired with a 3-column 4:5 portrait "museum card"
 * grid. Every card sits on a hairline border with a thin gold-trim
 * underline; the active filter pill carries a gold dot, and the
 * pagination control is a hairline rail rather than a chip.
 *
 * Pure links (and a controlled <select> for sort) keep this page
 * server-friendly — no cart state, no `useCartConfirmation`. Add-to-
 * cart happens on the PDP, which matches every other atelier-27 page.
 *
 * All colour comes from `var(--shop-*)` so the page inherits the
 * per-store family palette (cream / ink / gold accent / hairline).
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import type { CatalogProps } from '@/lib/templates/types';
import { formatTHB } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Sort options — atelier curators expect "ใหม่ล่าสุด" first, with price /
// alphabetical fallbacks for collectors browsing by tier.
// ---------------------------------------------------------------------------
const SORT_OPTIONS = [
  { key: 'newest', label: 'ใหม่ล่าสุด' },
  { key: 'price-asc', label: 'ราคาต่ำ → สูง' },
  { key: 'price-desc', label: 'ราคาสูง → ต่ำ' },
  { key: 'name-asc', label: 'ชื่อ ก-ฮ' },
];

export default function Atelier27Catalog(props: CatalogProps) {
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

  // Stable sort label for the dropdown header (so even if a foreign
  // sort key arrives in the URL the control still shows something).
  const sortLabel = useMemo(() => {
    const hit = SORT_OPTIONS.find((o) => o.key === sortKey);
    return hit?.label ?? SORT_OPTIONS[0]!.label;
  }, [sortKey]);

  return (
    <div
      className="font-[family:var(--font-prompt)]"
      style={{
        background: 'var(--shop-bg, #fafaf9)',
        color: 'var(--shop-ink, #1c1917)',
        minHeight: '100vh',
      }}
    >
      {/* ────────────────────────────────────────────────────────────
          Editorial header band — hairline-framed, Kanit light caps
      ──────────────────────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{
          borderColor: 'var(--shop-border, #e7e5e4)',
          background: 'var(--shop-bg, #fafaf9)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-10 sm:pt-14 pb-10 sm:pb-12">
          {/* Breadcrumb back-link */}
          <nav
            aria-label="Breadcrumb"
            className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.35em] uppercase"
            style={{ color: 'var(--shop-ink-muted, #a8a29e)' }}
          >
            <Link
              href={`/stores/${store.slug}`}
              className="inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-[color:var(--shop-ink,#1c1917)]"
            >
              <ChevronLeft className="h-3 w-3" strokeWidth={1.25} />
              หน้าร้าน
            </Link>
            <span className="mx-2">·</span>
            <span style={{ color: 'var(--shop-ink, #1c1917)' }}>คอลเลกชัน</span>
          </nav>

          {/* Eyebrow — gold accent caps */}
          <p
            className="mt-8 font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.5em] uppercase"
            style={{ color: 'var(--shop-accent, #b48c4a)' }}
          >
            The Catalogue · Curated
          </p>

          {/* Title — Kanit light, wide tracking */}
          <h1
            className="mt-3 font-[family:var(--font-kanit)] font-light text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.15] tracking-[0.06em]"
            style={{ color: 'var(--shop-ink, #1c1917)' }}
          >
            คอลเลกชันทั้งหมด
          </h1>

          {/* Hairline gold rule + count */}
          <div className="mt-6 flex items-center gap-4">
            <span
              aria-hidden
              className="block h-px w-12"
              style={{ background: 'var(--shop-accent, #b48c4a)' }}
            />
            <span
              className="font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.3em] uppercase tabular-nums"
              style={{ color: 'var(--shop-ink-muted, #a8a29e)' }}
            >
              {filteredCount} ชิ้นในคลัง
            </span>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          Body — sidebar filters + main gallery
      ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-14">
          {/* ── Sidebar — hairline-framed checkable filters ── */}
          <aside className="space-y-10">
            <div>
              <p
                className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.4em] uppercase pb-3 mb-4 border-b"
                style={{
                  color: 'var(--shop-ink, #1c1917)',
                  borderColor: 'var(--shop-border, #e7e5e4)',
                }}
              >
                หมวดหมู่
              </p>

              <ul className="space-y-2.5">
                {/* "ทั้งหมด" — clears filters */}
                <li>
                  <Link
                    href={buildUrl(undefined, 1)}
                    className="group flex items-center gap-3 text-xs leading-snug transition-colors duration-300"
                    style={{
                      color: allActive
                        ? 'var(--shop-ink, #1c1917)'
                        : 'var(--shop-ink-muted, #78716c)',
                    }}
                    aria-pressed={allActive}
                  >
                    <span
                      aria-hidden
                      className="flex h-[14px] w-[14px] flex-none items-center justify-center border transition-colors duration-300"
                      style={{
                        borderColor: allActive
                          ? 'var(--shop-accent, #b48c4a)'
                          : 'var(--shop-border, #e7e5e4)',
                        background: allActive
                          ? 'var(--shop-accent, #b48c4a)'
                          : 'transparent',
                      }}
                    >
                      {allActive && (
                        <Check
                          className="h-[10px] w-[10px]"
                          strokeWidth={2.5}
                          style={{ color: 'var(--shop-bg, #fafaf9)' }}
                        />
                      )}
                    </span>
                    <span
                      className="font-[family:var(--font-kanit)] font-light tracking-[0.18em] uppercase text-[10px] group-hover:opacity-80"
                    >
                      ทั้งหมด
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
                        className="group flex items-center gap-3 text-xs leading-snug transition-colors duration-300"
                        style={{
                          color: active
                            ? 'var(--shop-ink, #1c1917)'
                            : 'var(--shop-ink-muted, #78716c)',
                        }}
                        aria-pressed={active}
                      >
                        <span
                          aria-hidden
                          className="flex h-[14px] w-[14px] flex-none items-center justify-center border transition-colors duration-300"
                          style={{
                            borderColor: active
                              ? 'var(--shop-accent, #b48c4a)'
                              : 'var(--shop-border, #e7e5e4)',
                            background: active
                              ? 'var(--shop-accent, #b48c4a)'
                              : 'transparent',
                          }}
                        >
                          {active && (
                            <Check
                              className="h-[10px] w-[10px]"
                              strokeWidth={2.5}
                              style={{ color: 'var(--shop-bg, #fafaf9)' }}
                            />
                          )}
                        </span>
                        <span className="flex-1 truncate font-[family:var(--font-prompt)] tracking-wide group-hover:opacity-80">
                          {cat}
                        </span>
                        <span
                          className="ml-2 font-[family:var(--font-kanit)] font-light text-[10px] tabular-nums tracking-widest"
                          style={{ color: 'var(--shop-ink-muted, #a8a29e)' }}
                        >
                          {String(count).padStart(2, '0')}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Quiet curator note */}
            <div
              className="border-t pt-6"
              style={{ borderColor: 'var(--shop-border, #e7e5e4)' }}
            >
              <p
                className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.35em] uppercase mb-3"
                style={{ color: 'var(--shop-accent, #b48c4a)' }}
              >
                Curator&apos;s Note
              </p>
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: 'var(--shop-ink-muted, #78716c)' }}
              >
                ทุกชิ้นในคอลเลกชันผ่านการคัดสรร
                ด้วยมือ จากช่างฝีมือที่เราไว้ใจ
                สั่งจองล่วงหน้าได้ที่หน้าผลิตภัณฑ์
              </p>
            </div>
          </aside>

          {/* ── Main — sort bar + 3-col museum-card grid ── */}
          <main className="min-w-0">
            {/* Sort bar */}
            <div
              className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-8 border-b"
              style={{ borderColor: 'var(--shop-border, #e7e5e4)' }}
            >
              <p
                className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.3em] uppercase tabular-nums"
                style={{ color: 'var(--shop-ink-muted, #a8a29e)' }}
              >
                แสดง {pageProducts.length} / {filteredCount} ชิ้น
              </p>

              <label className="inline-flex items-center gap-3">
                <span
                  className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  เรียงตาม
                </span>
                <div className="relative">
                  <select
                    value={sortKey}
                    onChange={(e) => {
                      if (typeof window !== 'undefined') {
                        window.location.href = buildSortUrl(e.target.value);
                      }
                    }}
                    aria-label="เรียงตาม"
                    className="appearance-none bg-transparent border-b pb-1 pl-1 pr-7 font-[family:var(--font-prompt)] text-[11px] tracking-wide focus:outline-none cursor-pointer"
                    style={{
                      borderColor: 'var(--shop-ink, #1c1917)',
                      color: 'var(--shop-ink, #1c1917)',
                    }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3"
                    strokeWidth={1.25}
                    style={{ color: 'var(--shop-accent, #b48c4a)' }}
                  />
                  {/* Sr-only sort label echo */}
                  <span className="sr-only">{sortLabel}</span>
                </div>
              </label>
            </div>

            {/* ── Empty state ── */}
            {pageProducts.length === 0 ? (
              <div
                className="border py-20 px-6 text-center"
                style={{
                  borderColor: 'var(--shop-border, #e7e5e4)',
                  background: 'var(--shop-muted, #f5f5f4)',
                }}
              >
                <span
                  aria-hidden
                  className="mx-auto block h-px w-10 mb-6"
                  style={{ background: 'var(--shop-accent, #b48c4a)' }}
                />
                <p
                  className="font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase"
                  style={{ color: 'var(--shop-accent, #b48c4a)' }}
                >
                  Catalogue Empty
                </p>
                <h2
                  className="mt-3 font-[family:var(--font-kanit)] font-light text-2xl tracking-[0.06em]"
                  style={{ color: 'var(--shop-ink, #1c1917)' }}
                >
                  ยังไม่มีชิ้นงานในตัวกรองนี้
                </h2>
                <p
                  className="mt-3 text-xs leading-relaxed max-w-sm mx-auto"
                  style={{ color: 'var(--shop-ink-muted, #78716c)' }}
                >
                  ลองเลือกหมวดหมู่อื่น
                  หรือล้างตัวกรองเพื่อดูคอลเลกชันทั้งหมด
                </p>
                <Link
                  href={buildUrl(undefined, 1)}
                  className="group mt-8 inline-flex items-center gap-3 font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase border-b pb-2 transition-colors duration-500"
                  style={{
                    color: 'var(--shop-ink, #1c1917)',
                    borderColor: 'var(--shop-ink, #1c1917)',
                  }}
                >
                  ล้างตัวกรอง
                  <ChevronRight
                    size={14}
                    strokeWidth={1.25}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-14">
                {pageProducts.map((p) => {
                  const onSale =
                    p.compareAtPriceTHB != null && p.compareAtPriceTHB > p.priceTHB;
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/stores/${store.slug}/products/${p.id}`}
                        className="group block"
                      >
                        {/* Museum-card frame — 4:5 portrait + hairline */}
                        <div
                          className="relative overflow-hidden border"
                          style={{
                            aspectRatio: '4 / 5',
                            borderColor: 'var(--shop-border, #e7e5e4)',
                            background: 'var(--shop-muted, #f5f5f4)',
                          }}
                        >
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div
                              className="absolute inset-0 flex items-center justify-center"
                              style={{ background: 'var(--shop-muted, #f5f5f4)' }}
                            >
                              <span
                                className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.35em] uppercase"
                                style={{ color: 'var(--shop-ink-muted, #a8a29e)' }}
                              >
                                No Image
                              </span>
                            </div>
                          )}

                          {/* Sale ribbon — restrained gold caps */}
                          {onSale && (
                            <span
                              className="absolute top-3 left-3 font-[family:var(--font-kanit)] font-light text-[9px] tracking-[0.35em] uppercase px-2 py-1 border"
                              style={{
                                color: 'var(--shop-accent, #b48c4a)',
                                borderColor: 'var(--shop-accent, #b48c4a)',
                                background:
                                  'color-mix(in srgb, var(--shop-bg, #fafaf9) 88%, transparent)',
                              }}
                            >
                              Reduced
                            </span>
                          )}

                          {/* Gold trim — hairline that grows on hover */}
                          <span
                            aria-hidden
                            className="absolute bottom-0 left-0 h-px transition-all duration-700 ease-out"
                            style={{
                              width: '20%',
                              background: 'var(--shop-accent, #b48c4a)',
                            }}
                          />
                        </div>

                        {/* Card meta */}
                        <div className="pt-5">
                          {p.categoryName && (
                            <p
                              className="font-[family:var(--font-kanit)] font-light text-[9px] tracking-[0.35em] uppercase mb-2"
                              style={{ color: 'var(--shop-accent, #b48c4a)' }}
                            >
                              {p.categoryName}
                            </p>
                          )}
                          <h3
                            className="font-[family:var(--font-kanit)] font-light text-[15px] leading-snug tracking-[0.04em] line-clamp-2 transition-colors duration-300"
                            style={{ color: 'var(--shop-ink, #1c1917)' }}
                          >
                            {p.title}
                          </h3>

                          {/* Hairline divider */}
                          <span
                            aria-hidden
                            className="block h-px mt-4 mb-3"
                            style={{ background: 'var(--shop-border, #e7e5e4)' }}
                          />

                          <div className="flex items-baseline gap-2">
                            <span
                              className="font-[family:var(--font-kanit)] font-light text-[13px] tracking-[0.06em] tabular-nums"
                              style={{ color: 'var(--shop-ink, #1c1917)' }}
                            >
                              {formatTHB(p.priceTHB)}
                            </span>
                            {onSale && (
                              <span
                                className="font-[family:var(--font-kanit)] font-light text-[11px] tabular-nums line-through"
                                style={{
                                  color: 'var(--shop-ink-muted, #a8a29e)',
                                }}
                              >
                                {formatTHB(p.compareAtPriceTHB!)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ────────────────────────────────────────────────────────
                Pagination — hairline rail (not a chip), gold accent
            ──────────────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-16 pt-8 flex items-center justify-between gap-6 border-t"
                style={{ borderColor: 'var(--shop-border, #e7e5e4)' }}
              >
                {currentPage > 1 ? (
                  <Link
                    href={buildUrl(undefined, currentPage - 1)}
                    className="group inline-flex items-center gap-3 font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase border-b pb-1 transition-colors duration-500"
                    style={{
                      color: 'var(--shop-ink, #1c1917)',
                      borderColor: 'var(--shop-ink, #1c1917)',
                    }}
                  >
                    <ChevronLeft
                      size={14}
                      strokeWidth={1.25}
                      className="transition-transform duration-300 group-hover:-translate-x-1"
                    />
                    ก่อนหน้า
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="inline-flex items-center gap-3 font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase border-b pb-1 opacity-40 cursor-not-allowed"
                    style={{
                      color: 'var(--shop-ink-muted, #a8a29e)',
                      borderColor: 'var(--shop-border, #e7e5e4)',
                    }}
                  >
                    <ChevronLeft size={14} strokeWidth={1.25} />
                    ก่อนหน้า
                  </span>
                )}

                {/* Center — page indicator with gold accent */}
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="block h-px w-6"
                    style={{ background: 'var(--shop-accent, #b48c4a)' }}
                  />
                  <span
                    className="font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.3em] tabular-nums"
                    style={{ color: 'var(--shop-ink, #1c1917)' }}
                  >
                    <span style={{ color: 'var(--shop-accent, #b48c4a)' }}>
                      {String(currentPage).padStart(2, '0')}
                    </span>
                    <span
                      className="mx-2"
                      style={{ color: 'var(--shop-ink-muted, #a8a29e)' }}
                    >
                      /
                    </span>
                    <span style={{ color: 'var(--shop-ink-muted, #78716c)' }}>
                      {String(totalPages).padStart(2, '0')}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="block h-px w-6"
                    style={{ background: 'var(--shop-accent, #b48c4a)' }}
                  />
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={buildUrl(undefined, currentPage + 1)}
                    className="group inline-flex items-center gap-3 font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase border-b pb-1 transition-colors duration-500"
                    style={{
                      color: 'var(--shop-ink, #1c1917)',
                      borderColor: 'var(--shop-ink, #1c1917)',
                    }}
                  >
                    ถัดไป
                    <ChevronRight
                      size={14}
                      strokeWidth={1.25}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="inline-flex items-center gap-3 font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase border-b pb-1 opacity-40 cursor-not-allowed"
                    style={{
                      color: 'var(--shop-ink-muted, #a8a29e)',
                      borderColor: 'var(--shop-border, #e7e5e4)',
                    }}
                  >
                    ถัดไป
                    <ChevronRight size={14} strokeWidth={1.25} />
                  </span>
                )}
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export const CatalogPage = Atelier27Catalog;
