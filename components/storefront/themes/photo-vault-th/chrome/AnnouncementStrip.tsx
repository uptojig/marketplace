'use client';

import React from 'react';
import { Camera, Download } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_DESKTOP =
  'ดาวน์โหลดทันทีหลังชำระเงิน · .xmp .acr .cube · ใช้ได้ตลอดชีพ ไม่มีลายน้ำ';
const DEFAULT_MOBILE = 'ดาวน์โหลดทันที · ใช้ตลอดชีพ';

export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const desktop = message?.trim() || DEFAULT_DESKTOP;
  const mobile = mobileMessage?.trim() || message?.trim() || DEFAULT_MOBILE;

  return (
    <div className="bg-[#0C0A09] border-b border-[#44403C] text-[#FBBF24] py-2 px-4 text-center text-[11px] tracking-[0.32em] uppercase font-semibold flex items-center justify-center gap-3 font-[family:var(--font-prompt)]">
      <Camera className="w-3.5 h-3.5 shrink-0 text-[#F59E0B]" />
      <span className="hidden sm:inline">{desktop}</span>
      <span className="sm:hidden">{mobile}</span>
      <Download className="w-3.5 h-3.5 shrink-0 text-[#F59E0B]" />
    </div>
  );
}
