'use client';

/**
 * yumeiro-lip — bespoke Catalog page
 *
 * Lipstick / beauty storefront. Heavy emphasis on a vivid swatch dot
 * for each product card (the "try-on" preview), plus a shade-family
 * filter rail (pink / peach / coral / berry / wine / nude) layered on
 * top of the database-driven category chips.
 *
 * Uses CatalogProps as-is (no cart helpers — PDP handles add-to-cart).
 * Pure links for filtering / sorting / paging keeps it server-friendly.
 */

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, Heart } from 'lucide-react';
import type { CatalogProps, TemplateProductCard } from '@/lib/templates/types';
import { formatTHB } from '@/lib/utils';

// ----------------------------------------------------------------------------
// Shade families — vivid lipstick "color story" pills layered above the
// db-driven category list. Each family pre-selects DB categories whose
// label matches the shade keywords (case/space-insensitive) and falls
// back to an empty selection if nothing matches (still safe — the link
// still renders).
// ----------------------------------------------------------------------------

interface ShadeFamily {
  key: string;
  label: string; // Thai-first label
  swatch: string; // hex preview chip
  keywords: string[]; // matched against categoryName, lower-case
}

const SHADE_FAMILIES: ShadeFamily[] = [
  { key: 'pink', label: 'พิงค์', swatch: '#ec4899', keywords: ['pink', 'พิงค์', 'ชมพู'] },
  { key: 'peach', label: 'พีช', swatch: '#fb923c', keywords: ['peach', 'พีช', 'ส้มอ่อน'] },
  { key: 'coral', label: 'คอรัล', swatch: '#fb7185', keywords: ['coral', 'คอรัล'] },
  { key: 'berry', label: 'เบอร์รี่', swatch: '#be185d', keywords: ['berry', 'เบอร์รี่', 'แดงม่วง'] },
  { key: 'wine', label: 'ไวน์', swatch: '#7f1d1d', keywords: ['wine', 'ไวน์', 'เบอร์กันดี', 'burgundy'] },
  { key: 'nude', label: 'นู้ด', swatch: '#d4a373', keywords: ['nude', 'นู้ด', 'น้ำตาล', 'brown'] },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'ใหม่ล่าสุด' },
  { key: 'price-asc', label: 'ราคาต่ำ → สูง' },
  { key: 'price-desc', label: 'ราคาสูง → ต่ำ' },
];

// ----------------------------------------------------------------------------
// Derive a swatch hex for each product. The PDP / variant layer doesn't
// surface "the lipstick swatch hex" through CatalogProps, so we hash the
// product id into a curated lipstick palette to give every card a
// distinctive "try-on" dot. Real swatches can replace this later when
// product variants expose a color field.
// ----------------------------------------------------------------------------

const LIP_PALETTE = [
  '#ec4899', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239',
  '#fb923c', '#f97316', '#ea580c', '#c2410c',
  '#db2777', '#be185d', '#9d174d', '#831843',
  '#d4a373', '#a16207', '#7c2d12', '#7f1d1d',
];

