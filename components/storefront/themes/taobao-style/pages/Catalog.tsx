'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Flame, Filter, Star, Timer, Zap, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { soldChip, flashDeadlineSeconds } from '../palette';

interface CatalogProduct {
  id: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  categoryName?: string | null;
}

export interface CatalogProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  pageProducts: CatalogProduct[];
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

/**
 * taobao-style — catalog page (dense grid + sticky filter sidebar).
 *
 * Layout:
 *   - Hot banner with running countdown + savings strip
 *   - Sticky left filter: categories, price range chips, "ส่งฟรี" toggle
 *   - Dense 4-up product grid with -% chip, sold-N, star rating
 *   - Pagination bar at the bottom
 */
export function Catalog({
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

  const handleAddToCart = (p: CatalogProduct, e: React.MouseEvent) => {
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

  const sortOptions = [
    { v: 'recommended', l: 'แนะนำ' },
    { v: 'newest', l: 'มาใหม่' },
    { v: 'price-asc', l: 'ราคา ต่ำ→สูง' },
    { v: 'price-desc', l: 'ราคา สูง→ต่ำ' },
    { v: 'popular', l: 'ขายดี' },
  ];

  const totalSeconds = useMemo(() => flashDeadlineSeconds(store.slug), [store.slug]);
  const [remaining, setRemaining] = useState(totalSeconds);
  useEffect(() => {
    setRemaining(totalSeconds);
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : totalSeconds)), 1000);
    return () => clearInterval(id);
  }, [totalSeconds]);

  const hh = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const fakeSocialProof = (id: string) => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    const sold = 50 + (Math.abs(h) % 5500);
    const rating = (4 + (Math.abs(h >> 3) % 10) / 10).toFixed(1);
    return { sold, rating };
  };

  return (
    <main
      className="min-h-screen font-sans"
      style={{ background: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      {/* Hot banner */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: 'var(--shop-primary-gradient)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center shadow"
              style={{ background: 'var(--shop-accent)', color: 'var(--shop-ink)' }}
            >
              <Flame size={18} />
            </span>
            <div>
              <h1 className="font-[family:var(--font-kanit)] font-black text-xl sm:text-2xl uppercase">
                สินค้าทั้งหมด · ลดสูงสุด 70%
              </h1>
              <p className="text-xs font-[family:var(--font-prompt)] text-white/90">
                {filteredCount.toLocaleString()} รายการ · {store.name}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-[family:var(--font-prompt)] font-bold"
            style={{ background: 'rgba(0,0,0,0.25)' }}
          >
            <Timer size={14} style={{ color: 'var(--shop-accent)' }} />
            ปิดราคาดีลใน
            <span
              className="font-[family:var(--font-kanit)] font-black tabular-nums px-1.5 py-0.5 rounded"
              style={{ background: 'var(--shop-ink)', color: 'var(--shop-accent)' }}
            >
              {hh}:{mm}:{ss}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <div
            className="bg-white rounded-lg p-4 sticky top-4"
            style={{ border: `1px solid var(--shop-border)` }}
          >
            <div
              className="flex items-center gap-2 text-sm font-[family:var(--font-kanit)] font-black mb-3 pb-2 border-b"
              style={{ borderColor: 'var(--shop-border)', color: 'var(--shop-primary)' }}
            >
              <Filter size={14} /> ตัวกรอง
            </div>

            {/* Categories */}
            <div className="mb-4">
              <p
                className="text-[11px] font-[family:var(--font-prompt)] font-extrabold uppercase tracking-wider mb-2"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                หมวดหมู่
              </p>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                <a
                  href={buildUrl()}
                  className={`block px-2.5 py-1.5 rounded-md text-xs font-[family:var(--font-prompt)] font-semibold transition-colors ${
                    selectedCats.length === 0 ? 'text-white' : ''
                  }`}
                  style={
                    selectedCats.length === 0
                      ? { background: 'var(--shop-primary-gradient)' }
                      : { color: 'var(--shop-ink)' }
                  }
                >
                  ทั้งหมด ({filteredCount})
                </a>
                {categoryNames.map((c) => {
                  const isActive = selectedCats.includes(c);
                  return (
                    <a
                      key={c}
                      href={buildUrl(c)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-[family:var(--font-prompt)] font-semibold transition-colors`}
                      style={
                        isActive
                          ? {
                              background: 'var(--shop-bg-soft)',
                              color: 'var(--shop-primary)',
                              border: `1px solid var(--shop-primary)`,
                            }
                          : { color: 'var(--shop-ink)' }
                      }
                    >
                      <span className="truncate">{c}</span>
                      <span
                        className="ml-2 text-[10px] shrink-0"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        {categoryCounts[c] ?? 0}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Price chips */}
            <div className="mb-4">
              <p
                className="text-[11px] font-[family:var(--font-prompt)] font-extrabold uppercase tracking-wider mb-2"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                ช่วงราคา
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['ต่ำกว่า ฿99', '฿100-499', '฿500-999', '฿1k+'].map((label) => (
                  <span
                    key={label}
                    className="px-2.5 py-1 rounded-full text-[10px] font-[family:var(--font-prompt)] font-bold cursor-pointer"
                    style={{
                      background: 'var(--shop-muted)',
                      color: 'var(--shop-ink)',
                      border: `1px solid var(--shop-border)`,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Free shipping toggle */}
            <div
              className="rounded-lg p-3 flex items-center gap-2"
              style={{
                background: 'var(--shop-bg-soft)',
                border: `1px solid var(--shop-primary)`,
              }}
            >
              <Zap size={14} style={{ color: 'var(--shop-primary)' }} />
              <span
                className="text-xs font-[family:var(--font-prompt)] font-bold"
                style={{ color: 'var(--shop-primary)' }}
              >
                เฉพาะรายการส่งฟรี
              </span>
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <section className="lg:col-span-9 space-y-4">
          {/* Sort toolbar */}
          <div
            className="bg-white rounded-lg px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar"
            style={{ border: `1px solid var(--shop-border)` }}
          >
            <span
              className="text-[11px] font-[family:var(--font-prompt)] font-extrabold uppercase shrink-0"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              เรียงตาม
            </span>
            {sortOptions.map((opt) => {
              const isActive = sortKey === opt.v;
              return (
                <a
                  key={opt.v}
                  href={buildSortUrl(opt.v)}
                  className="px-3 py-1.5 rounded-md text-xs font-[family:var(--font-prompt)] font-bold transition-colors shrink-0"
                  style={
                    isActive
                      ? {
                          background: 'var(--shop-primary-gradient)',
                          color: 'white',
                        }
                      : {
                          color: 'var(--shop-ink)',
                          background: 'var(--shop-muted)',
                        }
                  }
                >
                  {opt.l}
                </a>
              );
            })}
          </div>

          {/* Selected cats summary */}
          {selectedCats.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[11px] font-[family:var(--font-prompt)] font-bold"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                เลือกแล้ว:
              </span>
              {selectedCats.map((c) => (
                <a
                  key={c}
                  href={buildUrl(c)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-[family:var(--font-prompt)] font-bold text-white"
                  style={{ background: 'var(--shop-primary)' }}
                >
                  {c} ×
                </a>
              ))}
            </div>
          )}

          {/* Grid */}
          {pageProducts.length === 0 ? (
            <div
              className="bg-white rounded-lg py-16 text-center"
              style={{ border: `1px solid var(--shop-border)` }}
            >
              <p
                className="text-sm font-[family:var(--font-prompt)] font-bold"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                ไม่พบสินค้าในตัวกรองนี้
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {pageProducts.map((p) => {
                const sp = fakeSocialProof(p.id);
                const hasDiscount = p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
                const pct = hasDiscount
                  ? Math.round(((p.compareAtPriceTHB! - p.priceTHB) / p.compareAtPriceTHB!) * 100)
                  : 0;
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-lg overflow-hidden group"
                    style={{ border: `1px solid var(--shop-border)` }}
                  >
                    <a
                      href={`/stores/${store.slug}/products/${p.id}`}
                      className="block aspect-square relative"
                      style={{ background: 'var(--shop-muted)' }}
                    >
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-[10px] p-2 text-center"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {p.title.slice(0, 20)}
                        </div>
                      )}
                      {pct > 0 && (
                        <span
                          className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-[family:var(--font-kanit)] font-black text-white"
                          style={{ background: 'var(--shop-primary)' }}
                        >
                          -{pct}%
                        </span>
                      )}
                      {p.priceTHB < 99 && (
                        <span
                          className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-[family:var(--font-kanit)] font-extrabold uppercase"
                          style={{
                            background: 'var(--shop-accent)',
                            color: 'var(--shop-ink)',
                          }}
                        >
                          ส่งฟรี
                        </span>
                      )}
                    </a>
                    <div className="p-2.5 space-y-1.5">
                      <a href={`/stores/${store.slug}/products/${p.id}`} className="block">
                        <p
                          className="text-xs font-[family:var(--font-prompt)] font-semibold leading-snug line-clamp-2"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          {p.title}
                        </p>
                      </a>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="font-[family:var(--font-kanit)] font-black text-lg"
                          style={{ color: 'var(--shop-primary)' }}
                        >
                          {formatTHB(p.priceTHB)}
                        </span>
                        {p.compareAtPriceTHB && (
                          <span
                            className="text-[10px] line-through"
                            style={{ color: 'var(--shop-ink-muted)' }}
                          >
                            {formatTHB(p.compareAtPriceTHB)}
                          </span>
                        )}
                      </div>
                      <div
                        className="flex items-center justify-between text-[10px] font-[family:var(--font-prompt)]"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        <span className="flex items-center gap-0.5">
                          <Star
                            size={10}
                            fill="currentColor"
                            style={{ color: 'var(--shop-accent)' }}
                          />
                          {sp.rating}
                        </span>
                        <span>{soldChip(sp.sold)}</span>
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        className="w-full py-1.5 text-[11px] font-[family:var(--font-kanit)] font-black uppercase text-white rounded-md transition-opacity hover:opacity-90"
                        style={{ background: 'var(--shop-primary-gradient)' }}
                      >
                        หยิบใส่ตะกร้า
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = p === currentPage;
                return (
                  <a
                    key={p}
                    href={buildUrl(undefined, p)}
                    className="min-w-[34px] h-9 px-3 rounded-md flex items-center justify-center text-xs font-[family:var(--font-kanit)] font-black transition-colors"
                    style={
                      isActive
                        ? {
                            background: 'var(--shop-primary-gradient)',
                            color: 'white',
                          }
                        : {
                            background: 'white',
                            color: 'var(--shop-ink)',
                            border: `1px solid var(--shop-border)`,
                          }
                    }
                  >
                    {p}
                  </a>
                );
              })}
              {currentPage < totalPages && (
                <a
                  href={buildUrl(undefined, currentPage + 1)}
                  className="px-3 h-9 rounded-md flex items-center gap-1 text-xs font-[family:var(--font-prompt)] font-bold"
                  style={{
                    background: 'white',
                    color: 'var(--shop-primary)',
                    border: `1px solid var(--shop-border)`,
                  }}
                >
                  ถัดไป <ArrowRight size={12} />
                </a>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Catalog;
