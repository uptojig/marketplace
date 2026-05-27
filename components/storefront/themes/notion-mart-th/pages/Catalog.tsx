'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, ChevronRight, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CatalogProps, TemplateProductCard } from '@/lib/templates/types';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'แนะนำ' },
  { value: 'low-to-high', label: 'ราคา: ต่ำ → สูง' },
  { value: 'high-to-low', label: 'ราคา: สูง → ต่ำ' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  'ระบบงาน': '✅',
  'จัดการเวลา': '⏱️',
  'CRM': '👥',
  'ฐานข้อมูล': '📊',
  'การเงิน': '💰',
  'การตลาด': '📈',
  'นักเรียน': '🎓',
  'ฟรีแลนซ์': '🧑‍💻',
  'แดชบอร์ด': '📋',
};

export default function NotionMartCatalog(props: CatalogProps) {
  const { store, pageProducts, categoryNames, categoryCounts, selectedCats, sortKey, currentPage, totalPages, filteredCount, buildUrl, buildSortUrl } = props;
  const add = useCart((s) => s.add);

  const handleAdd = (p: TemplateProductCard, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({ productId: p.id, storeSlug: store.slug, storeName: store.name, title: p.title, priceTHB: p.priceTHB, imageUrl: p.imageUrl ?? undefined });
  };

  const activeCat = selectedCats[0];
  const totalAll = Object.values(categoryCounts).reduce((s, n) => s + n, 0);

  return (
    <main className={`bg-white text-[#1A1A1A] min-h-screen ${FONT_BODY}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 space-y-6">
        <Link href={`/stores/${store.slug}`} className={`inline-flex items-center gap-1.5 text-[12px] ${FONT_HEADING} font-medium text-[#6B6B6B] hover:text-[#2563EB] hover:underline underline-offset-2 transition-colors`}>
          <ArrowLeft className="h-3 w-3" />
          กลับหน้าร้าน
        </Link>

        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-[11px] text-[#6B6B6B] tracking-wide">
          <span>📚 คลังเทมเพลต</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#1A1A1A]">{activeCat ?? 'ทั้งหมด'}</span>
        </nav>

        <header className="space-y-2">
          <p className={`text-[10px] tracking-[0.16em] uppercase ${FONT_HEADING} font-medium text-[#6B6B6B]`}>Database · Gallery view</p>
          <h1 className={`${FONT_HEADING} font-bold text-3xl sm:text-4xl text-[#1A1A1A] leading-tight`}>
            {activeCat ? `${CATEGORY_EMOJI[activeCat] ?? '📄'} ${activeCat}` : '📚 คลังเทมเพลตทั้งหมด'}
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">{filteredCount.toLocaleString()} เทมเพลต · ดาวน์โหลดทันทีหลังชำระ</p>
        </header>

        <section className="space-y-3 border-y border-[#E5E5E5] py-3">
          {categoryNames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Link href={buildUrl()} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] border transition-colors ${selectedCats.length === 0 ? 'bg-black text-white border-black' : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:bg-[#F7F6F3] hover:border-[#1A1A1A]'}`}>
                📚 ทั้งหมด <span className="text-[10px] tabular-nums opacity-70">{totalAll}</span>
              </Link>
              {categoryNames.map((c) => {
                const isActive = selectedCats.includes(c);
                return (
                  <Link key={c} href={buildUrl(c)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] border transition-colors ${isActive ? 'bg-black text-white border-black' : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:bg-[#F7F6F3] hover:border-[#1A1A1A]'}`}>
                    <span aria-hidden>{CATEGORY_EMOJI[c] ?? '📄'}</span>
                    {c}
                    <span className="text-[10px] tabular-nums opacity-70">{categoryCounts[c] ?? 0}</span>
                  </Link>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-[#6B6B6B] tracking-wide">หน้า {currentPage} จาก {Math.max(1, totalPages)} · {pageProducts.length} จาก {filteredCount.toLocaleString()}</p>
            <label className="inline-flex items-center gap-1.5 text-[11px] text-[#6B6B6B]">
              <span className={`${FONT_HEADING} font-medium uppercase tracking-[0.1em]`}>เรียง</span>
              <select value={sortKey} onChange={(e) => { window.location.href = buildSortUrl(e.target.value); }} className="bg-white border border-[#E5E5E5] rounded text-[12px] px-2 py-1 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]">
                {SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
            </label>
          </div>
        </section>

        {pageProducts.length === 0 ? (
          <div className="border border-dashed border-[#E5E5E5] rounded-md p-12 text-center bg-[#F7F6F3]">
            <p className="text-3xl mb-2" aria-hidden>📭</p>
            <p className={`text-[14px] ${FONT_HEADING} font-semibold text-[#1A1A1A]`}>ไม่มีเทมเพลตในหมวดนี้</p>
            <p className="mt-1 text-[12px] text-[#6B6B6B]">ลองเลือกหมวดอื่นได้จากตัวกรองด้านบน</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pageProducts.map((p) => (
              <CatalogCard key={p.id} product={p} storeSlug={store.slug} onAdd={(e) => handleAdd(p, e)} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="แบ่งหน้า" className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
            <Link href={buildUrl(undefined, Math.max(1, currentPage - 1))} aria-disabled={currentPage === 1} className={`px-3 py-1.5 bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F7F6F3] hover:border-[#1A1A1A] text-[12px] ${FONT_HEADING} font-medium rounded transition-colors ${currentPage === 1 ? 'opacity-40 pointer-events-none' : ''}`}>← ก่อนหน้า</Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={buildUrl(undefined, n)} aria-current={n === currentPage ? 'page' : undefined} className={`min-w-[36px] px-2.5 py-1.5 text-center text-[12px] ${FONT_HEADING} font-medium rounded border transition-colors tabular-nums ${n === currentPage ? 'bg-black text-white border-black' : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:bg-[#F7F6F3] hover:border-[#1A1A1A]'}`}>{n}</Link>
            ))}
            <Link href={buildUrl(undefined, Math.min(totalPages, currentPage + 1))} aria-disabled={currentPage === totalPages} className={`px-3 py-1.5 bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F7F6F3] hover:border-[#1A1A1A] text-[12px] ${FONT_HEADING} font-medium rounded transition-colors ${currentPage === totalPages ? 'opacity-40 pointer-events-none' : ''}`}>ถัดไป →</Link>
          </nav>
        )}
      </div>
    </main>
  );
}

function CatalogCard({ product, storeSlug, onAdd }: { product: TemplateProductCard; storeSlug: string; onAdd: (e: React.MouseEvent) => void; }) {
  const hasDiscount = product.compareAtPriceTHB != null && product.compareAtPriceTHB > product.priceTHB;
  const emoji = product.categoryName ? CATEGORY_EMOJI[product.categoryName] ?? '📄' : '📄';
  return (
    <article className="bg-white border border-[#E5E5E5] rounded-md hover:border-[#1A1A1A] transition-colors flex flex-col">
      <Link href={`/stores/${storeSlug}/products/${product.id}`} className="block aspect-[4/3] bg-[#F7F6F3] border-b border-[#E5E5E5] rounded-t-md overflow-hidden relative">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" aria-hidden>{emoji}</div>
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white border border-[#E5E5E5] text-[#2563EB]">
          <Sparkles className="h-3 w-3" /> Notion
        </span>
        {hasDiscount && product.compareAtPriceTHB != null && (
          <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#DC2626] text-white">
            -{Math.round(((product.compareAtPriceTHB - product.priceTHB) / product.compareAtPriceTHB) * 100)}%
          </span>
        )}
      </Link>
      <div className="p-3 flex-1 flex flex-col gap-2">
        {product.categoryName && (
          <span className="text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-[family:var(--font-kanit)] font-medium">{product.categoryName}</span>
        )}
        <Link href={`/stores/${storeSlug}/products/${product.id}`} className="block">
          <h3 className="text-[13.5px] font-[family:var(--font-kanit)] font-semibold text-[#1A1A1A] hover:text-[#2563EB] transition-colors leading-snug line-clamp-2">{product.title}</h3>
        </Link>
        <div className="mt-auto flex items-end justify-between pt-2 border-t border-[#E5E5E5]">
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-[#1A1A1A] tabular-nums">{formatTHB(product.priceTHB)}</span>
            {hasDiscount && product.compareAtPriceTHB != null && (
              <span className="text-[11px] text-[#6B6B6B] line-through tabular-nums">{formatTHB(product.compareAtPriceTHB)}</span>
            )}
          </div>
          <button type="button" onClick={onAdd} aria-label="เพิ่มลงตะกร้า" className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#E5E5E5] text-[#1A1A1A] hover:bg-black hover:border-black hover:text-white transition-colors">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
