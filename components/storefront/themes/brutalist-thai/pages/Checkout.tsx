'use client';

/**
 * brutalist-thai — Bespoke Checkout page
 *
 * Replaces the shared `makeCheckoutAdapter('01')` (which is English/USD and
 * fails the audit P1 i18n check). Implements the full storefront checkout
 * flow in pure brutalist style:
 *
 *   1. ตะกร้า (review lines from useCart)
 *   2. ที่อยู่จัดส่ง (Thai address form)
 *   3. ชำระเงิน (EMS / REGISTERED shipping picker + AnyPay)
 *   4. ยืนยัน (POST /api/checkout, clearStore, success screen)
 *
 * Visual language matches Homepage / Cart / Header / Footer:
 *   - Pure white / pure black grid system
 *   - 4px solid black borders, hard offset drop-shadows (`shadow-[Npx_Npx_0px_#000]`)
 *   - Google Sans poster typography, uppercase, tight tracking
 *   - Single loud accent (#FFE600 yellow) for active/success states
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Check,
  Lock,
  Truck,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

// ── Scaffold contract ───────────────────────────────────────────────
// CheckoutProps from `lib/templates/types.ts` is `{ store, items }`.
// `items` from the server is always empty on the index route (cart
// lives in localStorage). We still accept it so the adapter shape
// stays compatible with the registry wiring layer.

interface StoreSummaryLike {
  id?: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

interface CheckoutPageProps {
  store: StoreSummaryLike;
  items?: unknown[];
}

const ACCENT = '#FFE600'; // brutalist loud accent — used sparingly

const SHIPPING_OPTIONS = [
  { id: 'EMS', label: 'EMS', desc: 'ส่งด่วน · 1-2 วัน', priceTHB: 50 },
  { id: 'REGISTERED', label: 'ลงทะเบียน', desc: 'ไปรษณีย์ไทย · 3-5 วัน', priceTHB: 30 },
] as const;

type ShippingId = (typeof SHIPPING_OPTIONS)[number]['id'];

const PAYMENT_OPTIONS = [
  { id: 'ANYPAY', label: 'ANYPAY', desc: 'PromptPay / บัตรเครดิต / TrueMoney' },
] as const;

type PaymentId = (typeof PAYMENT_OPTIONS)[number]['id'];

interface ThaiAddress {
  recipientName: string;
  phone: string;
  line1: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

const EMPTY_ADDRESS: ThaiAddress = {
  recipientName: '',
  phone: '',
  line1: '',
  subdistrict: '',
  district: '',
  province: '',
  postalCode: '',
};

type Step = 1 | 2 | 3 | 4;

const STEPS: { id: Step; label: string; sub: string }[] = [
  { id: 1, label: 'ตะกร้า', sub: 'CART' },
  { id: 2, label: 'ที่อยู่', sub: 'ADDRESS' },
  { id: 3, label: 'ชำระเงิน', sub: 'PAYMENT' },
  { id: 4, label: 'ยืนยัน', sub: 'CONFIRM' },
];

export function Checkout({ store }: CheckoutPageProps) {
  const router = useRouter();

  // Per-store cart scoping (Shopify-like — see lib/store/cart.ts)
  const allLines = useCart((s) => s.lines);
  const clearStore = useCart((s) => s.clearStore);
  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );
  const subtotal = useMemo(
    () => lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0),
    [lines],
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<ThaiAddress>(EMPTY_ADDRESS);
  const [shippingId, setShippingId] = useState<ShippingId>('EMS');
  const [paymentId, setPaymentId] = useState<PaymentId>('ANYPAY');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ orderId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shipping = SHIPPING_OPTIONS.find((s) => s.id === shippingId)!;
  const payment = PAYMENT_OPTIONS.find((p) => p.id === paymentId)!;
  const total = subtotal + shipping.priceTHB;

  const urls = {
    home: `/stores/${store.slug}`,
    cart: `/stores/${store.slug}/cart`,
    shop: `/stores/${store.slug}/category`,
  };

  const updateAddress = <K extends keyof ThaiAddress>(k: K, v: ThaiAddress[K]) =>
    setAddress((a) => ({ ...a, [k]: v }));

  const canAdvanceFromAddress =
    address.recipientName.trim().length > 0 &&
    address.phone.trim().length >= 9 &&
    address.line1.trim().length > 0 &&
    address.province.trim().length > 0 &&
    /^\d{5}$/.test(address.postalCode.trim());

  async function placeOrder() {
    if (lines.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storeSlug: store.slug,
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          address: {
            recipientName: address.recipientName,
            phone: address.phone,
            line1: address.line1,
            line2: '',
            subdistrict: address.subdistrict,
            district: address.district,
            province: address.province,
            postalCode: address.postalCode,
            country: 'TH',
          },
          shipping: { method: shipping.id, priceTHB: shipping.priceTHB },
          payment: { method: payment.id },
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `ไม่สามารถสร้างออเดอร์ได้ (${res.status})`);
      }
      const data = (await res.json()) as { orderId?: string; paymentUrl?: string };
      clearStore(store.slug);
      setSubmitted({ orderId: data.orderId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถสร้างออเดอร์ได้');
      setSubmitting(false);
    }
  }

  // ── Pre-mount skeleton (avoid Zustand hydration flicker) ─────────
  if (!mounted) {
    return <div className="bg-white min-h-screen" aria-hidden />;
  }

  // ── Success screen ───────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="bg-white text-black min-h-screen font-sans py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="border-4 border-black bg-white p-10 sm:p-14 text-center"
            style={{ boxShadow: '8px 8px 0px 0px #000000' }}
          >
            <div
              className="inline-flex items-center justify-center w-20 h-20 border-4 border-black mb-6"
              style={{ background: ACCENT, boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <Check size={40} strokeWidth={3} />
            </div>
            <h1 className="font-[family:var(--font-google-sans)] font-black text-3xl sm:text-4xl uppercase tracking-tighter leading-none">
              ออเดอร์
              <br />
              สำเร็จแล้ว
            </h1>
            <div className="mt-4 border-t-4 border-black pt-4 max-w-md mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-700 leading-relaxed">
                ระบบบันทึกออเดอร์เรียบร้อย รายละเอียดการชำระเงินจะถูกส่งไปยังอีเมลของคุณ
              </p>
              {submitted.orderId && (
                <p className="mt-4 inline-block border-2 border-black bg-black text-white px-3 py-1.5 text-[11px] font-mono font-bold tracking-widest">
                  ORDER · {submitted.orderId}
                </p>
              )}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={urls.shop}
                className="inline-flex items-center justify-center gap-2 bg-black text-white border-4 border-black px-6 py-3 font-extrabold uppercase tracking-widest text-xs transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                style={{ boxShadow: '4px 4px 0px 0px #000000' }}
              >
                เลือกซื้อต่อ <ArrowRight size={14} />
              </a>
              <a
                href={urls.home}
                className="inline-flex items-center justify-center gap-2 bg-white text-black border-4 border-black px-6 py-3 font-extrabold uppercase tracking-widest text-xs transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                style={{ boxShadow: '4px 4px 0px 0px #000000' }}
              >
                กลับหน้าร้าน
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Empty-cart guard ─────────────────────────────────────────────
  if (lines.length === 0) {
    return (
      <main className="bg-white text-black min-h-screen font-sans py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="border-4 border-black bg-white p-10 text-center"
            style={{ boxShadow: '8px 8px 0px 0px #000000' }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-black bg-black text-white mb-4">
              <ShoppingBag size={28} />
            </div>
            <h1 className="font-[family:var(--font-google-sans)] font-black text-3xl uppercase tracking-tighter leading-none">
              ตะกร้าว่างเปล่า
            </h1>
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-600">
              ยังไม่มีสินค้าในตะกร้า เริ่มเลือกซื้อสินค้าได้ทันที
            </p>
            <a
              href={urls.shop}
              className="mt-6 inline-flex items-center justify-center gap-2 bg-black text-white border-4 border-black px-6 py-3 font-extrabold uppercase tracking-widest text-xs transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
              style={{ boxShadow: '4px 4px 0px 0px #000000' }}
            >
              เลือกซื้อสินค้า <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-black min-h-screen font-sans py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Poster headline ──────────────────────────────────── */}
        <header className="border-b-4 border-black pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <span className="inline-block border-2 border-black bg-black text-white px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest font-[family:var(--font-google-sans)] mb-3">
              CHECKOUT · ชำระเงิน
            </span>
            <h1 className="font-[family:var(--font-google-sans)] font-black text-4xl sm:text-5xl uppercase tracking-tighter leading-none">
              สั่งซื้อสินค้า
            </h1>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            {lines.length} รายการ · ขั้นตอนที่ {step} / 4
          </p>
        </header>

        {/* ── Stepper ──────────────────────────────────────────── */}
        <nav aria-label="ขั้นตอนการชำระเงิน">
          <ol className="grid grid-cols-4 gap-2 sm:gap-3">
            {STEPS.map((s) => {
              const completed = step > s.id;
              const active = step === s.id;
              return (
                <li
                  key={s.id}
                  className={`border-4 border-black p-3 sm:p-4 transition-all ${
                    completed ? 'bg-black text-white' : active ? 'bg-white text-black' : 'bg-gray-50 text-gray-400'
                  }`}
                  style={{
                    boxShadow: active ? '4px 4px 0px 0px #000000' : 'none',
                    background: active ? ACCENT : completed ? '#000' : undefined,
                    color: active ? '#000' : undefined,
                  }}
                  aria-current={active ? 'step' : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 border-2 ${
                        completed ? 'bg-white border-white text-black' : 'border-current'
                      } text-xs font-black font-[family:var(--font-google-sans)]`}
                    >
                      {completed ? <Check size={14} strokeWidth={3} /> : s.id}
                    </span>
                    <div className="hidden sm:block leading-tight">
                      <div className="font-[family:var(--font-google-sans)] font-extrabold text-xs uppercase tracking-widest">
                        {s.label}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                        {s.sub}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* ── 2-column body ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* MAIN COLUMN */}
          <section
            className="border-4 border-black bg-white p-6 sm:p-8"
            style={{ boxShadow: '6px 6px 0px 0px #000000' }}
            aria-labelledby="checkout-step-title"
          >
            {/* STEP 1 — Cart review */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b-4 border-black">
                  <div className="border-2 border-black bg-black text-white p-2">
                    <ShoppingBag size={18} />
                  </div>
                  <h2
                    id="checkout-step-title"
                    className="font-[family:var(--font-google-sans)] font-black text-2xl uppercase tracking-tighter leading-none"
                  >
                    ตรวจสอบตะกร้า
                  </h2>
                </div>

                <ul className="divide-y-2 divide-black border-y-2 border-black">
                  {lines.map((l) => (
                    <li key={`${l.productId}-${l.storeSlug}`} className="flex gap-4 py-4">
                      <div className="w-20 h-20 border-2 border-black bg-gray-100 flex-shrink-0 overflow-hidden">
                        {l.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={l.imageUrl}
                            alt={l.title}
                            className="w-full h-full object-cover grayscale"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
                            NO IMG
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-[family:var(--font-google-sans)] font-extrabold text-sm uppercase tracking-wider line-clamp-2">
                          {l.title}
                        </h3>
                        <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                          จำนวน × {l.qty}
                        </div>
                      </div>
                      <div className="font-[family:var(--font-google-sans)] font-black text-sm whitespace-nowrap">
                        {formatTHB(l.priceTHB * l.qty)}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <a
                    href={urls.cart}
                    className="inline-flex items-center justify-center gap-2 bg-white text-black border-4 border-black px-5 py-3 font-extrabold uppercase tracking-widest text-xs transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                    style={{ boxShadow: '4px 4px 0px 0px #000000' }}
                  >
                    <ArrowLeft size={14} /> แก้ตะกร้า
                  </a>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center justify-center gap-2 bg-black text-white border-4 border-black px-6 py-3 font-extrabold uppercase tracking-widest text-xs transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                    style={{ boxShadow: '4px 4px 0px 0px #000000' }}
                  >
                    ไปกรอกที่อยู่ <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Address */}
            {step === 2 && (
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (canAdvanceFromAddress) setStep(3);
                }}
              >
                <div className="flex items-center gap-3 pb-4 border-b-4 border-black">
                  <div className="border-2 border-black bg-black text-white p-2">
                    <MapPin size={18} />
                  </div>
                  <h2
                    id="checkout-step-title"
                    className="font-[family:var(--font-google-sans)] font-black text-2xl uppercase tracking-tighter leading-none"
                  >
                    ที่อยู่จัดส่ง
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <BrutalistField
                    label="ชื่อ-นามสกุล"
                    required
                    value={address.recipientName}
                    onChange={(v) => updateAddress('recipientName', v)}
                  />
                  <BrutalistField
                    label="เบอร์โทรศัพท์"
                    required
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    value={address.phone}
                    onChange={(v) => updateAddress('phone', v)}
                  />
                  <BrutalistField
                    className="sm:col-span-2"
                    label="ที่อยู่"
                    required
                    placeholder="บ้านเลขที่ / หมู่บ้าน / ซอย / ถนน"
                    value={address.line1}
                    onChange={(v) => updateAddress('line1', v)}
                  />
                  <BrutalistField
                    label="ตำบล / แขวง"
                    value={address.subdistrict}
                    onChange={(v) => updateAddress('subdistrict', v)}
                  />
                  <BrutalistField
                    label="อำเภอ / เขต"
                    value={address.district}
                    onChange={(v) => updateAddress('district', v)}
                  />
                  <BrutalistField
                    label="จังหวัด"
                    required
                    value={address.province}
                    onChange={(v) => updateAddress('province', v)}
                  />
                  <BrutalistField
                    label="รหัสไปรษณีย์"
                    required
                    inputMode="numeric"
                    pattern="\d{5}"
                    maxLength={5}
                    value={address.postalCode}
                    onChange={(v) => updateAddress('postalCode', v.replace(/\D/g, '').slice(0, 5))}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center justify-center gap-2 bg-white text-black border-4 border-black px-5 py-3 font-extrabold uppercase tracking-widest text-xs transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                    style={{ boxShadow: '4px 4px 0px 0px #000000' }}
                  >
                    <ArrowLeft size={14} /> กลับ
                  </button>
                  <button
                    type="submit"
                    disabled={!canAdvanceFromAddress}
                    className="inline-flex items-center justify-center gap-2 bg-black text-white border-4 border-black px-6 py-3 font-extrabold uppercase tracking-widest text-xs transition-all enabled:hover:translate-x-[2px] enabled:hover:translate-y-[2px] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    style={{
                      boxShadow: canAdvanceFromAddress ? '4px 4px 0px 0px #000000' : 'none',
                    }}
                  >
                    ไปชำระเงิน <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3 — Shipping + Payment */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b-4 border-black">
                  <div className="border-2 border-black bg-black text-white p-2">
                    <CreditCard size={18} />
                  </div>
                  <h2
                    id="checkout-step-title"
                    className="font-[family:var(--font-google-sans)] font-black text-2xl uppercase tracking-tighter leading-none"
                  >
                    วิธีจัดส่งและชำระเงิน
                  </h2>
                </div>

                {/* Shipping picker */}
                <fieldset>
                  <legend className="font-[family:var(--font-google-sans)] font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Truck size={14} /> วิธีจัดส่ง
                  </legend>
                  <div className="space-y-3" role="radiogroup" aria-label="วิธีจัดส่ง">
                    {SHIPPING_OPTIONS.map((opt) => {
                      const selected = opt.id === shippingId;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-4 border-4 border-black p-4 cursor-pointer transition-all ${
                            selected ? '' : 'bg-white hover:bg-gray-50'
                          }`}
                          style={{
                            background: selected ? ACCENT : undefined,
                            boxShadow: selected ? '4px 4px 0px 0px #000000' : 'none',
                          }}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={opt.id}
                            checked={selected}
                            onChange={() => setShippingId(opt.id)}
                            className="w-5 h-5 accent-black"
                          />
                          <div className="flex-1">
                            <div className="font-[family:var(--font-google-sans)] font-extrabold text-sm uppercase tracking-wider">
                              {opt.label}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-700">
                              {opt.desc}
                            </div>
                          </div>
                          <div className="font-[family:var(--font-google-sans)] font-black text-sm whitespace-nowrap">
                            {formatTHB(opt.priceTHB)}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Payment picker */}
                <fieldset>
                  <legend className="font-[family:var(--font-google-sans)] font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CreditCard size={14} /> ช่องทางการชำระเงิน
                  </legend>
                  <div className="space-y-3" role="radiogroup" aria-label="ช่องทางการชำระเงิน">
                    {PAYMENT_OPTIONS.map((opt) => {
                      const selected = opt.id === paymentId;
                      return (
                        <label
                          key={opt.id}
                          className="flex items-center gap-4 border-4 border-black p-4 cursor-pointer transition-all"
                          style={{
                            background: selected ? ACCENT : '#fff',
                            boxShadow: selected ? '4px 4px 0px 0px #000000' : 'none',
                          }}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={opt.id}
                            checked={selected}
                            onChange={() => setPaymentId(opt.id)}
                            className="w-5 h-5 accent-black"
                          />
                          <div className="flex-1">
                            <div className="font-[family:var(--font-google-sans)] font-extrabold text-sm uppercase tracking-wider">
                              {opt.label}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-700">
                              {opt.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center justify-center gap-2 bg-white text-black border-4 border-black px-5 py-3 font-extrabold uppercase tracking-widest text-xs transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                    style={{ boxShadow: '4px 4px 0px 0px #000000' }}
                  >
                    <ArrowLeft size={14} /> กลับ
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center justify-center gap-2 bg-black text-white border-4 border-black px-6 py-3 font-extrabold uppercase tracking-widest text-xs transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                    style={{ boxShadow: '4px 4px 0px 0px #000000' }}
                  >
                    ตรวจสอบและยืนยัน <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 — Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b-4 border-black">
                  <div className="border-2 border-black bg-black text-white p-2">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <h2
                    id="checkout-step-title"
                    className="font-[family:var(--font-google-sans)] font-black text-2xl uppercase tracking-tighter leading-none"
                  >
                    ยืนยันคำสั่งซื้อ
                  </h2>
                </div>

                {/* Address summary */}
                <div className="border-4 border-black p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                        จัดส่งถึง
                      </div>
                      <div className="mt-1 font-[family:var(--font-google-sans)] font-black text-sm uppercase tracking-wider">
                        {address.recipientName}
                      </div>
                      <div className="mt-1 text-xs font-medium leading-relaxed">
                        {[address.line1, address.subdistrict, address.district].filter(Boolean).join(' ')}
                        <br />
                        {address.province} {address.postalCode}
                        <br />
                        โทร {address.phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-[10px] font-extrabold uppercase tracking-widest underline underline-offset-4 hover:no-underline"
                    >
                      แก้ไข
                    </button>
                  </div>
                </div>

                {/* Shipping + payment summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-4 border-black p-4">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                      จัดส่งโดย
                    </div>
                    <div className="mt-1 font-[family:var(--font-google-sans)] font-black text-sm uppercase tracking-wider">
                      {shipping.label}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-gray-700">
                      {shipping.desc} · {formatTHB(shipping.priceTHB)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="mt-2 text-[10px] font-extrabold uppercase tracking-widest underline underline-offset-4 hover:no-underline"
                    >
                      เปลี่ยน
                    </button>
                  </div>
                  <div className="border-4 border-black p-4">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                      ชำระด้วย
                    </div>
                    <div className="mt-1 font-[family:var(--font-google-sans)] font-black text-sm uppercase tracking-wider">
                      {payment.label}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-gray-700">
                      {payment.desc}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="mt-2 text-[10px] font-extrabold uppercase tracking-widest underline underline-offset-4 hover:no-underline"
                    >
                      เปลี่ยน
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    className="border-4 border-black bg-white p-4 flex items-start gap-3"
                    style={{ boxShadow: '4px 4px 0px 0px #000000' }}
                    role="alert"
                  >
                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                    <div className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                      {error}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 bg-white text-black border-4 border-black px-5 py-3 font-extrabold uppercase tracking-widest text-xs transition-all enabled:hover:translate-x-[2px] enabled:hover:translate-y-[2px] disabled:opacity-50"
                    style={{ boxShadow: '4px 4px 0px 0px #000000' }}
                  >
                    <ArrowLeft size={14} /> กลับ
                  </button>
                  <button
                    type="button"
                    onClick={placeOrder}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 border-4 border-black px-6 py-3 font-extrabold uppercase tracking-widest text-xs transition-all enabled:hover:translate-x-[2px] enabled:hover:translate-y-[2px] disabled:opacity-60"
                    style={{
                      background: submitting ? '#000' : ACCENT,
                      color: '#000',
                      boxShadow: '4px 4px 0px 0px #000000',
                    }}
                  >
                    <Lock size={14} />
                    {submitting ? 'กำลังสร้างออเดอร์…' : `ยืนยัน · ${formatTHB(total)}`}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* SUMMARY COLUMN */}
          <aside
            className="border-4 border-black bg-white p-6 self-start sticky top-24"
            style={{ boxShadow: '6px 6px 0px 0px #000000' }}
            aria-label="สรุปคำสั่งซื้อ"
          >
            <h2 className="font-[family:var(--font-google-sans)] font-black text-xl uppercase tracking-tighter leading-none pb-3 border-b-4 border-black">
              สรุปยอด
            </h2>

            <div className="mt-4 space-y-3 text-xs font-bold uppercase tracking-widest">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600">ราคาสินค้า</span>
                <span className="font-[family:var(--font-google-sans)] font-black text-sm normal-case tracking-normal">
                  {formatTHB(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600">
                  ค่าจัดส่ง · {shipping.label}
                </span>
                <span className="font-[family:var(--font-google-sans)] font-black text-sm normal-case tracking-normal">
                  {formatTHB(shipping.priceTHB)}
                </span>
              </div>
            </div>

            <div
              className="mt-4 border-t-4 border-black pt-4 flex justify-between items-baseline"
              style={{ background: ACCENT, margin: '16px -24px -24px', padding: '16px 24px 24px' }}
            >
              <span className="font-[family:var(--font-google-sans)] font-black text-sm uppercase tracking-widest">
                ยอดรวม
              </span>
              <span className="font-[family:var(--font-google-sans)] font-black text-2xl tracking-tighter">
                {formatTHB(total)}
              </span>
            </div>
          </aside>
        </div>

        {/* ── Trust footer strip ───────────────────────────────── */}
        <div
          className="border-4 border-black bg-black text-white p-4 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest font-[family:var(--font-google-sans)]"
          style={{ boxShadow: '4px 4px 0px 0px #000000' }}
        >
          <Lock size={12} />
          ชำระเงินปลอดภัย · เข้ารหัส SSL · มาตรฐาน PCI-DSS · ไม่เก็บข้อมูลบัตรในระบบ
        </div>
      </div>
    </main>
  );
}

// ── Reusable brutalist input field ────────────────────────────────
interface BrutalistFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  pattern?: string;
  maxLength?: number;
}

function BrutalistField({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
  className = '',
  inputMode,
  pattern,
  maxLength,
}: BrutalistFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5 font-[family:var(--font-google-sans)]">
        {label}
        {required && <span className="ml-1 text-black">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        className="w-full border-4 border-black bg-white px-3 py-2.5 text-sm font-bold focus:outline-none focus:bg-[#FFFEEA] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
        style={{
          boxShadow: '3px 3px 0px 0px #000000',
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = '1px 1px 0px 0px #000000';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000';
        }}
      />
    </label>
  );
}

export default Checkout;
