'use client';

/**
 * carbon-era-cameras — bespoke Cart page.
 *
 * Visual concept: vintage camera SPEC SHEET. Each line item reads like
 * a condition report row pulled from the storefront's 24-point
 * inspection — uppercase tracking, hairline rules, monochrome stack
 * with a single warm amber stamp for discounts. Layout is a 2-col
 * desktop grid (line items 7/12 + sticky summary 5/12) collapsing to
 * a single column on mobile. Empty state is a film-strip frame with
 * a hand-stamped feel ("No exposures in this roll").
 *
 * Wiring
 * ──────
 * - useCart from `@/lib/store/cart` (per-store cart isolated via
 *   the storeSlug filter — same hook the rest of the storefront
 *   uses for ShopHeader badge, PDP add-to-cart, etc.).
 * - free-ship threshold 990 / flat shipping 50 — matches the
 *   marketplace default the StoreCartClient enforces.
 * - Coupons: types/codes are persisted to localStorage under a
 *   per-store key. On mount we hydrate by POSTing each saved code
 *   to `/api/coupons/preview` so the displayed discount is always
 *   derived from the authoritative DB row. The `calculate()` helper
 *   from `@/lib/coupons/calculator` runs against the hydrated
 *   `Coupon[]` to compute totals, mirroring server-side checkout.
 *   `/api/coupons/preview` may be unavailable on some deployments;
 *   we silently treat any non-ok response as "code rejected" so
 *   stale codes don't block a checkout.
 *
 * No registry / adapter / shared-cart changes — Cart.tsx is the
 * only file the bespoke surface touches. Everything else stays on
 * the existing scaffold so a future generic upgrade still flows
 * through this theme.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  ChevronLeft,
  Minus,
  Plus,
  ShieldCheck,
  Tag,
  Trash2,
  Truck,
  X as XIcon,
  Aperture,
  Receipt,
  ScanLine,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { calculate } from '@/lib/coupons/calculator';
import type { Coupon } from '@/lib/coupons/types';
import { formatTHB } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

// All headings + body sit on the two Thai-safe Google fonts the
// theme already loads (Kanit for stamp/headline, Prompt for body).
// We intentionally do NOT use a real monospace face — Thai glyphs
// render badly in mono — and instead lean on uppercase + wide
// tracking to read like a spec sheet.
const FONT_HEADING = 'var(--font-kanit), "Kanit", system-ui, sans-serif';
const FONT_BODY = 'var(--font-prompt), "Prompt", system-ui, sans-serif';

const COUPON_ERRORS: Record<string, string> = {
  not_found: 'ไม่พบรหัสคูปองนี้',
  expired: 'รหัสคูปองหมดอายุแล้ว',
  not_started: 'รหัสคูปองยังไม่เริ่มใช้งาน',
  min_spend_not_met: 'ยอดสั่งซื้อยังไม่ถึงขั้นต่ำที่กำหนด',
  no_eligible_items: 'ไม่มีสินค้าที่ใช้คูปองนี้ได้',
  already_applied: 'ใช้รหัสคูปองนี้ไปแล้ว',
  slot_conflict: 'ใช้คูปองชนกับคูปองอื่นที่กดไว้',
  payment_method_mismatch: 'รหัสคูปองใช้กับวิธีชำระเงินที่เลือกไม่ได้',
  usage_limit_exceeded: 'รหัสคูปองนี้ถูกใช้ครบจำนวนแล้ว',
};

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

interface CartProps {
  store: StoreLite;
  // Server passes an empty array — the actual cart lines come from
  // the zustand store on the client (per-store filter on slug).
  // We accept the prop to satisfy the registry shape but ignore it.
  items?: unknown;
}

// localStorage key holding the per-store list of typed coupon codes.
// Kept local to this file so we don't have to evolve the global
// cart store — the persisted state is just a string[] of codes per
// store slug, which the calculator + preview endpoint can rehydrate
// on demand.
const COUPON_STORAGE_KEY = 'cec-cart-coupon-codes';

function readPersistedCodes(slug: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(COUPON_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return Array.isArray(parsed?.[slug]) ? parsed[slug] : [];
  } catch {
    return [];
  }
}

function writePersistedCodes(slug: string, codes: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(COUPON_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    if (codes.length === 0) {
      delete parsed[slug];
    } else {
      parsed[slug] = codes;
    }
    window.localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* localStorage full / disabled — silently degrade */
  }
}

