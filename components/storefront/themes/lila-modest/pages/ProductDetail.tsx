'use client';

/**
 * lila-modest — bespoke Product Detail Page (PDP).
 *
 * Niche: modest muslim fashion (เสื้อผ้ามุสลิม · เดรสยาว · ผ้าฮิญาบ).
 *
 * Visual language:
 *   - Soft lavender · dusty rose · warm cream palette (via --shop-* + color-mix).
 *   - Elegant editorial headlines in Kanit (Google Thai; we don't ship serif
 *     display fonts — Kanit at heavier weights carries the same calm gravitas).
 *   - Long-form body in Prompt for breathing copy + modesty notes.
 *   - Gentle illustrated chips for trust signals (no harsh icons).
 *   - 4/5 portrait gallery — modest-friendly full-figure framing.
 *
 * Data contract: `ProductDetailProps` from `lib/templates/types.ts`. The
 * registry currently still binds `pdp` to `makePdpAdapter('06','03')` per
 * task scope ("ห้ามแตะ registry/อื่น") — wiring this component into the
 * registry is a follow-up commit. This file is the bespoke surface ready
 * to be wired in.
 *
 * Colors: ALL chrome reads from `var(--shop-*)` (set by the family
 * resolver — lila-modest sits in `fashion-beauty`, which paints rose +
 * cream onto the shop-cascade). NO hardcoded hex values anywhere.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  Minus,
  Plus,
  Star,
  Truck,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Leaf,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

/* ────────────────────────── helpers ────────────────────────── */

/** Map common Thai/English color names to a CSS color expression so the
 *  swatch dot is visually correct without hardcoding hex anywhere. We
 *  derive from the shop palette via `color-mix` for any unknown label so
 *  even custom colors stay on-brand. */
function swatchColor(label: string | null | undefined): string {
  if (!label) return 'color-mix(in srgb, var(--shop-primary) 40%, var(--shop-card))';
  const key = label.toLowerCase().trim();
  // Thai → palette-relative tint mapping. Each entry uses color-mix
  // against the shop palette so the swatch tracks the family theme
  // and we satisfy the "no hex" rule.
  const map: Record<string, string> = {
    'ดำ': 'color-mix(in srgb, var(--shop-ink) 92%, transparent)',
    'black': 'color-mix(in srgb, var(--shop-ink) 92%, transparent)',
    'ขาว': 'color-mix(in srgb, var(--shop-card) 95%, var(--shop-ink) 5%)',
    'white': 'color-mix(in srgb, var(--shop-card) 95%, var(--shop-ink) 5%)',
    'ครีม': 'color-mix(in srgb, var(--shop-bg) 70%, var(--shop-card))',
    'cream': 'color-mix(in srgb, var(--shop-bg) 70%, var(--shop-card))',
    'เบจ': 'color-mix(in srgb, var(--shop-muted) 60%, var(--shop-bg))',
    'beige': 'color-mix(in srgb, var(--shop-muted) 60%, var(--shop-bg))',
    'น้ำตาล': 'color-mix(in srgb, var(--shop-ink) 70%, var(--shop-primary))',
    'brown': 'color-mix(in srgb, var(--shop-ink) 70%, var(--shop-primary))',
    'กรม': 'color-mix(in srgb, var(--shop-ink) 80%, var(--shop-accent))',
    'navy': 'color-mix(in srgb, var(--shop-ink) 80%, var(--shop-accent))',
    'ชมพู': 'color-mix(in srgb, var(--shop-primary) 65%, var(--shop-card))',
    'pink': 'color-mix(in srgb, var(--shop-primary) 65%, var(--shop-card))',
    'ม่วง': 'color-mix(in srgb, var(--shop-accent) 70%, var(--shop-primary))',
    'purple': 'color-mix(in srgb, var(--shop-accent) 70%, var(--shop-primary))',
    'lavender': 'color-mix(in srgb, var(--shop-accent) 50%, var(--shop-card))',
    'ลาเวนเดอร์': 'color-mix(in srgb, var(--shop-accent) 50%, var(--shop-card))',
    'เขียว': 'color-mix(in srgb, var(--shop-ink) 35%, var(--shop-muted))',
    'green': 'color-mix(in srgb, var(--shop-ink) 35%, var(--shop-muted))',
    'เทา': 'color-mix(in srgb, var(--shop-ink) 35%, var(--shop-card))',
    'gray': 'color-mix(in srgb, var(--shop-ink) 35%, var(--shop-card))',
    'grey': 'color-mix(in srgb, var(--shop-ink) 35%, var(--shop-card))',
  };
  return map[key] ?? `color-mix(in srgb, var(--shop-primary) ${30 + (key.length * 7) % 40}%, var(--shop-card))`;
}

