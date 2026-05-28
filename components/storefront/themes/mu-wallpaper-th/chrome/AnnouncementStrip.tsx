'use client';

/**
 * Mu Wallpaper — AnnouncementStrip
 *
 * Skinny gilded bar above the header. Reinforces the store-credit + instant
 * download promise from the design export ("เติมเท่าไรใช้เท่านั้น"). Accepts
 * an optional `message` and falls back to the สายมู standard line.
 */

import React from 'react';
import type { AnnouncementStripProps } from '@/lib/templates/types';
import { MU_WALLPAPER_HEX } from '../palette';

const DEFAULT_MESSAGE =
  '✦ ปลุกเสกตามฤกษ์ · เติมเครดิต 1 บาท = 1 เครดิต · ซื้อแล้วดาวน์โหลดไฟล์เต็มทันที ไม่มีลายน้ำ';

export function MuWallpaperStrip({ message }: AnnouncementStripProps) {
  const text = message?.trim() ? message : DEFAULT_MESSAGE;
  return (
    <div
      className="w-full flex items-center justify-center px-4 text-[12px] sm:text-[12.5px] font-[family:var(--font-prompt)] tracking-wide"
      style={{
        height: 32,
        background: 'rgba(124,102,210,.18)',
        color: MU_WALLPAPER_HEX.gold2,
        borderBottom: `1px solid var(--shop-border, ${MU_WALLPAPER_HEX.border})`,
      }}
      role="region"
      aria-label="ประกาศร้าน"
    >
      <span className="truncate">{text}</span>
    </div>
  );
}

export default MuWallpaperStrip;
