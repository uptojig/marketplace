'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  FileText,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  Star,
  Award,
  Layers,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { RESUME_FORGE_TONES } from '../palette';

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

const DEFAULT_HEADLINE = 'เรซูเม่ที่\nผ่าน ATS ทุกระบบ';
const DEFAULT_SUB =
  'คลังเทมเพลตเรซูเม่ · CV · cover letter ระดับมืออาชีพ ปรับแต่งได้ทันทีใน Word / Pages / Google Docs · ดาวน์โหลด .docx .pdf หลังชำระเงิน · เหมาะสมัครงานไทยและต่างประเทศ';
const DEFAULT_CTA = 'เลือกเทมเพลตของคุณ';

const FORMAT_BADGES = [
  { label: '.docx', color: 'bg-[#DBEAFE] text-[#1E40AF]' },
  { label: '.pdf', color: 'bg-[#FEF3C7] text-[#B45309]' },
  { label: 'Google Docs', color: 'bg-[#DCFCE7] text-[#15803D]' },
  { label: 'Pages', color: 'bg-[#EDE9FE] text-[#6D28D9]' },
];

const STAT_HIGHLIGHTS = [
  { icon: CheckCircle2, label: 'ผ่าน ATS ทุกระบบ', sub: 'Workday · Greenhouse · Lever', color: '#15803D', bg: '#DCFCE7' },
  { icon: Layers, label: 'แก้ไขได้ทันที', sub: 'Word · Pages · Google Docs', color: '#1E40AF', bg: '#DBEAFE' },
  { icon: ShieldCheck, label: 'ใบอนุญาตเชิงพาณิชย์', sub: 'ใช้สมัครงานได้ไม่จำกัดครั้ง', color: '#B45309', bg: '#FEF3C7' },
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
    <main className="bg-[#F8FAFC] text-[#0F172A] font-[family:var(--font-prompt)]">
      {/* ─────── Hero ─────── */}
      <section className="relative overflow-hidden rf-grid-bg border-b border-[#CBD5E1]">
        <div className="absolute top-12 right-10 w-32 h-32 rounded-full bg-[#1E3A8A]/10 blur-3xl pointer-events-none hidden md:block" aria-hidden />
        <div className="absolute bottom-12 left-10 w-40 h-40 rounded-full bg-[#B45309]/10 blur-3xl pointer-events-none hidden md:block" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-md bg-white border border-[#CBD5E1] px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase shadow-sm text-[#1E3A8A] font-[family:var(--font-kanit)]">
              <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
              อัปเดตเทมเพลต {new Date().getFullYear() + 543}
            </div>

            <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] whitespace-pre-line">
              <span className="rf-gradient-text">{headline}</span>
            </h1>

            <span className="rf-rule" aria-hidden />

            <p className="text-base sm:text-lg text-[#334155] max-w-xl mx-auto md:mx-0 leading-relaxed">
              {sub}
            </p>

            {/* Format badges */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {FORMAT_BADGES.map((b) => (
                <span
                  key={b.label}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold tracking-[0.1em] font-[family:var(--font-kanit)] ${b.color}`}
                >
                  <FileText className="w-3 h-3" />
                  {b.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-md bg-[#1E3A8A] text-white font-[family:var(--font-kanit)] font-semibold text-base rf-glow-primary hover:bg-[#1E40AF] active:scale-95 transition-all"
              >
                {ctaLabel}
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-md bg-white border border-[#1E3A8A] text-[#1E3A8A] font-[family:var(--font-kanit)] font-semibold text-base hover:bg-[#1E3A8A] hover:text-white active:scale-95 transition-all"
              >
                <Briefcase className="w-5 h-5" />
                ดูตัวอย่างทั้งหมด
              </Link>
            </div>
          </div>

          {/* Hero artwork — resume preview mock */}
          <div className="relative mx-auto w-full max-w-md aspect-[3/4]">
            <div className="absolute -top-4 -left-4 right-6 bottom-6 rounded-2xl bg-[#1E3A8A]/5 border border-[#CBD5E1] rotate-[-3deg]" aria-hidden />
            <div className="absolute top-2 -right-2 left-6 bottom-2 rounded-2xl bg-[#B45309]/5 border border-[#FDE68A] rotate-[2deg]" aria-hidden />
            <div className="relative w-full h-full rounded-2xl bg-white border border-[#CBD5E1] shadow-[0_24px_64px_-24px_rgba(30,58,138,0.4)] overflow-hidden">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt={store.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col gap-3">
                  {/* Header band */}
                  <div className="flex items-end justify-between border-b border-[#E2E8F0] pb-3">
                    <div>
                      <div className="h-3 w-32 rounded bg-[#0F172A] mb-1.5" />
                      <div className="h-2 w-20 rounded bg-[#B45309]" />
                    </div>
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#1E3A8A] to-[#172554] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#FBBF24]" />
                    </div>
                  </div>
                  {/* Contact line */}
                  <div className="flex gap-1.5">
                    <div className="h-1.5 w-16 rounded bg-[#CBD5E1]" />
                    <div className="h-1.5 w-12 rounded bg-[#CBD5E1]" />
                    <div className="h-1.5 w-14 rounded bg-[#CBD5E1]" />
                  </div>
                  {/* Section: Summary */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-sm bg-[#1E3A8A]" />
                      <div className="h-2 w-24 rounded bg-[#1E3A8A]" />
                    </div>
                    <div className="h-1.5 w-full rounded bg-[#E2E8F0]" />
                    <div className="h-1.5 w-11/12 rounded bg-[#E2E8F0]" />
                    <div className="h-1.5 w-9/12 rounded bg-[#E2E8F0]" />
                  </div>
                  {/* Section: Experience */}
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-sm bg-[#1E3A8A]" />
                      <div className="h-2 w-28 rounded bg-[#1E3A8A]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <div className="h-1.5 w-24 rounded bg-[#0F172A]" />
                        <div className="h-1.5 w-12 rounded bg-[#94A3B8]" />
                      </div>
                      <div className="h-1.5 w-32 rounded bg-[#B45309]" />
                      <div className="h-1 w-full rounded bg-[#E2E8F0]" />
                      <div className="h-1 w-10/12 rounded bg-[#E2E8F0]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <div className="h-1.5 w-28 rounded bg-[#0F172A]" />
                        <div className="h-1.5 w-12 rounded bg-[#94A3B8]" />
                      </div>
                      <div className="h-1.5 w-32 rounded bg-[#B45309]" />
                      <div className="h-1 w-full rounded bg-[#E2E8F0]" />
                      <div className="h-1 w-11/12 rounded bg-[#E2E8F0]" />
                    </div>
                  </div>
                  {/* ATS pass overlay chip */}
                  <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rf-ats-chip rounded-md px-2.5 py-1 text-[10px] font-bold font-[family:var(--font-kanit)] shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    ATS 98%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────── Stat band ─────── */}
      <section className="bg-white border-b border-[#CBD5E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STAT_HIGHLIGHTS.map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-md flex items-center justify-center shrink-0 border border-[#E2E8F0]"
                style={{ backgroundColor: s.bg, color: s.color }}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-[family:var(--font-kanit)] font-bold text-sm text-[#0F172A]">
                  {s.label}
                </p>
                <p className="text-xs text-[#475569]">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────── Category chip rail ─────── */}
      {categories.length > 0 && (
        <section className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[family:var(--font-kanit)] font-bold text-xl sm:text-2xl tracking-tight">
                หมวดอาชีพ &amp; สาขา
              </h2>
              <Link
                href={`/stores/${store.slug}/category`}
                className="text-xs font-bold text-[#1E3A8A] hover:text-[#B45309] transition-colors"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <ul className="flex gap-3 overflow-x-auto rf-no-scrollbar pb-2">
              {categories.slice(0, 12).map((cat, idx) => {
                const tone = RESUME_FORGE_TONES[idx % RESUME_FORGE_TONES.length];
                return (
                  <li key={cat} className="shrink-0">
                    <Link
                      href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-md border font-[family:var(--font-kanit)] font-semibold text-sm transition-all hover:scale-[1.03]"
                      style={{
                        backgroundColor: tone.bg,
                        borderColor: tone.border,
                        color: tone.fg,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tone.fg }} />
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
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#B45309] mb-2 font-[family:var(--font-kanit)]">
              <Award className="inline w-3 h-3 mr-1" />
              คัดสรรพิเศษ
            </p>
            <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight">
              เทมเพลตยอดนิยมประจำสัปดาห์
            </h2>
            <span className="rf-rule mt-3" aria-hidden />
          </div>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-md bg-[#0F172A] text-white font-[family:var(--font-kanit)] font-semibold text-sm hover:bg-[#1E3A8A] transition-colors"
          >
            ดูทั้งหมด <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-white">
            <FileText className="w-12 h-12 mx-auto text-[#1E3A8A] mb-3" />
            <p className="font-[family:var(--font-kanit)] text-xl font-bold mb-1">
              ยังไม่มีเทมเพลตในร้าน
            </p>
            <p className="text-sm text-[#475569]">
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
              const tone = RESUME_FORGE_TONES[idx % RESUME_FORGE_TONES.length];

              return (
                <Link
                  key={product.id}
                  href={`/stores/${store.slug}/products/${product.id}`}
                  className="group rf-card relative rounded-xl overflow-hidden flex flex-col"
                >
                  <div
                    className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] uppercase shadow-md font-[family:var(--font-kanit)] border"
                    style={{
                      backgroundColor: tone.bg,
                      color: tone.fg,
                      borderColor: tone.border,
                    }}
                  >
                    {hasDiscount ? `ลด ${discount}%` : idx === 0 ? 'ยอดนิยม' : 'ใหม่'}
                  </div>

                  <div className="relative aspect-[3/4] bg-[#F8FAFC] overflow-hidden border-b border-[#E2E8F0]">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <ResumeMockup tone={tone} />
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      aria-label="เพิ่มในตะกร้า"
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-md bg-white text-[#1E3A8A] border border-[#CBD5E1] flex items-center justify-center shadow-md hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] hover:scale-110 active:scale-95 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col gap-2 bg-white">
                    {product.categoryName && (
                      <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#B45309] font-[family:var(--font-kanit)]">
                        {product.categoryName}
                      </p>
                    )}
                    <h3 className="font-[family:var(--font-kanit)] font-bold text-base leading-tight line-clamp-2 text-[#0F172A] flex-1">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="font-[family:var(--font-kanit)] font-bold text-lg text-[#1E3A8A]">
                        {formatTHB(product.priceTHB)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-[#94A3B8] line-through">
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
            <h2 className="font-[family:var(--font-kanit)] text-xl sm:text-2xl font-bold tracking-tight inline-flex items-center gap-3">
              <Star className="w-6 h-6 fill-[#B45309] text-[#B45309]" />
              กำลังมาแรง
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.map((p, idx) => {
              const tone = RESUME_FORGE_TONES[(idx + 3) % RESUME_FORGE_TONES.length];
              return (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="group rf-card rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[3/4] bg-[#F8FAFC] overflow-hidden border-b border-[#E2E8F0]">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <ResumeMockup tone={tone} compact />
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-1 bg-white">
                    <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm line-clamp-2 text-[#0F172A] flex-1">
                      {p.title}
                    </h3>
                    <p className="font-[family:var(--font-kanit)] font-bold text-sm text-[#1E3A8A]">
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
        <div className="max-w-5xl mx-auto rounded-2xl rf-stripe-bg border border-[#172554] p-8 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden style={{
            backgroundImage:
              'linear-gradient(rgba(251,191,36,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md bg-[#FBBF24]/15 border border-[#FBBF24]/40 text-[#FBBF24] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] font-[family:var(--font-kanit)]">
              <Award className="w-3.5 h-3.5" />
              ใช้งานแล้วกว่า 12,000 ใบสมัคร
            </div>
            <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight text-white">
              ใบสมัครงานต่อไป
              <br />
              <span className="text-[#FBBF24]">ผ่านเข้ารอบสัมภาษณ์แน่</span>
            </h3>
            <p className="text-base sm:text-lg text-[#CBD5E1] max-w-xl mx-auto">
              ทุกเทมเพลตผ่านการทดสอบกับระบบ ATS หลัก (Workday · Greenhouse · Lever · iCIMS) ปรับสีและเลย์เอาต์ได้อิสระ ดาวน์โหลดได้ไม่จำกัดครั้งหลังซื้อ
            </p>
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md bg-[#FBBF24] text-[#172554] font-[family:var(--font-kanit)] font-bold text-base hover:bg-[#F59E0B] hover:scale-[1.03] active:scale-95 transition-all shadow-xl"
            >
              เริ่มเลือกเทมเพลต
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/** Small SVG-style resume preview placeholder used when no imageUrl is set. */
function ResumeMockup({
  tone,
  compact = false,
}: {
  tone: { bg: string; fg: string; border: string };
  compact?: boolean;
}) {
  return (
    <div className={`absolute inset-0 ${compact ? 'p-3' : 'p-5'} flex flex-col gap-2`}>
      <div className="flex items-end justify-between border-b border-[#E2E8F0] pb-2">
        <div>
          <div className="h-2 w-20 rounded mb-1" style={{ backgroundColor: tone.fg }} />
          <div className="h-1.5 w-14 rounded" style={{ backgroundColor: tone.border }} />
        </div>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: tone.bg, color: tone.fg, border: `1px solid ${tone.border}` }}
        >
          <FileText className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: tone.fg }} />
          <div className="h-1.5 w-12 rounded" style={{ backgroundColor: tone.fg }} />
        </div>
        <div className="h-1 w-full rounded bg-[#E2E8F0]" />
        <div className="h-1 w-11/12 rounded bg-[#E2E8F0]" />
        <div className="h-1 w-10/12 rounded bg-[#E2E8F0]" />
      </div>
      <div className="space-y-1.5 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: tone.fg }} />
          <div className="h-1.5 w-16 rounded" style={{ backgroundColor: tone.fg }} />
        </div>
        <div className="h-1 w-full rounded bg-[#E2E8F0]" />
        <div className="h-1 w-10/12 rounded bg-[#E2E8F0]" />
        <div className="h-1 w-11/12 rounded bg-[#E2E8F0]" />
        <div className="h-1 w-9/12 rounded bg-[#E2E8F0]" />
      </div>
      {!compact && (
        <div className="space-y-1.5 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: tone.fg }} />
            <div className="h-1.5 w-14 rounded" style={{ backgroundColor: tone.fg }} />
          </div>
          <div className="flex gap-1">
            <div className="h-3 w-8 rounded" style={{ backgroundColor: tone.bg, border: `1px solid ${tone.border}` }} />
            <div className="h-3 w-10 rounded" style={{ backgroundColor: tone.bg, border: `1px solid ${tone.border}` }} />
            <div className="h-3 w-8 rounded" style={{ backgroundColor: tone.bg, border: `1px solid ${tone.border}` }} />
          </div>
        </div>
      )}
    </div>
  );
}