export default function CarbonEraCamerasCart({ store }: CartProps) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ── Coupon state (local — codes persisted to localStorage) ──────
  const [codes, setCodes] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [draftCode, setDraftCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  // Re-read persisted codes once we know we're on the client so
  // SSR + first paint can't disagree.
  useEffect(() => {
    setCodes(readPersistedCodes(store.slug));
  }, [store.slug]);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const shippingBefore =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;

  // Build CartItem-shaped objects for the calculator. The calculator
  // only reads price / qty / storeId / productId — we synthesize the
  // rest from the CartLineDisplay shape this theme persists.
  const calcItems = useMemo(
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
    [lines, store.id],
  );

  const calculation = useMemo(() => {
    if (lines.length === 0 || coupons.length === 0) return null;
    return calculate({
      items: calcItems,
      coupons,
      shippingPerStore: { [store.id]: shippingBefore },
    });
  }, [calcItems, coupons, lines.length, store.id, shippingBefore]);

  const totalDiscount = calculation?.totalDiscount ?? 0;
  const shippingAfter =
    calculation?.shippingAfterDiscount[store.id] ?? shippingBefore;
  const total = Math.max(0, subtotal + shippingAfter - totalDiscount);
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const progressPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Rehydrate Coupon objects whenever the persisted codes change
  // (apply, remove, reload, second tab). Each request is independent
  // so a network error on one coupon doesn't poison the others.
  useEffect(() => {
    if (codes.length === 0) {
      setCoupons([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const fetched: Coupon[] = [];
      for (const code of codes) {
        try {
          const res = await fetch('/api/coupons/preview', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              code,
              items: calcItems,
              shippingPerStore: { [store.id]: shippingBefore },
              existingCodes: fetched.map((c) => c.code),
            }),
          });
          if (!res.ok) continue;
          const data = (await res.json()) as
            | { ok: true; coupon: Coupon }
            | { ok: false; reason: string };
          if (data.ok) fetched.push(data.coupon);
        } catch {
          /* server may not expose /api/coupons/preview yet — keep
             the typed code persisted but render it as unverified */
        }
      }
      if (!cancelled) setCoupons(fetched);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codes.join('|'), lines.length, store.id, shippingBefore]);

  async function handleApplyCoupon() {
    const code = draftCode.trim().toUpperCase();
    if (!code) return;
    if (codes.includes(code)) {
      setCouponError(COUPON_ERRORS.already_applied);
      return;
    }
    setCouponBusy(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code,
          items: calcItems,
          shippingPerStore: { [store.id]: shippingBefore },
          existingCodes: codes,
        }),
      });
      if (!res.ok) {
        // Preview endpoint not deployed yet — accept the code
        // optimistically. The checkout API is authoritative and
        // will reject invalid codes on submit.
        const next = [...codes, code];
        setCodes(next);
        writePersistedCodes(store.slug, next);
        setDraftCode('');
        return;
      }
      const data = (await res.json()) as
        | { ok: true; coupon: Coupon }
        | { ok: false; reason: string };
      if (data.ok) {
        const next = [...codes, code];
        setCodes(next);
        writePersistedCodes(store.slug, next);
        setDraftCode('');
      } else {
        setCouponError(COUPON_ERRORS[data.reason] ?? 'ใช้คูปองไม่สำเร็จ');
      }
    } catch {
      // Network unreachable — be generous and let them try at
      // checkout (server is authoritative). Persist the code so
      // it carries through the navigation.
      const next = [...codes, code];
      setCodes(next);
      writePersistedCodes(store.slug, next);
      setDraftCode('');
    } finally {
      setCouponBusy(false);
    }
  }

  function handleRemoveCoupon(code: string) {
    const next = codes.filter((c) => c !== code);
    setCodes(next);
    writePersistedCodes(store.slug, next);
    setCouponError(null);
  }

  // Suspense-style placeholder before zustand has rehydrated; without
  // this the first paint flashes "empty roll" even when the buyer has
  // items in their cart.
  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: 'var(--shop-bg, #fafafa)' }}
      />
    );
  }

  // ── Empty state — film canister + spec stamp ──────────────────
  if (lines.length === 0) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: 'var(--shop-bg, #fafafa)',
          color: 'var(--shop-ink, #0a0a0a)',
          fontFamily: FONT_BODY,
        }}
      >
        <main className="mx-auto max-w-3xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] hover:opacity-70"
            style={{
              fontFamily: FONT_HEADING,
              color: 'var(--shop-ink-muted, #52525b)',
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับสู่ร้าน
          </Link>

          <div
            className="mt-12 border p-10 sm:p-16 text-center"
            style={{
              borderColor: 'var(--shop-border, #27272a)',
              background: '#ffffff',
            }}
          >
            <div
              className="mx-auto mb-8 inline-flex h-24 w-24 items-center justify-center border"
              style={{ borderColor: 'var(--shop-border, #27272a)' }}
            >
              <Aperture
                className="h-12 w-12"
                style={{ color: 'var(--shop-ink, #0a0a0a)' }}
                strokeWidth={1.25}
              />
            </div>
            <p
              className="text-[10px] uppercase tracking-[0.32em]"
              style={{
                fontFamily: FONT_HEADING,
                color: 'var(--shop-ink-muted, #52525b)',
              }}
            >
              Roll · 000/036 · Unexposed
            </p>
            <h1
              className="mt-3 text-3xl sm:text-4xl uppercase tracking-tight"
              style={{
                fontFamily: FONT_HEADING,
                color: 'var(--shop-ink, #0a0a0a)',
                fontWeight: 800,
              }}
            >
              ตะกร้าของคุณว่างเปล่า
            </h1>
            <p
              className="mt-3 max-w-md mx-auto text-sm leading-relaxed"
              style={{ color: 'var(--shop-ink-muted, #52525b)' }}
            >
              ยังไม่มีกล้องคัดเกรดในตะกร้า เลือกชมรายการกล้องฟิล์ม Leica,
              Hasselblad, Rolleiflex ที่ผ่านการตรวจสภาพ 24 จุดของเรา
            </p>
            <Link
              href={`/stores/${store.slug}`}
              className="mt-8 inline-flex items-center gap-2 px-8 py-3 text-xs uppercase tracking-[0.22em]"
              style={{
                fontFamily: FONT_HEADING,
                fontWeight: 700,
                background: 'var(--shop-ink, #0a0a0a)',
                color: 'var(--shop-bg, #fafafa)',
              }}
            >
              <Camera className="h-4 w-4" />
              เริ่มเลือกชม
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Main cart layout — items + sticky summary ────────────────
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--shop-bg, #fafafa)',
        color: 'var(--shop-ink, #0a0a0a)',
        fontFamily: FONT_BODY,
      }}
    >
      <main className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        {/* ── Header band — back link + roll counter ─────────────── */}
        <div className="mb-8 sm:mb-10">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] hover:opacity-70"
            style={{
              fontFamily: FONT_HEADING,
              color: 'var(--shop-ink-muted, #52525b)',
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับสู่ร้าน
          </Link>
          <div
            className="mt-5 flex flex-wrap items-end justify-between gap-3 border-b pb-5"
            style={{ borderColor: 'var(--shop-border, #27272a)' }}
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.32em]"
                style={{
                  fontFamily: FONT_HEADING,
                  color: 'var(--shop-ink-muted, #52525b)',
                }}
              >
                Order · Specification Sheet
              </p>
              <h1
                className="mt-1 text-3xl sm:text-4xl uppercase tracking-tight"
                style={{
                  fontFamily: FONT_HEADING,
                  fontWeight: 800,
                }}
              >
                ตะกร้าสินค้า
              </h1>
            </div>
            <p
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{
                fontFamily: FONT_HEADING,
                color: 'var(--shop-ink-muted, #52525b)',
              }}
            >
              Frame {String(itemCount).padStart(3, '0')} / {lines.length} item
              {lines.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* ── Free-shipping spec strip ─────────────────────────── */}
        <div
          className="mb-8 border p-4 sm:p-5"
          style={{
            borderColor: 'var(--shop-border, #27272a)',
            background: '#ffffff',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ScanLine
                className="h-4 w-4"
                style={{ color: 'var(--shop-ink, #0a0a0a)' }}
              />
              <p
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ fontFamily: FONT_HEADING, fontWeight: 700 }}
              >
                Shipping Threshold ฿
                {FREE_SHIPPING_THRESHOLD.toLocaleString()}
              </p>
            </div>
            {remainingForFreeShipping > 0 ? (
              <p
                className="text-xs"
                style={{ color: 'var(--shop-ink-muted, #52525b)' }}
              >
                เพิ่มอีก{' '}
                <span
                  className="font-semibold"
                  style={{ color: 'var(--shop-ink, #0a0a0a)' }}
                >
                  {formatTHB(remainingForFreeShipping)}
                </span>{' '}
                เพื่อรับส่งฟรี
              </p>
            ) : (
              <p
                className="text-xs uppercase tracking-[0.22em]"
                style={{
                  fontFamily: FONT_HEADING,
                  fontWeight: 700,
                  color: 'var(--shop-primary, #0a0a0a)',
                }}
              >
                ✓ Qualified · Free Shipping
              </p>
            )}
          </div>
          <div
            className="mt-3 h-[3px] w-full"
            style={{ background: '#f4f4f5' }}
            aria-hidden
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: 'var(--shop-ink, #0a0a0a)',
              }}
            />
          </div>
        </div>

        {/* ── Two-column layout ────────────────────────────────── */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
          {/* ── Line items — spec rows ─────────────────────────── */}
          <section
            aria-labelledby="cart-items"
            className="lg:col-span-7 space-y-4"
          >
            <h2 id="cart-items" className="sr-only">
              รายการสินค้าในตะกร้า
            </h2>

            <div
              className="border bg-white"
              style={{ borderColor: 'var(--shop-border, #27272a)' }}
            >
              {/* Spec-sheet header row */}
              <div
                className="hidden sm:grid grid-cols-[5rem_1fr_8rem_5rem_2rem] gap-4 border-b px-4 py-3 text-[10px] uppercase tracking-[0.22em]"
                style={{
                  borderColor: 'var(--shop-border, #27272a)',
                  fontFamily: FONT_HEADING,
                  color: 'var(--shop-ink-muted, #52525b)',
                  fontWeight: 700,
                }}
              >
                <span>Frame</span>
                <span>Item · Specification</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Price</span>
                <span aria-label="actions" />
              </div>

              <ul>
                {lines.map((l, idx) => (
                  <li
                    key={`${l.productId}-${l.storeSlug}`}
                    className="grid grid-cols-[5rem_1fr] sm:grid-cols-[5rem_1fr_8rem_5rem_2rem] gap-4 border-b px-4 py-4 last:border-b-0"
                    style={{ borderColor: 'var(--shop-border, #27272a)' }}
                  >
                    {/* Frame thumbnail */}
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="relative block aspect-square overflow-hidden"
                      style={{
                        background: '#f4f4f5',
                        border: '1px solid var(--shop-border, #27272a)',
                      }}
                    >
                      {l.imageUrl ? (
                        // Using <img> intentionally — bespoke cart skips
                        // next/image so we don't bind to a particular
                        // image loader at this surface.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          className="h-full w-full object-cover mix-blend-multiply"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Camera className="h-6 w-6 opacity-30" />
                        </div>
                      )}
                      <span
                        className="absolute top-1 left-1 px-1 py-px text-[8px] uppercase tracking-[0.18em]"
                        style={{
                          fontFamily: FONT_HEADING,
                          fontWeight: 700,
                          background: 'var(--shop-ink, #0a0a0a)',
                          color: 'var(--shop-bg, #fafafa)',
                        }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </Link>

                    {/* Item info + mobile controls */}
                    <div className="min-w-0 sm:contents">
                      <div className="min-w-0">
                        <Link
                          href={`/stores/${store.slug}/products/${l.productId}`}
                          className="block text-sm sm:text-base leading-snug hover:underline line-clamp-2"
                          style={{
                            fontFamily: FONT_HEADING,
                            fontWeight: 700,
                            color: 'var(--shop-ink, #0a0a0a)',
                          }}
                        >
                          {l.title}
                        </Link>
                        <p
                          className="mt-1 text-[10px] uppercase tracking-[0.22em]"
                          style={{
                            fontFamily: FONT_HEADING,
                            color: 'var(--shop-ink-muted, #52525b)',
                          }}
                        >
                          SKU · CEC-
                          {l.productId.replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase().padStart(6, '0')}
                        </p>
                        <p
                          className="mt-1 text-[11px]"
                          style={{ color: 'var(--shop-ink-muted, #52525b)' }}
                        >
                          จำหน่ายโดย {l.storeName}
                        </p>

                        {/* Mobile-only price + qty stepper */}
                        <div className="mt-3 flex items-center justify-between sm:hidden">
                          <QtyStepper
                            value={l.qty}
                            onDecrement={() =>
                              setQty(l.productId, l.qty - 1, store.slug)
                            }
                            onIncrement={() =>
                              setQty(l.productId, l.qty + 1, store.slug)
                            }
                            onChange={(n) =>
                              setQty(l.productId, n, store.slug)
                            }
                            label={l.title}
                          />
                          <span
                            className="text-sm font-semibold"
                            style={{ color: 'var(--shop-ink, #0a0a0a)' }}
                          >
                            {formatTHB(l.priceTHB * l.qty)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(l.productId, store.slug)}
                          className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] hover:opacity-70 sm:hidden"
                          style={{
                            fontFamily: FONT_HEADING,
                            color: 'var(--shop-ink-muted, #52525b)',
                          }}
                          aria-label={`ลบ ${l.title} ออกจากตะกร้า`}
                        >
                          <Trash2 className="h-3 w-3" />
                          ลบ
                        </button>
                      </div>

                      {/* Desktop qty cell */}
                      <div className="hidden sm:flex items-center justify-center">
                        <QtyStepper
                          value={l.qty}
                          onDecrement={() =>
                            setQty(l.productId, l.qty - 1, store.slug)
                          }
                          onIncrement={() =>
                            setQty(l.productId, l.qty + 1, store.slug)
                          }
                          onChange={(n) => setQty(l.productId, n, store.slug)}
                          label={l.title}
                        />
                      </div>

                      {/* Desktop price cell */}
                      <div
                        className="hidden sm:flex items-center justify-end text-sm font-semibold tabular-nums"
                        style={{ color: 'var(--shop-ink, #0a0a0a)' }}
                      >
                        {formatTHB(l.priceTHB * l.qty)}
                      </div>

                      {/* Desktop remove cell */}
                      <div className="hidden sm:flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => remove(l.productId, store.slug)}
                          className="inline-flex h-8 w-8 items-center justify-center border hover:opacity-70 transition"
                          style={{
                            borderColor: 'var(--shop-border, #27272a)',
                            color: 'var(--shop-ink-muted, #52525b)',
                          }}
                          aria-label={`ลบ ${l.title} ออกจากตะกร้า`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Continue-shopping inline link */}
            <Link
              href={`/stores/${store.slug}`}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] hover:opacity-70"
              style={{
                fontFamily: FONT_HEADING,
                fontWeight: 700,
                color: 'var(--shop-ink, #0a0a0a)',
              }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              เลือกชมกล้องเพิ่มเติม
            </Link>
          </section>

          {/* ── Sticky summary sidebar ─────────────────────────── */}
          <aside
            aria-labelledby="cart-summary"
            className="mt-10 lg:mt-0 lg:col-span-5 lg:sticky lg:top-24"
          >
            <h2 id="cart-summary" className="sr-only">
              สรุปคำสั่งซื้อ
            </h2>

            <div
              className="border bg-white"
              style={{ borderColor: 'var(--shop-border, #27272a)' }}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{ borderColor: 'var(--shop-border, #27272a)' }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.32em]"
                  style={{
                    fontFamily: FONT_HEADING,
                    fontWeight: 700,
                    color: 'var(--shop-ink-muted, #52525b)',
                  }}
                >
                  Inspection Total
                </p>
                <Receipt
                  className="h-4 w-4"
                  style={{ color: 'var(--shop-ink-muted, #52525b)' }}
                />
              </div>

              {/* Coupon entry */}
              <div
                className="border-b px-5 py-4 space-y-3"
                style={{ borderColor: 'var(--shop-border, #27272a)' }}
              >
                <label
                  htmlFor="coupon-code"
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em]"
                  style={{
                    fontFamily: FONT_HEADING,
                    fontWeight: 700,
                    color: 'var(--shop-ink, #0a0a0a)',
                  }}
                >
                  <Tag className="h-3 w-3" />
                  ใช้รหัสคูปอง
                </label>
                <div className="flex items-stretch gap-2">
                  <input
                    id="coupon-code"
                    type="text"
                    value={draftCode}
                    onChange={(e) => {
                      setDraftCode(e.target.value);
                      setCouponError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="WELCOME100"
                    className="flex-1 border px-3 py-2 text-xs uppercase tracking-[0.18em] focus:outline-none focus:border-black"
                    style={{
                      borderColor: 'var(--shop-border, #27272a)',
                      background: '#fafafa',
                      color: 'var(--shop-ink, #0a0a0a)',
                    }}
                    aria-describedby={couponError ? 'coupon-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponBusy || draftCode.trim().length === 0}
                    className="px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: FONT_HEADING,
                      fontWeight: 700,
                      background: 'var(--shop-ink, #0a0a0a)',
                      color: 'var(--shop-bg, #fafafa)',
                    }}
                  >
                    {couponBusy ? '...' : 'ใช้'}
                  </button>
                </div>
                {couponError && (
                  <p
                    id="coupon-error"
                    className="text-[11px]"
                    style={{ color: '#b91c1c' }}
                  >
                    {couponError}
                  </p>
                )}

                {/* Applied coupon chips */}
                {codes.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {codes.map((code) => {
                      const hydrated = coupons.find((c) => c.code === code);
                      const applied = hydrated
                        ? calculation?.appliedCoupons.find(
                            (ac) => ac.couponId === hydrated.id,
                          )
                        : undefined;
                      return (
                        <li
                          key={code}
                          className="flex items-center justify-between gap-2 border px-2.5 py-1.5"
                          style={{
                            borderColor: '#fcd34d',
                            background: '#fef3c7',
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-[11px] uppercase tracking-[0.22em] truncate"
                              style={{
                                fontFamily: FONT_HEADING,
                                fontWeight: 700,
                                color: '#78350f',
                              }}
                            >
                              {code}
                            </p>
                            {hydrated?.title && (
                              <p
                                className="text-[10px] truncate"
                                style={{ color: '#92400e' }}
                              >
                                {hydrated.title}
                              </p>
                            )}
                            {!hydrated && (
                              <p
                                className="text-[10px] truncate"
                                style={{ color: '#92400e' }}
                              >
                                จะตรวจสอบในขั้นชำระเงิน
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {applied && (
                              <span
                                className="text-[11px] font-semibold tabular-nums"
                                style={{ color: '#78350f' }}
                              >
                                -{formatTHB(applied.amount)}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveCoupon(code)}
                              aria-label={`ลบรหัส ${code}`}
                              className="p-1 hover:opacity-70 transition"
                              style={{ color: '#78350f' }}
                            >
                              <XIcon
                                className="h-3 w-3"
                                strokeWidth={2.5}
                              />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Totals breakdown */}
              <dl
                className="px-5 py-4 space-y-3 text-sm border-b"
                style={{ borderColor: 'var(--shop-border, #27272a)' }}
              >
                <div className="flex items-center justify-between">
                  <dt
                    className="text-[11px] uppercase tracking-[0.22em]"
                    style={{
                      fontFamily: FONT_HEADING,
                      color: 'var(--shop-ink-muted, #52525b)',
                    }}
                  >
                    Subtotal ({itemCount} ชิ้น)
                  </dt>
                  <dd
                    className="tabular-nums font-medium"
                    style={{ color: 'var(--shop-ink, #0a0a0a)' }}
                  >
                    {formatTHB(subtotal)}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt
                    className="text-[11px] uppercase tracking-[0.22em]"
                    style={{
                      fontFamily: FONT_HEADING,
                      color: 'var(--shop-ink-muted, #52525b)',
                    }}
                  >
                    Shipping
                  </dt>
                  <dd
                    className="tabular-nums font-medium"
                    style={{
                      color:
                        shippingAfter === 0
                          ? 'var(--shop-primary, #0a0a0a)'
                          : 'var(--shop-ink, #0a0a0a)',
                    }}
                  >
                    {shippingAfter === 0 ? 'ฟรี' : formatTHB(shippingAfter)}
                  </dd>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <dt
                      className="text-[11px] uppercase tracking-[0.22em]"
                      style={{
                        fontFamily: FONT_HEADING,
                        color: '#78350f',
                      }}
                    >
                      ส่วนลดคูปอง
                    </dt>
                    <dd
                      className="tabular-nums font-semibold"
                      style={{ color: '#78350f' }}
                    >
                      -{formatTHB(totalDiscount)}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="px-5 py-4 flex items-baseline justify-between">
                <span
                  className="text-[11px] uppercase tracking-[0.32em]"
                  style={{ fontFamily: FONT_HEADING, fontWeight: 800 }}
                >
                  Total
                </span>
                <span
                  className="text-2xl tabular-nums"
                  style={{
                    fontFamily: FONT_HEADING,
                    fontWeight: 800,
                    color: 'var(--shop-ink, #0a0a0a)',
                  }}
                >
                  {formatTHB(total)}
                </span>
              </div>

              <div className="px-5 pb-5">
                <Link
                  href={`/stores/${store.slug}/checkout`}
                  className="inline-flex w-full items-center justify-center gap-2 px-4 py-3.5 text-xs uppercase tracking-[0.22em] transition hover:opacity-90"
                  style={{
                    fontFamily: FONT_HEADING,
                    fontWeight: 700,
                    background: 'var(--shop-ink, #0a0a0a)',
                    color: 'var(--shop-bg, #fafafa)',
                  }}
                >
                  ดำเนินการชำระเงิน
                </Link>
                <p
                  className="mt-3 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-center"
                  style={{
                    fontFamily: FONT_HEADING,
                    color: 'var(--shop-ink-muted, #52525b)',
                  }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secured by Basketplace
                </p>
              </div>
            </div>

            {/* Trust spec strip — mirrors the 24-point inspection voice */}
            <ul
              className="mt-5 border bg-white"
              style={{ borderColor: 'var(--shop-border, #27272a)' }}
            >
              <li
                className="flex items-center gap-3 border-b px-4 py-3 text-[11px]"
                style={{
                  borderColor: 'var(--shop-border, #27272a)',
                  color: 'var(--shop-ink-muted, #52525b)',
                }}
              >
                <Truck className="h-4 w-4 shrink-0" />
                <span>
                  <span
                    className="uppercase tracking-[0.18em]"
                    style={{
                      fontFamily: FONT_HEADING,
                      fontWeight: 700,
                      color: 'var(--shop-ink, #0a0a0a)',
                    }}
                  >
                    Shipping
                  </span>{' '}
                  · ส่งฟรีเมื่อยอด {formatTHB(FREE_SHIPPING_THRESHOLD)}+
                </span>
              </li>
              <li
                className="flex items-center gap-3 border-b px-4 py-3 text-[11px]"
                style={{
                  borderColor: 'var(--shop-border, #27272a)',
                  color: 'var(--shop-ink-muted, #52525b)',
                }}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  <span
                    className="uppercase tracking-[0.18em]"
                    style={{
                      fontFamily: FONT_HEADING,
                      fontWeight: 700,
                      color: 'var(--shop-ink, #0a0a0a)',
                    }}
                  >
                    Warranty
                  </span>{' '}
                  · รับประกันชัตเตอร์ 90 วัน
                </span>
              </li>
              <li
                className="flex items-center gap-3 px-4 py-3 text-[11px]"
                style={{ color: 'var(--shop-ink-muted, #52525b)' }}
              >
                <ScanLine className="h-4 w-4 shrink-0" />
                <span>
                  <span
                    className="uppercase tracking-[0.18em]"
                    style={{
                      fontFamily: FONT_HEADING,
                      fontWeight: 700,
                      color: 'var(--shop-ink, #0a0a0a)',
                    }}
                  >
                    Inspection
                  </span>{' '}
                  · ผ่านการตรวจสภาพ 24 จุด
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// QtyStepper — bordered pill with +/− buttons + numeric input.
// Hidden native spin buttons so the custom UI is the single source
// of truth, matching the qty stepper UX the rest of the storefront
// uses (see lib/store/cart.ts callers).
// ────────────────────────────────────────────────────────────────
interface QtyStepperProps {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onChange: (next: number) => void;
  label: string;
}

function QtyStepper({
  value,
  onDecrement,
  onIncrement,
  onChange,
  label,
}: QtyStepperProps) {
  return (
    <div
      className="inline-flex h-9 items-center overflow-hidden border"
      style={{
        borderColor: 'var(--shop-border, #27272a)',
        background: '#ffffff',
      }}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={value <= 1}
        aria-label={`ลดจำนวน ${label}`}
        className="inline-flex h-9 w-8 items-center justify-center disabled:opacity-40"
        style={{ color: 'var(--shop-ink, #0a0a0a)' }}
      >
        <Minus className="h-3 w-3" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={value}
        onChange={(e) =>
          onChange(Math.max(1, parseInt(e.target.value, 10) || 1))
        }
        className="h-9 w-10 border-x bg-transparent text-center text-sm tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        style={{
          color: 'var(--shop-ink, #0a0a0a)',
          borderColor: 'var(--shop-border, #27272a)',
        }}
        aria-label={`จำนวน ${label}`}
      />
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`เพิ่มจำนวน ${label}`}
        className="inline-flex h-9 w-8 items-center justify-center"
        style={{ color: 'var(--shop-ink, #0a0a0a)' }}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
