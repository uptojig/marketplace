'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Tag,
  Truck,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface CardProduct {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

export interface PackagingSupplyCatalogProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: CardProduct[];
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
  { value: 'recommended', label: 'แนะนำ' },
  { value: 'newest', label: 'มาใหม่' },
  { value: 'price-asc', label: 'ราคาต่ำ → สูง' },
  { value: 'price-desc', label: 'ราคาสูง → ต่ำ' },
];

function moqTiers(base: number) {
  return [
    { qty: 50, unit: base },
    { qty: 300, unit: Math.round(base * 0.9) },
    { qty: 1000, unit: Math.round(base * 0.82) },
  ];
}

export function Catalog({
  store,
  products,
  categoryNames,
  categoryCounts,
  selectedCats,
  sortKey,
  currentPage,
  totalPages,
  filteredCount,
  buildUrl,
  buildSortUrl,
}: PackagingSupplyCatalogProps) {
  const add = useCart((s) => s.add);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleAdd = (p: CardProduct, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    add({
      productId: p.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: p.title,
      priceTHB: p.priceTHB,
      imageUrl: p.imageUrl ?? undefined,
    });
  };

  return (
    <main className="min-h-screen bg-[var(--shop-bg)] font-[family:var(--font-prompt)] text-[var(--shop-ink)]">
      {/* Catalog hero */}
      <div className="bg-[var(--shop-bg-soft)] border-b border-[var(--shop-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <nav className="text-xs text-[var(--shop-ink-muted)] mb-3" aria-label="breadcrumb">
            <Link href={`/stores/${store.slug}`} className="hover:text-[var(--shop-primary)]">
              {store.name}
            </Link>
            <span className="mx-1.5">›</span>
            <span className="text-[var(--shop-ink)] font-semibold">แคตตาล็อกสินค้า</span>
          </nav>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-[family:var(--font-kanit)] font-extrabold text-3xl sm:text-4xl tracking-tight">
                บรรจุภัณฑ์ทั้งหมด
              </h1>
              <p className="text-sm text-[var(--shop-ink-muted)] mt-1">
                {filteredCount.toLocaleString('th-TH')} รายการ
                {selectedCats.length > 0 && (
                  <span> · กรอง: {selectedCats.join(', ')}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[var(--shop-accent)] rounded-full px-4 py-2 text-xs font-bold text-[var(--shop-ink)]">
              <TrendingDown size={14} /> ราคาส่งลดสูงสุด 18%
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mobile filter toggle */}
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-[var(--shop-muted)] rounded-xl border border-[var(--shop-border)] font-bold text-sm"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} /> ตัวกรอง
            {selectedCats.length > 0 && (
              <span className="bg-[var(--shop-primary)] text-white text-[10px] rounded-full px-2 py-0.5">
                {selectedCats.length}
              </span>
            )}
          </span>
          <span className="text-[var(--shop-ink-muted)] text-xs">{filtersOpen ? 'ซ่อน' : 'แสดง'}</span>
        </button>

        {/* Sidebar */}
        <aside
          className={`lg:col-span-3 space-y-5 ${
            filtersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-[var(--shop-card)] rounded-2xl border border-[var(--shop-border)] p-5">
            <h3 className="font-[family:var(--font-kanit)] font-bold text-base mb-3 flex items-center gap-2">
              <Tag size={16} className="text-[var(--shop-primary)]" /> หมวดหมู่
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href={buildUrl(undefined, 1)}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCats.length === 0
                      ? 'bg-[var(--shop-primary)] text-white font-bold'
                      : 'text-[var(--shop-ink-muted)] hover:bg-[var(--shop-muted)]'
                  }`}
                >
                  ทั้งหมด ({Object.values(categoryCounts).reduce((a, b) => a + b, 0)})
                </Link>
              </li>
              {categoryNames.map((c) => {
                const selected = selectedCats.includes(c);
                return (
                  <li key={c}>
                    <Link
                      href={buildUrl(c, 1)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selected
                          ? 'bg-[var(--shop-primary)] text-white font-bold'
                          : 'text-[var(--shop-ink-muted)] hover:bg-[var(--shop-muted)] hover:text-[var(--shop-ink)]'
                      }`}
                    >
                      <span>{c}</span>
                      <span
                        className={`text-[11px] ${
                          selected ? 'text-white/80' : 'text-[var(--pks-ink-dim)]'
                        }`}
                      >
                        {categoryCounts[c] ?? 0}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* MOQ savings tile */}
          <div className="rounded-2xl border-2 border-dashed border-[var(--shop-primary)] p-5 bg-[var(--shop-bg-soft)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-[var(--shop-primary)] text-white rounded-lg">
                <TrendingDown size={18} />
              </div>
              <h4 className="font-[family:var(--font-kanit)] font-bold text-sm">
                ลดเพิ่มตาม MOQ
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs">
              <li className="flex justify-between"><span>50 ชิ้น</span><span className="font-bold">ราคาตั้งต้น</span></li>
              <li className="flex justify-between text-[var(--shop-savings)]"><span>300 ชิ้น</span><span className="font-bold">-10%</span></li>
              <li className="flex justify-between text-[var(--pks-pink-deep)]"><span>1,000 ชิ้น</span><span className="font-bold">-18%</span></li>
            </ul>
          </div>

          <div className="rounded-2xl bg-[var(--shop-accent)] p-5 text-[var(--shop-ink)]">
            <Truck size={20} className="mb-2" />
            <p className="font-[family:var(--font-kanit)] font-bold text-sm">ส่งฟรีทั่วประเทศ</p>
            <p className="text-xs mt-1 leading-relaxed">เมื่อสั่งครบ ฿990 จัดส่งภายใน 24 ชม.</p>
          </div>
        </aside>

        {/* Product grid */}
        <section className="lg:col-span-9 space-y-5">
          {/* Sort bar */}
          <div className="bg-[var(--shop-card)] rounded-2xl border border-[var(--shop-border)] p-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {SORT_OPTIONS.map((opt) => {
                const active = sortKey === opt.value;
                return (
                  <Link
                    key={opt.value}
                    href={buildSortUrl(opt.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                      active
                        ? 'bg-[var(--shop-ink)] text-white'
                        : 'bg-[var(--shop-muted)] text-[var(--shop-ink-muted)] hover:text-[var(--shop-ink)]'
                    }`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
            <span className="text-xs text-[var(--shop-ink-muted)] font-semibold">
              หน้า {currentPage} / {totalPages}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="bg-[var(--shop-muted)] rounded-2xl p-16 text-center">
              <Package size={56} className="mx-auto text-[var(--pks-ink-dim)] mb-3" />
              <p className="font-bold text-[var(--shop-ink-muted)] mb-1">ไม่พบสินค้าตรงตามเงื่อนไข</p>
              <p className="text-xs text-[var(--pks-ink-dim)]">ลองล้างตัวกรองหรือเลือกหมวดอื่น</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {products.map((p) => {
                const tiers = moqTiers(p.priceTHB);
                const discount =
                  p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB
                    ? Math.round(
                        ((p.compareAtPriceTHB - p.priceTHB) / p.compareAtPriceTHB) * 100,
                      )
                    : 0;
                return (
                  <article
                    key={p.id}
                    className="group bg-[var(--shop-card)] rounded-2xl border border-[var(--shop-border)] overflow-hidden hover:border-[var(--shop-primary)] hover:shadow-lg transition-all"
                  >
                    <Link
                      href={`/stores/${store.slug}/products/${p.id}`}
                      className="block aspect-square bg-[var(--shop-muted)] relative overflow-hidden"
                    >
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--pks-ink-dim)]">
                          <Package size={42} />
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-[var(--shop-primary)] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                      <span className="absolute top-2 right-2 bg-[var(--shop-accent)] text-[var(--shop-ink)] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        MOQ 50
                      </span>
                    </Link>
                    <div className="p-3.5 space-y-2">
                      {p.categoryName && (
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--shop-primary)]">
                          {p.categoryName}
                        </div>
                      )}
                      <Link href={`/stores/${store.slug}/products/${p.id}`}>
                        <h3 className="font-bold text-sm line-clamp-2 leading-snug hover:text-[var(--shop-primary)] transition-colors">
                          {p.title}
                        </h3>
                      </Link>
                      <div className="flex gap-1 text-[10px]">
                        {tiers.map((t, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-md px-1.5 py-1 text-center ${
                              i === 0
                                ? 'bg-[var(--shop-bg-soft)] text-[var(--shop-ink-muted)]'
                                : i === 1
                                ? 'bg-[var(--pks-yellow-soft)] text-[var(--shop-ink)]'
                                : 'bg-[var(--pks-blue-soft)] text-[var(--shop-savings)] font-bold'
                            }`}
                          >
                            <div className="font-bold">{t.qty}+</div>
                            <div className="text-[9px]">{formatTHB(t.unit)}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-baseline justify-between pt-1.5 border-t border-dashed border-[var(--shop-border)]">
                        <span className="font-[family:var(--font-kanit)] font-extrabold text-lg text-[var(--shop-primary)]">
                          {formatTHB(p.priceTHB)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleAdd(p, e)}
                          className="bg-[var(--shop-primary)] hover:bg-[var(--pks-pink-deep)] text-white p-2 rounded-full transition-colors"
                          aria-label="หยิบใส่ตะกร้า"
                        >
                          <ShoppingBag size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {currentPage > 1 && (
                <Link
                  href={buildUrl(undefined, currentPage - 1)}
                  className="w-10 h-10 rounded-full bg-[var(--shop-card)] border border-[var(--shop-border)] flex items-center justify-center hover:bg-[var(--shop-muted)] transition-colors"
                  aria-label="หน้าก่อนหน้า"
                >
                  <ChevronLeft size={18} />
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const page = i + 1;
                const active = page === currentPage;
                return (
                  <Link
                    key={page}
                    href={buildUrl(undefined, page)}
                    className={`min-w-[40px] h-10 px-3 rounded-full text-sm font-bold flex items-center justify-center transition-colors ${
                      active
                        ? 'bg-[var(--shop-primary)] text-white'
                        : 'bg-[var(--shop-card)] border border-[var(--shop-border)] text-[var(--shop-ink-muted)] hover:bg-[var(--shop-muted)]'
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
              {currentPage < totalPages && (
                <Link
                  href={buildUrl(undefined, currentPage + 1)}
                  className="w-10 h-10 rounded-full bg-[var(--shop-card)] border border-[var(--shop-border)] flex items-center justify-center hover:bg-[var(--shop-muted)] transition-colors"
                  aria-label="หน้าถัดไป"
                >
                  <ChevronRight size={18} />
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Catalog;
