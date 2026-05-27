'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

import {
  EDU_PRIMARY,
  EDU_PRIMARY_DEEP,
  EDU_ACCENT,
  EDU_BG,
  EDU_BG_SOFT,
  EDU_BORDER,
  EDU_INK,
  EDU_INK_MUTED,
} from './palette';

interface Props {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}

/**
 * EduClassroom — bespoke policy / info page wrapper.
 *
 * Used by /shipping /returns /privacy /terms /faq when the schema-page
 * renderer wraps the inner content. Visually mirrors the rest of the
 * EduClassroom chrome:
 *   - Notebook-paper cream background (#FAFAF9) with a chalk-yellow
 *     ruled-margin line down the left gutter on desktop.
 *   - Classroom-blue hero band capped with an accent-yellow ribbon to
 *     match the AnnouncementStrip stitching.
 *   - Prose container with Kanit headings, Prompt body — same as every
 *     other EduClassroom page.
 *
 * Exported under two aliases so adapters and the render-schema-page
 * route can pick whichever import name they prefer.
 */
export function EduClassroomPolicyShell({ title, eyebrow, children }: Props) {
  return (
    <div
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: EDU_BG, color: EDU_INK }}
    >
      {/* Hero band — classroom-blue with chalk ribbon */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${EDU_PRIMARY} 0%, ${EDU_PRIMARY_DEEP} 100%)` }}
      >
        {/* Notebook ruling pattern, faint */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(255,255,255,0.45) 31px, rgba(255,255,255,0.45) 32px)',
          }}
        />
        {/* Chalk-yellow ribbon — bottom border */}
        <span
          aria-hidden
          className="absolute left-0 right-0 bottom-0 h-1.5"
          style={{ background: EDU_ACCENT }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg shadow-md"
              style={{ background: '#FFFFFF', color: EDU_PRIMARY }}
            >
              <BookOpen size={20} strokeWidth={2.5} />
            </span>
            {eyebrow && (
              <span
                className="text-[11px] font-[family:var(--font-kanit)] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ background: EDU_BG_SOFT, color: EDU_PRIMARY_DEEP }}
              >
                {eyebrow}
              </span>
            )}
          </div>
          <h1 className="font-[family:var(--font-kanit)] font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            {title}
          </h1>
        </div>
      </section>

      {/* Body — notebook paper with left chalk-margin line */}
      <section className="relative px-4 py-12">
        <span
          aria-hidden
          className="hidden md:block absolute top-0 bottom-0 left-[7%] w-px pointer-events-none"
          style={{ background: `${EDU_ACCENT}33` }}
        />
        <article
          className="relative max-w-3xl mx-auto bg-white border rounded-2xl shadow-sm p-6 sm:p-10 prose prose-sm sm:prose-base prose-headings:font-[family:var(--font-kanit)] prose-headings:text-slate-900"
          style={{ borderColor: EDU_BORDER, color: EDU_INK_MUTED }}
        >
          {children}
        </article>
      </section>
    </div>
  );
}

// Aliases — keep parity with how the other family shells expose their
// component (a few render-schema-page imports use `PolicyShell` plain).
export const PolicyShell = EduClassroomPolicyShell;
export default EduClassroomPolicyShell;
