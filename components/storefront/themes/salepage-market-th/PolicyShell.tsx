'use client';

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Bespoke policy / info page wrapper for SalepageMarket. Used by
 * /shipping /returns /privacy /terms when wrapInFamilyShell() matches
 * the salepage-market family. Clean dev-marketplace styling — white
 * card, green-accented headings, mono breadcrumb tag.
 */
export function SalepageMarketPolicyShell({ title, children }: Props) {
  return (
    <div
      className="font-[family:var(--font-prompt)]"
      style={{
        background: 'var(--shop-bg, #FAFBFC)',
        color: 'var(--shop-ink, #0D1421)',
      }}
    >
      <section
        className="px-4 pt-10 pb-6 sm:pt-14 sm:pb-8"
        style={{
          background: 'var(--shop-bg-soft, #FFFFFF)',
          borderBottom: '1px solid var(--shop-border, #E5E7EB)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <span
            className="salepage-tag inline-block rounded px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase mb-4"
            style={{
              background: 'var(--shop-muted, #F3F4F6)',
              color: 'var(--shop-ink-muted, #6B7280)',
              border: '1px solid var(--shop-border, #E5E7EB)',
            }}
          >
            DOCS · POLICY
          </span>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            {title}
          </h1>
        </div>
      </section>

      <section className="px-4 py-10 sm:py-14">
        <article
          className="max-w-3xl mx-auto rounded-lg p-6 sm:p-10 prose prose-sm sm:prose-base
            prose-headings:font-[family:var(--font-kanit)] prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-[color:var(--shop-ink,#0D1421)] prose-h2:border-b prose-h2:border-[color:var(--shop-border,#E5E7EB)] prose-h2:pb-2
            prose-h3:text-[color:var(--shop-primary,#82B440)]
            prose-a:text-[color:var(--shop-primary,#82B440)] prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[color:var(--shop-ink,#0D1421)]
            prose-li:marker:text-[color:var(--shop-primary,#82B440)]
            prose-code:bg-[color:var(--shop-muted,#F3F4F6)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[color:var(--shop-ink,#0D1421)] prose-code:before:content-none prose-code:after:content-none"
          style={{
            background: 'var(--shop-bg-soft, #FFFFFF)',
            border: '1px solid var(--shop-border, #E5E7EB)',
          }}
        >
          {children}
        </article>
      </section>
    </div>
  );
}

// Default export so dynamic-import path matches the convention used by
// other themes (some sites import the named function, the registry can
// pick either).
export default SalepageMarketPolicyShell;
