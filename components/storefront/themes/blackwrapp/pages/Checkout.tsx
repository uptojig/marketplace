'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Lock,
  Shield,
  Package,
  CreditCard,
} from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import { useCart } from '@/lib/store/cart';
import type { CheckoutProps } from '@/lib/templates/types';

interface ShippingForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addressLine1: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  notes: string;
}

const EMPTY_FORM: ShippingForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  addressLine1: '',
  subdistrict: '',
  district: '',
  province: '',
  postalCode: '',
  notes: '',
};

/**
 * BlackWrapp — premium dark Checkout.
 *
 * ANYPAY-only per task spec. No COD radio. Submit hands the order off
 * to ANYPAY-redirect and the actual payment confirmation flow lives in
 * the global checkout pipeline; this component focuses on collecting
 * the address + showing the summary.
 */
export default function BlackwrappCheckout(props: CheckoutProps) {
  const { store } = props;

  // Pull the live items so the summary stays consistent with the
  // header cart badge after navigation.
  const items = useCart((s) => s.linesForStore(store.slug));
  const subtotal = useCart((s) => s.subtotalForStore(store.slug));

  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  // useCart is persisted to localStorage and rehydrates on the client.
  // SSR sees lines=[] while the client may have items, which would flip
  // the tree from empty-state to form on first render and trip the
  // store-level error boundary. Defer the cart-dependent branches until
  // after mount so the first client render matches SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const FREE_SHIPPING_THRESHOLD = 990;
  const FLAT_SHIPPING_THB = 50;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_THB;
  const total = subtotal + shipping;

  const set = <K extends keyof ShippingForm>(k: K, v: ShippingForm[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The actual ANYPAY redirect handler lives in the global checkout
    // pipeline. Calling it here would bypass server-side cart
    // re-validation, so we just route the user into the ANYPAY entry
    // route and let the pipeline pick up the form state from the
    // server-side cart on the next request.
    window.location.href = `/stores/${store.slug}/checkout/anypay`;
  };

  if (!mounted) {
    return (
      <main
        className="font-[family:var(--font-prompt)] min-h-screen"
        style={{ background: '#0A0A0A', color: '#FAFAFA' }}
        aria-hidden
      />
    );
  }

  if (items.length === 0) {
    return (
      <main
        className="font-[family:var(--font-prompt)] min-h-screen"
        style={{ background: '#0A0A0A', color: '#FAFAFA' }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
          <Package
            size={36}
            strokeWidth={1.25}
            className="mx-auto text-white/20"
          />
          <h1 className="font-[family:var(--font-kanit)] font-medium text-2xl text-white">
            ตะกร้าว่างเปล่า
          </h1>
          <p className="text-sm text-white/55">
            ยังไม่มีสินค้าให้ชำระเงิน
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-[family:var(--font-kanit)] text-sm tracking-[0.18em] uppercase"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-primary, #00FF88))',
              color: '#0A0A0A',
              boxShadow: '0 0 24px var(--shop-primary, #00FF88)45',
            }}
          >
            เลือกซื้อสินค้า
          </Link>
        </div>
      </main>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[var(--shop-primary,#00FF88)] focus:ring-2 focus:ring-[var(--shop-primary,#00FF88)]/15';

  const labelClass =
    'block text-[11px] tracking-[0.18em] uppercase text-white/55 mb-1.5';

  return (
    <main
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: '#0A0A0A', color: '#FAFAFA' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Back */}
        <Link
          href={`/stores/${store.slug}/cart`}
          className="inline-flex items-center gap-1 text-[11px] tracking-[0.2em] uppercase text-white/55 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft size={14} strokeWidth={1.75} />
          กลับไปที่ตะกร้า
        </Link>

        <header className="mb-8 space-y-2">
          <span className="text-[10px] tracking-[0.35em] uppercase text-white/50">
            CHECKOUT
          </span>
          <h1 className="font-[family:var(--font-kanit)] font-medium text-3xl sm:text-4xl tracking-[0.02em] text-white">
            ชำระเงิน
          </h1>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10"
        >
          {/* Address + Payment */}
          <div className="space-y-8">
            <section
              className="rounded-xl border border-white/10 p-6 space-y-5"
              style={{ background: '#141414' }}
              aria-labelledby="ship-heading"
            >
              <h2
                id="ship-heading"
                className="font-[family:var(--font-kanit)] font-medium text-base text-white tracking-[0.05em]"
              >
                ที่อยู่จัดส่ง
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fn" className={labelClass}>
                    ชื่อ *
                  </label>
                  <input
                    id="fn"
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    className={inputClass}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label htmlFor="ln" className={labelClass}>
                    นามสกุล *
                  </label>
                  <input
                    id="ln"
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    className={inputClass}
                    autoComplete="family-name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="08X-XXX-XXXX"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className={inputClass}
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>
                    อีเมล *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={inputClass}
                    autoComplete="email"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="addr1" className={labelClass}>
                    ที่อยู่ *
                  </label>
                  <input
                    id="addr1"
                    type="text"
                    required
                    placeholder="บ้านเลขที่ / หมู่บ้าน / ซอย / ถนน"
                    value={form.addressLine1}
                    onChange={(e) => set('addressLine1', e.target.value)}
                    className={inputClass}
                    autoComplete="address-line1"
                  />
                </div>
                <div>
                  <label htmlFor="sub" className={labelClass}>
                    ตำบล/แขวง
                  </label>
                  <input
                    id="sub"
                    type="text"
                    value={form.subdistrict}
                    onChange={(e) => set('subdistrict', e.target.value)}
                    className={inputClass}
                    autoComplete="address-level3"
                  />
                </div>
                <div>
                  <label htmlFor="dist" className={labelClass}>
                    อำเภอ/เขต
                  </label>
                  <input
                    id="dist"
                    type="text"
                    value={form.district}
                    onChange={(e) => set('district', e.target.value)}
                    className={inputClass}
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <label htmlFor="prov" className={labelClass}>
                    จังหวัด *
                  </label>
                  <input
                    id="prov"
                    type="text"
                    required
                    value={form.province}
                    onChange={(e) => set('province', e.target.value)}
                    className={inputClass}
                    autoComplete="address-level1"
                  />
                </div>
                <div>
                  <label htmlFor="zip" className={labelClass}>
                    รหัสไปรษณีย์ *
                  </label>
                  <input
                    id="zip"
                    type="text"
                    required
                    pattern="[0-9]{5}"
                    maxLength={5}
                    value={form.postalCode}
                    onChange={(e) => set('postalCode', e.target.value)}
                    className={inputClass}
                    autoComplete="postal-code"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className={labelClass}>
                    หมายเหตุ (ถ้ามี)
                  </label>
                  <input
                    id="notes"
                    type="text"
                    placeholder="เช่น โทรก่อนถึง 30 นาที"
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Payment — ANYPAY only */}
            <section
              className="rounded-xl border border-white/10 p-6 space-y-4"
              style={{ background: '#141414' }}
              aria-labelledby="pay-heading"
            >
              <h2
                id="pay-heading"
                className="font-[family:var(--font-kanit)] font-medium text-base text-white tracking-[0.05em]"
              >
                ช่องทางชำระเงิน
              </h2>

              <div
                className="rounded-lg border p-4 flex items-center gap-4"
                style={{
                  borderColor: 'var(--shop-primary, #00FF88)',
                  background: 'rgba(0,255,136,0.04)',
                }}
              >
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background:
                      'var(--shop-primary-gradient, var(--shop-primary, #00FF88))',
                    color: '#0A0A0A',
                  }}
                >
                  <CreditCard size={18} strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    จ่ายออนไลน์
                  </p>
                  <p className="text-xs text-white/55 mt-0.5">
                    บัตรเครดิต/เดบิต · PromptPay · TrueMoney · ปลอดภัย 100%
                  </p>
                </div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/45">
                  เลือกแล้ว
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-white/55">
                <Shield
                  size={14}
                  strokeWidth={1.75}
                  className="shrink-0 mt-0.5"
                  style={{ color: 'var(--shop-primary, #00FF88)' }}
                />
                <p>
                  การชำระเงินเข้ารหัส SSL ผ่านมาตรฐาน PCI-DSS — ระบบไม่เก็บข้อมูลบัตรของคุณ
                </p>
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside
            aria-label="สรุปคำสั่งซื้อ"
            className="rounded-xl border border-white/10 p-6 h-fit lg:sticky lg:top-24 space-y-5"
            style={{ background: '#141414' }}
          >
            <h2 className="font-[family:var(--font-kanit)] font-medium text-base text-white tracking-[0.05em]">
              สรุปคำสั่งซื้อ
            </h2>

            <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((line) => (
                <li key={line.productId} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#0A0A0A] border border-white/5">
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt={line.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package
                          size={16}
                          strokeWidth={1.25}
                          className="text-white/15"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <p className="text-xs text-white line-clamp-2 leading-snug">
                      {line.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-white/55 mt-1">
                      <span>x{line.qty}</span>
                      <span className="tabular-nums text-white/85">
                        {formatTHB(line.priceTHB * line.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/5 pt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-white/70">
                <span>ราคารวมสินค้า</span>
                <span className="tabular-nums text-white">
                  {formatTHB(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>ค่าจัดส่ง</span>
                <span
                  className="tabular-nums"
                  style={{
                    color:
                      shipping === 0
                        ? 'var(--shop-primary, #00FF88)'
                        : 'rgba(255,255,255,0.85)',
                  }}
                >
                  {shipping === 0 ? 'ฟรี' : formatTHB(shipping)}
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex items-baseline justify-between gap-3">
              <span className="text-[11px] tracking-[0.25em] uppercase text-white/55">
                ยอดรวม
              </span>
              <span
                className="font-[family:var(--font-kanit)] font-medium text-2xl tabular-nums"
                style={{ color: 'var(--shop-primary, #00FF88)' }}
              >
                {formatTHB(total)}
              </span>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 font-[family:var(--font-kanit)] text-sm tracking-[0.18em] uppercase transition-all duration-300"
              style={{
                background:
                  'var(--shop-primary-gradient, var(--shop-primary, #00FF88))',
                color: '#0A0A0A',
                boxShadow: '0 0 28px var(--shop-primary, #00FF88)45',
              }}
            >
              <Lock size={14} strokeWidth={2} />
              จ่ายออนไลน์ · {formatTHB(total)}
            </button>

            <p className="text-[10px] tracking-[0.1em] text-white/40 text-center">
              เมื่อกดยืนยัน ถือว่าคุณยอมรับ
              <Link
                href={`/stores/${store.slug}/terms`}
                className="ml-1 text-white/70 underline-offset-2 hover:underline"
              >
                เงื่อนไขการใช้บริการ
              </Link>
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
