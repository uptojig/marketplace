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
  Bot,
  Sparkles,
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

const GRADIENT_BG = 'linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)';
const GRADIENT_TEXT_STYLE: React.CSSProperties = {
  backgroundImage: GRADIENT_BG,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
};
const GLASS_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(19, 19, 46, 0.6)',
  backdropFilter: 'blur(12px) saturate(140%)',
  WebkitBackdropFilter: 'blur(12px) saturate(140%)',
  border: '1px solid rgba(168, 85, 247, 0.16)',
};
const GRID_BG_STYLE: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.18) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};
const GLOW_SM =
  '0 0 0 1px rgba(168,85,247,0.4), 0 0 12px rgba(168,85,247,0.4), 0 0 32px rgba(168,85,247,0.2)';
const GLOW_LG =
  '0 0 0 1px rgba(168,85,247,0.5), 0 0 24px rgba(168,85,247,0.5), 0 0 64px rgba(168,85,247,0.28)';

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

  if (!mounted) return <div className="min-h-[60vh] bg-[#0B0B1F]" />;

  if (lines.length === 0) {
    return (
      <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)] min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center rounded-2xl p-10 max-w-md w-full" style={GLASS_STYLE}>
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
          >
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-2xl font-bold text-[#F8FAFC] mb-2">
            ตะกร้าว่าง
          </h1>
          <p className="text-sm text-[#94A3B8] mb-6">ยังไม่มีพรอมต์ในตะกร้า</p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-white text-sm font-semibold font-[family:var(--font-kanit)]"
            style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
          >
            <Sparkles className="w-4 h-4" />
            เริ่มช้อป
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)] min-h-screen">
      <section className="relative overflow-hidden border-b border-[#312E81]/60 px-4 py-10">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={GRID_BG_STYLE} aria-hidden />
        <div className="relative max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#A855F7]/40 bg-[#A855F7]/10 text-[10px] uppercase tracking-[0.18em] text-[#A855F7] mb-3 font-[family:var(--font-kanit)] font-semibold">
            <ShoppingBag className="w-3 h-3" />
            ตะกร้า · <span className="tabular-nums">{itemCount}</span> รายการ
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
            ตะกร้าสินค้า
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-4">
          {remaining > 0 ? (
            <div className="rounded-2xl p-4" style={GLASS_STYLE}>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm font-medium text-[#F8FAFC] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A855F7]" />
                  ช้อปเพิ่ม{' '}
                  <span className="text-[#A855F7] font-bold tabular-nums">
                    {formatTHB(remaining)}
                  </span>{' '}
                  เพื่อส่งฟรี
                </p>
                <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] tabular-nums">
                  {Math.round(progressPct)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#13132E] overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, backgroundImage: GRADIENT_BG }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#10B981]/40 bg-[#10B981]/10 p-4 text-sm text-[#10B981] font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              ส่งฟรีทั่วประเทศ — รับลิงก์ดาวน์โหลดทางอีเมล
            </div>
          )}

          {lines.map((l) => (
            <div key={l.productId} className="rounded-2xl p-4 flex gap-4" style={GLASS_STYLE}>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-[#1E1E3F]">
                {l.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.imageUrl}
                    alt={l.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#A855F7]/15 to-[#06B6D4]/15">
                    <Bot className="w-8 h-8 text-[#F8FAFC]/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="font-[family:var(--font-kanit)] font-semibold text-sm sm:text-base text-[#F8FAFC] hover:text-[#A855F7] transition-colors line-clamp-2 leading-snug"
                  >
                    {l.title}
                  </Link>
                  <p className="font-[family:var(--font-kanit)] font-bold text-[#A855F7] text-lg mt-1 tabular-nums">
                    {formatTHB(l.priceTHB)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center rounded-full bg-[#0B0B1F]/60 border border-[#312E81]">
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                      aria-label="ลด"
                      className="w-9 h-9 flex items-center justify-center text-[#94A3B8] hover:text-[#A855F7] transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 h-9 flex items-center justify-center font-semibold text-[#F8FAFC] tabular-nums text-sm">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                      aria-label="เพิ่ม"
                      className="w-9 h-9 flex items-center justify-center text-[#94A3B8] hover:text-[#A855F7] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.productId, store.slug)}
                    aria-label="ลบ"
                    className="w-9 h-9 rounded-full bg-[#0B0B1F]/60 border border-[#312E81] flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:border-[#EF4444]/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl p-5 space-y-3" style={GLASS_STYLE}>
            <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm uppercase tracking-[0.16em] text-[#F8FAFC] flex items-center gap-2 pb-3 border-b border-[#312E81]">
              <Tag className="w-4 h-4 text-[#A855F7]" />
              คูปองส่วนลด
            </h3>
            {coupons.length > 0 && (
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-[#A855F7]/40 bg-[#A855F7]/10"
                  >
                    <span className="font-mono text-xs text-[#A855F7] font-semibold tracking-wider truncate">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        removeCouponCode(store.slug, c.code);
                        setCouponError(null);
                      }}
                      aria-label="ลบคูปอง"
                      className="shrink-0 w-6 h-6 rounded-full text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center justify-center transition-colors"
                    >
                      <XIcon className="w-3.5 h-3.5" />
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
                className="flex-1 rounded-full bg-[#0B0B1F]/60 border border-[#312E81] px-4 py-2 text-sm font-mono uppercase tracking-wider text-[#F8FAFC] placeholder:text-[#94A3B8] placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-[#A855F7]"
                disabled={couponBusy}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponBusy || !draftCode.trim()}
                className="h-9 px-4 rounded-full text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity font-[family:var(--font-kanit)]"
                style={{ backgroundImage: GRADIENT_BG }}
              >
                ใช้
              </button>
            </div>
            {couponError && <p className="text-xs text-[#EF4444]">{couponError}</p>}
          </div>

          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ ...GLASS_STYLE, boxShadow: GLOW_SM }}
          >
            <h3 className="font-[family:var(--font-kanit)] font-semibold text-base text-[#F8FAFC] pb-3 border-b border-[#312E81]">
              สรุปคำสั่งซื้อ
            </h3>
            <div className="space-y-2.5 text-sm">
              <Row label="ยอดสินค้า" value={formatTHB(subtotal)} />
              <Row
                label="ค่าจัดส่ง"
                value={shippingAfter === 0 ? 'ฟรี' : formatTHB(shippingAfter)}
                valueClass={shippingAfter === 0 ? 'text-[#10B981] font-semibold' : ''}
              />
              {totalDiscount > 0 && (
                <Row
                  label="ส่วนลด"
                  value={`- ${formatTHB(totalDiscount)}`}
                  valueClass="text-[#A855F7] font-semibold"
                />
              )}
            </div>
            <div className="border-t border-[#312E81] pt-3 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-semibold text-sm uppercase tracking-[0.14em] text-[#F8FAFC]">
                ยอดรวม
              </span>
              <span
                className="font-[family:var(--font-kanit)] font-bold text-2xl tabular-nums"
                style={GRADIENT_TEXT_STYLE}
              >
                {formatTHB(total)}
              </span>
            </div>
            <Link
              href={`/stores/${store.slug}/checkout`}
              className="h-12 w-full flex items-center justify-center gap-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity font-[family:var(--font-kanit)]"
              style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_LG }}
            >
              ดำเนินการชำระเงิน <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/stores/${store.slug}/category`}
              className="block text-center text-xs text-[#94A3B8] hover:text-[#06B6D4] transition-colors"
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
    <div className="flex justify-between items-baseline">
      <span className="text-xs uppercase tracking-[0.14em] text-[#94A3B8]">{label}</span>
      <span className={`text-[#F8FAFC] tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}
