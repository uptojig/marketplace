'use client';

import React from 'react';
import { Leaf } from 'lucide-react';

interface SalukiStripProps {
  desktopText?: string;
  mobileText?: string;
}

export function SalukiStrip({ desktopText, mobileText }: SalukiStripProps) {
  const dText = desktopText || "ทุกชุดทำจากขวดน้ำพลาสติก 18 ขวด ลดขยะลงทะเล";
  const mText = mobileText || "18 ขวดต่อชุด";

  return (
    <div className="bg-[#0f766e] text-white py-2 px-4 text-center text-sm font-[family:var(--font-prompt)] flex items-center justify-center gap-2">
      <Leaf className="w-4 h-4 text-[#a7f3d0]" />
      <span className="hidden md:inline">{dText}</span>
      <span className="md:hidden">{mText}</span>
      <Leaf className="w-4 h-4 text-[#a7f3d0]" />
    </div>
  );
}
