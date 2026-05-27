'use client';

/**
 * EduClassroom — bespoke Catalog page.
 *
 * Adapts the layout vocabulary of shadcn-studio's `product-category-08`
 * (top-of-page heading + CTA, then a 4-up product grid with hover-tilt
 * cards) into the classroom-blue / chalk-amber visual language used on
 * the Homepage. Notebook ruled-paper backdrop, chalk-yellow stamps,
 * keyword-matched subject icons, and a chip rail that mirrors the
 * Homepage filter chips so the two pages feel like one continuous
 * notebook.
 *
 * Reads `CatalogProps` directly — no shared catalog-adapter helper
 * sits between this component and the page dispatcher. Add-to-cart
 * talks to the zustand cart store the same way the Homepage does.
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  Sparkles,
  FileText,
  Presentation,
  ClipboardList,
  GraduationCap,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';
import type { CatalogProps, TemplateProductCard } from '@/lib/templates/types';

import {
  EDU_PRIMARY,
  EDU_PRIMARY_DEEP,
  EDU_ACCENT,
  EDU_ACCENT_DEEP,
  EDU_SAVINGS,
  EDU_BG,
  EDU_BG_SOFT,
  EDU_BORDER,
  EDU_BORDER_SOFT,
  EDU_INK,
  EDU_INK_MUTED,
} from '../palette';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'เรียงตามลำดับ' },
  { value: 'low-to-high', label: 'ราคา: ต่ำ → สูง' },
  { value: 'high-to-low', label: 'ราคา: สูง → ต่ำ' },
];

// Subject icon mapping — same logic as the Homepage so chips and tiles
// feel consistent across routes.
function subjectIcon(label: string): LucideIcon {
  const k = label.toLowerCase();
  if (k.includes('ใบงาน') || k.includes('แบบฝึก')) return FileText;
  if (k.includes('สไลด์') || k.includes('การสอน')) return Presentation;
  if (k.includes('ข้อสอบ') || k.includes('แบบทดสอบ')) return ClipboardList;
  if (k.includes('เกม') || k.includes('กิจกรรม')) return Sparkles;
  return BookOpen;
}

export default function EduClassroomCatalog(props: CatalogProps) {
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

  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const handleAddToCart = (p: TemplateProductCard, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: p.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: p.title,
      priceTHB: p.priceTHB,
      imageUrl: p.imageUrl ?? undefined,
    });
    showConfirm(p.title, store.slug);
  };

  const activeCat = selectedCats[0];
  const totalAcross = Object.values(categoryCounts).reduce((s, n) => s + n, 0);
  const headerTitle = activeCat ?? 'สื่อการสอนทั้งหมด';
  const HeaderIcon = activeCat ? subjectIcon(activeCat) : BookOpen;

  return (
    <main className={`${FONT_BODY} min-h-screen`} style={{ background: EDU_BG, color: EDU_INK }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Breadcrumb / back */}
        <Link
          href={`/stores/${store.slug}`}
          className={`inline-flex items-center gap-1.5 text-xs ${FONT_HEADING} font-bold transition-colors`}
          style={{ color: EDU_INK_MUTED }}
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          กลับหน้าร้าน
        </Link>

        {/* Category header — notebook page header */}
        <header
          className="relative bg-white border rounded-2xl shadow-sm p-5 sm:p-7 overflow-hidden"
          style={{ borderColor: EDU_BORDER }}
        >
          <span
            aria-hidden
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: `linear-gradient(90deg, ${EDU_PRIMARY}, ${EDU_ACCENT})` }}
          />
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}
                  style={{ background: EDU_BG_SOFT, color: EDU_ACCENT_DEEP }}
                >
                  <GraduationCap size={11} />
                  หมวดสื่อการสอน
                </span>
                {activeCat && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white`}
                    style={{ background: EDU_PRIMARY }}
                  >
                    เลือกอยู่ · {activeCat}
                  </span>
                )}
              </div>

              <h1
                className={`${FONT_HEADING} font-black text-3xl sm:text-4xl leading-tight flex items-center gap-3`}
                style={{ color: EDU_INK }}
              >
                <span
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl"
                  style={{ background: `${EDU_PRIMARY}14`, color: EDU_PRIMARY }}
                >
                  <HeaderIcon size={22} strokeWidth={2.2} />
                </span>
                {headerTitle}
              </h1>
              <p className="text-sm font-medium" style={{ color: EDU_INK_MUTED }}>
                {(activeCat ? (categoryCounts[activeCat] ?? filteredCount) : totalAcross).toLocaleString()} รายการ · ดาวน์โหลดได้ทันที
              </p>
            </div>

            {/* Sort select — pill */}
            <label
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border self-start sm:self-end"
              style={{ background: EDU_BG_SOFT, borderColor: `${EDU_ACCENT}40` }}
            >
              <span
                className={`text-[10px] ${FONT_HEADING} font-bold uppercase tracking-wider`}
                style={{ color: EDU_ACCENT_DEEP }}
              >
                เรียง
              </span>
              <select
                value={sortKey}
                onChange={(e) => {
                  window.location.href = buildSortUrl(e.target.value);
                }}
                className={`bg-transparent text-xs ${FONT_BODY} font-bold focus:outline-none cursor-pointer`}
                style={{ color: EDU_INK }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {/* Category chip rail */}
        {categoryNames.length > 0 && (
          <nav aria-label="หมวดสื่อการสอน" className="flex flex-wrap gap-2">
            <Link
              href={buildUrl()}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${FONT_HEADING} font-bold border-2 transition-all`}
              style={
                selectedCats.length === 0
                  ? { background: EDU_PRIMARY, color: '#FFFFFF', borderColor: EDU_PRIMARY }
                  : { background: '#FFFFFF', color: EDU_INK, borderColor: EDU_BORDER }
              }
            >
              <BookOpen size={12} />
              ทั้งหมด ({totalAcross.toLocaleString()})
            </Link>
            {categoryNames.map((c) => {
              const isActive = selectedCats.includes(c);
              const Icon = subjectIcon(c);
              return (
                <Link
                  key={c}
                  href={buildUrl(c)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${FONT_HEADING} font-bold border-2 transition-all`}
                  style={
                    isActive
                      ? { background: EDU_PRIMARY, color: '#FFFFFF', borderColor: EDU_PRIMARY }
                      : { background: '#FFFFFF', color: EDU_INK, borderColor: EDU_BORDER }
                  }
                >
                  <Icon size={12} />
                  {c} ({(categoryCounts[c] ?? 0).toLocaleString()})
                </Link>
              );
            })}
          </nav>
        )}

        {/* Product grid */}
        {pageProducts.length === 0 ? (
          <div
            className="bg-white border-2 border-dashed rounded-2xl py-16 text-center"
            style={{ borderColor: EDU_BORDER }}
          >
            <BookOpen
              size={36}
              className="mx-auto mb-3"
              style={{ color: EDU_INK_MUTED }}
            />
            <p
              className={`text-base ${FONT_HEADING} font-bold`}
              style={{ color: EDU_INK }}
            >
              ยังไม่มีสื่อในหมวดนี้
            </p>
            <p className="mt-1 text-xs font-medium" style={{ color: EDU_INK_MUTED }}>
              ลองดูหมวดอื่นๆ ที่ด้านบนได้เลย
            </p>
          </div>
        ) : (
          <>
            {/* Sub-promo strip — "ดาวประจำสัปดาห์" */}
            <div
              className="bg-white border rounded-xl p-3 sm:p-4 flex items-center justify-between"
              style={{ borderColor: EDU_BORDER }}
            >
              <span
                className={`${FONT_HEADING} font-bold text-sm flex items-center gap-1.5`}
                style={{ color: EDU_INK }}
              >
                <Star size={14} fill={EDU_ACCENT} stroke="none" />
                <span>รายการสื่อการสอน</span>
              </span>
              <span
                className={`text-xs ${FONT_HEADING} font-bold px-3 py-1 rounded-full`}
                style={{ background: EDU_BG_SOFT, color: EDU_ACCENT_DEEP }}
              >
                หน้า {currentPage}/{Math.max(1, totalPages)} · {filteredCount.toLocaleString()} รายการ
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {pageProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  storeSlug={store.slug}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="แบ่งหน้ารายการสื่อ"
                className="flex flex-wrap items-center justify-center gap-2 pt-2"
              >
                <Link
                  href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                  aria-disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-full bg-white border-2 text-xs ${FONT_HEADING} font-bold transition-all ${
                    currentPage === 1 ? 'opacity-40 pointer-events-none' : 'hover:shadow-md'
                  }`}
                  style={{ color: EDU_PRIMARY, borderColor: EDU_PRIMARY }}
                >
                  <ArrowLeft size={12} className="inline mr-1 -mt-0.5" />
                  ก่อนหน้า
                </Link>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                  const active = n === currentPage;
                  return (
                    <Link
                      key={n}
                      href={buildUrl(undefined, n)}
                      aria-current={active ? 'page' : undefined}
                      className={`min-w-[40px] px-3 py-2 rounded-full text-center text-xs ${FONT_HEADING} font-bold border-2 transition-all`}
                      style={
                        active
                          ? { background: EDU_PRIMARY, color: '#FFFFFF', borderColor: EDU_PRIMARY }
                          : { background: '#FFFFFF', color: EDU_INK, borderColor: EDU_BORDER }
                      }
                    >
                      {n}
                    </Link>
                  );
                })}
                <Link
                  href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                  aria-disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-full bg-white border-2 text-xs ${FONT_HEADING} font-bold transition-all ${
                    currentPage === totalPages ? 'opacity-40 pointer-events-none' : 'hover:shadow-md'
                  }`}
                  style={{ color: EDU_PRIMARY, borderColor: EDU_PRIMARY }}
                >
                  ถัดไป
                  <ArrowRight size={12} className="inline ml-1 -mt-0.5" />
                </Link>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ─── Product card — paper card with chalk doodle fallback ──────────────────
function ProductCard({
  product,
  storeSlug,
  onAdd,
}: {
  product: TemplateProductCard;
  storeSlug: string;
  onAdd: (p: TemplateProductCard, e: React.MouseEvent) => void;
}) {
  const hasDiscount =
    product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.compareAtPriceTHB! - product.priceTHB) /
          product.compareAtPriceTHB!) *
          100,
      )
    : 0;

  return (
    <article
      className="bg-white border rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col group"
      style={{ borderColor: EDU_BORDER }}
    >
      <Link
        href={`/stores/${storeSlug}/products/${product.id}`}
        className="block relative aspect-square overflow-hidden"
        style={{ background: '#EFF6FF' }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ChalkboardPlaceholder />
        )}

        {/* Badges */}
        {discountPct > 0 && (
          <span
            className={`absolute top-2 left-2 ${FONT_HEADING} font-bold text-[10px] text-white px-2 py-0.5 rounded-full shadow-sm`}
            style={{ background: EDU_SAVINGS }}
          >
            ลด {discountPct}%
          </span>
        )}
        <span
          className={`absolute top-2 right-2 inline-flex items-center gap-1 ${FONT_HEADING} font-bold text-[10px] px-2 py-0.5 rounded-full bg-white/95 backdrop-blur shadow-sm`}
          style={{ color: EDU_PRIMARY }}
        >
          <Download size={10} strokeWidth={2.5} />
          PDF
        </span>
      </Link>

      <div className="p-3 flex-1 flex flex-col gap-2">
        {product.categoryName && (
          <span
            className={`text-[10px] ${FONT_HEADING} font-bold uppercase tracking-wider`}
            style={{ color: EDU_INK_MUTED }}
          >
            {product.categoryName}
          </span>
        )}
        <Link href={`/stores/${storeSlug}/products/${product.id}`}>
          <h3
            className={`${FONT_HEADING} text-sm font-bold leading-snug line-clamp-2 min-h-[2.5rem] transition-colors`}
            style={{ color: EDU_INK }}
          >
            {product.title}
          </h3>
        </Link>

        <div
          className="mt-auto pt-2 border-t flex flex-col gap-2"
          style={{ borderColor: EDU_BORDER_SOFT }}
        >
          <div className="flex items-baseline flex-wrap gap-1.5">
            <span
              className={`${FONT_HEADING} text-base font-bold`}
              style={{ color: EDU_PRIMARY }}
            >
              {formatTHB(product.priceTHB)}
            </span>
            {product.compareAtPriceTHB && (
              <span className="text-[10px] line-through" style={{ color: EDU_INK_MUTED }}>
                {formatTHB(product.compareAtPriceTHB)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => onAdd(product, e)}
            className={`w-full ${FONT_HEADING} font-bold text-[11px] py-2 rounded-full transition-colors flex items-center justify-center gap-1`}
            style={{ background: EDU_BG_SOFT, color: EDU_ACCENT_DEEP }}
          >
            <Download size={12} strokeWidth={2.5} />
            หยิบใส่ตะกร้า
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * Chalkboard-style SVG placeholder — used in place of remote images so
 * the catalog never depends on picsum/unsplash. Mirrors the Homepage
 * card placeholder so the two pages feel like the same notebook.
 */
function ChalkboardPlaceholder() {
  return (
    <div
      className="w-full h-full relative flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${EDU_PRIMARY_DEEP}, ${EDU_PRIMARY})` }}
    >
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full opacity-25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="40" cy="40" r="18" stroke="white" strokeWidth="1.2" fill="none" />
        <rect x="120" y="30" width="40" height="28" stroke="white" strokeWidth="1.2" fill="none" rx="4" />
        <path d="M 30 130 L 60 100 L 90 130 L 60 160 Z" stroke="white" strokeWidth="1.2" fill="none" />
        <text x="100" y="100" fontSize="14" fill="white" textAnchor="middle" opacity="0.85" fontFamily="var(--font-kanit)">
          A B C
        </text>
      </svg>
      <div className="relative z-10 flex flex-col items-center gap-1 text-white">
        <BookOpen size={32} strokeWidth={1.5} />
        <span className={`text-[10px] ${FONT_HEADING} font-bold uppercase tracking-wider opacity-90`}>
          ตัวอย่างสื่อ
        </span>
      </div>
    </div>
  );
}
