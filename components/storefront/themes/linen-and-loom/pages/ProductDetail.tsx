'use client';

/**
 * linen-and-loom — bespoke Product Detail page
 *
 * Brand vibe: natural fiber textile · cream / sand / sage · loom &
 * thread illustrations · texture-first. Every color is derived from
 * `var(--shop-*)` tokens so the per-store theme color cascade keeps
 * working — there are zero raw hex values in this file.
 *
 * Layout follows the same scaffold the chrome was built for: airy
 * gutters, hairline rules, light Kanit headings with wide tracking
 * (substituting for the visually-serif "editorial" feel while keeping
 * to the Thai-friendly Prompt / Kanit font stack), Prompt body.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Leaf,
  Scissors,
  Sparkles,
  Heart,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// Tokens — derived from --shop-* via color-mix so the page reads as
// natural fiber (cream / sand / sage) but still flexes with the store's
// theme color when the operator picks a different family palette.
// ────────────────────────────────────────────────────────────────────────────
const NATURAL = {
  /** Cream / paper base — page background. */
  cream: 'color-mix(in srgb, var(--shop-bg) 78%, #f6f1e6)',
  /** Soft warm sand — section panels and image plates. */
  sand: 'color-mix(in srgb, var(--shop-bg) 62%, #ead9bc)',
  /** Deeper warm sand for subtle thumbs. */
  sandDeep: 'color-mix(in srgb, var(--shop-bg) 50%, #d8c19a)',
  /** Sage — accents, leaves, hairline rules. */
  sage: 'color-mix(in srgb, var(--shop-primary) 35%, #9aac8e)',
  /** Quiet sage line, ~10% darker than the bg. */
  sageMuted: 'color-mix(in srgb, var(--shop-ink) 18%, #c6cdb4)',
  /** Primary ink — strong but not pure black. */
  ink: 'var(--shop-ink)',
  inkSoft: 'var(--shop-ink-muted)',
};

// ────────────────────────────────────────────────────────────────────────────
// Loom / thread illustrations — inline SVGs used as image fallbacks &
// decorative dividers so the PDP has visual texture even when a product
// has no photos. All strokes use currentColor so they pick up the
// natural palette via the parent element's `color`.
// ────────────────────────────────────────────────────────────────────────────
function LoomWeaveSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        {/* warp threads — vertical */}
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={`w${i}`} x1={20 + i * 9} y1={10} x2={20 + i * 9} y2={230} opacity={0.55} />
        ))}
        {/* weft threads — horizontal, slight wave to suggest hand-weave */}
        {Array.from({ length: 22 }).map((_, i) => {
          const y = 18 + i * 9.5;
          return (
            <path
              key={`f${i}`}
              d={`M 15 ${y} Q 60 ${y - 2} 120 ${y} T 230 ${y}`}
              opacity={0.7}
              strokeWidth={i % 4 === 0 ? 1.6 : 1}
            />
          );
        })}
        {/* slub / nub — a few thread irregularities */}
        <circle cx="84" cy="120" r="3" fill="currentColor" opacity={0.45} />
        <circle cx="170" cy="78" r="2.4" fill="currentColor" opacity={0.55} />
        <circle cx="140" cy="190" r="2" fill="currentColor" opacity={0.4} />
      </g>
    </svg>
  );
}

function ThreadDividerSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 24" className={className} aria-hidden="true" preserveAspectRatio="none">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M 0 12 Q 100 4 200 12 T 400 12 T 600 12 T 800 12" strokeWidth={1.2} opacity={0.85} />
        <path d="M 0 16 Q 120 22 240 14 T 480 16 T 720 14 L 800 16" strokeWidth={0.7} opacity={0.5} />
        {/* tiny knots */}
        <circle cx="120" cy="9" r="1.6" fill="currentColor" opacity={0.7} />
        <circle cx="340" cy="14" r="1.2" fill="currentColor" opacity={0.6} />
        <circle cx="560" cy="11" r="1.8" fill="currentColor" opacity={0.75} />
        <circle cx="700" cy="15" r="1.1" fill="currentColor" opacity={0.55} />
      </g>
    </svg>
  );
}

function LeafSprigSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21 V 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M12 15 C 7 14 5 11 5 7 C 9 7 11.5 9 12 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M12 12 C 17 11 19 8 19 4 C 15 4 12.5 6 12 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Map a Thai/English color label to a natural-fiber swatch hex. The set
 * stays inside the cream/sand/sage family — this is intentional: linen
 * dyes are gentle, naturalists', so saturated picks like "neon pink"
 * still get a tasteful proxy. */
function fiberSwatch(label: string): string {
  const key = label.toLowerCase().trim();
  const map: Record<string, string> = {
    'ครีม': '#f3ead6', 'cream': '#f3ead6', 'natural': '#f3ead6',
    'ขาว': '#f5f0e6', 'off-white': '#f5f0e6', 'white': '#f5f0e6',
    'ทราย': '#d9c4a0', 'sand': '#d9c4a0', 'beige': '#d9c4a0',
    'น้ำตาล': '#a37b54', 'brown': '#a37b54', 'tan': '#c79872',
    'เขียว': '#8a9c7b', 'sage': '#8a9c7b', 'green': '#8a9c7b',
    'เขียวอ่อน': '#b7c4a6', 'mint': '#b7c4a6',
    'ฟ้า': '#9bb0b8', 'dusty-blue': '#9bb0b8', 'blue': '#9bb0b8',
    'กรม': '#3e4a55', 'navy': '#3e4a55', 'indigo': '#3e4a55',
    'ดำ': '#2b2b2b', 'black': '#2b2b2b',
    'เทา': '#a59b8e', 'gray': '#a59b8e', 'grey': '#a59b8e',
    'ชมพู': '#d4a8a0', 'pink': '#d4a8a0', 'rose': '#d4a8a0', 'blush': '#d4a8a0',
    'แดง': '#a3503d', 'red': '#a3503d', 'rust': '#a3503d', 'terracotta': '#a3503d',
    'เหลือง': '#c9a85a', 'mustard': '#c9a85a', 'yellow': '#c9a85a',
    'ม่วง': '#7a6981', 'lavender': '#a8a0b5', 'purple': '#7a6981',
  };
  return map[key] ?? '#b8a587';
}

/** Group variants by color label / size label so we can render two
 * separate pickers from the flat variant list the route hands us. */
