'use client';

/**
 * caldera-skin — bespoke Cart page (skincare clean-luxe).
 *
 * Replaces the previous makeCartAdapter('01') shopping-cart-01 block
 * with a hand-built layout that matches the rest of the caldera-skin
 * surface: lab-data typography, soft neutral surfaces, hairline rules.
 *
 * Wiring (matches StoreCartClient / FashionBeautyCartPage):
 *   - lines come from `useCart` filtered by store.slug (per-store cart
 *     isolation — see lib/store/cart.ts).
 *   - qty / remove call into the same zustand setQty / remove actions.
 *   - free-shipping threshold = 990 THB with progress nudge.
 *   - coupon flow:
 *       • code input → POST /api/coupons/preview { code, items, ... }
 *       • on { ok, coupon } → push into local applied list, re-run
 *         calculate() from @/lib/coupons/calculator for authoritative
 *         subtotal / discount / shipping / grandTotal.
 *       • remove × clears one applied coupon (slot-aware).
 *       • errors surface inline using COUPON_ERROR_MESSAGE.
 *   - empty state mirrors the lab-data voice ("ตะกร้ายังว่าง").
 *
 * All accents flow via var(--shop-*) — no hardcoded hex. Fonts use the
 * Thai-primary Prompt / Kanit cascade from the storefront layout.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  Minus,
  Plus,
  Package,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';

import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { calculate } from '@/lib/coupons/calculator';
import {
  COUPON_ERROR_MESSAGE,
  type Coupon,
  type CouponValidationError,
} from '@/lib/coupons/types';
import type { CartItem as CalculatorCartItem } from '@/lib/cart/types';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

export interface CalderaSkinCartProps {
  store: StoreLite;
  /** Optional scaffold-passed values (currently unused — we read live state
   *  from useCart so the per-store cart isolation invariant holds). */
  items?: unknown[];
  freeShippingThreshold?: number;
  flatShippingTHB?: number;
}

interface PreviewResponse {
  ok: boolean;
  coupon?: Coupon;
  reason?: CouponValidationError;
}

