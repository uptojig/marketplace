'use client';
import React, { useEffect, useState } from 'react';
import { Flame, Truck, ShieldCheck } from 'lucide-react';

export interface AnnouncementStripProps {
  storeName: string;
  message?: string;
}

/**
 * taobao-style — top urgency strip.
 *
 * Rotates three taobao-flavoured marketing chips (flash sale,
 * free-shipping threshold, COD guarantee) on a hot-gradient
 * background so the very first pixels of the page already feel
 * like a Pinduoduo / Lazada home tab.
 */
export function AnnouncementStrip({ storeName, message }: AnnouncementStripProps) {
  const messages = [
    { icon: Flame, text: message ?? `${storeName} ⚡ แฟลชเซลล์ ลดสูงสุด 70% วันนี้เท่านั้น!` },
    { icon: Truck, text: 'ส่งฟรีทั่วประเทศเมื่อสั่งครบ ฿199.- · กรุงเทพฯ ส่งวันเดียวถึง' },
    { icon: ShieldCheck, text: 'คัดสรรคุณภาพ · คืนเงินภายใน 7 วัน' },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500);
    return () => clearInterval(id);
  }, [messages.length]);

  const Current = messages[index];
  const Icon = Current.icon;

  return (
    <div
      className="text-white text-[11px] sm:text-xs font-semibold py-1.5 px-4 text-center tracking-wide"
      style={{ background: 'var(--shop-primary-gradient, var(--shop-primary))' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 font-[family:var(--font-prompt)]">
        <Icon size={14} className="shrink-0" style={{ color: 'var(--shop-accent)' }} />
        <span className="truncate">{Current.text}</span>
      </div>
    </div>
  );
}
