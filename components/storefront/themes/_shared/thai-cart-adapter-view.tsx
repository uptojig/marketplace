'use client';

/**
 * Client-only render half of the Thai cart adapter.
 *
 * Lives in its own module so the factory in `thai-cart-adapter.tsx` can stay
 * server-safe — see that file's header comment for the why. All cart hooks
 * (`useCart`, `useState`, `useEffect`, `useMemo`) and the async coupon
 * `/api/coupons/validate` flow live here.
 *
 * Public surface: `<ThaiCartAdapterView store={...} config={...} />` rendered
 * by the thin wrapper returned from `makeThaiCartAdapter()`. The `config`
 * prop is the already-resolved bundle of plain serializable values that the
 * factory computed once at module-eval time.
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  ChevronLeft,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';

import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/* ──────────────────────────────────────────────────────────────
 * Internal helpers — palette resolution
 * ────────────────────────────────────────────────────────────── */

export interface ResolvedPalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  ink: string;
  inkMuted: string;
  primary: string;
  accent: string;
  primaryFg: string;
}

export interface ResolvedTrustItem {
  icon: 'truck' | 'rotate' | 'banknote';
  label: string;
}

/** Fully-resolved config bundle the factory hands to the view. Every field
 *  is a plain serializable value (no functions, no Date, no React elements). */
export interface ResolvedThaiCartConfig {
  palette: ResolvedPalette;
  threshold: number;
  flatShipping: number;
  heading: string;
  emptyMsg: string;
  emptySub: string;
  emptyCta: string;
  checkoutLabel: string;
  showTrust: boolean;
  showCoupon: boolean;
  trustStrip: ResolvedTrustItem[];
}

const ICONS = { truck: Truck, rotate: RotateCcw, banknote: Banknote } as const;

/* ──────────────────────────────────────────────────────────────
 * Coupon flow
 * --------------------------------------------------------------
 * Best-effort hydration: POST to /api/coupons/validate with the
 * current cart and the typed code. When the endpoint 401s (guest
 * checkout) we silently drop the discount — the order route is
 * still authoritative, this is purely a UX hint.
 * ────────────────────────────────────────────────────────────── */

interface AppliedCoupon {
  code: string;
  discountTHB: number;
  reason?: string;
}

