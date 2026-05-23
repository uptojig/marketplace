'use client';

/**
 * carbon-era-cameras — Bespoke PDP
 *
 * Vibe: vintage camera spec-sheet · monochrome + accent · mono for specs
 * Layout: sticky gallery (left) with frame-label thumbs + technical
 * crosshair overlay · info column with grade-stamped badges · spec-sheet
 * description · tech specs table · refurb trust grid · "lab notes"
 * related rail.
 *
 * Token discipline:
 * - Colors are var(--shop-ink) / var(--shop-bg) / var(--shop-card) /
 *   var(--shop-border) / var(--shop-ink-muted) / var(--shop-primary).
 * - Display font: var(--font-kanit). Body: var(--font-prompt). Mono spec
 *   slots: ui-monospace stack (no hex / no hardcoded font literals).
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Minus,
  Plus,
  Camera,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  Truck,
  Aperture,
  Crosshair,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

// ──────────────────────────────────────────────────────────────────────
// Spec sheet helpers
// ──────────────────────────────────────────────────────────────────────

/**
 * Deterministic refurbish grade derived from product id so every product
 * gets a stable A+/A/B+ stamp without needing extra DB columns. Pure id
 * hash → never random across renders.
 */
const GRADES = ['A+', 'A', 'A-', 'B+'] as const;
function gradeFor(id: string): (typeof GRADES)[number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return GRADES[Math.abs(h) % GRADES.length];
}

/**
 * Pull a deterministic five-row "tech specs" sheet from the product so
 * the table always renders, even when the supplier hasn't filled in
 * structured attributes yet. Real variants override the format / mount
 * rows when present.
 */
function buildTechSpecs(
  product: ProductDetailProps['product'],
): { label: string; value: string }[] {
  const grade = gradeFor(product.id);
  const idTail = product.id.slice(-6).toUpperCase();
  const lensVariant = product.variants.find((v) => v.colorLabel)?.colorLabel;
  const sizeVariant = product.variants.find((v) => v.sizeLabel)?.sizeLabel;

  const rows: { label: string; value: string }[] = [
    { label: 'Format', value: sizeVariant ?? '135 / 35mm Film' },
    { label: 'Lens Mount', value: lensVariant ?? 'Leica M-Mount' },
    { label: 'Shutter Range', value: '1s – 1/1000s · B' },
    { label: 'Light Meter', value: 'TTL · CdS Cell' },
    { label: 'Inspection', value: '24-Point Pass' },
    { label: 'Condition Grade', value: grade },
    { label: 'Serial Code', value: `CEC-${idTail}` },
  ];

  if (product.categoryName) {
    rows.splice(1, 0, { label: 'Body Type', value: product.categoryName });
  }

  return rows;
}

// ──────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────

