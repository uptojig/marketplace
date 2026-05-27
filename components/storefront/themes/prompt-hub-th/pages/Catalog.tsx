'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bot,
  SlidersHorizontal,
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

const GRADIENT_BG = 'linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)';
const GLASS_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(19, 19, 46, 0.6)',
  backdropFilter: 'blur(12px) saturate(140%)',
  WebkitBackdropFilter: 'blur(12px) saturate(140%)',
  border: '1px solid rgba(168, 85, 247, 0.16)',
};
const GRID_BG_STYLE: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.18) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};
const GLOW_SM =
  '0 0 0 1px rgba(168,85,247,0.4), 0 0 12px rgba(168,85,247,0.4), 0 0 32px rgba(168,85,247,0.2)';

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
    <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)] min-h-screen">
      <section className="relative overflow-hidden border-b border-[#312E81]/60 px-4 py-12">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={GRID_BG_STYLE} aria-hidden />
        <div
          className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#A855F7]/40 bg-[#A855F7]/10 text-[10px] uppercase tracking-[0.18em] text-[#A855F7] mb-4 font-[family:var(--font-kanit)] font-semibold">
            <Sparkles className="w-3 h-3" />
            Catalog
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-bold tracking-tight text-[#F8FAFC]">
            พรอมต์ทั้งหมด
          </h1>
          <p className="text-sm text-[#94A3B8] mt-2 tabular-nums">
            <span className="text-[#06B6D4] font-semibold">{filteredCount}</span> รายการ
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-5">
          <div className="rounded-2xl p-5" style={GLASS_STYLE}>
            <h2 className="font-[family:var(--font-kanit)] font-semibold text-base text-[#F8FAFC] mb-4 flex items-center gap-2 pb-3 border-b border-[#312E81]">
              <SlidersHorizontal className="w-4 h-4 text-[#A855F7]" />
              หมวดหมู่
            </h2>
            <div className="space-y-1.5">
              <Link
                href={buildUrl(undefined, 1)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedCats.length === 0
                    ? 'text-white font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E1E3F]'
                }`}
                style={
                  selectedCats.length === 0
                    ? { backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }
                    : undefined
                }
              >
                <span>ทั้งหมด</span>
                <span className="text-[10px] uppercase tracking-wider opacity-70">All</span>
              </Link>
              {categoryNames.map((cat) => {
                const active = selectedCats.includes(cat);
                return (
                  <Link
                    key={cat}
                    href={buildUrl(cat, 1)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      active
                        ? 'text-white font-semibold'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E1E3F]'
                    }`}
                    style={active ? { backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM } : undefined}
                  >
                    <span className="truncate">{cat}</span>
                    <span
                      className={`text-[10px] tabular-nums shrink-0 ml-2 ${
                        active ? 'text-white/80' : 'text-[#94A3B8]/60'
                      }`}
                    >
                      {categoryCounts[cat] ?? 0}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.16em] text-[#94A3B8] font-medium mr-1">
              เรียงตาม:
            </span>
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={buildSortUrl(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? 'text-white'
                      : 'bg-[#13132E] text-[#94A3B8] border border-[#312E81] hover:border-[#A855F7]/50 hover:text-[#F8FAFC]'
                  }`}
                  style={active ? { backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM } : undefined}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>

          {pageProducts.length === 0 ? (
            <div className="text-center py-20 rounded-2xl" style={GLASS_STYLE}>
              <Bot className="w-12 h-12 mx-auto text-[#94A3B8] mb-3" />
              <p className="font-[family:var(--font-kanit)] text-xl font-semibold text-[#F8FAFC]">
                ไม่พบพรอมต์ที่ค้นหา
              </p>
              <p className="text-sm text-[#94A3B8] mt-2">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
              <Link
                href={buildUrl(undefined, 1)}
                className="inline-flex items-center gap-2 mt-6 h-11 px-5 rounded-full text-white text-sm font-semibold font-[family:var(--font-kanit)]"
                style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
              >
                ล้างตัวกรอง
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pageProducts.map((product) => {
                const hasDiscount =
                  product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
                return (
                  <Link
                    key={product.id}
                    href={`/stores/${store.slug}/products/${product.id}`}
                    className="group relative rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                    style={GLASS_STYLE}
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#1E1E3F]">
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-[#FACC15] text-[#0B0B1F] text-[10px] font-bold uppercase tracking-wider font-[family:var(--font-kanit)]">
                          -
                          {Math.round(
                            ((product.compareAtPriceTHB! - product.priceTHB) /
                              product.compareAtPriceTHB!) *
                              100,
                          )}
                          %
                        </div>
                      )}
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(6,182,212,0.2) 100%)',
                          }}
                        >
                          <Bot className="w-12 h-12 text-[#F8FAFC]/30" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleAdd(product, e)}
                        aria-label="เพิ่มในตะกร้า"
                        className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                        style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 space-y-2">
                      {product.categoryName && (
                        <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#06B6D4]">
                          {product.categoryName}
                        </div>
                      )}
                      <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm sm:text-base text-[#F8FAFC] leading-snug line-clamp-2 min-h-[2.6em]">
                        {product.title}
                      </h3>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="font-[family:var(--font-kanit)] font-bold text-lg text-[#A855F7] tabular-nums">
                          {formatTHB(product.priceTHB)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-[#94A3B8] line-through tabular-nums">
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
            <div className="flex items-center justify-center gap-2 pt-6">
              <Link
                href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={`h-10 px-4 flex items-center rounded-full text-sm font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-[#13132E]/40 text-[#94A3B8]/40 pointer-events-none border border-[#312E81]/40'
                    : 'bg-[#13132E] text-[#F8FAFC] border border-[#312E81] hover:border-[#A855F7]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <div
                className="h-10 px-5 flex items-center rounded-full text-white text-sm font-semibold tabular-nums font-[family:var(--font-kanit)]"
                style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
              >
                {currentPage} / {totalPages}
              </div>
              <Link
                href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
                className={`h-10 px-4 flex items-center rounded-full text-sm font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-[#13132E]/40 text-[#94A3B8]/40 pointer-events-none border border-[#312E81]/40'
                    : 'bg-[#13132E] text-[#F8FAFC] border border-[#312E81] hover:border-[#A855F7]'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
