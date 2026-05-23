'use client';

/**
 * Bikini Beach — bespoke Cart page (replaces the missing cart slot).
 *
 * Two exports live in this file:
 *
 *  1. `Cart` (named) — the original BIKINI551 designer presentational
 *     component. Kept intact for back-compat with `BikiniCartAdapter`
 *     in `../adapters.tsx`, which still imports it. Designer Props:
 *     `{ items, freeShippingThreshold, currentSubtotal, … shopUrl }`.
 *
 *  2. `default` — `bikini_beach_Cart`, the new self-contained page
 *     that conforms to the scaffold `CartProps` shape consumed by
 *     `lib/templates/registry.ts` (`{ store, items, freeShippingThreshold,
 *     flatShippingTHB }`). It reads the per-store `useCart` zustand
 *     selector directly, owns the free-shipping progress bar, a coupon
 *     input wired to `POST /api/coupons/preview`, the sticky order
 *     summary, and a checkout CTA that POSTs to `/api/checkout`. Thai
 *     copy + `formatTHB`; beach palette via the existing `bk-*` CSS
 *     classes defined in `app/globals.css :: .theme-bikini-beach`.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  IconArrowRight,
  IconTrash,
  IconTruck,
  IconShieldCheck,
  IconRefresh,
  IconTag,
  IconArrowLeft,
  IconShoppingBag,
  IconSparkles,
  IconSun,
} from '@tabler/icons-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CartProps as ScaffoldCartProps } from '@/lib/templates/types';

// ============================================================================
// 1) ORIGINAL DESIGNER COMPONENT — preserved verbatim for BikiniCartAdapter.
// ============================================================================

export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  /** Selected variant text e.g. "Pink · M" */
  variant: string;
  price: number;
  was?: number;
  qty: number;
  /** Hex color for swatch */
  colorHex?: string;
  /** Background variant key */
  bgVariant?: string;
  illustration?: React.ReactNode;
  /** Per-item promo applied */
  discount?: number;
}

export interface CartProps {
  items?: CartItem[];
  freeShippingThreshold?: number;
  currentSubtotal?: number;
  /** Shipping fee shown in summary when below threshold */
  shippingFee?: number;
  /** Applied promo code state */
  promoApplied?: { code: string; amount: number } | null;
  onUpdateQty?: (itemId: string, qty: number) => void;
  onRemove?: (itemId: string) => void;
  onApplyPromo?: (code: string) => void;
  onCheckout?: () => void;
  // URL prop: shop / catalog landing page (continue shopping link)
  shopUrl: string;
}

const tinyBikini = (color: string) => (
  <svg viewBox="0 0 200 250" width="80%" aria-hidden="true">
    <path d="M40 60 Q70 45 100 60 L105 100 Q80 115 50 105 Z" fill={color} />
    <path d="M100 60 Q130 45 160 60 L155 100 Q125 115 100 100 Z" fill={color} />
    <path d="M50 140 Q100 132 150 140 L145 200 Q100 210 55 200 Z" fill={color} />
  </svg>
);

const DEFAULT_ITEMS: CartItem[] = [
  { id: 'i1', productId: 'p1', slug: 'polka-pink-triangle', name: 'Polka Pink · Triangle Bikini Set', variant: 'Bubblegum Pink · Size M', price: 890, was: 1290, qty: 1, colorHex: '#EC4899', bgVariant: 'bg-rose', illustration: tinyBikini('#EC4899') },
  { id: 'i2', productId: 'p2', slug: 'ocean-blue', name: 'Ocean Blue · Bandeau Two-Piece', variant: 'Ocean Sky · Size S', price: 1290, qty: 1, colorHex: '#38BDF8', bgVariant: 'bg-sky', illustration: tinyBikini('#38BDF8') },
  { id: 'i3', productId: 'p3', slug: 'sunset-gold', name: 'Sunset Gold · Tankini Eco-Set', variant: 'Tropical Green · Size L', price: 1190, was: 1990, qty: 2, colorHex: '#10B981', bgVariant: 'bg-green', illustration: tinyBikini('#10B981') },
];

