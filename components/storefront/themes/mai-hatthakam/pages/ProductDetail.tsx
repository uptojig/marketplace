'use client';

/**
 * mai-hatthakam — bespoke PDP for a Thai handicraft / ceramic studio.
 *
 * Vibe: artisan workshop · burnt umber · cream paper · serif headlines
 * with Thai display font · cultural pattern accents (lai-thai-inspired
 * SVG borders) · golden trim. The kiln on the homepage tells the brand
 * story; the PDP brings that artisan voice into the buy moment.
 *
 * Strict color discipline: this template touches NO hex codes — every
 * tone is derived from `--shop-*` via `color-mix(...)`. The chrome
 * (Header/Footer) still ships its own legacy hex palette and will be
 * upgraded in a future pass; the body lives entirely on shop tokens
 * so a future palette swap in seed-ui-config flows through.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Hand,
  Leaf,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Award,
  Sparkles,
  ChevronRight,
  Heart,
  Share2,
} from 'lucide-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────
// Cultural pattern accent — a hand-drawn lai-thai-inspired flourish
// rendered with `currentColor` so we can recolor by wrapping text-*
// utilities or var(--shop-*) on the parent.
// ─────────────────────────────────────────────────────────────────────
function LaiThaiDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 24"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={className}
    >
      <g fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round">
        <path d="M0 12 L160 12" />
        <path d="M240 12 L400 12" />
        <path d="M200 4 C 188 4, 184 10, 184 12 C 184 14, 188 20, 200 20 C 212 20, 216 14, 216 12 C 216 10, 212 4, 200 4 Z" />
        <path d="M196 8 C 194 8, 192 10, 192 12 C 192 14, 194 16, 196 16" />
        <path d="M204 8 C 206 8, 208 10, 208 12 C 208 14, 206 16, 204 16" />
        <circle cx="200" cy="12" r="1.5" fill="currentColor" />
        <path d="M170 12 C 174 8, 178 8, 182 12" />
        <path d="M218 12 C 222 8, 226 8, 230 12" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Description paragraphs: split user-provided description on blank
// lines, fall back to artisan / technique / region notes so the page
// always tells a craft story even when DB description is short.
// ─────────────────────────────────────────────────────────────────────
function splitDescription(description: string | null | undefined): string[] {
  if (!description) return [];
  return description
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────
// Variant attribute helpers — group variant rows into color vs size
// rows so the picker can render two distinct selectors when the data
// is available.
// ─────────────────────────────────────────────────────────────────────
type VariantRow = ProductDetailProps['product']['variants'][number];

function uniqueLabels(
  variants: VariantRow[],
  key: 'colorLabel' | 'sizeLabel',
): string[] {
  const set = new Set<string>();
  variants.forEach((v) => {
    const label = v[key];
    if (label) set.add(label);
  });
  return Array.from(set);
}

// ─────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────
function MaiHatthakamProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;
  const router = useRouter();
  const add = useCart((s) => s.add);

  // Gallery: dedupe imageUrl + images, fall back to placeholder rule
  // (no hex placeholder URL — we render an inline illustrative panel).
  const gallery = useMemo(() => {
    const all = [product.imageUrl, ...product.images].filter(
      (u): u is string => !!u && u.length > 0,
    );
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const colorLabels = useMemo(
    () => uniqueLabels(product.variants, 'colorLabel'),
    [product.variants],
  );
  const sizeLabels = useMemo(
    () => uniqueLabels(product.variants, 'sizeLabel'),
    [product.variants],
  );

  // Default-select the first option so picker reads as "active" on
  // load (matches the rest of the marketplace UX).
  useEffect(() => {
    if (colorLabels.length > 0 && !selectedColor) setSelectedColor(colorLabels[0]);
    if (sizeLabels.length > 0 && !selectedSize) setSelectedSize(sizeLabels[0]);
  }, [colorLabels, sizeLabels, selectedColor, selectedSize]);

  const descriptionParagraphs = splitDescription(product.description);

  const savings =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
      ? product.originalPriceTHB - product.priceTHB
      : 0;
  const savingsPct =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
      ? Math.round(
          ((product.originalPriceTHB - product.priceTHB) /
            product.originalPriceTHB) *
            100,
        )
      : 0;

  const inStock =
    product.stockLeft === null || product.stockLeft === undefined
      ? true
      : product.stockLeft > 0;

  const handleAddToCart = () => {
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
    handleAddToCart();
    router.push(`/stores/${store.slug}/checkout`);
  };

  // ───────────────────────────────────────────────────────────────────
  // STYLES — kept inline so this PDP needs no global CSS additions.
  // All tones derive from --shop-* tokens via color-mix.
  // ───────────────────────────────────────────────────────────────────
  const paperBg =
    'color-mix(in srgb, var(--shop-bg) 92%, var(--shop-ink))';
  const warmCard =
    'color-mix(in srgb, var(--shop-card) 88%, var(--shop-primary))';
  const goldTrim =
    'color-mix(in srgb, var(--shop-accent) 65%, var(--shop-ink))';
  const deepInk =
    'color-mix(in srgb, var(--shop-ink) 85%, var(--shop-primary))';

  return (
    <main
      className="min-h-screen"
      style={{
        background: `var(--shop-bg)`,
        color: 'var(--shop-ink)',
        fontFamily: 'var(--shop-font)',
      }}
    >
      {/* ─── Decorative paper-texture top band ─────────────────────── */}
      <div
        aria-hidden="true"
        className="w-full h-2"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            color-mix(in srgb, var(--shop-primary) 55%, var(--shop-bg)) 0 12px,
            color-mix(in srgb, var(--shop-accent) 40%, var(--shop-bg)) 12px 24px
          )`,
        }}
      />

      {/* ─── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center text-sm flex-wrap gap-y-1"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          <Link
            href={`/stores/${store.slug}`}
            className="hover:underline transition-colors"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            หน้าแรก
          </Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 opacity-60" aria-hidden="true" />
          <Link
            href={`/stores/${store.slug}/c/all`}
            className="hover:underline transition-colors"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            ผลงานทั้งหมด
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight
                className="w-3.5 h-3.5 mx-2 opacity-60"
                aria-hidden="true"
              />
              <span style={{ color: 'var(--shop-ink-muted)' }}>
                {product.categoryName}
              </span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 mx-2 opacity-60" aria-hidden="true" />
          <span
            className="truncate max-w-[180px] sm:max-w-xs"
            style={{ color: 'var(--shop-ink)', fontWeight: 500 }}
          >
            {product.title}
          </span>
        </nav>
      </div>

      {/* ─── Main grid: gallery + buy box ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16">
          {/* ───────── GALLERY ───────── */}
          <div>
            {/* Main image card with subtle craft-paper edge */}
            <div
              className="relative aspect-square overflow-hidden rounded-sm"
              style={{
                background: warmCard,
                border: `1px solid color-mix(in srgb, var(--shop-primary) 22%, var(--shop-border))`,
                boxShadow: `0 24px 48px -28px color-mix(in srgb, var(--shop-ink) 35%, transparent)`,
              }}
            >
              {gallery.length > 0 ? (
                <img
                  src={gallery[activeImage] ?? gallery[0]}
                  alt={`${product.title} — รูปที่ ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-3"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  <Flame className="w-14 h-14 opacity-30" aria-hidden="true" />
                  <span className="text-xs tracking-widest uppercase">
                    No Image
                  </span>
                </div>
              )}

              {/* "Handmade in Thailand" stamp — corner ribbon */}
              <div
                className="absolute top-4 left-4 px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold rounded-sm flex items-center gap-1.5"
                style={{
                  background: `color-mix(in srgb, var(--shop-primary) 92%, var(--shop-ink))`,
                  color: 'var(--shop-bg)',
                  letterSpacing: '0.18em',
                }}
              >
                <Hand className="w-3 h-3" aria-hidden="true" />
                Handmade
              </div>

              {/* Artisan signature watermark */}
              <div
                className="absolute bottom-4 right-4 text-[11px] italic"
                style={{
                  color: 'var(--shop-bg)',
                  textShadow: `0 1px 4px color-mix(in srgb, var(--shop-ink) 60%, transparent)`,
                  fontFamily: 'var(--shop-font-display)',
                }}
              >
                Mai H. · เชียงราย
              </div>
            </div>

            {/* Thumbnail rail */}
            {gallery.length > 1 && (
              <div
                className="mt-4 grid grid-cols-5 gap-3"
                role="tablist"
                aria-label="แกลเลอรีรูปสินค้า"
              >
                {gallery.slice(0, 5).map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    role="tab"
                    aria-selected={idx === activeImage}
                    aria-label={`รูปที่ ${idx + 1}`}
                    onClick={() => setActiveImage(idx)}
                    className="aspect-square overflow-hidden rounded-sm transition-all"
                    style={{
                      border: `1.5px solid ${
                        idx === activeImage
                          ? 'var(--shop-primary)'
                          : 'var(--shop-border)'
                      }`,
                      opacity: idx === activeImage ? 1 : 0.78,
                      background: warmCard,
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.title} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Provenance card — "From the kiln" */}
            <div
              className="mt-6 p-5 rounded-sm flex items-start gap-4"
              style={{
                background: paperBg,
                border: `1px dashed color-mix(in srgb, var(--shop-primary) 35%, var(--shop-border))`,
              }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, var(--shop-primary) 18%, var(--shop-bg))`,
                  color: 'var(--shop-primary)',
                }}
              >
                <Flame className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-sm leading-relaxed">
                <p
                  className="font-medium mb-1"
                  style={{ color: deepInk }}
                >
                  จากเตาเผาที่เชียงราย · เผาไฟสูง 1,250°C
                </p>
                <p style={{ color: 'var(--shop-ink-muted)' }}>
                  ปั้นมือจากดินแม่ขมิ้น · เคลือบขี้เถ้าแกลบข้าวเหนียว ·
                  ทุกชิ้นแตกต่างกัน เป็นเอกลักษณ์ของไฟ
                </p>
              </div>
            </div>
          </div>

          {/* ───────── BUY BOX ───────── */}
          <div className="flex flex-col">
            {/* Category kicker */}
            <div
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] mb-3"
              style={{ color: goldTrim }}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{product.categoryName ?? 'งานหัตถกรรมไทย'}</span>
            </div>

            {/* Title — serif Thai display */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl leading-tight mb-3"
              style={{
                fontFamily: 'var(--shop-font-display)',
                color: 'var(--shop-ink)',
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}
            >
              {product.title}
            </h1>

            {/* Lai-thai divider */}
            <div
              className="mt-1 mb-5"
              style={{ color: goldTrim }}
              aria-hidden="true"
            >
              <LaiThaiDivider className="w-32 h-4" />
            </div>

            {/* Price line */}
            <div className="flex items-baseline gap-3 flex-wrap mb-2">
              <span
                className="text-3xl sm:text-4xl font-semibold"
                style={{ color: 'var(--shop-primary)' }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {product.originalPriceTHB &&
                product.originalPriceTHB > product.priceTHB && (
                  <>
                    <span
                      className="text-lg line-through"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {formatTHB(product.originalPriceTHB)}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-sm font-semibold"
                      style={{
                        background: `color-mix(in srgb, var(--shop-accent) 22%, var(--shop-bg))`,
                        color: goldTrim,
                      }}
                    >
                      ประหยัด {savingsPct}% · {formatTHB(savings)}
                    </span>
                  </>
                )}
            </div>
            <p
              className="text-xs mb-6"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              ราคารวม VAT · ไม่รวมค่าจัดส่ง
            </p>

            {/* Stock signal */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              <span
                aria-hidden="true"
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background: inStock
                    ? `color-mix(in srgb, var(--shop-accent) 80%, var(--shop-ink))`
                    : `color-mix(in srgb, var(--shop-ink) 30%, var(--shop-bg))`,
                }}
              />
              {inStock ? (
                <span style={{ color: deepInk, fontWeight: 500 }}>
                  พร้อมส่ง
                  {typeof product.stockLeft === 'number' && product.stockLeft <= 5
                    ? ` · เหลือเพียง ${product.stockLeft} ชิ้นในล็อตนี้`
                    : ' · จัดส่งจากสตูดิโอภายใน 2–3 วันทำการ'}
                </span>
              ) : (
                <span style={{ color: 'var(--shop-ink-muted)' }}>
                  ล็อตนี้ขายหมดแล้ว · เปิดรับจองล็อตถัดไป
                </span>
              )}
            </div>

            {/* Color variants */}
            {colorLabels.length > 0 && (
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <span
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    เฉดสี
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: deepInk, fontWeight: 500 }}
                  >
                    {selectedColor}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorLabels.map((label) => {
                    const active = label === selectedColor;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedColor(label)}
                        aria-pressed={active}
                        className="px-4 py-2 text-sm rounded-sm transition-all"
                        style={{
                          background: active
                            ? `color-mix(in srgb, var(--shop-primary) 92%, var(--shop-ink))`
                            : 'var(--shop-card)',
                          color: active
                            ? 'var(--shop-bg)'
                            : 'var(--shop-ink)',
                          border: `1px solid ${
                            active
                              ? 'var(--shop-primary)'
                              : 'var(--shop-border)'
                          }`,
                          fontFamily: 'var(--shop-font)',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size variants */}
            {sizeLabels.length > 0 && (
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    ขนาด
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: deepInk, fontWeight: 500 }}
                  >
                    {selectedSize}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeLabels.map((label) => {
                    const active = label === selectedSize;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedSize(label)}
                        aria-pressed={active}
                        className="min-w-[3rem] px-4 py-2 text-sm rounded-sm transition-all"
                        style={{
                          background: active
                            ? `color-mix(in srgb, var(--shop-primary) 92%, var(--shop-ink))`
                            : 'var(--shop-card)',
                          color: active
                            ? 'var(--shop-bg)'
                            : 'var(--shop-ink)',
                          border: `1px solid ${
                            active
                              ? 'var(--shop-primary)'
                              : 'var(--shop-border)'
                          }`,
                          fontFamily: 'var(--shop-font)',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty + CTAs */}
            <div className="flex items-stretch gap-3 mb-4">
              <div
                className="flex items-center rounded-sm overflow-hidden"
                style={{
                  border: `1px solid var(--shop-border)`,
                  background: 'var(--shop-card)',
                }}
                role="group"
                aria-label="จำนวน"
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="ลดจำนวน"
                  className="px-3 py-3 transition-colors"
                  style={{ color: 'var(--shop-ink)' }}
                  disabled={qty <= 1}
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="w-12 text-center bg-transparent outline-none text-base"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-label="จำนวน"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="เพิ่มจำนวน"
                  className="px-3 py-3 transition-colors"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-medium rounded-sm transition-all"
                style={{
                  background: 'var(--shop-card)',
                  border: `1.5px solid var(--shop-primary)`,
                  color: 'var(--shop-primary)',
                  opacity: inStock ? 1 : 0.5,
                  cursor: inStock ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--shop-font)',
                }}
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                เพิ่มลงตะกร้า
              </button>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium rounded-sm transition-all mb-5"
              style={{
                background: `color-mix(in srgb, var(--shop-primary) 95%, var(--shop-ink))`,
                color: 'var(--shop-bg)',
                opacity: inStock ? 1 : 0.5,
                cursor: inStock ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--shop-font)',
                boxShadow: `0 10px 24px -16px color-mix(in srgb, var(--shop-primary) 70%, transparent)`,
              }}
            >
              ซื้อเลย
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Secondary actions */}
            <div className="flex items-center gap-5 mb-6 text-sm">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 transition-colors hover:underline"
                style={{ color: 'var(--shop-ink-muted)' }}
                aria-label="บันทึกลง wishlist"
              >
                <Heart className="w-4 h-4" aria-hidden="true" />
                บันทึก
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 transition-colors hover:underline"
                style={{ color: 'var(--shop-ink-muted)' }}
                aria-label="แชร์สินค้า"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                แชร์
              </button>
            </div>

            {/* Trust badges — handmade · OTOP · kiln-fired */}
            <div
              className="grid grid-cols-3 gap-3 p-4 rounded-sm"
              style={{
                background: warmCard,
                border: `1px solid color-mix(in srgb, var(--shop-primary) 15%, var(--shop-border))`,
              }}
            >
              <TrustBadge
                icon={<Hand className="w-5 h-5" aria-hidden="true" />}
                label="Handmade in Thailand"
                sub="ทำมือทุกขั้นตอน"
                accent={goldTrim}
              />
              <TrustBadge
                icon={<Award className="w-5 h-5" aria-hidden="true" />}
                label="OTOP"
                sub="ผลิตภัณฑ์ชุมชน"
                accent={goldTrim}
              />
              <TrustBadge
                icon={<Truck className="w-5 h-5" aria-hidden="true" />}
                label="ส่งฟรี ฿1,500+"
                sub="แพ็คฟางข้าวกันแตก"
                accent={goldTrim}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Artisan story — technique / region / care ──────────────── */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{
          background: `color-mix(in srgb, var(--shop-ink) 88%, var(--shop-primary))`,
          color: 'var(--shop-bg)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="inline-block text-xs uppercase tracking-[0.3em] mb-3"
              style={{ color: goldTrim }}
            >
              The Process
            </span>
            <h2
              className="text-3xl sm:text-4xl font-medium mb-4"
              style={{ fontFamily: 'var(--shop-font-display)' }}
            >
              เรื่องราวเบื้องหลังชิ้นงาน
            </h2>
            <div
              className="flex justify-center"
              style={{ color: goldTrim }}
              aria-hidden="true"
            >
              <LaiThaiDivider className="w-48 h-4" />
            </div>
          </div>

          {descriptionParagraphs.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-5 text-base sm:text-lg leading-relaxed font-light">
              {descriptionParagraphs.map((p, i) => (
                <p
                  key={i}
                  style={{
                    color: `color-mix(in srgb, var(--shop-bg) 86%, var(--shop-accent))`,
                  }}
                >
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5 text-base sm:text-lg leading-relaxed font-light">
              <p
                style={{
                  color: `color-mix(in srgb, var(--shop-bg) 86%, var(--shop-accent))`,
                }}
              >
                ทุกใบขึ้นรูปด้วยแป้นหมุนทีละชิ้น ปล่อยให้รอยมือของช่างปั้นเป็นส่วนหนึ่งของผิวเซรามิก
                ก่อนนำเข้าเตาฟืนที่อุณหภูมิ 1,250°C ในเชียงราย
              </p>
              <p
                style={{
                  color: `color-mix(in srgb, var(--shop-bg) 86%, var(--shop-accent))`,
                }}
              >
                น้ำเคลือบทำเองจากขี้เถ้าแกลบข้าวเหนียวและไม้ฟืนท้องถิ่น
                ทำให้เกิดสีและลวดลายที่คาดเดาไม่ได้ — แต่ละชิ้นจึงมีเพียงใบเดียวในโลก
              </p>
            </div>
          )}

          {/* Technique / region / care chips */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <StoryCard
              icon={<Hand className="w-6 h-6" aria-hidden="true" />}
              title="เทคนิค"
              body="ขึ้นรูปด้วยแป้นหมุน · เคลือบใส · เผาออกซิเดชั่น"
              accent={goldTrim}
            />
            <StoryCard
              icon={<MapPin className="w-6 h-6" aria-hidden="true" />}
              title="แหล่งกำเนิด"
              body="สตูดิโอเชียงราย · ดินแม่ขมิ้น · ฟืนไม้ลำไย"
              accent={goldTrim}
            />
            <StoryCard
              icon={<Leaf className="w-6 h-6" aria-hidden="true" />}
              title="การดูแล"
              body="ล้างมือด้วยน้ำอุ่น · ไม่แช่ทิ้ง · หลีกเลี่ยงเตาไมโครเวฟ"
              accent={goldTrim}
            />
          </div>
        </div>
      </section>

      {/* ─── Related products rail ──────────────────────────────────── */}
      {related && related.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
              <div>
                <span
                  className="inline-block text-xs uppercase tracking-[0.22em] mb-2"
                  style={{ color: goldTrim }}
                >
                  จากเตาเผาเดียวกัน
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-medium"
                  style={{
                    fontFamily: 'var(--shop-font-display)',
                    color: deepInk,
                  }}
                >
                  ผลงานชิ้นอื่นในล็อตนี้
                </h2>
              </div>
              <Link
                href={`/stores/${store.slug}/c/all`}
                className="text-sm inline-flex items-center gap-1 hover:underline"
                style={{ color: 'var(--shop-primary)' }}
              >
                ดูทั้งหมด
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {related.slice(0, 8).map((r) => (
                <Link
                  key={r.id}
                  href={`/stores/${store.slug}/p/${r.id}`}
                  className="group flex flex-col"
                >
                  <div
                    className="relative aspect-[4/5] overflow-hidden rounded-sm mb-3"
                    style={{
                      background: warmCard,
                      border: `1px solid var(--shop-border)`,
                    }}
                  >
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        <Flame className="w-10 h-10 opacity-40" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <h3
                    className="text-sm sm:text-base font-medium line-clamp-1 mb-1 transition-colors group-hover:underline"
                    style={{ color: deepInk }}
                  >
                    {r.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      {formatTHB(r.priceTHB)}
                    </span>
                    {r.compareAtPriceTHB &&
                      r.compareAtPriceTHB > r.priceTHB && (
                        <span
                          className="text-xs line-through"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {formatTHB(r.compareAtPriceTHB)}
                        </span>
                      )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Visit-studio CTA ───────────────────────────────────────── */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{
          background: `color-mix(in srgb, var(--shop-accent) 14%, var(--shop-bg))`,
          borderTop: `1px solid color-mix(in srgb, var(--shop-primary) 18%, var(--shop-border))`,
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <MapPin
            className="w-9 h-9 mx-auto mb-4"
            style={{ color: 'var(--shop-primary)' }}
            aria-hidden="true"
          />
          <h2
            className="text-2xl sm:text-3xl font-medium mb-3"
            style={{
              fontFamily: 'var(--shop-font-display)',
              color: deepInk,
            }}
          >
            เยี่ยมสตูดิโอ
          </h2>
          <p
            className="mb-6 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            ทุกวันเสาร์เราเปิดสตูดิโอให้ลูกค้าเข้าชมกระบวนการขึ้นรูปและเตาเผา
            พร้อมเลือกผลงานในล็อตใหม่ก่อนเปิดขายออนไลน์
          </p>
          <Link
            href={`/stores/${store.slug}/about`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-medium transition-all"
            style={{
              background: `color-mix(in srgb, var(--shop-primary) 95%, var(--shop-ink))`,
              color: 'var(--shop-bg)',
            }}
          >
            ดูเรื่องราวของเรา
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

function TrustBadge({
  icon,
  label,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <span style={{ color: accent }}>{icon}</span>
      <span
        className="text-xs font-semibold"
        style={{ color: 'var(--shop-ink)' }}
      >
        {label}
      </span>
      <span
        className="text-[10px] leading-tight"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        {sub}
      </span>
    </div>
  );
}

function StoryCard({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div
      className="p-5 rounded-sm"
      style={{
        background: `color-mix(in srgb, var(--shop-bg) 14%, transparent)`,
        border: `1px solid color-mix(in srgb, var(--shop-accent) 30%, transparent)`,
      }}
    >
      <div className="mb-3" style={{ color: accent }}>
        {icon}
      </div>
      <h3
        className="text-base font-medium mb-1"
        style={{
          color: 'var(--shop-bg)',
          fontFamily: 'var(--shop-font-display)',
        }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{
          color: `color-mix(in srgb, var(--shop-bg) 80%, var(--shop-accent))`,
        }}
      >
        {body}
      </p>
    </div>
  );
}

export { MaiHatthakamProductDetail };
export default MaiHatthakamProductDetail;
