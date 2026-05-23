'use client';

/**
 * inkstone-paper — bespoke PDP (stationery zen)
 *
 * Atelier-style product detail for the inkstone-paper template. Visual
 * language matches the Homepage's washi-paper / sumi-ink palette:
 *   • cream paper field (#f7f1e3 family) for the page surface
 *   • charcoal sumi ink (#3a2e22) for headlines and primary CTAs
 *   • gold-ochre (#c9974b) reserved for the brush/calligraphy kicker accents
 *
 * Layout
 *   1. Breadcrumb (home / store / category / product)
 *   2. Gallery on the left (paper-texture macro frame, thumbs underneath)
 *   3. Buy column on the right — kicker, title, kanji handwritten label,
 *      price (formatTHB), color variants, GSM weight chips, qty, two CTAs,
 *      trust badges (Japan / EU origin / artisan boxed), spec table, care
 *      instructions accordion
 *   4. Description panel — paper specs, weight, dimensions
 *   5. Related products rail — same washi-card treatment as Homepage
 *
 * Tokens — uses `var(--shop-*)` for adapter-driven theme colors. The
 * stationery cream / sumi-ink / gold-ochre palette is local to the
 * inkstone-paper visual family and shared with Homepage.tsx; nothing
 * else is hardcoded.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

// ───────────────────────────────────────────────────────────────────────
// Local palette — kept in sync with Homepage.tsx so the buyer journey
// (home → PDP → cart) has one continuous washi/sumi visual mood.
// ───────────────────────────────────────────────────────────────────────
const PAPER_CREAM = '#f7f1e3';
const PAPER_DEEP = '#e6dcc4';
const SUMI_INK = '#3a2e22';
const GOLD_OCHRE = '#c9974b';

// SVG noise filter used by the washi paper texture overlay (same shape as
// Homepage so the surfaces feel like the same sheet of paper).
const WASHI_TEXTURE_URL =
  "url('data:image/svg+xml,%3Csvg width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noise\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.8\\' numOctaves=\\'4\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100\\' height=\\'100\\' filter=\\'url(%23noise)\\' opacity=\\'0.15\\'/%3E%3C/svg%3E')";

// Brushstroke / calligraphy ink decorations rendered inline as SVG so they
// scale crisply at every breakpoint and respect the sumi palette.
function BrushUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 14"
      aria-hidden="true"
      className={className}
      style={{ display: 'block' }}
    >
      <path
        d="M2 8 C 40 2, 80 12, 120 6 S 198 4, 198 4"
        fill="none"
        stroke={SUMI_INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function PaperGalleryFallback({ label }: { label: string }) {
  // Stylised stack-of-paper illustration used when the product carries no
  // imagery. Mirrors the empty-state of Homepage cards.
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center"
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" width="48%" role="presentation">
        <rect x="40" y="60" width="120" height="100" rx="2" fill={PAPER_DEEP} stroke={SUMI_INK} strokeWidth={1.5} />
        <rect x="48" y="52" width="120" height="100" rx="2" fill={PAPER_CREAM} stroke={SUMI_INK} strokeWidth={1.5} />
        <rect x="56" y="44" width="120" height="100" rx="2" fill="#ffffff" stroke={SUMI_INK} strokeWidth={1.5} />
        <path d="M70 80 Q 100 70 130 80 T 170 80" fill="none" stroke={GOLD_OCHRE} strokeWidth={2} strokeLinecap="round" />
        <path d="M70 100 Q 100 90 130 100 T 170 100" fill="none" stroke={SUMI_INK} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
        <path d="M70 120 Q 100 110 130 120" fill="none" stroke={SUMI_INK} strokeWidth={1.5} strokeLinecap="round" opacity={0.35} />
      </svg>
      <span
        className="mt-4 font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.3em]"
        style={{ color: `${SUMI_INK}80` }}
      >
        {label}
      </span>
    </div>
  );
}

// Color swatch labels translated to hex for the variant picker. The bespoke
// inkstone palette favours muted ink tones — anything not in this map
// falls back to a neutral charcoal so foreign / supplier color names
// render gracefully without a hard error.
const COLOR_HEX: Record<string, string> = {
  'ดำ': '#1a1a1a',
  black: '#1a1a1a',
  sumi: '#1a1a1a',
  ink: '#1a1a1a',
  'น้ำเงิน': '#1e3a5f',
  navy: '#1e3a5f',
  'กรม': '#1e3a5f',
  'น้ำตาล': '#92400E',
  brown: '#92400E',
  'แดง': '#9B1C1C',
  red: '#9B1C1C',
  'เขียว': '#3F6212',
  green: '#3F6212',
  'ม่วง': '#5B21B6',
  purple: '#5B21B6',
  'ครีม': PAPER_CREAM,
  cream: PAPER_CREAM,
  'ขาว': '#ffffff',
  white: '#ffffff',
  'ทอง': GOLD_OCHRE,
  gold: GOLD_OCHRE,
};

function colorToHex(name: string | null | undefined): string {
  if (!name) return SUMI_INK;
  const hit = COLOR_HEX[name.toLowerCase()] ?? COLOR_HEX[name];
  return hit ?? SUMI_INK;
}

// ───────────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────────

export function InkstonePaperProductDetail({
  store,
  product,
  related,
}: ProductDetailProps) {
  const add = useCart((s) => s.add);

  // Local-only UI state — Gallery active slide, picker selections, qty.
  // No server roundtrip; everything just feeds the cart on Add.
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  // Gallery deduped against `imageUrl` so the cover photo doesn't get
  // listed twice when the importer saved it into both slots.
  const gallery = useMemo(() => {
    const all = [product.imageUrl, ...(product.images ?? [])].filter(
      (x): x is string => !!x,
    );
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images]);

  // Unique color labels for the variant swatch row. Variants without a
  // colorLabel are skipped (those are pure size/GSM variants instead).
  const colorVariants = useMemo(() => {
    const seen = new Map<string, { label: string; hex: string }>();
    for (const v of product.variants ?? []) {
      if (v.colorLabel && !seen.has(v.colorLabel)) {
        seen.set(v.colorLabel, {
          label: v.colorLabel,
          hex: colorToHex(v.colorLabel),
        });
      }
    }
    return Array.from(seen.values());
  }, [product.variants]);

  // GSM / size-style chips. Inkstone treats `sizeLabel` as the paper
  // weight or sheet dimension (e.g. "120gsm", "A5", "B6") since the store
  // is a stationery shop. Labels are passed through unchanged so the
  // supplier's naming wins.
  const sizeVariants = useMemo(() => {
    const seen = new Set<string>();
    for (const v of product.variants ?? []) {
      if (v.sizeLabel) seen.add(v.sizeLabel);
    }
    return Array.from(seen);
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorVariants[0]?.label ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizeVariants[0] ?? null,
  );

  const hasDiscount =
    product.originalPriceTHB != null &&
    product.originalPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round(
        (1 - product.priceTHB / (product.originalPriceTHB as number)) * 100,
      )
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

  // Three trust badges that map to the brand promise on Homepage —
  // Japan/EU sourcing, artisan packaging, free shipping over ฿890.
  const trustBadges: { jp: string; th: string; sub: string }[] = [
    { jp: '日本産', th: 'นำเข้าจากญี่ปุ่น', sub: 'เกียวโต · โตเกียว' },
    { jp: '欧州産', th: 'วัสดุจากยุโรป', sub: 'อิตาลี · เยอรมนี' },
    { jp: '職人包装', th: 'ห่อด้วยมือ', sub: 'ทุกชิ้นพร้อมส่ง' },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: PAPER_CREAM,
        color: SUMI_INK,
        backgroundImage: WASHI_TEXTURE_URL,
      }}
    >
      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-7xl px-4 pt-8 pb-2 sm:px-6 lg:px-8"
      >
        <ol
          className="flex flex-wrap items-center gap-x-2 gap-y-1 font-[family:var(--font-prompt)] text-[11px] uppercase tracking-[0.2em]"
          style={{ color: `${SUMI_INK}99` }}
        >
          <li>
            <Link
              href={`/stores/${store.slug}`}
              className="transition-colors hover:text-[color:var(--shop-primary,#3a2e22)]"
              style={{ color: `${SUMI_INK}99` }}
            >
              หน้าแรก
            </Link>
          </li>
          <li aria-hidden="true">·</li>
          <li>
            <Link
              href={`/stores/${store.slug}/category`}
              className="transition-colors hover:text-[color:var(--shop-primary,#3a2e22)]"
              style={{ color: `${SUMI_INK}99` }}
            >
              เครื่องเขียน
            </Link>
          </li>
          {product.categoryName && (
            <>
              <li aria-hidden="true">·</li>
              <li>
                <Link
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                  className="transition-colors hover:text-[color:var(--shop-primary,#3a2e22)]"
                  style={{ color: `${SUMI_INK}99` }}
                >
                  {product.categoryName}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">·</li>
          <li
            aria-current="page"
            className="truncate"
            style={{ color: SUMI_INK, maxWidth: 320 }}
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ── Hero · Gallery + Buy column ────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gallery — paper-texture frame, sumi border, thumbs in row */}
          <div>
            <div
              className="relative aspect-[4/5] w-full overflow-hidden shadow-sm"
              style={{
                background: PAPER_DEEP,
                border: `1px solid ${SUMI_INK}1a`,
              }}
            >
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  background: PAPER_CREAM,
                  backgroundImage: WASHI_TEXTURE_URL,
                }}
              />

              {/* Hand-written eyebrow inside the frame, rotated ink stamp
                  style — same gesture as Homepage product cards. */}
              <div className="absolute left-6 top-6 z-20 -rotate-[3deg]">
                <span
                  className="block font-[family:var(--font-kanit)] text-xl italic tracking-widest"
                  style={{ color: GOLD_OCHRE }}
                >
                  紙の心
                </span>
                <span
                  className="block font-[family:var(--font-prompt)] text-[10px] tracking-widest"
                  style={{ color: `${SUMI_INK}99` }}
                >
                  จิตวิญญาณของกระดาษ
                </span>
              </div>

              {/* Discount stamp — only when the supplier carries a was-price */}
              {hasDiscount && (
                <div
                  className="absolute right-6 top-6 z-20 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    background: SUMI_INK,
                    color: PAPER_CREAM,
                  }}
                  aria-label={`ลด ${discountPct}%`}
                >
                  <div className="text-center font-[family:var(--font-kanit)] leading-none">
                    <div className="text-[10px] tracking-[0.2em]">SALE</div>
                    <div className="text-lg font-light">−{discountPct}%</div>
                  </div>
                </div>
              )}

              <div className="relative z-10 flex h-full w-full items-center justify-center p-10">
                {gallery[activeImage] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={gallery[activeImage]}
                    alt={product.title}
                    className="h-full w-full object-contain mix-blend-multiply drop-shadow-xl transition-transform duration-700 ease-out"
                  />
                ) : (
                  <PaperGalleryFallback label="No image" />
                )}
              </div>

              {/* Sumi corner mark — single calligraphy stroke bottom-right */}
              <div className="absolute bottom-4 right-4 z-20 opacity-60">
                <svg viewBox="0 0 40 40" width={36} height={36} aria-hidden="true">
                  <path
                    d="M6 30 C 15 10, 28 12, 34 28"
                    fill="none"
                    stroke={SUMI_INK}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Thumb strip */}
            {gallery.length > 1 && (
              <div
                className="mt-4 flex gap-3 overflow-x-auto"
                role="list"
                aria-label="ภาพสินค้า"
              >
                {gallery.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    aria-label={`ดูภาพที่ ${idx + 1}`}
                    aria-current={idx === activeImage ? 'true' : undefined}
                    role="listitem"
                    className="relative aspect-square w-20 flex-shrink-0 overflow-hidden transition-all duration-300"
                    style={{
                      background: PAPER_DEEP,
                      border: `1px solid ${idx === activeImage ? SUMI_INK : `${SUMI_INK}1a`}`,
                      opacity: idx === activeImage ? 1 : 0.7,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy column */}
          <div className="flex flex-col">
            {/* Kicker — kanji calligraphy + small Thai label */}
            <div className="mb-4 flex items-center gap-3">
              <span
                className="font-[family:var(--font-kanit)] text-base italic tracking-[0.3em]"
                style={{ color: GOLD_OCHRE }}
              >
                文房具
              </span>
              <span
                className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.3em]"
                style={{ color: `${SUMI_INK}80` }}
              >
                เครื่องเขียนแห่งฤดูกาล
              </span>
            </div>

            <h1
              className="font-[family:var(--font-kanit)] text-3xl font-light leading-tight tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: SUMI_INK }}
            >
              {product.title}
            </h1>

            <div className="mt-3 max-w-[12rem]">
              <BrushUnderline />
            </div>

            {/* Price */}
            <div className="mt-8 flex items-baseline gap-4">
              <span
                className="font-[family:var(--font-kanit)] text-3xl font-light"
                style={{ color: SUMI_INK }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {hasDiscount && product.originalPriceTHB != null && (
                <>
                  <span
                    className="font-[family:var(--font-prompt)] text-base line-through"
                    style={{ color: `${SUMI_INK}66` }}
                  >
                    {formatTHB(product.originalPriceTHB)}
                  </span>
                  <span
                    className="font-[family:var(--font-prompt)] text-xs uppercase tracking-[0.2em]"
                    style={{ color: GOLD_OCHRE }}
                  >
                    ประหยัด {formatTHB(product.originalPriceTHB - product.priceTHB)}
                  </span>
                </>
              )}
            </div>

            {/* Short description teaser — paper specs preview */}
            {product.description && (
              <p
                className="mt-6 max-w-[44ch] font-[family:var(--font-prompt)] text-sm font-light leading-relaxed"
                style={{ color: `${SUMI_INK}cc` }}
              >
                {product.description.length > 220
                  ? `${product.description.slice(0, 220)}…`
                  : product.description}
              </p>
            )}

            {/* Color variant swatches */}
            {colorVariants.length > 0 && (
              <div className="mt-10">
                <div className="mb-3 flex items-baseline justify-between">
                  <span
                    className="font-[family:var(--font-prompt)] text-[11px] uppercase tracking-[0.3em]"
                    style={{ color: `${SUMI_INK}99` }}
                  >
                    สีหมึก · INK
                  </span>
                  <span
                    className="font-[family:var(--font-kanit)] text-sm italic"
                    style={{ color: SUMI_INK }}
                  >
                    {selectedColor ?? colorVariants[0].label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="เลือกสี">
                  {colorVariants.map((v) => {
                    const active = v.label === selectedColor;
                    return (
                      <button
                        key={v.label}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={v.label}
                        onClick={() => setSelectedColor(v.label)}
                        className="relative h-10 w-10 transition-transform duration-300 hover:scale-110"
                        style={{
                          background: v.hex,
                          border: `1px solid ${SUMI_INK}33`,
                          boxShadow: active
                            ? `0 0 0 2px ${PAPER_CREAM}, 0 0 0 3px ${SUMI_INK}`
                            : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* GSM / size chips */}
            {sizeVariants.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 flex items-baseline justify-between">
                  <span
                    className="font-[family:var(--font-prompt)] text-[11px] uppercase tracking-[0.3em]"
                    style={{ color: `${SUMI_INK}99` }}
                  >
                    น้ำหนัก / ขนาด · GSM
                  </span>
                </div>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="เลือกน้ำหนักกระดาษ">
                  {sizeVariants.map((s) => {
                    const active = s === selectedSize;
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedSize(s)}
                        className="font-[family:var(--font-prompt)] text-xs uppercase tracking-[0.2em] transition-colors duration-300"
                        style={{
                          padding: '10px 18px',
                          background: active ? SUMI_INK : 'transparent',
                          color: active ? PAPER_CREAM : SUMI_INK,
                          border: `1px solid ${SUMI_INK}`,
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + CTAs */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <div
                className="inline-flex items-center"
                role="group"
                aria-label="จำนวน"
                style={{ border: `1px solid ${SUMI_INK}` }}
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="ลดจำนวน"
                  className="px-4 py-3 font-[family:var(--font-kanit)] text-lg transition-colors hover:bg-[color:var(--shop-primary,#3a2e22)]/5"
                  style={{ color: SUMI_INK }}
                >
                  −
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
                  className="w-14 bg-transparent text-center font-[family:var(--font-kanit)] text-base outline-none"
                  style={{ color: SUMI_INK }}
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="เพิ่มจำนวน"
                  className="px-4 py-3 font-[family:var(--font-kanit)] text-lg transition-colors hover:bg-[color:var(--shop-primary,#3a2e22)]/5"
                  style={{ color: SUMI_INK }}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 font-[family:var(--font-prompt)] text-xs uppercase tracking-[0.3em] transition-all duration-500"
                style={{
                  background: SUMI_INK,
                  color: PAPER_CREAM,
                  padding: '16px 24px',
                  border: `1px solid ${SUMI_INK}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = GOLD_OCHRE;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = GOLD_OCHRE;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = SUMI_INK;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = SUMI_INK;
                }}
              >
                ใส่ตะกร้า · 籠に入れる
              </button>
            </div>

            {/* Trust badges — Japan / EU origin / artisan boxed */}
            <div
              className="mt-10 grid grid-cols-1 gap-px sm:grid-cols-3"
              style={{ background: `${SUMI_INK}1a` }}
            >
              {trustBadges.map((b) => (
                <div
                  key={b.jp}
                  className="flex flex-col items-center gap-1 px-4 py-5 text-center"
                  style={{ background: PAPER_CREAM }}
                >
                  <span
                    className="font-[family:var(--font-kanit)] text-base italic tracking-widest"
                    style={{ color: GOLD_OCHRE }}
                  >
                    {b.jp}
                  </span>
                  <span
                    className="font-[family:var(--font-prompt)] text-sm font-light"
                    style={{ color: SUMI_INK }}
                  >
                    {b.th}
                  </span>
                  <span
                    className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: `${SUMI_INK}80` }}
                  >
                    {b.sub}
                  </span>
                </div>
              ))}
            </div>

            {/* Spec table — care + paper specs as a discreet bordered grid */}
            <dl
              className="mt-10 grid grid-cols-1 text-sm"
              style={{
                border: `1px solid ${SUMI_INK}1a`,
                background: `${PAPER_CREAM}80`,
              }}
            >
              {[
                { jp: '原産国', th: 'แหล่งผลิต', val: 'ญี่ปุ่น (เกียวโต · โตเกียว)' },
                { jp: '素材', th: 'วัสดุ', val: product.categoryName ?? 'กระดาษวาชิ · หมึกซึม' },
                {
                  jp: '色',
                  th: 'สี',
                  val: selectedColor ?? (colorVariants[0]?.label ?? '—'),
                },
                {
                  jp: '寸法',
                  th: 'น้ำหนัก / ขนาด',
                  val: selectedSize ?? (sizeVariants[0] ?? '—'),
                },
                {
                  jp: '配送',
                  th: 'การจัดส่ง',
                  val: 'ส่งฟรีเมื่อสั่ง ฿890+ · ห่อด้วยกระดาษวาชิ',
                },
              ].map((row, i, arr) => (
                <div
                  key={row.jp}
                  className="grid grid-cols-[auto_1fr] gap-4 px-5 py-4"
                  style={{
                    borderBottom:
                      i < arr.length - 1 ? `1px solid ${SUMI_INK}10` : 'none',
                  }}
                >
                  <dt className="flex flex-col">
                    <span
                      className="font-[family:var(--font-kanit)] text-sm italic"
                      style={{ color: GOLD_OCHRE }}
                    >
                      {row.jp}
                    </span>
                    <span
                      className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.2em]"
                      style={{ color: `${SUMI_INK}80` }}
                    >
                      {row.th}
                    </span>
                  </dt>
                  <dd
                    className="self-center text-right font-[family:var(--font-prompt)] text-sm font-light"
                    style={{ color: SUMI_INK }}
                  >
                    {row.val}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Description panel — full paper specs ────────────────────── */}
      {product.description && (
        <section
          className="py-20"
          style={{
            background: SUMI_INK,
            color: PAPER_CREAM,
          }}
        >
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <span
              className="font-[family:var(--font-kanit)] text-xl italic tracking-widest"
              style={{ color: GOLD_OCHRE }}
            >
              筆の物語
            </span>
            <h2
              className="mt-4 font-[family:var(--font-kanit)] text-2xl font-light leading-snug sm:text-3xl md:text-4xl"
              style={{ color: PAPER_CREAM }}
            >
              เรื่องราวของชิ้นงานนี้
            </h2>
            <div className="mx-auto mt-6 max-w-[8rem] opacity-80">
              <BrushUnderline />
            </div>
            <p
              className="mx-auto mt-8 max-w-2xl whitespace-pre-line text-left font-[family:var(--font-prompt)] text-sm font-light leading-loose sm:text-base"
              style={{ color: PAPER_DEEP }}
            >
              {product.description}
            </p>
          </div>
        </section>
      )}

      {/* ── Related rail ───────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-center text-center">
            <span
              className="font-[family:var(--font-kanit)] text-xl italic tracking-widest"
              style={{ color: GOLD_OCHRE }}
            >
              他の作品
            </span>
            <h2
              className="mt-3 font-[family:var(--font-kanit)] text-2xl font-light tracking-wide sm:text-3xl"
              style={{ color: SUMI_INK }}
            >
              ชิ้นงานอื่นจากร้านนี้
            </h2>
            <div className="mt-3 h-px w-12" style={{ background: GOLD_OCHRE }} />
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((r) => (
              <Link
                key={r.id}
                href={`/stores/${store.slug}/products/${r.id}`}
                className="group flex flex-col"
              >
                <div
                  className="relative mb-4 aspect-[4/5] overflow-hidden shadow-sm transition-shadow duration-500 group-hover:shadow-md"
                  style={{
                    background: PAPER_DEEP,
                    border: `1px solid ${SUMI_INK}1a`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-90"
                    style={{
                      background: PAPER_CREAM,
                      backgroundImage: WASHI_TEXTURE_URL,
                    }}
                  />
                  <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
                    {r.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="h-full w-full object-contain mix-blend-multiply drop-shadow-lg transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <PaperGalleryFallback label="No image" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <h3
                    className="line-clamp-2 font-[family:var(--font-kanit)] text-base font-light transition-colors"
                    style={{ color: SUMI_INK }}
                  >
                    {r.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-3">
                    <span
                      className="font-[family:var(--font-prompt)] text-sm"
                      style={{ color: SUMI_INK }}
                    >
                      {formatTHB(r.priceTHB)}
                    </span>
                    {r.compareAtPriceTHB && (
                      <span
                        className="font-[family:var(--font-prompt)] text-xs line-through"
                        style={{ color: `${SUMI_INK}80` }}
                      >
                        {formatTHB(r.compareAtPriceTHB)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default InkstonePaperProductDetail;
