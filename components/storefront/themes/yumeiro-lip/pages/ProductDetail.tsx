'use client';

/**
 * yumeiro-lip — bespoke PDP page
 *
 * Lipstick / K-beauty vibe — vivid pink + coral palette, color-grid
 * swatch picker as the hero interaction, "try-on" feel via a large
 * dominant-shade preview ring. Chrome surfaces use `var(--shop-*)`
 * tokens so they pick up the per-store palette; lipstick swatch
 * pigments are real product attributes and stay as hex from the
 * variant.colorLabel map.
 */

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  StarHalf,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  ChevronRight,
  Droplet,
  Clock,
  Leaf,
} from 'lucide-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';

// ───────────────────────────────────────────────────────────────────
// Lip-shade palette — maps variant.colorLabel → hex swatch.
// Lipstick brand requires saturated, on-pigment swatches; the shared
// colorToHex map in pdp-adapter is too generic for cosmetic shades.
// ───────────────────────────────────────────────────────────────────

const LIP_SHADE_MAP: Record<string, string> = {
  // Thai shade names
  'ชมพู': '#ec4899',
  'ชมพูพาสเทล': '#fbcfe8',
  'ชมพูบาร์บี้': '#f472b6',
  'ชมพูพีช': '#fda4af',
  'ชมพูนู้ด': '#f9a8d4',
  'พีช': '#fdba74',
  'พีชโทนส้ม': '#fb923c',
  'ส้ม': '#f97316',
  'ส้มอิฐ': '#c2410c',
  'ส้มประการัง': '#fb7185',
  'แดง': '#dc2626',
  'แดงเชอร์รี่': '#be123c',
  'แดงเลือดนก': '#991b1b',
  'แดงไวน์': '#831843',
  'แดงเบอร์รี่': '#9d174d',
  'นู้ด': '#fef3c7',
  'นู้ดเบจ': '#fde68a',
  'นู้ดน้ำตาล': '#d6a36a',
  'มู้ฟวี': '#7f1d1d',
  'พลัม': '#86198f',
  'เบอร์รี่': '#a21caf',
  'โรส': '#fb7185',
  // English fallback
  'pink': '#ec4899',
  'peach': '#fdba74',
  'orange': '#f97316',
  'red': '#dc2626',
  'nude': '#fde68a',
  'coral': '#fb7185',
  'rose': '#fb7185',
  'berry': '#a21caf',
  'plum': '#86198f',
  'wine': '#831843',
};

const FALLBACK_SHADES = [
  '#fda4af', '#fb7185', '#f472b6', '#ec4899', '#db2777',
  '#be185d', '#9d174d', '#fda4af', '#fb923c', '#f97316',
  '#dc2626', '#991b1b',
];

function shadeFor(label: string | null | undefined, index: number): string {
  if (!label) return FALLBACK_SHADES[index % FALLBACK_SHADES.length];
  const key = label.toLowerCase().trim();
  return LIP_SHADE_MAP[label] ?? LIP_SHADE_MAP[key] ?? FALLBACK_SHADES[index % FALLBACK_SHADES.length];
}

// ───────────────────────────────────────────────────────────────────
// Lipstick illustration — used when a product has no image yet. SVG
// scales to any size; pigment fill = current shade.
// ───────────────────────────────────────────────────────────────────

