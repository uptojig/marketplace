'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Sparkles,
  Star,
  Coins,
  Crown,
  ChevronRight,
  Wand2,
  Trophy,
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

const DEFAULT_HEADLINE = 'เลเวลอัพ\nชีวิตด้วยมู';
const DEFAULT_SUB =
  'รวมวอลเปเปอร์มงคลสายมู หนุนดวง เสริมโชค สำหรับมือถือ + เดสก์ท็อป — ดาวน์โหลดทันทีหลังชำระเงิน เลเวลอัพชีวิตในคลิกเดียว ⭐';
const DEFAULT_CTA = 'มูเลย';

const CATEGORY_ICONS = [Coins, Star, Crown, Sparkles, Trophy, Wand2] as const;

/**
 * MysticMu Homepage — Mario "world map" style. Hero on Mario sky with
 * floating coin/star blocks, category pipe-shortcut rail, "Power-Up"
 * featured grid, trending row, and an item-block CTA. All copy reads
 * from `landingContent` first; defaults shown only when empty.
 */
export function Homepage({ store, products, categories, landingContent }: Props) {
  const headline = landingContent?.heroHeadline?.trim() || DEFAULT_HEADLINE;
  const sub = landingContent?.heroSubheadline?.trim() || DEFAULT_SUB;
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || DEFAULT_CTA;
  const ctaUrl = landingContent?.heroCtaUrl?.trim() || `/stores/${store.slug}/category`;
  const heroImage = landingContent?.heroImageUrl?.trim() || null;

  const add = useCart((s) => s.add);

  const handleAdd = (product: Product, e: React.MouseEvent) => {
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

  const buddhistYear = new Date().getFullYear() + 543;

  return (
    <div className="bg-[#5C94FC] text-[#1A1A2E] font-[family:var(--font-prompt)]">
      {/* Hero — Mario sky world */}
      <section className="relative overflow-hidden border-b-4 border-[#1A1A2E] pixel-clouds">
        {/* Floating decorative coin block */}
        <div
          className="absolute top-8 right-6 hidden md:flex w-20 h-20 bg-[#FFD700] border-4 border-[#1A1A2E] items-center justify-center shadow-[4px_4px_0_0_#1A1A2E] rotate-[-6deg]"
          aria-hidden
        >
          <span className="text-[#1A1A2E] font-[family:var(--font-kanit)] font-black text-3xl">
            ?
          </span>
        </div>
        <div
          className="absolute bottom-12 left-8 hidden md:flex w-14 h-14 bg-[#E52521] border-4 border-[#1A1A2E] items-center justify-center shadow-[4px_4px_0_0_#1A1A2E] rotate-[8deg]"
          aria-hidden
        >
          <Star className="w-6 h-6 text-[#FFD700]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center relative z-10">
          {/* Left: headline + CTAs */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-4 py-1.5 text-[11px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] font-[family:var(--font-kanit)]">
              <Sparkles className="w-3.5 h-3.5 text-[#E52521]" />
              Collection · {buddhistYear}
            </div>
            <h1 className="font-[family:var(--font-kanit)] text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white drop-shadow-[5px_5px_0_#1A1A2E] whitespace-pre-line leading-[0.95]">
              {headline}
            </h1>
            <p className="text-white font-bold text-base sm:text-lg max-w-xl mx-auto lg:mx-0 bg-[#1A1A2E]/80 border-4 border-[#1A1A2E] border-l-[#FFD700] border-l-8 p-4">
              {sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center h-14 px-8 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-base shadow-[6px_6px_0_0_#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all gap-2"
              >
                <Coins className="w-5 h-5" />
                {ctaLabel}
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href={`/stores/${store.slug}/about`}
                className="inline-flex items-center justify-center h-14 px-7 bg-white text-[#1A1A2E] border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-base shadow-[6px_6px_0_0_#1A1A2E] hover:bg-[#009A4E] hover:text-white active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all"
              >
                เรื่องของเรา
              </Link>
            </div>
            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-[11px] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-white drop-shadow-[2px_2px_0_#1A1A2E]">
              <span className="inline-flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#FFD700]" /> ดาวน์โหลดทันที
              </span>
              <span className="opacity-50">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" /> ความละเอียดสูง 4K
              </span>
              <span className="opacity-50">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#FFD700]" /> เสริมดวงทุกราศี
              </span>
            </div>
          </div>

          {/* Right: hero block stack */}
          <div className="relative mx-auto w-full max-w-md aspect-square">
            <div
              className="absolute inset-0 bg-[#FFD700] border-4 border-[#1A1A2E] -rotate-3 translate-x-3 translate-y-3"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[#009A4E] border-4 border-[#1A1A2E] rotate-3 -translate-x-2 -translate-y-2"
              aria-hidden
            />
            <div className="relative h-full w-full border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] bg-white overflow-hidden">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt={store.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFD700] via-[#E52521] to-[#009A4E]">
                  <div className="text-center">
                    <div className="font-[family:var(--font-kanit)] font-black text-7xl text-white uppercase italic drop-shadow-[4px_4px_0_#1A1A2E]">
                      ⭐
                    </div>
                    <div className="font-[family:var(--font-kanit)] font-black text-4xl text-white uppercase mt-2 drop-shadow-[3px_3px_0_#1A1A2E]">
                      LV.UP
                    </div>
                  </div>
                </div>
              )}
              {/* Pixel "1-UP" tag */}
              <div className="absolute top-3 left-3 bg-[#009A4E] text-white border-4 border-[#1A1A2E] px-2 py-0.5 font-[family:var(--font-kanit)] font-black text-xs uppercase tracking-widest shadow-[3px_3px_0_0_#1A1A2E]">
                1-UP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category pipes */}
      {categories.length > 0 && (
        <section className="border-b-4 border-[#1A1A2E] bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-3 sm:gap-4 w-max">
              <span className="shrink-0 font-[family:var(--font-kanit)] font-black text-base sm:text-lg uppercase tracking-widest pr-3 sm:pr-4 border-r-4 border-[#1A1A2E] flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#E52521]" /> เลือกหมวด
              </span>
              {categories.slice(0, 8).map((cat, idx) => {
                const Icon = CATEGORY_ICONS[idx % CATEGORY_ICONS.length];
                const bg = ['bg-[#E52521]', 'bg-[#009A4E]', 'bg-[#FFD700]', 'bg-[#5C94FC]'][idx % 4];
                const fg = ['text-white', 'text-white', 'text-[#1A1A2E]', 'text-white'][idx % 4];
                return (
                  <Link
                    key={cat}
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                    className={`shrink-0 h-12 sm:h-14 px-4 sm:px-5 flex items-center gap-2 border-4 border-[#1A1A2E] ${bg} ${fg} hover:bg-[#FFD700] hover:text-[#1A1A2E] shadow-[4px_4px_0_0_#1A1A2E] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-wider">
                      {cat}
                    </span>
                  </Link>
                );
              })}
              <Link
                href={`/stores/${store.slug}/category`}
                className="shrink-0 h-12 sm:h-14 px-4 sm:px-5 flex items-center font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest text-[#1A1A2E] border-4 border-transparent hover:border-[#1A1A2E] hover:bg-[#FFD700] active:translate-x-1 active:translate-y-1 transition-all"
              >
                ดูทั้งหมด →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured "Power-Up" grid */}
      <section className="border-b-4 border-[#1A1A2E] py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-3 py-1 text-[11px] font-black uppercase tracking-widest font-[family:var(--font-kanit)] shadow-[3px_3px_0_0_#1A1A2E] mb-3">
                <Star className="w-3.5 h-3.5 text-[#E52521]" /> Power-Up Items
              </div>
              <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0_#1A1A2E]">
                วอลล์เด่นประจำสัปดาห์
              </h2>
              <p className="text-white font-bold text-sm mt-2 drop-shadow-[2px_2px_0_#1A1A2E]">
                เสริมดวงตรงราศี · มาแรงสุดในเดือนนี้
              </p>
            </div>
            <Link
              href={`/stores/${store.slug}/category`}
              className="self-start md:self-auto h-12 px-6 inline-flex items-center justify-center bg-[#1A1A2E] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-xs shadow-[4px_4px_0_0_#FFD700] hover:bg-[#E52521] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {featured.length === 0 ? (
            <EmptyState slug={store.slug} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {featured.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeSlug={store.slug}
                  onAdd={handleAdd}
                  highlightIdx={idx}
                  variant="featured"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending row */}
      {trending.length > 0 && (
        <section className="border-b-4 border-[#1A1A2E] py-12 sm:py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#009A4E] text-white border-4 border-[#1A1A2E] px-3 py-1 text-[11px] font-black uppercase tracking-widest font-[family:var(--font-kanit)] shadow-[3px_3px_0_0_#1A1A2E] mb-3">
                  <Coins className="w-3.5 h-3.5" /> Coin Hits
                </div>
                <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-4xl font-black uppercase tracking-tight">
                  กำลังเป็นที่นิยม
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {trending.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeSlug={store.slug}
                  onAdd={handleAdd}
                  highlightIdx={idx + 4}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — Mario item block */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto bg-[#FFD700] border-4 border-[#1A1A2E] shadow-[10px_10px_0_0_#1A1A2E] p-8 sm:p-12 text-center relative overflow-hidden">
          <div
            className="absolute top-2 left-2 text-[10px] font-[family:var(--font-kanit)] font-black tracking-widest uppercase text-[#1A1A2E]"
            aria-hidden
          >
            ?
          </div>
          <div
            className="absolute top-2 right-2 text-[10px] font-[family:var(--font-kanit)] font-black tracking-widest uppercase text-[#1A1A2E]"
            aria-hidden
          >
            ?
          </div>
          <Coins className="w-12 h-12 mx-auto mb-4 text-[#E52521]" />
          <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#1A1A2E] mb-3">
            พร้อมเลเวลอัพแล้วหรือยัง?
          </h3>
          <p className="text-[#1A1A2E] font-bold text-sm sm:text-base mb-6">
            เลือกวอลเปเปอร์มงคลที่ใช่กับดวงคุณ · ดาวน์โหลดทันที · เปลี่ยนชีวิตในคลิกเดียว
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center h-14 px-8 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-base shadow-[6px_6px_0_0_#1A1A2E] hover:bg-[#009A4E] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all gap-2"
          >
            <Sparkles className="w-5 h-5" />
            ช้อปวอลเปเปอร์ทั้งหมด
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ slug }: { slug: string }) {
  return (
    <div className="text-center py-16 border-4 border-[#1A1A2E] bg-white shadow-[8px_8px_0_0_#1A1A2E]">
      <Sparkles className="w-12 h-12 mx-auto text-[#FFD700] mb-3" />
      <p className="font-[family:var(--font-kanit)] text-2xl font-black uppercase tracking-tight">
        ยังไม่มีวอลล์ในร้าน
      </p>
      <p className="text-sm text-[#4A4A6E] font-bold uppercase tracking-widest mt-2">
        เพิ่มสินค้าผ่านระบบจัดการร้านได้เลย
      </p>
      <Link
        href={`/stores/${slug}/category`}
        className="inline-flex h-12 px-6 mt-6 items-center gap-2 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <Sparkles className="w-4 h-4" /> ดูหน้าหมวด
      </Link>
    </div>
  );
}

function ProductCard({
  product,
  storeSlug,
  onAdd,
  highlightIdx,
  variant,
}: {
  product: Product;
  storeSlug: string;
  onAdd: (p: Product, e: React.MouseEvent) => void;
  highlightIdx: number;
  variant: 'featured' | 'compact';
}) {
  const hasDiscount =
    product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round(((product.compareAtPriceTHB! - product.priceTHB) / product.compareAtPriceTHB!) * 100)
    : 0;
  const tag = hasDiscount
    ? `ลด ${discountPct}%`
    : highlightIdx === 0
    ? 'มูสุด'
    : highlightIdx === 1
    ? 'ขายดี'
    : highlightIdx === 3
    ? '✨ ใหม่'
    : null;

  return (
    <Link
      href={`/stores/${storeSlug}/products/${product.id}`}
      className="group bg-white border-4 border-[#1A1A2E] shadow-[5px_5px_0_0_#1A1A2E] hover:shadow-[8px_8px_0_0_#1A1A2E] hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden border-b-4 border-[#1A1A2E] bg-[#E8E8F0]">
        {tag && (
          <div className="absolute top-3 -left-1 z-10 bg-[#E52521] text-white font-[family:var(--font-kanit)] font-black text-[11px] uppercase tracking-widest px-3 py-1 border-4 border-[#1A1A2E] shadow-[3px_3px_0_0_#1A1A2E]">
            {tag}
          </div>
        )}
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFD700] via-[#E52521] to-[#009A4E]">
            <Sparkles className="w-12 h-12 text-white drop-shadow-[2px_2px_0_#1A1A2E]" />
          </div>
        )}
        <button
          type="button"
          onClick={(e) => onAdd(product, e)}
          aria-label="เพิ่มในตะกร้า"
          className="absolute bottom-3 right-3 z-10 w-11 h-11 border-4 border-[#1A1A2E] flex items-center justify-center bg-[#FFD700] text-[#1A1A2E] shadow-[3px_3px_0_0_#1A1A2E] hover:bg-[#009A4E] hover:text-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
      <div className={`p-3 sm:p-4 space-y-2 flex-1 flex flex-col ${variant === 'compact' ? 'text-sm' : ''}`}>
        {product.categoryName && (
          <div className="text-[10px] font-[family:var(--font-kanit)] font-black uppercase text-[#4A4A6E] tracking-widest">
            {product.categoryName}
          </div>
        )}
        <h3 className={`font-[family:var(--font-kanit)] font-black uppercase tracking-tight leading-tight line-clamp-2 flex-1 ${variant === 'featured' ? 'text-base sm:text-lg' : 'text-sm'}`}>
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 pt-1">
          <span className={`font-[family:var(--font-kanit)] font-black text-[#E52521] ${variant === 'featured' ? 'text-xl' : 'text-base'}`}>
            {formatTHB(product.priceTHB)}
          </span>
          {hasDiscount && (
            <span className="text-xs font-bold text-[#4A4A6E] line-through">
              {formatTHB(product.compareAtPriceTHB!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
