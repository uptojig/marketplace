'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_DESKTOP = 'ฉลองเปิดร้านใหม่! โค้ดลด 50% ทุกรายการ ช้อปเลย!';
const DEFAULT_MOBILE = 'โค้ดลด 50% ทุกรายการ';

export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const desktop = message?.trim() || DEFAULT_DESKTOP;
  const mobile = mobileMessage?.trim() || message?.trim() || DEFAULT_MOBILE;

  return (
    <div className="bg-yellow-400 text-black py-2 px-4 text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border-b-4 border-black font-[family:var(--font-kanit)]">
      <Sparkles className="w-4 h-4 shrink-0" />
      <span className="hidden sm:inline">{desktop}</span>
      <span className="sm:hidden">{mobile}</span>
      <Sparkles className="w-4 h-4 shrink-0" />
    </div>
  );
}
