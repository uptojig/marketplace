'use client';

import React from 'react';
import { Mail, Phone, MessageCircle, MapPin, type LucideIcon } from 'lucide-react';

/**
 * GridModu — contact (scaffold).
 *
 * Uses a locally-defined widened Props shape (mirrors the pattern from
 * neon-festival) so the page can render contact-method cards if the
 * route dispatcher passes the extra fields. The typed `ContactProps`
 * surface in `lib/templates/types.ts` only exposes `TemplateStoreSummary`,
 * so designers should treat the widened fields as best-effort runtime
 * data.
 */
interface ContactStore {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  lineId?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  subdistrict?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
}

interface Props {
  store: ContactStore;
}

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(' ');
}

export default function Contact({ store }: Props) {
  const address = joinAddress([
    store.addressLine1,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ]);

  const cards: Array<{
    icon: LucideIcon;
    label: string;
    value: string | null | undefined;
  }> = [
    { icon: Phone, label: 'โทรศัพท์', value: store.contactPhone },
    { icon: Mail, label: 'อีเมล', value: store.contactEmail },
    { icon: MessageCircle, label: 'LINE', value: store.lineId },
    { icon: MapPin, label: 'ที่อยู่', value: address || null },
  ];

  return (
    <div className="bg-[var(--shop-bg)] text-[var(--shop-ink)] font-[family:var(--font-prompt)]">
      <section className="bg-[var(--shop-bg-soft)] border-b border-[var(--shop-border)] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-black">
            ติดต่อเรา
          </h1>
          <p className="text-sm text-[var(--shop-ink-muted)] mt-2">
            เราพร้อมตอบทุกคำถามจากคุณ
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 grid gap-4 sm:grid-cols-2">
        {cards.map(({ icon: Icon, label, value }) =>
          value ? (
            <div
              key={label}
              className="bg-white border border-[var(--shop-border)] rounded p-4 flex gap-3 items-start"
            >
              <span
                className="p-2 rounded-full text-white shrink-0"
                style={{ background: 'var(--shop-primary)' }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm">{label}</h3>
                <p className="text-sm text-[var(--shop-ink-muted)] break-all">
                  {value}
                </p>
              </div>
            </div>
          ) : null
        )}
      </section>

      <section className="max-w-3xl mx-auto px-4 py-8">
        <form
          method="post"
          action={`/api/stores/${store.slug}/contact`}
          className="bg-white border border-[var(--shop-border)] rounded p-4 space-y-3"
          aria-label="แบบฟอร์มติดต่อ"
        >
          <h2 className="font-[family:var(--font-kanit)] font-bold text-xl">
            ส่งข้อความถึงเรา
          </h2>
          <input
            type="text"
            name="name"
            required
            placeholder="ชื่อ"
            className="w-full border border-[var(--shop-border)] rounded px-3 py-2"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="อีเมล"
            className="w-full border border-[var(--shop-border)] rounded px-3 py-2"
          />
          <input
            type="text"
            name="subject"
            placeholder="หัวข้อ"
            className="w-full border border-[var(--shop-border)] rounded px-3 py-2"
          />
          <textarea
            name="message"
            required
            rows={5}
            placeholder="ข้อความ"
            className="w-full border border-[var(--shop-border)] rounded px-3 py-2"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-full text-white font-bold"
            style={{ background: 'var(--shop-primary)' }}
          >
            ส่งข้อความ
          </button>
        </form>
      </section>
    </div>
  );
}
