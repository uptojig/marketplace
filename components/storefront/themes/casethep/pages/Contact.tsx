'use client';

import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Send, Check } from 'lucide-react';

interface ContactProps {
  store: {
    id: string;
    slug: string;
    name: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
    lineId?: string | null;
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
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const line1 = joinAddress([store.addressLine1, store.addressLine2]);
  const line2 = joinAddress([store.subdistrict, store.district]);
  const line3 = joinAddress([store.province, store.postalCode]);
  const hasAddress = !!(line1 || line2 || line3);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storeSlug: store.slug,
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok !== false) {
        setStatus('done');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setError(data?.error ?? 'ไม่สามารถส่งข้อความได้');
      }
    } catch {
      setStatus('error');
      setError('เครือข่ายไม่ตอบสนอง ลองอีกครั้ง');
    }
  }

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
    >
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-5xl mx-auto">
          <span
            className="inline-block rounded-full px-3 py-1 text-[11px] font-medium tracking-wide mb-4"
            style={{
              background: 'rgba(255,90,106,0.10)',
              color: 'var(--shop-primary, #FF5A6A)',
            }}
          >
            ติดต่อเรา
          </span>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-semibold tracking-tight">
            สวัสดีค่ะ ทักได้เลย
          </h1>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-2">
            ทีมงานของเราตอบเร็วภายใน 1 ชั่วโมงในช่วงเวลาทำการ
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-10">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 sm:p-8 space-y-4"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <h2 className="font-[family:var(--font-kanit)] font-semibold text-lg tracking-tight">
            ส่งข้อความ
          </h2>
          {status === 'done' ? (
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                background: 'rgba(255,90,106,0.05)',
                border: '1px solid rgba(255,90,106,0.20)',
              }}
            >
              <div
                className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white"
                style={{
                  background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
                }}
              >
                <Check className="w-5 h-5" />
              </div>
              <p className="font-[family:var(--font-kanit)] font-semibold">ส่งข้อความเรียบร้อย</p>
              <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mt-1">
                เราจะติดต่อกลับโดยเร็วที่สุด
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium mb-1.5">ชื่อ</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-[color:var(--shop-ink,#1A1A1F)]/10 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">อีเมล</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-[color:var(--shop-ink,#1A1A1F)]/10 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--shop-primary,#FF5A6A)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">ข้อความ</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-[color:var(--shop-ink,#1A1A1F)]/10 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[color:var(--shop-primary,#FF5A6A)] transition-colors resize-y"
                />
              </div>
              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-xs"
                  style={{
                    background: 'rgba(220,38,38,0.08)',
                    color: '#B91C1C',
                  }}
                >
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-medium text-white transition-transform disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
                }}
              >
                <Send className="w-4 h-4" />
                {status === 'submitting' ? 'กำลังส่ง…' : 'ส่งข้อความ'}
              </button>
            </>
          )}
        </form>

        {/* Channels */}
        <aside className="space-y-4">
          <div
            className="rounded-2xl bg-white p-5"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
          >
            <h3 className="font-[family:var(--font-kanit)] font-semibold text-sm tracking-tight mb-3">
              ช่องทางติดต่อ
            </h3>
            <ul className="space-y-3 text-sm">
              {store.contactPhone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 mt-0.5 text-[color:var(--shop-primary,#FF5A6A)]" />
                  <a
                    href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                    className="hover:text-[color:var(--shop-primary,#FF5A6A)]"
                  >
                    {store.contactPhone}
                  </a>
                </li>
              )}
              {store.contactEmail && (
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 mt-0.5 text-[color:var(--shop-primary,#FF5A6A)]" />
                  <a
                    href={`mailto:${store.contactEmail}`}
                    className="hover:text-[color:var(--shop-primary,#FF5A6A)] break-all"
                  >
                    {store.contactEmail}
                  </a>
                </li>
              )}
              {store.lineId && (
                <li className="flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 mt-0.5 text-[color:var(--shop-primary,#FF5A6A)]" />
                  <a
                    href={`https://line.me/ti/p/~${store.lineId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[color:var(--shop-primary,#FF5A6A)]"
                  >
                    LINE: {store.lineId}
                  </a>
                </li>
              )}
              {hasAddress && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 text-[color:var(--shop-primary,#FF5A6A)]" />
                  <div className="leading-relaxed text-[color:var(--shop-ink-muted,#6B7280)]">
                    {line1 && <div>{line1}</div>}
                    {line2 && <div>{line2}</div>}
                    {line3 && <div>{line3}</div>}
                  </div>
                </li>
              )}
            </ul>
          </div>
          <p className="text-[11px] text-[color:var(--shop-ink-muted,#6B7280)] px-4">
            เวลาทำการ: จันทร์–เสาร์ 9:00–18:00 น.
          </p>
        </aside>
      </div>
    </div>
  );
}
