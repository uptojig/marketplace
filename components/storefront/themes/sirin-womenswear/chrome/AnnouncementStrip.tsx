'use client';

import React from 'react';

export function SirinAnnouncementStrip() {
  return (
    <div className="w-full bg-[#be185d] text-[#fff5f7] py-2 text-center font-[family:var(--font-prompt)] text-sm tracking-wide">
      <div className="hidden md:block">
        Lookbook พฤษภาคม · ส่งฟรีทั่วประเทศเมื่อสั่ง 2 ชิ้นขึ้นไป
      </div>
      <div className="block md:hidden">
        ส่งฟรี 2 ชิ้น
      </div>
    </div>
  );
}