export function CalderaSkinCart({
  store,
  freeShippingThreshold = FREE_SHIPPING_THRESHOLD,
  flatShippingTHB = DEFAULT_SHIPPING,
}: CalderaSkinCartProps) {
  // ── Zustand bindings (per-store filtered at read time) ──────────────
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  // Hydration guard — zustand persisted state is unavailable on the
  // server, so we render an empty shell until mount to prevent a
  // SSR / CSR mismatch crash.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  // ── Coupon state ────────────────────────────────────────────────────
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<Coupon[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build calculator inputs from useCart lines. storeId == store.id keeps
  // the calculator's store-scope coupons honest even though every line in
  // a per-store cart shares the same storeId.
  const calcItems: CalculatorCartItem[] = useMemo(
    () =>
      lines.map((l) => ({
        id: l.productId,
        productId: l.productId,
        qty: l.qty,
        storeId: store.id,
        title: l.title,
        thumbnailUrl: l.imageUrl ?? '',
        price: l.priceTHB,
        storeName: l.storeName,
      })),
    [lines, store.id, store.name, store.slug],
  );

  const rawSubtotal = useMemo(
    () => lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0),
    [lines],
  );
  const itemCount = useMemo(
    () => lines.reduce((acc, l) => acc + l.qty, 0),
    [lines],
  );

  // Shipping-per-store map — only one store on this surface but the
  // calculator expects the dict shape.
  const baseShipping =
    rawSubtotal >= freeShippingThreshold ? 0 : flatShippingTHB;
  const shippingPerStore = useMemo(
    () => ({ [store.id]: baseShipping }),
    [store.id, baseShipping],
  );

  const calcResult = useMemo(
    () =>
      calculate({
        items: calcItems,
        coupons: applied,
        shippingPerStore,
      }),
    [calcItems, applied, shippingPerStore],
  );

  const subtotal = calcResult.subtotal || rawSubtotal;
  const shipping = Object.values(calcResult.shippingAfterDiscount).reduce(
    (a, b) => a + b,
    0,
  );
  const discount = calcResult.totalDiscount;
  const total =
    calcResult.grandTotal > 0
      ? calcResult.grandTotal
      : Math.max(0, subtotal + shipping - discount);

  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - rawSubtotal,
  );
  const progressPct = Math.min(
    100,
    Math.round((rawSubtotal / freeShippingThreshold) * 100),
  );

  // ── Coupon apply / remove ───────────────────────────────────────────
  const applyCoupon = async (raw: string) => {
    const trimmed = raw.trim().toUpperCase();
    if (!trimmed) return;
    if (applied.some((c) => c.code === trimmed)) {
      setError(COUPON_ERROR_MESSAGE.already_applied);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code: trimmed,
          storeSlug: store.slug,
          items: calcItems,
          shippingPerStore,
          existingCouponIds: applied.map((c) => c.id),
        }),
      });
      if (!res.ok) {
        setError(COUPON_ERROR_MESSAGE.not_found);
        return;
      }
      const data = (await res.json()) as PreviewResponse;
      if (data.ok && data.coupon) {
        setApplied((prev) => [...prev, data.coupon as Coupon]);
        setCode('');
      } else {
        const reason = data.reason ?? 'not_found';
        setError(COUPON_ERROR_MESSAGE[reason] ?? COUPON_ERROR_MESSAGE.not_found);
      }
    } catch {
      setError(COUPON_ERROR_MESSAGE.not_found);
    } finally {
      setPending(false);
    }
  };

  const removeCoupon = (couponId: string) => {
    setApplied((prev) => prev.filter((c) => c.id !== couponId));
    setError(null);
  };

  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: 'var(--shop-bg)' }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--shop-bg)',
        color: 'var(--shop-ink)',
      }}
    >
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* ── Editorial header ─────────────────────────────────────── */}
        <header className="mb-10 border-b pb-6"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] hover:opacity-70"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับไปเลือกสินค้า
          </Link>
          <p
            className="mt-6 text-[11px] uppercase tracking-[0.28em]"
            style={{ color: 'var(--shop-accent)' }}
          >
            Lab Basket · Order Compiler
          </p>
          <h1
            className="mt-2 font-[family:var(--font-kanit)] text-4xl font-medium tracking-tight sm:text-5xl"
            style={{ color: 'var(--shop-ink)' }}
          >
            ตะกร้าของคุณ
          </h1>
          <p
            className="mt-3 font-[family:var(--font-prompt)] text-sm font-light"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {lines.length === 0
              ? `ยังไม่มีสินค้าจาก ${store.name}`
              : `${itemCount.toLocaleString()} ชิ้น · พร้อมตรวจสอบสูตรของคุณ`}
          </p>
        </header>

        {lines.length === 0 ? (
          <EmptyCart storeSlug={store.slug} />
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start">
            {/* ── Line items ─────────────────────────────────────── */}
            <section
              aria-labelledby="cart-heading"
              className="lg:col-span-7"
            >
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>

              <ul
                className="divide-y border-y"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                {lines.map((l) => (
                  <li
                    key={l.productId}
                    className="flex gap-4 py-6 sm:gap-6 sm:py-7"
                  >
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-md border sm:h-28 sm:w-28"
                      style={{
                        background: 'var(--shop-muted)',
                        borderColor: 'var(--shop-border)',
                      }}
                    >
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          <Package className="h-7 w-7" strokeWidth={1.25} />
                        </div>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/stores/${store.slug}/products/${l.productId}`}
                            className="block font-[family:var(--font-kanit)] text-base font-medium leading-snug hover:underline sm:text-lg"
                            style={{ color: 'var(--shop-ink)' }}
                          >
                            {l.title}
                          </Link>
                          <p
                            className="mt-1 font-[family:var(--font-prompt)] text-[11px] uppercase tracking-[0.15em]"
                            style={{ color: 'var(--shop-accent)' }}
                          >
                            {formatTHB(l.priceTHB)} · ต่อหน่วย
                          </p>
                        </div>
                        <p
                          className="shrink-0 font-[family:var(--font-prompt)] text-sm font-medium tabular-nums sm:text-base"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          {formatTHB(l.priceTHB * l.qty)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-end justify-between">
                        {/* Qty stepper */}
                        <div
                          className="inline-flex h-9 items-center overflow-hidden rounded-md border"
                          style={{
                            borderColor: 'var(--shop-border)',
                            background: 'var(--shop-card)',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setQty(
                                l.productId,
                                Math.max(1, l.qty - 1),
                                store.slug,
                              )
                            }
                            disabled={l.qty <= 1}
                            aria-label={`ลดจำนวน ${l.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center disabled:opacity-40"
                            style={{ color: 'var(--shop-ink)' }}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={l.qty}
                            onChange={(e) =>
                              setQty(
                                l.productId,
                                Math.max(1, parseInt(e.target.value, 10) || 1),
                                store.slug,
                              )
                            }
                            className="h-9 w-10 bg-transparent text-center font-[family:var(--font-prompt)] text-sm tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            style={{
                              color: 'var(--shop-ink)',
                              borderLeft: '1px solid var(--shop-border)',
                              borderRight: '1px solid var(--shop-border)',
                            }}
                            aria-label={`จำนวน ${l.title}`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setQty(l.productId, l.qty + 1, store.slug)
                            }
                            aria-label={`เพิ่มจำนวน ${l.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center"
                            style={{ color: 'var(--shop-ink)' }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => remove(l.productId, store.slug)}
                          className="inline-flex items-center gap-1.5 font-[family:var(--font-prompt)] text-xs uppercase tracking-[0.15em] hover:underline"
                          style={{ color: 'var(--shop-ink-muted)' }}
                          aria-label={`ลบ ${l.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          ลบ
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Free-shipping progress nudge */}
              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between font-[family:var(--font-prompt)] text-xs">
                  <span
                    className="inline-flex items-center gap-1.5 uppercase tracking-[0.15em]"
                    style={{ color: 'var(--shop-accent)' }}
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Free shipping · {formatTHB(freeShippingThreshold)}+
                  </span>
                  <span
                    className="tabular-nums"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    {progressPct}%
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: 'var(--shop-border)' }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                  aria-label="ความคืบหน้าส่งฟรี"
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressPct}%`,
                      background: 'var(--shop-primary)',
                    }}
                  />
                </div>
                <p
                  className="mt-2 font-[family:var(--font-prompt)] text-xs"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {remainingForFreeShipping > 0 ? (
                    <>
                      ซื้ออีก{' '}
                      <span
                        className="font-medium"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {formatTHB(remainingForFreeShipping)}
                      </span>{' '}
                      เพื่อรับส่งฟรี
                    </>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 font-medium"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      ยินดีด้วย — คุณได้รับส่งฟรีแล้ว
                    </span>
                  )}
                </p>
              </div>
            </section>

            {/* ── Sticky summary ────────────────────────────────── */}
            <aside
              aria-labelledby="summary-heading"
              className="mt-12 lg:col-span-5 lg:mt-0 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              <div
                className="rounded-lg border p-6 sm:p-7"
                style={{
                  background: 'var(--shop-card)',
                  borderColor: 'var(--shop-border)',
                }}
              >
                <p
                  className="font-[family:var(--font-prompt)] text-[11px] uppercase tracking-[0.28em]"
                  style={{ color: 'var(--shop-accent)' }}
                >
                  Compile Order
                </p>
                <h3
                  className="mt-1 font-[family:var(--font-kanit)] text-2xl font-medium"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  สรุปคำสั่งซื้อ
                </h3>
                <div
                  aria-hidden
                  className="mt-4 h-px w-12"
                  style={{ background: 'var(--shop-accent)' }}
                />

                {/* Coupon flow */}
                <form
                  className="mt-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void applyCoupon(code);
                  }}
                >
                  <label
                    htmlFor="coupon-code"
                    className="flex items-center gap-1.5 font-[family:var(--font-prompt)] text-[11px] uppercase tracking-[0.18em]"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    โค้ดส่วนลด
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="coupon-code"
                      type="text"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.toUpperCase().slice(0, 32))
                      }
                      placeholder="เช่น GLOW100"
                      className="h-11 flex-1 rounded-md border bg-transparent px-3 font-[family:var(--font-prompt)] text-sm tracking-wider focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--shop-border)',
                        color: 'var(--shop-ink)',
                      }}
                      aria-label="โค้ดส่วนลด"
                      disabled={pending}
                    />
                    <button
                      type="submit"
                      disabled={pending || !code.trim()}
                      className="h-11 rounded-md px-4 font-[family:var(--font-prompt)] text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity disabled:opacity-50"
                      style={{ background: 'var(--shop-primary)' }}
                    >
                      {pending ? 'กำลังตรวจสอบ' : 'ใช้โค้ด'}
                    </button>
                  </div>
                  {error && (
                    <p
                      className="mt-2 font-[family:var(--font-prompt)] text-xs"
                      style={{ color: 'var(--shop-primary)' }}
                      role="alert"
                    >
                      {error}
                    </p>
                  )}
                </form>

                {/* Applied coupons */}
                {applied.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {applied.map((c) => {
                      const appliedAmount =
                        calcResult.appliedCoupons.find(
                          (a) => a.couponId === c.id,
                        )?.amount ?? 0;
                      return (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                          style={{
                            borderColor: 'var(--shop-accent)',
                            background: 'var(--shop-muted)',
                          }}
                        >
                          <div className="min-w-0">
                            <p
                              className="font-[family:var(--font-prompt)] text-sm font-semibold tracking-wider"
                              style={{ color: 'var(--shop-ink)' }}
                            >
                              {c.code}
                            </p>
                            <p
                              className="truncate font-[family:var(--font-prompt)] text-[11px]"
                              style={{ color: 'var(--shop-ink-muted)' }}
                            >
                              {c.title}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className="font-[family:var(--font-prompt)] text-sm font-semibold tabular-nums"
                              style={{ color: 'var(--shop-primary)' }}
                            >
                              − {formatTHB(appliedAmount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeCoupon(c.id)}
                              aria-label={`ลบโค้ด ${c.code}`}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors hover:opacity-70"
                              style={{
                                borderColor: 'var(--shop-border)',
                                color: 'var(--shop-ink-muted)',
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Totals */}
                <dl className="mt-6 space-y-3 font-[family:var(--font-prompt)] text-sm">
                  <div className="flex items-center justify-between">
                    <dt style={{ color: 'var(--shop-ink-muted)' }}>
                      ยอดรวมสินค้า
                    </dt>
                    <dd
                      className="font-medium tabular-nums"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {formatTHB(subtotal)}
                    </dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <dt style={{ color: 'var(--shop-ink-muted)' }}>
                        ส่วนลดโค้ด
                      </dt>
                      <dd
                        className="font-medium tabular-nums"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        − {formatTHB(discount)}
                      </dd>
                    </div>
                  )}
                  <div
                    className="flex items-center justify-between border-t pt-3"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    <dt style={{ color: 'var(--shop-ink-muted)' }}>ค่าจัดส่ง</dt>
                    <dd
                      className="font-medium tabular-nums"
                      style={{
                        color:
                          shipping === 0
                            ? 'var(--shop-primary)'
                            : 'var(--shop-ink)',
                      }}
                    >
                      {shipping === 0 ? 'ส่งฟรี' : formatTHB(shipping)}
                    </dd>
                  </div>
                  <div
                    className="flex items-baseline justify-between border-t pt-4"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    <dt
                      className="font-[family:var(--font-kanit)] text-base font-medium"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      ยอดรวมทั้งหมด
                    </dt>
                    <dd
                      className="font-[family:var(--font-kanit)] text-2xl font-medium tabular-nums"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      {formatTHB(total)}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/stores/${store.slug}/checkout/address`}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md font-[family:var(--font-prompt)] text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-sm transition-opacity hover:opacity-90"
                  style={{ background: 'var(--shop-primary)' }}
                >
                  ดำเนินการชำระเงิน
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p
                  className="mt-4 flex items-center justify-center gap-1.5 text-center font-[family:var(--font-prompt)] text-[11px]"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ชำระเงินปลอดภัย · ปกป้องข้อมูลด้วย SSL
                </p>
              </div>

              {/* Trust strip — lab-data voice */}
              <ul
                className="mt-6 grid grid-cols-3 gap-3 text-center font-[family:var(--font-prompt)] text-[11px] uppercase tracking-[0.12em]"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                <li
                  className="rounded-md border px-2 py-3"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  <Truck
                    className="mx-auto mb-1 h-4 w-4"
                    style={{ color: 'var(--shop-accent)' }}
                  />
                  ส่งฟรี ฿990+
                </li>
                <li
                  className="rounded-md border px-2 py-3"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  <ShieldCheck
                    className="mx-auto mb-1 h-4 w-4"
                    style={{ color: 'var(--shop-accent)' }}
                  />
                  คืนได้ 7 วัน
                </li>
                <li
                  className="rounded-md border px-2 py-3"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  <Sparkles
                    className="mx-auto mb-1 h-4 w-4"
                    style={{ color: 'var(--shop-accent)' }}
                  />
                  Clinical Lot
                </li>
              </ul>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
 * Empty cart — keeps the lab-data tone with a hairline frame and
 * Kanit display headline. CTA returns to the caldera-skin catalog.
 * ────────────────────────────────────────────────────────────────── */
function EmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div
      className="mx-auto max-w-2xl rounded-lg border border-dashed px-6 py-16 text-center"
      style={{ borderColor: 'var(--shop-border)' }}
    >
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border"
        style={{
          background: 'var(--shop-muted)',
          borderColor: 'var(--shop-border)',
          color: 'var(--shop-accent)',
        }}
      >
        <Package className="h-7 w-7" strokeWidth={1.25} />
      </div>
      <p
        className="font-[family:var(--font-prompt)] text-[11px] uppercase tracking-[0.28em]"
        style={{ color: 'var(--shop-accent)' }}
      >
        Empty Basket
      </p>
      <h3
        className="mt-2 font-[family:var(--font-kanit)] text-2xl font-medium"
        style={{ color: 'var(--shop-ink)' }}
      >
        ตะกร้ายังว่าง
      </h3>
      <p
        className="mt-3 font-[family:var(--font-prompt)] text-sm font-light"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        เริ่มเลือกสูตรที่เหมาะกับผิวของคุณจากแคตตาล็อก
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md px-8 font-[family:var(--font-prompt)] text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition-opacity hover:opacity-90"
        style={{ background: 'var(--shop-primary)' }}
      >
        เลือกสูตร
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default CalderaSkinCart;
