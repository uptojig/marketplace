'use client';

import React from 'react';

export function HinokiAnnouncementStrip({ store }: { store: any }) {
  return (
    <div className="bg-[#3f2e1e] text-[#f6efe2] py-2 px-4 text-center text-sm font-[family:var(--font-prompt)] font-light tracking-wide">
      <div className="hidden sm:block">เรื่องเล่าที่ 12 &apos;จดหมายจากภูทอก&apos; — เปิดให้สั่งจองพรุ่งนี้ 20:00</div>
      <div className="sm:hidden">เรื่องที่ 12 · 22 พ.ค.</div>
    </div>
  );
}
