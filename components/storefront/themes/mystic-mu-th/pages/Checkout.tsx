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
  Coins,
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
}

const STEPS: StepDef[] = [
  { id: 'cart', title: 'ตะกร้า', icon: ShoppingCart },
  { id: 'address', title: 'ที่อยู่', icon: MapPin },
  { id: 'payment', title: 'ชำระเงิน', icon: CreditCard },
  { id: 'confirm', title: 'ยืนยัน', icon: Check },
];

const SHIPPING_OPTIONS = [
  { id: 'DOWNLOAD', name: 'ดาวน์โหลดทันที · ฟรี', priceTHB: 0 },
  { id: 'EMS', name: 'EMS (พิมพ์โปสเตอร์) · 1-2 วัน', priceTHB: 80 },
  { id: 'REGISTERED', name: 'ลงทะเบียน (พิมพ์โปสเตอร์) · 3-5 วัน', priceTHB: 50 },
];

const FREE_SHIPPING_THRESHOLD = 990;

/**
 * MysticMu Checkout — Mario "warp pipe" 4-step flow. Stepper top,
 * step content card center, sticky summary sidebar right. Posts to
 * /api/checkout on confirm.
 */
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
    email: '',
    addressLine: '',
    subdistrict: '',
    district: '',
    province: '',
    postalCode: '',
    note: '',
  });
  const [shipping, setShipping] = useState(SHIPPING_OPTIONS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const shippingChoice = SHIPPING_OPTIONS.find((s) => s.id === shipping);
  const shippingFee =
    shippingChoice?.priceTHB === 0
      ? 0
      : subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : shippingChoice?.priceTHB ?? 50;
  const total = subtotal + shippingFee;

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const canNext =
    step === 'cart'
      ? lines.length > 0
      : step === 'address'
      ? !!form.name && !!form.phone && !!form.email
      : step === 'payment'
      ? !!shipping
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
      <div className="bg-[#5C94FC] min-h-screen text-[#1A1A2E] font-[family:var(--font-prompt)] flex items-center justify-center px-4 py-20">
        <div className="text-center bg-white border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-10 max-w-md w-full">
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-black uppercase tracking-tight mb-3">
            ตะกร้าว่าง
          </h1>
          <p className="text-sm font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-[#4A4A6E] mb-4">
            มูได้ที่ไหนเอ่ย?
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex h-12 px-6 mt-2 items-center justify-center bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            มูเลย
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#5C94FC] text-[#1A1A2E] font-[family:var(--font-prompt)] min-h-screen pb-12">
      {/* Header */}
      <section className="bg-[#009A4E] border-b-4 border-[#1A1A2E] px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-4 py-1 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] mb-3 font-[family:var(--font-kanit)]">
            <Coins className="w-3.5 h-3.5 text-[#E52521]" />
            Warp Pipe · Step {currentStepIndex + 1}/{STEPS.length}
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0_#1A1A2E]">
            ชำระเงิน
          </h1>
        </div>
      </section>

      {/* Stepper */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => {
            const done = i < currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <div
                key={s.id}
                className={`border-4 border-[#1A1A2E] p-3 text-center ${
                  active
                    ? 'bg-[#E52521] text-white shadow-[4px_4px_0_0_#1A1A2E]'
                    : done
                    ? 'bg-[#009A4E] text-white'
                    : 'bg-white text-[#4A4A6E]'
                }`}
              >
                <s.icon className="w-5 h-5 mx-auto mb-1" />
                <p className="font-[family:var(--font-kanit)] font-black uppercase text-[10px] tracking-widest">
                  {s.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        <main className="space-y-6">
          {/* Step 1: Cart */}
          {step === 'cart' && (
            <div className="bg-white border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight mb-4 border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#E52521]" />
                ตรวจสอบสินค้า
              </h2>
              <div className="space-y-3">
                {lines.map((l) => (
                  <div
                    key={l.productId}
                    className="flex gap-3 items-center border-4 border-[#1A1A2E] bg-[#FFF8DC] p-3"
                  >
                    <div className="w-16 h-16 shrink-0 border-4 border-[#1A1A2E] bg-[#E8E8F0] overflow-hidden relative">
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#FFD700]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-[family:var(--font-kanit)] font-black uppercase tracking-tight text-sm line-clamp-2">
                        {l.title}
                      </p>
                      <p className="text-xs font-bold text-[#4A4A6E] mt-1">x{l.qty}</p>
                    </div>
                    <p className="font-[family:var(--font-kanit)] font-black text-[#E52521] shrink-0">
                      {formatTHB(l.priceTHB * l.qty)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 'address' && (
            <div className="bg-white border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight mb-4 border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E52521]" />
                ที่อยู่ + ข้อมูลติดต่อ
              </h2>
              <p className="text-xs font-[family:var(--font-kanit)] font-black uppercase tracking-widest bg-[#FFF8DC] border-4 border-[#1A1A2E] p-3">
                ⭐ สินค้าดิจิทัล: ลิงก์ดาวน์โหลดจะส่งเข้าอีเมล กรอกที่อยู่เฉพาะกรณีต้องการพิมพ์เป็นโปสเตอร์
              </p>
              <Field
                label="ชื่อ-นามสกุล"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="เบอร์โทรศัพท์"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  type="tel"
                  required
                />
                <Field
                  label="อีเมล"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  type="email"
                  required
                />
              </div>
              <Field
                label="ที่อยู่ (สำหรับโปสเตอร์)"
                value={form.addressLine}
                onChange={(v) => setForm({ ...form, addressLine: v })}
                optional
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="ตำบล / แขวง"
                  value={form.subdistrict}
                  onChange={(v) => setForm({ ...form, subdistrict: v })}
                  optional
                />
                <Field
                  label="อำเภอ / เขต"
                  value={form.district}
                  onChange={(v) => setForm({ ...form, district: v })}
                  optional
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="จังหวัด"
                  value={form.province}
                  onChange={(v) => setForm({ ...form, province: v })}
                  optional
                />
                <Field
                  label="รหัสไปรษณีย์"
                  value={form.postalCode}
                  onChange={(v) => setForm({ ...form, postalCode: v })}
                  optional
                />
              </div>
              <Field
                label="หมายเหตุ"
                value={form.note}
                onChange={(v) => setForm({ ...form, note: v })}
                optional
              />
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <div className="bg-white border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight mb-4 border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#E52521]" />
                จัดส่ง + การชำระเงิน
              </h2>
              <div className="space-y-2">
                <p className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest">
                  วิธีจัดส่ง
                </p>
                {SHIPPING_OPTIONS.map((opt) => {
                  const active = shipping === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setShipping(opt.id)}
                      className={`w-full text-left px-4 py-3 border-4 flex items-center justify-between active:translate-x-1 active:translate-y-1 transition-transform ${
                        active
                          ? 'border-[#1A1A2E] bg-[#E52521] text-white shadow-[4px_4px_0_0_#1A1A2E]'
                          : 'border-[#1A1A2E] bg-white hover:bg-[#FFD700]'
                      }`}
                    >
                      <span className="font-[family:var(--font-kanit)] font-black uppercase text-sm">
                        {opt.name}
                      </span>
                      <span className="font-[family:var(--font-kanit)] font-black text-sm">
                        {opt.priceTHB === 0
                          ? 'ฟรี'
                          : subtotal >= FREE_SHIPPING_THRESHOLD
                          ? 'ฟรี'
                          : formatTHB(opt.priceTHB)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 pt-4 border-t-4 border-[#1A1A2E]">
                <p className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest">
                  วิธีชำระเงิน
                </p>
                <div className="px-4 py-3 border-4 border-[#1A1A2E] bg-[#FFD700] font-[family:var(--font-kanit)] font-black uppercase text-sm shadow-[3px_3px_0_0_#1A1A2E]">
                  ⭐ ชำระผ่าน AnyPay (พร้อมเพย์ / โอน / บัตรเครดิต)
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div className="bg-white border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight mb-4 border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-[#009A4E]" />
                ยืนยันคำสั่งซื้อ
              </h2>
              <Summary label="ผู้รับ" value={`${form.name} · ${form.phone}`} />
              <Summary label="อีเมลส่งไฟล์" value={form.email} />
              {form.addressLine && (
                <Summary
                  label="ที่อยู่"
                  value={[
                    form.addressLine,
                    form.subdistrict,
                    form.district,
                    form.province,
                    form.postalCode,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )}
              <Summary
                label="วิธีจัดส่ง"
                value={SHIPPING_OPTIONS.find((s) => s.id === shipping)?.name ?? '-'}
              />
              {form.note && <Summary label="หมายเหตุ" value={form.note} />}
              {error && (
                <div className="border-4 border-[#E52521] bg-[#FFF0F0] text-[#E52521] p-3 font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest">
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
                className="h-12 px-6 border-4 border-[#1A1A2E] bg-white font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-xs hover:bg-[#FFD700] active:translate-x-1 active:translate-y-1 shadow-[4px_4px_0_0_#1A1A2E] active:shadow-none transition-transform"
              >
                ← ย้อนกลับ
              </button>
            )}
            {step !== 'confirm' ? (
              <button
                type="button"
                onClick={() => canNext && setStep(STEPS[currentStepIndex + 1].id)}
                disabled={!canNext}
                className="flex-1 h-12 px-6 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] hover:bg-[#009A4E] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                ถัดไป <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-12 px-6 bg-[#009A4E] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[6px_6px_0_0_#1A1A2E] hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                <Check className="w-5 h-5" />
                {submitting ? 'กำลังบันทึก…' : 'ยืนยันคำสั่งซื้อ'}
              </button>
            )}
          </div>
        </main>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-32 self-start">
          <div className="bg-white border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-5 space-y-3">
            <h3 className="font-[family:var(--font-kanit)] font-black text-xl uppercase tracking-tight border-b-4 border-[#1A1A2E] pb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#FFD700]" />
              สรุป
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-[#4A4A6E]">
                  ยอดสินค้า
                </span>
                <span className="font-bold">{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-[#4A4A6E]">
                  ค่าจัดส่ง
                </span>
                <span className={`font-bold ${shippingFee === 0 ? 'text-[#009A4E]' : ''}`}>
                  {shippingFee === 0 ? 'ฟรี' : formatTHB(shippingFee)}
                </span>
              </div>
            </div>
            <div className="border-t-4 border-[#1A1A2E] pt-3 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-black uppercase">รวม</span>
              <span className="font-[family:var(--font-kanit)] font-black text-2xl text-[#E52521]">
                {formatTHB(total)}
              </span>
            </div>
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
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest mb-1">
        {label}{' '}
        {optional && (
          <span className="text-[#4A4A6E] normal-case font-bold">(ไม่บังคับ)</span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border-4 border-[#1A1A2E] px-3 py-2 text-sm font-bold focus:outline-none focus:bg-[#FFF8DC]"
      />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
      <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-[#4A4A6E] shrink-0 w-32">
        {label}
      </span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}
