'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Truck, Package, Sparkles } from 'lucide-react';
import { formatTHB } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}

export interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: string[];
}

const FEATURED_CAP = 12;

const TRUST_BLOCKS = [
  {
    icon: Truck,
    label: 'DELIVERED',
    title: 'ส่งฟรีทั่วประเทศ',
    body: 'ห่อพรีเมียม กล่องแข็ง ไม่ยับ ไม่ช้ำ',
  },
  {
    icon: Shield,
    label: 'GUARANTEED',
    title: 'รับประกันคุณภาพ',
    body: 'เปลี่ยนคืนได้ภายใน 14 วัน หากไม่พอใจ',
  },
  {
    icon: Sparkles,
    label: 'CRAFTED',
    title: 'คัดสรรอย่างพิถีพิถัน',
    body: 'ทุกชิ้นผ่านการตรวจสอบก่อนส่งจริง',
  },
];

/**
 * BlackWrapp — premium dark Homepage.
 *
 * Hero: large product image floating on near-black with a single
 * accent CTA + a subtle glow rim around the product silhouette.
 * Below the hero: category strip, trust band, and a product grid
 * capped at FEATURED_CAP with a single "ดูสินค้าทั้งหมด N รายการ" CTA.
 */
export function Homepage({ store, products, categories }: HomepageProps) {
  const featured = products.slice(0, FEATURED_CAP);
  const heroProduct =
    products.find((p) => Boolean(p.imageUrl)) ?? products[0] ?? null;
  const totalCount = products.length;

  const urls = {
    shop: `/stores/${store.slug}/category`,
  };

  return (
    <main
      className="font-[family:var(--font-prompt)]"
      style={{ background: '#0A0A0A', color: '#FAFAFA' }}
    >
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* radial accent glow behind product silhouette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(60% 50% at 75% 50%, var(--shop-primary, #00FF88)18 0%, transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[80vh] lg:min-h-[88vh] items-center py-16 lg:py-24">
            {/* Copy */}
            <div className="lg:col-span-5 space-y-7">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.35em] uppercase text-white/70"
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: 'var(--shop-primary, #00FF88)',
                    boxShadow: '0 0 8px var(--shop-primary, #00FF88)',
                  }}
                />
                DELIVERED · PREMIUM WRAP
              </span>
              <h1 className="font-[family:var(--font-kanit)] font-medium text-4xl sm:text-5xl lg:text-6xl leading-[1.15] tracking-[0.01em] text-white">
                ห่อพรีเมียม
                <br />
                ส่งถึงมือลูกค้า
                <br />
                <span
                  style={{
                    color: 'var(--shop-primary, #00FF88)',
                  }}
                >
                  ทุกชิ้น
                </span>
              </h1>
              <p className="text-base leading-relaxed text-white/65 max-w-md">
                คัดสรรกล่องและวัสดุห่อสำหรับร้านค้าออนไลน์ — สั่งงานครบจบในที่เดียว
                ส่งฟรีทั่วประเทศ ขั้นต่ำตามที่ระบุ
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={urls.shop}
                  className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-[family:var(--font-kanit)] font-medium text-sm tracking-[0.18em] transition-all duration-300"
                  style={{
                    background: 'var(--shop-primary-gradient, var(--shop-primary, #00FF88))',
                    color: '#0A0A0A',
                    boxShadow: '0 0 32px var(--shop-primary, #00FF88)40',
                  }}
                >
                  ดูสินค้าทั้งหมด
                  <ArrowRight
                    size={15}
                    strokeWidth={2.25}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href={`/stores/${store.slug}/about`}
                  className="font-[family:var(--font-prompt)] text-[12px] tracking-[0.2em] uppercase text-white/70 hover:text-white transition-colors duration-300"
                >
                  เกี่ยวกับเรา
                </Link>
              </div>
            </div>

            {/* Hero image card */}
            <div className="lg:col-span-7 relative">
              <div
                className="relative aspect-[5/4] rounded-2xl overflow-hidden border border-white/10"
                style={{
                  background:
                    'linear-gradient(135deg, #141414 0%, #0A0A0A 100%)',
                  boxShadow:
                    '0 0 80px var(--shop-primary, #00FF88)10, inset 0 0 0 1px rgba(255,255,255,0.04)',
                }}
              >
                {heroProduct?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroProduct.imageUrl}
                    alt={heroProduct.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="font-[family:var(--font-kanit)] font-medium text-7xl sm:text-8xl tracking-[0.35em] uppercase"
                      style={{ color: 'rgba(255,255,255,0.04)' }}
                    >
                      {store.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Floating tag */}
                <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur px-3 py-1.5 border border-white/10">
                  <Package
                    size={12}
                    strokeWidth={2.25}
                    style={{ color: 'var(--shop-primary, #00FF88)' }}
                  />
                  <span className="text-[10px] tracking-[0.25em] uppercase text-white/80">
                    NEW DROP
                  </span>
                </div>

                {/* Floating price strip if hero product is known */}
                {heroProduct && (
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div className="rounded-xl bg-black/50 backdrop-blur px-4 py-3 border border-white/10 max-w-[68%]">
                      <p className="font-[family:var(--font-kanit)] font-medium text-sm text-white truncate">
                        {heroProduct.title}
                      </p>
                      <p
                        className="mt-1 text-base font-medium tabular-nums"
                        style={{ color: 'var(--shop-primary, #00FF88)' }}
                      >
                        {formatTHB(heroProduct.priceTHB)}
                      </p>
                    </div>
                    <Link
                      href={`/stores/${store.slug}/products/${heroProduct.id}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105"
                      style={{
                        background: 'var(--shop-primary-gradient, var(--shop-primary, #00FF88))',
                        color: '#0A0A0A',
                        boxShadow: '0 0 24px var(--shop-primary, #00FF88)55',
                      }}
                      aria-label={`ดูสินค้า ${heroProduct.title}`}
                    >
                      <ArrowRight size={16} strokeWidth={2.25} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category strip ── */}
      {categories.length > 0 && (
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[family:var(--font-kanit)] font-medium text-sm tracking-[0.25em] uppercase text-white">
                หมวดหมู่
              </h2>
              <Link
                href={urls.shop}
                className="text-[11px] tracking-[0.18em] uppercase text-white/55 hover:text-white transition-colors"
              >
                ดูทั้งหมด
              </Link>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {categories.slice(0, 10).map((cat) => (
                <Link
                  key={cat}
                  href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs tracking-[0.08em] text-white/70 hover:text-white hover:border-[var(--shop-primary,#00FF88)] transition-all duration-300"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured products ── */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div className="space-y-2">
              <span className="text-[10px] tracking-[0.35em] uppercase text-white/50">
                COLLECTION
              </span>
              <h2 className="font-[family:var(--font-kanit)] font-medium text-3xl sm:text-4xl tracking-[0.02em] text-white">
                สินค้าแนะนำ
              </h2>
            </div>
            <Link
              href={urls.shop}
              className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white/55 hover:text-white transition-colors"
            >
              ดูทั้งหมด
              <ArrowRight size={13} strokeWidth={1.75} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-sm text-white/40">ยังไม่มีสินค้าในร้านนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {featured.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-[var(--shop-primary,#00FF88)] focus-within:border-[var(--shop-primary,#00FF88)]"
                  style={{ background: '#141414' }}
                >
                  <Link
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="block relative aspect-square overflow-hidden bg-[#0A0A0A]"
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package
                          size={32}
                          strokeWidth={1.25}
                          className="text-white/15"
                        />
                      </div>
                    )}

                    {p.categoryName && (
                      <span className="absolute top-3 left-3 rounded-full bg-black/55 backdrop-blur px-2.5 py-1 text-[9px] tracking-[0.25em] uppercase text-white/80 border border-white/10">
                        {p.categoryName}
                      </span>
                    )}
                  </Link>

                  <div className="p-4 space-y-3">
                    <Link
                      href={`/stores/${store.slug}/products/${p.id}`}
                      className="block"
                    >
                      <h3 className="font-[family:var(--font-prompt)] text-sm font-medium text-white line-clamp-2 leading-snug min-h-[2.5rem]">
                        {p.title}
                      </h3>
                    </Link>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span
                          className="font-[family:var(--font-kanit)] font-medium text-base tabular-nums truncate"
                          style={{ color: 'var(--shop-primary, #00FF88)' }}
                        >
                          {formatTHB(p.priceTHB)}
                        </span>
                        {p.compareAtPriceTHB ? (
                          <span className="text-[11px] text-white/35 line-through tabular-nums">
                            {formatTHB(p.compareAtPriceTHB)}
                          </span>
                        ) : null}
                      </div>
                      <Link
                        href={`/stores/${store.slug}/products/${p.id}`}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white hover:border-[var(--shop-primary,#00FF88)] transition-all"
                        aria-label={`ดูสินค้า ${p.title}`}
                      >
                        <ArrowRight size={13} strokeWidth={1.75} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Single shop-all CTA when there are more products than the cap */}
          {totalCount > FEATURED_CAP && (
            <div className="mt-12 text-center">
              <Link
                href={urls.shop}
                className="inline-flex items-center gap-2 rounded-full border px-7 py-3.5 font-[family:var(--font-kanit)] text-sm tracking-[0.2em] uppercase transition-all duration-300"
                style={{
                  borderColor: 'var(--shop-primary, #00FF88)',
                  color: 'var(--shop-primary, #00FF88)',
                }}
              >
                ดูสินค้าทั้งหมด {totalCount} รายการ
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Trust band ── */}
      <section
        className="border-t border-white/5"
        style={{ background: '#0A0A0A' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {TRUST_BLOCKS.map(({ icon: Icon, label, title, body }) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 p-6 space-y-3"
                style={{ background: '#141414' }}
              >
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    background: 'var(--shop-primary, #00FF88)18',
                    color: 'var(--shop-primary, #00FF88)',
                    boxShadow: '0 0 18px var(--shop-primary, #00FF88)25',
                  }}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/50">
                  {label}
                </p>
                <h3 className="font-[family:var(--font-kanit)] font-medium text-base text-white">
                  {title}
                </h3>
                <p className="text-xs text-white/55 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Homepage;
