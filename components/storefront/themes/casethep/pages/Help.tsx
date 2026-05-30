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
  'size-guide': 'คู่มือเลือกขนาด',
  shipping: 'การจัดส่ง',
  returns: 'นโยบายคืนสินค้า',
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'สั่งซื้อสินค้าอย่างไร?',
    a: 'เลือกสินค้าจากหน้าร้าน เพิ่มในตะกร้า ตรวจสอบรายการ จากนั้นกรอกที่อยู่และชำระเงินออนไลน์ ระบบจะส่งอีเมลยืนยันให้ทันที',
  },
  {
    q: 'ใช้เวลาจัดส่งกี่วัน?',
    a: 'EMS 1–2 วันทำการ · ลงทะเบียน 3–5 วันทำการ ตัดรอบจัดส่งทุก 14:00 น. จันทร์–ศุกร์',
  },
  {
    q: 'ส่งฟรีเมื่อไหร่?',
    a: 'ส่งฟรีทั่วประเทศเมื่อสั่งซื้อครบ ฿990 — ไม่ครบขั้นต่ำคิดค่าจัดส่ง ฿30–50 บาทตามรูปแบบที่เลือก',
  },
  {
    q: 'เปลี่ยน/คืนสินค้าได้ไหม?',
    a: 'รับประกันความพึงพอใจ คืนเงินภายใน 7 วันหลังรับสินค้า สินค้าต้องอยู่ในสภาพเดิม ไม่ผ่านการใช้งาน',
  },
  {
    q: 'เคสรองรับรุ่นไหนบ้าง?',
    a: 'เรามีเคสสำหรับ iPhone 15 / 14 / 13 / Pro ทุกรุ่น และ Samsung Galaxy S24 / S23 — ดูรุ่นที่รองรับได้ในหน้าสินค้า',
  },
  {
    q: 'ชำระเงินอย่างไร?',
    a: 'ระบบของเรารองรับการชำระเงินอย่างปลอดภัย เพื่อความสะดวกและรวดเร็วในการทำรายการ',
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
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
    >
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-5xl mx-auto">
          <span
            className="inline-block rounded-full px-3 py-1 text-[11px] font-medium tracking-wide mb-4"
            style={{
              background: 'rgba(255,90,106,0.10)',
              color: 'var(--shop-primary, #FF5A6A)',
            }}
          >
            ช่วยเหลือ
          </span>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-semibold tracking-tight">
            {title}
          </h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาคำถาม..."
            className="w-full rounded-full bg-white border border-[color:var(--shop-ink,#1A1A1F)]/10 px-4 py-3 pl-11 text-sm focus:outline-none focus:border-[color:var(--shop-primary,#FF5A6A)] transition-colors"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--shop-ink-muted,#6B7280)]" />
        </div>

        {/* FAQ accordion */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div
              className="rounded-2xl bg-white p-10 text-center"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <p className="font-[family:var(--font-kanit)] text-lg font-semibold mb-1">
                ไม่พบคำถามที่ค้นหา
              </p>
              <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)]">
                ลองคำอื่น หรือทักหาเราโดยตรง
              </p>
            </div>
          ) : (
            filtered.map((f, idx) => {
              const open = openIdx === idx;
              return (
                <div
                  key={f.q}
                  className="rounded-2xl bg-white overflow-hidden"
                  style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-[#F5F1EB] transition-colors"
                    aria-expanded={open}
                  >
                    <span className="font-medium text-sm sm:text-base text-left">{f.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform text-[color:var(--shop-ink-muted,#6B7280)] ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && (
                    <div
                      className="px-5 py-4 text-sm leading-relaxed text-[color:var(--shop-ink,#1A1A1F)]/85 border-t"
                      style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                    >
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact CTA */}
        <div
          className="rounded-2xl p-6 sm:p-8 text-white"
          style={{
            background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
            boxShadow: '0 20px 40px -10px rgba(255,90,106,0.30)',
          }}
        >
          <h3 className="font-[family:var(--font-kanit)] text-xl sm:text-2xl font-semibold tracking-tight mb-1">
            ยังหาคำตอบไม่เจอ?
          </h3>
          <p className="text-sm opacity-90 mb-5">ทักหาเราได้ทุกช่องทาง ตอบเร็วภายใน 1 ชั่วโมง</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {store.lineId && (
              <a
                href={`https://line.me/ti/p/~${store.lineId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full h-10 px-4 text-sm font-medium bg-white text-[color:var(--shop-primary,#FF5A6A)] hover:bg-white/90 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> LINE
              </a>
            )}
            {store.contactEmail && (
              <a
                href={`mailto:${store.contactEmail}`}
                className="inline-flex items-center justify-center gap-2 rounded-full h-10 px-4 text-sm font-medium bg-white text-[color:var(--shop-primary,#FF5A6A)] hover:bg-white/90 transition-colors"
              >
                <Mail className="w-4 h-4" /> อีเมล
              </a>
            )}
            {store.contactPhone && (
              <a
                href={`tel:${store.contactPhone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 rounded-full h-10 px-4 text-sm font-medium bg-white text-[color:var(--shop-primary,#FF5A6A)] hover:bg-white/90 transition-colors"
              >
                <Phone className="w-4 h-4" /> โทร
              </a>
            )}
          </div>
          <Link
            href={`/stores/${store.slug}/contact`}
            className="block mt-3 text-center text-xs underline underline-offset-4 opacity-90 hover:opacity-100"
          >
            ไปที่หน้าติดต่อเรา →
          </Link>
        </div>
      </div>
    </div>
  );
}
