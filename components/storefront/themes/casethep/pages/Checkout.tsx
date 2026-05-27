'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Check,
  ChevronRight,
  Smartphone,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

interface CheckoutProps {
  store: StoreLite;
  freeShippingThreshold?: number;
}

type StepId = 'address' | 'payment' | 'confirm';

interface StepDef {
  id: StepId;
  title: string;
  icon: typeof ShoppingBag;
}

const STEPS: StepDef[] = [
  { id: 'address', title: 'ที่อยู่จัดส่ง', icon: MapPin },
  { id: 'payment', title: 'ชำระเงิน', icon: CreditCard },
  { id: 'confirm', title: 'ยืนยัน', icon: Check },
];

// ANYPAY-ONLY — no COD shipping option either.
const SHIPPING_OPTIONS = [
  { id: 'EMS', name: 'EMS · ส่งด่วน 1–2 วัน', priceTHB: 50 },
  { id: 'REGISTERED', name: 'ลงทะเบียน · 3–5 วัน', priceTHB: 30 },
];

export default function Checkout({
  store,
  freeShippingThreshold = 990,
}: CheckoutProps) {
  const router = useRouter();
  const allLines = useCart((s) => s.lines);
  const clearStore = useCart((s) => s.clearStore);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  const [step, setStep] = useState<StepId>('address');
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
  const shippingFee = subtotal >= freeShippingThreshold
    ? 0
    : SHIPPING_OPTIONS.find((s) => s.id === shipping)?.priceTHB ?? 50;
  const total = subtotal + shippingFee;

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const canAdvance =
    step === 'address'
      ? !!form.name && !!form.phone && !!form.addressLine && !!form.province && !!form.postalCode
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
          address: {
            recipientName: form.name,
            phone: form.phone,
            line1: form.addressLine,
            subdistrict: form.subdistrict,
            district: form.district,
            province: form.province,
            postalCode: form.postalCode,
          },
        }),
      });
      const data = await res.json();
      if (data?.ok && data?.orderId) {
        clearStore(store.slug);
        router.push(`/stores/${store.slug}/checkout/confirm?orderId=${data.orderId}`);
      } else {
        setError(data?.error ?? 'ไม่สามารถสร้างคำสั่งซื้อได้ ลองอีกครั้ง');
        setSubmitting(false);
      }
    } catch {
      setError('เครือข่ายไม่ตอบสนอง ลองอีกครั้ง');
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: 'var(--shop-bg, #FBF8F3)' }}
      />
    );
  }

  if (lines.length === 0) {
    return (
      <div
        className="font-[family:var(--font-prompt)] min-h-screen flex items-center justify-center px-4 py-20"
        style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
      >
        <div
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 20px 40px -10px rgba(0,0,0,0.08)' }}
        >
          <h1 className="font-[family:var(--font-kanit)] text-2xl font-semibold tracking-tight mb-2">
            ตะกร้าว่างเปล่า
          </h1>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mb-6">
            ยังไม่มีสินค้า ไปเลือกสินค้าก่อนเลย
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-medium text-white"
            style={{
              background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
            }}
          >
            ช้อปเลย <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
    >
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-semibold tracking-tight">
            ชำระเงิน
          </h1>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-1">
            ขั้นตอนที่ {currentStepIndex + 1} จาก {STEPS.length}
          </p>
        </div>
      </section>

      {/* Stepper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const done = i < currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      active
                        ? 'text-white'
                        : done
                          ? 'text-white'
                          : 'bg-white text-[color:var(--shop-ink-muted,#6B7280)]'
                    }`}
                    style={
                      active
                        ? { background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))' }
                        : done
                          ? { background: 'var(--shop-primary, #FF5A6A)' }
                          : { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }
                    }
                  >
                    {done ? <Check className="w-4 h-4" /> : <s.icon className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      active
                        ? 'text-[color:var(--shop-ink,#1A1A1F)]'
                        : 'text-[color:var(--shop-ink-muted,#6B7280)]'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    className="flex-1 h-px"
                    style={{
                      background:
                        i < currentStepIndex
                          ? 'var(--shop-primary, #FF5A6A)'
                          : 'rgba(0,0,0,0.10)',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-10">
        <main className="space-y-6">
          {/* Address */}
          {step === 'address' && (
            <div
              className="rounded-2xl bg-white p-6 space-y-4"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-lg tracking-tight">
                ที่อยู่จัดส่ง
              </h2>
              <Field
                label="ชื่อ – นามสกุล"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                label="เบอร์โทรศัพท์"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                type="tel"
              />
              <Field
                label="ที่อยู่ (เลขที่ / ถนน / ซอย)"
                value={form.addressLine}
                onChange={(v) => setForm({ ...form, addressLine: v })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <Field
                label="หมายเหตุ"
                value={form.note}
                onChange={(v) => setForm({ ...form, note: v })}
                optional
              />
            </div>
          )}

          {/* Payment */}
          {step === 'payment' && (
            <div
              className="rounded-2xl bg-white p-6 space-y-5"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-lg tracking-tight">
                การจัดส่งและชำระเงิน
              </h2>

              <div className="space-y-2">
                <p className="text-sm font-medium">วิธีจัดส่ง</p>
                <div className="space-y-2">
                  {SHIPPING_OPTIONS.map((opt) => {
                    const active = shipping === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setShipping(opt.id)}
                        className={`w-full text-left flex items-center justify-between rounded-2xl px-4 py-3 border transition-all ${
                          active
                            ? 'border-[color:var(--shop-primary,#FF5A6A)] bg-[color:var(--shop-primary,#FF5A6A)]/5'
                            : 'border-[color:var(--shop-ink,#1A1A1F)]/10 hover:border-[color:var(--shop-primary,#FF5A6A)]/50'
                        }`}
                      >
                        <span className="text-sm font-medium">{opt.name}</span>
                        <span className="text-sm font-[family:var(--font-kanit)] font-semibold">
                          {subtotal >= freeShippingThreshold ? 'ฟรี' : formatTHB(opt.priceTHB)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ANYPAY-only — no COD */}
              <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                <p className="text-sm font-medium">วิธีชำระเงิน</p>
                <div
                  className="rounded-2xl px-4 py-4 flex items-center gap-3 border"
                  style={{
                    background: 'rgba(255,90,106,0.05)',
                    borderColor: 'rgba(255,90,106,0.25)',
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                    style={{
                      background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
                    }}
                  >
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">ชำระผ่าน ANYPAY</p>
                    <p className="text-xs text-[color:var(--shop-ink-muted,#6B7280)]">
                      PromptPay · บัตรเครดิต/เดบิต · โอนผ่านธนาคาร
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirm */}
          {step === 'confirm' && (
            <div
              className="rounded-2xl bg-white p-6 space-y-4"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-lg tracking-tight">
                ยืนยันคำสั่งซื้อ
              </h2>
              <SummaryRow label="ผู้รับ" value={`${form.name} · ${form.phone}`} />
              <SummaryRow
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
              <SummaryRow
                label="วิธีจัดส่ง"
                value={SHIPPING_OPTIONS.find((s) => s.id === shipping)?.name ?? '—'}
              />
              <SummaryRow label="วิธีชำระเงิน" value="ANYPAY" />
              {form.note && <SummaryRow label="หมายเหตุ" value={form.note} />}

              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-xs"
                  style={{
                    background: 'rgba(220,38,38,0.08)',
                    color: '#B91C1C',
                  }}
                >
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
                className="inline-flex items-center justify-center rounded-full h-11 px-6 text-sm font-medium bg-white border border-[color:var(--shop-ink,#1A1A1F)]/10 hover:border-[color:var(--shop-primary,#FF5A6A)] hover:text-[color:var(--shop-primary,#FF5A6A)] transition-colors"
              >
                ← ย้อนกลับ
              </button>
            )}
            {step !== 'confirm' ? (
              <button
                type="button"
                onClick={() => canAdvance && setStep(STEPS[currentStepIndex + 1].id)}
                disabled={!canAdvance}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-medium text-white transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98]"
                style={{
                  background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
                }}
              >
                ถัดไป <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-medium text-white transition-transform disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98]"
                style={{
                  background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
                }}
              >
                <Check className="w-4 h-4" />
                {submitting ? 'กำลังบันทึก…' : 'ยืนยันคำสั่งซื้อ'}
              </button>
            )}
          </div>
        </main>

        {/* Summary */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <div
            className="rounded-2xl bg-white p-6"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 20px 40px -10px rgba(0,0,0,0.08)' }}
          >
            <h3 className="font-[family:var(--font-kanit)] font-semibold text-base tracking-tight mb-4">
              สรุปคำสั่งซื้อ
            </h3>
            <div className="space-y-3 mb-4">
              {lines.map((l) => (
                <div key={l.productId} className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 shrink-0 rounded-xl bg-[#F5F1EB] overflow-hidden">
                    {l.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.imageUrl}
                        alt={l.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <Smartphone className="absolute inset-0 m-auto w-5 h-5 text-[color:var(--shop-primary,#FF5A6A)]/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-1">{l.title}</p>
                    <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)]">x{l.qty}</p>
                  </div>
                  <p className="text-xs font-[family:var(--font-kanit)] font-semibold shrink-0">
                    {formatTHB(l.priceTHB * l.qty)}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <Row label="ยอดสินค้า" value={formatTHB(subtotal)} />
              <Row
                label="ค่าจัดส่ง"
                value={shippingFee === 0 ? 'ฟรี' : formatTHB(shippingFee)}
                valueClass={shippingFee === 0 ? 'text-[color:var(--shop-primary,#FF5A6A)] font-medium' : ''}
              />
            </div>
            <div
              className="border-t mt-3 pt-3 flex items-baseline justify-between"
              style={{ borderColor: 'rgba(0,0,0,0.06)' }}
            >
              <span className="font-[family:var(--font-kanit)] font-medium">ยอดรวม</span>
              <span className="font-[family:var(--font-kanit)] font-semibold text-2xl text-[color:var(--shop-primary,#FF5A6A)]">
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
      <label className="block text-xs font-medium mb-1.5 text-[color:var(--shop-ink,#1A1A1F)]">
        {label}{' '}
        {optional && (
          <span className="text-[color:var(--shop-ink-muted,#6B7280)] font-normal">(ไม่บังคับ)</span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[color:var(--shop-ink,#1A1A1F)]/10 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--shop-primary,#FF5A6A)] transition-colors"
      />
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
    <div className="flex justify-between text-sm">
      <span className="text-[color:var(--shop-ink-muted,#6B7280)]">{label}</span>
      <span className={`text-[color:var(--shop-ink,#1A1A1F)] font-medium ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 text-sm">
      <span className="text-[color:var(--shop-ink-muted,#6B7280)] sm:w-32 shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
