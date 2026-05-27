'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Sparkles,
  HelpCircle,
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
  'size-guide': 'คู่มือการใช้งานพรอมต์',
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'พรอมต์ AI คืออะไร?',
    a: 'พรอมต์ AI คือชุดคำสั่งที่ออกแบบไว้สำหรับโมเดล AI เช่น ChatGPT, Midjourney, Sora หรือ Claude — เพื่อให้ได้ผลลัพธ์ที่แม่นยำและตรงกับงานที่ต้องการ ไม่ต้องนั่งคิดเองตั้งแต่ต้น',
  },
  {
    q: 'ดาวน์โหลดพรอมต์ได้อย่างไร?',
    a: 'หลังชำระเงินสำเร็จ ระบบจะส่งลิงก์ดาวน์โหลดทางอีเมลทันที พร้อมเข้าถึงในหน้า "Downloads" ของบัญชีคุณ ดาวน์โหลดได้ไม่จำกัดครั้งตลอดอายุการใช้งาน',
  },
  {
    q: 'ใช้งานพรอมต์ได้กี่ครั้ง?',
    a: 'พรอมต์ทุกชิ้นมีสิทธิ์ใช้งานตลอดชีพ ไม่จำกัดจำนวนครั้ง ใช้ได้ทุกอุปกรณ์ ทุกบัญชี AI ที่คุณใช้',
  },
  {
    q: 'พรอมต์ที่ซื้อใช้ได้กับโมเดลไหน?',
    a: 'พรอมต์ทุกชิ้นระบุชัดเจนว่ารองรับโมเดลใด — ChatGPT GPT-4/4o, Claude 3/4, Gemini, Midjourney v5/v6, Sora, DALL-E 3 ฯลฯ บางพรอมต์ใช้ได้กับหลายโมเดล',
  },
  {
    q: 'ขอคืนเงินได้ไหม?',
    a: 'รับประกันคืนเงิน 7 วันหลังซื้อ หากพรอมต์ไม่ตรงปก หรือใช้งานไม่ได้ ติดต่อทีมงาน — เราจะคืนเงินเต็มจำนวนภายใน 3 วันทำการ',
  },
  {
    q: 'แก้ไขพรอมต์ที่ซื้อได้ไหม?',
    a: 'ได้ พรอมต์ทุกชิ้นเป็นไฟล์ .txt หรือ .json ที่แก้ไขได้ คุณปรับแต่งให้เข้ากับงานของคุณได้อิสระ แต่ห้ามขายต่อหรือแจกฟรีให้ผู้อื่น',
  },
  {
    q: 'พรอมต์ใหม่อัปเดตบ่อยแค่ไหน?',
    a: 'เราอัปเดตคลังพรอมต์ทุกสัปดาห์ ติดตามได้ในหมวด "ใหม่ล่าสุด" หรือสมัครรับข่าวสารทางอีเมลเพื่อรับแจ้งเตือนเมื่อมีพรอมต์ใหม่',
  },
];

const GRADIENT_BG = 'linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)';
const GRADIENT_TEXT_STYLE: React.CSSProperties = {
  backgroundImage: GRADIENT_BG,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
};
const GLASS_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(19, 19, 46, 0.6)',
  backdropFilter: 'blur(12px) saturate(140%)',
  WebkitBackdropFilter: 'blur(12px) saturate(140%)',
  border: '1px solid rgba(168, 85, 247, 0.16)',
};
const GRID_BG_STYLE: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.18) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};
const GLOW_SM =
  '0 0 0 1px rgba(168,85,247,0.4), 0 0 12px rgba(168,85,247,0.4), 0 0 32px rgba(168,85,247,0.2)';

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
    <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)] min-h-screen">
      <section className="relative overflow-hidden border-b border-[#312E81]/60 px-4 py-14 sm:py-20">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={GRID_BG_STYLE} aria-hidden />
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#06B6D4]/40 bg-[#06B6D4]/10 text-[11px] uppercase tracking-[0.18em] text-[#06B6D4] mb-5 font-[family:var(--font-kanit)] font-semibold">
            <HelpCircle className="w-3 h-3" />
            Help Center
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span style={GRADIENT_TEXT_STYLE}>{title}</span>
          </h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาคำถาม..."
            className="w-full rounded-2xl px-5 py-4 pl-12 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#A855F7]/40 transition-all"
            style={GLASS_STYLE}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-14 rounded-2xl" style={GLASS_STYLE}>
              <HelpCircle className="w-10 h-10 mx-auto text-[#94A3B8] mb-3" />
              <p className="font-[family:var(--font-kanit)] text-lg font-semibold text-[#F8FAFC]">
                ไม่พบคำถามที่ค้นหา
              </p>
              <p className="text-sm text-[#94A3B8] mt-2">ลองคำอื่น หรือติดต่อเราโดยตรง</p>
            </div>
          ) : (
            filtered.map((f, idx) => {
              const open = openIdx === idx;
              return (
                <div
                  key={f.q}
                  className="rounded-2xl transition-all"
                  style={open ? { ...GLASS_STYLE, boxShadow: GLOW_SM } : GLASS_STYLE}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-[#1E1E3F]/40 rounded-2xl transition-colors text-left"
                    aria-expanded={open}
                  >
                    <span className="font-[family:var(--font-kanit)] font-semibold text-sm sm:text-base text-[#F8FAFC]">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-[#A855F7] transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 pt-1 text-sm text-[#94A3B8] leading-relaxed border-t border-[#312E81]/40">
                      <p className="pt-3">{f.a}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-10 rounded-3xl overflow-hidden p-6 sm:p-8 relative" style={GLASS_STYLE}>
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at top right, rgba(168,85,247,0.3) 0%, transparent 60%)',
            }}
            aria-hidden
          />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-[#A855F7]" />
              <h3 className="font-[family:var(--font-kanit)] text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                ยังหาคำตอบไม่เจอ?
              </h3>
            </div>
            <p className="text-sm text-[#94A3B8] mb-5">ทักหาเราได้ทุกช่องทาง — ตอบเร็วภายใน 24 ชั่วโมง</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {store.lineId && (
                <a
                  href={`https://line.me/ti/p/~${store.lineId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#0B0B1F]/60 border border-[#10B981]/40 hover:border-[#10B981] p-4 transition-all flex items-center justify-center gap-2 text-sm font-medium text-[#10B981]"
                >
                  <MessageCircle className="w-4 h-4" /> LINE
                </a>
              )}
              {store.contactEmail && (
                <a
                  href={`mailto:${store.contactEmail}`}
                  className="rounded-xl bg-[#0B0B1F]/60 border border-[#06B6D4]/40 hover:border-[#06B6D4] p-4 transition-all flex items-center justify-center gap-2 text-sm font-medium text-[#06B6D4]"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
              {store.contactPhone && (
                <a
                  href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                  className="rounded-xl bg-[#0B0B1F]/60 border border-[#A855F7]/40 hover:border-[#A855F7] p-4 transition-all flex items-center justify-center gap-2 text-sm font-medium text-[#A855F7]"
                >
                  <Phone className="w-4 h-4" /> โทร
                </a>
              )}
              <Link
                href={`/stores/${store.slug}/contact`}
                className="rounded-xl text-white p-4 text-sm font-semibold flex items-center justify-center gap-2 col-span-1 sm:col-span-3 font-[family:var(--font-kanit)]"
                style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
              >
                หน้าติดต่อเรา →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
