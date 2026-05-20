'use client';
import React from 'react';
import type { AnnouncementStripProps } from '@/lib/templates/types';

export function CarbonEraCamerasAnnouncementStrip({ messages }: AnnouncementStripProps) {
  return (
    <div className="bg-[#0a0a0a] text-[#fafafa] py-2 text-center text-xs md:text-sm font-[family:var(--font-prompt)] uppercase tracking-widest border-b border-[#27272a]">
      <div className="hidden sm:block">วันนี้: Leica M6 Black 1985 เพิ่งเข้า — สภาพ Excellent Plus</div>
      <div className="block sm:hidden">Leica M6 เข้าใหม่</div>
    </div>
  );
}
