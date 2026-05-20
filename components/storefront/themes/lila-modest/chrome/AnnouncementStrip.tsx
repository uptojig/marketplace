'use client';
import React from 'react';

export interface AnnouncementStripProps {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

export function AnnouncementStrip({ storeName, message, mobileMessage }: AnnouncementStripProps) {
  const desktopText = message || 'ส่งฟรีเมื่อสั่งครบ 1,500 บาท · ราคาเดียวทั้งร้าน';
  const mobileText = mobileMessage || 'ส่งฟรี 1,500.-';

  return (
    <div className="bg-[#5b4636] text-[#f5efe6] py-2 font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Desktop message */}
        <p className="hidden sm:block text-xs tracking-wide font-medium">
          {desktopText}
        </p>
        {/* Mobile message */}
        <p className="sm:hidden text-xs tracking-wide font-medium">
          {mobileText}
        </p>
      </div>
    </div>
  );
}
