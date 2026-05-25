'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Zap, Star, ShieldCheck, Heart } from 'lucide-react';

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
  'เราคือร้านขายสินค้าสายปาร์ตี้ที่ภูมิใจในความสนุก สีสัน และพลังแห่งคืนเทศกาล รวมไอเท็มแสงนีออน เครื่องประดับเรืองแสง และของแต่งคอนเสิร์ตคุณภาพคัดสรร — ส่งตรงจากผู้นำเข้าถึงมือคุณ พร้อมรับประกันความสนุกในทุกการช้อป';

const VALUES = [
  { icon: Zap, title: 'Bold Energy', desc: 'แสงสีและพลังเทศกาลในทุกชิ้น' },
  { icon: Star, title: 'Festival First', desc: 'คัดสรรเพื่อสายงานเทศกาลโดยเฉพาะ' },
  { icon: ShieldCheck, title: 'Of Course', desc: 'คัดสรรคุณภาพ รับประกันคืนเงิน 7 วัน' },
  { icon: Heart, title: 'Made With Love', desc: 'ทุกออเดอร์แพ็คอย่างใส่ใจ' },
];

export function About({ store }: AboutProps) {
  const desc = store.description?.trim() || store.tagline?.trim() || DEFAULT_DESCRIPTION;

  return (
    <div className="bg-[#fafafa] text-black font-[family:var(--font-prompt)] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-pink-500 border-b-4 border-black px-4 py-16 md:py-24">
        <div
          className="absolute -top-10 -left-10 w-48 h-48 bg-yellow-400 border-4 border-black rotate-[-12deg] hidden md:block"
          aria-hidden
        />
        <div
          className="absolute -bottom-10 -right-10 w-56 h-56 bg-blue-600 border-4 border-black rotate-12 hidden md:block"
          aria-hidden
        />
        <div className="max-w-5xl mx-auto relative z-10 text-center md:text-left">
          <div className="inline-block bg-yellow-400 border-4 border-black px-4 py-1 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 font-[family:var(--font-kanit)]">
            About Us
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-5xl md:text-7xl font-black uppercase italic leading-[0.95] tracking-tighter text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            เรื่องของเรา
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-14 w-auto border-4 border-black"
              />
            ) : (
              <div className="w-14 h-14 bg-black flex items-center justify-center border-4 border-black shrink-0">
                <Sparkles className="w-7 h-7 text-yellow-400" />
              </div>
            )}
            <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-black uppercase italic tracking-tighter">
              {store.name}
            </h2>
          </div>
          <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line">{desc}</p>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-black uppercase italic mb-8 text-center border-b-4 border-black pb-4">
            สิ่งที่เรายึดมั่น
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => {
              const bg = ['bg-pink-500', 'bg-yellow-400', 'bg-blue-600', 'bg-green-400'][i] ?? 'bg-yellow-400';
              const text = ['text-white', 'text-black', 'text-white', 'text-black'][i] ?? 'text-black';
              return (
                <div
                  key={v.title}
                  className={`border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 ${bg} ${text} hover:-translate-y-1 transition-transform`}
                >
                  <v.icon className="w-10 h-10 mb-4" />
                  <h3 className="font-[family:var(--font-kanit)] font-black uppercase text-xl italic mb-2">
                    {v.title}
                  </h3>
                  <p className="text-sm font-bold">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto bg-blue-600 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-12 text-center">
          <h3 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-black uppercase italic text-white drop-shadow-[3px_3px_0_rgba(0,0,0,1)] mb-6">
            พร้อมจะปาร์ตี้?
          </h3>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center justify-center h-14 px-8 bg-yellow-400 text-black border-4 border-black font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-base shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-white active:translate-x-2 active:translate-y-2 active:shadow-none"
          >
            <Sparkles className="w-5 h-5 mr-2" /> ช้อปสินค้าทั้งหมด
          </Link>
        </div>
      </section>
    </div>
  );
}
