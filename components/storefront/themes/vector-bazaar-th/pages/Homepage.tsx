'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  Sparkles,
  Palette,
  Layers,
  ChevronRight,
  Zap,
  Heart,
  Star,
  FileImage,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { VECTOR_BAZAAR_RAINBOW } from '../palette';

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

const DEFAULT_HEADLINE = 'เวกเตอร์บาซาร์\nที่นักออกแบบรัก';
const DEFAULT_SUB =
  'รวมไฟล์ SVG icon packs และ illustration ระดับสตูดิโอ ดาวน์โหลดทันทีแก้ไขได้ใน Figma, Adobe Illustrator, Sketch — พร้อมใบอนุญาตเชิงพาณิชย์';
const DEFAULT_CTA = 'เลือกซื้อแพ็ค';

const FORMAT_BADGES = [
  { label: '.svg', color: 'bg-[#FCE7F3] text-[#DB2777]' },
  { label: '.ai', color: 'bg-[#FEF3C7] text-[#B45309]' },
  { label: '.eps', color: 'bg-[#DBEAFE] text-[#2563EB]' },
  { label: '.png', color: 'bg-[#D1FAE5] text-[#047857]' },
];

const STAT_HIGHLIGHTS = [
  { icon: Download, label: 'ดาวน์โหลดทันที', sub: 'หลังชำระเงิน' },
  { icon: Layers, label: 'แก้ไขได้ทุกเลเยอร์', sub: 'Figma · AI · Sketch' },
  { icon: Sparkles, label: 'ใบอนุญาตการค้า', sub: 'ใช้งานเชิงพาณิชย์' },
];

