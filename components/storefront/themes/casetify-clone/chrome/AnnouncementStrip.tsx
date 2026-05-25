'use client';
import React from 'react';

export interface AnnouncementStripProps {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

/**
 * Casetify Clone — top banner strip.
 *
 * Tiny black ribbon with uppercase tracking-widest copy — sits above
 * the header, mirroring the "Free regular shipping…" line on CASETiFY.
 */
export function AnnouncementStrip({
  message,
  mobileMessage,
}: AnnouncementStripProps) {
  const desktop = message?.trim() || 'FREE REGULAR SHIPPING ON ORDERS OVER ฿1,500';
  const mobile = mobileMessage?.trim() || message?.trim() || 'FREE SHIPPING ฿1,500+';

  return (
    <div className="bg-black text-white font-[family:var(--font-prompt)]">
      <div className="mx-auto max-w-7xl px-4 py-2 text-center">
        <p className="hidden sm:block text-[11px] font-medium uppercase tracking-[0.25em]">
          {desktop}
        </p>
        <p className="sm:hidden text-[10px] font-medium uppercase tracking-[0.18em]">
          {mobile}
        </p>
      </div>
    </div>
  );
}

export default AnnouncementStrip;
