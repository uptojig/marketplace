'use client';

/**
 * OmniPack — product detail.
 *
 * Layout: image gallery on the left, product details + bulk-pricing
 * tier table (MOQ 50 / 100 / 500) on the right, then a related-products
 * row at the bottom. ADD-TO-CART silently appends to the per-store
 * zustand cart (no popup) and BUY-NOW pushes directly to
 * /stores/<slug>/checkout/address.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ChevronRight,
  Minus,
  PackageOpen,
  Plus,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import type { ProductDetailProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface OmnipackProductDetailProps extends ProductDetailProps {
  storeSlug: string;
}

/** MOQ tiers visible in the bulk-pricing table. */
const QUANTITY_TIERS = [50, 100, 500];

export function OmnipackProductDetail(props: OmnipackProductDetailProps) {
  const { store, product, related, storeSlug } = props;
  const router = useRouter();
  const add = useCart((s) => s.add);

  const productBase = `/stores/${storeSlug}/products`;
  const shopUrl = `/stores/${storeSlug}/category`;
  const homeUrl = `/stores/${storeSlug}`;
  const checkoutUrl = `/stores/${storeSlug}/checkout/address`;

  // De-duped gallery — primary image first, then any others.
  const gallery: string[] = [];
  if (product.imageUrl) gallery.push(product.imageUrl);
  for (const img of product.images ?? []) {
    if (img && img !== product.imageUrl) gallery.push(img);
  }

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(50);

  // Bulk-pricing tiers — derived from the unit price, decreasing by
  // 10% / 25% as MOQ rises. Lead time is purely a UI hint, not
  // persisted spec data — and is the same generic message across tiers.
  const tiers = QUANTITY_TIERS.map((min, i) => {
    const discount = i === 0 ? 1 : i === 1 ? 0.9 : 0.75;
    return {
      min,
      unitPrice: Math.round(product.priceTHB * discount),
    };
  });

  // Lookup the right tier price for the chosen qty.
  const activeTier = tiers
    .filter((t) => qty >= t.min)
    .at(-1) ?? tiers[0];
  const lineTotal = activeTier.unitPrice * qty;

  const addToCart = () => {
    add(
      {
        productId: product.id,
        title: product.title,
        imageUrl: product.imageUrl ?? undefined,
        priceTHB: activeTier.unitPrice,
        storeSlug,
        storeName: store.name,
      },
      qty,
    );
  };

  const buyNow = () => {
    addToCart();
    router.push(checkoutUrl);
  };

  return (
    <main
      className="min-h-screen font-[family:var(--font-prompt)]"
      style={{ backgroundColor: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      {/* Breadcrumb */}
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-1.5 text-xs"
        style={{ color: 'var(--shop-ink-muted)' }}
        aria-label="Breadcrumb"
      >
        <Link href={homeUrl} className="hover:opacity-80">
          หน้าแรก
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={shopUrl} className="hover:opacity-80">
          สินค้าทั้งหมด
        </Link>
        {product.categoryName && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`${shopUrl}?cat=${encodeURIComponent(product.categoryName)}`}
              className="hover:opacity-80"
            >
              {product.categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span
          className="truncate max-w-[200px]"
          style={{ color: 'var(--shop-ink)' }}
        >
          {product.title}
        </span>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {gallery.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[480px] md:w-20 shrink-0">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="aspect-square w-20 md:w-full shrink-0 rounded-md overflow-hidden border-2 transition-all"
                    style={{
                      borderColor:
                        activeImg === i
                          ? 'var(--shop-primary)'
                          : 'var(--shop-border)',
                      backgroundColor: 'var(--shop-bg)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${product.title} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <div
              className="flex-1 aspect-square rounded-2xl border overflow-hidden relative"
              style={{
                backgroundColor: 'var(--shop-card)',
                borderColor: 'var(--shop-border)',
              }}
            >
              {gallery[activeImg] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gallery[activeImg]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ color: 'var(--shop-border)' }}
                >
                  <PackageOpen className="w-24 h-24" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.categoryName && (
              <span
                className="text-xs uppercase tracking-wide font-medium mb-2"
                style={{ color: 'var(--shop-primary)' }}
              >
                {product.categoryName}
              </span>
            )}
            <h1
              className="font-[family:var(--font-kanit)] font-medium text-2xl sm:text-3xl leading-tight mb-3"
              style={{ color: 'var(--shop-ink)' }}
            >
              {product.title}
            </h1>

            {product.description && (
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                {product.description}
              </p>
            )}

            {/* Price */}
            <div
              className="flex items-baseline gap-3 mb-6 pb-6 border-b"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <span
                className="font-[family:var(--font-kanit)] font-medium text-3xl"
                style={{ color: 'var(--shop-primary)' }}
              >
                {formatTHB(activeTier.unitPrice)}
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                / ชิ้น
              </span>
              {product.originalPriceTHB &&
                product.originalPriceTHB > activeTier.unitPrice && (
                  <span
                    className="text-sm line-through"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {formatTHB(product.originalPriceTHB)}
                  </span>
                )}
            </div>

            {/* Bulk pricing tiers */}
            <div className="mb-6">
              <h3
                className="font-[family:var(--font-kanit)] font-medium text-base mb-3"
                style={{ color: 'var(--shop-ink)' }}
              >
                ราคาตามจำนวน
              </h3>
              <div
                className="rounded-xl border overflow-hidden"
                style={{
                  backgroundColor: 'var(--shop-card)',
                  borderColor: 'var(--shop-border)',
                }}
              >
                <div className="grid grid-cols-3 text-sm">
                  {tiers.map((t, i) => {
                    const active = activeTier.min === t.min;
                    return (
                      <div
                        key={t.min}
                        className="p-4 text-center"
                        style={{
                          backgroundColor: active
                            ? 'var(--shop-bg-soft, var(--shop-bg))'
                            : 'transparent',
                          borderRight:
                            i < tiers.length - 1
                              ? '1px solid var(--shop-border)'
                              : 'none',
                        }}
                      >
                        <div
                          className="text-xs mb-1"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          ตั้งแต่ {t.min}+ ชิ้น
                        </div>
                        <div
                          className="font-[family:var(--font-kanit)] font-medium text-lg"
                          style={{
                            color: active
                              ? 'var(--shop-primary)'
                              : 'var(--shop-ink)',
                          }}
                        >
                          {formatTHB(t.unitPrice)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Qty + total */}
            <div
              className="rounded-xl border p-4 mb-5"
              style={{
                backgroundColor: 'var(--shop-card)',
                borderColor: 'var(--shop-border)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  จำนวน (ขั้นต่ำ 50)
                </span>
                <div
                  className="flex items-center border rounded-md"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(50, qty - 50))}
                    className="p-2 hover:opacity-80"
                    style={{ color: 'var(--shop-ink-muted)' }}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={50}
                    step={50}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.max(50, Number(e.target.value) || 50))
                    }
                    className="w-16 text-center text-sm font-medium bg-transparent outline-none"
                    style={{ color: 'var(--shop-ink)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setQty(qty + 50)}
                    className="p-2 hover:opacity-80"
                    style={{ color: 'var(--shop-ink-muted)' }}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div
                className="flex items-baseline justify-between pt-3 border-t"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <span
                  className="text-sm"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  รวมทั้งหมด
                </span>
                <span
                  className="font-[family:var(--font-kanit)] font-medium text-xl"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {formatTHB(lineTotal)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                type="button"
                onClick={addToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-md font-medium text-sm border transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--shop-card)',
                  borderColor: 'var(--shop-primary)',
                  color: 'var(--shop-primary)',
                }}
              >
                เพิ่มลงตะกร้า
              </button>
              <button
                type="button"
                onClick={buyNow}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-md font-medium text-sm text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--shop-primary)' }}
              >
                ซื้อทันที
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Inline trust strip */}
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <ShieldCheck
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--shop-accent)' }}
                />
                <span style={{ color: 'var(--shop-ink-muted)' }}>
                  รับประกันสินค้าคืนได้ ภายใน 7 วัน
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Truck
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--shop-primary)' }}
                />
                <span style={{ color: 'var(--shop-ink-muted)' }}>
                  ส่งภายใน 1 วันทำการ · ฟรีเมื่อยอดสั่งถึง ฿990
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Related */}
        {related && related.length > 0 && (
          <section className="mt-16">
            <h2
              className="font-[family:var(--font-kanit)] font-medium text-xl sm:text-2xl mb-6"
              style={{ color: 'var(--shop-ink)' }}
            >
              สินค้าที่เกี่ยวข้อง
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {related.slice(0, 4).map((r) => (
                <Link
                  key={r.id}
                  href={`${productBase}/${r.id}`}
                  className="group rounded-xl border overflow-hidden transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--shop-card)',
                    borderColor: 'var(--shop-border)',
                  }}
                >
                  <div
                    className="aspect-square relative overflow-hidden"
                    style={{ backgroundColor: 'var(--shop-bg)' }}
                  >
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ color: 'var(--shop-border)' }}
                      >
                        <PackageOpen className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3
                      className="font-[family:var(--font-kanit)] font-medium text-sm line-clamp-2 mb-1.5"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {r.title}
                    </h3>
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      {formatTHB(r.priceTHB)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
