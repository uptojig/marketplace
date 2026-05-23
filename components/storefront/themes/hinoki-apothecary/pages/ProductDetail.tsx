'use client';

/**
 * hinoki-apothecary — bespoke ProductDetail page
 *
 * Apothecary bottle-shop layout: earth-tone canvas, serif body copy,
 * prominent ingredient ("วัตถุดิบ") column, hand-drawn SVG botanical
 * flourishes, and a single decisive CTA. All colors flow through the
 * `--shop-*` token cascade set by `app/stores/[slug]/layout.tsx`, so
 * the page re-skins to whatever primaryColor the operator picks —
 * no hardcoded hex.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Leaf, Droplet, Flame, ShieldCheck, Truck, Minus, Plus, Quote } from 'lucide-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';

// ── Hand-drawn botanical sprig (sits behind the price block) ──────
function Sprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 120"
      aria-hidden="true"
      className={className}
      style={{ color: 'var(--shop-accent)' }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M40 110 Q40 70 40 30" />
        <path d="M40 90 Q26 84 18 70" />
        <path d="M40 78 Q54 72 62 58" />
        <path d="M40 64 Q26 58 20 44" />
        <path d="M40 52 Q54 46 60 32" />
        <path d="M40 40 Q30 32 28 20" />
        <ellipse cx="18" cy="70" rx="6" ry="3" transform="rotate(-30 18 70)" />
        <ellipse cx="62" cy="58" rx="6" ry="3" transform="rotate(30 62 58)" />
        <ellipse cx="20" cy="44" rx="6" ry="3" transform="rotate(-30 20 44)" />
        <ellipse cx="60" cy="32" rx="6" ry="3" transform="rotate(30 60 32)" />
        <circle cx="40" cy="20" r="3" />
      </g>
    </svg>
  );
}

// ── Hand-drawn apothecary bottle (placeholder when no image) ─────
function BottleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 200"
      aria-hidden="true"
      className={className}
      style={{ color: 'var(--shop-accent)' }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="48" y="12" width="24" height="22" rx="2" />
        <path d="M40 34 L80 34 L80 56 Q80 60 84 64 Q96 76 96 100 L96 174 Q96 188 82 188 L38 188 Q24 188 24 174 L24 100 Q24 76 36 64 Q40 60 40 56 Z" />
        <line x1="32" y1="120" x2="88" y2="120" />
        <line x1="32" y1="128" x2="88" y2="128" />
      </g>
    </svg>
  );
}

// ── Default trust / care points if upstream data is sparse ───────
const DEFAULT_TRUST = [
  { icon: Leaf, label: 'วัตถุดิบจากธรรมชาติ', detail: 'ไม่แต่งสี ไม่ใช้พาราเบน' },
  { icon: Droplet, label: 'ปรุงด้วยมือเป็น Batch เล็ก', detail: 'จำกัด 60 ขวด/รอบ' },
  { icon: Flame, label: 'เผาทดสอบ 40 ชั่วโมง', detail: 'เปลวเรียบ ไม่มีเขม่า' },
];

const DEFAULT_NOTES = [
  { head: 'Top', body: 'ส้มเขียวหวาน · เปลือกมะกรูด' },
  { head: 'Heart', body: 'ดอกมะลิ · กลิ่นชาเขียว · ไม้สนหอม' },
  { head: 'Base', body: 'ไม้จันทน์ · มัสก์ · อำพันอบอวล' },
];

const DEFAULT_INGREDIENTS = [
  'น้ำมันหอมระเหยไม้สน (Hinoki)',
  'น้ำมันหอมระเหยไม้จันทน์ (Sandalwood)',
  'ขี้ผึ้งถั่วเหลืองออร์แกนิก (Soy Wax)',
  'น้ำมันมะพร้าวสกัดเย็น',
  'เกล็ดอำพันจากต้นสนเหนือ',
];

const FALLBACK_DESCRIPTION =
  'น้ำหอมและเทียนหอม Batch เล็ก ปรุงด้วยมือในห้องครัวกลั่น เริ่มต้นจากเรื่องสั้นหนึ่งเรื่อง แล้วร้อยกลิ่นจากธรรมชาติให้ตรงกับฉากในเรื่อง · เปิดฝาแล้วได้ยินเรื่องเล่า ไม่ใช่แค่ได้กลิ่น';

export function ProductDetail({ store, product, related }: ProductDetailProps) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  // Gallery: dedup imageUrl + images
  const gallery = useMemo<string[]>(() => {
    const list = [product.imageUrl, ...(product.images ?? [])].filter(
      (x): x is string => typeof x === 'string' && x.length > 0,
    );
    return Array.from(new Set(list));
  }, [product.imageUrl, product.images]);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  // Distill variant options from props (axes are sparse, often only one
  // of color/size/material is present per store).
  const colorOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of product.variants ?? []) {
      if (v.colorLabel && !seen.has(v.colorLabel)) {
        seen.add(v.colorLabel);
        out.push(v.colorLabel);
      }
    }
    return out;
  }, [product.variants]);

  const sizeOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of product.variants ?? []) {
      if (v.sizeLabel && !seen.has(v.sizeLabel)) {
        seen.add(v.sizeLabel);
        out.push(v.sizeLabel);
      }
    }
    return out;
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorOptions[0] ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizeOptions[0] ?? null,
  );

  const hasDiscount =
    typeof product.originalPriceTHB === 'number' &&
    product.originalPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round((1 - product.priceTHB / (product.originalPriceTHB as number)) * 100)
    : 0;

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
    showConfirm(product.title, store.slug);
  };

  const description = product.description?.trim() || FALLBACK_DESCRIPTION;

  return (
    <main
      className="min-h-screen"
      style={{
        background: 'var(--shop-bg)',
        color: 'var(--shop-ink)',
        fontFamily: 'ui-serif, Georgia, "Noto Serif Thai", serif',
      }}
    >
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="border-b"
        style={{
          borderColor: 'var(--shop-border)',
          background: 'var(--shop-bg)',
        }}
      >
        <ol
          className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-4 text-xs uppercase sm:px-6 lg:px-8"
          style={{
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.2em',
            fontFamily: 'var(--font-prompt), system-ui, sans-serif',
          }}
        >
          <li>
            <Link
              href={`/stores/${store.slug}`}
              className="transition-colors hover:opacity-70"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              หน้าร้าน
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" />
          </li>
          <li>
            <Link
              href={`/stores/${store.slug}/category`}
              className="transition-colors hover:opacity-70"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {product.categoryName ?? 'สินค้าทั้งหมด'}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" />
          </li>
          <li
            className="truncate"
            style={{ color: 'var(--shop-ink)' }}
            aria-current="page"
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ── Hero: gallery + buy column ────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div>
            <div
              className="relative aspect-[4/5] w-full overflow-hidden"
              style={{ background: 'var(--shop-muted, var(--shop-card))' }}
            >
              {gallery[activeImg] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gallery[activeImg]}
                  alt={product.title}
                  className="h-full w-full object-cover mix-blend-multiply"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BottleIcon className="h-2/3 w-auto opacity-70" />
                </div>
              )}
              {/* Inset hand-drawn frame */}
              <div
                className="pointer-events-none absolute inset-3 border"
                style={{ borderColor: 'var(--shop-border)' }}
              />
              {hasDiscount && (
                <div
                  className="absolute left-5 top-5 px-3 py-1 text-[10px] uppercase"
                  style={{
                    background: 'var(--shop-ink)',
                    color: 'var(--shop-bg)',
                    letterSpacing: '0.2em',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  }}
                >
                  − {discountPct}%
                </div>
              )}
            </div>

            {/* Thumbs */}
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {gallery.map((src, idx) => (
                  <button
                    key={src + idx}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    aria-label={`เลือกรูปที่ ${idx + 1}`}
                    aria-pressed={idx === activeImg}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden transition-opacity"
                    style={{
                      background: 'var(--shop-muted, var(--shop-card))',
                      outline:
                        idx === activeImg
                          ? '1px solid var(--shop-ink)'
                          : '1px solid var(--shop-border)',
                      outlineOffset: '2px',
                      opacity: idx === activeImg ? 1 : 0.7,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy column */}
          <div className="relative flex flex-col">
            {/* Watermark sprig behind the title */}
            <Sprig className="pointer-events-none absolute -right-4 top-0 h-32 w-auto opacity-30" />

            <div
              className="mb-3 text-xs uppercase"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.3em',
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
              }}
            >
              {product.categoryName ?? 'Apothecary · Batch No. 01'}
            </div>

            <h1
              className="text-4xl font-light leading-tight tracking-wide sm:text-5xl"
              style={{ color: 'var(--shop-ink)' }}
            >
              {product.title}
            </h1>

            <div
              className="mt-6 h-px w-16"
              style={{ background: 'var(--shop-accent)' }}
              aria-hidden="true"
            />

            <p
              className="mt-6 max-w-prose text-base leading-loose"
              style={{
                color: 'var(--shop-ink-muted)',
                textIndent: '2rem',
              }}
            >
              {description}
            </p>

            {/* Price */}
            <div className="mt-10 flex items-baseline gap-4">
              <span
                className="text-3xl font-light"
                style={{ color: 'var(--shop-ink)' }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {hasDiscount && product.originalPriceTHB && (
                <span
                  className="text-base line-through"
                  style={{ color: 'var(--shop-ink-muted)', opacity: 0.6 }}
                >
                  {formatTHB(product.originalPriceTHB)}
                </span>
              )}
            </div>
            <p
              className="mt-1 text-xs"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
              }}
            >
              ส่งฟรีเมื่อสั่งซื้อครบ ฿990 · บรรจุในกระดาษคราฟต์ปิดผนึกขี้ผึ้ง
            </p>

            {/* Variants — color */}
            {colorOptions.length > 0 && (
              <div className="mt-10">
                <div
                  className="mb-3 flex items-center justify-between text-xs uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    letterSpacing: '0.2em',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  }}
                >
                  <span>
                    กลิ่น ·{' '}
                    <span style={{ color: 'var(--shop-ink)' }}>
                      {selectedColor ?? '—'}
                    </span>
                  </span>
                  <span>{colorOptions.length} กลิ่น</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => {
                    const active = c === selectedColor;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        aria-pressed={active}
                        className="px-4 py-2 text-sm transition-colors"
                        style={{
                          fontFamily:
                            'var(--font-prompt), system-ui, sans-serif',
                          border: '1px solid var(--shop-border)',
                          background: active
                            ? 'var(--shop-ink)'
                            : 'var(--shop-card)',
                          color: active
                            ? 'var(--shop-bg)'
                            : 'var(--shop-ink)',
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variants — size */}
            {sizeOptions.length > 0 && (
              <div className="mt-8">
                <div
                  className="mb-3 flex items-center justify-between text-xs uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    letterSpacing: '0.2em',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  }}
                >
                  <span>
                    ขนาด ·{' '}
                    <span style={{ color: 'var(--shop-ink)' }}>
                      {selectedSize ?? '—'}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {sizeOptions.map((s) => {
                    const active = s === selectedSize;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        aria-pressed={active}
                        className="px-4 py-3 text-sm transition-colors"
                        style={{
                          fontFamily:
                            'var(--font-prompt), system-ui, sans-serif',
                          border: active
                            ? '1px solid var(--shop-ink)'
                            : '1px solid var(--shop-border)',
                          background: active
                            ? 'var(--shop-card)'
                            : 'transparent',
                          color: 'var(--shop-ink)',
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty + CTA */}
            <div
              className="mt-10 flex items-stretch gap-3 pt-8"
              style={{ borderTop: '1px solid var(--shop-border)' }}
            >
              <div
                className="flex items-center"
                style={{ border: '1px solid var(--shop-border)' }}
                role="group"
                aria-label="จำนวน"
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-3 transition-opacity hover:opacity-60"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-label="ลดจำนวน"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="w-12 bg-transparent text-center outline-none"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  }}
                  aria-label="จำนวน"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="px-3 py-3 transition-opacity hover:opacity-60"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 text-sm uppercase transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--shop-ink)',
                  color: 'var(--shop-bg)',
                  letterSpacing: '0.28em',
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  padding: '0 1.5rem',
                }}
              >
                หยิบใส่ตะกร้า · {formatTHB(product.priceTHB * qty)}
              </button>
            </div>

            {/* Stock notice */}
            {typeof product.stockLeft === 'number' && product.stockLeft > 0 && (
              <p
                className="mt-4 text-xs"
                style={{
                  color: 'var(--shop-accent)',
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                }}
              >
                เหลือเพียง {product.stockLeft} ขวดใน Batch นี้
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Ingredients / Notes column (apothecary signature block) ── */}
      <section
        className="border-t border-b"
        style={{
          borderColor: 'var(--shop-border)',
          background: 'var(--shop-card)',
        }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          {/* Ingredients (prominent) */}
          <div>
            <div
              className="mb-3 text-xs uppercase"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.3em',
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
              }}
            >
              วัตถุดิบ · Ingredients
            </div>
            <h2
              className="text-3xl font-light tracking-wide"
              style={{ color: 'var(--shop-ink)' }}
            >
              ส่วนผสมที่อ่านออกได้ทั้งหมด
            </h2>
            <p
              className="mt-3 max-w-prose text-sm leading-loose"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
              }}
            >
              ทุกขวดมีรายการวัตถุดิบครบ — ไม่มี &quot;Fragrance&quot;
              ซ่อนความ ทุกชื่อมีที่มา ทุกแหล่งตรวจสอบได้
            </p>

            <ol
              className="mt-8 space-y-1"
              style={{ borderTop: '1px solid var(--shop-border)' }}
            >
              {DEFAULT_INGREDIENTS.map((ing, idx) => (
                <li
                  key={ing}
                  className="flex items-baseline gap-4 py-3"
                  style={{ borderBottom: '1px solid var(--shop-border)' }}
                >
                  <span
                    className="text-xs"
                    style={{
                      color: 'var(--shop-accent)',
                      letterSpacing: '0.15em',
                      fontFamily:
                        'var(--font-prompt), system-ui, sans-serif',
                      minWidth: '2rem',
                    }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="flex-1 text-base"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {ing}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Notes column */}
          <div className="relative">
            <Sprig className="pointer-events-none absolute -left-4 top-0 h-40 w-auto opacity-25" />

            <div
              className="mb-3 text-xs uppercase"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.3em',
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
              }}
            >
              พิระมิดกลิ่น · Fragrance pyramid
            </div>
            <h2
              className="text-3xl font-light tracking-wide"
              style={{ color: 'var(--shop-ink)' }}
            >
              เปิดขวด · ค่อย ๆ ฟัง
            </h2>

            <div className="mt-8 space-y-6">
              {DEFAULT_NOTES.map((n) => (
                <div
                  key={n.head}
                  className="grid grid-cols-[6rem,1fr] gap-6 pb-6"
                  style={{ borderBottom: '1px solid var(--shop-border)' }}
                >
                  <div
                    className="text-xs uppercase"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      letterSpacing: '0.25em',
                      fontFamily:
                        'var(--font-prompt), system-ui, sans-serif',
                    }}
                  >
                    {n.head}
                  </div>
                  <div
                    className="text-base leading-relaxed"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {n.body}
                  </div>
                </div>
              ))}
            </div>

            <blockquote
              className="mt-10 max-w-md text-lg italic leading-relaxed"
              style={{
                color: 'var(--shop-accent)',
                borderLeft: '2px solid var(--shop-accent)',
                paddingLeft: '1.25rem',
              }}
            >
              <Quote className="mb-3 h-4 w-4" aria-hidden="true" />
              &ldquo;กลิ่นที่ดี ไม่ได้บอกเรื่องของตัวเอง · แต่ปลุกเรื่องของคุณ&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Trust badges (small, hand-drawn icon strip) ─────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {DEFAULT_TRUST.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="flex items-start gap-4 px-6 py-6"
              style={{
                border: '1px solid var(--shop-border)',
                background: 'var(--shop-card)',
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center"
                style={{
                  border: '1px solid var(--shop-accent)',
                  borderRadius: '999px',
                  color: 'var(--shop-accent)',
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div
                  className="text-sm font-medium"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily:
                      'var(--font-prompt), system-ui, sans-serif',
                  }}
                >
                  {label}
                </div>
                <div
                  className="mt-1 text-xs leading-relaxed"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily:
                      'var(--font-prompt), system-ui, sans-serif',
                  }}
                >
                  {detail}
                </div>
              </div>
            </div>
          ))}

          {/* Shipping & care strip */}
          <div
            className="flex items-start gap-4 px-6 py-6 sm:col-span-3"
            style={{
              border: '1px solid var(--shop-border)',
              background: 'transparent',
            }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center"
              style={{
                color: 'var(--shop-accent)',
              }}
            >
              <Truck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div
                className="text-sm"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                }}
              >
                จัดส่ง 2-4 วันทำการทั่วประเทศ · บรรจุในกล่องลูกฟูกพร้อมขี้ผึ้งปิดผนึก · เปลี่ยนคืนได้ใน 14 วันถ้ายังไม่เปิดผนึก
              </div>
            </div>
            <ShieldCheck
              className="h-5 w-5 flex-shrink-0"
              style={{ color: 'var(--shop-accent)' }}
            />
          </div>
        </div>
      </section>

      {/* ── Related rail ───────────────────────────────────────── */}
      {related && related.length > 0 && (
        <section
          className="border-t"
          style={{
            borderColor: 'var(--shop-border)',
            background: 'var(--shop-card)',
          }}
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <div
                  className="mb-3 text-xs uppercase"
                  style={{
                    color: 'var(--shop-accent)',
                    letterSpacing: '0.3em',
                    fontFamily:
                      'var(--font-prompt), system-ui, sans-serif',
                  }}
                >
                  จากชั้นเดียวกัน
                </div>
                <h2
                  className="text-3xl font-light tracking-wide sm:text-4xl"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  เรื่องเล่าใกล้เคียง
                </h2>
              </div>
              <Link
                href={`/stores/${store.slug}/category`}
                className="hidden text-xs uppercase transition-opacity hover:opacity-70 sm:block"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.25em',
                  borderBottom: '1px solid var(--shop-accent)',
                  paddingBottom: '0.25rem',
                  fontFamily:
                    'var(--font-prompt), system-ui, sans-serif',
                }}
              >
                ดูทั้งหมด
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {related.slice(0, 4).map((r) => (
                <Link
                  key={r.id}
                  href={`/stores/${store.slug}/products/${r.id}`}
                  className="group block"
                >
                  <div
                    className="relative aspect-[4/5] overflow-hidden"
                    style={{
                      background: 'var(--shop-muted, var(--shop-bg))',
                    }}
                  >
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BottleIcon className="h-2/3 w-auto opacity-50" />
                      </div>
                    )}
                    <div
                      className="pointer-events-none absolute inset-2 border"
                      style={{ borderColor: 'var(--shop-border)' }}
                    />
                  </div>
                  <div className="mt-4">
                    {r.categoryName && (
                      <div
                        className="text-xs uppercase"
                        style={{
                          color: 'var(--shop-accent)',
                          letterSpacing: '0.2em',
                          fontFamily:
                            'var(--font-prompt), system-ui, sans-serif',
                        }}
                      >
                        {r.categoryName}
                      </div>
                    )}
                    <div
                      className="mt-2 line-clamp-2 text-base"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {r.title}
                    </div>
                    <div
                      className="mt-2 text-sm"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily:
                          'var(--font-prompt), system-ui, sans-serif',
                      }}
                    >
                      {formatTHB(r.priceTHB)}
                      {r.compareAtPriceTHB &&
                        r.compareAtPriceTHB > r.priceTHB && (
                          <span
                            className="ml-2 line-through"
                            style={{
                              color: 'var(--shop-ink-muted)',
                              opacity: 0.6,
                            }}
                          >
                            {formatTHB(r.compareAtPriceTHB)}
                          </span>
                        )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetail;
