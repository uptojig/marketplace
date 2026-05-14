/**
 * SpecialtyCategoryPage — bespoke artisan / vintage catalog layout.
 *
 * Structural difference from the generic /stores/[slug]/category page
 * AND from the fashion-beauty bespoke variant:
 *   - Workshop-letter top spread: hand-script "From the makers" eyebrow
 *     paired with a Fraunces slab-serif h1, NOT an editorial italic
 *     curator note.
 *   - Brushed-paper chip filters with irregular dashed borders + a
 *     slight rotation on the active chip (data-specialty-stamp="true")
 *     instead of pill-rounded rose chips.
 *   - Sort labels render as hand-script Caveat lines (no pill borders),
 *     reads like a curator's pen mark.
 *   - Inner grid is built INLINE here (no SpecialtyCategoryGrid import)
 *     so the catalog page can show maker-attribution per card without
 *     editing the existing grid component used elsewhere.
 *   - Each tile is a kraft-textured card (data-specialty-kraft="true")
 *     with a sepia-tinted image (data-specialty-sepia="true") and a
 *     hand-script "By <store name>" attribution below the title.
 *   - Pagination uses hand-script "Page 1 of 5" copy with a hairline
 *     dashed divider above instead of the FB italic-serif strip.
 */

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export interface SpecialtyCategoryProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

export interface SpecialtyCategoryPageProps {
  storeSlug: string;
  storeName: string;
  totalCount: number;
  pageProducts: SpecialtyCategoryProduct[];
  categoryNames: string[];
  categoryCounts: Record<string, number>;
  uncatCount: number;
  selectedCats: string[];
  sortKey: string;
  currentPage: number;
  totalPages: number;
  buildUrl: (toggleCat?: string, page?: number) => string;
  buildSortUrl: (sort: string) => string;
  filteredCount: number;
}

const SORT_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'newest', label: 'ใหม่ล่าสุด' },
  { key: 'price-asc', label: 'ราคาต่ำสุด' },
  { key: 'price-desc', label: 'ราคาสูงสุด' },
];

