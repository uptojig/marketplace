'use client';
import React from 'react';

export interface AnnouncementStripProps {
  storeName: string;
}

export function AnnouncementStrip({ storeName }: AnnouncementStripProps) {
  return (
    <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        {/* Desktop message */}
        <span className="hidden md:block font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.25em] text-[#e8e2d4]">
          DROP 08 — เปิดสั่งจอง 24 พ.ค. เวลา 20:00 น.
        </span>
        {/* Mobile message */}
        <span className="block md:hidden font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.2em] text-[#e8e2d4]">
          DROP 08 · 24 พ.ค. 20:00
        </span>
      </div>
    </div>
  );
}
