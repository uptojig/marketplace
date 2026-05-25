'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { formatTHB } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}

interface LandingContent {
  heroHeadline?: string | null;
  heroSubheadline?: string | null;
  heroCtaLabel?: string | null;
  heroImageUrl?: string | null;
}

export interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
  };
  products: Product[];
  categories: string[];
  landingContent?: LandingContent | null;
}

const FEATURED_CAP = 8;
const TICKER_TEXT =
  '✺ CASEINW DROP 24 · ส่งฟรี ฿590+ · ผ่อน 0% นาน 3 เดือน · เปลี่ยน-คืน 30 วัน · ปั้นเคสของคุณเอง · ';

const STICKERS = ['🌈', '⚡', '★', '✺', '💜', '🍋'];

import { LucideIcon } from 'lucide-react';

const TRUST_ITEMS: { icon: LucideIcon; label: string; sub: string }[] = [
  { icon: Truck, label: 'ส่งฟรี', sub: 'ออเดอร์ ฿590+' },
  { icon: RotateCcw, label: 'เปลี่ยน-คืน', sub: 'ภายใน 30 วัน' },
  { icon: ShieldCheck, label: 'Military Grade', sub: 'กันตก 3 เมตร' },
  { icon: Sparkles, label: 'ปั้นเอง', sub: 'พิมพ์ชื่อ-รูป' },
];

/**
 * CaseINW — Gen-Z phone case homepage.
 *
 * Sections (top → bottom):
 *   1. Hero — asymmetric tilted phone-case mockup + sticker stack
 *   2. Trust strip — 4 icon chips
 *   3. Ticker — gradient marquee
 *   4. Categories — round phone-shaped chips
 *   5. Featured — drop-grid with sticker peel + price badges
 *   6. Customizer CTA — split panel ("ปั้นเคสของคุณ")
 *   7. Bestseller carousel — horizontal scroll with ⭐ + rank
 *   8. Social proof — UGC photo grid + Thai handles
 *   9. Final CTA — gradient bar
 */