export function Cart({
  items = DEFAULT_ITEMS,
  freeShippingThreshold = 890,
  currentSubtotal,
  shippingFee = 60,
  promoApplied = { code: 'WELCOME200', amount: 200 },
  onUpdateQty,
  onRemove,
  onApplyPromo,
  onCheckout,
  shopUrl,
}: CartProps) {
  const [promo, setPromo] = useState('');

  const subtotal = currentSubtotal ?? items.reduce((s, i) => s + i.price * i.qty, 0);
  const savings = items.reduce((s, i) => (i.was ? s + (i.was - i.price) * i.qty : s), 0);
  const promoAmount = promoApplied?.amount ?? 0;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal - promoAmount + shipping;
  const progressPct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <main>
      {/* HEADING */}
      <div className="bk-container" style={{ padding: '40px 24px 16px' }}>
        <h1 style={{ marginBottom: 8 }}>🛍️ Shopping Bag</h1>
        <p style={{ color: 'var(--bikini-text-2)', fontWeight: 600 }}>
          คุณมี <b style={{ color: 'var(--shop-primary)' }}>{items.length}</b> สินค้าในตะกร้า · พร้อมเช็คเอาท์
        </p>
      </div>

      <div className="bk-container">
        <div className="bk-cart">
          {/* ITEMS */}
          <div className="bk-cart-items">
            {/* Progress */}
            <div className="bk-cart-progress" role="status" aria-live="polite">
              <div className="lbl">
                {shipping > 0 ? (
                  <>เพิ่มอีก <b style={{ color: 'var(--shop-primary)' }}>฿{(freeShippingThreshold - subtotal).toLocaleString()}</b> รับส่งฟรี! 🚚</>
                ) : (
                  <>✨ คุณได้รับ <b style={{ color: 'var(--shop-primary)' }}>ส่งฟรี</b> แล้ว!</>
                )}
              </div>
              <div className="bar"><div className="bar-fill" style={{ width: `${progressPct}%` }} /></div>
            </div>

            {/* Rows */}
            {items.map((item) => (
              <div key={item.id} className="bk-cart-row">
                <div className={`bk-cart-img ${item.bgVariant ?? 'bg-rose'}`}>
                  {item.illustration ?? tinyBikini(item.colorHex ?? '#EC4899')}
                </div>
                <div className="bk-cart-info">
                  <div className="name">{item.name}</div>
                  <div className="variant">{item.variant}</div>
                  {item.was && (
                    <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      ✓ ประหยัด ฿{((item.was - item.price) * item.qty).toLocaleString()}
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>฿{item.price.toLocaleString()}</span>
                  {item.was && <span style={{ display: 'block', fontSize: 12, color: 'var(--bikini-muted)', textDecoration: 'line-through' }}>฿{item.was.toLocaleString()}</span>}
                </div>
                <div className="bk-qty" role="group" aria-label={`Quantity for ${item.name}`}>
                  <button type="button" onClick={() => onUpdateQty?.(item.id, Math.max(1, item.qty - 1))} aria-label="Decrease">−</button>
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => onUpdateQty?.(item.id, parseInt(e.target.value, 10) || 1)}
                    aria-label="Quantity"
                  />
                  <button type="button" onClick={() => onUpdateQty?.(item.id, item.qty + 1)} aria-label="Increase">+</button>
                </div>
                <div className="bk-cart-subtotal">฿{(item.price * item.qty).toLocaleString()}</div>
                <button
                  type="button"
                  className="bk-cart-remove"
                  onClick={() => onRemove?.(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  <IconTrash size={18} />
                </button>
              </div>
            ))}

            {/* Continue shopping */}
            <div style={{ padding: 22, borderTop: '1px solid var(--shop-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <a href={shopUrl} className="bk-btn bk-btn-ghost bk-btn-sm">
                <IconArrowLeft size={14} /> ช้อปต่อ
              </a>
              {savings > 0 && (
                <div style={{ background: 'var(--bikini-coral-pale)', padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 800, color: 'var(--shop-primary)' }}>
                  💰 คุณประหยัด ฿{savings.toLocaleString()} จากราคาเต็ม
                </div>
              )}
            </div>
          </div>

          {/* SUMMARY */}
          <aside className="bk-summary" aria-label="Order summary">
            <h4>📋 สรุปคำสั่งซื้อ</h4>

            <div className="bk-summary-row">
              <span>Subtotal ({items.length} ชิ้น)</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            {savings > 0 && (
              <div className="bk-summary-row discount">
                <span>ส่วนลด</span>
                <span>− ฿{savings.toLocaleString()}</span>
              </div>
            )}
            <div className="bk-summary-row">
              <span>ค่าจัดส่ง</span>
              <span style={shipping === 0 ? { color: '#10B981', fontWeight: 800 } : undefined}>
                {shipping === 0 ? '🎁 ฟรี' : `฿${shipping}`}
              </span>
            </div>
            {promoApplied && (
              <div className="bk-summary-row discount">
                <span>โค้ด {promoApplied.code}</span>
                <span>− ฿{promoApplied.amount.toLocaleString()}</span>
              </div>
            )}

            {/* Promo input */}
            <form
              className="bk-promo"
              onSubmit={(e) => { e.preventDefault(); onApplyPromo?.(promo); }}
            >
              <input
                type="text"
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                placeholder="ใส่โค้ดส่วนลด"
                aria-label="Promo code"
              />
              <button type="submit"><IconTag size={14} /> ใช้</button>
            </form>

            <div className="bk-summary-row total">
              <span>รวมทั้งหมด</span>
              <span className="amount">฿{total.toLocaleString()}</span>
            </div>

            <button
              type="button"
              className="bk-btn bk-btn-primary bk-btn-lg bk-btn-block"
              style={{ marginTop: 16 }}
              onClick={onCheckout}
            >
              เช็คเอาท์ <IconArrowRight size={16} />
            </button>

            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--shop-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--bikini-text-2)', fontWeight: 600 }}>
                <IconTruck size={16} color="var(--shop-primary)" /> ส่งภายใน 24 ชม.
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--bikini-text-2)', fontWeight: 600 }}>
                <IconShieldCheck size={16} color="var(--shop-primary)" /> ห่อแบบ Discreet
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--bikini-text-2)', fontWeight: 600 }}>
                <IconRefresh size={16} color="var(--shop-primary)" /> เปลี่ยนไซส์ฟรี 14 วัน
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// 2) NEW BESPOKE PAGE — scaffold-CartProps shape (default export).
// ============================================================================
//
// This is the bespoke Cart that the registry will wire into the
// `bikini-beach.pages.cart` slot. It owns full client-side cart state
// (useCart filtered by store slug) so it never trusts SSR `items` —
// the dispatcher passes `items=[]` server-side and zustand hydrates
// the real cart in the browser.
//
// The eight `bg-*` swatches cycle across line items so the cart reads
// as a curated lookbook rail rather than a sterile grid — same palette
// as the homepage featured-products carousel for visual continuity.

const ROW_BG_VARIANTS = [
  'bg-rose',
  'bg-sky',
  'bg-yellow',
  'bg-orange',
  'bg-blue',
  'bg-green',
  'bg-purple',
  'bg-coral',
] as const;

const SWATCH_HEX = ['#EC4899', '#38BDF8', '#FACC15', '#F97316', '#3B82F6', '#10B981', '#A855F7', '#FB7185'] as const;

interface PromoState {
  code: string;
  amountTHB: number;
}

/**
 * `bikini_beach_Cart` — bespoke Cart page wired to the per-store zustand
 * cart. Pulled into the registry's `cart` slot when the editor flips the
 * bikini-beach template's cart back to its bespoke designer surface.
 */
export default function bikini_beach_Cart(props: ScaffoldCartProps) {
  const { store, freeShippingThreshold = 990, flatShippingTHB = 50 } = props;

  // Per-store cart state — filter by slug so a customer who also has
  // items at another bikini-adjacent shop doesn't see them mixed in.
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.remove);

  // Hydration guard — cart lives in localStorage, so SSR markup must
  // be the empty shell or React will mismatch on the first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const storeLines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  const subtotal = useMemo(
    () => storeLines.reduce((sum, l) => sum + l.priceTHB * l.qty, 0),
    [storeLines],
  );
  const itemCount = useMemo(
    () => storeLines.reduce((n, l) => n + l.qty, 0),
    [storeLines],
  );

  // Coupon state — POST /api/coupons/preview is the read-only preview
  // hook; the authoritative re-validation happens in /api/checkout when
  // the order is created. Any non-2xx response is treated as "code is
  // invalid" with a Thai error string.
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoState | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);

  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const shippingTHB = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : flatShippingTHB;
  const discountTHB = promo?.amountTHB ?? 0;
  const totalTHB = Math.max(0, subtotal - discountTHB + shippingTHB);
  const remainingToFree = Math.max(0, freeShippingThreshold - subtotal);
  const progressPct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  async function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoBusy(true);
    setPromoError(null);
    try {
      const res = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code,
          storeSlug: store.slug,
          items: storeLines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
            priceTHB: l.priceTHB,
          })),
          subtotalTHB: subtotal,
        }),
      });
      if (!res.ok) {
        setPromo(null);
        setPromoError('โค้ดไม่ถูกต้อง หรือหมดอายุแล้ว');
        return;
      }
      const data = (await res.json()) as { ok?: boolean; amountTHB?: number; reason?: string };
      if (data.ok && typeof data.amountTHB === 'number') {
        setPromo({ code, amountTHB: data.amountTHB });
        setPromoError(null);
        setPromoInput('');
      } else {
        setPromo(null);
        setPromoError('โค้ดนี้ใช้กับตะกร้าปัจจุบันไม่ได้');
      }
    } catch {
      setPromo(null);
      setPromoError('เชื่อมต่อระบบโค้ดไม่ได้ ลองใหม่อีกครั้ง');
    } finally {
      setPromoBusy(false);
    }
  }

  async function startCheckout() {
    if (storeLines.length === 0 || checkoutBusy) return;
    setCheckoutBusy(true);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storeSlug: store.slug,
          items: storeLines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
          })),
          couponCode: promo?.code ?? null,
        }),
      });
      if (!res.ok) {
        setCheckoutError('ไม่สามารถเริ่มเช็คเอาท์ได้ ลองอีกครั้ง');
        return;
      }
      const data = (await res.json()) as { url?: string; redirectUrl?: string };
      const next = data.url ?? data.redirectUrl ?? `/stores/${store.slug}/checkout/address`;
      if (typeof window !== 'undefined') {
        window.location.href = next;
      }
    } catch {
      // Fall back to the address page so the customer is never trapped
      // on the cart screen when the API is unreachable in dev.
      if (typeof window !== 'undefined') {
        window.location.href = `/stores/${store.slug}/checkout/address`;
      }
    } finally {
      setCheckoutBusy(false);
    }
  }

  const shopUrl = `/stores/${store.slug}/category`;
  const homeUrl = `/stores/${store.slug}`;

  // ── EMPTY STATE ──────────────────────────────────────────────────
  if (mounted && storeLines.length === 0) {
    return (
      <main className="theme-bikini-beach" style={{ background: 'var(--shop-bg)', minHeight: '60vh' }}>
        <div className="bk-container" style={{ padding: '64px 24px 96px', textAlign: 'center' }}>
          <div
            aria-hidden="true"
            style={{
              width: 140,
              height: 140,
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'var(--bikini-bg-coral)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px -16px rgba(236, 72, 153, 0.4)',
            }}
          >
            <IconShoppingBag size={64} color="var(--shop-primary)" stroke={1.6} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>
            ตะกร้ายังว่างอยู่
            <span aria-hidden="true" style={{ marginLeft: 8 }}>🌊</span>
          </h1>
          <p style={{ color: 'var(--bikini-text-2)', fontSize: 14, fontWeight: 600, marginBottom: 28 }}>
            ลองเลือกชุดว่ายน้ำตัวโปรดจาก {store.name} ก่อนไปเที่ยวทะเลกันเลย!
          </p>
          <a href={shopUrl} className="bk-btn bk-btn-primary bk-btn-lg">
            <IconSun size={16} /> เริ่มช้อปเลย <IconArrowRight size={16} />
          </a>
          <div style={{ marginTop: 12 }}>
            <a href={homeUrl} className="bk-btn bk-btn-ghost bk-btn-sm">
              <IconArrowLeft size={14} /> กลับหน้าแรก
            </a>
          </div>
        </div>
      </main>
    );
  }

  // SSR / pre-hydration placeholder — keeps layout height stable so
  // the page doesn't jump when zustand rehydrates.
  if (!mounted) {
    return <div className="theme-bikini-beach" style={{ minHeight: '60vh' }} aria-hidden="true" />;
  }

  // ── POPULATED CART ───────────────────────────────────────────────
  return (
    <main className="theme-bikini-beach" style={{ background: 'var(--shop-bg)' }}>
      {/* Heading band — coral/sky gradient ribbon for that vacation feel */}
      <div className="bk-container" style={{ padding: '40px 24px 16px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'var(--bikini-coral-pale)',
            color: 'var(--shop-primary)',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          <IconSparkles size={14} /> Your Beach Bag
        </div>
        <h1 style={{ marginBottom: 8, fontSize: 32, fontWeight: 900, letterSpacing: -0.5 }}>
          ตะกร้าสินค้า
          <span aria-hidden="true" style={{ marginLeft: 8 }}>🌴</span>
        </h1>
        <p style={{ color: 'var(--bikini-text-2)', fontWeight: 600 }}>
          คุณมี{' '}
          <b style={{ color: 'var(--shop-primary)' }}>
            {itemCount} ชิ้น
          </b>{' '}
          จาก {store.name} · พร้อมเช็คเอาท์
        </p>
      </div>

      <div className="bk-container">
        <div className="bk-cart">
          {/* ITEMS COLUMN */}
          <div className="bk-cart-items">
            {/* Free-shipping progress */}
            <div className="bk-cart-progress" role="status" aria-live="polite">
              <div className="lbl">
                {remainingToFree > 0 ? (
                  <>
                    เพิ่มอีก{' '}
                    <b style={{ color: 'var(--shop-primary)' }}>
                      {formatTHB(remainingToFree)}
                    </b>{' '}
                    รับส่งฟรีทันที! <span aria-hidden="true">🚚</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">✨</span> คุณได้รับ{' '}
                    <b style={{ color: 'var(--shop-primary)' }}>ส่งฟรี</b> เรียบร้อย!
                  </>
                )}
              </div>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{ width: `${progressPct}%` }}
                  aria-label={`Free shipping progress: ${progressPct}%`}
                />
              </div>
            </div>

            {/* Line items */}
            {storeLines.map((line, idx) => {
              const bgVariant = ROW_BG_VARIANTS[idx % ROW_BG_VARIANTS.length];
              const swatch = SWATCH_HEX[idx % SWATCH_HEX.length];
              const lineTotal = line.priceTHB * line.qty;
              return (
                <div key={`${line.productId}-${idx}`} className="bk-cart-row">
                  <div className={`bk-cart-img ${bgVariant}`}>
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt={line.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      tinyBikini(swatch)
                    )}
                  </div>
                  <div className="bk-cart-info">
                    <div className="name">{line.title}</div>
                    <div className="variant">{store.name}</div>
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>
                      {formatTHB(line.priceTHB)}
                    </span>
                  </div>
                  <div
                    className="bk-qty"
                    role="group"
                    aria-label={`จำนวนของ ${line.title}`}
                  >
                    <button
                      type="button"
                      onClick={() => setQty(line.productId, Math.max(1, line.qty - 1), store.slug)}
                      aria-label="ลดจำนวน"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) =>
                        setQty(line.productId, Math.max(1, parseInt(e.target.value, 10) || 1), store.slug)
                      }
                      aria-label={`จำนวนของ ${line.title}`}
                    />
                    <button
                      type="button"
                      onClick={() => setQty(line.productId, line.qty + 1, store.slug)}
                      aria-label="เพิ่มจำนวน"
                    >
                      +
                    </button>
                  </div>
                  <div className="bk-cart-subtotal">{formatTHB(lineTotal)}</div>
                  <button
                    type="button"
                    className="bk-cart-remove"
                    onClick={() => removeLine(line.productId, store.slug)}
                    aria-label={`ลบ ${line.title} ออกจากตะกร้า`}
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              );
            })}

            {/* Footer rail — continue shopping + soft trust badge */}
            <div
              style={{
                padding: 22,
                borderTop: '1px solid var(--shop-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <a href={shopUrl} className="bk-btn bk-btn-ghost bk-btn-sm">
                <IconArrowLeft size={14} /> ช้อปต่อ
              </a>
              <div
                style={{
                  background: 'var(--bikini-sky-pale)',
                  padding: '8px 16px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--bikini-sky-deep)',
                }}
              >
                <span aria-hidden="true">🌊</span> สดใหม่จากชายหาดทุกออเดอร์
              </div>
            </div>
          </div>

          {/* STICKY SUMMARY COLUMN */}
          <aside className="bk-summary" aria-label="สรุปคำสั่งซื้อ">
            <h4 style={{ fontSize: 16, fontWeight: 900 }}>
              <span aria-hidden="true">📋</span> สรุปคำสั่งซื้อ
            </h4>

            <div className="bk-summary-row">
              <span>ยอดรวมสินค้า ({itemCount} ชิ้น)</span>
              <span>{formatTHB(subtotal)}</span>
            </div>

            <div className="bk-summary-row">
              <span>ค่าจัดส่ง</span>
              <span
                style={shippingTHB === 0 ? { color: '#10B981', fontWeight: 800 } : undefined}
              >
                {shippingTHB === 0 ? (
                  <>
                    <span aria-hidden="true">🎁</span> ฟรี
                  </>
                ) : (
                  formatTHB(shippingTHB)
                )}
              </span>
            </div>

            {promo && (
              <div className="bk-summary-row discount">
                <span>
                  โค้ด <b>{promo.code}</b>
                </span>
                <span>− {formatTHB(promo.amountTHB)}</span>
              </div>
            )}

            {/* Promo input — POST /api/coupons/preview */}
            <form className="bk-promo" onSubmit={applyPromo}>
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="ใส่โค้ดส่วนลด"
                aria-label="โค้ดส่วนลด"
                disabled={promoBusy}
              />
              <button type="submit" disabled={promoBusy || !promoInput.trim()}>
                <IconTag size={14} /> {promoBusy ? 'กำลังเช็ค…' : 'ใช้'}
              </button>
            </form>
            {promoError && (
              <div
                role="alert"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#EF4444',
                  marginTop: -8,
                  marginBottom: 8,
                }}
              >
                {promoError}
              </div>
            )}

            <div className="bk-summary-row total">
              <span>รวมทั้งหมด</span>
              <span className="amount">{formatTHB(totalTHB)}</span>
            </div>

            <button
              type="button"
              className="bk-btn bk-btn-primary bk-btn-lg bk-btn-block"
              style={{ marginTop: 16 }}
              onClick={startCheckout}
              disabled={checkoutBusy || storeLines.length === 0}
            >
              {checkoutBusy ? 'กำลังเริ่มเช็คเอาท์…' : 'เช็คเอาท์'} <IconArrowRight size={16} />
            </button>
            {checkoutError && (
              <div
                role="alert"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#EF4444',
                  marginTop: 8,
                }}
              >
                {checkoutError}
              </div>
            )}

            {/* Trust list — beach-luxe service rail */}
            <div
              style={{
                marginTop: 18,
                paddingTop: 18,
                borderTop: '1px solid var(--shop-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 11,
                  color: 'var(--bikini-text-2)',
                  fontWeight: 600,
                }}
              >
                <IconTruck size={16} color="var(--shop-primary)" /> ส่งภายใน 24 ชม.
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 11,
                  color: 'var(--bikini-text-2)',
                  fontWeight: 600,
                }}
              >
                <IconShieldCheck size={16} color="var(--shop-primary)" /> ห่อแบบ Discreet
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 11,
                  color: 'var(--bikini-text-2)',
                  fontWeight: 600,
                }}
              >
                <IconRefresh size={16} color="var(--shop-primary)" /> เปลี่ยนไซส์ฟรี 14 วัน
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
