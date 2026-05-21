'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Filter, Grid3X3, List } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import type { CatalogProps } from '@/lib/templates/types';

export default function BrutalistCatalog(props: CatalogProps) {
  const { store, pageProducts, categories } = props;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const handleAddToCart = (product: typeof pageProducts[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: product.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: product.title,
      priceTHB: product.priceTHB,
      imageUrl: product.imageUrl || undefined,
    });
    showConfirm(product.title, store.slug);
  };

  const filtered = selectedCategory === 'ALL'
    ? pageProducts
    : pageProducts.filter((p) => p.categoryName === selectedCategory);

  const uniqueCategories = Array.from(new Set(pageProducts.map((p) => p.categoryName).filter(Boolean))) as string[];

  return (
    <main className="bg-white text-black min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <Link href={`/stores/${store.slug}`} className="hover:text-black transition-colors">
            หน้าแรก
          </Link>
          <span>→</span>
          <span className="text-black">สินค้าทั้งหมด</span>
        </nav>

        {/* Page Header */}
        <header className="border-b-4 border-black pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
                FULL CATALOGUE · {store.name}
              </p>
              <h1 className="font-[family:var(--font-google-sans)] font-black text-4xl sm:text-5xl uppercase tracking-tighter leading-none">
                ALL PRINTS
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {filtered.length} items
              </span>
              <div className="flex border-2 border-black">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                  aria-label="Grid view"
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-l-2 border-black transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                  aria-label="List view"
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={14} className="text-gray-400 mr-1" />
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 border-2 border-black text-[10px] font-extrabold tracking-widest uppercase transition-all shadow-[2px_2px_0px_0px_#000000] ${
              selectedCategory === 'ALL'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            ALL
          </button>
          {uniqueCategories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 border-2 border-black text-[10px] font-extrabold tracking-widest uppercase transition-all shadow-[2px_2px_0px_0px_#000000] ${
                selectedCategory === c
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="border-4 border-black py-16 text-center bg-gray-50 shadow-[4px_4px_0px_0px_#000000]">
            <span className="text-2xl block mb-2">⚫</span>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              No pieces found in this category
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white border-4 border-black flex flex-col justify-between shadow-[4px_4px_0px_0px_#000000] group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] transition-all"
              >
                <Link
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="block relative aspect-[4/5] bg-gray-100 border-b-4 border-black overflow-hidden"
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                      NO PREVIEW
                    </div>
                  )}
                  {p.categoryName && (
                    <span className="absolute top-3 left-3 bg-black text-white border-2 border-black text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                      {p.categoryName}
                    </span>
                  )}
                </Link>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <Link href={`/stores/${store.slug}/products/${p.id}`}>
                    <h3 className="font-[family:var(--font-google-sans)] font-extrabold text-[11px] uppercase tracking-wider text-black line-clamp-2 leading-relaxed">
                      {p.title}
                    </h3>
                  </Link>

                  <div className="mt-3 pt-2.5 border-t-2 border-black flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-[family:var(--font-google-sans)] font-black text-sm">
                        ฿{p.priceTHB.toLocaleString()}
                      </span>
                      {p.compareAtPriceTHB && (
                        <span className="text-[9px] text-gray-400 line-through">
                          ฿{p.compareAtPriceTHB.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(p, e)}
                      className="p-1.5 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white border-4 border-black shadow-[3px_3px_0px_0px_#000000] flex group hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000000] transition-all"
              >
                <Link
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="block w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 border-r-4 border-black overflow-hidden shrink-0"
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-gray-400">
                      NO IMG
                    </div>
                  )}
                </Link>

                <div className="flex-1 p-3 sm:p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/stores/${store.slug}/products/${p.id}`}>
                      <h3 className="font-[family:var(--font-google-sans)] font-extrabold text-xs uppercase tracking-wider text-black truncate">
                        {p.title}
                      </h3>
                    </Link>
                    {p.categoryName && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1 block">
                        {p.categoryName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-[family:var(--font-google-sans)] font-black text-sm block">
                        ฿{p.priceTHB.toLocaleString()}
                      </span>
                      {p.compareAtPriceTHB && (
                        <span className="text-[9px] text-gray-400 line-through">
                          ฿{p.compareAtPriceTHB.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(p, e)}
                      className="px-3 py-1.5 border-2 border-black bg-black text-white font-extrabold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
