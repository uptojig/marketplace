'use client';

/**
 * MotoFog — racing announcement strip.
 *
 * High-contrast accent gradient (uses --shop-primary-gradient with a
 * --shop-primary fallback) and angular skewed edges to read like a
 * racing flag / pit-banner.
 */

import React from 'react';
import { Zap } from 'lucide-react';
import type { AnnouncementStripProps } from '@/lib/templates/types';

export function MotoFogStrip(_props: AnnouncementStripProps) {
  return (
    <div
      className="relative w-full overflow-hidden font-[family:var(--font-prompt)] text-[11px] sm:text-xs tracking-widest uppercase font-bold py-2 text-black"
      style={{
        background:
          'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
      }}
    >
      {/* Speed-line stripes — pure CSS, no motion lib needed. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'repeating-linear-gradient(110deg, transparent 0 14px, rgba(0,0,0,0.35) 14px 16px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
        <Zap className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">
          ส่งฟรีทั่วประเทศ · สั่งครบ ฿1,990 · จ่ายผ่าน AnyPay เท่านั้น
        </span>
        <span className="sm:hidden">ส่งฟรี ฿1,990+ · AnyPay</span>
        <Zap className="h-3.5 w-3.5 shrink-0" />
      </div>
    </div>
  );
}

export default MotoFogStrip;
