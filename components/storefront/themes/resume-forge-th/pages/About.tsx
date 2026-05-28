'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  FileText,
  Star,
  ShieldCheck,
  Briefcase,
  Layers,
  Download,
  Users,
  Award,
} from 'lucide-react';
import { RESUME_FORGE_TONES } from '../palette';

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

const DEFAULT_DESCRIPTION =
  'รีซูเม่ฟอร์จ คือสตูดิโอออกแบบเทมเพลตเรซูเม่ · CV · cover letter โดยทีม HR + designer ไทย ที่เคยทำงานในบริษัทระดับ Fortune 500 — ทุกเทมเพลตผ่านการทดสอบกับระบบ ATS หลัก (Workday, Greenhouse, Lever, iCIMS) และผ่านการตรวจ structure โดย recruiter ตัวจริง\n\nเราเชื่อว่าผู้สมัครงานทุกคนสมควรได้รับโอกาสสัมภาษณ์ — เราจึงสร้างเครื่องมือที่ช่วยให้เรซูเม่ของคุณผ่านด่านแรก (ATS scan) แล้วโดดเด่นในสายตา recruiter ผู้คัดเลือก ทั้งสำหรับงานไทย และงานต่างประเทศ';

const VALUES = [
  { icon: CheckCircle2, title: 'ATS-First', desc: 'ทดสอบกับ Workday · Greenhouse · Lever · iCIMS ก่อนปล่อยขายทุกเทมเพลต' },
  { icon: Layers, title: 'Editable', desc: 'แก้ได้ทันทีใน Word · Pages · Google Docs ไม่ต้องใช้ความรู้ดีไซน์' },
  { icon: ShieldCheck, title: 'Recruiter-Approved', desc: 'ตรวจ structure โดย senior recruiter ก่อนปล่อยขาย' },
  { icon: Briefcase, title: 'Bilingual', desc: 'ไทย-อังกฤษ สลับใน 1 คลิก เหมาะสมัครงานทั้งในและต่างประเทศ' },
];

const STATS = [
  { Icon: Download, count: '12,000+', label: 'ใบสมัครที่ใช้แล้ว' },
  { Icon: Star, count: '4.9', label: 'คะแนนเฉลี่ย' },
  { Icon: Users, count: '850+', label: 'ผู้ใช้รายเดือน' },
];

export function About({ store }: AboutProps) {
  const desc = store.description?.trim() || store.tagline?.trim() || DEFAULT_DESCRIPTION;

  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden rf-grid-bg border-b border-[#CBD5E1]">
        <div className="absolute top-12 right-12 w-40 h-40 rounded-full bg-[#1E3A8A]/10 blur-3xl pointer-events-none hidden md:block" aria-hidden />
        <div className="absolute bottom-12 left-12 w-44 h-44 rounded-full bg-[#B45309]/10 blur-3xl pointer-events-none hidden md:block" aria-hidden />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-md bg-white border border-[#CBD5E1] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E3A8A] font-[family:var(--font-kanit)] mb-6">
            <Award className="w-3.5 h-3.5 text-[#B45309]" />
            เกี่ยวกับ {store.name}
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            <span className="rf-gradient-text">ทุกใบสมัครคืองานออกแบบ</span>
          </h1>
          <span className="rf-rule mt-5" aria-hidden />
          <p className="text-base sm:text-lg text-[#334155] max-w-2xl mt-5">
            สตูดิโอเทมเพลตเรซูเม่ระดับมืออาชีพ ที่ออกแบบโดยทีม HR + designer ไทย เพื่อให้ผู้สมัครงานทุกคนได้รับโอกาสสัมภาษณ์
          </p>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-white border-b border-[#CBD5E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-3 gap-4">
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-md mb-2 border"
                style={{
                  backgroundColor: ['#DBEAFE', '#FEF3C7', '#DCFCE7'][i],
                  color: ['#1E40AF', '#B45309', '#15803D'][i],
                  borderColor: ['#BFDBFE', '#FDE68A', '#BBF7D0'][i],
                }}
              >
                <s.Icon className="w-5 h-5" />
              </div>
              <p className="font-[family:var(--font-kanit)] font-bold text-2xl text-[#0F172A]">
                {s.count}
              </p>
              <p className="text-xs font-bold text-[#475569] uppercase tracking-[0.18em]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-3xl mx-auto rounded-2xl bg-white border border-[#CBD5E1] p-6 sm:p-10 shadow-[0_8px_32px_-12px_rgba(30,58,138,0.18)]">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E2E8F0]">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-14 w-auto rounded-md object-contain"
              />
            ) : (
              <div className="w-14 h-14 rounded-md bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#172554] flex items-center justify-center rf-glow-primary border border-[#172554]">
                <FileText className="w-6 h-6 text-[#FBBF24]" />
              </div>
            )}
            <div>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight">
                {store.name}
              </h2>
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#B45309]">
                Recruiter-approved · Made in Thailand
              </p>
            </div>
          </div>
          <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line text-[#334155]">
            {desc}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-white border-y border-[#CBD5E1]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#B45309] mb-2 font-[family:var(--font-kanit)]">
              ค่านิยม
            </p>
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight">
              สิ่งที่เรายึดมั่น
            </h2>
            <span className="rf-rule mx-auto mt-4" aria-hidden />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => {
              const tone = RESUME_FORGE_TONES[i % RESUME_FORGE_TONES.length];
              return (
                <div
                  key={v.title}
                  className="rf-card rounded-xl bg-[#F8FAFC] p-6"
                >
                  <div
                    className="w-12 h-12 rounded-md flex items-center justify-center mb-4 shadow-md border"
                    style={{ backgroundColor: tone.bg, color: tone.fg, borderColor: tone.border }}
                  >
                    <v.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-[family:var(--font-kanit)] font-bold text-lg mb-2 text-[#0F172A]">
                    {v.title}
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto rounded-2xl rf-stripe-bg border border-[#172554] p-8 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden style={{
            backgroundImage:
              'linear-gradient(rgba(251,191,36,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="relative space-y-6">
            <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight leading-tight text-white">
              พร้อมเริ่ม
              <br />
              <span className="text-[#FBBF24]">ใบสมัครงานใหม่หรือยัง?</span>
            </h3>
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md bg-[#FBBF24] text-[#172554] font-[family:var(--font-kanit)] font-bold text-base hover:bg-[#F59E0B] hover:scale-[1.03] active:scale-95 transition-all shadow-xl"
            >
              <Briefcase className="w-5 h-5" />
              เลือกเทมเพลตทั้งหมด
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
