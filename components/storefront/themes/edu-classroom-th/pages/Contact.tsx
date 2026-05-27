'use client';

/**
 * EduClassroom — bespoke Contact page.
 *
 * Widens the typed `ContactProps` so we can render real contact-method
 * cards when the runtime store object includes email/phone/line. The
 * typed `TemplateStoreSummary` doesn't expose those fields but the
 * dispatcher routes the raw Prisma store record in, so the cards
 * surface when the operator has set them in the admin.
 *
 * Visual rules — match the rest of the EduClassroom chrome:
 *   - Notebook-paper cream background with chalk-amber margin
 *   - Classroom-blue accent on icons / submit / hero strip
 *   - Kanit display headings, Prompt body
 *   - Contact form posts to `/api/stores/[slug]/contact` (same endpoint
 *     every other theme uses).
 */

import React from 'react';
import { Mail, Phone, MessageCircle, MapPin, Send, type LucideIcon } from 'lucide-react';

import {
  EDU_PRIMARY,
  EDU_PRIMARY_DEEP,
  EDU_ACCENT,
  EDU_ACCENT_DEEP,
  EDU_BG,
  EDU_BG_SOFT,
  EDU_BORDER,
  EDU_INK,
  EDU_INK_MUTED,
} from '../palette';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

/**
 * Local widened store shape — the typed `ContactProps.store`
 * (`TemplateStoreSummary`) only carries id/slug/name/description/
 * tagline/logo/banner/primaryColor, but the dispatcher routes the
 * raw Prisma record through at runtime so the contact fields surface
 * when the operator has set them in the admin. The extra fields are
 * marked optional so the typed contract still holds.
 */
