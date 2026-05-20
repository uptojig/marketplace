'use client';

import React from 'react';

interface MaiHatthakamAnnouncementStripProps {
  text?: string;
  mobileText?: string;
}

export function MaiHatthakamAnnouncementStrip({ text, mobileText }: MaiHatthakamAnnouncementStripProps) {
  const desktopText = text || 'Studio Visit · เปิดให้เข้าชมเตาเผาที่เชียงราย ทุกวันเสาร์';
  const displayMobileText = mobileText || 'เข้าชมเตาเผาเสาร์';

  return (
    <div className="bg-[#7c2d12] text-[#fef9f1] px-4 py-2 text-center text-sm font-[family:var(--font-kanit)] tracking-wide overflow-hidden border-b border-[#3a1a07]/20 relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black via-transparent to-transparent pointer-events-none mix-blend-overlay"></div>
      <span className="hidden sm:inline-block relative z-10">{desktopText}</span>
      <span className="sm:hidden relative z-10">{displayMobileText}</span>
    </div>
  );
}
