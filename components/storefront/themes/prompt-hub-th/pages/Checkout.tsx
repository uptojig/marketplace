'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Check,
  Bot,
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
  icon: typeof ShoppingCart;
}

const STEPS: StepDef[] = [
  { id: 'cart', title: 'ตะกร้า', icon: ShoppingCart },
  { id: 'address', title: 'ข้อมูล', icon: MapPin },
  { id: 'payment', title: 'ชำระเงิน', icon: CreditCard },
  { id: 'confirm', title: 'ยืนยัน', icon: Check },
];

const SHIPPING_OPTIONS = [
  { id: 'INSTANT', name: 'ดาวน์โหลดทันที · ส่งทางอีเมล', priceTHB: 0 },
  { id: 'EMS', name: 'EMS (USB ทางเลือก) · 1-2 วัน', priceTHB: 50 },
];

const FREE_SHIPPING_THRESHOLD = 990;

const GRADIENT_BG = 'linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)';
const GRADIENT_TEXT_STYLE: React.CSSProperties = {
  backgroundImage: GRADIENT_BG,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
};
const GLASS_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(19, 19, 46, 0.6)',
  backdropFilter: 'blur(12px) saturate(140%)',
  WebkitBackdropFilter: 'blur(12px) saturate(140%)',
  border: '1px solid rgba(168, 85, 247, 0.16)',
};
const GRID_BG_STYLE: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.18) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};
const GLOW_SM =
  '0 0 0 1px rgba(168,85,247,0.4), 0 0 12px rgba(168,85,247,0.4), 0 0 32px rgba(168,85,247,0.2)';
