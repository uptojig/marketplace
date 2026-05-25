'use client';

/**
 * reclaim-leather — bespoke Cart
 *
 * Vintage leather workshop aesthetic — burnt umber / tan / black,
 * stitched borders, paper-stock surface, hand-tagged labels.
 *
 * Wiring follows the talad-see-sod pattern so the rest of the
 * checkout/order pipeline works the same:
 *   - reads `useCart` (lib/store/cart) for lines / qty / remove
 *   - free-shipping progress at 990 THB
 *   - coupon hydrate via POST /api/coupons/preview (silently drops
 *     when the endpoint or the code isn't valid — server is the
 *     authoritative source at order time)
 *   - applied-discount math via `calculate()` from lib/coupons/calculator
 *
 * Layout: 2-col grid, sticky order summary on desktop. All copy in
 * Thai, money via formatTHB, palette via var(--shop-*) so the cart
 * still tints correctly if the store overrides shop colors. Section
 * specific colors fall back to the burnt-umber palette (#2a1a09 /
 * #5b3a1e / #c9974b / #f4ead8) matching Homepage.tsx.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Tag,
  X as XIcon,
  Scissors,
  HeartHandshake,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { calculate } from '@/lib/coupons/calculator';
import type { Coupon } from '@/lib/coupons/types';
import { formatTHB } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 60;

// Palette tokens — fall back to the burnt-leather palette used in
// the rest of reclaim-leather. CSS vars take precedence when set so
// operator color overrides still apply.
const PAPER = 'var(--shop-bg, #f4ead8)';
const CARD = 'var(--shop-card, #fbf3df)';
const INK = 'var(--shop-ink, #2a1a09)';
const INK_MUTED = 'var(--shop-ink-muted, rgba(42, 26, 9, 0.65))';
const TAN = 'var(--shop-accent, #c9974b)';
const UMBER = 'var(--shop-primary, #5b3a1e)';
const STITCH = 'var(--shop-border, #c9974b)';

const FONT_HEADING = 'font-[family:var(--font-prompt)]';
const FONT_BODY = 'font-[family:var(--font-kanit)]';

// Error-code dictionary matching lib/coupons/types.COUPON_ERROR_MESSAGE
// but with workshop voice tweaks. Falls back to a generic line if a
// new reason ever ships from the server.
const COUPON_ERRORS: Record<string, string> = {
  not_found: 'ไม่พบรหัสคูปองนี้',
  expired: 'รหัสคูปองหมดอายุแล้ว',
  not_started: 'รหัสคูปองยังไม่เริ่มใช้งาน',
  min_spend_not_met: 'ยอดสั่งซื้อยังไม่ถึงขั้นต่ำที่กำหนด',
  no_eligible_items: 'ไม่มีสินค้าที่ใช้คูปองนี้ได้',
  already_applied: 'ใช้รหัสคูปองนี้ไปแล้ว',
  slot_conflict: 'มีคูปองประเภทเดียวกันใช้อยู่แล้ว',
  payment_method_mismatch: 'รหัสคูปองใช้กับวิธีชำระเงินที่เลือกไม่ได้',
  usage_limit_exceeded: 'รหัสคูปองนี้ถูกใช้ครบจำนวนแล้ว',
};

interface StoreLite {
  id: string;
  slug: string;
  name: string;
}

export interface ReclaimLeatherCartProps {
  store: StoreLite;
  // The cart route still spreads `items=[]` for back-compat with the
  // legacy shadcn cart wrapper. We ignore it — client zustand is the
  // source of truth.
  items?: unknown;
}

export function ReclaimLeatherCart({ store }: ReclaimLeatherCartProps) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  // Persist coupon CODES (not Coupon objects) in component state.
  // The hydrated Coupon objects are re-fetched on mount via
  // /api/coupons/preview so the discount math always reflects the
  // current DB row. We keep codes in local state here (not zustand)
  // because the shared cart store on this branch doesn't have a
  // couponCodes field yet — when it lands the codes can be lifted up
  // without changing the rest of this component.
  const [codes, setCodes] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [draftCode, setDraftCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  // Hydration guard — useCart is persisted via zustand/middleware so
  // the first render on the server and the first render on the
  // client disagree. Wait until after mount before rendering the
  // real cart UI to avoid the React hydration crash that hit
  // f533f49.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Derive per-store lines from the raw lines array via useMemo so
  // the array identity is stable between renders — mirrors the
  // brutalist-thai / talad-see-sod fix for the infinite-rerender
  // bug when calling .filter() inside a zustand selector.
  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const shippingBefore =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const progressPct = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
  );

  // Run the marketplace calculator with the hydrated coupons so the
  // displayed total matches what the server will compute at order
  // placement. CartItem requires `id`, `storeId`, `price`, `qty` —
  // we synthesize the rest from CartLineDisplay; the calculator only
  // reads scope/min-spend fields.
  const calculation = useMemo(() => {
    if (lines.length === 0 || coupons.length === 0) return null;
    return calculate({
      items: lines.map((l) => ({
        id: l.productId,
        productId: l.productId,
        qty: l.qty,
        storeId: store.id,
        title: l.title,
        thumbnailUrl: l.imageUrl ?? '',
        price: l.priceTHB,
        storeName: l.storeName,
      })),
      coupons,
      shippingPerStore: { [store.id]: shippingBefore },
    });
  }, [lines, coupons, store.id, store.name, shippingBefore]);

  const totalDiscount = calculation?.totalDiscount ?? 0;
  const shippingAfter =
    calculation?.shippingAfterDiscount[store.id] ?? shippingBefore;
  const total = Math.max(0, subtotal + shippingAfter - totalDiscount);

  // Re-hydrate coupon details when codes / cart contents change so a
  // stale code that no longer passes min-spend gets dropped from
  // display (the server validates anyway, but the UX should match).
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
              items: lines.map((l) => ({
                id: l.productId,
                productId: l.productId,
                qty: l.qty,
                storeId: store.id,
                title: l.title,
                thumbnailUrl: l.imageUrl ?? '',
                price: l.priceTHB,
                storeName: l.storeName,
              })),
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
          // network or endpoint missing — silently drop; server is
          // the authoritative source at order placement.
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
          items: lines.map((l) => ({
            id: l.productId,
            productId: l.productId,
            qty: l.qty,
            storeId: store.id,
            title: l.title,
            thumbnailUrl: l.imageUrl ?? '',
            price: l.priceTHB,
            storeName: l.storeName,
          })),
          shippingPerStore: { [store.id]: shippingBefore },
          existingCodes: codes,
        }),
      });
      const data = (await res.json()) as
        | { ok: true; coupon: Coupon }
        | { ok: false; reason: string };
      if (data.ok) {
        setCodes((prev) => (prev.includes(code) ? prev : [...prev, code]));
        setDraftCode('');
      } else {
        setCouponError(COUPON_ERRORS[data.reason] ?? 'ใช้คูปองไม่สำเร็จ');
      }
    } catch {
      setCouponError('เครือข่ายไม่ตอบสนอง ลองอีกครั้ง');
    } finally {
      setCouponBusy(false);
    }
  }

  function handleRemoveCoupon(code: string) {
    setCodes((prev) => prev.filter((c) => c !== code));
    setCouponError(null);
  }

  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: PAPER }}
        aria-hidden="true"
      />
    );
  }

  // ── Empty state ─────────────────────────────────────────────────
  if (lines.length === 0) {
    return (
      <main style={{ background: PAPER, minHeight: '70vh' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div
            className="relative border-4 border-dashed p-12 md:p-16 text-center"
            style={{
              borderColor: UMBER,
              background: CARD,
              boxShadow: `8px 8px 0 ${TAN}`,
            }}
          >
            {/* Decorative corner pins like the homepage story card */}
            <span
              className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full"
              style={{ background: INK }}
            />
            <span
              className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
              style={{ background: INK }}
            />
            <span
              className="absolute bottom-3 left-3 w-2.5 h-2.5 rounded-full"
              style={{ background: INK }}
            />
            <span
              className="absolute bottom-3 right-3 w-2.5 h-2.5 rounded-full"
              style={{ background: INK }}
            />

            <div
              className="inline-flex items-center justify-center w-20 h-20 mb-6 border-2"
              style={{
                background: PAPER,
                borderColor: UMBER,
              }}
            >
              <ShoppingBag size={36} style={{ color: UMBER }} />
            </div>
            <h1
              className={`${FONT_HEADING} text-3xl md:text-4xl font-bold mb-3 tracking-tight`}
              style={{ color: INK }}
            >
              ตะกร้ายังว่างเปล่า
            </h1>
            <p
              className={`${FONT_BODY} text-base md:text-lg mb-10`}
              style={{ color: INK_MUTED }}
            >
              ยังไม่ได้เลือกชิ้นไหนเลย · แวะดูเครื่องหนังที่เย็บมือทุกฝีเข็มของเราก่อน
            </p>
            <Link
              href={`/stores/${store.slug}`}
              className={`inline-flex items-center gap-2 px-8 py-4 ${FONT_HEADING} font-bold text-base uppercase tracking-wider border-2 transition-transform hover:-translate-y-1`}
              style={{
                background: UMBER,
                color: PAPER,
                borderColor: INK,
                boxShadow: `4px 4px 0 ${TAN}`,
              }}
            >
              <ArrowLeft size={16} /> เลือกซื้อสินค้า
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Filled cart ────────────────────────────────────────────────
  return (
    <main style={{ background: PAPER, minHeight: '100vh' }}>
      {/* HEADER */}
      <section
        className="border-b-[6px] py-10"
        style={{ borderColor: UMBER }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className={`flex items-center gap-2 text-xs ${FONT_BODY} mb-4 uppercase tracking-[0.2em]`}
            style={{ color: INK_MUTED }}
            aria-label="Breadcrumb"
          >
            <Link
              href={`/stores/${store.slug}`}
              className="hover:underline"
              style={{ color: UMBER }}
            >
              ร้านค้า
            </Link>
            <ChevronRight size={12} />
            <span style={{ color: INK }}>ตะกร้าสินค้า</span>
          </nav>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1
                className={`${FONT_HEADING} font-bold text-4xl md:text-5xl tracking-tight`}
                style={{ color: INK }}
              >
                ตะกร้างานหนัง
                <span
                  className="inline-block ml-3 align-middle text-base font-bold px-3 py-1 border-2"
                  style={{
                    color: PAPER,
                    background: UMBER,
                    borderColor: INK,
                  }}
                >
                  {itemCount} ชิ้น
                </span>
              </h1>
              <p
                className={`${FONT_BODY} text-sm md:text-base mt-2`}
                style={{ color: INK_MUTED }}
              >
                ตรวจรายการก่อนสั่งทำ — เย็บมือทีละใบ ส่งภายใน 5–7 วัน
              </p>
            </div>
            <Link
              href={`/stores/${store.slug}`}
              className={`hidden md:inline-flex items-center gap-2 ${FONT_HEADING} font-bold text-sm uppercase tracking-wider px-4 py-2 border-2 transition-colors`}
              style={{
                color: UMBER,
                borderColor: UMBER,
                background: 'transparent',
              }}
            >
              <ArrowLeft size={14} /> เลือกซื้อต่อ
            </Link>
          </div>
        </div>
      </section>

      {/* 2-COL BODY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* LINES */}
          <div className="space-y-6">
            {/* Free-shipping progress */}
            <div
              className="border-2 border-dashed p-5"
              style={{
                borderColor: STITCH,
                background: CARD,
              }}
              role="status"
              aria-live="polite"
            >
              <div
                className={`flex items-center gap-2 text-xs md:text-sm ${FONT_HEADING} font-bold uppercase tracking-[0.18em] mb-2`}
                style={{ color: UMBER }}
              >
                <Truck size={14} />
                {shippingAfter === 0 ? (
                  <span>คุณได้รับ "ส่งฟรี" แล้ว · ขอบคุณที่อุดหนุนงานคราฟต์</span>
                ) : (
                  <span>
                    เพิ่มอีก{' '}
                    <b style={{ color: INK }}>
                      {formatTHB(remainingForFreeShipping)}
                    </b>{' '}
                    รับส่งฟรี
                  </span>
                )}
              </div>
              <div
                className="h-2 w-full overflow-hidden"
                style={{ background: 'rgba(91, 58, 30, 0.15)' }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    background: shippingAfter === 0 ? UMBER : TAN,
                  }}
                />
              </div>
            </div>

            {/* Items list */}
            <div
              className="border-2"
              style={{
                borderColor: UMBER,
                background: CARD,
                boxShadow: `6px 6px 0 ${TAN}`,
              }}
            >
              <div
                className={`flex items-center justify-between px-5 py-3 border-b-2 ${FONT_HEADING} font-bold uppercase tracking-[0.2em] text-xs`}
                style={{
                  borderColor: UMBER,
                  background: PAPER,
                  color: UMBER,
                }}
              >
                <span className="flex items-center gap-2">
                  <Scissors size={13} /> รายการสั่งทำ
                </span>
                <span>{itemCount} ชิ้น</span>
              </div>

              <ul className="divide-y-2 divide-dashed" style={{ borderColor: STITCH }}>
                {lines.map((line) => (
                  <li
                    key={`${line.storeSlug}::${line.productId}`}
                    className="p-5 grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr_auto] gap-4 items-start"
                  >
                    {/* Image */}
                    <div
                      className="relative aspect-square border-2 overflow-hidden"
                      style={{
                        borderColor: UMBER,
                        background: PAPER,
                      }}
                    >
                      {line.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={line.imageUrl}
                          alt={line.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center text-[10px] ${FONT_BODY} uppercase tracking-wider`}
                          style={{ color: UMBER }}
                        >
                          งานหนัง
                        </div>
                      )}
                    </div>

                    {/* Title + meta */}
                    <div className="min-w-0">
                      <div
                        className={`text-[10px] ${FONT_BODY} uppercase tracking-[0.2em] mb-1`}
                        style={{ color: INK_MUTED }}
                      >
                        Hand-stitched · Vegetable-tanned
                      </div>
                      <h3
                        className={`${FONT_HEADING} font-bold text-base md:text-lg leading-snug mb-2 line-clamp-2`}
                        style={{ color: INK }}
                      >
                        {line.title}
                      </h3>
                      <div
                        className={`flex items-baseline gap-2 ${FONT_BODY}`}
                      >
                        <span
                          className={`${FONT_HEADING} font-bold text-lg`}
                          style={{ color: UMBER }}
                        >
                          {formatTHB(line.priceTHB)}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: INK_MUTED }}
                        >
                          × {line.qty}
                        </span>
                      </div>

                      {/* Mobile qty + remove row */}
                      <div className="flex items-center justify-between sm:hidden mt-3">
                        <QtyStepper
                          qty={line.qty}
                          onMinus={() =>
                            setQty(
                              line.productId,
                              Math.max(1, line.qty - 1),
                              line.storeSlug,
                            )
                          }
                          onPlus={() =>
                            setQty(
                              line.productId,
                              line.qty + 1,
                              line.storeSlug,
                            )
                          }
                          label={`ปรับจำนวน ${line.title}`}
                        />
                        <button
                          type="button"
                          onClick={() => remove(line.productId, line.storeSlug)}
                          aria-label={`ลบ ${line.title} ออกจากตะกร้า`}
                          className={`inline-flex items-center gap-1 text-xs ${FONT_BODY} font-bold uppercase tracking-wider px-3 py-2 transition-colors`}
                          style={{ color: UMBER }}
                        >
                          <Trash2 size={14} /> ลบ
                        </button>
                      </div>
                    </div>

                    {/* Desktop qty + remove + line total */}
                    <div className="hidden sm:flex flex-col items-end gap-3 justify-between h-full">
                      <QtyStepper
                        qty={line.qty}
                        onMinus={() =>
                          setQty(
                            line.productId,
                            Math.max(1, line.qty - 1),
                            line.storeSlug,
                          )
                        }
                        onPlus={() =>
                          setQty(line.productId, line.qty + 1, line.storeSlug)
                        }
                        label={`ปรับจำนวน ${line.title}`}
                      />
                      <div className="text-right">
                        <div
                          className={`${FONT_HEADING} font-bold text-lg`}
                          style={{ color: INK }}
                        >
                          {formatTHB(line.priceTHB * line.qty)}
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.productId, line.storeSlug)}
                          aria-label={`ลบ ${line.title} ออกจากตะกร้า`}
                          className={`inline-flex items-center gap-1 text-xs ${FONT_BODY} font-bold uppercase tracking-wider mt-2 transition-colors hover:underline`}
                          style={{ color: UMBER }}
                        >
                          <Trash2 size={13} /> ลบออก
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Continue shopping (mobile-only inside the items card) */}
              <div
                className="border-t-2 px-5 py-4 flex items-center justify-between flex-wrap gap-3"
                style={{
                  borderColor: UMBER,
                  background: PAPER,
                }}
              >
                <Link
                  href={`/stores/${store.slug}`}
                  className={`inline-flex items-center gap-2 ${FONT_HEADING} font-bold text-xs uppercase tracking-wider`}
                  style={{ color: UMBER }}
                >
                  <ArrowLeft size={14} /> เลือกซื้อต่อ
                </Link>
                <div
                  className={`flex items-center gap-2 ${FONT_BODY} text-xs`}
                  style={{ color: INK_MUTED }}
                >
                  <HeartHandshake size={14} style={{ color: TAN }} />
                  Repair-for-life · ส่งซ่อมได้ตลอดชีวิตชิ้นงาน
                </div>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <aside
            className="lg:sticky lg:top-24 lg:self-start"
            aria-label="สรุปคำสั่งทำ"
          >
            <div
              className="border-2"
              style={{
                borderColor: INK,
                background: CARD,
                boxShadow: `6px 6px 0 ${UMBER}`,
              }}
            >
              {/* Card header — looks like a hand-stamped tag */}
              <div
                className={`relative px-5 py-4 border-b-2 ${FONT_HEADING} font-bold uppercase tracking-[0.18em] text-sm`}
                style={{
                  borderColor: INK,
                  background: INK,
                  color: TAN,
                }}
              >
                สรุปคำสั่งทำ
                <span
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: TAN }}
                />
                <span
                  className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: TAN }}
                />
              </div>

              <div className="p-5 space-y-4">
                {/* Coupon entry */}
                <div
                  className="space-y-2 pb-4 border-b-2 border-dashed"
                  style={{ borderColor: STITCH }}
                >
                  <label
                    className={`flex items-center gap-1.5 text-[11px] ${FONT_HEADING} font-bold uppercase tracking-[0.2em]`}
                    style={{ color: UMBER }}
                    htmlFor="coupon-code"
                  >
                    <Tag size={12} /> ใช้รหัสคูปอง
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
                      placeholder="เช่น LEATHER100"
                      aria-label="ใส่รหัสคูปอง"
                      className={`flex-1 border-2 px-3 py-2 text-sm uppercase tracking-wider ${FONT_BODY} focus:outline-none`}
                      style={{
                        borderColor: UMBER,
                        background: PAPER,
                        color: INK,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponBusy || draftCode.trim().length === 0}
                      className={`${FONT_HEADING} font-bold text-xs uppercase tracking-wider px-4 py-2 border-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                      style={{
                        background: UMBER,
                        color: PAPER,
                        borderColor: INK,
                      }}
                    >
                      {couponBusy ? '...' : 'ใช้รหัส'}
                    </button>
                  </div>
                  {couponError && (
                    <p
                      role="alert"
                      className={`text-xs ${FONT_BODY} font-bold`}
                      style={{ color: '#b91c1c' }}
                    >
                      {couponError}
                    </p>
                  )}
                  {coupons.length > 0 && (
                    <ul className="space-y-2 pt-1">
                      {coupons.map((c) => {
                        const applied = calculation?.appliedCoupons.find(
                          (ac) => ac.couponId === c.id,
                        );
                        return (
                          <li
                            key={c.id}
                            className="flex items-center justify-between gap-2 px-3 py-2 border-2 border-dashed"
                            style={{
                              borderColor: TAN,
                              background: 'rgba(201, 151, 75, 0.12)',
                            }}
                          >
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-xs ${FONT_HEADING} font-bold truncate uppercase tracking-wider`}
                                style={{ color: INK }}
                              >
                                {c.code}
                              </p>
                              <p
                                className={`text-[10px] ${FONT_BODY} truncate`}
                                style={{ color: INK_MUTED }}
                              >
                                {c.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {applied && (
                                <span
                                  className={`text-xs ${FONT_HEADING} font-bold`}
                                  style={{ color: UMBER }}
                                >
                                  -{formatTHB(applied.amount)}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveCoupon(c.code)}
                                aria-label={`เอา ${c.code} ออก`}
                                className="p-1 transition-colors"
                                style={{ color: UMBER }}
                              >
                                <XIcon size={12} strokeWidth={3} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Money rows */}
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between text-sm ${FONT_BODY}`}
                  >
                    <span style={{ color: INK_MUTED }}>
                      ราคารวม ({itemCount} ชิ้น)
                    </span>
                    <span
                      className={`${FONT_HEADING} font-bold`}
                      style={{ color: INK }}
                    >
                      {formatTHB(subtotal)}
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <div
                      className={`flex items-center justify-between text-sm ${FONT_BODY}`}
                    >
                      <span style={{ color: INK_MUTED }}>ส่วนลดคูปอง</span>
                      <span
                        className={`${FONT_HEADING} font-bold`}
                        style={{ color: UMBER }}
                      >
                        -{formatTHB(totalDiscount)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex items-center justify-between text-sm ${FONT_BODY}`}
                  >
                    <span style={{ color: INK_MUTED }}>ค่าจัดส่ง</span>
                    <span
                      className={`${FONT_HEADING} font-bold`}
                      style={{
                        color: shippingAfter === 0 ? UMBER : INK,
                      }}
                    >
                      {shippingAfter === 0
                        ? '✓ ฟรี'
                        : formatTHB(shippingAfter)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div
                  className="flex items-baseline justify-between pt-3 border-t-2 border-dashed"
                  style={{ borderColor: STITCH }}
                >
                  <span
                    className={`${FONT_HEADING} font-bold text-base uppercase tracking-[0.18em]`}
                    style={{ color: INK }}
                  >
                    รวมทั้งสิ้น
                  </span>
                  <span
                    className={`${FONT_HEADING} font-bold text-2xl`}
                    style={{ color: UMBER }}
                  >
                    {formatTHB(total)}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href={`/stores/${store.slug}/checkout`}
                  className={`mt-2 inline-flex w-full items-center justify-center gap-2 py-4 ${FONT_HEADING} font-bold text-base uppercase tracking-wider border-2 transition-transform hover:-translate-y-1`}
                  style={{
                    background: UMBER,
                    color: PAPER,
                    borderColor: INK,
                    boxShadow: `4px 4px 0 ${TAN}`,
                  }}
                >
                  ดำเนินการสั่งทำ <ChevronRight size={18} />
                </Link>

                {/* Trust footnote */}
                <div
                  className={`pt-3 mt-3 border-t-2 border-dashed space-y-2 ${FONT_BODY} text-[11px]`}
                  style={{ borderColor: STITCH, color: INK_MUTED }}
                >
                  <p className="flex items-center gap-2">
                    <ShieldCheck size={13} style={{ color: UMBER }} />
                    ชำระเงินปลอดภัย · เข้ารหัส SSL ตลอดธุรกรรม
                  </p>
                  <p className="flex items-center gap-2">
                    <Scissors size={13} style={{ color: UMBER }} />
                    เย็บมือทุกฝีเข็มด้วยเทคนิค Saddle Stitch
                  </p>
                  <p className="flex items-center gap-2">
                    <HeartHandshake size={13} style={{ color: UMBER }} />
                    รับประกัน Repair-for-life ตลอดอายุการใช้งาน
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

// ── Small UI bits ─────────────────────────────────────────────────

interface QtyStepperProps {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
  label: string;
}

function QtyStepper({ qty, onMinus, onPlus, label }: QtyStepperProps) {
  const disabled = qty <= 1;
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-stretch border-2"
      style={{ borderColor: UMBER, background: PAPER }}
    >
      <button
        type="button"
        onClick={onMinus}
        disabled={disabled}
        aria-label="ลดจำนวน"
        className="w-9 h-9 inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ color: INK }}
      >
        <Minus size={14} />
      </button>
      <span
        className={`min-w-[2.5rem] inline-flex items-center justify-center text-sm font-bold border-x-2 ${FONT_HEADING}`}
        style={{ color: INK, borderColor: UMBER }}
        aria-live="polite"
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={onPlus}
        aria-label="เพิ่มจำนวน"
        className="w-9 h-9 inline-flex items-center justify-center transition-colors"
        style={{ color: INK }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default ReclaimLeatherCart;
