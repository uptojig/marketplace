'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * MysticMu policy/info wrapper used by `wrapInFamilyShell()` for
 * /shipping /returns /privacy /terms. Mario-style hero strip on top
 * (sky-blue with cloud pattern) and a pixel-bordered content card
 * underneath with bold-uppercase Kanit headings.
 */
export function PolicyShell({ title, children }: Props) {
  return (
    <div className="bg-[#5C94FC] text-[#1A1A2E] font-[family:var(--font-prompt)] min-h-screen pb-16">
      {/* Hero — sky with subtle cloud pattern */}
      <section className="relative bg-[#5C94FC] border-b-4 border-[#1A1A2E] px-4 py-12 sm:py-16 overflow-hidden pixel-clouds">
        <div className="absolute inset-0 bg-[#5C94FC]/40" aria-hidden />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FFD700] border-4 border-[#1A1A2E] px-4 py-1 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_#1A1A2E] mb-5 font-[family:var(--font-kanit)]">
            <Sparkles className="w-3.5 h-3.5 text-[#E52521]" /> Policy · นโยบาย
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0_#1A1A2E]">
            {title}
          </h1>
          <p className="mt-3 text-white font-bold text-sm uppercase tracking-wider drop-shadow-[2px_2px_0_#1A1A2E]">
            อ่านให้ครบก่อนช้อปจะดวงดี ✨
          </p>
        </div>
      </section>

      <section className="px-4 py-10">
        <article
          className={[
            'max-w-3xl mx-auto bg-white border-4 border-[#1A1A2E] shadow-[8px_8px_0_0_#1A1A2E] p-6 sm:p-10',
            'prose prose-sm sm:prose-base max-w-none',
            'prose-headings:font-[family:var(--font-kanit)] prose-headings:uppercase prose-headings:tracking-tight prose-headings:font-black',
            'prose-h2:text-[#E52521] prose-h2:border-b-4 prose-h2:border-[#1A1A2E] prose-h2:pb-2 prose-h2:mb-4',
            'prose-h3:text-[#009A4E]',
            'prose-strong:text-[#1A1A2E]',
            'prose-a:text-[#E52521] prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-a:decoration-4 prose-a:underline-offset-4',
            'prose-li:marker:text-[#FFD700]',
            'prose-blockquote:border-l-4 prose-blockquote:border-[#FFD700] prose-blockquote:bg-[#FFF8DC] prose-blockquote:py-2 prose-blockquote:px-4',
          ].join(' ')}
        >
          {children}
        </article>
      </section>
    </div>
  );
}
