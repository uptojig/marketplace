'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_DESKTOP =
  '⭐ เลเวลอัพการเรียน! ดาวน์โหลดสื่อการสอนทันทีหลังชำระเงิน · ใบงานใหม่ทุกเดือน ⭐';
const DEFAULT_MOBILE = '⭐ ดาวน์โหลดทันที · พร้อมพิมพ์ ⭐';

/**
 * MysticMu announcement strip — coin-gold bar with dark text and
 * pixel sparkle stars. Sits above the Header.
 */
export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const desktop = message?.trim() || DEFAULT_DESKTOP;
  const mobile = mobileMessage?.trim() || message?.trim() || DEFAULT_MOBILE;

  return (
    <div className="bg-[#FFD700] text-[#1A1A2E] py-2 px-4 text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border-b-4 border-[#1A1A2E] font-[family:var(--font-kanit)]">
      <Sparkles className="w-4 h-4 shrink-0 text-[#E52521]" />
      <span className="hidden sm:inline">{desktop}</span>
      <span className="sm:hidden">{mobile}</span>
      <Sparkles className="w-4 h-4 shrink-0 text-[#009A4E]" />
    </div>
  );
}
