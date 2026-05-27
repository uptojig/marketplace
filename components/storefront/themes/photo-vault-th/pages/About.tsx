'use client';

import React from 'react';
import Link from 'next/link';
import {
  Aperture,
  Camera,
  Sun,
  ShieldCheck,
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

const DEFAULT_DESCRIPTION =
  'Photo Vault คือคลังพรีเซ็ตและ LUTs สำหรับช่างภาพและผู้สร้างคอนเทนต์ที่จริงจังกับโทนสี ทุกพรีเซ็ตถูกทดสอบบนหลายร้อยภาพจริงก่อนปล่อยออกสู่วอลต์ — เพื่อให้ทุกคนได้โทนสีระดับสตูดิโอในเวลาเพียงคลิกเดียว';

const VALUES = [
  {
    icon: Camera,
    title: 'Tested on the Field',
    desc: 'ทดสอบกับภาพถ่ายจริงนับร้อย ก่อนปล่อยให้ลูกค้าใช้',
  },
  {
    icon: Sun,
    title: 'Color Accurate',
    desc: 'ทำงานบน sRGB / DCI-P3 รักษาสีผิวคนเอเชียได้ดี',
  },
  {
    icon: ShieldCheck,
    title: 'Lifetime License',
    desc: 'จ่ายครั้งเดียว ใช้ตลอดชีพ อัพเดทฟรีทุกเวอร์ชัน',
  },
  {
    icon: Award,
    title: 'Award-Winning Tones',
    desc: 'ใช้โดยช่างภาพระดับ Editorial และ Wedding ในไทย',
  },
];

export function About({ store }: AboutProps) {
  const desc =
    store.description?.trim() ||
    store.tagline?.trim() ||
    DEFAULT_DESCRIPTION;

  return (
    <div className="bg-[#0C0A09] text-[#F5F5F4] font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="pv-grain relative overflow-hidden border-b border-[#44403C] bg-gradient-to-b from-[#1C1917] via-[#0C0A09] to-[#0C0A09] px-4 py-16 md:py-24">
        <div
          aria-hidden
          className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-[#F59E0B]/15 to-transparent blur-3xl"
        />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] mb-5">
            <span className="w-8 h-px bg-[#FBBF24]" /> About Vault
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight">
            <span className="pv-text-gold">เรื่องของเรา</span>
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-14">
        <div className="max-w-3xl mx-auto bg-[#1C1917] border border-[#44403C] p-7 sm:p-12">
          <div className="flex items-center gap-4 mb-6">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-14 w-auto border border-[#44403C]"
              />
            ) : (
              <div className="w-14 h-14 border border-[#F59E0B] bg-gradient-to-br from-[#1C1917] to-[#0C0A09] flex items-center justify-center pv-glow-amber">
                <Aperture
                  className="w-7 h-7 text-[#F59E0B]"
                  strokeWidth={1.5}
                />
              </div>
            )}
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F5F4]">
              {store.name}
            </h2>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-[#D6D3D1] whitespace-pre-line">
            {desc}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-14 border-t border-[#44403C] bg-[#1C1917]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] font-semibold mb-2">
              The Vault Standard
            </p>
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight">
              สิ่งที่เรายึดถือ
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className="bg-[#0C0A09] border border-[#44403C] hover:border-[#F59E0B] p-6 transition-colors group"
              >
                <div className="w-12 h-12 mb-5 border border-[#44403C] group-hover:border-[#F59E0B] flex items-center justify-center transition-colors">
                  <v.icon
                    className="w-5 h-5 text-[#F59E0B]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#FBBF24] font-semibold mb-2">
                  Principle {i + 1}
                </p>
                <h3 className="font-[family:var(--font-kanit)] font-bold text-lg mb-2 text-[#F5F5F4]">
                  {v.title}
                </h3>
                <p className="text-xs text-[#A8A29E] leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-14">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-[#1C1917] to-[#0C0A09] border border-[#F59E0B]/40 p-10 sm:p-14 text-center pv-glow-amber">
          <Aperture
            className="w-12 h-12 text-[#F59E0B] mx-auto mb-5"
            strokeWidth={1}
          />
          <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            <span className="pv-text-gold">เริ่มต้นสร้างโทนของคุณ</span>
          </h3>
          <p className="text-sm text-[#A8A29E] mb-8 max-w-md mx-auto">
            สำรวจวอลต์พรีเซ็ตและ LUTs ที่คัดสรรมาสำหรับช่างภาพมืออาชีพ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center gap-2 h-14 px-10 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C0A09] font-[family:var(--font-kanit)] font-bold tracking-wide text-base transition-colors"
          >
            ดูคอลเลกชันทั้งหมด
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
