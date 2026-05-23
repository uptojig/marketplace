'use client';
import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Truck,
  MapPin,
  Wallet,
  ShieldCheck,
  Tag,
  ArrowRight,
  Timer,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { flashDeadlineSeconds } from '../palette';

interface CartLine {
  productId: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  qty: number;
  storeSlug: string;
}

export interface CheckoutProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  items: CartLine[];
}

/**
 * taobao-style — Checkout page.
 *
 * One-page funnel (no real submit — adapter wires the live form):
 *   1. Address form (mock fields, store-themed inputs)
 *   2. Shipping option chips (Standard / Express / COD)
 *   3. Payment method radio cards
 *   4. Sticky order summary with countdown urgency
 */
export function Checkout({ store }: CheckoutProps) {
  const lines = useCart((s) => s.lines);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [shipping, setShipping] = useState<'std' | 'express' | 'cod'>('std');
  const [payment, setPayment] = useState<'promptpay' | 'card' | 'cod' | 'truemoney'>('promptpay');

  const totalSeconds = flashDeadlineSeconds(store.slug);
  const [remaining, setRemaining] = useState(totalSeconds);
  useEffect(() => {
    setRemaining(totalSeconds);
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : totalSeconds)), 1000);
    return () => clearInterval(id);
  }, [totalSeconds]);
  const hh = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  if (!mounted) {
    return (
      <main className="min-h-[60vh]" style={{ background: 'var(--shop-bg)' }} />
    );
  }

  const storeLines: CartLine[] = lines.filter((l) => l.storeSlug === store.slug);
  const subtotal = storeLines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0);
  const totalItems = storeLines.reduce((acc, l) => acc + l.qty, 0);

  const shippingTable: Record<typeof shipping, { label: string; sub: string; fee: number }> = {
    std: { label: 'ส่งมาตรฐาน', sub: '2-3 วันทำการ · เคอรี่ / Flash', fee: subtotal >= 990 ? 0 : 50 },
    express: { label: 'ส่งด่วน', sub: 'ในวันเดียว · เฉพาะกรุงเทพฯ', fee: 120 },
    cod: { label: 'เก็บปลายทาง (COD)', sub: 'จ่ายตอนรับของ', fee: subtotal >= 990 ? 0 : 70 },
  };
  const shippingFee = shippingTable[shipping].fee;
  const grandTotal = subtotal + shippingFee;

  const urls = {
    cart: `/stores/${store.slug}/cart`,
    home: `/stores/${store.slug}`,
  };

  return (
    <main
      className="min-h-screen font-[family:var(--font-prompt)] pb-12"
      style={{ background: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      {/* Top bar */}
      <section
        className="text-white"
        style={{ background: 'var(--shop-primary-gradient)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-3 flex-wrap">
          <h1 className="font-[family:var(--font-kanit)] font-black text-xl sm:text-2xl uppercase">
            ดำเนินการสั่งซื้อ
          </h1>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-[family:var(--font-prompt)] font-bold"
            style={{ background: 'rgba(0,0,0,0.25)' }}
          >
            <Timer size={14} style={{ color: 'var(--shop-accent)' }} /> ราคาดีลปิดใน
            <span
              className="font-[family:var(--font-kanit)] font-black tabular-nums px-1.5 py-0.5 rounded"
              style={{ background: 'var(--shop-ink)', color: 'var(--shop-accent)' }}
            >
              {hh}:{mm}:{ss}
            </span>
          </div>
        </div>
      </section>

      {storeLines.length === 0 ? (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <p
            className="font-[family:var(--font-kanit)] font-black text-xl"
            style={{ color: 'var(--shop-ink)' }}
          >
            ไม่มีสินค้าในตะกร้า
          </p>
          <a
            href={urls.home}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-[family:var(--font-kanit)] font-black uppercase text-white"
            style={{ background: 'var(--shop-primary-gradient)' }}
          >
            กลับไปช้อปต่อ <ArrowRight size={14} />
          </a>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form column */}
          <section className="lg:col-span-8 space-y-4">
            {/* 1 · Address */}
            <div
              className="bg-white rounded-lg overflow-hidden"
              style={{ border: `1px solid var(--shop-border)` }}
            >
              <header
                className="px-4 py-3 border-b font-[family:var(--font-kanit)] font-black uppercase text-sm flex items-center gap-2"
                style={{ borderColor: 'var(--shop-border)', color: 'var(--shop-primary)' }}
              >
                <MapPin size={16} /> ที่อยู่จัดส่ง
              </header>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { l: 'ชื่อ - นามสกุล', t: 'text' },
                  { l: 'เบอร์โทรศัพท์', t: 'tel' },
                  { l: 'ที่อยู่ บ้านเลขที่ / อาคาร', t: 'text', span: 2 },
                  { l: 'แขวง / ตำบล', t: 'text' },
                  { l: 'เขต / อำเภอ', t: 'text' },
                  { l: 'จังหวัด', t: 'text' },
                  { l: 'รหัสไปรษณีย์', t: 'text' },
                ].map((f, i) => (
                  <label
                    key={i}
                    className={`block ${f.span === 2 ? 'sm:col-span-2' : ''}`}
                  >
                    <span
                      className="block text-[11px] font-[family:var(--font-prompt)] font-extrabold uppercase tracking-wider mb-1"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      {f.l}
                    </span>
                    <input
                      type={f.t}
                      className="w-full px-3 py-2 rounded-md text-sm font-[family:var(--font-prompt)] outline-none transition-colors focus:border-[color:var(--shop-primary)]"
                      style={{
                        border: `1px solid var(--shop-border)`,
                        background: 'white',
                        color: 'var(--shop-ink)',
                        caretColor: 'var(--shop-primary)',
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* 2 · Shipping */}
            <div
              className="bg-white rounded-lg overflow-hidden"
              style={{ border: `1px solid var(--shop-border)` }}
            >
              <header
                className="px-4 py-3 border-b font-[family:var(--font-kanit)] font-black uppercase text-sm flex items-center gap-2"
                style={{ borderColor: 'var(--shop-border)', color: 'var(--shop-primary)' }}
              >
                <Truck size={16} /> วิธีจัดส่ง
              </header>
              <div className="p-4 space-y-2">
                {(['std', 'express', 'cod'] as const).map((s) => {
                  const item = shippingTable[s];
                  const isActive = shipping === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShipping(s)}
                      className="w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between transition-colors"
                      style={{
                        border: isActive
                          ? `2px solid var(--shop-primary)`
                          : `1px solid var(--shop-border)`,
                        background: isActive ? 'var(--shop-bg-soft)' : 'white',
                      }}
                    >
                      <div>
                        <p
                          className="font-[family:var(--font-kanit)] font-black text-sm"
                          style={{
                            color: isActive ? 'var(--shop-primary)' : 'var(--shop-ink)',
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-[11px] font-[family:var(--font-prompt)]"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {item.sub}
                        </p>
                      </div>
                      <span
                        className="font-[family:var(--font-kanit)] font-black text-sm"
                        style={{
                          color:
                            item.fee === 0 ? 'var(--shop-savings)' : 'var(--shop-ink)',
                        }}
                      >
                        {item.fee === 0 ? 'ฟรี' : formatTHB(item.fee)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 · Payment */}
            <div
              className="bg-white rounded-lg overflow-hidden"
              style={{ border: `1px solid var(--shop-border)` }}
            >
              <header
                className="px-4 py-3 border-b font-[family:var(--font-kanit)] font-black uppercase text-sm flex items-center gap-2"
                style={{ borderColor: 'var(--shop-border)', color: 'var(--shop-primary)' }}
              >
                <CreditCard size={16} /> วิธีการชำระเงิน
              </header>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  [
                    { id: 'promptpay', l: 'พร้อมเพย์ / QR Code', Icon: Wallet },
                    { id: 'card', l: 'บัตรเครดิต / เดบิต', Icon: CreditCard },
                    { id: 'truemoney', l: 'TrueMoney Wallet', Icon: Wallet },
                    { id: 'cod', l: 'เก็บเงินปลายทาง (COD)', Icon: Truck },
                  ] as const
                ).map(({ id, l, Icon }) => {
                  const isActive = payment === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPayment(id)}
                      className="px-3 py-3 rounded-md flex items-center gap-2 transition-colors text-left"
                      style={{
                        border: isActive
                          ? `2px solid var(--shop-primary)`
                          : `1px solid var(--shop-border)`,
                        background: isActive ? 'var(--shop-bg-soft)' : 'white',
                      }}
                    >
                      <Icon
                        size={18}
                        style={{
                          color: isActive ? 'var(--shop-primary)' : 'var(--shop-ink-muted)',
                        }}
                      />
                      <span
                        className="text-sm font-[family:var(--font-prompt)] font-bold"
                        style={{
                          color: isActive ? 'var(--shop-primary)' : 'var(--shop-ink)',
                        }}
                      >
                        {l}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Summary */}
          <aside className="lg:col-span-4">
            <div
              className="bg-white rounded-lg overflow-hidden sticky top-4"
              style={{ border: `1px solid var(--shop-border)` }}
            >
              <div
                className="px-4 py-3 font-[family:var(--font-kanit)] font-black uppercase text-sm text-white"
                style={{ background: 'var(--shop-primary-gradient)' }}
              >
                ยอดสุทธิที่ต้องชำระ
              </div>

              {/* Item list compact */}
              <ul className="px-4 pt-3 max-h-72 overflow-y-auto divide-y" style={{ borderColor: 'var(--shop-border)' }}>
                {storeLines.map((l) => (
                  <li
                    key={l.productId}
                    className="py-2 flex items-center gap-3"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    <div
                      className="w-12 h-12 shrink-0 rounded overflow-hidden"
                      style={{ background: 'var(--shop-muted)' }}
                    >
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-[9px]"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          {l.title.slice(0, 8)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-[family:var(--font-prompt)] font-semibold line-clamp-2"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        {l.title}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        x{l.qty}
                      </p>
                    </div>
                    <span
                      className="font-[family:var(--font-kanit)] font-black text-xs whitespace-nowrap"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {formatTHB(l.priceTHB * l.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="px-4 py-3 space-y-2 text-sm font-[family:var(--font-prompt)] border-t" style={{ borderColor: 'var(--shop-border)' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--shop-ink-muted)' }}>
                    ยอดสินค้า ({totalItems} ชิ้น)
                  </span>
                  <span className="font-bold" style={{ color: 'var(--shop-ink)' }}>
                    {formatTHB(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--shop-ink-muted)' }}>ค่าจัดส่ง</span>
                  <span
                    className="font-bold"
                    style={{
                      color:
                        shippingFee === 0 ? 'var(--shop-savings)' : 'var(--shop-ink)',
                    }}
                  >
                    {shippingFee === 0 ? 'ฟรี' : formatTHB(shippingFee)}
                  </span>
                </div>

                <div
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] font-bold"
                  style={{
                    background: 'var(--shop-bg-soft)',
                    color: 'var(--shop-primary)',
                  }}
                >
                  <Tag size={12} /> ส่วนลด FLASH50 ใช้ได้
                </div>
              </div>

              <div
                className="px-4 py-3 border-t flex items-baseline justify-between"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <span className="font-[family:var(--font-kanit)] font-extrabold uppercase text-sm">
                  รวมทั้งสิ้น
                </span>
                <span
                  className="font-[family:var(--font-kanit)] font-black text-2xl"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {formatTHB(grandTotal)}
                </span>
              </div>

              <div className="px-4 pb-4">
                <button
                  type="button"
                  className="w-full py-3 rounded-md text-sm font-[family:var(--font-kanit)] font-black uppercase text-white inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: 'var(--shop-primary-gradient)' }}
                >
                  ยืนยันคำสั่งซื้อ <ArrowRight size={14} />
                </button>
                <p
                  className="mt-2 text-center text-[11px] font-[family:var(--font-prompt)] flex items-center justify-center gap-1"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  <ShieldCheck size={12} style={{ color: 'var(--shop-primary)' }} />
                  ปลอดภัย รับประกันคืนเงิน 7 วัน
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Checkout;
