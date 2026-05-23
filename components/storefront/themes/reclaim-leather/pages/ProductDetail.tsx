'use client';

/**
 * reclaim-leather — bespoke Product Detail page.
 *
 * Vibe: vintage leather workshop. Burnt-umber / tan / black palette
 * stamped onto cream parchment. Saddle-stitched dashed borders, paper
 * receipt callouts, hand-set rubber-stamp seals for trust badges and
 * craft credentials. Reads the marketplace-wide ProductDetailProps so
 * the route at app/stores/[slug]/products/[id]/page.tsx can mount it
 * directly via the template registry.
 *
 * The chrome around this page (header / footer / strip) is wired by
 * the shop-page wrapper; we only render the in-page composition and
 * never touch the registry.
 *
 * Color tokens
 *   --shop-bg / --shop-ink / --shop-primary / --shop-accent come from
 *   the per-store chrome tokens. Workshop accents (umber/tan/cream)
 *   ride on local --rl-* vars so a future operator can re-skin via
 *   a single block at the top of the component without hunting hex.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Scissors,
  ShieldCheck,
  HeartHandshake,
  Hammer,
  Award,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { formatTHB } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────────
 * Local workshop palette. Burnt umber / tan / cream / black —
 * stamped on top of the --shop-* tokens (which can still re-tint
 * the page via primaryColor). Anything else in the file uses these
 * named vars instead of raw hex.
 * ───────────────────────────────────────────────────────────────── */
const RL_STYLE: React.CSSProperties = {
  ['--rl-cream' as string]: '#f4ead8',
  ['--rl-parchment' as string]: '#e6d7b8',
  ['--rl-tan' as string]: '#c9974b',
  ['--rl-umber' as string]: '#5b3a1e',
  ['--rl-ink' as string]: '#2a1a09',
  ['--rl-ink-soft' as string]: 'rgba(42, 26, 9, 0.7)',
  ['--rl-ink-line' as string]: 'rgba(42, 26, 9, 0.18)',
  background: 'var(--shop-bg, var(--rl-cream))',
  color: 'var(--shop-ink, var(--rl-ink))',
};

/* Body classes share the same font stack the rest of the theme uses
 * (Prompt for display, Kanit for body). No serif per the project's
 * font rules — we lean on stamped seals + dashed stitching for the
 * "workshop" feel instead. */
const HEAD = "font-[family:var(--font-prompt)]";
const BODY = "font-[family:var(--font-kanit)]";

/* ─────────────────────────────────────────────────────────────────
 * StampedSeal — round rubber-stamp badge used for craft/trust
 * callouts. Decorative-only; semantic content lives in the label.
 * ───────────────────────────────────────────────────────────────── */
