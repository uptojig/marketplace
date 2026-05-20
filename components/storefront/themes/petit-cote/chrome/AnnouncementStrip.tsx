'use client';

import React from 'react';

export function PetitCoteAnnouncementStrip({ message }: { message?: string }) {
  return (
    <div className="bg-[#fbcfe8] text-[#525252] text-xs py-2 px-4 text-center font-[family:var(--font-kanit)] flex items-center justify-center gap-2 tracking-wide">
      <span className="hidden sm:inline">
        ส่งฟรีทั่วประเทศ ในวันแรกที่สั่ง · ลงทะเบียนของขวัญฟรี
      </span>
      <span className="sm:hidden">
        ส่งฟรี + GIFT registry
      </span>
    </div>
  );
}
