'use client';
import React from 'react';

export interface AnnouncementStripProps {
  storeName: string;
}

export function AnnouncementStrip({ storeName }: AnnouncementStripProps) {
  return (
    <div className="bg-[#1c1917] text-[#a8a29e] py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        {/* Desktop */}
        <p className="hidden sm:block font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase">
          นัดวัดตัวฟรี ที่สุขุมวิท 27 · เปิดเฉพาะนัดล่วงหน้า
        </p>
        {/* Mobile */}
        <p className="sm:hidden font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.3em] uppercase">
          นัดวัดตัวฟรี
        </p>
      </div>
    </div>
  );
}
