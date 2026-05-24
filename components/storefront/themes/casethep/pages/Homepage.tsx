'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Smartphone, Star, Sparkles } from 'lucide-react';
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
  heroCtaUrl?: string | null;
  heroImageUrl?: string | null;
}

interface Props {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: string[];
  landingContent?: LandingContent | null;
}

const DEFAULT_HEADLINE = 'เคสมือถือ\nสไตล์คุณ';
const DEFAULT_SUB = 'คัดสรรเคสคุณภาพ ลายสวย สีสันโดน — รองรับ iPhone และ Samsung ทุกรุ่นยอดนิยม';
const DEFAULT_CTA = 'ช้อปคอลเลกชัน';

const DEVICES = [
  { id: 'iphone-15', label: 'iPhone 15 / Pro', sub: 'รุ่นใหม่ล่าสุด' },
  { id: 'iphone-14', label: 'iPhone 14 / Pro', sub: 'ขายดีตลอดกาล' },
  { id: 'iphone-13', label: 'iPhone 13', sub: 'ราคาคุ้ม' },
  { id: 'samsung-s24', label: 'Samsung S24', sub: 'รุ่นเรือธง' },
  { id: 'samsung-s23', label: 'Samsung S23', sub: 'พร้อมส่ง' },
  { id: 'all', label: 'รุ่นอื่นๆ', sub: 'ดูทั้งหมด' },
];

// Trending color swatches — purely decorative, real swatch logic
// belongs on the PDP / variant picker. These are CSS gradient stops
// so they render without external data.
const TRENDING_COLORS = [
  { name: 'Coral Pink', hex: '#FF8597' },
  { name: 'Cream', hex: '#F4ECDC' },
  { name: 'Sage Green', hex: '#A8C5A2' },
  { name: 'Sky Blue', hex: '#A7C8E5' },
  { name: 'Lavender', hex: '#C6B4D8' },
  { name: 'Midnight', hex: '#22232A' },
  { name: 'Mocha', hex: '#8A6F5C' },
  { name: 'Sand', hex: '#E2C9A0' },
];

const REVIEWS = [
  {
    name: 'พลอย',
    rating: 5,
    text: 'เคสสวยมาก สีตรงปก ส่งไว แพ็คดีไม่บุบเลย จะกลับมาซื้ออีกแน่นอนค่ะ',
  },
  {
    name: 'มิ้นท์',
    rating: 5,
    text: 'ใส่แล้วน่ารักมาก กันกระแทกได้จริง ปุ่มกดยังลื่นปกติ ตอบแชทไวด้วยค่ะ',
  },
  {
    name: 'จูน',
    rating: 5,
    text: 'สีจริงสวยกว่ารูปอีก งานเนี้ยบมาก เพื่อนถามว่าซื้อที่ไหน ราคาดีงาม',
  },
];

