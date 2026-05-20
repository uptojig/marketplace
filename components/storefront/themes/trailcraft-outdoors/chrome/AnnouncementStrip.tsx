'use client';

import React from 'react';
import type { AnnouncementStripProps } from '@/lib/templates/types';

export function TrailcraftStrip({ messages }: AnnouncementStripProps) {
  return (
    <div className="bg-[#365314] text-[#fdfbe8] font-[family:var(--font-prompt)] py-2 px-4 text-center text-sm md:text-base font-medium tracking-wide">
      <div className="hidden md:block">
        Race Pack — สำหรับนักวิ่ง TIM2026 ส่งฟรีและพรีเซ็ตน้ำหนัก
      </div>
      <div className="block md:hidden">
        TIM2026 Race Pack
      </div>
    </div>
  );
}
