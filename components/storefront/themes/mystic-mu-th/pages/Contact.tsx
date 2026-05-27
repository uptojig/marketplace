'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Send,
  Sparkles,
  Coins,
} from 'lucide-react';

interface ContactProps {
  store: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    lineId?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postalCode?: string | null;
  };
}

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(' ');
}

/**
 * MysticMu Contact — Mario "post office". Pixel-bordered form left,
 * channel cards (LINE / email / phone / FB / IG) right, optional
 * address card at the bottom of the right rail.
 */
export default function Contact({ store }: ContactProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const line1 = joinAddress([store.addressLine1, store.addressLine2]);
  const line2 = joinAddress([store.subdistrict, store.district]);
  const line3 = joinAddress([store.province, store.postalCode]);
  const hasAddress = !!(line1 || line2 || line3);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/stores/${store.slug}/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setResult('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        const mailto = `mailto:${store.contactEmail || ''}?subject=${encodeURIComponent(
          form.subject || `[${store.name}] ติดต่อจากเว็บไซต์`,
        )}&body=${encodeURIComponent(`${form.message}\n\nจาก: ${form.name} <${form.email}>`)}`;
        window.location.href = mailto;
        setResult('success');
      }
    } catch {
      setErrorMsg('เครือข่ายไม่ตอบสนอง ลองอีกครั้ง');
      setResult('error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#5C94FC] text-[#1A1A2E] font-[family:var(--font-prompt)] min-h-screen pb-16">
      {/* Hero */}
      <section className="bg-[#E52521] border-b-4 border-[#1A1A2E] px-4 py-12 sm:py-16 relative overflow-hidden">
        <div
          className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#FFD700] border-4 border-[#1A1A2E] rotate-12 hidden md:flex items-center justify-center shadow-[4px_4px_0_0_#1A1A2E]"
          aria-hidden
        >
          <Sparkles className="w-12 h-12 text-[#E52521]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-4 py-1 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] mb-4 font-[family:var(--font-kanit)]">
            <Coins className="w-3.5 h-3.5 text-[#E52521]" /> Contact
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[5px_5px_0_#1A1A2E]">
            ติดต่ออาจารย์มู
          </h1>
          <p className="text-white font-bold mt-3 uppercase tracking-widest text-sm drop-shadow-[2px_2px_0_#1A1A2E]">
            ตอบกลับภายใน 24 ชั่วโมง ⭐
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-6 sm:p-8 space-y-4"
        >
          <h2 className="font-[family:var(--font-kanit)] font-black text-2xl uppercase tracking-tight border-b-4 border-[#1A1A2E] pb-3 mb-4 flex items-center gap-2">
            <Send className="w-6 h-6 text-[#E52521]" />
            ส่งข้อความหาเรา
          </h2>

          {result === 'success' && (
            <div className="border-4 border-[#1A1A2E] bg-[#009A4E] text-white p-4 font-[family:var(--font-kanit)] font-black uppercase text-sm flex items-center gap-2 shadow-[3px_3px_0_0_#1A1A2E]">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              ส่งข้อความเรียบร้อย! เราจะรีบติดต่อกลับ
            </div>
          )}
          {errorMsg && (
            <div className="border-4 border-[#E52521] bg-[#FFF0F0] text-[#E52521] p-4 font-bold uppercase text-xs tracking-widest">
              {errorMsg}
            </div>
          )}

          <Field
            label="ชื่อ"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <Field
            label="อีเมล"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            type="email"
            required
          />
          <Field
            label="หัวข้อ"
            value={form.subject}
            onChange={(v) => setForm({ ...form, subject: v })}
            required
          />
          <div>
            <label className="block font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest mb-1">
              ข้อความ
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={6}
              className="w-full border-4 border-[#1A1A2E] px-3 py-2 text-sm font-bold focus:outline-none focus:bg-[#FFF8DC] resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="h-14 w-full px-6 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[6px_6px_0_0_#1A1A2E] hover:bg-[#009A4E] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-5 h-5" />
            {submitting ? 'กำลังส่ง…' : 'ส่งข้อความ'}
          </button>
        </form>

        {/* Contact methods */}
        <aside className="space-y-4">
          {store.contactEmail && (
            <ContactCard
              icon={Mail}
              label="อีเมล"
              value={store.contactEmail}
              href={`mailto:${store.contactEmail}`}
              bg="bg-[#E52521] text-white"
            />
          )}
          {store.contactPhone && (
            <ContactCard
              icon={Phone}
              label="โทรศัพท์"
              value={store.contactPhone}
              href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
              bg="bg-[#FFD700] text-[#1A1A2E]"
            />
          )}
          {store.lineId && (
            <ContactCard
              icon={MessageCircle}
              label="LINE"
              value={`@${store.lineId}`}
              href={`https://line.me/ti/p/~${store.lineId}`}
              bg="bg-[#009A4E] text-white"
            />
          )}
          {store.facebookUrl && (
            <ContactCard
              icon={Facebook}
              label="Facebook"
              value="Messenger"
              href={store.facebookUrl}
              bg="bg-[#1877F2] text-white"
            />
          )}
          {store.instagramUrl && (
            <ContactCard
              icon={Instagram}
              label="Instagram"
              value="DM"
              href={store.instagramUrl}
              bg="bg-[#E52521] text-white"
            />
          )}
          {hasAddress && (
            <div className="border-4 border-[#1A1A2E] bg-white shadow-[4px_4px_0_0_#1A1A2E] p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-[#E52521]" />
                <span className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest">
                  ที่อยู่
                </span>
              </div>
              <div className="text-sm leading-relaxed">
                {line1 && <p>{line1}</p>}
                {line2 && <p>{line2}</p>}
                {line3 && <p>{line3}</p>}
              </div>
            </div>
          )}

          {/* Hours card */}
          <div className="border-4 border-[#1A1A2E] bg-[#FFF8DC] shadow-[4px_4px_0_0_#1A1A2E] p-4">
            <p className="font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest text-[#E52521] mb-2 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" /> เวลาทำการ
            </p>
            <p className="text-sm font-bold">จันทร์-อาทิตย์ · 9:00 - 21:00</p>
            <p className="text-xs text-[#4A4A6E] mt-1">
              นอกเวลานี้ตอบกลับช้าหน่อย แต่อ่านทุกข้อความ ⭐
            </p>
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
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest mb-1">
        {label}
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

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  bg: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className={`block border-4 border-[#1A1A2E] p-4 shadow-[4px_4px_0_0_#1A1A2E] hover:shadow-[6px_6px_0_0_#1A1A2E] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${bg}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 shrink-0" />
        <div className="min-w-0">
          <p className="font-[family:var(--font-kanit)] font-black uppercase text-[10px] tracking-widest opacity-80">
            {label}
          </p>
          <p className="font-[family:var(--font-kanit)] font-black uppercase text-sm truncate">
            {value}
          </p>
        </div>
      </div>
    </a>
  );
}
