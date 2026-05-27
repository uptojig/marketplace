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
  Bot,
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
const GLOW_ACCENT =
  '0 0 0 1px rgba(6,182,212,0.4), 0 0 12px rgba(6,182,212,0.35), 0 0 28px rgba(6,182,212,0.18)';
const GLOW_LG =
  '0 0 0 1px rgba(168,85,247,0.5), 0 0 24px rgba(168,85,247,0.5), 0 0 64px rgba(168,85,247,0.28)';

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
    <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)] min-h-screen">
      <section className="relative overflow-hidden border-b border-[#312E81]/60 px-4 py-14 sm:py-20">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={GRID_BG_STYLE} aria-hidden />
        <div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#A855F7]/40 bg-[#A855F7]/10 text-[11px] uppercase tracking-[0.18em] text-[#A855F7] mb-5 font-[family:var(--font-kanit)] font-semibold">
            <Send className="w-3 h-3" />
            Contact
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span style={GRADIENT_TEXT_STYLE}>ติดต่อเรา</span>
          </h1>
          <p className="text-sm text-[#94A3B8] mt-3">ตอบกลับภายใน 24 ชั่วโมง · ทุกวัน 9:00-21:00</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_380px] gap-8">
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 sm:p-8 space-y-4" style={GLASS_STYLE}>
          <h2 className="font-[family:var(--font-kanit)] font-semibold text-lg text-[#F8FAFC] pb-3 border-b border-[#312E81] mb-2">
            ส่งข้อความหาเรา
          </h2>

          {result === 'success' && (
            <div className="rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-3 text-sm text-[#10B981] font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> ส่งข้อความเรียบร้อย — เราจะรีบติดต่อกลับ
            </div>
          )}
          {errorMsg && (
            <div className="rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
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
            <label className="block text-xs uppercase tracking-[0.14em] text-[#94A3B8] mb-1.5 font-medium">
              ข้อความ
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={6}
              className="w-full rounded-xl bg-[#0B0B1F]/60 border border-[#312E81] px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/20 resize-y transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-[family:var(--font-kanit)]"
            style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_LG }}
          >
            <Send className="w-4 h-4" />
            {submitting ? 'กำลังส่ง…' : 'ส่งข้อความ'}
          </button>
        </form>

        <aside className="space-y-3">
          {store.contactEmail && (
            <ContactCard
              icon={Mail}
              label="อีเมล"
              value={store.contactEmail}
              href={`mailto:${store.contactEmail}`}
              color="#06B6D4"
            />
          )}
          {store.contactPhone && (
            <ContactCard
              icon={Phone}
              label="โทรศัพท์"
              value={store.contactPhone}
              href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
              color="#A855F7"
            />
          )}
          {store.lineId && (
            <ContactCard
              icon={MessageCircle}
              label="LINE"
              value={`@${store.lineId}`}
              href={`https://line.me/ti/p/~${store.lineId}`}
              color="#10B981"
            />
          )}
          {store.facebookUrl && (
            <ContactCard
              icon={Facebook}
              label="Facebook"
              value="Messenger"
              href={store.facebookUrl}
              color="#3B82F6"
            />
          )}
          {store.instagramUrl && (
            <ContactCard
              icon={Instagram}
              label="Instagram"
              value="DM"
              href={store.instagramUrl}
              color="#EC4899"
            />
          )}
          {hasAddress && (
            <div className="rounded-2xl p-4" style={GLASS_STYLE}>
              <div className="flex items-center gap-2 mb-2 text-[#FACC15]">
                <MapPin className="w-4 h-4" />
                <span className="text-xs uppercase tracking-[0.14em] font-semibold">ที่อยู่</span>
              </div>
              <div className="text-sm text-[#94A3B8] leading-relaxed">
                {line1 && <p>{line1}</p>}
                {line2 && <p>{line2}</p>}
                {line3 && <p>{line3}</p>}
              </div>
            </div>
          )}
          <div className="rounded-2xl p-4" style={{ ...GLASS_STYLE, boxShadow: GLOW_ACCENT }}>
            <div className="flex items-center gap-2 mb-2 text-[#06B6D4]">
              <Bot className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.14em] font-semibold">AI Support</span>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              ทีมงานพร้อมช่วยเลือกพรอมต์ที่เหมาะกับงานของคุณ — ส่งโจทย์มาให้เราดูได้เลย
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
      <label className="block text-xs uppercase tracking-[0.14em] text-[#94A3B8] mb-1.5 font-medium">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl bg-[#0B0B1F]/60 border border-[#312E81] px-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/20 transition-all"
      />
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="block rounded-2xl p-4 transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: 'rgba(19, 19, 46, 0.6)',
        backdropFilter: 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        border: `1px solid ${color}40`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#94A3B8] font-semibold mb-0.5">
            {label}
          </p>
          <p
            className="font-[family:var(--font-kanit)] font-semibold text-sm truncate"
            style={{ color }}
          >
            {value}
          </p>
        </div>
      </div>
    </a>
  );
}
