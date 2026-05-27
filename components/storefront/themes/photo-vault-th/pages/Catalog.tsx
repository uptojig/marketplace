'use client';

import React from 'react';
import Link from 'next/link';
import {
  Aperture,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Film,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
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
  { value: 'price-asc', label: 'ราคาต่ำ → สูง' },
  { value: 'price-desc', label: 'ราคาสูง → ต่ำ' },
  { value: 'name-asc', label: 'ชื่อ A-Z' },
];

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
  const add = useCart((s) => s.add);

  const handleAdd = (p: ProductCard, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: p.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: p.title,
      priceTHB: p.priceTHB,
      imageUrl: p.imageUrl || undefined,
    });
  };

  return (
    <div className="bg-[#0C0A09] text-[#F5F5F4] font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero strip */}
      <section className="pv-grain relative border-b border-[#44403C] bg-gradient-to-b from-[#1C1917] to-[#0C0A09] px-4 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] mb-4">
            <span className="w-8 h-px bg-[#FBBF24]" />
            The Vault
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-bold tracking-tight mb-2">
            <span className="pv-text-gold">คอลเลกชันทั้งหมด</span>
          </h1>
          <p className="text-sm text-[#A8A29E] tracking-wider">
            {filteredCount.toLocaleString('en-US')} รายการ · พรีเซ็ต · LUTs · แอ็คชั่น
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="bg-[#1C1917] border border-[#44403C] p-5">
            <h2 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#F59E0B] mb-4 inline-flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> หมวดหมู่
            </h2>
            <div className="space-y-1.5">
              <Link
                href={buildUrl(undefined, 1)}
                className={`flex items-center justify-between px-3 py-2 text-sm font-semibold transition-colors ${
                  selectedCats.length === 0
                    ? 'bg-[#F59E0B] text-[#0C0A09]'
                    : 'text-[#A8A29E] hover:text-[#F5F5F4] hover:bg-[#292524]'
                }`}
              >
                <span>ทั้งหมด</span>
                <span className="text-xs opacity-80">{filteredCount}</span>
              </Link>
              {categoryNames.map((cat) => {
                const active = selectedCats.includes(cat);
                return (
                  <Link
                    key={cat}
                    href={buildUrl(cat, 1)}
                    className={`flex items-center justify-between px-3 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-[#F59E0B] text-[#0C0A09]'
                        : 'text-[#A8A29E] hover:text-[#F5F5F4] hover:bg-[#292524]'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className="text-xs opacity-80 shrink-0 ml-2">
                      {categoryCounts[cat] ?? 0}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Trust card */}
          <div className="bg-gradient-to-br from-[#1C1917] to-[#0C0A09] border border-[#F59E0B]/30 p-5">
            <Aperture className="w-7 h-7 text-[#F59E0B] mb-3" strokeWidth={1.25} />
            <h3 className="font-[family:var(--font-kanit)] font-bold text-base mb-2 text-[#F5F5F4]">
              ดาวน์โหลดทันที
            </h3>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              ไฟล์ .xmp .acr .cube ดาวน์โหลดเข้าหน้า &quot;ออเดอร์ของฉัน&quot; ใช้ได้ตลอดชีพ
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-6">
          {/* Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-[#44403C]">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#A8A29E]">
              เรียงตาม
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((opt) => {
                const active = sortKey === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={buildSortUrl(opt.value)}
                    className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] font-semibold transition-colors ${
                      active
                        ? 'bg-[#F59E0B] text-[#0C0A09]'
                        : 'text-[#A8A29E] hover:text-[#F5F5F4] border border-[#44403C] hover:border-[#F59E0B]'
                    }`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {pageProducts.length === 0 ? (
            <div className="border border-[#44403C] bg-[#1C1917] p-16 text-center">
              <Film
                className="w-12 h-12 text-[#44403C] mx-auto mb-4"
                strokeWidth={1}
              />
              <p className="font-[family:var(--font-kanit)] text-xl font-bold text-[#F5F5F4]">
                ไม่พบสินค้าตามตัวกรอง
              </p>
              <p className="text-sm text-[#A8A29E] mt-2">
                ลองล้างตัวกรองหรือเลือกหมวดอื่น
              </p>
              <Link
                href={buildUrl(undefined, 1)}
                className="inline-flex items-center justify-center mt-6 h-11 px-6 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold text-sm tracking-wide transition-colors"
              >
                ล้างตัวกรอง
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pageProducts.map((product) => {
                const hasDiscount =
                  product.compareAtPriceTHB &&
                  product.compareAtPriceTHB > product.priceTHB;
                const discountPct = hasDiscount
                  ? Math.round(
                      ((product.compareAtPriceTHB! - product.priceTHB) /
                        product.compareAtPriceTHB!) *
                        100,
                    )
                  : 0;
                return (
                  <Link
                    key={product.id}
                    href={`/stores/${store.slug}/products/${product.id}`}
                    className="group relative bg-[#1C1917] border border-[#44403C] hover:border-[#F59E0B] transition-colors flex flex-col"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#0C0A09]">
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 z-10 bg-[#E11D48] text-white text-[10px] font-bold uppercase tracking-[0.24em] px-2.5 py-1">
                          - {discountPct}%
                        </div>
                      )}
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1C1917] to-[#0C0A09]">
                          <Aperture
                            className="w-12 h-12 text-[#44403C] group-hover:text-[#F59E0B] transition-colors"
                            strokeWidth={1}
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09]/80 via-transparent to-transparent" />
                      <button
                        type="button"
                        onClick={(e) => handleAdd(product, e)}
                        aria-label="เพิ่มในตะกร้า"
                        className="absolute bottom-3 right-3 z-10 w-10 h-10 bg-[#F59E0B] text-[#0C0A09] flex items-center justify-center hover:bg-[#FBBF24] transition-colors opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-300"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col">
                      {product.categoryName && (
                        <p className="text-[10px] uppercase tracking-[0.32em] text-[#A8A29E]">
                          {product.categoryName}
                        </p>
                      )}
                      <h3 className="font-[family:var(--font-kanit)] font-bold text-base leading-tight line-clamp-2 flex-1 text-[#F5F5F4] group-hover:text-[#FBBF24] transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="font-[family:var(--font-kanit)] font-bold text-lg text-[#F59E0B]">
                          {formatTHB(product.priceTHB)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-[#57534E] line-through">
                            {formatTHB(product.compareAtPriceTHB!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#44403C] mt-8">
              <Link
                href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={`h-11 px-4 flex items-center font-[family:var(--font-kanit)] text-sm font-semibold ${
                  currentPage === 1
                    ? 'text-[#44403C] pointer-events-none'
                    : 'text-[#F5F5F4] hover:text-[#F59E0B] border border-[#44403C] hover:border-[#F59E0B] transition-colors'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="h-11 px-5 flex items-center bg-[#F59E0B] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold text-sm tracking-wide">
                {currentPage} / {totalPages}
              </div>
              <Link
                href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
                className={`h-11 px-4 flex items-center font-[family:var(--font-kanit)] text-sm font-semibold ${
                  currentPage === totalPages
                    ? 'text-[#44403C] pointer-events-none'
                    : 'text-[#F5F5F4] hover:text-[#F59E0B] border border-[#44403C] hover:border-[#F59E0B] transition-colors'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
