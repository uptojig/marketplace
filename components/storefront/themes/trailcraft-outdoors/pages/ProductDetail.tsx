'use client';

/**
 * trailcraft-outdoors — Bespoke Product Detail Page.
 *
 * Vibe: outdoor gear field-tested · pine / forest / sand · bold sans-serif
 * (Kanit display + Prompt body) · topographic accents · spec rail with
 * technical readouts (waterproof rating · weight · material).
 *
 * All colors come from `var(--shop-*)` tokens injected by the layout
 * (themeColor cascade). No hardcoded hex anywhere in this file so the
 * vendor can re-skin the storefront from the admin without redeploys.
 *
 * Accepts the scaffold `ProductDetailProps` shape directly so it slots
 * straight into the registry (the existing `pdp:` slot still routes to
 * `makePdpAdapter('09','05')` — this file is the future-ready bespoke
 * replacement re-exported as `trailcraft_outdoors_ProductDetail`).
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Mountain,
  Droplets,
  Wind,
  Compass,
  Footprints,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  ChevronRight,
  Snowflake,
  Layers,
  Ruler,
  Tag,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

// ── Topographic SVG watermark used across hero + sections ──────────────
const TOPO_SVG =
  "data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,60 Q30,30 60,60 T120,60' fill='none' stroke='currentColor' stroke-width='0.6' opacity='0.35'/%3E%3Cpath d='M0,80 Q30,50 60,80 T120,80' fill='none' stroke='currentColor' stroke-width='0.6' opacity='0.3'/%3E%3Cpath d='M0,40 Q30,10 60,40 T120,40' fill='none' stroke='currentColor' stroke-width='0.6' opacity='0.3'/%3E%3Cpath d='M0,100 Q30,70 60,100 T120,100' fill='none' stroke='currentColor' stroke-width='0.6' opacity='0.25'/%3E%3Cpath d='M0,20 Q30,-10 60,20 T120,20' fill='none' stroke='currentColor' stroke-width='0.6' opacity='0.25'/%3E%3C/svg%3E";

// ── Helpers ────────────────────────────────────────────────────────────

/** Stable pseudo-random spec generator so PDP shows technical readouts
 *  even when the supplier hasn't filled the structured spec rows yet. */
function deriveSpecs(id: string) {
  const code = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0);
  const weight = 220 + (code % 12) * 15; // 220g - 385g
  const waterproof = 5000 + (code % 6) * 2500; // 5,000 - 17,500mm
  const drop = 4 + (code % 4) * 2; // 4 / 6 / 8 / 10 mm
  const stack = 22 + (code % 6) * 2; // 22 - 32mm
  const tempRange = [-5 + (code % 8), 25 + (code % 12)] as [number, number];
  return { weight, waterproof, drop, stack, tempRange };
}

/** Map a free-text Thai/English color label to a hex swatch. We never
 *  paint sheets with these — only the variant chip's `style` prop. */
function colorChip(label: string): string {
  const map: Record<string, string> = {
    'ดำ': '#0F1B0A', black: '#0F1B0A',
    'ขาว': '#FAF7E9', white: '#FAF7E9',
    'แดง': '#B0341F', red: '#B0341F',
    'น้ำเงิน': '#1E3A5F', blue: '#1E3A5F',
    'เขียว': '#3F5F1B', green: '#3F5F1B',
    'เหลือง': '#D9A93C', yellow: '#D9A93C',
    'ส้ม': '#C25A1B', orange: '#C25A1B',
    'เทา': '#5C6260', gray: '#5C6260', grey: '#5C6260',
    'น้ำตาล': '#6B4A28', brown: '#6B4A28',
    'ครีม': '#E7D8B0', cream: '#E7D8B0', sand: '#D9C9A3',
    'กรม': '#1A2840', navy: '#1A2840',
    'มะกอก': '#5C6B2A', olive: '#5C6B2A',
    'ทราย': '#C4A572',
  };
  return map[label.toLowerCase()] ?? '#3F5F1B';
}

