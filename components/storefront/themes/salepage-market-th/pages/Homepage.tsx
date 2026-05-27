'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  Eye,
  Download,
  Sparkles,
  ShoppingCart,
  Zap,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface ProductCard {
  id: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  categoryName?: string | null;
}

interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: ProductCard[];
  categories: string[];
  landingContent?: {
    heroHeadline?: string | null;
    heroSubheadline?: string | null;
    heroCtaLabel?: string | null;
    heroCtaUrl?: string | null;
    heroImageUrl?: string | null;
  } | null;
}

const STATS = [
  { value: '2,400+', label: 'เทมเพลตคุณภาพสูง' },
  { value: '850+', label: 'นักพัฒนาในมาร์เก็ต' },
  { value: '120,000+', label: 'ดาวน์โหลดต่อเดือน' },
  { value: '4.8/5', label: 'คะแนนรีวิวเฉลี่ย' },
];

const FEATURE_HIGHLIGHTS = [
  {
    icon: Eye,
    title: 'พรีวิวสดก่อนซื้อ',
    body:
      'iframe สดทุกเทมเพลต ดูได้ทั้ง desktop · tablet · mobile ก่อนตัดสินใจซื้อ',
  },
  {
    icon: Download,
    title: 'ดาวน์โหลดทันที',
    body:
      'หลังชำระเงิน ระบบส่งไฟล์ HTML · CSS · JS เข้าบัญชีคุณภายในไม่กี่วินาที',
  },
  {
    icon: Code2,
    title: 'โค้ดสะอาด พร้อม Deploy',
    body:
      'HTML5 / Tailwind / vanilla JS ปรับแต่งง่าย ใช้กับเครื่องมือ Funnel ทุกแพลตฟอร์ม',
  },
  {
    icon: Zap,
    title: 'อัปเดตฟรี 12 เดือน',
    body:
      'นักพัฒนาอัปเดตฟีเจอร์ใหม่ตลอด ทุก license ได้รับ patch ฟรีหนึ่งปีเต็ม',
  },
];

