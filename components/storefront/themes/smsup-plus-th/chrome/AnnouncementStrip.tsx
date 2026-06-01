'use client';
import React from 'react';

export interface AnnouncementStripProps {
  storeName: string;
}

export function AnnouncementStrip({ storeName }: AnnouncementStripProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#F97316] py-2.5 px-4 text-white">
      <div className="relative max-w-7xl mx-auto flex items-center justify-center gap-2 text-[12px] font-semibold tracking-wide">
        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse" />
        <p className="hidden sm:block">Shop More · Smile Up · ทดลองฟรี 100 ข้อความ ไม่ต้องใช้บัตรเครดิต</p>
        <p className="sm:hidden">ทดลองฟรี 100 ข้อความ</p>
      </div>
    </div>
  );
}
