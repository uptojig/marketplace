'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Bot, Zap, ShieldCheck, Code2, Heart, Terminal } from 'lucide-react';

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
  'เราคือมาร์เก็ตเพลส AI Prompts ที่คัดสรรพรอมต์คุณภาพสูงจากครีเอเตอร์ทั่วโลก — รองรับ ChatGPT, Midjourney, Sora, Claude, Gemini และโมเดล AI ที่จะมาในอนาคต พรอมต์ทุกชิ้นทดสอบจริง พร้อมใช้งาน ดาวน์โหลดได้ทันที และใช้งานได้ตลอดชีพ';

const VALUES = [
  { icon: Bot, title: 'AI-First', desc: 'พรอมต์ทุกชิ้นออกแบบสำหรับโมเดล AI ใหม่ล่าสุด', color: '#A855F7' },
  { icon: Code2, title: 'Developer-Grade', desc: 'JSON / Markdown พร้อมใช้งาน รองรับ API integration', color: '#06B6D4' },
  { icon: ShieldCheck, title: 'Tested & Trusted', desc: 'ทดสอบจริงทุกพรอมต์ก่อนวางจำหน่าย', color: '#10B981' },
  { icon: Heart, title: 'Creator-Owned', desc: 'รายได้กลับสู่ครีเอเตอร์ผู้สร้างพรอมต์โดยตรง', color: '#FACC15' },
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
const GLOW_LG =
  '0 0 0 1px rgba(168,85,247,0.5), 0 0 24px rgba(168,85,247,0.5), 0 0 64px rgba(168,85,247,0.28)';

export function About({ store }: AboutProps) {
  const desc = store.description?.trim() || store.tagline?.trim() || DEFAULT_DESCRIPTION;

  return (
    <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)] min-h-screen">
      <section className="relative overflow-hidden border-b border-[#312E81]/60 px-4 py-20 md:py-28">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={GRID_BG_STYLE} aria-hidden />
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#A855F7]/40 bg-[#A855F7]/10 text-[11px] uppercase tracking-[0.18em] text-[#A855F7] mb-6 font-[family:var(--font-kanit)] font-semibold">
            <Sparkles className="w-3 h-3" />
            About PromptHub
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
            <span style={GRADIENT_TEXT_STYLE}>เรื่องของเรา</span>
          </h1>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="max-w-3xl mx-auto rounded-2xl p-6 sm:p-10" style={{ ...GLASS_STYLE, boxShadow: GLOW_SM }}>
          <div className="flex items-center gap-4 mb-6">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={store.name} className="h-14 w-auto rounded-xl" />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_SM }}
              >
                <Terminal className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            )}
            <h2 className="font-[family:var(--font-kanit)] text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
              {store.name}
            </h2>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-[#94A3B8] whitespace-pre-line">{desc}</p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#06B6D4]/40 bg-[#06B6D4]/10 text-[10px] uppercase tracking-[0.18em] text-[#06B6D4] mb-4 font-[family:var(--font-kanit)] font-semibold">
              <Zap className="w-3 h-3" />
              Our Values
            </div>
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
              สิ่งที่เรายึดมั่น
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl p-6 hover:-translate-y-1 transition-transform"
                style={GLASS_STYLE}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${v.color}20`, border: `1px solid ${v.color}40` }}
                >
                  <v.icon className="w-6 h-6" style={{ color: v.color }} />
                </div>
                <h3 className="font-[family:var(--font-kanit)] font-bold text-lg text-[#F8FAFC] mb-2">{v.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden p-10 text-center" style={GLASS_STYLE}>
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at top right, rgba(168,85,247,0.3) 0%, transparent 60%), radial-gradient(circle at bottom left, rgba(6,182,212,0.25) 0%, transparent 60%)',
            }}
            aria-hidden
          />
          <div className="relative space-y-5">
            <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
              พร้อมเริ่มต้นใช้ AI?
            </h3>
            <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto">
              เริ่มต้นจากพรอมต์คุณภาพคัดสรร — ดาวน์โหลดได้ทันที ใช้งานได้ตลอดชีพ
            </p>
            <div className="pt-2">
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full text-white text-sm font-semibold font-[family:var(--font-kanit)]"
                style={{ backgroundImage: GRADIENT_BG, boxShadow: GLOW_LG }}
              >
                <Sparkles className="w-4 h-4" />
                ดูพรอมต์ทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
