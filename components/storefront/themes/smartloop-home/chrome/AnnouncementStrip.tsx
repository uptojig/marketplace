'use client';
import React from 'react';
import { Truck } from 'lucide-react';

interface StripProps {
  desktopText?: string;
  mobileText?: string;
}

export function SmartloopHomeStrip({ desktopText, mobileText }: StripProps) {
  return (
    <div className="bg-[#059669] text-white py-1.5 px-4 text-xs sm:text-sm font-[family:var(--font-prompt)] flex items-center justify-center gap-2">
      <Truck className="w-4 h-4" />
      <span className="hidden sm:inline">{desktopText || 'ส่งฟรีในกรุงเทพ เมื่อสั่งครบ 990 บาท · ส่งภายในวันเดียว'}</span>
      <span className="inline sm:hidden">{mobileText || 'ส่งวันเดียว 990.-'}</span>
    </div>
  );
}
