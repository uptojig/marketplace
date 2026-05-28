'use client';

import React from 'react';
import { CheckCircle2, FileText } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_DESKTOP =
  'ผ่านมาตรฐาน ATS · ปรับ .docx ได้ทันที · รวมเทมเพลต LinkedIn · ดาวน์โหลดทันทีหลังชำระ';
const DEFAULT_MOBILE = 'ATS-friendly · .docx · ดาวน์โหลดทันที';

export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const desktop = message?.trim() || DEFAULT_DESKTOP;
  const mobile = mobileMessage?.trim() || message?.trim() || DEFAULT_MOBILE;

  return (
    <div className="rf-stripe-bg border-b border-[#172554] text-[#F8FAFC] py-2 px-4 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-3 font-[family:var(--font-prompt)]">
      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#FBBF24]" />
      <span className="hidden sm:inline">{desktop}</span>
      <span className="sm:hidden">{mobile}</span>
      <FileText className="w-3.5 h-3.5 shrink-0 text-[#FBBF24]" />
    </div>
  );
}