/** Split product variants into separate option axes (color / size / style). */
function buildOptionAxes(variants: ProductDetailProps['product']['variants']) {
  const colors: { label: string; ids: string[] }[] = [];
  const sizes: { label: string; ids: string[] }[] = [];
  const styles: { label: string; ids: string[] }[] = [];

  const pushUnique = (
    arr: { label: string; ids: string[] }[],
    label: string,
    id: string,
  ) => {
    const existing = arr.find((x) => x.label === label);
    if (existing) existing.ids.push(id);
    else arr.push({ label, ids: [id] });
  };

  for (const v of variants) {
    if (v.colorLabel) pushUnique(colors, v.colorLabel, v.id);
    if (v.sizeLabel) pushUnique(sizes, v.sizeLabel, v.id);
    // "Hijab style" — surface via `materialLabel` (CJ/adapter convention).
    if (v.materialLabel) pushUnique(styles, v.materialLabel, v.id);
  }
  return { colors, sizes, styles };
}

/* ────────────────────────── component ────────────────────────── */

export function ProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  // Gallery — full-figure modest portraits. We dedup against `imageUrl`
  // because importers sometimes save the cover twice into galleryUrls.
  const gallery = useMemo(() => {
    const list = [product.imageUrl, ...product.images].filter(
      (u): u is string => !!u && u.trim().length > 0,
    );
    return Array.from(new Set(list));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState(0);
  const { colors, sizes, styles } = useMemo(
    () => buildOptionAxes(product.variants),
    [product.variants],
  );

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0]?.label ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes[0]?.label ?? null,
  );
  const [selectedStyle, setSelectedStyle] = useState<string | null>(
    styles[0]?.label ?? null,
  );
  const [qty, setQty] = useState(1);

  const discountPct =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
      ? Math.round(
          ((product.originalPriceTHB - product.priceTHB) /
            product.originalPriceTHB) *
            100,
        )
      : 0;

  const handleAddToCart = () => {
    add(
      {
        productId: product.id,
        title: product.title,
        imageUrl: product.imageUrl ?? undefined,
        priceTHB: product.priceTHB,
        storeSlug: store.slug,
        storeName: store.name,
      },
      qty,
    );
    showConfirm(product.title, store.slug);
  };

  /* ─────────────────────── render ─────────────────────── */
  return (
    <main
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--shop-bg) 88%, var(--shop-accent)) 0%, var(--shop-bg) 360px)',
        color: 'var(--shop-ink)',
        fontFamily: 'var(--font-prompt), system-ui, sans-serif',
      }}
    >
      {/* ───────── Breadcrumb ───────── */}
      <nav
        aria-label="breadcrumb"
        className="mx-auto hidden max-w-6xl px-4 pt-6 text-xs sm:block sm:px-6 lg:px-8"
        style={{
          fontFamily: 'var(--font-prompt), system-ui, sans-serif',
          color: 'var(--shop-ink-muted)',
        }}
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href={`/stores/${store.slug}`}
              className="transition-colors hover:underline"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              หน้าแรก
            </Link>
          </li>
          <li aria-hidden="true">·</li>
          <li>
            <Link
              href={`/stores/${store.slug}/category`}
              className="transition-colors hover:underline"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              คอลเลกชัน
            </Link>
          </li>
          {product.categoryName && (
            <>
              <li aria-hidden="true">·</li>
              <li>
                <Link
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(
                    product.categoryName,
                  )}`}
                  className="transition-colors hover:underline"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {product.categoryName}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">·</li>
          <li
            aria-current="page"
            className="line-clamp-1"
            style={{ color: 'var(--shop-ink)', fontWeight: 500 }}
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ───────── Hero — Gallery + Info ───────── */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr,1fr] lg:gap-14">
          {/* ─── Gallery (full-figure portrait, modest-respectful) ─── */}
          <div>
            <div
              className="relative overflow-hidden"
              style={{
                aspectRatio: '4 / 5',
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--shop-muted) 60%, var(--shop-bg)) 0%, color-mix(in srgb, var(--shop-accent) 18%, var(--shop-card)) 100%)',
                borderRadius: '24px',
                border: '1px solid color-mix(in srgb, var(--shop-border) 70%, var(--shop-accent))',
              }}
            >
              {/* Eyebrow ribbon — modest-fashion eyebrow */}
              <span
                className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] backdrop-blur-sm"
                style={{
                  background: 'color-mix(in srgb, var(--shop-card) 80%, transparent)',
                  color: 'var(--shop-ink)',
                  border:
                    '1px solid color-mix(in srgb, var(--shop-border) 60%, transparent)',
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={11} aria-hidden="true" />
                modest · thai-made
              </span>

              {discountPct > 0 && (
                <span
                  className="absolute right-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: 'var(--shop-primary)',
                    color: 'var(--shop-card)',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  }}
                >
                  −{discountPct}%
                </span>
              )}

              {gallery[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gallery[activeImage]}
                  alt={`${product.title} — รูปที่ ${activeImage + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                // Gentle illustration fallback — a single calligraphic glyph
                // sits in the swatch when no photography is uploaded yet.
                <div className="flex h-full w-full items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="text-7xl opacity-30"
                    style={{
                      fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                      color: 'var(--shop-primary)',
                      fontWeight: 500,
                    }}
                  >
                    ลีลา
                  </span>
                </div>
              )}

              {/* Soft bottom vignette — keeps respectful imagery focus */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{
                  background:
                    'linear-gradient(to top, color-mix(in srgb, var(--shop-ink) 12%, transparent) 0%, transparent 100%)',
                }}
              />
            </div>

            {/* Thumbnail strip — 4/5 portrait minis to mirror full-figure shots */}
            {gallery.length > 1 && (
              <ul
                className="mt-4 grid grid-cols-5 gap-2 sm:gap-3"
                aria-label="แกลเลอรีรูปสินค้า"
              >
                {gallery.slice(0, 5).map((src, i) => (
                  <li key={`${src}-${i}`}>
                    <button
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`ดูรูปที่ ${i + 1}`}
                      aria-pressed={activeImage === i}
                      className="relative block w-full overflow-hidden transition-all focus:outline-none focus-visible:ring-2"
                      style={{
                        aspectRatio: '4 / 5',
                        borderRadius: '12px',
                        border:
                          activeImage === i
                            ? '2px solid var(--shop-primary)'
                            : '1px solid color-mix(in srgb, var(--shop-border) 70%, transparent)',
                        background:
                          'color-mix(in srgb, var(--shop-muted) 50%, var(--shop-bg))',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ─── Info column ─── */}
          <div className="flex flex-col">
            {/* Eyebrow + headline */}
            <div className="mb-3 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-px w-8"
                style={{
                  background:
                    'color-mix(in srgb, var(--shop-primary) 60%, transparent)',
                }}
              />
              <span
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{
                  color: 'var(--shop-primary)',
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  fontWeight: 600,
                }}
              >
                {product.categoryName ?? 'modest collection'}
              </span>
            </div>

            <h1
              className="text-3xl leading-[1.18] sm:text-4xl lg:text-[2.6rem]"
              style={{
                fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'var(--shop-ink)',
              }}
            >
              {product.title}
            </h1>

            {/* Lightweight social proof — purposely soft, no fake counts */}
            <div className="mt-3 flex items-center gap-2 text-xs"
              style={{
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                color: 'var(--shop-ink-muted)',
              }}
            >
              <span className="inline-flex items-center gap-0.5" aria-label="modest-tested">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={13}
                    aria-hidden="true"
                    style={{
                      color: 'color-mix(in srgb, var(--shop-primary) 75%, var(--shop-ink))',
                    }}
                    fill="currentColor"
                  />
                ))}
              </span>
              <span>· คัดเลือกโดย Lila atelier</span>
            </div>

            {/* Price block */}
            <div className="mt-6 flex items-baseline gap-3">
              <span
                className="text-3xl tabular-nums sm:text-[2rem]"
                style={{
                  fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                  fontWeight: 500,
                  color: 'var(--shop-ink)',
                }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {product.originalPriceTHB &&
                product.originalPriceTHB > product.priceTHB && (
                  <span
                    className="text-sm tabular-nums line-through"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {formatTHB(product.originalPriceTHB)}
                  </span>
                )}
              {discountPct > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background:
                      'color-mix(in srgb, var(--shop-primary) 14%, var(--shop-card))',
                    color: 'var(--shop-primary)',
                  }}
                >
                  ประหยัด {discountPct}%
                </span>
              )}
            </div>

            {/* Description — full body copy, modest brand voice */}
            {product.description && (
              <p
                className="mt-5 text-[15px] leading-relaxed"
                style={{
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  color: 'color-mix(in srgb, var(--shop-ink) 78%, var(--shop-ink-muted))',
                }}
              >
                {product.description}
              </p>
            )}

            {/* Divider — soft hair-line */}
            <hr
              className="my-7 border-0"
              style={{
                height: '1px',
                background:
                  'linear-gradient(to right, transparent 0%, color-mix(in srgb, var(--shop-border) 80%, transparent) 50%, transparent 100%)',
              }}
            />

            {/* Variants — Color */}
            {colors.length > 0 && (
              <fieldset className="mb-5">
                <legend
                  className="mb-2.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  สี
                  {selectedColor && (
                    <span
                      style={{
                        color: 'var(--shop-ink)',
                        textTransform: 'none',
                        letterSpacing: 'normal',
                        fontWeight: 500,
                      }}
                    >
                      · {selectedColor}
                    </span>
                  )}
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((c) => {
                    const active = selectedColor === c.label;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setSelectedColor(c.label)}
                        aria-label={`เลือกสี ${c.label}`}
                        aria-pressed={active}
                        className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all focus:outline-none focus-visible:ring-2"
                        style={{
                          background:
                            'color-mix(in srgb, var(--shop-card) 80%, var(--shop-bg))',
                          border: active
                            ? '2px solid var(--shop-primary)'
                            : '1px solid color-mix(in srgb, var(--shop-border) 70%, transparent)',
                          boxShadow: active
                            ? '0 0 0 3px color-mix(in srgb, var(--shop-primary) 18%, transparent)'
                            : 'none',
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="block h-6 w-6 rounded-full"
                          style={{
                            background: swatchColor(c.label),
                            border:
                              '1px solid color-mix(in srgb, var(--shop-ink) 8%, transparent)',
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Variants — Size */}
            {sizes.length > 0 && (
              <fieldset className="mb-5">
                <legend
                  className="mb-2.5 flex items-center justify-between text-[11px] uppercase tracking-[0.18em]"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    ขนาด
                    {selectedSize && (
                      <span
                        style={{
                          color: 'var(--shop-ink)',
                          textTransform: 'none',
                          letterSpacing: 'normal',
                          fontWeight: 500,
                        }}
                      >
                        · {selectedSize}
                      </span>
                    )}
                  </span>
                  <Link
                    href={`/stores/${store.slug}/help/size-guide`}
                    className="text-[10px] underline-offset-2 hover:underline"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    คู่มือขนาด ↗
                  </Link>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const active = selectedSize === s.label;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setSelectedSize(s.label)}
                        aria-label={`เลือกขนาด ${s.label}`}
                        aria-pressed={active}
                        className="rounded-full px-4 py-2 text-sm transition-all focus:outline-none focus-visible:ring-2"
                        style={{
                          fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                          fontWeight: 500,
                          background: active
                            ? 'var(--shop-ink)'
                            : 'var(--shop-card)',
                          color: active
                            ? 'var(--shop-card)'
                            : 'var(--shop-ink)',
                          border: active
                            ? '1px solid var(--shop-ink)'
                            : '1px solid color-mix(in srgb, var(--shop-border) 80%, transparent)',
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Variants — Hijab style */}
            {styles.length > 0 && (
              <fieldset className="mb-5">
                <legend
                  className="mb-2.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  สไตล์ฮิญาบ
                  {selectedStyle && (
                    <span
                      style={{
                        color: 'var(--shop-ink)',
                        textTransform: 'none',
                        letterSpacing: 'normal',
                        fontWeight: 500,
                      }}
                    >
                      · {selectedStyle}
                    </span>
                  )}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {styles.map((s) => {
                    const active = selectedStyle === s.label;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setSelectedStyle(s.label)}
                        aria-pressed={active}
                        className="rounded-full px-4 py-2 text-xs transition-all focus:outline-none focus-visible:ring-2"
                        style={{
                          fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                          fontWeight: 500,
                          background: active
                            ? 'color-mix(in srgb, var(--shop-primary) 14%, var(--shop-card))'
                            : 'var(--shop-card)',
                          color: active
                            ? 'var(--shop-primary)'
                            : 'var(--shop-ink-muted)',
                          border: active
                            ? '1px solid var(--shop-primary)'
                            : '1px solid color-mix(in srgb, var(--shop-border) 80%, transparent)',
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Modesty notes — soft note panel */}
            <div
              className="mb-6 mt-2 rounded-2xl px-5 py-4"
              style={{
                background:
                  'color-mix(in srgb, var(--shop-muted) 55%, var(--shop-card))',
                border:
                  '1px solid color-mix(in srgb, var(--shop-border) 60%, transparent)',
              }}
            >
              <div className="flex items-start gap-3">
                <Leaf
                  size={18}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                  style={{ color: 'var(--shop-primary)' }}
                />
                <div
                  className="text-[13px] leading-relaxed"
                  style={{
                    color: 'color-mix(in srgb, var(--shop-ink) 78%, var(--shop-ink-muted))',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  }}
                >
                  <p
                    className="mb-1 text-[11px] uppercase tracking-[0.16em]"
                    style={{
                      color: 'var(--shop-primary)',
                      fontWeight: 700,
                    }}
                  >
                    หมายเหตุการสวมใส่
                  </p>
                  ตัดเย็บคลุมหัวเข่า · แขนยาวพอดี · ผ้าไม่บาง ไม่เผยรูปร่าง · เหมาะใส่ละหมาดและออกงานทั่วไป · เนื้อผ้าระบายอากาศได้ดี เหมาะกับอากาศไทย
                </div>
              </div>
            </div>

            {/* Qty + CTA */}
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div
                className="flex items-center justify-between rounded-full px-1 py-1"
                role="group"
                aria-label="จำนวน"
                style={{
                  background: 'var(--shop-card)',
                  border:
                    '1px solid color-mix(in srgb, var(--shop-border) 80%, transparent)',
                  minWidth: '140px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="ลดจำนวน"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[color-mix(in_srgb,var(--shop-muted)_60%,transparent)] focus:outline-none focus-visible:ring-2"
                  style={{ color: 'var(--shop-ink)' }}
                  disabled={qty <= 1}
                >
                  <Minus size={16} />
                </button>
                <span
                  className="min-w-[2ch] text-center text-base tabular-nums"
                  aria-live="polite"
                  style={{
                    fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                    color: 'var(--shop-ink)',
                    fontWeight: 500,
                  }}
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="เพิ่มจำนวน"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[color-mix(in_srgb,var(--shop-muted)_60%,transparent)] focus:outline-none focus-visible:ring-2"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm transition-all focus:outline-none focus-visible:ring-2"
                style={{
                  background: 'var(--shop-ink)',
                  color: 'var(--shop-card)',
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  boxShadow:
                    '0 12px 30px -16px color-mix(in srgb, var(--shop-ink) 70%, transparent)',
                }}
              >
                <ShoppingBag size={16} aria-hidden="true" />
                เพิ่มลงตะกร้า · {formatTHB(product.priceTHB * qty)}
              </button>

              <button
                type="button"
                aria-label="บันทึกในรายการโปรด"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-[color-mix(in_srgb,var(--shop-primary)_8%,transparent)] focus:outline-none focus-visible:ring-2"
                style={{
                  border:
                    '1px solid color-mix(in srgb, var(--shop-border) 80%, transparent)',
                  background: 'var(--shop-card)',
                  color: 'var(--shop-primary)',
                }}
              >
                <Heart size={18} />
              </button>
            </div>

            {/* Trust badges — gentle illustrated chips */}
            <ul
              className="mt-7 grid grid-cols-2 gap-3"
              aria-label="สิทธิ์ประโยชน์"
            >
              {[
                {
                  icon: <Truck size={16} aria-hidden="true" />,
                  title: 'ส่งฟรี ฿1,500+',
                  desc: 'ทั่วประเทศไทย 1–3 วัน',
                },
                {
                  icon: <CheckCircle2 size={16} aria-hidden="true" />,
                  title: 'เปลี่ยนไซส์ฟรี',
                  desc: 'ภายใน 14 วัน',
                },
                {
                  icon: <ShieldCheck size={16} aria-hidden="true" />,
                  title: 'ผ้าคุณภาพคัดสรร',
                  desc: 'เรยอน × ลินิน นครปฐม',
                },
                {
                  icon: <Sparkles size={16} aria-hidden="true" />,
                  title: 'แพ็กสุภาพ',
                  desc: 'ห่อกระดาษคราฟต์ + ริบบิ้น',
                },
              ].map((t) => (
                <li
                  key={t.title}
                  className="flex items-start gap-2.5 rounded-2xl px-3 py-3"
                  style={{
                    background: 'var(--shop-card)',
                    border:
                      '1px solid color-mix(in srgb, var(--shop-border) 60%, transparent)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background:
                        'color-mix(in srgb, var(--shop-primary) 12%, var(--shop-card))',
                      color: 'var(--shop-primary)',
                    }}
                  >
                    {t.icon}
                  </span>
                  <div className="min-w-0">
                    <div
                      className="text-xs"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                        fontWeight: 600,
                      }}
                    >
                      {t.title}
                    </div>
                    <div
                      className="text-[11px]"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                      }}
                    >
                      {t.desc}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── Long-form description / care notes ───────── */}
      <section
        aria-labelledby="lila-details"
        className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8"
      >
        <div
          className="grid grid-cols-1 gap-6 rounded-3xl p-6 sm:p-10 md:grid-cols-2 md:gap-10"
          style={{
            background: 'var(--shop-card)',
            border:
              '1px solid color-mix(in srgb, var(--shop-border) 60%, transparent)',
          }}
        >
          <div>
            <span
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{
                color: 'var(--shop-primary)',
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                fontWeight: 600,
              }}
            >
              the piece
            </span>
            <h2
              id="lila-details"
              className="mt-2 text-2xl sm:text-3xl"
              style={{
                fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                color: 'var(--shop-ink)',
              }}
            >
              รายละเอียดและการดูแล
            </h2>
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                color: 'color-mix(in srgb, var(--shop-ink) 75%, var(--shop-ink-muted))',
              }}
            >
              ทุกชิ้นพัฒนาร่วมกับช่างทอผ้าในนครปฐม ผ้าเรยอนผสมลินินคุณภาพดี · ระบายอากาศได้สบาย · สีไม่ตกเมื่อซักตามคำแนะนำ · ออกแบบให้ทรงคลุมสวยและไม่บาง ใส่ละหมาดและออกงานได้ในชุดเดียว
            </p>
          </div>

          <ul
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            aria-label="คุณสมบัติเด่น"
          >
            {[
              { title: 'เรยอน × ลินิน', desc: 'นุ่ม ไม่ร้อน ซับเหงื่อได้ดี' },
              { title: 'ทรงคลุมเรียบร้อย', desc: 'แขนยาว · ยาวคลุมเข่า · ผ้าไม่บาง' },
              { title: 'ซักเครื่องได้', desc: 'น้ำเย็น · อย่าใช้น้ำยาฟอกขาว' },
              { title: 'ตัดเย็บในไทย', desc: 'โรงทอ + เย็บนครปฐม' },
            ].map((feat) => (
              <li
                key={feat.title}
                className="rounded-2xl px-4 py-3"
                style={{
                  background:
                    'color-mix(in srgb, var(--shop-muted) 50%, var(--shop-card))',
                  border:
                    '1px solid color-mix(in srgb, var(--shop-border) 50%, transparent)',
                }}
              >
                <div
                  className="text-xs"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {feat.title}
                </div>
                <div
                  className="mt-0.5 text-[11px]"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  }}
                >
                  {feat.desc}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Related products ───────── */}
      {related.length > 0 && (
        <section
          aria-labelledby="lila-related"
          className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8"
        >
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{
                  color: 'var(--shop-primary)',
                  fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                  fontWeight: 600,
                }}
              >
                จับคู่กับ
              </span>
              <h2
                id="lila-related"
                className="mt-1 text-2xl sm:text-3xl"
                style={{
                  fontFamily: 'var(--font-kanit), system-ui, sans-serif',
                  fontWeight: 500,
                  letterSpacing: '-0.005em',
                  color: 'var(--shop-ink)',
                }}
              >
                ชิ้นอื่นจากคอลเลกชันนี้
              </h2>
            </div>
            <Link
              href={`/stores/${store.slug}/category`}
              className="hidden text-xs underline-offset-4 hover:underline sm:inline-flex"
              style={{
                color: 'var(--shop-primary)',
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                fontWeight: 600,
              }}
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {related.slice(0, 8).map((r) => {
              const rDiscount =
                r.compareAtPriceTHB && r.compareAtPriceTHB > r.priceTHB
                  ? Math.round(
                      ((r.compareAtPriceTHB - r.priceTHB) /
                        r.compareAtPriceTHB) *
                        100,
                    )
                  : 0;
              return (
                <li key={r.id}>
                  <Link
                    href={`/stores/${store.slug}/products/${r.id}`}
                    className="group block"
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{
                        aspectRatio: '4 / 5',
                        borderRadius: '20px',
                        background:
                          'color-mix(in srgb, var(--shop-muted) 60%, var(--shop-card))',
                        border:
                          '1px solid color-mix(in srgb, var(--shop-border) 50%, transparent)',
                      }}
                    >
                      {rDiscount > 0 && (
                        <span
                          className="absolute left-2.5 top-2.5 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            background: 'var(--shop-primary)',
                            color: 'var(--shop-card)',
                            fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                          }}
                        >
                          −{rDiscount}%
                        </span>
                      )}
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span
                            aria-hidden="true"
                            className="text-2xl opacity-30"
                            style={{
                              fontFamily:
                                'var(--font-kanit), system-ui, sans-serif',
                              color: 'var(--shop-primary)',
                              fontWeight: 500,
                            }}
                          >
                            ลีลา
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="px-1 pt-3">
                      <div
                        className="line-clamp-2 text-sm leading-snug"
                        style={{
                          color: 'var(--shop-ink)',
                          fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        {r.title}
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span
                          className="text-sm tabular-nums"
                          style={{
                            color: 'var(--shop-ink)',
                            fontFamily:
                              'var(--font-kanit), system-ui, sans-serif',
                            fontWeight: 500,
                          }}
                        >
                          {formatTHB(r.priceTHB)}
                        </span>
                        {r.compareAtPriceTHB &&
                          r.compareAtPriceTHB > r.priceTHB && (
                            <span
                              className="text-xs tabular-nums line-through"
                              style={{ color: 'var(--shop-ink-muted)' }}
                            >
                              {formatTHB(r.compareAtPriceTHB)}
                            </span>
                          )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs"
              style={{
                background: 'var(--shop-card)',
                color: 'var(--shop-ink)',
                border:
                  '1px solid color-mix(in srgb, var(--shop-border) 80%, transparent)',
                fontFamily: 'var(--font-prompt), system-ui, sans-serif',
                fontWeight: 600,
              }}
            >
              ดูสินค้าทั้งหมด →
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetail;
