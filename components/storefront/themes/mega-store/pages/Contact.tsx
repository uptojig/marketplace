'use client';

/**
 * Mega Store — bespoke Contact page.
 *
 * Bold Taobao-orange / Tmall-red gradient aesthetic to match the
 * Homepage / About hero treatment. Hero, channel cards (phone /
 * email / LINE / Facebook / Instagram / address), and a contact
 * form that POSTs to /api/stores/[slug]/contact with a mailto:
 * fallback when the endpoint is missing.
 *
 * Receives `{ store }` only — same shape as FooterProps.store —
 * because the contact channels and address all live on the Store
 * record (see prisma/schema.prisma → model Store).
 */

import React, { useState } from 'react';
import {
  Headphones,
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
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

  type Channel = {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
    accent: 'primary' | 'red';
  };

  const channels: Channel[] = [];
  if (store.contactPhone) {
    channels.push({
      icon: <Phone size={26} />,
      label: 'โทรศัพท์',
      value: store.contactPhone,
      href: `tel:${store.contactPhone.replace(/\s+/g, '')}`,
      accent: 'primary',
    });
  }
  if (store.contactEmail) {
    channels.push({
      icon: <Mail size={26} />,
      label: 'อีเมล',
      value: store.contactEmail,
      href: `mailto:${store.contactEmail}`,
      accent: 'red',
    });
  }
  if (store.lineId) {
    channels.push({
      icon: <MessageCircle size={26} />,
      label: 'LINE',
      value: store.lineId,
      href: `https://line.me/R/ti/p/~${store.lineId.replace(/^@/, '')}`,
      accent: 'primary',
    });
  }
  if (store.facebookUrl) {
    channels.push({
      icon: <Facebook size={26} />,
      label: 'Facebook',
      value: 'แชทผ่าน Messenger',
      href: store.facebookUrl,
      accent: 'red',
    });
  }
  if (store.instagramUrl) {
    channels.push({
      icon: <Instagram size={26} />,
      label: 'Instagram',
      value: 'ติดตามผ่าน Instagram',
      href: store.instagramUrl,
      accent: 'primary',
    });
  }
  if (address) {
    channels.push({
      icon: <MapPin size={26} />,
      label: 'ที่อยู่ร้าน',
      value: address,
      accent: 'red',
    });
  }

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen pb-12 pt-8">
      <div className="max-w-[1000px] mx-auto px-4">
        {/* Hero Banner — matches About hero treatment */}
        <div className="bg-[var(--mega-gradient-btn)] rounded-2xl p-10 md:p-14 text-white text-center mb-10 shadow-lg relative overflow-hidden">
          <span className="inline-block bg-white text-[var(--shop-primary)] text-xs font-bold px-3 py-1 rounded-full mb-4 relative z-10">
            CUSTOMER CARE
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 relative z-10 tracking-tight">
            ติดต่อเรา
          </h1>
          <p className="text-sm sm:text-base opacity-95 max-w-xl mx-auto relative z-10 leading-relaxed">
            ทีมบริการลูกค้า {store.name} พร้อมตอบทุกคำถาม ตลอด 24 ชั่วโมง
            เลือกช่องทางที่สะดวกที่สุดสำหรับคุณ
          </p>
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-black/10 rounded-full blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10" />
        </div>

        {/* Quick stats / hours strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { value: '24/7', label: 'แชทตลอด' },
            { value: '< 1 ชม.', label: 'ตอบกลับเฉลี่ย' },
            { value: '98%', label: 'ความพึงพอใจ' },
            { value: '1M+', label: 'ลูกค้าทั่วไทย' },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white border border-[var(--shop-border)] rounded-xl p-4 text-center shadow-sm"
            >
              <div className="text-xl sm:text-2xl font-extrabold text-[var(--shop-primary)] mb-1">
                {s.value}
              </div>
              <div className="text-xs text-[var(--shop-ink-muted)] font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Channels */}
        <h2 className="text-2xl font-extrabold text-[var(--shop-ink)] mb-2">ช่องทางติดต่อ</h2>
        <p className="text-sm text-[var(--shop-ink-muted)] mb-6">
          คลิกที่ช่องทางเพื่อติดต่อทันที
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {channels.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 bg-white border border-[var(--shop-border)] rounded-xl p-8 text-center text-sm text-[var(--shop-ink-muted)]">
              ยังไม่ได้ระบุช่องทางติดต่อ กรุณาส่งข้อความผ่านแบบฟอร์มด้านล่าง
            </div>
          ) : (
            channels.map((c, i) => {
              const accentClass =
                c.accent === 'primary'
                  ? 'text-[var(--shop-primary)] bg-[var(--mega-highlight)]'
                  : 'text-[var(--shop-accent)] bg-red-50';
              const inner = (
                <>
                  <div
                    className={`w-14 h-14 ${accentClass} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    {c.icon}
                  </div>
                  <div className="font-bold text-[var(--shop-ink)] text-base mb-1">{c.label}</div>
                  <div className="text-sm text-[var(--shop-ink-muted)] break-words">{c.value}</div>
                </>
              );
              return c.href ? (
                <a
                  key={i}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group bg-white p-5 rounded-xl border border-[var(--shop-border)] shadow-sm flex flex-col items-center text-center hover:border-[var(--shop-primary)] hover:shadow-md transition-all"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={i}
                  className="group bg-white p-5 rounded-xl border border-[var(--shop-border)] shadow-sm flex flex-col items-center text-center"
                >
                  {inner}
                </div>
              );
            })
          )}
        </div>

        {/* Form + Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[var(--shop-border)] shadow-sm overflow-hidden">
              <div className="bg-[var(--mega-gradient-accent)] text-white px-6 py-5 flex items-center gap-3">
                <Headphones size={22} aria-hidden="true" />
                <h2 className="text-lg font-extrabold">ส่งข้อความถึงเรา</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="megastore-contact-name"
                      className="block text-xs font-bold text-[var(--shop-ink)] mb-2"
                    >
                      ชื่อ <span className="text-[var(--shop-accent)]">*</span>
                    </label>
                    <input
                      id="megastore-contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="กรอกชื่อของคุณ"
                      required
                      className="w-full bg-[var(--shop-bg)] border border-[var(--shop-border)] rounded-lg px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--shop-primary)]/20 transition"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="megastore-contact-email"
                      className="block text-xs font-bold text-[var(--shop-ink)] mb-2"
                    >
                      อีเมล <span className="text-[var(--shop-accent)]">*</span>
                    </label>
                    <input
                      id="megastore-contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-[var(--shop-bg)] border border-[var(--shop-border)] rounded-lg px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--shop-primary)]/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="megastore-contact-subject"
                    className="block text-xs font-bold text-[var(--shop-ink)] mb-2"
                  >
                    หัวข้อ <span className="text-[var(--shop-accent)]">*</span>
                  </label>
                  <input
                    id="megastore-contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="เช่น สอบถามสินค้า / ติดตามคำสั่งซื้อ / ขอใบกำกับภาษี"
                    required
                    className="w-full bg-[var(--shop-bg)] border border-[var(--shop-border)] rounded-lg px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--shop-primary)]/20 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="megastore-contact-message"
                    className="block text-xs font-bold text-[var(--shop-ink)] mb-2"
                  >
                    ข้อความ <span className="text-[var(--shop-accent)]">*</span>
                  </label>
                  <textarea
                    id="megastore-contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="เล่าให้เราฟังว่าคุณต้องการให้เราช่วยอะไร..."
                    rows={6}
                    required
                    className="w-full bg-[var(--shop-bg)] border border-[var(--shop-border)] rounded-lg px-4 py-3 text-sm text-[var(--shop-ink)] outline-none focus:border-[var(--shop-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--shop-primary)]/20 resize-none transition"
                  />
                </div>

                {status === 'sent' && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>ส่งข้อความเรียบร้อย ทีมงานจะติดต่อกลับโดยเร็วที่สุด</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle size={18} aria-hidden="true" />
                    <span>{errorMsg || 'ส่งข้อความไม่สำเร็จ กรุณาลองอีกครั้ง'}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[var(--mega-gradient-btn)] text-white py-3.5 text-sm font-extrabold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-[var(--shop-primary)]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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

          {/* Hours sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-[var(--shop-border)] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--mega-highlight)] text-[var(--shop-primary)] flex items-center justify-center">
                  <Clock size={20} aria-hidden="true" />
                </div>
                <h3 className="text-base font-extrabold text-[var(--shop-ink)]">เวลาทำการ</h3>
              </div>
              <ul className="text-sm text-[var(--shop-ink-muted)] space-y-2.5">
                <li className="flex justify-between gap-3">
                  <span>จันทร์ - ศุกร์</span>
                  <span className="font-semibold text-[var(--shop-ink)]">09:00 - 20:00</span>
                </li>
                <li className="flex justify-between gap-3">
                  <span>เสาร์ - อาทิตย์</span>
                  <span className="font-semibold text-[var(--shop-ink)]">10:00 - 18:00</span>
                </li>
                <li className="flex justify-between gap-3 border-t border-[var(--shop-border)] pt-2.5">
                  <span>แชท / Live Chat</span>
                  <span className="font-semibold text-[var(--shop-primary)]">ตลอด 24 ชม.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[var(--mega-highlight)] rounded-2xl p-6 border border-[var(--shop-primary)]/20">
              <h3 className="text-base font-extrabold text-[var(--shop-ink)] mb-2">
                ต้องการคำตอบทันที?
              </h3>
              <p className="text-sm text-[var(--shop-ink-muted)] leading-relaxed mb-4">
                ใช้บริการแชท Live Chat รับคำตอบจากทีมงานภายใน 1 นาที
              </p>
              <button
                type="button"
                className="w-full bg-[var(--shop-primary)] text-white py-2.5 text-sm font-bold rounded-full hover:bg-[var(--shop-accent)] transition-colors"
              >
                เริ่มแชท
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
