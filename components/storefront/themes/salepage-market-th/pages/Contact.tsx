'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface ContactProps {
  store: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    lineId?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postalCode?: string | null;
  };
}

export default function Contact({ store }: ContactProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );

  const channels = [
    store.contactEmail && {
      icon: Mail,
      title: 'อีเมล',
      value: store.contactEmail,
      href: `mailto:${store.contactEmail}`,
      sub: 'ตอบกลับภายใน 24 ชั่วโมงในวันทำการ',
    },
    store.contactPhone && {
      icon: Phone,
      title: 'โทรศัพท์',
      value: store.contactPhone,
      href: `tel:${store.contactPhone}`,
      sub: 'จันทร์ – ศุกร์ · 9:00 – 18:00',
    },
    store.lineId && {
      icon: MessageCircle,
      title: 'LINE Official',
      value: store.lineId,
      href: `https://line.me/ti/p/${store.lineId}`,
      sub: 'ตอบเร็วที่สุด · แชทได้ทันที',
    },
    store.facebookUrl && {
      icon: Facebook,
      title: 'Facebook',
      value: 'Messenger',
      href: store.facebookUrl,
      sub: 'ส่งข้อความตอนไหนก็ได้',
    },
  ].filter(
    (
      c,
    ): c is {
      icon: typeof Mail;
      title: string;
      value: string;
      href: string;
      sub: string;
    } => Boolean(c),
  );

  const addressParts = [
    store.addressLine1,
    store.addressLine2,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ]
    .map((p) => p?.trim())
    .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch(`/api/stores/${store.slug}/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => null);
      if (res && res.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        // Fallback to mailto so user can still send a message
        const subject = encodeURIComponent(form.subject || `ติดต่อจาก ${store.name}`);
        const body = encodeURIComponent(
          `ชื่อ: ${form.name}\nอีเมล: ${form.email}\n\n${form.message}`,
        );
        if (store.contactEmail) {
          window.location.href = `mailto:${store.contactEmail}?subject=${subject}&body=${body}`;
        }
        setStatus('sent');
        setForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FAFBFC)' }}
    >
      {/* Hero */}
      <section
        className="border-b"
        style={{
          borderColor: 'var(--shop-border, #E5E7EB)',
          background: 'var(--shop-bg-soft, #FFFFFF)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <nav className="text-xs text-[color:var(--shop-ink-muted,#6B7280)] mb-4">
            <Link
              href={`/stores/${store.slug}`}
              className="hover:text-[color:var(--shop-primary,#82B440)]"
            >
              {store.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[color:var(--shop-ink,#0D1421)]">ติดต่อเรา</span>
          </nav>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)] mb-3">
            ติดต่อทีมงาน {store.name}
          </h1>
          <p className="text-sm sm:text-base text-[color:var(--shop-ink-muted,#6B7280)] max-w-2xl">
            มีคำถามเกี่ยวกับเทมเพลต? · ต้องการความช่วยเหลือทางเทคนิค? · ทีมงานพร้อมตอบทุกคำถาม ตอบกลับเร็วภายใน 24 ชั่วโมง
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        {/* Form */}
        <main>
          <div
            className="rounded-lg p-6 sm:p-8"
            style={{
              background: 'var(--shop-bg-soft, #FFFFFF)',
              border: '1px solid var(--shop-border, #E5E7EB)',
            }}
          >
            <h2 className="font-[family:var(--font-kanit)] text-xl font-bold text-[color:var(--shop-ink,#0D1421)] mb-2">
              ส่งข้อความ
            </h2>
            <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mb-6">
              กรอกฟอร์มด้านล่าง ทีมงานจะติดต่อกลับโดยเร็วที่สุด
            </p>

            {status === 'sent' ? (
              <div
                className="rounded-md p-6 text-center"
                style={{
                  background: 'rgba(130, 180, 64, 0.10)',
                  border: '1px solid rgba(130, 180, 64, 0.30)',
                }}
              >
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-[color:var(--shop-primary,#82B440)]" />
                <h3 className="font-[family:var(--font-kanit)] font-bold text-lg text-[color:var(--shop-ink,#0D1421)] mb-1">
                  ส่งข้อความสำเร็จ
                </h3>
                <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mb-4">
                  ขอบคุณที่ติดต่อมา ทีมงานจะตอบกลับภายใน 24 ชั่วโมง
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-sm text-[color:var(--shop-primary,#82B440)] font-medium hover:underline"
                >
                  ส่งข้อความใหม่
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="ชื่อ – นามสกุล *"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    required
                  />
                  <Field
                    label="อีเมล *"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    required
                  />
                </div>
                <Field
                  label="หัวข้อ"
                  value={form.subject}
                  onChange={(v) => setForm({ ...form, subject: v })}
                  placeholder="เช่น สอบถามเรื่อง license"
                />
                <label className="block">
                  <span className="text-xs font-medium text-[color:var(--shop-ink,#0D1421)] mb-1.5 block">
                    ข้อความ *
                  </span>
                  <textarea
                    rows={6}
                    required
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="พิมพ์ข้อความหรือคำถามของคุณ..."
                    className="w-full rounded-md border bg-white px-3 py-3 text-sm text-[color:var(--shop-ink,#0D1421)] focus:border-[color:var(--shop-primary,#82B440)] focus:outline-none resize-y"
                    style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
                  />
                </label>
                {status === 'error' && (
                  <p className="text-sm text-[color:var(--shop-savings,#FF6B35)]">
                    เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองอีกครั้งหรือติดต่อผ่านอีเมลโดยตรง
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex items-center justify-center gap-2 rounded-md px-6 h-12 text-sm font-bold text-white disabled:opacity-60 transition-transform hover:scale-[1.01]"
                  style={{
                    background:
                      'var(--shop-primary-gradient, var(--shop-primary, #82B440))',
                  }}
                >
                  {status === 'sending' ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                  {status !== 'sending' && <Send className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>
        </main>

        {/* Channels sidebar */}
        <aside className="space-y-4">
          <div
            className="rounded-lg p-5"
            style={{
              background: 'var(--shop-bg-soft, #FFFFFF)',
              border: '1px solid var(--shop-border, #E5E7EB)',
            }}
          >
            <h2 className="font-[family:var(--font-kanit)] text-base font-bold text-[color:var(--shop-ink,#0D1421)] mb-3">
              ช่องทางอื่น
            </h2>
            {channels.length === 0 ? (
              <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)]">
                ติดต่อผ่านฟอร์มด้านซ้าย
              </p>
            ) : (
              <ul className="space-y-3">
                {channels.map((c) => (
                  <li key={c.title}>
                    <a
                      href={c.href}
                      target={c.href.startsWith('http') ? '_blank' : undefined}
                      rel={
                        c.href.startsWith('http')
                          ? 'noreferrer noopener'
                          : undefined
                      }
                      className="flex items-start gap-3 rounded-md p-2 -m-2 hover:bg-[color:var(--shop-muted,#F3F4F6)] transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          background: 'rgba(130, 180, 64, 0.12)',
                          color: 'var(--shop-primary, #82B440)',
                        }}
                      >
                        <c.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-wider text-[color:var(--shop-ink-muted,#6B7280)]">
                          {c.title}
                        </p>
                        <p className="text-sm font-semibold text-[color:var(--shop-ink,#0D1421)] truncate">
                          {c.value}
                        </p>
                        <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)] mt-0.5">
                          {c.sub}
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {addressParts.length > 0 && (
            <div
              className="rounded-lg p-5"
              style={{
                background: 'var(--shop-bg-soft, #FFFFFF)',
                border: '1px solid var(--shop-border, #E5E7EB)',
              }}
            >
              <h2 className="font-[family:var(--font-kanit)] text-base font-bold text-[color:var(--shop-ink,#0D1421)] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[color:var(--shop-primary,#82B440)]" />
                ที่อยู่
              </h2>
              <p className="text-sm leading-relaxed text-[color:var(--shop-ink-muted,#6B7280)]">
                {addressParts.join(' ')}
              </p>
            </div>
          )}

          <div
            className="rounded-lg p-5"
            style={{
              background: 'var(--shop-bg-soft, #FFFFFF)',
              border: '1px solid var(--shop-border, #E5E7EB)',
            }}
          >
            <h2 className="font-[family:var(--font-kanit)] text-base font-bold text-[color:var(--shop-ink,#0D1421)] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[color:var(--shop-primary,#82B440)]" />
              เวลาทำการ
            </h2>
            <dl className="text-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <dt className="text-[color:var(--shop-ink-muted,#6B7280)]">
                  จันทร์ – ศุกร์
                </dt>
                <dd className="text-[color:var(--shop-ink,#0D1421)] font-medium">
                  9:00 – 18:00
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[color:var(--shop-ink-muted,#6B7280)]">
                  เสาร์
                </dt>
                <dd className="text-[color:var(--shop-ink,#0D1421)] font-medium">
                  10:00 – 16:00
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[color:var(--shop-ink-muted,#6B7280)]">
                  อาทิตย์ / วันหยุด
                </dt>
                <dd className="text-[color:var(--shop-ink,#0D1421)] font-medium">
                  ปิดทำการ
                </dd>
              </div>
            </dl>
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
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[color:var(--shop-ink,#0D1421)] mb-1.5 block">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-white px-3 h-11 text-sm text-[color:var(--shop-ink,#0D1421)] focus:border-[color:var(--shop-primary,#82B440)] focus:outline-none"
        style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
      />
    </label>
  );
}
