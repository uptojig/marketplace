'use client';

/**
 * tinyhand-wooden-toys — Bespoke ProductDetail page
 *
 * Vibe: wooden toys for kids · warm wood / pastel / cream · rounded
 * sans-serif · playful icons · soft shadows. All color tokens come from
 * `var(--shop-*)` and `color-mix(...)` derivatives — no hardcoded hex.
 *
 * Renders the storefront `ProductDetailProps` shape so the registry
 * `pdp` slot can swap from the shared adapter to this page without any
 * data plumbing changes.
 */

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
  IconShoppingBag,
  IconBolt,
  IconShieldCheck,
  IconLeaf,
  IconTruck,
  IconRefresh,
  IconStarFilled,
  IconCheck,
  IconMinus,
  IconPlus,
  IconRulerMeasure,
  IconBabyCarriage,
} from '@tabler/icons-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

// ─── color token helpers ──────────────────────────────────────────────
// Wooden-toys palette derived purely from `--shop-*` tokens. We use
// `color-mix` to derive cream / wood / soft-shadow tints so the page
// always matches whatever the store admin sets as primary/accent.
const TONE = {
  cream: 'color-mix(in srgb, var(--shop-bg) 85%, white 15%)',
  card: 'var(--shop-card)',
  wood: 'var(--shop-primary)',
  woodDeep: 'color-mix(in srgb, var(--shop-primary) 70%, var(--shop-ink) 30%)',
  woodSoft: 'color-mix(in srgb, var(--shop-primary) 18%, var(--shop-bg) 82%)',
  ink: 'var(--shop-ink)',
  inkMuted: 'var(--shop-ink-muted)',
  border: 'var(--shop-border)',
  accent: 'var(--shop-accent)',
  accentSoft: 'color-mix(in srgb, var(--shop-accent) 18%, var(--shop-bg) 82%)',
  pastelPeach: 'color-mix(in srgb, var(--shop-primary) 28%, white 72%)',
  pastelSage: 'color-mix(in srgb, var(--shop-accent) 28%, white 72%)',
  pastelSky: 'color-mix(in srgb, var(--shop-primary) 12%, white 88%)',
  shadow: '0 8px 24px -10px color-mix(in srgb, var(--shop-primary) 25%, transparent)',
  shadowSoft: '0 4px 14px -6px color-mix(in srgb, var(--shop-ink) 18%, transparent)',
} as const;

// ─── small SVG illustrations (placeholders for "in-play" scenes) ──────
function PlaySceneIllustration({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 240 240" className="w-3/4 max-w-[240px]" aria-hidden="true">
      {/* sun */}
      <circle cx={50} cy={50} r={22} fill={tint} opacity={0.85} />
      {/* ground */}
      <ellipse cx={120} cy={200} rx={100} ry={14} fill={tint} opacity={0.35} />
      {/* wooden block tower */}
      <rect x={80} y={150} width={50} height={40} rx={6} fill={tint} />
      <rect x={88} y={120} width={34} height={30} rx={5} fill={tint} opacity={0.85} />
      <rect x={94} y={95} width={22} height={25} rx={4} fill={tint} opacity={0.7} />
      {/* ball */}
      <circle cx={160} cy={175} r={15} fill={tint} opacity={0.65} />
      {/* mini star */}
      <path d="M180 70 l4 8 9 1 -6.5 6 1.5 9 -8-4.5 -8 4.5 1.5-9 -6.5-6 9-1z" fill={tint} opacity={0.6} />
    </svg>
  );
}

function FlatProductIllustration({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 240 240" className="w-3/4 max-w-[240px]" aria-hidden="true">
      {/* simple shape arrangement for "flat" product photo placeholder */}
      <rect x={60} y={70} width={120} height={100} rx={20} fill={tint} opacity={0.85} />
      <circle cx={120} cy={120} r={26} fill="white" opacity={0.7} />
      <circle cx={120} cy={120} r={12} fill={tint} />
    </svg>
  );
}

