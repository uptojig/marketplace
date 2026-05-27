'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Aperture,
} from 'lucide-react';

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
  shipping: 'การจัดส่ง / ดาวน์โหลด',
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'ดาวน์โหลดไฟล์อย่างไรหลังชำระเงิน?',
    a: 'ทันทีที่ชำระเงินสำเร็จ ระบบจะส่งลิงก์ดาวน์โหลดไปยังอีเมลที่คุณกรอกในตอน Checkout — และไฟล์ ZIP จะปรากฏในหน้า "ออเดอร์ของฉัน" ด้วย ดาวน์โหลดได้ไม่จำกัดครั้ง',
  },
  {
    q: 'พรีเซ็ตใช้กับ Lightroom Mobile ได้ไหม?',
    a: 'ได้ — ไฟล์ .xmp ทุกตัวรองรับทั้ง Lightroom Classic (Desktop) และ Lightroom CC (Mobile) เพียง Sync ผ่าน Adobe Creative Cloud',
  },
  {
    q: 'LUTs (.cube) ใช้กับซอฟต์แวร์ตัดต่อวิดีโอได้ไหม?',
    a: 'ได้ — LUTs ของเรารองรับ DaVinci Resolve · Premiere Pro · Final Cut Pro · CapCut · Filmora · OBS Studio และซอฟต์แวร์ที่รับ .cube ทั้งหมด',
  },
  {
    q: 'ใบอนุญาตครอบคลุมแค่ไหน?',
    a: 'ใบอนุญาตส่วนบุคคล — ใช้สำหรับงานของผู้ซื้อเองรวมถึงงานคอมเมอร์เชียลที่คุณเป็นช่างภาพหลัก ห้ามจำหน่ายต่อ / แจกฟรี / รวมในแพ็คอื่น',
  },
  {
    q: 'อัพเดทพรีเซ็ตในอนาคตเสียเงินเพิ่มไหม?',
    a: 'ไม่เสียเพิ่ม — ทุกการอัพเดทเวอร์ชันใหม่ของพรีเซ็ตที่คุณซื้อ จะมีให้ดาวน์โหลดในหน้า "ออเดอร์ของฉัน" โดยอัตโนมัติ',
  },
  {
    q: 'พรีเซ็ตใช้กับภาพ JPG ได้ไหม หรือต้อง RAW เท่านั้น?',
    a: 'ใช้ได้ทั้ง RAW และ JPG — แต่ RAW จะให้ผลลัพธ์ที่ดีกว่าเพราะมี data range กว้างกว่า เราแนะนำให้ปรับ Exposure / WB เล็กน้อยก่อนทาบพรีเซ็ต',
  },
  {
    q: 'มีนโยบายคืนเงินไหม?',
    a: 'เนื่องจากเป็นไฟล์ดิจิทัล ดาวน์โหลดทันที จึงไม่มีนโยบายคืนเงิน — แต่หากไฟล์มีปัญหาทางเทคนิค ติดต่อเราภายใน 7 วันเพื่อแก้ไข',
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
    <div className="bg-[#0C0A09] text-[#F5F5F4] font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="pv-grain relative border-b border-[#44403C] bg-gradient-to-b from-[#1C1917] to-[#0C0A09] px-4 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] mb-5">
            <span className="w-8 h-px bg-[#FBBF24]" /> Help Desk
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-bold tracking-tight">
            <span className="pv-text-gold">{title}</span>
          </h1>
          <p className="text-sm text-[#A8A29E] mt-4 tracking-wider">
            คำตอบสำหรับช่างภาพและผู้สร้างคอนเทนต์
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาคำถาม..."
            className="w-full bg-[#1C1917] border border-[#44403C] focus:border-[#F59E0B] px-4 py-3 pl-12 text-sm text-[#F5F5F4] placeholder:text-[#A8A29E] focus:outline-none transition-colors"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
        </div>

        {/* FAQ accordion */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 border border-[#44403C] bg-[#1C1917]">
              <Aperture
                className="w-10 h-10 text-[#44403C] mx-auto mb-3"
                strokeWidth={1}
              />
              <p className="font-[family:var(--font-kanit)] text-xl font-bold text-[#F5F5F4]">
                ไม่พบคำถามที่ค้นหา
              </p>
              <p className="text-sm text-[#A8A29E] mt-2">
                ลองคำอื่น หรือทักหาเราโดยตรง
              </p>
            </div>
          ) : (
            filtered.map((f, idx) => {
              const open = openIdx === idx;
              return (
                <div
                  key={f.q}
                  className="border border-[#44403C] bg-[#1C1917] hover:border-[#F59E0B]/40 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-[family:var(--font-kanit)] font-bold text-sm sm:text-base text-[#F5F5F4]">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-[#F59E0B] transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-[#D6D3D1] border-t border-[#44403C]/40">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-14 bg-gradient-to-br from-[#1C1917] to-[#0C0A09] border border-[#F59E0B]/40 p-8 sm:p-10 pv-glow-amber">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#FBBF24] mb-2 font-semibold">
            Still need help?
          </p>
          <h3 className="font-[family:var(--font-kanit)] text-3xl font-bold tracking-tight mb-2">
            ยังหาคำตอบไม่เจอ?
          </h3>
          <p className="text-sm text-[#A8A29E] mb-6">
            ทักหาทีมงานได้ทุกช่องทาง · ตอบกลับภายใน 24 ชั่วโมง
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {store.lineId && (
              <a
                href={`https://line.me/ti/p/~${store.lineId}`}
                target="_blank"
                rel="noreferrer"
                className="border border-[#44403C] hover:border-[#10B981] hover:text-[#10B981] text-[#F5F5F4] p-4 font-[family:var(--font-kanit)] font-bold text-xs uppercase tracking-[0.24em] flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> LINE
              </a>
            )}
            {store.contactEmail && (
              <a
                href={`mailto:${store.contactEmail}`}
                className="border border-[#44403C] hover:border-[#F59E0B] hover:text-[#F59E0B] text-[#F5F5F4] p-4 font-[family:var(--font-kanit)] font-bold text-xs uppercase tracking-[0.24em] flex items-center justify-center gap-2 transition-colors"
              >
                <Mail className="w-4 h-4" /> Email
              </a>
            )}
            {store.contactPhone && (
              <a
                href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                className="border border-[#44403C] hover:border-[#FBBF24] hover:text-[#FBBF24] text-[#F5F5F4] p-4 font-[family:var(--font-kanit)] font-bold text-xs uppercase tracking-[0.24em] flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" /> โทร
              </a>
            )}
            <Link
              href={`/stores/${store.slug}/contact`}
              className="border border-[#F59E0B] bg-[#F59E0B] text-[#0C0A09] hover:bg-[#FBBF24] p-4 font-[family:var(--font-kanit)] font-bold text-xs uppercase tracking-[0.24em] flex items-center justify-center gap-2 transition-colors col-span-1 sm:col-span-3"
            >
              ไปยังหน้าติดต่อ →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
