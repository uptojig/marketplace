'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, Trash2, ShoppingCart, Tag, X as XIcon, ChevronRight, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { calculate } from '@/lib/coupons/calculator';
import type { Coupon } from '@/lib/coupons/types';
import { formatTHB } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

export default function NotionMartCart({ store }: { store: StoreLite }) {
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

  const lines = useMemo(() => allLines.filter((l) => l.storeSlug === store.slug), [allLines, store.slug]);
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const shippingBefore = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;

  const calculation = useMemo(() => {
    if (lines.length === 0 || coupons.length === 0) return null;
    return calculate({
      items: lines.map((l) => ({ id: l.productId, productId: l.productId, qty: l.qty, storeId: store.id, title: l.title, thumbnailUrl: l.imageUrl ?? '', price: l.priceTHB, storeName: l.storeName })),
      coupons,
      shippingPerStore: { [store.id]: shippingBefore },
    });
  }, [lines, coupons, store.id, shippingBefore]);

  const totalDiscount = calculation?.totalDiscount ?? 0;
  const shippingAfter = calculation?.shippingAfterDiscount[store.id] ?? shippingBefore;
  const total = Math.max(0, subtotal + shippingAfter - totalDiscount);
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    if (codes.length === 0) { setCoupons([]); return; }
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
              items: lines.map((l) => ({ id: l.productId, productId: l.productId, qty: l.qty, storeId: store.id, title: l.title, thumbnailUrl: l.imageUrl ?? '', price: l.priceTHB, storeName: l.storeName })),
              shippingPerStore: { [store.id]: shippingBefore },
              existingCodes: fetched.map((c) => c.code),
            }),
          });
          const data = (await res.json()) as { ok: true; coupon: Coupon } | { ok: false; reason: string };
          if (data.ok) fetched.push(data.coupon);
        } catch { /* swallow */ }
      }
      if (!cancelled) setCoupons(fetched);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codes.join('|'), lines.length, store.id, shippingBefore]);

  const COUPON_ERRORS: Record<string, string> = {
    not_found: 'ไม่พบรหัสคูปองนี้', expired: 'รหัสคูปองหมดอายุแล้ว', not_started: 'รหัสคูปองยังไม่เริ่มใช้งาน',
    min_spend_not_met: 'ยอดสั่งซื้อยังไม่ถึงขั้นต่ำที่กำหนด', no_eligible_items: 'ไม่มีสินค้าที่ใช้คูปองนี้ได้',
    already_applied: 'ใช้รหัสคูปองนี้ไปแล้ว', slot_conflict: 'ใช้คูปองชนกับคูปองอื่นที่กดไว้',
    payment_method_mismatch: 'รหัสคูปองใช้กับวิธีชำระเงินที่เลือกไม่ได้', usage_limit_exceeded: 'รหัสคูปองนี้ถูกใช้ครบจำนวนแล้ว',
  };

  async function applyCoupon() {
    const code = draftCode.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true); setCouponError(null);
    try {
      const res = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code,
          items: lines.map((l) => ({ id: l.productId, productId: l.productId, qty: l.qty, storeId: store.id, title: l.title, thumbnailUrl: l.imageUrl ?? '', price: l.priceTHB, storeName: l.storeName })),
          shippingPerStore: { [store.id]: shippingBefore },
          existingCodes: codes,
        }),
      });
      const data = (await res.json()) as { ok: true; coupon: Coupon } | { ok: false; reason: string };
      if (data.ok) { addCouponCode(store.slug, code); setDraftCode(''); }
      else { setCouponError(COUPON_ERRORS[data.reason] ?? 'ใช้คูปองไม่สำเร็จ'); }
    } catch { setCouponError('เครือข่ายไม่ตอบสนอง ลองอีกครั้ง'); }
    finally { setCouponBusy(false); }
  }

  if (!mounted) return <div className="min-h-[60vh] bg-white" />;

  return (
    <main className={`bg-white text-[#1A1A1A] min-h-screen ${FONT_BODY}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 space-y-6">
        <nav className="flex items-center gap-1 text-[11px] text-[#6B6B6B] tracking-wide">
          <Link href={`/stores/${store.slug}`} className="hover:text-[#2563EB] hover:underline underline-offset-2">หน้าร้าน</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#1A1A1A]">ตะกร้า</span>
        </nav>

        <header>
          <p className={`text-[10px] tracking-[0.16em] uppercase ${FONT_HEADING} font-medium text-[#6B6B6B]`}>หน้าตรวจสอบ</p>
          <h1 className={`mt-1 ${FONT_HEADING} font-bold text-3xl sm:text-4xl text-[#1A1A1A]`}>🛒 ตะกร้าของคุณ</h1>
          <p className="mt-1 text-[13px] text-[#6B6B6B]">{itemCount} ชิ้น · จาก {store.name}</p>
        </header>

        {lines.length === 0 ? (
          <EmptyCart slug={store.slug} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section aria-labelledby="cart-heading" className="lg:col-span-8 space-y-4">
              <h2 id="cart-heading" className="sr-only">สินค้าในตะกร้า</h2>
              {remainingForFree > 0 ? (
                <div className="bg-[#F7F6F3] border border-[#E5E5E5] rounded-md p-3">
                  <p className="text-[12px] text-[#1A1A1A] mb-2">เพิ่มอีก <span className="font-semibold text-[#2563EB] tabular-nums">{formatTHB(remainingForFree)}</span> รับส่วนลดค่าบริการ</p>
                  <div className="h-1.5 bg-white border border-[#E5E5E5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563EB] transition-all rounded-full" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              ) : (
                <div className="bg-[#F7F6F3] border-l-[3px] border-[#16A34A] rounded-md px-3 py-2.5 flex items-center gap-2 text-[12.5px] text-[#1A1A1A]">
                  <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />ยอดถึงเกณฑ์ส่วนลดบริการแล้ว
                </div>
              )}

              <ul className="space-y-2">
                {lines.map((l) => (
                  <li key={l.productId} className="bg-white border border-[#E5E5E5] rounded-md p-3 hover:border-[#1A1A1A] transition-colors">
                    <div className="flex gap-3">
                      <Link href={`/stores/${store.slug}/products/${l.productId}`} className="block w-20 h-20 shrink-0 bg-[#F7F6F3] border border-[#E5E5E5] rounded overflow-hidden">
                        {l.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-2xl" aria-hidden>📄</div>
                        )}
                      </Link>
                      <div className="flex-1 flex flex-col gap-2 min-w-0">
                        <Link href={`/stores/${store.slug}/products/${l.productId}`} className="block">
                          <h3 className={`${FONT_HEADING} font-semibold text-[13.5px] text-[#1A1A1A] hover:text-[#2563EB] transition-colors leading-snug line-clamp-2`}>{l.title}</h3>
                        </Link>
                        <div className="flex items-center justify-between gap-2 flex-wrap mt-auto">
                          <div className="inline-flex items-stretch border border-[#E5E5E5] rounded">
                            <button type="button" onClick={() => setQty(l.productId, l.qty - 1, store.slug)} disabled={l.qty <= 1} aria-label="ลด" className="px-2 hover:bg-[#F7F6F3] text-[#1A1A1A] disabled:opacity-30"><Minus className="h-3 w-3" /></button>
                            <span className={`${FONT_HEADING} font-semibold text-[13px] px-3 py-1 min-w-[2rem] text-center border-x border-[#E5E5E5] text-[#1A1A1A] tabular-nums`}>{l.qty}</span>
                            <button type="button" onClick={() => setQty(l.productId, l.qty + 1, store.slug)} aria-label="เพิ่ม" className="px-2 hover:bg-[#F7F6F3] text-[#1A1A1A]"><Plus className="h-3 w-3" /></button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-[#1A1A1A] tabular-nums">{formatTHB(l.priceTHB * l.qty)}</span>
                            <button type="button" onClick={() => remove(l.productId, store.slug)} aria-label={`ลบ ${l.title}`} className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#DC2626] hover:border-[#DC2626] hover:text-white transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Link href={`/stores/${store.slug}`} className="inline-flex items-center gap-1.5 text-[12.5px] text-[#2563EB] hover:underline underline-offset-2">← เลือกซื้อสินค้าต่อ</Link>
            </section>

            <aside className="lg:col-span-4 space-y-3 lg:sticky lg:top-6 lg:self-start">
              <div className="bg-white border border-[#E5E5E5] rounded-md overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#F7F6F3]">
                  <p className={`${FONT_HEADING} font-bold text-[15px] text-[#1A1A1A]`}>สรุปออเดอร์</p>
                  <p className="text-[11px] text-[#6B6B6B] mt-0.5">ตรวจสอบยอดก่อนชำระเงิน</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-2 pb-3 border-b border-[#E5E5E5]">
                    <label className={`flex items-center gap-1.5 text-[11px] ${FONT_HEADING} font-medium uppercase tracking-[0.1em] text-[#6B6B6B]`}>
                      <Tag className="h-3 w-3 text-[#2563EB]" />ใช้รหัสคูปอง
                    </label>
                    <div className="flex items-stretch gap-2">
                      <input type="text" value={draftCode} onChange={(e) => { setDraftCode(e.target.value); setCouponError(null); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }} placeholder="WELCOME100" className="flex-1 border border-[#E5E5E5] rounded px-2.5 py-1.5 text-[12px] uppercase tracking-wider bg-white focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]" />
                      <button type="button" onClick={applyCoupon} disabled={couponBusy || draftCode.trim().length === 0} className="bg-black hover:bg-[#1A1A1A] disabled:opacity-40 text-white text-[12px] font-medium px-3 py-1.5 rounded transition-colors">{couponBusy ? '...' : 'ใช้'}</button>
                    </div>
                    {couponError && <p className="text-[11px] text-[#DC2626]">{couponError}</p>}
                    {coupons.length > 0 && (
                      <ul className="space-y-1.5 pt-1">
                        {coupons.map((c) => {
                          const applied = calculation?.appliedCoupons.find((ac) => ac.couponId === c.id);
                          return (
                            <li key={c.id} className="flex items-center justify-between gap-2 bg-[#F7F6F3] border border-[#E5E5E5] rounded px-2 py-1.5">
                              <div className="min-w-0 flex-1">
                                <p className={`${FONT_HEADING} font-semibold text-[11.5px] text-[#1A1A1A] truncate`}>{c.code}</p>
                                <p className="text-[10px] text-[#6B6B6B] truncate">{c.title}</p>
                              </div>
                              {applied && <span className="text-[11px] font-semibold text-[#DC2626] tabular-nums">-{formatTHB(applied.amount)}</span>}
                              <button type="button" onClick={() => removeCouponCode(store.slug, c.code)} aria-label={`เอา ${c.code} ออก`} className="p-0.5 text-[#6B6B6B] hover:text-[#DC2626] transition-colors"><XIcon className="h-3 w-3" /></button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <SummaryRow label={`ราคารวม (${itemCount} ชิ้น)`} value={formatTHB(subtotal)} />
                  {totalDiscount > 0 && <SummaryRow label="ส่วนลดคูปอง" value={`-${formatTHB(totalDiscount)}`} valueClass="text-[#DC2626]" />}
                  <SummaryRow label="ค่าบริการ" value={shippingAfter === 0 ? 'ฟรี' : formatTHB(shippingAfter)} valueClass={shippingAfter === 0 ? 'text-[#16A34A]' : 'text-[#1A1A1A]'} />

                  <div className="border-t border-[#E5E5E5] pt-3 flex items-baseline justify-between">
                    <span className={`${FONT_HEADING} font-bold text-[14px] text-[#1A1A1A]`}>ยอดสุทธิ</span>
                    <span className={`${FONT_HEADING} font-bold text-2xl text-[#1A1A1A] tabular-nums`}>{formatTHB(total)}</span>
                  </div>

                  <Link href={`/stores/${store.slug}/checkout`} className="w-full inline-flex items-center justify-center gap-1.5 bg-black hover:bg-[#1A1A1A] text-white text-[13px] font-medium px-4 py-3 rounded transition-colors">
                    <ShoppingCart className="h-3.5 w-3.5" />ดำเนินการชำระเงิน
                  </Link>

                  <p className="flex items-center justify-center gap-1 text-[10px] text-[#6B6B6B]"><ShieldCheck className="h-3 w-3" />ชำระปลอดภัย · เข้ารหัส SSL</p>
                </div>
              </div>

              <div className="bg-[#F7F6F3] border border-[#E5E5E5] rounded-md p-3 space-y-1.5 text-[11.5px] text-[#1A1A1A]">
                <p className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-[#2563EB]" />ดาวน์โหลดทันทีหลังชำระ</p>
                <p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />ลิงก์ส่วนตัว · หมดอายุ 10 นาที</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryRow({ label, value, valueClass = 'text-[#1A1A1A]' }: { label: string; value: string; valueClass?: string; }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#1A1A1A]">{label}</span>
      <span className={`font-semibold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}

function EmptyCart({ slug }: { slug: string }) {
  return (
    <div className="border border-dashed border-[#E5E5E5] rounded-md p-12 text-center bg-[#F7F6F3]">
      <p className="text-3xl mb-2" aria-hidden>🛒</p>
      <h2 className={`text-xl ${FONT_HEADING} font-bold text-[#1A1A1A]`}>ตะกร้ายังว่างอยู่</h2>
      <p className="mt-1 text-[12.5px] text-[#6B6B6B]">เลือกเทมเพลตที่ใช่จากคลังของเรา</p>
      <Link href={`/stores/${slug}`} className="inline-flex items-center gap-1.5 mt-4 bg-black hover:bg-[#1A1A1A] text-white text-[12.5px] font-medium px-4 py-2 rounded transition-colors">เปิดคลังเทมเพลต →</Link>
    </div>
  );
}