const GLOW_LG =
  '0 0 0 1px rgba(168,85,247,0.5), 0 0 24px rgba(168,85,247,0.5), 0 0 64px rgba(168,85,247,0.28)';

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
  const isInstant = shipping === 'INSTANT';
  const shippingFee = isInstant
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
      ? !!form.name &&
        !!form.email &&
        (isInstant || (!!form.phone && !!form.addressLine && !!form.province))
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
      <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)] min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center rounded-2xl p-10 max-w-md w-full" style={GLASS_STYLE}>
          <h1 className="font-[family:var(--font-kanit)] text-2xl font-bold text-[#F8FAFC] mb-3">
            ตะกร้าว่าง
          </h1>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex h-11 px-5 mt-3 rounded-full text-white text-sm font-semibold items-center font-[family:var(--font-kanit)]"
            style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
          >
            เริ่มช้อป
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)] min-h-screen">
      <section className="relative overflow-hidden border-b border-[#312E81]/60 px-4 py-10">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={GRID_BG_STYLE} aria-hidden />
        <div className="relative max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#06B6D4]/40 bg-[#06B6D4]/10 text-[10px] uppercase tracking-[0.18em] text-[#06B6D4] mb-3 font-[family:var(--font-kanit)] font-semibold">
            <CreditCard className="w-3 h-3" />
            Checkout · Step{' '}
            <span className="tabular-nums">
              {currentStepIndex + 1}/{STEPS.length}
            </span>
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
            ชำระเงิน
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => {
            const done = i < currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <div
                key={s.id}
                className={`rounded-xl p-3 text-center transition-all ${
                  active
                    ? 'text-white'
                    : done
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/40'
                    : 'text-[#94A3B8]'
                }`}
                style={
                  active
                    ? { backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }
                    : !done
                    ? GLASS_STYLE
                    : undefined
                }
              >
                <s.icon className="w-4 h-4 mx-auto mb-1" />
                <p className="font-[family:var(--font-kanit)] font-semibold text-[10px] uppercase tracking-[0.14em]">
                  {s.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_380px] gap-8">
        <main className="space-y-6">
          {step === 'cart' && (
            <div className="rounded-2xl p-5 sm:p-6" style={GLASS_STYLE}>
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-base text-[#F8FAFC] mb-4 pb-3 border-b border-[#312E81]">
                ตรวจสอบรายการ
              </h2>
              <div className="space-y-2">
                {lines.map((l) => (
                  <div
                    key={l.productId}
                    className="flex gap-3 items-center p-3 rounded-xl bg-[#0B0B1F]/60 border border-[#312E81]"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-lg bg-[#1E1E3F] overflow-hidden relative">
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <Bot className="absolute inset-0 m-auto w-6 h-6 text-[#F8FAFC]/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-[family:var(--font-kanit)] font-semibold text-sm text-[#F8FAFC] line-clamp-2 leading-snug">
                        {l.title}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5 tabular-nums">x{l.qty}</p>
                    </div>
                    <p className="font-[family:var(--font-kanit)] font-bold text-[#A855F7] shrink-0 tabular-nums">
                      {formatTHB(l.priceTHB * l.qty)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'address' && (
            <div className="rounded-2xl p-5 sm:p-6 space-y-4" style={GLASS_STYLE}>
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-base text-[#F8FAFC] mb-2 pb-3 border-b border-[#312E81]">
                ข้อมูลผู้รับ
              </h2>
              <Field
                label="ชื่อ-นามสกุล"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                label="อีเมล (สำหรับส่งลิงก์ดาวน์โหลด)"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                type="email"
              />
              {!isInstant && (
                <>
                  <Field
                    label="เบอร์โทรศัพท์"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    type="tel"
                  />
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
                label="หมายเหตุ (ถ้ามี)"
                value={form.note}
                onChange={(v) => setForm({ ...form, note: v })}
                optional
              />
            </div>
          )}

          {step === 'payment' && (
            <div className="rounded-2xl p-5 sm:p-6 space-y-5" style={GLASS_STYLE}>
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-base text-[#F8FAFC] pb-3 border-b border-[#312E81]">
                การจัดส่ง & การชำระเงิน
              </h2>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-[#94A3B8] font-medium">
                  วิธีจัดส่ง
                </p>
                {SHIPPING_OPTIONS.map((opt) => {
                  const active = shipping === opt.id;
                  const Icon = opt.id === 'INSTANT' ? Download : MapPin;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setShipping(opt.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between transition-all ${
                        active
                          ? 'text-white'
                          : 'bg-[#0B0B1F]/60 border border-[#312E81] text-[#F8FAFC] hover:border-[#A855F7]/50'
                      }`}
                      style={active ? { backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM } : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{opt.name}</span>
                      </span>
                      <span className="font-[family:var(--font-kanit)] font-bold tabular-nums text-sm">
                        {opt.priceTHB === 0 ||
                        (opt.priceTHB > 0 && subtotal >= FREE_SHIPPING_THRESHOLD)
                          ? 'ฟรี'
                          : formatTHB(opt.priceTHB)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 pt-3 border-t border-[#312E81]">
                <p className="text-xs uppercase tracking-[0.16em] text-[#94A3B8] font-medium">
                  วิธีชำระเงิน
                </p>
                <div className="rounded-xl border border-[#06B6D4]/40 bg-[#06B6D4]/10 px-4 py-3.5 text-sm text-[#06B6D4] font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  ชำระผ่าน AnyPay (พร้อมเพย์ / โอน / บัตร)
                </div>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="rounded-2xl p-5 sm:p-6 space-y-4" style={GLASS_STYLE}>
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-base text-[#F8FAFC] pb-3 border-b border-[#312E81]">
                ยืนยันคำสั่งซื้อ
              </h2>
              <Summary label="ผู้รับ" value={`${form.name} · ${form.email}`} />
              {!isInstant && (
                <Summary
                  label="ที่อยู่"
                  value={[form.addressLine, form.subdistrict, form.district, form.province, form.postalCode]
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
                <div className="rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
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
                className="h-11 px-5 rounded-full bg-[#13132E] text-[#F8FAFC] text-sm font-semibold border border-[#312E81] hover:border-[#A855F7] hover:text-[#A855F7] transition-colors font-[family:var(--font-kanit)]"
              >
                ← ย้อนกลับ
              </button>
            )}
            {step !== 'confirm' ? (
              <button
                type="button"
                onClick={() => canNext && setStep(STEPS[currentStepIndex + 1].id)}
                disabled={!canNext}
                className="flex-1 h-11 px-5 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-[family:var(--font-kanit)]"
                style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
              >
                ถัดไป <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-12 px-5 rounded-full text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-[family:var(--font-kanit)]"
                style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_LG }}
              >
                <Check className="w-4 h-4" />
                {submitting ? 'กำลังบันทึก…' : 'ยืนยันคำสั่งซื้อ'}
              </button>
            )}
          </div>
        </main>

        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl p-5 space-y-3" style={{ ...GLASS_STYLE, boxShadow: GLOW_SM }}>
            <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm uppercase tracking-[0.14em] text-[#F8FAFC] pb-3 border-b border-[#312E81]">
              สรุป
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-[0.14em] text-[#94A3B8]">ยอดสินค้า</span>
                <span className="text-[#F8FAFC] tabular-nums">{formatTHB(subtotal)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-[0.14em] text-[#94A3B8]">ค่าจัดส่ง</span>
                <span
                  className={`tabular-nums ${
                    shippingFee === 0 ? 'text-[#10B981] font-semibold' : 'text-[#F8FAFC]'
                  }`}
                >
                  {shippingFee === 0 ? 'ฟรี' : formatTHB(shippingFee)}
                </span>
              </div>
            </div>
            <div className="border-t border-[#312E81] pt-3 flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-semibold text-sm uppercase tracking-[0.14em] text-[#F8FAFC]">
                รวม
              </span>
              <span
                className="font-[family:var(--font-kanit)] font-bold text-2xl tabular-nums"
                style={GRADIENT_TEXT_STYLE}
              >
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
      <label className="block text-xs uppercase tracking-[0.14em] text-[#94A3B8] mb-1.5 font-medium">
        {label}{' '}
        {optional && (
          <span className="text-[#94A3B8]/60 normal-case tracking-normal">(ไม่บังคับ)</span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-[#0B0B1F]/60 border border-[#312E81] px-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/20 transition-all"
      />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
      <span className="text-xs uppercase tracking-[0.14em] text-[#94A3B8] shrink-0 w-32">
        {label}
      </span>
      <span className="text-sm text-[#F8FAFC] flex-1">{value}</span>
    </div>
  );
}
