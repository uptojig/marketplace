'use client';

/**
 * sheetlab-formula — Homepage
 *
 * Landing page for a digital Excel-formula storefront. The layout
 * evokes a spreadsheet (subtle 1px grid in the hero, monospace
 * formula bar, category "cells") without being literally a copy of
 * Excel.
 *
 * Sections (top to bottom):
 *   1. Hero — headline + CTA + formula bar mock + 2x2 category grid
 *   2. Trust strip — instant download / updates / Thai / secure link
 *   3. Category grid — derived from props (fallback to defaults)
 *   4. Featured products rail — up to 8 cards
 *   5. How-it-works — 3 circled steps
 *   6. Mini FAQ — 3 native <details> rows
 */

import React from 'react';
import Link from 'next/link';
import { FileSpreadsheet, ArrowRight } from 'lucide-react';
import { formatTHB } from '@/lib/utils';

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

interface SheetlabFormulaHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  products: ProductCard[];
  categories: CategoryEntry[];
  landingContent?: {
    heroHeadline?: string | null;
    heroSubheadline?: string | null;
    heroCtaLabel?: string | null;
    heroCtaUrl?: string | null;
  } | null;
}

const FALLBACK_CATEGORY_TILES: { emoji: string; name: string }[] = [
  { emoji: '💰', name: 'การเงิน' },
  { emoji: '📊', name: 'การตลาด' },
  { emoji: '📦', name: 'คลังสินค้า' },
  { emoji: '🧾', name: 'บัญชี' },
  { emoji: '👥', name: 'HR' },
  { emoji: '📈', name: 'แดชบอร์ด' },
];

const TRUST_TILES = [
  { icon: '⚡', label: 'ดาวน์โหลดทันทีหลังชำระ' },
  { icon: '🔄', label: 'อัปเดตฟรีตลอดอายุไฟล์' },
  { icon: '🇹🇭', label: 'รองรับภาษาไทย' },
  { icon: '🔒', label: 'ลิงก์ปลอดภัย 10 นาที' },
];

const HOW_IT_WORKS = [
  { step: 1, title: 'เลือกสูตรที่ต้องการ', caption: 'เลือกจากหมวดและพรีวิวก่อนซื้อ' },
  { step: 2, title: 'ชำระเงินออนไลน์', caption: 'QR Code PromptPay' },
  { step: 3, title: 'ดาวน์โหลด .xlsx ทันที', caption: 'ลิงก์ส่งทางอีเมล + คลังบัญชี' },
];

const FAQ_ITEMS = [
  {
    q: 'เปิดบน Excel เวอร์ชั่นไหนได้บ้าง?',
    a: 'รองรับ Excel 2019, Excel 365 และ Google Sheets (import .xlsx) ทุกสูตรทดสอบบน Windows และ macOS',
  },
  {
    q: 'หลังซื้อ ดาวน์โหลดที่ไหน?',
    a: 'ลิงก์ดาวน์โหลดส่งทางอีเมลทันที และเข้าดูได้ตลอดจาก "คลังสินค้าดิจิทัล" ในบัญชีของคุณ',
  },
  {
    q: 'อัปเดตไฟล์ใหม่ ต้องจ่ายเพิ่มไหม?',
    a: 'อัปเดตฟรีตลอดอายุไฟล์ เมื่อมีเวอร์ชั่นใหม่ คุณดาวน์โหลดได้จากบัญชีเดิม',
  },
];

