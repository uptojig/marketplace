'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Image as ImageIcon,
  Video,
  Code2,
  Zap,
  ChevronRight,
  Download,
  ShoppingCart,
  Star,
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
  store: { id: string; name: string; slug: string; logoUrl?: string | null };
  products: Product[];
  categories: string[];
  landingContent?: LandingContent | null;
}

const DEFAULT_HEADLINE = 'พรอมต์ AI\nที่พร้อมใช้งาน';
const DEFAULT_SUB =
  'มาร์เก็ตเพลส AI Prompts คัดสรรสำหรับ ChatGPT · Midjourney · Sora · Claude — ดาวน์โหลดได้ทันที ใช้งานได้ตลอดชีพ';
const DEFAULT_CTA = 'เริ่มดาวน์โหลด';

const CATEGORY_ICONS = [Bot, ImageIcon, Video, Code2, Sparkles, Zap] as const;

const STATS = [
  { value: '12K+', label: 'พรอมต์พร้อมใช้' },
  { value: '50+', label: 'หมวดหมู่' },
  { value: '4.9', label: 'คะแนนเฉลี่ย', icon: Star },
];

const GRADIENT_BG = 'linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)';
const GLASS_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(19, 19, 46, 0.6)',
  backdropFilter: 'blur(12px) saturate(140%)',
  WebkitBackdropFilter: 'blur(12px) saturate(140%)',
  border: '1px solid rgba(168, 85, 247, 0.16)',
};
const GRID_BG_STYLE: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.18) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};
const GRADIENT_TEXT_STYLE: React.CSSProperties = {
  backgroundImage: GRADIENT_BG,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
};
const GLOW_LG =
  '0 0 0 1px rgba(168,85,247,0.5), 0 0 24px rgba(168,85,247,0.5), 0 0 64px rgba(168,85,247,0.28)';
