'use client';

/**
 * resume-studio-th — AnnouncementStrip
 *
 * Skinny 32px bar above the header in the ResumeKit accent-ink →
 * accent gradient. Defaults to the credit/instant-download line; the
 * operator-supplied `message` (and `mobileMessage`) win when present.
 */

import React from 'react';
import type { AnnouncementStripProps } from '@/lib/templates/types';
import { RS_ACCENT, RS_ACCENT_INK } from '../palette';

const DEFAULT_MESSAGE =
  '✨ เติมเครดิตครั้งเดียว เลือกเทมเพลตได้ทั้งร้าน · ดาวน์โหลดทันที แก้ไขได้ใน Word / Canva';

const DEFAULT_MOBILE = '✨ เติมเครดิตครั้งเดียว · ดาวน์โหลดทันที';

export function ResumeStudioStrip({
  message,
  mobileMessage,
}: AnnouncementStripProps) {
  const desktop = message?.trim() ? message : DEFAULT_MESSAGE;
  const mobile = mobileMessage?.trim()
    ? mobileMessage
    : message?.trim()
      ? message
      : DEFAULT_MOBILE;

  return (
    <div
      className="w-full flex items-center justify-center px-4 text-white text-[12px] sm:text-[13px] font-medium tracking-wide font-[family:var(--font-prompt)]"
      style={{
        height: 32,
        background: `linear-gradient(135deg, ${RS_ACCENT_INK}, ${RS_ACCENT})`,
      }}
      role="region"
      aria-label="ประกาศร้าน"
    >
      <span className="truncate hidden sm:inline">{desktop}</span>
      <span className="truncate sm:hidden">{mobile}</span>
    </div>
  );
}

export default ResumeStudioStrip;
