'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Facebook,
  Instagram,
  MessageCircle,
  Code2,
  Github,
} from 'lucide-react';

interface FooterProps {
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

const SUPPORT_LINKS: Array<{
  href: (slug: string) => string;
  label: string;
  pageSlug: string | null;
}> = [
  { href: (s) => `/stores/${s}/help`, label: 'ศูนย์ช่วยเหลือ', pageSlug: null },
  { href: (s) => `/stores/${s}/faq`, label: 'คำถามที่พบบ่อย', pageSlug: 'faq' },
  { href: (s) => `/stores/${s}/shipping`, label: 'การส่งมอบไฟล์', pageSlug: 'shipping' },
  { href: (s) => `/stores/${s}/returns`, label: 'นโยบายคืนเงิน', pageSlug: 'returns' },
];

const COMPANY_LINKS = [
  { href: (s: string) => `/stores/${s}/about`, label: 'เกี่ยวกับเรา' },
  { href: (s: string) => `/stores/${s}/contact`, label: 'ติดต่อเรา' },
];

const LEGAL_LINKS: Array<{
  href: (slug: string) => string;
  label: string;
  pageSlug: string | null;
}> = [
  { href: (s) => `/stores/${s}/terms`, label: 'ข้อตกลงการใช้งาน', pageSlug: 'terms' },
  { href: (s) => `/stores/${s}/privacy`, label: 'นโยบายความเป็นส่วนตัว', pageSlug: 'privacy' },
];

export function Footer({
  store,
  categories = [],
  availableSupportPages = [],
}: FooterProps) {
  const supportLinks = SUPPORT_LINKS.filter(
    (l) => l.pageSlug === null || availableSupportPages.includes(l.pageSlug),
  );
  const legalLinks = LEGAL_LINKS.filter(
    (l) => l.pageSlug === null || availableSupportPages.includes(l.pageSlug),
  );

  return (
    <footer
      className="font-[family:var(--font-prompt)] mt-12"
      style={{
        background: '#0D1421',
        color: '#E5E7EB',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand column */}
        <div className="space-y-3">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-2"
          >
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <>
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center text-white"
                  style={{ background: '#82B440' }}
                  aria-hidden
                >
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="font-[family:var(--font-kanit)] text-xl font-bold tracking-tight text-white">
                  {store.name}
                </span>
              </>
            )}
          </Link>
          <p className="text-xs leading-relaxed text-white/70 max-w-xs">
            {store.tagline ||
              store.description ||
              'มาร์เก็ตเทมเพลตเซลเพจ HTML · พรีวิวสด · ดาวน์โหลดได้ทันที'}
          </p>
          <div className="flex items-center gap-3 pt-2">
            {store.facebookUrl && (
              <a
                href={store.facebookUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Facebook"
                className="text-white/60 hover:text-[#82B440] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {store.instagramUrl && (
              <a
                href={store.instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className="text-white/60 hover:text-[#82B440] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {store.lineId && (
              <a
                href={`https://line.me/ti/p/${store.lineId}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LINE"
                className="text-white/60 hover:text-[#82B440] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            <a
              href="#"
              aria-label="GitHub"
              className="text-white/60 hover:text-[#82B440] transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="font-[family:var(--font-kanit)] text-sm font-semibold text-white uppercase tracking-wider">
            หมวดเทมเพลต
          </h3>
          <ul className="space-y-2">
            {categories.length === 0 ? (
              <li>
                <Link
                  href={`/stores/${store.slug}/category`}
                  className="text-sm text-white/70 hover:text-[#82B440] transition-colors"
                >
                  เทมเพลตทั้งหมด
                </Link>
              </li>
            ) : (
              categories.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                    className="text-sm text-white/70 hover:text-[#82B440] transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-3">
          <h3 className="font-[family:var(--font-kanit)] text-sm font-semibold text-white uppercase tracking-wider">
            ช่วยเหลือ
          </h3>
          <ul className="space-y-2">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href(store.slug)}
                  className="text-sm text-white/70 hover:text-[#82B440] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {COMPANY_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href(store.slug)}
                  className="text-sm text-white/70 hover:text-[#82B440] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + legal */}
        <div className="space-y-3">
          <h3 className="font-[family:var(--font-kanit)] text-sm font-semibold text-white uppercase tracking-wider">
            ติดต่อ
          </h3>
          <ul className="space-y-2">
            {store.contactEmail && (
              <li>
                <a
                  href={`mailto:${store.contactEmail}`}
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#82B440] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[14rem]">
                    {store.contactEmail}
                  </span>
                </a>
              </li>
            )}
            {store.contactPhone && (
              <li>
                <a
                  href={`tel:${store.contactPhone}`}
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#82B440] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {store.contactPhone}
                </a>
              </li>
            )}
          </ul>
          {legalLinks.length > 0 && (
            <div className="pt-3 mt-3 border-t border-white/10">
              <ul className="space-y-2">
                {legalLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href(store.slug)}
                      className="text-xs text-white/60 hover:text-[#82B440] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/50">
          <p>
            © {new Date().getFullYear()} {store.name} · มาร์เก็ตเทมเพลตเซลเพจ HTML
          </p>
          <p className="font-[family:var(--font-prompt)]">
            <span className="text-white/40">Powered by</span>{' '}
            <span className="text-white/70">basketplace.co</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
