'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  QrCode,
  Check,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface InitialCartLine {
  productId: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  qty: number;
  storeSlug: string;
}

export interface PackagingSupplyCheckoutProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  items: InitialCartLine[];
}

type Step = 1 | 2 | 3;

const STEPS: Array<{ id: Step; label: string }> = [
  { id: 1, label: 'ที่อยู่จัดส่ง' },
  { id: 2, label: 'การจัดส่ง' },
  { id: 3, label: 'ชำระเงิน' },
];

// ANYPAY-only — gateway routes to PromptPay / Visa / Mastercard /
// TrueMoney / Rabbit LINE Pay internally. COD removed per project rule
// (CJ Dropshipping does not support cash-on-delivery).
const PAYMENTS = [
  { id: 'anypay', label: 'ANYPAY · พร้อมเพย์ / บัตร / TrueMoney', icon: CreditCard, note: 'ระบบรับชำระเงินที่ปลอดภัย รองรับทุกช่องทาง' },
];

const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'ส่งมาตรฐาน', eta: '2-3 วันทำการ', priceTHB: 50 },
  { id: 'express', label: 'ส่งด่วน 1 วัน', eta: 'พรุ่งนี้ (BKK/ปริมณฑล)', priceTHB: 120 },
  { id: 'pickup', label: 'รับเองที่คลังสินค้า', eta: 'พร้อมรับใน 4 ชม.', priceTHB: 0 },
];

