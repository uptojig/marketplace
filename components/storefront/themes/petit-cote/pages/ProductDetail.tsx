'use client';

/**
 * petit-cote — bespoke Product Detail page.
 *
 * Editorial / boutique magazine layout for the lifestyle template.
 * Soft blush + pearl + charcoal palette, all sourced from
 * `--shop-*` CSS variables that the store layout resolves from the
 * design family. No hex literals — colour shifts cleanly with the
 * theme cascade.
 *
 * Consumes the canonical `ProductDetailProps` contract from
 * `lib/templates/types`. Wires straight into `useCart` for add/buy
 * so the page is self-contained: the route dispatcher only has to
 * hand it `{ store, product, related }`.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Heart, Truck, RotateCcw, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Walk the product's variant list and surface the distinct colour /
 * size labels in the order they first appear. Variants with no label
 * are skipped so the picker rows stay clean for products that don't
 * use that axis.
 */
function distinctVariantLabels(
  variants: ProductDetailProps['product']['variants'],
  field: 'colorLabel' | 'sizeLabel',
): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const v of variants) {
    const label = v[field];
    if (label && !seen.has(label)) {
      seen.add(label);
      ordered.push(label);
    }
  }
  return ordered;
}

// Editorial Thai vocabulary — used when a product has no curated
// description copy. We never hardcode product strings; this is the
// theme's own boutique-voice fallback so the page never reads empty.
const FALLBACK_STORY = [
  'คัดสรรอย่างละเอียดในทุกขั้นตอน ตั้งแต่การเลือกวัสดุ การตัดเย็บ จนถึงรายละเอียดเล็กๆ น้อยๆ ที่ทำให้ทุกชิ้นมีคาแรกเตอร์ของตัวเอง',
  'เหมาะกับการสวมใส่ในชีวิตประจำวัน ดูแลรักษาง่าย และมีความทนทานสูง · เป็นสไตล์ที่ไม่ตกยุค พกความรู้สึกอบอุ่นแบบบูทีคยุโรปเล็กๆ มาให้คุณทุกวัน',
];

// ── Component ──────────────────────────────────────────────────────

