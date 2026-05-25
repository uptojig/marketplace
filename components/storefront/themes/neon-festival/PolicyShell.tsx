'use client';

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Bespoke policy / info page wrapper for Neon Festival. Used by
 * /shipping /returns /privacy /terms when wrapInFamilyShell()
 * matches the neon family.
 */
export function PolicyShell({ title, children }: Props) {
  return (
    <div className="bg-[#fafafa] text-black font-[family:var(--font-prompt)]">
      <section className="bg-blue-600 border-b-4 border-black px-4 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-yellow-400 border-4 border-black px-4 py-1 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            Policy
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
            {title}
          </h1>
        </div>
      </section>

      <section className="px-4 py-12">
        <article className="max-w-3xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-10 prose prose-sm sm:prose-base prose-headings:font-[family:var(--font-kanit)] prose-headings:uppercase prose-headings:italic prose-headings:tracking-tight prose-headings:font-black prose-h2:text-pink-600 prose-h3:text-blue-600 prose-strong:text-black prose-a:text-pink-600 prose-a:font-bold prose-a:underline prose-a:decoration-4 prose-a:underline-offset-4 hover:prose-a:text-yellow-600 prose-li:marker:text-pink-500">
          {children}
        </article>
      </section>
    </div>
  );
}
