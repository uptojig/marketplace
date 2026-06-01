'use client';
import React from 'react';

export interface AnnouncementStripProps {
  storeName: string;
}

export function AnnouncementStrip({ storeName }: AnnouncementStripProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#F472B6] py-2.5 px-4 text-white">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#7C3AED] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F472B6] to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto flex items-center justify-center gap-2 text-[12px] font-semibold tracking-wide">
        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#FCD34D] animate-pulse" />
        <p className="hidden sm:block">ทดสอบฟรี · เริ่ม 12 นาที · รับ insight เฉพาะคุณ</p>
        <p className="sm:hidden">ทดสอบฟรี · 12 นาที</p>
      </div>
    </div>
  );
}