export function SheetlabFormulaHomepage({
  store,
  products,
  categories,
  landingContent,
}: SheetlabFormulaHomepageProps) {
  const homeUrl = `/stores/${store.slug}`;
  const catalogUrl = `/stores/${store.slug}/category`;
  const firstProductId = products[0]?.id;

  const headline =
    landingContent?.heroHeadline?.trim() ||
    'สูตร Excel พร้อมใช้ — ไม่ต้องเริ่มจากศูนย์';
  const subheadline =
    landingContent?.heroSubheadline?.trim() ||
    'แดชบอร์ด เครื่องคำนวณ และเทมเพลตสเปรดชีต ดาวน์โหลดทันทีหลังชำระเงิน';
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || 'เลือกซื้อสูตร';

  const featured = products.slice(0, 8);

  // Build the category tiles for the in-hero 2x2 grid. Mix real
  // categories first (if present) and fall back to the canonical
  // 4 finance/marketing/inventory/accounting tiles.
  const heroTiles =
    categories.length >= 4
      ? categories.slice(0, 4).map((c, i) => ({
          emoji: FALLBACK_CATEGORY_TILES[i]?.emoji ?? '📊',
          name: c.name,
          href: `${catalogUrl}?cat=${encodeURIComponent(c.name)}`,
        }))
      : FALLBACK_CATEGORY_TILES.slice(0, 4).map((t) => ({
          emoji: t.emoji,
          name: t.name,
          href: catalogUrl,
        }));

  // Main category grid below. If no DB-driven categories, show 6
  // canonical fallback tiles all pointing to the catalog index.
  const categoryGrid =
    categories.length > 0
      ? categories.slice(0, 6).map((c, i) => ({
          emoji: FALLBACK_CATEGORY_TILES[i]?.emoji ?? '📈',
          name: c.name,
          count: c.count ?? 0,
          href: `${catalogUrl}?cat=${encodeURIComponent(c.name)}`,
        }))
      : FALLBACK_CATEGORY_TILES.slice(0, 6).map((t) => ({
          emoji: t.emoji,
          name: t.name,
          count: 0,
          href: catalogUrl,
        }));

  return (
    <div
      className="min-h-screen bg-[#F8FAFB] text-[#1F2937] font-[family:var(--font-prompt)]"
      style={{
        ['--shop-primary' as string]: '#107C41',
      }}
    >
      {/* ───── Hero ───── */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: '#F8FAFB',
          backgroundImage:
            'linear-gradient(to right, rgba(16,124,65,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,124,65,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left — copy + CTA */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D1FAE5] text-[12px] text-[#107C41] mb-5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{store.name} · Digital Toolkit</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[family:var(--font-kanit)] font-semibold text-[#1F2937] leading-tight tracking-tight">
                {headline}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-[#4B5563] max-w-xl leading-relaxed">
                {subheadline}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href={catalogUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-white text-sm font-medium shadow-sm hover:opacity-95 transition-opacity"
                  style={{ background: '#107C41' }}
                >
                  {ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>

              </div>
            </div>

            {/* Right — formula bar mock + 2x2 cells */}
            <div className="relative">
              <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
                {/* Window header */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#E5E7EB] bg-[#F3F4F6]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" aria-hidden="true" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" aria-hidden="true" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
                  <span className="ml-3 text-[11px] text-[#6B7280] truncate">
                    {store.name} — dashboard.xlsx
                  </span>
                </div>
                {/* Formula bar */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E5E7EB] bg-white">
                  <span
                    className="inline-flex items-center justify-center w-7 h-6 rounded text-[11px] font-semibold italic text-[#107C41] border border-[#E5E7EB] bg-[#F8FAFB]"
                    aria-hidden="true"
                  >
                    fx
                  </span>
                  <code className="font-mono text-[12px] sm:text-[13px] text-[#1F2937] truncate">
                    =DASHBOARD_REVENUE(B2:B13)
                  </code>
                </div>
                {/* 2x2 grid of "cells" */}
                <div className="grid grid-cols-2">
                  {heroTiles.map((tile, idx) => (
                    <Link
                      key={`${tile.name}-${idx}`}
                      href={tile.href}
                      className="group flex flex-col items-center justify-center gap-2 py-7 px-4 border-[#E5E7EB] hover:bg-[#F0FDF4] transition-colors"
                      style={{
                        borderRightWidth: idx % 2 === 0 ? 1 : 0,
                        borderBottomWidth: idx < 2 ? 1 : 0,
                      }}
                    >
                      <span className="text-3xl" aria-hidden="true">
                        {tile.emoji}
                      </span>
                      <span className="text-sm font-medium text-[#1F2937] group-hover:text-[#107C41] text-center">
                        {tile.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Trust strip ───── */}
      <section className="border-y border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_TILES.map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-3 text-sm text-[#374151]"
              >
                <span className="text-xl" aria-hidden="true">
                  {t.icon}
                </span>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Category grid ───── */}
      <section className="py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-[family:var(--font-kanit)] font-semibold text-[#1F2937] tracking-tight">
                หมวดสูตร
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                เลือกตามงานที่ใช้ — ทุกไฟล์เปิดได้ทันทีบน Excel
              </p>
            </div>
            <Link
              href={catalogUrl}
              className="hidden sm:inline text-sm text-[#107C41] hover:underline underline-offset-4"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryGrid.map((c) => (
              <Link
                key={c.name}
                href={c.href}
                className="group block bg-white rounded-lg border border-[#E5E7EB] hover:border-[#107C41] hover:shadow-md transition-all p-5 text-center"
              >
                <div className="text-3xl mb-2" aria-hidden="true">
                  {c.emoji}
                </div>
                <div className="text-sm font-medium text-[#1F2937] group-hover:text-[#107C41]">
                  {c.name}
                </div>
                <div className="text-[11px] text-[#6B7280] mt-1">
                  ดู {c.count} สูตร
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Featured products rail ───── */}
      {featured.length > 0 ? (
        <section className="pb-14 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-[family:var(--font-kanit)] font-semibold text-[#1F2937] tracking-tight">
                  สูตรแนะนำ
                </h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  ขายดี · พร้อมดาวน์โหลดทันที
                </p>
              </div>
              <Link
                href={catalogUrl}
                className="hidden sm:inline text-sm text-[#107C41] hover:underline underline-offset-4"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {featured.map((p) => {
                const hasDiscount =
                  p.compareAtPriceTHB != null &&
                  p.compareAtPriceTHB > p.priceTHB;
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group bg-white rounded-lg border border-[#E5E7EB] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    {/* Top primary-accent edge */}
                    <div
                      className="h-1 w-full"
                      style={{ background: '#107C41' }}
                      aria-hidden="true"
                    />
                    <div className="relative aspect-[4/3] bg-[#F3F4F6]">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileSpreadsheet className="w-10 h-10 text-[#107C41] opacity-50" />
                        </div>
                      )}
                      <span
                        className="absolute top-2 right-2 inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold bg-white/95 border border-[#E5E7EB] text-[#107C41]"
                      >
                        💾 Digital
                      </span>
                    </div>
                    <div className="p-3 sm:p-4">
                      {p.categoryName ? (
                        <span className="inline-block text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                          {p.categoryName}
                        </span>
                      ) : null}
                      <h3 className="text-sm font-medium text-[#1F2937] line-clamp-2 group-hover:text-[#107C41] transition-colors">
                        {p.title}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span
                          className="text-base font-semibold"
                          style={{ color: '#107C41' }}
                        >
                          {formatTHB(p.priceTHB)}
                        </span>
                        {hasDiscount ? (
                          <span className="text-xs text-[#9CA3AF] line-through">
                            {formatTHB(p.compareAtPriceTHB as number)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ───── How it works ───── */}
      <section className="bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-[family:var(--font-kanit)] font-semibold text-[#1F2937] tracking-tight text-center">
            ใช้งานง่ายใน 3 ขั้นตอน
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="text-center">
                <div
                  className="mx-auto flex items-center justify-center w-14 h-14 rounded-full text-white text-xl font-semibold"
                  style={{ background: '#107C41' }}
                  aria-hidden="true"
                >
                  {s.step}
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#1F2937] font-[family:var(--font-kanit)]">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-[#6B7280]">{s.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Mini FAQ ───── */}
      <section className="py-14 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-[family:var(--font-kanit)] font-semibold text-[#1F2937] tracking-tight text-center mb-8">
            คำถามที่พบบ่อย
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-lg border border-[#E5E7EB] bg-white"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none px-4 sm:px-5 py-4 text-sm font-medium text-[#1F2937]">
                  <span>{item.q}</span>
                  <span
                    className="text-[#107C41] transition-transform group-open:rotate-45 text-lg leading-none"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-4 sm:px-5 pb-4 -mt-1 text-sm text-[#4B5563] leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default SheetlabFormulaHomepage;
