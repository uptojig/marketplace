'use client';

/**
 * hinoki-apothecary — bespoke Cart page.
 *
 * Apothecary bottle-shop aesthetic, structurally identical to the
 * reference cart at themes/talad-see-sod/pages/Cart.tsx but completely
 * reskinned to fit the slow-living hinoki narrative:
 *
 *   - Cream `#f6efe2` page bg, dark walnut `#3f2e1e` ink
 *   - Copper `#a87a4b` accent for CTAs + dotted-line price hairlines
 *   - Soft beige `#e6d5b8` muted surfaces for label/info panels
 *   - Hairline `#3f2e1e/10` borders, no harsh red — apothecary not bazaar
 *   - Prompt body, italic serif "ingredient hints" under each line item
 *   - Free-shipping nudge framed as a "ผสมเพิ่มอีกเล็กน้อย" perfumer note
 *   - Sticky right-rail summary styled like a glass-bottle label panel
 *
 * Coupon flow mirrors the marketplace contract:
 *   - hydrate persisted draft codes via POST /api/coupons/preview
 *   - apply / remove updates local hydrated Coupon[] state
 *   - calculate() from @/lib/coupons/calculator produces the displayed
 *     discount; checkout still re-validates server-side
 *
 * Visual tokens are driven through var(--shop-*) so per-store palette
 * overrides on the layout wrapper continue to apply; the hex values
 * above are fallback hints baked into the theme variables.
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
  RotateCcw,
  ChevronRight,
  Tag,
  Leaf,
  X as XIcon,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { calculate } from '@/lib/coupons/calculator';
import type { Coupon } from '@/lib/coupons/types';
import { formatTHB } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

// Apothecary palette — used as fallbacks when --shop-* isn't set.
const INK = 'var(--shop-ink, #3f2e1e)';
const INK_SOFT = 'var(--shop-ink-muted, rgba(63,46,30,0.65))';
const BG = 'var(--shop-bg, #f6efe2)';
const SURFACE = 'var(--shop-surface, #ffffff)';
const MUTED = 'var(--shop-muted, #e6d5b8)';
const ACCENT = 'var(--shop-primary, #a87a4b)';
const HAIRLINE = 'var(--shop-border, rgba(63,46,30,0.12))';

const FONT_BODY = 'font-[family:var(--font-prompt)]';
const FONT_SERIF =
  'font-[family:var(--font-fashion-display,_"Cormorant_Garamond"),_"Noto_Serif_Thai",_serif]';

// Ingredient hint copy under each line — rotates by index so a cart of
// three bottles reads like a perfumer's notebook instead of repeating
// the same italic blurb. Deliberately fragrance-neutral so it still
// reads sensibly on a candle or balm SKU.
const INGREDIENT_HINTS = [
  'หัวใจ: ไม้สนฮิโนกิ · ดินหลังฝน · เกลือทะเล',
  'หัวใจ: ไม้จันทน์ · กลิ่นชาเขียวอบควัน · เปลือกส้ม',
  'หัวใจ: ใบเฟิร์น · เปลือกไม้เก่า · มัสก์ขาว',
  'หัวใจ: ดอกพุดอ่อน · ยางสน · กระดาษหนังสือ',
];

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

export default function HinokiApothecaryCart({
  store,
}: {
  store: StoreLite;
}) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  // The legacy cart store doesn't yet persist coupon codes per-store,
  // so we keep the draft list in React state. Persistence belongs in
  // lib/store/cart.ts and lands separately — we cannot edit it here.
  const [codes, setCodes] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [draftCode, setDraftCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const shippingBefore =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;

  // Discount math via the shared calculator so the cart total matches
  // what the marketplace checkout flow will quote — single source of
  // truth for stacking / scope / min-spend logic.
  const calculation = useMemo(() => {
    if (lines.length === 0 || coupons.length === 0) {
      return null;
    }
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
  }, [lines, coupons, store.id, shippingBefore]);

  const totalDiscount = calculation?.totalDiscount ?? 0;
  const shippingAfter =
    calculation?.shippingAfterDiscount[store.id] ?? shippingBefore;
  const total = Math.max(0, subtotal + shippingAfter - totalDiscount);
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const progressPct = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
  );

  // Hydrate Coupon objects whenever the draft `codes` list (or the cart
  // contents that determine eligibility) change. Server-side authority
  // still wins at /api/checkout; the preview just powers the live UX.
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
          const data = (await res.json()) as
            | { ok: true; coupon: Coupon }
            | { ok: false; reason: string };
          if (data.ok) fetched.push(data.coupon);
        } catch {
          /* silently drop — server is authoritative at checkout */
        }
      }
      if (!cancelled) setCoupons(fetched);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codes.join('|'), lines.length, store.id, shippingBefore]);

  const COUPON_ERRORS: Record<string, string> = {
    not_found: 'ไม่พบรหัสคูปองนี้',
    expired: 'รหัสคูปองหมดอายุแล้ว',
    not_started: 'รหัสคูปองยังไม่เริ่มใช้งาน',
    min_spend_not_met: 'ยอดสั่งซื้อยังไม่ถึงขั้นต่ำที่กำหนด',
    no_eligible_items: 'ไม่มีสินค้าที่ใช้คูปองนี้ได้',
    already_applied: 'ใช้รหัสคูปองนี้ไปแล้ว',
    slot_conflict: 'มีคูปองประเภทเดียวกันใช้อยู่แล้ว',
    payment_method_mismatch: 'คูปองใช้กับวิธีชำระเงินที่เลือกไม่ได้',
    usage_limit_exceeded: 'คูปองนี้ถูกใช้ครบจำนวนแล้ว',
  };

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
        setCodes((prev) => [...prev, code]);
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

  // Avoid hydration flash — zustand reads localStorage on mount.
  if (!mounted) {
    return <div className="min-h-[60vh]" style={{ background: BG }} />;
  }

  return (
    <main
      className={`min-h-screen ${FONT_BODY}`}
      style={{ background: BG, color: INK }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Breadcrumb — copper-accented hairline trail */}
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em]"
          style={{ color: INK_SOFT }}
        >
          <Link
            href={`/stores/${store.slug}`}
            className="hover:underline transition-colors"
            style={{ color: INK }}
          >
            หน้าร้าน
          </Link>
          <ChevronRight size={12} style={{ color: ACCENT }} />
          <span style={{ color: ACCENT }}>ตะกร้า</span>
        </nav>

        {/* Page header — apothecary stamp + serif title */}
        <header className="space-y-4">
          <span
            className="text-[11px] uppercase tracking-[0.32em]"
            style={{ color: ACCENT }}
          >
            Hinoki Apothecary · บทที่ ๔
          </span>
          <h1
            className={`text-4xl sm:text-5xl font-light leading-tight tracking-wide ${FONT_SERIF}`}
            style={{ color: INK }}
          >
            ตะกร้ากลิ่นของคุณ
          </h1>
          <p
            className={`max-w-xl text-base leading-relaxed italic ${FONT_SERIF}`}
            style={{ color: INK_SOFT }}
          >
            {lines.length === 0
              ? 'ขวดเปล่าบนชั้นไม้ — รอเรื่องเล่าใหม่ที่คุณจะเก็บใส่กลับบ้าน'
              : `เก็บไว้แล้ว ${itemCount} ขวด · ผ่านการคัดสรรจากชั้นวางของเรา`}
          </p>
        </header>

        {lines.length === 0 ? (
          <HinokiEmptyCart storeSlug={store.slug} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* ── Line items column ─────────────────────────── */}
            <section
              aria-labelledby="cart-heading"
              className="lg:col-span-7 space-y-6"
            >
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>

              {/* Free-shipping perfumer note */}
              {remainingForFreeShipping > 0 ? (
                <div
                  className="p-5 border"
                  style={{
                    borderColor: HAIRLINE,
                    background: SURFACE,
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <Leaf size={15} style={{ color: ACCENT }} />
                    <p
                      className={`text-sm italic leading-relaxed ${FONT_SERIF}`}
                      style={{ color: INK_SOFT }}
                    >
                      ผสมเพิ่มอีก{' '}
                      <span
                        className="not-italic font-medium"
                        style={{ color: ACCENT, fontFamily: 'inherit' }}
                      >
                        {formatTHB(remainingForFreeShipping)}
                      </span>{' '}
                      เพื่อจัดส่งฟรีถึงหน้าบ้าน
                    </p>
                  </div>
                  <div
                    aria-hidden
                    className="h-px relative overflow-hidden"
                    style={{ background: HAIRLINE }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-700"
                      style={{
                        width: `${progressPct}%`,
                        background: ACCENT,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="p-5 border flex items-center gap-3"
                  style={{
                    background: MUTED,
                    borderColor: ACCENT,
                  }}
                >
                  <Truck size={16} style={{ color: ACCENT }} />
                  <p
                    className={`text-sm italic ${FONT_SERIF}`}
                    style={{ color: INK }}
                  >
                    เก็บครบส่วนผสมแล้ว — จัดส่งฟรีถึงประตูบ้าน
                  </p>
                </div>
              )}

              {/* Items — each line styled like a labelled apothecary shelf */}
              <ul className="space-y-4">
                {lines.map((l, idx) => {
                  const ingredient =
                    INGREDIENT_HINTS[idx % INGREDIENT_HINTS.length];
                  return (
                    <li
                      key={l.productId}
                      className="border"
                      style={{
                        background: SURFACE,
                        borderColor: HAIRLINE,
                      }}
                    >
                      <div className="flex gap-4 sm:gap-5 p-4 sm:p-5">
                        {/* Portrait bottle frame */}
                        <Link
                          href={`/stores/${store.slug}/products/${l.productId}`}
                          aria-label={l.title}
                          className="relative block w-24 h-32 sm:w-28 sm:h-36 shrink-0 overflow-hidden"
                          style={{
                            background: MUTED,
                            border: `1px solid ${HAIRLINE}`,
                          }}
                        >
                          {l.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={l.imageUrl}
                              alt={l.title}
                              className="w-full h-full object-cover mix-blend-multiply opacity-95 transition-transform duration-700 hover:scale-[1.03]"
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center text-[10px] italic ${FONT_SERIF}`}
                              style={{ color: INK_SOFT }}
                            >
                              no bottle
                            </div>
                          )}
                          <div
                            aria-hidden
                            className="absolute inset-0 m-2 pointer-events-none"
                            style={{
                              border: `1px solid ${HAIRLINE}`,
                            }}
                          />
                        </Link>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <Link
                              href={`/stores/${store.slug}/products/${l.productId}`}
                              className="block group"
                            >
                              <h3
                                className={`text-lg sm:text-xl font-light leading-snug tracking-wide ${FONT_SERIF}`}
                                style={{ color: INK }}
                              >
                                {l.title}
                              </h3>
                            </Link>
                            <p
                              className={`mt-1.5 text-xs italic leading-relaxed ${FONT_SERIF}`}
                              style={{ color: INK_SOFT }}
                            >
                              {ingredient}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                            {/* Quantity stepper — hairline pill */}
                            <div
                              className="inline-flex items-stretch h-9"
                              style={{ border: `1px solid ${HAIRLINE}` }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setQty(l.productId, l.qty - 1, store.slug)
                                }
                                disabled={l.qty <= 1}
                                aria-label="ลดจำนวน"
                                className="px-3 transition-colors disabled:opacity-30"
                                style={{ color: INK }}
                                onMouseEnter={(e) => {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = ACCENT;
                                }}
                                onMouseLeave={(e) => {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = INK;
                                }}
                              >
                                <Minus size={13} strokeWidth={1.5} />
                              </button>
                              <div
                                className={`flex items-center justify-center px-4 text-sm min-w-[2.5rem] ${FONT_BODY}`}
                                style={{
                                  color: INK,
                                  borderLeft: `1px solid ${HAIRLINE}`,
                                  borderRight: `1px solid ${HAIRLINE}`,
                                }}
                              >
                                {l.qty}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setQty(l.productId, l.qty + 1, store.slug)
                                }
                                aria-label="เพิ่มจำนวน"
                                className="px-3 transition-colors"
                                style={{ color: INK }}
                                onMouseEnter={(e) => {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = ACCENT;
                                }}
                                onMouseLeave={(e) => {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = INK;
                                }}
                              >
                                <Plus size={13} strokeWidth={1.5} />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`text-lg font-light tracking-wide ${FONT_BODY}`}
                                style={{ color: ACCENT }}
                              >
                                {formatTHB(l.priceTHB * l.qty)}
                              </span>
                              <button
                                type="button"
                                onClick={() => remove(l.productId, store.slug)}
                                aria-label={`เอา ${l.title} ออก`}
                                className="p-2 transition-colors"
                                style={{ color: INK_SOFT }}
                                onMouseEnter={(e) => {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = ACCENT;
                                }}
                                onMouseLeave={(e) => {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = INK_SOFT;
                                }}
                              >
                                <Trash2 size={14} strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={`/stores/${store.slug}`}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] pb-1 transition-colors"
                style={{
                  color: INK,
                  borderBottom: `2px solid ${ACCENT}`,
                }}
              >
                ← เลือกซื้อบทถัดไป
              </Link>
            </section>

            {/* ── Sticky summary — glass bottle label panel ── */}
            <aside
              aria-labelledby="summary-heading"
              className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-6"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปรายการ
              </h2>

              <div
                className="border p-7"
                style={{
                  background: SURFACE,
                  borderColor: HAIRLINE,
                }}
              >
                <span
                  className="text-[11px] uppercase tracking-[0.32em]"
                  style={{ color: ACCENT }}
                >
                  สรุปออเดอร์
                </span>
                <h3
                  className={`mt-2 text-3xl font-light tracking-wide ${FONT_SERIF}`}
                  style={{ color: INK }}
                >
                  ใบสั่งปรุง
                </h3>
                <div
                  aria-hidden
                  className="mt-4 h-px w-12"
                  style={{ background: ACCENT }}
                />

                {/* Coupon input — minimal hairline form */}
                <div
                  className="mt-6 space-y-3 pb-5 border-b border-dashed"
                  style={{ borderColor: HAIRLINE }}
                >
                  <label
                    htmlFor="coupon-code"
                    className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.24em]"
                    style={{ color: INK_SOFT }}
                  >
                    <Tag size={12} style={{ color: ACCENT }} />
                    ใช้รหัสคูปอง
                  </label>
                  <div className="flex items-stretch gap-0">
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
                      placeholder="เช่น HINOKI50"
                      className={`flex-1 h-11 px-3 text-sm tracking-[0.16em] uppercase bg-transparent focus:outline-none ${FONT_BODY}`}
                      style={{
                        border: `1px solid ${HAIRLINE}`,
                        color: INK,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponBusy || draftCode.trim().length === 0}
                      className={`h-11 px-5 text-xs uppercase tracking-[0.24em] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${FONT_BODY}`}
                      style={{
                        background: INK,
                        color: BG,
                        border: `1px solid ${INK}`,
                        marginLeft: '-1px',
                      }}
                      onMouseEnter={(e) => {
                        if (couponBusy || !draftCode.trim()) return;
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = ACCENT;
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          ACCENT;
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = INK;
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          INK;
                      }}
                    >
                      {couponBusy ? '...' : 'ใช้รหัส'}
                    </button>
                  </div>
                  {couponError && (
                    <p
                      className={`text-xs italic ${FONT_SERIF}`}
                      style={{ color: ACCENT }}
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
                            className="flex items-center justify-between gap-3 px-3 py-2"
                            style={{
                              background: MUTED,
                              border: `1px solid ${HAIRLINE}`,
                            }}
                          >
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-xs tracking-[0.18em] font-medium ${FONT_BODY}`}
                                style={{ color: INK }}
                              >
                                {c.code}
                              </p>
                              <p
                                className={`text-[11px] italic truncate ${FONT_SERIF}`}
                                style={{ color: INK_SOFT }}
                              >
                                {c.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {applied && (
                                <span
                                  className={`text-xs font-medium ${FONT_BODY}`}
                                  style={{ color: ACCENT }}
                                >
                                  −{formatTHB(applied.amount)}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveCoupon(c.code)}
                                aria-label={`เอา ${c.code} ออก`}
                                className="p-1 transition-colors"
                                style={{ color: INK_SOFT }}
                                onMouseEnter={(e) => {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = ACCENT;
                                }}
                                onMouseLeave={(e) => {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = INK_SOFT;
                                }}
                              >
                                <XIcon size={12} strokeWidth={1.75} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Totals — dotted-line ledger */}
                <dl className="mt-6 space-y-3.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt style={{ color: INK_SOFT }}>
                      ราคารวม ({itemCount} ขวด)
                    </dt>
                    <dd
                      className={`font-medium ${FONT_BODY}`}
                      style={{ color: INK }}
                    >
                      {formatTHB(subtotal)}
                    </dd>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between">
                      <dt style={{ color: INK_SOFT }}>ส่วนลดคูปอง</dt>
                      <dd
                        className={`font-medium ${FONT_BODY}`}
                        style={{ color: ACCENT }}
                      >
                        −{formatTHB(totalDiscount)}
                      </dd>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <dt style={{ color: INK_SOFT }}>ค่าจัดส่ง</dt>
                    <dd
                      className={`font-medium ${FONT_BODY}`}
                      style={{
                        color: shippingAfter === 0 ? ACCENT : INK,
                      }}
                    >
                      {shippingAfter === 0
                        ? 'จัดส่งฟรี'
                        : formatTHB(shippingAfter)}
                    </dd>
                  </div>

                  <div
                    className="flex items-baseline justify-between pt-4 border-t border-dashed"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <dt
                      className={`text-base font-light tracking-wide ${FONT_SERIF}`}
                      style={{ color: INK }}
                    >
                      ยอดสุทธิ
                    </dt>
                    <dd
                      className={`text-3xl font-light tracking-wide ${FONT_SERIF}`}
                      style={{ color: ACCENT }}
                    >
                      {formatTHB(total)}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/stores/${store.slug}/checkout/address`}
                  className={`mt-7 inline-flex h-12 w-full items-center justify-center gap-2 text-xs uppercase tracking-[0.28em] transition-colors ${FONT_BODY}`}
                  style={{
                    background: INK,
                    color: BG,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      ACCENT;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      INK;
                  }}
                >
                  <ShoppingBag size={14} strokeWidth={1.5} />
                  ดำเนินการชำระเงิน
                </Link>

                <p
                  className={`mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] italic ${FONT_SERIF}`}
                  style={{ color: INK_SOFT }}
                >
                  <ShieldCheck size={12} />
                  ชำระเงินปลอดภัย · เข้ารหัส SSL
                </p>
              </div>

              {/* Trust strip — apothecary parchment notes */}
              <ul
                className={`space-y-3 text-sm italic ${FONT_SERIF}`}
                style={{ color: INK_SOFT }}
              >
                <li className="flex items-start gap-2.5">
                  <Truck
                    size={14}
                    className="mt-0.5"
                    style={{ color: ACCENT }}
                  />
                  <span>
                    จัดส่งฟรีเมื่อยอดสั่งซื้อถึง{' '}
                    {formatTHB(FREE_SHIPPING_THRESHOLD)} — ห่อด้วยกระดาษคราฟท์
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <RotateCcw
                    size={14}
                    className="mt-0.5"
                    style={{ color: ACCENT }}
                  />
                  <span>
                    เปลี่ยนกลิ่นหรือคืนสินค้าได้ภายใน ๗ วัน — ขวดยังต้องปิดผนึก
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Leaf
                    size={14}
                    className="mt-0.5"
                    style={{ color: ACCENT }}
                  />
                  <span>
                    ส่วนผสมจากธรรมชาติ คัดเลือกทีละล็อต · ปลอดสารทดสอบในสัตว์
                  </span>
                </li>
              </ul>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function HinokiEmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div
      className="mx-auto max-w-xl text-center py-12 sm:py-16 px-6 border border-dashed"
      style={{
        background: SURFACE,
        borderColor: HAIRLINE,
      }}
    >
      {/* Empty bottle silhouette */}
      <div
        className="mx-auto mb-8 h-32 w-20 rounded-t-[3rem] rounded-b-md relative"
        style={{
          background: MUTED,
          border: `1px solid ${HAIRLINE}`,
        }}
      >
        <div
          aria-hidden
          className="absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-6 rounded-sm"
          style={{ background: ACCENT }}
        />
        <div
          aria-hidden
          className="absolute inset-x-3 top-12 h-12 border border-dashed"
          style={{ borderColor: HAIRLINE }}
        />
      </div>

      <h2
        className={`text-3xl sm:text-4xl font-light tracking-wide ${FONT_SERIF}`}
        style={{ color: INK }}
      >
        ขวดเปล่าบนชั้นไม้
      </h2>
      <p
        className={`mt-3 text-base italic leading-relaxed ${FONT_SERIF}`}
        style={{ color: INK_SOFT }}
      >
        เลือกกลิ่นที่ใช่จากชั้นวางของเรา —
        <br className="hidden sm:block" />
        เรื่องเล่าทุกบทรอคุณอ่านอยู่
      </p>
      <Link
        href={`/stores/${storeSlug}`}
        className={`mt-8 inline-flex h-12 items-center justify-center px-10 text-xs uppercase tracking-[0.28em] transition-colors ${
          // body font on CTA for contrast vs serif copy
          'font-[family:var(--font-prompt)]'
        }`}
        style={{
          background: INK,
          color: 'var(--shop-bg, #f6efe2)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = ACCENT;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = INK;
        }}
      >
        เริ่มอ่านบทแรก →
      </Link>
    </div>
  );
}

// Keep the named export to match the prior file shape, in case any
// future dispatcher imports `{ CartPage }` directly from this module.
export { HinokiApothecaryCart as CartPage };