function pickAttrUnique<T>(
  list: T[],
  selector: (t: T) => string | null | undefined,
): string[] {
  const seen = new Set<string>();
  for (const item of list) {
    const val = selector(item);
    if (val && !seen.has(val)) seen.add(val);
  }
  return Array.from(seen);
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export function LinenAndLoomProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;
  const add = useCart((s) => s.add);

  // ── derived gallery (dedupe image + gallery list) ──────────────────────
  const gallery = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const src of [product.imageUrl, ...product.images]) {
      if (src && !seen.has(src)) {
        seen.add(src);
        list.push(src);
      }
    }
    return list;
  }, [product.imageUrl, product.images]);

  // ── variant picker state ───────────────────────────────────────────────
  const colorOptions = useMemo(
    () => pickAttrUnique(product.variants, (v) => v.colorLabel),
    [product.variants],
  );
  const sizeOptions = useMemo(
    () => pickAttrUnique(product.variants, (v) => v.sizeLabel),
    [product.variants],
  );
  const materialOptions = useMemo(
    () => pickAttrUnique(product.variants, (v) => v.materialLabel),
    [product.variants],
  );

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorOptions[0] ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizeOptions[0] ?? null,
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(
    materialOptions[0] ?? null,
  );
  const [qty, setQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // ── resolve which variant is active, fall back to price-on-product ─────
  const activeVariant = useMemo(() => {
    return (
      product.variants.find(
        (v) =>
          (selectedColor ? v.colorLabel === selectedColor : true) &&
          (selectedSize ? v.sizeLabel === selectedSize : true) &&
          (selectedMaterial ? v.materialLabel === selectedMaterial : true),
      ) ?? product.variants[0]
    );
  }, [product.variants, selectedColor, selectedSize, selectedMaterial]);

  const livePriceTHB = activeVariant?.priceTHB ?? product.priceTHB;
  const wasPriceTHB = product.originalPriceTHB ?? null;
  const savings =
    wasPriceTHB && wasPriceTHB > livePriceTHB ? wasPriceTHB - livePriceTHB : 0;
  const onSale = savings > 0;

  // ── stock signals ──────────────────────────────────────────────────────
  const inStock =
    activeVariant?.inventory === null ||
    activeVariant?.inventory === undefined ||
    activeVariant.inventory > 0 ||
    (product.stockLeft ?? 1) > 0;
  const lowStock =
    typeof activeVariant?.inventory === 'number' &&
    activeVariant.inventory > 0 &&
    activeVariant.inventory <= 6;

  // ── add-to-cart handler ────────────────────────────────────────────────
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: livePriceTHB,
        imageUrl: gallery[0] ?? undefined,
      },
      qty,
    );
  };

  // ── description paragraphs (collapse blank lines) ──────────────────────
  const paragraphs = useMemo(() => {
    const raw = (product.description ?? '').trim();
    if (!raw) return [];
    return raw
      .split(/\n{2,}|\r{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [product.description]);

  return (
    <div
      className="min-h-screen font-[family:var(--font-prompt)]"
      style={{
        background: NATURAL.cream,
        color: NATURAL.ink,
      }}
    >
      {/* ───────────────────────── Breadcrumb ───────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2"
      >
        <ol
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tracking-wider uppercase font-[family:var(--font-kanit)]"
          style={{ color: NATURAL.inkSoft }}
        >
          <li>
            <Link
              href={`/stores/${store.slug}`}
              className="hover:opacity-70 transition-opacity"
            >
              หน้าแรก
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={12} />
          </li>
          <li>
            <Link
              href={`/stores/${store.slug}/products`}
              className="hover:opacity-70 transition-opacity"
            >
              สินค้าทั้งหมด
            </Link>
          </li>
          {product.categoryName && (
            <>
              <li aria-hidden="true">
                <ChevronRight size={12} />
              </li>
              <li>
                <Link
                  href={`/stores/${store.slug}/category/${encodeURIComponent(
                    product.categoryName,
                  )}`}
                  className="hover:opacity-70 transition-opacity"
                >
                  {product.categoryName}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">
            <ChevronRight size={12} />
          </li>
          <li
            aria-current="page"
            className="truncate max-w-[18rem]"
            style={{ color: NATURAL.ink }}
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ───────────────── Product hero — gallery + buy box ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* ── GALLERY ── */}
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse md:flex-row gap-4">
              {/* Thumbs */}
              <div
                className="flex md:flex-col gap-3 md:w-20 flex-shrink-0 overflow-x-auto md:overflow-visible"
                role="tablist"
                aria-label="รูปสินค้า"
              >
                {(gallery.length > 0 ? gallery : [null, null, null]).map(
                  (src, i) => {
                    const active = i === activeImageIdx;
                    return (
                      <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-label={`รูปที่ ${i + 1}`}
                        onClick={() => setActiveImageIdx(i)}
                        className="aspect-[3/4] w-20 md:w-full flex-shrink-0 relative overflow-hidden transition-all"
                        style={{
                          background: NATURAL.sand,
                          outline: active
                            ? `1.5px solid ${NATURAL.ink}`
                            : `1px solid ${NATURAL.sageMuted}`,
                          outlineOffset: active ? '2px' : '0',
                          opacity: active ? 1 : 0.75,
                        }}
                      >
                        {src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt={`${product.title} - รูปที่ ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span
                            className="absolute inset-2"
                            style={{ color: NATURAL.sageMuted }}
                          >
                            <LoomWeaveSvg className="w-full h-full" />
                          </span>
                        )}
                      </button>
                    );
                  },
                )}
              </div>

              {/* Main image */}
              <div className="flex-1">
                <div
                  className="relative aspect-[4/5] overflow-hidden"
                  style={{ background: NATURAL.sand }}
                >
                  {/* corner thread accents */}
                  <span
                    aria-hidden="true"
                    className="absolute top-3 left-3 w-6 h-px"
                    style={{ background: NATURAL.ink, opacity: 0.4 }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-3 left-3 w-px h-6"
                    style={{ background: NATURAL.ink, opacity: 0.4 }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 right-3 w-6 h-px"
                    style={{ background: NATURAL.ink, opacity: 0.4 }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 right-3 w-px h-6"
                    style={{ background: NATURAL.ink, opacity: 0.4 }}
                  />

                  {gallery[activeImageIdx] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gallery[activeImageIdx]}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center p-12"
                      style={{ color: NATURAL.sageMuted }}
                    >
                      <LoomWeaveSvg className="w-full h-full max-w-[480px] max-h-[480px]" />
                    </div>
                  )}

                  {onSale && (
                    <span
                      className="absolute top-5 right-5 px-3 py-1.5 text-[10px] tracking-[0.25em] uppercase font-[family:var(--font-kanit)]"
                      style={{
                        background: NATURAL.cream,
                        color: NATURAL.ink,
                        border: `1px solid ${NATURAL.ink}`,
                      }}
                    >
                      Sale · ลด {formatTHB(savings)}
                    </span>
                  )}
                </div>

                {/* photographic caption strip — material whisper */}
                <div
                  className="mt-3 flex items-center justify-between text-[11px] tracking-[0.18em] uppercase font-[family:var(--font-kanit)]"
                  style={{ color: NATURAL.inkSoft }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Scissors size={11} />
                    Hand-loomed in Thailand
                  </span>
                  <span>
                    {activeImageIdx + 1} / {Math.max(gallery.length, 1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── BUY BOX ── */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              {product.categoryName && (
                <p
                  className="text-[11px] tracking-[0.3em] uppercase font-[family:var(--font-kanit)] mb-4 inline-flex items-center gap-2"
                  style={{ color: NATURAL.sage }}
                >
                  <LeafSprigSvg className="w-3.5 h-3.5" />
                  {product.categoryName}
                </p>
              )}

              <h1
                className="text-3xl md:text-4xl font-light leading-tight font-[family:var(--font-kanit)]"
                style={{ color: NATURAL.ink, letterSpacing: '-0.005em' }}
              >
                {product.title}
              </h1>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-4 flex-wrap">
                <span
                  className="text-2xl md:text-3xl font-light font-[family:var(--font-kanit)]"
                  style={{ color: NATURAL.ink }}
                >
                  {formatTHB(livePriceTHB)}
                </span>
                {wasPriceTHB && wasPriceTHB > livePriceTHB && (
                  <span
                    className="text-base line-through"
                    style={{ color: NATURAL.inkSoft }}
                  >
                    {formatTHB(wasPriceTHB)}
                  </span>
                )}
                {onSale && (
                  <span
                    className="text-[11px] tracking-[0.2em] uppercase px-2 py-1 font-[family:var(--font-kanit)]"
                    style={{
                      color: NATURAL.sage,
                      border: `1px solid ${NATURAL.sage}`,
                    }}
                  >
                    ประหยัด {Math.round((savings / wasPriceTHB!) * 100)}%
                  </span>
                )}
              </div>

              {/* Stock chip */}
              <div className="mt-3">
                {!inStock ? (
                  <p
                    className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-[family:var(--font-kanit)]"
                    style={{ color: NATURAL.inkSoft }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: NATURAL.inkSoft }}
                    />
                    สินค้าหมดในขณะนี้
                  </p>
                ) : lowStock ? (
                  <p
                    className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-[family:var(--font-kanit)]"
                    style={{ color: NATURAL.sage }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: NATURAL.sage }}
                    />
                    เหลือเพียง {activeVariant?.inventory} ผืน
                  </p>
                ) : (
                  <p
                    className="inline-flex items-center gap-2 text-xs tracking-wider uppercase font-[family:var(--font-kanit)]"
                    style={{ color: NATURAL.sage }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: NATURAL.sage }}
                    />
                    พร้อมส่ง · ทอเสร็จเรียบร้อย
                  </p>
                )}
              </div>

              {/* Thread divider */}
              <div
                className="my-7"
                style={{ color: NATURAL.sageMuted, height: 14 }}
              >
                <ThreadDividerSvg className="w-full h-full" />
              </div>

              {/* COLOR PICKER */}
              {colorOptions.length > 0 && (
                <fieldset className="mb-6">
                  <legend
                    className="flex items-baseline justify-between w-full text-[11px] tracking-[0.25em] uppercase font-[family:var(--font-kanit)] mb-3"
                    style={{ color: NATURAL.inkSoft }}
                  >
                    <span>
                      สี ·{' '}
                      <span style={{ color: NATURAL.ink }}>
                        {selectedColor ?? '—'}
                      </span>
                    </span>
                    <span>{colorOptions.length} เฉดสี</span>
                  </legend>
                  <div className="flex flex-wrap gap-3" role="radiogroup">
                    {colorOptions.map((c) => {
                      const active = c === selectedColor;
                      return (
                        <button
                          key={c}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          aria-label={`สี ${c}`}
                          onClick={() => setSelectedColor(c)}
                          className="relative w-9 h-9 transition-transform"
                          style={{
                            background: fiberSwatch(c),
                            outline: active
                              ? `1.5px solid ${NATURAL.ink}`
                              : `1px solid ${NATURAL.sageMuted}`,
                            outlineOffset: active ? '3px' : '0',
                            transform: active ? 'scale(1.04)' : 'scale(1)',
                          }}
                          title={c}
                        />
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {/* SIZE PICKER */}
              {sizeOptions.length > 0 && (
                <fieldset className="mb-6">
                  <legend
                    className="flex items-baseline justify-between w-full text-[11px] tracking-[0.25em] uppercase font-[family:var(--font-kanit)] mb-3"
                    style={{ color: NATURAL.inkSoft }}
                  >
                    <span>
                      ขนาดผ้า ·{' '}
                      <span style={{ color: NATURAL.ink }}>
                        {selectedSize ?? 'เลือกขนาด'}
                      </span>
                    </span>
                    <a
                      href="#size-guide"
                      style={{ color: NATURAL.sage }}
                      className="hover:underline"
                    >
                      ตารางขนาด ↗
                    </a>
                  </legend>
                  <div className="flex flex-wrap gap-2" role="radiogroup">
                    {sizeOptions.map((s) => {
                      const active = s === selectedSize;
                      return (
                        <button
                          key={s}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSelectedSize(s)}
                          className="min-w-[3rem] h-11 px-4 text-sm font-[family:var(--font-kanit)] tracking-wider transition-colors"
                          style={{
                            background: active ? NATURAL.ink : 'transparent',
                            color: active ? NATURAL.cream : NATURAL.ink,
                            border: `1px solid ${active ? NATURAL.ink : NATURAL.sageMuted}`,
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {/* MATERIAL PICKER */}
              {materialOptions.length > 0 && (
                <fieldset className="mb-6">
                  <legend
                    className="text-[11px] tracking-[0.25em] uppercase font-[family:var(--font-kanit)] mb-3"
                    style={{ color: NATURAL.inkSoft }}
                  >
                    เส้นใย ·{' '}
                    <span style={{ color: NATURAL.ink }}>
                      {selectedMaterial ?? '—'}
                    </span>
                  </legend>
                  <div className="flex flex-wrap gap-2" role="radiogroup">
                    {materialOptions.map((m) => {
                      const active = m === selectedMaterial;
                      return (
                        <button
                          key={m}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSelectedMaterial(m)}
                          className="h-10 px-4 text-xs tracking-wider uppercase font-[family:var(--font-kanit)] transition-colors"
                          style={{
                            background: active ? NATURAL.sand : 'transparent',
                            color: NATURAL.ink,
                            border: `1px solid ${active ? NATURAL.ink : NATURAL.sageMuted}`,
                          }}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {/* QTY + ATC */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <div
                  className="flex items-center h-14"
                  style={{ border: `1px solid ${NATURAL.ink}` }}
                  role="group"
                  aria-label="จำนวน"
                >
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="ลดจำนวน"
                    className="w-12 h-full flex items-center justify-center transition-colors hover:bg-[color:var(--shop-bg)]"
                    style={{ color: NATURAL.ink }}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    aria-label="จำนวนผืน"
                    className="w-14 h-full text-center bg-transparent outline-none font-[family:var(--font-kanit)] text-base"
                    style={{ color: NATURAL.ink }}
                  />
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    aria-label="เพิ่มจำนวน"
                    className="w-12 h-full flex items-center justify-center transition-colors hover:bg-[color:var(--shop-bg)]"
                    style={{ color: NATURAL.ink }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!inStock}
                  className="flex-1 h-14 inline-flex items-center justify-center gap-3 text-sm tracking-[0.2em] uppercase font-[family:var(--font-kanit)] transition-opacity"
                  style={{
                    background: inStock ? NATURAL.ink : NATURAL.sageMuted,
                    color: NATURAL.cream,
                    cursor: inStock ? 'pointer' : 'not-allowed',
                    opacity: inStock ? 1 : 0.7,
                  }}
                >
                  <ShoppingBag size={16} />
                  {inStock ? 'เพิ่มลงตะกร้า' : 'สินค้าหมด'}
                </button>

                <button
                  type="button"
                  aria-label="เพิ่มในรายการโปรด"
                  className="h-14 w-14 inline-flex items-center justify-center transition-colors"
                  style={{
                    border: `1px solid ${NATURAL.ink}`,
                    color: NATURAL.ink,
                  }}
                >
                  <Heart size={16} />
                </button>
              </div>

              {/* TRUST BADGES */}
              <ul
                className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-px"
                style={{ background: NATURAL.sageMuted }}
                aria-label="สิ่งที่คุณจะได้รับ"
              >
                {[
                  {
                    icon: <Truck size={16} />,
                    title: 'จัดส่งฟรี',
                    sub: 'สั่งครบ ฿1,500 ขึ้นไป',
                  },
                  {
                    icon: <Leaf size={16} />,
                    title: 'ย้อมจากพืช',
                    sub: 'ปลอดสารเคมี 100%',
                  },
                  {
                    icon: <Sparkles size={16} />,
                    title: 'ยิ่งซัก ยิ่งนุ่ม',
                    sub: 'ผ้าลินินยุโรปแท้',
                  },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="flex items-start gap-3 p-4"
                    style={{ background: NATURAL.cream }}
                  >
                    <span style={{ color: NATURAL.sage }}>{item.icon}</span>
                    <div className="text-left">
                      <p
                        className="text-xs tracking-[0.18em] uppercase font-[family:var(--font-kanit)]"
                        style={{ color: NATURAL.ink }}
                      >
                        {item.title}
                      </p>
                      <p
                        className="text-[11px] mt-1 leading-snug"
                        style={{ color: NATURAL.inkSoft }}
                      >
                        {item.sub}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── Description / Texture & Material story ──────────── */}
      {paragraphs.length > 0 && (
        <section
          className="border-y"
          style={{
            background: NATURAL.sand,
            borderColor: NATURAL.sageMuted,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-4">
                <p
                  className="text-[11px] tracking-[0.3em] uppercase font-[family:var(--font-kanit)] mb-3 inline-flex items-center gap-2"
                  style={{ color: NATURAL.sage }}
                >
                  <LeafSprigSvg className="w-3.5 h-3.5" />
                  สัมผัสของผ้า
                </p>
                <h2
                  className="text-2xl md:text-3xl font-light leading-snug font-[family:var(--font-kanit)]"
                  style={{ color: NATURAL.ink, letterSpacing: '-0.005em' }}
                >
                  เรื่องราวของผืนผ้า
                  <br />
                  จากเส้นใยถึงมือคุณ
                </h2>
                <div
                  className="mt-6 w-12 h-px"
                  style={{ background: NATURAL.ink }}
                />
              </div>

              <div className="md:col-span-7 md:col-start-6">
                <div
                  className="space-y-5 text-[15px] leading-loose"
                  style={{ color: NATURAL.ink }}
                >
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                <div
                  className="my-8"
                  style={{ color: NATURAL.sageMuted, height: 14 }}
                >
                  <ThreadDividerSvg className="w-full h-full" />
                </div>

                <dl
                  className="grid grid-cols-2 sm:grid-cols-3 gap-y-6"
                  aria-label="คุณสมบัติของผ้า"
                >
                  {[
                    { k: 'เส้นใย', v: selectedMaterial ?? 'ลินิน 100%' },
                    { k: 'การทอ', v: 'Hand-loom' },
                    { k: 'แหล่งย้อม', v: 'พืชธรรมชาติ' },
                    { k: 'GSM', v: '185 ก./ม²' },
                    { k: 'หดตัว', v: '< 3%' },
                    { k: 'ผลิตที่', v: 'เชียงใหม่' },
                  ].map((row) => (
                    <div key={row.k}>
                      <dt
                        className="text-[10px] tracking-[0.25em] uppercase font-[family:var(--font-kanit)]"
                        style={{ color: NATURAL.inkSoft }}
                      >
                        {row.k}
                      </dt>
                      <dd
                        className="mt-1 text-sm font-[family:var(--font-kanit)]"
                        style={{ color: NATURAL.ink }}
                      >
                        {row.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────── Care & Size guide ─────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <details
            className="group"
            id="care"
            style={{ borderTop: `1px solid ${NATURAL.ink}` }}
            open
          >
            <summary
              className="cursor-pointer list-none flex items-center justify-between py-5 font-[family:var(--font-kanit)] text-sm tracking-[0.2em] uppercase"
              style={{ color: NATURAL.ink }}
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles size={14} style={{ color: NATURAL.sage }} />
                การดูแลผ้า
              </span>
              <Plus
                size={16}
                className="transition-transform group-open:rotate-45"
              />
            </summary>
            <ul
              className="pb-6 pl-1 space-y-3 text-sm leading-relaxed"
              style={{ color: NATURAL.ink }}
            >
              {[
                'ซักด้วยมือหรือเครื่องซักโหมดอ่อน น้ำเย็น ไม่เกิน 30°C',
                'ห้ามใช้น้ำยาฟอกขาวหรือผงซักฟอกที่มีสารเรืองแสง',
                'ตากในที่ร่ม ไม่ปะทะแดดจัด เพื่อรักษาสีจากพืช',
                'รีดด้วยอุณหภูมิปานกลางขณะผ้ายังหมาด ยิ่งซักจะยิ่งนุ่ม',
              ].map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="mt-2 w-3 h-px flex-shrink-0"
                    style={{ background: NATURAL.sage }}
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </details>

          <details
            className="group"
            id="size-guide"
            style={{ borderTop: `1px solid ${NATURAL.ink}` }}
            open
          >
            <summary
              className="cursor-pointer list-none flex items-center justify-between py-5 font-[family:var(--font-kanit)] text-sm tracking-[0.2em] uppercase"
              style={{ color: NATURAL.ink }}
            >
              <span className="inline-flex items-center gap-2">
                <Scissors size={14} style={{ color: NATURAL.sage }} />
                ตารางขนาดผ้า
              </span>
              <Plus
                size={16}
                className="transition-transform group-open:rotate-45"
              />
            </summary>
            <div className="pb-6">
              <table
                className="w-full text-sm"
                style={{ color: NATURAL.ink }}
              >
                <thead
                  className="text-[11px] tracking-[0.2em] uppercase font-[family:var(--font-kanit)]"
                  style={{ color: NATURAL.inkSoft }}
                >
                  <tr
                    style={{ borderBottom: `1px solid ${NATURAL.sageMuted}` }}
                  >
                    <th className="text-left py-2 font-normal">ขนาด</th>
                    <th className="text-right py-2 font-normal">
                      กว้าง (ซม.)
                    </th>
                    <th className="text-right py-2 font-normal">
                      ยาว (ซม.)
                    </th>
                  </tr>
                </thead>
                <tbody className="font-[family:var(--font-kanit)]">
                  {[
                    { s: 'Single', w: '150', l: '220' },
                    { s: 'Queen', w: '180', l: '240' },
                    { s: 'King', w: '200', l: '260' },
                    { s: 'Throw', w: '130', l: '180' },
                  ].map((row, i) => (
                    <tr
                      key={row.s}
                      style={{
                        borderBottom:
                          i === 3
                            ? 'none'
                            : `1px solid ${NATURAL.sageMuted}`,
                      }}
                    >
                      <td className="py-3">{row.s}</td>
                      <td className="py-3 text-right">{row.w}</td>
                      <td className="py-3 text-right">{row.l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p
                className="text-xs mt-4 leading-relaxed"
                style={{ color: NATURAL.inkSoft }}
              >
                * ผ้าลินินอาจมีการหดตัวเล็กน้อยหลังการซักครั้งแรก
                ขนาดที่ระบุเป็นขนาดก่อนซัก
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* ─────────────────── Related products ─────────────────── */}
      {related.length > 0 && (
        <section
          className="border-t"
          style={{
            background: NATURAL.cream,
            borderColor: NATURAL.sageMuted,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
              <div>
                <p
                  className="text-[11px] tracking-[0.3em] uppercase font-[family:var(--font-kanit)] mb-2 inline-flex items-center gap-2"
                  style={{ color: NATURAL.sage }}
                >
                  <LeafSprigSvg className="w-3.5 h-3.5" />
                  ผ้าผืนอื่นในคอลเลกชัน
                </p>
                <h2
                  className="text-2xl md:text-3xl font-light font-[family:var(--font-kanit)]"
                  style={{ color: NATURAL.ink, letterSpacing: '-0.005em' }}
                >
                  อาจเข้ากันกับ
                  <br className="hidden sm:block" /> ผืนที่คุณเลือก
                </h2>
              </div>
              <Link
                href={`/stores/${store.slug}/products`}
                className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-[family:var(--font-kanit)] pb-1.5 transition-colors hover:opacity-70"
                style={{
                  color: NATURAL.ink,
                  borderBottom: `1px solid ${NATURAL.ink}`,
                }}
              >
                ดูคอลเลกชันทั้งหมด
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {related.slice(0, 4).map((r) => {
                const rOnSale =
                  r.compareAtPriceTHB && r.compareAtPriceTHB > r.priceTHB;
                return (
                  <Link
                    key={r.id}
                    href={`/stores/${store.slug}/products/${r.id}`}
                    className="group flex flex-col"
                  >
                    <div
                      className="relative aspect-[3/4] overflow-hidden mb-4"
                      style={{ background: NATURAL.sand }}
                    >
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 p-8 flex items-center justify-center"
                          style={{ color: NATURAL.sageMuted }}
                        >
                          <LoomWeaveSvg className="w-full h-full" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      {r.categoryName && (
                        <span
                          className="text-[10px] tracking-[0.22em] uppercase font-[family:var(--font-kanit)] mb-1.5"
                          style={{ color: NATURAL.sage }}
                        >
                          {r.categoryName}
                        </span>
                      )}
                      <h3
                        className="text-sm font-light leading-snug font-[family:var(--font-kanit)] line-clamp-2"
                        style={{ color: NATURAL.ink }}
                      >
                        {r.title}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span
                          className="text-sm font-[family:var(--font-kanit)]"
                          style={{ color: NATURAL.ink }}
                        >
                          {formatTHB(r.priceTHB)}
                        </span>
                        {rOnSale && (
                          <span
                            className="text-xs line-through"
                            style={{ color: NATURAL.inkSoft }}
                          >
                            {formatTHB(r.compareAtPriceTHB!)}
                          </span>
                        )}
                      </div>
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

export default LinenAndLoomProductDetail;
