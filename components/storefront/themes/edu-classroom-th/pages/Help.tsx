'use client';

/**
 * EduClassroom — bespoke Help / FAQ page.
 *
 * Adapts the shape of shadcn-studio's `faq-component-17` (left intro
 * column · right stacked cards · framer-motion entrance animation)
 * into a classroom-themed layout and wires it to Thai teacher-focused
 * answers. Falls back to a stock FAQ when the schema-driven `schemaPage`
 * field is absent so freshly-provisioned stores always show real help.
 *
 * Layout choices:
 *   - Notebook cream background with chalk-amber margin line
 *   - Hero band hand-coded so the page title can include
 *     "ศูนย์ช่วยเหลือคุณครู" / "นโยบายการคืนสินค้า" depending on the
 *     route's pageSlug
 *   - Each FAQ card has a chalk-yellow stamp eyebrow with a numeric
 *     "ข้อ ๑ / ๒ / ๓" Thai count so the page feels like a classroom
 *     reference handout rather than a generic SaaS FAQ.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Plus,
  Minus,
  MessageCircle,
  Download,
  RefreshCw,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import type { HelpProps } from '@/lib/templates/types';

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

const TITLES: Record<string, string> = {
  faq: 'คำถามที่พบบ่อย',
  shipping: 'การจัดส่งสื่อการสอน',
  returns: 'นโยบายการคืนสินค้า',
  privacy: 'นโยบายความเป็นส่วนตัว',
  terms: 'ข้อกำหนดและเงื่อนไข',
};

const EYEBROWS: Record<string, string> = {
  faq: 'ศูนย์ช่วยเหลือคุณครู',
  shipping: 'ไฟล์ดาวน์โหลด',
  returns: 'นโยบายการคืนเงิน',
  privacy: 'ข้อมูลส่วนบุคคล',
  terms: 'ข้อกำหนดผู้ใช้งาน',
};

const FAQ_BY_SLUG: Record<string, { q: string; a: string }[]> = {
  faq: [
    {
      q: 'ดาวน์โหลดไฟล์ได้ที่ไหนหลังชำระเงิน?',
      a: 'หลังชำระเงินสำเร็จ ระบบจะส่งลิงก์ดาวน์โหลดไปยังอีเมลที่ระบุไว้ทันที และยังสามารถเข้าไปดาวน์โหลดซ้ำได้ที่หน้า "คำสั่งซื้อของฉัน" ตลอด 24 ชั่วโมง',
    },
    {
      q: 'แก้ไขไฟล์สไลด์ได้ไหม?',
      a: 'แก้ไขได้ทุกไฟล์ครับ/ค่ะ ทุกชุดเปิดด้วย Google Slides หรือ PowerPoint ได้ ครูสามารถเปลี่ยนชื่อโรงเรียน รูปภาพ ฟอนต์ และเนื้อหาให้เหมาะกับห้องเรียนของตัวเองได้อิสระ',
    },
    {
      q: 'ใช้สอนหลายห้องเรียนพร้อมกันได้ไหม?',
      a: 'ครูที่ซื้อสามารถใช้สอนในห้องเรียนของตนเองได้ไม่จำกัดจำนวนห้อง แต่ห้ามแจกจ่ายไฟล์ต้นฉบับให้ครูคนอื่นโดยไม่ได้รับอนุญาตจากผู้สร้าง',
    },
    {
      q: 'ถ้าดาวน์โหลดไม่สำเร็จต้องทำยังไง?',
      a: 'ติดต่อทีมงานผ่านปุ่ม "ติดต่อทีมงาน" ด้านล่าง พร้อมแจ้งหมายเลขคำสั่งซื้อ ทีมงานจะส่งลิงก์ใหม่ให้ภายใน 24 ชั่วโมง (ปกติเร็วกว่านี้มาก)',
    },
    {
      q: 'มีอัปเดตเนื้อหาให้ฟรีไหมเมื่อหลักสูตรเปลี่ยน?',
      a: 'มีครับ/ค่ะ เมื่อมีการอัปเดตเนื้อหาให้สอดคล้องกับหลักสูตรปัจจุบัน ครูที่เคยซื้อจะได้รับไฟล์ใหม่ฟรีโดยไม่ต้องชำระเงินเพิ่ม',
    },
    {
      q: 'จ่ายเงินผ่านช่องทางอะไรได้บ้าง?',
      a: 'รองรับการชำระเงินผ่านบัตรเครดิต/เดบิต, พร้อมเพย์, โอนผ่าน Mobile Banking และตัดผ่าน True Money / Rabbit LINE Pay ทุกช่องทางใช้เกตเวย์ที่เข้ารหัส SSL',
    },
  ],
  shipping: [
    {
      q: 'สื่อทุกชิ้นเป็นไฟล์ดาวน์โหลดใช่ไหม?',
      a: 'ใช่ครับ/ค่ะ ทุกชิ้นเป็นไฟล์ดิจิทัล ไม่มีการจัดส่งเป็นกระดาษ ครูสามารถดาวน์โหลดได้ทันทีหลังชำระเงินสำเร็จ',
    },
    {
      q: 'รองรับฟอร์แมตอะไรบ้าง?',
      a: 'PDF สำหรับพิมพ์ใช้, PPTX/Google Slides สำหรับฉายในห้อง, DOCX สำหรับแก้ไขเนื้อหา ทุกไฟล์อยู่ในชุดดาวน์โหลดเดียวกัน',
    },
    {
      q: 'ไฟล์มีขนาดเท่าไร?',
      a: 'ใบงานมาตรฐานอยู่ที่ 5–15 MB · ชุดสไลด์ขนาดใหญ่สูงสุดประมาณ 80 MB ระบบจะ ZIP รวมให้ใน 1 ไฟล์เพื่อให้ดาวน์โหลดสะดวก',
    },
  ],
  returns: [
    {
      q: 'คืนเงินได้ไหม?',
      a: 'เนื่องจากเป็นสินค้าดิจิทัลดาวน์โหลดได้ทันที โดยทั่วไปจะไม่รับคืนเงินหลังการดาวน์โหลด แต่ถ้าไฟล์มีปัญหาเปิดไม่ได้หรือเนื้อหาไม่ตรงตามรายละเอียด ครูสามารถแจ้งทีมงานเพื่อขอรับเงินคืน 100% ได้ภายใน 7 วัน',
    },
    {
      q: 'ถ้าซื้อผิดชิ้นต้องทำอย่างไร?',
      a: 'ถ้ายังไม่ได้ดาวน์โหลด สามารถติดต่อทีมงานเพื่อขอสลับเป็นชิ้นอื่นที่ราคาเท่ากันได้ทันที',
    },
  ],
  privacy: [
    {
      q: 'เราเก็บข้อมูลอะไรของครูบ้าง?',
      a: 'เก็บเฉพาะอีเมล ชื่อผู้ใช้ และประวัติคำสั่งซื้อเท่าที่จำเป็นต่อการส่งไฟล์และออกใบกำกับภาษี ไม่มีการขายข้อมูลให้บุคคลที่สาม',
    },
    {
      q: 'อยากลบบัญชีออกจากระบบ?',
      a: 'ครูสามารถติดต่อทีมงานเพื่อลบข้อมูลถาวร เราจะลบทุกข้อมูลภายใน 7 วันทำการ',
    },
  ],
  terms: [
    {
      q: 'อนุญาตให้ใช้สื่อกับเด็กกี่คน?',
      a: 'อนุญาตให้ใช้สอนในห้องเรียนที่ครูดูแลโดยตรงเท่านั้น ไม่จำกัดจำนวนเด็ก แต่ห้ามแจกจ่ายไฟล์ต้นฉบับ',
    },
    {
      q: 'นำไปทำสื่อขายต่อได้ไหม?',
      a: 'ไม่อนุญาตให้นำไฟล์ไปขายต่อ ทั้งในรูปแบบเดิมหรือดัดแปลง ผู้ละเมิดลิขสิทธิ์จะถูกระงับบัญชีและดำเนินคดีตามกฎหมาย',
    },
  ],
};

const TRUST_PILLARS = [
  {
    icon: Download,
    title: 'ดาวน์โหลดทันที',
    body: 'รับไฟล์ทันทีหลังชำระเงิน · ไม่ต้องรอ',
  },
  {
    icon: RefreshCw,
    title: 'อัปเดตฟรีตลอดอายุ',
    body: 'เปลี่ยนหลักสูตรแล้วอัปเดตให้ฟรี',
  },
  {
    icon: ShieldCheck,
    title: 'ใบเสร็จ/ใบกำกับภาษี',
    body: 'ออกใบกำกับภาษีให้ทันทีในระบบ',
  },
];

export default function EduClassroomHelp({ store, pageSlug }: HelpProps) {
  const slug = pageSlug ?? 'faq';
  const title = TITLES[slug] ?? 'ศูนย์ช่วยเหลือ';
  const eyebrow = EYEBROWS[slug] ?? 'ครูแชร์ครู';
  const items = FAQ_BY_SLUG[slug] ?? FAQ_BY_SLUG.faq;

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <main className={`${FONT_BODY} min-h-screen`} style={{ background: EDU_BG, color: EDU_INK }}>
      {/* Hero */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: EDU_BORDER }}>
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${EDU_BG_SOFT} 0%, ${EDU_BG} 60%, #EFF6FF 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.16]"
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
              <HelpCircle size={20} strokeWidth={2.5} />
            </span>
            <span
              className={`text-[11px] ${FONT_HEADING} font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}
              style={{ background: EDU_BG_SOFT, color: EDU_ACCENT_DEEP }}
            >
              {eyebrow}
            </span>
          </div>
          <h1 className={`${FONT_HEADING} font-black text-3xl sm:text-4xl lg:text-5xl leading-tight`} style={{ color: EDU_INK }}>
            {title}
          </h1>
          <p className="mt-2 text-sm" style={{ color: EDU_INK_MUTED }}>
            ทีมงาน {store.name} รวบรวมคำถามที่ครูถามบ่อยที่สุดไว้ที่นี่
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left intro column — adapted from faq-component-17 */}
        <aside className="lg:col-span-5 space-y-5 lg:sticky lg:top-24 self-start">
          <div
            className={`inline-flex items-center gap-1.5 text-xs ${FONT_HEADING} font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border`}
            style={{ background: '#FFFFFF', color: EDU_PRIMARY, borderColor: `${EDU_PRIMARY}33` }}
          >
            FAQ · คำถามที่พบบ่อย
          </div>
          <h2 className={`${FONT_HEADING} font-bold text-2xl sm:text-3xl`} style={{ color: EDU_INK }}>
            สิ่งที่ครูถามเรามากที่สุด
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: EDU_INK_MUTED }}>
            ค้นหาคำตอบสำหรับคำถามเรื่องการดาวน์โหลด · การแก้ไขไฟล์ · ลิขสิทธิ์การใช้สื่อในห้องเรียน
            ถ้าไม่พบคำถามของคุณ ติดต่อทีมงานได้เลย เราตอบภายใน 24 ชั่วโมง
          </p>

          {/* Trust pillars */}
          <div className="space-y-3 pt-2">
            {TRUST_PILLARS.map(({ icon: Icon, title: t, body: b }) => (
              <div
                key={t}
                className="flex gap-3 items-start bg-white border rounded-xl p-3"
                style={{ borderColor: EDU_BORDER }}
              >
                <span
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${EDU_PRIMARY}14`, color: EDU_PRIMARY }}
                >
                  <Icon size={16} />
                </span>
                <div>
                  <p className={`${FONT_HEADING} font-bold text-sm`} style={{ color: EDU_INK }}>
                    {t}
                  </p>
                  <p className="text-xs leading-snug" style={{ color: EDU_INK_MUTED }}>
                    {b}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href={`/stores/${store.slug}/contact`}
            className={`inline-flex items-center justify-center gap-2 w-full text-sm ${FONT_HEADING} font-bold px-5 py-3 rounded-full text-white shadow-sm hover:shadow-md transition-all`}
            style={{ background: EDU_PRIMARY }}
          >
            <MessageCircle size={15} />
            ติดต่อทีมงาน · ตอบใน 24 ชม.
          </Link>
        </aside>

        {/* Right FAQ cards */}
        <div className="lg:col-span-7 space-y-3">
          {items.map((item, idx) => {
            const open = idx === openIdx;
            return (
              <article
                key={item.q}
                className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                style={{ borderColor: EDU_BORDER }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : idx)}
                  aria-expanded={open}
                  className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md text-xs ${FONT_HEADING} font-black`}
                      style={{
                        background: open ? EDU_PRIMARY : EDU_BG_SOFT,
                        color: open ? '#FFFFFF' : EDU_ACCENT_DEEP,
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className={`${FONT_HEADING} font-bold text-base sm:text-lg leading-snug`}
                      style={{ color: EDU_INK }}
                    >
                      {item.q}
                    </h3>
                  </div>
                  <span
                    className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full"
                    style={{
                      background: open ? EDU_PRIMARY : EDU_BG,
                      color: open ? '#FFFFFF' : EDU_PRIMARY,
                      border: `1px solid ${open ? EDU_PRIMARY : EDU_BORDER}`,
                    }}
                  >
                    {open ? <Minus size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
                  </span>
                </button>
                {open && (
                  <div
                    className="px-5 pb-5 pl-[68px] text-sm leading-relaxed border-t"
                    style={{ borderColor: EDU_BORDER, color: EDU_INK_MUTED }}
                  >
                    <p className="pt-3 whitespace-pre-line">{item.a}</p>
                  </div>
                )}
              </article>
            );
          })}

          {/* Bottom CTA strip */}
          <div
            className="mt-6 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border"
            style={{ background: EDU_BG_SOFT, borderColor: `${EDU_ACCENT}40` }}
          >
            <div>
              <p
                className={`text-xs ${FONT_HEADING} font-bold uppercase tracking-wider`}
                style={{ color: EDU_ACCENT_DEEP }}
              >
                ยังไม่พบคำตอบ?
              </p>
              <p className={`${FONT_HEADING} font-bold text-lg`} style={{ color: EDU_INK }}>
                ส่งข้อความหาทีมงานได้เลย
              </p>
            </div>
            <Link
              href={`/stores/${store.slug}/contact`}
              className={`inline-flex items-center gap-2 ${FONT_HEADING} font-bold text-sm text-white px-5 py-3 rounded-full shadow-sm hover:shadow-md transition-all`}
              style={{ background: EDU_PRIMARY_DEEP }}
            >
              <Mail size={14} />
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
