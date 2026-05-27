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
  Sparkles,
  Coins,
  Download,
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

/**
 * MysticMu Cart — Mario "coin counter" style. Sky-blue layout with
 * pixel-border line items, free-shipping progress bar (gold-fill),
 * coupon block, sticky summary card on desktop.
 */
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

  if (!mounted) return <div className="min-h-[60vh] bg-[#5C94FC]" />;

  if (lines.length === 0) {
    return (
      <div className="bg-[#5C94FC] min-h-screen text-[#1A1A2E] font-[family:var(--font-prompt)] flex items-center justify-center px-4 py-20">
        <div className="text-center bg-white border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-10 max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 border-4 border-[#1A1A2E] bg-[#FFD700] mb-6 shadow-[4px_4px_0_0_#1A1A2E]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-black uppercase tracking-tight mb-2">
            ตะกร้าว่าง
          </h1>
          <p className="text-sm font-bold text-[#4A4A6E] uppercase tracking-widest mb-6">
            ยังไม่มีวอลล์มงคลในตะกร้า · เลเวลอัพไม่ได้นะ!
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center h-12 px-6 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1 active:translate-y-1 active:shadow-none gap-2"
          >
            <Sparkles className="w-5 h-5" />
            มูเลย
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#5C94FC] text-[#1A1A2E] font-[family:var(--font-prompt)] min-h-screen pb-12">
      {/* Header */}
      <section className="bg-[#E52521] border-b-4 border-[#1A1A2E] px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-4 py-1 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] mb-4 font-[family:var(--font-kanit)]">
            <ShoppingBag className="w-3.5 h-3.5" />
            Cart · {itemCount} รายการ
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0_#1A1A2E]">
            ตะกร้าวอลล์มงคล
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        {/* Lines */}
        <div className="space-y-4">
          {/* Free-ship progress */}
          {remaining > 0 ? (
            <div className="bg-white border-4 border-[#1A1A2E] p-4 shadow-[4px_4px_0_0_#1A1A2E]">
              <p className="font-[family:var(--font-kanit)] font-black uppercase text-sm mb-2 flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#FFD700]" />
                ช้อปเพิ่ม {formatTHB(remaining)} เพื่อส่งฟรี!
              </p>
              <div className="h-4 border-4 border-[#1A1A2E] bg-[#E8E8F0] overflow-hidden">
                <div
                  className="h-full bg-[#FFD700] transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-[#009A4E] text-white border-4 border-[#1A1A2E] p-4 shadow-[4px_4px_0_0_#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase text-sm flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              ส่งฟรีทั่วประเทศ! (ดาวน์โหลดอัตโนมัติ)
            </div>
          )}

          {lines.map((l) => (
            <div
              key={l.productId}
              className="bg-white border-4 border-[#1A1A2E] shadow-[4px_4px_0_0_#1A1A2E] p-4 flex gap-4"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 border-4 border-[#1A1A2E] bg-[#E8E8F0] overflow-hidden">
                {l.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.imageUrl}
                    alt={l.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFD700] via-[#E52521] to-[#009A4E]">
                    <Sparkles className="w-8 h-8 text-white drop-shadow-[1px_1px_0_#1A1A2E]" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="font-[family:var(--font-kanit)] font-black uppercase tracking-tight text-base sm:text-lg leading-tight line-clamp-2 hover:underline decoration-4 underline-offset-4"
                  >
                    {l.title}
                  </Link>
                  <p className="font-[family:var(--font-kanit)] font-black text-[#E52521] text-xl mt-1">
                    {formatTHB(l.priceTHB)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center border-4 border-[#1A1A2E] bg-white">
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                      aria-label="ลด"
                      className="w-9 h-10 flex items-center justify-center hover:bg-[#FFD700]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 h-10 flex items-center justify-center font-[family:var(--font-kanit)] font-black border-x-4 border-[#1A1A2E]">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                      aria-label="เพิ่ม"
                      className="w-9 h-10 flex items-center justify-center hover:bg-[#FFD700]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.productId, store.slug)}
                    aria-label="ลบ"
                    className="w-10 h-10 flex items-center justify-center border-4 border-[#1A1A2E] bg-white hover:bg-[#E52521] hover:text-white active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-32 self-start">
          {/* Coupon */}
          <div className="bg-white border-4 border-[#1A1A2E] shadow-[4px_4px_0_0_#1A1A2E] p-4 space-y-3">
            <h3 className="font-[family:var(--font-kanit)] font-black text-lg uppercase tracking-tight flex items-center gap-2 border-b-4 border-[#1A1A2E] pb-2">
              <Tag className="w-5 h-5 text-[#E52521]" />
              คูปองส่วนลด
            </h3>
            {coupons.length > 0 && (
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-3 py-2 shadow-[3px_3px_0_0_#1A1A2E]"
                  >
                    <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest truncate">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        removeCouponCode(store.slug, c.code);
                        setCouponError(null);
                      }}
                      aria-label="ลบคูปอง"
                      className="shrink-0 p-1 hover:bg-[#1A1A2E] hover:text-white"
                    >
                      <XIcon className="w-4 h-4" />
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
                className="flex-1 border-4 border-[#1A1A2E] px-3 py-2 text-sm font-bold uppercase focus:outline-none focus:bg-[#FFF8DC]"
                disabled={couponBusy}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponBusy || !draftCode.trim()}
                className="h-10 px-4 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest shadow-[3px_3px_0_0_#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ใช้
              </button>
            </div>
            {couponError && (
              <p className="text-xs font-bold text-[#E52521] uppercase tracking-widest">
                {couponError}
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-5 space-y-3">
            <h3 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#FFD700]" />
              สรุปคำสั่งซื้อ
            </h3>
            <div className="space-y-2 text-sm">
              <Row label="ยอดสินค้า" value={formatTHB(subtotal)} />
              <Row
                label="ค่าจัดส่ง"
                value={shippingAfter === 0 ? 'ฟรี' : formatTHB(shippingAfter)}
                valueClass={shippingAfter === 0 ? 'text-[#009A4E] font-black' : ''}
              />
              {totalDiscount > 0 && (
                <Row
                  label="ส่วนลด"
                  value={`- ${formatTHB(totalDiscount)}`}
                  valueClass="text-[#E52521] font-black"
                />
              )}
            </div>
            <div className="border-t-4 border-[#1A1A2E] pt-3 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-black uppercase">ยอดรวม</span>
              <span className="font-[family:var(--font-kanit)] font-black text-2xl text-[#E52521]">
                {formatTHB(total)}
              </span>
            </div>
            <Link
              href={`/stores/${store.slug}/checkout`}
              className="h-14 w-full flex items-center justify-center gap-2 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-base shadow-[6px_6px_0_0_#1A1A2E] hover:bg-[#009A4E] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all"
            >
              ดำเนินการต่อ <ChevronRight className="w-5 h-5" />
            </Link>
            <p className="text-[10px] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-[#009A4E] text-center flex items-center justify-center gap-1.5">
              <Download className="w-3 h-3" /> ดาวน์โหลดได้ทันทีหลังชำระ
            </p>
            <Link
              href={`/stores/${store.slug}/category`}
              className="block text-center font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-[#4A4A6E] hover:text-[#E52521] underline decoration-4 underline-offset-4"
            >
              ← ช้อปต่อ
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-[#4A4A6E]">
        {label}
      </span>
      <span className={`font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}
