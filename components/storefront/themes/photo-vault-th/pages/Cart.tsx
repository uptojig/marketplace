'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Aperture,
  Minus,
  Plus,
  Trash2,
  Tag,
  X as XIcon,
  ChevronRight,
  Download,
  ShoppingBag,
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

  const codes = useMemo(
    () => allCodes[store.slug] ?? [],
    [allCodes, store.slug],
  );
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
  const shippingAfter =
    calculation?.shippingAfterDiscount[store.id] ?? shippingBefore;
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
          /* drop */
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

  if (!mounted) return <div className="min-h-[60vh] bg-[#0C0A09]" />;

  if (lines.length === 0) {
    return (
      <div className="bg-[#0C0A09] min-h-screen text-[#F5F5F4] font-[family:var(--font-prompt)] flex items-center justify-center px-4 py-20">
        <div className="text-center bg-[#1C1917] border border-[#44403C] p-10 max-w-md w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-[#F59E0B] bg-gradient-to-br from-[#1C1917] to-[#0C0A09] mb-6 pv-glow-amber">
            <ShoppingBag className="w-7 h-7 text-[#F59E0B]" strokeWidth={1.5} />
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-bold mb-2">
            วอลต์ของคุณว่าง
          </h1>
          <p className="text-sm text-[#A8A29E] mb-7">
            เริ่มต้นช้อปพรีเซ็ตและ LUT ที่ออกแบบมาเพื่อช่างภาพ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold tracking-wide text-sm transition-colors pv-glow-amber"
          >
            <Aperture className="w-4 h-4" />
            สำรวจคอลเลกชัน
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0C0A09] text-[#F5F5F4] font-[family:var(--font-prompt)] min-h-screen">
      {/* Header strip */}
      <section className="pv-grain relative border-b border-[#44403C] bg-gradient-to-b from-[#1C1917] to-[#0C0A09] px-4 py-12">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] mb-3">
            <span className="w-8 h-px bg-[#FBBF24]" />
            Vault · {itemCount} รายการ
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="pv-text-gold">ตะกร้าของคุณ</span>
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Lines */}
        <div className="space-y-4">
          {/* Free shipping progress */}
          {remaining > 0 ? (
            <div className="bg-[#1C1917] border border-[#44403C] p-4">
              <p className="font-[family:var(--font-kanit)] font-bold text-sm mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-[#F59E0B]" />
                ช้อปเพิ่ม {formatTHB(remaining)} เพื่อปลดล็อกส่งฟรี
              </p>
              <div className="h-1.5 bg-[#292524] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-[#1C1917] border border-[#10B981] p-4 text-sm font-[family:var(--font-kanit)] font-bold text-[#10B981] tracking-wide">
              ✓ ปลดล็อกส่งฟรีทั่วประเทศแล้ว
            </div>
          )}

          {lines.map((l) => (
            <div
              key={l.productId}
              className="bg-[#1C1917] border border-[#44403C] p-4 flex gap-4"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 border border-[#44403C] bg-[#0C0A09] overflow-hidden">
                {l.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.imageUrl}
                    alt={l.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1C1917] to-[#0C0A09]">
                    <Aperture
                      className="w-8 h-8 text-[#44403C]"
                      strokeWidth={1}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="font-[family:var(--font-kanit)] font-bold text-base leading-tight line-clamp-2 hover:text-[#FBBF24] transition-colors text-[#F5F5F4]"
                  >
                    {l.title}
                  </Link>
                  <p className="font-[family:var(--font-kanit)] font-bold text-[#F59E0B] text-xl mt-1.5">
                    {formatTHB(l.priceTHB)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center border border-[#44403C]">
                    <button
                      type="button"
                      onClick={() =>
                        setQty(l.productId, l.qty - 1, store.slug)
                      }
                      aria-label="ลด"
                      className="w-9 h-9 flex items-center justify-center text-[#F5F5F4] hover:bg-[#292524] transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 h-9 flex items-center justify-center font-[family:var(--font-kanit)] font-bold text-sm border-x border-[#44403C]">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQty(l.productId, l.qty + 1, store.slug)
                      }
                      aria-label="เพิ่ม"
                      className="w-9 h-9 flex items-center justify-center text-[#F5F5F4] hover:bg-[#292524] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.productId, store.slug)}
                    aria-label="ลบ"
                    className="w-9 h-9 flex items-center justify-center border border-[#44403C] hover:border-[#E11D48] hover:text-[#E11D48] text-[#A8A29E] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-28 self-start">
          {/* Coupon */}
          <div className="bg-[#1C1917] border border-[#44403C] p-5 space-y-3">
            <h3 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#F59E0B] inline-flex items-center gap-2">
              <Tag className="w-4 h-4" /> คูปอง
            </h3>
            {coupons.length > 0 && (
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between gap-2 bg-[#0C0A09] border border-[#F59E0B] px-3 py-2"
                  >
                    <span className="font-[family:var(--font-kanit)] font-bold uppercase text-xs tracking-[0.24em] text-[#FBBF24] truncate">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        removeCouponCode(store.slug, c.code);
                        setCouponError(null);
                      }}
                      aria-label="ลบคูปอง"
                      className="shrink-0 p-1 hover:text-[#E11D48] text-[#A8A29E] transition-colors"
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
                className="flex-1 bg-[#0C0A09] border border-[#44403C] px-3 py-2 text-sm text-[#F5F5F4] uppercase tracking-wider placeholder:text-[#A8A29E] focus:outline-none focus:border-[#F59E0B] transition-colors"
                disabled={couponBusy}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponBusy || !draftCode.trim()}
                className="h-10 px-4 bg-[#F59E0B] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold text-xs uppercase tracking-[0.24em] hover:bg-[#FBBF24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ใช้
              </button>
            </div>
            {couponError && (
              <p className="text-xs text-[#E11D48] font-semibold tracking-wider">
                {couponError}
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="bg-gradient-to-br from-[#1C1917] to-[#0C0A09] border border-[#F59E0B]/40 p-5 space-y-3 pv-glow-amber">
            <h3 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#F59E0B] pb-3 border-b border-[#44403C]">
              สรุปคำสั่งซื้อ
            </h3>
            <div className="space-y-2.5 text-sm">
              <Row label="ยอดสินค้า" value={formatTHB(subtotal)} />
              <Row
                label="ค่าจัดส่ง"
                value={shippingAfter === 0 ? 'ฟรี' : formatTHB(shippingAfter)}
                valueClass={shippingAfter === 0 ? 'text-[#10B981]' : ''}
              />
              {totalDiscount > 0 && (
                <Row
                  label="ส่วนลด"
                  value={`- ${formatTHB(totalDiscount)}`}
                  valueClass="text-[#FBBF24]"
                />
              )}
            </div>
            <div className="border-t border-[#44403C] pt-4 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-bold uppercase tracking-wide text-sm">
                ยอดรวม
              </span>
              <span className="font-[family:var(--font-kanit)] font-bold text-2xl text-[#F59E0B]">
                {formatTHB(total)}
              </span>
            </div>
            <Link
              href={`/stores/${store.slug}/checkout`}
              className="inline-flex items-center justify-center gap-2 w-full h-14 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold tracking-wide text-base transition-colors"
            >
              ดำเนินการชำระเงิน
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/stores/${store.slug}/category`}
              className="block text-center text-xs uppercase tracking-[0.24em] text-[#A8A29E] hover:text-[#F59E0B] transition-colors"
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
      <span className="text-[#A8A29E] uppercase tracking-wider text-xs">
        {label}
      </span>
      <span className={`font-semibold text-[#F5F5F4] ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
