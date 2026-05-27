'use client';

/**
 * EduClassroom — bespoke Checkout page.
 *
 * Adapts the four-step layout of shadcn-studio's `checkout-page-04`
 * (cart → recipient → payment → confirmation) into a classroom-themed,
 * digital-first flow:
 *
 *   step 1  รายการสื่อ          — review cart items
 *   step 2  ผู้รับ              — email + name for the download link
 *   step 3  ชำระเงิน           — payment method picker
 *   step 4  ยืนยัน              — final review + place order
 *
 * Because EduClassroom sells digital files, "ที่อยู่จัดส่ง" is replaced
 * by an email/name form — the download link is delivered to that
 * address right after `/api/checkout` returns success. The same API
 * endpoint the rest of the marketplace uses is invoked directly from
 * this component — no shared checkout-adapter helper sits between
 * the page and the page dispatcher.
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Mail,
  CreditCard,
  Check,
  Minus,
  Plus,
  Trash2,
  Download,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CheckoutProps } from '@/lib/templates/types';

import {
  EDU_PRIMARY,
  EDU_PRIMARY_DEEP,
  EDU_ACCENT,
  EDU_ACCENT_DEEP,
  EDU_SAVINGS,
  EDU_BG,
  EDU_BG_SOFT,
  EDU_BORDER,
  EDU_BORDER_SOFT,
  EDU_INK,
  EDU_INK_MUTED,
} from '../palette';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

type StepId = 'cart' | 'recipient' | 'payment' | 'confirm';
interface StepDef {
  id: StepId;
  title: string;
  icon: LucideIcon;
}
const STEPS: StepDef[] = [
  { id: 'cart', title: 'รายการสื่อ', icon: ShoppingCart },
  { id: 'recipient', title: 'อีเมลรับไฟล์', icon: Mail },
  { id: 'payment', title: 'ชำระเงิน', icon: CreditCard },
  { id: 'confirm', title: 'ยืนยัน', icon: Check },
];

const PAYMENT_OPTIONS: { id: string; name: string; desc: string }[] = [
  { id: 'ANYPAY', name: 'AnyPay', desc: 'PromptPay · บัตรเครดิต · Mobile Banking' },
];

export default function EduClassroomCheckout({ store }: CheckoutProps) {
  // Read the raw `lines` array — derived per-store via useMemo so the
  // selector identity stays stable and the page doesn't re-render in a
  // loop on hydration.
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clearStore = useCart((s) => s.clearStore);
  const allCodes = useCart((s) => s.couponCodesByStore);

  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );
  const subtotal = useMemo(
    () => lines.reduce((n, l) => n + l.priceTHB * l.qty, 0),
    [lines],
  );
  const couponCodes = useMemo(
    () => allCodes[store.slug] ?? [],
    [allCodes, store.slug],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEPS[stepIndex].id;

  const [recipient, setRecipient] = useState({
    name: '',
    email: '',
    schoolName: '',
    phone: '',
  });
  const [paymentId] = useState(PAYMENT_OPTIONS[0].id);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  // Digital store — no shipping cost ever. Send a zero shipping line so
  // /api/checkout still produces the expected response shape.
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email.trim());
  const canAdvanceFromRecipient =
    recipient.name.trim().length > 1 && isValidEmail;

  const goNext = () => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  async function placeOrder() {
    if (lines.length === 0) {
      setError('ตะกร้าว่าง ไม่สามารถสั่งซื้อได้');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storeSlug: store.slug,
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          // EduClassroom is digital — the address fields are nominal.
          // We carry the buyer-supplied recipient name + school as the
          // "to" identity so the API can email the download link.
          address: {
            recipientName: recipient.name,
            phone: recipient.phone,
            line1: recipient.schoolName || 'ไฟล์ดิจิทัล',
            line2: '',
            subdistrict: '',
            district: '',
            province: '-',
            postalCode: '10000',
            country: 'TH',
            email: recipient.email,
          },
          shipping: { method: 'DIGITAL', priceTHB: 0 },
          payment: { method: paymentId },
          couponCodes,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `สั่งซื้อไม่สำเร็จ (${res.status})`);
      }
      const data = (await res.json()) as { orderId?: string };
      clearStore(store.slug);
      setSubmittedOrderId(data.orderId ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถสร้างออเดอร์ได้');
      setSubmitting(false);
    }
  }

  if (submittedOrderId !== null) {
    return (
      <main className={`${FONT_BODY} min-h-screen`} style={{ background: EDU_BG, color: EDU_INK }}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
          <div
            className="inline-flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg mb-2"
            style={{ background: `linear-gradient(135deg, ${EDU_PRIMARY}, ${EDU_PRIMARY_DEEP})` }}
          >
            <Check className="h-10 w-10" strokeWidth={2.5} />
          </div>
          <h1 className={`${FONT_HEADING} font-black text-3xl sm:text-4xl`} style={{ color: EDU_INK }}>
            สั่งซื้อสำเร็จ
          </h1>
          {submittedOrderId && (
            <p className="text-sm" style={{ color: EDU_INK_MUTED }}>
              รหัสออเดอร์: <span className={`${FONT_HEADING} font-bold`} style={{ color: EDU_INK }}>{submittedOrderId}</span>
            </p>
          )}
          <div
            className="rounded-2xl p-5 mx-auto max-w-md text-left border"
            style={{ background: EDU_BG_SOFT, borderColor: `${EDU_ACCENT}40` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Download size={16} style={{ color: EDU_PRIMARY }} />
              <p className={`${FONT_HEADING} font-bold text-sm`} style={{ color: EDU_INK }}>
                ตรวจสอบอีเมลของคุณ
              </p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: EDU_INK_MUTED }}>
              เราส่งลิงก์ดาวน์โหลดสื่อทั้งหมดไปที่
              <span className={`${FONT_HEADING} font-bold mx-1`} style={{ color: EDU_INK }}>
                {recipient.email}
              </span>
              เรียบร้อยแล้ว · ดาวน์โหลดได้ทันทีหลังชำระเงินถูกต้อง
            </p>
          </div>
          <div className="flex justify-center gap-3 flex-wrap pt-2">
            <Link
              href={`/stores/${store.slug}`}
              className={`inline-flex items-center gap-2 text-white ${FONT_HEADING} font-black px-6 py-3 rounded-full shadow-md transition-all hover:shadow-lg`}
              style={{ background: EDU_PRIMARY }}
            >
              เลือกสื่อต่อ
            </Link>
            <Link
              href={`/account/orders`}
              className={`inline-flex items-center gap-2 bg-white border-2 ${FONT_HEADING} font-black px-6 py-3 rounded-full transition-all hover:shadow-md`}
              style={{ color: EDU_PRIMARY, borderColor: EDU_PRIMARY }}
            >
              ดูคำสั่งซื้อของฉัน
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${FONT_BODY} min-h-screen py-8 sm:py-10`} style={{ background: EDU_BG, color: EDU_INK }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stepper */}
        <nav aria-label="ขั้นตอนสั่งซื้อ" className="mb-8">
          <ol className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === stepIndex;
              const isDone = idx < stepIndex;
              return (
                <li key={step.id} className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors"
                    style={
                      isActive
                        ? {
                            background: EDU_PRIMARY,
                            color: '#FFFFFF',
                            borderColor: EDU_PRIMARY,
                            boxShadow: `0 4px 12px ${EDU_PRIMARY}40`,
                          }
                        : isDone
                          ? {
                              background: EDU_SAVINGS,
                              color: '#FFFFFF',
                              borderColor: EDU_SAVINGS,
                            }
                          : {
                              background: '#FFFFFF',
                              color: EDU_INK_MUTED,
                              borderColor: EDU_BORDER,
                            }
                    }
                  >
                    {isDone ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={`${FONT_HEADING} font-black text-xs sm:text-sm uppercase tracking-wider`}
                    style={{ color: isActive ? EDU_PRIMARY : isDone ? EDU_SAVINGS : EDU_INK_MUTED }}
                  >
                    {step.title}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight size={16} className="hidden sm:inline" style={{ color: EDU_BORDER }} />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Step content */}
          <div
            className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm"
            style={{ borderColor: EDU_BORDER }}
          >
            {currentStep === 'cart' && (
              <CartStep
                lines={lines}
                onQtyChange={(productId, qty) => setQty(productId, qty, store.slug)}
                onRemove={(productId) => remove(productId, store.slug)}
                storeSlug={store.slug}
              />
            )}
            {currentStep === 'recipient' && (
              <RecipientStep recipient={recipient} setRecipient={setRecipient} />
            )}
            {currentStep === 'payment' && (
              <PaymentStep paymentOptions={PAYMENT_OPTIONS} selectedId={paymentId} />
            )}
            {currentStep === 'confirm' && (
              <ConfirmStep
                lines={lines}
                recipient={recipient}
                total={total}
                error={error}
              />
            )}
          </div>

          {/* Sticky summary */}
          <aside
            className="bg-white border rounded-2xl p-6 shadow-sm h-fit space-y-4"
            style={{ borderColor: EDU_BORDER }}
          >
            <div className="flex items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${EDU_BORDER_SOFT}` }}>
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ background: `${EDU_PRIMARY}14`, color: EDU_PRIMARY }}
              >
                <GraduationCap size={16} />
              </span>
              <h3 className={`${FONT_HEADING} font-black text-lg`} style={{ color: EDU_INK }}>
                สรุปคำสั่งซื้อ
              </h3>
            </div>

            <div className="flex justify-between text-sm">
              <span style={{ color: EDU_INK_MUTED }}>สื่อ {lines.length} รายการ</span>
              <span className={`${FONT_HEADING} font-bold`} style={{ color: EDU_INK }}>
                {formatTHB(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: EDU_INK_MUTED }}>การจัดส่ง</span>
              <span
                className={`${FONT_HEADING} font-bold inline-flex items-center gap-1`}
                style={{ color: EDU_SAVINGS }}
              >
                <Download size={12} />
                ไฟล์ดาวน์โหลด (ฟรี)
              </span>
            </div>

            <div
              className="rounded-xl px-3 py-2 text-xs"
              style={{ background: EDU_BG_SOFT, color: EDU_ACCENT_DEEP, border: `1px solid ${EDU_ACCENT}40` }}
            >
              <Sparkles size={12} className="inline mr-1 -mt-0.5" />
              ไม่มีค่าจัดส่ง — ดาวน์โหลดได้ทันทีหลังชำระเงิน
            </div>

            <div className="pt-3 flex justify-between" style={{ borderTop: `1px dashed ${EDU_BORDER}` }}>
              <span className={`${FONT_HEADING} font-black`} style={{ color: EDU_INK }}>
                รวมทั้งสิ้น
              </span>
              <span className={`${FONT_HEADING} font-black text-xl`} style={{ color: EDU_PRIMARY }}>
                {formatTHB(total)}
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {currentStep !== 'confirm' ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    (currentStep === 'cart' && lines.length === 0) ||
                    (currentStep === 'recipient' && !canAdvanceFromRecipient)
                  }
                  className={`w-full text-white ${FONT_HEADING} font-black py-3 rounded-full shadow-md uppercase tracking-wider transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed`}
                  style={{ background: EDU_PRIMARY }}
                >
                  ดำเนินการต่อ →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={submitting || lines.length === 0}
                  className={`w-full text-white ${FONT_HEADING} font-black py-3 rounded-full shadow-md uppercase tracking-wider transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed`}
                  style={{ background: EDU_PRIMARY }}
                >
                  {submitting ? 'กำลังสั่งซื้อ...' : 'ยืนยันสั่งซื้อ'}
                </button>
              )}
              {stepIndex > 0 && !submitting && (
                <button
                  type="button"
                  onClick={goBack}
                  className={`w-full bg-white border-2 ${FONT_HEADING} font-black py-2.5 rounded-full uppercase tracking-wider text-xs transition-all hover:shadow-sm`}
                  style={{ color: EDU_PRIMARY, borderColor: EDU_PRIMARY }}
                >
                  ← ย้อนกลับ
                </button>
              )}
            </div>

            <p
              className="text-[10px] text-center inline-flex items-center justify-center gap-1.5 w-full pt-1"
              style={{ color: EDU_INK_MUTED }}
            >
              <ShieldCheck size={11} />
              ชำระเงินปลอดภัย · SSL · PCI-DSS
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ─── Step 1: cart review ─────────────────────────────────────────────
interface Line {
  productId: string;
  title: string;
  imageUrl?: string;
  priceTHB: number;
  qty: number;
}

