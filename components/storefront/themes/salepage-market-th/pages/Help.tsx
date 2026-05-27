'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  BookOpen,
  Download,
  CreditCard,
  ShieldCheck,
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

const FAQ_CATEGORIES = [
  { id: 'buying', label: 'การซื้อ', icon: CreditCard },
  { id: 'download', label: 'การดาวน์โหลด', icon: Download },
  { id: 'license', label: 'License', icon: ShieldCheck },
  { id: 'support', label: 'การช่วยเหลือ', icon: HelpCircle },
];

const FAQ_ITEMS: Array<{
  category: string;
  q: string;
  a: string;
}> = [
  {
    category: 'buying',
    q: 'ฉันสามารถพรีวิวเทมเพลตก่อนซื้อได้ไหม?',
    a: 'ได้ครับ ทุกเทมเพลตในมาร์เก็ตเปิดให้พรีวิวสดเต็มรูปแบบในเบราว์เซอร์ คลิกที่เทมเพลต → ดูพรีวิว ทดสอบขนาด desktop / tablet / mobile · ทดสอบฟอร์ม · ตรวจฟีเจอร์ทั้งหมดก่อนตัดสินใจซื้อ',
  },
  {
    category: 'buying',
    q: 'รับชำระเงินช่องทางใดบ้าง?',
    a: 'PromptPay QR · โอนผ่านธนาคาร · บัตรเครดิต / เดบิต (Visa · Mastercard · JCB) ทุกการชำระเงินดำเนินการผ่านระบบเข้ารหัส SSL ปลอดภัย',
  },
  {
    category: 'download',
    q: 'ฉันจะได้รับไฟล์เมื่อไหร่?',
    a: 'ทันทีหลังชำระเงินสำเร็จ ระบบจะส่งลิงก์ดาวน์โหลดเข้าอีเมลของคุณ และคุณสามารถดาวน์โหลดไฟล์ได้จากบัญชีผู้ใช้ในเว็บไซต์ตลอดอายุ license',
  },
  {
    category: 'download',
    q: 'ดาวน์โหลดได้กี่ครั้ง?',
    a: 'ดาวน์โหลดได้ไม่จำกัดจำนวนครั้งตลอดอายุ license หากเปลี่ยนเครื่องหรือทำไฟล์หาย ก็เข้าบัญชีดาวน์โหลดใหม่ได้',
  },
  {
    category: 'download',
    q: 'ไฟล์ที่ได้รับมีอะไรบ้าง?',
    a: 'แต่ละเทมเพลตประกอบด้วยไฟล์ HTML · CSS · JS · ภาพประกอบ · documentation อ่านวิธีการ deploy พร้อม README ภาษาไทย',
  },
  {
    category: 'license',
    q: 'ใช้เทมเพลตเดียวกันได้กี่ไซต์?',
    a: 'License มาตรฐานครอบคลุม 1 เว็บไซต์ / 1 โดเมน หากต้องการใช้กับเว็บไซต์เพิ่ม กรุณาซื้อ license เพิ่มหรือเลือกแพ็คเกจ Extended ในหน้าสินค้า',
  },
  {
    category: 'license',
    q: 'แก้ไขโค้ดเทมเพลตได้ไหม?',
    a: 'ได้ครับ License ให้สิทธิ์คุณแก้ไขโค้ด ภาพ ฟอนต์ ทุกอย่างตามต้องการ เพื่อใช้ในโครงการของคุณเอง — เพียงห้ามนำเทมเพลตไปขายต่อในรูปแบบเดิม',
  },
  {
    category: 'license',
    q: 'อัปเดตเทมเพลตฟรีนานแค่ไหน?',
    a: 'นักพัฒนาส่งอัปเดตฟรีให้คุณ 12 เดือนแรกหลังซื้อ — ทุก patch / bugfix / ฟีเจอร์ใหม่ คุณจะได้รับฟรีโดยไม่ต้องเสียเงินเพิ่ม',
  },
  {
    category: 'support',
    q: 'ขอความช่วยเหลือทางเทคนิคได้ที่ไหน?',
    a: 'ติดต่อทีม support ผ่านอีเมล · LINE Official · หรือ contact form ในหน้าติดต่อ ทีมงานตอบทุกคำถามภายใน 24 ชั่วโมงในวันทำการ',
  },
  {
    category: 'support',
    q: 'มีนโยบายคืนเงินไหม?',
    a: 'รับประกันคืนเงินภายใน 14 วันหากเทมเพลตไม่ตรงตามรายละเอียดที่แสดง — เนื่องจากเป็นสินค้าดิจิทัล กรุณาพรีวิวสดและอ่านสเปกก่อนซื้อ',
  },
];

