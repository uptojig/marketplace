'use client';
import React from 'react';

export interface AnnouncementStripProps {
  storeName: string;
}

export function AnnouncementStrip({ storeName }: AnnouncementStripProps) {
  return (
    <div className="bg-black text-[#facc15] border-b border-[#1f1f1f] text-xs py-2 px-4 text-center font-sans tracking-wider uppercase font-semibold">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#facc15] animate-pulse"></span>
        <span>ล็อกรุ่นรถก่อน — ฟิลเตอร์โชว์เฉพาะของที่ใส่ได้จริง · ส่งวันเดียวทั่วกรุงเทพฯ</span>
      </div>
    </div>
  );
}
