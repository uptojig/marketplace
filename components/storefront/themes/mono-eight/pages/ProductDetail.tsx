'use client';

/**
 * mono-eight — bespoke PDP (replaces the shared makePdpAdapter wiring).
 *
 * Visual vocabulary mirrors the mono-eight chrome (Header / Footer):
 *   - Monochrome JP minimal — ink-on-ivory, no chroma
 *   - Sans-serif Kanit (display) + Prompt (body), uppercase eyebrows
 *     with wide letter-spacing
 *   - Subtle geometric hairline borders, NO drop shadows
 *   - Generous whitespace, asymmetric column rhythm
 *
 * The page-level monochrome palette is materialised once at the
 * root as `--shop-*` CSS variables, so every element below can read
 * `var(--shop-bg)` etc. without sprinkling hex literals through the
 * markup — and the rest of the storefront chrome (which hardcodes
 * #0a0a0a / #e8e2d4 / #1c1c1c) stays visually consistent.
 */

import React, { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, ArrowRight, ChevronRight, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';

// ----------------------------------------------------------------------------
// Mono-eight palette → --shop-* tokens.
// Defined once on the page root via inline style; downstream JSX
// references `var(--shop-*)` only.
// ----------------------------------------------------------------------------
const monoTokens: React.CSSProperties = {
  // bg / ink — almost-black canvas, warm ivory ink (same as chrome)
  ['--shop-bg' as string]: '#0a0a0a',
  ['--shop-ink' as string]: '#e8e2d4',
  ['--shop-card' as string]: '#e8e2d4', // ivory product surface
  ['--shop-border' as string]: '#1c1c1c',
  ['--shop-ink-muted' as string]: 'rgba(232,226,212,0.45)',
  ['--shop-ink-faint' as string]: 'rgba(232,226,212,0.25)',
  ['--shop-primary' as string]: '#e8e2d4',
  ['--shop-accent' as string]: '#e8e2d4',
};

const FONT_DISPLAY = 'var(--font-kanit), system-ui, sans-serif';
const FONT_BODY = 'var(--font-prompt), system-ui, sans-serif';

function ProductDetail({ store, product, related }: ProductDetailProps) {
  // ── Gallery — dedupe imageUrl against images[] so the hero image
  //    doesn't repeat as a thumbnail. ───────────────────────────────
  const gallery = useMemo<string[]>(() => {
    const out: string[] = [];
    const seen = new Set<string>();
    const push = (src?: string | null) => {
      if (!src) return;
      if (seen.has(src)) return;
      seen.add(src);
      out.push(src);
    };
    push(product.imageUrl);
    for (const img of product.images ?? []) push(img);
    return out;
  }, [product.imageUrl, product.images]);

  const [activeImg, setActiveImg] = useState(0);
  const activeSrc = gallery[activeImg] ?? null;

  // ── Variant picker — group variant attributes by colorLabel /
  //    sizeLabel so the picker reads like the rest of the site. ────
  const colorOptions = useMemo(() => {
    const map = new Map<string, { label: string; available: boolean }>();
    for (const v of product.variants) {
      if (!v.colorLabel) continue;
      const has = map.get(v.colorLabel);
      const inStock = v.inventory === null || v.inventory > 0;
      map.set(v.colorLabel, {
        label: v.colorLabel,
        available: has ? has.available || inStock : inStock,
      });
    }
    return Array.from(map.values());
  }, [product.variants]);

  const sizeOptions = useMemo(() => {
    const map = new Map<string, { label: string; available: boolean }>();
    for (const v of product.variants) {
      if (!v.sizeLabel) continue;
      const has = map.get(v.sizeLabel);
      const inStock = v.inventory === null || v.inventory > 0;
      map.set(v.sizeLabel, {
        label: v.sizeLabel,
        available: has ? has.available || inStock : inStock,
      });
    }
    return Array.from(map.values());
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorOptions[0]?.label ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizeOptions[0]?.label ?? null,
  );
  const [qty, setQty] = useState(1);

  // ── Cart wiring — global zustand stores, identical to Homepage. ──
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const handleAddToCart = () => {
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
    showConfirm(product.title, store.slug);
  };

  // ── Price — compareAt only renders when strictly higher than the
  //    selling price (defensive against bad data). ─────────────────
  const hasCompare =
    product.originalPriceTHB != null && product.originalPriceTHB > product.priceTHB;

  const homeUrl = `/stores/${store.slug}`;
  const shopUrl = `/stores/${store.slug}/category`;

  return (
    <main
      style={{
        ...monoTokens,
        backgroundColor: 'var(--shop-bg)',
        color: 'var(--shop-ink)',
        fontFamily: FONT_BODY,
      }}
      className="min-h-screen"
    >
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BREADCRUMB                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Breadcrumb"
        className="border-b"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          <a
            href={homeUrl}
            className="transition-colors duration-300 hover:opacity-100"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            หน้าแรก
          </a>
          <ChevronRight size={11} strokeWidth={1.5} style={{ color: 'var(--shop-ink-faint)' }} />
          <a
            href={shopUrl}
            className="transition-colors duration-300 hover:opacity-100"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            สินค้า
          </a>
          {product.categoryName && (
            <>
              <ChevronRight size={11} strokeWidth={1.5} style={{ color: 'var(--shop-ink-faint)' }} />
              <a
                href={`${shopUrl}?cat=${encodeURIComponent(product.categoryName)}`}
                className="transition-colors duration-300 hover:opacity-100"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                {product.categoryName}
              </a>
            </>
          )}
          <ChevronRight size={11} strokeWidth={1.5} style={{ color: 'var(--shop-ink-faint)' }} />
          <span
            className="truncate max-w-[220px] sm:max-w-none"
            style={{ color: 'var(--shop-ink)' }}
          >
            {product.title}
          </span>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO — gallery (left) + info (right)                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section
        className="border-b"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

            {/* ── Gallery ───────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              {/* Main image — 3:4 ivory tile */}
              <div
                className="aspect-[3/4] relative overflow-hidden"
                style={{ backgroundColor: 'var(--shop-card)' }}
              >
                {activeSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeSrc}
                    alt={product.title}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em]"
                    style={{
                      fontFamily: FONT_DISPLAY,
                      color: 'rgba(10,10,10,0.25)',
                    }}
                  >
                    NO IMAGE
                  </div>
                )}
                {/* Position chip — bottom-left */}
                {gallery.length > 1 && (
                  <span
                    className="absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 backdrop-blur-sm"
                    style={{
                      fontFamily: FONT_DISPLAY,
                      backgroundColor: 'rgba(10,10,10,0.78)',
                      color: 'var(--shop-ink)',
                    }}
                  >
                    {String(activeImg + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Thumb strip */}
              {gallery.length > 1 && (
                <div
                  className="grid grid-flow-col auto-cols-[18%] sm:auto-cols-[14%] gap-px mt-px overflow-x-auto"
                  style={{ backgroundColor: 'var(--shop-border)' }}
                  aria-label="ภาพสินค้าอื่นๆ"
                >
                  {gallery.map((src, idx) => (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => setActiveImg(idx)}
                      className="aspect-square relative overflow-hidden transition-opacity duration-300"
                      style={{
                        backgroundColor: 'var(--shop-card)',
                        opacity: idx === activeImg ? 1 : 0.55,
                      }}
                      aria-label={`เลือกภาพที่ ${idx + 1}`}
                      aria-current={idx === activeImg}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover grayscale"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info column ──────────────────────────────────── */}
            <div className="flex flex-col">
              {/* Eyebrow */}
              <span
                className="text-[10px] font-black uppercase tracking-[0.3em] mb-4"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: 'var(--shop-ink-muted)',
                }}
              >
                {product.categoryName ?? 'MONO EIGHT'}
              </span>

              {/* Title */}
              <h1
                className="font-black text-3xl sm:text-4xl lg:text-5xl uppercase leading-[0.95] tracking-tight"
                style={{ fontFamily: FONT_DISPLAY, color: 'var(--shop-ink)' }}
              >
                {product.title}
              </h1>

              {/* Hairline */}
              <div
                className="w-12 border-t mt-7 mb-7"
                style={{ borderColor: 'var(--shop-border)' }}
              />

              {/* Price */}
              <div className="flex items-baseline gap-4 flex-wrap">
                <span
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ fontFamily: FONT_DISPLAY, color: 'var(--shop-ink)' }}
                >
                  {formatTHB(product.priceTHB)}
                </span>
                {hasCompare && (
                  <>
                    <span
                      className="text-sm line-through"
                      style={{
                        color: 'var(--shop-ink-faint)',
                      }}
                    >
                      {formatTHB(product.originalPriceTHB!)}
                    </span>
                    <span
                      className="text-[10px] font-black uppercase tracking-[0.2em] border px-2 py-1"
                      style={{
                        fontFamily: FONT_DISPLAY,
                        borderColor: 'var(--shop-ink)',
                        color: 'var(--shop-ink)',
                      }}
                    >
                      ลด {Math.round((1 - product.priceTHB / product.originalPriceTHB!) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock note */}
              {typeof product.stockLeft === 'number' && product.stockLeft > 0 && product.stockLeft <= 8 && (
                <p
                  className="mt-3 text-[10px] font-black uppercase tracking-[0.25em]"
                  style={{ fontFamily: FONT_DISPLAY, color: 'var(--shop-ink-muted)' }}
                >
                  เหลือ {product.stockLeft} ชิ้น
                </p>
              )}

              {/* Short description */}
              {product.description && (
                <p
                  className="mt-6 text-sm leading-relaxed max-w-md"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {product.description.length > 220
                    ? `${product.description.slice(0, 220).trim()}…`
                    : product.description}
                </p>
              )}

              {/* ── Color variant picker ────────────────────── */}
              {colorOptions.length > 0 && (
                <div className="mt-10">
                  <div
                    className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] mb-3"
                    style={{ fontFamily: FONT_DISPLAY }}
                  >
                    <span style={{ color: 'var(--shop-ink-muted)' }}>สี</span>
                    <span style={{ color: 'var(--shop-ink)' }}>{selectedColor ?? '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((opt) => {
                      const active = opt.label === selectedColor;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => opt.available && setSelectedColor(opt.label)}
                          disabled={!opt.available}
                          aria-pressed={active}
                          className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border transition-all duration-300 disabled:opacity-30 disabled:line-through disabled:cursor-not-allowed"
                          style={{
                            fontFamily: FONT_DISPLAY,
                            borderColor: active ? 'var(--shop-ink)' : 'var(--shop-border)',
                            backgroundColor: active ? 'var(--shop-ink)' : 'transparent',
                            color: active ? 'var(--shop-bg)' : 'var(--shop-ink-muted)',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Size variant picker ─────────────────────── */}
              {sizeOptions.length > 0 && (
                <div className="mt-7">
                  <div
                    className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] mb-3"
                    style={{ fontFamily: FONT_DISPLAY }}
                  >
                    <span style={{ color: 'var(--shop-ink-muted)' }}>ไซส์</span>
                    <span style={{ color: 'var(--shop-ink)' }}>{selectedSize ?? '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((opt) => {
                      const active = opt.label === selectedSize;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => opt.available && setSelectedSize(opt.label)}
                          disabled={!opt.available}
                          aria-pressed={active}
                          className="text-[10px] font-black uppercase tracking-[0.2em] min-w-[3rem] px-4 py-2 border transition-all duration-300 disabled:opacity-30 disabled:line-through disabled:cursor-not-allowed"
                          style={{
                            fontFamily: FONT_DISPLAY,
                            borderColor: active ? 'var(--shop-ink)' : 'var(--shop-border)',
                            backgroundColor: active ? 'var(--shop-ink)' : 'transparent',
                            color: active ? 'var(--shop-bg)' : 'var(--shop-ink-muted)',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Qty stepper + CTA ───────────────────────── */}
              <div className="mt-10 flex items-stretch gap-3">
                <div
                  className="flex items-center border"
                  style={{ borderColor: 'var(--shop-border)' }}
                  role="group"
                  aria-label="จำนวน"
                >
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-11 h-12 flex items-center justify-center transition-colors duration-300"
                    style={{ color: 'var(--shop-ink-muted)' }}
                    aria-label="ลดจำนวน"
                  >
                    <Minus size={14} strokeWidth={1.5} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={qty}
                    onChange={(e) => {
                      const next = parseInt(e.target.value, 10);
                      setQty(Number.isFinite(next) && next >= 1 ? Math.min(99, next) : 1);
                    }}
                    className="w-10 h-12 text-center text-sm font-black bg-transparent outline-none"
                    style={{
                      fontFamily: FONT_DISPLAY,
                      color: 'var(--shop-ink)',
                    }}
                    aria-label="จำนวน"
                  />
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    className="w-11 h-12 flex items-center justify-center transition-colors duration-300"
                    style={{ color: 'var(--shop-ink-muted)' }}
                    aria-label="เพิ่มจำนวน"
                  >
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 inline-flex items-center justify-center gap-3 h-12 px-6 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:opacity-90"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    backgroundColor: 'var(--shop-ink)',
                    color: 'var(--shop-bg)',
                  }}
                >
                  <ShoppingBag size={14} strokeWidth={2} />
                  เพิ่มลงตะกร้า
                </button>
              </div>

              {/* ── Trust badges — 3-up hairline grid ───────── */}
              <div
                className="mt-12 grid grid-cols-3 divide-x"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                {[
                  {
                    Icon: Truck,
                    label: 'ส่งฟรี',
                    sub: 'สั่งซื้อครบ ฿890',
                  },
                  {
                    Icon: RotateCcw,
                    label: 'เปลี่ยนคืน',
                    sub: 'ภายใน 14 วัน',
                  },
                  {
                    Icon: ShieldCheck,
                    label: 'รับประกัน',
                    sub: 'ตัดเย็บคุณภาพ',
                  },
                ].map(({ Icon, label, sub }, i) => (
                  <div
                    key={label}
                    className={`px-4 py-5 flex flex-col items-start gap-2 ${i === 0 ? 'pl-0' : ''}`}
                    style={{
                      borderColor: 'var(--shop-border)',
                    }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.25}
                      style={{ color: 'var(--shop-ink)' }}
                    />
                    <span
                      className="text-[10px] font-black uppercase tracking-[0.2em]"
                      style={{
                        fontFamily: FONT_DISPLAY,
                        color: 'var(--shop-ink)',
                      }}
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DESCRIPTION — full-width editorial block                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {product.description && product.description.length > 0 && (
        <section
          className="border-b"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              <div className="lg:col-span-4">
                <span
                  className="text-[10px] font-black uppercase tracking-[0.3em] block mb-3"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    color: 'var(--shop-ink-muted)',
                  }}
                >
                  รายละเอียดสินค้า
                </span>
                <h2
                  className="font-black text-2xl lg:text-3xl uppercase tracking-tight"
                  style={{ fontFamily: FONT_DISPLAY, color: 'var(--shop-ink)' }}
                >
                  เกี่ยวกับชิ้นนี้
                </h2>
              </div>
              <div className="lg:col-span-8">
                <div
                  className="text-sm leading-relaxed whitespace-pre-line"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {product.description}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* RELATED — 4-card rail                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section
          className="border-b"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
            <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
              <div>
                <span
                  className="text-[10px] font-black uppercase tracking-[0.3em] block mb-2"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    color: 'var(--shop-ink-muted)',
                  }}
                >
                  สินค้าแนะนำ
                </span>
                <h2
                  className="font-black text-2xl lg:text-3xl uppercase tracking-tight"
                  style={{ fontFamily: FONT_DISPLAY, color: 'var(--shop-ink)' }}
                >
                  ดูเพิ่ม
                </h2>
              </div>
              <a
                href={shopUrl}
                className="inline-flex items-center gap-3 group text-[11px] font-black uppercase tracking-[0.25em] border-b pb-1 transition-colors duration-300"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: 'var(--shop-ink)',
                  borderColor: 'var(--shop-border)',
                }}
              >
                ดูทั้งหมด
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </a>
            </div>

            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-px"
              style={{ backgroundColor: 'var(--shop-border)' }}
            >
              {related.slice(0, 4).map((p) => {
                const cardCompare =
                  p.compareAtPriceTHB != null && p.compareAtPriceTHB > p.priceTHB;
                return (
                  <a
                    key={p.id}
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="group block"
                    style={{ backgroundColor: 'var(--shop-bg)' }}
                  >
                    <div
                      className="aspect-[3/4] overflow-hidden relative"
                      style={{ backgroundColor: 'var(--shop-card)' }}
                    >
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-[9px] font-black uppercase tracking-[0.3em]"
                          style={{
                            fontFamily: FONT_DISPLAY,
                            color: 'rgba(10,10,10,0.2)',
                          }}
                        >
                          NO IMAGE
                        </div>
                      )}
                      {p.categoryName && (
                        <span
                          className="absolute top-3 left-3 text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 backdrop-blur-sm"
                          style={{
                            fontFamily: FONT_DISPLAY,
                            backgroundColor: 'rgba(10,10,10,0.78)',
                            color: 'var(--shop-ink)',
                          }}
                        >
                          {p.categoryName}
                        </span>
                      )}
                    </div>
                    <div className="px-4 py-4">
                      <h3
                        className="text-xs leading-relaxed line-clamp-2 mb-2"
                        style={{
                          color: 'var(--shop-ink-muted)',
                        }}
                      >
                        {p.title}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-sm font-black"
                          style={{
                            fontFamily: FONT_DISPLAY,
                            color: 'var(--shop-ink)',
                          }}
                        >
                          {formatTHB(p.priceTHB)}
                        </span>
                        {cardCompare && (
                          <span
                            className="text-[10px] line-through"
                            style={{ color: 'var(--shop-ink-faint)' }}
                          >
                            {formatTHB(p.compareAtPriceTHB!)}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export { ProductDetail };
export default ProductDetail;
