'use client';

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Bespoke policy / info page wrapper for PromptHub. Used by /shipping
 * /returns /privacy /terms when wrapInFamilyShell() matches the
 * prompt-hub family.
 */
export function PolicyShell({ title, children }: Props) {
  return (
    <div className="bg-[#0B0B1F] text-[#F8FAFC] font-[family:var(--font-prompt)] min-h-screen">
      <section className="relative overflow-hidden border-b border-[#312E81]/60 px-4 py-14 sm:py-20">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.18) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden
        />
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
          }}
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)',
          }}
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#A855F7]/40 bg-[#A855F7]/10 text-[10px] uppercase tracking-[0.18em] text-[#A855F7] mb-5 font-[family:var(--font-kanit)] font-semibold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-pulse" />
            Policy
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F8FAFC]">
            {title}
          </h1>
        </div>
      </section>

      <section className="px-4 py-12">
        <article
          className="relative max-w-3xl mx-auto rounded-2xl p-6 sm:p-10 shadow-2xl prose prose-sm sm:prose-base prose-invert prose-headings:font-[family:var(--font-kanit)] prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#F8FAFC] prose-h2:text-[#A855F7] prose-h3:text-[#06B6D4] prose-strong:text-[#F8FAFC] prose-a:text-[#A855F7] hover:prose-a:text-[#06B6D4] prose-a:no-underline prose-li:marker:text-[#A855F7] prose-hr:border-[#312E81] prose-p:text-[#94A3B8] prose-li:text-[#94A3B8]"
          style={{
            backgroundColor: 'rgba(19, 19, 46, 0.6)',
            backdropFilter: 'blur(12px) saturate(140%)',
            border: '1px solid rgba(168, 85, 247, 0.16)',
          }}
        >
          {children}
        </article>
      </section>
    </div>
  );
}