// ─── trust badges ─────────────────────────────────────────────────────
const TRUST_BADGES = [
  { icon: IconShieldCheck, title: 'มาตรฐาน CE / EN71', desc: 'ผ่านการทดสอบความปลอดภัยยุโรป' },
  { icon: IconLeaf, title: 'สีน้ำจากผัก', desc: 'Non-toxic · ปลอดภัยเมื่อเด็กเอาเข้าปาก' },
  { icon: IconBabyCarriage, title: 'ออกแบบสำหรับเด็ก', desc: 'ขอบมน ไม่มีชิ้นส่วนแหลมคม' },
  { icon: IconTruck, title: 'ส่งฟรี ฿890+', desc: 'ส่งภายใน 1–3 วัน · มี tracking' },
] as const;

// ─── color label → token-derived swatch ───────────────────────────────
// Avoids hardcoded hex — every swatch is a tint of shop tokens.
function colorSwatchToken(label: string): string {
  const key = label.toLowerCase().trim();
  const map: Record<string, string> = {
    natural: 'color-mix(in srgb, var(--shop-primary) 35%, white 65%)',
    ธรรมชาติ: 'color-mix(in srgb, var(--shop-primary) 35%, white 65%)',
    wood: 'var(--shop-primary)',
    ไม้: 'var(--shop-primary)',
    cream: 'color-mix(in srgb, var(--shop-bg) 60%, white 40%)',
    ครีม: 'color-mix(in srgb, var(--shop-bg) 60%, white 40%)',
    sage: 'color-mix(in srgb, var(--shop-accent) 35%, white 65%)',
    เซจ: 'color-mix(in srgb, var(--shop-accent) 35%, white 65%)',
    peach: 'color-mix(in srgb, var(--shop-primary) 28%, white 72%)',
    พีช: 'color-mix(in srgb, var(--shop-primary) 28%, white 72%)',
    sky: 'color-mix(in srgb, var(--shop-accent) 25%, white 75%)',
    ฟ้า: 'color-mix(in srgb, var(--shop-accent) 25%, white 75%)',
    pink: 'color-mix(in srgb, var(--shop-primary) 25%, white 75%)',
    ชมพู: 'color-mix(in srgb, var(--shop-primary) 25%, white 75%)',
  };
  return map[key] ?? 'color-mix(in srgb, var(--shop-ink) 25%, white 75%)';
}

