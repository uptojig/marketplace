'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_MESSAGE =
  'ส่งฟรีเมื่อสั่งครบ ฿990 · ส่งด่วน 24 ชั่วโมง · ของแท้รับประกัน 12 เดือน';
const DEFAULT_MOBILE = 'ส่งฟรี ฿990+ · ส่งด่วน 24h';

/**
 * GridModu — Announcement Strip. Accent gradient with safe fallback
 * to the primary colour so the strip re-skins via the palette swatch
 * picker (PR #153 / #154 overrides).
 */
export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const text = message?.trim() || DEFAULT_MESSAGE;
  const mobile = mobileMessage?.trim() || DEFAULT_MOBILE;

  return (
    <div
      role="region"
      aria-label="ประกาศร้านค้า"
      className="text-[#0E0E10] text-xs sm:text-sm font-[family:var(--font-kanit)] font-semibold px-4 py-2 text-center tracking-wider uppercase flex items-center justify-center gap-2"
      style={{
        background:
          'var(--shop-primary-gradient, var(--shop-primary, var(--shop-accent, #00BFFF)))',
      }}
    >
      <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="hidden sm:inline tabular-nums">{text}</span>
      <span className="sm:hidden tabular-nums">{mobile}</span>
    </div>
  );
}