export function Homepage({ store, products, categories, landingContent }: Props) {
  const headline = landingContent?.heroHeadline?.trim() || DEFAULT_HEADLINE;
  const sub = landingContent?.heroSubheadline?.trim() || DEFAULT_SUB;
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || DEFAULT_CTA;
  const ctaUrl = landingContent?.heroCtaUrl?.trim() || `/stores/${store.slug}/category`;
  const heroImage = landingContent?.heroImageUrl?.trim() || products[0]?.imageUrl || null;

  // Homepage cap: 12 + "ดูสินค้าทั้งหมด N รายการ" CTA when length > 12
  const FEATURED_CAP = 12;
  const featured = products.slice(0, FEATURED_CAP);
  const overflow = products.length > FEATURED_CAP;

  return (
    <div
      className="font-[family:var(--font-prompt)]"
      style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
    >
      {/* Hero — large product floating with subtle gradient backdrop */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              'radial-gradient(60% 60% at 80% 30%, rgba(255,90,106,0.18) 0%, rgba(255,90,106,0) 60%), radial-gradient(50% 50% at 15% 80%, rgba(255,213,128,0.30) 0%, rgba(255,213,128,0) 65%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span
              className="inline-block rounded-full px-3 py-1 text-[11px] font-medium tracking-wide"
              style={{
                background: 'rgba(255,90,106,0.10)',
                color: 'var(--shop-primary, #FF5A6A)',
              }}
            >
              คอลเลกชันใหม่
            </span>
            <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] whitespace-pre-line">
              {headline}
            </h1>
            <p className="text-base sm:text-lg text-[color:var(--shop-ink-muted,#6B7280)] max-w-md leading-relaxed">
              {sub}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 text-white text-sm font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
                }}
              >
                {ctaLabel} <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 text-sm font-medium border border-[color:var(--shop-ink,#1A1A1F)]/15 hover:border-[color:var(--shop-primary,#FF5A6A)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
              >
                เลือกรุ่นโทรศัพท์
              </Link>
            </div>
          </div>

          {/* Hero product — floating with shadow */}
          <div className="relative mx-auto w-full max-w-md aspect-square">
            <div
              className="absolute -inset-4 rounded-3xl"
              aria-hidden
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,90,106,0.12) 0%, rgba(255,213,128,0.20) 100%)',
                filter: 'blur(20px)',
              }}
            />
            <div
              className="relative w-full h-full rounded-3xl overflow-hidden bg-white"
              style={{
                boxShadow:
                  '0 30px 60px -20px rgba(0,0,0,0.20), 0 10px 20px -5px rgba(0,0,0,0.06)',
              }}
            >
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, #FFE5E9 0%, #FFF4E5 50%, #E9F4FF 100%)',
                  }}
                >
                  <Smartphone className="w-24 h-24 text-[color:var(--shop-primary,#FF5A6A)]/40" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Device picker — "เลือกรุ่น" tile row */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold tracking-tight">
                เลือกรุ่นของคุณ
              </h2>
              <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-1">
                เลือกรุ่นโทรศัพท์เพื่อดูเคสที่รองรับ
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DEVICES.map((d) => (
              <Link
                key={d.id}
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(d.label)}`}
                className="group rounded-2xl bg-white p-4 hover:-translate-y-1 transition-transform"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                  style={{
                    background: 'rgba(255,90,106,0.10)',
                    color: 'var(--shop-primary, #FF5A6A)',
                  }}
                >
                  <Smartphone className="w-4 h-4" />
                </div>
                <p className="font-[family:var(--font-kanit)] font-medium text-sm leading-snug">{d.label}</p>
                <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)] mt-0.5">{d.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured cases grid — square aspect, color dots below name, price + sale tag */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold tracking-tight">
                เคสมาใหม่
              </h2>
              <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-1">
                สั่งเลย ส่งเร็วภายใน 1–3 วันทำการ
              </p>
            </div>
            <Link
              href={`/stores/${store.slug}/category`}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[color:var(--shop-primary,#FF5A6A)] hover:underline"
            >
              ดูทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div
              className="rounded-2xl bg-white p-10 text-center"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-[color:var(--shop-primary,#FF5A6A)]" />
              <p className="font-[family:var(--font-kanit)] text-lg font-semibold">
                ยังไม่มีสินค้าในร้าน
              </p>
              <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-1">
                เพิ่มสินค้าผ่านระบบจัดการร้านได้เลย
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((p, idx) => {
                const hasDiscount =
                  p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB;
                const discountPct = hasDiscount
                  ? Math.round(
                      ((p.compareAtPriceTHB! - p.priceTHB) / p.compareAtPriceTHB!) * 100,
                    )
                  : 0;
                // Decorative swatches — every card hints 4 colors.
                const swatches = [
                  TRENDING_COLORS[idx % TRENDING_COLORS.length],
                  TRENDING_COLORS[(idx + 2) % TRENDING_COLORS.length],
                  TRENDING_COLORS[(idx + 4) % TRENDING_COLORS.length],
                  TRENDING_COLORS[(idx + 6) % TRENDING_COLORS.length],
                ];
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group rounded-2xl bg-white overflow-hidden hover:-translate-y-1 transition-transform flex flex-col"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}
                  >
                    <div className="relative aspect-square bg-[#F5F1EB] overflow-hidden">
                      {hasDiscount && (
                        <span
                          className="absolute top-3 left-3 z-10 rounded-full text-[10px] font-semibold px-2.5 py-1 text-white"
                          style={{ background: 'var(--shop-primary, #FF5A6A)' }}
                        >
                          -{discountPct}%
                        </span>
                      )}
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Smartphone className="w-10 h-10 text-[color:var(--shop-primary,#FF5A6A)]/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
                      {p.categoryName && (
                        <p className="text-[10px] uppercase tracking-wide text-[color:var(--shop-ink-muted,#6B7280)]">
                          {p.categoryName}
                        </p>
                      )}
                      <h3 className="font-[family:var(--font-kanit)] font-medium text-sm leading-snug line-clamp-2 flex-1">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5" aria-label="สีให้เลือก">
                        {swatches.map((c, i) => (
                          <span
                            key={`${p.id}-${i}`}
                            className="w-3 h-3 rounded-full border border-black/5"
                            style={{ background: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-[family:var(--font-kanit)] font-semibold text-base">
                          {formatTHB(p.priceTHB)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] line-through">
                            {formatTHB(p.compareAtPriceTHB!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* "ดูสินค้าทั้งหมด N รายการ" CTA — gated on length > 12 */}
          {overflow && (
            <div className="mt-8 flex justify-center">
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center gap-2 rounded-full h-11 px-6 text-sm font-medium border border-[color:var(--shop-ink,#1A1A1F)]/15 hover:border-[color:var(--shop-primary,#FF5A6A)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
              >
                ดูสินค้าทั้งหมด {products.length} รายการ <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trending colors swatch wall */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto rounded-3xl bg-white p-6 sm:p-10" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold tracking-tight">
                สีมาแรงปีนี้
              </h2>
              <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-1">
                คัดสีโทนฮอตจากเทรนด์ปาเลทล่าสุด
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
            {TRENDING_COLORS.map((c) => (
              <div key={c.name} className="text-center">
                <div
                  className="aspect-square rounded-full mb-2 mx-auto w-14 sm:w-16 border border-black/5"
                  style={{ background: c.hex }}
                  aria-hidden
                />
                <p className="text-[11px] sm:text-xs text-[color:var(--shop-ink-muted,#6B7280)]">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories rail (only if real categories exist) */}
      {categories.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-5">
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold tracking-tight">
                หมวดหมู่
              </h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {categories.slice(0, 12).map((cat) => (
                <Link
                  key={cat}
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                  className="inline-flex items-center rounded-full bg-white px-4 h-9 text-sm border border-[color:var(--shop-ink,#1A1A1F)]/10 hover:border-[color:var(--shop-primary,#FF5A6A)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews snippet */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold tracking-tight">
                ลูกค้าพูดถึงเรา
              </h2>
              <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-1">
                คะแนนเฉลี่ย 4.9 / 5 จากรีวิวทั้งหมด
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white p-5"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}
              >
                <div className="flex gap-0.5 mb-3 text-[color:var(--shop-primary,#FF5A6A)]" aria-label={`${r.rating} ดาว`}>
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-[color:var(--shop-ink,#1A1A1F)]">“{r.text}”</p>
                <p className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] mt-3">— คุณ{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
