'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Truck,
  ShieldCheck,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CartProps } from '@/lib/templates/types';

/**
 * Konvy — K-beauty cart.
 *
 * Layout:
 *   - Hero band ("ตะกร้าของคุณ" + line count)
 *   - LEFT line items (image · title · qty stepper · subtotal · remove)
 *   - RIGHT sticky summary (free-shipping progress bar + totals + CTA)
 *
 * Hydration: lines are read from zustand only after `mounted` to avoid
 * an SSR/CSR mismatch (same trick as taobao-style).
 */
export default function Cart({
  store,
  freeShippingThreshold = 590,
  flatShippingTHB = 50,
}: CartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useCart((s) =>
    s.lines.filter((line) => line.storeSlug === store.slug),
  );
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const subtotal = items.reduce(
    (sum, line) => sum + line.priceTHB * line.qty,
    0,
  );
  const shipping =
    subtotal === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : flatShippingTHB;
  const total = subtotal + shipping;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress =
    subtotal >= freeShippingThreshold
      ? 100
      : Math.round((subtotal / freeShippingThreshold) * 100);

  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: 'var(--shop-bg, #FFFFFF)' }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="font-[family:var(--font-prompt)] text-[var(--shop-ink)]"
        style={{ background: 'var(--shop-bg, #FFFFFF)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div
            className="mx-auto h-20 w-20 rounded-full grid place-items-center mb-6"
            style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
          >
            <Heart
              className="h-10 w-10"
              style={{ color: 'var(--shop-primary)' }}
            />
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-semibold mb-3">
            ตะกร้ายังว่างเปล่า
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            ลองช้อปสินค้า K-Beauty ที่คัดสรรมาให้คุณ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white text-sm font-semibold transition-all hover:shadow-lg"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-primary))',
            }}
          >
            เริ่มช้อป
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="font-[family:var(--font-prompt)] text-[var(--shop-ink)]"
      style={{ background: 'var(--shop-bg, #FFFFFF)' }}
    >
      {/* Hero band */}
      <section
        className="border-b border-[var(--shop-border)]"
        style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2"
            style={{ color: 'var(--shop-primary)' }}
          >
            Your bag
          </p>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-semibold tracking-tight">
            ตะกร้าของคุณ
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {items.length} รายการ · พร้อมจัดส่งจาก {store.name}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* LEFT — line items */}
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.productId}
              className="bg-white rounded-2xl border border-[var(--shop-border)] shadow-sm p-4 sm:p-5 flex gap-4"
            >
              <div
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden shrink-0"
                style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
              >
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.imageUrl}
                    alt={it.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <Link
                  href={`/stores/${store.slug}/products/${it.productId}`}
                  className="text-sm font-medium leading-snug line-clamp-2 hover:text-[var(--shop-primary)] transition-colors"
                >
                  {it.title}
                </Link>
                <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-1 rounded-full border border-[var(--shop-border)] p-0.5 bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setQty(
                          it.productId,
                          Math.max(1, it.qty - 1),
                          store.slug,
                        )
                      }
                      className="h-7 w-7 rounded-full grid place-items-center hover:bg-[var(--shop-bg-soft)] transition-colors"
                      aria-label="ลดจำนวน"
                      disabled={it.qty <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[32px] text-center text-sm font-medium">
                      {it.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(it.productId, it.qty + 1, store.slug)}
                      className="h-7 w-7 rounded-full grid place-items-center hover:bg-[var(--shop-bg-soft)] transition-colors"
                      aria-label="เพิ่มจำนวน"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(it.productId, store.slug)}
                    className="inline-flex items-center gap-1 text-xs hover:text-[var(--shop-primary)] transition-colors"
                    style={{ color: 'var(--shop-ink-muted)' }}
                    aria-label={`ลบ ${it.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">ลบ</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between text-right shrink-0">
                <span
                  className="font-[family:var(--font-kanit)] font-semibold text-base sm:text-lg"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {formatTHB(it.priceTHB * it.qty)}
                </span>
                {it.qty > 1 && (
                  <span
                    className="text-[11px] mt-1"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {formatTHB(it.priceTHB)} / ชิ้น
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* RIGHT — sticky summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          {/* Free-shipping progress */}
          <div
            className="rounded-2xl border border-[var(--shop-border)] p-5"
            style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Truck
                className="h-4 w-4"
                style={{ color: 'var(--shop-primary)' }}
              />
              <p className="text-sm font-medium">
                {remaining > 0
                  ? `ช้อปอีก ${formatTHB(remaining)} เพื่อรับส่งฟรี`
                  : 'คุณได้รับส่งฟรีแล้ว!'}
              </p>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden bg-white"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${progress}%`,
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary))',
                }}
              />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-2xl border border-[var(--shop-border)] shadow-sm overflow-hidden">
            <h2 className="font-[family:var(--font-kanit)] font-semibold text-base px-5 pt-5 mb-4">
              สรุปการสั่งซื้อ
            </h2>
            <dl className="px-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt style={{ color: 'var(--shop-ink-muted)' }}>ยอดสินค้า</dt>
                <dd className="font-medium">{formatTHB(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: 'var(--shop-ink-muted)' }}>ค่าจัดส่ง</dt>
                <dd
                  className="font-medium"
                  style={{
                    color: shipping === 0 ? 'var(--shop-primary)' : 'inherit',
                  }}
                >
                  {shipping === 0 ? 'ฟรี' : formatTHB(shipping)}
                </dd>
              </div>
            </dl>
            <div className="px-5 mt-4 pt-4 border-t border-[var(--shop-border)] flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-semibold">
                รวมทั้งสิ้น
              </span>
              <span
                className="font-[family:var(--font-kanit)] font-semibold text-2xl"
                style={{ color: 'var(--shop-primary)' }}
              >
                {formatTHB(total)}
              </span>
            </div>
            <div className="px-5 pb-5 pt-4">
              <Link
                href={`/stores/${store.slug}/checkout`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary))',
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                ดำเนินการสั่งซื้อ
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p
                className="text-center text-[11px] mt-3 flex items-center justify-center gap-1"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                <ShieldCheck
                  className="h-3 w-3"
                  style={{ color: 'var(--shop-primary)' }}
                />
                จ่ายผ่าน ANYPAY · ปลอดภัย 100%
              </p>
            </div>
          </div>

          <Link
            href={`/stores/${store.slug}/category`}
            className="block text-center text-xs hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            ← ช้อปต่อ
          </Link>
        </aside>
      </div>
    </div>
  );
}
