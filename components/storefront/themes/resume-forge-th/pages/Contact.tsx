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
  CheckCircle2,
  FileText,
  Briefcase,
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
    <div className="bg-[#F8FAFC] text-[#0F172A] font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden rf-grid-bg border-b border-[#CBD5E1]">
        <div className="absolute top-8 right-12 w-32 h-32 rounded-full bg-[#1E3A8A]/10 blur-3xl pointer-events-none hidden md:block" aria-hidden />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-md bg-white border border-[#CBD5E1] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E3A8A] font-[family:var(--font-kanit)] mb-4">
            <Briefcase className="w-3.5 h-3.5 text-[#B45309]" />
            ติดต่อเรา
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            <span className="rf-gradient-text">มาคุยกัน</span>
          </h1>
          <span className="rf-rule mt-4" aria-hidden />
          <p className="text-sm font-semibold text-[#475569] mt-3">
            ตอบกลับภายใน 24 ชั่วโมง ทุกช่องทาง
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_360px] gap-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white border border-[#CBD5E1] p-6 sm:p-8 space-y-5 shadow-[0_8px_32px_-12px_rgba(30,58,138,0.18)]"
        >
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="font-[family:var(--font-kanit)] font-bold text-2xl tracking-tight">
              ส่งข้อความหาเรา
            </h2>
            <p className="text-xs text-[#475569] mt-1">
              ใช้แบบฟอร์มด้านล่าง หรือทักผ่านช่องทางอื่น
            </p>
          </div>

          {result === 'success' && (
            <div className="rounded-md bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] px-4 py-3 text-sm font-bold inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              ส่งข้อความเรียบร้อย — เราจะรีบติดต่อกลับ
            </div>
          )}
          {errorMsg && (
            <div className="rounded-md bg-[#FEE2E2] border border-[#FCA5A5] text-[#B91C1C] px-4 py-3 text-sm font-bold">
              {errorMsg}
            </div>
          )}

          <Field label="ชื่อ" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="อีเมล" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" required />
          <Field label="หัวข้อ" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} required />
          <label className="block">
            <span className="block font-[family:var(--font-kanit)] font-bold text-[11px] tracking-[0.2em] uppercase mb-1.5 text-[#475569]">
              ข้อความ
            </span>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={6}
              className="w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5 text-sm font-medium text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all resize-y"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-md bg-[#1E3A8A] text-white font-[family:var(--font-kanit)] font-semibold text-base rf-glow-primary hover:bg-[#1E40AF] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
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
              bg="#DBEAFE"
              fg="#1E40AF"
              border="#BFDBFE"
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
              border="#FDE68A"
            />
          )}
          {store.lineId && (
            <ContactCard
              icon={MessageCircle}
              label="LINE"
              value={`@${store.lineId}`}
              href={`https://line.me/ti/p/~${store.lineId}`}
              bg="#DCFCE7"
              fg="#15803D"
              border="#BBF7D0"
            />
          )}
          {store.facebookUrl && (
            <ContactCard
              icon={Facebook}
              label="Facebook"
              value="Messenger"
              href={store.facebookUrl}
              bg="#DBEAFE"
              fg="#1E40AF"
              border="#BFDBFE"
            />
          )}
          {store.instagramUrl && (
            <ContactCard
              icon={Instagram}
              label="Instagram"
              value="ส่ง DM"
              href={store.instagramUrl}
              bg="#FCE7F3"
              fg="#BE185D"
              border="#FBCFE8"
            />
          )}
          {hasAddress && (
            <div className="rounded-xl bg-white border border-[#CBD5E1] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-9 h-9 rounded-md flex items-center justify-center border"
                  style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', borderColor: '#BFDBFE' }}
                >
                  <MapPin className="w-4 h-4" />
                </span>
                <span className="font-[family:var(--font-kanit)] font-bold text-sm">
                  ที่อยู่
                </span>
              </div>
              <div className="text-sm leading-relaxed text-[#475569] pl-11">
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
              <div className="rounded-xl bg-white border-2 border-dashed border-[#CBD5E1] p-6 text-center">
                <FileText className="w-8 h-8 mx-auto text-[#1E3A8A] mb-2" />
                <p className="text-sm font-semibold text-[#475569]">
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
      <span className="block font-[family:var(--font-kanit)] font-bold text-[11px] tracking-[0.2em] uppercase mb-1.5 text-[#475569]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-md border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5 text-sm font-medium text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all"
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
  border,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  bg: string;
  fg: string;
  border: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="block rounded-xl bg-white border border-[#CBD5E1] p-4 rf-card transition-all"
    >
      <div className="flex items-center gap-3">
        <span
          className="w-11 h-11 rounded-md flex items-center justify-center shrink-0 border"
          style={{ backgroundColor: bg, color: fg, borderColor: border }}
        >
          <Icon className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <p className="font-[family:var(--font-kanit)] font-bold text-[10px] tracking-[0.2em] uppercase text-[#475569]">
            {label}
          </p>
          <p className="font-[family:var(--font-kanit)] font-bold text-sm truncate" style={{ color: fg }}>
            {value}
          </p>
        </div>
      </div>
    </a>
  );
}
