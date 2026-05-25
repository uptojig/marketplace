'use client';

/**
 * carbon-era-cameras — bespoke Catalog page
 *
 * Vintage-camera spec-sheet aesthetic: monochrome palette + single accent,
 * technical-drawing borders, 3-col grid where each card is rendered as a
 * spec-sheet (CEC-XXXXXX code, grade chip, technical metadata, price block).
 *
 * Theme tokens: var(--shop-bg) / --shop-ink / --shop-ink-muted /
 *               --shop-card / --shop-border / --shop-accent.
 * Fonts: Prompt (body) + Kanit (display) only — per project font rule
 * we DO NOT load a monospace family; the "spec-sheet" feel is achieved
 * with uppercase + tracking-widest + Prompt at small sizes.
 */

import React from 'react';
import Link from 'next/link';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Aperture,
  Award,
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
  store: { id: string; slug: string; name: string; logoUrl?: string | null };
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
  { value: 'name-asc', label: 'ชื่อ A–Z' },
];

// Static "format" chips — these are display-only quick filters that match
// common vintage-camera shorthand. They proxy onto categoryNames if a
// category with the same label exists; otherwise they render as inert hints.
const FORMAT_CHIPS = ['35mm', '120 / Medium Format', 'Digital', 'Instant', 'Cine'];
const ERA_CHIPS = ['1950s', '1960s', '1970s', '1980s', '1990s'];

const GRADES = ['A+', 'A', 'A-', 'B+'] as const;
type Grade = (typeof GRADES)[number];

/** Deterministic 6-char hex code derived from product id (no randomness on rerender). */
function specCode(productId: string): string {
  let h = 0;
  for (let i = 0; i < productId.length; i++) {
    h = (h * 31 + productId.charCodeAt(i)) >>> 0;
  }
  const hex = h.toString(16).toUpperCase().padStart(6, '0').slice(-6);
  return `CEC-${hex}`;
}

/** Deterministic grade A+/A/A-/B+ derived from product id. */
function specGrade(productId: string): Grade {
  let h = 0;
  for (let i = 0; i < productId.length; i++) {
    h = (h * 17 + productId.charCodeAt(i)) >>> 0;
  }
  return GRADES[h % GRADES.length];
}

