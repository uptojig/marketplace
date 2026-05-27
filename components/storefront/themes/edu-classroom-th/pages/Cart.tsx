'use client';

/**
 * EduClassroom — bespoke Cart page.
 *
 * Adapts the structure of shadcn-studio's `shopping-cart-03` (left
 * product summary · right form with totals + coupon input) into the
 * classroom-themed cart. Reads line items directly from the per-store
 * zustand cart — no shared cart-adapter helper sits between this
 * component and the page dispatcher.
 *
 * Because EduClassroom sells digital files, the cart UI emphasises
 * "ดาวน์โหลดทันที" instead of free-shipping progress. When a buyer
 * happens to have a physical line in their cart from another store
 * (the cart is per-browser, not per-store), we still show the line
 * but tag the per-line subtotal appropriately.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Download,
  ShieldCheck,
  RefreshCw,
  Tag,
  X as XIcon,
  GraduationCap,
  Sparkles,
  Mail,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { calculate } from '@/lib/coupons/calculator';
import type { Coupon } from '@/lib/coupons/types';
import { formatTHB } from '@/lib/utils';

import {
  EDU_PRIMARY,
  EDU_PRIMARY_DEEP,
  EDU_ACCENT,
  EDU_ACCENT_DEEP,
  EDU_SAVINGS,
  EDU_BG,
  EDU_BG_SOFT,
  EDU_BORDER,
  EDU_BORDER_SOFT,
  EDU_INK,
  EDU_INK_MUTED,
} from '../palette';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

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

export default function EduClassroomCart({ store }: { store: StoreLite }) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const allCodes = useCart((s) => s.couponCodesByStore);
  const addCouponCode = useCart((s) => s.addCouponCode);
  const removeCouponCode = useCart((s) => s.removeCouponCode);
  const codes = useMemo(() => allCodes[store.slug] ?? [], [allCodes, store.slug]);

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

  // Digital lines = no shipping. We still expose a shipping line in the
  // calculator so coupons that target shipping cost behave correctly,
  // but the displayed shipping cost is always 0 for digital storefronts.
  const isAllDigital = lines.every((l) => l.productType === 'DIGITAL' || l.productType === undefined);
  const shippingBefore = 0;

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
  }, [lines, coupons, store.id]);

  const totalDiscount = calculation?.totalDiscount ?? 0;
  const total = Math.max(0, subtotal - totalDiscount);

  // Refetch coupon details whenever the persisted codes change so the
  // displayed discount is always derived from the authoritative server.
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
          /* server is authoritative at checkout */
        }
      }
      if (!cancelled) setCoupons(fetched);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codes.join('|'), lines.length, store.id]);

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

  function handleRemoveCoupon(code: string) {
    removeCouponCode(store.slug, code);
    setCouponError(null);
  }

  if (!mounted) {
    return <div className="min-h-[60vh]" style={{ background: EDU_BG }} />;
  }

  return (
    <main className={`${FONT_BODY} min-h-screen`} style={{ background: EDU_BG, color: EDU_INK }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Breadcrumb */}
        <Link
          href={`/stores/${store.slug}`}
          className={`inline-flex items-center gap-1.5 text-xs ${FONT_HEADING} font-bold`}
          style={{ color: EDU_INK_MUTED }}
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          กลับหน้าร้าน
        </Link>

        {/* Header */}
        <header
          className="relative bg-white border rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 overflow-hidden"
          style={{ borderColor: EDU_BORDER }}
        >
          <span
            aria-hidden
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: `linear-gradient(90deg, ${EDU_PRIMARY}, ${EDU_ACCENT})` }}
          />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}
                style={{ background: EDU_BG_SOFT, color: EDU_ACCENT_DEEP }}
              >
                <GraduationCap size={11} />
                ตะกร้าของคุณครู
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white`}
                style={{ background: EDU_PRIMARY }}
              >
                {store.name}
              </span>
            </div>
            <h1
              className={`${FONT_HEADING} font-black text-3xl sm:text-4xl leading-tight flex items-center gap-2`}
              style={{ color: EDU_INK }}
            >
              <ShoppingCart size={28} strokeWidth={2.2} />
              ตะกร้าสื่อการสอน
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] font-bold" style={{ color: EDU_ACCENT_DEEP }}>
                รายการ
              </p>
              <p className={`${FONT_HEADING} font-black text-2xl`} style={{ color: EDU_PRIMARY }}>
                {itemCount}
              </p>
            </div>
            <div
              className="p-3 rounded-xl shadow"
              style={{ background: EDU_PRIMARY, color: '#FFFFFF' }}
            >
              <Download size={20} strokeWidth={2.5} />
            </div>
          </div>
        </header>

        {lines.length === 0 ? (
          <EmptyCart storeSlug={store.slug} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── Line items ─────────────────────────────────────────── */}
            <section aria-labelledby="cart-heading" className="lg:col-span-8 space-y-4">
              <h2 id="cart-heading" className="sr-only">
                สื่อในตะกร้า
              </h2>

              {/* Digital-instant strip — replaces free-shipping progress */}
              {isAllDigital && (
                <div
                  className="rounded-2xl border p-4 flex items-center gap-3"
                  style={{ background: EDU_BG_SOFT, borderColor: `${EDU_ACCENT}40` }}
                >
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg"
                    style={{ background: EDU_PRIMARY, color: '#FFFFFF' }}
                  >
                    <Download size={16} strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className={`text-sm ${FONT_HEADING} font-bold`} style={{ color: EDU_INK }}>
                      ดาวน์โหลดได้ทันทีหลังชำระเงิน
                    </p>
                    <p className="text-xs" style={{ color: EDU_ACCENT_DEEP }}>
                      ส่งลิงก์ไปที่อีเมล · ใช้สอนวันรุ่งขึ้นได้เลย
                    </p>
                  </div>
                </div>
              )}

              <ul className="space-y-3">
                {lines.map((l) => (
                  <li
                    key={l.productId}
                    className="bg-white border rounded-2xl hover:shadow-md transition-shadow"
                    style={{ borderColor: EDU_BORDER }}
                  >
                    <div className="flex gap-3 p-3">
                      <Link
                        href={`/stores/${store.slug}/products/${l.productId}`}
                        className="block w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden"
                        style={{ background: '#EFF6FF', border: `1px solid ${EDU_BORDER_SOFT}` }}
                      >
                        {l.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={l.imageUrl}
                            alt={l.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center text-[10px] ${FONT_HEADING} font-bold`}
                            style={{ color: EDU_INK_MUTED }}
                          >
                            NO IMAGE
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <Link
                          href={`/stores/${store.slug}/products/${l.productId}`}
                          className="block"
                        >
                          <h3
                            className={`${FONT_HEADING} font-bold text-sm leading-snug line-clamp-2 transition-colors`}
                            style={{ color: EDU_INK }}
                          >
                            {l.title}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div
                            className="flex items-stretch rounded-full overflow-hidden"
                            style={{ background: EDU_BG_SOFT, border: `1px solid ${EDU_BORDER}` }}
                          >
                            <button
                              type="button"
                              onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                              disabled={l.qty <= 1}
                              aria-label="ลด"
                              className="px-2.5 transition-colors disabled:opacity-30 hover:bg-[#2563EB]/10"
                              style={{ color: EDU_PRIMARY }}
                            >
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <div
                              className={`px-3.5 py-1 ${FONT_HEADING} font-black text-sm min-w-[2.25rem] text-center`}
                              style={{ color: EDU_INK, borderLeft: `1px solid ${EDU_BORDER}`, borderRight: `1px solid ${EDU_BORDER}` }}
                            >
                              {l.qty}
                            </div>
                            <button
                              type="button"
                              onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                              aria-label="เพิ่ม"
                              className="px-2.5 transition-colors hover:bg-[#2563EB]/10"
                              style={{ color: EDU_PRIMARY }}
                            >
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`${FONT_HEADING} text-lg font-extrabold`}
                              style={{ color: EDU_PRIMARY }}
                            >
                              {formatTHB(l.priceTHB * l.qty)}
                            </span>
                            <button
                              type="button"
                              onClick={() => remove(l.productId, store.slug)}
                              aria-label={`ลบ ${l.title}`}
                              className="rounded-full p-1.5 transition-colors hover:bg-red-50"
                              style={{ color: EDU_INK_MUTED, border: `1px solid ${EDU_BORDER}` }}
                            >
                              <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                href={`/stores/${store.slug}`}
                className={`inline-flex items-center gap-2 bg-white border rounded-full px-4 py-2 text-xs ${FONT_HEADING} font-bold transition-colors hover:shadow-sm`}
                style={{ color: EDU_INK, borderColor: EDU_BORDER }}
              >
                <ArrowLeft size={12} />
                เลือกสื่อต่อ
              </Link>
            </section>

            {/* ── Order summary ─────────────────────────────────────────── */}
            <aside
              aria-labelledby="summary-heading"
              className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 self-start"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปออเดอร์
              </h2>

              <div
                className="bg-white border-2 rounded-2xl shadow-md overflow-hidden"
                style={{ borderColor: EDU_BORDER }}
              >
                <div
                  className="p-4 text-white"
                  style={{ background: `linear-gradient(135deg, ${EDU_PRIMARY}, ${EDU_PRIMARY_DEEP})` }}
                >
                  <p className={`${FONT_HEADING} font-black text-lg`}>สรุปออเดอร์</p>
                  <p className="text-xs opacity-90 mt-0.5">ตรวจสอบยอดก่อนชำระเงิน</p>
                </div>

                <div className="p-5 space-y-3">
                  {/* Coupon input */}
                  <div className="space-y-2 pb-3" style={{ borderBottom: `1px dashed ${EDU_BORDER}` }}>
                    <label
                      className={`flex items-center gap-1.5 text-[11px] ${FONT_HEADING} font-black uppercase tracking-wider`}
                      style={{ color: EDU_INK }}
                    >
                      <Tag size={13} style={{ color: EDU_PRIMARY }} />
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
                        placeholder="ใส่รหัส เช่น TEACHER100"
                        className="flex-1 rounded-xl px-3 py-2 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 transition-all"
                        style={
                          {
                            background: EDU_BG_SOFT,
                            border: `1px solid ${EDU_BORDER}`,
                            color: EDU_INK,
                            ['--tw-ring-color' as never]: `${EDU_PRIMARY}55`,
                          } as React.CSSProperties
                        }
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponBusy || draftCode.trim().length === 0}
                        className={`${FONT_HEADING} font-black text-xs uppercase tracking-wider px-3 py-2 rounded-xl text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                        style={{ background: EDU_PRIMARY }}
                      >
                        {couponBusy ? '...' : 'ใช้รหัส'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs font-medium" style={{ color: '#dc2626' }}>
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
                              className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5"
                              style={{ background: EDU_BG_SOFT, border: `1px solid ${EDU_ACCENT}40` }}
                            >
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-xs ${FONT_HEADING} font-black truncate`}
                                  style={{ color: EDU_INK }}
                                >
                                  {c.code}
                                </p>
                                <p
                                  className="text-[10px] truncate"
                                  style={{ color: EDU_ACCENT_DEEP }}
                                >
                                  {c.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {applied && (
                                  <span
                                    className={`text-xs ${FONT_HEADING} font-bold`}
                                    style={{ color: EDU_SAVINGS }}
                                  >
                                    -{formatTHB(applied.amount)}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCoupon(c.code)}
                                  aria-label={`เอา ${c.code} ออก`}
                                  className="p-1 transition-colors hover:opacity-70"
                                  style={{ color: EDU_INK_MUTED }}
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
                    <span style={{ color: EDU_INK }}>ราคารวม ({itemCount} ชิ้น)</span>
                    <span className={`${FONT_BODY} font-bold`} style={{ color: EDU_INK }}>
                      {formatTHB(subtotal)}
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: EDU_INK }}>ส่วนลดคูปอง</span>
                      <span className={`${FONT_BODY} font-bold`} style={{ color: EDU_SAVINGS }}>
                        -{formatTHB(totalDiscount)}
                      </span>
                    </div>
                  )}
                  {isAllDigital ? (
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: EDU_INK }}>การจัดส่ง</span>
                      <span className={`${FONT_BODY} font-bold inline-flex items-center gap-1`} style={{ color: EDU_SAVINGS }}>
                        <Download size={12} />
                        ไฟล์ดาวน์โหลด (ฟรี)
                      </span>
                    </div>
                  ) : null}

                  <div
                    className="pt-3 flex items-baseline justify-between"
                    style={{ borderTop: `1px dashed ${EDU_BORDER}` }}
                  >
                    <span className={`${FONT_HEADING} font-black text-base`} style={{ color: EDU_INK }}>
                      ยอดสุทธิ
                    </span>
                    <span className={`${FONT_HEADING} font-black text-3xl`} style={{ color: EDU_PRIMARY }}>
                      {formatTHB(total)}
                    </span>
                  </div>

                  <Link
                    href={`/stores/${store.slug}/checkout`}
                    className={`w-full inline-flex items-center justify-center gap-2 text-white ${FONT_HEADING} font-black uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md transition-all hover:shadow-lg`}
                    style={{ background: EDU_PRIMARY }}
                  >
                    <Download size={18} strokeWidth={2.5} />
                    ดำเนินการชำระเงิน
                    <ArrowRight size={16} />
                  </Link>

                  <p
                    className={`flex items-center justify-center gap-1.5 text-[10px] ${FONT_BODY} font-bold`}
                    style={{ color: EDU_INK_MUTED }}
                  >
                    <ShieldCheck size={12} />
                    ชำระเงินปลอดภัย · เข้ารหัส SSL
                  </p>
                </div>
              </div>

              {/* Trust strip */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="border-2 rounded-2xl p-3 text-center shadow-sm transform -rotate-1 transition-transform hover:rotate-0"
                  style={{ background: EDU_BG_SOFT, borderColor: EDU_ACCENT }}
                >
                  <RefreshCw
                    size={18}
                    className="mx-auto mb-1"
                    style={{ color: EDU_ACCENT_DEEP }}
                    strokeWidth={2.5}
                  />
                  <p className={`text-[10px] ${FONT_HEADING} font-black`} style={{ color: EDU_ACCENT_DEEP }}>
                    อัปเดตฟรี
                  </p>
                  <p className="text-[9px] font-bold" style={{ color: EDU_INK_MUTED }}>
                    ตลอดอายุการใช้งาน
                  </p>
                </div>
                <div
                  className="bg-white border-2 rounded-2xl p-3 text-center shadow-sm transform rotate-1 transition-transform hover:rotate-0"
                  style={{ borderColor: EDU_PRIMARY }}
                >
                  <Sparkles
                    size={18}
                    className="mx-auto mb-1"
                    style={{ color: EDU_PRIMARY }}
                    strokeWidth={2.5}
                  />
                  <p className={`text-[10px] ${FONT_HEADING} font-black`} style={{ color: EDU_INK }}>
                    แก้ไขใน Slides
                  </p>
                  <p className="text-[9px] font-bold" style={{ color: EDU_INK_MUTED }}>
                    PPTX · DOCX · PDF
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div
      className="bg-white border-2 border-dashed rounded-2xl py-16 px-6 text-center shadow-sm"
      style={{ borderColor: EDU_BORDER }}
    >
      <div
        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 transform -rotate-3"
        style={{ background: EDU_BG_SOFT, border: `2px solid ${EDU_ACCENT}55` }}
      >
        <ShoppingCart size={36} style={{ color: EDU_ACCENT_DEEP }} strokeWidth={2} />
      </div>
      <h2 className={`text-2xl sm:text-3xl ${FONT_HEADING} font-black`} style={{ color: EDU_INK }}>
        ตะกร้ายังว่างอยู่
      </h2>
      <p
        className={`mt-2 text-sm ${FONT_BODY} max-w-md mx-auto`}
        style={{ color: EDU_INK_MUTED }}
      >
        ลองเลือกสื่อการสอนจากหน้าร้านดูสิ — มีใบงาน สไลด์ ข้อสอบ ครบทุกชั้น
      </p>
      <Link
        href={`/stores/${storeSlug}`}
        className={`inline-flex items-center gap-2 mt-5 text-white ${FONT_HEADING} font-black px-6 py-3 rounded-full shadow-md uppercase tracking-wider text-sm transition-all hover:shadow-lg`}
        style={{ background: EDU_PRIMARY }}
      >
        <Mail size={14} />
        เริ่มเลือกสื่อ
      </Link>
    </div>
  );
}
