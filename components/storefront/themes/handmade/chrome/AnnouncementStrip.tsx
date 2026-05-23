'use client';

import React from 'react';
import { Sparkles, Hand } from 'lucide-react';

/**
 * Handmade — AnnouncementStrip
 *
 * Sky-thin marketing strip rendered above the Header. Reads from
 * the Specialty family CSS-var cascade (`--shop-*`) so the strip
 * tints automatically when this template is wrapped in the
 * `.theme-specialty` skin.
 *
 * Craft vibe: tiny hand-drawn dashed underline + Sparkles / Hand
 * icons hinting at maker / artisan / hand-stitched batches. Copy
 * defaults to Thai.
 */

export interface AnnouncementStripProps {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

export function AnnouncementStrip({ storeName, message, mobileMessage }: AnnouncementStripProps) {
  const desktopText =
    message ?? `งานคราฟท์ทำมือทุกชิ้น · ส่งตรงจากสตูดิโอของ ${storeName}`;
  const displayMobileText = mobileMessage ?? message ?? 'งานคราฟท์ทำมือ · ส่งตรงจากสตูดิโอ';

  return (
    <div
      className="relative border-b text-center text-xs sm:text-sm tracking-wide overflow-hidden"
      style={{
        backgroundColor: 'var(--shop-accent, #b45309)',
        color: 'var(--shop-bg, #f5efe3)',
        borderColor: 'rgba(0,0,0,0.12)',
      }}
    >
      {/* hand-drawn stitch decoration */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 12px)',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 font-[family:var(--font-prompt)]">
        <Sparkles className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline-block">{desktopText}</span>
        <span className="sm:hidden">{displayMobileText}</span>
        <Hand className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}
