'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Mail,
  CreditCard,
  Check,
  Aperture,
  ChevronRight,
  Download,
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
  icon: typeof ShoppingBag;
}

const STEPS: StepDef[] = [
  { id: 'cart', title: 'ตะกร้า', icon: ShoppingBag },
  { id: 'address', title: 'ข้อมูล', icon: Mail },
  { id: 'payment', title: 'ชำระ', icon: CreditCard },
  { id: 'confirm', title: 'ยืนยัน', icon: Check },
];

const SHIPPING_OPTIONS = [
  { id: 'DIGITAL', name: 'ดาวน์โหลดทันที (อีเมล + บัญชี)', priceTHB: 0 },
  { id: 'EMS', name: 'EMS · ส่ง USB drive · 1-2 วัน', priceTHB: 50 },
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
    email: '',
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
  const isDigital = shipping === 'DIGITAL';
  const shippingFee = isDigital
    ? 0
    : subtotal >= FREE_SHIPPING_THRESHOLD
    ? 0
    : SHIPPING_OPTIONS.find((s) => s.id === shipping)?.priceTHB ?? 50;
  const total = subtotal + shippingFee;

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const canNext =
    step === 'cart'
      ? lines.length > 0
      : step === 'address'
      ? !!form.name && !!form.email && (isDigital || !!form.addressLine)
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
        router.push(
          `/stores/${store.slug}/checkout/confirm?orderId=${data.orderId}`,
        );
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
      <div className="bg-[#0C0A09] min-h-screen text-[#F5F5F4] font-[family:var(--font-prompt)] flex items-center justify-center px-4 py-20">
        <div className="text-center bg-[#1C1917] border border-[#44403C] p-10 max-w-md w-full">
          <Aperture
            className="w-12 h-12 text-[#44403C] mx-auto mb-5"
            strokeWidth={1}
          />
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-bold mb-2">
            ตะกร้าว่าง
          </h1>
          <p className="text-sm text-[#A8A29E] mb-6">
            เพิ่มพรีเซ็ตเข้าตะกร้าก่อนชำระเงิน
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center h-12 px-7 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold tracking-wide text-sm transition-colors"
          >
            สำรวจคอลเลกชัน
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0C0A09] text-[#F5F5F4] font-[family:var(--font-prompt)] min-h-screen">
      {/* Header */}
      <section className="pv-grain relative border-b border-[#44403C] bg-gradient-to-b from-[#1C1917] to-[#0C0A09] px-4 py-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] mb-3">
            <span className="w-8 h-px bg-[#FBBF24]" />
            Checkout · Step {currentStepIndex + 1}/{STEPS.length}
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="pv-text-gold">ชำระเงิน</span>
          </h1>
        </div>
      </section>

      {/* Stepper */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => {
            const done = i < currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <div
                key={s.id}
                className={`relative border p-4 transition-colors ${
                  active
                    ? 'border-[#F59E0B] bg-[#1C1917] text-[#F59E0B] pv-glow-amber'
                    : done
                    ? 'border-[#F59E0B]/40 bg-[#1C1917] text-[#FBBF24]'
                    : 'border-[#44403C] bg-[#0C0A09] text-[#57534E]'
                }`}
              >
                <s.icon className="w-5 h-5 mb-2" />
                <p className="font-[family:var(--font-kanit)] font-semibold text-[10px] sm:text-xs uppercase tracking-[0.24em]">
                  {s.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_380px] gap-8">
        <main className="space-y-6">
          {/* Step 1: Cart */}
          {step === 'cart' && (
            <div className="bg-[#1C1917] border border-[#44403C] p-5">
              <h2 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#F59E0B] mb-5">
                ตรวจสอบสินค้า
              </h2>
              <div className="space-y-3">
                {lines.map((l) => (
                  <div
                    key={l.productId}
                    className="flex gap-3 items-center border border-[#44403C] bg-[#0C0A09] p-3"
                  >
                    <div className="w-16 h-16 shrink-0 border border-[#44403C] bg-[#0C0A09] overflow-hidden relative">
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <Aperture
                          className="absolute inset-0 m-auto w-6 h-6 text-[#44403C]"
                          strokeWidth={1}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-[family:var(--font-kanit)] font-bold text-sm line-clamp-2 text-[#F5F5F4]">
                        {l.title}
                      </p>
                      <p className="text-xs text-[#A8A29E] mt-1">x{l.qty}</p>
                    </div>
                    <p className="font-[family:var(--font-kanit)] font-bold text-[#F59E0B] shrink-0">
                      {formatTHB(l.priceTHB * l.qty)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 'address' && (
            <div className="bg-[#1C1917] border border-[#44403C] p-5 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#F59E0B] mb-2">
                ข้อมูลลูกค้า
              </h2>
              <Field
                label="ชื่อ-นามสกุล"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                label="อีเมล (รับลิงก์ดาวน์โหลด)"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                type="email"
              />
              <Field
                label="เบอร์โทรศัพท์"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                type="tel"
                optional
              />
              {!isDigital && (
                <>
                  <h3 className="font-[family:var(--font-kanit)] font-bold text-xs uppercase tracking-[0.32em] text-[#FBBF24] pt-3 border-t border-[#44403C]">
                    ที่อยู่จัดส่ง USB
                  </h3>
                  <Field
                    label="ที่อยู่ (เลขที่ / ถนน)"
                    value={form.addressLine}
                    onChange={(v) => setForm({ ...form, addressLine: v })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="ตำบล / แขวง"
                      value={form.subdistrict}
                      onChange={(v) => setForm({ ...form, subdistrict: v })}
                    />
                    <Field
                      label="อำเภอ / เขต"
                      value={form.district}
                      onChange={(v) => setForm({ ...form, district: v })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="จังหวัด"
                      value={form.province}
                      onChange={(v) => setForm({ ...form, province: v })}
                    />
                    <Field
                      label="รหัสไปรษณีย์"
                      value={form.postalCode}
                      onChange={(v) => setForm({ ...form, postalCode: v })}
                    />
                  </div>
                </>
              )}
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
            <div className="bg-[#1C1917] border border-[#44403C] p-5 space-y-5">
              <h2 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#F59E0B] mb-2">
                การจัดส่ง & การชำระเงิน
              </h2>
              <div className="space-y-2.5">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[#A8A29E] font-semibold">
                  วิธีรับสินค้า
                </p>
                {SHIPPING_OPTIONS.map((opt) => {
                  const active = shipping === opt.id;
                  const isFree = opt.priceTHB === 0;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setShipping(opt.id)}
                      className={`w-full text-left px-4 py-3 border flex items-center justify-between transition-colors ${
                        active
                          ? 'border-[#F59E0B] bg-[#0C0A09]'
                          : 'border-[#44403C] hover:border-[#A8A29E]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {opt.id === 'DIGITAL' ? (
                          <Download className="w-4 h-4 text-[#F59E0B]" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-[#A8A29E]" />
                        )}
                        <span className="font-[family:var(--font-kanit)] font-semibold text-sm">
                          {opt.name}
                        </span>
                      </div>
                      <span
                        className={`font-[family:var(--font-kanit)] font-bold text-sm ${
                          isFree ? 'text-[#10B981]' : 'text-[#F5F5F4]'
                        }`}
                      >
                        {isFree ? 'ฟรี' : formatTHB(opt.priceTHB)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[#44403C]">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[#A8A29E] font-semibold">
                  วิธีชำระเงิน
                </p>
                <div className="px-4 py-3 border border-[#F59E0B] bg-[#0C0A09] font-[family:var(--font-kanit)] font-semibold text-sm text-[#FBBF24] flex items-center gap-3">
                  <CreditCard className="w-4 h-4" />
                  ชำระเงินออนไลน์ · พร้อมเพย์ / โอน / บัตรเครดิต
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div className="bg-[#1C1917] border border-[#44403C] p-5 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#F59E0B] mb-3">
                ยืนยันคำสั่งซื้อ
              </h2>
              <Summary
                label="ผู้รับ"
                value={`${form.name}${form.phone ? ` · ${form.phone}` : ''}`}
              />
              <Summary label="อีเมล" value={form.email} />
              {!isDigital && (
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
                label="วิธีรับ"
                value={
                  SHIPPING_OPTIONS.find((s) => s.id === shipping)?.name ?? '-'
                }
              />
              {form.note && <Summary label="หมายเหตุ" value={form.note} />}
              {error && (
                <div className="border border-[#E11D48] bg-[#0C0A09] text-[#FBBF24] p-3 text-sm">
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
                className="h-12 px-6 border border-[#44403C] hover:border-[#F59E0B] hover:text-[#F59E0B] text-[#F5F5F4] font-[family:var(--font-kanit)] font-semibold text-sm uppercase tracking-[0.24em] transition-colors"
              >
                ← ย้อนกลับ
              </button>
            )}
            {step !== 'confirm' ? (
              <button
                type="button"
                onClick={() =>
                  canNext && setStep(STEPS[currentStepIndex + 1].id)
                }
                disabled={!canNext}
                className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold tracking-wide text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ถัดไป <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold tracking-wide text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed pv-glow-amber"
              >
                <Check className="w-4 h-4" />
                {submitting ? 'กำลังบันทึก…' : 'ยืนยันคำสั่งซื้อ'}
              </button>
            )}
          </div>
        </main>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-28 self-start">
          <div className="bg-gradient-to-br from-[#1C1917] to-[#0C0A09] border border-[#F59E0B]/40 p-5 space-y-3 pv-glow-amber">
            <h3 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#F59E0B] pb-3 border-b border-[#44403C]">
              สรุป
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A8A29E] uppercase tracking-wider text-xs">
                  ยอดสินค้า
                </span>
                <span className="font-semibold">{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A8A29E] uppercase tracking-wider text-xs">
                  ค่าจัดส่ง
                </span>
                <span
                  className={`font-semibold ${
                    shippingFee === 0 ? 'text-[#10B981]' : 'text-[#F5F5F4]'
                  }`}
                >
                  {shippingFee === 0 ? 'ฟรี' : formatTHB(shippingFee)}
                </span>
              </div>
            </div>
            <div className="border-t border-[#44403C] pt-4 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-bold uppercase tracking-wide text-sm">
                รวม
              </span>
              <span className="font-[family:var(--font-kanit)] font-bold text-2xl text-[#F59E0B]">
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
      <label className="block font-[family:var(--font-kanit)] font-semibold uppercase text-[10px] tracking-[0.32em] mb-1.5 text-[#A8A29E]">
        {label}{' '}
        {optional && (
          <span className="text-[#57534E] normal-case font-normal">
            (ไม่บังคับ)
          </span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0C0A09] border border-[#44403C] px-3 py-2.5 text-sm text-[#F5F5F4] focus:outline-none focus:border-[#F59E0B] transition-colors"
      />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
      <span className="font-[family:var(--font-kanit)] font-semibold uppercase text-[10px] tracking-[0.32em] text-[#A8A29E] shrink-0 w-32">
        {label}
      </span>
      <span className="font-medium text-sm text-[#F5F5F4]">{value}</span>
    </div>
  );
}
