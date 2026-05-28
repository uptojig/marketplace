'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, MessageCircle, Mail, Phone, Sparkles, Wand2 } from 'lucide-react';

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
  'size-guide': 'คู่มือไฟล์ & การพิมพ์',
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'ดาวน์โหลดสื่อการสอนยังไง?',
    a: 'เมื่อชำระเงินเรียบร้อย ไฟล์จะอยู่ในคลังสินค้าดิจิทัลของบัญชีทันที · เข้าหน้า "คลังสินค้าดิจิทัล" แล้วกดดาวน์โหลดไฟล์ PDF ได้เลย ไม่จำกัดจำนวนครั้ง',
  },
  {
    q: 'ไฟล์พิมพ์ A4 ได้ไหม?',
    a: 'ได้ทุกชุด ⭐ ไฟล์ PDF ออกแบบมาสำหรับพิมพ์ A4 โดยเฉพาะ · พิมพ์จากเครื่องพิมพ์ที่บ้านหรือร้านถ่ายเอกสารได้ คมชัดทุกแผ่น ใช้ได้ทั้งขาวดำและสี',
  },
  {
    q: 'เนื้อหาตรงตามหลักสูตรไหม?',
    a: 'ตรงครับ! ทุกชุดออกแบบโดยทีมครูผู้มีประสบการณ์ อ้างอิงหลักสูตรแกนกลางของไทย เหมาะกับการใช้สอนในห้องเรียนหรือติวที่บ้าน',
  },
  {
    q: 'เหมาะกับเด็กระดับชั้นไหน?',
    a: 'แต่ละชุดระบุระดับชั้นไว้ในรายละเอียดสินค้า ⭐ ส่วนใหญ่ครอบคลุมอนุบาล–ประถมต้น · เลือกตามวิชาและช่วงวัยของเด็กได้เลย',
  },
  {
    q: 'ซื้อแล้วใช้ได้นานแค่ไหน?',
    a: 'ซื้อครั้งเดียวใช้ได้ตลอด · ดาวน์โหลดซ้ำได้ไม่จำกัดจากคลังสินค้าดิจิทัล และได้อัปเดตฟรีเมื่อมีการปรับปรุงไฟล์',
  },
  {
    q: 'พิมพ์แจกในห้องเรียนได้ไหม?',
    a: 'ได้ครับ · ครูพิมพ์แจกนักเรียนในห้องเรียนของตัวเองได้ไม่จำกัด · แต่ห้ามจำหน่ายต่อ / แชร์ไฟล์ต้นฉบับ / ใช้เชิงพาณิชย์ ถ้าต้องการใช้เชิงพาณิชย์ติดต่อทีมเรา',
  },
];

/**
 * MysticMu Help — Mario-style FAQ. Hero strip, sticky search input,
 * accordion-style Q&A pixel cards, contact CTA at the bottom.
 */
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
    <div className="bg-[#5C94FC] text-[#1A1A2E] font-[family:var(--font-prompt)] min-h-screen pb-16">
      {/* Hero */}
      <section className="bg-[#009A4E] border-b-4 border-[#1A1A2E] px-4 py-12 sm:py-16 relative overflow-hidden">
        <div
          className="absolute top-4 right-6 w-16 h-16 bg-[#FFD700] border-4 border-[#1A1A2E] flex items-center justify-center font-[family:var(--font-kanit)] font-black text-3xl text-[#1A1A2E] shadow-[4px_4px_0_0_#1A1A2E] rotate-[-8deg]"
          aria-hidden
        >
          ?
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-4 py-1 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] mb-4 font-[family:var(--font-kanit)]">
            <Wand2 className="w-3.5 h-3.5 text-[#E52521]" />
            Help Center
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[5px_5px_0_#1A1A2E]">
            {title}
          </h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาคำถาม..."
            className="w-full border-4 border-[#1A1A2E] bg-white px-4 py-3 pl-12 text-sm font-bold focus:outline-none focus:bg-[#FFF8DC] shadow-[4px_4px_0_0_#1A1A2E]"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E52521]" />
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 border-4 border-[#1A1A2E] bg-white shadow-[6px_6px_0_0_#1A1A2E]">
              <Sparkles className="w-12 h-12 mx-auto text-[#FFD700] mb-2" />
              <p className="font-[family:var(--font-kanit)] text-xl font-black uppercase tracking-tight">
                ไม่พบคำถามที่ค้นหา
              </p>
              <p className="text-sm text-[#4A4A6E] font-bold uppercase tracking-widest mt-2">
                ลองคำอื่น หรือติดต่อเราโดยตรง
              </p>
            </div>
          ) : (
            filtered.map((f, idx) => {
              const open = openIdx === idx;
              return (
                <div
                  key={f.q}
                  className="border-4 border-[#1A1A2E] bg-white shadow-[4px_4px_0_0_#1A1A2E]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-[#FFD700] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
                    aria-expanded={open}
                  >
                    <span className="font-[family:var(--font-kanit)] font-black uppercase tracking-tight text-left text-sm sm:text-base flex items-center gap-2">
                      <span className="shrink-0 w-7 h-7 bg-[#E52521] text-white border-2 border-[#1A1A2E] flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 py-4 border-t-4 border-[#1A1A2E] bg-[#FFF8DC] text-sm leading-relaxed whitespace-pre-line">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-[#E52521] border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-6 sm:p-8 text-white">
          <h3 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2 drop-shadow-[3px_3px_0_#1A1A2E]">
            ยังหาคำตอบไม่เจอ?
          </h3>
          <p className="text-sm font-bold uppercase tracking-widest mb-6 text-white/90">
            ทักหาอาจารย์มูได้ทุกช่องทาง
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {store.lineId && (
              <a
                href={`https://line.me/ti/p/~${store.lineId}`}
                target="_blank"
                rel="noreferrer"
                className="border-4 border-[#1A1A2E] bg-[#009A4E] text-white p-4 font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest text-center hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> LINE
              </a>
            )}
            {store.contactEmail && (
              <a
                href={`mailto:${store.contactEmail}`}
                className="border-4 border-[#1A1A2E] bg-[#FFD700] text-[#1A1A2E] p-4 font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest text-center hover:bg-white active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" /> Email
              </a>
            )}
            {store.contactPhone && (
              <a
                href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                className="border-4 border-[#1A1A2E] bg-white text-[#1A1A2E] p-4 font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest text-center hover:bg-[#FFD700] active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" /> โทร
              </a>
            )}
            <Link
              href={`/stores/${store.slug}/contact`}
              className="border-4 border-[#1A1A2E] bg-[#1A1A2E] text-white p-4 font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest text-center hover:bg-[#FFD700] hover:text-[#1A1A2E] active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2 col-span-1 sm:col-span-3"
            >
              หน้าติดต่อเรา →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
