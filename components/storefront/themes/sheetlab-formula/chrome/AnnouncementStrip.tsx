'use client';

/**
 * sheetlab-formula — AnnouncementStrip
 *
 * Skinny 32px green bar — the spreadsheet "fx" announcement strip
 * sits above the header. Accepts an optional `message` and falls
 * back to the digital-download standard line.
 */

import React from 'react';
import type { AnnouncementStripProps } from '@/lib/templates/types';

const DEFAULT_MESSAGE =
  '⚡ ดาวน์โหลดทันทีหลังชำระเงิน · รองรับ (PromptPay, บัตรเครดิต, BNPL)';

export function SheetlabFormulaStrip({ message }: AnnouncementStripProps) {
  const text = message?.trim() ? message : DEFAULT_MESSAGE;
  return (
    <div
      className="w-full bg-[#107C41] text-white flex items-center justify-center px-4 text-[12px] sm:text-[13px] font-[family:var(--font-prompt)] tracking-wide"
      style={{ height: 32 }}
      role="region"
      aria-label="ประกาศร้าน"
    >
      <span className="truncate">{text}</span>
    </div>
  );
}

export default SheetlabFormulaStrip;