function swatchForProduct(p: TemplateProductCard): string {
  // Stable, cheap hash → palette index
  let h = 0;
  for (let i = 0; i < p.id.length; i++) {
    h = (h * 31 + p.id.charCodeAt(i)) >>> 0;
  }
  return LIP_PALETTE[h % LIP_PALETTE.length]!;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export default function YumeiroLipCatalog(props: CatalogProps) {
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

  // Map each shade family to whatever db category currently matches its
  // keywords (first match wins). This keeps the pill row "useful" even
  // when admins haven't named their categories perfectly — clicking a
  // shade pill just toggles the matched db category through buildUrl.
  const shadeToCategory = useMemo(() => {
    const lowerCats = categoryNames.map((c) => ({ raw: c, lower: c.toLowerCase() }));
    const out: Record<string, string | null> = {};
    for (const fam of SHADE_FAMILIES) {
      const hit = lowerCats.find((c) =>
        fam.keywords.some((kw) => c.lower.includes(kw.toLowerCase())),
      );
      out[fam.key] = hit?.raw ?? null;
    }
    return out;
  }, [categoryNames]);

  const allActive = selectedCats.length === 0;

  return (
    <div
      className="font-[family:var(--font-prompt)]"
      style={{
        background:
          'linear-gradient(180deg, var(--shop-bg, #fff0f5) 0%, var(--shop-bg, #fff5f7) 60%, #ffffff 100%)',
        minHeight: '100vh',
        color: 'var(--shop-ink, #831843)',
      }}
    >
      {/* ----------------------------------------------------------------
          Hero band — color-story headline + breadcrumb
      ---------------------------------------------------------------- */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          borderColor: 'var(--shop-border, #fbcfe8)',
          background:
            'radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--shop-primary, #ec4899) 18%, transparent) 0%, transparent 55%), var(--shop-bg-soft, #fff0f5)',
        }}
      >
        <div className="pointer-events-none absolute -top-8 right-10 opacity-30">
          <Sparkles
            className="h-20 w-20"
            style={{ color: 'var(--shop-primary, #ec4899)' }}
          />
        </div>
        <div className="pointer-events-none absolute bottom-2 left-6 opacity-20">
          <Heart
            className="h-16 w-16"
            style={{ color: 'var(--shop-accent, #fb7185)' }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-ink-muted, #be185d)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับไปหน้าร้าน
          </Link>

          <p
            className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ color: 'var(--shop-accent, #fb7185)' }}
          >
            ทดลองเฉดทุกสี · TRY-ON CATALOG
          </p>
          <h1
            className="mt-2 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: 'var(--shop-primary, #ec4899)' }}
          >
            เลือกเฉดที่ใช่สำหรับคุณ
          </h1>
          <p
            className="mt-3 max-w-2xl text-sm sm:text-base"
            style={{ color: 'var(--shop-ink-muted, #9d174d)' }}
          >
            ลิปทินต์ · ลิปแมตต์ · บลัชเชอร์ — กดดูเฉดสี ทดลองได้ทุกโทน
            ปั้มเดียวขึ้นสีจริง พบ {filteredCount} เฉดในคอลเลกชันนี้
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          Main content
      ---------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Shade family pills — vivid swatch + Thai label */}
        <div className="mb-5">
          <p
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'var(--shop-ink-muted, #9d174d)' }}
          >
            เลือกตามโทนสี
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildUrl()}
              className="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition hover:scale-[1.03]"
              style={{
                borderColor: allActive
                  ? 'var(--shop-primary, #ec4899)'
                  : 'var(--shop-border, #fbcfe8)',
                background: allActive
                  ? 'var(--shop-primary, #ec4899)'
                  : 'var(--shop-bg-soft, #ffffff)',
                color: allActive ? '#ffffff' : 'var(--shop-ink, #831843)',
                boxShadow: allActive
                  ? '0 4px 14px -4px color-mix(in srgb, var(--shop-primary, #ec4899) 50%, transparent)'
                  : 'none',
              }}
            >
              <span
                className="h-3.5 w-3.5 rounded-full border-2 border-white"
                style={{
                  background:
                    'conic-gradient(#ec4899, #fb7185, #f43f5e, #be185d, #d4a373, #ec4899)',
                }}
                aria-hidden
              />
              ทุกเฉด
            </Link>

            {SHADE_FAMILIES.map((fam) => {
              const matchedCat = shadeToCategory[fam.key];
              const active = matchedCat != null && selectedCats.includes(matchedCat);
              // If no db category matches the family, fall back to a
              // safe no-op link (buildUrl()) so the pill is still clickable
              // and just clears the filter set.
              const href = matchedCat ? buildUrl(matchedCat) : buildUrl();
              return (
                <Link
                  key={fam.key}
                  href={href}
                  className="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition hover:scale-[1.03]"
                  style={{
                    borderColor: active
                      ? 'var(--shop-primary, #ec4899)'
                      : 'var(--shop-border, #fbcfe8)',
                    background: active
                      ? 'var(--shop-primary, #ec4899)'
                      : 'var(--shop-bg-soft, #ffffff)',
                    color: active ? '#ffffff' : 'var(--shop-ink, #831843)',
                    boxShadow: active
                      ? '0 4px 14px -4px color-mix(in srgb, var(--shop-primary, #ec4899) 50%, transparent)'
                      : 'none',
                  }}
                  aria-pressed={active}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: fam.swatch }}
                    aria-hidden
                  />
                  {fam.label}
                </Link>
              );
            })}
          </div>

          {/* DB-driven category chips — secondary row for full coverage */}
          {categoryNames.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {categoryNames.map((name) => {
                const active = selectedCats.includes(name);
                const count = categoryCounts[name] ?? 0;
                return (
                  <Link
                    key={name}
                    href={buildUrl(name)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition"
                    style={{
                      borderColor: active
                        ? 'var(--shop-accent, #fb7185)'
                        : 'var(--shop-border, #fbcfe8)',
                      background: active
                        ? 'color-mix(in srgb, var(--shop-accent, #fb7185) 12%, transparent)'
                        : 'transparent',
                      color: active
                        ? 'var(--shop-primary, #ec4899)'
                        : 'var(--shop-ink-muted, #9d174d)',
                    }}
                  >
                    {name}
                    <span
                      className="text-[10px] tabular-nums"
                      style={{ color: 'var(--shop-ink-muted, #be185d)', opacity: 0.7 }}
                    >
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sort dropdown + result summary */}
        <div
          className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4"
          style={{ borderColor: 'var(--shop-border, #fbcfe8)' }}
        >
          <span
            className="text-xs"
            style={{ color: 'var(--shop-ink-muted, #9d174d)' }}
          >
            แสดง {pageProducts.length} จาก {filteredCount} เฉด
          </span>

          <label className="inline-flex items-center gap-2 text-xs font-semibold">
            <span style={{ color: 'var(--shop-ink-muted, #9d174d)' }}>
              เรียงตาม
            </span>
            <div className="relative">
              <select
                value={sortKey}
                onChange={(e) => {
                  // Server-rendered links handle sort, but a controlled
                  // <select> needs an onChange. Push the user to the
                  // built sort URL so the page reloads with the new key.
                  if (typeof window !== 'undefined') {
                    window.location.href = buildSortUrl(e.target.value);
                  }
                }}
                className="appearance-none rounded-full border px-4 py-1.5 pr-8 text-xs font-semibold transition focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--shop-border, #fbcfe8)',
                  background: 'var(--shop-bg-soft, #ffffff)',
                  color: 'var(--shop-ink, #831843)',
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronRight
                className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 rotate-90"
                style={{ color: 'var(--shop-primary, #ec4899)' }}
              />
            </div>
          </label>
        </div>

        {/* ----------------------------------------------------------------
            Product grid — "try-on" color preview cards
        ---------------------------------------------------------------- */}
        {pageProducts.length === 0 ? (
          <div
            className="rounded-3xl border-2 border-dashed p-12 text-center"
            style={{
              borderColor: 'var(--shop-border, #fbcfe8)',
              background: 'var(--shop-bg-soft, #ffffff)',
            }}
          >
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background:
                  'color-mix(in srgb, var(--shop-primary, #ec4899) 12%, transparent)',
              }}
            >
              <Heart
                className="h-8 w-8"
                style={{ color: 'var(--shop-primary, #ec4899)' }}
              />
            </div>
            <p
              className="text-base font-bold"
              style={{ color: 'var(--shop-ink, #831843)' }}
            >
              ยังไม่มีเฉดที่ตรงกับตัวกรอง
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--shop-ink-muted, #9d174d)' }}
            >
              ลองล้างตัวกรองหรือเลือกโทนสีอื่น เฉดใหม่กำลังมาเร็วๆ นี้
            </p>
            <Link
              href={buildUrl()}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:scale-[1.04]"
              style={{ background: 'var(--shop-primary, #ec4899)' }}
            >
              ล้างตัวกรอง
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {pageProducts.map((p) => {
              const swatch = swatchForProduct(p);
              const onSale =
                p.compareAtPriceTHB != null && p.compareAtPriceTHB > p.priceTHB;
              const discount = onSale
                ? Math.round((1 - p.priceTHB / p.compareAtPriceTHB!) * 100)
                : null;
              return (
                <li key={p.id}>
                  <Link
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border transition hover:-translate-y-1 hover:shadow-xl"
                    style={{
                      borderColor: 'var(--shop-border, #fbcfe8)',
                      background: 'var(--shop-bg-soft, #ffffff)',
                    }}
                  >
                    {/* Image / swatch frame */}
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, ${swatch} 18%, white) 0%, var(--shop-bg, #fff0f5) 100%)`,
                      }}
                    >
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Heart
                            className="h-12 w-12 opacity-40"
                            style={{ color: swatch }}
                          />
                        </div>
                      )}

                      {/* Prominent swatch dot — the "try-on" preview */}
                      <span
                        className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white shadow-lg transition group-hover:scale-110"
                        style={{
                          background: swatch,
                          boxShadow:
                            '0 4px 14px -2px rgba(0,0,0,0.25), inset 0 -3px 6px rgba(0,0,0,0.15), inset 0 3px 6px rgba(255,255,255,0.35)',
                        }}
                        aria-hidden
                      />

                      {onSale && discount != null && (
                        <span
                          className="absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
                          style={{
                            background: 'var(--shop-accent, #fb7185)',
                            letterSpacing: '0.06em',
                          }}
                        >
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="flex flex-1 flex-col p-4">
                      {p.categoryName && (
                        <span
                          className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                          style={{ color: 'var(--shop-accent, #fb7185)' }}
                        >
                          {p.categoryName}
                        </span>
                      )}
                      <h3
                        className="line-clamp-2 text-sm font-bold leading-snug transition group-hover:opacity-80"
                        style={{ color: 'var(--shop-ink, #831843)' }}
                      >
                        {p.title}
                      </h3>

                      <div className="mt-auto pt-3">
                        <div className="flex items-baseline gap-2">
                          <span
                            className="text-base font-black tabular-nums"
                            style={{ color: 'var(--shop-primary, #ec4899)' }}
                          >
                            {formatTHB(p.priceTHB)}
                          </span>
                          {onSale && (
                            <span
                              className="text-xs font-medium line-through"
                              style={{
                                color: 'var(--shop-ink-muted, #9d174d)',
                                opacity: 0.7,
                              }}
                            >
                              {formatTHB(p.compareAtPriceTHB!)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* ----------------------------------------------------------------
            Pagination
        ---------------------------------------------------------------- */}
        {totalPages > 1 && (
          <nav
            className="mt-10 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            {currentPage > 1 ? (
              <Link
                href={buildUrl(undefined, currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-bold transition hover:scale-[1.03]"
                style={{
                  borderColor: 'var(--shop-border, #fbcfe8)',
                  background: 'var(--shop-bg-soft, #ffffff)',
                  color: 'var(--shop-ink, #831843)',
                }}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                ก่อนหน้า
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-bold opacity-40"
                style={{
                  borderColor: 'var(--shop-border, #fbcfe8)',
                  background: 'var(--shop-bg-soft, #ffffff)',
                  color: 'var(--shop-ink-muted, #9d174d)',
                }}
                aria-disabled
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                ก่อนหน้า
              </span>
            )}

            <span
              className="inline-flex h-9 min-w-[5rem] items-center justify-center rounded-full px-4 text-xs font-bold tabular-nums text-white"
              style={{
                background:
                  'linear-gradient(135deg, var(--shop-primary, #ec4899) 0%, var(--shop-accent, #fb7185) 100%)',
                boxShadow:
                  '0 6px 16px -6px color-mix(in srgb, var(--shop-primary, #ec4899) 70%, transparent)',
              }}
            >
              {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={buildUrl(undefined, currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-bold transition hover:scale-[1.03]"
                style={{
                  borderColor: 'var(--shop-border, #fbcfe8)',
                  background: 'var(--shop-bg-soft, #ffffff)',
                  color: 'var(--shop-ink, #831843)',
                }}
              >
                ถัดไป
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-bold opacity-40"
                style={{
                  borderColor: 'var(--shop-border, #fbcfe8)',
                  background: 'var(--shop-bg-soft, #ffffff)',
                  color: 'var(--shop-ink-muted, #9d174d)',
                }}
                aria-disabled
              >
                ถัดไป
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}

export const CatalogPage = YumeiroLipCatalog;
