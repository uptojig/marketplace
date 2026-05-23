'use client';

/**
 * Korakot House — bespoke Product Detail page.
 *
 * Vibe: wicker / rattan handcraft · earth + natural · serif headings ·
 * woven texture accents. The store sells handwoven rattan & wicker
 * homeware ("หัตถกรรมหวาย"), so the PDP leans on warm-cream
 * surfaces, umber ink, and a vertical thumbnail gallery that feels
 * like a craft catalogue rather than a fast-fashion grid.
 *
 * All color tokens come from `var(--shop-*)` (set by the lifestyle
 * theme class on the store layout) — no hardcoded hex anywhere.
 * Typography pairs the Thai display sans (Kanit) for body with the
 * shop display variable for serif accents on H1 / section titles.
 *
 * Contract: matches `ProductDetailProps` from `lib/templates/types`
 * so the file slots in cleanly behind the multi-page template
 * dispatcher whenever the registry is upgraded to point at it.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Leaf,
  Hand,
  Shield,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

// ────────────────────────────────────────────────────────────────
// Woven texture — a small inline SVG pattern. Used as a decorative
// hairline above section headings and as a placeholder background
// when the product has no gallery imagery. Stroke / fill pull from
// `--shop-accent` and `--shop-border` so the texture re-tints under
// any storefront's family palette.
// ────────────────────────────────────────────────────────────────
const WEAVE_PATTERN_ID = 'kh-weave-pattern';

function WeaveDefs() {
  return (
    <svg
      width={0}
      height={0}
      aria-hidden="true"
      style={{ position: 'absolute', overflow: 'hidden' }}
    >
      <defs>
        <pattern
          id={WEAVE_PATTERN_ID}
          width={16}
          height={16}
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 8 Q4 0 8 8 T16 8"
            stroke="var(--shop-accent)"
            strokeWidth={1.2}
            fill="none"
            opacity={0.65}
          />
          <path
            d="M0 0 Q4 8 8 0 T16 0"
            stroke="var(--shop-border)"
            strokeWidth={1.2}
            fill="none"
            opacity={0.9}
          />
        </pattern>
      </defs>
    </svg>
  );
}

function WeaveRule() {
  return (
    <div
      className="h-3 w-full"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12"><path d="M0 6 Q4 -2 8 6 T16 6" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.7"/><path d="M0 0 Q4 8 8 0 T16 0" stroke="currentColor" stroke-width="1" fill="none" opacity="0.45"/></svg>',
        )}")`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: '16px 12px',
        color: 'var(--shop-accent)',
      }}
      aria-hidden="true"
    />
  );
}

// Default rattan-friendly variant palette, used when the product has
// no real variants on the wire. Colors stay on the warm earth axis
// so they read as natural rattan / honey / tobacco / charcoal even
// before the merchant fills in real options.
const DEFAULT_COLOR_SWATCHES = [
  { value: 'natural', label: 'หวายธรรมชาติ', swatch: 'color-mix(in srgb, var(--shop-primary) 28%, #f3e0c2)' },
  { value: 'honey', label: 'น้ำผึ้งอบ', swatch: 'color-mix(in srgb, var(--shop-primary) 55%, #d9a25a)' },
  { value: 'tobacco', label: 'ใบยาสูบ', swatch: 'color-mix(in srgb, var(--shop-ink) 60%, #8a5a2b)' },
  { value: 'charcoal', label: 'ถ่านไผ่', swatch: 'color-mix(in srgb, var(--shop-ink) 88%, #2a1b10)' },
];

const DEFAULT_SIZES = [
  { value: 'S', label: 'S · เล็ก' },
  { value: 'M', label: 'M · กลาง' },
  { value: 'L', label: 'L · ใหญ่' },
];

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

export function KorakotHouseProductDetail({ store, product, related }: ProductDetailProps) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const gallery = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product.images, product.imageUrl]);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  // Derive picker rows from real variants when present; otherwise
  // fall back to the rattan defaults so the page never looks empty
  // during early-stage stores that haven't filled options yet.
  const colorOptions = useMemo(() => {
    const labels = product.variants
      .map((v) => v.colorLabel)
      .filter((x): x is string => !!x && x.trim().length > 0);
    if (labels.length === 0) return DEFAULT_COLOR_SWATCHES;
    return Array.from(new Set(labels)).map((label, i) => ({
      value: label,
      label,
      swatch: DEFAULT_COLOR_SWATCHES[i % DEFAULT_COLOR_SWATCHES.length].swatch,
    }));
  }, [product.variants]);

  const sizeOptions = useMemo(() => {
    const labels = product.variants
      .map((v) => v.sizeLabel)
      .filter((x): x is string => !!x && x.trim().length > 0);
    if (labels.length === 0) return DEFAULT_SIZES;
    return Array.from(new Set(labels)).map((label) => ({ value: label, label }));
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string>(colorOptions[0]?.value ?? '');
  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0]?.value ?? '');

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
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push(`/stores/${store.slug}/cart`);
  };

  const hasDiscount =
    !!product.originalPriceTHB && product.originalPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPriceTHB! - product.priceTHB) / product.originalPriceTHB!) * 100)
    : 0;

  return (
    <main
      className="font-[family:var(--font-kanit),var(--font-prompt),system-ui,sans-serif]"
      style={{ background: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      <WeaveDefs />

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-7xl px-4 pt-8 pb-4 text-xs uppercase tracking-[0.18em] sm:px-6 lg:px-8"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link
              href={`/stores/${store.slug}`}
              className="transition-colors hover:underline"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              หน้าแรก
            </Link>
          </li>
          <ChevronRight aria-hidden="true" size={12} />
          <li>
            <Link
              href={`/stores/${store.slug}/products`}
              className="transition-colors hover:underline"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              คอลเลกชัน
            </Link>
          </li>
          {product.categoryName && (
            <>
              <ChevronRight aria-hidden="true" size={12} />
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
          <ChevronRight aria-hidden="true" size={12} />
          <li
            aria-current="page"
            className="truncate"
            style={{ color: 'var(--shop-ink)' }}
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ── Hero row: gallery + info ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="flex flex-col-reverse gap-4 md:flex-row">
              {/* Thumbnail rail */}
              <div
                className="flex flex-row gap-3 overflow-x-auto md:max-h-[560px] md:flex-col md:overflow-y-auto md:pr-1"
                role="tablist"
                aria-label="Product images"
              >
                {(gallery.length > 0 ? gallery : [null]).map((img, idx) => {
                  const isActive = idx === activeImg;
                  return (
                    <button
                      key={`${img ?? 'placeholder'}-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`เลือกภาพที่ ${idx + 1}`}
                      onClick={() => setActiveImg(idx)}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden transition-all md:h-24 md:w-24"
                      style={{
                        border: `1.5px solid ${
                          isActive ? 'var(--shop-primary)' : 'var(--shop-border)'
                        }`,
                        background: 'var(--shop-card)',
                        boxShadow: isActive
                          ? '0 0 0 3px color-mix(in srgb, var(--shop-primary) 18%, transparent)'
                          : 'none',
                        borderRadius: 'calc(var(--shop-radius) * 0.6)',
                      }}
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center"
                          style={{
                            background: `url(#${WEAVE_PATTERN_ID}), var(--shop-muted)`,
                            color: 'var(--shop-ink-muted)',
                          }}
                          aria-hidden="true"
                        >
                          <Hand size={20} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Main image */}
              <div className="flex-1">
                <div
                  className="relative aspect-square w-full overflow-hidden"
                  style={{
                    background: 'var(--shop-muted)',
                    border: '1px solid var(--shop-border)',
                    borderRadius: 'calc(var(--shop-radius) * 1.3)',
                  }}
                >
                  {/* Corner weave-pattern accent */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-2 opacity-70"
                    style={{ background: `url(#${WEAVE_PATTERN_ID})` }}
                  />
                  {gallery[activeImg] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gallery[activeImg]}
                      alt={product.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      <Hand size={56} strokeWidth={1.2} aria-hidden="true" />
                      <span className="text-xs uppercase tracking-[0.24em]">
                        ภาพชิ้นงาน · หัตถกรรมหวาย
                      </span>
                    </div>
                  )}
                  {hasDiscount && (
                    <span
                      className="absolute left-4 top-4 inline-flex items-center gap-1 px-3 py-1 text-[11px] uppercase tracking-[0.16em]"
                      style={{
                        background: 'var(--shop-ink)',
                        color: 'var(--shop-bg)',
                        borderRadius: '999px',
                        fontWeight: 600,
                      }}
                    >
                      <Sparkles size={12} aria-hidden="true" />
                      ลด {discountPct}%
                    </span>
                  )}
                </div>

                {product.videoUrl && (
                  <a
                    href={product.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs uppercase tracking-[0.18em] underline-offset-4 hover:underline"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    ▷ ดูวิดีโอช่างจักหวาย
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Info column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              {/* Category eyebrow */}
              <div className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em]">
                <span
                  className="h-px w-8"
                  style={{ background: 'var(--shop-accent)' }}
                  aria-hidden="true"
                />
                <span style={{ color: 'var(--shop-accent)', fontWeight: 600 }}>
                  {product.categoryName ?? 'หัตถกรรมหวาย'}
                </span>
              </div>

              {/* Title — serif display */}
              <h1
                className="mb-3 text-3xl leading-tight sm:text-4xl"
                style={{
                  fontFamily:
                    'var(--shop-font-display), "Cormorant Garamond", "Playfair Display", Georgia, "Noto Serif Thai", serif',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: 'var(--shop-ink)',
                }}
              >
                {product.title}
              </h1>

              {/* Maker line */}
              <p
                className="mb-6 text-sm leading-relaxed"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                จักด้วยมือโดยช่างหวายจาก {store.name} · งานหัตถกรรมเฉพาะชิ้น
              </p>

              {/* Price */}
              <div
                className="mb-6 flex items-baseline gap-4 border-y py-5"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <span
                  className="text-3xl"
                  style={{
                    fontFamily:
                      'var(--shop-font-display), Georgia, "Noto Serif Thai", serif',
                    fontWeight: 600,
                    color: 'var(--shop-ink)',
                  }}
                >
                  {formatTHB(product.priceTHB)}
                </span>
                {hasDiscount && (
                  <>
                    <span
                      className="text-base line-through"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {formatTHB(product.originalPriceTHB!)}
                    </span>
                    <span
                      className="text-xs uppercase tracking-[0.16em]"
                      style={{ color: 'var(--shop-primary)', fontWeight: 700 }}
                    >
                      ประหยัด {formatTHB(product.originalPriceTHB! - product.priceTHB)}
                    </span>
                  </>
                )}
              </div>

              {/* Color picker */}
              {colorOptions.length > 0 && (
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em]">
                    <span style={{ color: 'var(--shop-ink-muted)', fontWeight: 600 }}>
                      สี ·{' '}
                      <span style={{ color: 'var(--shop-ink)' }}>
                        {colorOptions.find((o) => o.value === selectedColor)?.label ?? '—'}
                      </span>
                    </span>
                    <span style={{ color: 'var(--shop-ink-muted)' }}>
                      {colorOptions.length} ตัวเลือก
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((opt) => {
                      const isActive = opt.value === selectedColor;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSelectedColor(opt.value)}
                          aria-pressed={isActive}
                          aria-label={`สี ${opt.label}`}
                          className="relative h-11 w-11 transition-transform hover:scale-105"
                          style={{
                            background: opt.swatch,
                            borderRadius: '999px',
                            border: `2px solid ${
                              isActive ? 'var(--shop-ink)' : 'var(--shop-border)'
                            }`,
                            boxShadow: isActive
                              ? '0 0 0 3px color-mix(in srgb, var(--shop-primary) 22%, transparent)'
                              : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size picker */}
              {sizeOptions.length > 0 && (
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em]">
                    <span style={{ color: 'var(--shop-ink-muted)', fontWeight: 600 }}>
                      ขนาด ·{' '}
                      <span style={{ color: 'var(--shop-ink)' }}>
                        {sizeOptions.find((o) => o.value === selectedSize)?.label ?? '—'}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((opt) => {
                      const isActive = opt.value === selectedSize;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSelectedSize(opt.value)}
                          aria-pressed={isActive}
                          className="min-w-[3.5rem] px-4 py-2 text-sm transition-colors"
                          style={{
                            background: isActive ? 'var(--shop-ink)' : 'var(--shop-card)',
                            color: isActive ? 'var(--shop-bg)' : 'var(--shop-ink)',
                            border: `1px solid ${
                              isActive ? 'var(--shop-ink)' : 'var(--shop-border)'
                            }`,
                            borderRadius: 'calc(var(--shop-radius) * 0.5)',
                            fontWeight: 500,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Qty + CTAs */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div
                  className="flex h-12 items-center"
                  style={{
                    border: '1px solid var(--shop-border)',
                    background: 'var(--shop-card)',
                    borderRadius: 'calc(var(--shop-radius) * 0.5)',
                  }}
                  role="group"
                  aria-label="จำนวน"
                >
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="ลดจำนวน"
                    className="flex h-full w-11 items-center justify-center transition-colors hover:bg-[color-mix(in_srgb,var(--shop-primary)_8%,transparent)]"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    aria-label="จำนวน"
                    className="h-full w-12 bg-transparent text-center text-sm outline-none"
                    style={{ color: 'var(--shop-ink)', fontWeight: 600 }}
                  />
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    aria-label="เพิ่มจำนวน"
                    className="flex h-full w-11 items-center justify-center transition-colors hover:bg-[color-mix(in_srgb,var(--shop-primary)_8%,transparent)]"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 px-6 text-sm uppercase tracking-[0.16em] transition-opacity hover:opacity-90"
                  style={{
                    background: 'var(--shop-ink)',
                    color: 'var(--shop-bg)',
                    border: '1px solid var(--shop-ink)',
                    borderRadius: 'calc(var(--shop-radius) * 0.5)',
                    fontWeight: 600,
                  }}
                >
                  <ShoppingBag size={16} aria-hidden="true" />
                  หยิบใส่ตะกร้า
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                className="mb-8 inline-flex h-12 w-full items-center justify-center gap-2 px-6 text-sm uppercase tracking-[0.16em] transition-colors"
                style={{
                  background: 'var(--shop-card)',
                  color: 'var(--shop-ink)',
                  border: '1.5px solid var(--shop-ink)',
                  borderRadius: 'calc(var(--shop-radius) * 0.5)',
                  fontWeight: 600,
                }}
              >
                สั่งซื้อทันที →
              </button>

              {/* Trust badges */}
              <ul
                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                role="list"
                aria-label="จุดเด่นของสินค้า"
              >
                <li
                  className="flex items-start gap-3 p-3 text-xs"
                  style={{
                    background: 'var(--shop-card)',
                    border: '1px solid var(--shop-border)',
                    borderRadius: 'calc(var(--shop-radius) * 0.5)',
                  }}
                >
                  <Hand
                    size={20}
                    aria-hidden="true"
                    style={{ color: 'var(--shop-primary)', flexShrink: 0 }}
                  />
                  <div>
                    <div
                      className="text-xs uppercase tracking-[0.12em]"
                      style={{ color: 'var(--shop-ink)', fontWeight: 700 }}
                    >
                      ทอด้วยมือ
                    </div>
                    <div style={{ color: 'var(--shop-ink-muted)' }}>
                      โดยช่างหัตถกรรมไทย
                    </div>
                  </div>
                </li>
                <li
                  className="flex items-start gap-3 p-3 text-xs"
                  style={{
                    background: 'var(--shop-card)',
                    border: '1px solid var(--shop-border)',
                    borderRadius: 'calc(var(--shop-radius) * 0.5)',
                  }}
                >
                  <Leaf
                    size={20}
                    aria-hidden="true"
                    style={{ color: 'var(--shop-accent)', flexShrink: 0 }}
                  />
                  <div>
                    <div
                      className="text-xs uppercase tracking-[0.12em]"
                      style={{ color: 'var(--shop-ink)', fontWeight: 700 }}
                    >
                      หวายธรรมชาติ
                    </div>
                    <div style={{ color: 'var(--shop-ink-muted)' }}>
                      Made in Thailand
                    </div>
                  </div>
                </li>
                <li
                  className="flex items-start gap-3 p-3 text-xs"
                  style={{
                    background: 'var(--shop-card)',
                    border: '1px solid var(--shop-border)',
                    borderRadius: 'calc(var(--shop-radius) * 0.5)',
                  }}
                >
                  <Truck
                    size={20}
                    aria-hidden="true"
                    style={{ color: 'var(--shop-primary)', flexShrink: 0 }}
                  />
                  <div>
                    <div
                      className="text-xs uppercase tracking-[0.12em]"
                      style={{ color: 'var(--shop-ink)', fontWeight: 700 }}
                    >
                      ส่งฟรีในไทย
                    </div>
                    <div style={{ color: 'var(--shop-ink-muted)' }}>
                      ห่อแน่นทุกชิ้น
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Story / description accordion ──────────────────────── */}
      <section
        className="border-y"
        style={{
          borderColor: 'var(--shop-border)',
          background: 'color-mix(in srgb, var(--shop-bg) 70%, var(--shop-card))',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span
              className="block text-[11px] uppercase tracking-[0.28em]"
              style={{ color: 'var(--shop-accent)', fontWeight: 600 }}
            >
              เรื่องราวของชิ้นงาน
            </span>
            <h2
              className="mt-3 text-2xl sm:text-3xl"
              style={{
                fontFamily:
                  'var(--shop-font-display), Georgia, "Noto Serif Thai", serif',
                fontWeight: 500,
                color: 'var(--shop-ink)',
              }}
            >
              งานหัตถกรรมที่เล่าผ่านเส้นหวาย
            </h2>
            <div className="mt-4 max-w-xl">
              <WeaveRule />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              {product.description ? (
                <p
                  className="whitespace-pre-line text-base leading-relaxed"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {product.description}
                </p>
              ) : (
                <p
                  className="text-base leading-relaxed"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  ทุกชิ้นจักด้วยมือจากหวายไทยคุณภาพ ผ่านการคัดเลือกเส้น ตากแห้ง
                  และจักลายโดยช่างฝีมือที่สืบทอดวิธีดั้งเดิม
                  ลายของแต่ละชิ้นจะมีเอกลักษณ์เฉพาะตัว
                  ไม่มีสองชิ้นที่เหมือนกันร้อยเปอร์เซ็นต์ — นั่นคือเสน่ห์ของงานหัตถกรรม
                </p>
              )}
            </div>

            <div className="lg:col-span-5">
              <div
                className="overflow-hidden"
                style={{
                  background: 'var(--shop-card)',
                  border: '1px solid var(--shop-border)',
                  borderRadius: 'calc(var(--shop-radius) * 0.7)',
                }}
              >
                {[
                  {
                    title: 'วัสดุที่ใช้',
                    body: 'หวายไทยธรรมชาติ ตากแห้งและรมควันแบบดั้งเดิม · ขัดเงาน้ำมันธรรมชาติ ปลอดสาร VOC',
                  },
                  {
                    title: 'วิธีจักลาย',
                    body: 'ลายขัดสาน 4 เส้น สลับโครงไม้ไผ่ × หวายเส้นกลม จักด้วยมือทีละแถวประมาณ 8–12 ชั่วโมงต่อชิ้น',
                  },
                  {
                    title: 'การดูแลรักษา',
                    body: 'ใช้ผ้าแห้งปัดฝุ่นทุก 2 สัปดาห์ · เลี่ยงแสงแดดจัด · ทาน้ำมันมะกอกบางๆ ทุก 6 เดือนเพื่อรักษาความยืดหยุ่นของเส้นหวาย',
                  },
                  {
                    title: 'การจัดส่งและรับประกัน',
                    body: 'ส่งฟรีทั่วไทยภายใน 5–7 วันทำการ · รับประกันความเรียบร้อยของการสานนาน 12 เดือน · เปลี่ยน/คืนได้ภายใน 14 วัน',
                  },
                ].map((row, i) => (
                  <details
                    key={row.title}
                    className="group"
                    open={i === 0}
                    style={{
                      borderTop: i === 0 ? 'none' : '1px solid var(--shop-border)',
                    }}
                  >
                    <summary
                      className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm uppercase tracking-[0.14em] outline-none transition-colors hover:bg-[color-mix(in_srgb,var(--shop-primary)_6%,transparent)]"
                      style={{ color: 'var(--shop-ink)', fontWeight: 600 }}
                    >
                      <span>{row.title}</span>
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className="transition-transform group-open:rotate-180"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      />
                    </summary>
                    <div
                      className="px-5 pb-5 text-sm leading-relaxed"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {row.body}
                    </div>
                  </details>
                ))}
              </div>

              {/* Stock / origin badge */}
              <div
                className="mt-4 flex items-start gap-3 p-4 text-xs"
                style={{
                  background: 'var(--shop-muted)',
                  border: '1px dashed var(--shop-accent)',
                  borderRadius: 'calc(var(--shop-radius) * 0.5)',
                  color: 'var(--shop-ink)',
                }}
              >
                <Shield
                  size={18}
                  aria-hidden="true"
                  style={{ color: 'var(--shop-accent)', flexShrink: 0, marginTop: 2 }}
                />
                <p className="leading-relaxed">
                  ทุกชิ้นเป็นงาน Made-in-Thai 100% ผลิตที่บ้านช่างในจังหวัดน่าน
                  พร้อมใบรับรองชิ้นงาน (Certificate of Craft) แนบไปกับสินค้าทุกชิ้น
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related products ───────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span
                className="block text-[11px] uppercase tracking-[0.28em]"
                style={{ color: 'var(--shop-accent)', fontWeight: 600 }}
              >
                ชิ้นอื่นจากช่างคนเดียวกัน
              </span>
              <h2
                className="mt-3 text-2xl sm:text-3xl"
                style={{
                  fontFamily:
                    'var(--shop-font-display), Georgia, "Noto Serif Thai", serif',
                  fontWeight: 500,
                  color: 'var(--shop-ink)',
                }}
              >
                คุณอาจชอบ
              </h2>
            </div>
            <Link
              href={`/stores/${store.slug}/products`}
              className="text-xs uppercase tracking-[0.18em] hover:underline"
              style={{ color: 'var(--shop-ink)', fontWeight: 600 }}
            >
              ดูทั้งคอลเลกชัน →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {related.slice(0, 8).map((r) => {
              const rHasDiscount =
                !!r.compareAtPriceTHB && r.compareAtPriceTHB > r.priceTHB;
              return (
                <Link
                  key={r.id}
                  href={`/stores/${store.slug}/products/${r.id}`}
                  className="group block"
                >
                  <div
                    className="relative mb-4 aspect-[4/5] w-full overflow-hidden"
                    style={{
                      background: 'var(--shop-muted)',
                      border: '1px solid var(--shop-border)',
                      borderRadius: 'calc(var(--shop-radius) * 0.7)',
                    }}
                  >
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ color: 'var(--shop-ink-muted)' }}
                        aria-hidden="true"
                      >
                        <Hand size={36} strokeWidth={1.2} />
                      </div>
                    )}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-2 opacity-60"
                      style={{ background: `url(#${WEAVE_PATTERN_ID})` }}
                    />
                  </div>
                  {r.categoryName && (
                    <span
                      className="block text-[10px] uppercase tracking-[0.2em]"
                      style={{ color: 'var(--shop-ink-muted)', fontWeight: 600 }}
                    >
                      {r.categoryName}
                    </span>
                  )}
                  <h3
                    className="mt-1 line-clamp-2 text-base leading-snug transition-colors group-hover:underline"
                    style={{
                      fontFamily:
                        'var(--shop-font-display), Georgia, "Noto Serif Thai", serif',
                      color: 'var(--shop-ink)',
                      fontWeight: 500,
                    }}
                  >
                    {r.title}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--shop-ink)', fontWeight: 600 }}
                    >
                      {formatTHB(r.priceTHB)}
                    </span>
                    {rHasDiscount && (
                      <span
                        className="text-xs line-through"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        {formatTHB(r.compareAtPriceTHB!)}
                      </span>
                    )}
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

export default KorakotHouseProductDetail;