function LipstickIllustration({ shade, size = '100%' }: { shade: string; size?: string }) {
  return (
    <svg viewBox="0 0 200 280" width={size} aria-hidden="true">
      <defs>
        <linearGradient id={`lip-grad-${shade.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shade} stopOpacity="0.85" />
          <stop offset="100%" stopColor={shade} stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* Lipstick bullet */}
      <path
        d="M70 40 L130 40 L120 90 Q100 105 80 90 Z"
        fill={`url(#lip-grad-${shade.replace('#', '')})`}
      />
      {/* Highlight on bullet */}
      <path
        d="M82 50 L92 50 L88 80 Q85 85 82 82 Z"
        fill="white"
        opacity="0.25"
      />
      {/* Tube body */}
      <rect x="60" y="90" width="80" height="35" rx="3" fill="#1f1d1b" />
      <rect x="60" y="90" width="80" height="6" rx="3" fill="#fbbf24" opacity="0.9" />
      {/* Tube base */}
      <rect x="55" y="125" width="90" height="125" rx="6" fill={shade} />
      {/* Glossy band */}
      <rect x="62" y="135" width="6" height="105" rx="3" fill="white" opacity="0.25" />
      {/* Bottom cap */}
      <rect x="55" y="245" width="90" height="14" rx="3" fill="#1f1d1b" />
    </svg>
  );
}

// ───────────────────────────────────────────────────────────────────
// Default copy — for products that don't have full description rows.
// Yumeiro-lip is a lipstick brand so we lean into finish / long-wear /
// ingredient as the editable feature trio.
// ───────────────────────────────────────────────────────────────────

const DEFAULT_FINISH_NOTES = [
  { icon: Droplet, label: 'เนื้อแมตต์เนียน', desc: 'เกลี่ยง่าย ไม่เป็นคราบ' },
  { icon: Clock, label: 'ติดทน 12 ชั่วโมง', desc: 'กิน-ดื่มได้ ไม่หลุดลอก' },
  { icon: Leaf, label: 'วีแกน 100%', desc: 'ไม่ทดลองในสัตว์' },
];

const DEFAULT_TRUST_BADGES = [
  { icon: Truck, label: 'ส่งฟรี ฿590+', desc: 'ส่งภายใน 24 ชม.' },
  { icon: RotateCcw, label: 'คืนได้ 14 วัน', desc: 'หากซีลไม่แกะ' },
  { icon: ShieldCheck, label: 'ของแท้ 100%', desc: 'จากแบรนด์โดยตรง' },
];

// ───────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────

export default function YumeiroLipProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;
  const router = useRouter();
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  // Build the gallery — imageUrl first, then images[], dedup.
  const gallery = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    if (product.imageUrl) {
      seen.add(product.imageUrl);
      out.push(product.imageUrl);
    }
    for (const src of product.images) {
      if (src && !seen.has(src)) {
        seen.add(src);
        out.push(src);
      }
    }
    return out;
  }, [product.imageUrl, product.images]);

  // Distinct color variants (lipstick shades) deduped by colorLabel.
  const shades = useMemo(() => {
    const seen = new Map<string, { id: string; label: string; hex: string; priceTHB: number }>();
    product.variants.forEach((v, i) => {
      const label = v.colorLabel?.trim();
      if (label && !seen.has(label)) {
        seen.set(label, {
          id: v.id,
          label,
          hex: shadeFor(label, i),
          priceTHB: v.priceTHB,
        });
      }
    });
    return Array.from(seen.values());
  }, [product.variants]);

  const [selectedShade, setSelectedShade] = useState<string | null>(
    shades[0]?.label ?? null,
  );
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [favorited, setFavorited] = useState(false);

  // Sync active image if gallery changes.
  useEffect(() => {
    setActiveImage(0);
  }, [gallery.length]);

  // Current shade for try-on preview ring + illustration fallback.
  const currentShade = shades.find((s) => s.label === selectedShade);
  const previewHex = currentShade?.hex ?? FALLBACK_SHADES[0];

  // Discount math.
  const discount = useMemo(() => {
    if (product.originalPriceTHB && product.originalPriceTHB > product.priceTHB) {
      return Math.round((1 - product.priceTHB / product.originalPriceTHB) * 100);
    }
    return 0;
  }, [product.originalPriceTHB, product.priceTHB]);

  const finalPrice = currentShade?.priceTHB ?? product.priceTHB;

  // Add-to-cart handlers.
  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: selectedShade ? `${product.title} · ${selectedShade}` : product.title,
        priceTHB: finalPrice,
        imageUrl: product.imageUrl ?? undefined,
      },
      qty,
    );
    showConfirm(product.title, store.slug);
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    e?.preventDefault();
    add(
      {
        productId: product.id,
        storeSlug: store.slug,
        storeName: store.name,
        title: selectedShade ? `${product.title} · ${selectedShade}` : product.title,
        priceTHB: finalPrice,
        imageUrl: product.imageUrl ?? undefined,
      },
      qty,
    );
    router.push(`/stores/${store.slug}/checkout`);
  };

  // Mock rating — until backend exposes it.
  const rating = 4.8;
  const reviewCount = 248;

  return (
    <main
      className="min-h-screen font-[family:var(--font-prompt)]"
      style={{
        backgroundColor: 'var(--shop-bg, #fff0f5)',
        color: 'var(--shop-ink, #831843)',
      }}
    >
      {/* ─── BREADCRUMB ─── */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <nav
          className="flex items-center gap-2 text-xs font-[family:var(--font-kanit)]"
          style={{ color: 'var(--shop-ink-muted, #be185d)' }}
          aria-label="Breadcrumb"
        >
          <Link
            href={`/stores/${store.slug}`}
            className="hover:opacity-70 transition-opacity"
          >
            หน้าแรก
          </Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <Link
            href={`/stores/${store.slug}/category`}
            className="hover:opacity-70 transition-opacity"
          >
            {product.categoryName ?? 'ลิปสติก'}
          </Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <span
            className="font-medium truncate max-w-[200px]"
            style={{ color: 'var(--shop-ink, #831843)' }}
          >
            {product.title}
          </span>
        </nav>
      </div>

      {/* ─── HERO: GALLERY + INFO ─── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ─── LEFT: GALLERY ─── */}
          <div className="flex flex-col gap-4">
            {/* Main image — circular "try-on" ring framing */}
            <div
              className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-xl"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${previewHex}22, var(--shop-muted, #fbcfe8) 70%)`,
                border: '1px solid var(--shop-border, #fbcfe8)',
              }}
            >
              {/* Sparkle overlays */}
              <div
                className="absolute top-6 left-6 opacity-30 animate-pulse"
                style={{ color: previewHex }}
              >
                <Sparkles className="w-10 h-10" />
              </div>
              <div
                className="absolute bottom-10 right-8 opacity-25 animate-pulse delay-150"
                style={{ color: previewHex }}
              >
                <Heart className="w-12 h-12" />
              </div>

              {/* Image or illustration */}
              {gallery[activeImage] ? (
                <img
                  src={gallery[activeImage]}
                  alt={`${product.title} - ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LipstickIllustration shade={previewHex} size="55%" />
                </div>
              )}

              {/* Discount badge */}
              {discount > 0 && (
                <div
                  className="absolute top-5 right-5 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md"
                  style={{ backgroundColor: 'var(--shop-primary, #ec4899)' }}
                >
                  −{discount}%
                </div>
              )}

              {/* Try-on label */}
              {currentShade && (
                <div
                  className="absolute bottom-5 left-5 backdrop-blur bg-white/85 rounded-full px-4 py-2 flex items-center gap-2 shadow-md"
                  style={{ color: 'var(--shop-ink, #831843)' }}
                >
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: currentShade.hex }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold tracking-wide">
                    {currentShade.label}
                  </span>
                </div>
              )}
            </div>

            {/* Thumb rail */}
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 transition-all"
                    style={{
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor:
                        activeImage === i
                          ? 'var(--shop-primary, #ec4899)'
                          : 'var(--shop-border, #fbcfe8)',
                      transform: activeImage === i ? 'scale(1.05)' : 'scale(1)',
                    }}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={activeImage === i}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── RIGHT: INFO ─── */}
          <div className="flex flex-col">
            {/* Eyebrow */}
            <div
              className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3 font-[family:var(--font-kanit)]"
              style={{ color: 'var(--shop-primary, #fb7185)' }}
            >
              K-BEAUTY · LIP COLLECTION
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl font-black leading-tight mb-3 tracking-tight"
              style={{ color: 'var(--shop-ink, #831843)' }}
            >
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex" style={{ color: 'var(--shop-primary, #ec4899)' }}>
                {[1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <StarHalf className="w-4 h-4 fill-current" />
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: 'var(--shop-ink, #831843)' }}
              >
                {rating.toFixed(1)}
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--shop-ink-muted, #be185d)' }}
              >
                ({reviewCount.toLocaleString()} รีวิว)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2 font-[family:var(--font-kanit)]">
              <span
                className="text-4xl font-black tracking-tight"
                style={{ color: 'var(--shop-primary, #ec4899)' }}
              >
                {formatTHB(finalPrice)}
              </span>
              {product.originalPriceTHB && product.originalPriceTHB > finalPrice && (
                <>
                  <span
                    className="text-lg line-through"
                    style={{ color: 'var(--shop-ink-muted, #be185d)', opacity: 0.6 }}
                  >
                    {formatTHB(product.originalPriceTHB)}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--shop-muted, #fbcfe8)',
                      color: 'var(--shop-primary, #ec4899)',
                    }}
                  >
                    ประหยัด {formatTHB(product.originalPriceTHB - finalPrice)}
                  </span>
                </>
              )}
            </div>
            <p
              className="text-xs mb-6 font-[family:var(--font-kanit)]"
              style={{ color: 'var(--shop-ink-muted, #be185d)' }}
            >
              หรือผ่อน <b>0% นาน 3 เดือน</b> · เพียง{' '}
              {formatTHB(Math.round(finalPrice / 3))}/เดือน
            </p>

            {/* ─── SHADE PICKER (the prominent color-grid) ─── */}
            {shades.length > 0 && (
              <div className="mb-7">
                <div className="flex items-baseline justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-[11px] font-bold tracking-[0.2em] uppercase"
                      style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                    >
                      เลือกเฉด
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: 'var(--shop-ink, #831843)' }}
                    >
                      {selectedShade ?? 'เลือกเฉดของคุณ'}
                    </span>
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                  >
                    {shades.length} เฉด
                  </span>
                </div>

                {/* Color-grid prominent display */}
                <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                  {shades.map((s) => {
                    const active = s.label === selectedShade;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedShade(s.label)}
                        className="aspect-square rounded-full transition-all duration-200 relative group"
                        style={{
                          backgroundColor: s.hex,
                          borderWidth: active ? 3 : 2,
                          borderStyle: 'solid',
                          borderColor: active
                            ? 'var(--shop-ink, #831843)'
                            : 'white',
                          boxShadow: active
                            ? `0 4px 14px ${s.hex}66`
                            : '0 1px 3px rgba(0,0,0,0.1)',
                          transform: active ? 'scale(1.15)' : 'scale(1)',
                        }}
                        aria-label={`เฉด ${s.label}`}
                        aria-pressed={active}
                        title={s.label}
                      >
                        <span
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: 'var(--shop-ink, #831843)' }}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── QUANTITY + CTAs ─── */}
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <div
                className="inline-flex items-center rounded-full bg-white"
                style={{
                  border: '1px solid var(--shop-border, #fbcfe8)',
                }}
                role="group"
                aria-label="Quantity"
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--shop-muted,#fbcfe8)]"
                  style={{ color: 'var(--shop-ink, #831843)' }}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span
                  className="w-10 text-center font-bold text-base"
                  style={{ color: 'var(--shop-ink, #831843)' }}
                  aria-live="polite"
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--shop-muted,#fbcfe8)]"
                  style={{ color: 'var(--shop-ink, #831843)' }}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span
                className="text-xs font-bold inline-flex items-center gap-1.5"
                style={{ color: '#10b981' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
                  aria-hidden="true"
                />
                พร้อมส่ง · ส่งภายใน 24 ชม.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mb-7">
              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-full px-6 py-4 font-bold text-base transition-all hover:scale-[1.02] shadow-md inline-flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--shop-primary, #ec4899)',
                  border: '2px solid var(--shop-primary, #ec4899)',
                }}
              >
                <ShoppingBag className="w-5 h-5" />
                ใส่ตะกร้า
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="rounded-full px-6 py-4 font-bold text-base text-white transition-all hover:scale-[1.02] shadow-lg inline-flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--shop-primary, #ec4899)',
                  boxShadow: '0 8px 20px rgba(236, 72, 153, 0.35)',
                }}
              >
                <Zap className="w-5 h-5" />
                สั่งซื้อเลย
              </button>
              <button
                type="button"
                onClick={() => setFavorited((v) => !v)}
                className="hidden sm:inline-flex w-14 h-14 rounded-full items-center justify-center transition-all hover:scale-[1.05]"
                style={{
                  backgroundColor: 'white',
                  border: '2px solid var(--shop-border, #fbcfe8)',
                  color: favorited
                    ? 'var(--shop-primary, #ec4899)'
                    : 'var(--shop-ink-muted, #be185d)',
                }}
                aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={favorited}
              >
                <Heart
                  className="w-5 h-5"
                  fill={favorited ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* ─── TRUST BADGES ─── */}
            <div
              className="rounded-2xl p-4 grid grid-cols-3 gap-3"
              style={{
                backgroundColor: 'var(--shop-muted, #fff0f5)',
                border: '1px solid var(--shop-border, #fbcfe8)',
              }}
              role="list"
              aria-label="Trust signals"
            >
              {DEFAULT_TRUST_BADGES.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center text-center gap-1.5"
                    role="listitem"
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: 'var(--shop-primary, #ec4899)' }}
                    />
                    <div
                      className="text-xs font-bold leading-tight"
                      style={{ color: 'var(--shop-ink, #831843)' }}
                    >
                      {b.label}
                    </div>
                    <div
                      className="text-[10px] leading-tight font-[family:var(--font-kanit)]"
                      style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                    >
                      {b.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT DETAIL: FINISH · LONG-WEAR · INGREDIENT ─── */}
      <section
        className="py-16 px-4 mt-4"
        style={{ backgroundColor: 'var(--shop-bg-alt, white)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
            {/* LEFT: feature trio */}
            <div>
              <span
                className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3 inline-block font-[family:var(--font-kanit)]"
                style={{ color: 'var(--shop-primary, #fb7185)' }}
              >
                THE FORMULA
              </span>
              <h2
                className="text-3xl font-black mb-8 tracking-tight"
                style={{ color: 'var(--shop-ink, #831843)' }}
              >
                สูตรพิเศษ
                <br />
                จากเกาหลี
              </h2>

              <div className="flex flex-col gap-5">
                {DEFAULT_FINISH_NOTES.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-2xl"
                      style={{
                        backgroundColor: 'var(--shop-muted, #fff0f5)',
                        border: '1px solid var(--shop-border, #fbcfe8)',
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: 'var(--shop-primary, #ec4899)',
                          color: 'white',
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div
                          className="font-bold text-base mb-1"
                          style={{ color: 'var(--shop-ink, #831843)' }}
                        >
                          {f.label}
                        </div>
                        <div
                          className="text-sm font-[family:var(--font-kanit)]"
                          style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                        >
                          {f.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: description */}
            <div>
              <span
                className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3 inline-block font-[family:var(--font-kanit)]"
                style={{ color: 'var(--shop-primary, #fb7185)' }}
              >
                DESCRIPTION
              </span>
              <h2
                className="text-3xl font-black mb-6 tracking-tight"
                style={{ color: 'var(--shop-ink, #831843)' }}
              >
                เกี่ยวกับสินค้านี้
              </h2>
              <div
                className="prose max-w-none text-base leading-relaxed font-[family:var(--font-kanit)] whitespace-pre-line"
                style={{ color: 'var(--shop-ink, #831843)' }}
              >
                {product.description ??
                  'ลิปสติกเนื้อแมตต์ครีมมี่ ติดทนกินดื่มได้ ไม่หลุดลอก ผลิตด้วยส่วนผสมพรีเมียมจากเกาหลี ผ่านการทดสอบบนผิวเอเชียทุกโทน ปั้มเดียวขึ้นสีจริง เกลี่ยง่าย ไม่เป็นคราบ เหมาะสำหรับใช้ทุกวัน ทั้งวันทำงานและออกเดต'}
              </div>

              {/* Accordion: ingredients & how-to */}
              <div className="mt-8 flex flex-col gap-3">
                <details
                  className="rounded-2xl p-5 cursor-pointer group"
                  style={{
                    backgroundColor: 'var(--shop-muted, #fff0f5)',
                    border: '1px solid var(--shop-border, #fbcfe8)',
                  }}
                >
                  <summary
                    className="font-bold flex items-center justify-between list-none"
                    style={{ color: 'var(--shop-ink, #831843)' }}
                  >
                    ส่วนผสมหลัก (Key Ingredients)
                    <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <div
                    className="mt-3 text-sm font-[family:var(--font-kanit)] leading-relaxed"
                    style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                  >
                    <p>
                      <b>Hyaluronic Acid</b> · เพิ่มความชุ่มชื้น
                      <br />
                      <b>Vitamin E</b> · บำรุงและปกป้องริมฝีปาก
                      <br />
                      <b>Jojoba Oil</b> · ลดอาการแห้งแตก
                      <br />
                      <b>Squalane</b> · ผิวริมฝีปากเรียบเนียน
                      <br />
                      <b>Plant-based pigments</b> · สีสันธรรมชาติ ไม่ทำให้ปากดำคล้ำ
                    </p>
                  </div>
                </details>

                <details
                  className="rounded-2xl p-5 cursor-pointer group"
                  style={{
                    backgroundColor: 'var(--shop-muted, #fff0f5)',
                    border: '1px solid var(--shop-border, #fbcfe8)',
                  }}
                >
                  <summary
                    className="font-bold flex items-center justify-between list-none"
                    style={{ color: 'var(--shop-ink, #831843)' }}
                  >
                    วิธีใช้ (How to apply)
                    <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <div
                    className="mt-3 text-sm font-[family:var(--font-kanit)] leading-relaxed"
                    style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                  >
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>เริ่มจากริมฝีปากที่สะอาด แห้ง</li>
                      <li>ปั้มจากกึ่งกลางริมฝีปากออกไปยังมุมปาก</li>
                      <li>ทับซ้ำเฉดที่ 2 ตรงกึ่งกลางเพื่อเพิ่มมิติ</li>
                      <li>ใช้นิ้วเกลี่ยขอบให้ฟุ้งสำหรับลุคนุ่ม</li>
                    </ol>
                  </div>
                </details>

                <details
                  className="rounded-2xl p-5 cursor-pointer group"
                  style={{
                    backgroundColor: 'var(--shop-muted, #fff0f5)',
                    border: '1px solid var(--shop-border, #fbcfe8)',
                  }}
                >
                  <summary
                    className="font-bold flex items-center justify-between list-none"
                    style={{ color: 'var(--shop-ink, #831843)' }}
                  >
                    จัดส่ง &amp; การคืนสินค้า
                    <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <div
                    className="mt-3 text-sm font-[family:var(--font-kanit)] leading-relaxed"
                    style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                  >
                    <p>
                      <b>จัดส่ง:</b> Kerry / Flash · 1-3 วัน (กทม.) · 2-5 วัน (ตจว.)
                      <br />
                      <b>ฟรีค่าส่ง:</b> ซื้อครบ ฿590 ขึ้นไป
                      <br />
                      <b>การคืน:</b> 14 วัน หากซีลของสินค้ายังไม่แกะ
                      <br />
                      <b>เพื่อสุขอนามัย:</b> ลิปสติกที่แกะซีลแล้วไม่สามารถคืนได้
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RELATED RAIL ─── */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span
                className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2 inline-block font-[family:var(--font-kanit)]"
                style={{ color: 'var(--shop-primary, #fb7185)' }}
              >
                YOU MAY ALSO LOVE
              </span>
              <h2
                className="text-3xl font-black tracking-tight"
                style={{ color: 'var(--shop-ink, #831843)' }}
              >
                เฉดอื่นที่อาจ
                <br className="sm:hidden" /> ถูกใจ
              </h2>
            </div>
            <Link
              href={`/stores/${store.slug}/category`}
              className="text-sm font-bold hover:opacity-70 transition-opacity inline-flex items-center gap-1"
              style={{ color: 'var(--shop-primary, #ec4899)' }}
            >
              ดูทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.slice(0, 8).map((r, i) => (
              <Link
                key={r.id}
                href={`/stores/${store.slug}/products/${r.id}`}
                className="group rounded-3xl overflow-hidden transition-all hover:shadow-xl flex flex-col"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid var(--shop-border, #fbcfe8)',
                }}
              >
                <div
                  className="relative aspect-square overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${FALLBACK_SHADES[i % FALLBACK_SHADES.length]}22, var(--shop-muted, #fff0f5) 80%)`,
                  }}
                >
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LipstickIllustration
                        shade={FALLBACK_SHADES[i % FALLBACK_SHADES.length]}
                        size="50%"
                      />
                    </div>
                  )}
                  {r.compareAtPriceTHB && r.compareAtPriceTHB > r.priceTHB && (
                    <div
                      className="absolute top-3 right-3 text-white text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: 'var(--shop-primary, #ec4899)' }}
                    >
                      SALE
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3
                    className="font-bold text-sm leading-tight mb-2 line-clamp-2 group-hover:opacity-70 transition-opacity flex-grow"
                    style={{ color: 'var(--shop-ink, #831843)' }}
                  >
                    {r.title}
                  </h3>
                  <div className="flex items-baseline gap-2 font-[family:var(--font-kanit)] mt-auto">
                    <span
                      className="font-black text-base"
                      style={{ color: 'var(--shop-primary, #ec4899)' }}
                    >
                      {formatTHB(r.priceTHB)}
                    </span>
                    {r.compareAtPriceTHB && r.compareAtPriceTHB > r.priceTHB && (
                      <span
                        className="text-xs line-through"
                        style={{ color: 'var(--shop-ink-muted, #be185d)', opacity: 0.6 }}
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
    </main>
  );
}
