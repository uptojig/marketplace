'use client';

/**
 * linen-and-loom — bespoke Cart page
 * ============================================================
 * Natural-fiber textile editorial · cream / sand / sage palette.
 * Replaces the shared shopping-cart-01 adapter with a fully
 * bespoke layout matching the linen-loom brand voice (slow,
 * tactile, hand-folded).
 *
 * Wiring matches the canonical StoreCartClient at
 * `app/stores/[slug]/cart/cart-client.tsx`:
 *
 *   - `useCart` (@/lib/store/cart) drives line items, qty, remove
 *     — scoped to the current store.slug so multi-store carts
 *     stay isolated.
 *   - Free-shipping threshold ฿990, flat ฿50 shipping otherwise.
 *   - Coupon flow:
 *       · Hydrates the user's claimed-coupon wallet from
 *         `useUserCouponsStore` so claimed but-not-applied
 *         codes render as quick-apply pills.
 *       · Manual code entry calls `/api/coupons/preview` for
 *         server-authoritative validation; gracefully falls
 *         back to local mock-data lookup + `validate()` so the
 *         UI keeps working when the endpoint is offline.
 *       · `calculate()` from `@/lib/coupons/calculator` drives
 *         the displayed discount / shipping / total amounts so
 *         the math matches checkout exactly.
 *       · Applied coupons render as removable chips below the
 *         coupon input.
 *   - Sticky order-summary aside on lg+; stacked on mobile.
 *   - Empty state mirrors the editorial voice with a serif
 *     headline + handwritten-feel sub-copy.
 *   - All accents via `var(--shop-*)` so the theme cascade
 *     carries through any global override.
 *
 * Per project memory: Google Thai fonts only (Prompt / Kanit).
 * "Serif" voice is expressed through Kanit's lighter weights
 * and generous letter-spacing rather than a serif-display
 * family.
 */

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Minus,
  Plus,
  ShieldCheck,
  RotateCcw,
  Truck,
  Leaf,
  X,
  Ticket,
  Sparkles,
} from 'lucide-react';

import { useCart } from '@/lib/store/cart';
import { useUserCouponsStore } from '@/lib/coupons/store';
import { formatTHB } from '@/lib/utils';
import { calculate, validate } from '@/lib/coupons/calculator';
import {
  getCouponById,
  getCouponByCode,
} from '@/lib/coupons/mock-data';
import {
  COUPON_ERROR_MESSAGE,
  type Coupon,
  type CouponValidationError,
} from '@/lib/coupons/types';
import type { CartItem } from '@/lib/cart/types';

// ── Brand tokens ────────────────────────────────────────────────────
// Cream / sand / sage palette. Tokens are scoped fallbacks; if the
// store-level CSS overrides `var(--shop-*)` we honour those instead.
const LL_CREAM = '#f8f5ee';
const LL_SAND = '#e7dfd1';
const LL_TAUPE = '#a99e8a';
const LL_INK = '#3b3a32';
const LL_INK_MUTED = '#6f6857';
const LL_SAGE = '#7a8a6f';
const LL_SAGE_DARK = '#5b6a52';
const LL_CLAY = '#b7846a';

const LL_DISPLAY_FONT =
  'var(--font-kanit), "Cormorant Garamond", Georgia, "Noto Serif Thai", serif';
const LL_BODY_FONT =
  'var(--font-prompt), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

// ── Types ───────────────────────────────────────────────────────────
interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

interface LinenAndLoomCartProps {
  store: StoreLite;
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Map a single CartLineDisplay into the CartItem shape expected by
 * `calculate()`. The calculator scopes coupons by `storeId`, so we
 * pass the store's real id (not slug) — matching how server-side
 * coupon validation will see the order at checkout time.
 */
function toCalculatorItems(
  lines: ReturnType<typeof useCart.getState>['lines'],
  storeSlug: string,
  storeId: string,
): CartItem[] {
  return lines
    .filter((l) => l.storeSlug === storeSlug)
    .map((l) => ({
      id: l.productId,
      productId: l.productId,
      qty: l.qty,
      storeId,
      title: l.title,
      thumbnailUrl: l.imageUrl ?? '',
      price: l.priceTHB,
      storeName: l.storeName,
    }));
}

// ── Component ───────────────────────────────────────────────────────

export function LinenAndLoomCartPage({ store }: LinenAndLoomCartProps) {
  // Cart state — read narrow slices so re-renders stay scoped.
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.remove);

