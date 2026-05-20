'use client';

import React from 'react';
import type { AnnouncementStripProps } from '@/lib/templates/types';

export function BulkboxStrip({ store }: AnnouncementStripProps) {
  return (
    <div className="bg-[#0f172a] text-[#f8fafc] py-2 px-4 font-[family:var(--font-prompt)] text-sm text-center font-medium tracking-wide">
      <span className="hidden sm:inline">เปิดให้ธุรกิจสมัคร — ตรวจสอบเอกสารภายใน 48 ชั่วโมง</span>
      <span className="sm:hidden">สมัครธุรกิจ</span>
    </div>
  );
}
