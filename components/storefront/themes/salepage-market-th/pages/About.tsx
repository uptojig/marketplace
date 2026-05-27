'use client';

import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Eye,
  Download,
  Sparkles,
  Layers,
  Users,
  Award,
  ArrowRight,
} from 'lucide-react';

interface AboutProps {
  store: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
  };
}

const VALUES = [
  {
    icon: Eye,
    title: 'พรีวิวก่อนซื้อ',
    body:
      'ทุกเทมเพลตเปิดให้พรีวิวสดในเบราว์เซอร์ ตรวจทุกฟีเจอร์ก่อนจ่ายเงิน ไม่มีเซอร์ไพรส์',
  },
  {
    icon: Code2,
    title: 'โค้ดสะอาด ใช้งานง่าย',
    body:
      'HTML5 ดีๆ ตามมาตรฐาน W3C · Tailwind CSS · vanilla JS · พร้อม deploy ใช้งานทันที',
  },
  {
    icon: Award,
    title: 'คัดสรรคุณภาพ',
    body:
      'ทีมงานรีวิวทุกเทมเพลตก่อนขึ้นชั้น ทั้งดีไซน์ ประสิทธิภาพ และความเข้ากันกับเบราว์เซอร์',
  },
  {
    icon: Users,
    title: 'ทีมงานพร้อมช่วย',
    body:
      'ทีม support คนไทย · ตอบทุกคำถามภายใน 24 ชั่วโมง · ช่วยคุณ deploy สำเร็จจริง',
  },
];

const PROCESS = [
  {
    step: '01',
    title: 'เลือกเทมเพลตที่ใช่',
    body: 'ค้นหาจากหมวดธุรกิจ เลือกพรีวิวสด เปรียบเทียบฟีเจอร์',
  },
  {
    step: '02',
    title: 'พรีวิวสดในเบราว์เซอร์',
    body: 'ทดลองดูทั้ง desktop / tablet / mobile · ทดสอบฟอร์มได้จริง',
  },
  {
    step: '03',
    title: 'ชำระเงิน · ดาวน์โหลด',
    body: 'PromptPay / โอน / บัตร · ระบบส่งลิงก์ดาวน์โหลดเข้าอีเมลทันที',
  },
  {
    step: '04',
    title: 'Deploy ใช้งาน',
    body: 'อัปโหลดไฟล์ HTML ไปยังโฮสต์ของคุณ ปรับแต่งโค้ดและภาพได้ตามใจ',
  },
];

export function About({ store }: AboutProps) {
  const tagline =
    store.tagline?.trim() ||
    'มาร์เก็ตเทมเพลตเซลเพจ HTML สำหรับนักการตลาด นักขายออนไลน์ และนักพัฒนา';
  const description =
    store.description?.trim() ||
    'เราเชื่อว่าการสร้างเซลเพจที่สวย ทำงานได้จริง ไม่ควรเป็นเรื่องยากหรือใช้เวลาเป็นเดือน · นั่นคือเหตุผลที่เราคัดสรรเทมเพลต HTML คุณภาพสูงจากนักพัฒนาทั่วโลก พร้อมระบบพรีวิวสดที่ให้คุณเห็นทุกอย่างก่อนตัดสินใจซื้อ';

  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: 'var(--shop-bg, #FAFBFC)' }}
    >
      {/* Hero */}
      <section
        className="border-b"
        style={{
          borderColor: 'var(--shop-border, #E5E7EB)',
          background: 'var(--shop-bg-soft, #FFFFFF)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-5"
            style={{
              background: 'rgba(130, 180, 64, 0.12)',
              color: 'var(--shop-primary, #82B440)',
              border: '1px solid rgba(130, 180, 64, 0.25)',
            }}
          >
            <Sparkles className="w-3 h-3" />
            เกี่ยวกับ {store.name}
          </span>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-[color:var(--shop-ink,#0D1421)] mb-4">
            {tagline}
          </h1>
          <p className="text-base sm:text-lg text-[color:var(--shop-ink-muted,#6B7280)] leading-relaxed max-w-3xl">
            {description}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <span
            className="salepage-tag inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-3"
            style={{
              background: 'rgba(0, 173, 239, 0.10)',
              color: 'var(--shop-accent, #00ADEF)',
            }}
          >
            VALUES
          </span>
          <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)] mb-3">
            สิ่งที่เรายึดถือ
          </h2>
          <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)]">
            หลักการที่ทำให้เราเป็นมาร์เก็ตเทมเพลตที่ลูกค้าไว้วางใจ
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-lg p-5 salepage-card"
              style={{
                background: 'var(--shop-bg-soft, #FFFFFF)',
                border: '1px solid var(--shop-border, #E5E7EB)',
              }}
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center mb-3"
                style={{
                  background: 'rgba(130, 180, 64, 0.12)',
                  color: 'var(--shop-primary, #82B440)',
                }}
              >
                <v.icon className="w-5 h-5" />
              </div>
              <h3 className="font-[family:var(--font-kanit)] text-base font-bold mb-2 text-[color:var(--shop-ink,#0D1421)]">
                {v.title}
              </h3>
              <p className="text-sm leading-relaxed text-[color:var(--shop-ink-muted,#6B7280)]">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section
        className="py-12 sm:py-16"
        style={{ background: 'var(--shop-bg-soft, #FFFFFF)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <span
              className="salepage-tag inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-3"
              style={{
                background: 'rgba(255, 107, 53, 0.10)',
                color: 'var(--shop-savings, #FF6B35)',
              }}
            >
              HOW IT WORKS
            </span>
            <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--shop-ink,#0D1421)] mb-3">
              ขั้นตอนง่าย ใน 4 ขั้น
            </h2>
            <p className="text-sm text-[color:var(--shop-ink-muted,#6B7280)]">
              จากเลือกเทมเพลตจนได้ไฟล์มาใช้งาน ใช้เวลาไม่ถึง 5 นาที
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS.map((p) => (
              <div
                key={p.step}
                className="rounded-lg p-5"
                style={{
                  background: 'var(--shop-bg, #FAFBFC)',
                  border: '1px solid var(--shop-border, #E5E7EB)',
                }}
              >
                <span
                  className="font-[family:var(--font-kanit)] text-2xl font-bold mb-2 block"
                  style={{ color: 'var(--shop-primary, #82B440)' }}
                >
                  {p.step}
                </span>
                <h3 className="font-[family:var(--font-kanit)] text-base font-bold mb-2 text-[color:var(--shop-ink,#0D1421)]">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--shop-ink-muted,#6B7280)]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-xl p-8 sm:p-12 text-center"
            style={{
              background:
                'linear-gradient(135deg, #0D1421 0%, #1f2937 100%)',
              color: '#FFFFFF',
            }}
          >
            <Layers className="w-10 h-10 mx-auto mb-4 text-[#82B440]" />
            <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold mb-3">
              พร้อมเริ่มเซลเพจของคุณแล้วใช่ไหม?
            </h2>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto mb-6">
              เลือกเทมเพลตที่ใช่ พรีวิวสด ดาวน์โหลดทันที — ใช้เวลาไม่กี่นาที
            </p>
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center gap-2 rounded-md h-12 px-6 text-sm font-bold text-white"
              style={{ background: '#82B440' }}
            >
              เริ่มเลือกเทมเพลต
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
