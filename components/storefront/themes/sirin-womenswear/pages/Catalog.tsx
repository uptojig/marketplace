'use client';

/**
 * sirin-womenswear — bespoke Catalog page.
 *
 * Editorial boutique catalog for the women's-fashion family. Built as
 * a slim sidebar (Collection / Size / Colour filter rails) paired with
 * a portrait-led 3-up product grid (4:5 aspect, hover lift) so the
 * imagery — not the chrome — does the selling. Headings ride Kanit at
 * the light weight to evoke a serif-display feel; the body is Prompt.
 * Curator italics ("จากบรรณาธิการของเรา…") and a soft
 * rose / burgundy / cream palette piped exclusively through
 * `var(--shop-*)` tokens (resolved per-store in the shop layout — no
 * hard-coded hex). Mounts directly on the scaffold `CatalogProps`
 * shape with pure-link navigation for filters / sort / paging so it
 * renders fine on the server. No cart helpers — PDP handles ATC.
 *
 * Sections (top → bottom):
 *   1. Breadcrumb + editorial header (eyebrow, oversized title,
 *      curator italics blurb, result count, sort dropdown)
 *   2. Two-column body
 *        ↳ Left:  Collection filter (db categories), Size rail (XS-XL),
 *                  Colour swatches (palette mapped from category names)
 *        ↳ Right: 3-up portrait grid, empty state, pagination
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { CatalogProps, TemplateProductCard } from '@/lib/templates/types';
import { formatTHB } from '@/lib/utils';

// ── Boutique constants ──────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest', label: 'มาใหม่' },
  { value: 'price-asc', label: 'ราคาต่ำ → สูง' },
  { value: 'price-desc', label: 'ราคาสูง → ต่ำ' },
];

/**
 * Static size rail — pure visual rail (no DB-backed filter for sizes
 * yet; clicking simply re-renders the page at /catalog with the size
 * query encoded as `cat` so it falls back gracefully if no matching
 * category exists).
 */
const SIZE_RAIL = ['XS', 'S', 'M', 'L', 'XL'];

/**
 * Colour-story rail. Each entry holds a soft-palette swatch plus a
 * keyword list matched (case-insensitive, substring) against the
 * db-driven category labels. First hit toggles via `buildUrl`; if no
 * match exists, the chip is still clickable but resets the filter
 * set (so the rail never deadlocks an empty store).
 */
interface ColourStory {
  key: string;
  label: string; // Thai-first label
  swatch: string; // hex
  keywords: string[];
}

const COLOUR_STORIES: ColourStory[] = [
  { key: 'cream',    label: 'ครีม',     swatch: '#f5ecdb', keywords: ['cream', 'ครีม', 'ivory', 'งาช้าง'] },
  { key: 'rose',     label: 'โรสพาสเทล', swatch: '#f9c5d5', keywords: ['rose', 'pink', 'ชมพู', 'โรส'] },
  { key: 'burgundy', label: 'เบอร์กันดี', swatch: '#7a1d3a', keywords: ['burgundy', 'wine', 'เบอร์กันดี', 'ไวน์'] },
  { key: 'sage',     label: 'เซจ',      swatch: '#9caf88', keywords: ['sage', 'mint', 'เซจ', 'มินต์', 'เขียว'] },
  { key: 'navy',     label: 'เนวี่',    swatch: '#1e3a5f', keywords: ['navy', 'blue', 'น้ำเงิน', 'เนวี่'] },
  { key: 'noir',     label: 'นัวร์',    swatch: '#1c1917', keywords: ['black', 'noir', 'ดำ'] },
];

// ── Component ───────────────────────────────────────────────────────

