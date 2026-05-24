'use client';

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * OmniPack — bespoke policy / info page wrapper.
 *
 * Used by /shipping /returns /privacy /terms when wrapInFamilyShell()
 * matches this theme's family. Designer should replace the hero strip
 * + container styling with theme-specific decoration.
 */
export function OmnipackPolicyShell({ title, children }: Props) {
  return (
    <div
      className="font-[family:var(--font-prompt)] bg-[var(--shop-bg)] text-[var(--shop-ink)]"
    >
      <section
        className="border-b px-4 py-12 sm:py-16 bg-[var(--shop-bg-soft)] border-[var(--shop-border)]"
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-black">
            {title}
          </h1>
        </div>
      </section>

      <section className="px-4 py-12">
        <article className="max-w-3xl mx-auto prose prose-sm sm:prose-base prose-headings:font-[family:var(--font-kanit)]">
          {children}
        </article>
      </section>
    </div>
  );
}

// Default alias keeps adapters re-export simple.
export { OmnipackPolicyShell as PolicyShell };