interface ThaiCartStoreProp {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

export interface ThaiCartAdapterViewProps {
  store: ThaiCartStoreProp;
  config: ResolvedThaiCartConfig;
}

export function ThaiCartAdapterView({ store, config }: ThaiCartAdapterViewProps) {
  const {
    palette,
    threshold,
    flatShipping,
    heading,
    emptyMsg,
    emptySub,
    emptyCta,
    checkoutLabel,
    showTrust,
    showCoupon,
    trustStrip,
  } = config;

  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );
  const subtotal = lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0);
  const itemCount = lines.reduce((acc, l) => acc + l.qty, 0);

  // Authoritative DIGITAL detection — legacy cart lines (added before
  // the productType field shipped) lack the flag locally. Pull the
  // truth from /api/checkout/product-types so all-digital carts
  // (especially the sheetlab storefront) never surface a "ค่าจัดส่ง"
  // or "ซื้ออีก ฿X จะได้ส่งฟรี" nudge.
  const [serverTypes, setServerTypes] = useState<
    Record<string, "PHYSICAL" | "DIGITAL">
  >({});
  useEffect(() => {
    if (lines.length === 0) return;
    const ids = lines.map((l) => l.productId);
    let cancelled = false;
    fetch(`/api/checkout/product-types?ids=${encodeURIComponent(ids.join(","))}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const map: Record<string, "PHYSICAL" | "DIGITAL"> = {};
        for (const p of data.products ?? []) {
          map[p.id] = p.productType;
        }
        setServerTypes(map);
      })
      .catch(() => {
        /* fall back to local flag */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.map((l) => l.productId).join(",")]);

  function lineIsDigital(productId: string, localFlag?: string): boolean {
    return serverTypes[productId] === "DIGITAL" || localFlag === "DIGITAL";
  }
  const allDigital =
    lines.length > 0
    && lines.every((l) => lineIsDigital(l.productId, l.productType));

  // Clamp DIGITAL lines to qty=1 once the server map confirms.
  useEffect(() => {
    if (Object.keys(serverTypes).length === 0) return;
    for (const l of lines) {
      if (
        l.qty > 1
        && (serverTypes[l.productId] === "DIGITAL"
          || l.productType === "DIGITAL")
      ) {
        setQty(l.productId, 1, store.slug);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverTypes]);

  const shipping = allDigital
    ? 0
    : subtotal >= threshold
      ? 0
      : flatShipping;
  const remainingForFree = allDigital
    ? 0
    : Math.max(0, threshold - subtotal);

  /* Coupon state — purely client-side, hint via /api/coupons/validate */
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const discount = applied?.discountTHB ?? 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          items: lines.map((l) => ({
            productId: l.productId,
            storeSlug: l.storeSlug,
            priceTHB: l.priceTHB,
            qty: l.qty,
          })),
          shippingPerStore: { [store.slug]: shipping },
          existingCouponIds: [],
        }),
      });
      if (res.status === 401) {
        // Guest path — endpoint requires a session. Surface a
        // gentle hint instead of swallowing silently.
        setCouponError('กรุณาเข้าสู่ระบบเพื่อใช้คูปอง');
        return;
      }
      const data = (await res
        .json()
        .catch(() => ({}))) as { ok?: boolean; discountTHB?: number; reason?: string };
      if (!res.ok || data.ok === false) {
        setCouponError('คูปองไม่ถูกต้องหรือหมดอายุ');
        return;
      }
      setApplied({
        code: couponCode.trim().toUpperCase(),
        discountTHB: Number(data.discountTHB ?? 0),
        reason: data.reason,
      });
    } catch {
      setCouponError('ไม่สามารถตรวจสอบคูปองได้');
    } finally {
      setApplying(false);
    }
  }

  function clearCoupon() {
    setApplied(null);
    setCouponCode('');
    setCouponError(null);
  }

  if (!mounted) {
    return (
      <div
        className="container mx-auto max-w-7xl px-4 py-8 min-h-[60vh]"
        style={{ background: palette.background }}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ background: palette.background }}>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 pt-10 sm:pt-14">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-8">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-sm hover:underline mb-3"
            style={{ color: palette.inkMuted }}
          >
            <ChevronLeft className="h-4 w-4" />
            เลือกซื้อสินค้าต่อ
          </Link>
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: palette.ink }}
          >
            {heading}
          </h1>
          <p className="mt-3 text-sm" style={{ color: palette.inkMuted }}>
            {lines.length === 0
              ? 'ยังไม่มีสินค้า'
              : `${itemCount.toLocaleString()} ชิ้น จาก ${store.name}`}
          </p>
        </div>

        {lines.length === 0 ? (
          <EmptyCart
            storeSlug={store.slug}
            palette={palette}
            message={emptyMsg}
            subMessage={emptySub}
            ctaLabel={emptyCta}
          />
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* ── Line items ──────────────────────────────────── */}
            <section aria-labelledby="cart-heading" className="lg:col-span-7">
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>
              <ul
                className="border-t border-b divide-y"
                style={{ borderColor: palette.border }}
              >
                {lines.map((l) => (
                  <li key={l.productId} className="flex py-6 sm:py-8">
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="shrink-0 h-24 w-24 sm:h-28 sm:w-28 rounded-md overflow-hidden"
                      style={{ background: palette.background }}
                    >
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          className="h-full w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </Link>

                    <div className="flex-1 ml-4 sm:ml-6 flex flex-col justify-between">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/stores/${store.slug}/products/${l.productId}`}
                            className="text-sm sm:text-base font-medium line-clamp-2 hover:underline"
                            style={{ color: palette.ink }}
                          >
                            {l.title}
                          </Link>
                        </div>
                        <p
                          className="text-sm sm:text-base font-medium whitespace-nowrap shrink-0"
                          style={{ color: palette.ink }}
                        >
                          {formatTHB(l.priceTHB)}
                        </p>
                      </div>

                      <div className="mt-3 sm:mt-4 flex items-end justify-between">
                        <div
                          className="inline-flex h-9 items-center overflow-hidden rounded-md border"
                          style={{ borderColor: palette.border }}
                        >
                          <button
                            type="button"
                            onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                            disabled={l.qty <= 1}
                            aria-label="ลด"
                            className="inline-flex h-9 w-9 items-center justify-center text-sm disabled:opacity-40"
                            style={{ color: palette.ink }}
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
                            className="h-9 w-12 bg-transparent text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            style={{
                              color: palette.ink,
                              borderLeft: `1px solid ${palette.border}`,
                              borderRight: `1px solid ${palette.border}`,
                            }}
                            aria-label={`จำนวน ${l.title}`}
                          />
                          <button
                            type="button"
                            onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                            aria-label="เพิ่ม"
                            className="inline-flex h-9 w-9 items-center justify-center text-sm"
                            style={{ color: palette.ink }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => remove(l.productId, store.slug)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                          style={{ color: palette.inkMuted }}
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
            </section>

            {/* ── Order summary ────────────────────────────────── */}
            <section
              aria-labelledby="summary-heading"
              className="mt-12 lg:mt-0 lg:col-span-5 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              <Card
                className="rounded-2xl px-6 py-7 shadow-none"
                style={{
                  background: palette.surface,
                  borderColor: palette.border,
                }}
              >
                <h3
                  className="text-lg font-bold mb-5"
                  style={{ color: palette.ink }}
                >
                  สรุปคำสั่งซื้อ
                </h3>

                <dl className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <dt style={{ color: palette.inkMuted }}>ยอดรวมสินค้า</dt>
                    <dd className="font-medium" style={{ color: palette.ink }}>
                      {formatTHB(subtotal)}
                    </dd>
                  </div>

                  {applied && discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <dt style={{ color: palette.inkMuted }}>
                        ส่วนลด ({applied.code})
                      </dt>
                      <dd className="font-medium" style={{ color: palette.primary }}>
                        −{formatTHB(discount)}
                      </dd>
                    </div>
                  )}

                  <div
                    className="flex items-center justify-between text-sm pt-3 border-t"
                    style={{ borderColor: palette.border }}
                  >
                    <dt style={{ color: palette.inkMuted }}>ค่าจัดส่ง</dt>
                    <dd
                      className="font-medium"
                      style={{
                        color: shipping === 0 ? palette.primary : palette.ink,
                      }}
                    >
                      {shipping === 0 ? 'ส่งฟรี' : formatTHB(shipping)}
                    </dd>
                  </div>

                  {remainingForFree > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs" style={{ color: palette.inkMuted }}>
                        ซื้ออีก{' '}
                        <span className="font-medium" style={{ color: palette.primary }}>
                          {formatTHB(remainingForFree)}
                        </span>{' '}
                        จะได้ส่งฟรี
                      </p>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full"
                        style={{ background: palette.border }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (subtotal / threshold) * 100)}%`,
                            background: palette.primary,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className="flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: palette.border }}
                  >
                    <dt
                      className="text-base font-bold"
                      style={{ color: palette.ink }}
                    >
                      ยอดรวมทั้งหมด
                    </dt>
                    <dd
                      className="text-2xl font-extrabold"
                      style={{ color: palette.ink }}
                    >
                      {formatTHB(total)}
                    </dd>
                  </div>
                </dl>

                {/* Coupon entry */}
                {showCoupon && (
                  <div
                    className="mt-5 pt-5 border-t"
                    style={{ borderColor: palette.border }}
                  >
                    {applied ? (
                      <div
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                        style={{
                          borderColor: palette.primary,
                          background: `color-mix(in srgb, ${palette.primary} 8%, transparent)`,
                        }}
                      >
                        <span
                          className="inline-flex items-center gap-2"
                          style={{ color: palette.ink }}
                        >
                          <Tag className="h-3.5 w-3.5" />
                          ใช้คูปอง <strong>{applied.code}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={clearCoupon}
                          className="text-xs hover:underline"
                          style={{ color: palette.inkMuted }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <>
                        <label
                          htmlFor="coupon-code"
                          className="text-xs font-medium"
                          style={{ color: palette.inkMuted }}
                        >
                          รหัสคูปองส่วนลด
                        </label>
                        <div className="mt-1.5 flex gap-2">
                          <input
                            id="coupon-code"
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="เช่น WELCOME50"
                            className="flex-1 h-10 rounded-md border bg-transparent px-3 text-sm focus:outline-none focus:ring-2"
                            style={{
                              borderColor: palette.border,
                              color: palette.ink,
                              // @ts-expect-error CSS custom prop
                              '--tw-ring-color': palette.primary,
                            }}
                          />
                          <Button
                            type="button"
                            onClick={applyCoupon}
                            disabled={applying || !couponCode.trim()}
                            variant="outline"
                            className="h-10"
                          >
                            {applying ? 'กำลังตรวจ…' : 'ใช้คูปอง'}
                          </Button>
                        </div>
                        {couponError && (
                          <p
                            className="mt-1.5 text-xs"
                            style={{ color: palette.primary }}
                          >
                            {couponError}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                <Button
                  asChild
                  size="lg"
                  className="mt-6 h-auto w-full rounded-md py-3.5 px-4 text-base font-semibold"
                  style={{
                    background: palette.primary,
                    color: palette.primaryFg,
                  }}
                >
                  <Link href={`/stores/${store.slug}/checkout`}>
                    {checkoutLabel}
                  </Link>
                </Button>

                <p
                  className="mt-4 text-center text-xs flex items-center justify-center gap-1.5"
                  style={{ color: palette.inkMuted }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ชำระเงินปลอดภัย • ปกป้องข้อมูลด้วย SSL
                </p>
              </Card>

              {/* Trust strip */}
              {showTrust && (
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  {trustStrip.map((item, i) => {
                    const Icon = ICONS[item.icon ?? 'truck'];
                    return (
                      <Card
                        key={i}
                        className="flex flex-col items-center gap-1 rounded-lg border-0 py-2 shadow-none"
                        style={{
                          background: `color-mix(in srgb, ${palette.surface} 88%, transparent)`,
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: palette.primary }}
                        />
                        <span
                          className="text-[11px]"
                          style={{ color: palette.inkMuted }}
                        >
                          {item.label}
                        </span>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Empty-cart sub-component
 * ────────────────────────────────────────────────────────────── */

function EmptyCart({
  storeSlug,
  palette,
  message,
  subMessage,
  ctaLabel,
}: {
  storeSlug: string;
  palette: ResolvedPalette;
  message: string;
  subMessage: string;
  ctaLabel: string;
}) {
  return (
    <Card
      className="text-center py-24 rounded-2xl border border-dashed bg-transparent shadow-none"
      style={{ borderColor: palette.border }}
    >
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"
        style={{
          background: `color-mix(in srgb, ${palette.primary} 12%, transparent)`,
          color: palette.primary,
        }}
      >
        <ShoppingBag className="w-8 h-8" />
      </div>
      <p
        className="text-base font-medium"
        style={{ color: palette.ink }}
      >
        {message}
      </p>
      <p className="text-sm mt-2" style={{ color: palette.inkMuted }}>
        {subMessage}
      </p>
      <Button
        asChild
        className="mt-6 h-auto rounded-md px-6 py-2.5 text-sm font-medium"
        style={{ background: palette.primary, color: palette.primaryFg }}
      >
        <Link href={`/stores/${storeSlug}/category`}>{ctaLabel}</Link>
      </Button>
    </Card>
  );
}
