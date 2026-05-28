'use client';

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Bespoke policy / info page wrapper for ResumeForge. Used by
 * /shipping /returns /privacy /terms when wrapInFamilyShell() matches
 * the resume-forge family. Layout reads like a printed resume cover
 * letter — navy headline rule, faint ATS-grid backdrop, white
 * letterhead card with serif-free typography.
 */
export function PolicyShell({ title, children }: Props) {
  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] font-[family:var(--font-prompt)]">
      {/* Hero strip — slate canvas with faint ATS-grid backdrop */}
      <section className="relative overflow-hidden rf-grid-bg border-b border-[#CBD5E1] px-4 py-12 sm:py-16">
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-md bg-white border border-[#CBD5E1] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1E3A8A] shadow-sm mb-5 font-[family:var(--font-kanit)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
            ข้อมูลและนโยบาย
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight leading-tight text-[#0F172A]">
            {title}
          </h1>
          <span className="rf-rule mt-5" aria-hidden />
        </div>
      </section>

      {/* Letterhead content card */}
      <section className="px-4 py-12 sm:py-16">
        <article className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#CBD5E1] shadow-[0_8px_28px_-12px_rgba(15,23,42,0.12)] p-6 sm:p-10 prose prose-sm sm:prose-base prose-headings:font-[family:var(--font-kanit)] prose-headings:tracking-tight prose-headings:font-bold prose-h2:text-[#1E3A8A] prose-h2:border-b prose-h2:border-[#E2E8F0] prose-h2:pb-2 prose-h3:text-[#B45309] prose-strong:text-[#0F172A] prose-a:text-[#1E3A8A] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-li:marker:text-[#1E3A8A]">
          {children}
        </article>
      </section>
    </div>
  );
}
