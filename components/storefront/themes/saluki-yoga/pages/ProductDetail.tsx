'use client';

/**
 * saluki-yoga — bespoke Product Detail Page
 *
 * Vibe: yoga / pilates wellness — sage + sand + cream, airy display
 * weight, breathing-circle illustrations, plant/leaf glyphs.  Colours
 * lean on `var(--shop-*)` so each saluki-yoga droplet can tint the
 * page from its own DB seed.  No hex literals used for brand tints.
 *
 * Sections (top → bottom):
 *   1. Breadcrumb
 *   2. Gallery (in-use pose / flat shots, with breathing-circle vignette)
 *   3. Info column — title, sustainability badges, price, colour &
 *      thickness pickers, qty stepper, add-to-cart / buy-now CTAs
 *   4. Material / Care accordion + Yoga-pose suitability grid
 *   5. Related rail ("ฝึกคู่กันลงตัว")
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  Recycle,
  Wind,
  Droplets,
  Sparkles,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Truck,
  RefreshCcw,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

// ────────────────────────────────────────────────────────────────────
// Wellness-flavoured chrome strings.  Pulled from the storefront
// "saluki-yoga" template seed (see lib/templates/template-seed) where
// possible.  Static fall-backs are Thai-first per project memory.
// ────────────────────────────────────────────────────────────────────

const WELLNESS_BADGES = [
  { Icon: Recycle, label: 'Recycled PET 18 ขวด' },
  { Icon: Wind, label: 'ระบายอากาศ 4-way' },
  { Icon: Droplets, label: 'ซับเหงื่อแห้งไว' },
  { Icon: Leaf, label: 'Eco-dye · ไม่ย้อมเคมี' },
] as const;

const YOGA_POSES = [
  { label: 'Vinyasa', dot: 'high' },
  { label: 'Hatha', dot: 'high' },
  { label: 'Yin / Restorative', dot: 'high' },
  { label: 'Pilates Reformer', dot: 'mid' },
  { label: 'Hot Yoga 38°C', dot: 'mid' },
] as const;

const DEFAULT_CARE = [
  'ซักเครื่องในถุงตาข่าย โหมดถนอมผ้า น้ำเย็น 30°C',
  'ห้ามใช้น้ำยาฟอกขาว · ห้ามอบผ้านุ่ม',
  'ผึ่งในร่ม · ห้ามตากแดดจัดเพื่อรักษาความยืดของผ้า',
  'พลิกด้านในออกก่อนซัก เพื่อให้สีคงเดิม',
];

const DEFAULT_DESCRIPTION =
  'ชุดออกกำลังกายโยคะ / พีลาทิส ตัดจากผ้ารีไซเคิล PET 18 ขวด ผสม Spandex 20% ' +
  'ให้ความยืดหยุ่น 4 ทิศทาง รองรับท่าก้ม-บิด-แอ่นได้ทุกระดับ เนื้อผ้านุ่มเบาราว ' +
  'หายใจได้เต็มปอด ไม่อับชื้น เหมาะกับทั้งคลาส flow ในห้องแอร์และ outdoor session.';

// ────────────────────────────────────────────────────────────────────
// Breathing-circle decorative illustration (pure CSS / SVG, no img net).
// Repeated as the "missing image" vignette and the gallery background.
// ────────────────────────────────────────────────────────────────────

function BreathingMandala({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={className}
      role="presentation"
    >
      <defs>
        <radialGradient id="sy-pdp-breath" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--shop-primary)" stopOpacity="0.18" />
          <stop offset="60%" stopColor="var(--shop-primary)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--shop-primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#sy-pdp-breath)" />
      <circle
        cx="100"
        cy="100"
        r="70"
        fill="none"
        stroke="var(--shop-primary)"
        strokeOpacity="0.22"
        strokeWidth="0.8"
      />
      <circle
        cx="100"
        cy="100"
        r="50"
        fill="none"
        stroke="var(--shop-primary)"
        strokeOpacity="0.16"
        strokeWidth="0.6"
      />
      <circle
        cx="100"
        cy="100"
        r="30"
        fill="none"
        stroke="var(--shop-primary)"
        strokeOpacity="0.12"
        strokeWidth="0.5"
      />
      {/* lotus leaf accent */}
      <path
        d="M100 38 Q116 62 100 100 Q84 62 100 38 Z"
        fill="var(--shop-primary)"
        opacity="0.18"
      />
      <path
        d="M100 162 Q84 138 100 100 Q116 138 100 162 Z"
        fill="var(--shop-primary)"
        opacity="0.14"
      />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────

