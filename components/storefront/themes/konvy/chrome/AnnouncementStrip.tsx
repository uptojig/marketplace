'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_MESSAGE = 'ส่งฟรีเมื่อช้อปครบ ฿590 · จ่ายออนไลน์ · ของแท้ทุกชิ้น';
const DEFAULT_MOBILE = 'ส่งฟรี ฿590 · จ่ายออนไลน์';

/**
 * Konvy — soft K-beauty announcement strip.
 *
 * Uses `var(--shop-primary-gradient, var(--shop-primary))` so the strip
 * re-skins automatically when an operator picks a different palette
 * preset (rose / coral / sand / mint / lavender / sky / charcoal).
 * The accent sparkle uses `var(--shop-accent)` so it pops against the
 * brand gradient.
 */
export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const text = message?.trim() || DEFAULT_MESSAGE;
  const mobile = mobileMessage?.trim() || DEFAULT_MOBILE;

  return (
    <div
      className="text-white text-xs sm:text-sm font-[family:var(--font-prompt)] font-medium px-4 py-2.5 text-center tracking-wide flex items-center justify-center gap-2"
      style={{ background: 'var(--shop-primary-gradient, var(--shop-primary))' }}
    >
      <Sparkles
        className="h-4 w-4 shrink-0"
        aria-hidden
        style={{ color: 'var(--shop-accent, #FFFFFF)' }}
      />
      <span className="hidden sm:inline">{text}</span>
      <span className="sm:hidden">{mobile}</span>
      <Sparkles
        className="h-4 w-4 shrink-0 hidden sm:inline-block"
        aria-hidden
        style={{ color: 'var(--shop-accent, #FFFFFF)' }}
      />
    </div>
  );
}