// ─── component ────────────────────────────────────────────────────────
export function TinyhandProductDetail({ store, product, related }: ProductDetailProps) {
  // gallery: in-play + flat
  // Build a gallery from real images + synthetic "in-play" / "flat"
  // illustration slots so the page is rich even before assets land.
  const realImages = useMemo(() => {
    const base = product.images && product.images.length > 0 ? product.images : [];
    const head = product.imageUrl ? [product.imageUrl, ...base.filter((s) => s !== product.imageUrl)] : base;
    return head.filter((s): s is string => Boolean(s));
  }, [product.images, product.imageUrl]);

  const gallery = useMemo(() => {
    const slots: Array<
      | { kind: 'photo'; src: string }
      | { kind: 'play' }
      | { kind: 'flat' }
    > = [];
    if (realImages[0]) slots.push({ kind: 'photo', src: realImages[0] });
    slots.push({ kind: 'play' });
    if (realImages[1]) slots.push({ kind: 'photo', src: realImages[1] });
    slots.push({ kind: 'flat' });
    realImages.slice(2).forEach((src) => slots.push({ kind: 'photo', src }));
    return slots;
  }, [realImages]);

  const [activeIdx, setActiveIdx] = useState(0);
  const activeSlot = gallery[activeIdx] ?? gallery[0];

  // variant state
  const colorLabels = useMemo(() => {
    const set = new Set<string>();
    product.variants.forEach((v) => v.colorLabel && set.add(v.colorLabel));
    return Array.from(set);
  }, [product.variants]);

  const sizeLabels = useMemo(() => {
    const set = new Set<string>();
    product.variants.forEach((v) => v.sizeLabel && set.add(v.sizeLabel));
    return Array.from(set);
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(colorLabels[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizeLabels[0]);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);

  // cart
  const add = useCart((s) => s.add);

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

  const discount =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
      ? Math.round((1 - product.priceTHB / product.originalPriceTHB) * 100)
      : 0;

  const tintForActive = TONE.wood;

  // age-range / safety / material inference from description
  const desc = product.description?.trim() || '';

  return (
    <main
      className="min-h-screen relative font-[family:var(--font-prompt)]"
      style={{
        background: TONE.cream,
        color: TONE.ink,
      }}
    >
      {/* soft kraft-paper texture, token-tinted */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--shop-primary) 8%, transparent) 0, transparent 35%), radial-gradient(circle at 80% 80%, color-mix(in srgb, var(--shop-accent) 8%, transparent) 0, transparent 35%)',
        }}
        aria-hidden="true"
      />

      {/* ── BREADCRUMB ───────────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm flex-wrap"
          style={{ color: TONE.inkMuted }}
        >
          <Link href={`/stores/${store.slug}`} className="hover:underline" style={{ color: TONE.woodDeep }}>
            หน้าแรก
          </Link>
          <IconChevronRight size={14} aria-hidden="true" />
          <Link
            href={`/stores/${store.slug}/products`}
            className="hover:underline"
            style={{ color: TONE.woodDeep }}
          >
            ของเล่นทั้งหมด
          </Link>
          {product.categoryName && (
            <>
              <IconChevronRight size={14} aria-hidden="true" />
              <Link
                href={`/stores/${store.slug}/products?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:underline"
                style={{ color: TONE.woodDeep }}
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <IconChevronRight size={14} aria-hidden="true" />
          <span className="truncate max-w-[60vw]" style={{ color: TONE.ink, fontWeight: 600 }}>
            {product.title}
          </span>
        </nav>
      </div>

      {/* ── MAIN GRID ────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14">
          {/* ── GALLERY (in-play + flat) ─────────────────────────── */}
          <div>
            {/* main image */}
            <div
              className="relative aspect-square w-full rounded-[36px] overflow-hidden flex items-center justify-center"
              style={{
                background: TONE.pastelSky,
                boxShadow: TONE.shadow,
                border: `1px solid ${TONE.border}`,
              }}
            >
              {/* tape decoration */}
              <span
                aria-hidden="true"
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-6 rotate-[-3deg] rounded-sm"
                style={{
                  background: 'color-mix(in srgb, var(--shop-primary) 35%, white 65%)',
                  opacity: 0.85,
                }}
              />
              {activeSlot?.kind === 'photo' ? (
                <Image
                  src={activeSlot.src}
                  alt={product.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain p-10"
                  priority
                />
              ) : activeSlot?.kind === 'play' ? (
                <div className="flex flex-col items-center gap-3">
                  <PlaySceneIllustration tint={tintForActive} />
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: TONE.woodDeep }}>
                    in-play scene
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <FlatProductIllustration tint={tintForActive} />
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: TONE.woodDeep }}>
                    flat view
                  </span>
                </div>
              )}

              {/* favorite */}
              <button
                type="button"
                onClick={() => setIsFav((f) => !f)}
                aria-label={isFav ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                aria-pressed={isFav}
                className="absolute top-4 right-4 w-11 h-11 rounded-full grid place-items-center transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: TONE.card,
                  boxShadow: TONE.shadowSoft,
                  border: `1px solid ${TONE.border}`,
                  color: isFav ? TONE.wood : TONE.inkMuted,
                }}
              >
                <IconHeart size={20} fill={isFav ? 'currentColor' : 'none'} stroke={2} />
              </button>

              {/* discount pill */}
              {discount > 0 && (
                <span
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider"
                  style={{
                    background: TONE.wood,
                    color: TONE.card,
                    boxShadow: TONE.shadowSoft,
                  }}
                >
                  −{discount}% สนุกครบครัน
                </span>
              )}
            </div>

            {/* thumbnails */}
            <div
              className="mt-4 grid grid-cols-5 gap-3"
              role="tablist"
              aria-label="ภาพสินค้า"
            >
              {gallery.map((slot, i) => {
                const isActive = i === activeIdx;
                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`ดูภาพ ${i + 1}`}
                    onClick={() => setActiveIdx(i)}
                    className="relative aspect-square rounded-2xl overflow-hidden grid place-items-center transition-all"
                    style={{
                      background: slot.kind === 'play' ? TONE.pastelSage : slot.kind === 'flat' ? TONE.pastelPeach : TONE.pastelSky,
                      border: `2px solid ${isActive ? TONE.wood : TONE.border}`,
                      boxShadow: isActive ? TONE.shadowSoft : 'none',
                      transform: isActive ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    {slot.kind === 'photo' ? (
                      <Image
                        src={slot.src}
                        alt=""
                        fill
                        sizes="100px"
                        className="object-contain p-2"
                      />
                    ) : slot.kind === 'play' ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TONE.woodDeep }}>
                        play
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TONE.woodDeep }}>
                        flat
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── INFO PANEL ────────────────────────────────────────── */}
          <div className="flex flex-col">
            {/* eyebrow */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="text-[11px] uppercase tracking-[0.18em] font-bold px-3 py-1 rounded-full"
                style={{
                  background: TONE.accentSoft,
                  color: TONE.woodDeep,
                }}
              >
                Handmade in Thailand
              </span>
              {product.categoryName && (
                <span
                  className="text-[11px] uppercase tracking-[0.18em] font-bold px-3 py-1 rounded-full"
                  style={{
                    background: TONE.woodSoft,
                    color: TONE.woodDeep,
                  }}
                >
                  {product.categoryName}
                </span>
              )}
            </div>

            {/* title */}
            <h1
              className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-3"
              style={{ color: TONE.ink }}
            >
              {product.title}
            </h1>

            {/* rating row (display-only) */}
            <div className="flex items-center gap-2 mb-5" aria-label="คะแนนรีวิว 4.9 จาก 5">
              <span className="flex" style={{ color: TONE.wood }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStarFilled key={i} size={16} aria-hidden="true" />
                ))}
              </span>
              <span className="font-bold text-sm" style={{ color: TONE.ink }}>
                4.9
              </span>
              <span className="text-sm" style={{ color: TONE.inkMuted }}>
                · 248 รีวิวจากคุณพ่อคุณแม่
              </span>
            </div>

            {/* price */}
            <div className="flex items-baseline gap-3 flex-wrap mb-2">
              <span
                className="font-[family:var(--font-kanit)] text-4xl font-black tracking-tight"
                style={{ color: TONE.woodDeep }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {product.originalPriceTHB && product.originalPriceTHB > product.priceTHB && (
                <>
                  <span className="text-lg line-through" style={{ color: TONE.inkMuted }}>
                    {formatTHB(product.originalPriceTHB)}
                  </span>
                  <span
                    className="text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{
                      background: 'color-mix(in srgb, var(--shop-accent) 22%, white 78%)',
                      color: TONE.woodDeep,
                    }}
                  >
                    ประหยัด {formatTHB(product.originalPriceTHB - product.priceTHB)}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm mb-6" style={{ color: TONE.inkMuted }}>
              ผ่อน 0% นาน 3 เดือน · {formatTHB(Math.round(product.priceTHB / 3))} / เดือน
            </p>

            {/* age range pill row */}
            <div
              className="rounded-2xl p-4 mb-6 flex items-center gap-4"
              style={{
                background: TONE.card,
                border: `1px dashed ${TONE.border}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl grid place-items-center flex-shrink-0"
                style={{ background: TONE.woodSoft, color: TONE.woodDeep }}
              >
                <IconBabyCarriage size={24} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wider font-bold mb-0.5" style={{ color: TONE.inkMuted }}>
                  ช่วงอายุที่เหมาะสม
                </div>
                <div className="font-[family:var(--font-kanit)] text-lg font-bold" style={{ color: TONE.ink }}>
                  1+ ขวบ — พัฒนาการ &amp; จินตนาการ
                </div>
              </div>
            </div>

            {/* color variants */}
            {colorLabels.length > 0 && (
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs uppercase tracking-[0.18em] font-bold" style={{ color: TONE.inkMuted }}>
                    สี ·{' '}
                    <span style={{ color: TONE.ink }}>{selectedColor ?? 'เลือก'}</span>
                  </span>
                  <span className="text-xs" style={{ color: TONE.inkMuted }}>
                    {colorLabels.length} ตัวเลือก
                  </span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {colorLabels.map((c) => {
                    const isActive = c === selectedColor;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        aria-label={`สี ${c}`}
                        aria-pressed={isActive}
                        className="w-11 h-11 rounded-full grid place-items-center transition-transform hover:scale-105 active:scale-95"
                        style={{
                          background: colorSwatchToken(c),
                          border: `3px solid ${isActive ? TONE.wood : 'transparent'}`,
                          boxShadow: isActive ? TONE.shadowSoft : '0 1px 2px rgba(0,0,0,0.08)',
                        }}
                      >
                        {isActive && (
                          <IconCheck
                            size={18}
                            stroke={3}
                            style={{ color: TONE.card, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.25))' }}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* size variants */}
            {sizeLabels.length > 0 && (
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs uppercase tracking-[0.18em] font-bold" style={{ color: TONE.inkMuted }}>
                    ขนาด ·{' '}
                    <span style={{ color: TONE.ink }}>{selectedSize ?? 'เลือก'}</span>
                  </span>
                  <span
                    className="text-xs font-bold flex items-center gap-1"
                    style={{ color: TONE.woodDeep }}
                  >
                    <IconRulerMeasure size={14} aria-hidden="true" />
                    คู่มือขนาด
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sizeLabels.map((s) => {
                    const isActive = s === selectedSize;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        aria-pressed={isActive}
                        className="min-w-[64px] px-4 py-3 rounded-2xl font-[family:var(--font-kanit)] font-bold text-sm transition-all"
                        style={{
                          background: isActive ? TONE.wood : TONE.card,
                          color: isActive ? TONE.card : TONE.ink,
                          border: `2px solid ${isActive ? TONE.wood : TONE.border}`,
                          boxShadow: isActive ? TONE.shadowSoft : 'none',
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* qty + CTAs */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div
                className="flex items-center rounded-2xl overflow-hidden"
                style={{
                  background: TONE.card,
                  border: `2px solid ${TONE.border}`,
                }}
                role="group"
                aria-label="จำนวนสินค้า"
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-12 grid place-items-center hover:bg-[color-mix(in_srgb,var(--shop-primary)_8%,transparent)] transition-colors"
                  aria-label="ลดจำนวน"
                  style={{ color: TONE.ink }}
                >
                  <IconMinus size={18} aria-hidden="true" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!Number.isNaN(n)) setQty(Math.min(99, Math.max(1, n)));
                  }}
                  className="w-12 h-12 text-center font-[family:var(--font-kanit)] font-bold text-lg bg-transparent outline-none"
                  aria-label="จำนวน"
                  style={{ color: TONE.ink }}
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="w-11 h-12 grid place-items-center hover:bg-[color-mix(in_srgb,var(--shop-primary)_8%,transparent)] transition-colors"
                  aria-label="เพิ่มจำนวน"
                  style={{ color: TONE.ink }}
                >
                  <IconPlus size={18} aria-hidden="true" />
                </button>
              </div>

              <span
                className="text-xs font-bold inline-flex items-center gap-1.5 px-3 py-2 rounded-full"
                style={{
                  background: TONE.accentSoft,
                  color: TONE.woodDeep,
                }}
              >
                <IconCheck size={14} stroke={3} aria-hidden="true" />
                พร้อมส่ง · ส่งภายใน 24 ชม.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={handleAdd}
                className="h-14 rounded-2xl font-[family:var(--font-kanit)] font-extrabold text-base inline-flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px] active:translate-y-0"
                style={{
                  background: TONE.card,
                  color: TONE.ink,
                  border: `2px solid ${TONE.wood}`,
                  boxShadow: TONE.shadowSoft,
                }}
              >
                <IconShoppingBag size={20} aria-hidden="true" />
                เพิ่มลงตะกร้า
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAdd();
                }}
                className="h-14 rounded-2xl font-[family:var(--font-kanit)] font-extrabold text-base inline-flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px] active:translate-y-0"
                style={{
                  background: TONE.wood,
                  color: TONE.card,
                  boxShadow: TONE.shadow,
                }}
              >
                <IconBolt size={20} aria-hidden="true" />
                ซื้อเลย
              </button>
            </div>

            {/* trust badges */}
            <ul
              className="grid grid-cols-2 gap-2 mb-6"
              aria-label="ความปลอดภัยและบริการ"
            >
              {TRUST_BADGES.map(({ icon: Icon, title, desc: badgeDesc }) => (
                <li
                  key={title}
                  className="flex items-start gap-2.5 p-3 rounded-2xl"
                  style={{
                    background: TONE.card,
                    border: `1px solid ${TONE.border}`,
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-xl grid place-items-center flex-shrink-0"
                    style={{ background: TONE.woodSoft, color: TONE.woodDeep }}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div
                      className="text-[12px] font-bold leading-tight"
                      style={{ color: TONE.ink }}
                    >
                      {title}
                    </div>
                    <div
                      className="text-[11px] leading-snug mt-0.5"
                      style={{ color: TONE.inkMuted }}
                    >
                      {badgeDesc}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* description / safety / material accordion */}
            <div className="space-y-2">
              <details
                open
                className="group rounded-2xl overflow-hidden"
                style={{
                  background: TONE.card,
                  border: `1px solid ${TONE.border}`,
                }}
              >
                <summary
                  className="cursor-pointer list-none flex items-center justify-between px-5 py-4 font-[family:var(--font-kanit)] font-bold"
                  style={{ color: TONE.ink }}
                >
                  <span>รายละเอียดของเล่น</span>
                  <IconChevronRight
                    size={18}
                    aria-hidden="true"
                    className="transition-transform group-open:rotate-90"
                  />
                </summary>
                <div
                  className="px-5 pb-5 text-sm leading-relaxed"
                  style={{ color: TONE.inkMuted }}
                >
                  {desc ? (
                    <p>{desc}</p>
                  ) : (
                    <p>
                      ของเล่นไม้ designed สำหรับเสริมพัฒนาการกล้ามเนื้อมัดเล็ก
                      ความคิดสร้างสรรค์ และการเรียนรู้ผ่านการเล่น เหมาะกับลูกน้อยช่วงอายุ
                      1 ขวบขึ้นไป · ทำมือจากไม้บีชธรรมชาติ ชิ้นเดียวต่อชิ้น ไม่ใช่ผลิตจากโรงงาน
                    </p>
                  )}
                </div>
              </details>

              <details
                className="group rounded-2xl overflow-hidden"
                style={{
                  background: TONE.card,
                  border: `1px solid ${TONE.border}`,
                }}
              >
                <summary
                  className="cursor-pointer list-none flex items-center justify-between px-5 py-4 font-[family:var(--font-kanit)] font-bold"
                  style={{ color: TONE.ink }}
                >
                  <span>วัสดุ &amp; ความปลอดภัย</span>
                  <IconChevronRight
                    size={18}
                    aria-hidden="true"
                    className="transition-transform group-open:rotate-90"
                  />
                </summary>
                <div
                  className="px-5 pb-5 text-sm leading-relaxed space-y-2"
                  style={{ color: TONE.inkMuted }}
                >
                  <p>
                    <b style={{ color: TONE.ink }}>วัสดุ:</b> ไม้บีช (Beech) จากป่าปลูกทดแทนในยุโรป ·
                    เคลือบขี้ผึ้งธรรมชาติ (beeswax) · สีย้อมจากผักผลไม้
                  </p>
                  <p>
                    <b style={{ color: TONE.ink }}>มาตรฐาน:</b> ผ่านการทดสอบ EN71 (ยุโรป) และ ASTM F963 (สหรัฐฯ) ·
                    ไม่มีโลหะหนัก · BPA free · Phthalate free
                  </p>
                  <p>
                    <b style={{ color: TONE.ink }}>ขอบไม้:</b> ลบมุมแบบ Hand-sanded ทุกชิ้น
                    เนื้อสัมผัสเรียบเนียน ไม่บาดมือเด็ก
                  </p>
                </div>
              </details>

              <details
                className="group rounded-2xl overflow-hidden"
                style={{
                  background: TONE.card,
                  border: `1px solid ${TONE.border}`,
                }}
              >
                <summary
                  className="cursor-pointer list-none flex items-center justify-between px-5 py-4 font-[family:var(--font-kanit)] font-bold"
                  style={{ color: TONE.ink }}
                >
                  <span>การจัดส่ง &amp; การคืนสินค้า</span>
                  <IconChevronRight
                    size={18}
                    aria-hidden="true"
                    className="transition-transform group-open:rotate-90"
                  />
                </summary>
                <div
                  className="px-5 pb-5 text-sm leading-relaxed space-y-2"
                  style={{ color: TONE.inkMuted }}
                >
                  <p className="flex items-start gap-2">
                    <IconTruck size={16} className="flex-shrink-0 mt-0.5" style={{ color: TONE.woodDeep }} aria-hidden="true" />
                    <span>
                      ส่งฟรีเมื่อสั่งซื้อครบ ฿890 · Kerry / Flash Express ภายใน 1–3 วัน
                      (กทม.) · 2–5 วัน (ตจว.)
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <IconRefresh size={16} className="flex-shrink-0 mt-0.5" style={{ color: TONE.woodDeep }} aria-hidden="true" />
                    <span>
                      เปลี่ยน/คืนได้ภายใน 14 วัน · กล่องและซีลต้องอยู่สภาพเดิม
                    </span>
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED ──────────────────────────────────────────────── */}
      {related && related.length > 0 && (
        <section
          className="relative z-10 py-14 lg:py-20"
          style={{
            background: 'color-mix(in srgb, var(--shop-bg) 60%, white 40%)',
            borderTop: `1px solid ${TONE.border}`,
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
              <div>
                <span
                  className="inline-block text-[11px] uppercase tracking-[0.2em] font-bold mb-2 px-3 py-1 rounded-full"
                  style={{
                    background: TONE.woodSoft,
                    color: TONE.woodDeep,
                  }}
                >
                  เลือกเล่นด้วยกัน
                </span>
                <h2
                  className="font-[family:var(--font-kanit)] text-3xl font-extrabold"
                  style={{ color: TONE.ink }}
                >
                  ของเล่นที่เด็ก ๆ ชอบ
                </h2>
              </div>
              <Link
                href={`/stores/${store.slug}/products`}
                className="inline-flex items-center gap-1 font-[family:var(--font-kanit)] font-bold text-sm hover:gap-2 transition-all"
                style={{ color: TONE.woodDeep }}
              >
                ดูทั้งหมด <IconChevronRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {related.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="group block rounded-3xl overflow-hidden transition-transform hover:-translate-y-1"
                  style={{
                    background: TONE.card,
                    border: `1px solid ${TONE.border}`,
                    boxShadow: TONE.shadowSoft,
                  }}
                >
                  <div
                    className="relative aspect-square overflow-hidden"
                    style={{ background: TONE.pastelSky }}
                  >
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center">
                        <FlatProductIllustration tint={TONE.wood} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {p.categoryName && (
                      <div
                        className="text-[10px] uppercase tracking-wider font-bold mb-1"
                        style={{ color: TONE.woodDeep }}
                      >
                        {p.categoryName}
                      </div>
                    )}
                    <div
                      className="font-bold text-sm leading-snug line-clamp-2 min-h-[2.5rem] mb-2"
                      style={{ color: TONE.ink }}
                    >
                      {p.title}
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className="font-[family:var(--font-kanit)] font-extrabold"
                        style={{ color: TONE.woodDeep }}
                      >
                        {formatTHB(p.priceTHB)}
                      </span>
                      {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                        <span className="text-xs line-through" style={{ color: TONE.inkMuted }}>
                          {formatTHB(p.compareAtPriceTHB)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href={`/stores/${store.slug}/products`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-[family:var(--font-kanit)] font-extrabold text-sm transition-all hover:translate-y-[-2px]"
                style={{
                  background: TONE.card,
                  color: TONE.ink,
                  border: `2px solid ${TONE.ink}`,
                  boxShadow: TONE.shadowSoft,
                }}
              >
                <IconChevronLeft size={16} aria-hidden="true" />
                ดูของเล่นทั้งหมด
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default TinyhandProductDetail;
