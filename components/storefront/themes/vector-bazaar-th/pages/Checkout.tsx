'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Check,
  Sparkles,
  ChevronRight,
  Download,
  FileImage,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

type StepId = 'cart' | 'address' | 'payment' | 'confirm';

interface StepDef {
  id: StepId;
  title: string;
  icon: typeof ShoppingCart;
  color: string;
}

const STEPS: StepDef[] = [
  { id: 'cart', title: 'ตะกร้า', icon: ShoppingCart, color: '#F472B6' },
  { id: 'address', title: 'ที่อยู่', icon: MapPin, color: '#FBBF24' },
  { id: 'payment', title: 'ชำระเงิน', icon: CreditCard, color: '#60A5FA' },
  { id: 'confirm', title: 'ยืนยัน', icon: Check, color: '#34D399' },
];

const SHIPPING_OPTIONS = [
  { id: 'EMS', name: 'EMS · 1-2 วันทำการ', priceTHB: 50, icon: Sparkles },
  { id: 'REGISTERED', name: 'ลงทะเบียน · 3-5 วันทำการ', priceTHB: 30, icon: MapPin },
];

const PAYMENT_METHODS = [
  { id: 'promptpay', label: 'พร้อมเพย์ (PromptPay)' },
  { id: 'transfer', label: 'โอนผ่านธนาคาร' },
  { id: 'cod', label: 'เก็บปลายทาง (COD)' },
];

const FREE_SHIPPING_THRESHOLD = 990;

