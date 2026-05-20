'use client';

import React from 'react';
import type { AnnouncementStripProps } from '@/lib/templates/types';

export function InkstonePaperStrip({}: AnnouncementStripProps) {
  return (
    <div className="w-full bg-[#3a2e22] text-[#f7f1e3] py-2.5 px-4 text-center text-sm font-[family:var(--font-prompt)] font-medium tracking-wide">
      <div className="hidden md:block">
        ลอตใหม่จาก Tomoe River — สั่งล่วงหน้าก่อนคนอื่น
      </div>
      <div className="block md:hidden uppercase tracking-widest text-xs">
        Tomoe River drop
      </div>
    </div>
  );
}
