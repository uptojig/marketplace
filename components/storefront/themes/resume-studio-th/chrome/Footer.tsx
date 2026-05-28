'use client';

/**
 * resume-studio-th — Footer
 *
 * Four-column footer translated from the ResumeKit export
 * (`mountFooter` in js/store.js + `.site-footer` in css/styles.css):
 * a brand block, an "เทมเพลต" nav (built from categories), an
 * "บัญชี" column (credit / library / cart), and a "ช่วยเหลือ" column
 * gated by availableSupportPages.
 *
 * Addresses are NEVER hardcoded — assembled from DB fields only.
 * Payment chips reference QR PromptPay / บัตรเครดิต. Digital-only
 * store: no shipping copy.
 */

import React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';
import type { FooterProps } from '@/lib/templates/types';
import {
  RS_ACCENT,
  RS_ACCENT_INK,
  RS_FG,
  RS_FG_SOFT,
  RS_MUTED,
  RS_BORDER,
  RS_SURFACE,
} from '../palette';

const DEFAULT_BRAND_COPY =
  'เทมเพลตเรซูเม่คุณภาพสำหรับนักศึกษาจบใหม่ ออกแบบให้พร้อมสมัครงานจริง เติมเครดิตครั้งเดียว เลือกดาวน์โหลดได้ตามใจ';

const PAYMENT_CHIPS = ['QR PromptPay', 'บัตรเครดิต', 'เครดิตร้าน'];

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => (p ?? '').trim())
    .filter((p) => p.length > 0)
    .join(' ');
}

