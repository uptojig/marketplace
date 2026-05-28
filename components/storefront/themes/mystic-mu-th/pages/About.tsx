'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Coins,
  Crown,
  ShieldCheck,
  Heart,
  Star,
  Wand2,
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

const DEFAULT_DESCRIPTION =
  'เราคือสตูดิโอสื่อการสอนสไตล์ Mario เลเวลอัพ ผสมการออกแบบสนุก ๆ เข้ากับเนื้อหาตามหลักสูตร — เพราะเชื่อว่าการเรียนรู้ควรสนุกเหมือนเล่นเกม 🎮✨\n\nใบงานและสื่อทุกชุดออกแบบโดยทีมครูผู้มีประสบการณ์ ตรงตามหลักสูตรไทย ก่อนปล่อยให้ดาวน์โหลด — ครูใช้สอนสะดวก เด็กสนุก ผู้ปกครองติวที่บ้านได้';

const VALUES = [
  {
    icon: Coins,
    title: 'ครูออกแบบจริง',
    desc: 'ทุกชุดออกแบบโดยทีมครูมืออาชีพ ตรงตามหลักสูตร',
    bg: 'bg-[#FFD700]',
    fg: 'text-[#1A1A2E]',
  },
  {
    icon: Star,
    title: 'ดาวน์โหลดทันที',
    desc: 'ไม่ต้องรอจัดส่ง · พร้อมพิมพ์ภายใน 5 นาที',
    bg: 'bg-[#E52521]',
    fg: 'text-white',
  },
  {
    icon: ShieldCheck,
    title: 'พร้อมพิมพ์ A4',
    desc: 'ไฟล์ PDF คมชัด · พิมพ์ใช้ในห้องเรียนได้ทันที',
    bg: 'bg-[#009A4E]',
    fg: 'text-white',
  },
  {
    icon: Heart,
    title: 'อัปเดตฟรี',
    desc: 'เพิ่มใบงานใหม่ทุกเดือน · ซื้อครั้งเดียวใช้ตลอด',
    bg: 'bg-white',
    fg: 'text-[#1A1A2E]',
  },
];

const TIMELINE = [
  { year: '2566', label: 'เริ่มต้น', desc: 'ก่อตั้งสตูดิโอ ออกแบบใบงานอนุบาล–ประถม' },
  { year: '2567', label: 'เลเวล 2', desc: 'ขยายไปวิชาคณิต ภาษาไทย ภาษาอังกฤษ' },
  { year: '2568', label: 'เลเวลอัพ', desc: 'เปิดตัวคอลเลกชั่นสื่อการสอนสไตล์ Mario' },
];

/**
 * MysticMu About — Mario "world story" page. Hero with logo stack,
 * brand story card, 4 values pixel-blocks, milestone timeline, CTA
 * back to catalog.
 */
