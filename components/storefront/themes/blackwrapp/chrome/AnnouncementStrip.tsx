'use client';
import React from 'react';
import { Truck } from 'lucide-react';

export interface AnnouncementStripProps {
  storeName: string;
  message?: string;
  mobileMessage?: string;
}

/**
 * BlackWrapp — announcement strip.
 *
 * Near-black ribbon with a single accent-color icon. The gradient
 * fallback ensures the strip keeps reading even on tenants that only
 * set `--shop-primary` and skip the gradient override.
 */
export function AnnouncementStrip({
  message,
  mobileMessage,
}: AnnouncementStripProps) {
  const desktop = message?.trim() || 'DELIVERED — ส่งฟรีทั่วประเทศ · ห่อพรีเมียม';
  const mobile = mobileMessage?.trim() || message?.trim() || 'DELIVERED — ส่งฟรี';

  return (
    <div
      className="font-[family:var(--font-prompt)] border-b border-white/5"
      style={{ background: '#0A0A0A', color: '#FAFAFA' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5">
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full"
          style={{
            background: 'var(--shop-primary-gradient, var(--shop-primary))',
            color: '#0A0A0A',
          }}
          aria-hidden="true"
        >
          <Truck size={11} strokeWidth={2.5} />
        </span>
        <p
          className="hidden sm:block text-[11px] tracking-[0.35em] uppercase font-medium"
        >
          {desktop}
        </p>
        <p className="sm:hidden text-[10px] tracking-[0.3em] uppercase font-medium">
          {mobile}
        </p>
      </div>
    </div>
  );
}

export default AnnouncementStrip;