function StampedSeal({
  label,
  sub,
  icon: Icon,
}: {
  label: string;
  sub?: string;
  icon: LucideIcon;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-full border-2 border-dashed p-3 text-center ${HEAD}`}
      style={{
        borderColor: 'var(--rl-umber)',
        background: 'var(--rl-cream)',
        color: 'var(--rl-umber)',
        width: 110,
        height: 110,
        boxShadow: 'inset 0 0 0 2px var(--rl-cream), inset 0 0 0 3px var(--rl-tan)',
        transform: 'rotate(-4deg)',
      }}
      aria-label={label}
    >
      <Icon size={22} className="mb-1" />
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] leading-tight">
        {label}
      </span>
      {sub && (
        <span className="text-[9px] opacity-80 leading-tight">{sub}</span>
      )}
    </div>
  );
}

/* Saddle-stitched divider — dashed line styled like a hand-stitched
 * seam. Inline so adopters don't need to import a separate svg.    */
function StitchDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-[2px] w-full ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, var(--rl-umber) 0 8px, transparent 8px 16px)',
      }}
      aria-hidden="true"
    />
  );
}

export default function ReclaimLeatherProductDetail(props: ProductDetailProps) {
  const { store, product, related } = props;

  /* ── Gallery ── */
  const gallery = useMemo(() => {
    const list = [product.imageUrl, ...(product.images ?? [])]
      .filter((v): v is string => Boolean(v));
    // Dedupe — `imageUrl` is often included in `images` server-side.
    return Array.from(new Set(list));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState(0);

  /* ── Variants → color (สีหนัง) + size pickers ── */
  const colorOptions = useMemo(() => {
    const seen = new Map<string, string>(); // label → label
    product.variants.forEach((v) => {
      if (v.colorLabel && !seen.has(v.colorLabel)) {
        seen.set(v.colorLabel, v.colorLabel);
      }
    });
    return Array.from(seen.keys());
  }, [product.variants]);

  const sizeOptions = useMemo(() => {
    const seen = new Set<string>();
    product.variants.forEach((v) => {
      if (v.sizeLabel) seen.add(v.sizeLabel);
    });
    return Array.from(seen);
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorOptions[0] ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizeOptions[0] ?? null,
  );

  /* ── Quantity ── */
  const [qty, setQty] = useState(1);

  /* ── Discount badge ── */
  const hasDiscount =
    product.originalPriceTHB != null &&
    product.originalPriceTHB > product.priceTHB;
  const discountPct = hasDiscount
    ? Math.round(
        (1 -
          product.priceTHB / (product.originalPriceTHB as number)) *
          100,
      )
    : 0;

  /* ── Cart hookup ── */
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

  return (
    <div className={BODY} style={RL_STYLE}>
      {/* ── Breadcrumb · stamped receipt strip ── */}
      <nav
        aria-label="Breadcrumb"
        className="border-b"
        style={{
          background: 'var(--rl-parchment)',
          borderColor: 'var(--rl-umber)',
          color: 'var(--rl-umber)',
        }}
      >
        <ol className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center text-xs sm:text-sm">
          <li>
            <Link
              href={`/stores/${store.slug}`}
              className={`uppercase tracking-[0.18em] font-semibold hover:underline ${HEAD}`}
            >
              หน้าร้าน
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} className="mx-2" />
          </li>
          <li>
            <Link
              href={`/stores/${store.slug}/category`}
              className={`uppercase tracking-[0.18em] font-semibold hover:underline ${HEAD}`}
            >
              {product.categoryName ?? 'เครื่องหนัง'}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} className="mx-2" />
          </li>
          <li
            className={`${HEAD} font-semibold truncate max-w-[260px] sm:max-w-md`}
            style={{ color: 'var(--rl-ink)' }}
            aria-current="page"
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {/* ── Main composition ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* GALLERY */}
          <section
            className="lg:col-span-7"
            aria-label="แกลเลอรีภาพสินค้า"
          >
            <div className="flex flex-col gap-4 sm:flex-row-reverse">
              {/* Hero image — pinned inside a cream "leather card" with
                  rotated parchment shadow + dashed border to evoke a
                  workshop pin-board mounting. */}
              <div className="flex-1 relative">
                <div
                  className="aspect-[4/5] relative overflow-hidden border-2"
                  style={{
                    background: 'var(--rl-parchment)',
                    borderColor: 'var(--rl-ink)',
                    boxShadow: '8px 8px 0 var(--rl-umber)',
                  }}
                >
                  {gallery[activeImage] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gallery[activeImage]}
                      alt={`${product.title} — รูปที่ ${activeImage + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center ${HEAD}`}
                      style={{ color: 'var(--rl-umber)' }}
                    >
                      <Scissors size={48} className="mb-3 opacity-50" />
                      <span className="uppercase tracking-[0.2em] text-sm">
                        ภาพยังไม่พร้อม
                      </span>
                    </div>
                  )}

                  {/* Hand-stamped discount seal — top-right corner */}
                  {hasDiscount && (
                    <div
                      className={`absolute top-4 right-4 ${HEAD} px-3 py-2 text-xs font-bold uppercase tracking-[0.15em]`}
                      style={{
                        background: 'var(--rl-ink)',
                        color: 'var(--rl-tan)',
                        border: '2px solid var(--rl-tan)',
                        transform: 'rotate(8deg)',
                      }}
                    >
                      ลดทันที {discountPct}%
                    </div>
                  )}
                </div>

                {/* Stitched corner accents */}
                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full border-2"
                  style={{
                    background: 'var(--rl-tan)',
                    borderColor: 'var(--rl-ink)',
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Thumbnail rail */}
              {gallery.length > 1 && (
                <ol
                  className="flex flex-row sm:flex-col gap-3 sm:w-24 overflow-x-auto sm:overflow-x-visible"
                  aria-label="ภาพย่อ"
                >
                  {gallery.map((src, idx) => (
                    <li key={`${src}-${idx}`} className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveImage(idx)}
                        className={`block aspect-square w-20 sm:w-full overflow-hidden border-2 transition-transform hover:-translate-y-0.5 ${
                          idx === activeImage ? '' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{
                          borderColor:
                            idx === activeImage
                              ? 'var(--rl-tan)'
                              : 'var(--rl-umber)',
                          background: 'var(--rl-parchment)',
                          boxShadow:
                            idx === activeImage
                              ? '3px 3px 0 var(--rl-ink)'
                              : 'none',
                        }}
                        aria-label={`เลือกภาพที่ ${idx + 1}`}
                        aria-pressed={idx === activeImage}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Craft seals — desktop row beneath gallery. Mobile shows
                them inside the info column further down. */}
            <div className="hidden lg:flex items-center justify-center gap-6 mt-10">
              <StampedSeal
                icon={Hammer}
                label="HAND-CRAFTED"
                sub="No.1 Saddle"
              />
              <StampedSeal
                icon={Award}
                label="GRADE A"
                sub="Veg-Tanned"
              />
              <StampedSeal
                icon={ShieldCheck}
                label="REPAIR"
                sub="For-Life"
              />
              <StampedSeal
                icon={HeartHandshake}
                label="ZERO WASTE"
                sub="Off-cuts"
              />
            </div>
          </section>

          {/* INFO COLUMN */}
          <section
            className="lg:col-span-5 flex flex-col"
            aria-label="รายละเอียดสินค้า"
          >
            {/* Workshop stamp + category */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${HEAD}`}
                style={{
                  background: 'var(--rl-ink)',
                  color: 'var(--rl-tan)',
                  border: '1.5px solid var(--rl-tan)',
                }}
              >
                <Scissors size={12} />
                Reclaim Atelier
              </span>
              {product.categoryName && (
                <span
                  className={`text-xs uppercase tracking-[0.18em] ${HEAD}`}
                  style={{ color: 'var(--rl-umber)' }}
                >
                  {product.categoryName}
                </span>
              )}
            </div>

            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-4 ${HEAD}`}
              style={{ color: 'var(--rl-ink)' }}
            >
              {product.title}
            </h1>

            {/* Pseudo rating row — placeholder craftsman trust */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex items-center gap-0.5"
                aria-label="คะแนนช่างฝีมือ 5 ดาว"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-current"
                    style={{ color: 'var(--rl-tan)' }}
                  />
                ))}
              </div>
              <span
                className={`text-xs uppercase tracking-[0.2em] ${HEAD}`}
                style={{ color: 'var(--rl-umber)' }}
              >
                ฝีมือช่างประจำโรงงาน
              </span>
            </div>

            {/* Price block — receipt strip with stitched border */}
            <div
              className="relative mb-7 px-5 py-4 border-2 border-dashed"
              style={{
                background: 'var(--shop-card, #ffffff)',
                borderColor: 'var(--rl-umber)',
              }}
            >
              <div className="flex items-end gap-3 flex-wrap">
                <span
                  className={`text-3xl sm:text-4xl font-bold ${HEAD}`}
                  style={{ color: 'var(--rl-ink)' }}
                >
                  {formatTHB(product.priceTHB)}
                </span>
                {hasDiscount && (
                  <>
                    <span
                      className="text-base line-through"
                      style={{ color: 'var(--rl-ink-soft)' }}
                    >
                      {formatTHB(product.originalPriceTHB as number)}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-[0.15em] px-2 py-0.5 ${HEAD}`}
                      style={{
                        background: 'var(--rl-tan)',
                        color: 'var(--rl-ink)',
                      }}
                    >
                      ประหยัด {discountPct}%
                    </span>
                  </>
                )}
              </div>
              <p
                className="text-xs mt-2"
                style={{ color: 'var(--rl-ink-soft)' }}
              >
                ราคารวมภาษี · ออกใบกำกับภาษีได้ · ผ่อน 0% ผ่าน K+ / SCB
              </p>
            </div>

            {/* Description — leather story */}
            {product.description && (
              <div
                className={`mb-6 text-[15px] leading-relaxed ${BODY}`}
                style={{ color: 'var(--rl-ink-soft)' }}
              >
                <p className="line-clamp-4 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Workshop spec card — age / material / technique */}
            <ul
              className="grid grid-cols-3 gap-2 mb-7 text-center"
              aria-label="คุณสมบัติของหนัง"
            >
              <li
                className="px-3 py-3 border"
                style={{
                  background: 'var(--rl-parchment)',
                  borderColor: 'var(--rl-umber)',
                }}
              >
                <div
                  className={`text-[10px] uppercase tracking-[0.15em] mb-1 ${HEAD}`}
                  style={{ color: 'var(--rl-umber)' }}
                >
                  อายุหนัง
                </div>
                <div
                  className={`text-sm font-bold ${HEAD}`}
                  style={{ color: 'var(--rl-ink)' }}
                >
                  6+ ปี
                </div>
              </li>
              <li
                className="px-3 py-3 border"
                style={{
                  background: 'var(--rl-parchment)',
                  borderColor: 'var(--rl-umber)',
                }}
              >
                <div
                  className={`text-[10px] uppercase tracking-[0.15em] mb-1 ${HEAD}`}
                  style={{ color: 'var(--rl-umber)' }}
                >
                  เนื้อหนัง
                </div>
                <div
                  className={`text-sm font-bold ${HEAD}`}
                  style={{ color: 'var(--rl-ink)' }}
                >
                  Veg-Tanned
                </div>
              </li>
              <li
                className="px-3 py-3 border"
                style={{
                  background: 'var(--rl-parchment)',
                  borderColor: 'var(--rl-umber)',
                }}
              >
                <div
                  className={`text-[10px] uppercase tracking-[0.15em] mb-1 ${HEAD}`}
                  style={{ color: 'var(--rl-umber)' }}
                >
                  เทคนิค
                </div>
                <div
                  className={`text-sm font-bold ${HEAD}`}
                  style={{ color: 'var(--rl-ink)' }}
                >
                  Saddle Stitch
                </div>
              </li>
            </ul>

            <StitchDivider className="mb-7" />

            {/* COLOR (สีหนัง) — chip row */}
            {colorOptions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-3">
                  <h3
                    className={`text-xs uppercase tracking-[0.2em] font-bold ${HEAD}`}
                    style={{ color: 'var(--rl-umber)' }}
                  >
                    สีหนัง
                  </h3>
                  {selectedColor && (
                    <span
                      className={`text-sm font-semibold ${BODY}`}
                      style={{ color: 'var(--rl-ink)' }}
                    >
                      {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => {
                    const active = c === selectedColor;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2 text-sm font-semibold border-2 transition-all ${HEAD}`}
                        style={{
                          background: active
                            ? 'var(--rl-ink)'
                            : 'var(--rl-cream)',
                          color: active
                            ? 'var(--rl-tan)'
                            : 'var(--rl-ink)',
                          borderColor: active
                            ? 'var(--rl-tan)'
                            : 'var(--rl-umber)',
                          boxShadow: active
                            ? '3px 3px 0 var(--rl-umber)'
                            : 'none',
                        }}
                        aria-pressed={active}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE — chip row */}
            {sizeOptions.length > 0 && (
              <div className="mb-7">
                <div className="flex items-baseline justify-between mb-3">
                  <h3
                    className={`text-xs uppercase tracking-[0.2em] font-bold ${HEAD}`}
                    style={{ color: 'var(--rl-umber)' }}
                  >
                    ขนาด
                  </h3>
                  {selectedSize && (
                    <span
                      className={`text-sm font-semibold ${BODY}`}
                      style={{ color: 'var(--rl-ink)' }}
                    >
                      {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((s) => {
                    const active = s === selectedSize;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[3rem] px-4 py-2 text-sm font-semibold border-2 ${HEAD}`}
                        style={{
                          background: active
                            ? 'var(--rl-tan)'
                            : 'var(--rl-cream)',
                          color: active
                            ? 'var(--rl-ink)'
                            : 'var(--rl-umber)',
                          borderColor: 'var(--rl-umber)',
                          boxShadow: active
                            ? '3px 3px 0 var(--rl-ink)'
                            : 'none',
                        }}
                        aria-pressed={active}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <StitchDivider className="mb-7" />

            {/* QTY + ADD TO CART */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div
                className="flex items-center border-2"
                style={{
                  background: 'var(--shop-card, #ffffff)',
                  borderColor: 'var(--rl-ink)',
                }}
                role="group"
                aria-label="จำนวน"
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-[var(--rl-parchment)]"
                  aria-label="ลดจำนวน"
                  style={{ color: 'var(--rl-umber)' }}
                >
                  <Minus size={16} />
                </button>
                <span
                  className={`w-12 text-center text-base font-bold ${HEAD}`}
                  style={{ color: 'var(--rl-ink)' }}
                  aria-live="polite"
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="p-3 hover:bg-[var(--rl-parchment)]"
                  aria-label="เพิ่มจำนวน"
                  style={{ color: 'var(--rl-umber)' }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-base font-bold uppercase tracking-[0.15em] border-2 transition-all hover:-translate-y-0.5 ${HEAD}`}
                style={{
                  background: 'var(--shop-primary, var(--rl-umber))',
                  color: 'var(--rl-cream)',
                  borderColor: 'var(--rl-ink)',
                  boxShadow: '4px 4px 0 var(--rl-tan)',
                }}
                aria-label={`ใส่ตะกร้า ${product.title}`}
              >
                <ShoppingBag size={18} />
                ใส่ตะกร้า · {formatTHB(product.priceTHB * qty)}
              </button>
            </div>

            {/* Mobile craft seals row */}
            <div className="grid grid-cols-4 gap-3 mb-8 lg:hidden">
              <StampedSeal icon={Hammer} label="HAND" sub="Made" />
              <StampedSeal icon={Award} label="GRADE A" sub="Leather" />
              <StampedSeal icon={ShieldCheck} label="REPAIR" sub="For-Life" />
              <StampedSeal icon={HeartHandshake} label="ZERO" sub="Waste" />
            </div>

            {/* Trust strip — shipping / repair / atelier visit */}
            <ul
              className="space-y-3"
              aria-label="บริการหลังการขาย"
            >
              <li
                className={`flex items-center gap-3 px-4 py-3 border ${BODY}`}
                style={{
                  background: 'var(--rl-parchment)',
                  borderColor: 'var(--rl-umber)',
                  color: 'var(--rl-ink)',
                }}
              >
                <Truck
                  size={20}
                  style={{ color: 'var(--rl-umber)' }}
                  className="flex-shrink-0"
                />
                <div>
                  <div
                    className={`text-xs uppercase tracking-[0.18em] font-bold ${HEAD}`}
                  >
                    จัดส่งฟรี ฿1,500+
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--rl-ink-soft)' }}
                  >
                    EMS · ส่งภายใน 3 วันทำการ
                  </div>
                </div>
              </li>
              <li
                className={`flex items-center gap-3 px-4 py-3 border ${BODY}`}
                style={{
                  background: 'var(--rl-parchment)',
                  borderColor: 'var(--rl-umber)',
                  color: 'var(--rl-ink)',
                }}
              >
                <ShieldCheck
                  size={20}
                  style={{ color: 'var(--rl-umber)' }}
                  className="flex-shrink-0"
                />
                <div>
                  <div
                    className={`text-xs uppercase tracking-[0.18em] font-bold ${HEAD}`}
                  >
                    Repair-for-life
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--rl-ink-soft)' }}
                  >
                    รับซ่อมตลอดอายุการใช้งาน · ค่าซ่อมเริ่ม ฿200
                  </div>
                </div>
              </li>
              <li
                className={`flex items-center gap-3 px-4 py-3 border ${BODY}`}
                style={{
                  background: 'var(--rl-parchment)',
                  borderColor: 'var(--rl-umber)',
                  color: 'var(--rl-ink)',
                }}
              >
                <Sparkles
                  size={20}
                  style={{ color: 'var(--rl-umber)' }}
                  className="flex-shrink-0"
                />
                <div>
                  <div
                    className={`text-xs uppercase tracking-[0.18em] font-bold ${HEAD}`}
                  >
                    หนึ่งใบในโลก
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--rl-ink-soft)' }}
                  >
                    ลายและสีของหนังแต่ละใบไม่เหมือนกัน
                  </div>
                </div>
              </li>
            </ul>
          </section>
        </div>

        {/* ── RELATED RAIL ───────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-20 lg:mt-28" aria-label="สินค้าจากโรงเย็บเดียวกัน">
            <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
              <div>
                <span
                  className={`inline-block text-xs uppercase tracking-[0.25em] font-bold mb-2 ${HEAD}`}
                  style={{ color: 'var(--rl-umber)' }}
                >
                  จากโรงเย็บเดียวกัน
                </span>
                <h2
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${HEAD}`}
                  style={{ color: 'var(--rl-ink)' }}
                >
                  หยิบเข้าคู่กัน
                </h2>
              </div>
              <Link
                href={`/stores/${store.slug}/products`}
                className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] border-b-2 pb-1 ${HEAD}`}
                style={{
                  color: 'var(--rl-umber)',
                  borderColor: 'var(--rl-tan)',
                }}
              >
                ดูทั้งหมด <ChevronRight size={16} />
              </Link>
            </div>

            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {related.slice(0, 8).map((r) => {
                const rHasDiscount =
                  r.compareAtPriceTHB != null &&
                  r.compareAtPriceTHB > r.priceTHB;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/stores/${store.slug}/products/${r.id}`}
                      className="group block border-2 transition-all hover:-translate-y-1"
                      style={{
                        background: 'var(--shop-card, var(--rl-cream))',
                        borderColor: 'var(--rl-umber)',
                        boxShadow: '4px 4px 0 var(--rl-parchment)',
                      }}
                    >
                      <div
                        className="aspect-square relative overflow-hidden border-b-2"
                        style={{
                          background: 'var(--rl-parchment)',
                          borderColor: 'var(--rl-umber)',
                        }}
                      >
                        {r.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.imageUrl}
                            alt={r.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ color: 'var(--rl-umber)' }}
                          >
                            <Scissors size={28} className="opacity-50" />
                          </div>
                        )}
                        {/* Tiny stamped seal — top-right */}
                        <span
                          className={`absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] ${HEAD}`}
                          style={{
                            background: 'var(--rl-ink)',
                            color: 'var(--rl-tan)',
                            border: '1px solid var(--rl-tan)',
                          }}
                        >
                          <ShieldCheck size={9} /> Repair
                        </span>
                      </div>
                      <div className="p-4">
                        {r.categoryName && (
                          <div
                            className={`text-[10px] uppercase tracking-[0.18em] mb-1 ${HEAD}`}
                            style={{ color: 'var(--rl-umber)' }}
                          >
                            {r.categoryName}
                          </div>
                        )}
                        <h3
                          className={`text-sm font-bold mb-2 line-clamp-2 ${HEAD}`}
                          style={{ color: 'var(--rl-ink)' }}
                        >
                          {r.title}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`text-base font-bold ${HEAD}`}
                            style={{ color: 'var(--rl-umber)' }}
                          >
                            {formatTHB(r.priceTHB)}
                          </span>
                          {rHasDiscount && (
                            <span
                              className="text-xs line-through"
                              style={{ color: 'var(--rl-ink-soft)' }}
                            >
                              {formatTHB(r.compareAtPriceTHB as number)}
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
      </main>

      {/* Foot stamp — workshop signature */}
      <div
        className="border-t-[6px]"
        style={{
          borderColor: 'var(--rl-umber)',
          background: 'var(--rl-parchment)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center gap-4">
          <span
            className={`text-[11px] uppercase tracking-[0.3em] ${HEAD}`}
            style={{ color: 'var(--rl-umber)' }}
          >
            Reclaim Atelier · Bangkok
          </span>
          <span
            className="w-12 h-px"
            style={{ background: 'var(--rl-umber)' }}
            aria-hidden="true"
          />
          <span
            className={`text-[11px] uppercase tracking-[0.3em] ${HEAD}`}
            style={{ color: 'var(--rl-umber)' }}
          >
            Saddle Stitched · Hand Sealed
          </span>
        </div>
      </div>
    </div>
  );
}
