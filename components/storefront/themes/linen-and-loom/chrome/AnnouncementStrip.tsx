'use client';

import React from 'react';

export function LinenAndLoomStrip() {
  return (
    <div className="bg-[#475569] text-[#f8fafc] py-2.5 px-4 text-center text-sm font-[family:var(--font-prompt)] tracking-wide">
      <span className="block sm:hidden">ซื้อ 1 แถม 2</span>
      <span className="hidden sm:block">
        ซื้อชุดผ้าปูคู่ ฟรีปลอกหมอนเสริม 2 ใบ ตลอดเดือนพฤษภาคม
      </span>
    </div>
  );
}