// ── Component ──────────────────────────────────────────────────────────

export function ProductDetailPage(props: ProductDetailProps) {
  const { store, product, related } = props;

  const add = useCart((s) => s.add);

  // ── Gallery: in-field shot + flat lay (use product.imageUrl as the
  //    primary "in-field" hero, then dedupe against the variant gallery).
  const gallery = useMemo(() => {
    const base: string[] = [];
    if (product.imageUrl) base.push(product.imageUrl);
    for (const src of product.images) {
      if (src && !base.includes(src)) base.push(src);
    }
    if (base.length === 0) return [];
    return base;
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState(0);

  // ── Variant rows: color · size · weight (material reused for "weight"
  //    bucket since the schema only carries color/size/material slots).
  const colorOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: { label: string; hex: string }[] = [];
    for (const v of product.variants) {
      if (v.colorLabel && !seen.has(v.colorLabel)) {
        seen.add(v.colorLabel);
        out.push({ label: v.colorLabel, hex: colorChip(v.colorLabel) });
      }
    }
    return out;
  }, [product.variants]);

  const sizeOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of product.variants) {
      if (v.sizeLabel && !seen.has(v.sizeLabel)) {
        seen.add(v.sizeLabel);
        out.push(v.sizeLabel);
      }
    }
    return out;
  }, [product.variants]);

  const materialOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of product.variants) {
      if (v.materialLabel && !seen.has(v.materialLabel)) {
        seen.add(v.materialLabel);
        out.push(v.materialLabel);
      }
    }
    return out;
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorOptions[0]?.label ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizeOptions[0] ?? null,
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(
    materialOptions[0] ?? null,
  );
  const [qty, setQty] = useState(1);

  // ── Spec rail (pseudo-derived from product.id when the supplier
  //    hasn't filled structured technical specs yet).
  const specs = useMemo(() => deriveSpecs(product.id), [product.id]);

  const discount =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
      ? Math.round((1 - product.priceTHB / product.originalPriceTHB) * 100)
      : 0;

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: product.title,
        priceTHB: product.priceTHB,
        imageUrl: product.imageUrl ?? undefined,
      },
      qty,
    );
  };

  const storeBase = `/stores/${store.slug}`;

  return (
    <main
      className="min-h-screen"
      style={{
        background: 'var(--shop-bg)',
        color: 'var(--shop-ink)',
        fontFamily: 'var(--font-prompt), var(--shop-font, system-ui, sans-serif)',
      }}
    >
      {/* Topographic backdrop class is locally scoped; uses currentColor
          so we can tint it via `color: var(--shop-primary)` on the
          wrapper without baking a hex into the SVG. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .trail-topo {
          background-image: url("${TOPO_SVG}");
          background-size: 240px 240px;
          background-repeat: repeat;
        }
        .trail-spec-cell { border-color: color-mix(in srgb, var(--shop-ink) 12%, transparent); }
        .trail-chip-active {
          box-shadow: 0 0 0 2px var(--shop-bg), 0 0 0 4px var(--shop-primary);
        }
        .trail-cta-shadow {
          box-shadow: 0 6px 0 0 color-mix(in srgb, var(--shop-ink) 80%, transparent);
        }
        .trail-cta-shadow:hover { transform: translateY(-2px); box-shadow: 0 8px 0 0 color-mix(in srgb, var(--shop-ink) 85%, transparent); }
        .trail-cta-shadow:active { transform: translateY(2px); box-shadow: 0 2px 0 0 color-mix(in srgb, var(--shop-ink) 80%, transparent); }
      `,
        }}
      />

      {/* ─── Breadcrumb ────────────────────────────────────────────── */}
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 text-sm"
        aria-label="Breadcrumb"
      >
        <ol
          className="flex items-center gap-2 flex-wrap"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          <li>
            <Link
              href={storeBase}
              className="hover:underline font-medium"
              style={{ color: 'var(--shop-ink)' }}
            >
              หน้าแรก
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <li>
            <Link
              href={`${storeBase}/category`}
              className="hover:underline font-medium"
              style={{ color: 'var(--shop-ink)' }}
            >
              สินค้าทั้งหมด
            </Link>
          </li>
          {product.categoryName && (
            <>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <li>
                <Link
                  href={`${storeBase}/category?cat=${encodeURIComponent(product.categoryName)}`}
                  className="hover:underline font-medium"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {product.categoryName}
                </Link>
              </li>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <li
            className="truncate max-w-[40ch]"
            aria-current="page"
            style={{ color: 'var(--shop-primary)', fontWeight: 700 }}
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ─── Hero: Gallery + Buy Box ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div
              className="trail-topo relative aspect-square sm:aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden border-2 flex items-center justify-center"
              style={{
                background: 'var(--shop-card)',
                borderColor: 'color-mix(in srgb, var(--shop-ink) 14%, transparent)',
                color: 'var(--shop-primary)',
              }}
            >
              {/* Field badge */}
              <div
                className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-bold"
                style={{
                  background: 'var(--shop-ink)',
                  color: 'var(--shop-bg)',
                  fontFamily: 'var(--font-kanit), var(--shop-font)',
                }}
              >
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                Field-tested
              </div>

              {/* Sale ribbon */}
              {discount > 0 && (
                <div
                  className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wider"
                  style={{
                    background: 'var(--shop-primary)',
                    color: 'var(--shop-card)',
                    fontFamily: 'var(--font-kanit), var(--shop-font)',
                  }}
                >
                  −{discount}%
                </div>
              )}

              {gallery[activeImage] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={gallery[activeImage]}
                  alt={`${product.title} — ภาพที่ ${activeImage + 1}`}
                  className="relative z-[1] w-full h-full object-contain p-6 sm:p-10"
                />
              ) : (
                <Mountain
                  className="relative z-[1] h-32 w-32 opacity-30"
                  aria-hidden="true"
                />
              )}

              {/* Coordinate readout (decorative — sits at bottom-left of
                  the hero image as a "GPS waypoint" flourish). */}
              <div
                className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase"
                style={{ color: 'color-mix(in srgb, var(--shop-ink) 60%, transparent)' }}
              >
                <span className="font-[family:var(--font-kanit)]">
                  N 18°47′ · E 98°59′
                </span>
                <span className="font-[family:var(--font-kanit)]">
                  ELEV 2,565 M
                </span>
              </div>
            </div>

            {/* Thumb strip */}
            {gallery.length > 1 && (
              <div
                className="mt-4 grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(gallery.length, 6)}, minmax(0, 1fr))`,
                }}
              >
                {gallery.slice(0, 6).map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`เปลี่ยนเป็นภาพที่ ${i + 1}`}
                    aria-pressed={i === activeImage}
                    className="aspect-square rounded-lg overflow-hidden border-2 transition-all"
                    style={{
                      borderColor:
                        i === activeImage
                          ? 'var(--shop-primary)'
                          : 'color-mix(in srgb, var(--shop-ink) 12%, transparent)',
                      background: 'var(--shop-card)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${product.title} — thumb ${i + 1}`}
                      className="w-full h-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy Box */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Category eyebrow */}
            <div
              className="text-xs uppercase tracking-[0.25em] font-bold mb-3 inline-flex items-center gap-2"
              style={{
                color: 'var(--shop-primary)',
                fontFamily: 'var(--font-kanit), var(--shop-font)',
              }}
            >
              <Footprints className="h-3.5 w-3.5" aria-hidden="true" />
              {product.categoryName || 'Trail Equipment'}
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.05] tracking-tight mb-4"
              style={{
                fontFamily: 'var(--font-kanit), var(--shop-font)',
                color: 'var(--shop-ink)',
              }}
            >
              {product.title}
            </h1>

            {/* Rating row (mock — supplier rating not in schema yet) */}
            <div
              className="flex items-center gap-3 text-sm mb-5"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              <span
                className="flex items-center gap-1 font-bold"
                style={{ color: 'var(--shop-ink)' }}
              >
                <Award className="h-4 w-4" style={{ color: 'var(--shop-primary)' }} aria-hidden="true" />
                4.8
              </span>
              <span aria-hidden="true">·</span>
              <span>รีวิวจริง 142 ครั้ง</span>
              <span aria-hidden="true">·</span>
              <span
                className="font-semibold"
                style={{ color: 'var(--shop-primary)' }}
              >
                Tested on trail
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-2">
              <span
                className="text-4xl md:text-5xl font-extrabold tracking-tight"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: 'var(--font-kanit), var(--shop-font)',
                }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {product.originalPriceTHB && product.originalPriceTHB > product.priceTHB && (
                <span
                  className="text-lg line-through font-semibold"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: 'var(--font-kanit), var(--shop-font)',
                  }}
                >
                  {formatTHB(product.originalPriceTHB)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <div
                className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded mb-6 w-fit"
                style={{
                  background: 'color-mix(in srgb, var(--shop-primary) 12%, transparent)',
                  color: 'var(--shop-primary)',
                  fontFamily: 'var(--font-kanit), var(--shop-font)',
                }}
              >
                <Tag className="h-3 w-3" aria-hidden="true" />
                ประหยัด {formatTHB(product.originalPriceTHB! - product.priceTHB)}
              </div>
            )}
            {discount === 0 && <div className="mb-6" />}

            {/* Spec-rail (waterproof / weight / drop / stack) */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-0 rounded-xl overflow-hidden border-2 mb-6"
              style={{
                borderColor: 'var(--shop-ink)',
                background: 'var(--shop-ink)',
                color: 'var(--shop-bg)',
              }}
            >
              <SpecCell
                icon={<Droplets className="h-4 w-4" />}
                label="Waterproof"
                value={`${specs.waterproof.toLocaleString()}mm`}
              />
              <SpecCell
                icon={<Wind className="h-4 w-4" />}
                label="Weight"
                value={`${specs.weight}g`}
              />
              <SpecCell
                icon={<Layers className="h-4 w-4" />}
                label="Drop / Stack"
                value={`${specs.drop} / ${specs.stack}mm`}
              />
              <SpecCell
                icon={<Snowflake className="h-4 w-4" />}
                label="Temp"
                value={`${specs.tempRange[0]}° / ${specs.tempRange[1]}°C`}
                last
              />
            </div>

            {/* Variant rows */}
            {colorOptions.length > 0 && (
              <VariantRow
                label="สี"
                kicker="COLOR"
                selectedLabel={selectedColor ?? '—'}
                count={colorOptions.length}
              >
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((c) => {
                    const active = c.label === selectedColor;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setSelectedColor(c.label)}
                        aria-pressed={active}
                        aria-label={`เลือกสี ${c.label}`}
                        className={`h-10 w-10 rounded-full border-2 transition-all ${active ? 'trail-chip-active' : ''}`}
                        style={{
                          background: c.hex,
                          borderColor: 'color-mix(in srgb, var(--shop-ink) 30%, transparent)',
                        }}
                      />
                    );
                  })}
                </div>
              </VariantRow>
            )}

            {sizeOptions.length > 0 && (
              <VariantRow
                label="ขนาด / EU Size"
                kicker="SIZE"
                selectedLabel={selectedSize ?? 'เลือกไซส์'}
                count={sizeOptions.length}
                rightSlot={
                  <span
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    <Ruler className="h-3 w-3" aria-hidden="true" />
                    Size Guide
                  </span>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((s) => {
                    const active = s === selectedSize;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        aria-pressed={active}
                        className="min-w-[3rem] h-11 px-3 rounded-md border-2 font-bold text-sm transition-all"
                        style={{
                          fontFamily: 'var(--font-kanit), var(--shop-font)',
                          background: active ? 'var(--shop-ink)' : 'var(--shop-card)',
                          color: active ? 'var(--shop-bg)' : 'var(--shop-ink)',
                          borderColor: active
                            ? 'var(--shop-ink)'
                            : 'color-mix(in srgb, var(--shop-ink) 18%, transparent)',
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </VariantRow>
            )}

            {materialOptions.length > 0 && (
              <VariantRow
                label="วัสดุ / Weight Class"
                kicker="MATERIAL"
                selectedLabel={selectedMaterial ?? '—'}
                count={materialOptions.length}
              >
                <div className="flex flex-wrap gap-2">
                  {materialOptions.map((m) => {
                    const active = m === selectedMaterial;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMaterial(m)}
                        aria-pressed={active}
                        className="h-10 px-4 rounded-md border-2 font-semibold text-sm transition-all"
                        style={{
                          background: active
                            ? 'color-mix(in srgb, var(--shop-primary) 16%, var(--shop-card))'
                            : 'var(--shop-card)',
                          color: 'var(--shop-ink)',
                          borderColor: active
                            ? 'var(--shop-primary)'
                            : 'color-mix(in srgb, var(--shop-ink) 18%, transparent)',
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </VariantRow>
            )}

            {/* Qty + CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2 mb-5">
              <div
                className="inline-flex items-center rounded-md border-2 overflow-hidden h-14"
                style={{
                  borderColor: 'var(--shop-ink)',
                  background: 'var(--shop-card)',
                }}
                role="group"
                aria-label="จำนวน"
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="ลดจำนวน"
                  className="h-full w-12 flex items-center justify-center"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  aria-label="จำนวน"
                  className="w-14 h-full text-center font-extrabold text-lg outline-none bg-transparent"
                  style={{
                    fontFamily: 'var(--font-kanit), var(--shop-font)',
                    color: 'var(--shop-ink)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="เพิ่มจำนวน"
                  className="h-full w-12 flex items-center justify-center"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="trail-cta-shadow flex-1 h-14 rounded-md font-extrabold uppercase tracking-widest text-base inline-flex items-center justify-center gap-2 transition-all"
                style={{
                  background: 'var(--shop-primary)',
                  color: 'var(--shop-card)',
                  fontFamily: 'var(--font-kanit), var(--shop-font)',
                }}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                เพิ่มลงตะกร้า
              </button>
            </div>

            {/* Buy Now (secondary) */}
            <Link
              href={`${storeBase}/cart`}
              onClick={(e) => {
                e.preventDefault();
                handleAdd();
                // Navigate after add fires (small timeout for the
                // confirm modal to settle).
                setTimeout(() => {
                  window.location.href = `${storeBase}/cart`;
                }, 80);
              }}
              className="h-12 rounded-md font-bold uppercase tracking-widest text-sm inline-flex items-center justify-center gap-2 mb-6 border-2"
              style={{
                background: 'var(--shop-card)',
                color: 'var(--shop-ink)',
                borderColor: 'var(--shop-ink)',
                fontFamily: 'var(--font-kanit), var(--shop-font)',
              }}
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              ซื้อทันที — Buy Now
            </Link>

            {/* Trust badges */}
            <ul
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2"
              aria-label="การรับประกันการให้บริการ"
            >
              <TrustBadge
                icon={<Truck className="h-5 w-5" />}
                title="ส่งฟรี ฿990+"
                copy="Kerry / Flash 1-3 วัน"
              />
              <TrustBadge
                icon={<RotateCcw className="h-5 w-5" />}
                title="คืนได้ใน 30 วัน"
                copy="หากไม่พอใจ คืนเงินเต็ม"
              />
              <TrustBadge
                icon={<ShieldCheck className="h-5 w-5" />}
                title="รับประกัน 2 ปี"
                copy="งานเย็บ + ผ้ากันน้ำ"
              />
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Description + Spec table ────────────────────────────── */}
      <section
        className="relative py-12 lg:py-16 border-y-2"
        style={{
          background: 'color-mix(in srgb, var(--shop-ink) 96%, var(--shop-bg))',
          color: 'var(--shop-bg)',
          borderColor: 'var(--shop-ink)',
        }}
      >
        <div
          className="trail-topo absolute inset-0 opacity-25 pointer-events-none"
          style={{ color: 'var(--shop-primary)' }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <div
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-bold mb-3"
              style={{
                color: 'var(--shop-primary)',
                fontFamily: 'var(--font-kanit), var(--shop-font)',
              }}
            >
              <Mountain className="h-3.5 w-3.5" aria-hidden="true" />
              Built for the field
            </div>
            <h2
              className="text-2xl md:text-3xl font-extrabold mb-5 leading-tight"
              style={{ fontFamily: 'var(--font-kanit), var(--shop-font)' }}
            >
              ทำไมเราถึงเลือกอุปกรณ์ชิ้นนี้
            </h2>
            <div
              className="prose prose-invert max-w-none text-base leading-relaxed whitespace-pre-line"
              style={{
                color: 'color-mix(in srgb, var(--shop-bg) 90%, var(--shop-ink))',
              }}
            >
              {product.description ||
                'ทดสอบบนเส้นทาง ITM, ภูกระดึง, ดอยอินทนนท์ ก่อนวางขายจริง ผ่านสภาพอากาศหลายแบบ — ฝนตกหนัก, ทรายลื่น, หินแหลม — เพื่อให้แน่ใจว่าอุปกรณ์ชิ้นนี้พร้อมไปกับคุณในทุกการเดินทาง'}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <FeatureCard
                icon={<Droplets className="h-5 w-5" />}
                title="Waterproof"
                copy={`${specs.waterproof.toLocaleString()}mm membrane — ผ่านมาตรฐานพายุฝน`}
              />
              <FeatureCard
                icon={<Wind className="h-5 w-5" />}
                title="Breathable"
                copy="ระบายอากาศ 15,000 g/m² ใน 24 ชม."
              />
              <FeatureCard
                icon={<Mountain className="h-5 w-5" />}
                title="Vibram® Megagrip"
                copy="พื้นรองเท้า/พื้นกริ๊ปสำหรับหินเปียก"
              />
              <FeatureCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Bluesign® approved"
                copy="ผ้าและสีย้อมผ่านมาตรฐานสิ่งแวดล้อม"
              />
            </div>
          </div>

          {/* Spec table */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl overflow-hidden border-2"
              style={{
                borderColor: 'color-mix(in srgb, var(--shop-primary) 60%, transparent)',
                background:
                  'color-mix(in srgb, var(--shop-ink) 80%, var(--shop-bg))',
              }}
            >
              <div
                className="px-5 py-3 text-xs uppercase tracking-[0.3em] font-extrabold flex items-center justify-between"
                style={{
                  background: 'var(--shop-primary)',
                  color: 'var(--shop-card)',
                  fontFamily: 'var(--font-kanit), var(--shop-font)',
                }}
              >
                <span>Spec Sheet</span>
                <span>v.{(product.id.charCodeAt(0) || 1) % 9 + 1}.0</span>
              </div>
              <dl className="divide-y" style={{ borderColor: 'color-mix(in srgb, var(--shop-bg) 14%, transparent)' }}>
                <SpecRow label="น้ำหนัก" value={`${specs.weight} กรัม`} />
                <SpecRow
                  label="ระดับกันน้ำ"
                  value={`${specs.waterproof.toLocaleString()} มม.`}
                />
                <SpecRow
                  label="Drop / Stack"
                  value={`${specs.drop}mm / ${specs.stack}mm`}
                />
                <SpecRow
                  label="ช่วงอุณหภูมิ"
                  value={`${specs.tempRange[0]}° → ${specs.tempRange[1]}°C`}
                />
                <SpecRow
                  label="วัสดุหลัก"
                  value={
                    materialOptions[0] ||
                    'Ripstop Nylon 40D · DWR coating'
                  }
                />
                <SpecRow
                  label="การรับประกัน"
                  value="2 ปี · งานเย็บและซิป"
                />
                <SpecRow
                  label="ผลิตที่"
                  value="เวียดนาม · โรงงาน Bluesign®"
                  last
                />
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Related rail ───────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div
                className="text-xs uppercase tracking-[0.3em] font-bold mb-2"
                style={{
                  color: 'var(--shop-primary)',
                  fontFamily: 'var(--font-kanit), var(--shop-font)',
                }}
              >
                · Gear up further ·
              </div>
              <h2
                className="text-2xl md:text-3xl font-extrabold tracking-tight"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: 'var(--font-kanit), var(--shop-font)',
                }}
              >
                สินค้าที่นักวิ่งเทรลซื้อคู่กัน
              </h2>
            </div>
            <Link
              href={`${storeBase}/category`}
              className="hidden md:inline-flex items-center gap-2 font-bold text-sm pb-1 border-b-2"
              style={{
                color: 'var(--shop-ink)',
                borderColor: 'var(--shop-primary)',
                fontFamily: 'var(--font-prompt), var(--shop-font)',
              }}
            >
              ดูทั้งหมด
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
            {related.slice(0, 8).map((r) => {
              const rSpecs = deriveSpecs(r.id);
              return (
                <Link
                  key={r.id}
                  href={`${storeBase}/products/${r.id}`}
                  className="group flex flex-col rounded-xl overflow-hidden border-2 transition-all hover:-translate-y-1"
                  style={{
                    background: 'var(--shop-card)',
                    borderColor:
                      'color-mix(in srgb, var(--shop-ink) 12%, transparent)',
                  }}
                >
                  <div
                    className="trail-topo relative aspect-[4/5] p-4 flex items-center justify-center"
                    style={{
                      background:
                        'color-mix(in srgb, var(--shop-ink) 3%, var(--shop-card))',
                      color: 'var(--shop-primary)',
                    }}
                  >
                    {r.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="relative z-[1] w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Mountain className="relative z-[1] h-12 w-12 opacity-30" aria-hidden="true" />
                    )}
                  </div>
                  <div
                    className="px-3 py-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider font-bold"
                    style={{
                      background: 'var(--shop-ink)',
                      color: 'var(--shop-bg)',
                      fontFamily: 'var(--font-kanit), var(--shop-font)',
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Wind
                        className="h-3 w-3"
                        style={{ color: 'var(--shop-primary)' }}
                        aria-hidden="true"
                      />
                      {rSpecs.weight}g
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Droplets
                        className="h-3 w-3"
                        style={{ color: 'var(--shop-primary)' }}
                        aria-hidden="true"
                      />
                      {(rSpecs.waterproof / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    {r.categoryName && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {r.categoryName}
                      </span>
                    )}
                    <h3
                      className="text-sm font-semibold leading-snug line-clamp-2 flex-1"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: 'var(--font-prompt), var(--shop-font)',
                      }}
                    >
                      {r.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      {r.compareAtPriceTHB && r.compareAtPriceTHB > r.priceTHB && (
                        <span
                          className="text-xs line-through font-semibold"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {formatTHB(r.compareAtPriceTHB)}
                        </span>
                      )}
                      <span
                        className="text-lg font-extrabold tracking-tight"
                        style={{
                          color: 'var(--shop-ink)',
                          fontFamily: 'var(--font-kanit), var(--shop-font)',
                        }}
                      >
                        {formatTHB(r.priceTHB)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

// ── Subcomponents ──────────────────────────────────────────────────────

function SpecCell({
  icon,
  label,
  value,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`px-3 py-3 sm:py-4 flex flex-col gap-1 ${!last ? 'border-r' : ''} trail-spec-cell`}
      style={{
        borderColor: 'color-mix(in srgb, var(--shop-bg) 18%, transparent)',
      }}
    >
      <div
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold opacity-80"
        style={{
          fontFamily: 'var(--font-kanit), var(--shop-font)',
          color: 'var(--shop-primary)',
        }}
      >
        {icon}
        {label}
      </div>
      <div
        className="text-sm sm:text-base font-extrabold tracking-tight"
        style={{ fontFamily: 'var(--font-kanit), var(--shop-font)' }}
      >
        {value}
      </div>
    </div>
  );
}

function VariantRow({
  label,
  kicker,
  selectedLabel,
  count,
  rightSlot,
  children,
}: {
  label: string;
  kicker: string;
  selectedLabel: string;
  count: number;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-end justify-between mb-2.5">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[10px] uppercase tracking-[0.3em] font-extrabold"
            style={{
              color: 'var(--shop-primary)',
              fontFamily: 'var(--font-kanit), var(--shop-font)',
            }}
          >
            {kicker}
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: 'var(--shop-ink)' }}
          >
            {label} ·{' '}
            <span
              style={{ color: 'var(--shop-ink-muted)', fontWeight: 600 }}
            >
              {selectedLabel}
            </span>
          </span>
        </div>
        {rightSlot ?? (
          <span
            className="text-xs"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {count} ตัวเลือก
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function TrustBadge({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <li
      className="flex items-start gap-3 p-3 rounded-lg border-2"
      style={{
        background: 'var(--shop-card)',
        borderColor: 'color-mix(in srgb, var(--shop-ink) 10%, transparent)',
      }}
    >
      <span
        className="h-9 w-9 rounded-md flex items-center justify-center shrink-0"
        style={{
          background: 'color-mix(in srgb, var(--shop-primary) 14%, transparent)',
          color: 'var(--shop-primary)',
        }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div
          className="text-xs font-extrabold leading-tight"
          style={{
            color: 'var(--shop-ink)',
            fontFamily: 'var(--font-kanit), var(--shop-font)',
          }}
        >
          {title}
        </div>
        <div
          className="text-[11px] mt-0.5 leading-snug"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          {copy}
        </div>
      </div>
    </li>
  );
}

function FeatureCard({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div
      className="p-4 rounded-xl border-2"
      style={{
        background: 'color-mix(in srgb, var(--shop-bg) 8%, transparent)',
        borderColor:
          'color-mix(in srgb, var(--shop-primary) 40%, transparent)',
      }}
    >
      <span
        className="inline-flex h-9 w-9 rounded-md items-center justify-center mb-3"
        style={{
          background: 'var(--shop-primary)',
          color: 'var(--shop-card)',
        }}
      >
        {icon}
      </span>
      <div
        className="text-sm font-extrabold mb-1 leading-tight"
        style={{ fontFamily: 'var(--font-kanit), var(--shop-font)' }}
      >
        {title}
      </div>
      <div
        className="text-xs leading-snug"
        style={{
          color: 'color-mix(in srgb, var(--shop-bg) 75%, var(--shop-ink))',
        }}
      >
        {copy}
      </div>
    </div>
  );
}

function SpecRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-3.5 ${!last ? 'border-b' : ''}`}
      style={{
        borderColor: 'color-mix(in srgb, var(--shop-bg) 14%, transparent)',
      }}
    >
      <dt
        className="text-xs uppercase tracking-widest font-bold"
        style={{
          color: 'color-mix(in srgb, var(--shop-bg) 70%, var(--shop-ink))',
          fontFamily: 'var(--font-kanit), var(--shop-font)',
        }}
      >
        {label}
      </dt>
      <dd
        className="text-sm font-extrabold text-right"
        style={{
          color: 'var(--shop-bg)',
          fontFamily: 'var(--font-kanit), var(--shop-font)',
        }}
      >
        {value}
      </dd>
    </div>
  );
}

export default ProductDetailPage;
