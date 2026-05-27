'use client';
import React, { useEffect, useState } from 'react';
import { Download, Sparkles, GraduationCap, BookOpen, type LucideIcon } from 'lucide-react';

import {
  EDU_PRIMARY,
  EDU_PRIMARY_DEEP,
  EDU_ACCENT,
  EDU_BG_SOFT,
} from '../palette';

export interface AnnouncementStripProps {
  /** Custom messages — falls back to the classroom defaults below. */
  messages?: string[];
  /** Rotation cadence; 5s feels classroom-friendly, not pushy. */
  rotateMs?: number;
}

/**
 * EduClassroom — friendly classroom-strip announcement bar.
 *
 * Rotates short Thai messages aimed at teachers (instant-download,
 * editable in Slides, ครูแชร์ครู …). Renders a chalk-yellow ribbon
 * stitched onto the classroom-blue ground so it reads like the strip
 * of paper pinned above a chalkboard.
 *
 * Renders `null` when no messages are supplied AND defaults are
 * suppressed — the Header already embeds the always-on "ดาวน์โหลดทันที"
 * strip; the registry currently returns null from the strip adapter
 * to avoid double-stacking. This file exists so the chrome contract
 * is complete and an operator can opt the strip back on with a
 * one-line registry change.
 */
const DEFAULTS: Array<{ icon: LucideIcon; text: string }> = [
  {
    icon: Download,
    text: 'ดาวน์โหลดได้ทันทีหลังชำระเงิน · ใช้สอนวันรุ่งขึ้นได้เลย',
  },
  {
    icon: BookOpen,
    text: 'แก้ไขใน Google Slides / PowerPoint ได้อิสระ',
  },
  {
    icon: Sparkles,
    text: 'อัปเดตเนื้อหาฟรีตลอดอายุการใช้งาน',
  },
  {
    icon: GraduationCap,
    text: 'ออกแบบโดยครูประจำการ สอดคล้องกับหลักสูตรแกนกลาง',
  },
];

export function AnnouncementStrip({
  messages,
  rotateMs = 5000,
}: AnnouncementStripProps) {
  const items =
    messages && messages.length > 0
      ? messages.map((text) => ({ icon: Sparkles, text }))
      : DEFAULTS;

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, rotateMs);
    return () => clearInterval(t);
  }, [items.length, rotateMs]);

  if (items.length === 0) return null;
  const Active = items[idx]?.icon ?? Sparkles;
  const activeText = items[idx]?.text ?? '';

  return (
    <div
      className="relative overflow-hidden font-[family:var(--font-kanit)]"
      style={{
        background: `linear-gradient(90deg, ${EDU_PRIMARY} 0%, ${EDU_PRIMARY_DEEP} 100%)`,
      }}
    >
      {/* Chalk-yellow pin ribbon on the left & right edges */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ background: EDU_ACCENT }}
      />
      <span
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-1.5"
        style={{ background: EDU_ACCENT }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-semibold text-center">
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0"
          style={{ background: EDU_BG_SOFT, color: EDU_PRIMARY_DEEP }}
        >
          <Active size={12} strokeWidth={2.5} />
        </span>
        <span className="truncate">{activeText}</span>
      </div>
    </div>
  );
}

export default AnnouncementStrip;
