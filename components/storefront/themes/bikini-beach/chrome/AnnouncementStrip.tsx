'use client';

import React, { useEffect, useState } from 'react';
import {
  IconTruck,
  IconRefresh,
  IconShieldCheck,
  IconGift,
} from '@tabler/icons-react';

export interface AnnouncementMessage {
  icon?: React.ReactNode;
  text: React.ReactNode;
}

export interface AnnouncementStripProps {
  messages?: AnnouncementMessage[];
  /** Time per message in ms when more than 4 messages provided. Default: 4000ms */
  rotateMs?: number;
}

const DEFAULT_MESSAGES: AnnouncementMessage[] = [
  { icon: <IconTruck size={14} />, text: 'ส่งฟรีทั่วไทย ฿890+' },
  { icon: <IconRefresh size={14} />, text: 'เปลี่ยนไซส์ฟรี 14 วัน' },
  { icon: <IconShieldCheck size={14} />, text: 'Discreet Packaging' },
  {
    icon: <IconGift size={14} />,
    text: (
      <>
        สมัครรับ ฿200 · โค้ด <b>WELCOME200</b>
      </>
    ),
  },
];

/**
 * AnnouncementStrip — sticky top promo strip.
 * - When ≤ 4 messages: render all inline.
 * - When > 4 messages: rotate one at a time at `rotateMs` interval.
 */
export function AnnouncementStrip({
  messages = DEFAULT_MESSAGES,
  rotateMs = 4000,
}: AnnouncementStripProps) {
  const shouldRotate = messages.length > 4;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!shouldRotate) return;
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % messages.length),
      rotateMs
    );
    return () => window.clearInterval(id);
  }, [shouldRotate, rotateMs, messages.length]);

  if (shouldRotate) {
    const current = messages[idx];
    return (
      <div
        className="bk-announce"
        role="region"
        aria-live="polite"
        aria-label="Site announcements"
      >
        <div className="bk-container">
          <div className="bk-announce-row" style={{ justifyContent: 'center' }}>
            <div className="bk-announce-item">
              {current.icon}
              <span>{current.text}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bk-announce"
      role="region"
      aria-label="Site announcements"
    >
      <div className="bk-container">
        <div className="bk-announce-row">
          {messages.map((m, i) => (
            <div key={i} className="bk-announce-item">
              {m.icon}
              <span>{m.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnnouncementStrip;