export function Help({ store, pageSlug }: HelpProps) {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<number>>(new Set([0]));

  const filteredFaq = FAQ_ITEMS.filter((item) => {
    if (activeCat && item.category !== activeCat) return false;
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      return (
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggle = (i: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const title = pageSlug === 'faq' ? 'คำถามที่พบบ่อย' : 'ศูนย์ช่วยเหลือ';

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FAFBFC)' }}
    >
      {/* Hero with search */}
      <section
        className="border-b"
        style={{
          borderColor: 'var(--shop-border, #E5E7EB)',
          background: 'var(--shop-bg-soft, #FFFFFF)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div
            className="w-14 h-14 rounded-md flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'rgba(130, 180, 64, 0.12)',
              color: 'var(--shop-primary, #82B440)',
            }}
          >
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)] mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-[color:var(--shop-ink-muted,#6B7280)] mb-6">
            ค้นหาคำตอบที่ต้องการ หรือเลือกดูตามหมวด
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--shop-ink-muted,#6B7280)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหา เช่น 'การดาวน์โหลด' หรือ 'license'..."
              className="w-full rounded-md border bg-white pl-11 pr-4 h-12 text-sm focus:border-[color:var(--shop-primary,#82B440)] focus:outline-none"
              style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
        {/* Sidebar — categories */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-[family:var(--font-kanit)] text-sm font-bold uppercase tracking-wider mb-3 text-[color:var(--shop-ink,#0D1421)]">
            หมวด
          </h2>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => setActiveCat(null)}
                className={`w-full text-left rounded-md px-3 py-2 text-sm flex items-center gap-2 ${
                  activeCat === null
                    ? 'bg-[color:var(--shop-primary,#82B440)]/10 text-[color:var(--shop-primary,#82B440)] font-medium'
                    : 'text-[color:var(--shop-ink,#0D1421)] hover:bg-[color:var(--shop-muted,#F3F4F6)]'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                ทั้งหมด
              </button>
            </li>
            {FAQ_CATEGORIES.map((cat) => {
              const active = activeCat === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setActiveCat(cat.id)}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm flex items-center gap-2 ${
                      active
                        ? 'bg-[color:var(--shop-primary,#82B440)]/10 text-[color:var(--shop-primary,#82B440)] font-medium'
                        : 'text-[color:var(--shop-ink,#0D1421)] hover:bg-[color:var(--shop-muted,#F3F4F6)]'
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main — FAQ list */}
        <main>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mb-4">
            พบ {filteredFaq.length} คำถาม
          </p>

          {filteredFaq.length === 0 ? (
            <div
              className="rounded-lg p-10 text-center"
              style={{
                background: 'var(--shop-bg-soft, #FFFFFF)',
                border: '1px dashed var(--shop-border, #E5E7EB)',
              }}
            >
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-[color:var(--shop-ink-muted,#6B7280)]/40" />
              <h3 className="font-[family:var(--font-kanit)] text-lg font-bold text-[color:var(--shop-ink,#0D1421)] mb-1">
                ไม่พบคำถามที่ตรงกัน
              </h3>
              <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)] mb-5">
                ลองค้นด้วยคำอื่นหรือติดต่อทีมงานโดยตรง
              </p>
              <Link
                href={`/stores/${store.slug}/contact`}
                className="inline-flex items-center gap-2 rounded-md px-5 h-10 text-sm font-semibold text-white"
                style={{ background: 'var(--shop-primary, #82B440)' }}
              >
                ติดต่อทีมงาน
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFaq.map((item, idx) => {
                const open = openIds.has(idx);
                return (
                  <div
                    key={idx}
                    className="rounded-lg overflow-hidden"
                    style={{
                      background: 'var(--shop-bg-soft, #FFFFFF)',
                      border: '1px solid var(--shop-border, #E5E7EB)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left"
                      aria-expanded={open}
                    >
                      <span className="font-[family:var(--font-kanit)] font-semibold text-sm sm:text-base text-[color:var(--shop-ink,#0D1421)]">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-[color:var(--shop-ink-muted,#6B7280)] transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {open && (
                      <div
                        className="px-4 pb-4 text-sm leading-relaxed text-[color:var(--shop-ink-muted,#6B7280)] border-t pt-3"
                        style={{ borderColor: 'var(--shop-border, #E5E7EB)' }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Contact CTA */}
          <div
            className="mt-10 rounded-lg p-6 sm:p-8 text-center"
            style={{
              background:
                'linear-gradient(135deg, #0D1421 0%, #1f2937 100%)',
              color: '#FFFFFF',
            }}
          >
            <h3 className="font-[family:var(--font-kanit)] text-xl sm:text-2xl font-bold mb-2">
              ไม่เจอคำตอบที่ต้องการ?
            </h3>
            <p className="text-sm text-white/70 mb-5">
              ทีมงานพร้อมตอบทุกคำถาม · ตอบเร็วภายใน 24 ชั่วโมงในวันทำการ
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {store.contactEmail && (
                <a
                  href={`mailto:${store.contactEmail}`}
                  className="inline-flex items-center gap-2 rounded-md h-10 px-4 text-sm font-semibold bg-[#82B440] text-white"
                >
                  <Mail className="w-4 h-4" />
                  อีเมล
                </a>
              )}
              {store.lineId && (
                <a
                  href={`https://line.me/ti/p/${store.lineId}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-md h-10 px-4 text-sm font-semibold bg-white/10 text-white border border-white/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  LINE
                </a>
              )}
              {store.contactPhone && (
                <a
                  href={`tel:${store.contactPhone}`}
                  className="inline-flex items-center gap-2 rounded-md h-10 px-4 text-sm font-semibold bg-white/10 text-white border border-white/20"
                >
                  <Phone className="w-4 h-4" />
                  โทร
                </a>
              )}
              <Link
                href={`/stores/${store.slug}/contact`}
                className="inline-flex items-center gap-2 rounded-md h-10 px-4 text-sm font-semibold bg-white/10 text-white border border-white/20"
              >
                ติดต่อทีมงาน
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
