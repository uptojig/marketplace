'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Flame,
  Tag,
  Star,
  Zap,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { soldChip, flashDeadlineSeconds } from '../palette';

interface HomepageProduct {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

export interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: HomepageProduct[];
  categories: string[];
}

/**
 * taobao-style — homepage.
 *
 * Sections (top → bottom):
 *   1. Gradient hero with live countdown to the next flash deal
 *   2. Category icon grid (taobao 10-cell pattern)
 *   3. Flash sale rail — horizontal scroll with discount %, sold-N chip
 *   4. "ดีลของวัน" main product grid with urgency stripes
 */
export function Homepage({ store, products, categories }: HomepageProps) {
  const add = useCart((s) => s.add);

  const handleAddToCart = (p: HomepageProduct, e: React.MouseEvent) => {
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

  const urls = {
    home: `/stores/${store.slug}`,
    shop: `/stores/${store.slug}/category`,
  };

  // Pseudo-stable countdown derived from slug so SSR + CSR match.
  const totalSeconds = useMemo(() => flashDeadlineSeconds(store.slug), [store.slug]);
  const [remaining, setRemaining] = useState(totalSeconds);
  useEffect(() => {
    setRemaining(totalSeconds);
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : totalSeconds));
    }, 1000);
    return () => clearInterval(id);
  }, [totalSeconds]);

  const hh = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  // Bucketed product groups
  const flashDeals = useMemo(
    () =>
      products
        .filter((p) => p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB)
        .slice(0, 10),
    [products],
  );
  const allCatMix = useMemo(() => products.slice(0, 24), [products]);

  // Deterministic "sold" + rating values so the layout feels alive
  // without making every render reshuffle the numbers.
  const fakeSocialProof = (id: string) => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    const sold = 50 + (Math.abs(h) % 5500);
    const rating = (4 + (Math.abs(h >> 3) % 10) / 10).toFixed(1);
    const stockLeft = 3 + (Math.abs(h >> 5) % 47);
    return { sold, rating, stockLeft };
  };

  return (
    <main
      className="min-h-screen font-[family:var(--font-prompt)]"
      style={{ background: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      {/* 1 · Hero with live countdown */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: 'var(--shop-primary-gradient)' }}
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Copy */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-[family:var(--font-kanit)] font-extrabold uppercase tracking-wide shadow-md bg-white"
                style={{ color: 'var(--shop-primary)' }}
              >
                <Flame size={12} /> Mega Flash Sale
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-[family:var(--font-prompt)] font-extrabold text-white bg-black/30 border border-white/60 backdrop-blur-sm">
                ลดสูงสุด 70%
              </span>
            </div>

            <h1
              className="font-[family:var(--font-kanit)] font-black text-3xl sm:text-4xl lg:text-5xl leading-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]"
            >
              ดีลร้อนที่สุดของวัน <br className="hidden sm:inline" />
              <span className="text-yellow-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                เริ่มต้นเพียง ฿9.-
              </span>
            </h1>

            <p className="text-white font-[family:var(--font-prompt)] text-sm sm:text-base max-w-xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
              รวมสินค้ายอดฮิตจาก {store.name} · ส่งตรงจากผู้ขาย · เก็บเงินปลายทางได้ทุกออเดอร์
            </p>

            {/* Live countdown */}
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2 text-[11px] font-[family:var(--font-prompt)] font-bold uppercase text-white/80">
                <Timer size={14} /> ดีลจบใน
              </div>
              <div className="flex items-center gap-1.5">
                {[hh, mm, ss].map((v, i) => (
                  <React.Fragment key={i}>
                    <span
                      className="font-[family:var(--font-kanit)] font-black text-2xl px-2.5 py-1 rounded-md tabular-nums"
                      style={{ background: 'var(--shop-ink)', color: 'var(--shop-accent)' }}
                    >
                      {v}
                    </span>
                    {i < 2 && (
                      <span className="font-[family:var(--font-kanit)] font-black text-xl text-white">
                        :
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="pt-1 flex gap-3">
              <a
                href="#flash-rail"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-[family:var(--font-kanit)] font-black uppercase shadow-lg hover:opacity-90 transition-opacity bg-yellow-300 text-slate-900"
              >
                ช้อปดีลร้อน <ArrowRight size={16} />
              </a>
              <a
                href={urls.shop}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-[family:var(--font-prompt)] font-bold uppercase bg-white/10 border border-white/40 hover:bg-white/20 transition-colors"
              >
                ดูสินค้าทั้งหมด
              </a>
            </div>
          </div>

          {/* Spotlight product card */}
          {allCatMix[0] && (
            <a
              href={`/stores/${store.slug}/products/${allCatMix[0].id}`}
              className="lg:col-span-5 block bg-white rounded-2xl shadow-2xl p-4 hover:scale-[1.02] transition-transform"
              style={{ color: 'var(--shop-ink)' }}
            >
              <div
                className="aspect-square rounded-xl overflow-hidden relative"
                style={{ background: 'var(--shop-muted)' }}
              >
                {allCatMix[0].imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={allCatMix[0].imageUrl}
                    alt={allCatMix[0].title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[color:var(--shop-ink-muted)] font-bold">
                    {allCatMix[0].title.slice(0, 24)}
                  </div>
                )}
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-[family:var(--font-kanit)] font-black uppercase text-white shadow"
                  style={{ background: 'var(--shop-primary)' }}
                >
                  ดีลแห่งวัน
                </span>
                <span
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-[family:var(--font-kanit)] font-black uppercase shadow"
                  style={{ background: 'var(--shop-accent)', color: 'var(--shop-ink)' }}
                >
                  -50%
                </span>
              </div>
              <div className="pt-3 px-1 pb-1">
                <p className="font-[family:var(--font-prompt)] font-bold text-sm line-clamp-2">
                  {allCatMix[0].title}
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span
                    className="font-[family:var(--font-kanit)] font-black text-2xl"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    {formatTHB(allCatMix[0].priceTHB)}
                  </span>
                  {allCatMix[0].compareAtPriceTHB && (
                    <span
                      className="text-xs line-through font-[family:var(--font-prompt)]"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {formatTHB(allCatMix[0].compareAtPriceTHB)}
                    </span>
                  )}
                </div>
                <p
                  className="mt-1 text-[11px] font-[family:var(--font-prompt)] font-semibold"
                  style={{ color: 'var(--shop-savings)' }}
                >
                  {soldChip(fakeSocialProof(allCatMix[0].id).sold)}
                </p>
              </div>
            </a>
          )}
        </div>
      </section>

      {/* 2 · Category icon grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {categories.slice(0, 10).map((c) => (
            <a
              key={c}
              href={`${urls.shop}?cat=${encodeURIComponent(c)}`}
              className="flex flex-col items-center gap-2 p-3 rounded-lg transition-colors hover:bg-[color:var(--shop-bg-soft)]"
            >
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-sm text-white"
                style={{
                  background: 'var(--shop-primary-gradient)',
                }}
              >
                <Tag size={18} />
              </span>
              <span
                className="text-[11px] font-[family:var(--font-prompt)] font-semibold text-center line-clamp-1 w-full"
                style={{ color: 'var(--shop-ink)' }}
              >
                {c}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* 3 · Flash sale rail */}
      <section
        id="flash-rail"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={{ background: 'var(--shop-bg-soft)', border: `1px solid var(--shop-border)` }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between text-white"
            style={{ background: 'var(--shop-primary-gradient)', color: '#ffffff' }}
          >
            <div className="flex items-center gap-2">
              <Zap size={18} fill="currentColor" className="text-yellow-300" />
              <h2 className="font-[family:var(--font-kanit)] font-black text-lg uppercase text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
                แฟลชเซลล์ ลดสุดในรอบเดือน
              </h2>
            </div>
            <div className="flex items-center gap-1 text-xs font-[family:var(--font-prompt)] font-semibold text-white">
              <Timer size={12} /> ปิดใน {hh}:{mm}:{ss}
            </div>
          </div>

          <div className="p-3 flex gap-3 overflow-x-auto no-scrollbar">
            {(flashDeals.length > 0 ? flashDeals : allCatMix.slice(0, 8)).map((p) => {
              const sp = fakeSocialProof(p.id);
              const hasDiscount = p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
              const pct = hasDiscount
                ? Math.round(((p.compareAtPriceTHB! - p.priceTHB) / p.compareAtPriceTHB!) * 100)
                : 30 + (sp.stockLeft % 40); // synthetic flash discount
              const stockPct = Math.min(95, Math.max(15, 100 - sp.stockLeft * 2));

              return (
                <a
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="shrink-0 w-44 bg-white rounded-lg overflow-hidden border transition-shadow hover:shadow-md"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  <div
                    className="aspect-square relative"
                    style={{ background: 'var(--shop-muted)' }}
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-[color:var(--shop-ink-muted)] p-2 text-center">
                        {p.title.slice(0, 20)}
                      </div>
                    )}
                    <span
                      className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-[family:var(--font-kanit)] font-black text-white"
                      style={{ background: 'var(--shop-primary)' }}
                    >
                      -{pct}%
                    </span>
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    <p
                      className="text-xs font-[family:var(--font-prompt)] font-semibold line-clamp-2 leading-snug"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {p.title}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="font-[family:var(--font-kanit)] font-black text-base"
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
                    {/* Stock urgency bar */}
                    <div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--shop-muted)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${stockPct}%`,
                            background: 'var(--shop-primary-gradient)',
                          }}
                        />
                      </div>
                      <p
                        className="text-[10px] mt-1 font-[family:var(--font-prompt)] font-semibold"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        เหลือเพียง {sp.stockLeft} ชิ้น!
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 · Main product grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-end justify-between mb-4">
          <h2
            className="font-[family:var(--font-kanit)] font-black text-xl uppercase flex items-center gap-2"
            style={{ color: 'var(--shop-ink)' }}
          >
            <TrendingUp size={20} style={{ color: 'var(--shop-primary)' }} /> ดีลของวัน
          </h2>
          <a
            href={urls.shop}
            className="text-xs font-[family:var(--font-prompt)] font-bold hover:underline flex items-center gap-1"
            style={{ color: 'var(--shop-primary)' }}
          >
            ดูทั้งหมด <ArrowRight size={12} />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {allCatMix.map((p) => {
            const sp = fakeSocialProof(p.id);
            const hasDiscount = p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
            const pct = hasDiscount
              ? Math.round(((p.compareAtPriceTHB! - p.priceTHB) / p.compareAtPriceTHB!) * 100)
              : 0;
            return (
              <div
                key={p.id}
                className="bg-white rounded-lg overflow-hidden border group relative"
                style={{ borderColor: 'var(--shop-border)' }}
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
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[color:var(--shop-ink-muted)] p-2 text-center">
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
                  <span
                    className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-[family:var(--font-kanit)] font-extrabold uppercase"
                    style={{ background: 'var(--shop-accent)', color: 'var(--shop-ink)' }}
                  >
                    HOT
                  </span>
                </a>
                <div className="p-2.5 space-y-1.5">
                  <a
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="block"
                  >
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

      </section>
    </main>
  );
}

export default Homepage;
