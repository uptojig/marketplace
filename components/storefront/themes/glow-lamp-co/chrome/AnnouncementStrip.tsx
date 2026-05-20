'use client';
import React from 'react';

export function GlowLampCoAnnouncementStrip() {
  return (
    <div className="bg-[#f59e0b] text-[#0f172a] font-[family:var(--font-kanit)] text-center py-2.5 text-sm tracking-wide shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, transparent 70%)' }}></div>
      <div className="hidden md:block font-medium relative z-10">แลกหลอดเก่าได้ส่วนลด 200 บาท · ส่งมาทางไปรษณีย์</div>
      <div className="md:hidden font-medium relative z-10">แลกหลอดเก่า -200.-</div>
    </div>
  );
}
