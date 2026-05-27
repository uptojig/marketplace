'use client';

/**
 * EduClassroom — bespoke About page.
 *
 * Tells the "ครูแชร์ครู" story to a classroom-teacher audience. Mirrors
 * the chalk-amber / classroom-blue visual language used on the rest of
 * the storefront so /about doesn't fall back to the generic shadcn
 * about block.
 *
 * Every text is either pulled from `store.description` (operator
 * editable in the admin UI) or rendered as a stable theme-default
 * fallback in Thai. No images are hard-coded; the hero uses an inline
 * notebook-style SVG so the page never depends on a CDN that might
 * 404 in a fresh tenant.
 */

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Download,
  Users,
  Heart,
  ArrowRight,
  Star,
} from 'lucide-react';
import type { AboutProps } from '@/lib/templates/types';

import {
  EDU_PRIMARY,
  EDU_PRIMARY_DEEP,
  EDU_ACCENT,
  EDU_ACCENT_DEEP,
  EDU_SAVINGS,
  EDU_BG,
  EDU_BG_SOFT,
  EDU_BORDER,
  EDU_INK,
  EDU_INK_MUTED,
} from '../palette';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

export default function EduClassroomAbout({ store }: AboutProps) {
  return (
    <main
      className={`${FONT_BODY} min-h-screen`}
      style={{ background: EDU_BG, color: EDU_INK }}
    >
      {/* Hero — notebook page with chalk-amber margin line */}
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

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className={`inline-flex items-center gap-1.5 text-xs ${FONT_HEADING} font-bold px-3 py-1.5 rounded-full border shadow-sm`}
              style={{ background: '#FFFFFF', color: EDU_PRIMARY, borderColor: `${EDU_PRIMARY}33` }}
            >
              <GraduationCap size={14} />
              เกี่ยวกับเรา
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs ${FONT_HEADING} font-bold px-3 py-1.5 rounded-full text-white shadow-sm`}
              style={{ background: EDU_ACCENT }}
            >
              <Heart size={12} fill="white" />
              ครูแชร์ครู · ไม่หวงวิชา
            </span>
          </div>

          <h1
            className={`${FONT_HEADING} font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-5`}
            style={{ color: EDU_INK }}
          >
            สื่อการสอนคุณภาพ <br />
            <span style={{ color: EDU_PRIMARY }}>โดยครู เพื่อครู</span>
          </h1>

          <p
            className="text-base sm:text-lg max-w-2xl leading-relaxed"
            style={{ color: EDU_INK_MUTED }}
          >
            {store.description?.trim()
              ? store.description
              : `${store.name} เกิดจากครูประจำการที่อยากแบ่งปันสื่อใบงาน สไลด์ ข้อสอบ และแบบทดสอบ ที่ใช้สอนจริงในห้องเรียน เพื่อช่วยให้ครูประถม–มัธยมต้นทุกคนมีเวลาดูแลนักเรียนได้มากขึ้น`}
          </p>
        </div>
      </section>

      {/* Mission cards — three classroom pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p
            className={`text-xs ${FONT_HEADING} font-bold uppercase tracking-wider`}
            style={{ color: EDU_ACCENT_DEEP }}
          >
            พันธกิจของเรา
          </p>
          <h2 className={`${FONT_HEADING} font-bold text-2xl sm:text-3xl`} style={{ color: EDU_INK }}>
            ลดเวลาเตรียมการสอน · เพิ่มเวลาให้นักเรียน
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Download,
              title: 'ดาวน์โหลดได้ทันที',
              body: 'ทุกไฟล์ส่งให้ทันทีหลังชำระเงิน นำไปสอนวันรุ่งขึ้นได้เลย ไม่ต้องรอแอดมินตอบกลับ',
              tint: EDU_PRIMARY,
            },
            {
              icon: BookOpen,
              title: 'แก้ไขได้อิสระ',
              body: 'รองรับ Google Slides · PowerPoint · Word · PDF ปรับให้เข้ากับห้องเรียนของคุณได้',
              tint: EDU_ACCENT,
            },
            {
              icon: Sparkles,
              title: 'สอดคล้องหลักสูตร',
              body: 'ออกแบบโดยครูประจำการ ตรงตามตัวชี้วัดและสาระการเรียนรู้ของหลักสูตรแกนกลาง',
              tint: EDU_SAVINGS,
            },
          ].map(({ icon: Icon, title, body, tint }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all"
              style={{ borderColor: EDU_BORDER }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${tint}1A`, color: tint }}
              >
                <Icon size={20} strokeWidth={2} />
              </div>
              <h3 className={`${FONT_HEADING} font-bold text-base mb-1.5`} style={{ color: EDU_INK }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: EDU_INK_MUTED }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story strip — notebook ruled paper card */}
      <section className="px-4 py-10">
        <div
          className="max-w-5xl mx-auto rounded-2xl border p-6 sm:p-10 relative overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: EDU_BORDER }}
        >
          {/* Faint ruled lines inside */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.12]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(37,99,235,0.55) 27px, rgba(37,99,235,0.55) 28px)',
            }}
          />
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-12 w-px"
            style={{ background: `${EDU_ACCENT}66` }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <p
                className={`text-xs ${FONT_HEADING} font-bold uppercase tracking-wider`}
                style={{ color: EDU_PRIMARY }}
              >
                เรื่องราวของเรา
              </p>
              <h2 className={`${FONT_HEADING} font-bold text-2xl sm:text-3xl`} style={{ color: EDU_INK }}>
                ครูคนหนึ่ง · ช่วยครูอีกหลายแสนคน
              </h2>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: EDU_INK_MUTED }}>
                เริ่มจากครูที่อยู่ในห้องเรียนจริง รู้ว่าการเตรียมใบงานทุกสัปดาห์มันใช้พลังงานเท่าไร
                เราจึงสร้างพื้นที่ให้ครูแบ่งปันสื่อกับครูคนอื่นในราคาที่จับต้องได้
                เพราะเรารู้ว่าครูทุกคนทำเพื่อเด็ก ไม่ใช่เพื่อกำไร
              </p>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: EDU_INK_MUTED }}>
                ทุกชิ้นงานบนหน้าร้านนี้ผ่านการคัดกรองจากทีมครูประจำการ
                ทดลองใช้จริงในห้องเรียนของเด็ก ป.1 ถึง ม.3 และอัปเดตให้ตรงกับหลักสูตรปัจจุบันอย่างต่อเนื่อง
              </p>
            </div>
            <div className="lg:col-span-5 space-y-3">
              {[
                ['125,000+', 'ครูที่ใช้สื่อของเรา'],
                ['8,400+', 'ใบงาน · สไลด์ · ข้อสอบ'],
                ['4.9 ★', 'คะแนนความพึงพอใจ'],
              ].map(([num, label]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border rounded-xl px-4 py-3"
                  style={{ background: EDU_BG_SOFT, borderColor: `${EDU_ACCENT}40` }}
                >
                  <span className={`${FONT_HEADING} font-bold text-2xl`} style={{ color: EDU_PRIMARY }}>
                    {num}
                  </span>
                  <span
                    className={`text-xs ${FONT_HEADING} font-bold uppercase tracking-wider text-right`}
                    style={{ color: EDU_ACCENT_DEEP }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why us — values grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="space-y-1">
          <p
            className={`text-xs ${FONT_HEADING} font-bold uppercase tracking-wider`}
            style={{ color: EDU_ACCENT_DEEP }}
          >
            <Star size={12} className="inline mr-1 -mt-0.5" fill={EDU_ACCENT} stroke="none" />
            ทำไมต้องเลือกเรา
          </p>
          <h2 className={`${FONT_HEADING} font-bold text-2xl sm:text-3xl`} style={{ color: EDU_INK }}>
            เพราะครูเข้าใจครู
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Users,
              title: 'ทีมครูตัวจริง',
              body: 'ผู้สร้างสื่อทุกคนคือครูที่อยู่ในห้องเรียน ไม่ใช่ดีไซเนอร์ที่นั่งอยู่ในออฟฟิศ',
            },
            {
              icon: BookOpen,
              title: 'ใช้สอนได้จริง',
              body: 'ทุกใบงาน · สไลด์ · ข้อสอบ ผ่านการทดสอบในห้องเรียนของจริง ก่อนปล่อยลงร้าน',
            },
            {
              icon: Download,
              title: 'หลายฟอร์แมต',
              body: 'PDF สำหรับพิมพ์ · PPTX/Slides สำหรับฉาย · DOCX สำหรับแก้ไข อยู่ในไฟล์เดียวกัน',
            },
            {
              icon: Sparkles,
              title: 'อัปเดตฟรี',
              body: 'เมื่อหลักสูตรเปลี่ยน เราอัปเดตให้ฟรี โดยไม่ต้องซื้อใหม่ ตลอดอายุการใช้งาน',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex gap-4 bg-white border rounded-2xl p-5 hover:shadow-md transition-shadow"
              style={{ borderColor: EDU_BORDER }}
            >
              <span
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${EDU_PRIMARY}14`, color: EDU_PRIMARY }}
              >
                <Icon size={18} strokeWidth={2} />
              </span>
              <div>
                <h3 className={`${FONT_HEADING} font-bold text-base mb-1`} style={{ color: EDU_INK }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: EDU_INK_MUTED }}>
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-14">
        <div
          className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${EDU_PRIMARY} 0%, ${EDU_PRIMARY_DEEP} 100%)`,
          }}
        >
          <span
            aria-hidden
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: EDU_ACCENT }}
          />
          <h2
            className={`${FONT_HEADING} font-black text-2xl sm:text-3xl text-white mb-3`}
          >
            พร้อมเริ่มต้นแล้วใช่ไหม?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto mb-6">
            เลือกสื่อการสอนที่เหมาะกับห้องเรียนของคุณ ดาวน์โหลดได้ทันที
          </p>
          <Link
            href={`/stores/${store.slug}`}
            className={`inline-flex items-center gap-2 bg-white hover:bg-yellow-50 font-bold px-6 py-3 rounded-full shadow-md transition-colors ${FONT_HEADING}`}
            style={{ color: EDU_PRIMARY }}
          >
            ดูสื่อการสอนทั้งหมด <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
