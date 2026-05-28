'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  X as XIcon,
  ChevronRight,
  FileText,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { calculate } from '@/lib/coupons/calculator';
import type { Coupon } from '@/lib/coupons/types';
import { formatTHB } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
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

export default function Cart({ store }: { store: StoreLite }) {
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
  const shippingBefore = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;

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
  }, [lines, coupons, store.id, shippingBefore]);

  const totalDiscount = calculation?.totalDiscount ?? 0;
  const shippingAfter = calculation?.shippingAfterDiscount[store.id] ?? shippingBefore;
  const total = Math.max(0, subtotal + shippingAfter - totalDiscount);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

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
          /* silently drop */
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

  if (!mounted) return <div className="min-h-[60vh] bg-[#F8FAFC]" />;

  if (lines.length === 0) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] font-[family:var(--font-prompt)] flex items-center justify-center px-4 py-20">
        <div className="text-center bg-white rounded-2xl border border-[#CBD5E1] shadow-[0_16px_48px_-16px_rgba(30,58,138,0.25)] p-10 max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#172554] mb-6 rf-glow-primary border border-[#172554]">
            <ShoppingBag className="w-10 h-10 text-[#FBBF24]" />
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-bold mb-2 tracking-tight">
            ตะกร้าว่าง
          </h1>
          <p className="text-sm text-[#475569] mb-6">
            ยังไม่มีเทมเพลตในตะกร้า ลองเลือกซื้อจากคลังของเรา
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md bg-[#1E3A8A] text-white font-[family:var(--font-kanit)] font-semibold text-sm rf-glow-primary hover:bg-[#1E40AF] active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4" />
            เริ่มเลือกซื้อ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] font-[family:var(--font-prompt)] min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden rf-grid-bg border-b border-[#CBD5E1]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 rounded-md bg-white border border-[#CBD5E1] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E3A8A] font-[family:var(--font-kanit)] mb-3">
            <ShoppingBag className="w-3.5 h-3.5 text-[#B45309]" />
            ตะกร้า · {itemCount} รายการ
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight">
            <span className="rf-gradient-text">ตะกร้าของคุณ</span>
          </h1>
          <span className="rf-rule mt-3" aria-hidden />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-4">
          {/* Free shipping progress */}
          {remaining > 0 ? (
            <div className="rounded-xl bg-white border border-[#CBD5E1] p-5 shadow-sm space-y-3">
              <p className="font-[family:var(--font-kanit)] font-semibold text-sm inline-flex items-center gap-2 text-[#0F172A]">
                <CheckCircle2 className="w-4 h-4 text-[#B45309]" />
                ซื้ออีก <span className="text-[#1E3A8A] font-bold">{formatTHB(remaining)}</span> เพื่อรับส่งฟรี!
              </p>
              <div
                className="h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(progressPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-[#B45309] transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl rf-ats-chip p-5 inline-flex items-center gap-2 font-[family:var(--font-kanit)] font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              ยินดีด้วย — ส่งฟรีทั่วประเทศ
            </div>
          )}

          {lines.map((l) => (
            <div
              key={l.productId}
              className="rounded-xl bg-white border border-[#CBD5E1] p-4 sm:p-5 flex gap-4 rf-card"
            >
              <div className="relative w-24 h-32 sm:w-28 sm:h-36 shrink-0 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden">
                {l.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.imageUrl}
                    alt={l.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-[#1E3A8A]" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="font-[family:var(--font-kanit)] font-bold text-sm sm:text-base leading-tight line-clamp-2 text-[#0F172A] hover:text-[#1E3A8A] transition-colors"
                  >
                    {l.title}
                  </Link>
                  <p className="font-[family:var(--font-kanit)] font-bold text-lg text-[#1E3A8A] mt-1">
                    {formatTHB(l.priceTHB)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-3">
                  <div className="flex items-center rounded-md border border-[#CBD5E1] bg-white">
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                      aria-label="ลด"
                      className="w-9 h-9 rounded-l-md flex items-center justify-center hover:bg-[#E2E8F0] active:scale-90 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center font-[family:var(--font-kanit)] font-bold text-sm">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                      aria-label="เพิ่ม"
                      className="w-9 h-9 rounded-r-md flex items-center justify-center hover:bg-[#E2E8F0] active:scale-90 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.productId, store.slug)}
                    aria-label="ลบ"
                    className="w-9 h-9 rounded-md bg-white border border-[#CBD5E1] flex items-center justify-center hover:bg-[#FEE2E2] hover:border-[#DC2626] hover:text-[#DC2626] active:scale-90 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="rounded-xl bg-white border border-[#CBD5E1] p-5 shadow-sm space-y-3">
            <h3 className="font-[family:var(--font-kanit)] font-bold text-base inline-flex items-center gap-2 tracking-tight">
              <Tag className="w-4 h-4 text-[#B45309]" />
              คูปองส่วนลด
            </h3>
            {coupons.length > 0 && (
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between gap-2 rounded-md bg-[#DBEAFE] border border-[#BFDBFE] px-3 py-1.5"
                  >
                    <span className="font-[family:var(--font-kanit)] font-bold text-xs tracking-[0.18em] text-[#1E40AF] truncate">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        removeCouponCode(store.slug, c.code);
                        setCouponError(null);
                      }}
                      aria-label="ลบคูปอง"
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#1E40AF] hover:text-white"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={draftCode}
                onChange={(e) => setDraftCode(e.target.value)}
                placeholder="ใส่โค้ดส่วนลด"
                aria-label="รหัสคูปอง"
                className="flex-1 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:bg-white focus:border-[#1E3A8A]"
                disabled={couponBusy}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponBusy || !draftCode.trim()}
                className="h-9 px-4 rounded-md bg-[#0F172A] text-white font-[family:var(--font-kanit)] font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#1E3A8A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ใช้
              </button>
            </div>
            {couponError && (
              <p className="text-xs font-bold text-[#DC2626]">{couponError}</p>
            )}
          </div>

          <div className="rounded-xl bg-white border border-[#CBD5E1] p-5 shadow-[0_8px_32px_-12px_rgba(30,58,138,0.18)] space-y-4">
            <h3 className="font-[family:var(--font-kanit)] font-bold text-xl tracking-tight">
              สรุปคำสั่งซื้อ
            </h3>
            <div className="space-y-2.5 text-sm">
              <Row label="ยอดสินค้า" value={formatTHB(subtotal)} />
              <Row
                label="ค่าจัดส่ง"
                value={shippingAfter === 0 ? 'ฟรี' : formatTHB(shippingAfter)}
                valueClass={shippingAfter === 0 ? 'text-[#15803D]' : ''}
              />
              {totalDiscount > 0 && (
                <Row
                  label="ส่วนลด"
                  value={`- ${formatTHB(totalDiscount)}`}
                  valueClass="text-[#B45309]"
                />
              )}
            </div>
            <div className="border-t border-[#E2E8F0] pt-4 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-bold tracking-tight">รวม</span>
              <span className="font-[family:var(--font-kanit)] font-bold text-2xl rf-gradient-text">
                {formatTHB(total)}
              </span>
            </div>
            <Link
              href={`/stores/${store.slug}/checkout`}
              className="h-12 w-full flex items-center justify-center gap-2 rounded-md bg-[#1E3A8A] text-white font-[family:var(--font-kanit)] font-semibold text-base rf-glow-primary hover:bg-[#1E40AF] active:scale-95 transition-all"
            >
              <Download className="w-5 h-5" />
              ไปชำระเงิน
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/stores/${store.slug}/category`}
              className="block text-center text-xs font-semibold text-[#475569] hover:text-[#1E3A8A] underline decoration-dotted underline-offset-4"
            >
              ← เลือกซื้อต่อ
            </Link>
          </div>

          <div className="rounded-xl rf-ats-chip p-4 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              ทุกการสั่งซื้อ — ดาวน์โหลดได้ทันทีหลังชำระเงิน · ผ่าน ATS ทุกระบบ
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[#475569] text-xs uppercase tracking-[0.18em] font-bold">{label}</span>
      <span className={`font-bold ${valueClass || 'text-[#0F172A]'}`}>{value}</span>
    </div>
  );
}