export function Homepage({ store, products, categories, landingContent }: Props) {
  const headline = landingContent?.heroHeadline?.trim() || DEFAULT_HEADLINE;
  const sub = landingContent?.heroSubheadline?.trim() || DEFAULT_SUB;
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || DEFAULT_CTA;
  const ctaUrl = landingContent?.heroCtaUrl?.trim() || `/stores/${store.slug}/category`;
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
    <main className="bg-[#FEFCE8] text-[#1E1B4B] font-[family:var(--font-prompt)]">
      {/* ─────── Hero ─────── */}
      <section className="relative overflow-hidden vb-rainbow-bg border-b border-[#FBCFE8]">
        <div className="absolute inset-0 vb-confetti opacity-50 pointer-events-none" aria-hidden />
        <div className="absolute top-12 right-10 w-32 h-32 rounded-full bg-[#F472B6]/30 blur-3xl pointer-events-none hidden md:block" aria-hidden />
        <div className="absolute bottom-12 left-10 w-40 h-40 rounded-full bg-[#60A5FA]/30 blur-3xl pointer-events-none hidden md:block" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#FBCFE8] px-4 py-1.5 text-xs font-bold tracking-widest uppercase shadow-sm text-[#DB2777] font-[family:var(--font-kanit)]">
              <Sparkles className="w-3.5 h-3.5" />
              คอลเลคชั่นล่าสุด {new Date().getFullYear() + 543}
            </div>

            <h1 className="font-[family:var(--font-kanit)] text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] whitespace-pre-line">
              <span className="vb-rainbow-text">{headline}</span>
            </h1>

            <p className="text-base sm:text-lg text-[#1E1B4B]/80 max-w-lg mx-auto md:mx-0 leading-relaxed">
              {sub}
            </p>

            {/* Format badges */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {FORMAT_BADGES.map((b) => (
                <span
                  key={b.label}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black tracking-widest font-[family:var(--font-kanit)] ${b.color}`}
                >
                  <FileImage className="w-3 h-3" />
                  {b.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center gap-2 h-14 px-7 rounded-full bg-[#F472B6] text-white font-[family:var(--font-kanit)] font-black text-base vb-glow-primary hover:bg-[#EC4899] active:scale-95 transition-all"
              >
                {ctaLabel}
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center justify-center gap-2 h-14 px-7 rounded-full bg-white border-2 border-[#60A5FA] text-[#2563EB] font-[family:var(--font-kanit)] font-black text-base hover:bg-[#DBEAFE] active:scale-95 transition-all"
              >
                <Layers className="w-5 h-5" />
                เรียกดูคลัง
              </Link>
            </div>
          </div>

          {/* Hero artwork — checker grid showcase */}
          <div className="relative mx-auto w-full max-w-md aspect-square">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#F472B6]/20 via-[#FBBF24]/20 to-[#60A5FA]/20 blur-2xl" aria-hidden />
            <div className="relative w-full h-full rounded-[2rem] bg-white border border-[#FBCFE8] shadow-[0_24px_64px_-24px_rgba(244,114,182,0.5)] overflow-hidden">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt={store.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 vb-checker p-8 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Floating vector icons */}
                    <div className="absolute top-0 left-0 w-20 h-20 rounded-2xl bg-[#F472B6] flex items-center justify-center shadow-xl rotate-[-8deg]">
                      <Palette className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute top-4 right-2 w-16 h-16 rounded-2xl bg-[#FBBF24] flex items-center justify-center shadow-xl rotate-[12deg]">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute bottom-12 left-6 w-16 h-16 rounded-2xl bg-[#60A5FA] flex items-center justify-center shadow-xl rotate-[6deg]">
                      <Layers className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute bottom-0 right-10 w-20 h-20 rounded-2xl bg-[#A78BFA] flex items-center justify-center shadow-xl rotate-[-4deg]">
                      <FileImage className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-3xl bg-white flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(244,114,182,0.5)] border border-[#FBCFE8]">
                      <span className="font-[family:var(--font-kanit)] font-black text-3xl vb-rainbow-text">
                        {store.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────── Stat band ─────── */}
      <section className="bg-white border-b border-[#FBCFE8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STAT_HIGHLIGHTS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: ['#FCE7F3', '#DBEAFE', '#FEF3C7'][i],
                  color: ['#DB2777', '#2563EB', '#B45309'][i],
                }}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-[family:var(--font-kanit)] font-black text-sm text-[#1E1B4B]">
                  {s.label}
                </p>
                <p className="text-xs text-[#6366F1]">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────── Category chip rail ─────── */}
      {categories.length > 0 && (
        <section className="bg-[#FEFCE8] border-b border-[#FBCFE8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl sm:text-2xl">
                หมวดหมู่ผลงาน
              </h2>
              <Link
                href={`/stores/${store.slug}/category`}
                className="text-xs font-bold text-[#2563EB] hover:text-[#DB2777] transition-colors"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <ul className="flex gap-3 overflow-x-auto vb-no-scrollbar pb-2">
              {categories.slice(0, 12).map((cat, idx) => {
                const color = VECTOR_BAZAAR_RAINBOW[idx % VECTOR_BAZAAR_RAINBOW.length];
                return (
                  <li key={cat} className="shrink-0">
                    <Link
                      href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                      className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white border-2 font-[family:var(--font-kanit)] font-bold text-sm transition-all hover:scale-105"
                      style={{
                        borderColor: color,
                        color: color,
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      {cat}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ─────── Featured grid (4 large) ─────── */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-black tracking-widest uppercase text-[#DB2777] mb-2 font-[family:var(--font-kanit)]">
              <Star className="inline w-3 h-3 mr-1" />
              คัดสรรพิเศษ
            </p>
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-black tracking-tight">
              ผลงานเด่นประจำสัปดาห์
            </h2>
          </div>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-[#1E1B4B] text-white font-[family:var(--font-kanit)] font-bold text-sm hover:bg-[#312E81] transition-colors"
          >
            ดูทั้งหมด <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border-2 border-dashed border-[#FBCFE8] bg-white">
            <Palette className="w-12 h-12 mx-auto text-[#F472B6] mb-3" />
            <p className="font-[family:var(--font-kanit)] text-xl font-black mb-1">
              ยังไม่มีผลงานในร้าน
            </p>
            <p className="text-sm text-[#6366F1]">
              เพิ่มสินค้าผ่านระบบจัดการร้านได้เลย
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, idx) => {
              const hasDiscount =
                product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
              const discount = hasDiscount
                ? Math.round(((product.compareAtPriceTHB! - product.priceTHB) / product.compareAtPriceTHB!) * 100)
                : 0;
              const accent = VECTOR_BAZAAR_RAINBOW[idx % VECTOR_BAZAAR_RAINBOW.length];

              return (
                <Link
                  key={product.id}
                  href={`/stores/${store.slug}/products/${product.id}`}
                  className="group vb-card-hover relative rounded-3xl bg-white border border-[#FBCFE8] overflow-hidden flex flex-col"
                >
                  <div
                    className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase text-white shadow-md font-[family:var(--font-kanit)]"
                    style={{ backgroundColor: accent }}
                  >
                    {hasDiscount ? `-${discount}%` : idx === 0 ? 'ขายดี' : 'ใหม่'}
                  </div>

                  <div className="relative aspect-square vb-checker overflow-hidden">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
                          style={{ backgroundColor: accent }}
                        >
                          <Palette className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      aria-label="เพิ่มในตะกร้า"
                      className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-white text-[#DB2777] border border-[#FBCFE8] flex items-center justify-center shadow-md hover:bg-[#F472B6] hover:text-white hover:scale-110 active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-2">
                    {product.categoryName && (
                      <p className="text-[10px] font-black tracking-widest uppercase text-[#6366F1] font-[family:var(--font-kanit)]">
                        {product.categoryName}
                      </p>
                    )}
                    <h3 className="font-[family:var(--font-kanit)] font-black text-base leading-tight line-clamp-2 text-[#1E1B4B] flex-1">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="font-[family:var(--font-kanit)] font-black text-lg text-[#DB2777]">
                        {formatTHB(product.priceTHB)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-[#6366F1]/60 line-through">
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

      {/* ─────── Trending rail (8 small) ─────── */}
      {trending.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-14 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6 gap-4">
            <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-black tracking-tight inline-flex items-center gap-3">
              <Zap className="w-7 h-7 text-[#FBBF24] fill-[#FBBF24]" />
              กำลังมาแรง
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.map((p, idx) => {
              const accent = VECTOR_BAZAAR_RAINBOW[(idx + 3) % VECTOR_BAZAAR_RAINBOW.length];
              return (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="group vb-card-hover rounded-2xl bg-white border border-[#FBCFE8] overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-square vb-checker overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: accent }}
                        >
                          <FileImage className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-1">
                    <h3 className="font-[family:var(--font-kanit)] font-bold text-sm line-clamp-2 text-[#1E1B4B] flex-1">
                      {p.title}
                    </h3>
                    <p className="font-[family:var(--font-kanit)] font-black text-sm text-[#DB2777]">
                      {formatTHB(p.priceTHB)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ─────── Brand story / CTA ─────── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto rounded-[2.5rem] vb-rainbow-bg border border-[#FBCFE8] p-8 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 vb-confetti opacity-40 pointer-events-none" aria-hidden />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#FBCFE8] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#DB2777] font-[family:var(--font-kanit)]">
              <Heart className="w-3.5 h-3.5 fill-[#F472B6] text-[#F472B6]" />
              สนับสนุนศิลปินไทย
            </div>
            <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-black tracking-tight">
              <span className="vb-rainbow-text">ออกแบบสิ่งสวยงาม</span>
              <br />
              <span className="text-[#1E1B4B]">ได้เร็วกว่าเดิม</span>
            </h3>
            <p className="text-base sm:text-lg text-[#1E1B4B]/80 max-w-xl mx-auto">
              ทุกไฟล์ผ่านการตรวจสอบมาตรฐานการผลิต — แก้ไขสีและรูปทรงได้ตามต้องการ ดาวน์โหลดได้ไม่จำกัดครั้งหลังซื้อ
            </p>
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-[#1E1B4B] text-white font-[family:var(--font-kanit)] font-black text-base hover:bg-[#312E81] hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              เริ่มเลือกผลงาน
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
