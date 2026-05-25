'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Truck, Tag } from 'lucide-react';

export interface PackagingSupplyAnnouncementStripProps {
  /** Rotating announcement messages. Falls back to default 3-message rotation. */
  messages?: string[];
  /** Rotation interval (ms). Default 5s. */
  rotateMs?: number;
}

const DEFAULTS = [
  'ส่งฟรีเมื่อสั่งครบ ฿990 ทุกออเดอร์ ทั่วประเทศไทย',
  'รับประกันงานพิมพ์ · ขั้นต่ำ 500 ใบ เริ่ม ฿0.90/ดวง',
  'ลูกค้าใหม่รับส่วนลด 10% เมื่อสมัครรายชื่อแจ้งโปร',
];

const ICONS = [Truck, Sparkles, Tag];

/**
 * Packaging Supply — pink ↘ blue tape-strip announcement bar.
 *
 * Rotates 2-3 promo messages every `rotateMs` ms. The marketplace
 * scaffold passes us an `AnnouncementStripProps` with a single
 * `message` field — the adapter shows that as message[0] and tops up
 * with the operator-friendly defaults.
 */
export function AnnouncementStrip({
  messages = DEFAULTS,
  rotateMs = 5000,
}: PackagingSupplyAnnouncementStripProps) {
  const [idx, setIdx] = useState(0);
  const list = messages.length > 0 ? messages : DEFAULTS;

  useEffect(() => {
    if (list.length < 2) return;
    const id = setInterval(() => {
      setIdx((n) => (n + 1) % list.length);
    }, rotateMs);
    return () => clearInterval(id);
  }, [list.length, rotateMs]);

  const Icon = ICONS[idx % ICONS.length];

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-r from-[var(--shop-savings)] via-[var(--shop-primary)] to-[var(--shop-accent)] text-white text-xs font-semibold font-[family:var(--font-prompt)]"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center">
        <Icon size={14} className="shrink-0" aria-hidden />
        <span key={idx} className="animate-[fade-in_0.4s_ease-out]">
          {list[idx]}
        </span>
        {list.length > 1 && (
          <span className="hidden sm:inline-flex items-center gap-1 ml-3 opacity-80">
            {list.map((_, i) => (
              <span
                key={i}
                className={`block h-1 w-1 rounded-full transition-all ${
                  i === idx ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </span>
        )}
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AnnouncementStrip;
