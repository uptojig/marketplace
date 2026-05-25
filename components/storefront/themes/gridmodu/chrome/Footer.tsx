'use client';

import React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  store: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    lineId?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  categories?: string[];
  availableSupportPages?: string[];
}

const SUPPORT_LABELS: Record<string, string> = {
  about: 'เกี่ยวกับเรา',
  faq: 'คำถามที่พบบ่อย',
  shipping: 'การจัดส่ง',
  returns: 'การคืนสินค้า',
  privacy: 'นโยบายความเป็นส่วนตัว',
  terms: 'ข้อกำหนดการใช้งาน',
};

function joinAddress(parts: Array<string | null | undefined>): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(' ');
}

/**
 * GridModu — Footer. Carbon dark, store address visible, every
 * service link is a `<Link>`, ANYPAY badge.
 */
export function Footer({
  store,
  categories = [],
  availableSupportPages = [],
}: Props) {
  const supportLinks = availableSupportPages.filter((s) => SUPPORT_LABELS[s]);
  const address = joinAddress([
    store.addressLine1,
    store.addressLine2,
    store.subdistrict,
    store.district,
    store.province,
    store.postalCode,
  ]);

  return (
    <footer className="bg-[#0E0E10] border-t border-[#1F1F23] text-[#E5E7EB] font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-4">
        {/* Brand block */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-10 w-auto object-contain" />
            ) : (
              <>
                <span
                  className="inline-block h-4 w-1"
                  style={{ background: 'var(--shop-accent, #00BFFF)' }}
                  aria-hidden
                />
                <h3 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-base text-white">
                  {store.name}
                </h3>
              </>
            )}
          </div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-3">
            MOTO · PARTS · TUNING
          </p>
          {store.tagline && (
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              {store.tagline}
            </p>
          )}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h4 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white mb-3 flex items-center gap-2">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              หมวดหมู่
            </h4>
            <ul className="space-y-1.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                    className="text-xs text-[#9CA3AF] hover:text-[var(--shop-accent,#00BFFF)] transition-colors tracking-wider uppercase font-[family:var(--font-kanit)] font-semibold"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Support */}
        {supportLinks.length > 0 && (
          <div>
            <h4 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white mb-3 flex items-center gap-2">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              บริการลูกค้า
            </h4>
            <ul className="space-y-1.5">
              {supportLinks.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/stores/${store.slug}/${slug}`}
                    className="text-xs text-[#9CA3AF] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
                  >
                    {SUPPORT_LABELS[slug]}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/stores/${store.slug}/cart`}
                  className="text-xs text-[#9CA3AF] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
                >
                  ตะกร้าของคุณ
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Contact + address */}
        <div>
          <h4 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white mb-3 flex items-center gap-2">
            <span
              className="inline-block h-3 w-1"
              style={{ background: 'var(--shop-accent, #00BFFF)' }}
              aria-hidden
            />
            ติดต่อเรา
          </h4>
          <ul className="space-y-1.5 text-xs text-[#9CA3AF]">
            {store.contactPhone && (
              <li className="flex items-start gap-2">
                <Phone
                  className="h-3.5 w-3.5 mt-0.5 shrink-0"
                  style={{ color: 'var(--shop-accent, #00BFFF)' }}
                  aria-hidden
                />
                <span className="tabular-nums">{store.contactPhone}</span>
              </li>
            )}
            {store.contactEmail && (
              <li className="flex items-start gap-2">
                <Mail
                  className="h-3.5 w-3.5 mt-0.5 shrink-0"
                  style={{ color: 'var(--shop-accent, #00BFFF)' }}
                  aria-hidden
                />
                <span className="break-all">{store.contactEmail}</span>
              </li>
            )}
            {store.lineId && (
              <li className="flex items-start gap-2">
                <MessageCircle
                  className="h-3.5 w-3.5 mt-0.5 shrink-0"
                  style={{ color: 'var(--shop-accent, #00BFFF)' }}
                  aria-hidden
                />
                <span>LINE: {store.lineId}</span>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-2">
                <MapPin
                  className="h-3.5 w-3.5 mt-0.5 shrink-0"
                  style={{ color: 'var(--shop-accent, #00BFFF)' }}
                  aria-hidden
                />
                <span className="leading-relaxed">{address}</span>
              </li>
            )}
          </ul>

          <div className="flex gap-2 mt-4">
            {store.facebookUrl && (
              <a
                href={store.facebookUrl}
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-sm border border-[#1F1F23] text-[#9CA3AF] hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {store.instagramUrl && (
              <a
                href={store.instagramUrl}
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-sm border border-[#1F1F23] text-[#9CA3AF] hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1F1F23] bg-[#15151A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold tabular-nums">
            © {new Date().getFullYear()} {store.name} · ALL RIGHTS RESERVED
          </p>
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-3.5 w-3.5"
              style={{ color: 'var(--shop-accent, #00BFFF)' }}
              aria-hidden
            />
            <span
              className="text-[10px] tracking-[0.2em] uppercase font-[family:var(--font-kanit)] font-semibold"
              style={{ color: 'var(--shop-accent, #00BFFF)' }}
            >
              จ่ายผ่าน ANYPAY · ปลอดภัย
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
