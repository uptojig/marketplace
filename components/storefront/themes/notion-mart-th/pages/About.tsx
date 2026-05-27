'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Globe, ShieldCheck, RefreshCcw, ArrowRight } from 'lucide-react';
import type { AboutProps } from '@/lib/templates/types';

const FONT_HEADING = 'font-[family:var(--font-kanit)]';
const FONT_BODY = 'font-[family:var(--font-prompt)]';

const VALUES: { emoji: string; title: string; body: string }[] = [
  { emoji: '🎯', title: 'พันธกิจ', body: 'ทำให้คนไทยใช้ Notion เป็นเรื่องของวันแรก ไม่ใช่หลายเดือนเรียนรู้' },
  { emoji: '🛠️', title: 'งานคราฟต์', body: 'ทุกเทมเพลตทดสอบบน Notion เวอร์ชั่นล่าสุด มีคู่มือไทยและรองรับมือถือ' },
  { emoji: '🤝', title: 'สัญญา', body: 'อัปเดตฟรีตลอดอายุไฟล์ · คืนเงินภายใน 7 วันถ้าไม่ตรงกับที่คาดหวัง' },
  { emoji: '🌱', title: 'คอมมูนิตี้', body: 'แลกเปลี่ยนสูตรการใช้ Notion กับผู้ใช้ไทยกว่า 12,000+ ราย ผ่าน LINE OA' },
];

const FOUNDERS: { name: string; role: string; emoji: string }[] = [
  { name: 'พลอย', role: 'Notion Coach · 5 ปี', emoji: '🧠' },
  { name: 'อาทิตย์', role: 'Template Designer', emoji: '🎨' },
  { name: 'นัท', role: 'Customer Success', emoji: '🤝' },
];

export function About({ store }: AboutProps) {
  const description = store.description?.trim() || null;
  const tagline = store.tagline?.trim() || null;

  return (
    <div className={`bg-white text-[#1A1A1A] min-h-screen ${FONT_BODY}`}>
      <section className="px-4 sm:px-8 lg:px-16 pt-12 sm:pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          <p className={`text-[10px] tracking-[0.16em] uppercase ${FONT_HEADING} font-medium text-[#6B6B6B] mb-3`}>เกี่ยวกับเรา</p>
          <h1 className={`${FONT_HEADING} font-bold text-3xl sm:text-5xl text-[#1A1A1A] leading-tight`}>👋 ยินดีต้อนรับสู่ {store.name}</h1>
          {tagline && <p className="mt-4 text-[15px] text-[#6B6B6B] leading-relaxed max-w-2xl">{tagline}</p>}
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-16 pb-10">
        <div className="max-w-3xl mx-auto">
          <div className="border-l-[3px] border-[#2563EB] bg-[#F7F6F3] rounded-md p-5 sm:p-6">
            <p className={`text-[11px] tracking-[0.12em] uppercase ${FONT_HEADING} font-semibold text-[#2563EB] mb-2`}>เรื่องราวของเรา</p>
            <p className="text-[14.5px] leading-[1.75] text-[#1A1A1A] whitespace-pre-line">
              {description ?? `${store.name} เริ่มต้นจากกลุ่ม Notion power-users ที่อยากให้คนไทยใช้ Notion ได้ง่ายขึ้น เราคัดเทมเพลตจากการทำงานจริงตลอด 5 ปี ปรับให้เข้ากับวัฒนธรรมการทำงานในประเทศ พร้อมคู่มือไทยทุกขั้นตอน`}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-16 pb-10">
        <div className="max-w-5xl mx-auto">
          <h2 className={`${FONT_HEADING} font-bold text-2xl text-[#1A1A1A] mb-5`}>สิ่งที่เรายึดถือ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VALUES.map((v) => (
              <article key={v.title} className="bg-white border border-[#E5E5E5] rounded-md p-4 hover:border-[#1A1A1A] transition-colors">
                <p className="text-3xl mb-2 leading-none" aria-hidden>{v.emoji}</p>
                <h3 className={`${FONT_HEADING} font-semibold text-[15px] text-[#1A1A1A]`}>{v.title}</h3>
                <p className="mt-1 text-[13px] text-[#6B6B6B] leading-relaxed">{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-16 pb-10">
        <div className="max-w-5xl mx-auto">
          <h2 className={`${FONT_HEADING} font-bold text-2xl text-[#1A1A1A] mb-5`}>ทีมงานของเรา</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FOUNDERS.map((f) => (
              <article key={f.name} className="bg-white border border-[#E5E5E5] rounded-md p-4 text-center hover:border-[#1A1A1A] transition-colors">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F6F3] border border-[#E5E5E5] text-2xl mb-2" aria-hidden>{f.emoji}</div>
                <p className={`${FONT_HEADING} font-semibold text-[14px] text-[#1A1A1A]`}>{f.name}</p>
                <p className="text-[11px] text-[#6B6B6B] mt-0.5">{f.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-16 pb-10">
        <div className="max-w-3xl mx-auto bg-[#F7F6F3] border border-[#E5E5E5] rounded-md p-5">
          <h3 className={`${FONT_HEADING} font-semibold text-[13px] text-[#6B6B6B] uppercase tracking-[0.12em] mb-3`}>ลูกค้าเลือกเราเพราะ</h3>
          <ul className="space-y-2 text-[13.5px] text-[#1A1A1A]">
            <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />เทมเพลตคัดสรร · ใช้ได้จริงตั้งแต่วันแรก</li>
            <li className="flex items-start gap-2"><Globe className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />รองรับภาษาไทย · คู่มือทุกขั้นตอน</li>
            <li className="flex items-start gap-2"><RefreshCcw className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />อัปเดตฟรีตลอดอายุไฟล์</li>
            <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />ดูแลหลังการขาย · ตอบทุกคำถามภายใน 24 ชม.</li>
          </ul>
        </div>
      </section>

      <section className="px-4 sm:px-8 lg:px-16 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link href={`/stores/${store.slug}/category`} className="inline-flex items-center gap-2 bg-black hover:bg-[#1A1A1A] text-white text-[13px] font-medium px-6 py-3 rounded transition-colors">
            ดูเทมเพลตทั้งหมด
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
