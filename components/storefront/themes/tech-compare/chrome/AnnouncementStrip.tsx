'use client';
import React from 'react';

export interface AnnouncementStripProps {
  storeName: string;
}

export function AnnouncementStrip({ storeName }: AnnouncementStripProps) {
  return (
    <div
      className="flex h-8 items-center justify-center text-xs font-medium tracking-wide"
      style={{
        background: '#0f172a',
        color: '#FFFFFF',
      }}
    >
      ยินดีต้อนรับสู่ {storeName} · จัดส่งฟรีเมื่อสั่งซื้อครบ ฿500
    </div>
  );
}
