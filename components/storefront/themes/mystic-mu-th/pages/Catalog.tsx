'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Coins,
  Star,
  Wand2,
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

/**
 * MysticMu Catalog — Mario "level select". Sky-blue hero strip with
 * coin counter, pixel-bordered category pipe sidebar, sort chips, and
 * a 3-column product grid.
 */
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
    <div className="bg-[#5C94FC] text-[#1A1A2E] font-[family:var(--font-prompt)] min-h-screen pb-12">
      {/* Hero strip */}
      <section className="relative bg-[#E52521] border-b-4 border-[#1A1A2E] px-4 py-10 overflow-hidden">
        <div className="absolute top-3 right-4 hidden sm:block" aria-hidden>
          <div className="w-12 h-12 bg-[#FFD700] border-4 border-[#1A1A2E] flex items-center justify-center font-[family:var(--font-kanit)] font-black text-2xl text-[#1A1A2E] shadow-[3px_3px_0_0_#1A1A2E] rotate-[8deg]">
            ?
          </div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-4 py-1 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] mb-4 font-[family:var(--font-kanit)]">
            <Wand2 className="w-3.5 h-3.5 text-[#E52521]" /> Level Select
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[5px_5px_0_#1A1A2E]">
            สื่อการสอนทั้งหมด
          </h1>
          <p className="text-white font-black mt-3 uppercase tracking-widest text-xs sm:text-sm drop-shadow-[2px_2px_0_#1A1A2E] flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#FFD700]" />
            พบ {filteredCount} รายการ
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
        {/* Filter sidebar — pixel pipes */}
        <aside className="space-y-6">
          <div className="bg-white border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5">
            <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight mb-4 border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#E52521]" /> หมวดมู
            </h2>
            <div className="space-y-2">
              <Link
                href={buildUrl(undefined, 1)}
                className={`block px-3 py-2.5 border-4 font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest active:translate-x-1 active:translate-y-1 transition-transform ${
                  selectedCats.length === 0
                    ? 'border-[#1A1A2E] bg-[#E52521] text-white shadow-[4px_4px_0_0_#1A1A2E]'
                    : 'border-[#1A1A2E] bg-white hover:bg-[#FFD700]'
                }`}
              >
                ทั้งหมด
                <span className="float-right text-[#4A4A6E]">{filteredCount}</span>
              </Link>
              {categoryNames.map((cat) => {
                const active = selectedCats.includes(cat);
                return (
                  <Link
                    key={cat}
                    href={buildUrl(cat, 1)}
                    className={`block px-3 py-2.5 border-4 font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest active:translate-x-1 active:translate-y-1 transition-transform ${
                      active
                        ? 'border-[#1A1A2E] bg-[#009A4E] text-white shadow-[4px_4px_0_0_#1A1A2E]'
                        : 'border-[#1A1A2E] bg-white hover:bg-[#FFD700]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`float-right ${active ? 'text-white/80' : 'text-[#4A4A6E]'}`}>
                      {categoryCounts[cat] ?? 0}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Promo block — pixel item */}
          <div className="bg-[#FFD700] border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5 text-center">
            <Coins className="w-10 h-10 mx-auto text-[#E52521] mb-2" />
            <p className="font-[family:var(--font-kanit)] font-black uppercase tracking-tight text-base mb-1">
              ดาวน์โหลดทันที
            </p>
            <p className="text-[11px] font-[family:var(--font-kanit)] font-bold uppercase tracking-widest text-[#1A1A2E]/80">
              ไม่ต้องรอจัดส่ง · เลเวลอัพได้เลย
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-6">
          {/* Sort */}
          <div className="bg-white border-4 border-[#1A1A2E] shadow-[4px_4px_0_0_#1A1A2E] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-[family:var(--font-kanit)] font-black uppercase text-[11px] tracking-widest text-[#1A1A2E] pr-2">
                เรียงโดย:
              </span>
              {SORT_OPTIONS.map((opt) => {
                const active = sortKey === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={buildSortUrl(opt.value)}
                    className={`px-3 py-1.5 border-2 font-[family:var(--font-kanit)] font-black uppercase text-[10px] tracking-widest active:translate-x-0.5 active:translate-y-0.5 transition-transform ${
                      active
                        ? 'border-[#1A1A2E] bg-[#1A1A2E] text-white shadow-[3px_3px_0_0_#FFD700]'
                        : 'border-[#1A1A2E] bg-white hover:bg-[#FFD700]'
                    }`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {pageProducts.length === 0 ? (
            <div className="text-center py-20 border-4 border-[#1A1A2E] bg-white shadow-[6px_6px_0_0_#1A1A2E]">
              <Sparkles className="w-12 h-12 mx-auto text-[#FFD700] mb-3" />
              <p className="font-[family:var(--font-kanit)] text-2xl font-black uppercase tracking-tight">
                ไม่พบสินค้า
              </p>
              <p className="text-sm text-[#4A4A6E] font-bold uppercase tracking-widest mt-2">
                ลองเปลี่ยนตัวกรองหรือคำค้นหา
              </p>
              <Link
                href={buildUrl(undefined, 1)}
                className="inline-flex h-12 px-6 mt-6 items-center justify-center bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                ล้างตัวกรอง
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {pageProducts.map((product) => {
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
                  <Link
                    key={product.id}
                    href={`/stores/${store.slug}/products/${product.id}`}
                    className="group bg-white border-4 border-[#1A1A2E] shadow-[5px_5px_0_0_#1A1A2E] hover:shadow-[7px_7px_0_0_#1A1A2E] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex flex-col"
                  >
                    <div className="relative aspect-square overflow-hidden border-b-4 border-[#1A1A2E] bg-[#E8E8F0]">
                      {hasDiscount && (
                        <div className="absolute top-3 -left-1 z-10 bg-[#E52521] text-white font-[family:var(--font-kanit)] font-black text-[11px] uppercase tracking-widest px-2.5 py-1 border-4 border-[#1A1A2E] shadow-[3px_3px_0_0_#1A1A2E]">
                          ลด {discountPct}%
                        </div>
                      )}
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFD700] via-[#E52521] to-[#009A4E]">
                          <Sparkles className="w-10 h-10 text-white drop-shadow-[2px_2px_0_#1A1A2E]" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleAdd(product, e)}
                        aria-label="เพิ่มในตะกร้า"
                        className="absolute bottom-3 right-3 z-10 w-10 h-10 border-4 border-[#1A1A2E] flex items-center justify-center bg-[#FFD700] text-[#1A1A2E] shadow-[3px_3px_0_0_#1A1A2E] hover:bg-[#009A4E] hover:text-white active:translate-x-1 active:translate-y-1 active:shadow-none"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col">
                      {product.categoryName && (
                        <div className="text-[10px] font-[family:var(--font-kanit)] font-black uppercase text-[#4A4A6E] tracking-widest">
                          {product.categoryName}
                        </div>
                      )}
                      <h3 className="font-[family:var(--font-kanit)] font-black text-sm sm:text-base uppercase tracking-tight leading-tight line-clamp-2 flex-1">
                        {product.title}
                      </h3>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="font-[family:var(--font-kanit)] font-black text-base sm:text-lg text-[#E52521]">
                          {formatTHB(product.priceTHB)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] font-bold text-[#4A4A6E] line-through">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Link
                href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={`h-12 px-4 flex items-center border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest ${
                  currentPage === 1
                    ? 'bg-[#E8E8F0] text-[#4A4A6E] pointer-events-none'
                    : 'bg-white hover:bg-[#FFD700] shadow-[4px_4px_0_0_#1A1A2E] active:translate-x-1 active:translate-y-1 active:shadow-none'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="h-12 px-6 flex items-center border-4 border-[#1A1A2E] bg-[#E52521] text-white font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest shadow-[4px_4px_0_0_#1A1A2E]">
                {currentPage} / {totalPages}
              </div>
              <Link
                href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
                className={`h-12 px-4 flex items-center border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest ${
                  currentPage === totalPages
                    ? 'bg-[#E8E8F0] text-[#4A4A6E] pointer-events-none'
                    : 'bg-white hover:bg-[#FFD700] shadow-[4px_4px_0_0_#1A1A2E] active:translate-x-1 active:translate-y-1 active:shadow-none'
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
