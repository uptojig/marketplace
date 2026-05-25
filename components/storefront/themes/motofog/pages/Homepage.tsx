'use client';

/**
 * MotoFog — racing homepage.
 *
 * Structure:
 *   1. Full-bleed racing hero with skewed banner block
 *   2. Featured products (capped 12) with angled-corner cards
 *   3. "Shop by bike type" tiles (sport / naked / adventure / scooter)
 *   4. Performance-stat callout band
 *   5. CTA: ดูสินค้าทั้งหมด {N} รายการ
 *
 * Honors the hard constraints:
 *  • Thai-primary copy
 *  • formatTHB() — no $ anywhere
 *  • Kanit black ITALIC for headings (motorsport speed)
 *  • Prompt for body
 *  • No add-to-cart popup → simple add() w/ no showConfirm()
 *  • Homepage cap 12 + "ดูสินค้าทั้งหมด N รายการ" CTA
 *  • CSS-var palette tokens (re-skin via PR #153/#154)
 *  • No hardcoded spec mock data on cards (only ambient hero band)
 */

import React from 'react';
import Link from 'next/link';
import {
  Flag,
  Gauge,
  Timer,
  Wrench,
  Zap,
  ArrowRight,
  Shield,
  Bike,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { HomepageProps, TemplateProductCard } from '@/lib/templates/types';

const HOMEPAGE_PRODUCT_CAP = 12;

const BIKE_TYPES = [
  {
    slug: 'sport',
    label: 'Sport Bike',
    desc: 'ฟูลแฟริ่ง ทรงสปอร์ตเต็มสูบ',
  },
  {
    slug: 'naked',
    label: 'Naked',
    desc: 'สตรีทไฟเตอร์ คล่องตัว',
  },
  {
    slug: 'adventure',
    label: 'Adventure',
    desc: 'ทัวริ่ง ออฟโรด',
  },
  {
    slug: 'scooter',
    label: 'Scooter',
    desc: 'สกูตเตอร์ในเมือง',
  },
] as const;

export function MotoFogHomepage({ store, products, categories }: HomepageProps) {
  const add = useCart((s) => s.add);

  const featured = products.slice(0, HOMEPAGE_PRODUCT_CAP);
  const totalCount = products.length;

  const handleAddToCart = (product: TemplateProductCard, e: React.MouseEvent) => {
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
  };

  const heroProduct = featured[0];

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--shop-bg, #0F1417)',
        color: 'var(--shop-ink, #F5F7FA)',
      }}
    >
      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Diagonal background tiles */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background:
              'linear-gradient(115deg, var(--shop-bg, #0F1417) 0%, var(--shop-bg, #0F1417) 55%, var(--shop-surface, #1A2128) 55%, var(--shop-surface, #1A2128) 100%)',
          }}
        />
        {/* Speed-line stripes */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(110deg, transparent 0 24px, var(--shop-primary, #FF6B35) 24px 26px)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Copy */}
          <div className="lg:col-span-7 space-y-6 relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-[family:var(--font-prompt)] uppercase tracking-widest font-bold"
              style={{
                background:
                  'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                color: '#0A0A0A',
              }}
            >
              <Zap className="h-3 w-3" />
              <span>Performance · Racing Tested</span>
            </div>

            <h1
              className="font-[family:var(--font-kanit)] italic font-black text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.95] tracking-tight"
              style={{ color: 'var(--shop-ink, #F5F7FA)' }}
            >
              <span className="block">เกียร์แข่ง</span>
              <span
                className="block"
                style={{ color: 'var(--shop-accent, #FFC72C)' }}
              >
                คุณภาพสนาม
              </span>
              <span className="block">ส่งตรงถึงพิท</span>
            </h1>

            <p
              className="font-[family:var(--font-prompt)] text-base sm:text-lg max-w-xl leading-relaxed"
              style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
            >
              อะไหล่แต่งซิ่ง ชุดหนังแข่ง หมวกกันน็อก Dainese, Alpinestars, Arai
              คัดมาจากแบรนด์ดังทั่วโลก ผ่านการทดสอบจริงในสนามแข่ง
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-wider transition-transform hover:-translate-y-0.5"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                  color: '#0A0A0A',
                }}
              >
                ดูสินค้าทั้งหมด {totalCount} รายการ
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/stores/${store.slug}/about`}
                className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-[family:var(--font-prompt)] text-sm uppercase tracking-wider font-bold"
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid var(--shop-border, #2B3540)',
                  color: 'var(--shop-ink, #F5F7FA)',
                }}
              >
                เรื่องราวของร้าน
              </Link>
            </div>
          </div>

          {/* Hero card — skewed product feature */}
          {heroProduct && (
            <div className="lg:col-span-5 relative z-10">
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-lg"
                style={{
                  backgroundColor: 'var(--shop-surface, #1A2128)',
                  border: '1px solid var(--shop-border, #2B3540)',
                  clipPath:
                    'polygon(0 5%, 100% 0, 100% 95%, 0 100%)',
                }}
              >
                {heroProduct.imageUrl ? (
                  <img
                    src={heroProduct.imageUrl}
                    alt={heroProduct.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Bike
                      className="h-24 w-24"
                      style={{ color: 'var(--shop-border, #2B3540)' }}
                    />
                  </div>
                )}
                {/* Top-left racing flag badge */}
                <div
                  className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-sm font-[family:var(--font-prompt)] text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    background:
                      'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                    color: '#0A0A0A',
                  }}
                >
                  <Flag className="h-3 w-3" />
                  Racing Tested
                </div>
                {/* Bottom price band */}
                <div
                  className="absolute left-6 right-6 bottom-10 backdrop-blur-sm rounded-md p-4 flex items-center justify-between gap-3"
                  style={{
                    backgroundColor: 'rgba(10,10,10,0.7)',
                    border: '1px solid var(--shop-border, #2B3540)',
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-widest font-bold mb-1"
                      style={{ color: 'var(--shop-accent, #FFC72C)' }}
                    >
                      สินค้าเด่น
                    </p>
                    <h3
                      className="font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-wide truncate"
                      style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                    >
                      {heroProduct.title}
                    </h3>
                  </div>
                  <span
                    className="font-[family:var(--font-kanit)] italic font-black text-lg tabular-nums shrink-0"
                    style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                  >
                    {formatTHB(heroProduct.priceTHB)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skewed accent band at the bottom of hero */}
        <div
          aria-hidden
          className="h-4 w-full"
          style={{
            background:
              'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 60%)',
          }}
        />
      </section>

      {/* ─── PERFORMANCE STAT CALLOUT ──────────────────────────────── */}
      <section
        className="border-b"
        style={{
          borderColor: 'var(--shop-border, #2B3540)',
          backgroundColor: 'var(--shop-surface, #1A2128)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { Icon: Gauge, label: 'ความเร็วจัดส่ง', value: '24 ชม.', desc: 'ในเขต กทม.' },
            { Icon: Timer, label: 'รับประกัน', value: '2 ปี', desc: 'แบรนด์แท้ทุกชิ้น' },
            { Icon: Wrench, label: 'ทีมช่างแนะนำ', value: '15 ปี', desc: 'ประสบการณ์แต่งรถ' },
            { Icon: Shield, label: 'มาตรฐาน', value: 'CE / ECE', desc: 'หมวก + ชุดหนัง' },
          ].map(({ Icon, label, value, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div
                className="h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-md"
                style={{
                  backgroundColor: 'var(--shop-bg, #0F1417)',
                  border: '1px solid var(--shop-border, #2B3540)',
                  color: 'var(--shop-accent, #FFC72C)',
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p
                  className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                >
                  {label}
                </p>
                <p
                  className="font-[family:var(--font-kanit)] italic font-black text-xl uppercase tabular-nums"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  {value}
                </p>
                <p
                  className="font-[family:var(--font-prompt)] text-xs"
                  style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                >
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS (cap 12) ────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <p
                className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.3em] font-bold mb-2"
                style={{ color: 'var(--shop-accent, #FFC72C)' }}
              >
                Featured · Racing Gear
              </p>
              <h2
                className="font-[family:var(--font-kanit)] italic font-black text-3xl sm:text-4xl uppercase tracking-tight"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              >
                สินค้าเด่นประจำสัปดาห์
              </h2>
            </div>
            <Link
              href={`/stores/${store.slug}/category`}
              className="hidden sm:inline-flex items-center gap-2 font-[family:var(--font-prompt)] text-xs uppercase tracking-widest font-bold border-b-2 pb-1"
              style={{
                color: 'var(--shop-ink, #F5F7FA)',
                borderColor: 'var(--shop-primary, #FF6B35)',
              }}
            >
              ดูสินค้าทั้งหมด {totalCount} รายการ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div
              className="rounded-md text-center py-16"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
                color: 'var(--shop-ink-muted, #94A3B0)',
              }}
            >
              <Bike className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-[family:var(--font-prompt)] text-sm">
                ยังไม่มีสินค้าวางจำหน่ายในขณะนี้
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="group relative flex flex-col overflow-hidden transition-transform hover:-translate-y-1"
                  style={{
                    backgroundColor: 'var(--shop-surface, #1A2128)',
                    border: '1px solid var(--shop-border, #2B3540)',
                    clipPath:
                      'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
                  }}
                >
                  {/* Image */}
                  <div
                    className="relative aspect-square overflow-hidden"
                    style={{ backgroundColor: 'var(--shop-bg, #0F1417)' }}
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bike
                          className="h-12 w-12"
                          style={{ color: 'var(--shop-border, #2B3540)' }}
                        />
                      </div>
                    )}
                    {/* Sale flag */}
                    {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                      <span
                        className="absolute top-3 left-3 px-2 py-0.5 font-[family:var(--font-prompt)] text-[10px] font-bold uppercase tracking-widest rounded-sm"
                        style={{
                          background:
                            'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                          color: '#0A0A0A',
                        }}
                      >
                        ลดราคา
                      </span>
                    )}
                    {/* Category */}
                    {p.categoryName && (
                      <span
                        className="absolute top-3 right-3 px-2 py-0.5 font-[family:var(--font-prompt)] text-[10px] font-bold uppercase tracking-widest rounded-sm"
                        style={{
                          backgroundColor: 'rgba(10,10,10,0.7)',
                          color: 'var(--shop-accent, #FFC72C)',
                          border: '1px solid var(--shop-border, #2B3540)',
                        }}
                      >
                        {p.categoryName}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1 gap-3">
                    <h3
                      className="font-[family:var(--font-prompt)] text-sm font-semibold leading-snug line-clamp-2"
                      style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                    >
                      {p.title}
                    </h3>

                    <div className="mt-auto flex items-end justify-between gap-2">
                      <div className="flex flex-col">
                        {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                          <span
                            className="font-[family:var(--font-prompt)] text-[11px] line-through"
                            style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                          >
                            {formatTHB(p.compareAtPriceTHB)}
                          </span>
                        )}
                        <span
                          className="font-[family:var(--font-kanit)] italic font-black text-lg tabular-nums"
                          style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                        >
                          {formatTHB(p.priceTHB)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(p, e)}
                        aria-label={`เพิ่ม ${p.title} ลงตะกร้า`}
                        className="px-3 h-9 rounded-sm font-[family:var(--font-prompt)] text-[10px] font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5"
                        style={{
                          background:
                            'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                          color: '#0A0A0A',
                        }}
                      >
                        เพิ่มลงตะกร้า
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile CTA */}
          <div className="mt-10 text-center sm:hidden">
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center gap-2 px-5 h-11 rounded-md font-[family:var(--font-kanit)] italic font-black text-xs uppercase tracking-widest"
              style={{
                background:
                  'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                color: '#0A0A0A',
              }}
            >
              ดูสินค้าทั้งหมด {totalCount} รายการ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SHOP BY BIKE TYPE ─────────────────────────────────────── */}
      <section
        className="py-16 border-t"
        style={{
          borderColor: 'var(--shop-border, #2B3540)',
          backgroundColor: 'var(--shop-surface, #1A2128)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p
              className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.3em] font-bold mb-2"
              style={{ color: 'var(--shop-accent, #FFC72C)' }}
            >
              Bike Type · เลือกตามทรงรถ
            </p>
            <h2
              className="font-[family:var(--font-kanit)] italic font-black text-3xl sm:text-4xl uppercase tracking-tight"
              style={{ color: 'var(--shop-ink, #F5F7FA)' }}
            >
              ช้อปตามประเภทรถ
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {BIKE_TYPES.map((bike, i) => (
              <Link
                key={bike.slug}
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(bike.label)}`}
                className="group relative overflow-hidden p-6 transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--shop-bg, #0F1417)',
                  border: '1px solid var(--shop-border, #2B3540)',
                  clipPath:
                    i % 2 === 0
                      ? 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)'
                      : 'polygon(16px 0, 100% 0, 100% 100%, 0 100%, 0 16px)',
                }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(110deg, transparent 0 16px, var(--shop-primary, #FF6B35) 16px 18px)',
                  }}
                />
                <Bike
                  className="h-9 w-9 mb-4 relative z-10"
                  style={{ color: 'var(--shop-accent, #FFC72C)' }}
                />
                <p
                  className="relative z-10 font-[family:var(--font-prompt)] text-[10px] uppercase tracking-widest font-bold mb-1"
                  style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                >
                  {bike.label}
                </p>
                <h3
                  className="relative z-10 font-[family:var(--font-kanit)] italic font-black text-xl uppercase tracking-tight mb-1"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  {bike.desc}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORY RAIL (from data) ─────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p
              className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.3em] font-bold mb-4"
              style={{ color: 'var(--shop-accent, #FFC72C)' }}
            >
              หมวดสินค้าทั้งหมด
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                  className="px-4 py-2 rounded-full font-[family:var(--font-prompt)] text-xs uppercase tracking-widest font-bold transition-colors"
                  style={{
                    backgroundColor: 'var(--shop-surface, #1A2128)',
                    border: '1px solid var(--shop-border, #2B3540)',
                    color: 'var(--shop-ink, #F5F7FA)',
                  }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default MotoFogHomepage;
