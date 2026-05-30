'use client';

/**
 * sheetlab-formula — Footer
 *
 * Four-column footer with a brand block, a Shop nav (built from
 * the categories prop), a Help column (gated by availableSupportPages),
 * and a Contact column (renders only fields the store actually has).
 *
 * Addresses are NEVER hardcoded — assembled from DB fields only.
 * Payment chips reference ANYPAY / PromptPay / LINE Pay / TrueMoney /
 * Card. No COD copy.
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
  FileSpreadsheet,
} from 'lucide-react';
import type { FooterProps } from '@/lib/templates/types';

const DEFAULT_BRAND_COPY =
  'สูตรสเปรดชีตคุณภาพ ดาวน์โหลดทันทีหลังชำระ';

const PAYMENT_CHIPS = [
  'PromptPay',
  'LINE Pay',
  'TrueMoney',
  'Card',
];

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => (p ?? '').trim())
    .filter((p) => p.length > 0)
    .join(' ');
}

export function SheetlabFormulaFooter({
  store,
  categories = [],
  availableSupportPages = [],
}: FooterProps) {
  const slug = store.slug;
  const homeUrl = `/stores/${slug}`;
  const catalogUrl = `/stores/${slug}/category`;

  const brandCopy =
    store.description?.trim() ||
    store.tagline?.trim() ||
    DEFAULT_BRAND_COPY;

  const hasAnySocial = Boolean(
    store.facebookUrl || store.instagramUrl || store.lineId,
  );

  // Help links — only render when the store actually carries content
  // for that support page. Account + downloads always show because
  // those routes exist for every store.
  const supportLinks: { label: string; href: string }[] = [];
  if (availableSupportPages.includes('faq')) {
    supportLinks.push({
      label: 'คำถามที่พบบ่อย',
      href: `/stores/${slug}/help/faq`,
    });
  }
  if (availableSupportPages.includes('shipping')) {
    supportLinks.push({
      label: 'การจัดส่งและดาวน์โหลด',
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
  supportLinks.push({
    label: 'บัญชีของฉัน',
    href: `/stores/${slug}/account`,
  });
  supportLinks.push({
    label: 'คลังสินค้าดิจิทัล',
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

  return (
    <footer
      className="w-full border-t border-[#E5E7EB] bg-[#F8FAFB] text-[#1F2937] font-[family:var(--font-prompt)]"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={homeUrl} className="inline-flex items-center gap-2">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <>
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-md text-white"
                    style={{ background: '#107C41' }}
                    aria-hidden="true"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </span>
                  <span className="text-lg font-[family:var(--font-kanit)] font-semibold text-[#1F2937]">
                    {store.name}
                  </span>
                </>
              )}
            </Link>
            <p className="text-sm text-[#4B5563] leading-relaxed max-w-xs">
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
                    className="text-[#6B7280] hover:text-[#107C41] transition-colors"
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
                    className="text-[#6B7280] hover:text-[#107C41] transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                ) : null}
                {store.lineId ? (
                  <span
                    aria-label={`LINE ${store.lineId}`}
                    className="text-[#6B7280] hover:text-[#107C41] transition-colors inline-flex items-center gap-1 text-xs"
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
            <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#107C41] mb-4">
              ซื้อสินค้า
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={catalogUrl}
                  className="text-[#374151] hover:text-[#107C41] transition-colors"
                >
                  สูตรทั้งหมด
                </Link>
              </li>
              {topCategories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`${catalogUrl}?cat=${encodeURIComponent(cat)}`}
                    className="text-[#374151] hover:text-[#107C41] transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#107C41] mb-4">
              ความช่วยเหลือ
            </h3>
            <ul className="space-y-2 text-sm">
              {supportLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[#374151] hover:text-[#107C41] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-[#107C41] mb-4">
              ติดต่อเรา
            </h3>
            <ul className="space-y-3 text-sm text-[#374151]">
              {store.contactEmail ? (
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 text-[#6B7280]" />
                  <a
                    href={`mailto:${store.contactEmail}`}
                    className="hover:text-[#107C41] transition-colors break-all"
                  >
                    {store.contactEmail}
                  </a>
                </li>
              ) : null}
              {store.contactPhone ? (
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-[#6B7280]" />
                  <a
                    href={`tel:${store.contactPhone}`}
                    className="hover:text-[#107C41] transition-colors"
                  >
                    {store.contactPhone}
                  </a>
                </li>
              ) : null}
              {store.lineId ? (
                <li className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 mt-0.5 text-[#6B7280]" />
                  <span>LINE {store.lineId}</span>
                </li>
              ) : null}
              {address ? (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-[#6B7280]" />
                  <span>{address}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#E5E7EB] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-[#6B7280]">
          <p className="tracking-wide">
            © {year} {store.name} · ALL RIGHTS RESERVED
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {PAYMENT_CHIPS.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center px-2 py-1 rounded border border-[#E5E7EB] bg-white text-[10px] uppercase tracking-wider text-[#4B5563]"
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

export default SheetlabFormulaFooter;
