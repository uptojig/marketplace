'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Briefcase,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { RESUME_FORGE_TONES } from '../palette';

interface ProductCard {
  id: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  categoryName?: string | null;
}

interface CatalogProps {
  store: { id: string; slug: string; name: string; logoUrl?: string | null };
  pageProducts: ProductCard[];
  categoryNames: string[];
  categoryCounts: Record<string, number>;
  selectedCats: string[];
  sortKey: string;
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  buildUrl: (toggleCat?: string, page?: number) => string;
  buildSortUrl: (sort: string) => string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'ใหม่ล่าสุด' },
  { value: 'price-asc', label: 'ราคา ต่ำ → สูง' },
  { value: 'price-desc', label: 'ราคา สูง → ต่ำ' },
  { value: 'name-asc', label: 'ชื่อ A-Z' },
];

export default function Catalog({
  store,
  pageProducts,
  categoryNames,
  categoryCounts,
  selectedCats,
  sortKey,
  currentPage,
  totalPages,
  filteredCount,
  buildUrl,
  buildSortUrl,
}: CatalogProps) {
  const add = useCart((s) => s.add);

  const handleAdd = (p: ProductCard, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: p.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: p.title,
      priceTHB: p.priceTHB,
      imageUrl: p.imageUrl || undefined,
    });
  };

  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] font-[family:var(--font-prompt)] min-h-screen">
      {/* Header band */}
      <section className="relative overflow-hidden rf-grid-bg border-b border-[#CBD5E1]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="inline-flex items-center gap-2 rounded-md bg-white border border-[#CBD5E1] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E3A8A] font-[family:var(--font-kanit)] mb-4">
            <Briefcase className="w-3.5 h-3.5 text-[#B45309]" />
            คลังเทมเพลตทั้งหมด
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight">
            <span className="rf-gradient-text">เลือกเทมเพลตของคุณ</span>
          </h1>
          <span className="rf-rule mt-4" aria-hidden />
          <p className="text-sm font-semibold text-[#475569] mt-3">
            {filteredCount} เทมเพลต · ผ่าน ATS · ดาวน์โหลดได้ทันทีหลังชำระเงิน
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl bg-white border border-[#CBD5E1] p-5 shadow-sm">
            <h2 className="font-[family:var(--font-kanit)] font-bold text-base mb-4 inline-flex items-center gap-2 text-[#0F172A] tracking-tight">
              <Filter className="w-4 h-4 text-[#1E3A8A]" />
              หมวดอาชีพ
            </h2>
            <div className="space-y-1.5">
              <Link
                href={buildUrl(undefined, 1)}
                className={`block px-3.5 py-2 rounded-md text-sm font-semibold transition-all ${
                  selectedCats.length === 0
                    ? 'bg-[#1E3A8A] text-white shadow-md'
                    : 'bg-[#F8FAFC] text-[#0F172A] hover:bg-[#E2E8F0]'
                }`}
              >
                ทั้งหมด <span className="opacity-70 text-xs">({filteredCount})</span>
              </Link>
              {categoryNames.map((cat, idx) => {
                const active = selectedCats.includes(cat);
                const tone = RESUME_FORGE_TONES[idx % RESUME_FORGE_TONES.length];
                return (
                  <Link
                    key={cat}
                    href={buildUrl(cat, 1)}
                    className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-md text-sm font-semibold transition-all border ${
                      active
                        ? 'text-white shadow-md'
                        : 'bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
                    }`}
                    style={
                      active
                        ? { backgroundColor: tone.fg, borderColor: tone.fg }
                        : { borderColor: '#E2E8F0' }
                    }
                  >
                    <span className="inline-flex items-center gap-2 truncate">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: active ? '#FFFFFF' : tone.fg }}
                      />
                      <span className="truncate">{cat}</span>
                    </span>
                    <span className="text-xs opacity-70 shrink-0">{categoryCounts[cat] ?? 0}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl rf-stripe-bg border border-[#172554] p-5 text-white">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#FBBF24] mb-1.5 font-[family:var(--font-kanit)]">
              ATS Guarantee
            </p>
            <p className="text-sm leading-relaxed text-[#CBD5E1]">
              ทุกเทมเพลตผ่านการทดสอบกับ Workday · Greenhouse · Lever · iCIMS เพื่อให้แน่ใจว่าระบบ ATS อ่านได้ครบ
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white border border-[#CBD5E1] p-3">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#475569] px-2 font-[family:var(--font-kanit)]">
              เรียงตาม
            </span>
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={buildSortUrl(opt.value)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-[#F8FAFC] text-[#0F172A] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>

          {pageProducts.length === 0 ? (
            <div className="text-center py-20 rounded-xl border-2 border-dashed border-[#CBD5E1] bg-white">
              <FileText className="w-12 h-12 mx-auto text-[#1E3A8A] mb-3" />
              <p className="font-[family:var(--font-kanit)] text-xl font-bold mb-1">
                ไม่พบเทมเพลต
              </p>
              <p className="text-sm text-[#475569] mb-6">
                ลองเปลี่ยนตัวกรอง หรือเรียกดูคลังทั้งหมด
              </p>
              <Link
                href={buildUrl(undefined, 1)}
                className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md bg-[#1E3A8A] text-white font-[family:var(--font-kanit)] font-semibold text-sm hover:bg-[#1E40AF] transition-colors"
              >
                ล้างตัวกรอง
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pageProducts.map((product, idx) => {
                const hasDiscount =
                  product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
                const tone = RESUME_FORGE_TONES[idx % RESUME_FORGE_TONES.length];
                return (
                  <Link
                    key={product.id}
                    href={`/stores/${store.slug}/products/${product.id}`}
                    className="group rf-card relative rounded-xl overflow-hidden flex flex-col"
                  >
                    {hasDiscount && (
                      <div
                        className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] uppercase shadow-md font-[family:var(--font-kanit)] border"
                        style={{
                          backgroundColor: tone.bg,
                          color: tone.fg,
                          borderColor: tone.border,
                        }}
                      >
                        ลดราคา
                      </div>
                    )}

                    <div className="relative aspect-[3/4] bg-[#F8FAFC] overflow-hidden border-b border-[#E2E8F0]">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <CatalogResumeMockup tone={tone} />
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleAdd(product, e)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="แบ่งหน้า"
              className="flex items-center justify-center gap-2 pt-6"
            >
              <Link
                href={buildUrl(undefined, Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={`h-10 w-10 rounded-md flex items-center justify-center font-bold border border-[#CBD5E1] ${
                  currentPage === 1
                    ? 'bg-[#F1F5F9] text-[#94A3B8] pointer-events-none'
                    : 'bg-white text-[#0F172A] hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <div className="h-10 px-5 rounded-md bg-[#1E3A8A] text-white inline-flex items-center font-[family:var(--font-kanit)] font-bold text-sm rf-glow-primary">
                {currentPage} / {totalPages}
              </div>
              <Link
                href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
                className={`h-10 w-10 rounded-md flex items-center justify-center font-bold border border-[#CBD5E1] ${
                  currentPage === totalPages
                    ? 'bg-[#F1F5F9] text-[#94A3B8] pointer-events-none'
                    : 'bg-white text-[#0F172A] hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A]'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}

function CatalogResumeMockup({
  tone,
}: {
  tone: { bg: string; fg: string; border: string };
}) {
  return (
    <div className="absolute inset-0 p-4 flex flex-col gap-2">
      <div className="flex items-end justify-between border-b border-[#E2E8F0] pb-2">
        <div>
          <div className="h-2.5 w-24 rounded mb-1.5" style={{ backgroundColor: tone.fg }} />
          <div className="h-1.5 w-16 rounded" style={{ backgroundColor: tone.border }} />
        </div>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ backgroundColor: tone.bg, color: tone.fg, border: `1px solid ${tone.border}` }}
        >
          <FileText className="w-4 h-4" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: tone.fg }} />
          <div className="h-1.5 w-14 rounded" style={{ backgroundColor: tone.fg }} />
        </div>
        <div className="h-1 w-full rounded bg-[#E2E8F0]" />
        <div className="h-1 w-10/12 rounded bg-[#E2E8F0]" />
      </div>
      <div className="space-y-1 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: tone.fg }} />
          <div className="h-1.5 w-16 rounded" style={{ backgroundColor: tone.fg }} />
        </div>
        <div className="h-1 w-full rounded bg-[#E2E8F0]" />
        <div className="h-1 w-11/12 rounded bg-[#E2E8F0]" />
        <div className="h-1 w-10/12 rounded bg-[#E2E8F0]" />
      </div>
      <div className="space-y-1 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: tone.fg }} />
          <div className="h-1.5 w-12 rounded" style={{ backgroundColor: tone.fg }} />
        </div>
        <div className="flex gap-1">
          <div className="h-3 w-9 rounded" style={{ backgroundColor: tone.bg, border: `1px solid ${tone.border}` }} />
          <div className="h-3 w-12 rounded" style={{ backgroundColor: tone.bg, border: `1px solid ${tone.border}` }} />
          <div className="h-3 w-9 rounded" style={{ backgroundColor: tone.bg, border: `1px solid ${tone.border}` }} />
        </div>
      </div>
    </div>
  );
}
