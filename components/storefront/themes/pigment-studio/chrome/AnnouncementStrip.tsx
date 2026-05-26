'use client';

import React from 'react';
import { PawPrint } from 'lucide-react';

export function PigmentStudioAnnouncementStrip() {
  return (
    <div className="bg-[#f97316] text-[#fff7ed] py-2 px-4 text-center font-[family:var(--font-prompt)] text-sm relative overflow-hidden group">
      {/* Playful abstract brush strokes in background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex justify-between items-center px-10">
        <div className="w-16 h-8 bg-[#facc15] rounded-full blur-xl transform -rotate-12 group-hover:rotate-12 transition-all duration-700"></div>
        <div className="w-24 h-12 bg-white rounded-full blur-xl transform rotate-45 group-hover:-rotate-12 transition-all duration-700"></div>
      </div>
      
      <div className="hidden md:flex justify-center items-center gap-2 relative z-10 font-medium tracking-wide">
        <PawPrint className="w-4 h-4 text-[#facc15]" />
        เอาใจทาสแมวและสายคราฟต์ ช้อปของใช้น่ารักๆ ได้แล้ววันนี้
        <PawPrint className="w-4 h-4 text-[#facc15]" />
      </div>
      <div className="flex md:hidden justify-center items-center gap-2 relative z-10 font-medium">
        <PawPrint className="w-4 h-4 text-[#facc15]" />
        ของใช้น่ารักๆ เพื่อทาสแมว
      </div>
    </div>
  );
}