function CartStep({
  lines,
  onQtyChange,
  onRemove,
  storeSlug,
}: {
  lines: Line[];
  onQtyChange: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  storeSlug: string;
}) {
  if (lines.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <ShoppingCart className="mx-auto h-12 w-12" style={{ color: EDU_INK_MUTED }} />
        <p className={`${FONT_HEADING} font-black text-lg`} style={{ color: EDU_INK }}>
          ตะกร้าว่างเปล่า
        </p>
        <p className="text-sm" style={{ color: EDU_INK_MUTED }}>
          เพิ่มสื่อก่อนเริ่มสั่งซื้อ
        </p>
        <Link
          href={`/stores/${storeSlug}`}
          className={`mt-2 inline-flex items-center gap-2 text-white ${FONT_HEADING} font-black px-6 py-2.5 rounded-full shadow transition-all hover:shadow-md`}
          style={{ background: EDU_PRIMARY }}
        >
          เลือกสื่อการสอน
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h2 className={`${FONT_HEADING} font-black text-xl`} style={{ color: EDU_INK }}>
        สื่อในตะกร้า ({lines.length} รายการ)
      </h2>
      <ul style={{ borderColor: EDU_BORDER_SOFT }} className="divide-y">
        {lines.map((l) => (
          <li key={l.productId} className="flex gap-4 py-4">
            <div
              className="h-20 w-20 rounded-xl overflow-hidden shrink-0"
              style={{ background: '#EFF6FF', border: `1px solid ${EDU_BORDER_SOFT}` }}
            >
              {l.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`${FONT_HEADING} font-bold text-sm line-clamp-2`} style={{ color: EDU_INK }}>
                {l.title}
              </p>
              <p className={`mt-1 ${FONT_HEADING} font-extrabold`} style={{ color: EDU_PRIMARY }}>
                {formatTHB(l.priceTHB)}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="inline-flex items-center rounded-full overflow-hidden"
                  style={{ border: `1px solid ${EDU_BORDER}`, background: EDU_BG_SOFT }}
                >
                  <button
                    type="button"
                    onClick={() => onQtyChange(l.productId, Math.max(1, l.qty - 1))}
                    className="px-2 py-1 transition-colors hover:bg-white"
                    style={{ color: EDU_PRIMARY }}
                    aria-label="ลด"
                  >
                    <Minus className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                  <span
                    className={`px-3 py-1 ${FONT_HEADING} font-black text-sm min-w-[2.5rem] text-center`}
                    style={{ color: EDU_INK, borderLeft: `1px solid ${EDU_BORDER}`, borderRight: `1px solid ${EDU_BORDER}` }}
                  >
                    {l.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onQtyChange(l.productId, l.qty + 1)}
                    className="px-2 py-1 transition-colors hover:bg-white"
                    style={{ color: EDU_PRIMARY }}
                    aria-label="เพิ่ม"
                  >
                    <Plus className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(l.productId)}
                  className="text-xs inline-flex items-center gap-1 transition-colors hover:opacity-70"
                  style={{ color: EDU_INK_MUTED }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> ลบ
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className={`${FONT_HEADING} font-black`} style={{ color: EDU_INK }}>
                {formatTHB(l.priceTHB * l.qty)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Step 2: recipient (email-based for digital products) ───────────
function RecipientStep({
  recipient,
  setRecipient,
}: {
  recipient: {
    name: string;
    email: string;
    schoolName: string;
    phone: string;
  };
  setRecipient: (r: typeof recipient) => void;
}) {
  const onChange =
    (key: keyof typeof recipient) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRecipient({ ...recipient, [key]: e.target.value });
    };

  return (
    <div className="space-y-4">
      <div>
        <h2 className={`${FONT_HEADING} font-black text-xl`} style={{ color: EDU_INK }}>
          อีเมลรับไฟล์ดาวน์โหลด
        </h2>
        <p className="text-xs mt-1" style={{ color: EDU_INK_MUTED }}>
          เราจะส่งลิงก์ดาวน์โหลดสื่อทั้งหมดไปที่อีเมลนี้ทันทีหลังชำระเงินสำเร็จ
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field name="ชื่อคุณครู *" placeholder="คุณครูสมศรี" value={recipient.name} onChange={onChange('name')} />
        <Field name="อีเมล *" placeholder="teacher@school.ac.th" value={recipient.email} type="email" onChange={onChange('email')} />
        <Field name="โรงเรียน" placeholder="โรงเรียนวัดราชโอรส" value={recipient.schoolName} onChange={onChange('schoolName')} />
        <Field name="เบอร์โทร (ไม่บังคับ)" placeholder="0xx-xxx-xxxx" value={recipient.phone} onChange={onChange('phone')} />
      </div>

      <div
        className="rounded-xl p-3 text-xs flex items-start gap-2"
        style={{ background: EDU_BG_SOFT, border: `1px solid ${EDU_ACCENT}40`, color: EDU_ACCENT_DEEP }}
      >
        <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
        <span>
          ตรวจสอบอีเมลให้ถูกต้อง — ลิงก์ดาวน์โหลดจะส่งไปที่อีเมลที่ระบุเท่านั้น สามารถดาวน์โหลดซ้ำได้ที่หน้า
          &ldquo;คำสั่งซื้อของฉัน&rdquo; ตลอด 24 ชั่วโมง
        </span>
      </div>
    </div>
  );
}

function Field({
  name,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <label className="space-y-1.5">
      <span
        className={`text-[11px] ${FONT_HEADING} font-black uppercase tracking-wider`}
        style={{ color: EDU_INK }}
      >
        {name}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
        style={
          {
            background: '#FFFFFF',
            border: `1px solid ${EDU_BORDER}`,
            color: EDU_INK,
            ['--tw-ring-color' as never]: `${EDU_PRIMARY}55`,
          } as React.CSSProperties
        }
      />
    </label>
  );
}

// ─── Step 3: payment ────────────────────────────────────────────────
function PaymentStep({
  paymentOptions,
  selectedId,
}: {
  paymentOptions: { id: string; name: string; desc: string }[];
  selectedId: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className={`${FONT_HEADING} font-black text-xl`} style={{ color: EDU_INK }}>
        วิธีชำระเงิน
      </h2>
      <p className="text-xs" style={{ color: EDU_INK_MUTED }}>
        คุณครูสามารถเลือกชำระผ่านพร้อมเพย์ บัตรเครดิต หรือ Mobile Banking
        เลือกในขั้นตอนถัดไปบนหน้า AnyPay
      </p>
      <div className="space-y-2">
        {paymentOptions.map((opt) => {
          const active = opt.id === selectedId;
          return (
            <div
              key={opt.id}
              className="rounded-2xl px-4 py-4 border-2 flex items-start gap-3"
              style={
                active
                  ? { background: EDU_BG_SOFT, borderColor: EDU_PRIMARY }
                  : { background: '#FFFFFF', borderColor: EDU_BORDER }
              }
            >
              <span
                className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0"
                style={{
                  borderColor: active ? EDU_PRIMARY : EDU_BORDER,
                  background: active ? EDU_PRIMARY : '#FFFFFF',
                }}
              >
                {active && <span className="block w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <div className="flex-1">
                <p className={`${FONT_HEADING} font-bold text-sm`} style={{ color: EDU_INK }}>
                  {opt.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: EDU_INK_MUTED }}>
                  {opt.desc}
                </p>
              </div>
              <CreditCard size={20} style={{ color: EDU_PRIMARY }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4: confirm ────────────────────────────────────────────────
function ConfirmStep({
  lines,
  recipient,
  total,
  error,
}: {
  lines: Line[];
  recipient: { name: string; email: string; schoolName: string; phone: string };
  total: number;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      <h2 className={`${FONT_HEADING} font-black text-xl`} style={{ color: EDU_INK }}>
        ตรวจสอบและยืนยัน
      </h2>

      <section
        className="rounded-2xl p-4 space-y-1 text-sm"
        style={{ background: EDU_BG_SOFT, border: `1px solid ${EDU_ACCENT}40` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Mail size={14} style={{ color: EDU_PRIMARY }} />
          <p className={`${FONT_HEADING} font-bold text-sm`} style={{ color: EDU_INK }}>
            ผู้รับไฟล์ดาวน์โหลด
          </p>
        </div>
        <p style={{ color: EDU_INK }}>
          {recipient.name} {recipient.phone && `· ${recipient.phone}`}
        </p>
        <p className={`${FONT_HEADING} font-bold`} style={{ color: EDU_PRIMARY }}>
          {recipient.email}
        </p>
        {recipient.schoolName && (
          <p className="text-xs mt-0.5" style={{ color: EDU_INK_MUTED }}>
            {recipient.schoolName}
          </p>
        )}
      </section>

      <section
        className="rounded-2xl p-4 text-sm"
        style={{ background: '#FFFFFF', border: `1px solid ${EDU_BORDER}` }}
      >
        <p className={`${FONT_HEADING} font-bold text-sm mb-2`} style={{ color: EDU_INK }}>
          รายการสื่อ ({lines.length})
        </p>
        <ul className="space-y-1.5">
          {lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-2">
              <span className="line-clamp-1 mr-2" style={{ color: EDU_INK_MUTED }}>
                {l.title} × {l.qty}
              </span>
              <span className={`${FONT_HEADING} font-bold shrink-0`} style={{ color: EDU_INK }}>
                {formatTHB(l.priceTHB * l.qty)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className={`text-right ${FONT_HEADING} font-black text-lg`} style={{ color: EDU_PRIMARY }}>
        รวม {formatTHB(total)}
      </p>

      {error && (
        <p
          className="text-sm px-3 py-2 rounded-lg"
          style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
