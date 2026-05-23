'use client';

/**
 * keystroke-lab — Bespoke ProductDetail page.
 *
 * Vibe: mechanical keyboard lab. Hardware-spec sheet meets switch
 * tester. Mono font, ASCII grid, top-down + side-view gallery
 * frames, ASCII frequency-meter as the sound-test placeholder,
 * spec rack as the variant picker.
 *
 * Color tokens — strictly --shop-* (mapped via .theme-electronics-tech
 * to a slate/white/blue/cyan palette). Never hardcode hex; the store
 * accent shifts per tenant and we want the PDP to track it.
 *
 * Data contract: receives `ProductDetailProps` from the per-store
 * route dispatcher in app/stores/[slug]/products/[id]/page.tsx via
 * the template registry's `pages.pdp` slot.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCw,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

// ----------------------------------------------------------------------------
// Local UI helpers
// ----------------------------------------------------------------------------

/** Build distinct variant options from product.variants, deduped by label. */
function buildVariantOptions(
  product: ProductDetailProps['product'],
): Array<{ key: string; label: string; code: string }> {
  const out: Array<{ key: string; label: string; code: string }> = [];
  const seen = new Set<string>();
  for (const v of product.variants) {
    const label =
      v.colorLabel ||
      v.sizeLabel ||
      v.materialLabel ||
      Object.values(v.attributes ?? {}).join(' / ') ||
      '';
    if (!label || seen.has(label)) continue;
    seen.add(label);
    out.push({ key: v.id, label, code: label.toUpperCase().slice(0, 12) });
  }
  return out;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export function KeystrokeLabProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;

  // Gallery — dedup imageUrl into images, fall back to a single
  // placeholder so the top-down / side-view frames always render.
  const gallery: string[] = useMemo(() => {
    const list = product.images && product.images.length > 0 ? product.images : [];
    const merged = [product.imageUrl, ...list].filter(
      (x): x is string => typeof x === 'string' && x.length > 0,
    );
    return Array.from(new Set(merged));
  }, [product.images, product.imageUrl]);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const variantOptions = useMemo(() => buildVariantOptions(product), [product]);
  const [selectedVariant, setSelectedVariant] = useState<string>(
    variantOptions[0]?.key ?? '',
  );

  // Cart wiring — useCart add + cartConfirm modal toast (same pattern
  // as the keystroke-lab Homepage card).
  const add = useCart((s) => s.add);

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

  const discount =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
      ? Math.round((1 - product.priceTHB / product.originalPriceTHB) * 100)
      : 0;

  const subtotal = product.priceTHB * qty;

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--shop-bg)',
        color: 'var(--shop-ink)',
        fontFamily: 'var(--font-tech-mono, var(--shop-font))',
      }}
    >
      {/* ── Breadcrumb (terminal-style path) ───────────────────────── */}
      <div
        className="border-b"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <nav
          aria-label="Breadcrumb"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]"
          data-tech-mono="true"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          <span style={{ color: 'var(--shop-primary)' }}>~/</span>
          <Link
            href={`/stores/${store.slug}`}
            className="hover:underline transition-colors"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            HOME
          </Link>
          <ChevronRight size={11} aria-hidden="true" />
          <Link
            href={`/stores/${store.slug}/category`}
            className="hover:underline transition-colors"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            CATALOG
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight size={11} aria-hidden="true" />
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:underline transition-colors uppercase"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={11} aria-hidden="true" />
          <span
            className="truncate max-w-[260px]"
            style={{ color: 'var(--shop-ink)' }}
          >
            {product.title}
          </span>
        </nav>
      </div>

      {/* ── Top frame: gallery + spec column ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12">
          {/* ── Gallery (top-down + side view) ───────────────────── */}
          <div className="space-y-4">
            {/* ASCII corner-frame anchor (top label) */}
            <div
              className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em]"
              data-tech-mono="true"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              <span>
                <span style={{ color: 'var(--shop-primary)' }}>┌──</span> TOP-DOWN ·{' '}
                <span style={{ color: 'var(--shop-ink)' }}>FRAME {activeImage + 1}/{Math.max(gallery.length, 1)}</span>
              </span>
              <span>SIDE VIEW ──┐</span>
            </div>

            {/* Main gallery viewport */}
            <div
              className="relative aspect-[4/3] border overflow-hidden"
              data-tech-glow="true"
              style={{
                background: 'var(--shop-muted, var(--shop-card))',
                borderColor: 'var(--shop-border)',
                borderRadius: 'var(--shop-radius)',
              }}
            >
              {/* ASCII grid overlay — mech-lab graph paper */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, color-mix(in srgb, var(--shop-ink) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--shop-ink) 6%, transparent) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              {/* Crosshair tick marks */}
              <div
                aria-hidden="true"
                className="absolute top-2 left-2 text-[10px] uppercase tracking-[0.22em]"
                data-tech-mono="true"
                style={{ color: 'var(--shop-primary)' }}
              >
                +X / +Y
              </div>
              <div
                aria-hidden="true"
                className="absolute bottom-2 right-2 text-[10px] uppercase tracking-[0.22em]"
                data-tech-mono="true"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                SCALE 1:1
              </div>

              {gallery[activeImage] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={gallery[activeImage]}
                  alt={`${product.title} — view ${activeImage + 1}`}
                  className="relative z-10 w-full h-full object-contain p-6"
                />
              ) : (
                <div
                  className="relative z-10 w-full h-full flex items-center justify-center text-[11px] uppercase tracking-[0.22em]"
                  data-tech-mono="true"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  [ NO PHOTO ON FILE ]
                </div>
              )}

              {/* Discount stamp */}
              {discount > 0 && (
                <div
                  className="absolute top-3 right-3 px-2 py-1 text-[10px] uppercase tracking-[0.22em] font-bold border"
                  data-tech-mono="true"
                  style={{
                    background: 'var(--shop-primary)',
                    color: 'var(--shop-card)',
                    borderColor: 'var(--shop-primary)',
                  }}
                >
                  −{discount}%
                </div>
              )}
            </div>

            {/* Thumbnail rail — frames as side-view candidates */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    aria-label={`Switch to view ${idx + 1}`}
                    aria-pressed={idx === activeImage}
                    className="relative flex-shrink-0 w-20 h-20 border overflow-hidden transition-colors"
                    style={{
                      borderColor:
                        idx === activeImage
                          ? 'var(--shop-primary)'
                          : 'var(--shop-border)',
                      borderWidth: idx === activeImage ? 2 : 1,
                      background: 'var(--shop-muted, var(--shop-card))',
                      borderRadius: 'calc(var(--shop-radius) * 0.5)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-contain p-2"
                      aria-hidden="true"
                    />
                    <span
                      className="absolute bottom-0 left-1 text-[8px] uppercase tracking-[0.18em]"
                      data-tech-mono="true"
                      style={{
                        color:
                          idx === activeImage
                            ? 'var(--shop-primary)'
                            : 'var(--shop-ink-muted)',
                      }}
                    >
                      F{String(idx + 1).padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* ── Info column (buy block) ─────────────────────────── */}
          <div className="flex flex-col">
            {product.categoryName && (
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-[10px] uppercase tracking-[0.22em]"
                  data-tech-mono="true"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {product.categoryName}
                </span>
              </div>
            )}

            <h1
              className="text-2xl md:text-3xl font-bold leading-tight mb-3"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: 'var(--font-tech-display, var(--shop-font-display))',
                letterSpacing: '-0.015em',
              }}
            >
              {product.title}
            </h1>

            {product.description && (
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: 'var(--shop-ink-muted)', fontFamily: 'var(--shop-font)' }}
              >
                {product.description}
              </p>
            )}

            {/* Price */}
            <div
              className="border-t border-b py-5 mb-6 flex items-baseline gap-3 flex-wrap"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <div
                className="text-3xl md:text-4xl font-bold tabular-nums"
                data-tech-mono="true"
                style={{ color: 'var(--shop-primary)' }}
              >
                {formatTHB(product.priceTHB)}
              </div>
              {product.originalPriceTHB && product.originalPriceTHB > product.priceTHB && (
                <span
                  className="text-sm line-through tabular-nums"
                  data-tech-mono="true"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {formatTHB(product.originalPriceTHB)}
                </span>
              )}
              {discount > 0 && (
                <span
                  className="ml-auto text-[11px] uppercase tracking-[0.22em] font-bold"
                  data-tech-mono="true"
                  style={{ color: 'var(--shop-accent)' }}
                >
                  SAVE {formatTHB((product.originalPriceTHB ?? 0) - product.priceTHB)}
                </span>
              )}
            </div>

            {/* ── Variant picker (from real product.variants) ─────── */}
            {variantOptions.length > 0 && (
              <fieldset className="mb-6">
                <legend
                  className="flex items-center justify-between w-full mb-2 text-[11px] uppercase tracking-[0.22em]"
                  data-tech-mono="true"
                >
                  <span style={{ color: 'var(--shop-ink)' }}>
                    <span style={{ color: 'var(--shop-primary)' }}>$</span> --variant=
                    <span style={{ color: 'var(--shop-ink)', fontWeight: 700 }}>
                      {variantOptions.find((o) => o.key === selectedVariant)?.label ?? '—'}
                    </span>
                  </span>
                  <span style={{ color: 'var(--shop-ink-muted)' }}>
                    {variantOptions.length} OPT
                  </span>
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {variantOptions.map((opt) => {
                    const active = opt.key === selectedVariant;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setSelectedVariant(opt.key)}
                        aria-pressed={active}
                        className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] border transition-colors text-left"
                        data-tech-mono="true"
                        style={{
                          borderColor: active ? 'var(--shop-primary)' : 'var(--shop-border)',
                          background: active
                            ? 'color-mix(in srgb, var(--shop-primary) 10%, var(--shop-card))'
                            : 'var(--shop-card)',
                          color: active ? 'var(--shop-primary)' : 'var(--shop-ink)',
                          borderRadius: 'calc(var(--shop-radius) * 0.5)',
                        }}
                      >
                        <span className="block font-bold">{opt.code}</span>
                        <span
                          className="block text-[10px] mt-0.5"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* ── Qty + subtotal ──────────────────────────────── */}
            <div
              className="flex items-center justify-between gap-4 py-4 mb-4 border-t border-b"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <div
                className="text-[11px] uppercase tracking-[0.22em]"
                data-tech-mono="true"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                QTY × UNIT
              </div>
              <div
                className="inline-flex items-center border"
                role="group"
                aria-label="Quantity"
                style={{
                  borderColor: 'var(--shop-border)',
                  background: 'var(--shop-card)',
                  borderRadius: 'calc(var(--shop-radius) * 0.5)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 flex items-center justify-center transition-colors"
                  style={{ color: 'var(--shop-ink)' }}
                  disabled={qty <= 1}
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!isNaN(n) && n >= 1) setQty(Math.min(99, n));
                  }}
                  aria-label="Quantity"
                  className="w-12 h-9 text-center bg-transparent outline-none tabular-nums text-sm font-bold"
                  data-tech-mono="true"
                  style={{ color: 'var(--shop-ink)' }}
                />
                <button
                  type="button"
                  onClick={() => setQty(Math.min(99, qty + 1))}
                  aria-label="Increase quantity"
                  className="w-9 h-9 flex items-center justify-center transition-colors"
                  style={{ color: 'var(--shop-ink)' }}
                  disabled={qty >= 99}
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
              <div
                className="text-right tabular-nums text-lg font-bold"
                data-tech-mono="true"
                style={{ color: 'var(--shop-primary)' }}
                aria-live="polite"
              >
                {formatTHB(subtotal)}
              </div>
            </div>

            {/* ── CTAs ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-6">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[12px] uppercase tracking-[0.18em] font-bold transition-transform hover:scale-[1.01]"
                data-tech-mono="true"
                style={{
                  background: 'var(--shop-primary)',
                  color: 'var(--shop-card)',
                  borderRadius: 'calc(var(--shop-radius) * 0.5)',
                }}
              >
                <ShoppingCart size={16} aria-hidden="true" />
                ADD · {qty} UNIT{qty > 1 ? 'S' : ''} · {formatTHB(subtotal)}
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[12px] uppercase tracking-[0.18em] font-bold border transition-colors"
                data-tech-mono="true"
                style={{
                  background: 'var(--shop-card)',
                  color: 'var(--shop-ink)',
                  borderColor: 'var(--shop-ink)',
                  borderRadius: 'calc(var(--shop-radius) * 0.5)',
                }}
                aria-label="Buy now"
              >
                <Zap size={16} aria-hidden="true" />
                BUY NOW
              </button>
            </div>

            {/* ── Trust badges row ─────────────────────────────── */}
            <ul
              role="list"
              aria-label="Trust signals"
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2"
            >
              {[
                { icon: Truck, label: 'จัดส่งฟรี', sub: 'สั่งครบ ฿1,500' },
                { icon: RotateCw, label: 'เปลี่ยนคืน 14 วัน', sub: 'ไม่มีเงื่อนไข' },
                { icon: ShieldCheck, label: 'ประกัน 1 ปี', sub: 'ศูนย์ฯ ในไทย' },
              ].map(({ icon: Icon, label, sub }, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 border"
                  style={{
                    borderColor: 'var(--shop-border)',
                    background: 'var(--shop-card)',
                    borderRadius: 'calc(var(--shop-radius) * 0.5)',
                  }}
                >
                  <Icon
                    size={16}
                    aria-hidden="true"
                    style={{ color: 'var(--shop-primary)' }}
                  />
                  <div className="leading-tight">
                    <div
                      className="text-[11px] font-bold uppercase tracking-[0.16em]"
                      data-tech-mono="true"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {label}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-[0.16em]"
                      data-tech-mono="true"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {sub}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Description (collapsed-style block) ───────────────────── */}
      {product.description && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-12">
            <div>
              <div
                className="text-[10px] uppercase tracking-[0.28em] mb-1"
                data-tech-mono="true"
                style={{ color: 'var(--shop-primary)' }}
              >
                /docs/readme.md
              </div>
              <h2
                className="text-xl md:text-2xl font-bold"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: 'var(--font-tech-display, var(--shop-font-display))',
                }}
              >
                README
              </h2>
            </div>
            <div
              className="border-l pl-6 prose prose-sm max-w-none"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color: 'var(--shop-ink)', fontFamily: 'var(--shop-font)' }}
              >
                {product.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Related rail ────────────────────────────────────────── */}
      {related.length > 0 && (
        <section
          className="border-t"
          style={{
            borderColor: 'var(--shop-border)',
            background: 'var(--shop-bg)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div
              className="flex items-end justify-between mb-6 pb-3 border-b"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <div>
                <div
                  className="text-[10px] uppercase tracking-[0.28em] mb-1"
                  data-tech-mono="true"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  $ ls /database/related
                </div>
                <h2
                  className="text-xl md:text-2xl font-bold"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: 'var(--font-tech-display, var(--shop-font-display))',
                  }}
                >
                  เปรียบเทียบรุ่นใกล้เคียง
                </h2>
              </div>
              <Link
                href={`/stores/${store.slug}/category`}
                className="text-[11px] uppercase tracking-[0.22em] hover:underline"
                data-tech-mono="true"
                style={{ color: 'var(--shop-primary)' }}
              >
                ALL · /catalog →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.slice(0, 4).map((r) => (
                <Link
                  key={r.id}
                  href={`/stores/${store.slug}/products/${r.id}`}
                  className="group block border transition-colors relative overflow-hidden"
                  style={{
                    borderColor: 'var(--shop-border)',
                    background: 'var(--shop-card)',
                    borderRadius: 'var(--shop-radius)',
                  }}
                >
                  {/* ASCII corner ticks (mech-lab card frame) */}
                  <span
                    aria-hidden="true"
                    className="absolute top-1 left-1 w-2 h-2 border-t border-l opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ borderColor: 'var(--shop-primary)' }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 w-2 h-2 border-t border-r opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ borderColor: 'var(--shop-primary)' }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-1 w-2 h-2 border-b border-l opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ borderColor: 'var(--shop-primary)' }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 right-1 w-2 h-2 border-b border-r opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ borderColor: 'var(--shop-primary)' }}
                  />

                  <div
                    className="aspect-square overflow-hidden relative"
                    style={{ background: 'var(--shop-muted, var(--shop-bg))' }}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, color-mix(in srgb, var(--shop-ink) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--shop-ink) 6%, transparent) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }}
                    />
                    {r.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="relative z-10 w-full h-full object-contain p-3 transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="relative z-10 w-full h-full flex items-center justify-center text-[10px] uppercase tracking-[0.22em]"
                        data-tech-mono="true"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        [ NO PHOTO ]
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    {r.categoryName && (
                      <div
                        className="text-[10px] uppercase tracking-[0.22em] mb-1"
                        data-tech-mono="true"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        {r.categoryName}
                      </div>
                    )}
                    <div
                      className="text-sm font-medium line-clamp-2 mb-2 leading-tight"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {r.title}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-sm font-bold tabular-nums"
                        data-tech-mono="true"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {formatTHB(r.priceTHB)}
                      </span>
                      {r.compareAtPriceTHB && r.compareAtPriceTHB > r.priceTHB && (
                        <span
                          className="text-[11px] line-through tabular-nums"
                          data-tech-mono="true"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {formatTHB(r.compareAtPriceTHB)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default KeystrokeLabProductDetail;