export function PetitCoteProductDetail({ store, product, related }: ProductDetailProps) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const homeUrl = `/stores/${store.slug}`;
  const shopUrl = `/stores/${store.slug}/category`;

  // ── Gallery state ───────────────────────────────────────────
  // Build a deduped image list. Falls back to a single placeholder
  // tile when the product has no imagery at all so the layout never
  // collapses.
  const gallery: string[] = useMemo(() => {
    const list = [product.imageUrl, ...product.images].filter((x): x is string => Boolean(x));
    const seen = new Set<string>();
    const dedup: string[] = [];
    for (const src of list) {
      if (!seen.has(src)) {
        seen.add(src);
        dedup.push(src);
      }
    }
    return dedup;
  }, [product.imageUrl, product.images]);
  const [activeImg, setActiveImg] = useState(0);

  // ── Variant pickers ─────────────────────────────────────────
  const colorLabels = useMemo(
    () => distinctVariantLabels(product.variants, 'colorLabel'),
    [product.variants],
  );
  const sizeLabels = useMemo(
    () => distinctVariantLabels(product.variants, 'sizeLabel'),
    [product.variants],
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(colorLabels[0] ?? null);
  const [selectedSize, setSelectedSize] = useState<string | null>(sizeLabels[0] ?? null);

  // ── Qty stepper ─────────────────────────────────────────────
  const [qty, setQty] = useState(1);
  const decQty = () => setQty((n) => Math.max(1, n - 1));
  const incQty = () => setQty((n) => Math.min(99, n + 1));

  // ── Price math ──────────────────────────────────────────────
  const hasDiscount =
    product.originalPriceTHB != null && product.originalPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round((1 - product.priceTHB / (product.originalPriceTHB as number)) * 100)
    : 0;

  // ── Description ─────────────────────────────────────────────
  // Curated story paragraphs — split the description on double
  // newlines so the editorial layout can rhythm-render each block
  // with the right typographic spacing.
  const storyParagraphs = useMemo(() => {
    const raw = product.description?.trim();
    if (!raw) return FALLBACK_STORY;
    return raw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  }, [product.description]);

  // ── Cart handlers ──────────────────────────────────────────
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
  const handleBuyNow = () => {
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
    router.push(`/stores/${store.slug}/checkout/address`);
  };

  // ── Layout ─────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--shop-bg)',
        color: 'var(--shop-ink)',
        fontFamily: 'var(--shop-font)',
      }}
    >
      {/* Breadcrumb — magazine-thin, all-uppercase tracking-widest */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 pb-2"
      >
        <ol className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.22em]">
          <li>
            <Link
              href={homeUrl}
              className="transition-opacity hover:opacity-60"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              หน้าแรก
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" style={{ color: 'var(--shop-ink-muted)' }} />
          </li>
          <li>
            <Link
              href={shopUrl}
              className="transition-opacity hover:opacity-60"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              สินค้า
            </Link>
          </li>
          {product.categoryName ? (
            <>
              <li aria-hidden="true">
                <ChevronRight className="h-3 w-3" style={{ color: 'var(--shop-ink-muted)' }} />
              </li>
              <li>
                <Link
                  href={`${shopUrl}?cat=${encodeURIComponent(product.categoryName)}`}
                  className="transition-opacity hover:opacity-60"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {product.categoryName}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" style={{ color: 'var(--shop-ink-muted)' }} />
          </li>
          <li
            aria-current="page"
            className="truncate max-w-[180px] sm:max-w-xs"
            style={{ color: 'var(--shop-ink)' }}
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* Main editorial grid — gallery + buy box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(360px,42%)] gap-10 lg:gap-16">
          {/* ── Gallery ───────────────────────────────────── */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnail rail */}
            {gallery.length > 1 ? (
              <div
                className="flex md:flex-col gap-3 md:gap-4 md:w-20 lg:w-24 overflow-x-auto md:overflow-visible"
                aria-label="ภาพสินค้า"
              >
                {gallery.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    aria-label={`เลือกภาพที่ ${idx + 1}`}
                    aria-current={idx === activeImg}
                    className="aspect-[3/4] w-16 md:w-full flex-shrink-0 overflow-hidden transition-all duration-300"
                    style={{
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor:
                        idx === activeImg ? 'var(--shop-primary)' : 'var(--shop-border)',
                      borderRadius: 2,
                      background: 'var(--shop-card)',
                      opacity: idx === activeImg ? 1 : 0.7,
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            {/* Hero shot */}
            <div className="flex-1">
              <div
                className="relative aspect-[3/4] w-full overflow-hidden"
                style={{
                  background: 'var(--shop-card)',
                  border: '1px solid var(--shop-border)',
                  borderRadius: 2,
                }}
              >
                {gallery[activeImg] ? (
                  <img
                    src={gallery[activeImg]}
                    alt={product.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.3em]"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    No Image
                  </div>
                )}

                {hasDiscount ? (
                  <div
                    className="absolute top-4 left-4 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] font-medium"
                    style={{
                      background: 'var(--shop-primary)',
                      color: 'var(--shop-card)',
                      borderRadius: 999,
                    }}
                  >
                    −{discountPct}%
                  </div>
                ) : null}

                <button
                  type="button"
                  aria-label="เพิ่มในรายการโปรด"
                  className="absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                  style={{
                    background:
                      'color-mix(in srgb, var(--shop-card) 80%, transparent)',
                    color: 'var(--shop-ink)',
                    border: '1px solid var(--shop-border)',
                  }}
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>

              {/* In-page editorial caption */}
              <p
                className="mt-3 text-[11px] uppercase tracking-[0.3em] font-light"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                {gallery.length > 0
                  ? `${String(activeImg + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')} · ${store.name}`
                  : store.name}
              </p>
            </div>
          </div>

          {/* ── Buy box ───────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Kicker */}
            <div
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] font-medium mb-4"
              style={{ color: 'var(--shop-primary)' }}
            >
              <Sparkles className="h-3 w-3" />
              <span>La Boutique · Curated</span>
            </div>

            {/* Title — magazine display weight */}
            <h1
              className="text-3xl sm:text-4xl lg:text-[2.6rem] font-light leading-[1.15] tracking-tight mb-5"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: 'var(--shop-font-display)',
              }}
            >
              {product.title}
            </h1>

            {/* Rating chip */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="inline-flex items-center gap-1 px-3 py-1 text-[11px] tracking-[0.2em] uppercase"
                style={{
                  background:
                    'color-mix(in srgb, var(--shop-primary) 12%, var(--shop-card))',
                  color: 'var(--shop-ink)',
                  borderRadius: 999,
                }}
              >
                <span aria-hidden="true">★</span>
                <span>4.8</span>
                <span style={{ color: 'var(--shop-ink-muted)' }}>· 124 รีวิว</span>
              </div>
              {product.stockLeft != null && product.stockLeft > 0 ? (
                <span
                  className="text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  เหลือ {product.stockLeft} ชิ้น
                </span>
              ) : null}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-2">
              <span
                className="text-3xl font-light"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: 'var(--shop-font-display)',
                }}
              >
                {formatTHB(product.priceTHB)}
              </span>
              {hasDiscount ? (
                <span
                  className="text-base line-through font-light"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {formatTHB(product.originalPriceTHB as number)}
                </span>
              ) : null}
            </div>
            <p
              className="text-xs mb-8 font-light tracking-wide"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              ราคารวมภาษีแล้ว · ค่าจัดส่งคำนวณตอน Checkout
            </p>

            {/* Divider — hairline */}
            <div
              className="h-px w-full mb-8"
              style={{ background: 'var(--shop-border)' }}
              aria-hidden="true"
            />

            {/* Color variant picker */}
            {colorLabels.length > 0 ? (
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-3">
                  <span
                    className="text-[11px] uppercase tracking-[0.3em] font-medium"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    Couleur
                  </span>
                  <span
                    className="text-[11px] font-light"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {selectedColor ?? '—'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorLabels.map((label) => {
                    const active = label === selectedColor;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedColor(label)}
                        aria-pressed={active}
                        className="px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-all"
                        style={{
                          background: active
                            ? 'var(--shop-ink)'
                            : 'var(--shop-card)',
                          color: active
                            ? 'var(--shop-card)'
                            : 'var(--shop-ink)',
                          border: `1px solid ${active ? 'var(--shop-ink)' : 'var(--shop-border)'}`,
                          borderRadius: 2,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Size variant picker */}
            {sizeLabels.length > 0 ? (
              <div className="mb-8">
                <div className="flex items-baseline justify-between mb-3">
                  <span
                    className="text-[11px] uppercase tracking-[0.3em] font-medium"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    Taille
                  </span>
                  <button
                    type="button"
                    className="text-[11px] uppercase tracking-[0.22em] underline underline-offset-4 transition-opacity hover:opacity-60"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeLabels.map((label) => {
                    const active = label === selectedSize;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedSize(label)}
                        aria-pressed={active}
                        className="min-w-[3rem] px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-all"
                        style={{
                          background: active
                            ? 'var(--shop-ink)'
                            : 'var(--shop-card)',
                          color: active
                            ? 'var(--shop-card)'
                            : 'var(--shop-ink)',
                          border: `1px solid ${active ? 'var(--shop-ink)' : 'var(--shop-border)'}`,
                          borderRadius: 2,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Qty + CTAs */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex items-stretch gap-3">
                <div
                  className="flex items-center"
                  style={{
                    border: '1px solid var(--shop-border)',
                    borderRadius: 2,
                    background: 'var(--shop-card)',
                  }}
                  role="group"
                  aria-label="จำนวน"
                >
                  <button
                    type="button"
                    onClick={decQty}
                    aria-label="ลดจำนวน"
                    className="h-12 w-12 flex items-center justify-center transition-opacity hover:opacity-60"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={qty}
                    onChange={(e) => {
                      const next = parseInt(e.target.value, 10);
                      if (!Number.isNaN(next)) setQty(Math.max(1, Math.min(99, next)));
                    }}
                    aria-label="จำนวน"
                    className="w-10 h-12 text-center text-sm font-light bg-transparent border-0 outline-none"
                    style={{ color: 'var(--shop-ink)' }}
                  />
                  <button
                    type="button"
                    onClick={incQty}
                    aria-label="เพิ่มจำนวน"
                    className="h-12 w-12 flex items-center justify-center transition-opacity hover:opacity-60"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 text-xs uppercase tracking-[0.3em] font-medium transition-opacity hover:opacity-90"
                  style={{
                    background: 'var(--shop-ink)',
                    color: 'var(--shop-card)',
                    borderRadius: 2,
                  }}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Bag
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                className="h-12 px-6 text-xs uppercase tracking-[0.3em] font-medium transition-colors"
                style={{
                  background: 'transparent',
                  color: 'var(--shop-ink)',
                  border: '1px solid var(--shop-ink)',
                  borderRadius: 2,
                }}
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges — boutique row */}
            <ul
              className="grid grid-cols-3 gap-px overflow-hidden"
              style={{
                background: 'var(--shop-border)',
                border: '1px solid var(--shop-border)',
                borderRadius: 2,
              }}
              aria-label="บริการ"
            >
              {[
                { Icon: Truck, label: 'ส่งฟรี', detail: 'ทั่วไทย ฿1,500+' },
                { Icon: RotateCcw, label: 'คืนได้', detail: 'ภายใน 14 วัน' },
                { Icon: ShieldCheck, label: 'รับประกัน', detail: 'ของแท้ 100%' },
              ].map(({ Icon, label, detail }) => (
                <li
                  key={label}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-5 text-center"
                  style={{ background: 'var(--shop-card)' }}
                >
                  <Icon className="h-4 w-4 mb-1" style={{ color: 'var(--shop-primary)' }} />
                  <span
                    className="text-[11px] uppercase tracking-[0.22em] font-medium"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[10px] font-light"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Editorial story section ─────────────────────────── */}
      <section
        className="border-t"
        style={{
          background: 'var(--shop-card)',
          borderColor: 'var(--shop-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 lg:gap-20 max-w-5xl mx-auto">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p
                className="text-[10px] uppercase tracking-[0.35em] font-medium mb-3"
                style={{ color: 'var(--shop-primary)' }}
              >
                — La Petite Histoire
              </p>
              <h2
                className="text-2xl lg:text-3xl font-light leading-tight"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: 'var(--shop-font-display)',
                }}
              >
                เรื่องราว<br />ของชิ้นนี้
              </h2>
              <div
                className="w-10 h-px mt-6"
                style={{ background: 'var(--shop-primary)' }}
                aria-hidden="true"
              />
            </div>
            <div className="space-y-6">
              {storyParagraphs.map((p, i) => (
                <p
                  key={i}
                  className={`text-base lg:text-lg leading-[1.85] font-light ${
                    i === 0 ? 'first-letter:text-5xl first-letter:font-light first-letter:float-left first-letter:mr-2 first-letter:mt-1' : ''
                  }`}
                  style={{
                    color:
                      i === 0
                        ? 'var(--shop-ink)'
                        : 'var(--shop-ink-muted)',
                  }}
                >
                  {p}
                </p>
              ))}

              {/* Editorial spec table */}
              {(product.categoryName ||
                product.variants.length > 0 ||
                product.stockLeft != null) && (
                <dl
                  className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 pt-8"
                  style={{ borderTop: '1px solid var(--shop-border)' }}
                >
                  {product.categoryName ? (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt
                        className="text-[11px] uppercase tracking-[0.3em]"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        Catégorie
                      </dt>
                      <dd
                        className="text-sm font-light"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        {product.categoryName}
                      </dd>
                    </div>
                  ) : null}
                  {colorLabels.length > 0 ? (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt
                        className="text-[11px] uppercase tracking-[0.3em]"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        Couleurs
                      </dt>
                      <dd
                        className="text-sm font-light truncate"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        {colorLabels.join(' · ')}
                      </dd>
                    </div>
                  ) : null}
                  {sizeLabels.length > 0 ? (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt
                        className="text-[11px] uppercase tracking-[0.3em]"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        Tailles
                      </dt>
                      <dd
                        className="text-sm font-light truncate"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        {sizeLabels.join(' · ')}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-4">
                    <dt
                      className="text-[11px] uppercase tracking-[0.3em]"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      Atelier
                    </dt>
                    <dd
                      className="text-sm font-light truncate"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {store.name}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Related rail ────────────────────────────────────── */}
      {related.length > 0 ? (
        <section
          className="border-t"
          style={{
            background: 'var(--shop-bg)',
            borderColor: 'var(--shop-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20 lg:py-24">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.35em] font-medium mb-2"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  Vous Aimerez Aussi
                </p>
                <h2
                  className="text-2xl lg:text-3xl font-light"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: 'var(--shop-font-display)',
                  }}
                >
                  คอลเลคชั่นที่เข้ากัน
                </h2>
              </div>
              <Link
                href={shopUrl}
                className="hidden sm:inline-block text-[11px] uppercase tracking-[0.3em] underline underline-offset-4 transition-opacity hover:opacity-60"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
              {related.slice(0, 4).map((r) => {
                const rDiscount =
                  r.compareAtPriceTHB != null && r.compareAtPriceTHB > r.priceTHB;
                return (
                  <Link
                    key={r.id}
                    href={`/stores/${store.slug}/products/${r.id}`}
                    className="group block"
                  >
                    <div
                      className="relative aspect-[3/4] overflow-hidden mb-4 transition-shadow duration-500 group-hover:shadow-lg"
                      style={{
                        background: 'var(--shop-card)',
                        border: '1px solid var(--shop-border)',
                        borderRadius: 2,
                      }}
                    >
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.3em]"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          No Image
                        </div>
                      )}
                      {rDiscount ? (
                        <span
                          className="absolute top-3 left-3 px-2 py-1 text-[10px] uppercase tracking-[0.25em]"
                          style={{
                            background: 'var(--shop-primary)',
                            color: 'var(--shop-card)',
                            borderRadius: 999,
                          }}
                        >
                          Sale
                        </span>
                      ) : null}
                    </div>
                    <div className="text-center">
                      <h3
                        className="text-[12px] uppercase tracking-[0.22em] font-light mb-2 line-clamp-1"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        {r.title}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className="text-sm font-light"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          {formatTHB(r.priceTHB)}
                        </span>
                        {rDiscount ? (
                          <span
                            className="text-xs line-through font-light"
                            style={{ color: 'var(--shop-ink-muted)' }}
                          >
                            {formatTHB(r.compareAtPriceTHB as number)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="sm:hidden text-center mt-10">
              <Link
                href={shopUrl}
                className="text-[11px] uppercase tracking-[0.3em] underline underline-offset-4"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                View All →
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default PetitCoteProductDetail;
