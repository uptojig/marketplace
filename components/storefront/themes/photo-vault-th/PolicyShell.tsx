'use client';

import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Bespoke policy / info page wrapper for Photo Vault. Used by
 * /shipping /returns /privacy /terms when wrapInFamilyShell() matches
 * the photo-vault family. Charcoal canvas + golden hero strip echoing
 * a film-print contact sheet.
 */
export function PolicyShell({ title, children }: Props) {
  return (
    <div className="bg-[#0C0A09] text-[#F5F5F4] font-[family:var(--font-prompt)] min-h-screen">
      <section className="pv-grain relative bg-gradient-to-b from-[#1C1917] via-[#0C0A09] to-[#0C0A09] border-b border-[#44403C] px-4 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#FBBF24] mb-5">
            <span className="w-8 h-px bg-[#FBBF24]" /> Vault Policy
          </div>
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-bold tracking-tight text-[#F5F5F4] mb-3">
            {title}
          </h1>
          <p className="text-sm text-[#A8A29E] tracking-wider">
            ข้อกำหนดและเงื่อนไขสำหรับนักสะสมพรีเซ็ตและช่างภาพ
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <article className="max-w-3xl mx-auto bg-[#1C1917] border border-[#44403C] p-6 sm:p-10 prose prose-sm sm:prose-base prose-invert prose-headings:font-[family:var(--font-kanit)] prose-headings:tracking-tight prose-headings:text-[#F5F5F4] prose-h2:text-[#F59E0B] prose-h3:text-[#FBBF24] prose-strong:text-[#F5F5F4] prose-a:text-[#F59E0B] hover:prose-a:text-[#FBBF24] prose-a:no-underline hover:prose-a:underline prose-li:marker:text-[#F59E0B] prose-p:text-[#D6D3D1] prose-li:text-[#D6D3D1]">
          {children}
        </article>
      </section>
    </div>
  );
}
