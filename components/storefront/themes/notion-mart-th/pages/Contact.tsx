'use client';

import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, Facebook, MapPin, Send, Check, type LucideIcon } from 'lucide-react';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

interface ContactStore {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  lineId?: string | null;
  facebookUrl?: string | null;
  messengerUrl?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  subdistrict?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
}

interface Props { store: ContactStore; }

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(' ');
}

export default function Contact({ store }: Props) {
  const address = joinAddress([store.addressLine1, store.addressLine2, store.subdistrict, store.district, store.province, store.postalCode]);

  const cards: Array<{ icon: LucideIcon; label: string; value: string | null | undefined; href?: string; }> = [
    { icon: Phone, label: 'โทรศัพท์', value: store.contactPhone, href: store.contactPhone ? `tel:${store.contactPhone.replace(/\s+/g, '')}` : undefined },
    { icon: Mail, label: 'อีเมล', value: store.contactEmail, href: store.contactEmail ? `mailto:${store.contactEmail}` : undefined },
    { icon: MessageCircle, label: 'LINE OA', value: store.lineId },
    { icon: Facebook, label: 'Facebook', value: store.facebookUrl ? 'เปิดหน้าเพจ' : null, href: store.facebookUrl ?? undefined },
  ];

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const fieldClass = 'w-full border border-[#E5E5E5] rounded px-3 py-2 text-[13px] focus:outline-none focus:border-[#1A1A1A] bg-white text-[#1A1A1A]';

  function handleSubmit(e: React.FormEvent) {
    if (store.contactEmail) { setTimeout(() => setSubmitted(true), 200); return; }
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className={`bg-white text-[#1A1A1A] min-h-screen ${FONT_BODY}`}>
      <section className="border-b border-[#E5E5E5] bg-[#F7F6F3] px-4 sm:px-8 lg:px-16 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto">
          <p className={`text-[10px] tracking-[0.16em] uppercase ${FONT_HEADING} font-medium text-[#6B6B6B] mb-3`}>ติดต่อเรา</p>
          <h1 className={`${FONT_HEADING} font-bold text-3xl sm:text-5xl text-[#1A1A1A] leading-tight`}>✉️ ติดต่อ {store.name}</h1>
          <p className="mt-3 text-[13px] text-[#6B6B6B] max-w-2xl">ติดต่อเราเรื่องเทมเพลต การชำระเงิน หรือคำแนะนำ · ตอบทุกข้อความภายใน 24 ชม.</p>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-16 pt-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map(({ icon: Icon, label, value, href }) =>
            value ? (
              <div key={label} className="bg-white border border-[#E5E5E5] rounded-md p-4 hover:border-[#1A1A1A] transition-colors flex flex-col gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#F7F6F3] border border-[#E5E5E5] text-[#2563EB]"><Icon className="h-4 w-4" /></span>
                <p className={`${FONT_HEADING} font-semibold text-[12.5px] text-[#1A1A1A] uppercase tracking-[0.08em]`}>{label}</p>
                {href ? (
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="text-[13px] text-[#1A1A1A] hover:text-[#2563EB] hover:underline underline-offset-2 break-all">{value}</a>
                ) : (
                  <p className="text-[13px] text-[#1A1A1A] break-all">{value}</p>
                )}
              </div>
            ) : null,
          )}
        </div>
      </section>

      {address && (
        <section className="px-4 sm:px-8 lg:px-16 pt-6">
          <div className="max-w-5xl mx-auto bg-[#F7F6F3] border border-[#E5E5E5] rounded-md p-4 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <p className={`${FONT_HEADING} font-semibold text-[12.5px] text-[#1A1A1A] uppercase tracking-[0.08em]`}>ที่อยู่</p>
              <p className="mt-1 text-[13px] text-[#1A1A1A] leading-relaxed">{address}</p>
            </div>
          </div>
        </section>
      )}

      <section className="px-4 sm:px-8 lg:px-16 py-10">
        <div className="max-w-3xl mx-auto">
          <h2 className={`${FONT_HEADING} font-bold text-2xl text-[#1A1A1A] mb-4`}>ส่งข้อความถึงเรา</h2>
          {submitted ? (
            <div className="border border-[#16A34A] bg-[#F0FDF4] rounded-md p-5 flex items-start gap-3">
              <Check className="h-5 w-5 text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <p className={`${FONT_HEADING} font-semibold text-[#1A1A1A]`}>ส่งข้อความสำเร็จ</p>
                <p className="mt-1 text-[13px] text-[#1A1A1A]">เราจะตอบกลับภายใน 24 ชั่วโมง · ขอบคุณที่ติดต่อ {store.name}</p>
              </div>
            </div>
          ) : (
            <form method="post" action={`/api/stores/${store.slug}/contact`} onSubmit={handleSubmit} aria-label="แบบฟอร์มติดต่อ" className="bg-white border border-[#E5E5E5] rounded-md p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[11px] tracking-[0.1em] uppercase font-[family:var(--font-kanit)] font-medium text-[#6B6B6B]">ชื่อ *</span>
                  <input type="text" name="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} placeholder="ชื่อของคุณ" />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] tracking-[0.1em] uppercase font-[family:var(--font-kanit)] font-medium text-[#6B6B6B]">อีเมล *</span>
                  <input type="email" name="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldClass} placeholder="you@example.com" />
                </label>
              </div>
              <label className="space-y-1 block">
                <span className="text-[11px] tracking-[0.1em] uppercase font-[family:var(--font-kanit)] font-medium text-[#6B6B6B]">หัวข้อ</span>
                <input type="text" name="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={fieldClass} placeholder="เช่น สอบถามเทมเพลต ระบบงาน" />
              </label>
              <label className="space-y-1 block">
                <span className="text-[11px] tracking-[0.1em] uppercase font-[family:var(--font-kanit)] font-medium text-[#6B6B6B]">ข้อความ *</span>
                <textarea name="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${fieldClass} resize-y`} placeholder="พิมพ์คำถาม / คอมเมนต์ของคุณที่นี่..." />
              </label>
              <button type="submit" className="inline-flex items-center gap-1.5 bg-black hover:bg-[#1A1A1A] text-white text-[13px] font-medium px-5 py-2.5 rounded transition-colors">
                <Send className="h-3.5 w-3.5" />ส่งข้อความ
              </button>
              <p className="text-[11px] text-[#6B6B6B] pt-1">
                หรือส่งอีเมลตรงไปยัง{' '}
                {store.contactEmail ? (
                  <a href={`mailto:${store.contactEmail}`} className="text-[#2563EB] hover:underline underline-offset-2">{store.contactEmail}</a>
                ) : ('อีเมลของทีมงาน')}
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
