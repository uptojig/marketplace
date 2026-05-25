'use client';

/**
 * atelier-27 — bespoke Cart page (trust · curator gallery premium).
 *
 * Design language mirrors the chrome (Header / Footer / AnnouncementStrip):
 *   - Cream canvas (#fafaf9) over ink (#1c1917) with stone-warm neutrals
 *     (#78716c / #a8a29e / #e7e5e4 / #f5f5f4).
 *   - Brass-gold accent (#b8a37a) reserved for the free-ship progress
 *     fill and the line under the grand total — a single curatorial
 *     highlight color, never decorative.
 *   - Hair-thin dividers, generous whitespace, asymmetric two-column
 *     layout (7/5 items / summary on desktop, stacked on mobile).
 *   - Kanit Light tracking-[0.35em] uppercase for display labels;
 *     Prompt for body copy and numeric totals.
 *
 * Wiring (per CartProps in lib/templates/types.ts):
 *   - `items` arrives empty from the server dispatcher; the real lines
 *     come from useCart(slug) on the client after hydration.
 *   - free-ship threshold defaults to 990 THB if not provided.
 *   - flat shipping defaults to 50 THB below threshold.
 *
 * Coupon flow:
 *   - On mount we hydrate any claimed coupon IDs from useUserCouponsStore
 *     and POST to /api/coupons/preview with the live cart payload so the
 *     server can return the authoritative AppliedCoupon[] list.
 *   - The user can type a code in the inline input; we POST it to
 *     /api/coupons/preview and on `{ ok: true, coupon }` we add it to
 *     the local applied list.
 *   - Removing a coupon strips it from local state (and unclaims it
 *     from the wallet store).
 *   - Final subtotal / shipping / discount / total numbers come from
 *     calculate(...) in @/lib/coupons/calculator so the math stays in
 *     sync with the rest of basketplace.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useUserCouponsStore } from '@/lib/coupons/store';
import { calculate } from '@/lib/coupons/calculator';
import type { Coupon } from '@/lib/coupons/types';
import { formatTHB } from '@/lib/utils';
import type { CartProps } from '@/lib/templates/types';

const FREE_SHIPPING_DEFAULT = 990;
const FLAT_SHIPPING_DEFAULT = 50;

// Curator gallery palette — kept hard-coded inside the component so the
// theme cascade (--shop-*) can still tint surfaces underneath, but the
// bespoke editorial palette wins for the cart canvas itself.
const INK = '#1c1917';
const INK_SOFT = '#44403c';
const STONE_MUTED = '#78716c';
const STONE_FAINT = '#a8a29e';
const STONE_LINE = '#e7e5e4';
const CREAM = '#fafaf9';
const CREAM_SOFT = '#f5f5f4';
const BRASS = '#b8a37a';
const BRASS_SOFT = '#d9c9a6';

export type AtelierCartProps = CartProps;

export function Cart({
  store,
  freeShippingThreshold = FREE_SHIPPING_DEFAULT,
  flatShippingTHB = FLAT_SHIPPING_DEFAULT,
}: AtelierCartProps) {
  // ── Cart hydration ────────────────────────────────────────────────
  // The server dispatcher passes `items: []`; the source of truth is
  // useCart(slug) on the client. Defer rendering until mount so SSR
  // markup matches the first client paint and zustand persist has had
  // a chance to rehydrate from localStorage.
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  // ── Coupon hydration ──────────────────────────────────────────────
  // 1. On mount, take whatever the user has already claimed from the
  //    wallet store and ask /api/coupons/preview to revalidate them
  //    against the live cart payload. Server returns the canonical
  //    Coupon objects (with current validity, slot, scope).
  // 2. As the cart mutates we re-POST so amounts stay accurate.
  // 3. Manual code entry POSTs the typed code; on `{ ok: true }` we
  //    append the returned coupon to local applied list and persist
  //    the id to the wallet store so it survives reloads.
  const claimedIds = useUserCouponsStore((s) => s.claimedCouponIds);
  const claim = useUserCouponsStore((s) => s.claim);
  const unclaim = useUserCouponsStore((s) => s.unclaim);

  const [appliedCoupons, setAppliedCoupons] = useState<Coupon[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Items shape the calculator expects (CartItem from lib/cart/types).
  const calcItems = useMemo(
    () =>
      lines.map((l) => ({
        id: `${l.storeSlug}:${l.productId}`,
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

  const subtotalRaw = useMemo(
    () => lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0),
    [lines],
  );
  const shippingPerStore = useMemo<Record<string, number>>(
    () => ({
      [store.id]: subtotalRaw >= freeShippingThreshold ? 0 : flatShippingTHB,
    }),
    [store.id, subtotalRaw, freeShippingThreshold, flatShippingTHB],
  );

  // ── Re-hydrate claimed coupons whenever cart changes ──────────────
  useEffect(() => {
    if (!mounted) return;
    if (claimedIds.length === 0) {
      setAppliedCoupons([]);
      return;
    }
    if (lines.length === 0) {
      setAppliedCoupons([]);
      return;
    }

    let cancelled = false;
    (async () => {
      const next: Coupon[] = [];
      for (const id of claimedIds) {
        try {
          const res = await fetch('/api/coupons/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              couponId: id,
              items: calcItems,
              shippingPerStore,
              existingCouponIds: next.map((c) => c.id),
            }),
          });
          if (!res.ok) continue;
          const data = (await res.json()) as
            | { ok: true; coupon: Coupon }
            | { ok: false; reason: string };
          if (data && 'ok' in data && data.ok) {
            next.push(data.coupon);
          }
        } catch {
          // Network failure shouldn't break the cart — silently skip.
        }
      }
      if (!cancelled) setAppliedCoupons(next);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, claimedIds, lines.length, subtotalRaw]);

  // ── Coupon math via the shared calculator ─────────────────────────
  const calcResult = useMemo(
    () =>
      calculate({
        items: calcItems,
        coupons: appliedCoupons,
        shippingPerStore,
      }),
    [calcItems, appliedCoupons, shippingPerStore],
  );

  const subtotal = calcResult.subtotal;
  const shipping = Object.values(calcResult.shippingAfterDiscount).reduce(
    (a, b) => a + b,
    0,
  );
  const discount = calcResult.totalDiscount;
  const total = calcResult.grandTotal;

  // ── Free-shipping progress (always against the raw subtotal so the
  //    nudge stays honest even after coupons land). ──────────────────
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotalRaw);
  const freeShipProgress = Math.min(
    100,
    Math.round((subtotalRaw / freeShippingThreshold) * 100),
  );
  const freeShipUnlocked = subtotalRaw >= freeShippingThreshold;

  // ── Handlers ──────────────────────────────────────────────────────
  const applyCode = useCallback(async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code || couponBusy) return;
    setCouponBusy(true);
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
      const data = (await res.json()) as
        | { ok: true; coupon: Coupon }
        | { ok: false; reason: string };
      if ('ok' in data && data.ok) {
        setAppliedCoupons((prev) => [...prev, data.coupon]);
        claim(data.coupon.id);
        setCodeInput('');
      } else {
        setCouponError('โค้ดนี้ใช้ไม่ได้');
      }
    } catch {
      setCouponError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setCouponBusy(false);
    }
  }, [codeInput, couponBusy, calcItems, shippingPerStore, appliedCoupons, claim]);

  const removeCoupon = useCallback(
    (couponId: string) => {
      setAppliedCoupons((prev) => prev.filter((c) => c.id !== couponId));
      unclaim(couponId);
    },
    [unclaim],
  );

  const checkoutUrl = `/stores/${store.slug}/checkout`;
  const shopUrl = `/stores/${store.slug}/category`;
  const homeUrl = `/stores/${store.slug}`;

  // ── Render guards ─────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: CREAM }}
        aria-hidden
      />
    );
  }

  if (lines.length === 0) {
    return <EmptyState homeUrl={homeUrl} shopUrl={shopUrl} />;
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: CREAM, color: INK }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-24">

        {/* ── Page header — editorial eyebrow ────────────────────── */}
        <div className="mb-12 lg:mb-16">
          <a
            href={shopUrl}
            className="inline-flex items-center gap-2 font-[family:var(--font-prompt)] text-[11px] tracking-[0.2em] uppercase mb-8 transition-colors duration-300"
            style={{ color: STONE_MUTED }}
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            เลือกซื้อสินค้าต่อ
          </a>
          <div className="flex items-baseline justify-between gap-6">
            <div>
              <span
                className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.5em] uppercase block mb-3"
                style={{ color: STONE_FAINT }}
              >
                Atelier Cart
              </span>
              <h1 className="font-[family:var(--font-kanit)] font-light text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.15] tracking-[0.08em]">
                ตะกร้าสินค้า
              </h1>
            </div>
            <span
              className="hidden sm:block font-[family:var(--font-prompt)] text-xs tracking-[0.18em] uppercase"
              style={{ color: STONE_MUTED }}
            >
              {lines.reduce((n, l) => n + l.qty, 0)} ชิ้น
            </span>
          </div>
        </div>

        {/* ── Hair-thin divider ──────────────────────────────────── */}
        <div className="h-px mb-12" style={{ background: STONE_LINE }} />

        {/* ── Two-column layout: 7/5 ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* ── Left: line items (7/12) ──────────────────────────── */}
          <section className="lg:col-span-7">

            {/* Free-shipping nudge */}
            <FreeShipBar
              progress={freeShipProgress}
              remaining={remainingForFreeShip}
              unlocked={freeShipUnlocked}
            />

            <ul className="mt-10">
              {lines.map((l, i) => (
                <li
                  key={`${l.storeSlug}:${l.productId}`}
                  className="grid grid-cols-12 gap-5 sm:gap-8 py-8"
                  style={{
                    borderTop: i === 0 ? `1px solid ${STONE_LINE}` : 'none',
                    borderBottom: `1px solid ${STONE_LINE}`,
                  }}
                >
                  {/* Image — 5/12 on mobile, 3/12 on desktop */}
                  <div className="col-span-5 sm:col-span-3">
                    <div
                      className="aspect-[3/4] overflow-hidden"
                      style={{ background: CREAM_SOFT }}
                    >
                      {l.imageUrl ? (
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center font-[family:var(--font-kanit)] text-[10px] tracking-[0.4em] uppercase"
                          style={{ color: STONE_FAINT }}
                        >
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body — fills remainder */}
                  <div className="col-span-7 sm:col-span-9 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <span
                          className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.35em] uppercase block mb-2"
                          style={{ color: STONE_FAINT }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-[family:var(--font-prompt)] font-normal text-base sm:text-lg leading-snug mb-1 truncate">
                          {l.title}
                        </h3>
                        <p
                          className="font-[family:var(--font-prompt)] text-xs tracking-wide"
                          style={{ color: STONE_MUTED }}
                        >
                          {formatTHB(l.priceTHB)} / ชิ้น
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-[family:var(--font-prompt)] text-base sm:text-lg tracking-wide">
                          {formatTHB(l.priceTHB * l.qty)}
                        </span>
                      </div>
                    </div>

                    {/* Qty + remove row */}
                    <div className="flex items-center justify-between mt-6">
                      <div
                        className="inline-flex items-center"
                        style={{ border: `1px solid ${STONE_LINE}` }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setQty(l.productId, Math.max(1, l.qty - 1), store.slug)
                          }
                          disabled={l.qty <= 1}
                          aria-label="ลดจำนวน"
                          className="w-10 h-10 flex items-center justify-center transition-colors duration-300 disabled:opacity-30"
                          style={{ color: INK_SOFT }}
                        >
                          <Minus size={14} strokeWidth={1.5} />
                        </button>
                        <span
                          className="w-10 text-center font-[family:var(--font-prompt)] text-sm tracking-wide tabular-nums"
                          aria-live="polite"
                        >
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                          aria-label="เพิ่มจำนวน"
                          className="w-10 h-10 flex items-center justify-center transition-colors duration-300"
                          style={{ color: INK_SOFT }}
                        >
                          <Plus size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(l.productId, store.slug)}
                        aria-label="ลบสินค้า"
                        className="inline-flex items-center gap-2 font-[family:var(--font-prompt)] text-[11px] tracking-[0.2em] uppercase transition-colors duration-300"
                        style={{ color: STONE_MUTED }}
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                        นำออก
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Continue shopping link, editorial */}
            <a
              href={shopUrl}
              className="group inline-flex items-center gap-3 mt-10 font-[family:var(--font-kanit)] font-light text-xs tracking-[0.35em] uppercase pb-2 transition-all duration-500"
              style={{
                color: INK,
                borderBottom: `1px solid ${INK}`,
              }}
            >
              เลือกซื้อต่อ
              <ArrowRight
                size={14}
                strokeWidth={1.25}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </a>
          </section>

          {/* ── Right: sticky order summary (5/12) ──────────────── */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div
                className="p-8 lg:p-10"
                style={{
                  background: CREAM_SOFT,
                  border: `1px solid ${STONE_LINE}`,
                }}
              >
                <span
                  className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.5em] uppercase block mb-2"
                  style={{ color: STONE_FAINT }}
                >
                  Order Summary
                </span>
                <h2 className="font-[family:var(--font-kanit)] font-light text-2xl tracking-[0.12em] uppercase mb-8">
                  สรุปคำสั่งซื้อ
                </h2>

                {/* ── Coupon block ─────────────────────────────── */}
                <CouponBlock
                  codeInput={codeInput}
                  onCodeChange={setCodeInput}
                  onApply={applyCode}
                  busy={couponBusy}
                  error={couponError}
                  applied={appliedCoupons}
                  onRemove={removeCoupon}
                />

                {/* ── Numeric breakdown ────────────────────────── */}
                <dl className="space-y-4 mb-8">
                  <SummaryRow label="ยอดสินค้า" value={formatTHB(subtotal)} />
                  <SummaryRow
                    label="ค่าจัดส่ง"
                    value={
                      shipping === 0 ? (
                        <span
                          className="font-[family:var(--font-prompt)] text-xs tracking-[0.2em] uppercase"
                          style={{ color: BRASS }}
                        >
                          ฟรี
                        </span>
                      ) : (
                        formatTHB(shipping)
                      )
                    }
                  />
                  {discount > 0 && (
                    <SummaryRow
                      label="ส่วนลดคูปอง"
                      value={`− ${formatTHB(discount)}`}
                      accent={BRASS}
                    />
                  )}
                </dl>

                {/* ── Grand total with brass underline ─────────── */}
                <div
                  className="pt-6 mb-8"
                  style={{ borderTop: `1px solid ${STONE_LINE}` }}
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase">
                      รวมทั้งหมด
                    </span>
                    <span className="font-[family:var(--font-prompt)] text-2xl tracking-wide tabular-nums">
                      {formatTHB(total)}
                    </span>
                  </div>
                  <div
                    className="h-px w-16 ml-auto"
                    style={{ background: BRASS }}
                  />
                </div>

                <a
                  href={checkoutUrl}
                  className="group flex items-center justify-center gap-3 w-full h-14 font-[family:var(--font-kanit)] font-light text-xs tracking-[0.35em] uppercase transition-colors duration-500"
                  style={{ background: INK, color: CREAM }}
                >
                  ดำเนินการชำระเงิน
                  <ArrowRight
                    size={14}
                    strokeWidth={1.25}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </a>

                <p
                  className="mt-6 font-[family:var(--font-prompt)] text-[10px] tracking-[0.18em] leading-relaxed text-center"
                  style={{ color: STONE_MUTED }}
                >
                  ค่าจัดส่งและภาษีคำนวณแม่นยำในขั้นตอนถัดไป
                </p>
              </div>

              {/* ── Trust strip beneath summary ──────────────────── */}
              <ul className="mt-6 grid grid-cols-3 text-center">
                {[
                  { label: 'ส่งฟรี', sub: '฿990 ขึ้นไป' },
                  { label: 'คืนได้', sub: 'ภายใน 14 วัน' },
                  { label: 'ของแท้', sub: 'รับประกัน 100%' },
                ].map((t) => (
                  <li
                    key={t.label}
                    className="px-2 py-3"
                    style={{ borderRight: `1px solid ${STONE_LINE}` }}
                  >
                    <span
                      className="block font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.35em] uppercase mb-1"
                      style={{ color: INK }}
                    >
                      {t.label}
                    </span>
                    <span
                      className="block font-[family:var(--font-prompt)] text-[10px] tracking-wide"
                      style={{ color: STONE_MUTED }}
                    >
                      {t.sub}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

function FreeShipBar({
  progress,
  remaining,
  unlocked,
}: {
  progress: number;
  remaining: number;
  unlocked: boolean;
}) {
  return (
    <div
      className="px-5 py-5"
      style={{
        background: CREAM_SOFT,
        border: `1px solid ${STONE_LINE}`,
      }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <span
          className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.35em] uppercase"
          style={{ color: INK }}
        >
          จัดส่งฟรี
        </span>
        <span
          className="font-[family:var(--font-prompt)] text-xs tracking-wide"
          style={{ color: unlocked ? BRASS : STONE_MUTED }}
        >
          {unlocked
            ? 'ปลดล็อกแล้ว'
            : `เหลืออีก ${formatTHB(remaining)}`}
        </span>
      </div>
      <div
        className="h-px relative overflow-hidden"
        style={{ background: STONE_LINE }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="ความคืบหน้าสู่จัดส่งฟรี"
      >
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700"
          style={{
            width: `${progress}%`,
            background: BRASS,
          }}
        />
      </div>
    </div>
  );
}

function CouponBlock({
  codeInput,
  onCodeChange,
  onApply,
  busy,
  error,
  applied,
  onRemove,
}: {
  codeInput: string;
  onCodeChange: (v: string) => void;
  onApply: () => void;
  busy: boolean;
  error: string | null;
  applied: Coupon[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="mb-8 pb-8"
      style={{ borderBottom: `1px solid ${STONE_LINE}` }}
    >
      <span
        className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.5em] uppercase block mb-4"
        style={{ color: STONE_FAINT }}
      >
        Coupon
      </span>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onApply();
        }}
        className="flex items-stretch"
        style={{ border: `1px solid ${STONE_LINE}`, background: CREAM }}
      >
        <div className="flex items-center pl-4" style={{ color: STONE_FAINT }}>
          <Tag size={14} strokeWidth={1.5} />
        </div>
        <input
          type="text"
          value={codeInput}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="ใส่โค้ดส่วนลด"
          className="flex-1 bg-transparent px-3 h-11 font-[family:var(--font-prompt)] text-sm tracking-wider uppercase outline-none placeholder:normal-case"
          style={{ color: INK }}
          aria-label="โค้ดส่วนลด"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={busy || codeInput.trim().length === 0}
          className="px-5 font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.3em] uppercase transition-colors duration-300 disabled:opacity-40"
          style={{ background: INK, color: CREAM }}
        >
          {busy ? '...' : 'ใช้'}
        </button>
      </form>

      {error && (
        <p
          className="mt-3 font-[family:var(--font-prompt)] text-[11px] tracking-wide"
          style={{ color: '#9a3a3a' }}
        >
          {error}
        </p>
      )}

      {/* Applied coupon chips */}
      {applied.length > 0 && (
        <ul className="mt-5 space-y-2">
          {applied.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: CREAM,
                border: `1px solid ${BRASS_SOFT}`,
              }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Tag size={12} strokeWidth={1.5} style={{ color: BRASS }} />
                  <span
                    className="font-[family:var(--font-kanit)] font-light text-xs tracking-[0.25em] uppercase truncate"
                    style={{ color: INK }}
                  >
                    {c.code}
                  </span>
                </div>
                {c.title && (
                  <p
                    className="mt-1 font-[family:var(--font-prompt)] text-[11px] tracking-wide truncate"
                    style={{ color: STONE_MUTED }}
                  >
                    {c.title}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(c.id)}
                aria-label={`นำโค้ด ${c.code} ออก`}
                className="ml-3 w-7 h-7 flex items-center justify-center shrink-0 transition-colors duration-300"
                style={{ color: STONE_MUTED }}
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt
        className="font-[family:var(--font-prompt)] text-sm tracking-wide"
        style={{ color: STONE_MUTED }}
      >
        {label}
      </dt>
      <dd
        className="font-[family:var(--font-prompt)] text-sm tracking-wide tabular-nums"
        style={{ color: accent ?? INK }}
      >
        {value}
      </dd>
    </div>
  );
}

function EmptyState({
  homeUrl,
  shopUrl,
}: {
  homeUrl: string;
  shopUrl: string;
}) {
  return (
    <main
      className="min-h-[70vh] flex items-center justify-center px-6"
      style={{ background: CREAM, color: INK }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 mx-auto mb-8 flex items-center justify-center"
          style={{ border: `1px solid ${STONE_LINE}` }}
        >
          <ShoppingBag size={20} strokeWidth={1.25} style={{ color: STONE_MUTED }} />
        </div>
        <span
          className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.5em] uppercase block mb-4"
          style={{ color: STONE_FAINT }}
        >
          Atelier Cart
        </span>
        <h1 className="font-[family:var(--font-kanit)] font-light text-2xl tracking-[0.12em] uppercase mb-4">
          ตะกร้าของคุณว่างเปล่า
        </h1>
        <p
          className="font-[family:var(--font-prompt)] text-sm leading-relaxed mb-10"
          style={{ color: STONE_MUTED }}
        >
          เริ่มจัดคอลเลกชันส่วนตัวจากผลงานคัดสรรของเรา
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={shopUrl}
            className="group inline-flex items-center justify-center gap-3 px-8 h-12 font-[family:var(--font-kanit)] font-light text-xs tracking-[0.35em] uppercase transition-colors duration-500"
            style={{ background: INK, color: CREAM }}
          >
            เริ่มเลือกซื้อ
            <ArrowRight
              size={14}
              strokeWidth={1.25}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </a>
          <a
            href={homeUrl}
            className="font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase pb-1 transition-colors duration-300"
            style={{ color: INK, borderBottom: `1px solid ${INK}` }}
          >
            กลับหน้าหลัก
          </a>
        </div>
      </div>
    </main>
  );
}

export const CartPage = Cart;
export default Cart;
