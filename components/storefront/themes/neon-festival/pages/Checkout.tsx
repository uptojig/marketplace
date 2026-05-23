'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, MapPin, CreditCard, Check, Sparkles, ChevronRight } from 'lucide-react';
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
  { id: 'EMS', name: 'EMS · 1-2 วัน', priceTHB: 50 },
  { id: 'REGISTERED', name: 'ลงทะเบียน · 3-5 วัน', priceTHB: 30 },
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
      : step === 'payment' ? !!shipping
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
          shipping: {
            method: shipping,
            feeTHB: shippingFee,
          },
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
      <div className="bg-[#fafafa] min-h-screen text-black font-[family:var(--font-prompt)] flex items-center justify-center px-4 py-20">
        <div className="text-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 max-w-md w-full">
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-black uppercase italic mb-2">
            ตะกร้าว่าง
          </h1>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex h-12 px-6 mt-4 bg-pink-500 text-white border-4 border-black font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none items-center"
          >
            ช้อปเลย
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] text-black font-[family:var(--font-prompt)] min-h-screen">
      {/* Header */}
      <section className="bg-blue-600 border-b-4 border-black px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block bg-yellow-400 border-4 border-black px-4 py-1 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-3 font-[family:var(--font-kanit)]">
            Checkout · Step {currentStepIndex + 1}/{STEPS.length}
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
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
                className={`border-4 border-black p-3 text-center ${
                  active
                    ? 'bg-pink-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : done
                    ? 'bg-green-400 text-black'
                    : 'bg-white text-slate-400'
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

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_360px] gap-8">
        <main className="space-y-6">
          {/* Step 1: Cart */}
          {step === 'cart' && (
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase italic mb-4 border-b-4 border-black pb-2">
                ตรวจสอบสินค้า
              </h2>
              <div className="space-y-3">
                {lines.map((l) => (
                  <div key={l.productId} className="flex gap-3 items-center border-4 border-black bg-[#fafafa] p-3">
                    <div className="w-16 h-16 shrink-0 border-4 border-black bg-slate-100 overflow-hidden relative">
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.imageUrl} alt={l.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-black/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-[family:var(--font-kanit)] font-black uppercase text-sm line-clamp-2">
                        {l.title}
                      </p>
                      <p className="text-xs font-bold text-slate-500 mt-1">x{l.qty}</p>
                    </div>
                    <p className="font-[family:var(--font-kanit)] font-black text-pink-600 shrink-0">
                      {formatTHB(l.priceTHB * l.qty)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 'address' && (
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase italic mb-4 border-b-4 border-black pb-2">
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
              <Field label="หมายเหตุ (ถ้ามี)" value={form.note} onChange={(v) => setForm({ ...form, note: v })} optional />
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase italic mb-4 border-b-4 border-black pb-2">
                การจัดส่ง & การชำระเงิน
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
                      className={`w-full text-left px-4 py-3 border-4 flex items-center justify-between active:translate-x-1 active:translate-y-1 ${
                        active
                          ? 'border-black bg-pink-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'border-black bg-white hover:bg-yellow-400'
                      }`}
                    >
                      <span className="font-[family:var(--font-kanit)] font-black uppercase text-sm">
                        {opt.name}
                      </span>
                      <span className="font-[family:var(--font-kanit)] font-black">
                        {subtotal >= FREE_SHIPPING_THRESHOLD ? 'ฟรี' : formatTHB(opt.priceTHB)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 pt-4 border-t-4 border-black">
                <p className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest">
                  วิธีชำระเงิน
                </p>
                <div className="px-4 py-3 border-4 border-black bg-yellow-400 font-[family:var(--font-kanit)] font-black uppercase text-sm">
                  ชำระผ่าน AnyPay (พร้อมเพย์ / โอน / บัตร)
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-black text-xl uppercase italic mb-4 border-b-4 border-black pb-2">
                ยืนยันคำสั่งซื้อ
              </h2>
              <Summary label="ผู้รับ" value={`${form.name} · ${form.phone}`} />
              <Summary
                label="ที่อยู่"
                value={[form.addressLine, form.subdistrict, form.district, form.province, form.postalCode].filter(Boolean).join(' ')}
              />
              <Summary label="วิธีจัดส่ง" value={SHIPPING_OPTIONS.find((s) => s.id === shipping)?.name ?? '-'} />
              {form.note && <Summary label="หมายเหตุ" value={form.note} />}
              {error && (
                <div className="border-4 border-red-600 bg-red-50 text-red-700 p-3 font-bold uppercase text-xs tracking-widest">
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
                className="h-12 px-6 border-4 border-black bg-white font-[family:var(--font-kanit)] font-black uppercase tracking-widest hover:bg-yellow-400 active:translate-x-1 active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
              >
                ← ย้อนกลับ
              </button>
            )}
            {step !== 'confirm' ? (
              <button
                type="button"
                onClick={() => canNext && setStep(STEPS[currentStepIndex + 1].id)}
                disabled={!canNext}
                className="flex-1 h-12 px-6 bg-pink-500 text-white border-4 border-black font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                ถัดไป <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-12 px-6 bg-green-500 text-white border-4 border-black font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black active:translate-x-2 active:translate-y-2 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {submitting ? 'กำลังบันทึก…' : 'ยืนยันคำสั่งซื้อ'}
              </button>
            )}
          </div>
        </main>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 space-y-3">
            <h3 className="font-[family:var(--font-kanit)] font-black text-xl uppercase italic border-b-4 border-black pb-2">
              สรุป
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-bold uppercase text-xs tracking-widest text-slate-600">ยอดสินค้า</span>
                <span className="font-bold">{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold uppercase text-xs tracking-widest text-slate-600">ค่าจัดส่ง</span>
                <span className={`font-bold ${shippingFee === 0 ? 'text-green-600' : ''}`}>
                  {shippingFee === 0 ? 'ฟรี' : formatTHB(shippingFee)}
                </span>
              </div>
            </div>
            <div className="border-t-4 border-black pt-3 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-black uppercase">รวม</span>
              <span className="font-[family:var(--font-kanit)] font-black text-2xl text-pink-600">
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="block font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest mb-1">
        {label} {optional && <span className="text-slate-400 normal-case font-bold">(ไม่บังคับ)</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-4 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:bg-yellow-100"
      />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
      <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-slate-600 shrink-0 w-28">
        {label}
      </span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}
