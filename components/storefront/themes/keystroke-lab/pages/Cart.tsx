'use client';

/**
 * keystroke-lab — bespoke Cart page (electronics-tech · keyboard maker)
 *
 * Aesthetic: mechanical keyboard lab · ASCII grid · mono spec rows ·
 * dark surface with high-contrast cyan accents that switch to a light
 * "datasheet" panel for the summary. Layout reads like the spec card
 * on the Homepage / PDP so the cart feels like a continuation of the
 * comparison flow rather than a generic Tailwind UI dump.
 *
 * Coupon flow:
 *   - Hydrates claimed coupons from `useUserCouponsStore`.
 *   - Apply path: POST /api/coupons/preview { code, items, shippingPerStore }
 *     returns { ok, coupon? | reason? }. On ok, the coupon object is
 *     added to local state and persisted via `claim`.
 *   - calculate() from @/lib/coupons/calculator is the single source of
 *     truth for subtotal · discount · grand total. Free-shipping coupons
 *     zero out the per-store shipping entry in-place.
 *   - Remove path: unclaim + drop from local applied list.
 *
 * Wiring:
 *   - `useCart` is the active per-store storefront cart (shared with
 *     ShopHeader); filtered by `store.slug` so other stores' lines do
 *     not bleed in.
 *   - Free-ship threshold 990 THB · default shipping 50 THB.
 *   - All accents via var(--shop-*) so the theme cascade carries. The
 *     dark "lab" surface comes from explicit zinc tokens since this
 *     theme is locked to its own palette (mech keyboard product page).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { useUserCouponsStore } from '@/lib/coupons/store';
import { calculate } from '@/lib/coupons/calculator';
import { formatTHB } from '@/lib/utils';
import type { Coupon } from '@/lib/coupons/types';
import type { CartItem as CalcCartItem } from '@/lib/cart/types';

import type { CartProps as ScaffoldCartProps } from '@/lib/templates/types';

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

interface CartItemProp {
  id: string;
  title: string;
  priceTHB: number;
  imageUrl?: string | null;
  quantity: number;
  variantLabel?: string | null;
}

// Re-export the canonical scaffold `CartProps` so the registry's
// `ComponentType<CartProps>` slot accepts this component. The component
// itself only reads `store.slug` (lines come from the zustand store on
// mount), so the canonical `items: CartLineItem[]` field is ignored.
export type CartProps = ScaffoldCartProps;

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

/** Build a stable SKU from a productId — mirrors the keystroke-lab
 *  PDP / Homepage spec-row convention so the same product carries the
 *  same display SKU in the cart. */
function labSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `KL-${hash}`;
}

