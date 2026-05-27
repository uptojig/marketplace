'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  Palette,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Filter,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { VECTOR_BAZAAR_RAINBOW } from '../palette';

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
    <div className="bg-[#FEFCE8] text-[#1E1B4B] font-[family:var(--font-prompt)] min-h-screen">
      {/* Header band */}
      <section className="relative overflow-hidden vb-rainbow-bg border-b border-[#FBCFE8]">
        <div className="absolute inset-0 vb-confetti opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#FBCFE8] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#DB2777] font-[family:var(--font-kanit)] mb-4">
            <FileImage className="w-3.5 h-3.5" />
            คลังเวกเตอร์ทั้งหมด
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black tracking-tight">
            <span className="vb-rainbow-text">เลือกซื้อผลงาน</span>
          </h1>
          <p className="text-sm font-bold text-[#6366F1] mt-3">
            {filteredCount} ผลงาน · ดาวน์โหลดได้ทันทีหลังชำระเงิน
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar — filter chips */}
        <aside className="space-y-6">
          <div className="rounded-3xl bg-white border border-[#FBCFE8] p-5 shadow-sm">
            <h2 className="font-[family:var(--font-kanit)] font-black text-lg mb-4 inline-flex items-center gap-2 text-[#1E1B4B]">
              <Filter className="w-4 h-4 text-[#DB2777]" />
              หมวดหมู่
            </h2>
            <div className="space-y-2">
              <Link
                href={buildUrl(undefined, 1)}
                className={`block px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                  selectedCats.length === 0
                    ? 'bg-[#F472B6] text-white shadow-md'
                    : 'bg-[#FEFCE8] text-[#1E1B4B] hover:bg-[#FCE7F3]'
                }`}
              >
                ทั้งหมด <span className="opacity-70 text-xs">({filteredCount})</span>
              </Link>
              {categoryNames.map((cat, idx) => {
                const active = selectedCats.includes(cat);
                const color = VECTOR_BAZAAR_RAINBOW[idx % VECTOR_BAZAAR_RAINBOW.length];
                return (
                  <Link
                    key={cat}
                    href={buildUrl(cat, 1)}
                    className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                      active
                        ? 'text-white shadow-md'
                        : 'bg-[#FEFCE8] text-[#1E1B4B] hover:bg-[#FCE7F3]'
                    }`}
                    style={active ? { backgroundColor: color } : undefined}
                  >
                    <span className="inline-flex items-center gap-2 truncate">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: active ? '#FFFFFF' : color }}
                      />
                      <span className="truncate">{cat}</span>
                    </span>
                    <span className="text-xs opacity-70 shrink-0">{categoryCounts[cat] ?? 0}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main — sort + grid */}
        <main className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white border border-[#FBCFE8] p-3">
            <span className="text-[11px] font-black tracking-widest uppercase text-[#6366F1] px-2 font-[family:var(--font-kanit)]">
              เรียงตาม
            </span>
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={buildSortUrl(opt.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[#1E1B4B] text-white'
                      : 'bg-[#FEFCE8] text-[#1E1B4B] hover:bg-[#FCE7F3]'
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>

          {pageProducts.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-[#FBCFE8] bg-white">
              <Palette className="w-12 h-12 mx-auto text-[#F472B6] mb-3" />
              <p className="font-[family:var(--font-kanit)] text-xl font-black mb-1">
                ไม่พบผลงาน
              </p>
              <p className="text-sm text-[#6366F1] mb-6">
                ลองเปลี่ยนตัวกรอง หรือเรียกดูคลังทั้งหมด
              </p>
              <Link
                href={buildUrl(undefined, 1)}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#F472B6] text-white font-[family:var(--font-kanit)] font-bold text-sm hover:bg-[#EC4899] transition-colors"
              >
                ล้างตัวกรอง
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pageProducts.map((product, idx) => {
                const hasDiscount =
                  product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
                const accent = VECTOR_BAZAAR_RAINBOW[idx % VECTOR_BAZAAR_RAINBOW.length];
                return (
                  <Link
                    key={product.id}
                    href={`/stores/${store.slug}/products/${product.id}`}
                    className="group vb-card-hover relative rounded-3xl bg-white border border-[#FBCFE8] overflow-hidden flex flex-col"
                  >
                    {hasDiscount && (
                      <div
                        className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase text-white shadow-md font-[family:var(--font-kanit)]"
                        style={{ backgroundColor: accent }}
                      >
                        ลดราคา
                      </div>
                    )}

                    <div className="relative aspect-square vb-checker overflow-hidden">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
                            style={{ backgroundColor: accent }}
                          >
                            <FileImage className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleAdd(product, e)}
                        aria-label="เพิ่มในตะกร้า"
                        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-[#DB2777] border border-[#FBCFE8] flex items-center justify-center shadow-md hover:bg-[#F472B6] hover:text-white hover:scale-110 active:scale-95 transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-2">
                      {product.categoryName && (
                        <p className="text-[10px] font-black tracking-widest uppercase text-[#6366F1] font-[family:var(--font-kanit)]">
                          {product.categoryName}
                        </p>
                      )}
                      <h3 className="font-[family:var(--font-kanit)] font-black text-base leading-tight line-clamp-2 text-[#1E1B4B] flex-1">
                        {product.title}
                      </h3>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="font-[family:var(--font-kanit)] font-black text-lg text-[#DB2777]">
                          {formatTHB(product.priceTHB)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-[#6366F1]/60 line-through">
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
            <nav
              aria-label="แบ่งหน้า"
              className="flex items-center justify-center gap-2 pt-6"
            >
              <Link
                href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={`h-11 w-11 rounded-full flex items-center justify-center font-bold border border-[#FBCFE8] ${
                  currentPage === 1
                    ? 'bg-[#FCE7F3]/30 text-[#6366F1]/40 pointer-events-none'
                    : 'bg-white text-[#1E1B4B] hover:bg-[#FCE7F3] hover:border-[#F472B6]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <div className="h-11 px-5 rounded-full bg-[#F472B6] text-white inline-flex items-center font-[family:var(--font-kanit)] font-black text-sm vb-glow-primary">
                {currentPage} / {totalPages}
              </div>
              <Link
                href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
                className={`h-11 w-11 rounded-full flex items-center justify-center font-bold border border-[#FBCFE8] ${
                  currentPage === totalPages
                    ? 'bg-[#FCE7F3]/30 text-[#6366F1]/40 pointer-events-none'
                    : 'bg-white text-[#1E1B4B] hover:bg-[#FCE7F3] hover:border-[#F472B6]'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
