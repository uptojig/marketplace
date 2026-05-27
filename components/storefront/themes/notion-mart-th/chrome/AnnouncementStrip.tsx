'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_MESSAGE =
  'เทมเพลต Notion พร้อมใช้ · ดาวน์โหลดทันทีหลังชำระ · อัปเดตฟรีตลอดอายุไฟล์';
const DEFAULT_MOBILE = 'เทมเพลต Notion · ดาวน์โหลดทันที';

export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const text = message?.trim() || DEFAULT_MESSAGE;
  const mobile = mobileMessage?.trim() || DEFAULT_MOBILE;

  return (
    <div
      role="region"
      aria-label="ประกาศร้านค้า"
      className="bg-[#F7F6F3] border-b border-[#E5E5E5] text-[#1A1A1A] text-[11px] sm:text-xs font-[family:var(--font-prompt)] px-4 py-1.5 text-center flex items-center justify-center gap-2"
    >
      <Sparkles className="h-3 w-3 shrink-0 text-[#2563EB]" aria-hidden />
      <span className="hidden sm:inline tracking-wide">{text}</span>
      <span className="sm:hidden tracking-wide">{mobile}</span>
    </div>
  );
}