export function KeystrokeLabCart({ store }: CartProps) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const claimedIds = useUserCouponsStore((s) => s.claimedCouponIds);
  const claim = useUserCouponsStore((s) => s.claim);
  const unclaim = useUserCouponsStore((s) => s.unclaim);

  // SSR / hydration guard — zustand's persist middleware reads from
  // localStorage on first client render and would otherwise produce a
  // server/client tree mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Coupon state — hydrated once on mount from the wallet store, then
  // re-validated server-side as the cart subtotal moves. Each item in
  // `appliedCoupons` is the full Coupon shape returned by /preview, so
  // we can feed it straight into calculate().
  const [appliedCoupons, setAppliedCoupons] = useState<Coupon[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const hydratedRef = useRef(false);

  // Filter to lines that belong to THIS store (per-store cart isolation
  // — see lib/store/cart.ts notes).
  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  // Build the calculator-shaped items array once per render. The
  // calculator's CartItem is denormalized and stricter than the
  // display-cart line, so we shim missing fields with sane defaults.
  const calcItems: CalcCartItem[] = useMemo(
    () =>
      lines.map((l) => ({
        id: l.productId,
        productId: l.productId,
        qty: l.qty,
        storeId: store.id,
        title: l.title,
        thumbnailUrl: l.imageUrl ?? '',
        price: l.priceTHB,
        storeName: store.name,
      })),
    [lines, store.id, store.name],
  );

  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  // Base shipping (pre-coupon) — flat fee unless subtotal meets the
  // free-ship threshold. Free-shipping coupons further zero this out.
  const rawSubtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const baseShipping =
    rawSubtotal >= FREE_SHIPPING_THRESHOLD || lines.length === 0
      ? 0
      : DEFAULT_SHIPPING;
  const shippingPerStore = useMemo(
    () => ({ [store.id]: baseShipping }),
    [store.id, baseShipping],
  );

  // Calculator is the single source of truth for totals. Empty applied
  // list → just returns the bare subtotal + shipping.
  const calc = useMemo(
    () =>
      calculate({
        items: calcItems,
        coupons: appliedCoupons,
        shippingPerStore,
      }),
    [calcItems, appliedCoupons, shippingPerStore],
  );

  const effectiveShipping = calc.shippingAfterDiscount[store.id] ?? baseShipping;
  const remainingForFreeShip = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - rawSubtotal,
  );
  const freeShipProgress = Math.min(
    100,
    Math.round((rawSubtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  // ── Hydrate claimed coupons on mount ──────────────────────────────
  // Walk each claimed coupon id through /api/coupons/preview so we get
  // the canonical Coupon object back (and silently drop any that no
  // longer validate against the current cart — e.g. expired or no
  // eligible items).
  useEffect(() => {
    if (!mounted || hydratedRef.current) return;
    hydratedRef.current = true;
    if (claimedIds.length === 0) return;

    let cancelled = false;
    const hydrate = async () => {
      const next: Coupon[] = [];
      for (const couponId of claimedIds) {
        try {
          const res = await fetch('/api/coupons/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              couponId,
              items: calcItems,
              shippingPerStore,
              existingCouponIds: next.map((c) => c.id),
            }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          if (data?.ok && data.coupon) {
            next.push(data.coupon as Coupon);
          } else {
            // Drop stale coupons quietly so the wallet stays clean.
            unclaim(couponId);
          }
        } catch {
          // Network blip — leave the claim in place, retry on next mount.
        }
      }
      if (!cancelled) setAppliedCoupons(next);
    };
    hydrate();
    return () => {
      cancelled = true;
    };
    // We intentionally only run this once after mount — the canonical
    // wallet contents on first paint. Subsequent applies / removes are
    // driven by the dedicated handlers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // ── Apply a coupon code ───────────────────────────────────────────
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          items: calcItems,
          shippingPerStore,
          existingCouponIds: appliedCoupons.map((c) => c.id),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data.coupon) {
        setCouponError(data?.message ?? data?.reason ?? 'COUPON.INVALID');
        return;
      }
      const coupon = data.coupon as Coupon;
      setAppliedCoupons((prev) => [...prev, coupon]);
      claim(coupon.id);
      setCouponInput('');
    } catch {
      setCouponError('NETWORK.ERROR');
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Remove an applied coupon ──────────────────────────────────────
  const handleRemoveCoupon = (couponId: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.id !== couponId));
    unclaim(couponId);
  };

  if (!mounted) {
    // Skeleton matches the post-mount frame height to avoid CLS.
    return (
      <div className="min-h-screen bg-[#020617] text-[#e2e8f0]">
        <div className="mx-auto max-w-7xl px-4 py-16 min-h-[60vh]" />
      </div>
    );
  }

  // ── EMPTY STATE ──────────────────────────────────────────────────
  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-[#020617] text-[#e2e8f0]">
        {/* ASCII grid backdrop */}
        <div className="relative overflow-hidden border-b border-[#1e293b]">
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"
          />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center">
            <p className="font-[family:var(--font-prompt)] text-xs text-[#22d3ee] tracking-[0.24em] uppercase mb-4">
              CART · STATUS_EMPTY
            </p>
            <h1 className="font-[family:var(--font-prompt)] text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              ตะกร้ายังว่าง
            </h1>
            <p className="font-[family:var(--font-kanit)] text-base text-[#94a3b8] max-w-md mx-auto mb-10 font-light">
              เลือกสวิตช์ คีย์บอร์ด และเมาส์ที่ใช่ก่อนกลับมาเช็คเอาท์
            </p>

            {/* ASCII-grid empty card */}
            <div className="mx-auto max-w-md border border-[#1e293b] bg-[#0f172a]/60 backdrop-blur-md p-8 mb-8">
              <pre className="font-[family:var(--font-prompt)] text-[10px] leading-tight text-[#475569] tracking-[0.16em] select-none">{`╔════════════════════════════╗
║                            ║
║       [  N O   I T E M S ]       ║
║                            ║
║   AWAITING_INPUT > > > > _ ║
║                            ║
╚════════════════════════════╝`}</pre>
            </div>

            <Link
              href={`/stores/${store.slug}/products`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#22d3ee] text-[#020617] font-[family:var(--font-prompt)] font-bold uppercase tracking-[0.12em] hover:bg-white transition-all"
              style={{ background: 'var(--shop-primary, #22d3ee)' }}
            >
              เลือกซื้อสินค้า
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── FULL CART ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617] text-[#e2e8f0]">
      {/* Hero band with ASCII grid + breadcrumb */}
      <section className="relative overflow-hidden border-b border-[#1e293b]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"
        />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent opacity-50" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <Link
            href={`/stores/${store.slug}/products`}
            className="inline-flex items-center gap-2 font-[family:var(--font-prompt)] text-xs text-[#64748b] tracking-[0.16em] uppercase hover:text-[#22d3ee] transition-colors mb-4"
          >
            <span aria-hidden>←</span> เลือกซื้อต่อ
          </Link>
          <p
            className="font-[family:var(--font-prompt)] text-[11px] text-[#22d3ee] tracking-[0.24em] uppercase mb-3"
            style={{ color: 'var(--shop-accent, #22d3ee)' }}
          >
            CART · {String(itemCount).padStart(2, '0')} ITEM
            {itemCount === 1 ? '' : 'S'}
          </p>
          <h1 className="font-[family:var(--font-prompt)] text-3xl md:text-5xl font-bold tracking-tight text-white">
            ตะกร้าสินค้า
          </h1>
          <p className="mt-2 font-[family:var(--font-kanit)] text-sm text-[#94a3b8] font-light">
            {itemCount.toLocaleString()} ชิ้น · จาก {store.name}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* ── ITEMS ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="cart-items-heading"
          className="lg:col-span-7"
        >
          <h2 id="cart-items-heading" className="sr-only">
            สินค้าในตะกร้า
          </h2>

          {/* ASCII column header — Item / Qty / Price / Subtotal */}
          <div className="grid grid-cols-[1fr_5rem_5rem_5rem] gap-3 border-y border-[#1e293b] py-2 px-1 font-[family:var(--font-prompt)] text-[10px] text-[#64748b] tracking-[0.16em] uppercase">
            <span>{'// ITEM'}</span>
            <span className="text-center">{'// QTY'}</span>
            <span className="text-right">{'// UNIT'}</span>
            <span className="text-right">{'// SUM'}</span>
          </div>

          <ul className="divide-y divide-[#1e293b]">
            {lines.map((l) => (
              <li
                key={l.productId}
                className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-4 py-6"
              >
                {/* Thumb panel — boxed lab swatch */}
                <Link
                  href={`/stores/${store.slug}/products/${l.productId}`}
                  className="block h-28 w-28 border border-[#1e293b] bg-[#0f172a] overflow-hidden relative"
                  aria-label={l.title}
                >
                  {l.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.imageUrl}
                      alt={l.title}
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-[family:var(--font-prompt)] text-[10px] text-[#475569] tracking-[0.16em] uppercase">
                      NO IMG
                    </div>
                  )}
                  {/* corner crop marks */}
                  <span
                    aria-hidden
                    className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#22d3ee]"
                    style={{ borderColor: 'var(--shop-accent, #22d3ee)' }}
                  />
                  <span
                    aria-hidden
                    className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#22d3ee]"
                    style={{ borderColor: 'var(--shop-accent, #22d3ee)' }}
                  />
                </Link>

                {/* Info column */}
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <div className="font-[family:var(--font-prompt)] text-[10px] text-[#64748b] tracking-[0.16em] uppercase mb-1">
                      SKU · {labSku(l.productId)}
                    </div>
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="font-[family:var(--font-prompt)] text-base font-medium text-white hover:text-[#22d3ee] transition-colors line-clamp-2"
                      style={{ color: 'var(--shop-ink, #ffffff)' }}
                    >
                      {l.title}
                    </Link>
                    <div className="mt-1 font-[family:var(--font-prompt)] text-xs text-[#22d3ee] font-bold tracking-[0.12em] tabular-nums">
                      {formatTHB(l.priceTHB)}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    {/* Qty stepper — mech-key style */}
                    <div
                      className="inline-flex items-center border border-[#1e293b] bg-[#0f172a]"
                      role="group"
                      aria-label={`จำนวน ${l.title}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setQty(l.productId, Math.max(1, l.qty - 1), store.slug)
                        }
                        disabled={l.qty <= 1}
                        aria-label="ลด"
                        className="h-9 w-9 font-[family:var(--font-prompt)] text-[#e2e8f0] hover:text-[#22d3ee] hover:bg-[#1e293b] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      >
                        −
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
                        className="h-9 w-12 bg-transparent text-center font-[family:var(--font-prompt)] text-sm text-white tabular-nums border-x border-[#1e293b] focus:outline-none focus:border-[#22d3ee] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        aria-label="จำนวน"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQty(l.productId, l.qty + 1, store.slug)
                        }
                        aria-label="เพิ่ม"
                        className="h-9 w-9 font-[family:var(--font-prompt)] text-[#e2e8f0] hover:text-[#22d3ee] hover:bg-[#1e293b] transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Line subtotal + remove */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="font-[family:var(--font-prompt)] text-sm font-bold text-white tabular-nums">
                        {formatTHB(l.priceTHB * l.qty)}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(l.productId, store.slug)}
                        className="font-[family:var(--font-prompt)] text-[10px] tracking-[0.16em] uppercase text-[#64748b] hover:text-red-400 transition-colors"
                        aria-label={`ลบ ${l.title}`}
                      >
                        [×] ลบ
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── STICKY SUMMARY ────────────────────────────────────── */}
        <aside
          aria-labelledby="cart-summary-heading"
          className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start"
        >
          <h2 id="cart-summary-heading" className="sr-only">
            สรุปคำสั่งซื้อ
          </h2>

          {/* "Datasheet" panel — light surface on dark page for contrast */}
          <div
            className="border border-[#1e293b] bg-[#f8fafc] text-[#020617] p-6 sm:p-7"
            style={{ background: 'var(--shop-card, #f8fafc)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <p
                className="font-[family:var(--font-prompt)] text-[11px] tracking-[0.24em] uppercase text-[#475569]"
                style={{ color: 'var(--shop-ink-muted, #475569)' }}
              >
                {'// ORDER.SUMMARY'}
              </p>
              <span
                className="inline-flex h-2 w-2 rounded-full bg-[#22d3ee] animate-pulse"
                style={{ background: 'var(--shop-accent, #22d3ee)' }}
                aria-hidden
              />
            </div>

            <h3
              className="font-[family:var(--font-prompt)] text-2xl font-bold tracking-tight text-[#020617] mb-6"
              style={{ color: 'var(--shop-ink, #020617)' }}
            >
              สรุปคำสั่งซื้อ
            </h3>

            {/* Free-shipping progress nudge */}
            {effectiveShipping > 0 && remainingForFreeShip > 0 && (
              <div className="mb-6 pb-6 border-b border-[#cbd5e1]">
                <p className="font-[family:var(--font-prompt)] text-[11px] tracking-[0.16em] uppercase text-[#475569] mb-2">
                  ส่งฟรีอีก{' '}
                  <span
                    className="font-bold text-[#0891b2] tabular-nums"
                    style={{ color: 'var(--shop-primary, #0891b2)' }}
                  >
                    {formatTHB(remainingForFreeShip)}
                  </span>
                </p>
                <div
                  className="h-1.5 w-full overflow-hidden bg-[#e2e8f0] rounded-full"
                  aria-hidden
                >
                  <div
                    className="h-full bg-[#22d3ee] rounded-full transition-all"
                    style={{
                      width: `${freeShipProgress}%`,
                      background: 'var(--shop-primary, #22d3ee)',
                    }}
                  />
                </div>
              </div>
            )}
            {effectiveShipping === 0 && lines.length > 0 && (
              <div className="mb-6 pb-6 border-b border-[#cbd5e1] font-[family:var(--font-prompt)] text-[11px] tracking-[0.16em] uppercase text-emerald-600">
                ✓ FREE_SHIPPING.UNLOCKED
              </div>
            )}

            {/* Spec-row totals — each row reads like a datasheet entry */}
            <dl className="space-y-3 font-[family:var(--font-prompt)] text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[11px] tracking-[0.16em] uppercase text-[#475569]">
                  ยอดรวมสินค้า
                </dt>
                <dd className="font-bold text-[#020617] tabular-nums">
                  {formatTHB(calc.subtotal)}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-[11px] tracking-[0.16em] uppercase text-[#475569]">
                  ค่าจัดส่ง
                </dt>
                <dd
                  className={
                    effectiveShipping === 0
                      ? 'font-bold tabular-nums text-emerald-600'
                      : 'font-bold tabular-nums text-[#020617]'
                  }
                >
                  {effectiveShipping === 0 ? 'ฟรี' : formatTHB(effectiveShipping)}
                </dd>
              </div>

              {/* Applied coupons — one row each with code + amount + × */}
              {calc.appliedCoupons.map((ac) => {
                const meta = appliedCoupons.find((c) => c.id === ac.couponId);
                return (
                  <div
                    key={ac.couponId}
                    className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-[#cbd5e1]"
                  >
                    <dt className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#22d3ee] text-[10px] tracking-[0.16em] uppercase text-[#0891b2] tabular-nums truncate"
                        style={{
                          borderColor: 'var(--shop-accent, #22d3ee)',
                          color: 'var(--shop-primary, #0891b2)',
                        }}
                      >
                        🎫 {ac.code}
                      </span>
                      {meta?.title && (
                        <span className="font-[family:var(--font-kanit)] text-xs text-[#475569] truncate">
                          {meta.title}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveCoupon(ac.couponId)}
                        className="text-[10px] tracking-[0.16em] uppercase text-[#94a3b8] hover:text-red-500 transition-colors shrink-0"
                        aria-label={`ลบโค้ด ${ac.code}`}
                      >
                        [×]
                      </button>
                    </dt>
                    <dd className="font-bold tabular-nums text-emerald-600 shrink-0">
                      − {formatTHB(ac.amount)}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {/* Coupon input — apply by code */}
            <form
              onSubmit={handleApplyCoupon}
              className="mt-6 pt-6 border-t border-[#cbd5e1]"
            >
              <label
                htmlFor="kl-coupon-input"
                className="block font-[family:var(--font-prompt)] text-[11px] tracking-[0.16em] uppercase text-[#475569] mb-2"
              >
                {'// PROMO.CODE'}
              </label>
              <div className="flex gap-2">
                <input
                  id="kl-coupon-input"
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    if (couponError) setCouponError(null);
                  }}
                  placeholder="กรอกโค้ดส่วนลด"
                  className="flex-1 h-10 px-3 bg-white border border-[#cbd5e1] font-[family:var(--font-prompt)] text-sm text-[#020617] placeholder:text-[#94a3b8] tracking-[0.04em] uppercase focus:outline-none focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee]"
                  aria-describedby={couponError ? 'kl-coupon-error' : undefined}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  className="h-10 px-4 bg-[#020617] text-white font-[family:var(--font-prompt)] text-xs font-bold tracking-[0.16em] uppercase hover:bg-[#0891b2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  style={{ background: couponLoading ? '#475569' : undefined }}
                >
                  {couponLoading ? '…' : 'APPLY'}
                </button>
              </div>
              {couponError && (
                <p
                  id="kl-coupon-error"
                  className="mt-2 font-[family:var(--font-prompt)] text-[11px] tracking-[0.12em] uppercase text-red-600"
                  role="alert"
                >
                  ! {couponError}
                </p>
              )}
            </form>

            {/* Grand total — mono bar */}
            <div className="mt-7 pt-5 border-t-2 border-[#020617] flex items-baseline justify-between">
              <dt
                className="font-[family:var(--font-prompt)] text-xs tracking-[0.24em] uppercase text-[#020617] font-bold"
                style={{ color: 'var(--shop-ink, #020617)' }}
              >
                TOTAL
              </dt>
              <dd
                className="font-[family:var(--font-prompt)] text-2xl font-bold text-[#0891b2] tabular-nums"
                style={{ color: 'var(--shop-primary, #0891b2)' }}
              >
                {formatTHB(calc.grandTotal)}
              </dd>
            </div>
            {calc.totalDiscount > 0 && (
              <p className="mt-1 text-right font-[family:var(--font-prompt)] text-[11px] tracking-[0.12em] uppercase text-emerald-600 tabular-nums">
                ประหยัด {formatTHB(calc.totalDiscount)}
              </p>
            )}

            {/* Checkout CTA */}
            <Link
              href={`/stores/${store.slug}/checkout`}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 h-12 bg-[#22d3ee] text-[#020617] font-[family:var(--font-prompt)] font-bold tracking-[0.16em] uppercase hover:bg-white transition-colors"
              style={{ background: 'var(--shop-primary, #22d3ee)' }}
            >
              ดำเนินการชำระเงิน <span aria-hidden>→</span>
            </Link>

            <p className="mt-4 text-center font-[family:var(--font-prompt)] text-[10px] tracking-[0.16em] uppercase text-[#64748b]">
              SSL.SECURE · PAYMENT.ENCRYPTED
            </p>
          </div>

          {/* Lab footnote — trust strip in mono */}
          <div className="mt-5 grid grid-cols-3 gap-2 font-[family:var(--font-prompt)] text-[10px] tracking-[0.12em] uppercase text-[#64748b] text-center">
            <div className="border border-[#1e293b] bg-[#0f172a]/60 py-2 px-1">
              ส่งฟรี ฿990+
            </div>
            <div className="border border-[#1e293b] bg-[#0f172a]/60 py-2 px-1">
              คืนได้ 7 วัน
            </div>
            <div className="border border-[#1e293b] bg-[#0f172a]/60 py-2 px-1">
              COD ได้
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const CartPage = KeystrokeLabCart;
export default KeystrokeLabCart;
