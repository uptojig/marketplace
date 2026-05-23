'use client';

/**
 * wavelength-audio — bespoke Product Detail page
 *
 * Vibe: audio-gear · dark/light contrast · planar sound-wave illustrations.
 *
 * Uses `var(--shop-*)` tokens — never hardcoded hex values.
 * Accepts the canonical `ProductDetailProps` shape from `@/lib/templates/types`,
 * with optional `extras` for editor / preview wiring (close-up gallery,
 * on-ear lifestyle shots).
 */

import React, { useMemo, useState } from 'react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps as ScaffoldProductDetailProps } from '@/lib/templates/types';

// ============================================================================
// Types
// ============================================================================

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
    return scaffoldVariants
      .map((v) => ({
        id: v.id,
        label: v.colorLabel ?? v.materialLabel ?? v.sizeLabel ?? 'Standard',
        swatch: undefined as string | undefined,
      }))
      .filter((v, i, arr) => arr.findIndex((x) => x.label === v.label) === i);
  }, [props.extras?.variants, product?.variants]);

  // ---- Local UI state ----
  const [activeImage, setActiveImage] = useState(0);
  const [activeVariant, setActiveVariant] = useState(variants[0]?.id ?? '');
  const [qty, setQty] = useState(1);

  // ---- Cart wiring ----
  const add = useCart((s) => s.add);

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

                <div className="absolute bottom-4 right-4 px-3 py-1.5 border border-[var(--shop-ink)]/30 bg-[var(--shop-bg)]/70 backdrop-blur font-[family:var(--font-kanit)] text-[11px] tracking-widest uppercase text-[var(--shop-ink)]">
                  {activeImage + 1} / {gallery.length}
                </div>
              </div>
            </div>
          </div>

          {/* ----- Buy Box ----- */}
          <div className="flex flex-col">
            {/* Category eyebrow */}
            {categoryName && (
              <div className="font-[family:var(--font-kanit)] text-[11px] tracking-[0.28em] uppercase text-[var(--shop-primary)] font-bold mb-3">
                {categoryName}
              </div>
            )}

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
            <div className="mb-8" />

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
          </div>
        </div>
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
