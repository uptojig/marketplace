'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
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
  { id: 'cart', title: 'ตะกร้า', icon: ShoppingCart, color: '#1E3A8A' },
  { id: 'address', title: 'ที่อยู่', icon: MapPin, color: '#B45309' },
  { id: 'payment', title: 'ชำระเงิน', icon: CreditCard, color: '#0F766E' },
  { id: 'confirm', title: 'ยืนยัน', icon: Check, color: '#15803D' },
];

const SHIPPING_OPTIONS = [
  { id: 'EMS', name: 'EMS · 1-2 วันทำการ', priceTHB: 50, icon: CheckCircle2 },
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
      <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] font-[family:var(--font-prompt)] flex items-center justify-center px-4 py-20">
        <div className="text-center bg-white rounded-2xl border border-[#CBD5E1] shadow-[0_16px_48px_-16px_rgba(30,58,138,0.25)] p-10 max-w-md w-full">
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-bold mb-2 tracking-tight">
            ตะกร้าว่าง
          </h1>
          <p className="text-sm text-[#475569] mb-6">
            ยังไม่มีเทมเพลตในตะกร้า ลองเลือกซื้อก่อนนะ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md bg-[#1E3A8A] text-white font-[family:var(--font-kanit)] font-semibold text-sm hover:bg-[#1E40AF] transition-colors rf-glow-primary"
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
            <CreditCard className="w-3.5 h-3.5 text-[#B45309]" />
            ขั้นตอนที่ {currentStepIndex + 1} จาก {STEPS.length}
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight">
            <span className="rf-gradient-text">ชำระเงิน</span>
          </h1>
          <span className="rf-rule mt-3" aria-hidden />
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
                className={`rounded-md p-3 sm:p-4 text-center transition-all border ${
                  active
                    ? 'text-white shadow-md scale-[1.02] border-transparent'
                    : done
                    ? 'bg-white text-[#0F172A] border-[#CBD5E1]'
                    : 'bg-white/60 text-[#94A3B8] border-[#E2E8F0]'
                }`}
                style={active ? { backgroundColor: s.color } : undefined}
              >
                <s.icon className="w-5 h-5 mx-auto mb-1" />
                <p className="font-[family:var(--font-kanit)] font-bold text-[10px] sm:text-xs uppercase tracking-[0.18em]">
                  {s.title}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[1fr_380px] gap-8">
        <main className="space-y-6">
          {step === 'cart' && (
            <div className="rounded-xl bg-white border border-[#CBD5E1] p-5 sm:p-6 space-y-3">
              <h2 className="font-[family:var(--font-kanit)] font-bold text-xl mb-2 border-b border-[#E2E8F0] pb-3 tracking-tight">
                ตรวจสอบเทมเพลต
              </h2>
              {lines.map((l) => (
                <div
                  key={l.productId}
                  className="flex gap-3 items-center rounded-md bg-[#F8FAFC] border border-[#E2E8F0] p-3"
                >
                  <div className="w-16 h-20 shrink-0 rounded-md bg-white border border-[#E2E8F0] overflow-hidden relative">
                    {l.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.imageUrl} alt={l.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <FileText className="absolute inset-0 m-auto w-6 h-6 text-[#1E3A8A]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[family:var(--font-kanit)] font-bold text-sm line-clamp-2">{l.title}</p>
                    <p className="text-xs text-[#475569] mt-1">x{l.qty}</p>
                  </div>
                  <p className="font-[family:var(--font-kanit)] font-bold text-[#1E3A8A] shrink-0">
                    {formatTHB(l.priceTHB * l.qty)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {step === 'address' && (
            <div className="rounded-xl bg-white border border-[#CBD5E1] p-5 sm:p-6 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-bold text-xl mb-2 border-b border-[#E2E8F0] pb-3 tracking-tight">
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

          {step === 'payment' && (
            <div className="rounded-xl bg-white border border-[#CBD5E1] p-5 sm:p-6 space-y-6">
              <h2 className="font-[family:var(--font-kanit)] font-bold text-xl border-b border-[#E2E8F0] pb-3 tracking-tight">
                การจัดส่ง &amp; การชำระเงิน
              </h2>

              <fieldset className="space-y-2">
                <legend className="font-[family:var(--font-kanit)] font-bold text-[11px] tracking-[0.2em] uppercase text-[#475569] mb-1">
                  วิธีจัดส่ง
                </legend>
                {SHIPPING_OPTIONS.map((opt) => {
                  const active = shipping === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between gap-3 rounded-md px-4 py-3 cursor-pointer transition-all border ${
                        active
                          ? 'bg-[#DBEAFE] border-[#1E3A8A] rf-glow-primary'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#DBEAFE]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={opt.id}
                          checked={active}
                          onChange={() => setShipping(opt.id)}
                          className="w-4 h-4 accent-[#1E3A8A]"
                        />
                        <span className="font-[family:var(--font-kanit)] font-semibold text-sm">
                          {opt.name}
                        </span>
                      </div>
                      <span className="font-[family:var(--font-kanit)] font-bold">
                        {subtotal >= FREE_SHIPPING_THRESHOLD ? 'ฟรี' : formatTHB(opt.priceTHB)}
                      </span>
                    </label>
                  );
                })}
              </fieldset>

              <fieldset className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                <legend className="font-[family:var(--font-kanit)] font-bold text-[11px] tracking-[0.2em] uppercase text-[#475569] mb-1 pt-3">
                  วิธีชำระเงิน
                </legend>
                {PAYMENT_METHODS.map((m) => {
                  const active = payment === m.id;
                  return (
                    <label
                      key={m.id}
                      className={`flex items-center gap-3 rounded-md px-4 py-3 cursor-pointer transition-all border ${
                        active
                          ? 'bg-[#FEF3C7] border-[#B45309] rf-glow-accent'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#FEF3C7]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={active}
                        onChange={() => setPayment(m.id)}
                        className="w-4 h-4 accent-[#B45309]"
                      />
                      <span className="font-[family:var(--font-kanit)] font-semibold text-sm">
                        {m.label}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            </div>
          )}

          {step === 'confirm' && (
            <div className="rounded-xl bg-white border border-[#CBD5E1] p-5 sm:p-6 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-bold text-xl border-b border-[#E2E8F0] pb-3 tracking-tight">
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
                <div className="rounded-md bg-[#FEE2E2] border border-[#FCA5A5] text-[#B91C1C] px-4 py-3 text-sm font-bold">
                  {error}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStep(STEPS[currentStepIndex - 1].id)}
                disabled={submitting}
                className="h-11 px-6 rounded-md bg-white border border-[#CBD5E1] text-[#0F172A] font-[family:var(--font-kanit)] font-semibold text-sm hover:bg-[#E2E8F0] active:scale-95 transition-all"
              >
                ← ย้อนกลับ
              </button>
            )}
            {step !== 'confirm' ? (
              <button
                type="button"
                onClick={() => canNext && setStep(STEPS[currentStepIndex + 1].id)}
                disabled={!canNext}
                className="flex-1 h-11 px-6 rounded-md bg-[#1E3A8A] text-white font-[family:var(--font-kanit)] font-semibold text-sm rf-glow-primary hover:bg-[#1E40AF] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                ถัดไป <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-12 px-6 rounded-md bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-[#B45309] text-white font-[family:var(--font-kanit)] font-bold text-base rf-glow-primary hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {submitting ? 'กำลังบันทึก…' : 'ยืนยันคำสั่งซื้อ'}
              </button>
            )}
          </div>
        </main>

        <aside className="lg:sticky lg:top-24 self-start space-y-4">
          <div className="rounded-xl bg-white border border-[#CBD5E1] p-5 shadow-[0_8px_32px_-12px_rgba(30,58,138,0.18)] space-y-4">
            <h3 className="font-[family:var(--font-kanit)] font-bold text-xl tracking-tight">สรุปคำสั่งซื้อ</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-[#475569] text-xs uppercase tracking-[0.18em] font-bold">ยอดสินค้า</span>
                <span className="font-bold text-[#0F172A]">{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#475569] text-xs uppercase tracking-[0.18em] font-bold">ค่าจัดส่ง</span>
                <span className={`font-bold ${shippingFee === 0 ? 'text-[#15803D]' : 'text-[#0F172A]'}`}>
                  {shippingFee === 0 ? 'ฟรี' : formatTHB(shippingFee)}
                </span>
              </div>
            </div>
            <div className="border-t border-[#E2E8F0] pt-4 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-bold tracking-tight">รวม</span>
              <span className="font-[family:var(--font-kanit)] font-bold text-2xl rf-gradient-text">
                {formatTHB(total)}
              </span>
            </div>
          </div>
          <div className="rounded-xl rf-ats-chip p-4 flex items-start gap-3 text-xs">
            <Download className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              ดาวน์โหลดได้ทันทีหลังชำระเงิน · ผ่าน ATS ทุกระบบ
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
      <span className="block font-[family:var(--font-kanit)] font-bold text-[11px] tracking-[0.2em] uppercase mb-1.5 text-[#475569]">
        {label} {optional && <span className="text-[#94A3B8] font-semibold normal-case">(ไม่บังคับ)</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5 text-sm font-medium text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
      />
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
      <span className="font-[family:var(--font-kanit)] font-bold text-[11px] tracking-[0.2em] uppercase text-[#475569] shrink-0 w-28">
        {label}
      </span>
      <span className="font-semibold text-sm text-[#0F172A]">{value}</span>
    </div>
  );
}
