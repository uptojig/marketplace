'use client';
import React from 'react';
import type { AnnouncementStripProps } from '@/lib/templates/types';

export function CalderaSkinAnnouncementStrip({ storeName }: AnnouncementStripProps) {
  return (
    <div className="bg-[#9cd6df] text-[#0b3d4a] py-2 px-4 border-b border-[#cdd9dc] font-[family:var(--font-prompt)] uppercase tracking-[0.12em] text-xs flex items-center justify-center text-center">
      <span className="hidden sm:inline">CLINICAL TRIAL #07 — NIACINAMIDE 12% ผ่านการทดลองกับอาสาสมัคร 42 คน 28 วัน</span>
      <span className="inline sm:hidden">CLINICAL #07 · ผ่านการทดลอง 28 วัน</span>
    </div>
  );
}
