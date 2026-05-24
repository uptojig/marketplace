'use client';

/**
 * MotoFog — racing cart.
 *
 * Per-store cart hydrated from `useCart()` with mount-guard to avoid
 * SSR hydration mismatch on persisted state. Includes a free-shipping
 * progress bar (default threshold ฿1,990) and AnyPay-only checkout
 * routing.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bike, Trash2, Plus, Minus, ArrowRight, CreditCard } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CartProps } from '@/lib/templates/types';

export function MotoFogCart({
  store,
  freeShippingThreshold = 1990,
  flatShippingTHB = 50,
}: CartProps) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ backgroundColor: 'var(--shop-bg, #0F1417)' }}
      />
    );
  }

  const items = allLines.filter((l) => l.storeSlug === store.slug);
  const subtotal = items.reduce((acc, l) => acc + l.priceTHB * l.qty, 0);
  const shipping = subtotal >= freeShippingThreshold ? 0 : flatShippingTHB;
  const total = subtotal + shipping;
  const progressPct = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100),
  );
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <main
        className="min-h-[60vh] flex items-center justify-center px-4"
        style={{
          backgroundColor: 'var(--shop-bg, #0F1417)',
          color: 'var(--shop-ink, #F5F7FA)',
        }}
      >
        <div className="text-center max-w-md py-16">
          <div
            className="h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-5"
            style={{
              backgroundColor: 'var(--shop-surface, #1A2128)',
              border: '1px solid var(--shop-border, #2B3540)',
            }}
          >
            <Bike
              className="h-7 w-7"
              style={{ color: 'var(--shop-accent, #FFC72C)' }}
            />
          </div>
          <h1
            className="font-[family:var(--font-kanit)] italic font-black text-2xl uppercase tracking-tight mb-3"
            style={{ color: 'var(--shop-ink, #F5F7FA)' }}
          >
            ตะกร้ายังว่างเปล่า
          </h1>
          <p
            className="font-[family:var(--font-prompt)] text-sm mb-6"
            style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
          >
            เลือกอะไหล่แต่ง ชุดแข่ง หรือหมวกกันน็อกที่ใช่สำหรับคุณ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-widest"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
              color: '#0A0A0A',
            }}
          >
            ดูสินค้าทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--shop-bg, #0F1417)',
        color: 'var(--shop-ink, #F5F7FA)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-8 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p
              className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.3em] font-bold mb-2"
              style={{ color: 'var(--shop-accent, #FFC72C)' }}
            >
              Pit Stop · ตะกร้าสินค้า
            </p>
            <h1
              className="font-[family:var(--font-kanit)] italic font-black text-3xl sm:text-4xl uppercase tracking-tight"
              style={{ color: 'var(--shop-ink, #F5F7FA)' }}
            >
              ตะกร้าของคุณ
            </h1>
          </div>
          <span
            className="font-[family:var(--font-prompt)] text-xs uppercase tracking-widest font-bold"
            style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
          >
            {items.length} รายการ
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lines */}
          <section className="lg:col-span-8 space-y-3">
            {/* Free shipping bar */}
            <div
              className="rounded-md p-4"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p
                  className="font-[family:var(--font-prompt)] text-xs uppercase tracking-widest font-bold"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  ส่งฟรีเมื่อสั่งครบ {formatTHB(freeShippingThreshold)}
                </p>
                <p
                  className="font-[family:var(--font-prompt)] text-xs font-bold tabular-nums"
                  style={{
                    color:
                      remaining === 0
                        ? 'var(--shop-accent, #FFC72C)'
                        : 'var(--shop-ink-muted, #94A3B0)',
                  }}
                >
                  {remaining === 0
                    ? 'รับสิทธิ์ส่งฟรีแล้ว'
                    : `เหลืออีก ${formatTHB(remaining)}`}
                </p>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--shop-bg, #0F1417)' }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${progressPct}%`,
                    background:
                      'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                  }}
                />
              </div>
            </div>

            {/* Items */}
            <ul className="space-y-3">
              {items.map((line) => (
                <li
                  key={line.productId}
                  className="rounded-md p-4 flex gap-4"
                  style={{
                    backgroundColor: 'var(--shop-surface, #1A2128)',
                    border: '1px solid var(--shop-border, #2B3540)',
                  }}
                >
                  <Link
                    href={`/stores/${store.slug}/products/${line.productId}`}
                    className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-sm relative"
                    style={{
                      backgroundColor: 'var(--shop-bg, #0F1417)',
                      border: '1px solid var(--shop-border, #2B3540)',
                    }}
                  >
                    {line.imageUrl ? (
                      <img
                        src={line.imageUrl}
                        alt={line.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bike
                          className="h-8 w-8"
                          style={{ color: 'var(--shop-border, #2B3540)' }}
                        />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/stores/${store.slug}/products/${line.productId}`}
                        className="min-w-0 flex-1"
                      >
                        <h3
                          className="font-[family:var(--font-prompt)] text-sm font-semibold line-clamp-2"
                          style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                        >
                          {line.title}
                        </h3>
                        <p
                          className="font-[family:var(--font-prompt)] text-xs mt-1"
                          style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                        >
                          {formatTHB(line.priceTHB)} / ชิ้น
                        </p>
                      </Link>
                      <button
                        type="button"
                        aria-label={`ลบ ${line.title}`}
                        onClick={() => removeItem(line.productId, store.slug)}
                        className="shrink-0 h-9 w-9 rounded-sm inline-flex items-center justify-center"
                        style={{
                          backgroundColor: 'var(--shop-bg, #0F1417)',
                          border: '1px solid var(--shop-border, #2B3540)',
                          color: 'var(--shop-ink-muted, #94A3B0)',
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="inline-flex items-center rounded-sm overflow-hidden"
                        style={{
                          backgroundColor: 'var(--shop-bg, #0F1417)',
                          border: '1px solid var(--shop-border, #2B3540)',
                        }}
                      >
                        <button
                          type="button"
                          aria-label="ลดจำนวน"
                          onClick={() =>
                            setQty(
                              line.productId,
                              Math.max(0, line.qty - 1),
                              store.slug,
                            )
                          }
                          className="h-9 w-9 inline-flex items-center justify-center hover:bg-white/5"
                          style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span
                          className="w-10 text-center font-[family:var(--font-prompt)] text-sm font-bold tabular-nums"
                          style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                        >
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="เพิ่มจำนวน"
                          onClick={() =>
                            setQty(line.productId, line.qty + 1, store.slug)
                          }
                          className="h-9 w-9 inline-flex items-center justify-center hover:bg-white/5"
                          style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span
                        className="font-[family:var(--font-kanit)] italic font-black text-base tabular-nums"
                        style={{ color: 'var(--shop-ink, #F5F7FA)' }}
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
          <aside className="lg:col-span-4">
            <div
              className="rounded-md p-6 sticky top-24"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              <h2
                className="font-[family:var(--font-kanit)] italic font-black text-lg uppercase tracking-widest mb-4"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              >
                สรุปคำสั่งซื้อ
              </h2>
              <dl
                className="space-y-3 pb-5 mb-5"
                style={{ borderBottom: '1px solid var(--shop-border, #2B3540)' }}
              >
                <div className="flex justify-between font-[family:var(--font-prompt)] text-sm">
                  <dt style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}>
                    ยอดสินค้า
                  </dt>
                  <dd
                    className="tabular-nums font-semibold"
                    style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                  >
                    {formatTHB(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between font-[family:var(--font-prompt)] text-sm">
                  <dt style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}>
                    ค่าจัดส่ง
                  </dt>
                  <dd
                    className="tabular-nums font-semibold"
                    style={{
                      color:
                        shipping === 0
                          ? 'var(--shop-accent, #FFC72C)'
                          : 'var(--shop-ink, #F5F7FA)',
                    }}
                  >
                    {shipping === 0 ? 'ฟรี' : formatTHB(shipping)}
                  </dd>
                </div>
              </dl>
              <div className="flex items-baseline justify-between mb-6">
                <span
                  className="font-[family:var(--font-prompt)] text-sm uppercase tracking-widest font-bold"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  รวมทั้งสิ้น
                </span>
                <span
                  className="font-[family:var(--font-kanit)] italic font-black text-2xl tabular-nums"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  {formatTHB(total)}
                </span>
              </div>
              <Link
                href={`/stores/${store.slug}/checkout`}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-md font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-widest transition-transform hover:-translate-y-0.5"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                  color: '#0A0A0A',
                }}
              >
                ไปที่หน้าชำระเงิน
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div
                className="mt-4 flex items-center gap-2 text-xs font-[family:var(--font-prompt)]"
                style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span className="uppercase tracking-widest font-bold">
                  จ่ายผ่าน AnyPay
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default MotoFogCart;
