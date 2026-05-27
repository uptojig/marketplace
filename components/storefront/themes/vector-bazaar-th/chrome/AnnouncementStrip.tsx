'use client';

import React from 'react';
import { Sparkles, Download } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_DESKTOP =
  'ดาวน์โหลด SVG ทันที · แก้ไขได้ใน Figma · ใบอนุญาตเชิงพาณิชย์ฟรี';
const DEFAULT_MOBILE = 'ดาวน์โหลด SVG · แก้ไขใน Figma ได้ทันที';

export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const desktop = message?.trim() || DEFAULT_DESKTOP;
  const mobile = mobileMessage?.trim() || message?.trim() || DEFAULT_MOBILE;

  return (
    <div className="vb-rainbow-bg border-b border-[#FBCFE8] text-[#1E1B4B] py-2 px-4 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-3 font-[family:var(--font-kanit)]">
      <Sparkles className="w-4 h-4 shrink-0 text-[#DB2777]" />
      <span className="hidden sm:inline">{desktop}</span>
      <span className="sm:hidden">{mobile}</span>
      <Download className="w-4 h-4 shrink-0 text-[#2563EB]" />
    </div>
  );
}