export default function Checkout({ store }: { store: StoreLite }) {
  const router = useRouter();
  const allLines = useCart((s) => s.lines);
  const clearStore = useCart((s) => s.clearStore);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  const [step, setStep] = useState<StepId>('cart');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    addressLine: '',
    subdistrict: '',
    district: '',
    province: '',
    postalCode: '',
    note: '',
  });
  const [shipping, setShipping] = useState(SHIPPING_OPTIONS[0].id);
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD
    ? 0
    : SHIPPING_OPTIONS.find((s) => s.id === shipping)?.priceTHB ?? 50;
  const total = subtotal + shippingFee;

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const canNext =
    step === 'cart' ? lines.length > 0 :
    step === 'address'
      ? !!form.name && !!form.phone && !!form.addressLine && !!form.province && !!form.postalCode
      : step === 'payment' ? !!shipping && !!payment
      : false;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storeSlug: store.slug,
          items: lines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
            priceTHB: l.priceTHB,
            title: l.title,
            imageUrl: l.imageUrl,
          })),
          shipping: { method: shipping, feeTHB: shippingFee },
          payment: { method: payment },
          customer: form,
        }),
      });
      const data = await res.json();
      if (data?.ok && data?.orderId) {
        clearStore(store.slug);
        router.push(`/stores/${store.slug}/checkout/confirm?orderId=${data.orderId}`);
      } else {
        setError(data?.error ?? 'ไม่สามารถสร้างคำสั่งซื้อได้');
        setSubmitting(false);
      }
    } catch {
      setError('เครือข่ายไม่ตอบสนอง ลองอีกครั้ง');
      setSubmitting(false);
    }
  }

  if (lines.length === 0 && step === 'cart') {
    return (
      <div className="bg-[#FEFCE8] min-h-screen text-[#1E1B4B] font-[family:var(--font-prompt)] flex items-center justify-center px-4 py-20">
        <div className="text-center bg-white rounded-3xl border border-[#FBCFE8] shadow-[0_16px_48px_-16px_rgba(244,114,182,0.35)] p-10 max-w-md w-full">
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-black mb-2">
            ตะกร้าว่าง
          </h1>
          <p className="text-sm text-[#6366F1] mb-6">
            ยังไม่มีผลงานในตะกร้า ลองเลือกซื้อก่อนนะ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#F472B6] text-white font-[family:var(--font-kanit)] font-black text-sm hover:bg-[#EC4899] transition-colors vb-glow-primary"
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
      {/* Header */}
      <section className="relative overflow-hidden vb-rainbow-bg border-b border-[#FBCFE8]">
        <div className="absolute inset-0 vb-confetti opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#FBCFE8] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#DB2777] font-[family:var(--font-kanit)] mb-3">
            <CreditCard className="w-3.5 h-3.5" />
            ขั้นตอนที่ {currentStepIndex + 1} จาก {STEPS.length}
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-black tracking-tight">
            <span className="vb-rainbow-text">ชำระเงิน</span>
          </h1>
        </div>
      </section>

      {/* Stepper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <ol className="grid grid-cols-4 gap-2 sm:gap-3">
          {STEPS.map((s, i) => {
            const done = i < currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <li
                key={s.id}
                className={`rounded-2xl p-3 sm:p-4 text-center transition-all ${
                  active
                    ? 'text-white shadow-md scale-[1.02]'
                    : done
                    ? 'bg-white text-[#1E1B4B] border border-[#FBCFE8]'
                    : 'bg-white/60 text-[#6366F1]/50 border border-[#FBCFE8]/60'
                }`}
                style={active ? { backgroundColor: s.color } : undefined}
              >
                <s.icon className="w-5 h-5 mx-auto mb-1" />
                <p className="font-[family:var(--font-kanit)] font-black text-[10px] sm:text-xs uppercase tracking-widest">
                  {s.title}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[1fr_380px] gap-8">
        <main className="space-y-6">
          {/* Step 1: Cart review */}
          {step === 'cart' && (
            <div className="rounded-3xl bg-white border border-[#FBCFE8] p-5 sm:p-6 space-y-3">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl mb-2 border-b border-[#FBCFE8] pb-3">
                ตรวจสอบผลงาน
              </h2>
              {lines.map((l) => (
                <div
                  key={l.productId}
                  className="flex gap-3 items-center rounded-2xl bg-[#FEFCE8]/60 border border-[#FBCFE8] p-3"
                >
                  <div className="w-16 h-16 shrink-0 rounded-xl vb-checker border border-[#FBCFE8] overflow-hidden relative">
                    {l.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.imageUrl} alt={l.title} className="absolute inset-0 w-full h-full object-contain p-1.5" />
                    ) : (
                      <FileImage className="absolute inset-0 m-auto w-6 h-6 text-[#F472B6]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[family:var(--font-kanit)] font-bold text-sm line-clamp-2">{l.title}</p>
                    <p className="text-xs text-[#6366F1] mt-1">x{l.qty}</p>
                  </div>
                  <p className="font-[family:var(--font-kanit)] font-black text-[#DB2777] shrink-0">
                    {formatTHB(l.priceTHB * l.qty)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Address */}
          {step === 'address' && (
            <div className="rounded-3xl bg-white border border-[#FBCFE8] p-5 sm:p-6 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl mb-2 border-b border-[#FBCFE8] pb-3">
                ที่อยู่จัดส่ง
              </h2>
              <Field label="ชื่อ-นามสกุล" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="เบอร์โทรศัพท์" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
              <Field label="ที่อยู่ (เลขที่ / ถนน)" value={form.addressLine} onChange={(v) => setForm({ ...form, addressLine: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="ตำบล / แขวง" value={form.subdistrict} onChange={(v) => setForm({ ...form, subdistrict: v })} />
                <Field label="อำเภอ / เขต" value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="จังหวัด" value={form.province} onChange={(v) => setForm({ ...form, province: v })} />
                <Field label="รหัสไปรษณีย์" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} />
              </div>
              <Field
                label="หมายเหตุ (ถ้ามี)"
                value={form.note}
                onChange={(v) => setForm({ ...form, note: v })}
                optional
              />
            </div>
          )}

          {/* Step 3: Payment + Shipping */}
          {step === 'payment' && (
            <div className="rounded-3xl bg-white border border-[#FBCFE8] p-5 sm:p-6 space-y-6">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl border-b border-[#FBCFE8] pb-3">
                การจัดส่ง &amp; การชำระเงิน
              </h2>

              <fieldset className="space-y-2">
                <legend className="font-[family:var(--font-kanit)] font-black text-xs tracking-widest uppercase text-[#6366F1] mb-1">
                  วิธีจัดส่ง
                </legend>
                {SHIPPING_OPTIONS.map((opt) => {
                  const active = shipping === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 cursor-pointer transition-all ${
                        active
                          ? 'bg-[#FCE7F3] border-2 border-[#F472B6] vb-glow-primary'
                          : 'bg-[#FEFCE8]/60 border border-[#FBCFE8] hover:bg-[#FCE7F3]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={opt.id}
                          checked={active}
                          onChange={() => setShipping(opt.id)}
                          className="w-4 h-4 accent-[#F472B6]"
                        />
                        <span className="font-[family:var(--font-kanit)] font-bold text-sm">
                          {opt.name}
                        </span>
                      </div>
                      <span className="font-[family:var(--font-kanit)] font-black">
                        {subtotal >= FREE_SHIPPING_THRESHOLD ? 'ฟรี' : formatTHB(opt.priceTHB)}
                      </span>
                    </label>
                  );
                })}
              </fieldset>

              <fieldset className="space-y-2 pt-2 border-t border-[#FBCFE8]">
                <legend className="font-[family:var(--font-kanit)] font-black text-xs tracking-widest uppercase text-[#6366F1] mb-1 pt-3">
                  วิธีชำระเงิน
                </legend>
                {PAYMENT_METHODS.map((m) => {
                  const active = payment === m.id;
                  return (
                    <label
                      key={m.id}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer transition-all ${
                        active
                          ? 'bg-[#DBEAFE] border-2 border-[#60A5FA] vb-glow-accent'
                          : 'bg-[#FEFCE8]/60 border border-[#FBCFE8] hover:bg-[#DBEAFE]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={active}
                        onChange={() => setPayment(m.id)}
                        className="w-4 h-4 accent-[#60A5FA]"
                      />
                      <span className="font-[family:var(--font-kanit)] font-bold text-sm">
                        {m.label}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div className="rounded-3xl bg-white border border-[#FBCFE8] p-5 sm:p-6 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl border-b border-[#FBCFE8] pb-3">
                ยืนยันคำสั่งซื้อ
              </h2>
              <Summary label="ผู้รับ" value={`${form.name} · ${form.phone}`} />
              <Summary
                label="ที่อยู่"
                value={[form.addressLine, form.subdistrict, form.district, form.province, form.postalCode].filter(Boolean).join(' ')}
              />
              <Summary
                label="วิธีจัดส่ง"
                value={SHIPPING_OPTIONS.find((s) => s.id === shipping)?.name ?? '-'}
              />
              <Summary
                label="วิธีชำระเงิน"
                value={PAYMENT_METHODS.find((m) => m.id === payment)?.label ?? '-'}
              />
              {form.note && <Summary label="หมายเหตุ" value={form.note} />}
              {error && (
                <div className="rounded-2xl bg-[#FEE2E2] border border-[#F87171] text-[#B91C1C] px-4 py-3 text-sm font-bold">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex gap-3">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStep(STEPS[currentStepIndex - 1].id)}
                disabled={submitting}
                className="h-12 px-6 rounded-full bg-white border border-[#FBCFE8] text-[#1E1B4B] font-[family:var(--font-kanit)] font-bold text-sm hover:bg-[#FCE7F3] active:scale-95 transition-all"
              >
                ← ย้อนกลับ
              </button>
            )}
            {step !== 'confirm' ? (
              <button
                type="button"
                onClick={() => canNext && setStep(STEPS[currentStepIndex + 1].id)}
                disabled={!canNext}
                className="flex-1 h-12 px-6 rounded-full bg-[#F472B6] text-white font-[family:var(--font-kanit)] font-black text-sm vb-glow-primary hover:bg-[#EC4899] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                ถัดไป <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-14 px-6 rounded-full bg-gradient-to-r from-[#F472B6] via-[#FBBF24] to-[#60A5FA] text-white font-[family:var(--font-kanit)] font-black text-base vb-glow-primary hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {submitting ? 'กำลังบันทึก…' : 'ยืนยันคำสั่งซื้อ'}
              </button>
            )}
          </div>
        </main>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-24 self-start space-y-4">
          <div className="rounded-3xl bg-white border border-[#FBCFE8] p-5 shadow-[0_8px_32px_-12px_rgba(244,114,182,0.35)] space-y-4">
            <h3 className="font-[family:var(--font-kanit)] font-black text-xl">สรุปคำสั่งซื้อ</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-[#6366F1] text-xs uppercase tracking-widest font-bold">ยอดสินค้า</span>
                <span className="font-bold text-[#1E1B4B]">{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#6366F1] text-xs uppercase tracking-widest font-bold">ค่าจัดส่ง</span>
                <span className={`font-bold ${shippingFee === 0 ? 'text-[#047857]' : 'text-[#1E1B4B]'}`}>
                  {shippingFee === 0 ? 'ฟรี' : formatTHB(shippingFee)}
                </span>
              </div>
            </div>
            <div className="border-t border-[#FBCFE8] pt-4 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-black">รวม</span>
              <span className="font-[family:var(--font-kanit)] font-black text-2xl vb-rainbow-text">
                {formatTHB(total)}
              </span>
            </div>
          </div>
          <div className="rounded-3xl bg-[#FCE7F3] border border-[#FBCFE8] p-4 flex items-start gap-3 text-xs">
            <Download className="w-4 h-4 text-[#DB2777] shrink-0 mt-0.5" />
            <p className="text-[#1E1B4B]/80 leading-relaxed">
              ดาวน์โหลดได้ทันทีหลังชำระเงิน · ใบอนุญาตเชิงพาณิชย์รวมมาด้วยฟรี
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-[family:var(--font-kanit)] font-black text-xs tracking-widest uppercase mb-1.5 text-[#6366F1]">
        {label} {optional && <span className="text-[#A78BFA] font-bold normal-case">(ไม่บังคับ)</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#FBCFE8] bg-[#FEFCE8]/40 px-4 py-2.5 text-sm font-medium text-[#1E1B4B] focus:outline-none focus:bg-white focus:border-[#F472B6] focus:ring-2 focus:ring-[#F472B6]/30 transition-all"
      />
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
      <span className="font-[family:var(--font-kanit)] font-black text-xs tracking-widest uppercase text-[#6366F1] shrink-0 w-28">
        {label}
      </span>
      <span className="font-bold text-sm text-[#1E1B4B]">{value}</span>
    </div>
  );
}
