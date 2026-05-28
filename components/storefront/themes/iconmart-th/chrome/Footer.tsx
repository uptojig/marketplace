'use client';

/**
 * IconMart (iconmart-th) — Footer
 *
 * Mirrors the sheetlab-formula footer shape (brand / shop / help /
 * contact + a bottom bar) but in the export's modern-minimal language.
 * The export's footer is a single slim line — that copy is preserved in
 * the bottom bar ("ไอคอนดิจิทัลออริจินัล สำหรับนักออกแบบ").
 *
 * Addresses are NEVER hardcoded — assembled from DB fields only. Help
 * links are gated by `availableSupportPages`; the account + downloads
 * links always render. Payment chips reference QR PromptPay / store
 * credit (digital goods — no shipping, no COD).
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
  Box,
} from 'lucide-react';
import type { FooterProps } from '@/lib/templates/types';
import { ICONMART_HEX } from '../palette';

const DEFAULT_BRAND_COPY =
  'คลังไอคอนดิจิทัลออริจินัล ทั้งแบบเส้นและทึบ ดาวน์โหลด SVG ทันทีหลังชำระ';

const PAYMENT_CHIPS = ['QR PromptPay', 'เครดิตร้าน', 'บัตรเครดิต'];

const ACCENT = `var(--shop-primary, ${ICONMART_HEX.primary})`;

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => (p ?? '').trim())
    .filter((p) => p.length > 0)
    .join(' ');
}

export function IconMartFooter({
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

  // Help links — only render when the store actually carries content for
  // that support page. Account + downloads always show.
  const supportLinks: { label: string; href: string }[] = [];
  if (availableSupportPages.includes('faq')) {
    supportLinks.push({ label: 'คำถามที่พบบ่อย', href: `/stores/${slug}/help/faq` });
  }
  if (availableSupportPages.includes('returns')) {
    supportLinks.push({ label: 'การคืนเงิน', href: `/stores/${slug}/help/returns` });
  }
  if (availableSupportPages.includes('terms')) {
    supportLinks.push({
      label: 'ใบอนุญาตการใช้งาน',
      href: `/stores/${slug}/help/terms`,
    });
  }
  if (availableSupportPages.includes('privacy')) {
    supportLinks.push({
      label: 'นโยบายความเป็นส่วนตัว',
      href: `/stores/${slug}/help/privacy`,
    });
  }
  supportLinks.push({ label: 'บัญชีของฉัน', href: `/stores/${slug}/account` });
  supportLinks.push({
    label: 'ดาวน์โหลดของฉัน',
    href: `/stores/${slug}/account/downloads`,
  });

  const topCategories = categories.slice(0, 5);

  const address = joinAddress([
    store.addressLine1,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ]);

  const year = new Date().getFullYear();

  const headingStyle: React.CSSProperties = {
    color: ACCENT,
    letterSpacing: '0.18em',
  };

  return (
    <footer
      className="w-full border-t font-[family:var(--font-prompt)]"
      role="contentinfo"
      style={{
        borderColor: ICONMART_HEX.border,
        background: ICONMART_HEX.surface,
        color: ICONMART_HEX.ink,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
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
                    style={{ background: ICONMART_HEX.ink }}
                    aria-hidden="true"
                  >
                    <Box className="w-[18px] h-[18px]" strokeWidth={2} />
                  </span>
                  <span
                    className="text-[18px] font-[family:var(--font-kanit)] font-bold tracking-tight"
                    style={{ color: ICONMART_HEX.ink }}
                  >
                    {store.name}
                  </span>
                </>
              )}
            </Link>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: ICONMART_HEX.inkMuted }}
            >
              {brandCopy}
            </p>
            {hasAnySocial ? (
              <div className="flex items-center gap-3 pt-1">
                {store.facebookUrl ? (
                  <a
                    href={store.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="transition-colors hover:text-[var(--shop-primary)]"
                    style={{ color: ICONMART_HEX.faint }}
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
                    className="transition-colors hover:text-[var(--shop-primary)]"
                    style={{ color: ICONMART_HEX.faint }}
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                ) : null}
                {store.lineId ? (
                  <span
                    aria-label={`LINE ${store.lineId}`}
                    className="inline-flex items-center gap-1 text-xs"
                    style={{ color: ICONMART_HEX.faint }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{store.lineId}</span>
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Shop */}
          <div>
            <h3
              className="text-xs uppercase font-semibold mb-4"
              style={headingStyle}
            >
              เลือกซื้อ
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={catalogUrl}
                  className="transition-colors hover:text-[var(--shop-primary)]"
                  style={{ color: ICONMART_HEX.inkMuted }}
                >
                  ไอคอนทั้งหมด
                </Link>
              </li>
              {topCategories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`${catalogUrl}?cat=${encodeURIComponent(cat)}`}
                    className="transition-colors hover:text-[var(--shop-primary)]"
                    style={{ color: ICONMART_HEX.inkMuted }}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3
              className="text-xs uppercase font-semibold mb-4"
              style={headingStyle}
            >
              ความช่วยเหลือ
            </h3>
            <ul className="space-y-2 text-sm">
              {supportLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-[var(--shop-primary)]"
                    style={{ color: ICONMART_HEX.inkMuted }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-xs uppercase font-semibold mb-4"
              style={headingStyle}
            >
              ติดต่อเรา
            </h3>
            <ul
              className="space-y-3 text-sm"
              style={{ color: ICONMART_HEX.inkMuted }}
            >
              {store.contactEmail ? (
                <li className="flex items-start gap-2">
                  <Mail
                    className="w-4 h-4 mt-0.5"
                    style={{ color: ICONMART_HEX.faint }}
                  />
                  <a
                    href={`mailto:${store.contactEmail}`}
                    className="hover:text-[var(--shop-primary)] transition-colors break-all"
                  >
                    {store.contactEmail}
                  </a>
                </li>
              ) : null}
              {store.contactPhone ? (
                <li className="flex items-start gap-2">
                  <Phone
                    className="w-4 h-4 mt-0.5"
                    style={{ color: ICONMART_HEX.faint }}
                  />
                  <a
                    href={`tel:${store.contactPhone}`}
                    className="hover:text-[var(--shop-primary)] transition-colors"
                  >
                    {store.contactPhone}
                  </a>
                </li>
              ) : null}
              {store.lineId ? (
                <li className="flex items-start gap-2">
                  <MessageCircle
                    className="w-4 h-4 mt-0.5"
                    style={{ color: ICONMART_HEX.faint }}
                  />
                  <span>LINE {store.lineId}</span>
                </li>
              ) : null}
              {address ? (
                <li className="flex items-start gap-2">
                  <MapPin
                    className="w-4 h-4 mt-0.5"
                    style={{ color: ICONMART_HEX.faint }}
                  />
                  <span>{address}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 border-t flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs"
          style={{ borderColor: ICONMART_HEX.border, color: ICONMART_HEX.faint }}
        >
          <p className="tracking-wide">
            © {year} {store.name} · ไอคอนดิจิทัลออริจินัล สำหรับนักออกแบบ
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {PAYMENT_CHIPS.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center px-2 py-1 rounded text-[10px] tracking-wider"
                style={{
                  border: `1px solid ${ICONMART_HEX.border}`,
                  background: ICONMART_HEX.surface,
                  color: ICONMART_HEX.inkMuted,
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

export default IconMartFooter;