export function Checkout({ store }: PackagingSupplyCheckoutProps) {
  const allLines = useCart((s) => s.lines);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [shippingId, setShippingId] = useState('standard');
  const [paymentId, setPaymentId] = useState('promptpay');
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === store.slug);
  const itemTotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const shippingChoice = SHIPPING_OPTIONS.find((s) => s.id === shippingId) ?? SHIPPING_OPTIONS[0];
  const shippingCost = itemTotal >= 990 && shippingChoice.id !== 'express' ? 0 : shippingChoice.priceTHB;
  const total = itemTotal + shippingCost;
  const totalItems = lines.reduce((n, l) => n + l.qty, 0);

  if (!mounted) return <div className="min-h-[60vh]" />;

  const cartUrl = `/stores/${store.slug}/cart`;

  if (lines.length === 0) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-[var(--shop-bg)] px-4 font-[family:var(--font-prompt)] text-[var(--shop-ink)]">
        <div className="text-center max-w-md">
          <Package size={48} className="mx-auto text-[var(--pks-ink-dim)] mb-3" />
          <h1 className="font-[family:var(--font-kanit)] font-extrabold text-2xl">ไม่มีสินค้าให้ชำระ</h1>
          <p className="text-sm text-[var(--shop-ink-muted)] mt-2">
            กรุณาเพิ่มสินค้าลงตะกร้าก่อนทำการสั่งซื้อ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="mt-5 inline-flex items-center gap-2 bg-[var(--shop-primary)] hover:bg-[var(--pks-pink-deep)] text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            เลือกซื้อสินค้า <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  const advance = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep((s) => ((s + 1) as Step));
  };

  return (
    <main className="min-h-screen bg-[var(--shop-bg)] font-[family:var(--font-prompt)] text-[var(--shop-ink)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <nav className="text-xs text-[var(--shop-ink-muted)] mb-4" aria-label="breadcrumb">
          <Link href={`/stores/${store.slug}`} className="hover:text-[var(--shop-primary)]">
            {store.name}
          </Link>
          <span className="mx-1.5">›</span>
          <Link href={cartUrl} className="hover:text-[var(--shop-primary)]">ตะกร้า</Link>
          <span className="mx-1.5">›</span>
          <span className="text-[var(--shop-ink)] font-semibold">ชำระเงิน</span>
        </nav>

        <h1 className="font-[family:var(--font-kanit)] font-extrabold text-3xl sm:text-4xl mb-6 tracking-tight">
          ชำระเงิน
        </h1>

        {/* Stepper */}
        <ol className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          {STEPS.map((s) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <li
                key={s.id}
                className={`rounded-2xl border-2 px-3 py-3 flex items-center gap-2.5 transition-all ${
                  active
                    ? 'border-[var(--shop-primary)] bg-[var(--shop-bg-soft)]'
                    : done
                    ? 'border-[var(--shop-savings)] bg-[var(--pks-blue-soft)]'
                    : 'border-[var(--shop-border)] bg-[var(--shop-card)]'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    done
                      ? 'bg-[var(--shop-savings)] text-white'
                      : active
                      ? 'bg-[var(--shop-primary)] text-white'
                      : 'bg-[var(--shop-muted)] text-[var(--shop-ink-muted)]'
                  }`}
                >
                  {done ? <Check size={14} /> : s.id}
                </span>
                <span className="text-xs sm:text-sm font-bold truncate">{s.label}</span>
              </li>
            );
          })}
        </ol>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Forms */}
          <section className="lg:col-span-7 xl:col-span-8 space-y-5">
            <form
              onSubmit={advance}
              className="bg-[var(--shop-card)] rounded-2xl border border-[var(--shop-border)] p-5 lg:p-6 space-y-5"
            >
              {step === 1 && (
                <>
                  <h2 className="font-[family:var(--font-kanit)] font-bold text-xl">
                    ที่อยู่จัดส่ง
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldInput label="ชื่อ-นามสกุล" placeholder="คุณชนิดา ทดสอบ" required />
                    <FieldInput label="เบอร์โทรศัพท์" placeholder="081-234-5678" required type="tel" />
                    <FieldInput label="ชื่อร้าน / บริษัท (ถ้ามี)" placeholder="ร้าน Ploy Shop" />
                    <FieldInput label="เลขผู้เสียภาษี (ถ้ามี)" placeholder="13 หลัก" />
                  </div>
                  <FieldInput label="ที่อยู่" placeholder="123/45 ซอย..." required />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FieldInput label="แขวง/ตำบล" placeholder="ลาดยาว" required />
                    <FieldInput label="เขต/อำเภอ" placeholder="จตุจักร" required />
                    <FieldInput label="จังหวัด" placeholder="กรุงเทพมหานคร" required />
                  </div>
                  <FieldInput label="รหัสไปรษณีย์" placeholder="10900" required />
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="font-[family:var(--font-kanit)] font-bold text-xl">
                    เลือกวิธีจัดส่ง
                  </h2>
                  <ul className="space-y-2.5">
                    {SHIPPING_OPTIONS.map((opt) => {
                      const sel = shippingId === opt.id;
                      const isFree = itemTotal >= 990 && opt.id !== 'express';
                      return (
                        <li key={opt.id}>
                          <label
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              sel
                                ? 'border-[var(--shop-primary)] bg-[var(--shop-bg-soft)]'
                                : 'border-[var(--shop-border)] hover:border-[var(--pks-ink-dim)]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="shipping"
                              value={opt.id}
                              checked={sel}
                              onChange={() => setShippingId(opt.id)}
                              className="sr-only"
                            />
                            <span
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                sel
                                  ? 'border-[var(--shop-primary)] bg-[var(--shop-primary)]'
                                  : 'border-[var(--shop-border)]'
                              }`}
                            >
                              {sel && <span className="w-2 h-2 rounded-full bg-white" />}
                            </span>
                            <Truck size={20} className="text-[var(--shop-primary)] shrink-0" />
                            <div className="flex-1">
                              <div className="font-bold text-sm">{opt.label}</div>
                              <div className="text-xs text-[var(--shop-ink-muted)] mt-0.5">{opt.eta}</div>
                            </div>
                            <div className="font-[family:var(--font-kanit)] font-extrabold text-sm">
                              {opt.priceTHB === 0 ? (
                                <span className="text-[var(--shop-savings)]">ฟรี</span>
                              ) : isFree ? (
                                <span>
                                  <span className="text-[var(--pks-ink-dim)] line-through mr-1">
                                    {formatTHB(opt.priceTHB)}
                                  </span>
                                  <span className="text-[var(--shop-savings)]">ฟรี</span>
                                </span>
                              ) : (
                                formatTHB(opt.priceTHB)
                              )}
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="font-[family:var(--font-kanit)] font-bold text-xl">
                    เลือกวิธีชำระเงิน
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENTS.map((p) => {
                      const sel = paymentId === p.id;
                      return (
                        <li key={p.id}>
                          <label
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all h-full ${
                              sel
                                ? 'border-[var(--shop-primary)] bg-[var(--shop-bg-soft)]'
                                : 'border-[var(--shop-border)] hover:border-[var(--pks-ink-dim)]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={p.id}
                              checked={sel}
                              onChange={() => setPaymentId(p.id)}
                              className="sr-only"
                            />
                            <span
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                sel
                                  ? 'border-[var(--shop-primary)] bg-[var(--shop-primary)]'
                                  : 'border-[var(--shop-border)]'
                              }`}
                            >
                              {sel && <span className="w-2 h-2 rounded-full bg-white" />}
                            </span>
                            <p.icon size={20} className="text-[var(--shop-primary)] shrink-0" />
                            <div>
                              <div className="font-bold text-sm">{p.label}</div>
                              <div className="text-[11px] text-[var(--shop-ink-muted)] mt-0.5">
                                {p.note}
                              </div>
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  <label className="flex items-start gap-3 text-xs text-[var(--shop-ink-muted)] pt-2">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 accent-[var(--shop-primary)]"
                    />
                    <span>
                      ฉันยอมรับ{' '}
                      <Link href="#" className="text-[var(--shop-primary)] underline">
                        ข้อตกลงและเงื่อนไข
                      </Link>{' '}
                      และ{' '}
                      <Link href="#" className="text-[var(--shop-primary)] underline">
                        นโยบายความเป็นส่วนตัว
                      </Link>
                    </span>
                  </label>
                </>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => ((s - 1) as Step))}
                    className="text-sm font-semibold text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)]"
                  >
                    ← ย้อนกลับ
                  </button>
                ) : (
                  <Link
                    href={cartUrl}
                    className="text-sm font-semibold text-[var(--shop-ink-muted)] hover:text-[var(--shop-primary)]"
                  >
                    ← กลับไปยังตะกร้า
                  </Link>
                )}
                <button
                  type="submit"
                  disabled={step === 3 && !acceptTerms}
                  className="inline-flex items-center gap-2 bg-[var(--shop-primary)] hover:bg-[var(--pks-pink-deep)] disabled:bg-[var(--pks-ink-dim)] disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-full transition-colors"
                >
                  {step === 3 ? (
                    <>
                      ยืนยันสั่งซื้อ {formatTHB(total)} <Sparkles size={16} />
                    </>
                  ) : (
                    <>
                      ดำเนินการต่อ <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="rounded-2xl bg-[var(--shop-bg-soft)] border border-[var(--shop-border)] p-4 flex items-start gap-3">
              <ShieldCheck size={20} className="text-[var(--shop-savings)] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-[var(--shop-ink-muted)]">
                ข้อมูลการชำระเงินถูกเข้ารหัสด้วย SSL · เราไม่เก็บข้อมูลบัตรเครดิตของคุณ
                และพร้อมออกใบกำกับภาษีเต็มรูปแบบสำหรับลูกค้านิติบุคคล
              </div>
            </div>
          </section>

          {/* Summary */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 bg-[var(--shop-card)] rounded-2xl border border-[var(--shop-border)] p-5 space-y-4">
              <h2 className="font-[family:var(--font-kanit)] font-bold text-lg">สรุปคำสั่งซื้อ</h2>
              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {lines.map((l) => (
                  <li key={l.productId} className="flex gap-3 text-xs">
                    <div className="w-14 h-14 rounded-lg bg-[var(--shop-muted)] overflow-hidden border border-[var(--shop-border)] shrink-0">
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.imageUrl} alt={l.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--pks-ink-dim)]">
                          <Package size={18} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold line-clamp-2">{l.title}</div>
                      <div className="text-[var(--shop-ink-muted)] mt-0.5">
                        {l.qty.toLocaleString('th-TH')} ชิ้น × {formatTHB(l.priceTHB)}
                      </div>
                    </div>
                    <div className="font-bold shrink-0">
                      {formatTHB(l.priceTHB * l.qty)}
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="space-y-2 text-sm pt-3 border-t border-dashed border-[var(--shop-border)]">
                <div className="flex justify-between">
                  <dt className="text-[var(--shop-ink-muted)]">
                    รวมสินค้า ({totalItems.toLocaleString('th-TH')} ชิ้น)
                  </dt>
                  <dd className="font-semibold">{formatTHB(itemTotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--shop-ink-muted)]">ค่าจัดส่ง</dt>
                  <dd className={`font-semibold ${shippingCost === 0 ? 'text-[var(--shop-savings)]' : ''}`}>
                    {shippingCost === 0 ? 'ฟรี' : formatTHB(shippingCost)}
                  </dd>
                </div>
              </dl>
              <div className="flex items-baseline justify-between pt-3 border-t border-[var(--shop-border)]">
                <span className="text-sm font-bold">รวมทั้งสิ้น</span>
                <span className="font-[family:var(--font-kanit)] font-extrabold text-2xl text-[var(--shop-primary)]">
                  {formatTHB(total)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function FieldInput({ label, ...rest }: FieldInputProps) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-[var(--shop-ink-muted)] mb-1.5 uppercase tracking-wider">
        {label}
      </span>
      <input
        {...rest}
        className="w-full px-4 py-2.5 text-sm rounded-xl bg-[var(--shop-muted)] border border-[var(--shop-border)] focus:border-[var(--shop-primary)] focus:bg-[var(--shop-bg)] focus:outline-none text-[var(--shop-ink)] placeholder:text-[var(--pks-ink-dim)] transition-colors"
      />
    </label>
  );
}

export default Checkout;