export function ResumeStudioFooter({
  store,
  categories = [],
  availableSupportPages = [],
}: FooterProps) {
  const slug = store.slug;
  const homeUrl = `/stores/${slug}`;
  const catalogUrl = `/stores/${slug}/category`;

  const brandCopy =
    store.description?.trim() || store.tagline?.trim() || DEFAULT_BRAND_COPY;

  const hasAnySocial = Boolean(
    store.facebookUrl || store.instagramUrl || store.lineId,
  );

  // "บัญชี" column — always-present store routes.
  const accountLinks: { label: string; href: string }[] = [
    { label: 'เติมเครดิต', href: `/stores/${slug}/account/credit` },
    { label: 'คลังของฉัน', href: `/stores/${slug}/account/downloads` },
    { label: 'ตะกร้า', href: `/stores/${slug}/cart` },
    { label: 'บัญชีของฉัน', href: `/stores/${slug}/account` },
  ];

  // "ช่วยเหลือ" — only render when the store carries content for that
  // support page, so we never link to an empty fallback stub.
  const supportLinks: { label: string; href: string }[] = [];
  if (availableSupportPages.includes('faq')) {
    supportLinks.push({
      label: 'คำถามที่พบบ่อย',
      href: `/stores/${slug}/help/faq`,
    });
  }
  if (availableSupportPages.includes('shipping')) {
    supportLinks.push({
      label: 'การดาวน์โหลดไฟล์',
      href: `/stores/${slug}/help/shipping`,
    });
  }
  if (availableSupportPages.includes('returns')) {
    supportLinks.push({
      label: 'การคืนเงิน',
      href: `/stores/${slug}/help/returns`,
    });
  }
  if (availableSupportPages.includes('terms')) {
    supportLinks.push({
      label: 'เงื่อนไขการใช้งาน',
      href: `/stores/${slug}/help/terms`,
    });
  }
  if (availableSupportPages.includes('privacy')) {
    supportLinks.push({
      label: 'นโยบายความเป็นส่วนตัว',
      href: `/stores/${slug}/help/privacy`,
    });
  }
  if (availableSupportPages.includes('about')) {
    supportLinks.push({ label: 'เกี่ยวกับเรา', href: `/stores/${slug}/about` });
  }
  supportLinks.push({ label: 'ติดต่อเรา', href: `/stores/${slug}/contact` });

  const topCategories = categories.slice(0, 4);

  const address = joinAddress([
    store.addressLine1,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ]);

  const year = new Date().getFullYear();

  const colHead =
    'font-[family:var(--font-prompt)] text-[13px] uppercase tracking-[0.08em] font-semibold mb-3.5';
  const colLink =
    'block py-[5px] text-[14.5px] transition-colors hover:text-[--rs-accent]';

  return (
    <footer
      className="w-full border-t font-[family:var(--font-prompt)]"
      style={
        {
          background: RS_SURFACE,
          borderColor: RS_BORDER,
          color: RS_FG,
          // expose accent for hover via the arbitrary `[--rs-accent]` var
          ['--rs-accent' as string]: RS_ACCENT,
        } as React.CSSProperties
      }
      role="contentinfo"
    >
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 lg:gap-10">
          {/* Brand */}
          <div>
            <Link href={homeUrl} className="inline-flex items-center gap-2.5">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <>
                  <span
                    className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] text-white"
                    style={{
                      background: `linear-gradient(145deg, ${RS_ACCENT}, ${RS_ACCENT_INK})`,
                    }}
                    aria-hidden="true"
                  >
                    <FileText className="w-[17px] h-[17px]" />
                  </span>
                  <span
                    className="text-[18px] font-[family:var(--font-kanit)] font-bold"
                    style={{ color: RS_FG }}
                  >
                    {store.name}
                  </span>
                </>
              )}
            </Link>
            <p
              className="mt-3 text-[14px] leading-relaxed max-w-[30ch]"
              style={{ color: RS_MUTED }}
            >
              {brandCopy}
            </p>
            {hasAnySocial ? (
              <div className="flex items-center gap-3 pt-3">
                {store.facebookUrl ? (
                  <a
                    href={store.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="transition-colors hover:text-[--rs-accent]"
                    style={{ color: RS_MUTED }}
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                ) : null}
                {store.instagramUrl ? (
                  <a
                    href={store.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="transition-colors hover:text-[--rs-accent]"
                    style={{ color: RS_MUTED }}
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                ) : null}
                {store.lineId ? (
                  <span
                    aria-label={`LINE ${store.lineId}`}
                    className="inline-flex items-center gap-1 text-xs"
                    style={{ color: RS_MUTED }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{store.lineId}</span>
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* เทมเพลต */}
          <div>
            <h4 className={colHead} style={{ color: RS_MUTED }}>
              เทมเพลต
            </h4>
            <Link
              href={catalogUrl}
              className={colLink}
              style={{ color: RS_FG_SOFT }}
            >
              ดูทั้งหมด
            </Link>
            {topCategories.map((cat) => (
              <Link
                key={cat}
                href={`${catalogUrl}?cat=${encodeURIComponent(cat)}`}
                className={colLink}
                style={{ color: RS_FG_SOFT }}
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* บัญชี */}
          <div>
            <h4 className={colHead} style={{ color: RS_MUTED }}>
              บัญชี
            </h4>
            {accountLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={colLink}
                style={{ color: RS_FG_SOFT }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* ช่วยเหลือ */}
          <div>
            <h4 className={colHead} style={{ color: RS_MUTED }}>
              ช่วยเหลือ
            </h4>
            {supportLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={colLink}
                style={{ color: RS_FG_SOFT }}
              >
                {l.label}
              </Link>
            ))}
            {store.contactEmail ? (
              <a
                href={`mailto:${store.contactEmail}`}
                className="mt-2 inline-flex items-start gap-2 text-[14px] transition-colors hover:text-[--rs-accent]"
                style={{ color: RS_FG_SOFT }}
              >
                <Mail className="w-4 h-4 mt-0.5" style={{ color: RS_MUTED }} />
                <span className="break-all">{store.contactEmail}</span>
              </a>
            ) : null}
            {store.contactPhone ? (
              <a
                href={`tel:${store.contactPhone}`}
                className="mt-1 inline-flex items-start gap-2 text-[14px] transition-colors hover:text-[--rs-accent]"
                style={{ color: RS_FG_SOFT }}
              >
                <Phone className="w-4 h-4 mt-0.5" style={{ color: RS_MUTED }} />
                <span>{store.contactPhone}</span>
              </a>
            ) : null}
            {address ? (
              <span
                className="mt-1 flex items-start gap-2 text-[14px]"
                style={{ color: RS_FG_SOFT }}
              >
                <MapPin className="w-4 h-4 mt-0.5" style={{ color: RS_MUTED }} />
                <span>{address}</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-5 border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[13px]"
          style={{ borderColor: RS_BORDER, color: RS_MUTED }}
        >
          <p>
            © {year} {store.name} · สร้างเรซูเม่ที่ใช่ ในไม่กี่นาที
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {PAYMENT_CHIPS.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center px-2 py-1 rounded text-[10px] uppercase tracking-wider"
                style={{
                  border: `1px solid ${RS_BORDER}`,
                  background: '#fff',
                  color: RS_FG_SOFT,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ResumeStudioFooter;