export function Homepage({
  store,
  products,
  categories,
  landingContent,
}: HomepageProps) {
  const add = useCart((s) => s.add);

  const heroHeadline =
    landingContent?.heroHeadline?.trim() ||
    'เทมเพลตเซลเพจ HTML ระดับโปร พรีวิวสดก่อนซื้อ';
  const heroSubheadline =
    landingContent?.heroSubheadline?.trim() ||
    'มาร์เก็ตคัดสรรเทมเพลต landing-page สำเร็จรูปสำหรับนักการตลาด นักขายออนไลน์ และนักพัฒนา · เลือกเปิดดูสดในเบราว์เซอร์ · ซื้อแล้วดาวน์โหลดทันที';
  const heroCtaLabel = landingContent?.heroCtaLabel?.trim() || 'เริ่มดูเทมเพลต';
  const heroCtaUrl =
    landingContent?.heroCtaUrl?.trim() || `/stores/${store.slug}/category`;

  const featured = products.slice(0, 6);
  const trending = products.slice(6, 14);
  const topRated = products.slice(2, 6);

  const handleQuickAdd = (p: ProductCard) => {
    add(
      {
        productId: p.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: p.title,
        priceTHB: p.priceTHB,
        imageUrl: p.imageUrl || undefined,
      },
      1,
    );
  };

  return (
    <div
      className="font-[family:var(--font-prompt)]"
      style={{ background: 'var(--shop-bg, #FAFBFC)' }}
    >
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, var(--shop-bg-soft, #FFFFFF) 0%, var(--shop-bg, #FAFBFC) 100%)',
          borderBottom: '1px solid var(--shop-border, #E5E7EB)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="space-y-6 max-w-xl">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: 'rgba(130, 180, 64, 0.12)',
                color: 'var(--shop-primary, #82B440)',
                border: '1px solid rgba(130, 180, 64, 0.25)',
              }}
            >
              <Sparkles className="w-3 h-3" />
              เปิดพรีวิวสดทุกเทมเพลตก่อนซื้อ
            </span>
            <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-[color:var(--shop-ink,#0D1421)]">
              {heroHeadline}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-[color:var(--shop-ink-muted,#6B7280)]">
              {heroSubheadline}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={heroCtaUrl}
                className="inline-flex items-center gap-2 rounded-md h-12 px-6 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
                }}
              >
                {heroCtaLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/stores/${store.slug}/about`}
                className="inline-flex items-center gap-2 rounded-md h-12 px-6 text-sm font-semibold border transition-colors"
                style={{
                  borderColor: 'var(--shop-border, #E5E7EB)',
                  color: 'var(--shop-ink, #0D1421)',
                  background: 'var(--shop-bg-soft, #FFFFFF)',
                }}
              >
                เกี่ยวกับมาร์เก็ต
              </Link>
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 mt-4 border-t"
              style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-[family:var(--font-kanit)] text-xl sm:text-2xl font-bold text-[color:var(--shop-ink,#0D1421)]">
                    {s.value}
                  </p>
                  <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)] mt-0.5 leading-tight">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual — mock browser preview */}
          <div className="relative">
            <div
              className="salepage-frame-shell rounded-xl p-3 sm:p-4"
              style={{
                border: '1px solid var(--shop-border, #E5E7EB)',
              }}
            >
              <div className="flex items-center gap-1.5 px-2 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#82B440]" />
                <span
                  className="salepage-tag ml-3 text-[10px] tracking-wider px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--shop-muted, #F3F4F6)',
                    color: 'var(--shop-ink-muted, #6B7280)',
                  }}
                >
                  preview.salepage.co/{store.slug}
                </span>
              </div>
              <div
                className="aspect-[16/10] rounded-md relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, #82B440 0%, #00ADEF 100%)',
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                  <Layers className="w-12 h-12 mb-4 opacity-90" />
                  <h3 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold mb-2">
                    Live Demo Preview
                  </h3>
                  <p className="text-sm opacity-90 max-w-sm">
                    คลิกที่เทมเพลตเพื่อดูตัวอย่างจริง · ขนาด desktop / tablet / mobile
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY RAIL ────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section
          className="border-b"
          style={{
            borderColor: 'var(--shop-border, #E5E7EB)',
            background: 'var(--shop-bg-soft, #FFFFFF)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <Link
                href={`/stores/${store.slug}/category`}
                className="shrink-0 inline-flex items-center rounded-md border px-4 h-9 text-xs font-medium transition-colors hover:border-[color:var(--shop-primary,#82B440)] hover:text-[color:var(--shop-primary,#82B440)]"
                style={{
                  borderColor: 'var(--shop-border, #E5E7EB)',
                  color: 'var(--shop-ink, #0D1421)',
                  background: 'var(--shop-bg-soft, #FFFFFF)',
                }}
              >
                ทั้งหมด
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                  className="shrink-0 inline-flex items-center rounded-md border px-4 h-9 text-xs font-medium transition-colors hover:border-[color:var(--shop-primary,#82B440)] hover:text-[color:var(--shop-primary,#82B440)]"
                  style={{
                    borderColor: 'var(--shop-border, #E5E7EB)',
                    color: 'var(--shop-ink-muted, #6B7280)',
                    background: 'var(--shop-bg-soft, #FFFFFF)',
                  }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FEATURED GRID ────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <span
                className="salepage-tag inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{
                  background: 'rgba(0, 173, 239, 0.10)',
                  color: 'var(--shop-accent, #00ADEF)',
                }}
              >
                FEATURED
              </span>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)]">
                เทมเพลตแนะนำสัปดาห์นี้
              </h2>
            </div>
            <Link
              href={`/stores/${store.slug}/category`}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[color:var(--shop-primary,#82B440)] hover:underline"
            >
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featured.map((p) => (
              <FeaturedCard
                key={p.id}
                product={p}
                slug={store.slug}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── FEATURE HIGHLIGHTS ───────────────────────────────────── */}
      <section
        className="py-12 sm:py-16"
        style={{ background: 'var(--shop-bg-soft, #FFFFFF)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 max-w-2xl mx-auto">
            <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)] mb-3">
              ทำไมถึงเลือกซื้อจากเรา
            </h2>
            <p className="text-sm sm:text-base text-[color:var(--shop-ink-muted,#6B7280)] leading-relaxed">
              ทุกเทมเพลตผ่านการคัดสรร · พรีวิวจริงก่อนซื้อ · โค้ดสะอาด · ใช้ได้ทุกแพลตฟอร์ม
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURE_HIGHLIGHTS.map((f) => (
              <div
                key={f.title}
                className="rounded-lg p-5 salepage-card"
                style={{
                  background: 'var(--shop-bg, #FAFBFC)',
                  border: '1px solid var(--shop-border, #E5E7EB)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center mb-3"
                  style={{
                    background: 'rgba(130, 180, 64, 0.12)',
                    color: 'var(--shop-primary, #82B440)',
                  }}
                >
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-[family:var(--font-kanit)] text-base font-bold mb-1 text-[color:var(--shop-ink,#0D1421)]">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--shop-ink-muted,#6B7280)]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRENDING GRID ────────────────────────────────────────── */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <span
                className="salepage-tag inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{
                  background: 'rgba(255, 107, 53, 0.10)',
                  color: 'var(--shop-savings, #FF6B35)',
                }}
              >
                TRENDING
              </span>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)]">
                กำลังมาแรงเดือนนี้
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {trending.map((p) => (
              <TrendingCard key={p.id} product={p} slug={store.slug} />
            ))}
          </div>
        </section>
      )}

      {/* ─── TOP RATED LIST ───────────────────────────────────────── */}
      {topRated.length > 0 && (
        <section
          className="py-12 sm:py-16"
          style={{ background: 'var(--shop-bg-soft, #FFFFFF)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span
                  className="salepage-tag inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{
                    background: 'rgba(13, 20, 33, 0.06)',
                    color: 'var(--shop-ink, #0D1421)',
                  }}
                >
                  TOP RATED
                </span>
                <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)]">
                  คะแนนรีวิวสูงสุด
                </h2>
              </div>
            </div>
            <div className="space-y-3">
              {topRated.map((p, idx) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="flex items-center gap-4 rounded-lg p-3 sm:p-4 salepage-card"
                  style={{
                    background: 'var(--shop-bg, #FAFBFC)',
                    border: '1px solid var(--shop-border, #E5E7EB)',
                  }}
                >
                  <span
                    className="shrink-0 w-10 h-10 rounded-md flex items-center justify-center font-[family:var(--font-kanit)] text-lg font-bold"
                    style={{
                      background: 'var(--shop-primary, #82B440)',
                      color: '#FFFFFF',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base text-[color:var(--shop-ink,#0D1421)] truncate">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[color:var(--shop-ink-muted,#6B7280)] mt-0.5">
                      {p.categoryName && <span>{p.categoryName}</span>}
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[color:var(--shop-primary,#82B440)]" />
                        ผ่านรีวิว
                      </span>
                    </div>
                  </div>
                  <div className="font-[family:var(--font-kanit)] font-bold text-base sm:text-lg text-[color:var(--shop-primary,#82B440)]">
                    {formatTHB(p.priceTHB)}
                  </div>
                  <ArrowRight className="w-4 h-4 text-[color:var(--shop-ink-muted,#6B7280)]" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA BAND ─────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-xl p-8 sm:p-12 text-center"
            style={{
              background:
                'linear-gradient(135deg, #0D1421 0%, #1f2937 100%)',
              color: '#FFFFFF',
            }}
          >
            <Sparkles className="w-8 h-8 mx-auto mb-4 text-[#82B440]" />
            <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold mb-3">
              เริ่มต้นเซลเพจของคุณวันนี้
            </h2>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto mb-6">
              เลือกเทมเพลตที่ใช่ · พรีวิวสด · ดาวน์โหลดทันที · ใช้กับ Funnel ทุกแพลตฟอร์ม
            </p>
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center gap-2 rounded-md h-12 px-6 text-sm font-semibold text-white"
              style={{ background: '#82B440' }}
            >
              เริ่มเลือกเทมเพลต
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function FeaturedCard({
  product,
  slug,
  onQuickAdd,
}: {
  product: ProductCard;
  slug: string;
  onQuickAdd: (p: ProductCard) => void;
}) {
  const hasDiscount =
    product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.compareAtPriceTHB! - product.priceTHB) /
          product.compareAtPriceTHB!) *
          100,
      )
    : 0;

  return (
    <div
      className="group rounded-lg overflow-hidden salepage-card flex flex-col"
      style={{
        background: 'var(--shop-bg-soft, #FFFFFF)',
        border: '1px solid var(--shop-border, #E5E7EB)',
      }}
    >
      <Link
        href={`/stores/${slug}/products/${product.id}`}
        className="relative aspect-[16/10] block overflow-hidden"
        style={{ background: 'var(--shop-muted, #F3F4F6)' }}
      >
        {hasDiscount && (
          <span
            className="absolute top-3 left-3 z-10 rounded px-2 py-0.5 text-[11px] font-bold text-white"
            style={{ background: 'var(--shop-savings, #FF6B35)' }}
          >
            -{discountPct}%
          </span>
        )}
        <span
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold backdrop-blur-md"
          style={{
            background: 'rgba(255,255,255,0.92)',
            color: 'var(--shop-ink, #0D1421)',
          }}
        >
          <Eye className="w-3 h-3" />
          พรีวิว
        </span>
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
                'linear-gradient(135deg, rgba(130,180,64,0.12) 0%, rgba(0,173,239,0.12) 100%)',
            }}
          >
            <Code2 className="w-12 h-12 text-[color:var(--shop-primary,#82B440)]/40" />
          </div>
        )}
      </Link>
      <div className="flex-1 flex flex-col p-4">
        {product.categoryName && (
          <p className="text-[11px] uppercase tracking-wider text-[color:var(--shop-ink-muted,#6B7280)] mb-1">
            {product.categoryName}
          </p>
        )}
        <Link
          href={`/stores/${slug}/products/${product.id}`}
          className="block flex-1"
        >
          <h3 className="font-[family:var(--font-kanit)] font-bold text-base leading-snug line-clamp-2 text-[color:var(--shop-ink,#0D1421)] hover:text-[color:var(--shop-primary,#82B440)] transition-colors">
            {product.title}
          </h3>
        </Link>
        <div
          className="flex items-end justify-between mt-3 pt-3 border-t"
          style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
        >
          <div className="flex flex-col">
            <span className="font-[family:var(--font-kanit)] font-bold text-lg text-[color:var(--shop-primary,#82B440)] leading-none">
              {formatTHB(product.priceTHB)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)] line-through mt-0.5">
                {formatTHB(product.compareAtPriceTHB!)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onQuickAdd(product);
            }}
            aria-label="เพิ่มในตะกร้า"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-white transition-transform hover:scale-105 active:scale-95"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
            }}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TrendingCard({
  product,
  slug,
}: {
  product: ProductCard;
  slug: string;
}) {
  const hasDiscount =
    product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;

  return (
    <Link
      href={`/stores/${slug}/products/${product.id}`}
      className="group rounded-lg overflow-hidden salepage-card block"
      style={{
        background: 'var(--shop-bg-soft, #FFFFFF)',
        border: '1px solid var(--shop-border, #E5E7EB)',
      }}
    >
      <div
        className="relative aspect-[4/3]"
        style={{ background: 'var(--shop-muted, #F3F4F6)' }}
      >
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
                'linear-gradient(135deg, rgba(130,180,64,0.10) 0%, rgba(255,107,53,0.10) 100%)',
            }}
          >
            <Code2 className="w-10 h-10 text-[color:var(--shop-primary,#82B440)]/40" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm leading-snug line-clamp-2 text-[color:var(--shop-ink,#0D1421)] mb-2">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-[family:var(--font-kanit)] font-bold text-sm text-[color:var(--shop-primary,#82B440)]">
            {formatTHB(product.priceTHB)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)] line-through">
              {formatTHB(product.compareAtPriceTHB!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
