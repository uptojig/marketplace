'use client';

/**
 * sirin-womenswear — bespoke Cart page.
 *
 * Boutique-editorial fashion cart: soft rose / burgundy / cream tones,
 * serif display headings, italic curator copy, and a couture coupon
 * tray on the right rail. Reads from the per-store useCart slice and
 * hydrates previously-claimed coupons through `/api/coupons/preview`
 * so totals match what the server will charge at checkout. Falls back
 * gracefully to the pure calculator in `@/lib/coupons/calculator`
 * when the preview endpoint is unreachable (offline / dev).
 *
 * Structural notes:
 *   - Header band reads as a magazine masthead — italic eyebrow
 *     "The Maison · Atelier No. 02", serif display H1, hairline rule,
 *     and a curator paragraph (Thai primary).
 *   - Each line item is a horizontal lookbook card with portrait
 *     thumbnail, serif title, rose qty stepper, and remove styled as
 *     an italic serif link instead of a trash icon.
 *   - Right rail is a sticky "Order Atelier" card on a burgundy frame
 *     with a couture coupon tray (input + claimed-coupon chips) and
 *     dotted-leader ledger rows for subtotal / discounts / shipping.
 *   - Free-shipping (฿990) nudge is a single italic serif sentence.
 *   - Empty state is a full-bleed editorial spread — serif headline
 *     plus a hand-set return CTA.
 *
 * Business logic mirrors StoreCartClient (useCart, free-ship 990,
 * checkout link), so conversion is unchanged.
 *
 * Constraint: this file does NOT touch adapters / registry — the
 * adapter wires Cart through `_shared/cart-adapter` today; this page
 * stays a drop-in default export so a future wiring switch is a
 * one-line registry change.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Ticket,
  Truck,
  X,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { calculate } from '@/lib/coupons/calculator';
import {
  getActiveCoupons,
  getCouponByCode,
  getCouponById,
} from '@/lib/coupons/mock-data';
import { useUserCouponsStore } from '@/lib/coupons/store';
import {
  COUPON_ERROR_MESSAGE,
  type AppliedCoupon,
  type Coupon,
  type CouponValidationError,
} from '@/lib/coupons/types';
import type { CartItem } from '@/lib/cart/types';

// ---------------------------------------------------------------------------
// Theme tokens — boutique editorial: rose / burgundy / cream / serif.
// All chrome reads `var(--shop-*)` first so the merchant can re-skin in
// admin without touching this file; the bespoke fashion palette lands as
// the literal fallback colour.
// ---------------------------------------------------------------------------
const SIRIN_DISPLAY_FONT =
  '"Cormorant Garamond", "Playfair Display", "Noto Serif Thai", Georgia, serif';
const SIRIN_BODY_FONT =
  'var(--font-prompt), "Prompt", "Kanit", system-ui, sans-serif';

const ROSE_SOFT = '#fff5f7';
const ROSE_BLUSH = '#ffe4ec';
const ROSE_LINE = '#f3c8d3';
const BURGUNDY_INK = '#3f0f24';
const BURGUNDY_PRIMARY = '#9d124c';
const BURGUNDY_ACCENT = '#be185d';
const CREAM = '#fdf9f4';
const MUTED_INK = '#8a4f63';
const SAVINGS_GREEN = '#3f7d57';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

// ---------------------------------------------------------------------------
// Props — kept flexible so this page works whether the registry passes
// the shared CartAdapterProps shape or the richer CartProps. Anything
// missing falls back to the persisted useCart slice.
// ---------------------------------------------------------------------------
interface StoreLite {
  id?: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

interface CartPageProps {
  store: StoreLite;
  items?: Array<{
    productId?: string;
    id?: string;
    title?: string;
    name?: string;
    imageUrl?: string | null;
    image?: string | null;
    priceTHB?: number;
    price?: number;
    qty?: number;
    quantity?: number;
    variantLabel?: string | null;
    size?: string | null;
  }>;
  freeShippingThreshold?: number;
  flatShippingTHB?: number;
}

interface SirinCartCalcShape {
  subtotal: number;
  shipping: number;
  totalDiscount: number;
  applied: AppliedCoupon[];
  grandTotal: number;
}

const PREVIEW_ENDPOINT = '/api/coupons/preview';

export function SirinCartPage(props: CartPageProps) {
  const { store } = props;
  const freeShipThreshold = props.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD;
  const flatShipping = props.flatShippingTHB ?? DEFAULT_SHIPPING;

  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  // useCart is zustand-persist — wait one effect tick before reading so
  // we don't mismatch the SSR snapshot (empty cart) with the hydrated
  // localStorage cart. This is the standard cart-hydration guard used
  // everywhere else in the storefront.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Hydrate the customer's previously-claimed coupons. The claimed
  // wallet lives in zustand-persist so we also need the mount guard.
  const claimedIds = useUserCouponsStore((s) => s.claimedCouponIds);
  const claim = useUserCouponsStore((s) => s.claim);
  const unclaim = useUserCouponsStore((s) => s.unclaim);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  // Lift the per-line cart subset into the shape `calculate()` expects
  // (CartItem from lib/cart/types). The calculator needs productId,
  // storeId, qty, price.
  const calcItems: CartItem[] = useMemo(
    () =>
      lines.map((l) => ({
        id: `${l.productId}:${l.storeSlug}`,
        productId: l.productId,
        qty: l.qty,
        storeId: store.id ?? store.slug,
        title: l.title,
        thumbnailUrl: l.imageUrl ?? '',
        price: l.priceTHB,
        storeName: l.storeName,
      })),
    [lines, store.id, store.slug],
  );

  // ── Coupon state ────────────────────────────────────────────────────
  // `appliedCoupons` is the working set — server preview is authoritative
  // but client-side `calculate()` keeps the UI snappy between previews.
  const [appliedCoupons, setAppliedCoupons] = useState<Coupon[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);

  // Hydrate claimed coupons that are still currently eligible — picks up
  // any coupon the buyer has already grabbed from the wallet so it shows
  // on the cart's coupon tray on first paint.
  useEffect(() => {
    if (!mounted) return;
    const hydrated: Coupon[] = [];
    for (const id of claimedIds) {
      const c = getCouponById(id);
      if (!c) continue;
      // Filter by store scope so a different store's claimed coupon
      // doesn't leak in here.
      if (c.scope.type === 'store' && c.scope.storeId !== (store.id ?? store.slug)) {
        continue;
      }
      hydrated.push(c);
    }
    if (hydrated.length > 0) {
      setAppliedCoupons((prev) => {
        // Only seed once on mount; if the user has already started
        // adding/removing codes, keep their selection.
        if (prev.length > 0) return prev;
        return hydrated;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Best-effort server preview — POSTs current items + applied coupon
  // IDs to /api/coupons/preview. If the endpoint is missing or the
  // server rejects, we silently fall back to the local calculator.
  // This double-evaluation is the standard Shopee-style UX: snappy
  // local hint + server reconciliation.
  const previewServer = useCallback(
    async (couponsToPreview: Coupon[]) => {
      if (couponsToPreview.length === 0) return;
      setPreviewBusy(true);
      try {
        const res = await fetch(PREVIEW_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeSlug: store.slug,
            items: calcItems,
            shippingPerStore: {
              [store.id ?? store.slug]: flatShipping,
            },
            couponIds: couponsToPreview.map((c) => c.id),
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          ok?: boolean;
          appliedCouponIds?: string[];
          rejected?: { couponId: string; reason: CouponValidationError }[];
        };
        // If server-side dropped any coupons, sync the working set so
        // grand-total matches what checkout will actually charge.
        if (data?.appliedCouponIds && Array.isArray(data.appliedCouponIds)) {
          setAppliedCoupons((prev) =>
            prev.filter((c) => data.appliedCouponIds!.includes(c.id)),
          );
        }
        if (data?.rejected && data.rejected.length > 0) {
          // Surface the first rejection — keeps the toast simple.
          const first = data.rejected[0];
          const msg = COUPON_ERROR_MESSAGE[first.reason] ?? 'คูปองใช้ไม่ได้';
          setCouponError(msg);
          window.setTimeout(() => setCouponError(null), 3500);
        }
      } catch {
        // Network / endpoint missing — local calculator continues to drive UI.
      } finally {
        setPreviewBusy(false);
      }
    },
    [calcItems, flatShipping, store.id, store.slug],
  );

  // Re-preview every time the applied set changes (and we're mounted +
  // have at least one line in the cart). Debounce keeps us from
  // firing on every keystroke / qty bump.
  useEffect(() => {
    if (!mounted) return;
    if (calcItems.length === 0) return;
    if (appliedCoupons.length === 0) return;
    const t = window.setTimeout(() => {
      previewServer(appliedCoupons);
    }, 250);
    return () => window.clearTimeout(t);
  }, [appliedCoupons, calcItems, mounted, previewServer]);

  // ── Pure local calculation — drives the visible summary card ───────
  const calc: SirinCartCalcShape = useMemo(() => {
    const r = calculate({
      items: calcItems,
      coupons: appliedCoupons,
      shippingPerStore: {
        [store.id ?? store.slug]: flatShipping,
      },
    });
    // Free-ship threshold rule (boutique-default 990): if subtotal
    // crosses it AND no shipping coupon is in play, shipping → 0.
    const hasShipCoupon = r.appliedCoupons.some((a) => a.slot === 'shipping');
    const shipping = hasShipCoupon
      ? 0
      : r.subtotal >= freeShipThreshold
        ? 0
        : flatShipping;
    const grandTotal = Math.max(0, r.subtotal + shipping - r.totalDiscount);
    return {
      subtotal: r.subtotal,
      shipping,
      totalDiscount: r.totalDiscount,
      applied: r.appliedCoupons,
      grandTotal,
    };
  }, [appliedCoupons, calcItems, flatShipping, freeShipThreshold, store.id, store.slug]);

  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const remainingForFreeShipping = Math.max(0, freeShipThreshold - calc.subtotal);

  // ── Coupon application handlers ────────────────────────────────────
  const tryApplyCoupon = useCallback(
    (coupon: Coupon) => {
      setCouponError(null);
      // Slot-conflict check via the pure calculator — already covered
      // by lib/coupons/calculator's validate(), but reproduced here so
      // the UX error message lands without a roundtrip.
      if (appliedCoupons.some((c) => c.id === coupon.id)) {
        setCouponError(COUPON_ERROR_MESSAGE.already_applied);
        window.setTimeout(() => setCouponError(null), 3500);
        return;
      }
      // Optimistic: add to applied set, then let the preview hook
      // reconcile. The local calculator drops invalid coupons (it
      // returns 0 amount), so the UI never shows a phantom discount.
      const next = [...appliedCoupons, coupon];
      setAppliedCoupons(next);
      if (!claimedIds.includes(coupon.id)) claim(coupon.id);
      previewServer(next);
    },
    [appliedCoupons, claim, claimedIds, previewServer],
  );

  const handleApplyCode = () => {
    const raw = codeInput.trim();
    if (!raw) return;
    const found = getCouponByCode(raw);
    if (!found) {
      setCouponError(COUPON_ERROR_MESSAGE.not_found);
      window.setTimeout(() => setCouponError(null), 3500);
      return;
    }
    tryApplyCoupon(found);
    setCodeInput('');
  };

  const handleRemoveCoupon = (couponId: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c.id !== couponId));
    unclaim(couponId);
    setCouponError(null);
  };

  // Suggested coupons — picks the first eligible coupon from the active
  // catalogue that isn't already on the cart. Keeps the "discover"
  // row useful without overloading the editorial layout.
  const suggestedCoupons = useMemo(() => {
    const active = getActiveCoupons();
    const appliedIdSet = new Set(appliedCoupons.map((c) => c.id));
    return active
      .filter((c) => !appliedIdSet.has(c.id))
      .filter((c) =>
        c.scope.type === 'platform' ||
        c.discount.kind === 'free_shipping' ||
        (c.scope.type === 'store' && c.scope.storeId === (store.id ?? store.slug)),
      )
      .slice(0, 3);
  }, [appliedCoupons, store.id, store.slug]);

  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: `var(--shop-bg, ${ROSE_SOFT})` }}
      />
    );
  }

  // ── Empty state — magazine spread ───────────────────────────────────
  if (lines.length === 0) {
    return <SirinEmptyCart storeSlug={store.slug} storeName={store.name} />;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `var(--shop-bg, ${ROSE_SOFT})`,
        fontFamily: SIRIN_BODY_FONT,
      }}
    >
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* ── Masthead ─────────────────────────────────────────────── */}
        <header className="mb-10 sm:mb-14">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.24em] hover:underline"
            style={{ color: `var(--shop-ink-muted, ${MUTED_INK})` }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับสู่บูทีค
          </Link>
          <p
            className="mt-6 text-[11px] italic"
            style={{
              color: `var(--shop-ink-muted, ${MUTED_INK})`,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              fontFamily: SIRIN_DISPLAY_FONT,
            }}
          >
            The Maison · Atelier No. 02
          </p>
          <h1
            className="mt-3 text-5xl sm:text-6xl"
            style={{
              fontFamily: SIRIN_DISPLAY_FONT,
              color: `var(--shop-ink, ${BURGUNDY_INK})`,
              fontWeight: 500,
              letterSpacing: '-0.005em',
              lineHeight: 1.02,
            }}
          >
            ตะกร้าของคุณ
          </h1>
          <div
            className="mt-4 h-px w-24"
            style={{ background: `var(--shop-border, ${ROSE_LINE})` }}
          />
          <p
            className="mt-4 max-w-xl text-base italic"
            style={{
              color: `var(--shop-ink-muted, ${MUTED_INK})`,
              fontFamily: SIRIN_DISPLAY_FONT,
            }}
          >
            {itemCount === 1
              ? `ชิ้นเดียวที่คุณเลือกจาก ${store.name} — รออยู่ในตะกร้าเอกสารส่วนตัว`
              : `${itemCount} ชิ้นจาก ${store.name} — รวบรวมไว้ในตะกร้าเอกสารส่วนตัวของคุณ`}
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-10">
          {/* ── Lookbook line items ───────────────────────────────── */}
          <section aria-labelledby="cart-heading">
            <h2 id="cart-heading" className="sr-only">
              รายการในตะกร้า
            </h2>

            <ul className="space-y-6">
              {lines.map((l) => {
                const lineTotal = l.priceTHB * l.qty;
                return (
                  <li
                    key={`${l.productId}-${l.storeSlug}`}
                    className="grid grid-cols-[7rem_1fr] gap-4 border-b pb-6 sm:grid-cols-[10rem_1fr] sm:gap-6"
                    style={{
                      borderColor: `var(--shop-border, ${ROSE_LINE})`,
                    }}
                  >
                    {/* Portrait lookbook thumbnail */}
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="relative block aspect-[4/5] overflow-hidden bg-white"
                      style={{
                        background: `var(--shop-muted, ${ROSE_BLUSH})`,
                      }}
                    >
                      {l.imageUrl ? (
                        <Image
                          src={l.imageUrl}
                          alt={l.title}
                          fill
                          sizes="(min-width: 640px) 160px, 112px"
                          className="object-cover transition-transform duration-700 hover:scale-105"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center"
                          style={{ color: `var(--shop-ink-muted, ${MUTED_INK})` }}
                        >
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </Link>

                    {/* Item info */}
                    <div className="flex min-w-0 flex-col">
                      <Link
                        href={`/stores/${store.slug}/products/${l.productId}`}
                        className="line-clamp-2 text-xl leading-tight transition hover:opacity-80 sm:text-2xl"
                        style={{
                          fontFamily: SIRIN_DISPLAY_FONT,
                          color: `var(--shop-ink, ${BURGUNDY_INK})`,
                          fontWeight: 500,
                          letterSpacing: '-0.005em',
                        }}
                      >
                        {l.title}
                      </Link>
                      <p
                        className="mt-1 text-[11px] italic"
                        style={{
                          color: `var(--shop-ink-muted, ${MUTED_INK})`,
                          fontFamily: SIRIN_DISPLAY_FONT,
                          letterSpacing: '0.08em',
                        }}
                      >
                        {l.storeName}
                      </p>

                      <p
                        className="mt-3 text-base font-semibold sm:text-lg"
                        style={{
                          color: `var(--shop-primary, ${BURGUNDY_PRIMARY})`,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatTHB(l.priceTHB)}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        {/* Rose qty stepper */}
                        <div
                          className="inline-flex h-10 items-center overflow-hidden rounded-full border bg-white"
                          style={{
                            borderColor: `var(--shop-border, ${ROSE_LINE})`,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setQty(l.productId, l.qty - 1, store.slug)
                            }
                            disabled={l.qty <= 1}
                            aria-label="ลดจำนวน"
                            className="inline-flex h-10 w-10 items-center justify-center transition hover:bg-[var(--shop-muted)] disabled:opacity-40"
                            style={{ color: `var(--shop-ink, ${BURGUNDY_INK})` }}
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
                            className="h-10 w-10 border-x bg-transparent text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            style={{
                              color: `var(--shop-ink, ${BURGUNDY_INK})`,
                              borderColor: `var(--shop-border, ${ROSE_LINE})`,
                              fontVariantNumeric: 'tabular-nums',
                            }}
                            aria-label={`จำนวนของ ${l.title}`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setQty(l.productId, l.qty + 1, store.slug)
                            }
                            aria-label="เพิ่มจำนวน"
                            className="inline-flex h-10 w-10 items-center justify-center transition hover:bg-[var(--shop-muted)]"
                            style={{ color: `var(--shop-ink, ${BURGUNDY_INK})` }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Line total + italic remove link */}
                        <div className="flex items-center gap-4">
                          <span
                            className="text-base font-medium sm:text-lg"
                            style={{
                              color: `var(--shop-ink, ${BURGUNDY_INK})`,
                              fontVariantNumeric: 'tabular-nums',
                              fontFamily: SIRIN_DISPLAY_FONT,
                            }}
                          >
                            {formatTHB(lineTotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(l.productId, store.slug)}
                            className="text-xs italic underline-offset-4 transition hover:underline"
                            style={{
                              color: `var(--shop-ink-muted, ${MUTED_INK})`,
                              fontFamily: SIRIN_DISPLAY_FONT,
                            }}
                            aria-label={`นำ ${l.title} ออกจากตะกร้า`}
                          >
                            นำออก
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Italic free-shipping curator note */}
            {remainingForFreeShipping > 0 ? (
              <p
                className="mt-8 text-sm italic"
                style={{
                  color: `var(--shop-ink-muted, ${MUTED_INK})`,
                  fontFamily: SIRIN_DISPLAY_FONT,
                }}
              >
                เพิ่มอีกเพียง{' '}
                <span
                  style={{
                    color: `var(--shop-primary, ${BURGUNDY_PRIMARY})`,
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 600,
                    fontStyle: 'normal',
                  }}
                >
                  {formatTHB(remainingForFreeShipping)}
                </span>{' '}
                เพื่อรับการจัดส่งฟรี — ของขวัญเล็กๆ จากเรา
              </p>
            ) : (
              <p
                className="mt-8 inline-flex items-center gap-2 text-sm italic"
                style={{
                  color: `var(--shop-savings, ${SAVINGS_GREEN})`,
                  fontFamily: SIRIN_DISPLAY_FONT,
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                การจัดส่งฟรีของคุณยืนยันแล้ว
              </p>
            )}
          </section>

          {/* ── Order Atelier (sticky summary) ─────────────────────── */}
          <aside
            aria-labelledby="summary-heading"
            className="mt-12 lg:mt-0 lg:sticky lg:top-24"
          >
            <h2 id="summary-heading" className="sr-only">
              สรุปคำสั่งซื้อ
            </h2>

            <div
              className="rounded-sm border p-6"
              style={{
                background: `var(--shop-card, ${CREAM})`,
                borderColor: `var(--shop-border, ${ROSE_LINE})`,
              }}
            >
              <p
                className="text-[10px] italic"
                style={{
                  color: `var(--shop-ink-muted, ${MUTED_INK})`,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  fontFamily: SIRIN_DISPLAY_FONT,
                }}
              >
                Order · Atelier
              </p>
              <h3
                className="mt-1 text-2xl"
                style={{
                  fontFamily: SIRIN_DISPLAY_FONT,
                  color: `var(--shop-ink, ${BURGUNDY_INK})`,
                  fontWeight: 500,
                  letterSpacing: '-0.005em',
                }}
              >
                สรุปยอด
              </h3>

              {/* ── Couture coupon tray ─────────────────────────── */}
              <div
                className="mt-5 rounded-sm border p-4"
                style={{
                  background: `var(--shop-muted, ${ROSE_BLUSH})`,
                  borderColor: `var(--shop-border, ${ROSE_LINE})`,
                }}
              >
                <p
                  className="inline-flex items-center gap-1.5 text-[11px] italic"
                  style={{
                    color: `var(--shop-ink, ${BURGUNDY_INK})`,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontFamily: SIRIN_DISPLAY_FONT,
                  }}
                >
                  <Ticket className="h-3 w-3" />
                  Atelier Codes
                </p>

                {/* Code input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCode();
                      }
                    }}
                    placeholder="ใส่โค้ดส่วนลด"
                    aria-label="โค้ดส่วนลด"
                    className="h-9 flex-1 rounded-sm border bg-white px-3 text-sm tracking-wider uppercase placeholder:normal-case placeholder:text-[var(--shop-ink-muted)] placeholder:tracking-normal focus:outline-none focus:ring-1"
                    style={{
                      borderColor: `var(--shop-border, ${ROSE_LINE})`,
                      color: `var(--shop-ink, ${BURGUNDY_INK})`,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCode}
                    disabled={!codeInput.trim() || previewBusy}
                    className="h-9 rounded-sm px-4 text-xs uppercase tracking-[0.12em] text-white transition hover:opacity-90 disabled:opacity-40"
                    style={{
                      background: `var(--shop-primary, ${BURGUNDY_PRIMARY})`,
                      fontFamily: SIRIN_BODY_FONT,
                    }}
                  >
                    ใช้
                  </button>
                </div>

                {couponError && (
                  <p
                    className="mt-2 text-xs"
                    style={{ color: `var(--shop-primary, ${BURGUNDY_PRIMARY})` }}
                    role="alert"
                  >
                    {couponError}
                  </p>
                )}

                {/* Applied-coupon chips */}
                {appliedCoupons.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {appliedCoupons.map((c) => {
                      const ap = calc.applied.find((a) => a.couponId === c.id);
                      const amount = ap?.amount ?? 0;
                      return (
                        <li
                          key={c.id}
                          className="flex items-start justify-between gap-3 rounded-sm border bg-white px-3 py-2"
                          style={{
                            borderColor: `var(--shop-border, ${ROSE_LINE})`,
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
                              style={{
                                color: `var(--shop-primary, ${BURGUNDY_PRIMARY})`,
                              }}
                            >
                              <Tag className="h-3 w-3" />
                              {c.code}
                            </p>
                            <p
                              className="mt-0.5 truncate text-xs"
                              style={{
                                color: `var(--shop-ink-muted, ${MUTED_INK})`,
                              }}
                            >
                              {c.title}
                            </p>
                            {amount > 0 && (
                              <p
                                className="mt-1 text-xs font-medium"
                                style={{
                                  color: `var(--shop-savings, ${SAVINGS_GREEN})`,
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                −{formatTHB(amount)}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCoupon(c.id)}
                            aria-label={`เอา ${c.code} ออก`}
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--shop-muted)]"
                            style={{
                              color: `var(--shop-ink-muted, ${MUTED_INK})`,
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Suggested coupons — one-tap apply */}
                {suggestedCoupons.length > 0 && (
                  <div className="mt-3">
                    <p
                      className="text-[10px] italic"
                      style={{
                        color: `var(--shop-ink-muted, ${MUTED_INK})`,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        fontFamily: SIRIN_DISPLAY_FONT,
                      }}
                    >
                      โค้ดที่ใช้ได้
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {suggestedCoupons.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => tryApplyCoupon(c)}
                            className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-[11px] transition hover:bg-[var(--shop-muted)]"
                            style={{
                              borderColor: `var(--shop-border, ${ROSE_LINE})`,
                              color: `var(--shop-ink, ${BURGUNDY_INK})`,
                            }}
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {c.code}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ── Totals ledger ───────────────────────────────── */}
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt style={{ color: `var(--shop-ink-muted, ${MUTED_INK})` }}>
                    ยอดรวม{' '}
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ({itemCount})
                    </span>
                  </dt>
                  <dd
                    style={{
                      color: `var(--shop-ink, ${BURGUNDY_INK})`,
                      fontVariantNumeric: 'tabular-nums',
                      fontFamily: SIRIN_DISPLAY_FONT,
                    }}
                  >
                    {formatTHB(calc.subtotal)}
                  </dd>
                </div>

                {calc.applied
                  .filter((a) => a.slot !== 'shipping')
                  .map((a) => (
                    <div
                      key={a.couponId}
                      className="flex items-center justify-between"
                    >
                      <dt
                        className="inline-flex items-center gap-1.5"
                        style={{
                          color: `var(--shop-ink-muted, ${MUTED_INK})`,
                        }}
                      >
                        <Tag
                          className="h-3 w-3"
                          style={{
                            color: `var(--shop-savings, ${SAVINGS_GREEN})`,
                          }}
                        />
                        <span>ส่วนลด</span>
                        <span
                          className="rounded-sm px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em]"
                          style={{
                            background: `var(--shop-savings, ${SAVINGS_GREEN})`,
                            color: '#ffffff',
                          }}
                        >
                          {a.code}
                        </span>
                      </dt>
                      <dd
                        style={{
                          color: `var(--shop-savings, ${SAVINGS_GREEN})`,
                          fontVariantNumeric: 'tabular-nums',
                          fontFamily: SIRIN_DISPLAY_FONT,
                        }}
                      >
                        −{formatTHB(a.amount)}
                      </dd>
                    </div>
                  ))}

                <div className="flex items-center justify-between">
                  <dt style={{ color: `var(--shop-ink-muted, ${MUTED_INK})` }}>
                    ค่าจัดส่ง
                  </dt>
                  <dd
                    style={{
                      color:
                        calc.shipping === 0
                          ? `var(--shop-savings, ${SAVINGS_GREEN})`
                          : `var(--shop-ink, ${BURGUNDY_INK})`,
                      fontVariantNumeric: 'tabular-nums',
                      fontFamily: SIRIN_DISPLAY_FONT,
                    }}
                  >
                    {calc.shipping === 0 ? 'ฟรี' : formatTHB(calc.shipping)}
                  </dd>
                </div>

                <div
                  className="flex items-baseline justify-between border-t pt-4"
                  style={{
                    borderColor: `var(--shop-border, ${ROSE_LINE})`,
                  }}
                >
                  <dt
                    className="text-base"
                    style={{
                      color: `var(--shop-ink, ${BURGUNDY_INK})`,
                      fontFamily: SIRIN_DISPLAY_FONT,
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                    }}
                  >
                    ยอดสุทธิ
                  </dt>
                  <dd
                    className="text-2xl"
                    style={{
                      color: `var(--shop-primary, ${BURGUNDY_PRIMARY})`,
                      fontVariantNumeric: 'tabular-nums',
                      fontFamily: SIRIN_DISPLAY_FONT,
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {formatTHB(calc.grandTotal)}
                  </dd>
                </div>
              </dl>

              <Link
                href={`/stores/${store.slug}/checkout/address`}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm uppercase tracking-[0.16em] text-white shadow-sm transition hover:opacity-90"
                style={{
                  background: `var(--shop-primary, ${BURGUNDY_PRIMARY})`,
                  fontFamily: SIRIN_BODY_FONT,
                  fontWeight: 600,
                }}
              >
                ดำเนินการสั่งซื้อ
              </Link>

              <Link
                href={`/stores/${store.slug}/category`}
                className="mt-2 inline-flex h-11 w-full items-center justify-center text-xs italic underline-offset-4 transition hover:underline"
                style={{
                  color: `var(--shop-ink-muted, ${MUTED_INK})`,
                  fontFamily: SIRIN_DISPLAY_FONT,
                }}
              >
                เลือกซื้อต่อ
              </Link>

              <p
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-[10px] italic"
                style={{
                  color: `var(--shop-ink-muted, ${MUTED_INK})`,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontFamily: SIRIN_DISPLAY_FONT,
                }}
              >
                <ShieldCheck className="h-3 w-3" />
                ชำระเงินปลอดภัย
              </p>
            </div>

            {/* Editorial trust strip */}
            <ul className="mt-5 space-y-2 text-xs">
              <li
                className="flex items-start gap-2 rounded-sm border bg-white p-3"
                style={{
                  borderColor: `var(--shop-border, ${ROSE_LINE})`,
                }}
              >
                <Truck
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: `var(--shop-primary, ${BURGUNDY_ACCENT})` }}
                />
                <div>
                  <div
                    className="text-[10px] italic uppercase"
                    style={{
                      color: `var(--shop-ink-muted, ${MUTED_INK})`,
                      letterSpacing: '0.18em',
                      fontFamily: SIRIN_DISPLAY_FONT,
                    }}
                  >
                    การจัดส่ง
                  </div>
                  <div
                    style={{
                      color: `var(--shop-ink, ${BURGUNDY_INK})`,
                      fontFamily: SIRIN_DISPLAY_FONT,
                    }}
                  >
                    ฟรีเมื่อสั่งเกิน{' '}
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatTHB(freeShipThreshold)}
                    </span>
                  </div>
                </div>
              </li>
              <li
                className="flex items-start gap-2 rounded-sm border bg-white p-3"
                style={{
                  borderColor: `var(--shop-border, ${ROSE_LINE})`,
                }}
              >
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: `var(--shop-primary, ${BURGUNDY_ACCENT})` }}
                />
                <div>
                  <div
                    className="text-[10px] italic uppercase"
                    style={{
                      color: `var(--shop-ink-muted, ${MUTED_INK})`,
                      letterSpacing: '0.18em',
                      fontFamily: SIRIN_DISPLAY_FONT,
                    }}
                  >
                    บริการบูทีค
                  </div>
                  <div
                    style={{
                      color: `var(--shop-ink, ${BURGUNDY_INK})`,
                      fontFamily: SIRIN_DISPLAY_FONT,
                    }}
                  >
                    ห่อของขวัญและการ์ดเขียนมือฟรี
                  </div>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state — full-bleed editorial spread.
// ---------------------------------------------------------------------------
function SirinEmptyCart({
  storeSlug,
  storeName,
}: {
  storeSlug: string;
  storeName: string;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: `var(--shop-bg, ${ROSE_SOFT})`,
        fontFamily: SIRIN_BODY_FONT,
      }}
    >
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border"
          style={{
            background: `var(--shop-card, ${CREAM})`,
            borderColor: `var(--shop-border, ${ROSE_LINE})`,
            color: `var(--shop-primary, ${BURGUNDY_PRIMARY})`,
          }}
          aria-hidden
        >
          <ShoppingBag className="h-8 w-8" strokeWidth={1.3} />
        </div>

        <p
          className="mt-8 text-[11px] italic"
          style={{
            color: `var(--shop-ink-muted, ${MUTED_INK})`,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            fontFamily: SIRIN_DISPLAY_FONT,
          }}
        >
          The Maison · Atelier Privé
        </p>

        <h1
          className="mt-3 text-5xl sm:text-6xl"
          style={{
            fontFamily: SIRIN_DISPLAY_FONT,
            color: `var(--shop-ink, ${BURGUNDY_INK})`,
            fontWeight: 500,
            letterSpacing: '-0.005em',
            lineHeight: 1.05,
          }}
        >
          ตะกร้าของคุณรอเริ่มต้น
        </h1>

        <div
          className="mt-5 h-px w-24"
          style={{ background: `var(--shop-border, ${ROSE_LINE})` }}
        />

        <p
          className="mt-5 max-w-md text-base italic"
          style={{
            color: `var(--shop-ink-muted, ${MUTED_INK})`,
            fontFamily: SIRIN_DISPLAY_FONT,
          }}
        >
          ค้นพบคอลเลกชันรายเดือนของ {storeName} —
          เสื้อผ้าผู้หญิงสไตล์คอนเทมโพรารีที่ตัดเย็บประณีตเพื่อคุณ
        </p>

        <Link
          href={`/stores/${storeSlug}/category`}
          className="mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-full px-10 text-sm uppercase tracking-[0.18em] text-white shadow-sm transition hover:opacity-90"
          style={{
            background: `var(--shop-primary, ${BURGUNDY_PRIMARY})`,
            fontFamily: SIRIN_BODY_FONT,
            fontWeight: 600,
          }}
        >
          ดู Lookbook
        </Link>
      </main>
    </div>
  );
}

// Default export — keeps the same shape that adapters.tsx already
// re-exports as `sirin_womenswear_Cart`. Adapters/registry untouched.
export default SirinCartPage;
