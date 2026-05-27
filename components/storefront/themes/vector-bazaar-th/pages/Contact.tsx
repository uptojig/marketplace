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
  Palette,
} from 'lucide-react';
import { VECTOR_BAZAAR_RAINBOW } from '../palette';

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
        // Fallback: open mail client
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
    <div className="bg-[#FEFCE8] text-[#1E1B4B] font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden vb-rainbow-bg border-b border-[#FBCFE8]">
        <div className="absolute inset-0 vb-confetti opacity-40 pointer-events-none" aria-hidden />
        <div className="absolute top-8 right-12 w-32 h-32 rounded-full bg-[#F472B6]/30 blur-3xl pointer-events-none hidden md:block" aria-hidden />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#FBCFE8] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#DB2777] font-[family:var(--font-kanit)] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            ติดต่อเรา
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            <span className="vb-rainbow-text">มาคุยกัน</span>
          </h1>
          <p className="text-sm font-bold text-[#6366F1] mt-3">
            ตอบกลับภายใน 24 ชั่วโมง ทุกช่องทาง
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white border border-[#FBCFE8] p-6 sm:p-8 space-y-5 shadow-[0_8px_32px_-12px_rgba(244,114,182,0.25)]"
        >
          <div className="border-b border-[#FBCFE8] pb-4">
            <h2 className="font-[family:var(--font-kanit)] font-black text-2xl">
              ส่งข้อความหาเรา
            </h2>
            <p className="text-xs text-[#6366F1] mt-1">
              ใช้แบบฟอร์มด้านล่าง หรือทักผ่านช่องทางอื่น
            </p>
          </div>

          {result === 'success' && (
            <div className="rounded-2xl bg-[#D1FAE5] border border-[#34D399] text-[#047857] px-4 py-3 text-sm font-bold inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              ส่งข้อความเรียบร้อย — เราจะรีบติดต่อกลับ
            </div>
          )}
          {errorMsg && (
            <div className="rounded-2xl bg-[#FEE2E2] border border-[#F87171] text-[#B91C1C] px-4 py-3 text-sm font-bold">
              {errorMsg}
            </div>
          )}

          <Field label="ชื่อ" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="อีเมล" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" required />
          <Field label="หัวข้อ" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} required />
          <label className="block">
            <span className="block font-[family:var(--font-kanit)] font-black text-xs tracking-widest uppercase mb-1.5 text-[#6366F1]">
              ข้อความ
            </span>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={6}
              className="w-full rounded-2xl border border-[#FBCFE8] bg-[#FEFCE8]/40 px-4 py-2.5 text-sm font-medium text-[#1E1B4B] focus:outline-none focus:bg-white focus:border-[#F472B6] focus:ring-2 focus:ring-[#F472B6]/30 transition-all resize-y"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="h-14 w-full rounded-full bg-[#F472B6] text-white font-[family:var(--font-kanit)] font-black text-base vb-glow-primary hover:bg-[#EC4899] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {submitting ? 'กำลังส่ง…' : 'ส่งข้อความ'}
          </button>
        </form>

        {/* Contact channels */}
        <aside className="space-y-3">
          {store.contactEmail && (
            <ContactCard
              icon={Mail}
              label="อีเมล"
              value={store.contactEmail}
              href={`mailto:${store.contactEmail}`}
              bg="#FCE7F3"
              fg="#DB2777"
            />
          )}
          {store.contactPhone && (
            <ContactCard
              icon={Phone}
              label="โทรศัพท์"
              value={store.contactPhone}
              href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
              bg="#FEF3C7"
              fg="#B45309"
            />
          )}
          {store.lineId && (
            <ContactCard
              icon={MessageCircle}
              label="LINE"
              value={`@${store.lineId}`}
              href={`https://line.me/ti/p/~${store.lineId}`}
              bg="#D1FAE5"
              fg="#047857"
            />
          )}
          {store.facebookUrl && (
            <ContactCard
              icon={Facebook}
              label="Facebook"
              value="Messenger"
              href={store.facebookUrl}
              bg="#DBEAFE"
              fg="#2563EB"
            />
          )}
          {store.instagramUrl && (
            <ContactCard
              icon={Instagram}
              label="Instagram"
              value="ส่ง DM"
              href={store.instagramUrl}
              bg="#EDE9FE"
              fg="#6D28D9"
            />
          )}
          {hasAddress && (
            <div className="rounded-3xl bg-white border border-[#FBCFE8] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: '#FCE7F3', color: '#DB2777' }}
                >
                  <MapPin className="w-4 h-4" />
                </span>
                <span className="font-[family:var(--font-kanit)] font-black text-sm">
                  ที่อยู่
                </span>
              </div>
              <div className="text-sm leading-relaxed text-[#1E1B4B]/80 pl-11">
                {line1 && <p>{line1}</p>}
                {line2 && <p>{line2}</p>}
                {line3 && <p>{line3}</p>}
              </div>
            </div>
          )}
          {!store.contactEmail &&
            !store.contactPhone &&
            !store.lineId &&
            !store.facebookUrl &&
            !store.instagramUrl &&
            !hasAddress && (
              <div className="rounded-3xl bg-white border-2 border-dashed border-[#FBCFE8] p-6 text-center">
                <Palette className="w-8 h-8 mx-auto text-[#F472B6] mb-2" />
                <p className="text-sm font-bold text-[#6366F1]">
                  ใช้แบบฟอร์มซ้ายเพื่อติดต่อ — ทีมงานจะตอบกลับทางอีเมล
                </p>
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
    <label className="block">
      <span className="block font-[family:var(--font-kanit)] font-black text-xs tracking-widest uppercase mb-1.5 text-[#6366F1]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-2xl border border-[#FBCFE8] bg-[#FEFCE8]/40 px-4 py-2.5 text-sm font-medium text-[#1E1B4B] focus:outline-none focus:bg-white focus:border-[#F472B6] focus:ring-2 focus:ring-[#F472B6]/30 transition-all"
      />
    </label>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  bg,
  fg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  bg: string;
  fg: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="block rounded-3xl bg-white border border-[#FBCFE8] p-4 vb-card-hover transition-all"
    >
      <div className="flex items-center gap-3">
        <span
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: bg, color: fg }}
        >
          <Icon className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <p className="font-[family:var(--font-kanit)] font-black text-[10px] tracking-widest uppercase text-[#6366F1]">
            {label}
          </p>
          <p className="font-[family:var(--font-kanit)] font-black text-sm truncate" style={{ color: fg }}>
            {value}
          </p>
        </div>
      </div>
    </a>
  );
}
