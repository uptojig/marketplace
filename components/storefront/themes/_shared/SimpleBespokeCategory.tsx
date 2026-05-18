/**
 * Shared bespoke category-page scaffold for the slim themes (everyday /
 * taobao / packaging / community). Renders a full theme-styled page —
 * not just a ribbon. The default category page that
 * /app/stores/[slug]/category/page.tsx falls through to is more
 * generic; this one customises the hero, filter strip, and product
 * grid presentation so each theme reads as a distinct catalog.
 *
 * Caller in app/stores/[slug]/category/page.tsx passes the same
 * sharedCategoryProps used by BM/Trust/etc. + theme-specific tokens.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';

export interface SimpleBespokeCategoryTokens {
  /** Solid color or CSS gradient — used for the hero band. */
  heroBg: string;
  /** Foreground color on the hero. */
  heroFg: string;
  /** Brand accent (chip backgrounds, link underlines). */
  accent: string;
  /** Primary CTA + price color. */
  primary: string;
  /** Top eyebrow line above the heading. */
  eyebrow: string;
  /** Page heading. */
  heading: string;
  /** Decorative sub-heading. */
  subheading: string;
}

export interface SimpleBespokeCategoryProduct {
  id: string;
  title: string;
  titleTh: string | null;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

export interface SimpleBespokeCategoryProps {
  storeSlug: string;
  storeName: string;
  pageProducts: SimpleBespokeCategoryProduct[];
  totalCount: number;
  selectedCats: string[];
  sortKey: string;
  currentPage: number;
  totalPages: number;
  buildUrl: (toggleCat?: string, page?: number) => string;
  buildSortUrl: (sort: string) => string;
  categoryNames: string[];
  tokens: SimpleBespokeCategoryTokens;
}

const SORT_OPTIONS = [
  { key: 'newest', label: 'ใหม่ล่าสุด' },
  { key: 'price-asc', label: 'ราคา ↑' },
  { key: 'price-desc', label: 'ราคา ↓' },
];

export function SimpleBespokeCategory({
  storeSlug,
  storeName,
  pageProducts,
  totalCount,
  selectedCats,
  sortKey,
  currentPage,
  totalPages,
  buildUrl,
  buildSortUrl,
  categoryNames,
  tokens,
}: SimpleBespokeCategoryProps) {
  return (
    <div style={{ background: 'var(--shop-bg, #FAFAFA)', minHeight: '100vh' }}>
      {/* Hero band — theme-tinted, full-width */}
      <section
        className="border-b px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
        style={{ background: tokens.heroBg, color: tokens.heroFg, borderColor: 'var(--shop-border, #E5E5E5)' }}
      >
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/stores/${storeSlug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-80 hover:opacity-100"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับไป {storeName}
          </Link>
          <p
            className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] opacity-90"
          >
            {tokens.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
            {tokens.heading}
          </h1>
          <p className="mt-3 text-sm sm:text-base" style={{ opacity: 0.9 }}>
            {tokens.subheading} · {totalCount} สินค้า
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Category chip filters */}
        {categoryNames.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            <Link
              href={buildUrl()}
              className="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background:
                  selectedCats.length === 0 ? tokens.primary : 'var(--shop-bg-soft, #fff)',
                color:
                  selectedCats.length === 0 ? '#ffffff' : 'var(--shop-ink, #0A0A0A)',
                borderColor: 'var(--shop-border, #E5E5E5)',
              }}
            >
              ทั้งหมด
            </Link>
            {categoryNames.map((name) => {
              const active = selectedCats.includes(name);
              return (
                <Link
                  key={name}
                  href={buildUrl(name)}
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                  style={{
                    background: active ? tokens.primary : 'var(--shop-bg-soft, #fff)',
                    color: active ? '#ffffff' : 'var(--shop-ink, #0A0A0A)',
                    borderColor: 'var(--shop-border, #E5E5E5)',
                  }}
                >
                  {name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Sort tabs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}>
          <div className="flex gap-1 text-xs">
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.key;
              return (
                <Link
                  key={opt.key}
                  href={buildSortUrl(opt.key)}
                  className="rounded-md px-3 py-1.5 font-semibold transition"
                  style={{
                    background: active ? tokens.accent : 'transparent',
                    color: active ? '#0A0A0A' : 'var(--shop-ink-muted, #525252)',
                  }}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
          <span className="text-xs" style={{ color: 'var(--shop-ink-muted, #525252)' }}>
            หน้า {currentPage} / {totalPages || 1}
          </span>
        </div>

        {/* Product grid */}
        {pageProducts.length === 0 ? (
          <p className="rounded-xl border bg-white p-10 text-center text-sm" style={{ borderColor: 'var(--shop-border, #E5E5E5)', color: 'var(--shop-ink-muted, #737373)' }}>
            ไม่พบสินค้า — ลองเปลี่ยนหมวดหรือล้างตัวกรอง
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {pageProducts.map((p) => {
              const title = p.titleTh ?? p.title;
              const compare = p.compareAtPriceTHB;
              const discount =
                compare && compare > p.priceTHB
                  ? Math.round((1 - p.priceTHB / compare) * 100)
                  : null;
              return (
                <li key={p.id}>
                  <Link href={`/stores/${storeSlug}/products/${p.id}`} className="group block">
                    <div
                      className="relative aspect-square overflow-hidden rounded-xl border bg-white transition group-hover:shadow-md"
                      style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
                    >
                      {p.imageUrl && (
                        <Image
                          src={p.imageUrl}
                          alt={title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover transition group-hover:scale-[1.03]"
                        />
                      )}
                      {discount != null && (
                        <span
                          className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm"
                          style={{ background: tokens.primary, letterSpacing: '0.04em' }}
                        >
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-2 line-clamp-2 text-sm font-semibold"
                      style={{ color: 'var(--shop-ink, #0A0A0A)' }}
                    >
                      {title}
                    </p>
                    <p className="mt-1 text-base font-extrabold tabular-nums" style={{ color: tokens.primary }}>
                      ฿{p.priceTHB.toLocaleString('th-TH')}
                      {compare && compare > p.priceTHB && (
                        <span className="ml-2 text-xs font-medium line-through" style={{ color: 'var(--shop-ink-muted, #737373)' }}>
                          ฿{compare.toLocaleString('th-TH')}
                        </span>
                      )}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={buildUrl(undefined, currentPage - 1)}
                className="rounded-md border bg-white px-3 py-1.5 text-sm font-medium"
                style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
              >
                ← ก่อนหน้า
              </Link>
            )}
            <span className="text-sm font-semibold" style={{ color: tokens.primary }}>
              {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={buildUrl(undefined, currentPage + 1)}
                className="rounded-md border bg-white px-3 py-1.5 text-sm font-medium"
                style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
              >
                ถัดไป →
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
