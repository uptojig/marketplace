'use client';

/**
 * OmniPack — cart page.
 *
 * Per-store line items list + sticky summary card. Free-shipping bar
 * fills as the subtotal approaches the 990 THB threshold, then locks
 * out the checkout CTA when the cart is empty. All cart state comes
 * from the zustand store filtered by `storeSlug`.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Minus,
  PackageOpen,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import type { CartProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface OmnipackCartProps extends CartProps {
  storeSlug: string;
}

const DEFAULT_FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_FLAT_SHIPPING_THB = 50;

export function OmnipackCart(props: OmnipackCartProps) {
  const { store, storeSlug } = props;
  const freeShippingThreshold =
    props.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD;
  const flatShipping = props.flatShippingTHB ?? DEFAULT_FLAT_SHIPPING_THB;

  // ── Cart selectors (per-store) ──────────────────────────────────
  const lines = useCart((s) => s.linesForStore(storeSlug));
  const subtotal = useCart((s) => s.subtotalForStore(storeSlug));
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  // Hydration guard — zustand persist hydrates on mount, so render
  // a stable placeholder during SSR / first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shopUrl = `/stores/${storeSlug}/category`;
  const checkoutUrl = `/stores/${storeSlug}/checkout/address`;

  if (!mounted) {
    return <div className="min-h-[60vh]" aria-hidden />;
  }

  // Empty state
  if (lines.length === 0) {
    return (
      <main
        className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 font-[family:var(--font-prompt)]"
        style={{ backgroundColor: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{
            backgroundColor: 'var(--shop-bg-soft, var(--shop-bg))',
            color: 'var(--shop-primary)',
          }}
        >
          <ShoppingBag className="w-9 h-9" />
        </div>
        <h1
          className="font-[family:var(--font-kanit)] font-medium text-2xl mb-2"
          style={{ color: 'var(--shop-ink)' }}
        >
          ตะกร้าว่างเปล่า
        </h1>
        <p
          className="text-sm max-w-sm mb-6"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          ยังไม่มีบรรจุภัณฑ์อยู่ในตะกร้า · เลือกชมสินค้าที่ {store.name} ได้เลย
        </p>
        <Link
          href={shopUrl}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium text-white hover:opacity-90"
          style={{ backgroundColor: 'var(--shop-primary)' }}
        >
          เริ่มเลือกสินค้า
          <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    );
  }

  // Free-shipping progress
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100),
  );
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : flatShipping;
  const total = subtotal + shippingCost;

  return (
    <main
      className="min-h-screen py-10 font-[family:var(--font-prompt)]"
      style={{ backgroundColor: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="font-[family:var(--font-kanit)] font-medium text-2xl sm:text-3xl mb-8"
          style={{ color: 'var(--shop-ink)' }}
        >
          ตะกร้าของคุณ
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Lines */}
          <section
            className="rounded-xl border overflow-hidden"
            style={{
              backgroundColor: 'var(--shop-card)',
              borderColor: 'var(--shop-border)',
            }}
          >
            <ul className="divide-y" style={{ borderColor: 'var(--shop-border)' }}>
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="p-5 flex gap-4"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-md overflow-hidden border"
                    style={{
                      backgroundColor: 'var(--shop-bg)',
                      borderColor: 'var(--shop-border)',
                    }}
                  >
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt={line.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ color: 'var(--shop-border)' }}
                      >
                        <PackageOpen className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className="font-[family:var(--font-kanit)] font-medium text-sm sm:text-base line-clamp-2"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        {line.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => remove(line.productId, storeSlug)}
                        className="shrink-0 p-1 -m-1 hover:opacity-80"
                        style={{ color: 'var(--shop-ink-muted)' }}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span
                      className="text-xs mt-1"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {formatTHB(line.priceTHB)} / ชิ้น
                    </span>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div
                        className="flex items-center border rounded-md"
                        style={{ borderColor: 'var(--shop-border)' }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setQty(
                              line.productId,
                              Math.max(50, line.qty - 50),
                              storeSlug,
                            )
                          }
                          className="p-1.5 hover:opacity-80"
                          style={{ color: 'var(--shop-ink-muted)' }}
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                          className="w-12 text-center text-sm font-medium"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQty(line.productId, line.qty + 50, storeSlug)
                          }
                          className="p-1.5 hover:opacity-80"
                          style={{ color: 'var(--shop-ink-muted)' }}
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span
                        className="font-[family:var(--font-kanit)] font-medium text-base"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {formatTHB(line.priceTHB * line.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: 'var(--shop-card)',
                borderColor: 'var(--shop-border)',
              }}
            >
              <h2
                className="font-[family:var(--font-kanit)] font-medium text-base mb-4"
                style={{ color: 'var(--shop-ink)' }}
              >
                สรุปยอด
              </h2>

              {/* Free shipping progress */}
              <div
                className="rounded-md border p-3 mb-5"
                style={{
                  backgroundColor: 'var(--shop-bg-soft, var(--shop-bg))',
                  borderColor: 'var(--shop-border)',
                }}
              >
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <Truck
                    className="w-4 h-4"
                    style={{ color: 'var(--shop-primary)' }}
                  />
                  {remaining > 0 ? (
                    <span style={{ color: 'var(--shop-ink-muted)' }}>
                      ซื้อเพิ่ม{' '}
                      <strong style={{ color: 'var(--shop-ink)' }}>
                        {formatTHB(remaining)}
                      </strong>{' '}
                      เพื่อรับส่งฟรี
                    </span>
                  ) : (
                    <span style={{ color: 'var(--shop-ink)' }}>
                      ได้รับสิทธิ์ส่งฟรีแล้ว
                    </span>
                  )}
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--shop-border)' }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${progress}%`,
                      background:
                        'var(--shop-primary-gradient, var(--shop-primary))',
                    }}
                  />
                </div>
              </div>

              {/* Lines */}
              <dl
                className="text-sm space-y-2 pb-4 mb-4 border-b"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <div className="flex justify-between">
                  <dt style={{ color: 'var(--shop-ink-muted)' }}>ยอดสินค้า</dt>
                  <dd style={{ color: 'var(--shop-ink)' }}>
                    {formatTHB(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: 'var(--shop-ink-muted)' }}>ค่าจัดส่ง</dt>
                  <dd style={{ color: 'var(--shop-ink)' }}>
                    {shippingCost === 0 ? 'ฟรี' : formatTHB(shippingCost)}
                  </dd>
                </div>
              </dl>

              <div className="flex items-baseline justify-between mb-5">
                <span
                  className="font-[family:var(--font-kanit)] font-medium text-base"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  รวมทั้งหมด
                </span>
                <span
                  className="font-[family:var(--font-kanit)] font-medium text-2xl"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {formatTHB(total)}
                </span>
              </div>

              <Link
                href={checkoutUrl}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-md text-white text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--shop-primary)' }}
              >
                ดำเนินการชำระเงิน
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={shopUrl}
                className="block text-center text-xs mt-3 hover:opacity-80"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                เลือกสินค้าเพิ่ม
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