function gradeStyles(grade: Grade): { bg: string; ink: string } {
  // Monochrome — accent only on the best grade.
  switch (grade) {
    case 'A+':
      return { bg: 'var(--shop-accent)', ink: 'var(--shop-bg)' };
    case 'A':
      return { bg: 'var(--shop-ink)', ink: 'var(--shop-bg)' };
    case 'A-':
      return { bg: 'var(--shop-card)', ink: 'var(--shop-ink)' };
    case 'B+':
    default:
      return { bg: 'var(--shop-muted, var(--shop-card))', ink: 'var(--shop-ink-muted)' };
  }
}

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
  // Treat any pre-defined chip whose label happens to match a real category
  // as a *live* filter; otherwise render it as a passive spec hint.
  const liveCategorySet = new Set(categoryNames);
  const liveFormats = FORMAT_CHIPS.filter((c) => liveCategorySet.has(c));
  const liveEras = ERA_CHIPS.filter((c) => liveCategorySet.has(c));
  const passiveFormats = FORMAT_CHIPS.filter((c) => !liveCategorySet.has(c));
  const passiveEras = ERA_CHIPS.filter((c) => !liveCategorySet.has(c));

  const pageStart = (currentPage - 1) * pageProducts.length + (pageProducts.length ? 1 : 0);
  const pageEnd = (currentPage - 1) * pageProducts.length + pageProducts.length;

  return (
    <div
      className="min-h-screen font-[family:var(--font-prompt)]"
      style={{
        background: 'var(--shop-bg, #fafafa)',
        color: 'var(--shop-ink, #0a0a0a)',
      }}
    >
      {/* ───────── Top spec-sheet header ───────── */}
      <section
        className="border-b"
        style={{ borderColor: 'var(--shop-border, #27272a)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Document-style meta strip */}
          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.25em] mb-8"
            style={{ color: 'var(--shop-ink-muted, #52525b)' }}
          >
            <span className="inline-flex items-center gap-2">
              <Aperture className="w-3 h-3" aria-hidden />
              Document / Catalog
            </span>
            <span aria-hidden>·</span>
            <span>Rev. 02 / {new Date().getFullYear()}</span>
            <span aria-hidden>·</span>
            <span>{store.name}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] items-end">
            <div>
              <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.95]">
                สเปคชีท · กล้องคัดเกรด
              </h1>
              <p
                className="mt-4 text-base sm:text-lg font-light max-w-xl"
                style={{ color: 'var(--shop-ink-muted, #52525b)' }}
              >
                บัญชีกล้องวินเทจที่ผ่านการตรวจสภาพ 24 จุด พร้อมรหัส CEC, เกรดสภาพ
                และราคาคงที่ทุกชิ้น
              </p>
            </div>

            {/* Result counter — looks like a serial-number plate */}
            <div
              className="inline-flex flex-col items-start sm:items-end px-4 py-3 border"
              style={{
                borderColor: 'var(--shop-border, #27272a)',
                background: 'var(--shop-card, #ffffff)',
              }}
            >
              <span
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: 'var(--shop-ink-muted, #52525b)' }}
              >
                Total Records
              </span>
              <span className="font-[family:var(--font-kanit)] text-3xl font-black tabular-nums leading-none mt-1">
                {filteredCount.toString().padStart(3, '0')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Filter chips rail ───────── */}
      <section
        className="border-b"
        style={{
          borderColor: 'var(--shop-border, #27272a)',
          background: 'var(--shop-card, #ffffff)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Format row */}
          <ChipRow
            label="Format"
            liveChips={liveFormats}
            passiveChips={passiveFormats}
            selectedCats={selectedCats}
            categoryCounts={categoryCounts}
            buildUrl={buildUrl}
          />
          {/* Brand row (from real category names that aren't formats/eras) */}
          <ChipRow
            label="Brand / Category"
            liveChips={categoryNames.filter(
              (c) => !FORMAT_CHIPS.includes(c) && !ERA_CHIPS.includes(c),
            )}
            passiveChips={[]}
            selectedCats={selectedCats}
            categoryCounts={categoryCounts}
            buildUrl={buildUrl}
            allHref={buildUrl(undefined, 1)}
            showAllChip
          />
          {/* Era row */}
          <ChipRow
            label="Era"
            liveChips={liveEras}
            passiveChips={passiveEras}
            selectedCats={selectedCats}
            categoryCounts={categoryCounts}
            buildUrl={buildUrl}
          />

          {/* Active filter summary */}
          {selectedCats.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-2 pt-3 border-t"
              style={{ borderColor: 'var(--shop-border, #27272a)' }}
            >
              <span
                className="text-[10px] uppercase tracking-[0.3em] mr-1"
                style={{ color: 'var(--shop-ink-muted, #52525b)' }}
              >
                Active filters
              </span>
              {selectedCats.map((cat) => (
                <Link
                  key={cat}
                  href={buildUrl(cat, 1)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 border text-[11px] uppercase tracking-widest hover:opacity-70 transition-opacity"
                  style={{
                    borderColor: 'var(--shop-ink, #0a0a0a)',
                    background: 'var(--shop-ink, #0a0a0a)',
                    color: 'var(--shop-bg, #fafafa)',
                  }}
                >
                  {cat}
                  <X className="w-3 h-3" aria-hidden />
                </Link>
              ))}
              <Link
                href={buildUrl(undefined, 1)}
                className="text-[10px] uppercase tracking-[0.3em] underline underline-offset-4 ml-2 hover:opacity-70"
                style={{ color: 'var(--shop-ink-muted, #52525b)' }}
              >
                ล้างทั้งหมด
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ───────── Toolbar — sort + range ───────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em]"
            style={{ color: 'var(--shop-ink-muted, #52525b)' }}
          >
            <Filter className="w-3.5 h-3.5" aria-hidden />
            <span>
              Showing{' '}
              <span style={{ color: 'var(--shop-ink, #0a0a0a)' }} className="tabular-nums">
                {pageStart}–{pageEnd}
              </span>{' '}
              of{' '}
              <span style={{ color: 'var(--shop-ink, #0a0a0a)' }} className="tabular-nums">
                {filteredCount}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="text-[11px] uppercase tracking-[0.3em] mr-2"
              style={{ color: 'var(--shop-ink-muted, #52525b)' }}
            >
              Sort
            </span>
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={buildSortUrl(opt.value)}
                  className="px-3 py-1.5 border text-[10px] uppercase tracking-widest transition-colors"
                  style={
                    active
                      ? {
                          borderColor: 'var(--shop-ink, #0a0a0a)',
                          background: 'var(--shop-ink, #0a0a0a)',
                          color: 'var(--shop-bg, #fafafa)',
                        }
                      : {
                          borderColor: 'var(--shop-border, #27272a)',
                          background: 'transparent',
                          color: 'var(--shop-ink, #0a0a0a)',
                        }
                  }
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── Grid / Empty state ───────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {pageProducts.length === 0 ? (
          <EmptyState clearHref={buildUrl(undefined, 1)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{
              // Hairline grid background to give the technical-drawing feel
              background: 'var(--shop-border, #27272a)',
              border: '1px solid var(--shop-border, #27272a)',
            }}
          >
            {pageProducts.map((product) => (
              <SpecCard key={product.id} product={product} storeSlug={store.slug} />
            ))}
            {/* Fill grid to keep the hairline borders aligned on incomplete rows */}
            {Array.from({ length: (3 - (pageProducts.length % 3)) % 3 }).map((_, i) => (
              <div
                key={`filler-${i}`}
                className="hidden lg:block"
                style={{ background: 'var(--shop-bg, #fafafa)' }}
                aria-hidden
              />
            ))}
          </div>
        )}

        {/* ───────── Pagination ───────── */}
        {totalPages > 1 && (
          <nav
            className="flex items-center justify-center gap-2 mt-12"
            aria-label="Catalog pagination"
          >
            <PageLink
              href={buildUrl(undefined, Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              ariaLabel="หน้าก่อน"
            >
              <ChevronLeft className="w-4 h-4" />
            </PageLink>

            <div
              className="px-5 py-2 border text-[11px] uppercase tracking-[0.3em] tabular-nums"
              style={{
                borderColor: 'var(--shop-ink, #0a0a0a)',
                background: 'var(--shop-ink, #0a0a0a)',
                color: 'var(--shop-bg, #fafafa)',
              }}
            >
              Page {currentPage} / {totalPages}
            </div>

            <PageLink
              href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              ariaLabel="หน้าถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </PageLink>
          </nav>
        )}
      </section>
    </div>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

interface ChipRowProps {
  label: string;
  liveChips: string[];
  passiveChips: string[];
  selectedCats: string[];
  categoryCounts: Record<string, number>;
  buildUrl: (toggleCat?: string, page?: number) => string;
  allHref?: string;
  showAllChip?: boolean;
}

function ChipRow({
  label,
  liveChips,
  passiveChips,
  selectedCats,
  categoryCounts,
  buildUrl,
  allHref,
  showAllChip,
}: ChipRowProps) {
  if (liveChips.length === 0 && passiveChips.length === 0 && !showAllChip) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
      <span
        className="text-[10px] uppercase tracking-[0.3em] pt-1.5 sm:w-32 shrink-0"
        style={{ color: 'var(--shop-ink-muted, #52525b)' }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {showAllChip && allHref && (
          <Link
            href={allHref}
            className="px-2.5 py-1 border text-[10px] uppercase tracking-widest transition-colors"
            style={
              selectedCats.length === 0
                ? {
                    borderColor: 'var(--shop-ink, #0a0a0a)',
                    background: 'var(--shop-ink, #0a0a0a)',
                    color: 'var(--shop-bg, #fafafa)',
                  }
                : {
                    borderColor: 'var(--shop-border, #27272a)',
                    background: 'transparent',
                    color: 'var(--shop-ink, #0a0a0a)',
                  }
            }
          >
            ทั้งหมด
          </Link>
        )}
        {liveChips.map((chip) => {
          const active = selectedCats.includes(chip);
          const count = categoryCounts[chip];
          return (
            <Link
              key={chip}
              href={buildUrl(chip, 1)}
              className="inline-flex items-center gap-2 px-2.5 py-1 border text-[10px] uppercase tracking-widest transition-colors"
              style={
                active
                  ? {
                      borderColor: 'var(--shop-ink, #0a0a0a)',
                      background: 'var(--shop-ink, #0a0a0a)',
                      color: 'var(--shop-bg, #fafafa)',
                    }
                  : {
                      borderColor: 'var(--shop-border, #27272a)',
                      background: 'transparent',
                      color: 'var(--shop-ink, #0a0a0a)',
                    }
              }
            >
              <span>{chip}</span>
              {typeof count === 'number' && (
                <span
                  className="tabular-nums opacity-70"
                  style={{ fontSize: '0.85em' }}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
        {passiveChips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center px-2.5 py-1 border border-dashed text-[10px] uppercase tracking-widest opacity-50 cursor-not-allowed"
            style={{
              borderColor: 'var(--shop-border, #27272a)',
              color: 'var(--shop-ink-muted, #52525b)',
              background: 'transparent',
            }}
            aria-disabled="true"
            title="ยังไม่มีสินค้าในหมวดนี้"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

interface SpecCardProps {
  product: ProductCard;
  storeSlug: string;
}

function SpecCard({ product, storeSlug }: SpecCardProps) {
  const code = specCode(product.id);
  const grade = specGrade(product.id);
  const gs = gradeStyles(grade);
  const hasDiscount =
    !!product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;

  return (
    <Link
      href={`/stores/${storeSlug}/products/${product.id}`}
      className="group flex flex-col transition-colors"
      style={{ background: 'var(--shop-card, #ffffff)' }}
    >
      {/* Spec header strip */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{
          borderColor: 'var(--shop-border, #27272a)',
          background: 'var(--shop-card, #ffffff)',
        }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.25em] tabular-nums"
          style={{ color: 'var(--shop-ink-muted, #52525b)' }}
        >
          {code}
        </span>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border"
          style={{
            background: gs.bg,
            color: gs.ink,
            borderColor: 'var(--shop-ink, #0a0a0a)',
          }}
        >
          <Award className="w-2.5 h-2.5" aria-hidden />
          Grade {grade}
        </span>
      </div>

      {/* Image */}
      <div
        className="relative aspect-[4/3] overflow-hidden border-b"
        style={{
          borderColor: 'var(--shop-border, #27272a)',
          background: 'var(--shop-muted, #f4f4f5)',
        }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ease-out"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera
              className="w-12 h-12 opacity-20"
              style={{ color: 'var(--shop-ink-muted, #52525b)' }}
              aria-hidden
            />
          </div>
        )}
        {/* Technical corner marks */}
        <CornerMarks />
      </div>

      {/* Body — spec rows */}
      <div className="px-4 py-4 flex-1 flex flex-col gap-3">
        {product.categoryName && (
          <span
            className="text-[10px] uppercase tracking-[0.3em]"
            style={{ color: 'var(--shop-ink-muted, #52525b)' }}
          >
            {product.categoryName}
          </span>
        )}
        <h3 className="font-[family:var(--font-kanit)] text-base sm:text-lg font-bold uppercase tracking-tight leading-snug line-clamp-2">
          {product.title}
        </h3>

        {/* Spec key/value rows */}
        <dl
          className="mt-1 grid grid-cols-2 gap-y-1.5 gap-x-3 text-[11px] border-t pt-3"
          style={{ borderColor: 'var(--shop-border, #27272a)' }}
        >
          <dt
            className="uppercase tracking-widest"
            style={{ color: 'var(--shop-ink-muted, #52525b)' }}
          >
            Ref.
          </dt>
          <dd
            className="text-right tabular-nums"
            style={{ color: 'var(--shop-ink, #0a0a0a)' }}
          >
            {code.slice(4)}
          </dd>
          <dt
            className="uppercase tracking-widest"
            style={{ color: 'var(--shop-ink-muted, #52525b)' }}
          >
            Cond.
          </dt>
          <dd
            className="text-right uppercase tracking-widest font-semibold"
            style={{ color: 'var(--shop-ink, #0a0a0a)' }}
          >
            {grade}
          </dd>
        </dl>

        {/* Price block */}
        <div
          className="mt-auto pt-3 border-t flex items-baseline justify-between"
          style={{ borderColor: 'var(--shop-border, #27272a)' }}
        >
          <div className="flex items-baseline gap-2">
            <span className="font-[family:var(--font-kanit)] text-xl font-black tabular-nums">
              {formatTHB(product.priceTHB)}
            </span>
            {hasDiscount && (
              <span
                className="text-xs line-through tabular-nums"
                style={{ color: 'var(--shop-ink-muted, #52525b)' }}
              >
                {formatTHB(product.compareAtPriceTHB!)}
              </span>
            )}
          </div>
          <span
            className="text-[10px] uppercase tracking-[0.25em] group-hover:underline underline-offset-4"
            style={{ color: 'var(--shop-ink, #0a0a0a)' }}
          >
            ดูสเปค →
          </span>
        </div>
      </div>
    </Link>
  );
}

function CornerMarks() {
  // Four L-shaped technical-drawing crop marks.
  const stroke = 'var(--shop-ink, #0a0a0a)';
  const common = 'absolute w-3 h-3 pointer-events-none opacity-70';
  return (
    <>
      <span
        className={`${common} top-2 left-2 border-l border-t`}
        style={{ borderColor: stroke }}
        aria-hidden
      />
      <span
        className={`${common} top-2 right-2 border-r border-t`}
        style={{ borderColor: stroke }}
        aria-hidden
      />
      <span
        className={`${common} bottom-2 left-2 border-l border-b`}
        style={{ borderColor: stroke }}
        aria-hidden
      />
      <span
        className={`${common} bottom-2 right-2 border-r border-b`}
        style={{ borderColor: stroke }}
        aria-hidden
      />
    </>
  );
}

interface PageLinkProps {
  href: string;
  disabled: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}

function PageLink({ href, disabled, ariaLabel, children }: PageLinkProps) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={ariaLabel}
        className="inline-flex items-center justify-center w-10 h-10 border opacity-40 cursor-not-allowed"
        style={{
          borderColor: 'var(--shop-border, #27272a)',
          color: 'var(--shop-ink-muted, #52525b)',
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
      className="inline-flex items-center justify-center w-10 h-10 border transition-colors hover:bg-[var(--shop-ink,#0a0a0a)] hover:text-[var(--shop-bg,#fafafa)]"
      style={{
        borderColor: 'var(--shop-border, #27272a)',
        color: 'var(--shop-ink, #0a0a0a)',
      }}
    >
      {children}
    </Link>
  );
}

function EmptyState({ clearHref }: { clearHref: string }) {
  return (
    <div
      className="text-center py-20 px-6 border"
      style={{
        borderColor: 'var(--shop-border, #27272a)',
        background: 'var(--shop-card, #ffffff)',
      }}
    >
      <Camera
        className="w-12 h-12 mx-auto mb-6 opacity-30"
        style={{ color: 'var(--shop-ink-muted, #52525b)' }}
        aria-hidden
      />
      <p className="font-[family:var(--font-kanit)] text-2xl font-black uppercase tracking-tight">
        ไม่พบรายการในสเปคชีท
      </p>
      <p
        className="text-sm mt-3 max-w-md mx-auto"
        style={{ color: 'var(--shop-ink-muted, #52525b)' }}
      >
        ลองล้างตัวกรองหรือเลือกฟอร์แมตอื่น เช่น 35mm หรือ Medium Format
      </p>
      <Link
        href={clearHref}
        className="inline-flex items-center gap-2 mt-8 px-6 py-3 border text-xs uppercase tracking-[0.3em] font-semibold transition-colors hover:opacity-80"
        style={{
          borderColor: 'var(--shop-ink, #0a0a0a)',
          background: 'var(--shop-ink, #0a0a0a)',
          color: 'var(--shop-bg, #fafafa)',
        }}
      >
        ล้างตัวกรอง
      </Link>
    </div>
  );
}
