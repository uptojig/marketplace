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
  Palette,
  Download,
  Sparkles,
  FileImage,
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

  if (!mounted) return <div className="min-h-[60vh] bg-[#FEFCE8]" />;

  // Empty state
  if (lines.length === 0) {
    return (
      <div className="bg-[#FEFCE8] min-h-screen text-[#1E1B4B] font-[family:var(--font-prompt)] flex items-center justify-center px-4 py-20">
        <div className="text-center bg-white rounded-3xl border border-[#FBCFE8] shadow-[0_16px_48px_-16px_rgba(244,114,182,0.35)] p-10 max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F472B6] via-[#FBBF24] to-[#60A5FA] mb-6 vb-glow-primary">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-black mb-2">
            ตะกร้าว่าง
          </h1>
          <p className="text-sm text-[#6366F1] mb-6">
            ยังไม่มีผลงานในตะกร้า ลองเลือกซื้อจากคลังของเรา
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#F472B6] text-white font-[family:var(--font-kanit)] font-black text-sm vb-glow-primary hover:bg-[#EC4899] active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            เริ่มเลือกซื้อ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FEFCE8] text-[#1E1B4B] font-[family:var(--font-prompt)] min-h-screen">
      {/* Header band */}
      <section className="relative overflow-hidden vb-rainbow-bg border-b border-[#FBCFE8]">
        <div className="absolute inset-0 vb-confetti opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#FBCFE8] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#DB2777] font-[family:var(--font-kanit)] mb-3">
            <ShoppingBag className="w-3.5 h-3.5" />
            ตะกร้า · {itemCount} รายการ
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-black tracking-tight">
            <span className="vb-rainbow-text">ตะกร้าของคุณ</span>
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Lines */}
        <div className="space-y-4">
          {/* Free shipping progress */}
          {remaining > 0 ? (
            <div className="rounded-3xl bg-white border border-[#FBCFE8] p-5 shadow-sm space-y-3">
              <p className="font-[family:var(--font-kanit)] font-bold text-sm inline-flex items-center gap-2 text-[#1E1B4B]">
                <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                ซื้ออีก <span className="text-[#DB2777] font-black">{formatTHB(remaining)}</span> เพื่อรับส่งฟรี!
              </p>
              <div
                className="h-3 rounded-full bg-[#FCE7F3] overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(progressPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#F472B6] via-[#FBBF24] to-[#60A5FA] transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#D1FAE5] border border-[#34D399] p-5 inline-flex items-center gap-2 text-[#047857] font-[family:var(--font-kanit)] font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              ยินดีด้วย — ออเดอร์นี้ส่งฟรีทั่วประเทศ!
            </div>
          )}

          {lines.map((l) => (
            <div
              key={l.productId}
              className="rounded-3xl bg-white border border-[#FBCFE8] p-4 sm:p-5 flex gap-4 vb-card-hover"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl vb-checker border border-[#FBCFE8] overflow-hidden">
                {l.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.imageUrl}
                    alt={l.title}
                    className="absolute inset-0 w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileImage className="w-8 h-8 text-[#F472B6]" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="font-[family:var(--font-kanit)] font-black text-sm sm:text-base leading-tight line-clamp-2 text-[#1E1B4B] hover:text-[#DB2777] transition-colors"
                  >
                    {l.title}
                  </Link>
                  <p className="font-[family:var(--font-kanit)] font-black text-lg text-[#DB2777] mt-1">
                    {formatTHB(l.priceTHB)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-3">
                  <div className="flex items-center rounded-full border border-[#FBCFE8] bg-white">
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                      aria-label="ลด"
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#FCE7F3] active:scale-90 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center font-[family:var(--font-kanit)] font-black text-sm">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                      aria-label="เพิ่ม"
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#FCE7F3] active:scale-90 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.productId, store.slug)}
                    aria-label="ลบ"
                    className="w-9 h-9 rounded-full bg-white border border-[#FBCFE8] flex items-center justify-center hover:bg-[#FEE2E2] hover:border-[#F87171] hover:text-[#DC2626] active:scale-90 transition-all"
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
          {/* Coupon */}
          <div className="rounded-3xl bg-white border border-[#FBCFE8] p-5 shadow-sm space-y-3">
            <h3 className="font-[family:var(--font-kanit)] font-black text-base inline-flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#DB2777]" />
              คูปองส่วนลด
            </h3>
            {coupons.length > 0 && (
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between gap-2 rounded-full bg-[#FCE7F3] border border-[#F472B6] px-3 py-1.5"
                  >
                    <span className="font-[family:var(--font-kanit)] font-bold text-xs tracking-widest text-[#DB2777] truncate">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        removeCouponCode(store.slug, c.code);
                        setCouponError(null);
                      }}
                      aria-label="ลบคูปอง"
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#F472B6] hover:text-white"
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
                className="flex-1 rounded-full border border-[#FBCFE8] bg-[#FEFCE8]/60 px-4 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:bg-white focus:border-[#F472B6]"
                disabled={couponBusy}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponBusy || !draftCode.trim()}
                className="h-9 px-4 rounded-full bg-[#1E1B4B] text-white font-[family:var(--font-kanit)] font-bold text-xs uppercase tracking-widest hover:bg-[#312E81] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ใช้
              </button>
            </div>
            {couponError && (
              <p className="text-xs font-bold text-[#DC2626]">{couponError}</p>
            )}
          </div>

          {/* Totals */}
          <div className="rounded-3xl bg-white border border-[#FBCFE8] p-5 shadow-[0_8px_32px_-12px_rgba(244,114,182,0.35)] space-y-4">
            <h3 className="font-[family:var(--font-kanit)] font-black text-xl">
              สรุปคำสั่งซื้อ
            </h3>
            <div className="space-y-2.5 text-sm">
              <Row label="ยอดสินค้า" value={formatTHB(subtotal)} />
              <Row
                label="ค่าจัดส่ง"
                value={shippingAfter === 0 ? 'ฟรี' : formatTHB(shippingAfter)}
                valueClass={shippingAfter === 0 ? 'text-[#047857]' : ''}
              />
              {totalDiscount > 0 && (
                <Row
                  label="ส่วนลด"
                  value={`- ${formatTHB(totalDiscount)}`}
                  valueClass="text-[#DB2777]"
                />
              )}
            </div>
            <div className="border-t border-[#FBCFE8] pt-4 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-black">รวม</span>
              <span className="font-[family:var(--font-kanit)] font-black text-2xl vb-rainbow-text">
                {formatTHB(total)}
              </span>
            </div>
            <Link
              href={`/stores/${store.slug}/checkout`}
              className="h-14 w-full flex items-center justify-center gap-2 rounded-full bg-[#F472B6] text-white font-[family:var(--font-kanit)] font-black text-base vb-glow-primary hover:bg-[#EC4899] active:scale-95 transition-all"
            >
              <Download className="w-5 h-5" />
              ไปชำระเงิน
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/stores/${store.slug}/category`}
              className="block text-center text-xs font-bold text-[#6366F1] hover:text-[#DB2777] underline decoration-dotted underline-offset-4"
            >
              ← เลือกซื้อต่อ
            </Link>
          </div>

          {/* Trust */}
          <div className="rounded-3xl bg-[#FCE7F3] border border-[#FBCFE8] p-4 flex items-start gap-3 text-xs">
            <Palette className="w-4 h-4 text-[#DB2777] shrink-0 mt-0.5" />
            <p className="text-[#1E1B4B]/80 leading-relaxed">
              ทุกการสั่งซื้อ — ดาวน์โหลดได้ทันทีหลังชำระเงิน · ใบอนุญาตเชิงพาณิชย์ฟรี
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
      <span className="text-[#6366F1] text-xs uppercase tracking-widest font-bold">{label}</span>
      <span className={`font-bold ${valueClass || 'text-[#1E1B4B]'}`}>{value}</span>
    </div>
  );
}