export default function SirinWomenswearCatalog(props: CatalogProps) {
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

  const shopHomeUrl = `/stores/${store.slug}`;

  // Map each colour story to whichever db category currently matches
  // its keyword list (first match wins). Keeps the rail useful when
  // an admin labels categories in Thai or English.
  const colourToCategory = useMemo(() => {
    const lowerCats = categoryNames.map((c) => ({ raw: c, lower: c.toLowerCase() }));
    const out: Record<string, string | null> = {};
    for (const story of COLOUR_STORIES) {
      const hit = lowerCats.find((c) =>
        story.keywords.some((kw) => c.lower.includes(kw.toLowerCase())),
      );
      out[story.key] = hit?.raw ?? null;
    }
    return out;
  }, [categoryNames]);

  // Similar trick for sizes — if a category is literally "M" or
  // "ไซส์ S" the rail will toggle it; otherwise the chip just resets
  // the filter set (still navigable, never broken).
  const sizeToCategory = useMemo(() => {
    const lowerCats = categoryNames.map((c) => ({ raw: c, lower: c.toLowerCase() }));
    const out: Record<string, string | null> = {};
    for (const size of SIZE_RAIL) {
      const needle = size.toLowerCase();
      const hit = lowerCats.find(
        (c) =>
          c.lower === needle ||
          c.lower.includes(`size ${needle}`) ||
          c.lower.includes(`ไซส์ ${needle}`) ||
          c.lower.endsWith(` ${needle}`),
      );
      out[size] = hit?.raw ?? null;
    }
    return out;
  }, [categoryNames]);

  const allActive = selectedCats.length === 0;

  return (
    <div
      className="font-[family:var(--font-prompt)]"
      style={{
        background:
          'linear-gradient(180deg, var(--shop-bg, #fff5f7) 0%, color-mix(in srgb, var(--shop-primary, #be185d) 4%, var(--shop-bg, #fff5f7)) 60%, #ffffff 100%)',
        minHeight: '100vh',
        color: 'var(--shop-ink, #3f0f24)',
      }}
    >
      {/* ── Editorial header ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          borderColor: 'var(--shop-border, #fbcfe8)',
          background:
            'radial-gradient(ellipse at 90% 0%, color-mix(in srgb, var(--shop-primary, #be185d) 10%, transparent) 0%, transparent 55%), color-mix(in srgb, var(--shop-primary, #be185d) 3%, var(--shop-bg, #fff5f7))',
        }}
      >
        <div className="pointer-events-none absolute right-8 top-6 opacity-30">
          <Sparkles
            className="h-14 w-14"
            style={{ color: 'var(--shop-primary, #be185d)' }}
            strokeWidth={1}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-7">
            <ol
              className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.28em]"
              style={{ color: 'var(--shop-ink-muted, #9d124c)' }}
            >
              <li>
                <Link href={shopHomeUrl} className="transition hover:opacity-70">
                  หน้าแรก
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3 w-3" />
              </li>
              <li
                aria-current="page"
                style={{ color: 'var(--shop-ink, #3f0f24)' }}
              >
                คอลเลกชัน
              </li>
            </ol>
          </nav>

          <p
            className="text-[11px] font-medium uppercase tracking-[0.32em]"
            style={{ color: 'var(--shop-accent, #fb7185)' }}
          >
            The Atelier — Spring Edit
          </p>
          <h1
            className="mt-3 font-[family:var(--font-kanit)] text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: 'var(--shop-ink, #3f0f24)' }}
          >
            คอลเลกชันคัดสรร <br className="hidden sm:block" />
            สำหรับสาวเอเชีย
          </h1>
          <p
            className="mt-5 max-w-2xl text-sm italic leading-relaxed sm:text-base"
            style={{
              color: 'var(--shop-ink-muted, #5b3a4a)',
              fontFamily: 'var(--font-prompt)',
            }}
          >
            &ldquo;จากบรรณาธิการของเรา — ทุกชิ้นถูกเลือกด้วยมือ เน้นทรง
            พอดี สวมใส่สบาย ตั้งแต่บ่ายวันธรรมดา ไปจนถึงค่ำคืนพิเศษ&rdquo;
          </p>

          <div
            className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t pt-5"
            style={{ borderColor: 'var(--shop-border, #fbcfe8)' }}
          >
            <span
              className="font-[family:var(--font-kanit)] text-3xl font-light tabular-nums"
              style={{ color: 'var(--shop-primary, #be185d)' }}
            >
              {filteredCount}
            </span>
            <span
              className="text-[11px] uppercase tracking-[0.28em]"
              style={{ color: 'var(--shop-ink-muted, #9d124c)' }}
            >
              ชิ้นในคอลเลกชันนี้
            </span>
          </div>
        </div>
      </section>

      {/* ── Sort bar (sticky-ish summary above the grid) ─────────── */}
      <div
        className="border-b"
        style={{
          borderColor: 'var(--shop-border, #fbcfe8)',
          background: 'color-mix(in srgb, var(--shop-bg, #fff5f7) 80%, white)',
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <span
            className="text-[11px] uppercase tracking-[0.28em]"
            style={{ color: 'var(--shop-ink-muted, #9d124c)' }}
          >
            แสดง {pageProducts.length} จาก {filteredCount}
          </span>

          <label className="inline-flex items-center gap-3 text-xs">
            <span
              className="uppercase tracking-[0.28em]"
              style={{ color: 'var(--shop-ink-muted, #9d124c)' }}
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
                className="font-[family:var(--font-kanit)] appearance-none rounded-full border bg-transparent py-2 pl-4 pr-9 text-xs font-light tracking-wider transition focus:outline-none"
                style={{
                  borderColor: 'var(--shop-border, #fbcfe8)',
                  color: 'var(--shop-ink, #3f0f24)',
                  background: 'var(--shop-bg-soft, #ffffff)',
                }}
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronRight
                className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 rotate-90"
                style={{ color: 'var(--shop-primary, #be185d)' }}
              />
            </div>
          </label>
        </div>
      </div>

      {/* ── Main body (sidebar + grid) ───────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
          {/* ── Sidebar filters ──────────────────────────────────── */}
          <aside className="space-y-10">
            {/* Collection (db categories) */}
            <div>
              <h2
                className="font-[family:var(--font-kanit)] text-[11px] font-medium uppercase tracking-[0.32em]"
                style={{ color: 'var(--shop-ink-muted, #9d124c)' }}
              >
                คอลเลกชัน
              </h2>
              <div
                className="mt-4 border-t pt-4"
                style={{ borderColor: 'var(--shop-border, #fbcfe8)' }}
              >
                <ul className="space-y-2.5">
                  <li>
                    <Link
                      href={buildUrl(undefined, 1)}
                      className="group flex items-baseline justify-between text-sm transition"
                      style={{
                        color: allActive
                          ? 'var(--shop-primary, #be185d)'
                          : 'var(--shop-ink, #3f0f24)',
                        fontWeight: allActive ? 500 : 300,
                      }}
                    >
                      <span className="font-[family:var(--font-kanit)] tracking-wide">
                        ทั้งหมด
                      </span>
                      <span
                        className="text-[10px] tabular-nums"
                        style={{
                          color: 'var(--shop-ink-muted, #9d124c)',
                          opacity: 0.7,
                        }}
                      >
                        {filteredCount}
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
                          className="group flex items-baseline justify-between gap-3 text-sm transition hover:opacity-80"
                          style={{
                            color: active
                              ? 'var(--shop-primary, #be185d)'
                              : 'var(--shop-ink, #3f0f24)',
                            fontWeight: active ? 500 : 300,
                          }}
                          aria-pressed={active}
                        >
                          <span className="font-[family:var(--font-kanit)] tracking-wide">
                            {active && (
                              <span
                                aria-hidden
                                className="mr-1.5 inline-block h-1 w-1 -translate-y-[2px] rounded-full"
                                style={{
                                  background: 'var(--shop-primary, #be185d)',
                                }}
                              />
                            )}
                            {cat}
                          </span>
                          <span
                            className="text-[10px] tabular-nums"
                            style={{
                              color: 'var(--shop-ink-muted, #9d124c)',
                              opacity: 0.7,
                            }}
                          >
                            {count}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Size rail */}
            <div>
              <h2
                className="font-[family:var(--font-kanit)] text-[11px] font-medium uppercase tracking-[0.32em]"
                style={{ color: 'var(--shop-ink-muted, #9d124c)' }}
              >
                ไซส์
              </h2>
              <div
                className="mt-4 flex flex-wrap gap-2 border-t pt-4"
                style={{ borderColor: 'var(--shop-border, #fbcfe8)' }}
              >
                {SIZE_RAIL.map((size) => {
                  const matched = sizeToCategory[size];
                  const active = matched != null && selectedCats.includes(matched);
                  const href = matched ? buildUrl(matched, 1) : buildUrl(undefined, 1);
                  return (
                    <Link
                      key={size}
                      href={href}
                      className="font-[family:var(--font-kanit)] inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs font-light tracking-wider transition hover:scale-[1.04]"
                      style={{
                        borderColor: active
                          ? 'var(--shop-primary, #be185d)'
                          : 'var(--shop-border, #fbcfe8)',
                        background: active
                          ? 'var(--shop-primary, #be185d)'
                          : 'transparent',
                        color: active ? '#ffffff' : 'var(--shop-ink, #3f0f24)',
                      }}
                      aria-pressed={active}
                      aria-label={`Size ${size}`}
                    >
                      {size}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Colour story */}
            <div>
              <h2
                className="font-[family:var(--font-kanit)] text-[11px] font-medium uppercase tracking-[0.32em]"
                style={{ color: 'var(--shop-ink-muted, #9d124c)' }}
              >
                โทนสี
              </h2>
              <div
                className="mt-4 grid grid-cols-3 gap-3 border-t pt-4"
                style={{ borderColor: 'var(--shop-border, #fbcfe8)' }}
              >
                {COLOUR_STORIES.map((story) => {
                  const matched = colourToCategory[story.key];
                  const active = matched != null && selectedCats.includes(matched);
                  const href = matched ? buildUrl(matched, 1) : buildUrl(undefined, 1);
                  return (
                    <Link
                      key={story.key}
                      href={href}
                      className="group flex flex-col items-center gap-1.5 transition hover:opacity-80"
                      aria-pressed={active}
                      aria-label={`Colour ${story.label}`}
                    >
                      <span
                        className="h-9 w-9 rounded-full border-[1.5px] transition group-hover:scale-105"
                        style={{
                          backgroundColor: story.swatch,
                          borderColor: active
                            ? 'var(--shop-primary, #be185d)'
                            : 'var(--shop-border, #fbcfe8)',
                          boxShadow: active
                            ? '0 0 0 2px var(--shop-bg, #fff5f7), 0 0 0 3.5px var(--shop-primary, #be185d)'
                            : 'inset 0 -2px 4px rgba(0,0,0,0.08)',
                        }}
                        aria-hidden
                      />
                      <span
                        className="font-[family:var(--font-kanit)] text-[10px] font-light tracking-wide"
                        style={{
                          color: active
                            ? 'var(--shop-primary, #be185d)'
                            : 'var(--shop-ink-muted, #9d124c)',
                        }}
                      >
                        {story.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Curator's whisper */}
            <div
              className="border-l-2 pl-4"
              style={{ borderColor: 'var(--shop-accent, #fb7185)' }}
            >
              <p
                className="text-[11px] italic leading-relaxed"
                style={{ color: 'var(--shop-ink-muted, #9d124c)' }}
              >
                &ldquo;เพราะเสื้อผ้าที่ดี ไม่ใช่แค่สวย — แต่ต้องใส่แล้วเป็นตัวเอง&rdquo;
              </p>
              <p
                className="mt-2 text-[10px] uppercase tracking-[0.28em]"
                style={{ color: 'var(--shop-accent, #fb7185)' }}
              >
                — ทีมสไตลิสต์ {store.name}
              </p>
            </div>
          </aside>

          {/* ── Product grid ─────────────────────────────────────── */}
          <main>
            {pageProducts.length === 0 ? (
              <EmptyState resetHref={buildUrl(undefined, 1)} />
            ) : (
              <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-7 sm:gap-y-14 md:grid-cols-3">
                {pageProducts.map((product, idx) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      storeSlug={store.slug}
                      eager={idx < 3}
                    />
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="mt-16 flex items-center justify-center gap-3 border-t pt-8"
                style={{ borderColor: 'var(--shop-border, #fbcfe8)' }}
                aria-label="Pagination"
              >
                <PagerLink
                  href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  ariaLabel="หน้าก่อนหน้า"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">ก่อนหน้า</span>
                </PagerLink>

                <span
                  className="font-[family:var(--font-kanit)] inline-flex h-10 min-w-[6rem] items-center justify-center px-4 text-xs font-light tracking-[0.18em]"
                  style={{
                    color: 'var(--shop-ink, #3f0f24)',
                    borderTop: '1px solid var(--shop-primary, #be185d)',
                    borderBottom: '1px solid var(--shop-primary, #be185d)',
                  }}
                >
                  หน้า {currentPage} / {totalPages}
                </span>

                <PagerLink
                  href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  ariaLabel="หน้าถัดไป"
                >
                  <span className="hidden sm:inline">ถัดไป</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </PagerLink>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ───────────────────────────────────────────────────

interface ProductCardProps {
  product: TemplateProductCard;
  storeSlug: string;
  eager?: boolean;
}

function ProductCard({ product, storeSlug, eager }: ProductCardProps) {
  const onSale =
    product.compareAtPriceTHB != null &&
    product.compareAtPriceTHB > product.priceTHB;
  const discount = onSale
    ? Math.round((1 - product.priceTHB / product.compareAtPriceTHB!) * 100)
    : null;

  return (
    <Link
      href={`/stores/${storeSlug}/products/${product.id}`}
      className="group block"
    >
      {/* Portrait frame — 4:5, soft cream backdrop, hover lift */}
      <div
        className="relative overflow-hidden transition duration-500 group-hover:-translate-y-1"
        style={{
          aspectRatio: '4 / 5',
          background:
            'color-mix(in srgb, var(--shop-primary, #be185d) 5%, var(--shop-bg-soft, #ffffff))',
          border: '1px solid var(--shop-border, #fbcfe8)',
        }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            loading={eager ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <PortraitPlaceholder />
        )}

        {onSale && discount != null && (
          <span
            className="font-[family:var(--font-kanit)] absolute left-4 top-4 inline-flex items-center px-2.5 py-1 text-[10px] font-light uppercase tracking-[0.18em]"
            style={{
              background: 'var(--shop-bg-soft, #ffffff)',
              color: 'var(--shop-primary, #be185d)',
              border: '1px solid var(--shop-primary, #be185d)',
            }}
          >
            −{discount}%
          </span>
        )}

        {/* Quiet "view" hint that fades in on hover */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        >
          <span
            className="font-[family:var(--font-kanit)] inline-flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-light uppercase tracking-[0.28em] backdrop-blur-sm"
            style={{
              background: 'color-mix(in srgb, var(--shop-bg-soft, #ffffff) 88%, transparent)',
              color: 'var(--shop-ink, #3f0f24)',
              border: '1px solid var(--shop-border, #fbcfe8)',
            }}
          >
            ดูรายละเอียด
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Card body — minimal, centered, editorial */}
      <div className="mt-5 text-center">
        {product.categoryName && (
          <p
            className="text-[10px] uppercase tracking-[0.32em]"
            style={{ color: 'var(--shop-accent, #fb7185)' }}
          >
            {product.categoryName}
          </p>
        )}
        <h3
          className="font-[family:var(--font-kanit)] mt-1.5 line-clamp-2 text-sm font-light leading-snug transition group-hover:opacity-70"
          style={{ color: 'var(--shop-ink, #3f0f24)' }}
        >
          {product.title}
        </h3>
        <div className="mt-2.5 flex items-baseline justify-center gap-2">
          <span
            className="font-[family:var(--font-kanit)] text-sm font-normal tabular-nums tracking-wide"
            style={{ color: 'var(--shop-primary, #be185d)' }}
          >
            {formatTHB(product.priceTHB)}
          </span>
          {onSale && (
            <span
              className="text-[11px] tabular-nums line-through"
              style={{
                color: 'var(--shop-ink-muted, #9d124c)',
                opacity: 0.6,
              }}
            >
              {formatTHB(product.compareAtPriceTHB!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Empty-grid placeholder. Boutique tone — light, polite, never "404".
 */
function EmptyState({ resetHref }: { resetHref: string }) {
  return (
    <div
      className="flex flex-col items-center px-6 py-20 text-center"
      style={{
        border: '1px solid var(--shop-border, #fbcfe8)',
        background:
          'color-mix(in srgb, var(--shop-primary, #be185d) 3%, var(--shop-bg-soft, #ffffff))',
      }}
    >
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          background:
            'color-mix(in srgb, var(--shop-primary, #be185d) 10%, transparent)',
        }}
      >
        <Sparkles
          className="h-7 w-7"
          style={{ color: 'var(--shop-primary, #be185d)' }}
          strokeWidth={1.2}
        />
      </div>
      <p
        className="font-[family:var(--font-kanit)] text-xl font-light"
        style={{ color: 'var(--shop-ink, #3f0f24)' }}
      >
        ยังไม่มีชิ้นที่ตรงกับตัวกรองนี้
      </p>
      <p
        className="mt-2 max-w-md text-sm italic leading-relaxed"
        style={{ color: 'var(--shop-ink-muted, #9d124c)' }}
      >
        &ldquo;ลองเปลี่ยนโทนสี หรือลบตัวกรองเพื่อสำรวจคอลเลกชันทั้งหมด —
        เรากำลังเพิ่มชิ้นใหม่ทุกสัปดาห์&rdquo;
      </p>
      <Link
        href={resetHref}
        className="font-[family:var(--font-kanit)] mt-7 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-light uppercase tracking-[0.28em] transition hover:scale-[1.03]"
        style={{
          background: 'var(--shop-primary, #be185d)',
          color: '#ffffff',
        }}
      >
        สำรวจคอลเลกชันทั้งหมด
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

interface PagerLinkProps {
  href: string;
  disabled?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}

function PagerLink({ href, disabled, ariaLabel, children }: PagerLinkProps) {
  if (disabled) {
    return (
      <span
        className="font-[family:var(--font-kanit)] inline-flex h-10 items-center gap-1.5 px-4 text-xs font-light uppercase tracking-[0.22em]"
        style={{ color: 'var(--shop-ink-muted, #9d124c)', opacity: 0.35 }}
        aria-disabled
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="font-[family:var(--font-kanit)] inline-flex h-10 items-center gap-1.5 px-4 text-xs font-light uppercase tracking-[0.22em] transition hover:opacity-70"
      style={{ color: 'var(--shop-ink, #3f0f24)' }}
    >
      {children}
    </Link>
  );
}

/**
 * Couture-sketch fallback used when a product has no imageUrl. Keeps
 * the portrait frame from collapsing and reads as a boutique touch.
 */
function PortraitPlaceholder() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      <svg viewBox="0 0 120 160" width="42%" fill="none">
        <path
          d="M60 16 Q44 24 44 40 Q44 54 60 58 Q76 54 76 40 Q76 24 60 16Z"
          stroke="var(--shop-primary, #be185d)"
          strokeWidth={1.5}
          opacity={0.55}
        />
        <path
          d="M30 156 L36 80 Q60 66 84 80 L90 156 Z"
          stroke="var(--shop-primary, #be185d)"
          strokeWidth={1.5}
          opacity={0.55}
        />
        <path
          d="M42 100 Q60 94 78 100"
          stroke="var(--shop-accent, #fb7185)"
          strokeWidth={1}
          strokeDasharray="3 4"
          opacity={0.7}
        />
      </svg>
    </div>
  );
}

export const CatalogPage = SirinWomenswearCatalog;
