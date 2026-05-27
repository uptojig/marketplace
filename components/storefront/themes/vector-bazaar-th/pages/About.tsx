'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Palette,
  Star,
  ShieldCheck,
  Heart,
  Layers,
  Download,
  Users,
} from 'lucide-react';
import { VECTOR_BAZAAR_RAINBOW } from '../palette';

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
  'เวกเตอร์บาซาร์ คือคลังผลงานเวกเตอร์โดยนักออกแบบไทย — รวมไฟล์ SVG, icon packs, illustration ระดับสตูดิโอที่ผ่านการคัดสรรอย่างละเอียด ทุกผลงานจัดเลเยอร์มาแล้ว เปลี่ยนสีและรูปทรงได้ทันทีใน Figma, Adobe Illustrator, Sketch หรือเครื่องมือออกแบบที่คุณใช้อยู่\n\nเราเชื่อว่าการออกแบบที่สวยงามไม่ควรเริ่มจากศูนย์ — เราจึงสร้างเครื่องมือที่ช่วยให้นักออกแบบ, นักการตลาด, และเจ้าของแบรนด์ทุกคนสามารถสร้างสรรค์ผลงานคุณภาพระดับมืออาชีพได้เร็วกว่าเดิม';

const VALUES = [
  { icon: Palette, title: 'Crafted', desc: 'คัดสรรโดยนักออกแบบ ทุกชิ้นผ่านการตรวจสอบมาตรฐาน' },
  { icon: Layers, title: 'Editable', desc: 'จัดเลเยอร์ครบ ปรับสี-รูปทรง-ขนาด ได้อิสระ' },
  { icon: ShieldCheck, title: 'Licensed', desc: 'ใบอนุญาตเชิงพาณิชย์ ใช้ในโปรเจคของลูกค้าได้' },
  { icon: Heart, title: 'For Designers', desc: 'สร้างมาเพื่อนักออกแบบ ราคาที่นักออกแบบเข้าถึงได้' },
];

const STATS = [
  { Icon: Download, count: '10,000+', label: 'ดาวน์โหลด' },
  { Icon: Star, count: '4.9', label: 'คะแนนเฉลี่ย' },
  { Icon: Users, count: '500+', label: 'นักออกแบบ' },
];

export function About({ store }: AboutProps) {
  const desc = store.description?.trim() || store.tagline?.trim() || DEFAULT_DESCRIPTION;

  return (
    <div className="bg-[#FEFCE8] text-[#1E1B4B] font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden vb-rainbow-bg border-b border-[#FBCFE8]">
        <div className="absolute inset-0 vb-confetti opacity-50 pointer-events-none" aria-hidden />
        <div className="absolute top-12 right-12 w-40 h-40 rounded-full bg-[#F472B6]/30 blur-3xl pointer-events-none hidden md:block" aria-hidden />
        <div className="absolute bottom-12 left-12 w-44 h-44 rounded-full bg-[#60A5FA]/30 blur-3xl pointer-events-none hidden md:block" aria-hidden />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#FBCFE8] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#DB2777] font-[family:var(--font-kanit)] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            เกี่ยวกับ {store.name}
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-5xl sm:text-7xl font-black tracking-tight leading-[0.95]">
            <span className="vb-rainbow-text">เรื่องของเรา</span>
          </h1>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-white border-b border-[#FBCFE8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-3 gap-4">
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2"
                style={{
                  backgroundColor: ['#FCE7F3', '#FEF3C7', '#DBEAFE'][i],
                  color: ['#DB2777', '#B45309', '#2563EB'][i],
                }}
              >
                <s.Icon className="w-5 h-5" />
              </div>
              <p className="font-[family:var(--font-kanit)] font-black text-2xl text-[#1E1B4B]">
                {s.count}
              </p>
              <p className="text-xs font-bold text-[#6366F1] uppercase tracking-widest">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-3xl mx-auto rounded-3xl bg-white border border-[#FBCFE8] p-6 sm:p-10 shadow-[0_8px_32px_-12px_rgba(244,114,182,0.25)]">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#FBCFE8]">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-14 w-auto rounded-2xl object-contain"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F472B6] via-[#FBBF24] to-[#60A5FA] flex items-center justify-center vb-glow-primary">
                <Palette className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-black tracking-tight">
                {store.name}
              </h2>
              <p className="text-xs font-bold tracking-widest uppercase text-[#6366F1]">
                Designer-friendly · Made in Thailand
              </p>
            </div>
          </div>
          <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line text-[#1E1B4B]/90">
            {desc}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-white border-y border-[#FBCFE8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black tracking-widest uppercase text-[#DB2777] mb-2 font-[family:var(--font-kanit)]">
              ค่านิยม
            </p>
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-black tracking-tight">
              สิ่งที่เรายึดมั่น
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => {
              const color = VECTOR_BAZAAR_RAINBOW[i % VECTOR_BAZAAR_RAINBOW.length];
              return (
                <div
                  key={v.title}
                  className="vb-card-hover rounded-3xl bg-[#FEFCE8] border border-[#FBCFE8] p-6"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md"
                    style={{ backgroundColor: color }}
                  >
                    <v.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-[family:var(--font-kanit)] font-black text-lg mb-2 text-[#1E1B4B]">
                    {v.title}
                  </h3>
                  <p className="text-sm text-[#1E1B4B]/70 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto rounded-[2.5rem] vb-rainbow-bg border border-[#FBCFE8] p-8 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 vb-confetti opacity-40 pointer-events-none" aria-hidden />
          <div className="relative space-y-6">
            <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="vb-rainbow-text">พร้อมจะออกแบบ</span>
              <br />
              <span className="text-[#1E1B4B]">ผลงานสวยๆ?</span>
            </h3>
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-[#1E1B4B] text-white font-[family:var(--font-kanit)] font-black text-base hover:bg-[#312E81] hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              เลือกผลงานทั้งหมด
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
