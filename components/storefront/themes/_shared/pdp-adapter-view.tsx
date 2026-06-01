'use client';

/**
 * Client view for the shared PDP adapter.
 *
 * Split out of pdp-adapter.tsx so the FACTORY (`makePdpAdapter`) can live in a
 * server-evaluable module: lib/templates/registry.ts builds its `templates`
 * map at module top-level and CALLS `makePdpAdapter(...)` there. registry is
 * reachable from server modules (e.g. /api/admin/stores → lib/store/template-fields
 * → registry), and when the factory lived in a `'use client'` module the call
 * resolved to a client-reference proxy ("TypeError: tN is not a function" while
 * collecting page data), breaking every build. The factory now renders this
 * client component as JSX instead, which is the normal server→client boundary.
 *
 * Uses useState/useCart so it must stay a client component. `style` (the
 * palette → CSS-vars object) is computed by the server-side factory and passed
 * in as a serializable prop.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Wallet,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { ProductDetailProps } from '@/lib/templates/types';

export type PdpAspectRatio = 'square' | '4/3' | '3/4' | '16/9';
export type PdpPriceColor = 'accent' | 'foreground';

const ASPECT_CLASS: Record<PdpAspectRatio, string> = {
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  '16/9': 'aspect-[16/9]',
};

export function PdpAdapterView({
  data,
  style,
  imageFit = 'cover',
  aspectRatio = 'square',
  priceColor = 'accent',
}: {
  data: ProductDetailProps;
  style: React.CSSProperties;
  imageFit?: 'cover' | 'contain';
  /** Hero / thumbnail / related image aspect ratio. Default 'square' for
   *  product photography. Use '4/3' for landscape marketing covers
   *  (mu-wallpaper, salepage hero composites). */
  aspectRatio?: PdpAspectRatio;
  /** Color used for the big price text. Default 'accent' uses --primary
   *  (the theme's accent — gold, brand color, etc). Pass 'foreground'
   *  for themes where --primary may clash with the card bg (e.g. dark
   *  themes whose admin-chosen palette doesn't guarantee contrast). */
  priceColor?: PdpPriceColor;
}) {
  const { store, product, related } = data;
  const imgFitClass = imageFit === 'contain' ? 'object-contain' : 'object-cover';
  const aspectClass = ASPECT_CLASS[aspectRatio];
  const priceStyle: React.CSSProperties =
    priceColor === 'foreground'
      ? { color: 'var(--card-foreground, var(--foreground, currentColor))' }
      : { color: 'var(--primary, currentColor)' };
  const add = useCart((s) => s.add);

  const gallery = useMemo(() => {
    const all = [product.imageUrl, ...(product.images ?? [])].filter(
      (s): s is string => typeof s === 'string' && s.length > 0,
    );
    return Array.from(new Set(all));
  }, [product.imageUrl, product.images]);

  const [activeImage, setActiveImage] = useState<string | null>(
    gallery[0] ?? null,
  );

  const variantLabels = useMemo(() => {
    return product.variants
      .map((v) => {
        const parts = [v.colorLabel, v.sizeLabel, v.materialLabel].filter(
          (p): p is string => typeof p === 'string' && p.length > 0,
        );
        return {
          id: v.id,
          label: parts.join(' / ') || 'มาตรฐาน',
          priceTHB: v.priceTHB,
        };
      })
      .filter(
        (v) => v.label !== 'มาตรฐาน' || product.variants.length > 1,
      );
  }, [product.variants]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variantLabels[0]?.id ?? null,
  );
  const [qty, setQty] = useState(1);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? null;
  const effectivePrice = selectedVariant?.priceTHB ?? product.priceTHB;
  const originalPrice = product.originalPriceTHB ?? null;
  const hasDiscount = originalPrice !== null && originalPrice > effectivePrice;
  const discountPct =
    hasDiscount && originalPrice
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : 0;

  const stockLeft = product.stockLeft ?? null;
  const inStock = stockLeft === null || stockLeft > 0;

  const addToCart = () => {
    if (!inStock) return;
    add(
      {
        productId: product.id,
        title: product.title,
        priceTHB: effectivePrice,
        imageUrl: gallery[0] ?? undefined,
        storeSlug: store.slug,
        storeName: store.name,
      },
      qty,
    );
  };

  return (
    <main
      style={style}
      className="bg-[var(--background,#fafafa)] text-[var(--foreground,#0a0a0a)] min-h-screen py-6 sm:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold opacity-80">
          <Link
            href={`/stores/${store.slug}`}
            className="hover:opacity-100 transition"
          >
            หน้าร้าน
          </Link>
          <ChevronRight size={12} className="opacity-50" />
          {product.categoryName && (
            <>
              <Link
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(product.categoryName)}`}
                className="hover:opacity-100 transition"
              >
                {product.categoryName}
              </Link>
              <ChevronRight size={12} className="opacity-50" />
            </>
          )}
          <span
            className="line-clamp-1"
            style={{ color: 'var(--primary, currentColor)' }}
          >
            {product.title}
          </span>
        </nav>

        {/* Main: gallery + buy panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gallery */}
          <div className="lg:col-span-7 space-y-3">
            <div
              className={`bg-[var(--card,#fff)] border ${aspectClass} overflow-hidden`}
              style={{ borderColor: 'var(--border, #e5e5e5)' }}
            >
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImage}
                  alt={product.title}
                  className={`w-full h-full ${imgFitClass}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30 text-sm">
                  NO IMAGE
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <ul className="grid grid-cols-5 gap-2">
                {gallery.slice(0, 5).map((src) => (
                  <li key={src}>
                    <button
                      type="button"
                      onClick={() => setActiveImage(src)}
                      className={`block w-full ${aspectClass} border overflow-hidden hover:opacity-80 transition`}
                      style={{
                        borderColor:
                          src === activeImage
                            ? 'var(--primary, currentColor)'
                            : 'var(--border, #e5e5e5)',
                        borderWidth: src === activeImage ? 2 : 1,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className={`w-full h-full ${imgFitClass}`}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Buy panel */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                {product.categoryName ?? store.name}
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Price */}
            <div
              className="bg-[var(--card,#fff)] border p-4 space-y-2"
              style={{ borderColor: 'var(--border, #e5e5e5)' }}
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className="text-3xl font-bold"
                  style={priceStyle}
                >
                  {formatTHB(effectivePrice)}
                </span>
                {hasDiscount && originalPrice && (
                  <>
                    <span className="text-base line-through opacity-50">
                      {formatTHB(originalPrice)}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5"
                      style={{
                        background: 'var(--primary, #b91c1c)',
                        color: 'var(--primary-foreground, #fff)',
                      }}
                    >
                      -{discountPct}%
                    </span>
                  </>
                )}
              </div>
              {stockLeft !== null && (
                <p
                  className="text-xs font-bold"
                  style={{
                    color: inStock
                      ? 'var(--primary, currentColor)'
                      : '#9a3412',
                  }}
                >
                  {inStock
                    ? stockLeft <= 5
                      ? `เหลือเพียง ${stockLeft} ชิ้น`
                      : 'พร้อมจัดส่ง'
                    : 'สินค้าหมด'}
                </p>
              )}
            </div>

            {/* Variants */}
            {variantLabels.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                  ตัวเลือก
                </p>
                <div className="flex flex-wrap gap-2">
                  {variantLabels.map((v) => {
                    const isActive = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className="px-3 py-1.5 text-xs font-bold border transition"
                        style={{
                          borderColor: isActive
                            ? 'var(--primary, currentColor)'
                            : 'var(--border, #e5e5e5)',
                          background: isActive
                            ? 'var(--primary, #111)'
                            : 'var(--card, #fff)',
                          color: isActive
                            ? 'var(--primary-foreground, #fff)'
                            : 'var(--foreground, currentColor)',
                        }}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                จำนวน
              </p>
              <div
                className="inline-flex items-stretch border"
                style={{ borderColor: 'var(--border, #e5e5e5)' }}
              >
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.max(1, n - 1))}
                  disabled={qty <= 1}
                  aria-label="ลด"
                  className="px-3 disabled:opacity-30 hover:opacity-70"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <div
                  className="px-4 py-1.5 font-bold min-w-[3rem] text-center border-x"
                  style={{ borderColor: 'var(--border, #e5e5e5)' }}
                >
                  {qty}
                </div>
                <button
                  type="button"
                  onClick={() => setQty((n) => n + 1)}
                  aria-label="เพิ่ม"
                  className="px-3 hover:opacity-70"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={addToCart}
                disabled={!inStock}
                className="inline-flex items-center justify-center gap-2 border-2 font-bold py-3 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
                style={{
                  borderColor: 'var(--primary, currentColor)',
                  background: 'var(--card, #fff)',
                  color: 'var(--primary, currentColor)',
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                ใส่ตะกร้า
              </button>
              <Link
                href={inStock ? `/stores/${store.slug}/cart` : '#'}
                onClick={(e) => {
                  if (!inStock) {
                    e.preventDefault();
                    return;
                  }
                  addToCart();
                }}
                className={`inline-flex items-center justify-center gap-2 font-bold py-3 uppercase tracking-wider hover:opacity-90 transition ${
                  !inStock ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                }`}
                style={{
                  background: 'var(--primary, #111)',
                  color: 'var(--primary-foreground, #fff)',
                }}
              >
                <Zap className="h-4 w-4" />
                ซื้อเลย
              </Link>
            </div>

            {/* Trust */}
            <div
              className="bg-[var(--card,#fff)] border p-4 grid grid-cols-2 gap-3 text-xs"
              style={{ borderColor: 'var(--border, #e5e5e5)' }}
            >
              <Badge
                icon={<Truck className="h-4 w-4" />}
                title="ส่งฟรี ฿990+"
                body="ทั่วประเทศ 1-3 วันทำการ"
              />
              <Badge
                icon={<RotateCcw className="h-4 w-4" />}
                title="คืนภายใน 7 วัน"
                body="ไม่มีเงื่อนไข"
              />
              <Badge
                icon={<ShieldCheck className="h-4 w-4" />}
                title="คัดสรรคุณภาพ"
                body="คัดสรรโดยร้านค้า"
              />
              <Badge
                icon={<Wallet className="h-4 w-4" />}
                title="ชำระปลอดภัย"
                body="ได้รับมาตรฐานสากล"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section
            className="bg-[var(--card,#fff)] border p-5 sm:p-6 space-y-3"
            style={{ borderColor: 'var(--border, #e5e5e5)' }}
          >
            <h2
              className="text-lg font-bold border-b pb-2"
              style={{ borderColor: 'var(--border, #e5e5e5)' }}
            >
              รายละเอียดสินค้า
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line opacity-90">
              {product.description}
            </p>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold">สินค้าใกล้เคียง</h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {related.slice(0, 5).map((r) => (
                <li
                  key={r.id}
                  className="bg-[var(--card,#fff)] border overflow-hidden"
                  style={{ borderColor: 'var(--border, #e5e5e5)' }}
                >
                  <Link
                    href={`/stores/${store.slug}/products/${r.id}`}
                    className="block"
                  >
                    <div className={`${aspectClass} overflow-hidden`}>
                      {r.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imageUrl}
                          alt={r.title}
                          className={`w-full h-full ${imgFitClass} hover:scale-105 transition-transform`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-30 text-xs">
                          NO IMAGE
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 space-y-1">
                      <p className="text-xs font-bold line-clamp-2">
                        {r.title}
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: 'var(--primary, currentColor)' }}
                      >
                        {formatTHB(r.priceTHB)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

function Badge({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span style={{ color: 'var(--primary, currentColor)' }}>{icon}</span>
      <div className="leading-tight">
        <p className="font-bold">{title}</p>
        <p className="text-[10px] opacity-70">{body}</p>
      </div>
    </div>
  );
}
