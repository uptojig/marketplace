'use client';

/**
 * mono-eight — Bespoke Cart page (minimal JP / monochrome zine).
 *
 * Layout language:
 *   - Wide whitespace, hairline borders, NO shadows, NO rounded pills.
 *   - Sans-serif Kanit / Prompt only — body in Prompt, micro-labels and
 *     totals in Kanit black uppercase with wide tracking (mono-eight
 *     zine voice).
 *   - 8-column grid on desktop: line items 5fr / sticky summary 3fr.
 *
 * Coupon flow:
 *   - Codes typed by the customer are kept per-store in localStorage at
 *     key `mono-eight:coupons:<slug>`. Refreshing the cart hydrates from
 *     that key (couponCodesByStore[slug]).
 *   - Apply tries POST /api/coupons/preview first; if the endpoint is
 *     not wired (404 / network error) we fall back to a pure-client
 *     resolve via `getCouponByCode` + `validate()` so the buyer still
 *     sees the discount immediately. The persistent codes round-trip
 *     on next mount.
 *   - Final summary math is done by `calculate()` from
 *     `@/lib/coupons/calculator` so the cart preview matches what the
 *     server will compute at order placement.
 *
 * No useCartConfirmation / showConfirm — remove is a single tap.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { calculate, validate } from '@/lib/coupons/calculator';
import { getCouponByCode } from '@/lib/coupons/mock-data';
import {
  COUPON_ERROR_MESSAGE,
  type Coupon,
  type CouponValidationError,
} from '@/lib/coupons/types';
import type { CartItem as CalcCartItem } from '@/lib/cart/types';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

// localStorage key namespace — keeps each store's coupon wallet isolated
// so the same browser shopping at two mono-eight stores doesn't bleed
// codes between them.
const couponStorageKey = (slug: string) => `mono-eight:coupons:${slug}`;

interface StoreSummary {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

interface CartPageProps {
  store: StoreSummary;
  // `items` is part of CartProps for type compatibility with the
  // registry but the cart reads its lines from zustand — server-side
  // items[] would be empty anyway.
  items?: unknown;
}

// Wire format used by /api/coupons/preview. Keeping a narrow shape so
// the response is forward-compatible with the existing validate route.
interface PreviewResponse {
  ok: boolean;
  reason?: CouponValidationError;
  coupon?: Coupon;
}

export function CartPage({ store }: CartPageProps) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  // SSR mounted guard — zustand persisted state must hydrate from
  // localStorage before we render lines, otherwise the first paint
  // shows an empty cart and the next paint snaps content in.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Per-store applied coupon codes hydrated from localStorage. Stored
  // as `couponCodesByStore[slug]` shape so a future shared hook can
  // lift this out without breaking the contract.
  const [couponCodesByStore, setCouponCodesByStore] = useState<
    Record<string, string[]>
  >({});
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponPending, setCouponPending] = useState(false);

  // Hydrate codes once on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(couponStorageKey(store.slug));
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
          setCouponCodesByStore((prev) => ({ ...prev, [store.slug]: parsed }));
        }
      }
    } catch {
      // Corrupted JSON — clear it so we don't keep failing.
      window.localStorage.removeItem(couponStorageKey(store.slug));
    }
  }, [store.slug]);

  // Persist back to localStorage whenever the per-store list changes.
  // The dependency is the joined string so referentially-fresh `[]`
  // arrays don't re-fire the effect on every render.
  const codes = couponCodesByStore[store.slug] ?? [];
  const codesKey = codes.join('|');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mounted) return;
    window.localStorage.setItem(
      couponStorageKey(store.slug),
      JSON.stringify(codesKey ? codesKey.split('|') : []),
    );
  }, [codesKey, store.slug, mounted]);

  // Memoise the per-store slice — `allLines` is referentially stable
  // from zustand between unrelated renders, so the filter result only
  // changes when the underlying cart actually changes.
  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const progressPct = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  // Resolve typed codes to Coupon objects via the mock catalog. The
  // server-side preview is authoritative when accepting a new code;
  // here we just need the Coupon shape so `calculate()` can run on
  // every qty change without another network call. Memoising on the
  // joined-codes key (already computed above for the persist effect)
  // avoids re-resolving on every render — `codes` is derived from a
  // map and would otherwise be a fresh array reference each pass.
  const resolvedCoupons: Coupon[] = useMemo(() => {
    const out: Coupon[] = [];
    for (const code of codesKey ? codesKey.split('|') : []) {
      const c = getCouponByCode(code);
      if (c) out.push(c);
    }
    return out;
  }, [codesKey]);

  // Build the shape `calculate()` expects from our display lines. The
  // storeId in CartLineDisplay isn't carried (only storeSlug is) — we
  // fall back to slug as a stable per-store key since the calculator
  // only uses storeId for scoping math, not DB lookups.
  const calcItems: CalcCartItem[] = useMemo(
    () =>
      lines.map((l) => ({
        id: l.productId,
        productId: l.productId,
        qty: l.qty,
        storeId: store.id || store.slug,
        title: l.title,
        thumbnailUrl: l.imageUrl ?? '',
        price: l.priceTHB,
        storeName: store.name,
      })),
    [lines, store.id, store.slug, store.name],
  );

  const baseShipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? DEFAULT_SHIPPING : 0;
  const storeKey = store.id || store.slug;

  // Same payload used for the live preview totals AND for the
  // /api/coupons/preview body so server validation sees the same numbers
  // the buyer just looked at.
  const shippingPerStore: Record<string, number> = useMemo(
    () => ({ [storeKey]: baseShipping }),
    [storeKey, baseShipping],
  );

  const calcResult = useMemo(
    () =>
      calculate({
        items: calcItems,
        coupons: resolvedCoupons,
        shippingPerStore,
      }),
    [calcItems, resolvedCoupons, shippingPerStore],
  );

  const discountTotal = calcResult.totalDiscount;
  const shippingAfter = Object.values(calcResult.shippingAfterDiscount).reduce(
    (a, b) => a + b,
    0,
  );
  const grandTotal = calcResult.grandTotal;

  const applyCode = async (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    setCouponPending(true);

    if (codes.includes(code)) {
      setCouponError(COUPON_ERROR_MESSAGE.already_applied);
      setCouponPending(false);
      return;
    }

    let resolved: Coupon | null = null;
    let failureReason: CouponValidationError | null = null;

    // Prefer the server preview endpoint — it's the only path that can
    // enforce per-user usage caps. Network/404 falls through to the
    // pure-client validator below so a misconfigured deploy doesn't
    // block the buyer from typing in their code.
    try {
      const res = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code,
          storeSlug: store.slug,
          items: calcItems,
          shippingPerStore,
          existingCouponIds: resolvedCoupons.map((c) => c.id),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as PreviewResponse;
        if (data.ok && data.coupon) {
          resolved = data.coupon;
        } else if (!data.ok && data.reason) {
          failureReason = data.reason;
        }
      }
    } catch {
      // Network/server unreachable — fall through to client-side resolve.
    }

    if (!resolved && !failureReason) {
      const c = getCouponByCode(code);
      if (!c) {
        failureReason = 'not_found';
      } else {
        const err = validate(c, {
          items: calcItems,
          shippingPerStore,
          existingCoupons: resolvedCoupons,
        });
        if (err) {
          failureReason = err;
        } else {
          resolved = c;
        }
      }
    }

    if (failureReason) {
      setCouponError(COUPON_ERROR_MESSAGE[failureReason]);
      setCouponPending(false);
      return;
    }

    if (resolved) {
      setCouponCodesByStore((prev) => ({
        ...prev,
        [store.slug]: [...(prev[store.slug] ?? []), resolved!.code.toUpperCase()],
      }));
      setCouponInput('');
    }
    setCouponPending(false);
  };

  const removeCode = (code: string) => {
    setCouponCodesByStore((prev) => ({
      ...prev,
      [store.slug]: (prev[store.slug] ?? []).filter(
        (c) => c.toUpperCase() !== code.toUpperCase(),
      ),
    }));
    setCouponError(null);
  };

  // ── Pre-mount shell ────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: 'var(--shop-bg)' }}
        aria-hidden
      />
    );
  }

  // ── Empty state ────────────────────────────────────────────────────
  if (lines.length === 0) {
    return (
      <div
        className="min-h-screen"
        style={{ background: 'var(--shop-bg)' }}
      >
        <main className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
          <p
            className="font-[family:var(--font-kanit)] text-[10px] uppercase tracking-[0.32em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            01 / Cart
          </p>
          <div
            aria-hidden
            className="mt-6 h-px w-16"
            style={{ background: 'var(--shop-ink)' }}
          />
          <h1
            className="mt-8 font-[family:var(--font-kanit)] text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl"
            style={{ color: 'var(--shop-ink)' }}
          >
            ตะกร้าว่าง
          </h1>
          <p
            className="mt-6 max-w-md font-[family:var(--font-prompt)] text-base leading-relaxed"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            ยังไม่มีสินค้าจาก {store.name} ในตะกร้าของคุณ — เริ่มต้นด้วยคอลเลกชันล่าสุดด้านล่าง
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="mt-12 inline-flex items-center gap-3 font-[family:var(--font-kanit)] text-[11px] font-black uppercase tracking-[0.28em]"
            style={{ color: 'var(--shop-ink)' }}
          >
            <span
              aria-hidden
              className="inline-block h-px w-8 transition-all duration-300 group-hover:w-12"
              style={{ background: 'var(--shop-ink)' }}
            />
            เริ่มช้อป
          </Link>
        </main>
      </div>
    );
  }

  // ── Active cart ────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--shop-bg)' }}
    >
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 sm:px-10 sm:pt-20">
        {/* HEADER — zine cover number / wordmark / single hairline */}
        <header className="mb-16 sm:mb-20">
          <div className="flex items-baseline justify-between">
            <p
              className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.32em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              01 / Cart
            </p>
            <p
              className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.32em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              {String(itemCount).padStart(2, '0')} items
            </p>
          </div>
          <div
            aria-hidden
            className="mt-4 h-px w-full"
            style={{ background: 'var(--shop-border)' }}
          />
          <h1
            className="mt-10 font-[family:var(--font-kanit)] text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl"
            style={{ color: 'var(--shop-ink)' }}
          >
            ตะกร้าสินค้า
          </h1>
          <p
            className="mt-4 font-[family:var(--font-prompt)] text-sm"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            ทบทวนรายการก่อนชำระเงิน · {store.name}
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-16">
          {/* ── LINE ITEMS ───────────────────────────────────────── */}
          <section aria-labelledby="cart-heading" className="space-y-0">
            <h2 id="cart-heading" className="sr-only">
              รายการสินค้า
            </h2>

            {/* Free-shipping progress — minimal hairline bar */}
            <div
              role="status"
              aria-live="polite"
              className="mb-10 border-t border-b py-5"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <div className="flex items-baseline justify-between">
                <p
                  className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.28em]"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {remainingForFreeShipping > 0
                    ? 'จัดส่งฟรีเมื่อถึง'
                    : 'จัดส่งฟรีแล้ว'}
                </p>
                <p
                  className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.28em]"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  {formatTHB(FREE_SHIPPING_THRESHOLD)}
                </p>
              </div>
              <div
                className="mt-3 h-px w-full"
                style={{ background: 'var(--shop-border)' }}
                aria-hidden
              >
                <div
                  className="h-px transition-[width] duration-500 ease-out"
                  style={{
                    width: `${progressPct}%`,
                    background: 'var(--shop-ink)',
                  }}
                />
              </div>
              {remainingForFreeShipping > 0 ? (
                <p
                  className="mt-3 font-[family:var(--font-prompt)] text-xs"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  เหลืออีก{' '}
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {formatTHB(remainingForFreeShipping)}
                  </span>{' '}
                  เพื่อรับบริการจัดส่งฟรี
                </p>
              ) : (
                <p
                  className="mt-3 font-[family:var(--font-prompt)] text-xs"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  ออเดอร์นี้ได้รับบริการจัดส่งฟรี
                </p>
              )}
            </div>

            {/* Line item rows — divided by hairlines, no card chrome */}
            <ul
              className="border-t"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              {lines.map((l) => (
                <li
                  key={l.productId}
                  className="grid grid-cols-[5rem_1fr] gap-5 border-b py-8 sm:grid-cols-[7rem_1fr_auto] sm:gap-8"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  {/* Image — square mat */}
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="relative block aspect-square w-20 overflow-hidden sm:w-28"
                    style={{ background: 'var(--shop-muted)' }}
                  >
                    {l.imageUrl ? (
                      <Image
                        src={l.imageUrl}
                        alt={l.title}
                        fill
                        sizes="(max-width: 640px) 80px, 112px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  {/* Title + meta + qty */}
                  <div className="flex min-w-0 flex-col">
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="font-[family:var(--font-kanit)] text-base font-bold uppercase leading-tight tracking-wide hover:underline sm:text-lg"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {l.title}
                    </Link>
                    <p
                      className="mt-1 font-[family:var(--font-prompt)] text-xs"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {formatTHB(l.priceTHB)} / ชิ้น
                    </p>

                    {/* Qty stepper — bordered squares, no rounding */}
                    <div className="mt-5 flex items-center gap-6">
                      <div
                        role="group"
                        aria-label={`จำนวน ${l.title}`}
                        className="inline-flex items-stretch border"
                        style={{ borderColor: 'var(--shop-ink)' }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setQty(l.productId, Math.max(1, l.qty - 1), store.slug)
                          }
                          disabled={l.qty <= 1}
                          aria-label="ลด"
                          className="flex h-8 w-8 items-center justify-center font-[family:var(--font-kanit)] text-sm font-bold disabled:opacity-30"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          −
                        </button>
                        <span
                          aria-hidden
                          className="w-px"
                          style={{ background: 'var(--shop-ink)' }}
                        />
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
                          className="h-8 w-10 bg-transparent text-center font-[family:var(--font-kanit)] text-sm font-bold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          style={{ color: 'var(--shop-ink)' }}
                          aria-label="จำนวน"
                        />
                        <span
                          aria-hidden
                          className="w-px"
                          style={{ background: 'var(--shop-ink)' }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setQty(l.productId, l.qty + 1, store.slug)
                          }
                          aria-label="เพิ่ม"
                          className="flex h-8 w-8 items-center justify-center font-[family:var(--font-kanit)] text-sm font-bold"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(l.productId, store.slug)}
                        className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.24em] underline-offset-4 hover:underline"
                        style={{ color: 'var(--shop-ink-muted)' }}
                        aria-label={`ลบ ${l.title}`}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>

                  {/* Line subtotal — sits on its own column on desktop */}
                  <div className="col-span-2 mt-2 sm:col-span-1 sm:mt-0 sm:text-right">
                    <p
                      className="font-[family:var(--font-kanit)] text-base font-black tracking-tight"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {formatTHB(l.priceTHB * l.qty)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center gap-3 font-[family:var(--font-kanit)] text-[11px] font-black uppercase tracking-[0.28em] underline-offset-4 hover:underline"
                style={{ color: 'var(--shop-ink)' }}
              >
                <span
                  aria-hidden
                  className="inline-block h-px w-6"
                  style={{ background: 'var(--shop-ink)' }}
                />
                ช้อปต่อ
              </Link>
            </div>
          </section>

          {/* ── STICKY SUMMARY ───────────────────────────────────── */}
          <aside
            aria-labelledby="summary-heading"
            className="mt-16 lg:mt-0 lg:sticky lg:top-24"
          >
            <h2 id="summary-heading" className="sr-only">
              สรุปคำสั่งซื้อ
            </h2>

            <div
              className="border p-8"
              style={{
                borderColor: 'var(--shop-ink)',
                background: 'var(--shop-bg)',
              }}
            >
              <p
                className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.32em]"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                02 / Summary
              </p>
              <h3
                className="mt-4 font-[family:var(--font-kanit)] text-2xl font-black uppercase tracking-tight"
                style={{ color: 'var(--shop-ink)' }}
              >
                ยอดรวม
              </h3>

              <div
                aria-hidden
                className="mt-6 h-px w-full"
                style={{ background: 'var(--shop-border)' }}
              />

              <dl className="mt-6 space-y-4">
                <div className="flex items-baseline justify-between">
                  <dt
                    className="font-[family:var(--font-prompt)] text-sm"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    Subtotal
                  </dt>
                  <dd
                    className="font-[family:var(--font-kanit)] text-sm font-bold tracking-tight"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {formatTHB(subtotal)}
                  </dd>
                </div>

                {discountTotal > 0 && (
                  <div className="flex items-baseline justify-between">
                    <dt
                      className="font-[family:var(--font-prompt)] text-sm"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      ส่วนลด
                    </dt>
                    <dd
                      className="font-[family:var(--font-kanit)] text-sm font-bold tracking-tight"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      − {formatTHB(discountTotal)}
                    </dd>
                  </div>
                )}

                <div className="flex items-baseline justify-between">
                  <dt
                    className="font-[family:var(--font-prompt)] text-sm"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    ค่าจัดส่ง
                  </dt>
                  <dd
                    className="font-[family:var(--font-kanit)] text-sm font-bold tracking-tight"
                    style={{
                      color: shippingAfter === 0 ? 'var(--shop-ink)' : 'var(--shop-ink)',
                    }}
                  >
                    {shippingAfter === 0 ? 'ฟรี' : formatTHB(shippingAfter)}
                  </dd>
                </div>
              </dl>

              {/* ── Coupon block ─────────────────────────────── */}
              <div
                aria-hidden
                className="mt-7 h-px w-full"
                style={{ background: 'var(--shop-border)' }}
              />

              <div className="mt-6">
                <p
                  className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.28em]"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  โค้ดส่วนลด
                </p>

                {resolvedCoupons.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {resolvedCoupons.map((c) => (
                      <li
                        key={c.id}
                        className="inline-flex items-center gap-2 border px-3 py-1.5"
                        style={{ borderColor: 'var(--shop-ink)' }}
                      >
                        <span
                          className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.24em]"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          {c.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCode(c.code)}
                          aria-label={`ลบโค้ด ${c.code}`}
                          className="font-[family:var(--font-kanit)] text-sm leading-none"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form
                  className="mt-3 flex items-stretch border"
                  style={{ borderColor: 'var(--shop-ink)' }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!couponPending) void applyCode(couponInput);
                  }}
                >
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      if (couponError) setCouponError(null);
                    }}
                    placeholder="กรอกโค้ด"
                    aria-label="โค้ดส่วนลด"
                    className="flex-1 bg-transparent px-3 py-2 font-[family:var(--font-prompt)] text-sm placeholder:font-[family:var(--font-prompt)] placeholder:text-xs focus:outline-none"
                    style={{ color: 'var(--shop-ink)' }}
                  />
                  <button
                    type="submit"
                    disabled={couponPending || couponInput.trim().length === 0}
                    className="px-4 font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.24em] disabled:opacity-40"
                    style={{
                      background: 'var(--shop-ink)',
                      color: 'var(--shop-bg)',
                    }}
                  >
                    {couponPending ? '...' : 'ใช้'}
                  </button>
                </form>

                {couponError && (
                  <p
                    role="alert"
                    className="mt-2 font-[family:var(--font-prompt)] text-xs"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {couponError}
                  </p>
                )}
              </div>

              {/* ── Grand total ─────────────────────────────── */}
              <div
                aria-hidden
                className="mt-7 h-px w-full"
                style={{ background: 'var(--shop-ink)' }}
              />

              <div className="mt-6 flex items-baseline justify-between">
                <dt
                  className="font-[family:var(--font-kanit)] text-xs font-black uppercase tracking-[0.28em]"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  Total
                </dt>
                <dd
                  className="font-[family:var(--font-kanit)] text-3xl font-black tracking-tight"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {formatTHB(grandTotal)}
                </dd>
              </div>

              <Link
                href={`/stores/${store.slug}/checkout`}
                className="mt-8 inline-flex h-12 w-full items-center justify-center font-[family:var(--font-kanit)] text-[11px] font-black uppercase tracking-[0.28em] transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--shop-ink)',
                  color: 'var(--shop-bg)',
                }}
              >
                ไปชำระเงิน
              </Link>

              <p
                className="mt-4 text-center font-[family:var(--font-prompt)] text-[11px]"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                ชำระเงินปลอดภัยผ่าน Basketplace
              </p>
            </div>

            {/* Trust strip — three hairlines, all kanit micro-labels */}
            <ul
              className="mt-8 space-y-3 font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.24em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              <li className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-block h-px w-6"
                  style={{ background: 'var(--shop-ink-muted)' }}
                />
                จัดส่งภายใน 1–3 วันทำการ
              </li>
              <li className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-block h-px w-6"
                  style={{ background: 'var(--shop-ink-muted)' }}
                />
                เปลี่ยน/คืนสินค้าได้ภายใน 7 วัน
              </li>
              <li className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-block h-px w-6"
                  style={{ background: 'var(--shop-ink-muted)' }}
                />
                บรรจุภัณฑ์เรียบ มินิมัล ไม่ติดแบรนด์ภายนอก
              </li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CartPage;
