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

  // Colors derive from --shop-primary (the operator's picked accent threaded
  // by app/stores/[slug]/layout.tsx) so a primaryColor change in admin
  // actually moves these slots. Fallbacks keep the original saluki greens
  // when --shop-primary is absent.
  return (
    <div
      className="py-2 px-4 text-center text-sm font-[family:var(--font-prompt)] flex items-center justify-center gap-2 text-white"
      style={{ background: "var(--shop-primary, #0f766e)" }}
    >
      <Leaf
        className="w-4 h-4"
        style={{
          color:
            "color-mix(in srgb, var(--shop-primary, #0f766e) 30%, white)",
        }}
      />
      <span className="hidden md:inline">{dText}</span>
      <span className="md:hidden">{mText}</span>
      <Leaf
        className="w-4 h-4"
        style={{
          color:
            "color-mix(in srgb, var(--shop-primary, #0f766e) 30%, white)",
        }}
      />
    </div>
  );
}
