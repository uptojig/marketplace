'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, MessageCircle, Mail, Phone } from 'lucide-react';

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
  'size-guide': 'คู่มือขนาด',
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'สั่งซื้อสินค้าอย่างไร?',
    a: 'เลือกสินค้าจากหน้าร้าน กดเพิ่มในตะกร้า ตรวจสอบรายการ แล้วกรอกที่อยู่จัดส่งเพื่อชำระเงิน — ระบบรองรับพร้อมเพย์ โอนผ่านธนาคาร และบัตรเครดิต/เดบิต',
  },
  {
    q: 'ใช้เวลาจัดส่งกี่วัน?',
    a: 'EMS 1-2 วันทำการ · ลงทะเบียน 3-5 วันทำการ ทั่วประเทศ ส่งทุกวันจันทร์-ศุกร์ ตัดรอบ 14:00 ของแต่ละวัน',
  },
  {
    q: 'ส่งฟรีเมื่อไหร่?',
    a: 'ส่งฟรีเมื่อสั่งซื้อครบ 990 บาท · ไม่ครบขั้นต่ำคิดค่าจัดส่ง 30-50 บาทตามวิธีจัดส่งที่เลือก',
  },
  {
    q: 'เปลี่ยน/คืนสินค้าได้ไหม?',
    a: 'รับประกันความพึงพอใจ — คืนเงินภายใน 7 วันหลังรับสินค้า สินค้าต้องอยู่ในสภาพเดิม ไม่ผ่านการใช้งาน ไม่ฉีกขาด ค่าจัดส่งคืนผู้ซื้อรับผิดชอบ',
  },
  {
    q: 'มีหน้าร้านไหม?',
    a: 'เราเป็นร้านออนไลน์ 100% — ติดต่อสอบถามได้ผ่าน LINE / Facebook / โทรศัพท์ ในเวลาทำการ 9:00-21:00 ทุกวัน',
  },
  {
    q: 'สินค้าเรืองแสง/นีออน มีรับประกันไหม?',
    a: 'สินค้านีออน LED แท่งไฟ และอุปกรณ์อิเล็กทรอนิกส์ทุกชิ้นรับประกัน 30 วันจากวันที่ได้รับ — หากมีปัญหา ติดต่อเราเพื่อเปลี่ยนสินค้าใหม่ฟรี',
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
    <div className="bg-[#fafafa] text-black font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="bg-blue-600 border-b-4 border-black px-4 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-yellow-400 border-4 border-black px-4 py-1 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 font-[family:var(--font-kanit)]">
            Help Center
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
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
            className="w-full border-4 border-black bg-white px-4 py-3 pl-12 text-sm font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
        </div>

        {/* FAQ accordion */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-[family:var(--font-kanit)] text-xl font-black uppercase italic">
                ไม่พบคำถามที่ค้นหา
              </p>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">
                ลองคำอื่น หรือติดต่อเราโดยตรง
              </p>
            </div>
          ) : (
            filtered.map((f, idx) => {
              const open = openIdx === idx;
              return (
                <div
                  key={f.q}
                  className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-yellow-400 active:translate-x-1 active:translate-y-1"
                    aria-expanded={open}
                  >
                    <span className="font-[family:var(--font-kanit)] font-black uppercase text-left text-sm sm:text-base">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 py-4 border-t-4 border-black bg-[#fafafa] text-sm leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-pink-500 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 text-white">
          <h3 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-black uppercase italic mb-2 drop-shadow-[3px_3px_0_rgba(0,0,0,1)]">
            ยังหาคำตอบไม่เจอ?
          </h3>
          <p className="text-sm font-bold uppercase tracking-widest mb-6 opacity-90">
            ทักหาเราได้ทุกช่องทาง
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {store.lineId && (
              <a
                href={`https://line.me/ti/p/~${store.lineId}`}
                target="_blank"
                rel="noreferrer"
                className="border-4 border-black bg-green-400 text-black p-4 font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest text-center hover:bg-yellow-400 active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> LINE
              </a>
            )}
            {store.contactEmail && (
              <a
                href={`mailto:${store.contactEmail}`}
                className="border-4 border-black bg-yellow-400 text-black p-4 font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest text-center hover:bg-white active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" /> Email
              </a>
            )}
            {store.contactPhone && (
              <a
                href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                className="border-4 border-black bg-blue-600 text-white p-4 font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest text-center hover:bg-yellow-400 hover:text-black active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" /> โทร
              </a>
            )}
            <Link
              href={`/stores/${store.slug}/contact`}
              className="border-4 border-black bg-white text-black p-4 font-[family:var(--font-kanit)] font-black uppercase text-sm tracking-widest text-center hover:bg-yellow-400 active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2 col-span-1 sm:col-span-3"
            >
              หน้าติดต่อเรา →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
