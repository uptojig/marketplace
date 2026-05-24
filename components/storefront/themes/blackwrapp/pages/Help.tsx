'use client';

import React from 'react';
import type { HelpProps } from '@/lib/templates/types';

const FALLBACK_TITLES: Record<string, string> = {
  faq: 'คำถามที่พบบ่อย',
  shipping: 'การจัดส่งสินค้า',
  returns: 'การคืนสินค้า',
  privacy: 'นโยบายความเป็นส่วนตัว',
  terms: 'ข้อกำหนดและเงื่อนไข',
};

/**
 * BlackWrapp — help / faq / policy fallback (scaffold).
 */
export function Help({ store, pageSlug }: HelpProps) {
  const slug = pageSlug ?? 'faq';
  const title = FALLBACK_TITLES[slug] ?? 'ศูนย์ช่วยเหลือ';

  return (
    <div className="bg-[var(--shop-bg)] text-[var(--shop-ink)] font-[family:var(--font-prompt)]">
      <section className="bg-[var(--shop-bg-soft)] border-b border-[var(--shop-border)] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-black">
            {title}
          </h1>
          <p className="text-sm text-[var(--shop-ink-muted)] mt-2">
            ร้าน {store.name}
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-[var(--shop-ink-muted)] italic">
          เนื้อหา {title} ของร้านนี้ยังไม่ได้กำหนด ผู้ดูแลสามารถเข้าไปแก้ไขในหน้าจัดการของร้านได้ทันที
        </p>
      </section>
    </div>
  );
}
