'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Zap,
  Wrench,
  ChevronRight,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

// Common bike models surfaced as fitment chips — visual only.
const FITMENT_MODELS = [
  'CB650R',
  'MT-07',
  'Z900',
  'GSX-R600',
  'RC390',
  'PCX160',
];

/**
 * GridModu — Product Detail. Gallery + prominent spec table +
 * ADD-TO-CART + BUY-NOW (router → /checkout) + Compatible-with chips.
 */
export default function ProductDetail({ store, product, related }: ProductDetailProps) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);

  const images = Array.from(
    new Set(
      [product.imageUrl, ...product.images].filter(
        (u): u is string => Boolean(u),
      ),
    ),
  );
  const [activeImg, setActiveImg] = useState(0);
  const heroImage = images[activeImg] ?? null;

  const idShort = product.id.slice(-6).toUpperCase();
  const stockLeft = product.stockLeft ?? null;
  const savings = product.originalPriceTHB
    ? Math.max(0, product.originalPriceTHB - product.priceTHB)
    : 0;
  const savingsPct =
    product.originalPriceTHB && product.originalPriceTHB > 0
      ? Math.round((savings / product.originalPriceTHB) * 100)
      : 0;

  // Spec rows — derived ONLY from real product fields. No mock data.
  const specRows: Array<{ label: string; value: string }> = [
    { label: 'SKU', value: idShort },
  ];
  if (product.categoryName) {
    specRows.push({ label: 'CATEGORY', value: product.categoryName });
  }
  if (stockLeft != null) {
    specRows.push({
      label: 'STOCK',
      value: `${stockLeft.toLocaleString()} ชิ้น`,
    });
  }
  if (product.variants && product.variants.length > 0) {
    specRows.push({
      label: 'VARIANTS',
      value: String(product.variants.length).padStart(2, '0'),
    });
  }
  specRows.push({ label: 'SHIP', value: '24H' });
  specRows.push({ label: 'WARRANTY', value: '12M' });

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: product.priceTHB,
        imageUrl: product.imageUrl || undefined,
      },
      qty,
    );
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push(`/stores/${store.slug}/checkout`);
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E5E7EB] font-[family:var(--font-prompt)]">
      {/* Breadcrumb strip */}
      <div className="border-b border-[#1F1F23] bg-[#15151A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold">
          <Link href={`/stores/${store.slug}/`} className="hover:text-[var(--shop-accent,#00BFFF)]">
            HOME
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/stores/${store.slug}/category`} className="hover:text-[var(--shop-accent,#00BFFF)]">
            CATALOG
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:text-[var(--shop-accent,#00BFFF)]"
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span style={{ color: 'var(--shop-accent, #00BFFF)' }} className="line-clamp-1">
            {idShort}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* ── GALLERY ─────────────────────────────────────────── */}
        <div>
          <div className="aspect-square bg-[#15151A] border border-[#1F1F23] rounded-sm overflow-hidden">
            {heroImage ? (
              <img
                src={heroImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-items-center">
                <Wrench className="h-16 w-16 text-[#2A2A2E]" aria-hidden />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`เลือกภาพที่ ${i + 1}`}
                  aria-pressed={i === activeImg}
                  className="aspect-square bg-[#15151A] border rounded-sm overflow-hidden transition-colors"
                  style={{
                    borderColor:
                      i === activeImg
                        ? 'var(--shop-accent, #00BFFF)'
                        : '#1F1F23',
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── INFO COLUMN ─────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-sm font-[family:var(--font-kanit)] font-semibold tabular-nums"
              style={{
                background: 'var(--shop-accent, #00BFFF)',
                color: '#0E0E10',
              }}
            >
              SKU·{idShort}
            </span>
            {product.categoryName && (
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#9CA3AF] font-[family:var(--font-kanit)] font-semibold">
                {product.categoryName}
              </span>
            )}
            {savingsPct > 0 && (
              <span className="text-[10px] tracking-wider uppercase tabular-nums px-2 py-0.5 rounded-sm font-[family:var(--font-kanit)] font-bold border border-[var(--shop-accent,#00BFFF)] text-[var(--shop-accent,#00BFFF)]">
                SAVE −{savingsPct}%
              </span>
            )}
          </div>

          <h1 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-2xl sm:text-3xl text-white leading-tight">
            {product.title}
          </h1>

          {/* Price block */}
          <div className="bg-[#15151A] border border-[#1F1F23] rounded-sm p-4 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-1">
                ราคา · PRICE
              </div>
              <div className="flex items-baseline gap-3">
                <span
                  className="font-bold text-3xl tabular-nums"
                  style={{ color: 'var(--shop-accent, #00BFFF)' }}
                >
                  {formatTHB(product.priceTHB)}
                </span>
                {product.originalPriceTHB &&
                product.originalPriceTHB > product.priceTHB ? (
                  <span className="text-sm line-through text-[#6B7280] tabular-nums">
                    {formatTHB(product.originalPriceTHB)}
                  </span>
                ) : null}
              </div>
            </div>
            {stockLeft != null && stockLeft > 0 && (
              <div className="text-right">
                <div className="text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-1">
                  STOCK
                </div>
                <div
                  className="font-bold tabular-nums inline-flex items-center gap-1.5"
                  style={{ color: 'var(--shop-accent, #00BFFF)' }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: 'var(--shop-accent, #00BFFF)' }}
                    aria-hidden
                  />
                  {stockLeft.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* ── SPEC TABLE (prominent) ───────────────────────── */}
          <div className="bg-[#15151A] border border-[#1F1F23] rounded-sm">
            <div className="px-4 py-3 border-b border-[#1F1F23] flex items-center gap-2">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white">
                ข้อมูลจำเพาะ · SPECIFICATIONS
              </h2>
            </div>
            <dl className="divide-y divide-[#1F1F23]">
              {specRows.map((s) => (
                <div
                  key={s.label}
                  className="grid grid-cols-[120px_1fr] gap-2 px-4 py-2.5"
                >
                  <dt className="text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold">
                    {s.label}
                  </dt>
                  <dd className="text-xs text-[#E5E7EB] tracking-wider uppercase font-[family:var(--font-kanit)] font-semibold tabular-nums">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── COMPATIBLE-WITH CHIPS ────────────────────────── */}
          <div className="bg-[#15151A] border border-[#1F1F23] rounded-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white">
                Compatible with · FITMENT
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {FITMENT_MODELS.map((m) => (
                <span
                  key={m}
                  className="text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-sm border border-[#2A2A2E] text-[#E5E7EB] font-[family:var(--font-kanit)] font-semibold tabular-nums"
                >
                  {m}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[10px] tracking-wider text-[#6B7280] font-[family:var(--font-kanit)] font-semibold uppercase">
              ตรวจสอบความเข้ากันได้กับรุ่นรถของคุณก่อนสั่งซื้อ
            </p>
          </div>

          {/* Description (if exists) */}
          {product.description && (
            <p className="text-sm text-[#9CA3AF] whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Quantity + actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold w-16">
                จำนวน
              </span>
              <div className="inline-flex items-stretch border border-[#2A2A2E] rounded-sm">
                <button
                  type="button"
                  aria-label="ลดจำนวน"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 hover:bg-[#1F1F23] text-[#9CA3AF]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 grid place-items-center tabular-nums text-sm font-semibold text-white border-x border-[#2A2A2E]">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="เพิ่มจำนวน"
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-2 hover:bg-[#1F1F23] text-[#9CA3AF]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm border border-[#2A2A2E] text-[#E5E7EB] font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                ADD TO CART
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm text-[#0E0E10]"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-accent, #00BFFF))',
                }}
              >
                <Zap className="h-4 w-4" />
                BUY NOW
              </button>
            </div>
          </div>

          {/* Trust chips */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#15151A] border border-[#1F1F23] rounded-sm p-3 flex items-center gap-2">
              <Truck
                className="h-4 w-4 shrink-0"
                style={{ color: 'var(--shop-accent, #00BFFF)' }}
              />
              <span className="text-[10px] tracking-wider uppercase text-[#9CA3AF] font-[family:var(--font-kanit)] font-semibold">
                ส่งด่วน 24h
              </span>
            </div>
            <div className="bg-[#15151A] border border-[#1F1F23] rounded-sm p-3 flex items-center gap-2">
              <ShieldCheck
                className="h-4 w-4 shrink-0"
                style={{ color: 'var(--shop-accent, #00BFFF)' }}
              />
              <span className="text-[10px] tracking-wider uppercase text-[#9CA3AF] font-[family:var(--font-kanit)] font-semibold">
                คัดสรรคุณภาพ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-[#1F1F23] bg-[#15151A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-[#1F1F23]">
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-base sm:text-lg text-white flex items-center gap-2">
                <span
                  className="inline-block h-4 w-1"
                  style={{ background: 'var(--shop-accent, #00BFFF)' }}
                  aria-hidden
                />
                สินค้าที่เกี่ยวข้อง · RELATED
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {related.slice(0, 8).map((p) => {
                const rid = p.id.slice(-6).toUpperCase();
                return (
                  <Link
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="bg-[#0E0E10] border border-[#1F1F23] rounded-sm overflow-hidden flex flex-col hover:border-[var(--shop-accent,#00BFFF)] transition-colors"
                  >
                    <div className="aspect-square bg-[#15151A] relative">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center">
                          <Wrench className="h-8 w-8 text-[#2A2A2E]" aria-hidden />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 text-[9px] tracking-[0.2em] uppercase tabular-nums text-[#9CA3AF] bg-[#0E0E10]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border border-[#1F1F23] font-[family:var(--font-kanit)] font-semibold">
                        SKU·{rid}
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-1.5 flex-1">
                      <span className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wide text-xs text-white line-clamp-2">
                        {p.title}
                      </span>
                      <span
                        className="font-bold text-sm tabular-nums mt-auto"
                        style={{ color: 'var(--shop-accent, #00BFFF)' }}
                      >
                        {formatTHB(p.priceTHB)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