export function Homepage({ store, products, categories, landingContent }: HomepageProps) {
  const featured = products.slice(0, FEATURED_CAP);
  const totalCount = products.length;
  const carouselItems = products.slice(0, 10);

  const heroImage =
    landingContent?.heroImageUrl ||
    store.bannerUrl ||
    featured.find((p) => p.imageUrl)?.imageUrl ||
    null;

  const headlineRaw = landingContent?.heroHeadline?.trim() || 'ปั้นเคสของคุณ\nให้กลายเป็นไอเทมหายาก';
  const headlineLines = headlineRaw.split(/\n/).filter(Boolean);
  const accentLine = headlineLines.pop() || 'ไอเทมหายาก';

  const subheadline =
    landingContent?.heroSubheadline?.trim() ||
    'มากกว่า 200 ดีไซน์ลิมิเต็ด · พิมพ์ชื่อ-รูปคุณได้ · ใส่สติกเกอร์เอง · กันตก 3 เมตร';

  const ctaLabel = landingContent?.heroCtaLabel?.trim() || 'เริ่มปั้นเคส';

  const urls = {
    shop: `/stores/${store.slug}/category`,
    about: `/stores/${store.slug}/about`,
  };

  return (
    <main className="font-[family:var(--font-prompt)] bg-[#FAFAF7] text-[#0E0E12]">
      {/* ── 1. Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient mesh background */}
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-50"
          style={{ background: 'var(--shop-primary, #8B5CF6)' }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 right-0 h-[500px] w-[500px] rounded-full blur-3xl opacity-40"
          style={{ background: '#06B6D4' }}
        />
        <div
          aria-hidden="true"
          className="absolute top-1/3 right-1/4 h-[280px] w-[280px] rounded-full blur-3xl opacity-50"
          style={{ background: '#A3E635' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Copy column */}
          <div className="lg:col-span-7 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E0E12] text-white text-[11px] font-extrabold uppercase tracking-[0.22em] mb-6 shadow-sm">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#A3E635' }}
              />
              Drop 24 · Live Now
            </div>
            <h1 className="font-[family:var(--font-kanit)] font-black text-[40px] sm:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.025em] uppercase">
              {headlineLines.map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
              <span
                style={{
                  backgroundImage:
                    'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {accentLine}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#0E0E12]/70 mt-6 max-w-xl leading-relaxed font-medium">
              {subheadline}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href={urls.shop}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white text-[13px] font-extrabold uppercase tracking-[0.18em] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{
                  background:
                    'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
                }}
              >
                <Sparkles size={16} /> {ctaLabel}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={`${urls.shop}#bestseller`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0E0E12] text-white text-[13px] font-extrabold uppercase tracking-[0.18em] hover:bg-[#0E0E12]/90 transition-colors"
              >
                ดูคอลเลกชัน
              </Link>
            </div>

            {/* Inline stats */}
            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { k: '200+', v: 'ดีไซน์' },
                { k: '4.9★', v: 'จากรีวิว 12k' },
                { k: '3m', v: 'กันตก' },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-[family:var(--font-kanit)] font-black text-2xl tracking-tight">
                    {s.k}
                  </dt>
                  <dd className="text-[11px] text-[#0E0E12]/55 uppercase tracking-[0.18em] mt-1">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Tilted phone-case mockup column */}
          <div className="lg:col-span-5 relative h-[460px] sm:h-[520px] lg:h-[600px]">
            {/* Sticker stack */}
            {STICKERS.map((s, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute font-black select-none"
                style={{
                  top: `${10 + i * 12}%`,
                  left: `${5 + (i % 2) * 75}%`,
                  fontSize: `${28 + (i % 3) * 6}px`,
                  transform: `rotate(${-15 + i * 7}deg)`,
                  filter: 'drop-shadow(0 4px 12px rgba(139,92,246,0.3))',
                }}
              >
                {s}
              </span>
            ))}

            {/* Phone case mockup */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[300px] lg:w-[340px] aspect-[9/19] rounded-[3rem] overflow-hidden shadow-[0_30px_80px_-20px_rgba(139,92,246,0.5)]"
              style={{
                transform: 'translate(-50%, -50%) rotate(-12deg)',
                background:
                  'var(--shop-primary-gradient, linear-gradient(135deg,#EC4899,#8B5CF6,#06B6D4))',
              }}
            >
              {/* Inner bezel */}
              <div className="absolute inset-2 rounded-[2.6rem] overflow-hidden bg-[#0E0E12]">
                {/* Camera ring */}
                <div className="absolute top-4 left-4 w-16 h-16 rounded-2xl bg-[#1a1a20] border-[2px] border-white/10 flex items-center justify-center z-10">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A3E635] to-[#06B6D4] shadow-inner" />
                </div>
                {/* Image content */}
                {heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImage}
                    alt={store.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(160deg,#EC4899 0%,#8B5CF6 50%,#06B6D4 100%)',
                    }}
                  >
                    <span className="font-[family:var(--font-kanit)] font-black text-7xl text-white/90 uppercase tracking-tight">
                      {store.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary mockup (smaller, offset) */}
            <div
              className="hidden sm:block absolute bottom-6 right-2 w-[140px] aspect-[9/19] rounded-2xl overflow-hidden shadow-[0_20px_50px_-10px_rgba(163,230,53,0.5)]"
              style={{
                transform: 'rotate(15deg)',
                background: '#A3E635',
              }}
            >
              <div className="absolute inset-1.5 rounded-[1.4rem] bg-white flex items-center justify-center">
                <span className="font-[family:var(--font-kanit)] font-black text-4xl text-[#0E0E12]">
                  ✺
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Trust strip ─────────────────────────────────────────── */}
      <section className="border-y border-[#E6E6DF] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_ITEMS.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <span
                className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(163,230,53,0.18))',
                  color: '#8B5CF6',
                }}
              >
                <t.icon size={18} />
              </span>
              <div>
                <p className="font-[family:var(--font-kanit)] font-black text-sm uppercase tracking-tight">
                  {t.label}
                </p>
                <p className="text-[11px] text-[#0E0E12]/55 leading-tight">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Ticker ───────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden border-b-2 border-[#0E0E12]"
        style={{
          background:
            'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
        }}
        aria-hidden="true"
      >
        <div className="flex whitespace-nowrap font-[family:var(--font-kanit)] font-black text-lg md:text-xl tracking-[0.14em] uppercase text-white py-3 animate-[caseinw-ticker_22s_linear_infinite]">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="mx-4">
              {TICKER_TEXT}
            </span>
          ))}
        </div>
        <style jsx>{`
          @keyframes caseinw-ticker {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ── 4. Categories ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-16 md:py-20 bg-[#FAFAF7]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p
                  className="text-[11px] font-extrabold uppercase tracking-[0.32em] mb-2"
                  style={{ color: '#8B5CF6' }}
                >
                  ✺ Shop by Device
                </p>
                <h2 className="font-[family:var(--font-kanit)] text-3xl md:text-4xl font-black tracking-tight uppercase">
                  เลือกรุ่นมือถือคุณ
                </h2>
              </div>
              <Link
                href={urls.shop}
                className="hidden md:inline-block text-[12px] font-extrabold uppercase tracking-[0.22em] underline underline-offset-4 hover:text-[#8B5CF6] transition-colors"
              >
                ดูทุกรุ่น →
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x scroll-px-6 md:justify-center -mx-6 px-6">
              {categories.slice(0, 10).map((cat, idx) => {
                const seed = featured[idx % Math.max(featured.length, 1)];
                const img = seed?.imageUrl ?? null;
                return (
                  <Link
                    key={cat}
                    href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                    className="flex flex-col items-center flex-shrink-0 snap-center group"
                  >
                    <div
                      className="w-[88px] h-[136px] sm:w-[100px] sm:h-[156px] rounded-3xl p-1 transition-transform group-hover:-translate-y-1 group-hover:rotate-[-4deg]"
                      style={{
                        background:
                          idx % 3 === 0
                            ? 'var(--shop-primary-gradient, linear-gradient(135deg,#EC4899,#8B5CF6,#06B6D4))'
                            : idx % 3 === 1
                            ? '#A3E635'
                            : '#0E0E12',
                      }}
                    >
                      <div className="w-full h-full rounded-[1.4rem] overflow-hidden bg-white relative">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={cat}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-[family:var(--font-kanit)] font-black text-3xl text-[#0E0E12]/20 uppercase">
                            {cat.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm tracking-wide text-[#0E0E12] text-center max-w-[8rem] truncate mt-3">
                      {cat}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Featured grid ───────────────────────────────────────── */}
      <section id="shop" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p
                className="text-[11px] font-extrabold uppercase tracking-[0.32em] mb-2"
                style={{ color: '#8B5CF6' }}
              >
                ✺ Drop 24
              </p>
              <h2 className="font-[family:var(--font-kanit)] text-3xl md:text-5xl font-black tracking-tight uppercase">
                ดีไซน์ที่กำลังมาแรง
              </h2>
            </div>
            <Link
              href={urls.shop}
              className="hidden md:inline-block text-[12px] font-extrabold uppercase tracking-[0.22em] underline underline-offset-4 hover:text-[#8B5CF6] transition-colors"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-[#E6E6DF] rounded-3xl bg-[#FAFAF7]">
              <p className="text-sm text-[#0E0E12]/40">ยังไม่มีสินค้าในร้านนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
              {featured.map((p, idx) => (
                <CaseinwProductCard
                  key={p.id}
                  product={p}
                  storeSlug={store.slug}
                  variant={idx % 3}
                  badge={
                    idx === 0
                      ? 'HOT'
                      : idx === 1
                      ? 'NEW'
                      : idx === 4
                      ? 'LIMITED'
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {totalCount > FEATURED_CAP && (
            <div className="mt-12 text-center md:hidden">
              <Link
                href={urls.shop}
                className="block bg-[#0E0E12] text-white font-extrabold uppercase tracking-[0.22em] text-[12px] px-8 py-4 rounded-full w-full hover:opacity-90 transition-opacity"
              >
                ดูทั้งหมด {totalCount} รายการ →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── 6. Customizer CTA ──────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0E0E12] text-white p-8 sm:p-12 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div
              aria-hidden="true"
              className="absolute -top-32 -right-20 h-80 w-80 rounded-full blur-3xl opacity-50"
              style={{ background: 'var(--shop-primary, #8B5CF6)' }}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full blur-3xl opacity-40"
              style={{ background: '#A3E635' }}
            />
            <div className="relative z-10">
              <p
                className="text-[11px] font-extrabold uppercase tracking-[0.32em] mb-3"
                style={{ color: '#A3E635' }}
              >
                ★ Custom Studio
              </p>
              <h3 className="font-[family:var(--font-kanit)] font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-[-0.02em] leading-[1.05]">
                ปั้นเคส
                <br />
                <span
                  style={{
                    backgroundImage:
                      'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  ของคุณเอง
                </span>
              </h3>
              <ul className="mt-6 space-y-2.5 text-white/75 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-[#A3E635]">✓</span> อัปโหลดรูปคุณเอง
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#A3E635]">✓</span> ใส่ชื่อ-วันเกิด-มอตโต้
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#A3E635]">✓</span> เลือกสติกเกอร์กว่า 200 แบบ
                </li>
              </ul>
              <Link
                href={urls.shop}
                className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full text-[#0E0E12] text-[13px] font-extrabold uppercase tracking-[0.18em] bg-white hover:bg-[#A3E635] transition-colors"
              >
                <Sparkles size={16} /> เริ่มปั้นเคส <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative h-[300px] sm:h-[380px] md:h-[420px] z-10">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[260px] aspect-[9/19] rounded-[2.4rem] p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]"
                style={{
                  background:
                    'var(--shop-primary-gradient, linear-gradient(135deg,#EC4899,#8B5CF6,#06B6D4))',
                  transform: 'translate(-50%, -50%) rotate(8deg)',
                }}
              >
                <div className="w-full h-full rounded-[2rem] bg-white flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-3 left-3 w-12 h-12 rounded-xl bg-[#0E0E12] flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#A3E635] to-[#06B6D4]" />
                  </div>
                  <span className="font-[family:var(--font-kanit)] font-black text-6xl text-[#0E0E12]/10 uppercase">
                    YOU
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Bestseller carousel ─────────────────────────────────── */}
      {carouselItems.length > 0 && (
        <section id="bestseller" className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 mb-10 flex items-end justify-between">
            <div>
              <p
                className="text-[11px] font-extrabold uppercase tracking-[0.32em] mb-2"
                style={{ color: '#8B5CF6' }}
              >
                ⭐ Top 10
              </p>
              <h2 className="font-[family:var(--font-kanit)] text-3xl md:text-4xl font-black tracking-tight uppercase">
                ขายดีตลอดกาล
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto pb-4 snap-x">
            <div className="flex gap-5 px-6 lg:px-12">
              {carouselItems.map((p, idx) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="flex-shrink-0 w-[240px] snap-start group"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#FAFAF7] border border-[#E6E6DF]">
                    <span
                      className="absolute top-3 left-3 z-10 font-[family:var(--font-kanit)] font-black text-3xl uppercase leading-none"
                      style={{
                        backgroundImage:
                          'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                        textShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    >
                      #{idx + 1}
                    </span>
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#FAFAF7]">
                        <span className="font-[family:var(--font-kanit)] font-black text-5xl text-[#0E0E12]/15 uppercase">
                          {p.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 px-1">
                    <div className="flex items-center gap-1 text-[11px] text-[#0E0E12]/55 mb-1">
                      <Star size={11} className="fill-current text-[#F59E0B]" />
                      <span>4.{8 - (idx % 2)}</span>
                      <span className="opacity-50">· {120 + idx * 18} รีวิว</span>
                    </div>
                    <p className="font-bold text-sm text-[#0E0E12] truncate">{p.title}</p>
                    <p className="text-sm font-extrabold tabular-nums mt-1">
                      {formatTHB(p.priceTHB)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. Social proof (UGC grid) ─────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p
              className="text-[11px] font-extrabold uppercase tracking-[0.32em] mb-2"
              style={{ color: '#8B5CF6' }}
            >
              💜 #CASEINW
            </p>
            <h2 className="font-[family:var(--font-kanit)] text-3xl md:text-5xl font-black tracking-tight uppercase">
              ลูกค้าจริงของเรา
            </h2>
            <p className="text-sm text-[#0E0E12]/60 mt-3 max-w-xl mx-auto">
              แท็ก #CASEINW บน IG เพื่อขึ้นในแกลเลอรี่ของเรา
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(featured.length ? featured : Array.from({ length: 8 })).slice(0, 8).map((p: Product | unknown, idx: number) => {
              const item = p as Product | undefined;
              return (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden group"
                  style={{
                    background:
                      idx % 3 === 0
                        ? 'var(--shop-primary-gradient, linear-gradient(135deg,#EC4899,#8B5CF6,#06B6D4))'
                        : idx % 3 === 1
                        ? '#A3E635'
                        : '#0E0E12',
                  }}
                >
                  {item?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={`UGC ${idx + 1}`}
                      className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-90 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-[family:var(--font-kanit)] font-black text-4xl text-white/30 uppercase">
                        {STICKERS[idx % STICKERS.length]}
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                    @{['ploy', 'fern', 'nong', 'beam', 'mint', 'gun', 'jane', 'pim'][idx % 8]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 9. Final CTA ───────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 md:py-24"
        style={{
          background:
            'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
        }}
      >
        <div className="relative max-w-3xl mx-auto px-6 text-center text-white">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.32em] mb-4 text-white/80">
            ✺ Drop 24 · Live Now
          </p>
          <h2 className="font-[family:var(--font-kanit)] text-4xl md:text-6xl font-black uppercase tracking-[-0.02em] leading-[1.05]">
            พร้อมเปลี่ยน
            <br />
            มือถือคุณ?
          </h2>
          <p className="text-white/85 text-base md:text-lg mt-6 max-w-xl mx-auto font-medium">
            สมาชิกใหม่รับโค้ดส่วนลด 10% + ส่งฟรีออเดอร์แรก
          </p>
          <Link
            href={urls.shop}
            className="mt-10 inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-[#0E0E12] text-[13px] font-extrabold uppercase tracking-[0.22em] shadow-xl hover:bg-[#A3E635] transition-colors"
          >
            เริ่มช้อปเลย <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * Product card — gradient frame + tilted phone-case shell, hover peels
 * a sticker into view. Three colorway variants cycle by index for
 * playful grid texture.
 */
function CaseinwProductCard({
  product,
  storeSlug,
  variant,
  badge,
}: {
  product: Product;
  storeSlug: string;
  variant: number;
  badge?: string;
}) {
  const bgVariants = [
    'var(--shop-primary-gradient, linear-gradient(135deg,#EC4899,#8B5CF6,#06B6D4))',
    '#A3E635',
    '#0E0E12',
  ];
  const bg = bgVariants[variant % 3];
  const sticker = STICKERS[variant % STICKERS.length];

  return (
    <div className="group relative flex flex-col">
      <Link
        href={`/stores/${storeSlug}/products/${product.id}`}
        className="relative aspect-[3/4] rounded-3xl overflow-hidden p-4 sm:p-5 transition-transform duration-300 group-hover:-translate-y-1"
        style={{ background: bg }}
      >
        {/* Sticker — peels in on hover */}
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 z-20 text-3xl rotate-12 transition-all duration-300 group-hover:rotate-0 group-hover:scale-110"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          }}
        >
          {sticker}
        </span>

        {/* Phone case shell */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] group-hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] transition-shadow">
          <div className="absolute top-2 left-2 w-9 h-9 rounded-xl bg-[#0E0E12] flex items-center justify-center z-10">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#A3E635] to-[#06B6D4]" />
          </div>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FAFAF7]">
              <span className="font-[family:var(--font-kanit)] font-black text-5xl text-[#0E0E12]/15 uppercase">
                {product.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Badge ribbon */}
        {badge && (
          <span className="absolute bottom-3 left-3 z-10 text-[10px] font-extrabold uppercase tracking-[0.22em] px-3 py-1.5 rounded-full bg-white text-[#0E0E12] shadow-sm">
            {badge}
          </span>
        )}
      </Link>

      <div className="mt-4 px-1">
        <Link
          href={`/stores/${storeSlug}/products/${product.id}`}
          className="block font-bold text-sm text-[#0E0E12] truncate hover:underline"
        >
          {product.title}
        </Link>
        <div className="flex items-center justify-between mt-1.5">
          <p className="font-extrabold text-sm tabular-nums">
            {formatTHB(product.priceTHB)}
            {product.compareAtPriceTHB ? (
              <span className="ml-1.5 text-[#0E0E12]/40 line-through text-xs font-medium">
                {formatTHB(product.compareAtPriceTHB)}
              </span>
            ) : null}
          </p>
          {/* Color swatch row */}
          <div className="flex items-center gap-1" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#0E0E12]" />
            <span className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
            <span className="w-3 h-3 rounded-full bg-[#A3E635]" />
            <span className="text-[10px] text-[#0E0E12]/40 font-medium">+3</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
