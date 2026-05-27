'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, MessageCircle, Mail, Phone, Sparkles, Palette } from 'lucide-react';
import { VECTOR_BAZAAR_RAINBOW } from '../palette';

interface HelpProps {
  store: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    lineId?: string | null;
  };
  schemaPage?: unknown;
  pageSlug?: string;
}

interface FaqItem {
  q: string;
  a: string;
}

const PAGE_TITLES: Record<string, string> = {
  faq: 'คำถามที่พบบ่อย',
  'order-guide': 'วิธีสั่งซื้อ',
  'size-guide': 'คู่มือไฟล์',
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'ดาวน์โหลดไฟล์ได้ที่ไหน?',
    a: 'หลังชำระเงินสำเร็จ ระบบจะส่งลิงก์ดาวน์โหลดไปยังอีเมลของคุณทันที — และคุณยังสามารถดาวน์โหลดซ้ำได้จากหน้า "คำสั่งซื้อของฉัน" ตลอดอายุการใช้งานบัญชี',
  },
  {
    q: 'ไฟล์ที่ได้รับมีรูปแบบอะไรบ้าง?',
    a: 'ทุกผลงานมาในรูปแบบ .svg, .ai, .eps และ .png ความละเอียดสูง — เปิดและแก้ไขได้ใน Figma, Adobe Illustrator, Affinity Designer, Sketch หรือเครื่องมือ vector อื่นๆ',
  },
  {
    q: 'แก้ไขสีและรูปทรงได้ไหม?',
    a: 'ได้ — ไฟล์ของเราจัดเลเยอร์มาเรียบร้อยทุกชิ้น คุณสามารถเปลี่ยนสี ปรับขนาด เพิ่ม-ลด element ได้ตามต้องการ ไม่ต้องเริ่มจากศูนย์',
  },
  {
    q: 'ใบอนุญาตการใช้งานครอบคลุมอะไรบ้าง?',
    a: 'ใบอนุญาตเชิงพาณิชย์ฟรีรวมในทุกแพ็ค — ใช้ในเว็บไซต์, แอป, สื่อสิ่งพิมพ์, แพ็คเกจจิ้ง, โซเชียลมีเดีย, และสื่อโฆษณาได้ ไม่จำกัดจำนวนโปรเจค ห้ามขายต่อในรูปแบบ template / stock',
  },
  {
    q: 'มีบริการขอ custom design ไหม?',
    a: 'มีค่ะ — ติดต่อเราผ่าน LINE หรืออีเมล เพื่อสอบถามราคา custom design เราเปิดรับงานอิเลสเตรชั่น icon set และ illustration เฉพาะแบรนด์',
  },
  {
    q: 'ใช้เวลาดาวน์โหลดนานไหม?',
    a: 'ขนาดไฟล์ปกติไม่เกิน 50 MB ดาวน์โหลดได้ภายใน 1-2 นาทีบนเน็ตทั่วไป — ถ้ามีปัญหาเครือข่าย สามารถดาวน์โหลดใหม่ได้ไม่จำกัดครั้ง',
  },
  {
    q: 'ขอคืนเงินได้ไหมหากไม่พอใจ?',
    a: 'เนื่องจากเป็นสินค้าดิจิทัล เราไม่สามารถคืนเงินหลังดาวน์โหลดแล้ว — แต่เรารับประกันคุณภาพ หากไฟล์มีปัญหา ติดต่อเราภายใน 7 วันเพื่อรับไฟล์ใหม่ฟรี',
  },
];