export default function SalukiYogaProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;

  const router = useRouter();
  const add = useCart((s) => s.add);

  // ── Gallery ───────────────────────────────────────────────────
  const gallery = useMemo(() => {
    const raw = [product.imageUrl, ...product.images].filter(Boolean) as string[];
    const dedup = Array.from(new Set(raw));
    return dedup.length > 0 ? dedup : [];
  }, [product.imageUrl, product.images]);

  const [activeImg, setActiveImg] = useState(0);

  // ── Variant selection ────────────────────────────────────────
  const colorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const v of product.variants) {
      if (v.colorLabel && !seen.has(v.colorLabel)) {
        seen.set(v.colorLabel, swatchHex(v.colorLabel));
      }
    }
    return Array.from(seen, ([label, hex]) => ({ label, hex }));
  }, [product.variants]);

  // "thickness" rows are surfaced from materialLabel OR sizeLabel —
  // yoga storefronts use either depending on whether the SKU encodes
  // mat-thickness (4 / 6 / 8 mm) or apparel sizes (XS-XL).
  const thicknessOptions = useMemo(() => {
    const labels = product.variants
      .map((v) => v.materialLabel ?? v.sizeLabel)
      .filter(Boolean) as string[];
    return Array.from(new Set(labels));
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorOptions[0]?.label ?? null,
  );
  const [selectedThickness, setSelectedThickness] = useState<string | null>(
    thicknessOptions[0] ?? null,
  );
  const [qty, setQty] = useState(1);

  // ── Pricing ──────────────────────────────────────────────────
  const isOnSale =
    product.originalPriceTHB != null &&
    product.originalPriceTHB > product.priceTHB;
  const discountPct = isOnSale
    ? Math.round(
        ((product.originalPriceTHB! - product.priceTHB) /
          product.originalPriceTHB!) *
          100,
      )
    : 0;
  const installment = Math.round(product.priceTHB / 3);

  // ── Cart actions ─────────────────────────────────────────────
  const buildCartLine = () => ({
    productId: product.id,
    title: product.title,
    imageUrl: product.imageUrl ?? gallery[0],
    priceTHB: product.priceTHB,
    storeSlug: store.slug,
    storeName: store.name,
  });

  const handleAdd = () => {
    add(buildCartLine(), qty);
  };

  const handleBuyNow = () => {
    add(buildCartLine(), qty);
    router.push(`/stores/${store.slug}/checkout`);
  };

  // ── Accordion state ──────────────────────────────────────────
  const [openSection, setOpenSection] = useState<'desc' | 'care' | 'ship'>(
    'desc',
  );

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--shop-primary) 5%, var(--shop-bg)) 0%, var(--shop-bg) 38%, var(--shop-card) 100%)',
        color: 'var(--shop-ink)',
        fontFamily: 'var(--shop-font)',
      }}
    >
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="border-b"
        style={{ borderColor: 'color-mix(in srgb, var(--shop-primary) 12%, transparent)' }}
      >
        <div className="container mx-auto px-4 py-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
            <li>
              <Link
                href={`/stores/${store.slug}`}
                className="text-[color:var(--shop-ink-muted)] hover:text-[color:var(--shop-primary)] transition-colors"
              >
                หน้าแรก
              </Link>
            </li>
            <ChevronRight
              className="h-3 w-3"
              style={{ color: 'var(--shop-ink-muted)' }}
              aria-hidden="true"
            />
            <li>
              <Link
                href={`/stores/${store.slug}/products`}
                className="text-[color:var(--shop-ink-muted)] hover:text-[color:var(--shop-primary)] transition-colors"
              >
                คอลเล็กชันทั้งหมด
              </Link>
            </li>
            {product.categoryName ? (
              <>
                <ChevronRight
                  className="h-3 w-3"
                  style={{ color: 'var(--shop-ink-muted)' }}
                  aria-hidden="true"
                />
                <li>
                  <Link
                    href={`/stores/${store.slug}/products?category=${encodeURIComponent(
                      product.categoryName,
                    )}`}
                    className="text-[color:var(--shop-ink-muted)] hover:text-[color:var(--shop-primary)] transition-colors"
                  >
                    {product.categoryName}
                  </Link>
                </li>
              </>
            ) : null}
            <ChevronRight
              className="h-3 w-3"
              style={{ color: 'var(--shop-ink-muted)' }}
              aria-hidden="true"
            />
            <li
              className="font-medium truncate max-w-[18ch] sm:max-w-[32ch]"
              style={{ color: 'var(--shop-ink)' }}
              aria-current="page"
            >
              {product.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* ── Hero / overview grid ───────────────────────────────── */}
      <section className="container mx-auto px-4 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* GALLERY ----------------------------------------------------- */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
            {/* Thumb rail */}
            {gallery.length > 1 ? (
              <ul
                className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible scrollbar-none"
                aria-label="ภาพย่อย่อมุมมองอื่น"
              >
                {gallery.map((src, i) => (
                  <li key={src + i}>
                    <button
                      type="button"
                      onClick={() => setActiveImg(i)}
                      aria-label={`มุมมองที่ ${i + 1}`}
                      aria-pressed={i === activeImg}
                      className="relative w-16 h-20 lg:w-20 lg:h-24 shrink-0 rounded-2xl overflow-hidden transition-all"
                      style={{
                        borderWidth: 2,
                        borderStyle: 'solid',
                        borderColor:
                          i === activeImg
                            ? 'var(--shop-primary)'
                            : 'color-mix(in srgb, var(--shop-primary) 12%, transparent)',
                        boxShadow:
                          i === activeImg
                            ? '0 6px 20px -8px color-mix(in srgb, var(--shop-primary) 60%, transparent)'
                            : 'none',
                      }}
                    >
                      <img
                        src={src}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Main image with breathing-circle vignette */}
            <div className="relative flex-1">
              <div
                className="relative aspect-[4/5] rounded-[2rem] overflow-hidden"
                style={{
                  background:
                    'radial-gradient(ellipse at center, color-mix(in srgb, var(--shop-primary) 12%, var(--shop-card)) 0%, var(--shop-card) 80%)',
                  border:
                    '1px solid color-mix(in srgb, var(--shop-primary) 14%, transparent)',
                }}
              >
                <BreathingMandala className="absolute inset-0 w-full h-full" />
                {gallery[activeImg] ? (
                  <img
                    src={gallery[activeImg]}
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    <Leaf className="h-12 w-12" />
                    <span className="text-sm font-light tracking-wide">
                      ภาพชุดนี้กำลังจัดเตรียม
                    </span>
                  </div>
                )}

                {/* Floating sustainability chip */}
                <div
                  className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md"
                  style={{
                    background:
                      'color-mix(in srgb, var(--shop-card) 70%, transparent)',
                    color: 'var(--shop-primary)',
                    border:
                      '1px solid color-mix(in srgb, var(--shop-primary) 25%, transparent)',
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>เก็บคาร์บอนไว้ ฝึกได้นาน</span>
                </div>

                {isOnSale ? (
                  <div
                    className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'var(--shop-primary)',
                      color: 'var(--shop-card)',
                    }}
                  >
                    ลด {discountPct}%
                  </div>
                ) : null}
              </div>

              {/* In-use vs flat shot hint */}
              <p
                className="mt-4 text-center text-xs italic font-light"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                ถ่ายในสตูดิโอ — ใส่จริงระหว่าง vinyasa flow รอบเช้า
              </p>
            </div>
          </div>

          {/* INFO ------------------------------------------------------- */}
          <div className="flex flex-col gap-6">
            {/* Category eyebrow */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-medium"
              style={{ color: 'var(--shop-primary)' }}
            >
              <Leaf className="h-3.5 w-3.5" />
              <span>{product.categoryName ?? 'Yoga · Pilates Wear'}</span>
            </div>

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight tracking-tight"
              style={{
                fontFamily: 'var(--shop-font-display)',
                color: 'var(--shop-ink)',
              }}
            >
              {product.title}
            </h1>

            {/* Sub line / first line of description */}
            <p
              className="text-base font-light leading-relaxed max-w-prose"
              style={{ color: 'color-mix(in srgb, var(--shop-ink) 80%, transparent)' }}
            >
              {firstLine(product.description) ??
                'ชุดออกกำลังกายโยคะ / พีลาทิส จากผ้ารีไซเคิล PET — ใส่หายใจได้สบาย รองรับทุกท่า flow'}
            </p>

            {/* Wellness badges */}
            <ul className="grid grid-cols-2 gap-2.5">
              {WELLNESS_BADGES.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs sm:text-sm font-medium"
                  style={{
                    background:
                      'color-mix(in srgb, var(--shop-primary) 7%, var(--shop-card))',
                    color: 'var(--shop-ink)',
                    border:
                      '1px solid color-mix(in srgb, var(--shop-primary) 14%, transparent)',
                  }}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--shop-primary)' }}
                  />
                  <span className="leading-tight">{label}</span>
                </li>
              ))}
            </ul>

            {/* Price */}
            <div
              className="rounded-3xl p-5"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--shop-primary) 8%, var(--shop-card)) 0%, var(--shop-card) 100%)',
                border:
                  '1px solid color-mix(in srgb, var(--shop-primary) 14%, transparent)',
              }}
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span
                  className="text-3xl sm:text-4xl font-light tracking-tight"
                  style={{
                    fontFamily: 'var(--shop-font-display)',
                    color: 'var(--shop-primary)',
                  }}
                >
                  {formatTHB(product.priceTHB)}
                </span>
                {isOnSale ? (
                  <>
                    <span
                      className="text-lg line-through"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {formatTHB(product.originalPriceTHB!)}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{
                        background:
                          'color-mix(in srgb, var(--shop-primary) 14%, transparent)',
                        color: 'var(--shop-primary)',
                      }}
                    >
                      ประหยัด {formatTHB(product.originalPriceTHB! - product.priceTHB)}
                    </span>
                  </>
                ) : null}
              </div>
              <p
                className="mt-2 text-xs sm:text-sm font-light"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                ผ่อน 0% นาน 3 เดือน · เริ่ม {formatTHB(installment)}/เดือน
              </p>
            </div>

            {/* Colour picker */}
            {colorOptions.length > 0 ? (
              <fieldset className="space-y-3">
                <legend className="flex w-full items-center justify-between text-xs uppercase tracking-[0.16em] font-medium"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  <span>
                    สี ·{' '}
                    <span
                      className="normal-case tracking-normal font-light"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      {selectedColor ?? 'เลือกโทน'}
                    </span>
                  </span>
                  <span
                    className="text-[10px] font-light"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {colorOptions.length} โทน
                  </span>
                </legend>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((opt) => {
                    const active = selectedColor === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSelectedColor(opt.label)}
                        aria-label={`เลือกสี ${opt.label}`}
                        aria-pressed={active}
                        className="relative h-11 w-11 rounded-full transition-all hover:scale-105"
                        style={{
                          background: opt.hex,
                          outline: active
                            ? `2px solid var(--shop-primary)`
                            : `1px solid color-mix(in srgb, var(--shop-ink) 14%, transparent)`,
                          outlineOffset: active ? '3px' : '0px',
                        }}
                      >
                        {active ? (
                          <CheckCircle2
                            className="absolute inset-0 m-auto h-5 w-5"
                            style={{
                              color: contrastInk(opt.hex),
                            }}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            {/* Thickness / size picker */}
            {thicknessOptions.length > 0 ? (
              <fieldset className="space-y-3">
                <legend className="flex w-full items-center justify-between text-xs uppercase tracking-[0.16em] font-medium"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  <span>
                    ความหนา / ไซส์ ·{' '}
                    <span
                      className="normal-case tracking-normal font-light"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      {selectedThickness ?? 'เลือก'}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="text-[10px] font-light underline-offset-2 hover:underline"
                    style={{ color: 'var(--shop-primary)' }}
                    onClick={() =>
                      setOpenSection((s) => (s === 'care' ? 'desc' : 'care'))
                    }
                  >
                    ตารางไซส์ ↓
                  </button>
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {thicknessOptions.map((opt) => {
                    const active = selectedThickness === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedThickness(opt)}
                        aria-pressed={active}
                        className="min-w-[3.25rem] px-4 py-2.5 rounded-full text-sm font-medium transition-all"
                        style={{
                          background: active
                            ? 'var(--shop-primary)'
                            : 'var(--shop-card)',
                          color: active
                            ? 'var(--shop-card)'
                            : 'var(--shop-ink)',
                          border: `1px solid ${
                            active
                              ? 'var(--shop-primary)'
                              : 'color-mix(in srgb, var(--shop-primary) 18%, transparent)'
                          }`,
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            {/* Qty + CTAs */}
            <div className="space-y-4 pt-1">
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className="inline-flex items-center rounded-full overflow-hidden"
                  style={{
                    border:
                      '1px solid color-mix(in srgb, var(--shop-primary) 22%, transparent)',
                    background: 'var(--shop-card)',
                  }}
                  role="group"
                  aria-label="จำนวนสินค้า"
                >
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-11 w-11 flex items-center justify-center transition-colors hover:bg-[color:color-mix(in_srgb,var(--shop-primary)_8%,transparent)]"
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
                    aria-label="จำนวน"
                    className="h-11 w-12 text-center text-base font-medium bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    className="h-11 w-11 flex items-center justify-center transition-colors hover:bg-[color:color-mix(in_srgb,var(--shop-primary)_8%,transparent)]"
                    aria-label="เพิ่มจำนวน"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {product.stockLeft != null && product.stockLeft <= 8 ? (
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    เหลือ {product.stockLeft} ชุด · ส่งภายใน 24 ชม.
                  </span>
                ) : (
                  <span
                    className="text-xs font-light"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    พร้อมส่ง · จัดของภายในวันทำการ
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="inline-flex items-center justify-center gap-2 py-4 px-6 rounded-full text-base font-medium transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--shop-card)',
                    color: 'var(--shop-primary)',
                    border: '1px solid var(--shop-primary)',
                  }}
                >
                  <ShoppingBag className="h-5 w-5" />
                  เพิ่มลงตะกร้า
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="inline-flex items-center justify-center gap-2 py-4 px-6 rounded-full text-base font-medium transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--shop-primary)',
                    color: 'var(--shop-card)',
                    boxShadow:
                      '0 12px 28px -12px color-mix(in srgb, var(--shop-primary) 70%, transparent)',
                  }}
                >
                  <Zap className="h-5 w-5" />
                  ซื้อเลย
                </button>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-light hover:underline underline-offset-4"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                <Heart className="h-3.5 w-3.5" />
                บันทึกลง wishlist เพื่อเปรียบเทียบ
              </button>
            </div>

            {/* Trust strip */}
            <ul
              className="grid grid-cols-3 gap-2 pt-4 mt-2"
              style={{
                borderTop:
                  '1px solid color-mix(in srgb, var(--shop-primary) 14%, transparent)',
              }}
            >
              {[
                { Icon: Truck, top: 'ส่งฟรี ฿890+', bot: '1-3 วันทำการ' },
                { Icon: RefreshCcw, top: 'เปลี่ยนไซส์', bot: 'ภายใน 14 วัน' },
                {
                  Icon: ShieldCheck,
                  top: 'Eco-cert.',
                  bot: 'GRS · OEKO-TEX',
                },
              ].map(({ Icon, top, bot }) => (
                <li key={top} className="flex items-start gap-2 pt-4">
                  <Icon
                    className="h-5 w-5 shrink-0 mt-0.5"
                    style={{ color: 'var(--shop-primary)' }}
                  />
                  <div className="leading-tight">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {top}
                    </div>
                    <div
                      className="text-[11px] font-light"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {bot}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Details / Care / Shipping accordion + yoga-pose suitability ─ */}
      <section
        className="py-14 lg:py-20"
        style={{
          background:
            'linear-gradient(180deg, var(--shop-card) 0%, color-mix(in srgb, var(--shop-primary) 5%, var(--shop-bg)) 100%)',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Accordion */}
            <div className="lg:col-span-3 space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-light tracking-tight mb-6"
                style={{
                  fontFamily: 'var(--shop-font-display)',
                  color: 'var(--shop-ink)',
                }}
              >
                เนื้อผ้า · การดูแล · จัดส่ง
              </h2>

              <AccordionItem
                title="รายละเอียดสินค้า · เนื้อผ้า"
                open={openSection === 'desc'}
                onClick={() => setOpenSection('desc')}
              >
                <p
                  className="text-sm leading-relaxed font-light"
                  style={{ color: 'color-mix(in srgb, var(--shop-ink) 78%, transparent)' }}
                >
                  {product.description?.trim() || DEFAULT_DESCRIPTION}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 text-sm">
                  {[
                    'Recycled Polyester 80% + Spandex 20%',
                    'ความยืดหยุ่น 4 ทิศทาง',
                    'Anti-pilling · ไม่ขึ้นขน',
                    'น้ำหนักผ้า 220 gsm — เบาแต่ไม่บางเกินไป',
                  ].map((spec) => (
                    <li
                      key={spec}
                      className="flex items-start gap-2"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      <Leaf
                        className="h-4 w-4 mt-0.5 shrink-0"
                        style={{ color: 'var(--shop-primary)' }}
                      />
                      <span className="font-light">{spec}</span>
                    </li>
                  ))}
                </ul>
              </AccordionItem>

              <AccordionItem
                title="วิธีดูแลรักษา"
                open={openSection === 'care'}
                onClick={() => setOpenSection('care')}
              >
                <ul className="space-y-2.5 text-sm font-light"
                  style={{ color: 'color-mix(in srgb, var(--shop-ink) 78%, transparent)' }}
                >
                  {DEFAULT_CARE.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ background: 'var(--shop-primary)' }}
                      />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </AccordionItem>

              <AccordionItem
                title="จัดส่ง · เปลี่ยนคืน"
                open={openSection === 'ship'}
                onClick={() => setOpenSection('ship')}
              >
                <div
                  className="space-y-3 text-sm font-light leading-relaxed"
                  style={{ color: 'color-mix(in srgb, var(--shop-ink) 78%, transparent)' }}
                >
                  <p>
                    <strong style={{ color: 'var(--shop-ink)' }}>การจัดส่ง</strong> · ส่งฟรีเมื่อสั่งครบ ฿890
                    · Kerry / Flash Express · 1-3 วันใน กทม. · 2-5 วันต่างจังหวัด
                  </p>
                  <p>
                    <strong style={{ color: 'var(--shop-ink)' }}>เปลี่ยนไซส์</strong> · ภายใน 14 วัน หากยังไม่ผ่านการใช้ ป้ายและ hygiene seal ยังครบ
                  </p>
                  <p>
                    <strong style={{ color: 'var(--shop-ink)' }}>แพ็คเกจจิ้ง</strong> · ถุง compostable ทำจากแป้งมัน · ย่อยสลายใน 90 วัน
                  </p>
                </div>
              </AccordionItem>
            </div>

            {/* Pose-suitability card */}
            <aside className="lg:col-span-2">
              <div
                className="relative overflow-hidden rounded-3xl p-7 sticky top-24"
                style={{
                  background:
                    'linear-gradient(160deg, color-mix(in srgb, var(--shop-primary) 88%, var(--shop-ink)) 0%, var(--shop-primary) 100%)',
                  color: 'var(--shop-card)',
                  boxShadow:
                    '0 30px 60px -32px color-mix(in srgb, var(--shop-primary) 60%, transparent)',
                }}
              >
                <BreathingMandala className="absolute opacity-20 -right-10 -top-10 w-56 h-56 pointer-events-none" />
                <div className="relative">
                  <div
                    className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] mb-4 font-medium"
                    style={{
                      color:
                        'color-mix(in srgb, var(--shop-card) 80%, transparent)',
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    เหมาะกับการฝึก
                  </div>
                  <h3
                    className="text-2xl font-light leading-snug mb-5"
                    style={{ fontFamily: 'var(--shop-font-display)' }}
                  >
                    เคลื่อนไหวอิสระ ทุก flow ทุกลมหายใจ
                  </h3>
                  <ul className="space-y-3">
                    {YOGA_POSES.map((p) => (
                      <li
                        key={p.label}
                        className="flex items-center justify-between text-sm font-light"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              background:
                                'color-mix(in srgb, var(--shop-card) 90%, transparent)',
                            }}
                          />
                          {p.label}
                        </span>
                        <span
                          className="flex gap-1"
                          aria-label={
                            p.dot === 'high'
                              ? 'เหมาะมาก'
                              : 'เหมาะ — ขึ้นกับท่า'
                          }
                        >
                          {Array.from({ length: 3 }).map((_, i) => (
                            <span
                              key={i}
                              className="h-1.5 w-3 rounded-full"
                              style={{
                                background:
                                  (p.dot === 'high' || (p.dot === 'mid' && i < 2))
                                    ? 'color-mix(in srgb, var(--shop-card) 90%, transparent)'
                                    : 'color-mix(in srgb, var(--shop-card) 25%, transparent)',
                              }}
                            />
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p
                    className="mt-6 text-xs italic font-light"
                    style={{
                      color:
                        'color-mix(in srgb, var(--shop-card) 78%, transparent)',
                    }}
                  >
                    หายใจเข้า… ขยับ… หายใจออก… ปล่อย ผ้าจะตามไปกับลมหายใจคุณเสมอ
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Related rail ───────────────────────────────────────── */}
      {related.length > 0 ? (
        <section className="py-14 lg:py-20" style={{ background: 'var(--shop-card)' }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] font-medium mb-2"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  ฝึกคู่กันลงตัว
                </div>
                <h2
                  className="text-3xl sm:text-4xl font-light tracking-tight"
                  style={{
                    fontFamily: 'var(--shop-font-display)',
                    color: 'var(--shop-ink)',
                  }}
                >
                  จับคู่ flow ของคุณ
                </h2>
              </div>
              <Link
                href={`/stores/${store.slug}/products`}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--shop-primary)' }}
              >
                ดูคอลเล็กชันทั้งหมด <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7">
              {related.slice(0, 8).map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/stores/${store.slug}/products/${r.id}`}
                    className="group block rounded-3xl overflow-hidden transition-all hover:-translate-y-1"
                    style={{
                      background:
                        'color-mix(in srgb, var(--shop-primary) 5%, var(--shop-card))',
                      border:
                        '1px solid color-mix(in srgb, var(--shop-primary) 12%, transparent)',
                    }}
                  >
                    <div
                      className="relative aspect-[3/4] overflow-hidden"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, color-mix(in srgb, var(--shop-primary) 10%, var(--shop-card)) 0%, var(--shop-card) 80%)',
                      }}
                    >
                      <BreathingMandala className="absolute inset-0 w-full h-full opacity-60" />
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          <Leaf className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {r.categoryName ? (
                        <div
                          className="text-[10px] uppercase tracking-[0.16em] mb-1 font-medium"
                          style={{ color: 'var(--shop-primary)' }}
                        >
                          {r.categoryName}
                        </div>
                      ) : null}
                      <h3
                        className="text-sm font-light leading-snug line-clamp-2 mb-3"
                        style={{
                          fontFamily: 'var(--shop-font-display)',
                          color: 'var(--shop-ink)',
                        }}
                      >
                        {r.title}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-base font-medium"
                          style={{ color: 'var(--shop-primary)' }}
                        >
                          {formatTHB(r.priceTHB)}
                        </span>
                        {r.compareAtPriceTHB && r.compareAtPriceTHB > r.priceTHB ? (
                          <span
                            className="text-xs line-through"
                            style={{ color: 'var(--shop-ink-muted)' }}
                          >
                            {formatTHB(r.compareAtPriceTHB)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}

// Re-export named for the registry / adapter wiring
export const ProductDetailPage = SalukiYogaProductDetail;

// ────────────────────────────────────────────────────────────────────
// Local helpers
// ────────────────────────────────────────────────────────────────────

function AccordionItem({
  title,
  open,
  onClick,
  children,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--shop-card)',
        border: '1px solid color-mix(in srgb, var(--shop-primary) 14%, transparent)',
      }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-sm sm:text-base font-medium"
        style={{ color: 'var(--shop-ink)' }}
      >
        <span>{title}</span>
        <ChevronDown
          className="h-4 w-4 transition-transform"
          style={{
            color: 'var(--shop-primary)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {open ? (
        <div
          className="px-5 pb-5 pt-1"
          style={{
            borderTop:
              '1px solid color-mix(in srgb, var(--shop-primary) 10%, transparent)',
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function firstLine(desc?: string | null): string | undefined {
  if (!desc) return undefined;
  const trimmed = desc.trim();
  if (!trimmed) return undefined;
  const line = trimmed.split(/\n+/)[0];
  return line.length > 220 ? `${line.slice(0, 217)}…` : line;
}

function swatchHex(name: string): string {
  // Yoga-wellness leaning palette — sage / sand / cream / clay
  const palette: Record<string, string> = {
    // English
    sage: '#9CAF9A',
    moss: '#7E8F6E',
    olive: '#88965B',
    sand: '#E5D7B8',
    cream: '#F5EDDC',
    clay: '#C9886A',
    terracotta: '#B5634A',
    blush: '#E2B8B0',
    rose: '#D6A3A0',
    plum: '#7B5B7A',
    lavender: '#B7A5C9',
    sky: '#A8C4D6',
    ocean: '#6E97B1',
    charcoal: '#3F3D3A',
    black: '#1F1F1D',
    white: '#FAF7F2',
    ivory: '#F2EAD8',
    cocoa: '#6C4A37',
    forest: '#3F5D45',
    eucalyptus: '#9DBBA6',
    // Thai labels
    เซจ: '#9CAF9A',
    มอส: '#7E8F6E',
    เขียวมอส: '#7E8F6E',
    มะกอก: '#88965B',
    ทราย: '#E5D7B8',
    ครีม: '#F5EDDC',
    ดินเผา: '#C9886A',
    อิฐ: '#B5634A',
    ชมพู: '#E2B8B0',
    กุหลาบ: '#D6A3A0',
    ลาเวนเดอร์: '#B7A5C9',
    ฟ้า: '#A8C4D6',
    ทะเล: '#6E97B1',
    เทา: '#A39B92',
    ดำ: '#1F1F1D',
    ขาว: '#FAF7F2',
    งาช้าง: '#F2EAD8',
    น้ำตาล: '#6C4A37',
    เขียวป่า: '#3F5D45',
    ยูคาลิป: '#9DBBA6',
  };
  const key = name.trim().toLowerCase();
  for (const [k, v] of Object.entries(palette)) {
    if (k.toLowerCase() === key) return v;
  }
  // fall back — derive a soft sage-leaning shade from the label so each
  // unmapped colour still renders as a calm wellness swatch instead of a
  // hard system grey.
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const h = 70 + (hash % 90); // greens → warm sands
  const s = 18 + (hash % 18);
  const l = 64 + (hash % 12);
  return `hsl(${h} ${s}% ${l}%)`;
}

function contrastInk(bg: string): string {
  // Pick a readable check-mark colour over the swatch.  Cheap luminance
  // sniff that handles both hex and hsl outputs from swatchHex.
  if (bg.startsWith('hsl')) {
    const m = /hsl\(\s*\d+\s+\d+%\s+(\d+)%/i.exec(bg);
    if (m) {
      const l = parseInt(m[1], 10);
      return l > 60 ? '#1F1F1D' : '#FAF7F2';
    }
    return '#FAF7F2';
  }
  if (bg.startsWith('#') && (bg.length === 7 || bg.length === 4)) {
    const norm =
      bg.length === 4
        ? '#' + [...bg.slice(1)].map((c) => c + c).join('')
        : bg;
    const r = parseInt(norm.slice(1, 3), 16);
    const g = parseInt(norm.slice(3, 5), 16);
    const b = parseInt(norm.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.62 ? '#1F1F1D' : '#FAF7F2';
  }
  return '#FAF7F2';
}
