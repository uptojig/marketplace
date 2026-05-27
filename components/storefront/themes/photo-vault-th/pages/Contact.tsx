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
  Aperture,
  Check,
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
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
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
        )}&body=${encodeURIComponent(
          `${form.message}\n\nจาก: ${form.name} <${form.email}>`,
        )}`;
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
    <div className="bg-[#0C0A09] text-[#F5F5F4] font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="pv-grain relative border-b border-[#44403C] bg-gradient-to-b from-[#1C1917] to-[#0C0A09] px-4 py-16 sm:py-20">
        <div
          aria-hidden
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#F59E0B]/15 to-transparent blur-3xl"
        />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] mb-5">
            <span className="w-8 h-px bg-[#FBBF24]" /> Reach the Vault
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-bold tracking-tight">
            <span className="pv-text-gold">ติดต่อช่างภาพ</span>
          </h1>
          <p className="text-sm text-[#A8A29E] mt-4 tracking-wider">
            ตอบกลับภายใน 24 ชั่วโมงทำการ · พร้อมช่วยทุกคำถามเรื่องโทนสี
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1C1917] border border-[#44403C] p-7 sm:p-10 space-y-5"
        >
          <div className="flex items-center gap-3 pb-5 border-b border-[#44403C] mb-5">
            <Aperture className="w-6 h-6 text-[#F59E0B]" strokeWidth={1.5} />
            <h2 className="font-[family:var(--font-kanit)] font-bold text-xl tracking-tight">
              ส่งข้อความหาเรา
            </h2>
          </div>

          {result === 'success' && (
            <div className="border border-[#10B981] bg-[#0C0A09] text-[#10B981] p-4 font-[family:var(--font-kanit)] font-semibold text-sm flex items-center gap-3">
              <Check className="w-5 h-5" /> ส่งข้อความเรียบร้อย · เราจะติดต่อกลับ
            </div>
          )}
          {errorMsg && (
            <div className="border border-[#E11D48] bg-[#0C0A09] text-[#FBBF24] p-4 text-sm">
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
            <label className="block font-[family:var(--font-kanit)] font-semibold uppercase text-[10px] tracking-[0.32em] mb-1.5 text-[#A8A29E]">
              ข้อความ
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={7}
              className="w-full bg-[#0C0A09] border border-[#44403C] focus:border-[#F59E0B] px-3 py-2.5 text-sm text-[#F5F5F4] focus:outline-none transition-colors resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 w-full h-14 px-7 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold tracking-wide text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed pv-glow-amber"
          >
            <Send className="w-5 h-5" />
            {submitting ? 'กำลังส่ง…' : 'ส่งข้อความ'}
          </button>
        </form>

        {/* Channels */}
        <aside className="space-y-3">
          <h3 className="font-[family:var(--font-kanit)] font-bold text-sm uppercase tracking-[0.32em] text-[#F59E0B] mb-2 inline-flex items-center gap-2">
            <span className="w-8 h-px bg-[#F59E0B]" /> ช่องทางอื่น
          </h3>
          {store.contactEmail && (
            <ContactCard
              icon={Mail}
              label="อีเมล"
              value={store.contactEmail}
              href={`mailto:${store.contactEmail}`}
            />
          )}
          {store.contactPhone && (
            <ContactCard
              icon={Phone}
              label="โทรศัพท์"
              value={store.contactPhone}
              href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
            />
          )}
          {store.lineId && (
            <ContactCard
              icon={MessageCircle}
              label="LINE"
              value={`@${store.lineId}`}
              href={`https://line.me/ti/p/~${store.lineId}`}
            />
          )}
          {store.facebookUrl && (
            <ContactCard
              icon={Facebook}
              label="Facebook"
              value="Messenger"
              href={store.facebookUrl}
            />
          )}
          {store.instagramUrl && (
            <ContactCard
              icon={Instagram}
              label="Instagram"
              value="DM"
              href={store.instagramUrl}
            />
          )}
          {hasAddress && (
            <div className="border border-[#44403C] bg-[#1C1917] p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#F59E0B]" />
                <span className="font-[family:var(--font-kanit)] font-bold uppercase text-[10px] tracking-[0.32em] text-[#A8A29E]">
                  ที่ตั้งสตูดิโอ
                </span>
              </div>
              <div className="text-sm text-[#D6D3D1] leading-relaxed">
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
      <label className="block font-[family:var(--font-kanit)] font-semibold uppercase text-[10px] tracking-[0.32em] mb-1.5 text-[#A8A29E]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-[#0C0A09] border border-[#44403C] focus:border-[#F59E0B] px-3 py-2.5 text-sm text-[#F5F5F4] focus:outline-none transition-colors"
      />
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="block border border-[#44403C] hover:border-[#F59E0B] p-4 bg-[#1C1917] hover:bg-[#0C0A09] transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 border border-[#44403C] group-hover:border-[#F59E0B] flex items-center justify-center transition-colors shrink-0">
          <Icon className="w-4 h-4 text-[#F59E0B]" />
        </div>
        <div className="min-w-0">
          <p className="font-[family:var(--font-kanit)] font-semibold uppercase text-[10px] tracking-[0.32em] text-[#A8A29E]">
            {label}
          </p>
          <p className="font-[family:var(--font-kanit)] font-bold text-sm text-[#F5F5F4] truncate group-hover:text-[#FBBF24] transition-colors">
            {value}
          </p>
        </div>
      </div>
    </a>
  );
}