const GLOW_SM =
  '0 0 0 1px rgba(168,85,247,0.4), 0 0 12px rgba(168,85,247,0.4), 0 0 32px rgba(168,85,247,0.2)';

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
    <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#312E81]/60 px-4 py-20 md:py-28">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={GRID_BG_STYLE} aria-hidden />
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-35 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.45) 0%, transparent 70%)' }}
          aria-hidden
        />

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="text-center md:text-left space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#A855F7]/40 bg-[#A855F7]/10 text-[11px] uppercase tracking-[0.18em] text-[#A855F7] font-[family:var(--font-kanit)] font-semibold">
              <Sparkles className="w-3 h-3" />
              AI Prompts Marketplace
            </div>
            <h1 className="font-[family:var(--font-kanit)] text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight whitespace-pre-line">
              <span style={GRADIENT_TEXT_STYLE}>{headline}</span>
            </h1>
            <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-xl mx-auto md:mx-0">{sub}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 pt-3">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-white text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity font-[family:var(--font-kanit)]"
                style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_LG }}
              >
                {ctaLabel}
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#13132E] text-[#F8FAFC] text-sm font-semibold tracking-wide border border-[#312E81] hover:border-[#06B6D4] hover:text-[#06B6D4] transition-colors font-[family:var(--font-kanit)]"
              >
                <Bot className="w-4 h-4" />
                เรียกดูพรอมต์
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0 pt-5">
              {STATS.map((s) => (
                <div key={s.label} className="text-center md:text-left">
                  <div className="font-[family:var(--font-kanit)] font-bold text-2xl text-[#F8FAFC] flex items-center justify-center md:justify-start gap-1 tabular-nums">
                    {s.value}
                    {s.icon && <s.icon className="w-4 h-4 text-[#FACC15] fill-[#FACC15]" />}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#94A3B8] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md aspect-square">
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, rgba(168,85,247,0.16) 0%, rgba(6,182,212,0.16) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            />
            <div
              className="absolute inset-4 rounded-2xl overflow-hidden"
              style={{ ...GLASS_STYLE, boxShadow: GLOW_SM }}
            >
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt={store.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
                  >
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#A855F7] mb-2 font-semibold">
                    Prompt Library
                  </div>
                  <div className="space-y-2 w-full max-w-[260px]">
                    {['ChatGPT', 'Midjourney', 'Sora', 'Claude'].map((tag, i) => (
                      <div
                        key={tag}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B0B1F]/60 border border-[#312E81] text-left"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: ['#A855F7', '#06B6D4', '#FACC15', '#10B981'][i] }}
                        />
                        <span className="text-xs text-[#F8FAFC] font-mono">{tag.toLowerCase()}.txt</span>
                        <Download className="w-3 h-3 text-[#94A3B8] ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div
              className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-[#13132E] border border-[#06B6D4]/50 text-[10px] uppercase tracking-[0.18em] text-[#06B6D4] font-semibold"
              style={{
                boxShadow:
                  '0 0 0 1px rgba(6,182,212,0.4), 0 0 12px rgba(6,182,212,0.35), 0 0 28px rgba(6,182,212,0.18)',
              }}
            >
              .json
            </div>
            <div
              className="absolute -bottom-3 -left-3 px-3 py-1.5 rounded-full bg-[#13132E] border border-[#A855F7]/50 text-[10px] uppercase tracking-[0.18em] text-[#A855F7] font-semibold"
              style={{ boxShadow: GLOW_SM }}
            >
              v2.0
            </div>
          </div>
        </div>
      </section>

      {/* Category rail */}
      {categories.length > 0 && (
        <section className="py-10 border-b border-[#312E81]/40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-lg text-[#F8FAFC] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#A855F7]" />
                สำรวจตามหมวดหมู่
              </h2>
              <Link
                href={`/stores/${store.slug}/category`}
                className="text-xs text-[#06B6D4] hover:text-[#A855F7] transition-colors font-medium"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-1" style={{ scrollbarWidth: 'none' }}>
              {categories.slice(0, 10).map((cat, idx) => {
                const Icon = CATEGORY_ICONS[idx % CATEGORY_ICONS.length];
                return (
                  <Link
                    key={cat}
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                    className="shrink-0 group inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm font-medium text-[#F8FAFC] hover:text-[#A855F7] transition-all"
                    style={GLASS_STYLE}
                  >
                    <Icon className="w-4 h-4 text-[#A855F7] group-hover:text-[#06B6D4] transition-colors" />
                    {cat}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured grid */}
      <section className="py-14 sm:py-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FACC15]/30 bg-[#FACC15]/10 text-[10px] uppercase tracking-[0.18em] text-[#FACC15] mb-3 font-[family:var(--font-kanit)] font-semibold">
              <Sparkles className="w-3 h-3" />
              Featured
            </div>
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
              พรอมต์เด่นประจำสัปดาห์
            </h2>
            <p className="text-sm text-[#94A3B8] mt-2">คัดสรรโดยทีมงาน · อัปเดตทุกสัปดาห์</p>
          </div>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#13132E] text-[#F8FAFC] text-sm font-semibold border border-[#312E81] hover:border-[#A855F7] hover:text-[#A855F7] transition-all font-[family:var(--font-kanit)]"
          >
            ดูทั้งหมด <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={GLASS_STYLE}>
            <Bot className="w-12 h-12 mx-auto text-[#94A3B8] mb-3" />
            <p className="font-[family:var(--font-kanit)] text-xl font-semibold text-[#F8FAFC]">
              ยังไม่มีพรอมต์ในร้าน
            </p>
            <p className="text-sm text-[#94A3B8] mt-2">เพิ่มสินค้าผ่านระบบจัดการร้านได้เลย</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((product, idx) => {
              const hasDiscount =
                product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
              const tag = hasDiscount
                ? `-${Math.round(((product.compareAtPriceTHB! - product.priceTHB) / product.compareAtPriceTHB!) * 100)}%`
                : idx === 0
                ? 'HOT'
                : idx === 1
                ? 'NEW'
                : null;
              return (
                <Link
                  key={product.id}
                  href={`/stores/${store.slug}/products/${product.id}`}
                  className="group relative rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                  style={GLASS_STYLE}
                >
                  <div className="relative aspect-square overflow-hidden bg-[#1E1E3F]">
                    {tag && (
                      <div
                        className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-[family:var(--font-kanit)] ${
                          hasDiscount
                            ? 'bg-[#FACC15] text-[#0B0B1F]'
                            : tag === 'HOT'
                            ? 'text-white'
                            : 'bg-[#06B6D4] text-[#0B0B1F]'
                        }`}
                        style={
                          tag === 'HOT' && !hasDiscount ? { backgroundImage: GRADIENT_BG } : undefined
                        }
                      >
                        {tag}
                      </div>
                    )}
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(168,85,247,0.25) 0%, rgba(6,182,212,0.25) 100%)',
                        }}
                      >
                        <Bot className="w-12 h-12 text-[#F8FAFC]/30" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      aria-label="เพิ่มในตะกร้า"
                      className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                      style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    {product.categoryName && (
                      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#06B6D4]">
                        {product.categoryName}
                      </div>
                    )}
                    <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm sm:text-base text-[#F8FAFC] leading-snug line-clamp-2 min-h-[2.6em]">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="font-[family:var(--font-kanit)] font-bold text-lg text-[#A855F7] tabular-nums">
                        {formatTHB(product.priceTHB)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-[#94A3B8] line-through tabular-nums">
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

      {/* Trending grid */}
      {trending.length > 0 && (
        <section className="py-14 px-4 border-t border-[#312E81]/40 bg-[#13132E]/40">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
                กำลังมาแรง
              </h2>
              <Link
                href={`/stores/${store.slug}/category`}
                className="text-sm text-[#06B6D4] hover:text-[#A855F7] transition-colors font-medium"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {trending.map((product) => (
                <Link
                  key={product.id}
                  href={`/stores/${store.slug}/products/${product.id}`}
                  className="group rounded-xl overflow-hidden transition-all hover:-translate-y-0.5"
                  style={GLASS_STYLE}
                >
                  <div className="relative aspect-square bg-[#1E1E3F] overflow-hidden">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#A855F7]/15 to-[#06B6D4]/15">
                        <Sparkles className="w-8 h-8 text-[#F8FAFC]/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1.5">
                    <h3 className="font-[family:var(--font-kanit)] font-semibold text-xs sm:text-sm text-[#F8FAFC] line-clamp-2 leading-snug min-h-[2.2em]">
                      {product.title}
                    </h3>
                    <p className="font-[family:var(--font-kanit)] font-bold text-sm text-[#A855F7] tabular-nums">
                      {formatTHB(product.priceTHB)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA strip */}
      <section className="px-4 py-16">
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden p-8 sm:p-12 text-center" style={GLASS_STYLE}>
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at top right, rgba(168,85,247,0.3) 0%, transparent 60%), radial-gradient(circle at bottom left, rgba(6,182,212,0.25) 0%, transparent 60%)',
            }}
            aria-hidden
          />
          <div className="relative space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 text-[10px] uppercase tracking-[0.18em] text-[#06B6D4] font-[family:var(--font-kanit)] font-semibold">
              <Zap className="w-3 h-3" />
              ดาวน์โหลดได้ทันที
            </div>
            <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
              พร้อมเริ่มต้นใช้งาน AI?
            </h3>
            <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto">
              เลือกซื้อพรอมต์คุณภาพคัดสรรจากครีเอเตอร์ — รับไฟล์ทันทีหลังชำระเงิน
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-white text-sm font-semibold font-[family:var(--font-kanit)]"
                style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_LG }}
              >
                <Download className="w-4 h-4" />
                เริ่มเลย
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