interface ContactStore {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  lineId?: string | null;
  facebookUrl?: string | null;
  messengerUrl?: string | null;
  instagramUrl?: string | null;
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

export default function EduClassroomContact({ store }: Props) {
  const address = joinAddress([
    store.addressLine1,
    store.addressLine2,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ]);

  const channels: Array<{
    icon: LucideIcon;
    label: string;
    value: string | null | undefined;
    href?: string;
    tint: string;
  }> = [
    {
      icon: Mail,
      label: 'อีเมล',
      value: store.contactEmail,
      href: store.contactEmail ? `mailto:${store.contactEmail}` : undefined,
      tint: EDU_PRIMARY,
    },
    {
      icon: Phone,
      label: 'โทรศัพท์',
      value: store.contactPhone,
      href: store.contactPhone ? `tel:${store.contactPhone.replace(/\s/g, '')}` : undefined,
      tint: EDU_ACCENT,
    },
    {
      icon: MessageCircle,
      label: 'LINE',
      value: store.lineId,
      href: store.lineId ? `https://line.me/ti/p/~${store.lineId.replace(/^@/, '')}` : undefined,
      tint: '#06C755',
    },
    {
      icon: MapPin,
      label: 'ที่อยู่',
      value: address || null,
      tint: EDU_PRIMARY_DEEP,
    },
  ];

  const hasAnyChannel = channels.some((c) => Boolean(c.value));

  return (
    <main className={`${FONT_BODY} min-h-screen`} style={{ background: EDU_BG, color: EDU_INK }}>
      {/* Hero — notebook page */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: EDU_BORDER }}>
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${EDU_BG_SOFT} 0%, ${EDU_BG} 55%, #EFF6FF 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.18]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(37,99,235,0.22) 31px, rgba(37,99,235,0.22) 32px)',
          }}
        />
        <span
          aria-hidden
          className="absolute top-0 bottom-0 left-[7%] w-px hidden md:block"
          style={{ background: `${EDU_ACCENT}66` }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg shadow-md"
              style={{ background: EDU_PRIMARY, color: '#FFFFFF' }}
            >
              <MessageCircle size={20} strokeWidth={2.5} />
            </span>
            <span
              className={`text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}
              style={{ background: EDU_BG_SOFT, color: EDU_ACCENT_DEEP }}
            >
              ติดต่อทีมงาน · ครูแชร์ครู
            </span>
          </div>
          <h1 className={`${FONT_HEADING} font-black text-3xl sm:text-4xl lg:text-5xl leading-tight`} style={{ color: EDU_INK }}>
            ติดต่อ {store.name}
          </h1>
          <p className="mt-2 text-sm sm:text-base max-w-2xl" style={{ color: EDU_INK_MUTED }}>
            ทีมงานคุณครูพร้อมตอบทุกคำถามภายใน 24 ชั่วโมง — ถ้าด่วนหา LINE จะเร็วที่สุด
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Channel cards */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className={`${FONT_HEADING} font-bold text-xl`} style={{ color: EDU_INK }}>
            ช่องทางติดต่อ
          </h2>

          {hasAnyChannel ? (
            <div className="space-y-3">
              {channels.map(({ icon: Icon, label, value, href, tint }) => {
                if (!value) return null;
                const inner = (
                  <div className="flex items-start gap-3">
                    <span
                      className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${tint}14`, color: tint }}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider`}
                        style={{ color: EDU_ACCENT_DEEP }}
                      >
                        {label}
                      </p>
                      <p
                        className={`text-sm break-all ${FONT_HEADING} font-bold`}
                        style={{ color: EDU_INK }}
                      >
                        {value}
                      </p>
                    </div>
                  </div>
                );
                return href ? (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block bg-white border rounded-2xl p-4 hover:shadow-md transition-shadow"
                    style={{ borderColor: EDU_BORDER }}
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={label}
                    className="bg-white border rounded-2xl p-4"
                    style={{ borderColor: EDU_BORDER }}
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-2xl border-2 border-dashed p-6 text-center text-sm"
              style={{ borderColor: EDU_BORDER, color: EDU_INK_MUTED }}
            >
              ยังไม่มีช่องทางติดต่อสาธารณะ ใช้ฟอร์มทางขวาเพื่อส่งข้อความถึงทีมงานได้เลย
            </div>
          )}

          {/* Hours / commitment */}
          <div
            className="rounded-2xl border p-4 sm:p-5 mt-2"
            style={{ background: EDU_BG_SOFT, borderColor: `${EDU_ACCENT}40` }}
          >
            <p
              className={`text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider mb-1`}
              style={{ color: EDU_ACCENT_DEEP }}
            >
              เวลาตอบกลับ
            </p>
            <p className={`${FONT_HEADING} font-bold text-base`} style={{ color: EDU_INK }}>
              ภายใน 24 ชั่วโมง (จันทร์–เสาร์)
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: EDU_INK_MUTED }}>
              คำถามเรื่องดาวน์โหลด / ลิงก์เสีย เราตอบกลับเร็วที่สุดเฉลี่ย 2 ชั่วโมง
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-7">
          <form
            method="post"
            action={`/api/stores/${store.slug}/contact`}
            className="bg-white border rounded-2xl p-5 sm:p-7 shadow-sm space-y-4"
            style={{ borderColor: EDU_BORDER }}
            aria-label="แบบฟอร์มติดต่อ"
          >
            <div>
              <p
                className={`text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider`}
                style={{ color: EDU_PRIMARY }}
              >
                ส่งข้อความถึงเรา
              </p>
              <h2 className={`${FONT_HEADING} font-bold text-2xl mt-1`} style={{ color: EDU_INK }}>
                เขียนถึงทีมงานคุณครู
              </h2>
              <p className="text-xs mt-1.5" style={{ color: EDU_INK_MUTED }}>
                ระบุข้อมูลที่จำเป็น ทีมงานจะตอบกลับทางอีเมลภายใน 24 ชั่วโมง
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field name="name" label="ชื่อ–นามสกุล *" placeholder="คุณครูสมศรี" required />
              <Field name="email" label="อีเมล *" placeholder="teacher@example.com" type="email" required />
            </div>
            <Field name="school" label="โรงเรียน / ระดับชั้น" placeholder="โรงเรียน… ระดับ ป.4" />
            <Field name="subject" label="หัวข้อ" placeholder="เช่น ขอใบกำกับภาษี / ดาวน์โหลดไฟล์ไม่ได้" />

            <label className="block space-y-1.5">
              <span
                className={`text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider`}
                style={{ color: EDU_INK }}
              >
                ข้อความ *
              </span>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="พิมพ์คำถามหรือสิ่งที่อยากให้ช่วย…"
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all resize-y"
                style={
                  {
                    background: '#FFFFFF',
                    borderColor: EDU_BORDER,
                    color: EDU_INK,
                    ['--tw-ring-color' as never]: `${EDU_PRIMARY}55`,
                  } as React.CSSProperties
                }
              />
            </label>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <p className="text-xs" style={{ color: EDU_INK_MUTED }}>
                การส่งข้อความถือว่ายอมรับ
                <a
                  href={`/stores/${store.slug}/privacy`}
                  className="underline ml-1"
                  style={{ color: EDU_PRIMARY }}
                >
                  นโยบายความเป็นส่วนตัว
                </a>
              </p>
              <button
                type="submit"
                className={`inline-flex items-center justify-center gap-2 ${FONT_HEADING} font-bold text-sm text-white px-5 py-3 rounded-full shadow-sm hover:shadow-md transition-all`}
                style={{ background: EDU_PRIMARY }}
              >
                <Send size={14} />
                ส่งข้อความ
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span
        className={`text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider`}
        style={{ color: EDU_INK }}
      >
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
        style={
          {
            background: '#FFFFFF',
            borderColor: EDU_BORDER,
            color: EDU_INK,
            ['--tw-ring-color' as never]: `${EDU_PRIMARY}55`,
          } as React.CSSProperties
        }
      />
    </label>
  );
}
