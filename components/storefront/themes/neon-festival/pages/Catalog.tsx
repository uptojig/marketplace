'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
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
  const showConfirm = useCartConfirmation((s) => s.show);

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
    showConfirm(p.title, store.slug);
  };

  return (
    <div className="bg-[#fafafa] text-black font-[family:var(--font-prompt)] min-h-screen">
      {/* Header strip */}
      <section className="bg-pink-500 border-b-4 border-black px-4 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block bg-yellow-400 border-4 border-black px-4 py-1 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 font-[family:var(--font-kanit)]">
            Catalog
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            สินค้าทั้งหมด
          </h1>
          <p className="text-white font-bold mt-3 uppercase tracking-widest text-sm">
            {filteredCount} รายการ
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar — filters */}
        <aside className="space-y-6">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5">
            <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase italic mb-4 border-b-4 border-black pb-2">
              หมวดหมู่
            </h2>
            <div className="space-y-2">
              <Link
                href={buildUrl(undefined, 1)}
                className={`block px-3 py-2 border-4 font-bold uppercase text-xs tracking-widest active:translate-x-1 active:translate-y-1 ${
                  selectedCats.length === 0
                    ? 'border-black bg-pink-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-black bg-white hover:bg-yellow-400'
                }`}
              >
                ทั้งหมด
              </Link>
              {categoryNames.map((cat) => {
                const active = selectedCats.includes(cat);
                return (
                  <Link
                    key={cat}
                    href={buildUrl(cat, 1)}
                    className={`block px-3 py-2 border-4 font-bold uppercase text-xs tracking-widest active:translate-x-1 active:translate-y-1 ${
                      active
                        ? 'border-black bg-blue-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-black bg-white hover:bg-yellow-400'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="float-right text-slate-500">{categoryCounts[cat] ?? 0}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main — sort + grid */}
        <main className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest">
                Sort:
              </span>
              {SORT_OPTIONS.map((opt) => {
                const active = sortKey === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={buildSortUrl(opt.value)}
                    className={`px-3 py-1.5 border-4 font-bold uppercase text-[10px] tracking-widest active:translate-x-1 active:translate-y-1 ${
                      active
                        ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-black bg-white hover:bg-yellow-400'
                    }`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {pageProducts.length === 0 ? (
            <div className="text-center py-20 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-[family:var(--font-kanit)] text-2xl font-black uppercase italic">
                ไม่พบสินค้า
              </p>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">
                ลองเปลี่ยนตัวกรองหรือคำค้นหา
              </p>
              <Link
                href={buildUrl(undefined, 1)}
                className="inline-block mt-6 h-12 px-6 bg-pink-500 text-white border-4 border-black font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none leading-none flex items-center justify-center w-fit mx-auto"
              >
                ล้างตัวกรอง
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageProducts.map((product) => {
                const hasDiscount =
                  product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
                return (
                  <Link
                    key={product.id}
                    href={`/stores/${store.slug}/products/${product.id}`}
                    className="group bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 active:translate-x-2 active:translate-y-2 active:shadow-none transition-all flex flex-col"
                  >
                    <div className="relative aspect-square overflow-hidden border-b-4 border-black bg-slate-100">
                      {hasDiscount && (
                        <div className="absolute top-4 -left-2 z-10 bg-pink-500 text-white font-[family:var(--font-kanit)] font-black text-xs uppercase px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          ลดราคา
                        </div>
                      )}
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-300 to-yellow-300">
                          <Sparkles className="w-12 h-12 text-black/40" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleAdd(product, e)}
                        aria-label="เพิ่มในตะกร้า"
                        className="absolute bottom-4 right-4 z-10 w-12 h-12 border-4 border-black flex items-center justify-center bg-yellow-400 text-black hover:bg-black hover:text-white active:translate-x-1 active:translate-y-1"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col">
                      {product.categoryName && (
                        <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                          {product.categoryName}
                        </div>
                      )}
                      <h3 className="font-[family:var(--font-kanit)] font-black text-lg uppercase leading-tight line-clamp-2 flex-1">
                        {product.title}
                      </h3>
                      <div className="flex items-baseline gap-3 pt-1">
                        <span className="font-[family:var(--font-kanit)] font-black text-xl text-pink-600">
                          {formatTHB(product.priceTHB)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs font-bold text-slate-400 line-through">
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
            <div className="flex items-center justify-center gap-2 pt-4">
              <Link
                href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={`h-12 px-4 flex items-center border-4 border-black font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest ${
                  currentPage === 1
                    ? 'bg-slate-200 text-slate-400 pointer-events-none'
                    : 'bg-white hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="h-12 px-6 flex items-center border-4 border-black bg-pink-500 text-white font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {currentPage} / {totalPages}
              </div>
              <Link
                href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
                className={`h-12 px-4 flex items-center border-4 border-black font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest ${
                  currentPage === totalPages
                    ? 'bg-slate-200 text-slate-400 pointer-events-none'
                    : 'bg-white hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none'
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
