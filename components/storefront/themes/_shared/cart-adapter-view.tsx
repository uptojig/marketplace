'use client';

/**
 * Client-only render half of the shared cart adapter.
 *
 * Lives in its own module so the factory in `cart-adapter.tsx` can stay
 * server-safe — see that file's header comment for the why. All cart hooks
 * (`useCart`, `useState`, `useEffect`, `useMemo`) and the async coupon
 * `/api/coupons/preview` calls live here.
 *
 * Public surface: `<CartAdapterView store={...} style={...} />` rendered
 * by the thin wrapper returned from `makeCartAdapter()`.
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
  Tag,
  X as XIcon,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { calculate } from '@/lib/coupons/calculator';
import type { Coupon } from '@/lib/coupons/types';
import { formatTHB } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

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

export interface CartAdapterViewProps {
  store: { id?: string; slug: string; name: string };
  style: React.CSSProperties;
}

export function CartAdapterView({ store, style }: CartAdapterViewProps) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const allCodes = useCart((s) => s.couponCodesByStore);
  const addCouponCode = useCart((s) => s.addCouponCode);
  const removeCouponCode = useCart((s) => s.removeCouponCode);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
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

  // Coupon state
  const codes = useMemo(
    () => allCodes[store.slug] ?? [],
    [allCodes, store.slug],
  );
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [draftCode, setDraftCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  const itemsForApi = useMemo(
    () =>
      lines.map((l) => ({
        id: l.productId,
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

  const calculation = useMemo(() => {
    if (lines.length === 0 || coupons.length === 0) return null;
    return calculate({
      items: itemsForApi,
      coupons,
      shippingPerStore: { [store.id ?? store.slug]: shippingBefore },
    });
  }, [lines.length, coupons, itemsForApi, store.id, store.slug, shippingBefore]);

  const totalDiscount = calculation?.totalDiscount ?? 0;
  const shippingAfter =
    calculation?.shippingAfterDiscount[store.id ?? store.slug] ??
    shippingBefore;
  const total = Math.max(0, subtotal + shippingAfter - totalDiscount);

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
              items: itemsForApi,
              shippingPerStore: {
                [store.id ?? store.slug]: shippingBefore,
              },
              existingCodes: fetched.map((c) => c.code),
            }),
          });
          const data = (await res.json()) as
            | { ok: true; coupon: Coupon }
            | { ok: false; reason: string };
          if (data.ok) fetched.push(data.coupon);
        } catch {
          /* server is authoritative at checkout — swallow */
        }
      }
      if (!cancelled) setCoupons(fetched);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codes.join('|'), lines.length, store.id, store.slug, shippingBefore]);

  async function handleApplyCoupon() {
    const code = draftCode.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code,
          items: itemsForApi,
          shippingPerStore: { [store.id ?? store.slug]: shippingBefore },
          existingCodes: codes,
        }),
      });
      const data = (await res.json()) as
        | { ok: true; coupon: Coupon }
        | { ok: false; reason: string };
      if (data.ok) {
        addCouponCode(store.slug, code);
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

  if (!mounted) {
    return <div style={style} className="min-h-[60vh]" />;
  }

  if (lines.length === 0) {
    return (
      <main
        style={style}
        className="bg-[var(--background,#fafafa)] text-[var(--foreground,#0a0a0a)] min-h-screen py-12"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <nav className="flex items-center justify-center gap-2 text-xs font-bold">
            <Link
              href={`/stores/${store.slug}`}
              className="opacity-70 hover:opacity-100 transition"
            >
              หน้าร้าน
            </Link>
            <ChevronRight size={12} className="opacity-50" />
            <span style={{ color: 'var(--primary, currentColor)' }}>
              ตะกร้าสินค้า
            </span>
          </nav>
          <div
            className="inline-flex items-center justify-center w-20 h-20 border-2 mx-auto"
            style={{ borderColor: 'var(--border, currentColor)' }}
          >
            <ShoppingBag size={36} className="opacity-40" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            ตะกร้ายังว่างอยู่
          </h1>
          <p className="text-sm opacity-70">
            ลองเลือกของจากหน้าร้านได้เลย
          </p>
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-wider shadow-md hover:opacity-90 transition"
            style={{
              background: 'var(--primary, #111)',
              color: 'var(--primary-foreground, #fff)',
            }}
          >
            เริ่มช้อปเลย →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={style}
      className="bg-[var(--background,#fafafa)] text-[var(--foreground,#0a0a0a)] min-h-screen py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold">
          <Link
            href={`/stores/${store.slug}`}
            className="opacity-70 hover:opacity-100 transition"
          >
            หน้าร้าน
          </Link>
          <ChevronRight size={12} className="opacity-50" />
          <span style={{ color: 'var(--primary, currentColor)' }}>
            ตะกร้าสินค้า
          </span>
        </nav>

        {/* Page header */}
        <header
          className="bg-[var(--card,#fff)] border p-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          style={{ borderColor: 'var(--border, #e5e5e5)' }}
        >
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--muted-foreground, #737373)' }}
            >
              ตะกร้า · {store.name}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold">
              ตะกร้าสินค้าของคุณ
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">รายการในตะกร้า</p>
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--primary, currentColor)' }}
            >
              {itemCount}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Line items */}
          <section className="lg:col-span-8 space-y-3">
            {/* Free-shipping progress */}
            {remainingForFreeShipping > 0 ? (
              <div
                className="bg-[var(--card,#fff)] border p-4 space-y-2"
                style={{ borderColor: 'var(--border, #e5e5e5)' }}
              >
                <p className="flex items-center gap-2 text-xs font-bold">
                  <Truck size={14} style={{ color: 'var(--primary, currentColor)' }} />
                  เพิ่มอีก{' '}
                  <span style={{ color: 'var(--primary, currentColor)' }}>
                    {formatTHB(remainingForFreeShipping)}
                  </span>{' '}
                  รับส่งฟรี!
                </p>
                <div
                  className="h-1.5"
                  style={{ background: 'var(--muted, #f5f5f5)' }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${progressPct}%`,
                      background: 'var(--primary, #111)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                className="border p-4 flex items-center gap-2 text-xs font-bold"
                style={{
                  borderColor: 'var(--border, #e5e5e5)',
                  background: 'var(--primary, #111)',
                  color: 'var(--primary-foreground, #fff)',
                }}
              >
                <Truck size={14} />
                คุณได้รับส่งฟรีแล้ว!
              </div>
            )}

            <ul className="space-y-2">
              {lines.map((l) => (
                <li
                  key={l.productId}
                  className="bg-[var(--card,#fff)] border flex gap-3 p-3"
                  style={{ borderColor: 'var(--border, #e5e5e5)' }}
                >
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="block w-24 h-24 sm:w-28 sm:h-28 shrink-0 border overflow-hidden"
                    style={{ borderColor: 'var(--border, #e5e5e5)' }}
                  >
                    {l.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.imageUrl}
                        alt={l.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs opacity-40">
                        NO IMAGE
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="block"
                    >
                      <h3 className="font-bold text-sm leading-snug line-clamp-2">
                        {l.title}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div
                        className="flex items-stretch border"
                        style={{ borderColor: 'var(--border, #e5e5e5)' }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setQty(l.productId, l.qty - 1, store.slug)
                          }
                          disabled={l.qty <= 1}
                          aria-label="ลด"
                          className="px-2.5 disabled:opacity-30 hover:opacity-70"
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <div
                          className="px-3.5 py-1 font-bold text-sm min-w-[2.25rem] text-center border-x"
                          style={{ borderColor: 'var(--border, #e5e5e5)' }}
                        >
                          {l.qty}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setQty(l.productId, l.qty + 1, store.slug)
                          }
                          aria-label="เพิ่ม"
                          className="px-2.5 hover:opacity-70"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-base font-bold"
                          style={{ color: 'var(--primary, currentColor)' }}
                        >
                          {formatTHB(l.priceTHB * l.qty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(l.productId, store.slug)}
                          aria-label={`ลบ ${l.title}`}
                          className="p-1.5 border hover:opacity-70"
                          style={{ borderColor: 'var(--border, #e5e5e5)' }}
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href={`/stores/${store.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border hover:opacity-70 transition"
              style={{ borderColor: 'var(--border, #e5e5e5)' }}
            >
              ← เลือกซื้อสินค้าต่อ
            </Link>
          </section>

          {/* Summary */}
          <aside className="lg:col-span-4 self-start space-y-3 lg:sticky lg:top-24">
            <div
              className="bg-[var(--card,#fff)] border"
              style={{ borderColor: 'var(--border, #e5e5e5)' }}
            >
              <div
                className="p-4"
                style={{
                  background: 'var(--primary, #111)',
                  color: 'var(--primary-foreground, #fff)',
                }}
              >
                <p className="font-bold text-lg">สรุปออเดอร์</p>
                <p className="text-xs opacity-90">ตรวจสอบยอดก่อนชำระเงิน</p>
              </div>

              <div className="p-5 space-y-3">
                {/* Coupon input */}
                <div
                  className="space-y-2 pb-3 border-b border-dashed"
                  style={{ borderColor: 'var(--border, #e5e5e5)' }}
                >
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                    <Tag size={13} style={{ color: 'var(--primary, currentColor)' }} />
                    ใช้รหัสคูปอง
                  </label>
                  <div className="flex items-stretch gap-2">
                    <input
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
                      placeholder="ใส่รหัสคูปอง"
                      className="flex-1 border px-3 py-2 text-sm uppercase tracking-wider focus:outline-none"
                      style={{
                        borderColor: 'var(--border, #e5e5e5)',
                        background: 'var(--muted, #fafafa)',
                        color: 'var(--foreground, #0a0a0a)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponBusy || draftCode.trim().length === 0}
                      className="font-bold text-xs uppercase tracking-wider px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
                      style={{
                        background: 'var(--primary, #111)',
                        color: 'var(--primary-foreground, #fff)',
                      }}
                    >
                      {couponBusy ? '...' : 'ใช้รหัส'}
                    </button>
                  </div>
                  {couponError && (
                    <p
                      className="text-xs font-medium"
                      style={{ color: 'var(--primary, #b91c1c)' }}
                    >
                      {couponError}
                    </p>
                  )}
                  {coupons.length > 0 && (
                    <ul className="space-y-1.5 pt-1">
                      {coupons.map((c) => {
                        const applied = calculation?.appliedCoupons.find(
                          (ac) => ac.couponId === c.id,
                        );
                        return (
                          <li
                            key={c.id}
                            className="flex items-center justify-between gap-2 border px-2.5 py-1.5"
                            style={{
                              borderColor: 'var(--border, #e5e5e5)',
                              background: 'var(--muted, #fafafa)',
                            }}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate">
                                {c.code}
                              </p>
                              <p className="text-[10px] opacity-70 truncate">
                                {c.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {applied && (
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: 'var(--primary, currentColor)' }}
                                >
                                  -{formatTHB(applied.amount)}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeCouponCode(store.slug, c.code)}
                                aria-label={`เอา ${c.code} ออก`}
                                className="p-1 hover:opacity-70"
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

                <div className="flex items-center justify-between text-sm">
                  <span>ราคารวม ({itemCount} ชิ้น)</span>
                  <span className="font-bold">{formatTHB(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>ส่วนลดคูปอง</span>
                    <span
                      className="font-bold"
                      style={{ color: 'var(--primary, currentColor)' }}
                    >
                      -{formatTHB(totalDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span>ค่าจัดส่ง</span>
                  <span
                    className="font-bold"
                    style={{
                      color:
                        shippingAfter === 0
                          ? 'var(--primary, currentColor)'
                          : undefined,
                    }}
                  >
                    {shippingAfter === 0 ? 'ฟรี' : formatTHB(shippingAfter)}
                  </span>
                </div>

                <div
                  className="border-t border-dashed pt-3 flex items-baseline justify-between"
                  style={{ borderColor: 'var(--border, #e5e5e5)' }}
                >
                  <span className="font-bold">ยอดสุทธิ</span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: 'var(--primary, currentColor)' }}
                  >
                    {formatTHB(total)}
                  </span>
                </div>

                <Link
                  href={`/stores/${store.slug}/checkout`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase tracking-wider shadow-md hover:opacity-90 transition"
                  style={{
                    background: 'var(--primary, #111)',
                    color: 'var(--primary-foreground, #fff)',
                  }}
                >
                  <ShoppingBag size={16} strokeWidth={2.5} />
                  ดำเนินการชำระเงิน
                </Link>

                <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold opacity-70">
                  <ShieldCheck size={12} />
                  ชำระเงินปลอดภัย · เข้ารหัส SSL
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
