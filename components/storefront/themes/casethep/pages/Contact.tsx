'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Facebook, Instagram, Send, Sparkles } from 'lucide-react';

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
        // Fallback for stores without the contact API — open default mail client
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
    <div className="bg-[#fafafa] text-black font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="bg-pink-500 border-b-4 border-black px-4 py-12 sm:py-16 relative overflow-hidden">
        <div
          className="absolute -bottom-10 -right-10 w-48 h-48 bg-yellow-400 border-4 border-black rotate-12 hidden md:block"
          aria-hidden
        />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-block bg-yellow-400 border-4 border-black px-4 py-1 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 font-[family:var(--font-kanit)]">
            Contact
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            ติดต่อเรา
          </h1>
          <p className="text-white font-bold mt-3 uppercase tracking-widest text-sm">
            ตอบกลับภายใน 24 ชั่วโมง
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 space-y-4"
        >
          <h2 className="font-[family:var(--font-kanit)] font-black text-2xl uppercase italic border-b-4 border-black pb-3 mb-4">
            ส่งข้อความหาเรา
          </h2>

          {result === 'success' && (
            <div className="border-4 border-black bg-green-400 p-4 font-[family:var(--font-kanit)] font-black uppercase text-sm flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> ส่งข้อความเรียบร้อย! เราจะรีบติดต่อกลับ
            </div>
          )}
          {errorMsg && (
            <div className="border-4 border-red-600 bg-red-50 text-red-700 p-4 font-bold uppercase text-xs tracking-widest">
              {errorMsg}
            </div>
          )}

          <Field label="ชื่อ" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="อีเมล" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" required />
          <Field label="หัวข้อ" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} required />
          <div>
            <label className="block font-[family:var(--font-kanit)] font-black uppercase text-xs tracking-widest mb-1">
              ข้อความ
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={6}
              className="w-full border-4 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:bg-yellow-100 resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="h-14 w-full px-6 bg-pink-500 text-white border-4 border-black font-[family:var(--font-kanit)] font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black active:translate-x-2 active:translate-y-2 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              bg="bg-pink-500 text-white"
            />
          )}
          {store.contactPhone && (
            <ContactCard
              icon={Phone}
              label="โทรศัพท์"
              value={store.contactPhone}
              href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
              bg="bg-yellow-400 text-black"
            />
          )}
          {store.lineId && (
            <ContactCard
              icon={MessageCircle}
              label="LINE"
              value={`@${store.lineId}`}
              href={`https://line.me/ti/p/~${store.lineId}`}
              bg="bg-green-400 text-black"
            />
          )}
          {store.facebookUrl && (
            <ContactCard
              icon={Facebook}
              label="Facebook"
              value="Messenger"
              href={store.facebookUrl}
              bg="bg-blue-600 text-white"
            />
          )}
          {store.instagramUrl && (
            <ContactCard
              icon={Instagram}
              label="Instagram"
              value="DM"
              href={store.instagramUrl}
              bg="bg-pink-500 text-white"
            />
          )}
          {hasAddress && (
            <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-pink-500" />
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
        className="w-full border-4 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:bg-yellow-100"
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
      className={`block border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${bg}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 shrink-0" />
        <div className="min-w-0">
          <p className="font-[family:var(--font-kanit)] font-black uppercase text-[10px] tracking-widest opacity-80">
            {label}
          </p>
          <p className="font-[family:var(--font-kanit)] font-black uppercase text-sm truncate">{value}</p>
        </div>
      </div>
    </a>
  );
}
