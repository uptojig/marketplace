'use client';

/**
 * yumeiro-lip — bespoke Cart page
 * ---------------------------------------------------------------
 * Lipstick beauty boutique vibe: vivid pink/coral swatch row that
 * doubles as a "shades in your bag" preview, soft gradient banners,
 * pill quantity steppers, and a sticky pink summary card.
 *
 * Business logic
 *   - Cart lines come from useCart (client zustand store), scoped
 *     to this store's slug.
 *   - Free-shipping threshold ฿990.
 *   - Coupon flow:
 *       1. Hydrate any coupon ids the customer has already applied
 *          from localStorage (key: `yumeiro-lip-cart-coupons:<slug>`).
 *       2. On apply, POST { code, items, shippingPerStore,
 *          existingCouponIds } to /api/coupons/preview. If the API
 *          isn't available (404 / non-2xx) we fall back to a pure
 *          client preview using getCouponByCode + calculator's
 *          validate() so the UI still gives the customer a hint.
 *       3. calculate() from @/lib/coupons/calculator is the
 *          single source of truth for totals (subtotal, discount,
 *          shipping-after-discount, grand total).
 *       4. Remove is a per-coupon button that unsticks the coupon
 *          from local state.
 *   - Coupon and cart adapters are NEVER touched — this page is
 *     self-contained beyond useCart + the coupon library.
 */

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  Heart,
  Minus,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { calculate, validate } from '@/lib/coupons/calculator';
import { getCouponByCode } from '@/lib/coupons/mock-data';
import {
  COUPON_ERROR_MESSAGE,
  type Coupon,
  type CouponValidationError,
} from '@/lib/coupons/types';
import type { CartItem } from '@/lib/cart/types';

// ── Spec constants ───────────────────────────────────────────────
const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

interface CartItemDisplay {
  id: string;
  title: string;
  priceTHB: number;
  imageUrl?: string | null;
  quantity: number;
  variantLabel?: string | null;
}

interface CartPageProps {
  store: { slug: string; name: string };
  items?: CartItemDisplay[];
}

// Lipstick swatch row for the empty state and ambient header pop —
// vivid corals, hot pinks, mauves. Matches the homepage colour story.
const LIP_SWATCHES = [
  '#fbcfe8',
  '#f9a8d4',
  '#f472b6',
  '#ec4899',
  '#db2777',
  '#be185d',
  '#fb7185',
  '#f43f5e',
  '#e11d48',
  '#fda4af',
  '#fb923c',
  '#f97316',
];

// Storage key namespaced per-store so two boutiques on the same
// browser don't share coupon state.
const couponStorageKey = (slug: string) => `yumeiro-lip-cart-coupons:${slug}`;

