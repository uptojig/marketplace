'use client';

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Bespoke policy / info page wrapper for Casethep. Used by
 * /shipping /returns /privacy /terms when wrapInFamilyShell()
 * matches the casethep theme. Clean, minimal — cream backdrop,
 * rounded card, primary CSS-var accent for headings + links.
 */
export function PolicyShell({ title, children }: Props) {
  return (
    <div
      className="font-[family:var(--font-prompt)]"
      style={{ background: 'var(--shop-bg, #FBF8F3)', color: 'var(--shop-ink, #1A1A1F)' }}
    >
      <section className="px-4 pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="max-w-5xl mx-auto">
          <span
            className="inline-block rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-wide mb-5"
            style={{
              background: 'var(--shop-primary, #FF5A6A)',
              color: '#fff',
            }}
          >
            Casethep · นโยบาย
          </span>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-semibold tracking-tight">
            {title}
          </h1>
        </div>
      </section>

      <section className="px-4 pb-16">
        <article
          className="max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-10 prose prose-sm sm:prose-base
            prose-headings:font-[family:var(--font-kanit)] prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:text-[color:var(--shop-primary,#FF5A6A)]
            prose-h3:text-[color:var(--shop-ink,#1A1A1F)]
            prose-a:text-[color:var(--shop-primary,#FF5A6A)] prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[color:var(--shop-ink,#1A1A1F)]
            prose-li:marker:text-[color:var(--shop-primary,#FF5A6A)]"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}
        >
          {children}
        </article>
      </section>
    </div>
  );
}
