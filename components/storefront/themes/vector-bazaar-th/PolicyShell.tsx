'use client';

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Bespoke policy / info page wrapper for Vector Bazaar. Used by
 * /shipping /returns /privacy /terms when wrapInFamilyShell() matches
 * the vector-bazaar family.
 */
export function PolicyShell({ title, children }: Props) {
  return (
    <div className="bg-[#FEFCE8] text-[#1E1B4B] font-[family:var(--font-prompt)]">
      {/* Hero strip — rainbow gradient band with confetti dots */}
      <section className="relative overflow-hidden vb-rainbow-bg border-b border-[#FBCFE8] px-4 py-12 sm:py-16">
        <div className="absolute inset-0 vb-confetti opacity-40 pointer-events-none" aria-hidden />
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#FBCFE8] px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-sm mb-6 font-[family:var(--font-kanit)] text-[#DB2777]">
            <span className="w-2 h-2 rounded-full bg-[#F472B6]" />
            นโยบาย
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black tracking-tight leading-tight text-[#1E1B4B]">
            {title}
          </h1>
        </div>
      </section>

      {/* Content card — soft white with rounded corners */}
      <section className="px-4 py-12 sm:py-16">
        <article className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#FBCFE8] shadow-[0_8px_32px_-12px_rgba(244,114,182,0.25)] p-6 sm:p-10 prose prose-sm sm:prose-base prose-headings:font-[family:var(--font-kanit)] prose-headings:tracking-tight prose-headings:font-black prose-h2:text-[#DB2777] prose-h3:text-[#2563EB] prose-strong:text-[#1E1B4B] prose-a:text-[#DB2777] prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-li:marker:text-[#F472B6]">
          {children}
        </article>
      </section>
    </div>
  );
}
