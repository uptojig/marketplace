'use client';

/**
 * Eco Pack — bespoke Contact page.
 *
 * Kraft-paper / sustainable packaging vibe. Hero, channel cards
 * (phone / email / LINE / Facebook / Instagram / address), and a
 * contact form that POSTs to /api/stores/[slug]/contact with a
 * mailto: fallback when the endpoint is missing.
 *
 * Receives `{ store }` only — same shape as FooterProps.store —
 * because the contact channels and address all live on the Store
 * record (see prisma/schema.prisma → model Store).
 */

import React, { useState } from 'react';
import {
  Leaf,
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ContactStoreInfo {
  id?: string;
  slug: string;
  name: string;
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
  country?: string | null;
}

export interface ContactProps {
  store: ContactStoreInfo;
}

function formatAddress(s: ContactStoreInfo): string {
  const parts = [
    s.addressLine1,
    s.addressLine2,
    s.subdistrict,
    s.district,
    s.province,
    s.postalCode,
    s.country,
  ].filter((p): p is string => Boolean(p && p.trim()));
  return parts.join(' ');
}

export default function Contact({ store }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const address = formatAddress(store);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/stores/${store.slug}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('sent');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      // Fallback to mailto: when the API is missing or fails — at
      // least the customer doesn't lose their message.
      if (store.contactEmail) {
        const body = `จาก: ${name} <${email}>%0D%0A%0D%0A${encodeURIComponent(message)}`;
        const subj = encodeURIComponent(subject || `ติดต่อจาก ${store.name}`);
        window.location.href = `mailto:${store.contactEmail}?subject=${subj}&body=${body}`;
        setStatus('sent');
      } else {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'ส่งข้อความไม่สำเร็จ กรุณาลองอีกครั้ง');
      }
    }
  }

  // Build channel cards — show only channels the store has filled in.
  const channels: {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
  }[] = [];

  if (store.contactPhone) {
    channels.push({
      icon: <Phone size={22} />,
      label: 'โทรศัพท์',
      value: store.contactPhone,
      href: `tel:${store.contactPhone.replace(/\s+/g, '')}`,
    });
  }
  if (store.contactEmail) {
    channels.push({
      icon: <Mail size={22} />,
      label: 'อีเมล',
      value: store.contactEmail,
      href: `mailto:${store.contactEmail}`,
    });
  }
  if (store.lineId) {
    channels.push({
      icon: <MessageCircle size={22} />,
      label: 'LINE',
      value: store.lineId,
      href: `https://line.me/R/ti/p/~${store.lineId.replace(/^@/, '')}`,
    });
  }
  if (store.facebookUrl) {
    channels.push({
      icon: <Facebook size={22} />,
      label: 'Facebook',
      value: 'พูดคุยผ่าน Facebook',
      href: store.facebookUrl,
    });
  }
  if (store.instagramUrl) {
    channels.push({
      icon: <Instagram size={22} />,
      label: 'Instagram',
      value: 'ติดตามผ่าน Instagram',
      href: store.instagramUrl,
    });
  }
  if (address) {
    channels.push({
      icon: <MapPin size={22} />,
      label: 'ที่อยู่',
      value: address,
    });
  }

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      {/* Hero */}
      <section className="relative bg-[var(--eco-kraft)] text-white overflow-hidden isolate">
        <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10 text-center">
          <Leaf size={42} className="mx-auto mb-5 text-white" aria-hidden="true" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            ติดต่อเรา
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            มีคำถามเกี่ยวกับบรรจุภัณฑ์รักษ์โลก หรืออยากปรึกษาเรื่องสั่งผลิตพิเศษ?
            ทีมงานของเรายินดีตอบทุกข้อสงสัยภายใน 24 ชม.
          </p>
        </div>
      </section>

      {/* Channels + Form */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Channels */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-[var(--shop-ink)] mb-2">ช่องทางติดต่อ</h2>
            <p className="text-sm text-[var(--shop-ink-muted)] mb-8 leading-relaxed">
              เลือกช่องทางที่สะดวกที่สุดสำหรับคุณ
            </p>

            <div className="space-y-3">
              {channels.length === 0 ? (
                <div className="bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-xl p-5 text-sm text-[var(--shop-ink-muted)]">
                  ยังไม่ได้ระบุช่องทางติดต่อ กรุณาส่งข้อความผ่านแบบฟอร์มด้านขวา
                </div>
              ) : (
                channels.map((c, i) => {
                  const inner = (
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[var(--shop-card)] border border-[var(--shop-border)] flex items-center justify-center text-[var(--shop-accent)] shrink-0 shadow-sm">
                        {c.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-wider text-[var(--shop-ink-muted)] mb-1">
                          {c.label}
                        </div>
                        <div className="text-sm font-medium text-[var(--shop-ink)] break-words">
                          {c.value}
                        </div>
                      </div>
                    </div>
                  );
                  return c.href ? (
                    <a
                      key={i}
                      href={c.href}
                      target={c.href.startsWith('http') ? '_blank' : undefined}
                      rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="block bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-xl p-5 hover:border-[var(--shop-accent)] hover:shadow-md transition-all"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div
                      key={i}
                      className="block bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-xl p-5"
                    >
                      {inner}
                    </div>
                  );
                })
              )}
            </div>

            {/* Kraft accent card — hours */}
            <div className="mt-8 bg-[var(--eco-kraft)]/15 border border-[var(--eco-kraft)]/40 rounded-2xl p-6">
              <div className="text-xs uppercase tracking-wider text-[var(--eco-kraft-dark)] font-semibold mb-2">
                เวลาทำการ
              </div>
              <div className="text-sm text-[var(--shop-ink)] leading-relaxed">
                จันทร์ - ศุกร์ · 09:00 - 18:00
                <br />
                เสาร์ · 10:00 - 16:00
                <br />
                อาทิตย์ · หยุด
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--shop-card)] border border-[var(--shop-border)] rounded-2xl p-6 md:p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--shop-ink)] mb-2">ส่งข้อความถึงเรา</h2>
              <p className="text-sm text-[var(--shop-ink-muted)] mb-8 leading-relaxed">
                กรอกแบบฟอร์มด้านล่าง ทีมงานจะติดต่อกลับภายใน 24 ชม.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="ecopack-contact-name"
                      className="block text-xs font-semibold text-[var(--shop-ink)] uppercase tracking-wider mb-2"
                    >
                      ชื่อ
                    </label>
                    <input
                      id="ecopack-contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="กรอกชื่อของคุณ"
                      required
                      className="w-full bg-[var(--shop-bg)] border border-[var(--shop-border)] rounded-md px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-accent)] focus:ring-2 focus:ring-[var(--shop-accent)]/20 transition"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ecopack-contact-email"
                      className="block text-xs font-semibold text-[var(--shop-ink)] uppercase tracking-wider mb-2"
                    >
                      อีเมล
                    </label>
                    <input
                      id="ecopack-contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-[var(--shop-bg)] border border-[var(--shop-border)] rounded-md px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-accent)] focus:ring-2 focus:ring-[var(--shop-accent)]/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ecopack-contact-subject"
                    className="block text-xs font-semibold text-[var(--shop-ink)] uppercase tracking-wider mb-2"
                  >
                    หัวข้อ
                  </label>
                  <input
                    id="ecopack-contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="เช่น สอบถามสินค้าพิเศษ / สั่งผลิต"
                    required
                    className="w-full bg-[var(--shop-bg)] border border-[var(--shop-border)] rounded-md px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-accent)] focus:ring-2 focus:ring-[var(--shop-accent)]/20 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ecopack-contact-message"
                    className="block text-xs font-semibold text-[var(--shop-ink)] uppercase tracking-wider mb-2"
                  >
                    ข้อความ
                  </label>
                  <textarea
                    id="ecopack-contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="เล่าให้เราฟังว่าคุณต้องการอะไร..."
                    rows={6}
                    required
                    className="w-full bg-[var(--shop-bg)] border border-[var(--shop-border)] rounded-md px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-accent)] focus:ring-2 focus:ring-[var(--shop-accent)]/20 resize-none transition"
                  />
                </div>

                {status === 'sent' && (
                  <div className="flex items-center gap-3 bg-[var(--shop-accent)]/10 border border-[var(--shop-accent)]/30 text-[var(--shop-accent)] rounded-md px-4 py-3 text-sm">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>ส่งข้อความเรียบร้อย ทีมงานจะติดต่อกลับเร็วที่สุด</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
                    <AlertCircle size={18} aria-hidden="true" />
                    <span>{errorMsg || 'ส่งข้อความไม่สำเร็จ กรุณาลองอีกครั้ง'}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[var(--shop-ink)] text-white py-3.5 text-sm font-semibold rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-[var(--shop-accent)]/40 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {status === 'sending' ? (
                    'กำลังส่ง...'
                  ) : (
                    <>
                      <Send size={16} aria-hidden="true" />
                      ส่งข้อความ
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
