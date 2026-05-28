'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Search,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { RESUME_FORGE_TONES } from '../palette';

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
  'size-guide': 'คู่มือใช้งานเทมเพลต',
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'ดาวน์โหลดไฟล์ได้ที่ไหน?',
    a: 'หลังชำระเงินสำเร็จ ระบบจะส่งลิงก์ดาวน์โหลดไปยังอีเมลของคุณทันที — และยังดาวน์โหลดซ้ำได้จากหน้า "คำสั่งซื้อของฉัน" ตลอดอายุการใช้งานบัญชี',
  },
  {
    q: 'เทมเพลตผ่าน ATS จริงไหม?',
    a: 'ผ่านจริงครับ — เราทดสอบทุกเทมเพลตกับระบบ ATS หลัก (Workday, Greenhouse, Lever, iCIMS, BambooHR, JobThai) ก่อนปล่อยขาย หากระบบใดอ่านไม่ครบ เรา revise และแจ้งผู้ซื้อทันที',
  },
  {
    q: 'แก้ไขเทมเพลตได้ในโปรแกรมอะไรบ้าง?',
    a: 'ทุกเทมเพลตมาในรูปแบบ .docx (Microsoft Word), .pdf (สำหรับส่ง), Google Docs และ Apple Pages — เปิดและแก้ไขได้บน Windows, Mac, iPad, Android และผ่าน Google Drive',
  },
  {
    q: 'สมัครงานต่างประเทศใช้ได้ไหม?',
    a: 'ใช้ได้ครับ — ทุกเทมเพลตมีทั้งฉบับภาษาไทยและอังกฤษ สลับใน 1 คลิก ขนาดกระดาษรองรับทั้ง A4 (ไทย/ยุโรป/เอเชีย) และ US Letter (อเมริกา)',
  },
  {
    q: 'ใบอนุญาตการใช้งานครอบคลุมอะไรบ้าง?',
    a: 'ใบอนุญาตส่วนตัวรวมในทุกแพ็ค — ใช้สมัครงานในนามผู้ซื้อได้ไม่จำกัดจำนวนตำแหน่ง ตลอดอายุการใช้งานบัญชี ห้ามขายต่อในรูปแบบเทมเพลต',
  },
  {
    q: 'มีบริการรีไรท์เรซูเม่ไหม?',
    a: 'มีครับ — ติดต่อเราผ่าน LINE หรืออีเมล เพื่อสอบถามราคา resume writing / review service เราเปิดรับงานสำหรับ entry-level จนถึง C-suite',
  },
  {
    q: 'ขอคืนเงินได้ไหมหากไม่พอใจ?',
    a: 'เนื่องจากเป็นสินค้าดิจิทัล เราไม่สามารถคืนเงินหลังดาวน์โหลด — แต่หากเทมเพลตไม่ผ่าน ATS ตามที่ระบุ หรือมีปัญหาเปิดไฟล์ไม่ได้ ติดต่อเราภายใน 7 วันเพื่อรับไฟล์ใหม่ฟรี',
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
    <div className="bg-[#F8FAFC] text-[#0F172A] font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden rf-grid-bg border-b border-[#CBD5E1]">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-md bg-white border border-[#CBD5E1] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E3A8A] font-[family:var(--font-kanit)] mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#B45309]" />
            ศูนย์ช่วยเหลือ
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            <span className="rf-gradient-text">{title}</span>
          </h1>
          <span className="rf-rule mt-4" aria-hidden />
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
            className="w-full rounded-md border border-[#CBD5E1] bg-white pl-12 pr-4 py-3 text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 shadow-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] pointer-events-none" />
        </label>

        {/* FAQ accordion */}
        <ul className="space-y-3">
          {filtered.length === 0 ? (
            <li className="text-center py-14 rounded-xl border-2 border-dashed border-[#CBD5E1] bg-white">
              <FileText className="w-10 h-10 mx-auto text-[#1E3A8A] mb-3" />
              <p className="font-[family:var(--font-kanit)] text-lg font-bold mb-1">
                ไม่พบคำถาม
              </p>
              <p className="text-sm text-[#475569]">
                ลองคำอื่น หรือติดต่อเราโดยตรง
              </p>
            </li>
          ) : (
            filtered.map((f, idx) => {
              const open = openIdx === idx;
              const tone = RESUME_FORGE_TONES[idx % RESUME_FORGE_TONES.length];
              return (
                <li
                  key={f.q}
                  className="rounded-xl bg-white border border-[#CBD5E1] overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#F8FAFC] transition-colors"
                    aria-expanded={open}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-[family:var(--font-kanit)] font-bold shrink-0 border"
                        style={{ backgroundColor: tone.bg, color: tone.fg, borderColor: tone.border }}
                      >
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="font-[family:var(--font-kanit)] font-bold text-sm sm:text-base text-[#0F172A]">
                        {f.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform text-[#1E3A8A] ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] text-sm leading-relaxed text-[#334155]">
                      {f.a}
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>

        {/* Contact CTA */}
        <div className="mt-12 rounded-xl rf-stripe-bg border border-[#172554] p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden style={{
            backgroundImage:
              'linear-gradient(rgba(251,191,36,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="relative space-y-5">
            <div>
              <h3 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-white">
                ยังหาคำตอบไม่เจอ?
              </h3>
              <p className="text-sm text-[#CBD5E1]">
                ทีมงานพร้อมตอบคำถามภายใน 24 ชั่วโมงทุกช่องทาง
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {store.lineId && (
                <a
                  href={`https://line.me/ti/p/~${store.lineId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-white/10 border border-[#1E40AF] backdrop-blur-sm p-4 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm font-[family:var(--font-kanit)] font-bold text-[#FBBF24]"
                >
                  <MessageCircle className="w-4 h-4" /> LINE
                </a>
              )}
              {store.contactEmail && (
                <a
                  href={`mailto:${store.contactEmail}`}
                  className="rounded-md bg-white/10 border border-[#1E40AF] backdrop-blur-sm p-4 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm font-[family:var(--font-kanit)] font-bold text-[#FBBF24]"
                >
                  <Mail className="w-4 h-4" /> อีเมล
                </a>
              )}
              {store.contactPhone && (
                <a
                  href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                  className="rounded-md bg-white/10 border border-[#1E40AF] backdrop-blur-sm p-4 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm font-[family:var(--font-kanit)] font-bold text-[#FBBF24]"
                >
                  <Phone className="w-4 h-4" /> โทร
                </a>
              )}
              <Link
                href={`/stores/${store.slug}/contact`}
                className="sm:col-span-3 rounded-md bg-[#FBBF24] text-[#172554] p-4 hover:bg-[#F59E0B] transition-colors flex items-center justify-center gap-2 text-sm font-[family:var(--font-kanit)] font-bold"
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
