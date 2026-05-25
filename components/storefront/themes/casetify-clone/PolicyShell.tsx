'use client';
import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Casetify Clone — bespoke policy / info page wrapper.
 *
 * Black banner header with the accent-color rule beneath the title,
 * white prose body underneath. Matches the brand's high-contrast
 * white/black/red palette.
 */
export function CasetifyClonePolicyShell({ title, children }: Props) {
  return (
    <div className="font-[family:var(--font-prompt)] min-h-screen bg-white text-gray-900">
      <section className="relative bg-black text-white px-4 py-16 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1"
          style={{
            background:
              'var(--shop-primary-gradient, var(--shop-primary, #EA1C5C))',
          }}
        />
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/55 mb-3">
            INFORMATION
          </p>
          <h1 className="font-[family:var(--font-kanit)] font-black text-3xl sm:text-4xl tracking-tight uppercase">
            {title}
          </h1>
        </div>
      </section>

      <section className="px-4 py-14 sm:py-16">
        <article className="mx-auto max-w-3xl prose prose-sm sm:prose-base prose-headings:font-[family:var(--font-kanit)] prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight prose-a:text-[var(--shop-primary,#EA1C5C)] prose-a:no-underline hover:prose-a:underline">
          {children}
        </article>
      </section>
    </div>
  );
}

export { CasetifyClonePolicyShell as PolicyShell };
