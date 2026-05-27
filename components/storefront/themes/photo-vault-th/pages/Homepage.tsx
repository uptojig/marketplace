'use client';

import React from 'react';
import Link from 'next/link';
import {
  Aperture,
  Download,
  Camera,
  Sun,
  Moon,
  Film,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
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

const DEFAULT_HEADLINE = 'พรีเซ็ตและ LUT\nสำหรับช่างภาพ';
const DEFAULT_SUB =
  'รวมไฟล์ .xmp .acr .cube คุณภาพระดับสตูดิโอ — ปรับสีถ่ายในเสี้ยววินาที ใช้ได้ตลอดชีพ ดาวน์โหลดทันทีหลังชำระเงิน';
const DEFAULT_CTA = 'เริ่มต้นช้อป';

const CATEGORY_ICONS = [Sun, Moon, Film, Camera] as const;

export function Homepage({ store, products, categories, landingContent }: Props) {
  const headline = landingContent?.heroHeadline?.trim() || DEFAULT_HEADLINE;
  const sub = landingContent?.heroSubheadline?.trim() || DEFAULT_SUB;
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || DEFAULT_CTA;
  const ctaUrl =
    landingContent?.heroCtaUrl?.trim() ||
    `/stores/${store.slug}/category`;
  const heroImage = landingContent?.heroImageUrl?.trim() || null;

  const add = useCart((s) => s.add);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
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

  const featured = products.slice(0, 4);
  const trending = products.slice(4, 12);

  return (
    <div className="bg-[#0C0A09] text-[#F5F5F4] font-[family:var(--font-prompt)]">
      {/* Hero */}
      <section className="pv-grain relative overflow-hidden border-b border-[#44403C]">
        {/* Aperture-blade orbital decoration */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[34rem] h-[34rem] rounded-full bg-gradient-to-br from-[#F59E0B]/15 via-[#E11D48]/8 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-[#FBBF24]/10 via-[#F59E0B]/5 to-transparent blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] font-semibold">
              <span className="w-8 h-px bg-[#FBBF24]" />
              <Aperture className="w-3.5 h-3.5" />
              <span>Photo Vault · Edition {new Date().getFullYear()}</span>
            </div>

            <h1 className="font-[family:var(--font-kanit)] text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight whitespace-pre-line">
              <span className="pv-text-gold">{headline}</span>
            </h1>

            <p className="text-[#A8A29E] text-base sm:text-lg max-w-xl leading-relaxed border-l-2 border-[#F59E0B] pl-5">
              {sub}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold tracking-wide text-base transition-colors pv-glow-amber"
              >
                <Download className="w-5 h-5" />
                {ctaLabel}
              </Link>
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center justify-center gap-2 h-14 px-8 border border-[#44403C] hover:border-[#F59E0B] hover:text-[#F59E0B] text-[#F5F5F4] font-[family:var(--font-kanit)] font-bold tracking-wide text-base transition-colors"
              >
                ดูตัวอย่าง
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#44403C]">
              <div>
                <p className="font-[family:var(--font-kanit)] text-2xl font-bold text-[#F5F5F4]">
                  100%
                </p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#A8A29E] mt-1">
                  Lifetime License
                </p>
              </div>
              <div>
                <p className="font-[family:var(--font-kanit)] text-2xl font-bold text-[#FBBF24]">
                  .xmp .cube
                </p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#A8A29E] mt-1">
                  Lr / Ps / DaVinci
                </p>
              </div>
              <div>
                <p className="font-[family:var(--font-kanit)] text-2xl font-bold text-[#E11D48]">
                  &lt; 60s
                </p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#A8A29E] mt-1">
                  Instant Download
                </p>
              </div>
            </div>
          </div>

          {/* Hero visual — film-strip aperture */}
          <div className="relative aspect-[4/5] max-w-lg mx-auto w-full">
            <div className="absolute inset-0 border border-[#44403C] bg-gradient-to-br from-[#1C1917] via-[#0C0A09] to-[#1C1917] overflow-hidden">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt={store.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-pulse bg-gradient-radial from-[#F59E0B]/30 to-transparent blur-2xl" />
                    <Aperture
                      className="relative w-48 h-48 text-[#F59E0B]"
                      strokeWidth={0.75}
                    />
                  </div>
                </div>
              )}
              {/* Film perforations */}
              <div className="absolute top-0 left-0 right-0 h-6 flex items-center justify-around px-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-3 bg-[#0C0A09] border border-[#44403C]"
                  />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-around px-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-3 bg-[#0C0A09] border border-[#44403C]"
                  />
                ))}
              </div>
            </div>
            {/* EXIF chip overlay */}
            <div className="absolute -bottom-4 -left-4 bg-[#0C0A09] border border-[#F59E0B] px-4 py-3 pv-glow-amber">
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#A8A29E]">
                Preset
              </p>
              <p className="font-[family:var(--font-kanit)] text-sm font-bold text-[#FBBF24] mt-0.5">
                Golden Hour · ƒ/1.8
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category rail */}
      {categories.length > 0 && (
        <section className="border-b border-[#44403C] bg-[#0C0A09]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[family:var(--font-kanit)] text-sm uppercase tracking-[0.32em] text-[#F59E0B] font-bold inline-flex items-center gap-2">
                <span className="w-8 h-px bg-[#F59E0B]" />
                Collections
              </h2>
              <Link
                href={`/stores/${store.slug}/category`}
                className="text-xs uppercase tracking-[0.24em] text-[#A8A29E] hover:text-[#F59E0B] transition-colors inline-flex items-center gap-1"
              >
                ทั้งหมด <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-nowrap overflow-x-auto gap-3 hide-scrollbar">
              {categories.slice(0, 8).map((cat, idx) => {
                const Icon = CATEGORY_ICONS[idx % CATEGORY_ICONS.length];
                return (
                  <Link
                    key={cat}
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                    className="shrink-0 pv-chip h-12 px-5 flex items-center gap-2 group transition-all"
                  >
                    <Icon className="w-4 h-4 text-[#F59E0B] group-hover:text-[#FBBF24] transition-colors" />
                    <span className="font-[family:var(--font-kanit)] text-sm font-semibold tracking-wide text-[#F5F5F4]">
                      {cat}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Vault — 4-up gallery grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#44403C]">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] font-semibold mb-2">
              Featured Vault
            </p>
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight">
              สินค้าแนะนำ
            </h2>
          </div>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-2 h-12 px-6 border border-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#0C0A09] text-[#F59E0B] font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.24em] transition-colors"
          >
            ดูทั้งหมด <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="border border-[#44403C] bg-[#1C1917] p-16 text-center">
            <Aperture className="w-12 h-12 text-[#44403C] mx-auto mb-4" strokeWidth={1} />
            <p className="font-[family:var(--font-kanit)] text-xl font-bold text-[#F5F5F4]">
              ยังไม่มีพรีเซ็ตในร้าน
            </p>
            <p className="text-sm text-[#A8A29E] mt-2">
              เพิ่มสินค้าผ่านระบบจัดการร้านเพื่อเริ่มขาย
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((product, idx) => {
              const hasDiscount =
                product.compareAtPriceTHB &&
                product.compareAtPriceTHB > product.priceTHB;
              const discountPct = hasDiscount
                ? Math.round(
                    ((product.compareAtPriceTHB! - product.priceTHB) /
                      product.compareAtPriceTHB!) *
                      100,
                  )
                : 0;
              return (
                <Link
                  key={product.id}
                  href={`/stores/${store.slug}/products/${product.id}`}
                  className="group relative bg-[#1C1917] border border-[#44403C] hover:border-[#F59E0B] transition-colors flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#0C0A09]">
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 z-10 bg-[#E11D48] text-white text-[10px] font-bold uppercase tracking-[0.24em] px-2.5 py-1 pv-glow-rose">
                        - {discountPct}%
                      </div>
                    )}
                    {idx === 0 && !hasDiscount && (
                      <div className="absolute top-3 left-3 z-10 bg-[#F59E0B] text-[#0C0A09] text-[10px] font-bold uppercase tracking-[0.24em] px-2.5 py-1">
                        Featured
                      </div>
                    )}
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1C1917] via-[#0C0A09] to-[#1C1917]">
                        <Aperture
                          className="w-12 h-12 text-[#44403C] group-hover:text-[#F59E0B] transition-colors"
                          strokeWidth={1}
                        />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-transparent to-transparent opacity-60" />
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      aria-label="เพิ่มในตะกร้า"
                      className="absolute bottom-3 right-3 z-10 w-10 h-10 bg-[#F59E0B] text-[#0C0A09] flex items-center justify-center hover:bg-[#FBBF24] transition-colors opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-300"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col">
                    {product.categoryName && (
                      <p className="text-[10px] uppercase tracking-[0.32em] text-[#A8A29E]">
                        {product.categoryName}
                      </p>
                    )}
                    <h3 className="font-[family:var(--font-kanit)] font-bold text-base leading-tight line-clamp-2 flex-1 text-[#F5F5F4] group-hover:text-[#FBBF24] transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="font-[family:var(--font-kanit)] font-bold text-lg text-[#F59E0B]">
                        {formatTHB(product.priceTHB)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-[#57534E] line-through">
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
      </section>

      {/* Trending — denser 4-col rail */}
      {trending.length > 0 && (
        <section className="border-t border-[#44403C] bg-[#1C1917]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-end justify-between mb-8 pb-5 border-b border-[#44403C]">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] font-semibold mb-2">
                  Trending
                </p>
                <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-4xl font-bold tracking-tight">
                  มาแรงในวอลต์
                </h2>
              </div>
              <Sparkles className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {trending.map((product) => {
                const hasDiscount =
                  product.compareAtPriceTHB &&
                  product.compareAtPriceTHB > product.priceTHB;
                return (
                  <Link
                    key={product.id}
                    href={`/stores/${store.slug}/products/${product.id}`}
                    className="group block bg-[#0C0A09] border border-[#44403C] hover:border-[#F59E0B] transition-colors"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1C1917] to-[#0C0A09]">
                          <Film
                            className="w-10 h-10 text-[#44403C] group-hover:text-[#F59E0B] transition-colors"
                            strokeWidth={1}
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-transparent to-transparent opacity-50" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm line-clamp-1 text-[#F5F5F4] group-hover:text-[#FBBF24] transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-[family:var(--font-kanit)] font-bold text-base text-[#F59E0B]">
                          {formatTHB(product.priceTHB)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] text-[#57534E] line-through">
                            {formatTHB(product.compareAtPriceTHB!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA stripe */}
      <section className="relative pv-grain border-t border-[#44403C] bg-gradient-to-r from-[#0C0A09] via-[#1C1917] to-[#0C0A09] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.12),transparent_60%)]"
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Aperture
            className="w-12 h-12 text-[#F59E0B] mx-auto mb-5"
            strokeWidth={1}
          />
          <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="pv-text-gold">เริ่มต้นโทนของคุณวันนี้</span>
          </h3>
          <p className="text-[#A8A29E] max-w-xl mx-auto mb-8 text-sm sm:text-base">
            สมัครรับข่าวสารและรับโค้ดส่วนลด 15% สำหรับการสั่งซื้อครั้งแรก พร้อมพรีเซ็ตทดลองใช้ฟรี
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 h-14 px-10 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold tracking-wide text-base transition-colors pv-glow-amber"
          >
            ค้นพบพรีเซ็ตทั้งหมด
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