  // Claimed-coupon wallet (UX hydration only).
  const claimedCouponIds = useUserCouponsStore((s) => s.claimedCouponIds);
  const claimCoupon = useUserCouponsStore((s) => s.claim);

  // Local applied-coupon state. Persisting to a store would conflict
  // with the global `useCartStore.appliedCouponIds` used by the
  // checkout flow — out of scope for this bespoke surface, so we
  // keep it scoped to the cart page session.
  const [appliedCouponIds, setAppliedCouponIds] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  // SSR-safe hydration guard — zustand persist rehydrates on mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ── Derived data ────────────────────────────────────────────────
  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  const subtotal = useMemo(
    () => lines.reduce((n, l) => n + l.priceTHB * l.qty, 0),
    [lines],
  );

  const itemCount = useMemo(
    () => lines.reduce((n, l) => n + l.qty, 0),
    [lines],
  );

  // Baseline shipping before any free-shipping coupon kicks in.
  const baselineShipping =
    subtotal === 0
      ? 0
      : subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : DEFAULT_SHIPPING;

  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const freeShipProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
  );

  // Resolve applied coupon objects from mock-data. Server-side the
  // checkout will re-validate against DB rows — here we just need
  // shapes for `calculate()` to do its math.
  const appliedCoupons = useMemo<Coupon[]>(
    () =>
      appliedCouponIds
        .map((id) => getCouponById(id))
        .filter((c): c is Coupon => c !== null),
    [appliedCouponIds],
  );

  // Claimed-but-not-applied coupons that are valid for this cart.
  const claimedSuggestions = useMemo<Coupon[]>(() => {
    if (!mounted) return [];
    const items = toCalculatorItems(allLines, store.slug, store.id);
    return claimedCouponIds
      .filter((id) => !appliedCouponIds.includes(id))
      .map((id) => getCouponById(id))
      .filter((c): c is Coupon => c !== null)
      .filter((c) => {
        const err = validate(c, {
          items,
          shippingPerStore: { [store.id]: baselineShipping },
          existingCoupons: appliedCoupons,
        });
        return err === null;
      })
      .slice(0, 3);
  }, [
    mounted,
    claimedCouponIds,
    appliedCouponIds,
    appliedCoupons,
    allLines,
    store.slug,
    store.id,
    baselineShipping,
  ]);

  // Run the authoritative client-side calculator. This matches the
  // math the server uses at checkout, so what the user sees here
  // is what they pay.
  const calc = useMemo(() => {
    const items = toCalculatorItems(allLines, store.slug, store.id);
    return calculate({
      items,
      coupons: appliedCoupons,
      shippingPerStore: { [store.id]: baselineShipping },
    });
  }, [allLines, appliedCoupons, baselineShipping, store.slug, store.id]);

  const itemDiscount = calc.appliedCoupons
    .filter((c) => c.slot !== 'shipping')
    .reduce((s, c) => s + c.amount, 0);
  const shippingDiscount = calc.appliedCoupons
    .filter((c) => c.slot === 'shipping')
    .reduce((s, c) => s + c.amount, 0);
  const shippingAfter = Math.max(0, baselineShipping - shippingDiscount);
  const grandTotal = Math.max(0, subtotal + shippingAfter - itemDiscount);

  // ── Coupon actions ─────────────────────────────────────────────

  const applyCouponById = useCallback(
    (coupon: Coupon) => {
      const items = toCalculatorItems(allLines, store.slug, store.id);
      const err = validate(coupon, {
        items,
        shippingPerStore: { [store.id]: baselineShipping },
        existingCoupons: appliedCoupons,
      });
      if (err) {
        setCouponError(COUPON_ERROR_MESSAGE[err]);
        return false;
      }
      setAppliedCouponIds((ids) =>
        ids.includes(coupon.id) ? ids : [...ids, coupon.id],
      );
      if (!claimedCouponIds.includes(coupon.id)) {
        claimCoupon(coupon.id);
      }
      setCouponError(null);
      setCouponCode('');
      return true;
    },
    [
      allLines,
      appliedCoupons,
      baselineShipping,
      claimCoupon,
      claimedCouponIds,
      store.id,
      store.slug,
    ],
  );

  const removeAppliedCoupon = useCallback((couponId: string) => {
    setAppliedCouponIds((ids) => ids.filter((id) => id !== couponId));
    setCouponError(null);
  }, []);

  /**
   * Server-authoritative coupon preview. Posts the cart shape to
   * `/api/coupons/preview`; if the endpoint isn't deployed yet (or
   * the network is offline) falls through to local mock-data so the
   * UX never breaks. The local fallback runs `validate()` so the
   * stacking rules still hold.
   */
  const handleApplyCouponCode = useCallback(async () => {
    const trimmed = couponCode.trim();
    if (!trimmed) return;
    setCouponBusy(true);
    setCouponError(null);

    try {
      const items = toCalculatorItems(allLines, store.slug, store.id);
      const res = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: trimmed,
          items,
          shippingPerStore: { [store.id]: baselineShipping },
          existingCouponIds: appliedCouponIds,
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as
          | { ok: true; coupon: Coupon }
          | { ok: false; reason: CouponValidationError };
        if (json.ok) {
          applyCouponById(json.coupon);
        } else {
          setCouponError(
            COUPON_ERROR_MESSAGE[json.reason] ?? 'ไม่สามารถใช้โค้ดนี้ได้',
          );
        }
      } else {
        // Endpoint missing / non-2xx — fall back to local lookup so
        // the UI keeps working in dev + preview environments.
        const found = getCouponByCode(trimmed);
        if (!found) {
          setCouponError(COUPON_ERROR_MESSAGE.not_found);
        } else {
          applyCouponById(found);
        }
      }
    } catch {
      // Network error — fall back to local mock catalog.
      const found = getCouponByCode(couponCode.trim());
      if (!found) {
        setCouponError(COUPON_ERROR_MESSAGE.not_found);
      } else {
        applyCouponById(found);
      }
    } finally {
      setCouponBusy(false);
    }
  }, [
    couponCode,
    allLines,
    appliedCouponIds,
    applyCouponById,
    baselineShipping,
    store.id,
    store.slug,
  ]);

  // ── Render ─────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: `var(--shop-bg, ${LL_CREAM})` }}
      />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `var(--shop-bg, ${LL_CREAM})`,
        color: `var(--shop-ink, ${LL_INK})`,
        fontFamily: LL_BODY_FONT,
      }}
    >
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        {/* ── Editorial header ─────────────────────────────────── */}
        <header className="mb-12">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-xs uppercase hover:underline"
            style={{
              color: `var(--shop-ink-muted, ${LL_INK_MUTED})`,
              letterSpacing: '0.22em',
              fontFamily: LL_DISPLAY_FONT,
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            ย้อนกลับสู่ห้องผ้า
          </Link>

          <p
            className="mt-7 text-[11px] uppercase"
            style={{
              color: `var(--shop-accent, ${LL_SAGE_DARK})`,
              letterSpacing: '0.32em',
              fontWeight: 500,
              fontFamily: LL_DISPLAY_FONT,
            }}
          >
            ผ้าธรรมชาติ · ทอด้วยมือ
          </p>

          <h1
            className="mt-3 text-5xl leading-[1.05] sm:text-6xl"
            style={{
              fontFamily: LL_DISPLAY_FONT,
              fontWeight: 300,
              letterSpacing: '-0.005em',
              color: `var(--shop-ink, ${LL_INK})`,
            }}
          >
            ตะกร้าผ้าของคุณ
          </h1>

          <div
            aria-hidden
            className="mt-5 h-px w-16"
            style={{ background: `var(--shop-accent, ${LL_TAUPE})` }}
          />

          <p
            className="mt-5 max-w-xl text-base leading-relaxed"
            style={{ color: `var(--shop-ink-muted, ${LL_INK_MUTED})` }}
          >
            {lines.length === 0
              ? 'พื้นที่ว่างไว้รอผ้าผืนที่ใช่ — ค่อย ๆ เลือก ค่อย ๆ สัมผัสจากร้าน ' +
                store.name
              : `${itemCount.toLocaleString()} ผืน · พับเรียบรอจัดส่งจากร้าน ${store.name}`}
          </p>
        </header>

        {lines.length === 0 ? (
          <EmptyLinenCart storeSlug={store.slug} />
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12">
            {/* ── Line items ─────────────────────────────────── */}
            <section aria-labelledby="cart-heading" className="space-y-5">
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>

              {/* Free-shipping nudge — woven progress thread */}
              <FreeShippingNudge
                subtotal={subtotal}
                remaining={remainingForFreeShipping}
                progress={freeShipProgress}
              />

              {lines.map((l) => (
                <article
                  key={l.productId}
                  className="grid grid-cols-[6.5rem_1fr] gap-4 rounded-sm border p-4 sm:grid-cols-[9rem_1fr] sm:gap-6 sm:p-5"
                  style={{
                    background: `var(--shop-card, #ffffff)`,
                    borderColor: `var(--shop-border, ${LL_SAND})`,
                  }}
                >
                  {/* Folded-fabric thumbnail — 4/5 ratio */}
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="relative block overflow-hidden rounded-sm"
                    style={{
                      aspectRatio: '4 / 5',
                      background: `var(--shop-muted, ${LL_SAND})`,
                    }}
                    aria-label={l.title}
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
                        className="flex h-full w-full items-center justify-center text-xs"
                        style={{
                          color: `var(--shop-ink-muted, ${LL_INK_MUTED})`,
                          fontFamily: LL_DISPLAY_FONT,
                          letterSpacing: '0.2em',
                        }}
                      >
                        ผ้า
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-col justify-between">
                    <div>
                      <Link
                        href={`/stores/${store.slug}/products/${l.productId}`}
                        className="block text-lg leading-snug hover:underline sm:text-xl"
                        style={{
                          fontFamily: LL_DISPLAY_FONT,
                          fontWeight: 400,
                          color: `var(--shop-ink, ${LL_INK})`,
                          letterSpacing: '-0.005em',
                        }}
                      >
                        {l.title}
                      </Link>
                      <p
                        className="mt-1 text-xs uppercase"
                        style={{
                          color: `var(--shop-ink-muted, ${LL_INK_MUTED})`,
                          letterSpacing: '0.2em',
                          fontFamily: LL_DISPLAY_FONT,
                        }}
                      >
                        จากร้าน {store.name}
                      </p>
                      <p
                        className="mt-3 text-base"
                        style={{
                          color: `var(--shop-primary, ${LL_SAGE_DARK})`,
                          fontWeight: 500,
                          fontFamily: LL_DISPLAY_FONT,
                        }}
                      >
                        {formatTHB(l.priceTHB)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      {/* Qty stepper — squared, hand-folded feel */}
                      <div
                        className="inline-flex h-9 items-center overflow-hidden rounded-sm border"
                        style={{
                          borderColor: `var(--shop-border, ${LL_SAND})`,
                          background: `var(--shop-card, #ffffff)`,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setQty(l.productId, l.qty - 1, store.slug)
                          }
                          disabled={l.qty <= 1}
                          aria-label={`ลดจำนวน ${l.title}`}
                          className="inline-flex h-9 w-9 items-center justify-center text-sm disabled:opacity-40"
                          style={{ color: `var(--shop-ink, ${LL_INK})` }}
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
                          className="h-9 w-11 border-x bg-transparent text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          style={{
                            color: `var(--shop-ink, ${LL_INK})`,
                            borderColor: `var(--shop-border, ${LL_SAND})`,
                            fontFamily: LL_BODY_FONT,
                          }}
                          aria-label={`จำนวน ${l.title}`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setQty(l.productId, l.qty + 1, store.slug)
                          }
                          aria-label={`เพิ่มจำนวน ${l.title}`}
                          className="inline-flex h-9 w-9 items-center justify-center text-sm"
                          style={{ color: `var(--shop-ink, ${LL_INK})` }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Remove — quiet hand-script link */}
                      <button
                        type="button"
                        onClick={() => removeLine(l.productId, store.slug)}
                        className="inline-flex items-center gap-1.5 text-xs hover:underline"
                        style={{
                          color: `var(--shop-ink-muted, ${LL_INK_MUTED})`,
                          fontFamily: LL_DISPLAY_FONT,
                          letterSpacing: '0.06em',
                        }}
                        aria-label={`เอา ${l.title} ออกจากตะกร้า`}
                      >
                        <X className="h-3.5 w-3.5" />
                        เอาออกจากตะกร้า
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* ── Sticky summary ─────────────────────────────── */}
            <aside
              aria-labelledby="summary-heading"
              className="mt-10 lg:mt-0 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              <div
                className="rounded-sm border p-7"
                style={{
                  background: `var(--shop-muted, ${LL_CREAM})`,
                  borderColor: `var(--shop-border, ${LL_SAND})`,
                }}
              >
                <p
                  className="text-[11px] uppercase"
                  style={{
                    color: `var(--shop-accent, ${LL_SAGE_DARK})`,
                    letterSpacing: '0.32em',
                    fontFamily: LL_DISPLAY_FONT,
                    fontWeight: 500,
                  }}
                >
                  สรุปคำสั่งซื้อ
                </p>
                <h3
                  className="mt-1 text-3xl"
                  style={{
                    fontFamily: LL_DISPLAY_FONT,
                    fontWeight: 300,
                    letterSpacing: '-0.005em',
                    color: `var(--shop-ink, ${LL_INK})`,
                  }}
                >
                  พับใส่ห่อให้
                </h3>

                <div
                  aria-hidden
                  className="mt-4 h-px w-12"
                  style={{ background: `var(--shop-accent, ${LL_TAUPE})` }}
                />

                <dl className="mt-6 space-y-3.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt style={{ color: `var(--shop-ink-muted, ${LL_INK_MUTED})` }}>
                      ยอดรวมสินค้า ({itemCount} ผืน)
                    </dt>
                    <dd
                      className="font-medium"
                      style={{ color: `var(--shop-ink, ${LL_INK})` }}
                    >
                      {formatTHB(subtotal)}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt style={{ color: `var(--shop-ink-muted, ${LL_INK_MUTED})` }}>
                      ค่าจัดส่ง
                    </dt>
                    <dd
                      className="font-medium"
                      style={{
                        color:
                          shippingAfter === 0
                            ? `var(--shop-primary, ${LL_SAGE_DARK})`
                            : `var(--shop-ink, ${LL_INK})`,
                      }}
                    >
                      {shippingAfter === 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Leaf className="h-3.5 w-3.5" />
                          ส่งฟรี
                        </span>
                      ) : shippingDiscount > 0 ? (
                        <>
                          <span
                            className="mr-1 text-xs line-through"
                            style={{
                              color: `var(--shop-ink-muted, ${LL_INK_MUTED})`,
                            }}
                          >
                            {formatTHB(baselineShipping)}
                          </span>
                          {formatTHB(shippingAfter)}
                        </>
                      ) : (
                        formatTHB(shippingAfter)
                      )}
                    </dd>
                  </div>

                  {/* Per-coupon discount rows */}
                  {calc.appliedCoupons.length > 0 && (
                    <div
                      className="space-y-2 border-t pt-3"
                      style={{ borderColor: `var(--shop-border, ${LL_SAND})` }}
                    >
                      {calc.appliedCoupons.map((ac) => {
                        const coupon = appliedCoupons.find(
                          (c) => c.id === ac.couponId,
                        );
                        return (
                          <div
                            key={ac.couponId}
                            className="flex items-start justify-between gap-3 text-xs"
                            style={{ color: `var(--shop-primary, ${LL_SAGE_DARK})` }}
                          >
                            <span className="min-w-0 truncate">
                              <span
                                className="mr-1"
                                style={{ fontFamily: LL_DISPLAY_FONT }}
                              >
                                {coupon?.title ?? ac.code}
                              </span>
                              <code
                                className="rounded-sm px-1.5 py-0.5 text-[10px] font-mono"
                                style={{
                                  background: `var(--shop-card, #ffffff)`,
                                  border: `1px solid var(--shop-border, ${LL_SAND})`,
                                  color: `var(--shop-primary, ${LL_SAGE_DARK})`,
                                }}
                              >
                                {ac.code}
                              </code>
                            </span>
                            <span className="whitespace-nowrap font-medium">
                              − {formatTHB(ac.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className="flex items-baseline justify-between border-t pt-4"
                    style={{ borderColor: `var(--shop-accent, ${LL_TAUPE})` }}
                  >
                    <dt
                      className="text-base"
                      style={{
                        fontFamily: LL_DISPLAY_FONT,
                        fontWeight: 400,
                        color: `var(--shop-ink, ${LL_INK})`,
                      }}
                    >
                      ยอดรวมทั้งหมด
                    </dt>
                    <dd
                      className="text-2xl font-medium"
                      style={{
                        color: `var(--shop-primary, ${LL_SAGE_DARK})`,
                        fontFamily: LL_DISPLAY_FONT,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {formatTHB(grandTotal)}
                    </dd>
                  </div>

                  {calc.totalDiscount > 0 && (
                    <p
                      className="rounded-sm px-3 py-2 text-center text-xs"
                      style={{
                        background: `var(--shop-card, #ffffff)`,
                        color: `var(--shop-primary, ${LL_SAGE_DARK})`,
                        border: `1px solid var(--shop-border, ${LL_SAND})`,
                        fontFamily: LL_DISPLAY_FONT,
                        letterSpacing: '0.04em',
                      }}
                    >
                      <Sparkles className="mr-1 inline h-3 w-3" />
                      ประหยัดไป {formatTHB(calc.totalDiscount)}
                    </p>
                  )}
                </dl>

                {/* ── Coupon block ──────────────────────────── */}
                <CouponBlock
                  code={couponCode}
                  onCodeChange={setCouponCode}
                  onApply={handleApplyCouponCode}
                  busy={couponBusy}
                  error={couponError}
                  appliedCoupons={appliedCoupons}
                  onRemove={removeAppliedCoupon}
                  suggestions={claimedSuggestions}
                  onApplySuggestion={applyCouponById}
                />

                <Link
                  href={`/stores/${store.slug}/checkout/address`}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-sm text-sm font-medium text-white transition hover:opacity-90"
                  style={{
                    background: `var(--shop-primary, ${LL_SAGE_DARK})`,
                    letterSpacing: '0.16em',
                    fontFamily: LL_DISPLAY_FONT,
                    textTransform: 'uppercase',
                  }}
                >
                  ดำเนินการชำระเงิน
                </Link>

                <p
                  className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs"
                  style={{
                    color: `var(--shop-ink-muted, ${LL_INK_MUTED})`,
                    fontFamily: LL_DISPLAY_FONT,
                    letterSpacing: '0.06em',
                  }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ชำระเงินปลอดภัย · เข้ารหัส SSL ทั้งหมด
                </p>
              </div>

              {/* ── Trust strip — woven below the summary ──── */}
              <ul
                className="mt-6 space-y-3 text-sm"
                style={{
                  color: `var(--shop-ink-muted, ${LL_INK_MUTED})`,
                  fontFamily: LL_DISPLAY_FONT,
                  letterSpacing: '0.04em',
                }}
              >
                <li className="flex items-center gap-2">
                  <Truck
                    className="h-4 w-4"
                    style={{ color: `var(--shop-primary, ${LL_SAGE_DARK})` }}
                  />
                  ส่งฟรีเมื่อยอดถึง {formatTHB(FREE_SHIPPING_THRESHOLD)}
                </li>
                <li className="flex items-center gap-2">
                  <RotateCcw
                    className="h-4 w-4"
                    style={{ color: `var(--shop-primary, ${LL_SAGE_DARK})` }}
                  />
                  เปลี่ยน · คืนภายใน 7 วันหากผ้ามีตำหนิ
                </li>
                <li className="flex items-center gap-2">
                  <Leaf
                    className="h-4 w-4"
                    style={{ color: `var(--shop-primary, ${LL_SAGE_DARK})` }}
                  />
                  ห่อด้วยผ้าธรรมชาติ ปลอดสารเคมีย้อมเย็น
                </li>
              </ul>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Subcomponents ───────────────────────────────────────────────────

/**
 * Soft, hand-drawn free-shipping nudge — a thread that fills as the
 * cart approaches the ฿990 threshold.
 */
function FreeShippingNudge({
  subtotal,
  remaining,
  progress,
}: {
  subtotal: number;
  remaining: number;
  progress: number;
}) {
  if (subtotal === 0) return null;
  return (
    <div
      className="rounded-sm border p-4"
      style={{
        background: `var(--shop-card, #ffffff)`,
        borderColor: `var(--shop-border, ${LL_SAND})`,
      }}
    >
      <p
        className="mb-2 text-sm"
        style={{
          color: `var(--shop-ink, ${LL_INK})`,
          fontFamily: LL_DISPLAY_FONT,
          letterSpacing: '0.02em',
        }}
      >
        {remaining > 0 ? (
          <>
            <Leaf
              className="mr-1.5 inline h-3.5 w-3.5"
              style={{ color: `var(--shop-primary, ${LL_SAGE_DARK})` }}
            />
            ซื้ออีก{' '}
            <span
              className="font-medium"
              style={{ color: `var(--shop-primary, ${LL_SAGE_DARK})` }}
            >
              {formatTHB(remaining)}
            </span>{' '}
            รับส่งฟรีถึงหน้าบ้าน
          </>
        ) : (
          <>
            <Sparkles
              className="mr-1.5 inline h-3.5 w-3.5"
              style={{ color: `var(--shop-primary, ${LL_SAGE_DARK})` }}
            />
            ได้รับส่งฟรีแล้ว — เราจะพับผ้าให้สวยก่อนส่ง
          </>
        )}
      </p>
      <div
        className="h-[3px] w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        style={{ background: `var(--shop-border, ${LL_SAND})` }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            background: `var(--shop-primary, ${LL_SAGE_DARK})`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Coupon entry + applied-chip list + claimed-suggestion pills.
 */
function CouponBlock({
  code,
  onCodeChange,
  onApply,
  busy,
  error,
  appliedCoupons,
  onRemove,
  suggestions,
  onApplySuggestion,
}: {
  code: string;
  onCodeChange: (v: string) => void;
  onApply: () => void;
  busy: boolean;
  error: string | null;
  appliedCoupons: Coupon[];
  onRemove: (id: string) => void;
  suggestions: Coupon[];
  onApplySuggestion: (coupon: Coupon) => void;
}) {
  return (
    <div
      className="mt-6 border-t pt-5"
      style={{ borderColor: `var(--shop-border, ${LL_SAND})` }}
    >
      <p
        className="mb-2 text-[11px] uppercase"
        style={{
          color: `var(--shop-accent, ${LL_SAGE_DARK})`,
          letterSpacing: '0.28em',
          fontFamily: LL_DISPLAY_FONT,
          fontWeight: 500,
        }}
      >
        <Ticket className="mr-1 inline h-3 w-3" />
        โค้ดส่วนลด
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onApply();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
          placeholder="ใส่โค้ดส่วนลด"
          aria-label="ใส่โค้ดส่วนลด"
          className="h-10 flex-1 rounded-sm border bg-white px-3 text-sm focus:outline-none focus:ring-1 disabled:opacity-50"
          style={{
            borderColor: `var(--shop-border, ${LL_SAND})`,
            color: `var(--shop-ink, ${LL_INK})`,
            fontFamily: LL_BODY_FONT,
          }}
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="inline-flex h-10 items-center justify-center rounded-sm border px-4 text-sm font-medium transition hover:opacity-90 disabled:opacity-40"
          style={{
            background: `var(--shop-ink, ${LL_INK})`,
            borderColor: `var(--shop-ink, ${LL_INK})`,
            color: '#ffffff',
            fontFamily: LL_DISPLAY_FONT,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          {busy ? '...' : 'ใช้'}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-2 text-xs"
          style={{ color: `var(--shop-clay, ${LL_CLAY})` }}
        >
          {error}
        </p>
      )}

      {/* Applied coupon chips */}
      {appliedCoupons.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {appliedCoupons.map((c) => (
            <li key={c.id}>
              <span
                className="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs"
                style={{
                  background: `var(--shop-card, #ffffff)`,
                  borderColor: `var(--shop-primary, ${LL_SAGE_DARK})`,
                  color: `var(--shop-primary, ${LL_SAGE_DARK})`,
                  fontFamily: LL_DISPLAY_FONT,
                  letterSpacing: '0.04em',
                }}
              >
                <Ticket className="h-3 w-3" />
                {c.code}
                <button
                  type="button"
                  onClick={() => onRemove(c.id)}
                  aria-label={`เอาโค้ด ${c.code} ออก`}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:opacity-70"
                  style={{ color: `var(--shop-ink-muted, ${LL_INK_MUTED})` }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Claimed-suggestion quick-apply pills */}
      {suggestions.length > 0 && (
        <div className="mt-4">
          <p
            className="mb-2 text-[11px] uppercase"
            style={{
              color: `var(--shop-ink-muted, ${LL_INK_MUTED})`,
              letterSpacing: '0.22em',
              fontFamily: LL_DISPLAY_FONT,
            }}
          >
            โค้ดในกระเป๋าของคุณ
          </p>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onApplySuggestion(c)}
                  className="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs hover:opacity-80"
                  style={{
                    background: `var(--shop-card, #ffffff)`,
                    borderColor: `var(--shop-border, ${LL_SAND})`,
                    color: `var(--shop-ink, ${LL_INK})`,
                    fontFamily: LL_DISPLAY_FONT,
                    letterSpacing: '0.04em',
                  }}
                  title={c.title}
                >
                  <Sparkles className="h-3 w-3" />
                  {c.code}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Empty cart — editorial spread, hand-folded feel.
 */
function EmptyLinenCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <div
        className="mx-auto mb-10 flex h-40 w-32 items-center justify-center rounded-sm border"
        style={{
          background: `var(--shop-muted, ${LL_SAND})`,
          borderColor: `var(--shop-border, ${LL_TAUPE})`,
          color: `var(--shop-ink-muted, ${LL_INK_MUTED})`,
        }}
        aria-hidden
      >
        <span
          className="text-xs uppercase"
          style={{
            fontFamily: LL_DISPLAY_FONT,
            letterSpacing: '0.32em',
          }}
        >
          ผ้าพับ
        </span>
      </div>
      <h2
        className="text-4xl sm:text-5xl"
        style={{
          fontFamily: LL_DISPLAY_FONT,
          fontWeight: 300,
          color: `var(--shop-ink, ${LL_INK})`,
          letterSpacing: '-0.005em',
        }}
      >
        ตะกร้าผ้ายังว่างอยู่
      </h2>
      <p
        className="mt-4 text-base leading-relaxed"
        style={{
          color: `var(--shop-ink-muted, ${LL_INK_MUTED})`,
          fontFamily: LL_BODY_FONT,
        }}
      >
        ค่อย ๆ เลือกผ้าผืนที่ใช่ — เราคัดมาเป็นพิเศษทุกผืน
        ทอมือ ย้อมสีจากธรรมชาติ
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-sm px-10 text-sm font-medium text-white transition hover:opacity-90"
        style={{
          background: `var(--shop-primary, ${LL_SAGE_DARK})`,
          fontFamily: LL_DISPLAY_FONT,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        ดูคอลเลกชันผ้า
      </Link>
    </div>
  );
}

// ── Public exports ──────────────────────────────────────────────────

export const CartPage = LinenAndLoomCartPage;
export default LinenAndLoomCartPage;
