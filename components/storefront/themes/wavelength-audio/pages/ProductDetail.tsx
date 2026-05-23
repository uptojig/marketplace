'use client';

/**
 * wavelength-audio — bespoke Product Detail page
 *
 * Vibe: audio-gear · dark/light contrast · planar sound-wave illustrations ·
 * spec rail · Hi-Res / Bluetooth codec trust badges · sound-signature equalizer.
 *
 * Uses `var(--shop-*)` tokens — never hardcoded hex values.
 * Accepts the canonical `ProductDetailProps` shape from `@/lib/templates/types`,
 * with extra bespoke fields surfaced via optional `extras` for editor / preview
 * wiring (close-up gallery, on-ear lifestyle shots, sound-signature curve,
 * codec / Hi-Res trust badges).
 */

import React, { useMemo, useState } from 'react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps as ScaffoldProductDetailProps } from '@/lib/templates/types';

// ============================================================================
// Types
// ============================================================================

interface EqualizerBand {
  /** Display label (e.g. "60", "1k", "8k") */
  label: string;
  /** Relative dB shift, range roughly -6..+6 */
  db: number;
}

interface TrustBadge {
  /** Short headline (e.g. "Hi-Res Audio") */
  label: string;
  /** One-line spec value (e.g. "JAS Certified") */
  value: string;
}

interface WavelengthAudioPdpExtras {
  /** Close-up + on-ear lifestyle gallery (overrides product.images). */
  gallery?: string[];
  /** Variants displayed as colour / model chips. */
  variants?: {
    id: string;
    label: string;
    /** Hex/CSS colour for the chip swatch (default: red accent). */
    swatch?: string;
  }[];
  /** Sound-signature equalizer curve (4-7 bands recommended). */
  equalizer?: EqualizerBand[];
  /** Hi-Res / Bluetooth codec / driver-spec rail. */
  trustBadges?: TrustBadge[];
}

/** Accepts the canonical scaffold props *plus* bespoke audio extras. */
export interface WavelengthAudioProductDetailProps extends Partial<ScaffoldProductDetailProps> {
  extras?: WavelengthAudioPdpExtras;
}

// ============================================================================
// Defaults — used when called outside the storefront scaffold (preview / dev)
// ============================================================================

const DEFAULT_GALLERY = [
  // close-up driver shot
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600',
  // on-ear lifestyle
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1600',
  // hero hero
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1600',
  // cup detail
  'https://images.unsplash.com/photo-1599669454699-248893623440?q=80&w=1600',
];

const DEFAULT_EQUALIZER: EqualizerBand[] = [
  { label: '60', db: 1.5 },
  { label: '250', db: 0 },
  { label: '1k', db: -0.5 },
  { label: '4k', db: 2 },
  { label: '8k', db: 3 },
  { label: '16k', db: 1 },
];

const DEFAULT_BADGES: TrustBadge[] = [
  { label: 'Hi-Res Audio', value: 'JAS Certified · 40kHz' },
  { label: 'Bluetooth 5.3', value: 'LDAC · aptX Adaptive' },
  { label: 'Planar Magnetic', value: 'Driver 50mm' },
  { label: 'รับประกัน 5 ปี', value: 'ผลิตในไต้หวัน' },
];

const DEFAULT_VARIANTS = [
  { id: 'matte-black', label: 'Matte Black', swatch: '#0a0a0a' },
  { id: 'satin-silver', label: 'Satin Silver', swatch: '#c0c4c8' },
  { id: 'studio-red', label: 'Studio Red', swatch: '#dc2626' },
];

// ============================================================================
// Sound-signature equalizer (inline SVG, themed via var(--shop-*))
// ============================================================================

