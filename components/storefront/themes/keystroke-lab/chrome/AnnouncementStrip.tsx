'use client';

import React from 'react';

export function KeystrokeLabAnnouncementStrip() {
  return (
    <div className="bg-[#0f172a] text-[#22d3ee] py-2 px-4 text-center border-b border-[#1e293b]">
      <p className="font-[family:var(--font-kanit)] text-sm tracking-[0.12em] hidden md:block uppercase">
        ฟังเสียงสวิตช์ออนไลน์ก่อนซื้อ — รุ่น Holy Panda กลับมาแล้ว
      </p>
      <p className="font-[family:var(--font-kanit)] text-sm tracking-[0.12em] md:hidden uppercase">
        Holy Panda กลับมาแล้ว
      </p>
    </div>
  );
}
