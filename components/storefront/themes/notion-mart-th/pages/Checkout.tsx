'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, CreditCard, Check, Minus, Plus, Trash2, Download } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CheckoutProps } from '@/lib/templates/types';

type StepId = 'cart' | 'contact' | 'payment' | 'confirm';
const STEPS: { id: StepId; title: string; icon: typeof ShoppingCart }[] = [
  { id: 'cart', title: 'ตะกร้า', icon: ShoppingCart },
  { id: 'contact', title: 'ผู้รับ', icon: User },
  { id: 'payment', title: 'ชำระเงิน', icon: CreditCard },
  { id: 'confirm', title: 'ยืนยัน', icon: Check },
];

const PAYMENT_OPTIONS = [{ id: 'ANYPAY', name: 'AnyPay · PromptPay / บัตรเครดิต' }];
const FREE_SHIPPING_THRESHOLD = 990;

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

export default function NotionMartCheckout({ store }: CheckoutProps) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clearStore = useCart((s) => s.clearStore);
  const allCodes = useCart((s) => s.couponCodesByStore);

  const lines = useMemo(() => allLines.filter((l) => l.storeSlug === store.slug), [allLines, store.slug]);
  const subtotal = useMemo(() => lines.reduce((n, l) => n + l.priceTHB * l.qty, 0), [lines]);
  const couponCodes = useMemo(() => allCodes[store.slug] ?? [], [allCodes, store.slug]);

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEPS[stepIndex].id;
  const [contact, setContact] = useState({ recipientName: '', email: '', phone: '' });
  const [paymentId] = useState(PAYMENT_OPTIONS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : Math.min(50, subtotal > 0 ? 50 : 0);
  const total = subtotal + shippingCost;

  const canAdvanceContact =
    contact.recipientName.trim().length > 0 &&
    /.+@.+\..+/.test(contact.email.trim()) &&
    contact.phone.trim().length > 0;

  const next = () => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  async function placeOrder() {
    if (lines.length === 0) { setError('ตะกร้าว่าง ไม่สามารถสั่งซื้อได้'); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storeSlug: store.slug,
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          address: { recipientName: contact.recipientName, phone: contact.phone, line1: contact.recipientName, line2: contact.email, subdistrict: '', district: '', province: '-', postalCode: '00000', country: 'TH' },
          shipping: { method: 'DIGITAL', priceTHB: shippingCost },
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
      <main className={`bg-white text-[#1A1A1A] min-h-screen ${FONT_BODY}`}>
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-black text-white mb-5"><Check className="h-7 w-7" /></div>
          <h1 className={`${FONT_HEADING} font-bold text-3xl text-[#1A1A1A]`}>สั่งซื้อสำเร็จ</h1>
          {submittedOrderId && <p className="mt-3 text-[13px] text-[#6B6B6B]">รหัสออเดอร์: <span className="font-semibold text-[#1A1A1A]">{submittedOrderId}</span></p>}
          <p className="mt-2 text-[13px] text-[#6B6B6B]">เราส่งลิงก์ดาวน์โหลดและรายละเอียดไปยังอีเมลที่คุณกรอกแล้ว</p>
          <div className="mt-8 flex justify-center gap-2">
            <Link href={`/stores/${store.slug}`} className="inline-flex items-center gap-1.5 bg-black hover:bg-[#1A1A1A] text-white text-[13px] font-medium px-5 py-2.5 rounded transition-colors">เลือกซื้อสินค้าต่อ</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`bg-white text-[#1A1A1A] min-h-screen ${FONT_BODY}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <nav aria-label="ขั้นตอนสั่งซื้อ" className="mb-8">
          <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === stepIndex;
              const isDone = idx < stepIndex;
              return (
                <li key={step.id} className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${isActive ? 'bg-black text-white border-black' : isDone ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#6B6B6B] border-[#E5E5E5]'}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`hidden sm:inline ${FONT_HEADING} font-medium text-[12px] uppercase tracking-[0.1em] ${isActive ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>{step.title}</span>
                  {idx < STEPS.length - 1 && <span className="hidden sm:inline text-[#E5E5E5]">/</span>}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E5E5E5] rounded-md p-5 sm:p-6">
            {currentStep === 'cart' && <CartStep lines={lines} onQtyChange={(p, q) => setQty(p, q, store.slug)} onRemove={(p) => remove(p, store.slug)} storeSlug={store.slug} />}
            {currentStep === 'contact' && <ContactStep contact={contact} setContact={setContact} />}
            {currentStep === 'payment' && <PaymentStep paymentName={PAYMENT_OPTIONS[0].name} />}
            {currentStep === 'confirm' && <ConfirmStep lines={lines} contact={contact} total={total} error={error} />}
          </div>

          <aside className="bg-white border border-[#E5E5E5] rounded-md p-5 h-fit space-y-3">
            <h3 className={`${FONT_HEADING} font-bold text-[15px] text-[#1A1A1A] border-b border-[#E5E5E5] pb-3`}>สรุปคำสั่งซื้อ</h3>
            <div className="flex justify-between text-[13px]"><span className="text-[#1A1A1A]">สินค้า {lines.length} รายการ</span><span className="font-semibold text-[#1A1A1A] tabular-nums">{formatTHB(subtotal)}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-[#1A1A1A]">ค่าบริการ</span><span className="font-semibold text-[#1A1A1A] tabular-nums">{shippingCost === 0 ? 'ฟรี' : formatTHB(shippingCost)}</span></div>
            <div className="border-t border-[#E5E5E5] pt-3 flex items-baseline justify-between">
              <span className={`${FONT_HEADING} font-bold text-[14px] text-[#1A1A1A]`}>ยอดรวม</span>
              <span className={`${FONT_HEADING} font-bold text-xl text-[#1A1A1A] tabular-nums`}>{formatTHB(total)}</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {currentStep !== 'confirm' ? (
                <button type="button" onClick={next} disabled={(currentStep === 'cart' && lines.length === 0) || (currentStep === 'contact' && !canAdvanceContact)} className="w-full bg-black hover:bg-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium px-4 py-2.5 rounded transition-colors">ดำเนินการต่อ →</button>
              ) : (
                <button type="button" onClick={placeOrder} disabled={submitting || lines.length === 0} className="w-full bg-black hover:bg-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium px-4 py-2.5 rounded transition-colors">{submitting ? 'กำลังสั่งซื้อ...' : 'ยืนยันสั่งซื้อ'}</button>
              )}
              {stepIndex > 0 && !submitting && (
                <button type="button" onClick={back} className="w-full bg-white border border-[#E5E5E5] hover:bg-[#F7F6F3] text-[#1A1A1A] text-[12px] font-medium px-4 py-2 rounded transition-colors">← ย้อนกลับ</button>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B] pt-2 border-t border-[#E5E5E5]"><Download className="h-3 w-3 text-[#2563EB]" />ดาวน์โหลดทันทีหลังชำระ</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

interface Line { productId: string; title: string; imageUrl?: string; priceTHB: number; qty: number; }

function CartStep({ lines, onQtyChange, onRemove, storeSlug }: { lines: Line[]; onQtyChange: (p: string, q: number) => void; onRemove: (p: string) => void; storeSlug: string; }) {
  if (lines.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-3xl mb-2" aria-hidden>🛒</p>
        <p className={`${FONT_HEADING} font-bold text-lg text-[#1A1A1A]`}>ตะกร้าว่างเปล่า</p>
        <p className="mt-1 text-[13px] text-[#6B6B6B]">เพิ่มเทมเพลตก่อนเริ่มสั่งซื้อ</p>
        <Link href={`/stores/${storeSlug}`} className="mt-6 inline-flex items-center gap-1.5 bg-black hover:bg-[#1A1A1A] text-white text-[12.5px] font-medium px-4 py-2 rounded transition-colors">เลือกซื้อสินค้า</Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <h2 className={`${FONT_HEADING} font-bold text-xl text-[#1A1A1A]`}>ตะกร้าของคุณ ({lines.length} รายการ)</h2>
      <ul className="divide-y divide-[#E5E5E5]">
        {lines.map((l) => (
          <li key={l.productId} className="flex gap-3 py-3">
            <div className="h-16 w-16 bg-[#F7F6F3] border border-[#E5E5E5] rounded shrink-0 overflow-hidden flex items-center justify-center">
              {l.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl" aria-hidden>📄</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`${FONT_HEADING} font-semibold text-[13px] text-[#1A1A1A] line-clamp-2`}>{l.title}</p>
              <p className="mt-1 text-[12.5px] font-semibold text-[#1A1A1A] tabular-nums">{formatTHB(l.priceTHB)}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="inline-flex items-center border border-[#E5E5E5] rounded">
                  <button type="button" onClick={() => onQtyChange(l.productId, Math.max(1, l.qty - 1))} className="px-2 py-1 hover:bg-[#F7F6F3] text-[#1A1A1A]" aria-label="ลดจำนวน"><Minus className="h-3 w-3" /></button>
                  <span className={`${FONT_HEADING} font-semibold text-[12px] px-2.5 py-0.5 min-w-[2rem] text-center text-[#1A1A1A] tabular-nums border-x border-[#E5E5E5]`}>{l.qty}</span>
                  <button type="button" onClick={() => onQtyChange(l.productId, l.qty + 1)} className="px-2 py-1 hover:bg-[#F7F6F3] text-[#1A1A1A]" aria-label="เพิ่มจำนวน"><Plus className="h-3 w-3" /></button>
                </div>
                <button type="button" onClick={() => onRemove(l.productId)} className="text-[11px] text-[#6B6B6B] hover:text-[#DC2626] inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /> ลบ</button>
              </div>
            </div>
            <div className="text-right"><p className="text-[13px] font-semibold text-[#1A1A1A] tabular-nums">{formatTHB(l.priceTHB * l.qty)}</p></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactStep({ contact, setContact }: { contact: { recipientName: string; email: string; phone: string }; setContact: (c: typeof contact) => void; }) {
  const onChange = (key: keyof typeof contact) => (e: React.ChangeEvent<HTMLInputElement>) => { setContact({ ...contact, [key]: e.target.value }); };
  const fieldClass = 'w-full border border-[#E5E5E5] rounded px-3 py-2 text-[13px] focus:outline-none focus:border-[#1A1A1A] bg-white text-[#1A1A1A]';
  return (
    <div className="space-y-4">
      <h2 className={`${FONT_HEADING} font-bold text-xl text-[#1A1A1A]`}>ข้อมูลผู้รับ</h2>
      <p className="text-[12.5px] text-[#6B6B6B]">สินค้าเป็นไฟล์ดิจิทัล · เราจะส่งลิงก์ดาวน์โหลดไปที่อีเมลของคุณ</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-[11px] tracking-[0.1em] uppercase font-[family:var(--font-kanit)] font-medium text-[#6B6B6B]">ชื่อ-นามสกุล *</span>
          <input type="text" value={contact.recipientName} onChange={onChange('recipientName')} className={fieldClass} placeholder="ชื่อผู้รับ" />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] tracking-[0.1em] uppercase font-[family:var(--font-kanit)] font-medium text-[#6B6B6B]">เบอร์โทร *</span>
          <input type="tel" value={contact.phone} onChange={onChange('phone')} className={fieldClass} placeholder="0xx-xxx-xxxx" />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-[11px] tracking-[0.1em] uppercase font-[family:var(--font-kanit)] font-medium text-[#6B6B6B]">อีเมล * (ส่งลิงก์ดาวน์โหลด)</span>
          <input type="email" value={contact.email} onChange={onChange('email')} className={fieldClass} placeholder="you@example.com" />
        </label>
      </div>
    </div>
  );
}

function PaymentStep({ paymentName }: { paymentName: string }) {
  return (
    <div className="space-y-4">
      <h2 className={`${FONT_HEADING} font-bold text-xl text-[#1A1A1A]`}>วิธีชำระเงิน</h2>
      <div className="border-2 border-[#1A1A1A] bg-[#F7F6F3] rounded px-4 py-3">
        <p className={`${FONT_HEADING} font-semibold text-[13px] text-[#1A1A1A]`}>{paymentName}</p>
        <p className="text-[11px] text-[#6B6B6B] mt-0.5">PromptPay · บัตรเครดิต · BNPL · ชำระแล้วได้ลิงก์ดาวน์โหลดทันที</p>
      </div>
    </div>
  );
}

function ConfirmStep({ lines, contact, total, error }: { lines: Line[]; contact: { recipientName: string; email: string; phone: string }; total: number; error: string | null; }) {
  return (
    <div className="space-y-3">
      <h2 className={`${FONT_HEADING} font-bold text-xl text-[#1A1A1A]`}>ตรวจสอบและยืนยัน</h2>
      <section className="border border-[#E5E5E5] rounded p-3 bg-[#F7F6F3] text-[13px] space-y-0.5">
        <p className="font-semibold text-[#1A1A1A]">ผู้รับ</p>
        <p className="text-[#1A1A1A]">{contact.recipientName} · {contact.phone}</p>
        <p className="text-[#6B6B6B]">{contact.email}</p>
      </section>
      <section className="border border-[#E5E5E5] rounded p-3 bg-[#F7F6F3] text-[13px]">
        <p className="font-semibold text-[#1A1A1A] mb-1.5">รายการสินค้า ({lines.length})</p>
        <ul className="space-y-1">
          {lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-2">
              <span className="text-[#1A1A1A] line-clamp-1">{l.title} × {l.qty}</span>
              <span className="font-semibold text-[#1A1A1A] shrink-0 tabular-nums">{formatTHB(l.priceTHB * l.qty)}</span>
            </li>
          ))}
        </ul>
      </section>
      <p className={`text-right ${FONT_HEADING} font-bold text-lg text-[#1A1A1A] tabular-nums`}>รวม {formatTHB(total)}</p>
      {error && <p className="text-[12.5px] text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5] rounded px-3 py-2">{error}</p>}
    </div>
  );
}
