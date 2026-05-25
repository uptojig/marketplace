'use client';

/**
 * sirin-womenswear — bespoke ProductDetail page.
 *
 * Editorial boutique PDP for the women's-fashion family. Portrait-led
 * gallery (3:4 aspect lock), serif-elegant headings via Kanit display,
 * Prompt body text, soft rose / burgundy / cream palette piped exclusively
 * through `var(--shop-*)` design tokens (resolved per-store in the
 * shop layout — no hard-coded hex). Mounts directly on the scaffold
 * `ProductDetailProps` shape so it can be wired into the registry via
 * the standard PDP slot without an extra adapter layer.
 *
 * Sections (top→bottom):
 *   1. Breadcrumb (Home / shop / category / product)
 *   2. Two-column hero
 *        ↳ Left: portrait gallery with vertical thumb rail
 *        ↳ Right: name, price (formatTHB), color swatches, size table,
 *                 qty stepper, Add-to-Cart, trust badges, size-guide CTA
 *   3. Editorial description + size-chart panel
 *   4. Related products rail (4-up portrait cards)
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Ruler,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Editorial boutique fallback portrait used when a product has no
 * imageUrl yet. SVG keeps the layout from collapsing on empty galleries
 * and reads as a couture sketch in the brand palette.
 */
function PortraitPlaceholder({ label }: { label?: string }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 text-center"
      style={{ background: 'color-mix(in srgb, var(--shop-primary) 7%, var(--shop-bg))' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 160" width="48%" fill="none">
        <path
          d="M60 14 Q44 22 44 38 Q44 52 60 56 Q76 52 76 38 Q76 22 60 14Z"
          stroke="var(--shop-primary)"
          strokeWidth={2}
        />
        <path
          d="M28 156 L34 78 Q60 64 86 78 L92 156 Z"
          stroke="var(--shop-primary)"
          strokeWidth={2}
        />
        <path
          d="M40 96 Q60 90 80 96"
          stroke="var(--shop-primary)"
          strokeWidth={1.5}
          strokeDasharray="3 4"
        />
      </svg>
      {label && (
        <span
          className="text-[10px] uppercase tracking-[0.4em]"
          style={{ color: 'var(--shop-ink-muted)', fontFamily: 'var(--font-prompt)' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/** Map common color labels (Thai / English) to display swatch hex.  */
function swatchFor(label: string): string {
  const map: Record<string, string> = {
    ดำ: '#1c1917', black: '#1c1917',
    ขาว: '#fafaf9', white: '#fafaf9',
    ครีม: '#f5ecdb', cream: '#f5ecdb', ivory: '#f5ecdb', nude: '#e9d4c0',
    ชมพู: '#f9a8d4', pink: '#f9a8d4',
    'ชมพูพาสเทล': '#fbcfe8',
    'โรสโกลด์': '#e3b1a3', 'rose gold': '#e3b1a3',
    เบจ: '#d6c6b0', beige: '#d6c6b0',
    น้ำตาล: '#8a5a44', brown: '#8a5a44',
    แดง: '#b91c1c', red: '#b91c1c',
    เบอร์กันดี: '#7a1d3a', burgundy: '#7a1d3a', wine: '#7a1d3a',
    'น้ำตาลเข้ม': '#5b3a29',
    เทา: '#9ca3af', gray: '#9ca3af', grey: '#9ca3af',
    เขียว: '#3f7d4d', green: '#3f7d4d', sage: '#9caf88',
    มินต์: '#a7e0c4', mint: '#a7e0c4',
    น้ำเงิน: '#1e3a8a', blue: '#1e3a8a', navy: '#1e3a8a',
    ฟ้า: '#93c5fd', lightblue: '#93c5fd', skyblue: '#93c5fd',
    เหลือง: '#facc15', yellow: '#facc15',
    ส้ม: '#f97316', orange: '#f97316',
    ม่วง: '#9333ea', purple: '#9333ea',
    ลาเวนเดอร์: '#c4b5fd', lavender: '#c4b5fd',
  };
  return map[label.trim().toLowerCase()] ?? '#a8a29e';
}

/** Group product.variants by color label so colors and sizes render as
 *  distinct option rails. */
function buildVariantTables(variants: ProductDetailProps['product']['variants']) {
  const colors = new Map<string, { label: string; hex: string }>();
  const sizes = new Map<string, { label: string }>();
  for (const v of variants) {
    if (v.colorLabel && !colors.has(v.colorLabel)) {
      colors.set(v.colorLabel, { label: v.colorLabel, hex: swatchFor(v.colorLabel) });
    }
    if (v.sizeLabel && !sizes.has(v.sizeLabel)) {
      sizes.set(v.sizeLabel, { label: v.sizeLabel });
    }
  }
  return { colors: Array.from(colors.values()), sizes: Array.from(sizes.values()) };
}

// ── Component ───────────────────────────────────────────────────────

export function SirinProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;

  const gallery = useMemo<string[]>(() => {
    const raw = [product.imageUrl, ...(product.images ?? [])].filter(
      (s): s is string => !!s && s.trim().length > 0,
    );
    return Array.from(new Set(raw));
  }, [product.imageUrl, product.images]);

  const { colors, sizes } = useMemo(
    () => buildVariantTables(product.variants ?? []),
    [product.variants],
  );

  const [activeImage, setActiveImage] = useState(0);
  const [activeColor, setActiveColor] = useState<string | null>(
    colors[0]?.label ?? null,
  );
  const [activeSize, setActiveSize] = useState<string | null>(
    sizes[0]?.label ?? null,
  );
  const [qty, setQty] = useState(1);

  const add = useCart((s) => s.add);

  const onAddToCart = () => {
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
  };

  const hasDiscount =
    product.originalPriceTHB != null &&
    product.originalPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round(
        (1 - product.priceTHB / (product.originalPriceTHB as number)) * 100,
      )
    : 0;

  const shopHomeUrl = `/stores/${store.slug}`;
  const catalogUrl = `/stores/${store.slug}/category`;
  const categoryUrl = product.categoryName
    ? `${catalogUrl}?cat=${encodeURIComponent(product.categoryName)}`
    : catalogUrl;

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--shop-bg)',
        color: 'var(--shop-ink)',
        fontFamily: 'var(--font-prompt), var(--font-google-sans), system-ui, sans-serif',
      }}
    >
      {/* ── Breadcrumb ────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-7xl px-4 pt-6 pb-2 sm:px-6 lg:px-8"
      >
        <ol
          className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.22em]"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          <li>
            <Link
              href={shopHomeUrl}
              className="hover:opacity-100"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              หน้าแรก
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" />
          </li>
          <li>
            <Link href={catalogUrl} style={{ color: 'var(--shop-ink-muted)' }}>
              คอลเลกชัน
            </Link>
          </li>
          {product.categoryName && (
            <>
              <li aria-hidden="true">
                <ChevronRight className="h-3 w-3" />
              </li>
              <li>
                <Link href={categoryUrl} style={{ color: 'var(--shop-ink-muted)' }}>
                  {product.categoryName}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" />
          </li>
          <li
            aria-current="page"
            className="max-w-[40ch] truncate"
            style={{ color: 'var(--shop-ink)' }}
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ── Two-column hero ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Gallery — portrait-led */}
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Thumbnail rail (vertical on desktop, horizontal on mobile) */}
              {gallery.length > 1 && (
                <div
                  role="tablist"
                  aria-label="Product images"
                  className="order-2 flex shrink-0 gap-3 overflow-x-auto sm:order-1 sm:max-h-[640px] sm:flex-col sm:overflow-y-auto"
                >
                  {gallery.map((src, i) => {
                    const isActive = i === activeImage;
                    return (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`รูปที่ ${i + 1}`}
                        onClick={() => setActiveImage(i)}
                        className="relative shrink-0 overflow-hidden transition"
                        style={{
                          width: 72,
                          aspectRatio: '3 / 4',
                          border: '1px solid var(--shop-border)',
                          outline: isActive ? '2px solid var(--shop-primary)' : 'none',
                          outlineOffset: '-2px',
                          background: 'color-mix(in srgb, var(--shop-primary) 6%, var(--shop-bg))',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Main portrait image */}
              <div className="order-1 flex-1 sm:order-2">
                <div
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: '3 / 4',
                    background:
                      'color-mix(in srgb, var(--shop-primary) 5%, var(--shop-bg))',
                    border: '1px solid var(--shop-border)',
                  }}
                >
                  {gallery[activeImage] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gallery[activeImage]}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PortraitPlaceholder label={product.title} />
                  )}

                  {/* Editorial sale badge */}
                  {hasDiscount && (
                    <div
                      className="absolute left-5 top-5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.32em]"
                      style={{
                        background: 'var(--shop-ink)',
                        color: 'var(--shop-bg)',
                        fontFamily: 'var(--font-kanit)',
                        fontWeight: 600,
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      Sale −{discountPct}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column — info */}
          <div className="lg:col-span-5">
            <p
              className="text-[11px] uppercase tracking-[0.34em]"
              style={{
                color: 'var(--shop-primary)',
                fontFamily: 'var(--font-prompt)',
                fontWeight: 600,
              }}
            >
              {product.categoryName ?? 'The May Collection'}
            </p>
            <h1
              className="mt-3 text-3xl leading-tight sm:text-4xl"
              style={{
                fontFamily: 'var(--font-kanit), var(--font-prompt), system-ui, sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--shop-ink)',
              }}
            >
              {product.title}
            </h1>

            {/* Price block */}
            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span
                className="text-3xl"
                style={{
                  fontFamily: 'var(--font-kanit), var(--font-prompt), system-ui, sans-serif',
                  fontWeight: 700,
                  color: 'var(--shop-ink)',
                  letterSpacing: '-0.01em',
                }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {hasDiscount && (
                <span
                  className="text-lg line-through"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {formatTHB(product.originalPriceTHB as number)}
                </span>
              )}
              {hasDiscount && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-[0.18em]"
                  style={{
                    background:
                      'color-mix(in srgb, var(--shop-primary) 14%, var(--shop-bg))',
                    color: 'var(--shop-primary)',
                    fontWeight: 600,
                  }}
                >
                  ลด {discountPct}%
                </span>
              )}
            </div>

            {/* Description teaser */}
            {product.description && (
              <p
                className="mt-5 text-sm leading-relaxed"
                style={{ color: 'color-mix(in srgb, var(--shop-ink) 78%, transparent)' }}
              >
                {product.description.length > 220
                  ? `${product.description.slice(0, 220).trim()}…`
                  : product.description}
              </p>
            )}

            {/* Divider */}
            <div
              className="my-7 h-px w-12"
              style={{ background: 'var(--shop-primary)' }}
              aria-hidden="true"
            />

            {/* Color variants */}
            {colors.length > 0 && (
              <div className="mb-7">
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="text-[11px] uppercase tracking-[0.28em]"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    สี
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {activeColor ?? colors[0].label}
                  </span>
                </div>
                <div role="radiogroup" aria-label="สี" className="flex flex-wrap gap-3">
                  {colors.map((c) => {
                    const isActive = activeColor === c.label;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        aria-label={c.label}
                        onClick={() => setActiveColor(c.label)}
                        className="relative h-9 w-9 rounded-full transition"
                        style={{
                          background: c.hex,
                          border: '1px solid var(--shop-border)',
                          outline: isActive ? '2px solid var(--shop-primary)' : 'none',
                          outlineOffset: 2,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size table */}
            {sizes.length > 0 && (
              <div className="mb-7">
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="text-[11px] uppercase tracking-[0.28em]"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    ไซส์
                  </span>
                  <a
                    href="#size-guide"
                    className="inline-flex items-center gap-1.5 text-xs underline-offset-4 hover:underline"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    ตารางไซส์
                  </a>
                </div>
                <div role="radiogroup" aria-label="ไซส์" className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const isActive = activeSize === s.label;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setActiveSize(s.label)}
                        className="min-w-[3rem] px-4 py-2.5 text-sm transition"
                        style={{
                          background: isActive ? 'var(--shop-ink)' : 'transparent',
                          color: isActive ? 'var(--shop-bg)' : 'var(--shop-ink)',
                          border: '1px solid',
                          borderColor: isActive
                            ? 'var(--shop-ink)'
                            : 'var(--shop-border)',
                          fontFamily: 'var(--font-prompt)',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty + Add to cart */}
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div
                role="group"
                aria-label="จำนวน"
                className="inline-flex items-stretch"
                style={{ border: '1px solid var(--shop-border)' }}
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3.5 transition hover:opacity-70"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-label="ลดจำนวน"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) => {
                    const next = parseInt(e.target.value, 10);
                    if (Number.isFinite(next) && next > 0) setQty(Math.min(99, next));
                  }}
                  aria-label="จำนวน"
                  className="w-14 bg-transparent text-center text-sm outline-none"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: 'var(--font-prompt)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="px-3.5 transition hover:opacity-70"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={onAddToCart}
                className="inline-flex flex-1 items-center justify-center gap-2 px-6 py-3 text-sm uppercase tracking-[0.22em] transition hover:opacity-90"
                style={{
                  background: 'var(--shop-primary)',
                  color: 'var(--shop-bg)',
                  fontFamily: 'var(--font-prompt)',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                เพิ่มลงตะกร้า
              </button>

              <button
                type="button"
                aria-label="เพิ่มในรายการโปรด"
                className="inline-flex items-center justify-center p-3 transition hover:opacity-70"
                style={{
                  border: '1px solid var(--shop-border)',
                  color: 'var(--shop-ink)',
                }}
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>

            {/* Trust badges */}
            <ul
              className="mt-8 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3"
              role="list"
              aria-label="บริการของร้าน"
              style={{
                color: 'color-mix(in srgb, var(--shop-ink) 82%, transparent)',
              }}
            >
              <li
                className="flex items-center gap-2.5 px-3 py-3"
                style={{
                  background:
                    'color-mix(in srgb, var(--shop-primary) 5%, var(--shop-bg))',
                  border: '1px solid var(--shop-border)',
                }}
              >
                <Truck className="h-4 w-4" style={{ color: 'var(--shop-primary)' }} />
                <span>ส่งฟรีทั่วไทย ฿990+</span>
              </li>
              <li
                className="flex items-center gap-2.5 px-3 py-3"
                style={{
                  background:
                    'color-mix(in srgb, var(--shop-primary) 5%, var(--shop-bg))',
                  border: '1px solid var(--shop-border)',
                }}
              >
                <RotateCcw className="h-4 w-4" style={{ color: 'var(--shop-primary)' }} />
                <span>เปลี่ยนไซส์ใน 14 วัน</span>
              </li>
              <li
                className="flex items-center gap-2.5 px-3 py-3"
                style={{
                  background:
                    'color-mix(in srgb, var(--shop-primary) 5%, var(--shop-bg))',
                  border: '1px solid var(--shop-border)',
                }}
              >
                <ShieldCheck className="h-4 w-4" style={{ color: 'var(--shop-primary)' }} />
                <span>ตัดเย็บประณีตทุกตัว</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Editorial description + size chart ────────────────────── */}
      <section
        className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
        id="product-detail"
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <article className="lg:col-span-7">
            <p
              className="text-[11px] uppercase tracking-[0.34em]"
              style={{ color: 'var(--shop-primary)', fontWeight: 600 }}
            >
              Designer's Note
            </p>
            <h2
              className="mt-3 text-2xl sm:text-3xl"
              style={{
                fontFamily: 'var(--font-kanit), var(--font-prompt), system-ui, sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--shop-ink)',
              }}
            >
              รายละเอียดสินค้า
            </h2>
            <div
              className="prose prose-sm mt-5 max-w-none whitespace-pre-line text-[15px] leading-relaxed"
              style={{
                color: 'color-mix(in srgb, var(--shop-ink) 84%, transparent)',
              }}
            >
              {product.description ?? (
                <p>
                  ชุดแต่ละตัวออกแบบจากสรีระสาวเอเชีย ตัดเย็บอย่างประณีต ผ้าทิ้งตัวสวยและไม่ยับง่าย
                  เหมาะกับการสวมใส่ทุกโอกาส ตั้งแต่ออฟฟิศไปจนถึงดินเนอร์
                </p>
              )}
            </div>
          </article>

          <aside id="size-guide" className="lg:col-span-5">
            <div
              className="p-8"
              style={{
                background: 'color-mix(in srgb, var(--shop-primary) 6%, var(--shop-bg))',
                border: '1px solid var(--shop-border)',
              }}
            >
              <p
                className="text-[11px] uppercase tracking-[0.32em]"
                style={{ color: 'var(--shop-primary)', fontWeight: 600 }}
              >
                Size Guide
              </p>
              <h3
                className="mt-3 text-xl"
                style={{
                  fontFamily: 'var(--font-kanit), var(--font-prompt), system-ui, sans-serif',
                  fontWeight: 700,
                  color: 'var(--shop-ink)',
                }}
              >
                ตารางวัดไซส์
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr
                      className="text-left uppercase tracking-[0.18em]"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      <th className="py-2 pr-2 font-semibold">Size</th>
                      <th className="py-2 px-2 font-semibold">อก (cm)</th>
                      <th className="py-2 px-2 font-semibold">เอว (cm)</th>
                      <th className="py-2 pl-2 font-semibold">สะโพก (cm)</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: 'var(--shop-ink)' }}>
                    {[
                      ['XS', '78', '60', '84'],
                      ['S', '82', '64', '88'],
                      ['M', '86', '68', '92'],
                      ['L', '90', '72', '96'],
                      ['XL', '94', '76', '100'],
                    ].map((row) => (
                      <tr
                        key={row[0]}
                        style={{
                          borderTop: '1px solid var(--shop-border)',
                        }}
                      >
                        <td className="py-2.5 pr-2 font-semibold" style={{ fontFamily: 'var(--font-kanit)' }}>
                          {row[0]}
                        </td>
                        <td className="py-2.5 px-2">{row[1]}</td>
                        <td className="py-2.5 px-2">{row[2]}</td>
                        <td className="py-2.5 pl-2">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p
                className="mt-5 text-[11px] leading-relaxed"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                * แนะนำให้วัดอก/เอว/สะโพกที่กว้างที่สุด ถ้าค่าตกระหว่างไซส์ แนะนำเลือกไซส์ที่ใหญ่กว่า
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Related products ────────────────────────────────────── */}
      {related && related.length > 0 && (
        <section
          className="py-16"
          style={{
            background:
              'color-mix(in srgb, var(--shop-primary) 5%, var(--shop-bg))',
            borderTop: '1px solid var(--shop-border)',
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.34em]"
                  style={{ color: 'var(--shop-primary)', fontWeight: 600 }}
                >
                  You may also love
                </p>
                <h2
                  className="mt-3 text-3xl sm:text-4xl"
                  style={{
                    fontFamily: 'var(--font-kanit), var(--font-prompt), system-ui, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'var(--shop-ink)',
                  }}
                >
                  ชิ้นอื่นที่คุณอาจชอบ
                </h2>
              </div>
              <Link
                href={catalogUrl}
                className="hidden text-sm uppercase tracking-[0.22em] underline-offset-4 hover:underline sm:inline-flex"
                style={{ color: 'var(--shop-primary)' }}
              >
                ดูทั้งหมด →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {related.slice(0, 4).map((r) => {
                const rHasDiscount =
                  r.compareAtPriceTHB != null && r.compareAtPriceTHB > r.priceTHB;
                return (
                  <Link
                    key={r.id}
                    href={`/stores/${store.slug}/products/${r.id}`}
                    className="group block"
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{
                        aspectRatio: '3 / 4',
                        background:
                          'color-mix(in srgb, var(--shop-primary) 6%, var(--shop-bg))',
                        border: '1px solid var(--shop-border)',
                      }}
                    >
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <PortraitPlaceholder />
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      {r.categoryName && (
                        <p
                          className="text-[10px] uppercase tracking-[0.28em]"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {r.categoryName}
                        </p>
                      )}
                      <h3
                        className="mt-1.5 text-sm leading-tight"
                        style={{
                          color: 'var(--shop-ink)',
                          fontFamily: 'var(--font-kanit), var(--font-prompt), system-ui, sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        {r.title}
                      </h3>
                      <div className="mt-1.5 flex items-baseline justify-center gap-2 text-sm">
                        <span style={{ color: 'var(--shop-primary)', fontWeight: 600 }}>
                          {formatTHB(r.priceTHB)}
                        </span>
                        {rHasDiscount && (
                          <span
                            className="text-xs line-through"
                            style={{ color: 'var(--shop-ink-muted)' }}
                          >
                            {formatTHB(r.compareAtPriceTHB as number)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-10 flex justify-center sm:hidden">
              <Link
                href={catalogUrl}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.24em]"
                style={{
                  border: '1px solid var(--shop-primary)',
                  color: 'var(--shop-primary)',
                }}
              >
                ดูทั้งหมด →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default SirinProductDetail;
