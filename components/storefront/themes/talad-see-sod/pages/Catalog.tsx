'use client';

/**
 * talad-see-sod — bespoke Catalog page.
 *
 * Same visual language as the Homepage: cream bg, dark-red ink, red
 * accent, orange borders, yellow stamps, Kanit display + Prompt body.
 * Renders the category chip rail, sort, and a product grid using the
 * Homepage card style so /category and /category/[slug] don't fall
 * back to the generic shadcn-studio product-list-03 layout.
 */

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, ArrowLeft } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CatalogProps, TemplateProductCard } from '@/lib/templates/types';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'เรียงตามลำดับ' },
  { value: 'low-to-high', label: 'ราคา: ต่ำ → สูง' },
  { value: 'high-to-low', label: 'ราคา: สูง → ต่ำ' },
];

const CATEGORY_ICONS: Record<string, string> = {
  เคส: '📱',
  สายชาร์จ: '🔌',
  หัวชาร์จ: '⚡',
  ไฟ: '💡',
  ของแต่งโต๊ะ: '🖥️',
  ของใช้ในครัว: '🍳',
  เครื่องใช้ในครัว: '🥄',
  ของใช้เด็ก: '🧸',
};

export default function TaladSeeSodCatalog(props: CatalogProps) {
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

  const handleAddToCart = (
    product: TemplateProductCard,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: product.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: product.title,
      priceTHB: product.priceTHB,
      imageUrl: product.imageUrl ?? undefined,
    });
  };

  const activeCat = selectedCats[0];
  const headerName = activeCat ?? 'สินค้าทั้งหมด';
  const totalForActive =
    activeCat != null
      ? (categoryCounts[activeCat] ?? filteredCount)
      : Object.values(categoryCounts).reduce((s, n) => s + n, 0);

  return (
    <main className={`bg-[#fff7ed] text-[#7f1d1d] min-h-screen ${FONT_BODY}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Back link */}
        <Link
          href={`/stores/${store.slug}`}
          className={`inline-flex items-center gap-1.5 text-xs ${FONT_HEADING} font-bold text-[#7f1d1d] hover:text-[#dc2626] transition-colors`}
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          กลับหน้าร้าน
        </Link>

        {/* Category header — talad stamp style */}
        <header className="bg-white border border-[#fdba74] shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`bg-yellow-300 text-[#dc2626] ${FONT_HEADING} font-black text-[10px] px-2.5 py-0.5 border border-[#dc2626] shadow-sm -rotate-2`}>
                  หมวดหมู่สินค้า
                </span>
                {activeCat && (
                  <span className={`bg-[#dc2626] text-white ${FONT_HEADING} font-black text-[10px] px-2.5 py-0.5 border border-yellow-300 shadow-sm rotate-1`}>
                    {CATEGORY_ICONS[activeCat] ?? '🏷️'} เลือกอยู่
                  </span>
                )}
              </div>
              <h1 className={`${FONT_HEADING} font-black text-3xl sm:text-4xl text-[#7f1d1d] leading-tight flex items-center gap-2`}>
                {activeCat && (
                  <span className="text-3xl">{CATEGORY_ICONS[activeCat] ?? '🛒'}</span>
                )}
                {headerName}
              </h1>
              <p className="mt-1.5 text-sm text-orange-700 font-medium">
                {totalForActive.toLocaleString()} รายการ · ส่งตรงจากเจ้าของร้าน
              </p>
            </div>

            {/* Sort select */}
            <div className="bg-orange-50 border border-[#fdba74] px-3 py-2 flex items-center gap-2">
              <span className={`text-[10px] ${FONT_HEADING} font-black uppercase text-[#7f1d1d] tracking-wider`}>
                เรียง
              </span>
              <select
                value={sortKey}
                onChange={(e) => {
                  window.location.href = buildSortUrl(e.target.value);
                }}
                className={`bg-transparent text-xs ${FONT_BODY} font-bold text-[#7f1d1d] focus:outline-none cursor-pointer`}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Category chip rail */}
        {categoryNames.length > 0 && (
          <nav aria-label="หมวดหมู่" className="flex flex-wrap gap-2">
            <Link
              href={buildUrl()}
              className={`px-3 py-1.5 text-xs ${FONT_HEADING} font-black uppercase tracking-wide border-2 transition-colors ${
                selectedCats.length === 0
                  ? 'bg-[#dc2626] text-white border-[#dc2626] shadow'
                  : 'bg-white text-[#7f1d1d] border-[#fdba74] hover:bg-[#fff7ed] hover:border-[#dc2626]'
              }`}
            >
              📦 ทั้งหมด ({Object.values(categoryCounts).reduce((s, n) => s + n, 0).toLocaleString()})
            </Link>
            {categoryNames.map((c) => {
              const isActive = selectedCats.includes(c);
              const icon = CATEGORY_ICONS[c] ?? '🏷️';
              return (
                <Link
                  key={c}
                  href={buildUrl(c)}
                  className={`px-3 py-1.5 text-xs ${FONT_HEADING} font-black uppercase tracking-wide border-2 transition-colors ${
                    isActive
                      ? 'bg-[#dc2626] text-white border-[#dc2626] shadow'
                      : 'bg-white text-[#7f1d1d] border-[#fdba74] hover:bg-[#fff7ed] hover:border-[#dc2626]'
                  }`}
                >
                  {icon} {c} ({(categoryCounts[c] ?? 0).toLocaleString()})
                </Link>
              );
            })}
          </nav>
        )}

        {/* Product grid — Homepage card style */}
        {pageProducts.length === 0 ? (
          <div className="bg-white border border-[#fdba74] py-20 text-center shadow-sm">
            <span className="text-5xl block mb-3">🔍</span>
            <p className={`text-base ${FONT_HEADING} font-black text-[#7f1d1d]`}>
              ไม่มีสินค้าในหมวดหมู่นี้
            </p>
            <p className="mt-1 text-xs text-orange-700 font-medium">
              ลองดูหมวดอื่นๆ ที่ด้านบนได้เลย
            </p>
          </div>
        ) : (
          <>
            {/* Promo strip above grid */}
            <div className="bg-white border border-[#fdba74] p-4 flex items-center justify-between shadow-sm">
              <span className={`${FONT_HEADING} font-black text-sm uppercase text-[#7f1d1d] flex items-center gap-1.5`}>
                <Sparkles size={16} className="text-[#dc2626]" />
                รายการสินค้า
              </span>
              <span className={`text-xs ${FONT_BODY} font-bold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1`}>
                หน้า {currentPage}/{Math.max(1, totalPages)} · {filteredCount.toLocaleString()} รายการ
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {pageProducts.map((p) => {
                const hasDiscount =
                  p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
                const discountPercent = hasDiscount
                  ? Math.round(
                      ((p.compareAtPriceTHB! - p.priceTHB) /
                        p.compareAtPriceTHB!) *
                        100,
                    )
                  : 0;

                return (
                  <article
                    key={p.id}
                    className="bg-white border border-[#fdba74] flex flex-col justify-between hover:shadow-md transition-shadow relative group"
                  >
                    <Link
                      href={`/stores/${store.slug}/products/${p.id}`}
                      className="block relative aspect-square bg-orange-50/10 overflow-hidden"
                    >
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-orange-100 font-bold text-xs">
                          NO IMAGE
                        </div>
                      )}

                      {discountPercent > 0 && (
                        <span className={`absolute top-2 left-2 bg-[#dc2626] text-white ${FONT_HEADING} font-black text-[9px] px-2 py-0.5 border border-white -rotate-6 shadow`}>
                          -{discountPercent}%
                        </span>
                      )}
                      {p.priceTHB < 300 && (
                        <span className={`absolute top-2 right-2 bg-yellow-300 text-red-700 ${FONT_HEADING} font-black text-[9px] px-2 py-0.5 border border-red-500 rotate-3 shadow`}>
                          ส่งฟรี!
                        </span>
                      )}
                    </Link>

                    <div className="p-3 flex-1 flex flex-col justify-between bg-white">
                      <Link
                        href={`/stores/${store.slug}/products/${p.id}`}
                        className="block"
                      >
                        <h3 className={`${FONT_BODY} text-xs font-bold text-[#7f1d1d] hover:text-[#dc2626] transition-colors leading-snug line-clamp-2`}>
                          {p.title}
                        </h3>
                      </Link>

                      <div className="mt-3 pt-2 border-t border-orange-50 flex flex-col gap-2">
                        <div className="flex items-baseline flex-wrap">
                          <span className={`${FONT_BODY} text-md font-extrabold text-[#dc2626] mr-1.5`}>
                            {formatTHB(p.priceTHB)}
                          </span>
                          {p.compareAtPriceTHB && (
                            <span className={`${FONT_BODY} text-[10px] text-gray-400 line-through`}>
                              {formatTHB(p.compareAtPriceTHB)}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(p, e)}
                          className={`w-full inline-flex items-center justify-center gap-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white ${FONT_HEADING} font-black text-[10px] py-1.5 text-center shadow-sm uppercase tracking-wider transition-colors`}
                        >
                          <ShoppingBag size={10} strokeWidth={3} />
                          หยิบใส่ตะกร้า
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination — Talad stamp buttons */}
            {totalPages > 1 && (
              <nav
                aria-label="แบ่งหน้ารายการสินค้า"
                className="flex flex-wrap items-center justify-center gap-2 pt-4"
              >
                <Link
                  href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                  aria-disabled={currentPage === 1}
                  className={`px-4 py-2 bg-white border-2 border-[#dc2626] text-[#dc2626] ${FONT_HEADING} font-black text-xs uppercase shadow-sm hover:bg-[#fff7ed] transition-colors ${
                    currentPage === 1 ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  ← ก่อนหน้า
                </Link>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Link
                    key={n}
                    href={buildUrl(undefined, n)}
                    aria-current={n === currentPage ? 'page' : undefined}
                    className={`min-w-[40px] px-3 py-2 text-center ${FONT_HEADING} font-black text-xs border-2 shadow-sm transition-colors ${
                      n === currentPage
                        ? 'bg-[#dc2626] text-white border-[#dc2626]'
                        : 'bg-white text-[#7f1d1d] border-[#fdba74] hover:bg-[#fff7ed]'
                    }`}
                  >
                    {n}
                  </Link>
                ))}
                <Link
                  href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                  aria-disabled={currentPage === totalPages}
                  className={`px-4 py-2 bg-white border-2 border-[#dc2626] text-[#dc2626] ${FONT_HEADING} font-black text-xs uppercase shadow-sm hover:bg-[#fff7ed] transition-colors ${
                    currentPage === totalPages ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  ถัดไป →
                </Link>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