export function SpecialtyCategoryPage(props: SpecialtyCategoryPageProps) {
  const {
    storeSlug,
    storeName,
    pageProducts,
    categoryNames,
    categoryCounts,
    uncatCount,
    selectedCats,
    sortKey,
    currentPage,
    totalPages,
    buildUrl,
    buildSortUrl,
    filteredCount,
  } = props;

  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Workshop-letter top spread */}
        <header className="mb-10 sm:mb-14">
          <Link
            href={`/stores/${storeSlug}`}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับสตูดิโอ
          </Link>
          <p
            className="mt-6 text-2xl"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-accent)',
            }}
          >
            จากช่างฝีมือ
          </p>
          <div className="mt-1 flex flex-col items-baseline justify-between gap-3 sm:flex-row">
            <h1
              className="text-4xl sm:text-5xl"
              style={{
                fontFamily: SPECIALTY_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                lineHeight: 1.05,
              }}
            >
              แค็ตตาล็อกทั้งหมด
            </h1>
            <span
              className="text-sm"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {filteredCount.toLocaleString()} ชิ้นจาก {storeName}
            </span>
          </div>
        </header>

        {/* Brushed paper-feel chips + hand-script sort */}
        <div
          className="mb-8 flex flex-col gap-4 border-y border-dashed py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'var(--shop-accent)' }}
        >
          {/* Category chips — irregular dashed borders, kraft tone */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              ตัวกรอง
            </span>
            <Link
              href={buildUrl()}
              {...(selectedCats.length === 0 ? { 'data-specialty-stamp': 'true' } : {})}
              className="rounded-md border border-dashed px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition"
              style={{
                borderColor:
                  selectedCats.length === 0
                    ? 'var(--shop-primary)'
                    : 'var(--shop-border)',
                background:
                  selectedCats.length === 0
                    ? 'var(--shop-card)'
                    : 'transparent',
                color:
                  selectedCats.length === 0
                    ? 'var(--shop-primary)'
                    : 'var(--shop-ink-muted)',
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
                  {...(active ? { 'data-specialty-stamp': 'true' } : {})}
                  className="rounded-md border border-dashed px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition hover:border-[var(--shop-primary)]"
                  style={{
                    borderColor: active ? 'var(--shop-primary)' : 'var(--shop-border)',
                    background: active ? 'var(--shop-card)' : 'transparent',
                    color: active ? 'var(--shop-primary)' : 'var(--shop-ink-muted)',
                  }}
                >
                  {name}
                  <span className="ml-1.5 text-[11px] opacity-70">
                    {categoryCounts[name] ?? 0}
                  </span>
                </Link>
              );
            })}
            {uncatCount > 0 && (
              <Link
                href={buildUrl('uncategorized')}
                {...(selectedCats.includes('uncategorized')
                  ? { 'data-specialty-stamp': 'true' }
                  : {})}
                className="rounded-md border border-dashed px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition hover:border-[var(--shop-primary)]"
                style={{
                  borderColor: selectedCats.includes('uncategorized')
                    ? 'var(--shop-primary)'
                    : 'var(--shop-border)',
                  background: selectedCats.includes('uncategorized')
                    ? 'var(--shop-card)'
                    : 'transparent',
                  color: selectedCats.includes('uncategorized')
                    ? 'var(--shop-primary)'
                    : 'var(--shop-ink-muted)',
                }}
              >
                อื่นๆ ({uncatCount})
              </Link>
            )}
          </div>

          {/* Sort labels — hand-script Caveat */}
          <div className="flex items-center gap-4">
            <span
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              จัดเรียง
            </span>
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.key;
              return (
                <Link
                  key={opt.key}
                  href={buildSortUrl(opt.key)}
                  className="text-lg leading-none transition hover:underline"
                  style={{
                    fontFamily: SPECIALTY_HAND_FONT,
                    color: active ? 'var(--shop-primary)' : 'var(--shop-ink-muted)',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Inline grid — kraft cards with maker attribution */}
        {pageProducts.length === 0 ? (
          <SpecialtyEmptyCatalog
            storeSlug={storeSlug}
            hasFilters={selectedCats.length > 0}
            buildUrl={buildUrl}
          />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
            {pageProducts.map((p) => {
              const discount =
                p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB
                  ? Math.round((1 - p.priceTHB / p.compareAtPriceTHB) * 100)
                  : null;

              return (
                <Link
                  key={p.id}
                  href={`/stores/${storeSlug}/products/${p.id}`}
                  className="group block"
                >
                  <div
                    data-specialty-kraft="true"
                    className="relative overflow-hidden rounded-md border p-2.5 shadow-sm transition duration-300 group-hover:shadow-md"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    <div
                      data-specialty-sepia="true"
                      className="relative overflow-hidden rounded-md"
                      style={{
                        aspectRatio: '1 / 1',
                        backgroundColor: 'var(--shop-muted)',
                      }}
                    >
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[var(--shop-ink-muted)]">
                          ไม่มีรูป
                        </div>
                      )}
                      {discount != null && (
                        <span
                          data-specialty-stamp="true"
                          className="absolute left-3 top-3 rounded-md border bg-[var(--shop-card)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em]"
                          style={{
                            color: 'var(--shop-accent)',
                            borderColor: 'var(--shop-accent)',
                          }}
                        >
                          −{discount}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-1 pt-3">
                    <span
                      style={{
                        fontFamily: SPECIALTY_HAND_FONT,
                        color: 'var(--shop-accent)',
                      }}
                      className="text-base italic"
                    >
                      โดย {storeName}
                    </span>
                    <p
                      className="mt-1 line-clamp-2 text-sm leading-snug"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: SPECIALTY_DISPLAY_FONT,
                        fontWeight: 500,
                      }}
                    >
                      {p.title}
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        ฿ {p.priceTHB.toLocaleString('th-TH')}
                      </span>
                      {p.compareAtPriceTHB &&
                        p.compareAtPriceTHB > p.priceTHB && (
                          <span className="text-xs text-[var(--shop-ink-muted)] line-through">
                            ฿ {p.compareAtPriceTHB.toLocaleString('th-TH')}
                          </span>
                        )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination — hand-script "Page X of N" */}
        {totalPages > 1 && (
          <nav
            className="mt-16 flex items-center justify-center gap-6 border-t border-dashed pt-6"
            style={{ borderColor: 'var(--shop-accent)' }}
            aria-label="แบ่งหน้า"
          >
            {currentPage > 1 ? (
              <Link
                href={buildUrl(undefined, currentPage - 1)}
                className="inline-flex items-center gap-2 text-lg transition hover:underline"
                style={{
                  fontFamily: SPECIALTY_HAND_FONT,
                  color: 'var(--shop-ink)',
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                ก่อนหน้า
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-2 text-lg opacity-40"
                style={{ fontFamily: SPECIALTY_HAND_FONT, color: 'var(--shop-ink-muted)' }}
              >
                <ChevronLeft className="h-4 w-4" />
                ก่อนหน้า
              </span>
            )}
            <span
              className="text-xl"
              style={{
                fontFamily: SPECIALTY_HAND_FONT,
                color: 'var(--shop-ink-muted)',
              }}
            >
              หน้า <span style={{ color: 'var(--shop-ink)' }}>{currentPage}</span> จาก{' '}
              {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link
                href={buildUrl(undefined, currentPage + 1)}
                className="inline-flex items-center gap-2 text-lg transition hover:underline"
                style={{
                  fontFamily: SPECIALTY_HAND_FONT,
                  color: 'var(--shop-ink)',
                }}
              >
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-2 text-lg opacity-40"
                style={{ fontFamily: SPECIALTY_HAND_FONT, color: 'var(--shop-ink-muted)' }}
              >
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}

function SpecialtyEmptyCatalog({
  storeSlug,
  hasFilters,
  buildUrl,
}: {
  storeSlug: string;
  hasFilters: boolean;
  buildUrl: (toggleCat?: string, page?: number) => string;
}) {
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <p
        className="text-2xl"
        style={{
          fontFamily: SPECIALTY_HAND_FONT,
          color: 'var(--shop-accent)',
        }}
      >
        ยังไม่มีงานบนโต๊ะ
      </p>
      <h2
        className="mt-1 text-3xl"
        style={{
          fontFamily: SPECIALTY_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 500,
        }}
      >
        ไม่พบงานที่ตรงกับเงื่อนไข
      </h2>
      <p
        className="mt-3 text-sm"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        {hasFilters
          ? 'ลองล้างตัวกรองเพื่อดูแค็ตตาล็อกของสตูดิโอทั้งหมด'
          : 'ช่างฝีมือกำลังเตรียมงานชุดถัดไป — แวะมาดูใหม่เร็วๆ นี้'}
      </p>
      {hasFilters ? (
        <Link
          href={buildUrl()}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md px-7 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--shop-primary)' }}
        >
          ล้างตัวกรอง
        </Link>
      ) : (
        <Link
          href={`/stores/${storeSlug}`}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md px-7 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--shop-primary)' }}
        >
          กลับสตูดิโอ
        </Link>
      )}
    </div>
  );
}
