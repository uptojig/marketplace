'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  CreditCard,
  Check,
  ChevronRight,
  Code2,
  ShoppingCart,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface CheckoutProps {
  store: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
  };
  items?: unknown;
}

type StepId = 'account' | 'payment' | 'confirm';

const STEPS: Array<{ id: StepId; title: string; icon: typeof Mail }> = [
  { id: 'account', title: 'ข้อมูลผู้ซื้อ', icon: Mail },
  { id: 'payment', title: 'ชำระเงิน', icon: CreditCard },
  { id: 'confirm', title: 'ยืนยัน', icon: Check },
];

const PAYMENT_OPTIONS = [
  { id: 'PROMPTPAY', name: 'PromptPay QR', sublabel: 'สแกนจ่ายด้วยมือถือ' },
  { id: 'BANK_TRANSFER', name: 'โอนผ่านธนาคาร', sublabel: 'แนบสลิปหลังโอน' },
  { id: 'CREDIT_CARD', name: 'บัตรเครดิต / เดบิต', sublabel: 'Visa · Mastercard · JCB' },
];

export default function Checkout({ store }: CheckoutProps) {
  const router = useRouter();
  const allLines = useCart((s) => s.lines);
  const clearStore = useCart((s) => s.clearStore);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );

  const [step, setStep] = useState<StepId>('account');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const vat = 0; // included
  const total = subtotal + vat;

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const canAdvance =
    step === 'account'
      ? !!form.name.trim() && !!form.email.trim() && /^\S+@\S+\.\S+$/.test(form.email)
      : step === 'payment'
        ? !!payment
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
          shipping: { method: 'DIGITAL', feeTHB: 0 },
          address: {
            recipientName: form.name,
            phone: form.phone,
            email: form.email,
            line1: 'ดิจิทัล — ส่งทางอีเมล',
            province: '-',
            postalCode: '00000',
          },
          payment: { method: payment },
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
        style={{ background: 'var(--shop-bg, #FAFBFC)' }}
      />
    );
  }

  if (lines.length === 0) {
    return (
      <div
        className="font-[family:var(--font-prompt)] min-h-screen flex items-center justify-center px-4 py-20"
        style={{ background: 'var(--shop-bg, #FAFBFC)' }}
      >
        <div
          className="max-w-md w-full text-center rounded-lg p-10"
          style={{
            background: 'var(--shop-bg-soft, #FFFFFF)',
            border: '1px solid var(--shop-border, #E5E7EB)',
          }}
        >
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-[color:var(--shop-ink-muted,#6B7280)]/40" />
          <h1 className="font-[family:var(--font-kanit)] text-2xl font-bold mb-2 text-[color:var(--shop-ink,#0D1421)]">
            ตะกร้าว่าง
          </h1>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mb-6">
            ยังไม่มีเทมเพลตในตะกร้า — เริ่มเลือกเทมเพลตก่อน
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 rounded-md h-11 px-6 text-sm font-bold text-white"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
            }}
          >
            ดูเทมเพลต <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FAFBFC)' }}
    >
      <section
        className="border-b"
        style={{
          borderColor: 'var(--shop-border, #E5E7EB)',
          background: 'var(--shop-bg-soft, #FFFFFF)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)]">
            ชำระเงิน
          </h1>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-1">
            ขั้นตอนที่ {currentStepIndex + 1} จาก {STEPS.length} · ดิจิทัล · ดาวน์โหลดทันทีหลังชำระเงิน
          </p>
        </div>
      </section>

      {/* Stepper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const done = i < currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                      active || done
                        ? 'text-white'
                        : 'text-[color:var(--shop-ink-muted,#6B7280)]'
                    }`}
                    style={
                      active || done
                        ? { background: 'var(--shop-primary, #82B440)' }
                        : {
                            background: 'var(--shop-bg-soft, #FFFFFF)',
                            border: '1px solid var(--shop-border, #E5E7EB)',
                          }
                    }
                  >
                    {done ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <s.icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      active
                        ? 'text-[color:var(--shop-ink,#0D1421)]'
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
                          ? 'var(--shop-primary, #82B440)'
                          : 'var(--shop-border, #E5E7EB)',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <main className="space-y-5">
          {/* Step 1: Account */}
          {step === 'account' && (
            <div
              className="rounded-lg p-6 space-y-4"
              style={{
                background: 'var(--shop-bg-soft, #FFFFFF)',
                border: '1px solid var(--shop-border, #E5E7EB)',
              }}
            >
              <div>
                <h2 className="font-[family:var(--font-kanit)] font-bold text-lg text-[color:var(--shop-ink,#0D1421)]">
                  ข้อมูลผู้ซื้อ
                </h2>
                <p className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] mt-1">
                  ลิงก์ดาวน์โหลดจะถูกส่งไปยังอีเมลนี้หลังชำระเงิน
                </p>
              </div>
              <Field
                label="ชื่อ – นามสกุล"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                label="อีเมล (สำหรับรับลิงก์ดาวน์โหลด)"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                type="email"
              />
              <Field
                label="เบอร์โทรศัพท์ (ไม่บังคับ)"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                type="tel"
              />
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <div
              className="rounded-lg p-6 space-y-4"
              style={{
                background: 'var(--shop-bg-soft, #FFFFFF)',
                border: '1px solid var(--shop-border, #E5E7EB)',
              }}
            >
              <h2 className="font-[family:var(--font-kanit)] font-bold text-lg text-[color:var(--shop-ink,#0D1421)]">
                วิธีชำระเงิน
              </h2>
              <div className="space-y-2">
                {PAYMENT_OPTIONS.map((opt) => {
                  const active = payment === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className="flex items-center gap-3 rounded-md p-3 cursor-pointer transition-colors border"
                      style={{
                        borderColor: active
                          ? 'var(--shop-primary, #82B440)'
                          : 'var(--shop-border, #E5E7EB)',
                        background: active
                          ? 'rgba(130, 180, 64, 0.06)'
                          : 'var(--shop-bg-soft, #FFFFFF)',
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.id}
                        checked={active}
                        onChange={() => setPayment(opt.id)}
                        className="sr-only"
                      />
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          active
                            ? 'border-[color:var(--shop-primary,#82B440)]'
                            : 'border-[color:var(--shop-border,#E5E7EB)]'
                        }`}
                      >
                        {active && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'var(--shop-primary, #82B440)' }}
                          />
                        )}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[color:var(--shop-ink,#0D1421)]">
                          {opt.name}
                        </p>
                        <p className="text-xs text-[color:var(--shop-ink-muted,#6B7280)]">
                          {opt.sublabel}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div
              className="rounded-lg p-6 space-y-4"
              style={{
                background: 'var(--shop-bg-soft, #FFFFFF)',
                border: '1px solid var(--shop-border, #E5E7EB)',
              }}
            >
              <h2 className="font-[family:var(--font-kanit)] font-bold text-lg text-[color:var(--shop-ink,#0D1421)]">
                ตรวจสอบและยืนยัน
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] uppercase tracking-wider">
                    ผู้ซื้อ
                  </dt>
                  <dd className="text-[color:var(--shop-ink,#0D1421)]">
                    {form.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] uppercase tracking-wider">
                    อีเมล
                  </dt>
                  <dd className="text-[color:var(--shop-ink,#0D1421)] break-all">
                    {form.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] uppercase tracking-wider">
                    ช่องทางชำระเงิน
                  </dt>
                  <dd className="text-[color:var(--shop-ink,#0D1421)]">
                    {PAYMENT_OPTIONS.find((p) => p.id === payment)?.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] uppercase tracking-wider">
                    การส่งมอบ
                  </dt>
                  <dd className="text-[color:var(--shop-primary,#82B440)] font-medium">
                    ดิจิทัล · ส่งผ่านอีเมลทันที
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {error && (
            <p
              className="rounded-md p-3 text-sm"
              style={{
                background: 'rgba(220, 38, 38, 0.08)',
                color: 'var(--shop-savings, #DC2626)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
              }}
            >
              {error}
            </p>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {step !== 'account' ? (
              <button
                type="button"
                onClick={() => {
                  const idx = STEPS.findIndex((s) => s.id === step);
                  if (idx > 0) setStep(STEPS[idx - 1].id);
                }}
                className="rounded-md px-5 h-11 text-sm font-medium border"
                style={{
                  borderColor: 'var(--shop-border, #E5E7EB)',
                  color: 'var(--shop-ink, #0D1421)',
                  background: 'var(--shop-bg-soft, #FFFFFF)',
                }}
              >
                ← ก่อนหน้า
              </button>
            ) : (
              <Link
                href={`/stores/${store.slug}/cart`}
                className="rounded-md px-5 h-11 inline-flex items-center text-sm font-medium border"
                style={{
                  borderColor: 'var(--shop-border, #E5E7EB)',
                  color: 'var(--shop-ink, #0D1421)',
                  background: 'var(--shop-bg-soft, #FFFFFF)',
                }}
              >
                ← กลับตะกร้า
              </Link>
            )}
            {step === 'confirm' ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 h-11 text-sm font-bold text-white disabled:opacity-60"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
                }}
              >
                {submitting ? 'กำลังดำเนินการ...' : 'ยืนยันคำสั่งซื้อ'}
                {!submitting && <Check className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const idx = STEPS.findIndex((s) => s.id === step);
                  if (idx < STEPS.length - 1 && canAdvance) {
                    setStep(STEPS[idx + 1].id);
                  }
                }}
                disabled={!canAdvance}
                className="inline-flex items-center gap-2 rounded-md px-6 h-11 text-sm font-bold text-white disabled:opacity-50"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
                }}
              >
                ต่อไป
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <div
            className="rounded-lg p-5 space-y-3"
            style={{
              background: 'var(--shop-bg-soft, #FFFFFF)',
              border: '1px solid var(--shop-border, #E5E7EB)',
            }}
          >
            <h2 className="font-[family:var(--font-kanit)] text-base font-bold text-[color:var(--shop-ink,#0D1421)]">
              สรุปคำสั่งซื้อ
            </h2>
            <ul
              className="space-y-3 max-h-64 overflow-y-auto pr-1 border-b pb-3"
              style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
            >
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className="w-12 h-12 rounded relative overflow-hidden shrink-0"
                    style={{ background: 'var(--shop-muted, #F3F4F6)' }}
                  >
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <Code2 className="absolute inset-0 m-auto w-5 h-5 text-[color:var(--shop-primary,#82B440)]/50" />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-[color:var(--shop-ink,#0D1421)] text-xs sm:text-sm line-clamp-2 leading-snug">
                      {line.title}
                    </span>
                    <span className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)]">
                      x{line.qty}
                    </span>
                  </span>
                  <span className="font-[family:var(--font-kanit)] font-semibold text-sm tabular-nums text-[color:var(--shop-ink,#0D1421)]">
                    {formatTHB(line.priceTHB * line.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[color:var(--shop-ink-muted,#6B7280)]">
                  ยอดรวม
                </dt>
                <dd className="text-[color:var(--shop-ink,#0D1421)] tabular-nums">
                  {formatTHB(subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[color:var(--shop-ink-muted,#6B7280)]">
                  ค่าจัดส่ง
                </dt>
                <dd className="text-[color:var(--shop-primary,#82B440)] tabular-nums font-medium">
                  ฟรี
                </dd>
              </div>
              <div
                className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
              >
                <dt className="font-[family:var(--font-kanit)] font-bold text-base text-[color:var(--shop-ink,#0D1421)]">
                  ทั้งหมด
                </dt>
                <dd className="font-[family:var(--font-kanit)] font-bold text-lg text-[color:var(--shop-primary,#82B440)] tabular-nums">
                  {formatTHB(total)}
                </dd>
              </div>
            </dl>
            <ul className="space-y-2 pt-3 text-xs text-[color:var(--shop-ink-muted,#6B7280)]">
              <li className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[color:var(--shop-primary,#82B440)]" />
                ดาวน์โหลดทันทีหลังชำระเงิน
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[color:var(--shop-primary,#82B440)]" />
                ปลอดภัย SSL · ไม่เก็บข้อมูลบัตร
              </li>
            </ul>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[color:var(--shop-ink,#0D1421)] mb-1.5 block">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-white px-3 h-11 text-sm text-[color:var(--shop-ink,#0D1421)] focus:border-[color:var(--shop-primary,#82B440)] focus:outline-none"
        style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
      />
    </label>
  );
}