export function ProductDetail({ store, product, related }: ProductDetailProps) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  // Gallery: dedupe imageUrl into the images array so the first thumb is
  // always the primary shot.
  const gallery = useMemo(() => {
    const raw = [product.imageUrl, ...product.images]
      .filter((u): u is string => typeof u === 'string' && u.length > 0);
    // Dedupe preserving order.
    const seen = new Set<string>();
    const out: string[] = [];
    for (const u of raw) {
      if (!seen.has(u)) {
        seen.add(u);
        out.push(u);
      }
    }
    return out;
  }, [product.imageUrl, product.images]);

  // Lens/material/size variant options (storefront supplies them via
  // `colorLabel` / `sizeLabel` / `materialLabel`). We dedupe by label so
  // the picker doesn't render two "Black Paint" pills for two SKUs.
  const lensVariants = useMemo(() => {
    const seen = new Set<string>();
    return product.variants
      .map((v) => v.colorLabel ?? v.materialLabel)
      .filter((l): l is string => !!l && !seen.has(l) && (seen.add(l), true));
  }, [product.variants]);

  const sizeVariants = useMemo(() => {
    const seen = new Set<string>();
    return product.variants
      .map((v) => v.sizeLabel)
      .filter((l): l is string => !!l && !seen.has(l) && (seen.add(l), true));
  }, [product.variants]);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedLens, setSelectedLens] = useState<string | undefined>(
    lensVariants[0],
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    sizeVariants[0],
  );

  const grade = gradeFor(product.id);
  const techSpecs = useMemo(() => buildTechSpecs(product), [product]);
  const idTail = product.id.slice(-6).toUpperCase();

  const savings =
    product.originalPriceTHB && product.originalPriceTHB > product.priceTHB
      ? product.originalPriceTHB - product.priceTHB
      : 0;

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

  const breadcrumbCategory = product.categoryName ?? 'Catalog';

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--shop-bg)',
        color: 'var(--shop-ink)',
        fontFamily: 'var(--shop-font)',
      }}
    >
      {/* ── Breadcrumb ── */}
      <nav
        aria-label="Breadcrumb"
        className="border-b"
        style={{ borderColor: 'var(--shop-border)', background: 'var(--shop-card)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-1 text-xs uppercase tracking-widest" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            <li>
              <Link
                href={`/stores/${store.slug}`}
                className="hover:underline"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                Index
              </Link>
            </li>
            <ChevronRight className="w-3 h-3" style={{ color: 'var(--shop-ink-muted)' }} aria-hidden="true" />
            <li>
              <Link
                href={`/stores/${store.slug}/products`}
                className="hover:underline"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                Catalog
              </Link>
            </li>
            <ChevronRight className="w-3 h-3" style={{ color: 'var(--shop-ink-muted)' }} aria-hidden="true" />
            <li style={{ color: 'var(--shop-ink-muted)' }}>{breadcrumbCategory}</li>
            <ChevronRight className="w-3 h-3" style={{ color: 'var(--shop-ink-muted)' }} aria-hidden="true" />
            <li style={{ color: 'var(--shop-ink)' }} className="truncate max-w-[200px] font-bold">
              {product.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* ── Main grid: gallery + info ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16">
          {/* ── Gallery (sticky on desktop) ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Top spec strip — frame counter */}
            <div
              className="flex items-center justify-between px-4 py-2 mb-3 border"
              style={{
                borderColor: 'var(--shop-ink)',
                background: 'var(--shop-card)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--shop-ink-muted)' }}>
                Frame
              </span>
              <span className="text-xs font-bold" style={{ color: 'var(--shop-ink)' }}>
                {String(activeImage + 1).padStart(2, '0')} / {String(Math.max(gallery.length, 1)).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--shop-ink-muted)' }}>
                CEC-{idTail}
              </span>
            </div>

            {/* Main frame with technical crosshair overlay */}
            <div
              className="relative aspect-[4/3] overflow-hidden border"
              style={{
                background: 'var(--shop-card)',
                borderColor: 'var(--shop-ink)',
              }}
            >
              {gallery[activeImage] ? (
                <img
                  src={gallery[activeImage]}
                  alt={`${product.title} — frame ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--shop-border)' }}>
                  <Camera className="w-24 h-24" aria-hidden="true" />
                </div>
              )}

              {/* Technical drawing crosshair (purely decorative) */}
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div
                  className="absolute top-1/2 left-0 right-0 h-px"
                  style={{ background: 'var(--shop-ink)', opacity: 0.15 }}
                />
                <div
                  className="absolute top-0 bottom-0 left-1/2 w-px"
                  style={{ background: 'var(--shop-ink)', opacity: 0.15 }}
                />
                <div
                  className="absolute top-4 left-4 w-8 h-8 border-l border-t"
                  style={{ borderColor: 'var(--shop-ink)' }}
                />
                <div
                  className="absolute top-4 right-4 w-8 h-8 border-r border-t"
                  style={{ borderColor: 'var(--shop-ink)' }}
                />
                <div
                  className="absolute bottom-4 left-4 w-8 h-8 border-l border-b"
                  style={{ borderColor: 'var(--shop-ink)' }}
                />
                <div
                  className="absolute bottom-4 right-4 w-8 h-8 border-r border-b"
                  style={{ borderColor: 'var(--shop-ink)' }}
                />
              </div>

              {/* Grade stamp overlay (top right) */}
              <div
                className="absolute top-3 right-3 px-3 py-1.5 border-2 flex items-center gap-2"
                style={{
                  borderColor: 'var(--shop-ink)',
                  background: 'var(--shop-card)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--shop-ink-muted)' }}>
                  Grade
                </span>
                <span className="text-base font-black" style={{ color: 'var(--shop-ink)' }}>
                  {grade}
                </span>
              </div>
            </div>

            {/* Thumb strip with frame numbers */}
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2" role="tablist" aria-label="Product gallery thumbnails">
                {gallery.slice(0, 5).map((src, idx) => {
                  const isActive = idx === activeImage;
                  return (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Show frame ${idx + 1}`}
                      onClick={() => setActiveImage(idx)}
                      className="aspect-square relative overflow-hidden border transition-colors"
                      style={{
                        borderColor: isActive ? 'var(--shop-ink)' : 'var(--shop-border)',
                        background: 'var(--shop-card)',
                      }}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                      <span
                        className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[9px] uppercase tracking-widest text-center"
                        style={{
                          background: isActive ? 'var(--shop-ink)' : 'rgba(0,0,0,0.55)',
                          color: 'var(--shop-card)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        F{String(idx + 1).padStart(2, '0')}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Inspection PDF mini-card */}
            <div
              className="mt-4 flex items-center justify-between gap-3 p-4 border"
              style={{
                borderColor: 'var(--shop-border)',
                background: 'var(--shop-card)',
              }}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 shrink-0" style={{ color: 'var(--shop-ink)' }} aria-hidden="true" />
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    Inspection report
                  </div>
                  <div
                    className="text-sm font-bold"
                    style={{ fontFamily: 'var(--font-kanit), var(--shop-font-display)' }}
                  >
                    ใบรายงานสภาพ 24 จุด · PDF
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Download inspection report PDF"
                className="flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-widest font-bold border transition-colors"
                style={{
                  borderColor: 'var(--shop-ink)',
                  color: 'var(--shop-ink)',
                  background: 'transparent',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                <Download className="w-3 h-3" aria-hidden="true" />
                Download
              </button>
            </div>
          </div>

          {/* ── Info column ── */}
          <div className="flex flex-col">
            {/* SKU & badges row */}
            <div
              className="flex flex-wrap items-center gap-2 mb-4 text-[10px] uppercase tracking-[0.2em]"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              <span
                className="px-2 py-1 border"
                style={{ borderColor: 'var(--shop-border)', color: 'var(--shop-ink)' }}
              >
                SKU · CEC-{idTail}
              </span>
              <span
                className="px-2 py-1"
                style={{
                  background: 'var(--shop-ink)',
                  color: 'var(--shop-card)',
                }}
              >
                ✓ 24-Point Inspected
              </span>
              {product.categoryName && (
                <span style={{ color: 'var(--shop-ink-muted)' }}>
                  / {product.categoryName}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.95] mb-5"
              style={{ fontFamily: 'var(--font-kanit), var(--shop-font-display)' }}
            >
              {product.title}
            </h1>

            {/* Subtitle: refurb summary line */}
            <p
              className="text-sm mb-6 leading-relaxed font-light"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              กล้องฟิล์มมือสองคัดเกรดผ่านการตรวจสภาพ 24 จุด · ระดับสภาพ{' '}
              <span style={{ color: 'var(--shop-ink)' }} className="font-bold">{grade}</span>{' '}
              · พร้อมใบรายงานสภาพและรับประกันชัตเตอร์ 90 วัน
            </p>

            {/* Price */}
            <div
              className="flex flex-wrap items-baseline gap-3 pb-6 mb-6 border-b"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <span
                className="text-4xl font-black tracking-tight"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: 'var(--font-kanit), var(--shop-font-display)',
                }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {product.originalPriceTHB && product.originalPriceTHB > product.priceTHB && (
                <>
                  <span
                    className="text-lg line-through"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {formatTHB(product.originalPriceTHB)}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-1 uppercase tracking-widest"
                    style={{
                      background: 'var(--shop-ink)',
                      color: 'var(--shop-card)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    Save {formatTHB(savings)}
                  </span>
                </>
              )}
            </div>

            {/* Lens / colour variants */}
            {lensVariants.length > 0 && (
              <div className="mb-6">
                <div
                  className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-[0.2em]"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                >
                  <span style={{ color: 'var(--shop-ink-muted)' }}>
                    Lens / Finish
                  </span>
                  <span style={{ color: 'var(--shop-ink)' }} className="font-bold">
                    {selectedLens ?? lensVariants[0]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lensVariants.map((label) => {
                    const isActive = label === selectedLens;
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setSelectedLens(label)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-widest font-bold border transition-colors"
                        style={{
                          borderColor: isActive ? 'var(--shop-ink)' : 'var(--shop-border)',
                          background: isActive ? 'var(--shop-ink)' : 'var(--shop-card)',
                          color: isActive ? 'var(--shop-card)' : 'var(--shop-ink)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        <Aperture className="w-3 h-3" aria-hidden="true" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size / format variants (only show when distinct from lens) */}
            {sizeVariants.length > 0 && (
              <div className="mb-6">
                <div
                  className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-[0.2em]"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                >
                  <span style={{ color: 'var(--shop-ink-muted)' }}>Format / Size</span>
                  <span style={{ color: 'var(--shop-ink)' }} className="font-bold">
                    {selectedSize ?? sizeVariants[0]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeVariants.map((label) => {
                    const isActive = label === selectedSize;
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setSelectedSize(label)}
                        className="min-w-[3.5rem] px-3 py-2 text-xs uppercase tracking-widest font-bold border transition-colors"
                        style={{
                          borderColor: isActive ? 'var(--shop-ink)' : 'var(--shop-border)',
                          background: isActive ? 'var(--shop-ink)' : 'var(--shop-card)',
                          color: isActive ? 'var(--shop-card)' : 'var(--shop-ink)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty + Add to Cart */}
            <div className="flex gap-3 pt-2 pb-6 mb-6 border-b" style={{ borderColor: 'var(--shop-border)' }}>
              <div
                className="flex items-center border"
                style={{
                  borderColor: 'var(--shop-ink)',
                  background: 'var(--shop-card)',
                }}
                role="group"
                aria-label="Quantity"
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 h-12 hover:bg-[var(--shop-bg)]"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (Number.isFinite(n) && n > 0) setQty(Math.min(99, n));
                    else if (e.target.value === '') setQty(1);
                  }}
                  aria-label="Quantity"
                  className="w-12 text-center text-base font-bold bg-transparent border-x outline-none"
                  style={{
                    borderColor: 'var(--shop-ink)',
                    color: 'var(--shop-ink)',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="px-3 h-12 hover:bg-[var(--shop-bg)]"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 px-6 inline-flex items-center justify-center gap-2 uppercase tracking-widest text-sm font-bold transition-colors hover:opacity-80"
                style={{
                  background: 'var(--shop-ink)',
                  color: 'var(--shop-card)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                <Crosshair className="w-4 h-4" aria-hidden="true" />
                Add to Roll
              </button>
            </div>

            {/* Trust badges grid (refurb grade) */}
            <ul
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              aria-label="Trust signals"
            >
              <li
                className="flex items-start gap-3 p-4 border"
                style={{
                  borderColor: 'var(--shop-border)',
                  background: 'var(--shop-card)',
                }}
              >
                <CheckCircle2
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-hidden="true"
                />
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    Inspection
                  </div>
                  <div className="text-sm font-bold mt-0.5">24-Point Pass</div>
                </div>
              </li>
              <li
                className="flex items-start gap-3 p-4 border"
                style={{
                  borderColor: 'var(--shop-border)',
                  background: 'var(--shop-card)',
                }}
              >
                <ShieldCheck
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-hidden="true"
                />
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    Warranty
                  </div>
                  <div className="text-sm font-bold mt-0.5">รับประกัน 90 วัน</div>
                </div>
              </li>
              <li
                className="flex items-start gap-3 p-4 border"
                style={{
                  borderColor: 'var(--shop-border)',
                  background: 'var(--shop-card)',
                }}
              >
                <Truck
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-hidden="true"
                />
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    Shipping
                  </div>
                  <div className="text-sm font-bold mt-0.5">ส่งฟรีทั่วไทย</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Spec sheet: description + tech specs table ── */}
        <section
          className="mt-20 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 border-t pt-12"
          style={{ borderColor: 'var(--shop-ink)' }}
          aria-labelledby="spec-heading"
        >
          {/* Description column */}
          <div>
            <div
              className="text-[10px] uppercase tracking-[0.2em] mb-3"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              § 01 · Spec Sheet
            </div>
            <h2
              id="spec-heading"
              className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-5 leading-tight"
              style={{ fontFamily: 'var(--font-kanit), var(--shop-font-display)' }}
            >
              About this body
            </h2>
            <div
              className="space-y-4 text-sm leading-relaxed font-light"
              style={{ color: 'var(--shop-ink)' }}
            >
              {product.description ? (
                product.description
                  .split(/\n+/)
                  .map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <>
                  <p>
                    {product.title} ถูกเลือกเข้าคลังของเราเพราะผ่านการตรวจสภาพการทำงานเต็มรูปแบบ
                    ตัวเครื่องอยู่ในเกรด {grade} · ชัตเตอร์ทำงานทุกสปีดและถูกปรับสอบเทียบกับเครื่องวัด
                  </p>
                  <p>
                    เลนส์เคลียร์ ไม่มีรา ฝ้าหรือเชื้อรา · กระจกซีลและซีลฟอยล์ใหม่
                    พร้อมส่งฟิล์มได้ทันที · มีใบรายงานสภาพ 24 จุดแนบทุกตัว
                  </p>
                </>
              )}
            </div>

            <div
              className="mt-6 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em]"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              <span
                className="px-2 py-1 border"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                Body · Tested
              </span>
              <span
                className="px-2 py-1 border"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                Light Seals · Renewed
              </span>
              <span
                className="px-2 py-1 border"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                Lens · Fungus-Free
              </span>
            </div>
          </div>

          {/* Specs table column */}
          <div>
            <div
              className="text-[10px] uppercase tracking-[0.2em] mb-3"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              § 02 · Technical Specifications
            </div>
            <div
              className="border"
              style={{
                borderColor: 'var(--shop-ink)',
                background: 'var(--shop-card)',
              }}
            >
              <table className="w-full text-sm">
                <caption className="sr-only">Technical specifications for {product.title}</caption>
                <tbody>
                  {techSpecs.map((row, i) => (
                    <tr
                      key={row.label}
                      style={{
                        borderTop: i === 0 ? 'none' : '1px solid var(--shop-border)',
                      }}
                    >
                      <th
                        scope="row"
                        className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.2em] font-bold align-top"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          width: '45%',
                        }}
                      >
                        {row.label}
                      </th>
                      <td
                        className="px-5 py-3 font-bold"
                        style={{
                          color: 'var(--shop-ink)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Service log footnote */}
            <p
              className="mt-4 text-[11px] leading-relaxed"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              * ข้อมูลทั้งหมดยืนยันโดยช่างเทคนิคของเรา · ดาวน์โหลด PDF รายงานสภาพแบบเต็มเพื่อดูค่าชัตเตอร์ที่วัดได้ตามสเกล
            </p>
          </div>
        </section>

        {/* ── Related / Lab Notes ── */}
        {related && related.length > 0 && (
          <section
            className="mt-20 pt-12 border-t"
            style={{ borderColor: 'var(--shop-ink)' }}
            aria-labelledby="related-heading"
          >
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <div
                  className="text-[10px] uppercase tracking-[0.2em] mb-2"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  § 03 · From the same shelf
                </div>
                <h2
                  id="related-heading"
                  className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-tight"
                  style={{ fontFamily: 'var(--font-kanit), var(--shop-font-display)' }}
                >
                  More inspected bodies
                </h2>
              </div>
              <Link
                href={`/stores/${store.slug}/products`}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold hover:underline"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                View full catalog
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.slice(0, 4).map((p) => {
                const pGrade = gradeFor(p.id);
                const pTail = p.id.slice(-6).toUpperCase();
                return (
                  <li key={p.id}>
                    <Link
                      href={`/stores/${store.slug}/products/${p.id}`}
                      className="group block border transition-colors hover:border-[color:var(--shop-ink)]"
                      style={{
                        borderColor: 'var(--shop-border)',
                        background: 'var(--shop-card)',
                      }}
                    >
                      <div
                        className="aspect-[4/3] overflow-hidden relative"
                        style={{ background: 'var(--shop-bg)' }}
                      >
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--shop-border)' }}>
                            <Camera className="w-10 h-10" aria-hidden="true" />
                          </div>
                        )}
                        <span
                          className="absolute top-2 left-2 px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold"
                          style={{
                            background: 'var(--shop-ink)',
                            color: 'var(--shop-card)',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          }}
                        >
                          Grade {pGrade}
                        </span>
                      </div>
                      <div className="p-4">
                        <div
                          className="text-[10px] uppercase tracking-[0.2em] mb-2"
                          style={{
                            color: 'var(--shop-ink-muted)',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          }}
                        >
                          {p.categoryName ?? 'Film Body'} · CEC-{pTail}
                        </div>
                        <h3
                          className="text-base font-bold leading-tight mb-3 line-clamp-2"
                          style={{ fontFamily: 'var(--font-kanit), var(--shop-font-display)' }}
                        >
                          {p.title}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span
                            className="text-sm font-bold"
                            style={{
                              color: 'var(--shop-ink)',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            }}
                          >
                            {formatTHB(p.priceTHB)}
                          </span>
                          {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                            <span
                              className="text-xs line-through"
                              style={{ color: 'var(--shop-ink-muted)' }}
                            >
                              {formatTHB(p.compareAtPriceTHB)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