export function Help({ store, pageSlug = 'faq' }: HelpProps) {
  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const title = PAGE_TITLES[pageSlug] ?? 'ศูนย์ช่วยเหลือ';

  const filtered = query.trim()
    ? DEFAULT_FAQS.filter(
        (f) =>
          f.q.toLowerCase().includes(query.toLowerCase()) ||
          f.a.toLowerCase().includes(query.toLowerCase()),
      )
    : DEFAULT_FAQS;

  return (
    <div className="bg-[#FEFCE8] text-[#1E1B4B] font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden vb-rainbow-bg border-b border-[#FBCFE8]">
        <div className="absolute inset-0 vb-confetti opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#FBCFE8] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#DB2777] font-[family:var(--font-kanit)] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            ศูนย์ช่วยเหลือ
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            <span className="vb-rainbow-text">{title}</span>
          </h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Search */}
        <label className="block relative">
          <span className="sr-only">ค้นหาคำถาม</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาคำถาม..."
            className="w-full rounded-full border border-[#FBCFE8] bg-white pl-12 pr-4 py-3.5 text-sm font-medium text-[#1E1B4B] focus:outline-none focus:border-[#F472B6] focus:ring-2 focus:ring-[#F472B6]/30 shadow-sm transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6366F1] pointer-events-none" />
        </label>

        {/* FAQ accordion */}
        <ul className="space-y-3">
          {filtered.length === 0 ? (
            <li className="text-center py-14 rounded-3xl border-2 border-dashed border-[#FBCFE8] bg-white">
              <Palette className="w-10 h-10 mx-auto text-[#F472B6] mb-3" />
              <p className="font-[family:var(--font-kanit)] text-lg font-black mb-1">
                ไม่พบคำถาม
              </p>
              <p className="text-sm text-[#6366F1]">
                ลองคำอื่น หรือติดต่อเราโดยตรง
              </p>
            </li>
          ) : (
            filtered.map((f, idx) => {
              const open = openIdx === idx;
              const color = VECTOR_BAZAAR_RAINBOW[idx % VECTOR_BAZAAR_RAINBOW.length];
              return (
                <li
                  key={f.q}
                  className="rounded-3xl bg-white border border-[#FBCFE8] overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#FCE7F3]/40 transition-colors"
                    aria-expanded={open}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-[family:var(--font-kanit)] font-black shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="font-[family:var(--font-kanit)] font-black text-sm sm:text-base text-[#1E1B4B]">
                        {f.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform text-[#DB2777] ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 py-4 border-t border-[#FBCFE8] bg-[#FEFCE8]/60 text-sm leading-relaxed text-[#1E1B4B]/90">
                      {f.a}
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>

        {/* Contact CTA */}
        <div className="mt-12 rounded-[2rem] vb-rainbow-bg border border-[#FBCFE8] p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 vb-confetti opacity-40 pointer-events-none" aria-hidden />
          <div className="relative space-y-5">
            <div>
              <h3 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-black tracking-tight mb-2">
                <span className="vb-rainbow-text">ยังหาคำตอบไม่เจอ?</span>
              </h3>
              <p className="text-sm text-[#1E1B4B]/80">
                ทีมงานพร้อมตอบคำถามภายใน 24 ชั่วโมงทุกช่องทาง
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {store.lineId && (
                <a
                  href={`https://line.me/ti/p/~${store.lineId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-white border border-[#FBCFE8] p-4 hover:bg-[#D1FAE5] hover:border-[#34D399] transition-colors flex items-center justify-center gap-2 text-sm font-[family:var(--font-kanit)] font-bold text-[#047857]"
                >
                  <MessageCircle className="w-4 h-4" /> LINE
                </a>
              )}
              {store.contactEmail && (
                <a
                  href={`mailto:${store.contactEmail}`}
                  className="rounded-2xl bg-white border border-[#FBCFE8] p-4 hover:bg-[#FCE7F3] hover:border-[#F472B6] transition-colors flex items-center justify-center gap-2 text-sm font-[family:var(--font-kanit)] font-bold text-[#DB2777]"
                >
                  <Mail className="w-4 h-4" /> อีเมล
                </a>
              )}
              {store.contactPhone && (
                <a
                  href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                  className="rounded-2xl bg-white border border-[#FBCFE8] p-4 hover:bg-[#DBEAFE] hover:border-[#60A5FA] transition-colors flex items-center justify-center gap-2 text-sm font-[family:var(--font-kanit)] font-bold text-[#2563EB]"
                >
                  <Phone className="w-4 h-4" /> โทร
                </a>
              )}
              <Link
                href={`/stores/${store.slug}/contact`}
                className="sm:col-span-3 rounded-2xl bg-[#1E1B4B] text-white p-4 hover:bg-[#312E81] transition-colors flex items-center justify-center gap-2 text-sm font-[family:var(--font-kanit)] font-bold"
              >
                ไปยังหน้าติดต่อเรา →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
