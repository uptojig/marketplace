'use client';

import React from 'react';
import { Code2 } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

/**
 * Salepage Market announcement strip — thin top bar, green-on-white,
 * mono-tinted to read like a dev marketplace toolbar.
 */
export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const fallback =
    'ดาวน์โหลดได้ทันทีหลังชำระเงิน · พรีวิวสดทุกเทมเพลตก่อนซื้อ · อัปเดตฟรี 1 ปี';
  const text = message?.trim() || fallback;
  const mobile = mobileMessage?.trim() || 'พรีวิวสดทุกเทมเพลต · ดาวน์โหลดทันที';

  return (
    <div
      className="w-full font-[family:var(--font-prompt)] text-[12px] leading-none"
      style={{
        background: '#0D1421',
        color: '#FFFFFF',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-center gap-2">
        <Code2
          className="w-3.5 h-3.5"
          style={{ color: '#82B440' }}
          aria-hidden
        />
        <span className="hidden sm:inline tracking-wide text-white/85">
          {text}
        </span>
        <span className="sm:hidden tracking-wide text-white/85">{mobile}</span>
      </div>
    </div>
  );
}
