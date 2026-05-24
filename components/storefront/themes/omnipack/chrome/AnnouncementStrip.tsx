'use client';

/**
 * OmniPack — top announcement strip.
 *
 * Kraft-paper gradient band running the full width above the header.
 * Uses `var(--shop-primary-gradient, var(--shop-primary))` so when the
 * palette swatch doesn't set a gradient (e.g. the override system only
 * pushed a flat brand color) we still render a solid kraft-brown band
 * instead of falling back to transparent.
 */

import React from 'react';
import { Leaf, Truck } from 'lucide-react';
import type { AnnouncementStripProps } from '@/lib/templates/types';

export function OmnipackAnnouncementStrip(_props: AnnouncementStripProps) {
  return (
    <div
      className="w-full text-white text-xs sm:text-sm font-[family:var(--font-prompt)] py-2 px-4"
      style={{
        background: 'var(--shop-primary-gradient, var(--shop-primary))',
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          ส่งฟรีทั่วประเทศเมื่อสั่งครบ ฿990
        </span>
        <span className="hidden sm:flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5" />
          กระดาษคราฟท์ 100% รีไซเคิลได้
        </span>
      </div>
    </div>
  );
}
