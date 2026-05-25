'use client';
import React from 'react';

interface Props {
  storeName: string;
  message?: string | null;
  mobileMessage?: string | null;
}

const DEFAULT_MESSAGES = [
  '🚀 ส่งฟรี ฿590+',
  '✨ เปลี่ยน-คืนได้ 30 วัน',
  '⚡ ผ่อน 0% นาน 3 เดือน',
  '🌈 มากกว่า 200 ดีไซน์ลิมิเต็ด',
];

/**
 * CaseINW announcement strip — gradient sweep bar with rotating
 * promo chips. On mobile shows one centered message; on desktop the
 * full row pulses with separators.
 */
export function AnnouncementStrip({ message, mobileMessage }: Props) {
  const items = message ? [message, ...DEFAULT_MESSAGES.slice(1)] : DEFAULT_MESSAGES;
  const mobile = mobileMessage || message || items[0];

  return (
    <div
      className="relative w-full text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] overflow-hidden"
      style={{
        background:
          'var(--shop-primary-gradient, linear-gradient(120deg,#EC4899,#8B5CF6,#06B6D4))',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center">
        <div className="hidden sm:flex items-center gap-6 lg:gap-10 font-[family:var(--font-prompt)]">
          {items.map((m, i) => (
            <React.Fragment key={i}>
              <span className="whitespace-nowrap drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">{m}</span>
              {i < items.length - 1 && (
                <span aria-hidden="true" className="text-white/55">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="sm:hidden text-center w-full truncate">{mobile}</div>
      </div>
    </div>
  );
}
