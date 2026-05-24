'use client';

import React from 'react';
import { Megaphone } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_MESSAGE = 'ส่งฟรีเมื่อช้อปครบ ฿990 · รับประกันคุณภาพทุกชิ้น';

/**
 * Konvy — announcement strip (scaffold).
 *
 * Designer should swap to a marquee / countdown / promo banner that
 * matches the brand vibe.
 */
export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const text = message?.trim() || DEFAULT_MESSAGE;
  const mobile = mobileMessage?.trim() || text;

  return (
    <div
      className="text-white text-xs sm:text-sm font-[family:var(--font-kanit)] font-bold px-4 py-2 text-center tracking-wide flex items-center justify-center gap-2"
      style={{ background: 'var(--shop-primary)' }}
    >
      <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline">{text}</span>
      <span className="sm:hidden">{mobile}</span>
    </div>
  );
}
