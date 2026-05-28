'use client';

/**
 * Mu Wallpaper — Footer
 *
 * Midnight footer translating the export's `.ft`: brand block with payment
 * chips on the left, a nav column on the right, and a fine-print disclaimer
 * (สายมู wallpapers are per personal belief; no result guaranteed). The
 * Help links are gated by `availableSupportPages` so empty support pages
 * never surface. Addresses are assembled from DB fields only — never
 * hardcoded. Payment chips reference PromptPay / บัตรเครดิต / TrueMoney.
 */

import React from 'react';
import Link from 'next/link';
import type { FooterProps } from '@/lib/templates/types';
import { MU_WALLPAPER_HEX, MU_WALLPAPER_GOLD_GRADIENT } from '../palette';

const DEFAULT_BRAND_COPY =
  'วอลล์เปเปอร์เสริมดวงปลุกเสกตามตำรา · เติมเครดิตแล้วเลือกซื้อ ซื้อแล้วดาวน์โหลดไฟล์เต็มทันที';

const PAYMENT_CHIPS = ['PromptPay', 'บัตรเครดิต', 'TrueMoney'];

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => (p ?? '').trim())
    .filter((p) => p.length > 0)
    .join(' ');
}

export function MuWallpaperFooter({
  store,
  categories = [],
  availableSupportPages = [],
}: FooterProps) {
  const slug = store.slug;
  const homeUrl = `/stores/${slug}`;
  const catalogUrl = `/stores/${slug}/category`;
  const topupUrl = `/stores/${slug}/account/credit/topup`;

  const brandCopy =
    store.description?.trim() || store.tagline?.trim() || DEFAULT_BRAND_COPY;

  // Nav links — categories + topup + gated support pages.
  const navLinks: { label: string; href: string }[] = [
    { label: 'หมวดหมู่', href: catalogUrl },
    { label: 'เติมเครดิต', href: topupUrl },
  ];
  if (availableSupportPages.includes('faq')) {
    navLinks.push({ label: 'คำถามพบบ่อย', href: `/stores/${slug}/help/faq` });
  }
  if (availableSupportPages.includes('terms')) {
    navLinks.push({ label: 'เงื่อนไขการใช้งาน', href: `/stores/${slug}/help/terms` });
  }
  if (availableSupportPages.includes('privacy')) {
    navLinks.push({ label: 'นโยบายความเป็นส่วนตัว', href: `/stores/${slug}/help/privacy` });
  }
  navLinks.push({ label: 'คลังของฉัน', href: `/stores/${slug}/account/downloads` });

  const address = joinAddress([
    store.addressLine1,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ]);

  const year = new Date().getFullYear() + 543; // พ.ศ. (Buddhist Era)

  return (
    <footer
      className="w-full font-[family:var(--font-prompt)] mt-11"
      role="contentinfo"
      style={{
        borderTop: `1px solid var(--shop-border, ${MU_WALLPAPER_HEX.border})`,
        background: `var(--shop-bg, ${MU_WALLPAPER_HEX.bg})`,
        color: `var(--shop-ink, ${MU_WALLPAPER_HEX.ink})`,
        ['--shop-primary' as string]: MU_WALLPAPER_HEX.gold,
      }}
    >
      <div className="max-w-[1180px] mx-auto px-4 pt-8 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          {/* Brand + payment chips */}
          <div className="space-y-3.5">
            <Link href={homeUrl} className="inline-flex items-center">
              <span
                className="text-[18px] font-[family:var(--font-kanit)] font-semibold tracking-[0.02em]"
                style={{
                  background: MU_WALLPAPER_GOLD_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {store.name}
              </span>
            </Link>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg"
                  style={{
                    color: MU_WALLPAPER_HEX.inkMuted,
                    border: `1px solid var(--shop-border, ${MU_WALLPAPER_HEX.border})`,
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-5 text-[13.5px]" aria-label="ลิงก์ส่วนท้าย">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-[color:var(--shop-primary)]"
                style={{ color: MU_WALLPAPER_HEX.inkMuted }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact (only fields the store actually has) */}
        {store.contactEmail || store.lineId || address ? (
          <div
            className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px]"
            style={{ color: MU_WALLPAPER_HEX.inkMuted }}
          >
            {store.contactEmail ? (
              <a
                href={`mailto:${store.contactEmail}`}
                className="hover:text-[color:var(--shop-primary)] transition-colors break-all"
              >
                {store.contactEmail}
              </a>
            ) : null}
            {store.lineId ? <span>LINE {store.lineId}</span> : null}
            {address ? <span>{address}</span> : null}
          </div>
        ) : null}

        <p
          className="mt-5 text-[12px] max-w-[60ch] leading-relaxed"
          style={{ color: MU_WALLPAPER_HEX.faint }}
        >
          © {year} {store.name} — {brandCopy} · วอลล์เปเปอร์เพื่อความเป็นสิริมงคล
          ตามความเชื่อส่วนบุคคล ภาพพรีวิวมีลายน้ำกำกับเพื่อป้องกันการคัดลอก
          โปรดใช้วิจารณญาณในการรับชม ไม่สามารถรับประกันผลลัพธ์ได้
        </p>
      </div>
    </footer>
  );
}

export default MuWallpaperFooter;