export function About({ store }: AboutProps) {
  const desc = store.description?.trim() || store.tagline?.trim() || DEFAULT_DESCRIPTION;

  return (
    <div className="bg-[#5C94FC] text-[#1A1A2E] font-[family:var(--font-prompt)] min-h-screen pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#5C94FC] border-b-4 border-[#1A1A2E] px-4 py-16 md:py-24 pixel-clouds">
        <div className="absolute inset-0 bg-[#5C94FC]/30" aria-hidden />
        <div
          className="absolute -top-6 -left-6 w-32 h-32 bg-[#FFD700] border-4 border-[#1A1A2E] rotate-[-12deg] hidden md:flex items-center justify-center font-[family:var(--font-kanit)] font-black text-6xl text-[#1A1A2E] shadow-[4px_4px_0_0_#1A1A2E]"
          aria-hidden
        >
          ?
        </div>
        <div
          className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#009A4E] border-4 border-[#1A1A2E] rotate-12 hidden md:flex items-center justify-center shadow-[4px_4px_0_0_#1A1A2E]"
          aria-hidden
        >
          <Star className="w-14 h-14 text-[#FFD700]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-4 py-1 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] mb-5 font-[family:var(--font-kanit)]">
            <Wand2 className="w-3.5 h-3.5 text-[#E52521]" /> About Us · เรื่องของเรา
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white drop-shadow-[5px_5px_0_#1A1A2E]">
            เลเวลอัพการเรียน
          </h1>
          <p className="mt-4 text-white font-bold text-base sm:text-lg max-w-xl drop-shadow-[2px_2px_0_#1A1A2E]">
            สื่อการสอนที่ออกแบบให้การเรียนสนุกทุกวัน · สไตล์ Mario × ใบงานไทย
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-6 sm:p-10">
          <div className="flex items-center gap-4 mb-6">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-14 w-14 object-contain border-4 border-[#1A1A2E] bg-white p-1"
              />
            ) : (
              <div className="relative w-14 h-14 bg-[#E52521] border-4 border-[#1A1A2E] flex items-center justify-center shrink-0 shadow-[3px_3px_0_0_#FFD700]">
                <span className="font-black text-white text-xl">M</span>
                <span className="absolute -top-2 -right-2 text-xs" aria-hidden>
                  ⭐
                </span>
              </div>
            )}
            <div>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {store.name}
              </h2>
              <p className="text-[11px] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-[#E52521]">
                มูสายปังตัวจริง
              </p>
            </div>
          </div>
          <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line">{desc}</p>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2 text-center text-white drop-shadow-[4px_4px_0_#1A1A2E]">
            สิ่งที่เรายึดมั่น
          </h2>
          <p className="text-center text-white font-bold text-sm uppercase tracking-widest mb-8 drop-shadow-[2px_2px_0_#1A1A2E]">
            Power-Up Items ที่ทำให้เราต่างจากใคร
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className={`border-4 border-[#1A1A2E] shadow-[6px_6px_0_0_#1A1A2E] p-5 ${v.bg} ${v.fg} hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[8px_8px_0_0_#1A1A2E] transition-all`}
              >
                <v.icon className="w-10 h-10 mb-3" />
                <h3 className="font-[family:var(--font-kanit)] font-black uppercase text-lg tracking-tight mb-2">
                  {v.title}
                </h3>
                <p className="text-sm font-semibold">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-6 sm:p-10">
          <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2 flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#E52521]" /> เส้นทางมูของเรา
          </h2>
          <p className="text-sm text-[#4A4A6E] font-bold uppercase tracking-widest mb-6">
            Level Progress
          </p>
          <div className="space-y-4">
            {TIMELINE.map((t, i) => (
              <div
                key={t.year}
                className="flex gap-4 items-start border-l-4 border-[#FFD700] pl-4"
              >
                <div className="shrink-0 w-16 h-16 bg-[#E52521] text-white border-4 border-[#1A1A2E] flex items-center justify-center font-[family:var(--font-kanit)] font-black shadow-[3px_3px_0_0_#1A1A2E]">
                  <span className="text-sm">{t.year}</span>
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-[family:var(--font-kanit)] font-black uppercase tracking-tight text-base text-[#1A1A2E]">
                    {t.label}
                  </p>
                  <p className="text-sm text-[#4A4A6E] mt-1">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto bg-[#FFD700] border-4 border-[#1A1A2E] shadow-[10px_10px_0_0_#1A1A2E] p-8 sm:p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-[#E52521] mb-4" />
          <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1A1A2E] mb-6">
            พร้อมเลเวลอัพชีวิตยัง?
          </h3>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center h-14 px-8 bg-[#E52521] text-white border-4 border-[#1A1A2E] font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-base shadow-[6px_6px_0_0_#1A1A2E] hover:bg-[#009A4E] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none transition-all gap-2"
          >
            <Coins className="w-5 h-5" />
            ดูวอลล์ทั้งหมด
          </Link>
        </div>
      </section>
    </div>
  );
}