export function YumeiroLipCartPage({ store }: CartPageProps) {
  // ── Cart lines (client zustand store, scoped to this store) ────
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  // SSR hydration guard — localStorage-backed stores return empty on
  // the server; rendering them as-is causes a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  // Cart lines projected to CartItem (calculator's expected shape).
  // storeId === store.slug for a single-store boutique cart.
  const cartItems = useMemo<CartItem[]>(
    () =>
      lines.map((l) => ({
        id: `${store.slug}:${l.productId}`,
        productId: l.productId,
        qty: l.qty,
        storeId: store.slug,
        title: l.title,
        thumbnailUrl: l.imageUrl ?? '',
        price: l.priceTHB,
        storeName: store.name,
      })),
    [lines, store.slug, store.name],
  );

  // ── Coupon state ───────────────────────────────────────────────
  const [appliedCoupons, setAppliedCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponPending, setCouponPending] = useState(false);

  // Hydrate coupons from localStorage on mount. We persist coupon
  // codes (stable strings), not the full objects, so that an updated
  // coupon catalog re-hydrates with the freshest data.
  const hydrationRanRef = useRef(false);
  useEffect(() => {
    if (hydrationRanRef.current) return;
    hydrationRanRef.current = true;
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(couponStorageKey(store.slug));
      if (!raw) return;
      const codes = JSON.parse(raw) as string[];
      const hydrated: Coupon[] = [];
      for (const code of codes) {
        const c = getCouponByCode(code);
        if (c) hydrated.push(c);
      }
      if (hydrated.length > 0) setAppliedCoupons(hydrated);
    } catch {
      // Bad payload — clear it so we don't keep retrying.
      window.localStorage.removeItem(couponStorageKey(store.slug));
    }
  }, [store.slug]);

  // Persist applied coupons back to localStorage whenever they change
  // (post-mount only — we don't want to clobber hydration).
  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        couponStorageKey(store.slug),
        JSON.stringify(appliedCoupons.map((c) => c.code)),
      );
    } catch {
      /* localStorage quota errors are non-fatal */
    }
  }, [appliedCoupons, mounted, store.slug]);

  // ── Totals via calculate() — single source of truth ────────────
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const baseShipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;

  const calc = useMemo(
    () =>
      calculate({
        items: cartItems,
        coupons: appliedCoupons,
        shippingPerStore: { [store.slug]: baseShipping },
      }),
    [cartItems, appliedCoupons, baseShipping, store.slug],
  );

  const itemDiscount = calc.appliedCoupons
    .filter((c) => c.slot !== 'shipping')
    .reduce((s, c) => s + c.amount, 0);
  const shippingDiscount = calc.appliedCoupons
    .filter((c) => c.slot === 'shipping')
    .reduce((s, c) => s + c.amount, 0);
  const shippingAfter = Object.values(calc.shippingAfterDiscount).reduce(
    (a, b) => a + b,
    0,
  );
  const grandTotal = Math.max(0, calc.subtotal + shippingAfter - itemDiscount);
  const totalSaved = calc.totalDiscount;
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShipPct = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  // ── Apply coupon: try /api/coupons/preview, fall back to local ─
  const applyCoupon = useCallback(async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (appliedCoupons.some((c) => c.code === code)) {
      setCouponError(COUPON_ERROR_MESSAGE.already_applied);
      return;
    }
    setCouponError(null);
    setCouponPending(true);

    try {
      const res = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code,
          items: cartItems,
          shippingPerStore: { [store.slug]: baseShipping },
          existingCouponIds: appliedCoupons.map((c) => c.id),
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as
          | { ok: true; coupon: Coupon }
          | { ok: false; reason: CouponValidationError };
        if (data.ok) {
          setAppliedCoupons((prev) => [...prev, data.coupon]);
          setCouponCode('');
        } else {
          setCouponError(
            COUPON_ERROR_MESSAGE[data.reason] ?? 'ใช้โค้ดนี้ไม่ได้',
          );
        }
        return;
      }

      // Server route absent / failed — graceful client-side fallback
      // so the customer still gets a working coupon UX in dev/preview.
      // Authoritative validation happens server-side at order placement.
      throw new Error('api_unavailable');
    } catch {
      const local = getCouponByCode(code);
      if (!local) {
        setCouponError(COUPON_ERROR_MESSAGE.not_found);
        return;
      }
      const err = validate(local, {
        items: cartItems,
        shippingPerStore: { [store.slug]: baseShipping },
        existingCoupons: appliedCoupons,
      });
      if (err) {
        setCouponError(COUPON_ERROR_MESSAGE[err]);
        return;
      }
      setAppliedCoupons((prev) => [...prev, local]);
      setCouponCode('');
    } finally {
      setCouponPending(false);
    }
  }, [couponCode, appliedCoupons, cartItems, baseShipping, store.slug]);

  const removeCoupon = useCallback((couponId: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.id !== couponId));
    setCouponError(null);
  }, []);

  // ── Pre-mount placeholder to avoid hydration mismatch ──────────
  if (!mounted) {
    return (
      <div
        className="min-h-screen"
        style={{ background: 'var(--shop-bg, #fff0f5)' }}
      />
    );
  }

  return (
    <div
      className="min-h-screen font-[family:var(--font-prompt),system-ui,sans-serif]"
      style={{
        background:
          'var(--shop-bg, linear-gradient(180deg, #fff5f8 0%, #fff0f5 100%))',
        color: 'var(--shop-ink, #831843)',
      }}
    >
      {/* ── Header band ─────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden border-b"
        style={{
          background:
            'linear-gradient(180deg, var(--shop-accent, #fbcfe8) 0%, transparent 100%)',
          borderColor: 'var(--shop-border, #fbcfe8)',
        }}
      >
        <Sparkles
          aria-hidden
          className="absolute right-6 top-6 h-12 w-12 opacity-30"
          style={{ color: 'var(--shop-primary, #ec4899)' }}
        />
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] transition hover:underline"
            style={{ color: 'var(--shop-ink-muted, #be185d)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับไปเลือกเฉด
          </Link>

          <div className="mt-5 flex items-center gap-2">
            {LIP_SWATCHES.slice(0, 8).map((c, i) => (
              <span
                key={i}
                aria-hidden
                className="inline-block h-4 w-4 rounded-full border-2 border-white shadow-sm"
                style={{ background: c }}
              />
            ))}
          </div>

          <h1
            className="mt-3 text-4xl font-black tracking-tight sm:text-5xl"
            style={{ color: 'var(--shop-primary, #ec4899)' }}
          >
            ตะกร้าของคุณ
          </h1>
          <p
            className="mt-2 text-sm sm:text-base"
            style={{ color: 'var(--shop-ink-muted, #be185d)' }}
          >
            {lines.length === 0
              ? `ยังไม่มีเฉดในตะกร้า — เลือกลิปสีโปรดจาก ${store.name} ได้เลย`
              : `${itemCount.toLocaleString()} ชิ้น พร้อมส่งให้คุณ — ตรวจสอบรายการก่อนชำระเงิน`}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {lines.length === 0 ? (
          <YumeiroEmptyCart storeSlug={store.slug} />
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
            {/* ── Line items ──────────────────────────────────── */}
            <section aria-labelledby="cart-heading" className="space-y-4">
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>

              {/* Free-shipping progress nudge */}
              <div
                className="rounded-2xl border p-4 shadow-sm"
                style={{
                  background: 'white',
                  borderColor: 'var(--shop-border, #fbcfe8)',
                }}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Truck
                    className="h-4 w-4"
                    style={{ color: 'var(--shop-primary, #ec4899)' }}
                  />
                  {remainingForFreeShipping > 0 ? (
                    <span>
                      ช้อปเพิ่มอีก{' '}
                      <strong style={{ color: 'var(--shop-primary, #ec4899)' }}>
                        {formatTHB(remainingForFreeShipping)}
                      </strong>{' '}
                      รับฟรีค่าจัดส่ง
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ color: 'var(--shop-primary, #ec4899)' }}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                      ยินดีด้วย! คุณได้รับฟรีค่าจัดส่ง
                    </span>
                  )}
                </div>
                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-full"
                  style={{ background: 'var(--shop-accent, #fbcfe8)' }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={freeShipPct}
                  aria-label="ความคืบหน้าฟรีค่าจัดส่ง"
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${freeShipPct}%`,
                      background:
                        'linear-gradient(90deg, var(--shop-primary, #ec4899), #fb7185)',
                    }}
                  />
                </div>
              </div>

              {/* Line item cards */}
              {lines.map((l) => (
                <article
                  key={l.productId}
                  className="grid grid-cols-[6rem_1fr] gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:grid-cols-[8rem_1fr] sm:gap-5 sm:p-5"
                  style={{ borderColor: 'var(--shop-border, #fbcfe8)' }}
                >
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="relative block aspect-square overflow-hidden rounded-2xl"
                    style={{ background: 'var(--shop-muted, #fff0f5)' }}
                    aria-label={l.title}
                  >
                    {l.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.imageUrl}
                        alt={l.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ color: 'var(--shop-primary, #ec4899)' }}
                      >
                        <Heart className="h-8 w-8 opacity-50" />
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/stores/${store.slug}/products/${l.productId}`}
                        className="block text-base font-bold leading-snug transition hover:underline sm:text-lg"
                        style={{ color: 'var(--shop-ink, #831843)' }}
                      >
                        {l.title}
                      </Link>
                      <p
                        className="mt-1 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                      >
                        {l.storeName}
                      </p>
                      <p
                        className="mt-2 text-lg font-black"
                        style={{ color: 'var(--shop-primary, #ec4899)' }}
                      >
                        {formatTHB(l.priceTHB)}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div
                        className="inline-flex h-10 items-center overflow-hidden rounded-full border bg-white shadow-sm"
                        style={{ borderColor: 'var(--shop-border, #fbcfe8)' }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setQty(l.productId, l.qty - 1, store.slug)
                          }
                          disabled={l.qty <= 1}
                          aria-label={`ลดจำนวน ${l.title}`}
                          className="inline-flex h-10 w-10 items-center justify-center transition disabled:opacity-30"
                          style={{ color: 'var(--shop-primary, #ec4899)' }}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span
                          className="inline-flex h-10 w-10 items-center justify-center border-x text-sm font-bold"
                          style={{
                            color: 'var(--shop-ink, #831843)',
                            borderColor: 'var(--shop-border, #fbcfe8)',
                          }}
                          aria-live="polite"
                        >
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQty(l.productId, l.qty + 1, store.slug)
                          }
                          aria-label={`เพิ่มจำนวน ${l.title}`}
                          className="inline-flex h-10 w-10 items-center justify-center transition"
                          style={{ color: 'var(--shop-primary, #ec4899)' }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(l.productId, store.slug)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition hover:bg-white"
                        style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                        aria-label={`ลบ ${l.title} ออกจากตะกร้า`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        ลบ
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* ── Sticky summary ─────────────────────────────── */}
            <aside
              aria-labelledby="summary-heading"
              className="mt-8 lg:mt-0 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              <div
                className="rounded-3xl border p-6 shadow-md"
                style={{
                  background:
                    'linear-gradient(180deg, #fff 0%, var(--shop-muted, #fff0f5) 100%)',
                  borderColor: 'var(--shop-border, #fbcfe8)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: 'var(--shop-primary, #ec4899)' }}
                  />
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                  >
                    สรุปยอด
                  </p>
                </div>
                <h3
                  className="mt-1 text-2xl font-black"
                  style={{ color: 'var(--shop-ink, #831843)' }}
                >
                  รายละเอียดการชำระเงิน
                </h3>

                {/* Coupon input */}
                <div className="mt-6">
                  <label
                    htmlFor="coupon-code"
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
                    style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    โค้ดส่วนลด
                  </label>
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!couponPending) applyCoupon();
                    }}
                  >
                    <input
                      id="coupon-code"
                      type="text"
                      autoComplete="off"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError(null);
                      }}
                      placeholder="กรอกโค้ด เช่น BULK10"
                      className="h-11 flex-1 rounded-full border bg-white px-4 text-sm font-semibold uppercase tracking-wide placeholder:font-normal placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--shop-border, #fbcfe8)',
                        color: 'var(--shop-ink, #831843)',
                        boxShadow: 'none',
                      }}
                      aria-invalid={couponError ? 'true' : 'false'}
                      aria-describedby={
                        couponError ? 'coupon-error' : undefined
                      }
                    />
                    <button
                      type="submit"
                      disabled={couponPending || couponCode.trim().length === 0}
                      className="inline-flex h-11 items-center justify-center rounded-full px-5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ background: 'var(--shop-primary, #ec4899)' }}
                    >
                      {couponPending ? 'กำลังตรวจ…' : 'ใช้โค้ด'}
                    </button>
                  </form>
                  {couponError && (
                    <p
                      id="coupon-error"
                      role="alert"
                      className="mt-2 text-xs font-semibold"
                      style={{ color: '#dc2626' }}
                    >
                      {couponError}
                    </p>
                  )}

                  {/* Applied coupon chips */}
                  {calc.appliedCoupons.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {calc.appliedCoupons.map((ac) => {
                        const coupon = appliedCoupons.find(
                          (c) => c.id === ac.couponId,
                        );
                        return (
                          <li
                            key={ac.couponId}
                            className="flex items-start justify-between gap-2 rounded-2xl border bg-white px-3 py-2 text-xs"
                            style={{
                              borderColor: 'var(--shop-accent, #fbcfe8)',
                            }}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <Tag
                                  className="h-3 w-3"
                                  style={{
                                    color: 'var(--shop-primary, #ec4899)',
                                  }}
                                />
                                <code
                                  className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
                                  style={{
                                    background:
                                      'var(--shop-accent, #fbcfe8)',
                                    color: 'var(--shop-ink, #831843)',
                                  }}
                                >
                                  {ac.code}
                                </code>
                                <span
                                  className="font-bold"
                                  style={{
                                    color: 'var(--shop-primary, #ec4899)',
                                  }}
                                >
                                  −{formatTHB(ac.amount)}
                                </span>
                              </div>
                              {coupon?.title && (
                                <p
                                  className="mt-1 truncate text-[11px]"
                                  style={{
                                    color: 'var(--shop-ink-muted, #be185d)',
                                  }}
                                >
                                  {coupon.title}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCoupon(ac.couponId)}
                              aria-label={`ลบโค้ด ${ac.code}`}
                              className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-pink-50"
                              style={{
                                color: 'var(--shop-ink-muted, #be185d)',
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div
                  aria-hidden
                  className="mt-6 h-px w-full"
                  style={{ background: 'var(--shop-accent, #fbcfe8)' }}
                />

                {/* Totals */}
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt style={{ color: 'var(--shop-ink-muted, #be185d)' }}>
                      ยอดสินค้า ({itemCount} ชิ้น)
                    </dt>
                    <dd
                      className="font-semibold"
                      style={{ color: 'var(--shop-ink, #831843)' }}
                    >
                      {formatTHB(calc.subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt style={{ color: 'var(--shop-ink-muted, #be185d)' }}>
                      ค่าจัดส่ง
                    </dt>
                    <dd className="font-semibold text-right">
                      {shippingAfter === 0 ? (
                        shippingDiscount > 0 ? (
                          <>
                            <span
                              className="mr-1 text-xs line-through"
                              style={{
                                color: 'var(--shop-ink-muted, #be185d)',
                              }}
                            >
                              {formatTHB(calc.shippingTotal)}
                            </span>
                            <span
                              style={{ color: 'var(--shop-primary, #ec4899)' }}
                            >
                              ฟรี
                            </span>
                          </>
                        ) : (
                          <span
                            style={{ color: 'var(--shop-primary, #ec4899)' }}
                          >
                            ฟรี
                          </span>
                        )
                      ) : (
                        <span style={{ color: 'var(--shop-ink, #831843)' }}>
                          {formatTHB(shippingAfter)}
                        </span>
                      )}
                    </dd>
                  </div>
                  {itemDiscount > 0 && (
                    <div className="flex items-center justify-between">
                      <dt style={{ color: 'var(--shop-ink-muted, #be185d)' }}>
                        ส่วนลดสินค้า
                      </dt>
                      <dd
                        className="font-semibold"
                        style={{ color: 'var(--shop-primary, #ec4899)' }}
                      >
                        −{formatTHB(itemDiscount)}
                      </dd>
                    </div>
                  )}

                  <div
                    className="flex items-baseline justify-between border-t pt-4"
                    style={{ borderColor: 'var(--shop-accent, #fbcfe8)' }}
                  >
                    <dt
                      className="text-base font-bold"
                      style={{ color: 'var(--shop-ink, #831843)' }}
                    >
                      ยอดรวมที่ต้องชำระ
                    </dt>
                    <dd
                      className="text-2xl font-black"
                      style={{ color: 'var(--shop-primary, #ec4899)' }}
                    >
                      {formatTHB(grandTotal)}
                    </dd>
                  </div>
                </dl>

                {totalSaved > 0 && (
                  <p
                    className="mt-3 rounded-full px-3 py-1.5 text-center text-xs font-bold"
                    style={{
                      background: 'var(--shop-accent, #fbcfe8)',
                      color: 'var(--shop-ink, #831843)',
                    }}
                  >
                    ประหยัดไป {formatTHB(totalSaved)} วันนี้
                  </p>
                )}

                <Link
                  href={`/stores/${store.slug}/checkout/address`}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white shadow-lg transition hover:opacity-90 hover:shadow-xl"
                  style={{
                    background:
                      'linear-gradient(90deg, var(--shop-primary, #ec4899) 0%, #fb7185 100%)',
                    boxShadow: '0 10px 25px -10px rgba(236, 72, 153, 0.6)',
                  }}
                >
                  ดำเนินการชำระเงิน
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p
                  className="mt-4 text-center text-[11px]"
                  style={{ color: 'var(--shop-ink-muted, #be185d)' }}
                >
                  ส่งฟรีเมื่อยอดถึง {formatTHB(FREE_SHIPPING_THRESHOLD)} ·
                  คืนสินค้าได้ภายใน 7 วัน
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────
function YumeiroEmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <div
        className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full shadow-inner"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, var(--shop-accent, #fbcfe8), var(--shop-muted, #fff0f5))',
        }}
      >
        <Heart
          className="h-14 w-14"
          style={{ color: 'var(--shop-primary, #ec4899)' }}
          aria-hidden
        />
      </div>

      {/* Vivid swatch row — invitation to explore shades */}
      <div className="mb-6 flex justify-center gap-2">
        {LIP_SWATCHES.slice(0, 10).map((c, i) => (
          <span
            key={i}
            aria-hidden
            className="inline-block h-5 w-5 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-125"
            style={{ background: c }}
          />
        ))}
      </div>

      <h2
        className="text-3xl font-black sm:text-4xl"
        style={{ color: 'var(--shop-primary, #ec4899)' }}
      >
        ตะกร้ายังว่างอยู่
      </h2>
      <p
        className="mt-3 text-sm sm:text-base"
        style={{ color: 'var(--shop-ink-muted, #be185d)' }}
      >
        เลือกลิปสีโปรดหรือบลัชเชอร์เฉดที่ใช่ — เรามีให้คุณกว่า 32 เฉดที่ทดสอบบนผิวเอเชีย
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full px-10 text-sm font-bold text-white shadow-lg transition hover:opacity-90 hover:shadow-xl"
        style={{
          background:
            'linear-gradient(90deg, var(--shop-primary, #ec4899) 0%, #fb7185 100%)',
          boxShadow: '0 10px 25px -10px rgba(236, 72, 153, 0.6)',
        }}
      >
        เลือกเฉด
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export const CartPage = YumeiroLipCartPage;
export default YumeiroLipCartPage;
