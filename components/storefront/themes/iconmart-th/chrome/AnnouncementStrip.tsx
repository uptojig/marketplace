'use client';

/**
 * IconMart (iconmart-th) — AnnouncementStrip
 *
 * Skinny accent bar above the header. Accepts an optional `message` and
 * falls back to the digital-download standard line for an icon store
 * (instant SVG download, pay with store credit, no shipping).
 */

import React from 'react';
import type { AnnouncementStripProps } from '@/lib/templates/types';
import { ICONMART_HEX } from '../palette';

const DEFAULT_MESSAGE =
  'ดาวน์โหลด SVG ทันทีหลังชำระ · ซื้อด้วยเครดิตร้าน · ไม่มีค่าจัดส่ง';

export function IconMartStrip({ message, mobileMessage }: AnnouncementStripProps) {
  const text = message?.trim() ? message : DEFAULT_MESSAGE;
  const short = mobileMessage?.trim() ? mobileMessage : text;
  return (
    <div
      className="w-full flex items-center justify-center px-4 text-[12px] sm:text-[13px] font-[family:var(--font-prompt)] tracking-wide text-white"
      style={{
        height: 32,
        background: `var(--shop-primary, ${ICONMART_HEX.primary})`,
      }}
      role="region"
      aria-label="ประกาศร้าน"
    >
      <span className="truncate hidden sm:inline">{text}</span>
      <span className="truncate sm:hidden">{short}</span>
    </div>
  );
}

export default IconMartStrip;
