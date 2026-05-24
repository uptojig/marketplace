'use client';

import React from 'react';

interface Props {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

const DEFAULT_DESKTOP = 'จัดส่งฟรีทั่วประเทศ เมื่อช้อปครบ ฿990 · ส่งภายใน 1-3 วัน';
const DEFAULT_MOBILE = 'ส่งฟรีเมื่อช้อปครบ ฿990';

/**
 * Casethep accent gradient strip. Falls back to flat --shop-primary
 * when the per-store gradient var isn't set (PR #153 / #154 paint).
 */
export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const desktop = message?.trim() || DEFAULT_DESKTOP;
  const mobile = mobileMessage?.trim() || message?.trim() || DEFAULT_MOBILE;

  return (
    <div
      className="text-white text-center text-[11px] sm:text-xs py-2 px-4 tracking-wide font-[family:var(--font-prompt)] font-medium"
      style={{
        background: 'var(--shop-primary-gradient, var(--shop-primary, #FF5A6A))',
      }}
    >
      <span className="hidden sm:inline">{desktop}</span>
      <span className="sm:hidden">{mobile}</span>
    </div>
  );
}
