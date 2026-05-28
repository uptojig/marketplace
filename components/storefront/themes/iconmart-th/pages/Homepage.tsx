'use client';

/**
 * IconMart (iconmart-th) — Homepage
 *
 * Landing page for a Thai digital icon-pack storefront. Translated from
 * the exported "Glyphkit" index.html (modern-minimal / Linear-Vercel).
 *
 * Sections (top to bottom):
 *   1. Hero — eyebrow + headline w/ highlight + sub + dual CTA + 4 meta
 *      stats, with a 4×2 icon-tile art panel on the right (falls back to
 *      the store/hero image when one exists).
 *   2. Category chips — derived from props (fallback to the export's 4).
 *   3. Featured icon glyphs — a responsive glyph-card grid.
 *   4. Featured packs / products rail — up to 6 cards.
 *
 * No framer-motion: the section/tile reveal uses CSS keyframes via
 * <style jsx>.
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Share2,
  CreditCard,
  Briefcase,
  Grid3x3,
  MessageCircle,
  QrCode,
  Globe,
  Lock,
  Heart,
  Zap,
  BarChart3,
  Star,
  Coins,
  Plus,
} from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import { ICONMART_HEX } from '../palette';

interface ProductCard {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface CategoryEntry {
  id: string;
  name: string;
  count?: number;
}

interface IconMartHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl?: string | null;
  };
  products: ProductCard[];
  categories: CategoryEntry[];
  landingContent?: {
    heroHeadline?: string | null;
    heroSubheadline?: string | null;
    heroCtaLabel?: string | null;
    heroCtaUrl?: string | null;
    heroImageUrl?: string | null;
  } | null;
}

const ACCENT = `var(--shop-primary, ${ICONMART_HEX.primary})`;
const ACCENT_HOVER = `var(--shop-primary-hover, ${ICONMART_HEX.primaryHover})`;

// Default category chips from the export catalogue (CATS).
const FALLBACK_CATEGORIES: { name: string; Icon: typeof Share2 }[] = [
  { name: 'โซเชียล', Icon: Share2 },
  { name: 'ชำระเงิน', Icon: CreditCard },
  { name: 'ธุรกิจ', Icon: Briefcase },
  { name: 'อินเทอร์เฟซ', Icon: Grid3x3 },
];

// 4×2 hero art tiles — geometric glyph mix from the export's hero demo.
// `fill` / `fill2` mark the two accent / ink tiles (idx 2 & 5).
const HERO_TILES: { Icon: typeof Share2; variant: 'fill' | 'fill2' | '' }[] = [
  { Icon: MessageCircle, variant: '' },
  { Icon: CreditCard, variant: '' },
  { Icon: BarChart3, variant: 'fill' },
  { Icon: Zap, variant: '' },
  { Icon: Heart, variant: '' },
  { Icon: QrCode, variant: 'fill2' },
  { Icon: Globe, variant: '' },
  { Icon: Lock, variant: '' },
];

// Featured glyph cards when the store has no products yet — keeps the
// homepage looking populated like the export gallery.
const FALLBACK_GLYPHS: { name: string; cat: string; Icon: typeof Share2 }[] = [
  { name: 'แชท', cat: 'โซเชียล', Icon: MessageCircle },
  { name: 'แชร์', cat: 'โซเชียล', Icon: Share2 },
  { name: 'คิวอาร์โค้ด', cat: 'ชำระเงิน', Icon: QrCode },
  { name: 'บัตรชำระเงิน', cat: 'ชำระเงิน', Icon: CreditCard },
  { name: 'กราฟแท่ง', cat: 'ธุรกิจ', Icon: BarChart3 },
  { name: 'โกลบอล', cat: 'ธุรกิจ', Icon: Globe },
  { name: 'กริด', cat: 'อินเทอร์เฟซ', Icon: Grid3x3 },
  { name: 'ล็อก', cat: 'อินเทอร์เฟซ', Icon: Lock },
  { name: 'ดาว', cat: 'โซเชียล', Icon: Star },
  { name: 'สายฟ้า', cat: 'อินเทอร์เฟซ', Icon: Zap },
];

export function IconMartHomepage({
  store,
  products,
  categories,
  landingContent,
}: IconMartHomepageProps) {
  const catalogUrl = `/stores/${store.slug}/category`;
  const topupUrl = `/stores/${store.slug}/account/credit/topup`;
  const firstProductId = products[0]?.id;

  const headline =
    landingContent?.heroHeadline?.trim() || 'ไอคอนที่เข้าชุดกัน พร้อมวางลงงานทันที';
  const subheadline =
    landingContent?.heroSubheadline?.trim() ||
    'ชุดไอคอนออริจินัลเชิงเรขาคณิต ทั้งแบบเส้นและแบบทึบ ครอบคลุมโซเชียล ช่องทางชำระเงิน ธุรกิจ และอินเทอร์เฟซ ซื้อด้วยเครดิต ดาวน์โหลดเป็น SVG ได้ทันที ไม่มีค่าจัดส่ง';
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || 'เลือกดูไอคอน';

  // Hero image fallback chain: landingContent → store banner → first
  // product image. When none exists, the geometric tile panel renders.
  const heroImageUrl =
    landingContent?.heroImageUrl?.trim() ||
    store.bannerUrl?.trim() ||
    products.find((p) => p.imageUrl)?.imageUrl ||
    null;

  const featured = products.slice(0, 6);

  // Category chips — real categories first, fall back to the export's 4.
  const chipList =
    categories.length > 0
      ? categories.slice(0, 6).map((c, i) => ({
          name: c.name,
          count: c.count ?? 0,
          Icon: FALLBACK_CATEGORIES[i % FALLBACK_CATEGORIES.length].Icon,
          href: `${catalogUrl}?cat=${encodeURIComponent(c.name)}`,
        }))
      : FALLBACK_CATEGORIES.map((c) => ({
          name: c.name,
          count: 0,
          Icon: c.Icon,
          href: catalogUrl,
        }));

  const metaStats = [
    { value: products.length > 0 ? String(products.length) : '32', label: 'ไอคอนในคลัง' },
    {
      value: categories.length > 0 ? String(categories.length) : '5',
      label: 'แพ็กพร้อมใช้',
    },
    { value: '2', label: 'สไตล์ เส้น · ทึบ' },
    { value: 'SVG', label: 'เวกเตอร์คมชัด' },
  ];

  return (
    <div
      className="min-h-screen font-[family:var(--font-prompt)]"
      style={{
        background: `var(--shop-bg, ${ICONMART_HEX.bg})`,
        color: `var(--shop-ink, ${ICONMART_HEX.ink})`,
        // Inline --shop-* fallbacks so the cool-blue look renders even
        // before the family layout seeds the cascade.
        ['--shop-primary' as string]: ICONMART_HEX.primary,
        ['--shop-primary-hover' as string]: ICONMART_HEX.primaryHover,
      }}
    >
      <style jsx>{`
        @keyframes im-fade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @keyframes im-pop {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .im-section {
          animation: im-fade 0.5s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .im-tile {
          animation: im-pop 0.45s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .im-tile:hover {
          transform: translateY(-3px) scale(1.02);
        }
      `}</style>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* ───── Hero ───── */}
        <section className="im-section pt-10 sm:pt-14 pb-2">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">
            {/* Left — copy + CTA + meta */}
            <div>
              <span
                className="font-[family:var(--font-prompt)] text-[12px] font-semibold uppercase"
                style={{ color: ACCENT_HOVER, letterSpacing: '0.16em' }}
              >
                คลังไอคอนสำหรับนักออกแบบ
              </span>
              <h1
                className="mt-1.5 font-[family:var(--font-kanit)] font-extrabold leading-[1.04] tracking-tight text-[clamp(34px,5.4vw,58px)]"
                style={{ color: `var(--shop-ink, ${ICONMART_HEX.ink})` }}
              >
                {headline}
              </h1>
              <p
                className="mt-5 text-[17px] sm:text-[18px] leading-relaxed max-w-[46ch]"
                style={{ color: ICONMART_HEX.inkMuted }}
              >
                {subheadline}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={catalogUrl}
                  className="inline-flex items-center gap-2 h-[44px] px-5 rounded-[11px] text-white text-[14px] font-semibold transition-transform hover:-translate-y-0.5"
                  style={{ background: ACCENT }}
                >
                  {ctaLabel}
                  <ArrowRight className="w-[17px] h-[17px]" />
                </Link>
                <Link
                  href={catalogUrl}
                  className="inline-flex items-center gap-2 h-[44px] px-5 rounded-[11px] text-[14px] font-semibold border transition-colors hover:border-[var(--shop-primary)]"
                  style={{
                    borderColor: ICONMART_HEX.border2,
                    background: ICONMART_HEX.surface,
                    color: `var(--shop-ink, ${ICONMART_HEX.ink})`,
                  }}
                >
                  ดูแพ็กทั้งหมด
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 sm:gap-7">
                {metaStats.map((m) => (
                  <div key={m.label} className="tabular-nums">
                    <b
                      className="block font-[family:var(--font-kanit)] text-[24px] font-bold tracking-tight"
                      style={{ color: `var(--shop-ink, ${ICONMART_HEX.ink})` }}
                    >
                      {m.value}
                    </b>
                    <span
                      className="block text-[12.5px] mt-0.5"
                      style={{ color: ICONMART_HEX.faint }}
                    >
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero art (image, else geometric icon-tile panel) */}
            <div
              className="order-first lg:order-last rounded-[22px] border p-6 shadow-sm overflow-hidden"
              style={{
                borderColor: ICONMART_HEX.border,
                background: `radial-gradient(120% 100% at 80% 0%, ${ICONMART_HEX.accentSoft}, transparent 60%), ${ICONMART_HEX.surface}`,
              }}
            >
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt={store.name}
                  className="w-full h-full max-h-[360px] object-cover rounded-[14px]"
                />
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {HERO_TILES.map((t, idx) => {
                    const isFill = t.variant === 'fill';
                    const isFill2 = t.variant === 'fill2';
                    const TileIcon = t.Icon;
                    return (
                      <div
                        key={idx}
                        className="im-tile aspect-square rounded-[14px] grid place-items-center border transition-[transform,box-shadow] duration-300"
                        style={{
                          animationDelay: `${idx * 50}ms`,
                          background: isFill
                            ? ACCENT
                            : isFill2
                              ? ICONMART_HEX.ink
                              : ICONMART_HEX.surface,
                          borderColor:
                            isFill || isFill2 ? 'transparent' : ICONMART_HEX.border,
                          color:
                            isFill || isFill2
                              ? '#fff'
                              : `var(--shop-ink, ${ICONMART_HEX.ink})`,
                        }}
                      >
                        <TileIcon className="w-[30px] h-[30px]" strokeWidth={1.7} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ───── Category chips ───── */}
        <section className="im-section mt-14">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
            <div>
              <span
                className="text-[12px] font-semibold uppercase"
                style={{ color: ACCENT_HOVER, letterSpacing: '0.16em' }}
              >
                หมวดหมู่
              </span>
              <h2
                className="mt-1.5 font-[family:var(--font-kanit)] font-bold tracking-tight text-[clamp(22px,3vw,30px)]"
                style={{ color: `var(--shop-ink, ${ICONMART_HEX.ink})` }}
              >
                เลือกจากหมวดที่ใช้บ่อย
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {chipList.map((c) => {
              const ChipIcon = c.Icon;
              return (
                <Link
                  key={c.name}
                  href={c.href}
                  className="inline-flex items-center gap-2 h-[38px] px-4 rounded-full border text-[14px] font-medium transition-colors hover:border-[var(--shop-primary)] hover:text-[var(--shop-primary)]"
                  style={{
                    borderColor: ICONMART_HEX.border2,
                    background: ICONMART_HEX.surface,
                    color: ICONMART_HEX.inkMuted,
                  }}
                >
                  <ChipIcon className="w-4 h-4" />
                  {c.name}
                  {c.count > 0 ? (
                    <span className="text-[12px] opacity-60 tabular-nums">
                      {c.count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ───── Featured icon glyphs ───── */}
        <section className="im-section mt-12">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
            <div>
              <span
                className="text-[12px] font-semibold uppercase"
                style={{ color: ACCENT_HOVER, letterSpacing: '0.16em' }}
              >
                แกลเลอรีไอคอน
              </span>
              <h2
                className="mt-1.5 font-[family:var(--font-kanit)] font-bold tracking-tight text-[clamp(22px,3vw,30px)]"
                style={{ color: `var(--shop-ink, ${ICONMART_HEX.ink})` }}
              >
                เลือกได้ทั้งชิ้นเดียวหรือทั้งแพ็ก
              </h2>
            </div>
            <Link
              href={catalogUrl}
              className="hidden sm:inline text-[14px] font-medium hover:underline underline-offset-4"
              style={{ color: ACCENT }}
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {FALLBACK_GLYPHS.map((g, idx) => {
              const GlyphIcon = g.Icon;
              const solid = idx % 4 === 0;
              return (
                <Link
                  key={g.name}
                  href={catalogUrl}
                  className="group flex flex-col items-center gap-3 rounded-[14px] border px-4 pt-[18px] pb-3.5 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-sm"
                  style={{
                    borderColor: ICONMART_HEX.border,
                    background: ICONMART_HEX.surface,
                  }}
                >
                  <span
                    className="w-16 h-16 rounded-[16px] grid place-items-center transition-colors"
                    style={
                      solid
                        ? { background: ACCENT, color: '#fff' }
                        : {
                            background: ICONMART_HEX.surface2,
                            border: `1px solid ${ICONMART_HEX.border}`,
                            color: `var(--shop-ink, ${ICONMART_HEX.ink})`,
                          }
                    }
                  >
                    <GlyphIcon className="w-[30px] h-[30px]" strokeWidth={1.7} />
                  </span>
                  <div className="text-center">
                    <div
                      className="text-[13.5px] font-semibold"
                      style={{ color: `var(--shop-ink, ${ICONMART_HEX.ink})` }}
                    >
                      {g.name}
                    </div>
                    <div
                      className="text-[11.5px]"
                      style={{ color: ICONMART_HEX.faint }}
                    >
                      {g.cat}
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full mt-auto pt-1">
                    <span
                      className="inline-flex items-center gap-1.5 font-[family:var(--font-kanit)] font-bold text-[15px] tabular-nums"
                      style={{ color: `var(--shop-ink, ${ICONMART_HEX.ink})` }}
                    >
                      <Coins className="w-[15px] h-[15px]" style={{ color: ACCENT }} />8
                    </span>
                    <span
                      className="w-[34px] h-[34px] rounded-[9px] grid place-items-center border transition-colors group-hover:bg-[var(--shop-primary)] group-hover:text-white group-hover:border-transparent"
                      style={{
                        borderColor: ICONMART_HEX.border2,
                        color: `var(--shop-ink, ${ICONMART_HEX.ink})`,
                      }}
                      aria-hidden="true"
                    >
                      <Plus className="w-[17px] h-[17px]" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ───── Featured packs / products rail ───── */}
        {featured.length > 0 ? (
          <section className="im-section mt-12 pb-16">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
              <div>
                <span
                  className="text-[12px] font-semibold uppercase"
                  style={{ color: ACCENT_HOVER, letterSpacing: '0.16em' }}
                >
                  แพ็กแนะนำ
                </span>
                <h2
                  className="mt-1.5 font-[family:var(--font-kanit)] font-bold tracking-tight text-[clamp(22px,3vw,30px)]"
                  style={{ color: `var(--shop-ink, ${ICONMART_HEX.ink})` }}
                >
                  ซื้อทั้งชุด คุ้มกว่าซื้อทีละชิ้น
                </h2>
              </div>
              <Link
                href={catalogUrl}
                className="hidden sm:inline text-[14px] font-medium hover:underline underline-offset-4"
                style={{ color: ACCENT }}
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-[18px]">
              {featured.map((p) => {
                const hasDiscount =
                  p.compareAtPriceTHB != null && p.compareAtPriceTHB > p.priceTHB;
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group flex flex-col rounded-[14px] border overflow-hidden transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-sm"
                    style={{
                      borderColor: ICONMART_HEX.border,
                      background: ICONMART_HEX.surface,
                    }}
                  >
                    <div
                      className="relative aspect-[4/3]"
                      style={{
                        background: ICONMART_HEX.surface2,
                        borderBottom: `1px solid ${ICONMART_HEX.border}`,
                      }}
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <Grid3x3
                            className="w-10 h-10"
                            style={{ color: ACCENT, opacity: 0.5 }}
                          />
                        </div>
                      )}
                      <span
                        className="absolute top-2 right-2 inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold"
                        style={{
                          background: 'rgba(255,255,255,0.95)',
                          border: `1px solid ${ICONMART_HEX.border}`,
                          color: ACCENT_HOVER,
                        }}
                      >
                        SVG
                      </span>
                    </div>
                    <div className="p-4 flex flex-col gap-1.5 flex-1">
                      {p.categoryName ? (
                        <span
                          className="text-[11px] uppercase tracking-[0.12em] font-semibold"
                          style={{ color: ACCENT_HOVER }}
                        >
                          {p.categoryName}
                        </span>
                      ) : null}
                      <h3
                        className="font-[family:var(--font-kanit)] text-[18px] font-semibold tracking-tight line-clamp-2"
                        style={{ color: `var(--shop-ink, ${ICONMART_HEX.ink})` }}
                      >
                        {p.title}
                      </h3>
                      <div className="mt-auto pt-2 flex items-baseline gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 font-[family:var(--font-kanit)] font-bold text-[18px] tabular-nums"
                          style={{ color: `var(--shop-ink, ${ICONMART_HEX.ink})` }}
                        >
                          <Coins
                            className="w-[15px] h-[15px] self-center"
                            style={{ color: ACCENT }}
                          />
                          {formatTHB(p.priceTHB)}
                        </span>
                        {hasDiscount ? (
                          <span
                            className="text-xs line-through"
                            style={{ color: ICONMART_HEX.faint }}
                          >
                            {formatTHB(p.compareAtPriceTHB as number)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="pb-16" />
        )}
      </div>
    </div>
  );
}

export default IconMartHomepage;
