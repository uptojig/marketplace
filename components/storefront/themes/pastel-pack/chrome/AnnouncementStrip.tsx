'use client';

import React from 'react';
import { Megaphone } from 'lucide-react';

interface PastelPackStripProps {
  messageDesktop: string;
  messageMobile: string;
}

export function PastelPackAnnouncementStrip({ messageDesktop, messageMobile }: PastelPackStripProps) {
  return (
    <div className="bg-[#0f766e] text-[#fde68a] px-4 py-2 text-center text-sm font-medium font-[family:var(--font-kanit)] flex items-center justify-center gap-2 tracking-wide">
      <Megaphone className="w-4 h-4" />
      <span className="hidden sm:inline">{messageDesktop}</span>
      <span className="sm:hidden">{messageMobile}</span>
    </div>
  );
}