function SoundSignatureCurve({ bands }: { bands: EqualizerBand[] }) {
  const width = 560;
  const height = 180;
  const padding = 28;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const maxDb = 6;

  const points = bands.map((b, i) => {
    const x = padding + (innerW * i) / Math.max(1, bands.length - 1);
    const y = padding + innerH / 2 - (b.db / maxDb) * (innerH / 2);
    return { x, y, ...b };
  });

  // Smooth path (Catmull-Rom-ish via cubic-bezier between neighbours)
  const path = points.reduce((d, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${d} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="auto"
      role="img"
      aria-label="Sound signature equalizer curve"
      className="block"
    >
      <defs>
        <linearGradient id="wv-eq-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--shop-primary)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--shop-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* horizontal gridlines */}
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={padding}
          x2={width - padding}
          y1={padding + innerH * p}
          y2={padding + innerH * p}
          stroke="currentColor"
          strokeOpacity={p === 0.5 ? 0.25 : 0.08}
          strokeDasharray={p === 0.5 ? '0' : '2 4'}
        />
      ))}

      {/* fill under curve */}
      <path
        d={`${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
        fill="url(#wv-eq-fill)"
      />

      {/* curve */}
      <path
        d={path}
        fill="none"
        stroke="var(--shop-primary)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* band markers */}
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r={4} fill="var(--shop-primary)" />
          <text
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            fontSize="11"
            fill="currentColor"
            fillOpacity={0.6}
            fontFamily="var(--font-kanit), sans-serif"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ============================================================================
// Decorative background sound-wave (themed via currentColor → opacity layers)
// ============================================================================

function SoundWaveBg({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 240"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M 0 ${120 + i * 6}
              Q 150 ${60 + i * 4}, 300 ${120 + i * 6}
              T 600 ${120 + i * 6}
              T 900 ${120 + i * 6}
              T 1200 ${120 + i * 6}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.06 + i * 0.04}
          strokeWidth={1.2}
        />
      ))}
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

export function WavelengthAudioProductDetail(props: WavelengthAudioProductDetailProps) {
  // ---- Resolve product data (scaffold props OR previewed defaults) ----
  const product = props.product;
  const productId = product?.id ?? 'wv1-default';
  const title = product?.title ?? 'WV1 Reference Headphone';
  const description =
    product?.description ??
    'หูฟัง over-ear ไดรเวอร์ planar magnetic ขนาด 50 มม. ออกแบบสำหรับนักฟังที่ต้องการรายละเอียดเสียงระดับ studio ตัวเรือนอลูมิเนียมเกรดอากาศยาน หูฟังพอดีหู ใช้งานต่อเนื่อง 8 ชั่วโมงโดยไม่ล้า · พร้อมสาย OFC 1.8 ม. และกล่องเก็บแบบแข็ง';
  const priceTHB = product?.priceTHB ?? 12900;
  const originalPriceTHB = product?.originalPriceTHB ?? null;
  const categoryName = product?.categoryName ?? 'Headphone';

  const storeSlug = props.store?.slug ?? 'wavelength-audio';
  const storeName = props.store?.name ?? 'Wavelength Audio';
  const related = props.related ?? [];

  // ---- Bespoke extras with sensible defaults ----
  const gallery = useMemo<string[]>(() => {
    const extrasGallery = props.extras?.gallery?.filter(Boolean) ?? [];
    if (extrasGallery.length > 0) return extrasGallery;
    const productImages = (product?.images ?? []).filter(Boolean) as string[];
    if (product?.imageUrl && !productImages.includes(product.imageUrl)) {
      productImages.unshift(product.imageUrl);
    }
    return productImages.length > 0 ? productImages : DEFAULT_GALLERY;
  }, [props.extras?.gallery, product?.images, product?.imageUrl]);

  const variants = useMemo(() => {
    if (props.extras?.variants && props.extras.variants.length > 0) {
      return props.extras.variants;
    }
    // derive from scaffold variants if available
    const scaffoldVariants = product?.variants ?? [];
    const derived = scaffoldVariants
      .map((v) => ({
        id: v.id,
        label: v.colorLabel ?? v.materialLabel ?? v.sizeLabel ?? 'Standard',
        swatch: undefined as string | undefined,
      }))
      .filter((v, i, arr) => arr.findIndex((x) => x.label === v.label) === i);
    return derived.length > 0 ? derived : DEFAULT_VARIANTS;
  }, [props.extras?.variants, product?.variants]);

  const equalizer = props.extras?.equalizer ?? DEFAULT_EQUALIZER;
  const trustBadges = props.extras?.trustBadges ?? DEFAULT_BADGES;

  // ---- Local UI state ----
  const [activeImage, setActiveImage] = useState(0);
  const [activeVariant, setActiveVariant] = useState(variants[0]?.id ?? '');
  const [qty, setQty] = useState(1);

  // ---- Cart wiring ----
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const handleAddToCart = () => {
    add(
      {
        productId,
        storeSlug,
        storeName,
        title,
        priceTHB,
        imageUrl: gallery[0],
      },
      qty,
    );
    showConfirm(title, storeSlug);
  };

  const homeUrl = `/stores/${storeSlug}`;
  const shopUrl = `/stores/${storeSlug}/category`;

  return (
    <main className="bg-[var(--shop-bg)] text-[var(--shop-ink)] min-h-screen relative overflow-hidden">
      {/* ============ Decorative sound-wave field ============ */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] text-[var(--shop-primary)] opacity-60"
        aria-hidden="true"
      >
        <SoundWaveBg className="w-full h-full" />
      </div>

      {/* ============ Breadcrumb ============ */}
      <div className="relative z-10 border-b border-[var(--shop-border)]/60 bg-[var(--shop-bg)]/80 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <nav
            aria-label="Breadcrumb"
            className="font-[family:var(--font-kanit)] text-xs tracking-[0.18em] uppercase text-[var(--shop-ink-muted)] flex items-center gap-3"
          >
            <a href={homeUrl} className="hover:text-[var(--shop-primary)] transition-colors">
              หน้าแรก
            </a>
            <span aria-hidden="true">·</span>
            <a href={shopUrl} className="hover:text-[var(--shop-primary)] transition-colors">
              {categoryName}
            </a>
            <span aria-hidden="true">·</span>
            <span className="text-[var(--shop-ink)] font-medium normal-case tracking-normal truncate max-w-[40ch]">
              {title}
            </span>
          </nav>
        </div>
      </div>

      {/* ============ Hero: Gallery + Buy Box ============ */}
      <section className="relative z-10 container mx-auto px-6 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ----- Gallery ----- */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbs (close-up + lifestyle) */}
            <div
              className="flex md:flex-col gap-3 md:w-24 overflow-x-auto md:overflow-y-auto md:max-h-[560px]"
              aria-label="Product gallery thumbnails"
              role="list"
            >
              {gallery.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  role="listitem"
                  aria-label={`ดูภาพที่ ${i + 1}`}
                  aria-current={i === activeImage}
                  className={`relative aspect-square w-20 md:w-full flex-shrink-0 overflow-hidden border-2 transition-all duration-300 ${
                    i === activeImage
                      ? 'border-[var(--shop-primary)] shadow-[0_0_0_2px_var(--shop-bg)_inset]'
                      : 'border-[var(--shop-border)] opacity-70 hover:opacity-100 hover:border-[var(--shop-ink)]/40'
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative">
              <div className="relative aspect-square w-full bg-[var(--shop-card)] border border-[var(--shop-border)] overflow-hidden">
                <img
                  src={gallery[activeImage] ?? gallery[0]}
                  alt={`${title} — ภาพที่ ${activeImage + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Hi-Res sticker overlay (corner badge) */}
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-[var(--shop-ink)] text-[var(--shop-bg)] font-[family:var(--font-prompt)] text-[10px] tracking-[0.22em] uppercase font-bold">
                  Hi-Res
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1.5 border border-[var(--shop-ink)]/30 bg-[var(--shop-bg)]/70 backdrop-blur font-[family:var(--font-kanit)] text-[11px] tracking-widest uppercase text-[var(--shop-ink)]">
                  {activeImage + 1} / {gallery.length}
                </div>
              </div>
            </div>
          </div>

          {/* ----- Buy Box ----- */}
          <div className="flex flex-col">
            {/* Category eyebrow */}
            <div className="font-[family:var(--font-kanit)] text-[11px] tracking-[0.28em] uppercase text-[var(--shop-primary)] font-bold mb-3">
              {categoryName} · Reference Series
            </div>

            <h1 className="font-[family:var(--font-prompt)] text-3xl md:text-5xl tracking-tight font-bold text-[var(--shop-ink)] leading-[1.05] mb-5">
              {title}
            </h1>

            <p className="font-[family:var(--font-kanit)] text-base md:text-lg leading-relaxed text-[var(--shop-ink-muted)] mb-8 max-w-prose">
              {description}
            </p>

            {/* Price block */}
            <div className="flex items-baseline gap-4 mb-1">
              <span className="font-[family:var(--font-prompt)] text-4xl md:text-5xl font-bold text-[var(--shop-ink)] tracking-tight">
                {formatTHB(priceTHB)}
              </span>
              {originalPriceTHB && originalPriceTHB > priceTHB && (
                <span className="font-[family:var(--font-kanit)] text-lg text-[var(--shop-ink-muted)] line-through">
                  {formatTHB(originalPriceTHB)}
                </span>
              )}
            </div>
            <p className="font-[family:var(--font-kanit)] text-xs text-[var(--shop-ink-muted)] mb-8">
              ผ่อน 0% นาน 6 เดือน · เริ่ม {formatTHB(Math.round(priceTHB / 6))}/เดือน
            </p>

            {/* Variant picker */}
            {variants.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-[family:var(--font-kanit)] text-xs tracking-[0.2em] uppercase font-bold text-[var(--shop-ink)]">
                    สี / รุ่น
                  </span>
                  <span className="font-[family:var(--font-kanit)] text-xs text-[var(--shop-ink-muted)]">
                    {variants.find((v) => v.id === activeVariant)?.label ?? variants[0]?.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v) => {
                    const isActive = v.id === activeVariant;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveVariant(v.id)}
                        aria-pressed={isActive}
                        aria-label={`เลือก ${v.label}`}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 border transition-all duration-200 font-[family:var(--font-kanit)] text-xs tracking-wider uppercase ${
                          isActive
                            ? 'border-[var(--shop-primary)] bg-[var(--shop-primary)]/5 text-[var(--shop-ink)] font-bold'
                            : 'border-[var(--shop-border)] text-[var(--shop-ink-muted)] hover:border-[var(--shop-ink)]/40 hover:text-[var(--shop-ink)]'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className="w-4 h-4 rounded-full border border-[var(--shop-ink)]/20"
                          style={{ background: v.swatch ?? 'var(--shop-primary)' }}
                        />
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QTY + CTA */}
            <div className="flex gap-3 mb-8">
              <div
                className="flex items-center border border-[var(--shop-border)] bg-[var(--shop-card)]"
                role="group"
                aria-label="จำนวน"
              >
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="ลดจำนวน"
                  className="px-4 py-3 text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] transition-colors font-[family:var(--font-prompt)] text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)))
                  }
                  aria-label="จำนวน"
                  className="w-12 text-center bg-transparent border-0 outline-none font-[family:var(--font-prompt)] font-bold text-[var(--shop-ink)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setQty(Math.min(99, qty + 1))}
                  aria-label="เพิ่มจำนวน"
                  className="px-4 py-3 text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)] transition-colors font-[family:var(--font-prompt)] text-lg"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[var(--shop-primary)] hover:bg-[var(--shop-primary)]/90 text-[var(--shop-on-primary,#fff)] font-[family:var(--font-kanit)] font-bold tracking-[0.16em] uppercase text-sm py-4 px-6 transition-all duration-300 shadow-[0_8px_24px_-8px_var(--shop-primary)] hover:shadow-[0_12px_32px_-8px_var(--shop-primary)] active:translate-y-[1px]"
              >
                เพิ่มลงตะกร้า · {formatTHB(priceTHB * qty)}
              </button>
            </div>

            {/* Trust rail — Hi-Res / Bluetooth codec / driver spec */}
            <div
              className="grid grid-cols-2 gap-px bg-[var(--shop-border)] border border-[var(--shop-border)]"
              role="list"
              aria-label="คุณสมบัติเด่น"
            >
              {trustBadges.map((b) => (
                <div
                  key={b.label}
                  role="listitem"
                  className="bg-[var(--shop-card)] p-4 flex flex-col gap-1"
                >
                  <span className="font-[family:var(--font-prompt)] text-[11px] tracking-[0.2em] uppercase font-bold text-[var(--shop-primary)]">
                    {b.label}
                  </span>
                  <span className="font-[family:var(--font-kanit)] text-sm text-[var(--shop-ink)] font-medium">
                    {b.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ Sound Signature ============ */}
      <section className="relative z-10 border-y border-[var(--shop-border)] bg-[var(--shop-card)]">
        <div className="container mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-center">
          <div>
            <div className="font-[family:var(--font-kanit)] text-[11px] tracking-[0.28em] uppercase text-[var(--shop-primary)] font-bold mb-3">
              Sound Signature
            </div>
            <h2 className="font-[family:var(--font-prompt)] text-3xl md:text-4xl font-bold text-[var(--shop-ink)] leading-tight mb-5">
              เสียงสมดุล ปลาย treble ที่ดูแลรายละเอียด
            </h2>
            <p className="font-[family:var(--font-kanit)] text-base text-[var(--shop-ink-muted)] leading-relaxed max-w-prose">
              ปรับจูนโดย acoustic engineer ที่เคยมิกซ์อัลบั้มในสตูดิโอ Abbey Road ·
              เน้นย่าน mid-high ที่ใส โดยไม่กัดหู และ bass ที่ลงลึกแต่ไม่ตื้น เหมาะกับ
              acoustic / jazz / vocal / lo-fi
            </p>
          </div>
          <div className="text-[var(--shop-ink)]">
            <SoundSignatureCurve bands={equalizer} />
          </div>
        </div>
      </section>

      {/* ============ Spec Rail ============ */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="font-[family:var(--font-kanit)] text-[11px] tracking-[0.28em] uppercase text-[var(--shop-primary)] font-bold mb-3">
          Technical Specs
        </div>
        <h2 className="font-[family:var(--font-prompt)] text-3xl md:text-4xl font-bold text-[var(--shop-ink)] mb-10">
          ข้อมูลทางเทคนิค
        </h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--shop-border)] border border-[var(--shop-border)]">
          {[
            { k: 'ไดรเวอร์', v: 'Planar Magnetic 50 มม.' },
            { k: 'การตอบสนองความถี่', v: '10 Hz – 40 kHz' },
            { k: 'ความต้านทาน', v: '32 Ω' },
            { k: 'ความไว', v: '105 dB / 1mW' },
            { k: 'น้ำหนัก', v: '320 g' },
            { k: 'การเชื่อมต่อ', v: 'Bluetooth 5.3 · 3.5mm · USB-C' },
            { k: 'รองรับ Codec', v: 'LDAC · aptX Adaptive · AAC' },
            { k: 'อายุการใช้งานแบตเตอรี่', v: '40 ชม. (BT) · 60 ชม. (สาย)' },
            { k: 'การชาร์จ', v: 'USB-C · ชาร์จเร็ว 10 นาที = 8 ชม.' },
          ].map((row) => (
            <div key={row.k} className="bg-[var(--shop-card)] p-5 flex flex-col gap-1">
              <dt className="font-[family:var(--font-prompt)] text-[10px] tracking-[0.24em] uppercase font-bold text-[var(--shop-ink-muted)]">
                {row.k}
              </dt>
              <dd className="font-[family:var(--font-kanit)] text-base font-medium text-[var(--shop-ink)]">
                {row.v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ============ Related Products ============ */}
      {related.length > 0 && (
        <section className="relative z-10 border-t border-[var(--shop-border)] bg-[var(--shop-card)]">
          <div className="container mx-auto px-6 py-16">
            <div className="flex items-end justify-between mb-10 gap-6">
              <div>
                <div className="font-[family:var(--font-kanit)] text-[11px] tracking-[0.28em] uppercase text-[var(--shop-primary)] font-bold mb-3">
                  More Gear
                </div>
                <h2 className="font-[family:var(--font-prompt)] text-3xl md:text-4xl font-bold text-[var(--shop-ink)]">
                  เครื่องเสียงที่คุณอาจชอบ
                </h2>
              </div>
              <a
                href={shopUrl}
                className="hidden md:inline-block font-[family:var(--font-kanit)] text-xs tracking-[0.2em] uppercase font-bold text-[var(--shop-primary)] hover:underline"
              >
                ดูทั้งหมด →
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.slice(0, 8).map((p) => (
                <a
                  key={p.id}
                  href={`/stores/${storeSlug}/products/${p.id}`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden bg-[var(--shop-bg)] border border-[var(--shop-border)] mb-3">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-[var(--shop-ink-muted)] font-[family:var(--font-prompt)] text-3xl">
                        ♪
                      </div>
                    )}
                  </div>
                  <div className="font-[family:var(--font-kanit)] text-[10px] tracking-[0.2em] uppercase text-[var(--shop-ink-muted)] mb-1">
                    {p.categoryName ?? categoryName}
                  </div>
                  <h3 className="font-[family:var(--font-prompt)] text-base font-bold text-[var(--shop-ink)] leading-snug mb-2 group-hover:text-[var(--shop-primary)] transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-[family:var(--font-prompt)] text-sm font-bold text-[var(--shop-ink)]">
                      {formatTHB(p.priceTHB)}
                    </span>
                    {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                      <span className="font-[family:var(--font-kanit)] text-xs text-[var(--shop-ink-muted)] line-through">
                        {formatTHB(p.compareAtPriceTHB)}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default WavelengthAudioProductDetail;
