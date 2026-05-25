'use client';
import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * BlackWrapp — bespoke policy / info page wrapper.
 *
 * Used by /shipping /returns /privacy /terms when wrapInFamilyShell()
 * matches this theme's family. Near-black surface, accent-color rim
 * on the title strip, and a generous Prompt-bodied prose container.
 */
export function BlackwrappPolicyShell({ title, children }: Props) {
  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: '#0A0A0A', color: '#FAFAFA' }}
    >
      <section
        className="relative border-b border-white/5 px-4 py-16 sm:py-20"
        style={{ background: '#141414' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              'var(--shop-primary-gradient, var(--shop-primary, #00FF88))',
            opacity: 0.45,
          }}
        />
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/50 mb-3">
            INFORMATION
          </p>
          <h1 className="font-[family:var(--font-kanit)] font-medium text-3xl sm:text-4xl tracking-[0.02em] text-white">
            {title}
          </h1>
        </div>
      </section>

      <section className="px-4 py-14 sm:py-16">
        <article className="mx-auto max-w-3xl prose prose-sm sm:prose-base prose-invert prose-headings:font-[family:var(--font-kanit)] prose-headings:font-medium prose-headings:tracking-[0.02em] prose-p:text-white/75 prose-a:text-[var(--shop-primary,#00FF88)] prose-a:no-underline hover:prose-a:underline">
          {children}
        </article>
      </section>
    </div>
  );
}

// Default alias keeps adapters re-export simple.
export { BlackwrappPolicyShell as PolicyShell };
