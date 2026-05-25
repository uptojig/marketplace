'use client';

/**
 * smartloop-home — Bespoke Product Detail page.
 *
 * Smart-home / electronics-tech vibe:
 *   · electric blue accent (driven by --shop-primary, defaults #008BF8)
 *   · sans-serif typography (Kanit / Prompt) via --shop-font
 *   · iconic stats row (response time, bandwidth, ecosystems supported)
 *   · before/after lighting strip — visualises what the device does
 *   · ecosystem compatibility matrix (Alexa, Google Home, HomeKit, Matter)
 *   · warranty trust badges
 *
 * No hex codes hardcoded — every colour is sourced from the storefront
 * `--shop-*` token bridge so the page automatically adopts the active
 * store's brand colour while keeping the smart-home layout language.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bolt,
  Cpu,
  Wifi,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronRight,
  ShoppingCart,
  Minus,
  Plus,
  Check,
  X,
  Zap,
  Lightbulb,
  Sparkles,
  Star,
  Activity,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

// ── Ecosystem compatibility — fixed brand list, support status derived
//    heuristically from variants/title so the matrix always renders. ──
type EcoKey = 'alexa' | 'google' | 'homekit' | 'matter';
const ECOSYSTEMS: { key: EcoKey; label: string; sub: string }[] = [
  { key: 'alexa', label: 'Amazon Alexa', sub: 'Echo · Echo Dot · Echo Show' },
  { key: 'google', label: 'Google Home', sub: 'Nest Hub · Nest Mini' },
  { key: 'homekit', label: 'Apple HomeKit', sub: 'iPhone · iPad · Siri' },
  { key: 'matter', label: 'Matter', sub: 'Thread · CSA-IOT 1.2+' },
];

function inferCompatibility(title: string, description: string): Record<EcoKey, boolean> {
  const haystack = `${title} ${description}`.toLowerCase();
  // Default: every smartloop product supports the big 3; Matter only when
  // explicitly mentioned (Matter-ready badge feels meaningful that way).
  return {
    alexa: !haystack.includes('no-alexa'),
    google: !haystack.includes('no-google'),
    homekit: !haystack.includes('no-homekit'),
    matter: /matter|thread|csa/i.test(haystack) || haystack.includes('2025'),
  };
}

// ── Variant grouping — split scaffold variants into colour vs. รุ่น
//    so each picker only shows the dimension it controls. ──
type VariantRow = ProductDetailProps['product']['variants'][number];

function groupVariants(variants: VariantRow[]) {
  const colors = new Map<string, VariantRow>();
  const models = new Map<string, VariantRow>();
  for (const v of variants) {
    if (v.colorLabel && !colors.has(v.colorLabel)) colors.set(v.colorLabel, v);
    if (v.sizeLabel && !models.has(v.sizeLabel)) models.set(v.sizeLabel, v);
    if (v.materialLabel && !models.has(v.materialLabel)) models.set(v.materialLabel, v);
  }
  return {
    colors: Array.from(colors.entries()).map(([label, row]) => ({ label, row })),
    models: Array.from(models.entries()).map(([label, row]) => ({ label, row })),
  };
}

// ── Iconic stats row — three quick-glance specs above the fold. ──
const STATS = [
  { icon: Activity, label: 'ตอบสนอง', value: '< 80ms', sub: 'Cloud → Device' },
  { icon: Wifi, label: 'การเชื่อมต่อ', value: 'WiFi 2.4G + BLE', sub: 'No hub needed' },
  { icon: ShieldCheck, label: 'รับประกัน', value: '2 ปีเต็ม', sub: 'เปลี่ยนใหม่' },
];

// ── Placeholder gallery icon — appears when a slot has no image. ──
function GalleryPlaceholder({ kind }: { kind: 'lifestyle' | 'product' }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background:
          kind === 'lifestyle'
            ? 'linear-gradient(135deg, color-mix(in srgb, var(--shop-primary) 14%, var(--shop-card)) 0%, var(--shop-card) 60%)'
            : 'var(--shop-card)',
      }}
      aria-hidden="true"
    >
      {kind === 'lifestyle' ? (
        <Sparkles
          size={48}
          style={{ color: 'color-mix(in srgb, var(--shop-primary) 60%, var(--shop-ink))' }}
        />
      ) : (
        <Cpu size={48} style={{ color: 'var(--shop-primary)' }} />
      )}
    </div>
  );
}

export function SmartloopHomeProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;
  const add = useCart((s) => s.add);

  const homeUrl = `/stores/${store.slug}`;
  const shopUrl = `/stores/${store.slug}/products`;
  const categoryUrl = product.categoryName
    ? `/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`
    : shopUrl;

  // ── Build the gallery: lifestyle slot first, then product shots. ──
  const galleryImages = useMemo(() => {
    const src: string[] = [];
    if (product.imageUrl) src.push(product.imageUrl);
    for (const img of product.images ?? []) {
      if (img && !src.includes(img)) src.push(img);
    }
    return src;
  }, [product.imageUrl, product.images]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const grouped = useMemo(() => groupVariants(product.variants ?? []), [product.variants]);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    grouped.colors[0]?.label ?? null,
  );
  const [selectedModel, setSelectedModel] = useState<string | null>(
    grouped.models[0]?.label ?? null,
  );

  const compatibility = useMemo(
    () => inferCompatibility(product.title, product.description ?? ''),
    [product.title, product.description],
  );

  const hasDiscount =
    typeof product.originalPriceTHB === 'number' &&
    product.originalPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round((1 - product.priceTHB / (product.originalPriceTHB as number)) * 100)
    : 0;

  const lowStock =
    typeof product.stockLeft === 'number' && product.stockLeft > 0 && product.stockLeft <= 8;

  function handleAddToCart() {
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
  }

  return (
    <div
      className="shop-page"
      style={{
        fontFamily: 'var(--shop-font)',
        color: 'var(--shop-ink)',
      }}
    >
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-[1400px] px-4 pt-6"
      >
        <ol
          className="flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          <li>
            <Link href={homeUrl} className="transition-colors hover:text-[color:var(--shop-primary)]">
              หน้าแรก
            </Link>
          </li>
          <ChevronRight size={12} aria-hidden="true" />
          <li>
            <Link href={shopUrl} className="transition-colors hover:text-[color:var(--shop-primary)]">
              สินค้าทั้งหมด
            </Link>
          </li>
          {product.categoryName && (
            <>
              <ChevronRight size={12} aria-hidden="true" />
              <li>
                <Link
                  href={categoryUrl}
                  className="transition-colors hover:text-[color:var(--shop-primary)]"
                >
                  {product.categoryName}
                </Link>
              </li>
            </>
          )}
          <ChevronRight size={12} aria-hidden="true" />
          <li
            aria-current="page"
            className="truncate normal-case tracking-normal"
            style={{ color: 'var(--shop-ink)' }}
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ── Main grid: gallery + buy box ────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 pt-6 pb-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-12">
          {/* ── Gallery ────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Hero image — lifestyle composition */}
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border"
              style={{
                background: 'var(--shop-card)',
                borderColor: 'var(--shop-border)',
              }}
            >
              {galleryImages[activeIdx] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={galleryImages[activeIdx]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <GalleryPlaceholder kind="lifestyle" />
              )}

              {/* Floating spec chip — reinforces "smart" hardware vibe */}
              <div
                className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur"
                style={{
                  background: 'color-mix(in srgb, var(--shop-ink) 80%, transparent)',
                  color: 'var(--shop-card)',
                }}
              >
                <Sparkles size={12} aria-hidden="true" />
                Smart-Ready
              </div>

              {hasDiscount && (
                <div
                  className="absolute top-4 right-4 rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{
                    background: 'var(--shop-primary)',
                    color: 'var(--shop-card)',
                  }}
                >
                  −{discountPct}%
                </div>
              )}
            </div>

            {/* Thumbnails — product shots */}
            <div className="grid grid-cols-5 gap-2">
              {(galleryImages.length > 0 ? galleryImages : [null, null, null, null, null]).slice(0, 5).map((img, i) => {
                const active = i === activeIdx;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className="relative aspect-square overflow-hidden rounded-lg border-2 transition-all"
                    style={{
                      borderColor: active ? 'var(--shop-primary)' : 'var(--shop-border)',
                      background: 'var(--shop-card)',
                    }}
                    aria-label={`ดูภาพที่ ${i + 1}`}
                    aria-pressed={active}
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={`${product.title} ${i + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <GalleryPlaceholder kind="product" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Before / After lighting visualiser ───────────── */}
            <div
              className="mt-2 overflow-hidden rounded-2xl border"
              style={{ borderColor: 'var(--shop-border)', background: 'var(--shop-card)' }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider"
                style={{
                  borderBottom: '1px solid var(--shop-border)',
                  color: 'var(--shop-ink-muted)',
                }}
              >
                <Lightbulb size={14} style={{ color: 'var(--shop-primary)' }} aria-hidden="true" />
                ก่อน / หลัง ติดตั้ง
              </div>
              <div className="grid grid-cols-2">
                {/* BEFORE — dim room */}
                <div
                  className="relative flex h-40 items-end p-4"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 40%, color-mix(in srgb, var(--shop-ink) 88%, transparent), color-mix(in srgb, var(--shop-ink) 96%, black) 100%)',
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: 'color-mix(in srgb, var(--shop-card) 70%, transparent)' }}
                  >
                    Before
                  </span>
                </div>
                {/* AFTER — illuminated room */}
                <div
                  className="relative flex h-40 items-end p-4"
                  style={{
                    background:
                      'radial-gradient(circle at 70% 30%, color-mix(in srgb, var(--shop-primary) 65%, white) 0%, color-mix(in srgb, var(--shop-primary) 25%, var(--shop-card)) 55%, var(--shop-card) 100%)',
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    After
                  </span>
                  <Sparkles
                    size={20}
                    className="absolute top-3 right-3"
                    style={{ color: 'var(--shop-primary)' }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Buy box ────────────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Tagline pill */}
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                style={{
                  background: 'color-mix(in srgb, var(--shop-primary) 12%, var(--shop-card))',
                  color: 'var(--shop-primary)',
                  border: '1px solid color-mix(in srgb, var(--shop-primary) 30%, transparent)',
                }}
              >
                <Bolt size={12} aria-hidden="true" />
                Smartloop · Smart Home
              </span>
              {product.categoryName && (
                <span
                  className="text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {product.categoryName}
                </span>
              )}
            </div>

            <h1
              className="text-2xl font-bold leading-tight md:text-3xl lg:text-4xl"
              style={{ color: 'var(--shop-ink)' }}
            >
              {product.title}
            </h1>

            {/* Rating row — placeholder until real reviews land */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1" aria-label="Rating 4.8 of 5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    fill="currentColor"
                    style={{
                      color:
                        i < 4
                          ? 'var(--shop-primary)'
                          : 'color-mix(in srgb, var(--shop-primary) 40%, var(--shop-border))',
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--shop-ink)' }}>
                4.8
              </span>
              <span className="text-xs" style={{ color: 'var(--shop-ink-muted)' }}>
                · 248 รีวิว · ขายแล้ว 1,420+ ชิ้น
              </span>
            </div>

            {/* Iconic stats row */}
            <div
              className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border"
              style={{ borderColor: 'var(--shop-border)', background: 'var(--shop-card)' }}
            >
              {STATS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="flex flex-col items-center justify-center px-2 py-3 text-center"
                    style={{
                      borderRight:
                        i < STATS.length - 1 ? '1px solid var(--shop-border)' : undefined,
                    }}
                  >
                    <Icon
                      size={20}
                      style={{ color: 'var(--shop-primary)' }}
                      aria-hidden="true"
                    />
                    <div
                      className="mt-1.5 text-sm font-bold leading-none"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {s.value}
                    </div>
                    <div
                      className="mt-1 text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price block */}
            <div
              className="mt-5 rounded-xl p-4"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--shop-primary) 10%, var(--shop-card)) 0%, var(--shop-card) 100%)',
                border: '1px solid color-mix(in srgb, var(--shop-primary) 25%, var(--shop-border))',
              }}
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <span
                  className="text-3xl font-bold leading-none md:text-4xl"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {formatTHB(product.priceTHB)}
                </span>
                {hasDiscount && (
                  <>
                    <span
                      className="text-base line-through"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {formatTHB(product.originalPriceTHB as number)}
                    </span>
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-bold"
                      style={{
                        background:
                          'color-mix(in srgb, var(--shop-primary) 18%, var(--shop-card))',
                        color: 'var(--shop-primary)',
                      }}
                    >
                      ประหยัด {formatTHB((product.originalPriceTHB as number) - product.priceTHB)}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--shop-ink-muted)' }}>
                หรือผ่อน{' '}
                <strong style={{ color: 'var(--shop-ink)' }}>0% นาน 3 เดือน</strong> · เริ่มต้น{' '}
                {formatTHB(Math.round(product.priceTHB / 3))} / เดือน
              </p>
            </div>

            {/* Variant: รุ่น (model / size / material) */}
            {grouped.models.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span style={{ color: 'var(--shop-ink)' }}>
                    รุ่น · <span style={{ color: 'var(--shop-primary)' }}>{selectedModel}</span>
                  </span>
                  <span style={{ color: 'var(--shop-ink-muted)' }}>
                    {grouped.models.length} ตัวเลือก
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {grouped.models.map(({ label, row }) => {
                    const active = label === selectedModel;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedModel(label)}
                        aria-pressed={active}
                        className="rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all"
                        style={{
                          background: active
                            ? 'color-mix(in srgb, var(--shop-primary) 12%, var(--shop-card))'
                            : 'var(--shop-card)',
                          borderColor: active ? 'var(--shop-primary)' : 'var(--shop-border)',
                          color: active ? 'var(--shop-primary)' : 'var(--shop-ink)',
                        }}
                      >
                        <div className="font-bold">{label}</div>
                        {row.priceTHB !== product.priceTHB && (
                          <div
                            className="mt-0.5 text-[10px]"
                            style={{ color: 'var(--shop-ink-muted)' }}
                          >
                            {formatTHB(row.priceTHB)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variant: สี (color) */}
            {grouped.colors.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span style={{ color: 'var(--shop-ink)' }}>
                    สี · <span style={{ color: 'var(--shop-primary)' }}>{selectedColor}</span>
                  </span>
                  <span style={{ color: 'var(--shop-ink-muted)' }}>
                    {grouped.colors.length} สี
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {grouped.colors.map(({ label }) => {
                    const active = label === selectedColor;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedColor(label)}
                        aria-pressed={active}
                        aria-label={`สี ${label}`}
                        className="rounded-full border-2 px-4 py-1.5 text-xs font-bold transition-all"
                        style={{
                          background: active
                            ? 'var(--shop-primary)'
                            : 'var(--shop-card)',
                          borderColor: active
                            ? 'var(--shop-primary)'
                            : 'var(--shop-border)',
                          color: active ? 'var(--shop-card)' : 'var(--shop-ink)',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QTY + CTA row */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div
                role="group"
                aria-label="จำนวน"
                className="flex h-12 items-center overflow-hidden rounded-lg border"
                style={{
                  borderColor: 'var(--shop-border)',
                  background: 'var(--shop-card)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="flex h-full w-10 items-center justify-center transition-colors hover:bg-[color-mix(in_srgb,var(--shop-primary)_10%,var(--shop-card))]"
                  aria-label="ลดจำนวน"
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
                  className="h-full w-12 border-0 bg-transparent text-center text-base font-bold outline-none"
                  style={{ color: 'var(--shop-ink)' }}
                  aria-label="จำนวน"
                />
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="flex h-full w-10 items-center justify-center transition-colors hover:bg-[color-mix(in_srgb,var(--shop-primary)_10%,var(--shop-card))]"
                  aria-label="เพิ่มจำนวน"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'var(--shop-primary)',
                  color: 'var(--shop-card)',
                  boxShadow:
                    '0 4px 14px color-mix(in srgb, var(--shop-primary) 40%, transparent)',
                }}
              >
                <ShoppingCart size={16} aria-hidden="true" />
                เพิ่มลงตะกร้า · {formatTHB(product.priceTHB * qty)}
              </button>
            </div>

            {/* Stock pill */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span
                className="inline-flex h-2 w-2 rounded-full"
                style={{
                  background: lowStock
                    ? 'color-mix(in srgb, var(--shop-primary) 40%, orange)'
                    : 'color-mix(in srgb, var(--shop-primary) 40%, limegreen)',
                  boxShadow: '0 0 8px currentColor',
                }}
                aria-hidden="true"
              />
              {lowStock ? (
                <span style={{ color: 'var(--shop-ink-muted)' }}>
                  เหลือเพียง <strong style={{ color: 'var(--shop-ink)' }}>{product.stockLeft} ชิ้น</strong> · รีบสั่งก่อนหมด
                </span>
              ) : (
                <span style={{ color: 'var(--shop-ink-muted)' }}>
                  พร้อมส่งทันที · จัดส่งภายใน 24 ชั่วโมง
                </span>
              )}
            </div>

            {/* Trust badges */}
            <div
              className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border"
              style={{ borderColor: 'var(--shop-border)', background: 'var(--shop-card)' }}
            >
              {[
                { icon: ShieldCheck, top: 'ประกัน 2 ปี', sub: 'เปลี่ยนใหม่' },
                { icon: Truck, top: 'ส่งฟรี ฿990+', sub: 'ทั่วประเทศ' },
                { icon: RefreshCw, top: 'คืนได้ 14 วัน', sub: 'ไม่มีเงื่อนไข' },
              ].map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.top}
                    className="flex flex-col items-center px-2 py-3 text-center"
                    style={{
                      borderRight:
                        i < 2 ? '1px solid var(--shop-border)' : undefined,
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: 'var(--shop-primary)' }}
                      aria-hidden="true"
                    />
                    <div
                      className="mt-1.5 text-xs font-bold"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {b.top}
                    </div>
                    <div
                      className="text-[10px]"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {b.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Compatibility matrix ─────────────────────────────────── */}
      <section
        className="border-y py-12"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--shop-primary) 5%, var(--shop-bg)) 0%, var(--shop-bg) 100%)',
          borderColor: 'var(--shop-border)',
        }}
      >
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="mb-6 flex flex-col gap-1">
            <span
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: 'var(--shop-primary)' }}
            >
              <Cpu className="mr-1.5 inline-block" size={12} aria-hidden="true" />
              Ecosystem Ready
            </span>
            <h2
              className="text-2xl font-bold md:text-3xl"
              style={{ color: 'var(--shop-ink)' }}
            >
              ใช้ได้กับทุกระบบในบ้านคุณ
            </h2>
            <p className="text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
              เชื่อมต่อกับลำโพงอัจฉริยะและแอปที่คุณใช้อยู่แล้ว ไม่ต้องเปลี่ยนของ
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ECOSYSTEMS.map((eco) => {
              const ok = compatibility[eco.key];
              return (
                <div
                  key={eco.key}
                  className="flex items-start gap-3 rounded-xl border p-4"
                  style={{
                    background: 'var(--shop-card)',
                    borderColor: ok
                      ? 'color-mix(in srgb, var(--shop-primary) 30%, var(--shop-border))'
                      : 'var(--shop-border)',
                    boxShadow: ok
                      ? '0 0 0 1px color-mix(in srgb, var(--shop-primary) 15%, transparent) inset'
                      : undefined,
                  }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: ok
                        ? 'color-mix(in srgb, var(--shop-primary) 15%, var(--shop-card))'
                        : 'color-mix(in srgb, var(--shop-ink) 6%, var(--shop-card))',
                      color: ok ? 'var(--shop-primary)' : 'var(--shop-ink-muted)',
                    }}
                  >
                    {ok ? <Check size={18} /> : <X size={18} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm font-bold"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {eco.label}
                    </div>
                    <div
                      className="mt-0.5 text-xs"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {eco.sub}
                    </div>
                    <div
                      className="mt-2 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: ok ? 'var(--shop-primary)' : 'var(--shop-ink-muted)' }}
                    >
                      {ok ? 'รองรับเต็มรูปแบบ' : 'ยังไม่รองรับ'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Setup flow — micro illustration */}
          <div
            className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border p-4 text-xs"
            style={{
              background: 'var(--shop-card)',
              borderColor: 'var(--shop-border)',
              color: 'var(--shop-ink-muted)',
            }}
          >
            <Smartphone size={14} aria-hidden="true" style={{ color: 'var(--shop-primary)' }} />
            <span>เปิดแอป Smartloop</span>
            <ArrowRight size={12} aria-hidden="true" />
            <Wifi size={14} aria-hidden="true" style={{ color: 'var(--shop-primary)' }} />
            <span>เชื่อม WiFi</span>
            <ArrowRight size={12} aria-hidden="true" />
            <Zap size={14} aria-hidden="true" style={{ color: 'var(--shop-primary)' }} />
            <span>ใช้งานได้ทันที</span>
            <span
              className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
              style={{
                background: 'color-mix(in srgb, var(--shop-primary) 12%, var(--shop-card))',
                color: 'var(--shop-primary)',
              }}
            >
              ติดตั้งใน 60 วินาที
            </span>
          </div>
        </div>
      </section>

      {/* ── Description / spec block ───────────────────────────── */}
      {product.description && (
        <section className="mx-auto max-w-[1400px] px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
            <div>
              <span
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: 'var(--shop-primary)' }}
              >
                รายละเอียดสินค้า
              </span>
              <h2
                className="mt-1 text-2xl font-bold md:text-3xl"
                style={{ color: 'var(--shop-ink)' }}
              >
                ทำไมต้อง {product.title}
              </h2>
              <p
                className="mt-4 whitespace-pre-line text-sm leading-relaxed md:text-base"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                {product.description}
              </p>
            </div>

            {/* Spec card */}
            <aside
              className="h-fit rounded-xl border p-5"
              style={{
                background: 'var(--shop-card)',
                borderColor: 'var(--shop-border)',
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Activity
                  size={16}
                  style={{ color: 'var(--shop-primary)' }}
                  aria-hidden="true"
                />
                <h3
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  สเปกหลัก
                </h3>
              </div>
              <dl className="space-y-2.5 text-sm">
                {[
                  { k: 'การเชื่อมต่อ', v: 'WiFi 2.4GHz · Bluetooth 5.0' },
                  { k: 'แรงดันไฟ', v: '100-240V AC · 50/60Hz' },
                  { k: 'อุณหภูมิทำงาน', v: '−10°C ถึง 45°C' },
                  { k: 'รับประกัน', v: '2 ปี · เปลี่ยนใหม่' },
                  { k: 'มาตรฐาน', v: 'มอก. · CE · RoHS' },
                ].map((s, i) => (
                  <div
                    key={s.k}
                    className="flex justify-between gap-3 pb-2.5"
                    style={{
                      borderBottom:
                        i < 4 ? '1px dashed var(--shop-border)' : undefined,
                    }}
                  >
                    <dt
                      className="font-medium"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {s.k}
                    </dt>
                    <dd
                      className="text-right font-bold"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {s.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>
      )}

      {/* ── Related products ───────────────────────────────────── */}
      {related.length > 0 && (
        <section
          className="border-t py-12"
          style={{
            borderColor: 'var(--shop-border)',
            background: 'var(--shop-card)',
          }}
        >
          <div className="mx-auto max-w-[1400px] px-4">
            <div className="mb-6 flex items-end justify-between gap-3">
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  More from Smartloop
                </span>
                <h2
                  className="mt-1 text-2xl font-bold md:text-3xl"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  อุปกรณ์ที่เข้ากันได้
                </h2>
              </div>
              <Link
                href={shopUrl}
                className="hidden items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors hover:opacity-80 sm:inline-flex"
                style={{ color: 'var(--shop-primary)' }}
              >
                ดูทั้งหมด
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {related.slice(0, 4).map((r) => {
                const rHref = `/stores/${store.slug}/products/${r.id}`;
                const rDiscount =
                  typeof r.compareAtPriceTHB === 'number' &&
                  r.compareAtPriceTHB > r.priceTHB;
                return (
                  <Link
                    key={r.id}
                    href={rHref}
                    className="group flex flex-col overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: 'var(--shop-border)',
                      background: 'var(--shop-card)',
                    }}
                  >
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{
                        background:
                          'color-mix(in srgb, var(--shop-primary) 5%, var(--shop-bg))',
                      }}
                    >
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <GalleryPlaceholder kind="product" />
                      )}
                      {rDiscount && (
                        <span
                          className="absolute top-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase"
                          style={{
                            background: 'var(--shop-primary)',
                            color: 'var(--shop-card)',
                          }}
                        >
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      {r.categoryName && (
                        <div
                          className="text-[10px] font-medium uppercase tracking-wider"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {r.categoryName}
                        </div>
                      )}
                      <h3
                        className="mt-1 line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-[color:var(--shop-primary)]"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        {r.title}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span
                          className="text-sm font-bold"
                          style={{ color: 'var(--shop-primary)' }}
                        >
                          {formatTHB(r.priceTHB)}
                        </span>
                        {rDiscount && (
                          <span
                            className="text-xs line-through"
                            style={{ color: 'var(--shop-ink-muted)' }}
                          >
                            {formatTHB(r.compareAtPriceTHB as number)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default SmartloopHomeProductDetail;
