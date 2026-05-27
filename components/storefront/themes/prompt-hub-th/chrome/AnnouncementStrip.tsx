'use client';

import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_DESKTOP =
  'พรอมต์ใหม่ ปลดล็อกพลัง AI · ChatGPT · Midjourney · Sora · ดาวน์โหลดทันที';
const DEFAULT_MOBILE = 'พรอมต์ AI · ดาวน์โหลดทันที';

export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const desktop = message?.trim() || DEFAULT_DESKTOP;
  const mobile = mobileMessage?.trim() || message?.trim() || DEFAULT_MOBILE;

  return (
    <div
      className="text-[#F8FAFC] py-2 px-4 text-center text-[11px] font-medium tracking-[0.18em] uppercase flex items-center justify-center gap-3 border-b border-[#312E81]/70 font-[family:var(--font-prompt)]"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(168,85,247,0.18) 0%, rgba(6,182,212,0.18) 100%)',
      }}
    >
      <Zap className="w-3.5 h-3.5 shrink-0 text-[#A855F7]" />
      <span className="hidden sm:inline">{desktop}</span>
      <span className="sm:hidden">{mobile}</span>
      <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#06B6D4]" />
    </div>
  );
}
