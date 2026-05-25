'use client';
import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * CaseINW — policy / info page wrapper.
 *
 * Off-white surface with a tilted violet→cyan gradient ribbon as the
 * banner. Headline uses Bebas/Kanit display, body in Prompt.
 */
export function CaseinwPolicyShell({ title, children }: Props) {
  return (
    <div className="font-[family:var(--font-prompt)] min-h-screen bg-[#FAFAF7] text-[#0E0E12]">
      <section className="relative px-4 py-16 sm:py-20 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full blur-3xl opacity-60"
          style={{ background: 'var(--shop-primary, #8B5CF6)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full blur-3xl opacity-50"
          style={{ background: '#A3E635' }}
        />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#0E0E12]/55 mb-3">
            INFO · CASEINW
          </p>
          <h1
            className="font-[family:var(--font-kanit)] font-black text-4xl sm:text-5xl tracking-tight uppercase"
            style={{
              backgroundImage:
                'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {title}
          </h1>
          <div
            className="mt-4 h-1 w-24 rounded-full"
            style={{
              background:
                'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
            }}
          />
        </div>
      </section>

      <section className="px-4 pb-20">
        <article className="mx-auto max-w-3xl prose prose-sm sm:prose-base prose-headings:font-[family:var(--font-kanit)] prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight prose-a:text-[var(--shop-primary,#8B5CF6)] prose-a:no-underline hover:prose-a:underline">
          {children}
        </article>
      </section>
    </div>
  );
}

export { CaseinwPolicyShell as PolicyShell };
