'use client';

/**
 * atelier-27 — bespoke ProductDetail page.
 *
 * Replaces the shared `makePdpAdapter` wrapper with a curator-gallery
 * layout tuned to the trust / atelier-27 visual language: museum-card
 * framed portrait gallery on the left, a quiet dossier column on the
 * right with hairline rules, generous whitespace and Kanit / Prompt
 * caps tracking. All colour comes from `var(--shop-*)` so the page
 * inherits the per-store family palette (ink / cream / gold accent).
 *
 * Wired to `useCart` + `useCartConfirmation` to match the Homepage
 * "เพิ่มลงตะกร้า" interaction and the cross-store cart confirm modal.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ChevronRight } from 'lucide-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';

// Trust-family color labels → swatch hex. Falls back to a neutral
// stone when the variant carries a colour we don't recognise; PDP
// chrome itself stays on `--shop-*` tokens so the swatch dot is the
// only place we ever paint a literal colour.
function colorSwatch(label: string | null | undefined): string {
  if (!label) return '#a8a29e';
  const map: Record<string, string> = {
    'ดำ': '#1c1917', black: '#1c1917',
    'ขาว': '#fafaf9', white: '#fafaf9',
    'ครีม': '#f5f0e6', cream: '#f5f0e6', ivory: '#f5f0e6',
    'น้ำตาล': '#78533a', brown: '#78533a', tan: '#a78465',
    'ทอง': '#b48c4a', gold: '#b48c4a',
    'เทา': '#78716c', gray: '#78716c', grey: '#78716c',
    'กรม': '#1e2a44', navy: '#1e2a44',
    'น้ำเงิน': '#3b5f8a', blue: '#3b5f8a',
    'แดง': '#8b2e2e', red: '#8b2e2e',
    'เขียว': '#3f5c3a', green: '#3f5c3a',
    'ชมพู': '#c98ba0', pink: '#c98ba0',
    'ม่วง': '#5b3f5e', purple: '#5b3f5e',
    'เหลือง': '#c9a24a', yellow: '#c9a24a',
    'ส้ม': '#b8602e', orange: '#b8602e',
  };
  return map[label.toLowerCase()] ?? '#a8a29e';
}

export function ProductDetail({ store, product, related }: ProductDetailProps) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  // Gallery: dedupe so the cover image doesn't repeat when importers
  // also stuff it into `images[]`. Fall back to a hairline placeholder
  // panel when the supplier shipped no media at all.
  const galleryImages = useMemo(() => {
    const all = [product.imageUrl, ...product.images].filter(
      (x): x is string => !!x && x.length > 0,
    );
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState(0);

  // Variant axes — atelier-27 stores commonly ship colour + size +
  // material rows. Each picker is independent; the selected variant
  // is whichever combination matches all three axes (or the first
  // variant whose colour/size/material intersect when partial).
  const colors = useMemo(() => {
    const seen = new Map<string, string>();
    product.variants.forEach((v) => {
      if (v.colorLabel && !seen.has(v.colorLabel)) {
        seen.set(v.colorLabel, colorSwatch(v.colorLabel));
      }
    });
    return Array.from(seen.entries()).map(([label, swatch]) => ({ label, swatch }));
  }, [product.variants]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    product.variants.forEach((v) => {
      if (v.sizeLabel) set.add(v.sizeLabel);
    });
    return Array.from(set);
  }, [product.variants]);

  const materials = useMemo(() => {
    const set = new Set<string>();
    product.variants.forEach((v) => {
      if (v.materialLabel) set.add(v.materialLabel);
    });
    return Array.from(set);
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0]?.label ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes[0] ?? null,
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(
    materials[0] ?? null,
  );
  const [qty, setQty] = useState(1);

  // Choose a matching variant. Tries the full triple first, then
  // relaxes one axis at a time so we always surface the most relevant
  // price + stock when the supplier only split on one axis.
  const activeVariant = useMemo(() => {
    const vs = product.variants;
    if (vs.length === 0) return null;
    const triple = vs.find(
      (v) =>
        (!selectedColor || v.colorLabel === selectedColor) &&
        (!selectedSize || v.sizeLabel === selectedSize) &&
        (!selectedMaterial || v.materialLabel === selectedMaterial),
    );
    return triple ?? vs[0];
  }, [product.variants, selectedColor, selectedSize, selectedMaterial]);

  const displayPrice = activeVariant?.priceTHB ?? product.priceTHB;
  const hasDiscount =
    !!product.originalPriceTHB && product.originalPriceTHB > displayPrice;
  const savingsTHB = hasDiscount
    ? (product.originalPriceTHB ?? 0) - displayPrice
    : 0;

  // Stock surface: variant-level overrides product-level. `null` means
  // the supplier doesn't expose live counts, which we treat as "in
  // stock" rather than locking the buyer out (matches the default PDP).
  const stockLeft =
    activeVariant?.inventory ??
    (product.stockLeft && product.stockLeft > 0 ? product.stockLeft : null);
  const lowStock = stockLeft !== null && stockLeft > 0 && stockLeft <= 5;
  const outOfStock = stockLeft === 0;

  function handleAddToCart() {
    if (outOfStock) return;
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: displayPrice,
        imageUrl: product.imageUrl || undefined,
      },
      qty,
    );
    showConfirm(product.title, store.slug);
  }

  const urls = {
    home: `/stores/${store.slug}`,
    catalog: `/stores/${store.slug}/category`,
    category: product.categoryName
      ? `/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`
      : `/stores/${store.slug}/category`,
  };

  return (
    <main
      className="min-h-screen"
      style={{
        background: 'var(--shop-bg, #fafaf9)',
        color: 'var(--shop-ink, #1c1917)',
      }}
    >
      {/* ── Hairline breadcrumb ───────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 sm:pt-10"
      >
        <ol
          className="flex items-center gap-2 sm:gap-3 flex-wrap text-[10px] sm:text-[11px] uppercase"
          style={{
            fontFamily: 'var(--font-prompt), system-ui, sans-serif',
            letterSpacing: '0.3em',
            color: 'var(--shop-ink-muted, #a8a29e)',
          }}
        >
          <li>
            <Link
              href={urls.home}
              className="transition-colors duration-300 hover:text-[color:var(--shop-ink,#1c1917)]"
            >
              หน้าแรก
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={11} strokeWidth={1.25} />
          </li>
          <li>
            <Link
              href={urls.category}
              className="transition-colors duration-300 hover:text-[color:var(--shop-ink,#1c1917)]"
            >
              {product.categoryName ?? 'คอลเลกชัน'}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={11} strokeWidth={1.25} />
          </li>
          <li
            aria-current="page"
            className="truncate max-w-[60vw] sm:max-w-none"
            style={{ color: 'var(--shop-ink, #1c1917)' }}
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ── Two-column dossier ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

          {/* ── Gallery — museum card portrait + thumbnail rail ── */}
          <div className="lg:col-span-7 space-y-5">
            {/* Hero portrait */}
            <div
              className="relative aspect-[4/5] overflow-hidden"
              style={{
                background: 'var(--shop-muted, #f5f5f4)',
                border: '1px solid var(--shop-border, #e7e5e4)',
              }}
            >
              {galleryImages[activeImage] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={galleryImages[activeImage]}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-5xl tracking-[0.5em] uppercase"
                    style={{
                      fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                      fontWeight: 300,
                      color: 'var(--shop-border, #e7e5e4)',
                    }}
                  >
                    A27
                  </span>
                </div>
              )}

              {/* Floating museum tag — index of N, top-right */}
              {galleryImages.length > 1 && (
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                  <span
                    className="text-[10px] uppercase backdrop-blur-sm px-3 py-1.5"
                    style={{
                      fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                      fontWeight: 300,
                      letterSpacing: '0.35em',
                      color: 'var(--shop-bg, #fafaf9)',
                      background:
                        'color-mix(in srgb, var(--shop-ink, #1c1917) 75%, transparent)',
                    }}
                  >
                    {String(activeImage + 1).padStart(2, '0')} ·{' '}
                    {String(galleryImages.length).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail rail — hairline borders, no rounding */}
            {galleryImages.length > 1 && (
              <div
                className="flex gap-3 overflow-x-auto pb-1"
                aria-label="แกลเลอรีรูปภาพ"
              >
                {galleryImages.map((src, idx) => (
                  <button
                    key={src + idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    aria-label={`รูปภาพที่ ${idx + 1}`}
                    aria-pressed={idx === activeImage}
                    className="relative flex-shrink-0 aspect-square w-20 sm:w-24 overflow-hidden transition-all duration-300"
                    style={{
                      background: 'var(--shop-muted, #f5f5f4)',
                      border:
                        idx === activeImage
                          ? '1px solid var(--shop-ink, #1c1917)'
                          : '1px solid var(--shop-border, #e7e5e4)',
                      opacity: idx === activeImage ? 1 : 0.7,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Dossier column — product info + variants + ATC ── */}
          <div className="lg:col-span-5 lg:pt-2">
            {/* Eyebrow — category */}
            {product.categoryName && (
              <span
                className="block mb-5 text-[10px] uppercase"
                style={{
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  letterSpacing: '0.4em',
                  color: 'var(--shop-ink-muted, #a8a29e)',
                }}
              >
                {product.categoryName}
              </span>
            )}

            {/* Title — Kanit Light, large, wide tracking like a museum card */}
            <h1
              className="text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.2] mb-6"
              style={{
                fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                fontWeight: 300,
                letterSpacing: '0.04em',
                color: 'var(--shop-ink, #1c1917)',
              }}
            >
              {product.title}
            </h1>

            {/* Hairline divider — museum dossier feel */}
            <div
              className="w-12 h-px mb-7"
              style={{ background: 'var(--shop-ink, #1c1917)' }}
            />

            {/* Price block — current + strikethrough + savings pill */}
            <div className="mb-8 flex items-baseline gap-4 flex-wrap">
              <span
                className="text-2xl sm:text-[28px] tabular-nums"
                style={{
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  fontWeight: 400,
                  color: 'var(--shop-ink, #1c1917)',
                }}
              >
                {formatTHB(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span
                    className="text-sm tabular-nums line-through"
                    style={{
                      fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                      color: 'var(--shop-ink-muted, #a8a29e)',
                    }}
                  >
                    {formatTHB(product.originalPriceTHB ?? 0)}
                  </span>
                  <span
                    className="text-[10px] uppercase px-2.5 py-1"
                    style={{
                      fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                      letterSpacing: '0.25em',
                      color: 'var(--shop-bg, #fafaf9)',
                      background: 'var(--shop-primary, #b48c4a)',
                    }}
                  >
                    ประหยัด {formatTHB(savingsTHB)}
                  </span>
                </>
              )}
            </div>

            {/* COLOUR row */}
            {colors.length > 0 && (
              <div className="mb-7">
                <div className="flex items-baseline justify-between mb-3">
                  <span
                    className="text-[10px] uppercase"
                    style={{
                      fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                      letterSpacing: '0.35em',
                      color: 'var(--shop-ink-muted, #a8a29e)',
                    }}
                  >
                    สี
                  </span>
                  {selectedColor && (
                    <span
                      className="text-[11px]"
                      style={{
                        fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                        color: 'var(--shop-ink, #1c1917)',
                      }}
                    >
                      {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => {
                    const active = c.label === selectedColor;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setSelectedColor(c.label)}
                        aria-label={`สี ${c.label}`}
                        aria-pressed={active}
                        className="relative w-9 h-9 rounded-full transition-all duration-300"
                        style={{
                          background: c.swatch,
                          border: active
                            ? '1px solid var(--shop-ink, #1c1917)'
                            : '1px solid var(--shop-border, #e7e5e4)',
                          boxShadow: active
                            ? '0 0 0 3px var(--shop-bg, #fafaf9), 0 0 0 4px var(--shop-ink, #1c1917)'
                            : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE row */}
            {sizes.length > 0 && (
              <div className="mb-7">
                <div className="flex items-baseline justify-between mb-3">
                  <span
                    className="text-[10px] uppercase"
                    style={{
                      fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                      letterSpacing: '0.35em',
                      color: 'var(--shop-ink-muted, #a8a29e)',
                    }}
                  >
                    ขนาด
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const active = s === selectedSize;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        aria-pressed={active}
                        className="px-4 py-2.5 text-[11px] uppercase transition-all duration-300"
                        style={{
                          fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                          fontWeight: 300,
                          letterSpacing: '0.25em',
                          background: active
                            ? 'var(--shop-ink, #1c1917)'
                            : 'transparent',
                          color: active
                            ? 'var(--shop-bg, #fafaf9)'
                            : 'var(--shop-ink, #1c1917)',
                          border: '1px solid var(--shop-ink, #1c1917)',
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MATERIAL row — text-chip variant, only when supplier ships it */}
            {materials.length > 0 && (
              <div className="mb-7">
                <div className="flex items-baseline justify-between mb-3">
                  <span
                    className="text-[10px] uppercase"
                    style={{
                      fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                      letterSpacing: '0.35em',
                      color: 'var(--shop-ink-muted, #a8a29e)',
                    }}
                  >
                    วัสดุ
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {materials.map((m) => {
                    const active = m === selectedMaterial;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMaterial(m)}
                        aria-pressed={active}
                        className="px-3.5 py-2 text-[11px] transition-all duration-300"
                        style={{
                          fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                          background: active
                            ? 'var(--shop-muted, #f5f5f4)'
                            : 'transparent',
                          color: active
                            ? 'var(--shop-ink, #1c1917)'
                            : 'var(--shop-ink-muted, #78716c)',
                          border: active
                            ? '1px solid var(--shop-ink, #1c1917)'
                            : '1px solid var(--shop-border, #e7e5e4)',
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QTY + STOCK signal */}
            <div className="mb-8">
              <div className="flex items-baseline justify-between mb-3">
                <span
                  className="text-[10px] uppercase"
                  style={{
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                    letterSpacing: '0.35em',
                    color: 'var(--shop-ink-muted, #a8a29e)',
                  }}
                >
                  จำนวน
                </span>
                {lowStock && (
                  <span
                    className="text-[11px]"
                    style={{
                      fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                      color: 'var(--shop-primary, #b48c4a)',
                    }}
                  >
                    เหลือเพียง {stockLeft} ชิ้น
                  </span>
                )}
                {outOfStock && (
                  <span
                    className="text-[11px]"
                    style={{
                      fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                      color: 'var(--shop-ink-muted, #78716c)',
                    }}
                  >
                    สินค้าหมด
                  </span>
                )}
              </div>
              <div
                className="inline-flex items-center"
                role="group"
                aria-label="จำนวนสินค้า"
                style={{
                  border: '1px solid var(--shop-ink, #1c1917)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="ลดจำนวน"
                  className="w-11 h-11 flex items-center justify-center transition-colors duration-300 hover:bg-[color:var(--shop-muted,#f5f5f4)]"
                  style={{ color: 'var(--shop-ink, #1c1917)' }}
                >
                  <Minus size={14} strokeWidth={1.25} />
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) =>
                    setQty(
                      Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)),
                    )
                  }
                  aria-label="จำนวน"
                  className="w-12 h-11 text-center bg-transparent outline-none tabular-nums"
                  style={{
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                    color: 'var(--shop-ink, #1c1917)',
                    fontWeight: 400,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="เพิ่มจำนวน"
                  className="w-11 h-11 flex items-center justify-center transition-colors duration-300 hover:bg-[color:var(--shop-muted,#f5f5f4)]"
                  style={{ color: 'var(--shop-ink, #1c1917)' }}
                >
                  <Plus size={14} strokeWidth={1.25} />
                </button>
              </div>
            </div>

            {/* ATC — ink-filled, full-width, no rounding (museum card feel) */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="w-full h-14 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                fontWeight: 300,
                letterSpacing: '0.4em',
                fontSize: '12px',
                textTransform: 'uppercase',
                background: 'var(--shop-ink, #1c1917)',
                color: 'var(--shop-bg, #fafaf9)',
              }}
            >
              {outOfStock ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
            </button>

            {/* Hairline footnote — service-tier reassurance, no icons */}
            <div
              className="mt-8 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6"
              style={{
                borderTop: '1px solid var(--shop-border, #e7e5e4)',
              }}
            >
              {[
                { label: 'Curated', desc: 'คัดสรรโดยทีมงาน' },
                { label: 'Crafted', desc: 'งานฝีมือคุณภาพ' },
                { label: 'Care', desc: 'รับประกันงานหลังการขาย' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <span
                    className="block text-[10px] uppercase"
                    style={{
                      fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                      fontWeight: 300,
                      letterSpacing: '0.4em',
                      color: 'var(--shop-ink, #1c1917)',
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="block text-[11px]"
                    style={{
                      fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                      color: 'var(--shop-ink-muted, #78716c)',
                    }}
                  >
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Description block — cream divider band ────────────────── */}
      {product.description && product.description.trim().length > 0 && (
        <section
          style={{
            background: 'var(--shop-muted, #f5f5f4)',
            borderTop: '1px solid var(--shop-border, #e7e5e4)',
            borderBottom: '1px solid var(--shop-border, #e7e5e4)',
          }}
        >
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
            <span
              className="block text-[10px] uppercase mb-6"
              style={{
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                letterSpacing: '0.4em',
                color: 'var(--shop-ink-muted, #a8a29e)',
              }}
            >
              เรื่องราว
            </span>
            <p
              className="text-base sm:text-lg leading-[1.9] whitespace-pre-line"
              style={{
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                fontWeight: 300,
                color: 'var(--shop-ink, #44403c)',
              }}
            >
              {product.description}
            </p>
          </div>
        </section>
      )}

      {/* ── Related rail — 3-up museum cards ──────────────────────── */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
          <div className="flex items-end justify-between mb-10 sm:mb-12">
            <div>
              <span
                className="block mb-3 text-[10px] uppercase"
                style={{
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  letterSpacing: '0.4em',
                  color: 'var(--shop-ink-muted, #a8a29e)',
                }}
              >
                Other Works
              </span>
              <h2
                className="text-2xl sm:text-3xl"
                style={{
                  fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                  fontWeight: 300,
                  letterSpacing: '0.1em',
                  color: 'var(--shop-ink, #1c1917)',
                }}
              >
                ผลงานอื่นๆ
              </h2>
            </div>
            <Link
              href={urls.catalog}
              className="hidden sm:inline-flex items-center gap-2 text-[11px] uppercase transition-colors duration-300"
              style={{
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                letterSpacing: '0.25em',
                color: 'var(--shop-ink-muted, #78716c)',
              }}
            >
              ดูทั้งหมด
              <ArrowRight size={12} strokeWidth={1.25} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-14">
            {related.slice(0, 6).map((r) => (
              <Link
                key={r.id}
                href={`/stores/${store.slug}/products/${r.id}`}
                className="group block"
              >
                <div
                  className="aspect-[3/4] overflow-hidden mb-4 relative"
                  style={{
                    background: 'var(--shop-muted, #f5f5f4)',
                  }}
                >
                  {r.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={r.imageUrl}
                      alt={r.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span
                        className="text-2xl tracking-[0.4em] uppercase"
                        style={{
                          fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                          fontWeight: 300,
                          color: 'var(--shop-border, #e7e5e4)',
                        }}
                      >
                        A27
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  {r.categoryName && (
                    <span
                      className="block text-[10px] uppercase"
                      style={{
                        fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                        letterSpacing: '0.3em',
                        color: 'var(--shop-ink-muted, #a8a29e)',
                      }}
                    >
                      {r.categoryName}
                    </span>
                  )}
                  <h3
                    className="text-sm leading-snug line-clamp-2 transition-colors duration-300"
                    style={{
                      fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                      color: 'var(--shop-ink, #1c1917)',
                    }}
                  >
                    {r.title}
                  </h3>
                  <div className="flex items-center gap-3 pt-1">
                    <span
                      className="text-sm tabular-nums"
                      style={{
                        fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                        color: 'var(--shop-ink, #1c1917)',
                      }}
                    >
                      {formatTHB(r.priceTHB)}
                    </span>
                    {r.compareAtPriceTHB && r.compareAtPriceTHB > r.priceTHB && (
                      <span
                        className="text-xs tabular-nums line-through"
                        style={{
                          fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                          color: 'var(--shop-ink-muted, #a8a29e)',
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

          {/* Mobile view-all link */}
          <div className="sm:hidden text-center mt-10">
            <Link
              href={urls.catalog}
              className="inline-flex items-center gap-2 pb-1 text-[11px] uppercase transition-all duration-300"
              style={{
                fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                fontWeight: 300,
                letterSpacing: '0.3em',
                color: 'var(--shop-ink, #1c1917)',
                borderBottom: '1px solid var(--shop-ink, #1c1917)',
              }}
            >
              ดูทั้งหมด
              <ArrowRight size={12} strokeWidth={1.25} />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetail;
