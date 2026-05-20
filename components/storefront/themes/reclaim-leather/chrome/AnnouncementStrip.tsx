'use client';
import React from 'react';

interface StripProps {
  desktopText?: string;
  mobileText?: string;
}

export function ReclaimLeatherAnnouncementStrip({ desktopText, mobileText }: StripProps) {
  const dText = desktopText || "Repair-for-life · ส่งกลับมาซ่อมได้ตลอดอายุการใช้งาน";
  const mText = mobileText || "Repair-for-life";

  return (
    <div className="bg-[#5b3a1e] text-[#f4ead8] py-2.5 px-4 text-center font-[family:var(--font-prompt)] text-sm tracking-wide shadow-inner border-b border-[#2a1a09]/20 flex justify-center items-center gap-2">
      <span className="hidden md:inline-block">🧵</span>
      <span className="hidden md:inline">{dText}</span>
      <span className="md:hidden">{mText}</span>
      <span className="hidden md:inline-block">🧵</span>
    </div>
  );
}
